import express, { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
const router: Router = express.Router({ mergeParams: true });

// Multer configuration
export const CHAT_PICTURE_DEST = 'uploads/chat';
const upload = multer({ dest: CHAT_PICTURE_DEST }).single('picture');

// Import controllers
import {
    createPictureMessage,
    uploadPicture,
    getMessagePicture
} from '../controllers/chat_picture';
import { verifyIDParam } from '../middleware/params';

// Create message with pictures
router.post('/picture', createPictureMessage);

// Upload picture
router.post(
    '/picture/:pictureID',
    verifyIDParam('pictureID'),
    (req: Request, res: Response, next: NextFunction) => {
        upload(req, res, (err: Error) => {
            if (err) {
                res.status(400);
                next(err);
            }
            if (!req.file) {
                res.status(400);
                next(new Error('No file given'));
            }
            next();
        });
    },
    uploadPicture
);

// Get specific picture
router.get(
    '/picture/:pictureID',
    verifyIDParam('pictureID'),
    getMessagePicture
);

export default router;
