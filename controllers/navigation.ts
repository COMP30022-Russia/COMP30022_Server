import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import models from '../models';
import {
    sendNavigationStartMessage,
    sendNavigationEndMessage
} from './notification/navigation';
import { locationCache } from './navigation_session';

/**
 * Returns value indicating whether indicated user is in an active
 * navigation session.
 * @param {number} isInSession ID of user.
 * @return {Promise<number|boolean>} ID of active session or 'false'.
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
    // Extract association
    const association = req.association;

    try {
        // Ensure users only have 1 active session at a time
        if (
            (await isInSession(association.APId)) ||
            (await isInSession(association.carerId))
        ) {
            throw new Error(
                'Cannot start navigation session, user(s) are in session'
            );
        }

        // Create and return session
        const session = await models.Session.create({
            carerId: association.carerId,
            APId: association.APId,
            carerHasControl: req.userID === req.association.carerId
        });
        const sender = await models.User.scope('name').findById(req.userID);

        // Send notification
        await sendNavigationStartMessage(
            sender.name,
            req.userID === association.APId
                ? association.carerId
                : association.APId,
            req.association.id,
            session.id
        );

        return res.json(session);
    } catch (err) {
        res.status(400);
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
        const session = await models.Session.findOne({
            where: {
                active: true,
                [Op.or]: [{ APId: userID }, { carerId: userID }]
            }
        });
        if (!session) {
            return res.json({});
        }

        return res.json(session);
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
        return res.json(req.session);
    } catch (err) {
        return next(err);
    }
};

// End session
export const endNavigationSession = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Make session inactive
        const session = req.session;

        // Ensure that session is not already ended
        if (!session.active) {
            res.status(400);
            return next(new Error('Session has already been ended'));
        }

        // Send notification
        await sendNavigationEndMessage(
            session.APId === req.userID ? session.carerId : session.APId,
            session.id
        );

        // Remove AP location from cache
        locationCache.deleteItem(String(session.APId));

        await session.updateAttributes({ active: false });
        return res.json({ status: 'success' });
    } catch (err) {
        return next(err);
    }
};
