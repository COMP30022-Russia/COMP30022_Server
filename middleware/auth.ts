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

// Retrieves the details of the user who made the request
export let getAuthedUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get user
        const user = await models.User.findById(req.userID);
        if (!user) {
            console.error('Token signed with invalid user ID');
            throw new Error('User cannot be found');
        }
        req.user = user;
    } catch (err) {
        res.status(401);
        next(err);
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
        next(err);
    }
};
