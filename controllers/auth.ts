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

// Logout
export const logout = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Extract user ID and instance ID
    const userID = req.userID;
    const instanceID = req.body.instanceID;

    // If instanceID is not given
    if (!instanceID) {
        res.status(400);
        return next(new Error('Instance ID not given'));
    }

    try {
        // Remove tokens with specified instance ID
        await models.FirebaseToken.destroy({
            where: { instanceID, userId: userID }
        });
        return res.json({ status: 'success' });
    } catch (err) {
        return next(err);
    }
};
