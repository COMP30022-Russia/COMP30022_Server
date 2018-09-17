import express, { Router } from 'express';
const router: Router = express.Router({ mergeParams: true });

// Import routers
import chatRouter from './chat';
import pictureChatRouter from './chat_picture';
// Import controllers
import { getAssociation } from '../controllers/association';
import { startNavigationSession } from '../controllers/navigation';

// Get specific association
router.get('/', getAssociation);

// Text chat related routes
router.use('/chat', chatRouter);

// Picture chat related routes
router.use('/chat', pictureChatRouter);

// Start navigation session
router.post('/navigation', startNavigationSession);

export default router;
