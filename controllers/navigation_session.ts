// Controllers for actions that occur during a navigation session
import { Request, Response, NextFunction } from 'express';
import models from '../models';
import {
    sendNavigationControlSwitchedMessage,
    sendNavigationLocationMessage,
    sendRouteUpdateMessage
} from './notification/navigation';
import retrieveRoute from '../helpers/maps';

// Redeclare to make it easy to replace and test
const sendLocationMessage = sendNavigationLocationMessage;
const sendRouteMessage = sendRouteUpdateMessage;
const getMapRoute = retrieveRoute;

// Cache for location
import NodeCache from 'node-cache';
import cacheService from '../helpers/cache';
const locationCache = cacheService(new NodeCache());
export { locationCache };

// Switch control during navigation session
export const switchNavigationControl = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Extract session
    const session = req.session;

    try {
        // Flip and save
        session.carerHasControl = !session.carerHasControl;
        await session.save();

        // Send notification
        await sendNavigationControlSwitchedMessage(
            session.APId === req.userID ? session.carerId : session.APId,
            session.id,
            session.carerHasControl
        );

        return res.json(session);
    } catch (err) {
        next(err);
    }
};

// Update AP's location during navigation sessions
export const updateAPLocation = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Extract session ID and lat/lon
    const sessionID = req.params.sessionID;
    const { lat, lon } = req.body;
    if (!lat || !lon) {
        res.status(422);
        return next(new Error('lat/lon missing'));
    }

    // First, check cache to see if location of current user is already stored
    const currentLocation: any = locationCache.getItem(String(req.userID));
    let targetID = currentLocation ? currentLocation.targetID : undefined;

    // If location is not stored, query for user's active session
    if (!currentLocation) {
        // Get session information
        const session = await models.Session.findOne({
            where: { id: req.params.sessionID, active: true },
            attributes: ['carerId', 'APId']
        });

        // Ensure that session is active/valid
        if (!session) {
            res.status(400);
            return next(new Error('Session is inactive or invalid'));
        }

        // Ensure that user is AP
        if (session.APId !== req.userID) {
            res.status(400);
            return next(
                new Error('Non-AP users are not allowed to set location')
            );
        }

        // Set userID of carer (opposite party)
        targetID = session.carerId;
    }

    // Update location
    locationCache.setItem(String(req.userID), { targetID, lat, lon });

    // Send firebase notification to target
    await sendLocationMessage(targetID, sessionID, lat, lon);

    // Return success
    return res.json({ status: 'success' });
};

// Get AP location
export const getAPLocation = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Extract session
    const session = req.session;
    // Extract location of AP
    const location: any = locationCache.getItem(String(session.APId));

    // Location has not been set
    if (!location) {
        res.status(400);
        return next(new Error('AP location has not been set'));
    }

    // Return the location
    return res.json({ lon: location.lon, lat: location.lat });
};

// Returns the route
export const getRoute = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.session.route) {
            return res.json({});
        }

        return res.json(req.session.route);
    } catch (err) {
        next(err);
    }
};

// Set destination and generate ruote
export const setDestination = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Extract session, mode, placeID and name
    const session = req.session;
    const mode =
        !req.body.mode || req.body.mode === 'Walking' ? 'Walking' : 'PT';
    const placeID: string = req.body.placeID;
    const name = req.body.name;

    // Do brief validation of placeID and name
    if (!placeID || !name) {
        res.status(400);
        return next(new Error('Incorrect input parameters'));
    }

    // Extract location of AP
    const location: any = locationCache.getItem(String(session.APId));
    if (!location) {
        res.status(400);
        return next(new Error('AP location has not been set'));
    }

    // Determine route
    let route;
    try {
        route = await getMapRoute(
            mode === 'Walking' ? true : false,
            placeID,
            location.lat,
            location.lon
        );
    } catch (err) {
        res.status(400);
        return next(err);
    }

    try {
        // Update route
        await session.updateAttributes({ route, mode });

        // Set destination
        const destination = await models.Destination.create({
            placeID,
            name,
            userId: session.APId
        });
        await session.setDestination(destination);
    } catch (err) {
        next(err);
    }

    // Send notification
    await sendRouteMessage(session.APId, session.carerId);

    return res.json({ status: 'success' });
};
