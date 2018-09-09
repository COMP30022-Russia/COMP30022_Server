import { Request, Response, NextFunction } from 'express';
import models from '../models';

/**
 * Retrieves the most recent location of the specified user
 * @param {number} id ID of user.
 * @return {Promise} Promise for the location of the user.
 */
const getLocation = async (id: number): Promise<any> => {
    // Get specified user
    const user = await models.User.scope('location').findById(id);
    // Ensure that only APs' locations are accessed
    if (user.type !== 'AP') {
        throw new Error("Only APs' locations can be accessed");
    }
    // Get and return location
    return await user.getCurrentLocation();
};

// Get the authenticated user's location
export const getSelfLocation = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get and return location of currently authenticated user
        const location = await getLocation(req.userID);
        return res.json({ location });
    } catch (err) {
        res.status(400);
        return next(err);
    }
};

// Retrieves and returns location of requested user
export const getUserLocation = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get and return location of specified user
        const location = await getLocation(req.params.userID);
        return res.json({ location });
    } catch (err) {
        res.status(400);
        return next(err);
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