import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import models from '../models';

// Retrieves the specified emergency event.
export const retrieveEmergencyEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userID = req.userID;
    const eventID = req.params.eventID;

    try {
        // Get event
        const event = await models.Emergency.findById(eventID);
        if (!event) {
            res.status(404);
            return next(new Error('Emergency event does not exist'));
        }
        req.event = event;

        // Get ID of target
        const targetID: number = event.APId;

        // Ensure that requester and target AP are associated
        // (or they are the same user)
        if (userID !== targetID) {
            const association = await models.Association.findOne({
                where: {
                    active: true,
                    [Op.and]: [{ APId: targetID }, { carerId: userID }]
                },
                attributes: ['id']
            });
            if (!association) {
                res.status(403);
                return next(new Error('Cannot access specified event'));
            }
        }

        next();
    } catch (err) {
        next(err);
    }
};
