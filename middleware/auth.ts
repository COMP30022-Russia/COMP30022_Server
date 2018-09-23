import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { jwt_verify } from '../helpers/jwt';
import models from '../models';

import {
    ensureRequestedUserIsAssociated,
    ensureRequestedUserIsInRequestedAssociation
} from './auth_association';
import { ensureUserIsInNavigationSession } from './auth_navigation';
export {
    ensureRequestedUserIsAssociated,
    ensureRequestedUserIsInRequestedAssociation,
    ensureUserIsInNavigationSession
};

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
