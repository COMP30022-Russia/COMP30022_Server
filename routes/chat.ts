import express, { Router } from 'express';
const router: Router = express.Router({ mergeParams: true });

import { createMessage, getMessages } from '../controllers/chat';

// Create new message
router.post('/', createMessage);

// Get messages
router.get('/', getMessages);

export default router;
