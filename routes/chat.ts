import express, { Router } from 'express';
const router: Router = express.Router({ mergeParams: true });

// Import controllers
import { createMessage, getMessages } from '../controllers/chat';

// Create/make new message
router.post('/', createMessage);

// Get messages
router.get('/', getMessages);

export default router;
