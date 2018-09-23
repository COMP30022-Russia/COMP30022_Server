import { Request, Response, NextFunction } from 'express';
import models from '../models';
import { Op } from 'sequelize';

// Ensure that the requested user is associated with the user who is requested
export let ensureRequestedUserIsAssociated = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Extract userID
    const targetID = req.params.userID;
    const requesterID = req.userID;

    try {
        // Try to find an association between the requester and the target user
        const association = await models.Association.findOne({
            where: {
                active: true,
                [Op.or]: [
                    {
                        [Op.and]: [{ APId: requesterID }, { carerId: targetID }]
                    },
                    { [Op.and]: [{ APId: targetID }, { carerId: requesterID }] }
                ]
            },
            attributes: ['id']
        });

        // Ensure that association exists
        if (!association) {
            throw new Error('User is not party of association');
        }

        next();
    } catch (err) {
        res.status(403);
        return next(err);
    }
};

// Ensure that the requested user is in the requested association
export let ensureRequestedUserIsInRequestedAssociation = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Extract userID/associationID
    const userID = req.userID;
    const associationId = req.params.associationID;

    try {
        // Find the requested association, where the authenticated user is a
        // carer/AP for the association
        const association = await models.Association.findOne({
            where: {
                id: req.params.associationID,
                active: true,
                [Op.or]: [{ APId: req.userID }, { carerId: req.userID }]
            }
        });
        req.association = association;

        // Ensure that association exists
        if (!association) {
            throw new Error('User is not party of requested association');
        }

        next();
    } catch (err) {
        res.status(403);
        return next(err);
    }
};
