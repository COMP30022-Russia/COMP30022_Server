import { Request, Response, NextFunction } from 'express';
import { jwt_sign } from '../helpers/jwt';
import models from '../models';

// User registration
export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Filter to allowed keys
    // From https://stackoverflow.com/questions/38750705
    const allowed = [
        'username',
        'password',
        'type',
        'name',
        'mobileNumber',
        'DOB',
        'emergencyContactName',
        'emergencyContactNumber'
    ];
    const user = Object.keys(req.body)
        // Filter to allowed keys
        .filter(key => allowed.includes(key))
        // Build output
        .reduce(
            (obj: any, key: string) => ({ ...obj, [key]: req.body[key] }),
            {}
        );

    // If the user is an AP
    if (user.type === 'AP') {
        if (!user.emergencyContactName || !user.emergencyContactNumber) {
            const err = new Error('Missing emergency contact details');
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
        return next(err);
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
        const user = await models.User.scope('withPassword').find({
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
            return res.json({
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
