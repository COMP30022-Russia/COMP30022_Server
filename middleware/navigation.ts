import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import models from '../models';

/**
 * Retrieves the specified navigation session.
 * @param {string[]} attributes Wanted attributes of navigation session.
 * @param {boolean} [allowInactive] Whether to allow requests when session is inactive.
 * @param {boolean} [populateCall] Whether to include call data.
 * @return Express middleware
 */
export let retrieveNavigationSession = (
    attributes: string[],
    allowInactive = false,
    populateCall = false
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Extract userID
        const userID: number = req.userID;
        try {
            let options: any = {
                where: { id: req.params.sessionID },
                [Op.or]: [{ APId: userID }, { carerId: userID }],
                attributes: Array.isArray(attributes)
                    ? [...attributes, 'active']
                    : attributes
            };
            if (populateCall) {
                options = {
                    ...options,
                    include: {
                        model: models.Call
                    },
                    order: [[{ model: models.Call, as: 'Call' }, 'id', 'DESC']]
                };
            }
            const session = await models.Session.findOne(options);

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
