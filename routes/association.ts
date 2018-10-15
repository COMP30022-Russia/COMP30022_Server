import express, { Router } from 'express';
const router: Router = express.Router({ mergeParams: true });

import chatRouter from './chat';
import pictureChatRouter from './chat_picture';

import { getAssociation } from '../controllers/association';
import { startNavigationSession } from '../controllers/navigation';

// Get specific association
router.get('/', getAssociation);

// Text chat routes
router.use('/chat', chatRouter);

// Picture chat routes
router.use('/chat', pictureChatRouter);

// Start navigation session
router.post('/navigation', startNavigationSession);

export default router;
