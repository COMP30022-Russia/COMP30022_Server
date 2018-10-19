import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import models from '../models';

/**
 * Retrieves the specified voice/video call.
 * @param [allowTerminated] Allow requests when call is terminated.
 * @return Express middleware
 */
export let retrieveCall = (allowTerminated = false) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const userID = req.userID;

        try {
            // Get specified call
            const call = await models.Call.findOne({
                where: { id: req.params.callID },
                [Op.or]: [{ APId: userID }, { carerId: userID }]
            });

            // Ensure that call exists and that user is party of call
            if (!call) {
                res.status(403);
                return next(new Error('User is not party of call'));
            }

            // Ensure that call has not ended
            if (call.state === 'Terminated' && !allowTerminated) {
                res.status(400);
                return next(new Error('Call has already ended'));
            }
            req.call = call;
            next();
        } catch (err) {
            return next(err);
        }
    };
};
