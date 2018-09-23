import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { jwt_verify } from '../helpers/jwt';
import models from '../models';

// Extend express Request type
// Adapted from: https://stackoverflow.com/questions/44383387
declare module 'express' {
    export interface Request {
        token: string;
        user: string;
        userID: number;
        association: any;
    }
}

// Ensure that the user is authenticated
export let authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Ensure that header exists and starts with Bearer
    const auth_header = req.headers.authorization;
    if (!auth_header || !auth_header.startsWith('Bearer')) {
        const err = new Error('Authorization header missing or incorrect');
        res.status(401);
        return next(err);
    }

    try {
        // Extract JWT token
        const header_token = req.headers.authorization.split(' ')[1];
        const token = await jwt_verify(header_token);

        req.token = token;
        req.userID = token.id;
        next();
    } catch (err) {
        res.status(401);
        next(new Error('Token could not be verified'));
    }
};

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
