import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { jwt_verify } from '../helpers/jwt';
import models from '../models';

// Extend express Request type
// Adapted from: https://stackoverflow.com/questions/44383387
declare module 'express' {
    export interface Request {
        token: string;
        userID: number;
        association: any;
        session: any;
        event: any;
        call: any;
    }
}

// Middleware for decoding and verifying authentication token
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
        // Decode JWT token
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
