import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import models from '../models';
import { sendChatMessage } from './notification/chat';

// Default limit for message queries
const DEFAULT_LIMIT = 10;

// Get messages
export const getMessages = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Extract params
    const associationID = req.params.associationID;
    const limit: number = Number(req.query.limit);
    const before: number = Number(req.query.before);
    const after: number = Number(req.query.after);

    // Build before/after portion of query
    let seq: any = {};
    if (before) {
        seq = { id: { [Op.lt]: before } };
    }
    if (after) {
        seq = { id: { [Op.gt]: after } };
    }
    if (before && after) {
        seq = { id: { [Op.and]: [{ [Op.lt]: before }, { [Op.gt]: after }] } };
    }

    // Build ID portion of query
    const idQuery = {
        associationId: associationID
    };

    try {
        // Retrieve messages (with constraints)
        const messages = await models.Message.findAll({
            limit: !limit ? DEFAULT_LIMIT : limit,
            where: before || after ? { ...idQuery, ...seq } : idQuery,
            order: [['createdAt', 'DESC']],
            include: {
                model: models.ChatPicture,
                as: 'pictures'
            }
        });

        // If there are no messages, return empty array
        if (!messages) {
            return res.json({ messages: [] });
        }
        // If not, return messages normally
        return res.json({ messages: messages.map((m: any) => m.toJSON()) });
    } catch (err) {
        next(err);
    }
};

// Create message
export const createMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Extract message content from body and IDs
    const { content } = req.body;
    const associationID = Number(req.params.associationID);
    const userID = req.userID;
    const association = req.association;

    // If there is no message
    if (!content || content === '') {
        res.status(400);
        return next(new Error('No message given'));
    }

    try {
        // Create message
        const message = await models.Message.create({
            content,
            authorId: userID,
            associationId: associationID
        });

        // Get ID of associated user and name of sender
        const targetID = await association.getPartnerID(userID);
        const sender = await models.User.scope('name').findByPk(userID);
        // Send notification to target user
        await sendChatMessage(sender.name, targetID, associationID, content);

        return res.json(message.toJSON());
    } catch (err) {
        return next(err);
    }
};
