import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import models from '../models';
import {
    sendNavigationStartMessage,
    sendNavigationEndMessage
} from './notification/navigation';
import { sendNavigationCallRequestStartMessage } from './notification/call';
import { locationCache } from './navigation_session';
import { terminateCall } from './call';

/**
 * Returns value indicating whether indicated user is in an active
 * navigation session.
 * @param userID ID of user.
 * @return ID of active session or 'false'.
 */
const isInSession = async (userID: number): Promise<number | boolean> => {
    const session = await models.Session.findOne({
        where: {
            active: true,
            [Op.or]: [{ APId: userID }, { carerId: userID }]
        },
        attributes: ['id']
    });
    return session === null ? false : session.id;
};

// Start navigation session
export const startNavigationSession = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const association = req.association;
    const userID = req.userID;

    try {
        // Ensure that user is only in 1 active session at a time
        if (
            (await isInSession(association.APId)) ||
            (await isInSession(association.carerId))
        ) {
            res.status(400);
            return next(
                new Error(
                    'Cannot start navigation session, user(s) are in session'
                )
            );
        }

        // Create session
        const session = await models.Session.create({
            carerId: association.carerId,
            APId: association.APId,
            carerHasControl: req.userID === req.association.carerId
        });
        const sender = await models.User.scope('name').findByPk(userID);

        // Send notification to opposite party
        await sendNavigationStartMessage(
            sender.name,
            req.userID === association.APId
                ? association.carerId
                : association.APId,
            association.id,
            session.id,
            session.sync
        );

        return res.json(session.toJSON());
    } catch (err) {
        return next(err);
    }
};

// Get active session of user
export const getSelfNavigationSession = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userID = req.userID;

    try {
        // Find active session where user is either AP or carer
        const session = await models.Session.findOne({
            where: {
                active: true,
                [Op.or]: [{ APId: userID }, { carerId: userID }]
            },
            include: {
                model: models.Call
            },
            order: [[{ model: models.Call, as: 'Call' }, 'id', 'DESC']]
        });
        if (!session) {
            return res.json({});
        }

        return res.json(session.toJSON());
    } catch (err) {
        return next(err);
    }
};

// Get specified session
export const getNavigationSession = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        return res.json(req.session.toJSON());
    } catch (err) {
        return next(err);
    }
};

// End navigation session
export const endNavigationSession = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const session = req.session;
    const userID = req.userID;

    try {
        // Remove AP location from cache
        locationCache.deleteItem(String(session.APId));

        // Get and terminate call (if exists)
        const call = session.Call;
        if (call && call.state !== 'Terminated') {
            await terminateCall(call, 'nav_session_end');
        }

        // Make session inactive
        await session.update({
            active: false,
            sync: session.sync + 1
        });

        // Send notification
        await sendNavigationEndMessage(
            session.APId === userID ? session.carerId : session.APId,
            session.id,
            session.sync
        );

        return res.json({ status: 'success' });
    } catch (err) {
        return next(err);
    }
};

// Starts a call in a navigation session
export const startNavigationCall = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Extract various IDs
    const userID = req.userID;
    const sessionID = req.session.id;
    const APId = req.session.APId;
    const carerId = req.session.carerId;

    try {
        // Ensure that there isn't a pre-existing call for either
        // the carer or AP
        const existing = await models.Call.findOne({
            where: {
                [Op.or]: [{ APId }, { carerId }],
                state: { [Op.not]: 'Terminated' }
            }
        });
        if (existing) {
            res.status(400);
            return next(
                new Error(
                    'There is pre-existing non-terminated voice/video call'
                )
            );
        }

        // Create call and attach to navigation session
        const call = await models.Call.create({
            APId,
            carerId,
            sessionId: sessionID,
            carerIsInitiator: userID === carerId
        });

        // Send data/notification message
        const targetID = userID === APId ? carerId : APId;
        const user = await models.User.scope('name').findByPk(userID);
        await sendNavigationCallRequestStartMessage(
            call.id,
            sessionID,
            user.name,
            userID,
            targetID
        );

        // Return created call
        return res.json(call.toJSON());
    } catch (err) {
        next(err);
    }
};

// Define idle timeout
const NAVIGATION_SESSION_IDLE_TIMEOUT: number = 24 * 60 * 60 * 1000;
/**
 * Performs navigation call cleanup by terminating idle calls.
 */
export const cleanUpNavigationCalls = async () => {
    return models.Session.update(
        { active: false },
        {
            where: {
                active: true
            },
            updatedAt: {
                [Op.lte]: Date.now() - NAVIGATION_SESSION_IDLE_TIMEOUT
            }
        }
    );
};
