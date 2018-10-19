import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import models from '../models';

/**
 * Retrieves the specified navigation session.
 * @param attributes Wanted attributes of navigation session.
 * @param [allowInactive] Allow requests when session is inactive.
 * @param [populateCall] Include Call.
 * @return Express middleware
 */
export let retrieveNavigationSession = (
    attributes: string[],
    allowInactive = false,
    populateCall = false
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const userID: number = req.userID;
        const sessionID: number = req.params.sessionID;

        try {
            // Define query options
            let options: any = {
                where: { id: sessionID },
                [Op.or]: [{ APId: userID }, { carerId: userID }],
                attributes: Array.isArray(attributes)
                    ? [...attributes, 'active', 'sync']
                    : attributes
            };
            // Add to options if call is to be included
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
                        'User is not party of navigation session ' +
                            'or session does not exist'
                    )
                );
            }

            // Ensure that session is not inactive
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
