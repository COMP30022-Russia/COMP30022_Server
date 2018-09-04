import { Request, Response, NextFunction } from 'express';
import models from '../models';

// Get the authenticated user's location
export const getSelfLocation = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get authenticated user
        const user = await models.User.scope('location').findById(req.userID);
        // Ensure that only APs are accessing their own location
        if (user.type !== 'AP') {
            throw new Error('Only APs are allowed to view their own location');
        }

        // Get and return location
        const location = await user.getCurrentLocation();
        return res.json({ location });
    } catch (err) {
        res.status(400);
        next(err);
    }
};

// Retrieves and returns location of requested user
export const getUserLocation = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get requested user
        const user = await models.User.scope('location').findById(
            req.params.userID
        );
        // Ensure that only APs' locations can be accessed
        if (user.type !== 'AP') {
            throw new Error("Can only view APs' locations");
        }

        // Get and return location
        const location = await user.getCurrentLocation();
        return res.json({ location });
    } catch (err) {
        res.status(400);
        next(err);
    }
};

// Sets the authenticated user's location
export const setSelfLocation = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Extract latitude and longitude from request body
    const { lat, lon } = req.body;

    try {
        // Check type of user (only APs are able to set location)
        const user = await models.User.scope('location').findById(req.userID);
        if (user.type !== 'AP') {
            res.status(400);
            return next(
                new Error('Non-AP users cannot set their own location')
            );
        }

        // Insert location row in database
        const created = await models.Location.create({
            lat,
            lon,
            userId: req.userID
        });
        // Update location of user
        await user.setCurrentLocation(created);
    } catch (err) {
        res.status(400);
        return next(err);
    }

    return res.json({ status: 'success' });
};
