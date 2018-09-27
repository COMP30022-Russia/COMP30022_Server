import { Request, Response, NextFunction } from 'express';
import models from '../models';

// Sets the user's profile picture
export const setProfilePicture = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Extract userID, file attributes
        const userID = req.userID;
        const file = req.file;

        // Create picture
        const picture = await models.ProfilePicture.create({
            userId: req.userID,
            filename: file.filename,
            mime: file.mimetype
        });
        // Set picture
        const user = await models.User.scope('id').findById(userID);
        await user.setProfilePicture(picture);
        return res.json(picture);
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
    // Can get user's profile picture through association or authenticated
    // user's profile picture
    const userID = req.params.userID || req.userID;

    try {
        // Retrieve picture
        const picture = await models.ProfilePicture.findOne({
            where: { userId: userID }
        });

        // If there is no picture with ID
        if (!picture) {
            throw new Error('Picture cannot be retrieved');
        }

        // Send image
        res.setHeader('Content-Type', picture.mime);
        const options = {
            root: 'uploads/profile'
        };
        return res.sendFile(picture.filename, options);
    } catch (err) {
        res.status(400);
        return next(err);
    }
};
