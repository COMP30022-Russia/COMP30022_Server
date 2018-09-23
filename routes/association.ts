import express, { Router } from 'express';
const router: Router = express.Router({ mergeParams: true });

// Import routers
import chatRouter from './chat';
// Import controllers
import { getAssociation } from '../controllers/association';
import { startNavigationSession } from '../controllers/navigation';

// Get specific association
router.get('/', getAssociation);

// Chat related routes
router.use('/chat', chatRouter);

// Start navigation session
router.post('/navigation', startNavigationSession);

export default router;
