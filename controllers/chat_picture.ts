import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import models from '../models';
import { CHAT_PICTURE_DEST } from '../routes/chat_picture';
import {
    sendChatMessage,
    sendChatPictureUploadMessage
} from './notification/chat';

// Create and return picture message
export const createPictureMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Get association ID and count
    const associationID = req.params.associationID;
    const count: number = Number(req.body.count);

    // Ensure that count value is given
    if (!count || Number(count) <= 0) {
        res.status(400);
        return next(new Error('Need number of pictures'));
    }

    try {
        // Create the empty pictures
        const picture_array = [];
        for (const n of Array(count).keys()) {
            picture_array.push(
                await models.ChatPicture.create({
                    associationId: req.params.associationID
                })
            );
        }

        // Create message and set pictures
        const message = await models.Message.create({
            type: 'Picture',
            authorId: req.userID,
            associationId: associationID
        });
        await message.setPictures(picture_array);

        // Get ID of target user
        const targetID = await req.association.getPartnerID(req.userID);
        const sender = await models.User.scope('name').findById(req.userID);

        // Send notification
        await sendChatMessage(
            sender.name,
            targetID,
            associationID,
            'Picture message'
        );

        // Return message with pictures
        const pictures = picture_array.map((p: any) => {
            return { ...p.toJSON(), messageId: message.id };
        });
        return res.json({
            ...message.toJSON(),
            pictures
        });
    } catch (err) {
        res.status(400);
        return next(err);
    }
};

// Handles picture uploads
export const uploadPicture = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const pictureID = req.params.pictureID;

    try {
        // Retrieve picture
        const picture = await models.ChatPicture.findOne({
            where: { id: pictureID, associationId: req.params.associationID }
        });

        // If there is no picture with ID or picture does not belong to
        // association
        if (!picture) {
            throw new Error('Picture cannot be set');
        }
        // If picture has been received already
        if (picture.status === 'Received') {
            throw new Error('Picture has already been received');
        }

        // Set properties of picture with values of file and return
        picture.filename = req.file.filename;
        picture.mime = req.file.mimetype;
        picture.status = 'Received';
        const saved = await picture.save();

        // Find ID of receipient user
        const targetID = await req.association.getPartnerID(req.userID);
        await sendChatPictureUploadMessage(targetID, req.params.associationID);

        return res.json(saved);
    } catch (err) {
        res.status(400);
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

    try {
        // Retrieve picture
        const picture = await models.ChatPicture.findOne({
            where: { id: pictureID, associationId: req.params.associationID }
        });

        // If there is no picture with ID or picture does not belong to
        // association
        if (!picture) {
            throw new Error('Picture cannot be retrieved');
        }

        // If picture has not been received
        if (picture.status !== 'Received') {
            throw new Error('Picture has not been received by server yet');
        }

        // If not, it's ok to send the image
        res.setHeader('Content-Type', picture.mime);
        const options = {
            root: CHAT_PICTURE_DEST
        };
        return res.sendFile(picture.filename, options);
    } catch (err) {
        res.status(400);
        return next(err);
    }
};
