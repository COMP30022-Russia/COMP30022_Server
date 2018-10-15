import { Request, Response, NextFunction } from 'express';
import models from '../models';

/**
 * Retrieves the most recent location of the specified user
 * @param {number} userID ID of user.
 * @return {Promise} Promise for the location of the user.
 */
const getLocation = async (userID: number): Promise<any> => {
    // Get specified user
    const user = await models.User.scope('location').findById(userID);
    // Ensure that only APs' locations are accessed
    if (user.type !== 'AP') {
        throw new Error("Only APs' locations can be accessed");
    }

    // Get location
    const location = await user.getCurrentLocation();
    if (!location) {
        throw new Error('AP has not set their location yet');
    }
    return location;
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
        return res.json(location.toJSON());
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
        return res.json(location.toJSON());
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
    const userID = req.userID;

    try {
        // Check type of user (only APs are able to set location)
        const user = await models.User.scope('location').findById(userID);
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
            userId: userID
        });
        // Update location of user
        await user.setCurrentLocation(created);
    } catch (err) {
        res.status(422);
        return next(err);
    }

    return res.json({ status: 'success' });
};
