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
    // Extract limit from request body
    const limit = Number(req.query.limit);
    const userID = req.params.userID;

    try {
        // Query for recents/favourites
        // Ensure that placeIDs (and hence destinations) are unique
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

        // Return as JSON
        return res.json({
            recents: recents.map((d: any) => d.toJSON()),
            favourites: favourites.map((d: any) => d.toJSON())
        });
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
    // Extract IDs and favourite query
    const userID = req.params.userID;
    const destinationID = req.params.destinationID;
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
