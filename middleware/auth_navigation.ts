import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import models from '../models';

// Ensure that the requested user is a member of the requested
// navigation session
export let ensureUserIsInNavigationSession = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Extract userID
    const userID = req.userID;

    try {
        const session = await models.Session.findOne({
            where: { id: req.params.sessionID },
            [Op.or]: [{ APId: userID }, { carerId: userID }],
            attributes: ['id']
        });

        // Ensure that session exists and that user is party of session
        if (!session) {
            throw new Error(
                'User is not party of navigation session or session does not exist'
            );
        }

        next();
    } catch (err) {
        res.status(403);
        return next(err);
    }
};
