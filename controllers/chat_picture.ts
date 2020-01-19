import { Request, Response, NextFunction } from 'express';
import models from '../models';
import { CHAT_PICTURE_DEST } from '../routes/chat_picture';
import {
    sendChatMessage,
    sendChatPictureUploadMessage
} from './notification/chat';

// Creates and returns a picture message
export const createPictureMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Get association ID and number of pictures in this message
    const associationID = Number(req.params.associationID);
    const count: number = Number(req.body.count);
    const userID = req.userID;
    const association = req.association;

    // Ensure that count value is given
    if (!count || Number(count) <= 0) {
        res.status(400);
        return next(new Error('Need number of pictures'));
    }

    try {
        // Create the empty pictures
        const pictureArray = [];
        for (const _ of Array(count).keys()) {
            pictureArray.push(
                await models.ChatPicture.create({
                    associationId: associationID
                })
            );
        }

        // Create message and set pictures
        const message = await models.Message.create({
            type: 'Picture',
            authorId: userID,
            associationId: associationID
        });
        await message.setPictures(pictureArray);

        // Get ID and name of target user
        const targetID = await association.getPartnerID(userID);
        const sender = await models.User.scope('name').findByPk(userID);

        // Send notification
        await sendChatMessage(
            sender.name,
            targetID,
            associationID,
            'Picture message'
        );

        // Return message with pictures
        const pictures = pictureArray.map((p: any) => {
            return { ...p.toJSON(), messageId: message.id };
        });
        return res.json({
            ...message.toJSON(),
            pictures
        });
    } catch (err) {
        return next(err);
    }
};

// Handles picture uploads
export const uploadPicture = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Extract IDs and information about uploaded file
    const userID = req.userID;
    const pictureID = req.params.pictureID;
    const associationID = Number(req.params.associationID);
    const association = req.association;
    const file = req.file;

    try {
        // Retrieve picture
        const picture = await models.ChatPicture.findOne({
            where: { id: pictureID, associationId: associationID }
        });

        // If there is no picture with ID or picture does not belong to
        // association
        if (!picture) {
            res.status(400);
            return next(new Error('Picture cannot be set'));
        }
        // If picture has been received already
        if (picture.status === 'Received') {
            res.status(400);
            return next(new Error('Picture has already been received'));
        }

        // Set fields of picture with values of file and return
        const saved = await picture.update({
            filename: file.filename,
            mime: file.mimetype,
            status: 'Received'
        });

        // Find ID of recipient user and send data message
        const targetID = await association.getPartnerID(userID);
        await sendChatPictureUploadMessage(targetID, associationID, picture.id);

        return res.json(saved.toJSON());
    } catch (err) {
        return next(err);
    }
};

// Retrieves and returns the requested image
export const getMessagePicture = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const pictureID = req.params.pictureID;
    const associationID = req.params.associationID;

    try {
        // Retrieve picture
        const picture = await models.ChatPicture.findOne({
            where: { id: pictureID, associationId: associationID }
        });

        // If there is no picture with ID or picture does not belong to
        // association
        if (!picture) {
            res.status(400);
            return next(new Error('Picture cannot be retrieved'));
        }

        // If picture has not been received
        if (picture.status !== 'Received') {
            res.status(400);
            return next(
                new Error('Picture has not been received by server yet')
            );
        }

        // If not, it's ok to send the image
        res.setHeader('Content-Type', picture.mime);
        const options = {
            root: CHAT_PICTURE_DEST
        };
        return res.sendFile(picture.filename, options);
    } catch (err) {
        return next(err);
    }
};
