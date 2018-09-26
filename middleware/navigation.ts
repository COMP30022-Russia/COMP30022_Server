import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import models from '../models';

/**
 * Retrieves the specified navigation session.
 * @param {string[]} attributes Wanted attributes of navigation session.
 * @param {boolean} [allowInactive] Whether to allow requests when session is inactive.
 * @return Express middleware
 */
export let retrieveNavigationSession = (
    attributes: string[],
    allowInactive = false
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Extract userID
        const userID = req.userID;
        try {
            const session = await models.Session.findOne({
                where: { id: req.params.sessionID },
                [Op.or]: [{ APId: userID }, { carerId: userID }],
                attributes: Array.isArray(attributes)
                    ? [...attributes, 'active']
                    : attributes
            });

            // Ensure that session exists and that user is party of session
            if (!session) {
                res.status(403);
                return next(
                    new Error(
                        'User is not party of navigation session or session does not exist'
                    )
                );
            }

            // Ensure that session is not already ended
            if (!session.active && !allowInactive) {
                res.status(400);
                return next(new Error('Session has already ended'));
            }

            req.session = session;

            next();
        } catch (err) {
            return next(err);
        }
    };
};
