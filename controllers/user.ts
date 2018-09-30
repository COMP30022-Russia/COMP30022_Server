import { Request, Response, NextFunction } from 'express';
import models from '../models';

// Retrieves user information for associated users
export const getAssociatedUserDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Extract ID from params
    const id = req.params.userID;

    // Perform query
    try {
        // Get user info
        const user = await models.User.scope('withLocation').findById(id);

        // Get location if user is AP
        if (user.type === 'AP') {
            return res.json({
                ...user.toJSON(),
                location: await user.getCurrentLocation()
            });
        }
        // If not, just return user
        return res.json(user.toJSON());
    } catch (err) {
        res.status(400);
        return next(err);
    }
};

// Get user details
export const getSelfDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Extract user ID
    const userID = req.userID;

    try {
        // Get and return
        const user = await models.User.findById(userID);
        return res.json(user.toJSON());
    } catch (err) {
        return next(err);
    }
};

// Update user details
export const updateUserDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Extract user ID and body of request
    const userID = req.params.userID;

    // Filter to allowed keys
    // From https://stackoverflow.com/questions/38750705
    const allowed = [
        'password',
        'name',
        'mobileNumber',
        'DOB',
        'emergencyContactName',
        'emergencyContactNumber'
    ];
    const modifications = Object.keys(req.body)
        // Filter to allowed keys
        .filter(key => allowed.includes(key))
        // Build output
        .reduce(
            (obj: any, key: string) => ({ ...obj, [key]: req.body[key] }),
            {}
        );

    try {
        // Get user
        const user = await models.User.findById(req.userID);
        if (user.type === 'AP') {
            if (
                ('emergencyContactName' in modifications &&
                    !modifications.emergencyContactName) ||
                ('emergencyContactNumber' in modifications &&
                    !modifications.emergencyContactNumber)
            ) {
                res.status(422);
                return next(new Error('Required fields cannot be deleted'));
            }
        }

        // Update attributes and return
        const modified = await user.updateAttributes(modifications);
        return res.json(modified.toJSON());
    } catch (err) {
        next(err);
    }
};
