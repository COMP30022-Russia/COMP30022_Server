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
    // Get params
    const associationID = req.params.associationID;
    const limit: number = Number(req.query.limit);
    const before: number = Number(req.query.before);
    const after: number = Number(req.query.after);

    // before/after portion of query
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

    // ID portion of query
    const idQuery = {
        associationId: associationID
    };

    try {
        // Retrieve messages (with constraints)
        const messages = await models.Message.findAll({
            limit: !limit ? DEFAULT_LIMIT : limit,
            where: before || after ? Object.assign(idQuery, seq) : idQuery,
            order: [['createdAt', 'DESC']],
            include: {
                model: models.Picture,
                as: 'pictures'
            }
        });

        // Return empty array if there are no messages
        if (!messages) {
            return res.json({ messages: [] });
        }
        // Return normally
        return res.json({ messages });
    } catch (err) {
        res.status(400);
        next(err);
    }
};

// Create message
export const createMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Get association ID
    const associationID = req.params.associationID;
    // Extract message content from body
    const { content } = req.body;

    try {
        // If there's no message
        if (!content) {
            throw new Error('No message given');
        }

        // Create and return message
        const message = await models.Message.create({
            content,
            authorId: req.userID,
            associationId: associationID
        });

        // Get ID of target user
        const targetID = await req.association.getPartnerID(req.userID);
        const sender = await models.User.scope('name').findById(req.userID);

        // Send notification
        await sendChatMessage(sender.name, targetID, associationID, content);

        return res.json(message);
    } catch (err) {
        res.status(400);
        return next(err);
    }
};
