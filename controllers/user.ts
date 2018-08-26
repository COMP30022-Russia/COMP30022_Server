import { Request, Response, NextFunction } from 'express';
import { jwt_sign } from '../helpers/jwt';
import models from '../models';

// User registration
export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Extract body
    const user: any = { ...req.body };

    // If the user is an AP
    if (user.type === 'AP') {
        if (!user.emergencyContactName || !user.emergencyContactNumber) {
            const err = new Error('Missing emergency contact details.');
            res.status(422);
            return next(err);
        }
        if (!user.address) {
            const err = new Error('Missing address.');
            res.status(422);
            return next(err);
        }
    }

    // Create user and return created user
    try {
        const created = await models.User.create(user);
        return res.json(created.toJSON());
    } catch (err) {
        res.status(422);
        next(err);
    }
};

// Login
export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Get username/password from request
    const username = req.body.username;
    const password = req.body.password;

    try {
        // Get user with given username
        const user = await models.User.find({
            where: {
                username
            }
        });
        // If user cannot be found
        if (!user) {
            throw new Error('Username/password incorrect');
        }

        // Verify the password and return the user and a token
        if (await user.verifyPassword(password)) {
            res.json({
                ...user.toJSON(),
                token: await jwt_sign({ id: user.id })
            });
        } else {
            throw new Error('Username/password incorrect');
        }
    } catch (err) {
        res.status(401);
        return next(err);
    }
};
