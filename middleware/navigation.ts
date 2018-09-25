import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import models from '../models';

/**
 * Retrieves the specified navigation session.
 * @param {string[]} attributes Wanted attributes of navigation session.
 * @return Express middleware
 */
export let retrieveNavigationSession = (attributes: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Extract userID
        const userID = req.userID;
        try {
            const session = await models.Session.findOne({
                where: { id: req.params.sessionID },
                [Op.or]: [{ APId: userID }, { carerId: userID }],
                attributes
            });

            // Ensure that session exists and that user is party of session
            if (!session) {
                throw new Error(
                    'User is not party of navigation session or session does not exist'
                );
            }

            req.session = session;

            next();
        } catch (err) {
            res.status(403);
            return next(err);
        }
    };
};
