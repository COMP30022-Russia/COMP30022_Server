import { Request, Response, NextFunction } from 'express';
import models from '../models';

// Sets the current user's profile picture
export const setProfilePicture = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Extract userID, file attributes
        const userID = req.userID;
        const file = req.file;

        // Create and return picture
        const picture = await models.ProfilePicture.create({
            userId: userID,
            filename: file.filename,
            mime: file.mimetype
        });
        return res.json(picture.toJSON());
    } catch (err) {
        next(err);
    }
};

// Gets a user's profile picture
export const getProfilePicture = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Can get user profile pictures through both /users/:userID and /me routes
    const userID = req.params.userID || req.userID;

    try {
        // Retrieve latest profile picture of user
        const picture = await models.ProfilePicture.findOne({
            where: { userId: userID },
            order: [['id', 'DESC']]
        });

        // If user does not have profile picture
        if (!picture) {
            res.status(400);
            return next(new Error('Picture cannot be retrieved'));
        }

        // Send image
        res.setHeader('Content-Type', picture.mime);
        return res.sendFile(picture.filename, { root: 'uploads/profile' });
    } catch (err) {
        return next(err);
    }
};
