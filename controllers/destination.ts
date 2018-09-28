import { Request, Response, NextFunction } from 'express';
import sequelize from 'sequelize';
import models from '../models';

// Default limit for recents
const DEFAULT_LIMIT: number = 5;

// Get the requested user's recents and favourites
export const getDestinations = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Extract user ID, limit
    const userID = req.params.userID;
    const limit = req.query.limit;

    try {
        // Query for recents/favourites and return
        const recents = await models.Destination.findAll({
            attributes: [
                sequelize.literal('DISTINCT ON ("placeID", "id") 1'),
                'id',
                'placeID',
                'userId',
                'name',
                'createdAt',
                'updatedAt'
            ],
            limit: !limit ? DEFAULT_LIMIT : limit,
            where: { userId: userID },
            order: [['id', 'DESC']]
        });
        const favourites = await models.Destination.findAll({
            where: { userId: userID, favourite: true }
        });
        return res.json({ recents, favourites });
    } catch (err) {
        return next(err);
    }
};

// Sets or unsets a destination as a favourite
export const setFavouriteDestination = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Extract user, destination ID
    const userID = req.params.userID;
    const destinationID = req.params.destinationID;
    // Extract favourite query
    const favourite = !req.query.favourite || req.query.favourite === 'true';

    try {
        // Set/unset favourite
        const destination = await models.Destination.update(
            { favourite },
            { where: { id: destinationID, userId: userID } }
        );
        if (destination[0] === 0) {
            res.status(404);
            return next(new Error('Destination does not exist'));
        } else {
            return res.json({ status: 'success' });
        }
    } catch (err) {
        next(err);
    }
};
