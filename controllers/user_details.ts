import { Request, Response, NextFunction } from 'express';
import models from '../models';

// Retrieves user information
export const getUserDetails = async (
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
