import { Request, Response, NextFunction } from 'express';
import models from '../models';
import {
    sendEmergencyMessage,
    sendEmergencyHandledMessage
} from './notification/emergency';

// Starts an emergency event for the current user
export const inititateEmergencyEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userID = req.userID;

    try {
        // Find user type and name
        const user = await models.User.findOne({
            where: { id: userID },
            attributes: ['type', 'name', 'mobileNumber']
        });
        if (user.type !== 'AP') {
            res.status(400);
            return next(new Error('Only APs can start emergency events'));
        }

        // Check whether there's an unhandled emergency event
        let event = await models.Emergency.findOne({
            where: {
                APId: userID,
                handled: false
            }
        });

        // If there is not an unhandled emergency event, create an event
        if (!event) {
            event = await models.Emergency.create({
                APId: userID
            });
        }

        // Get IDs of associated carers
        const associations = await models.Association.findAll({
            where: {
                APId: userID,
                active: true
            },
            attributes: ['carerId']
        });
        const targetIDs = associations.map((assoc: any) => assoc.carerId);

        // Send notification to carers
        await sendEmergencyMessage(
            event.id,
            userID,
            user.name,
            user.mobileNumber,
            targetIDs
        );

        // Return event
        return res.json(event.toJSON());
    } catch (err) {
        return next(err);
    }
};

// Returns an emergency event
export const getEmergencyEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        return res.json(req.event.toJSON());
    } catch (err) {
        next(err);
    }
};

// Handles an emergency event
export const handleEmergencyEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userID = req.userID;
    const event = req.event;

    try {
        // Make sure that event is not already handled
        if (event.handled) {
            res.status(400);
            return next(new Error('Emergency event has already been handled'));
        }

        // Update status
        event.handled = true;
        event.resolverId = userID;
        await event.save();

        // Get IDs of associated carers
        const associations = await models.Association.findAll({
            where: {
                APId: event.APId,
                active: true
            },
            attributes: ['carerId']
        });
        const targetIDs = associations
            .map((assoc: any) => assoc.carerId)
            .filter((id: number) => id !== userID);

        // Send notification
        await sendEmergencyHandledMessage(event.id, targetIDs);

        // Return updated event
        return res.json(event.toJSON());
    } catch (err) {
        next(err);
    }
};
