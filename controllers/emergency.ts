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
    // Extract user ID
    const userID = req.userID;

    try {
        // Find user type and name
        const user = await models.User.findOne({
            where: { id: userID },
            attributes: ['type', 'name']
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

        // If there is not an unhandled emergency event, create it
        if (!event) {
            // Create an emergency event
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

        // Send notification
        await sendEmergencyMessage(event.id, userID, user.name, targetIDs);

        // Return event
        return res.json(event);
    } catch (err) {
        res.status(400);
        return next(err);
    }
};

// Retrieves an emergency event
export const getEmergencyEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        return res.json(req.event);
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
    // Extract user, emergency ID
    const userID = req.userID;
    const emergencyID = req.params.emergencyID;
    const event = req.event;

    try {
        // Update status
        if (event.handled) {
            res.status(400);
            return next(new Error('Emergency event has already been handled'));
        }
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

        return res.json(event);
    } catch (err) {
        next(err);
    }
};
