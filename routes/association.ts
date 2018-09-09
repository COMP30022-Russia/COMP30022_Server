import express, { Router } from 'express';
const router: Router = express.Router({ mergeParams: true });

// Import routers
import chatRouter from './chat';
// Import controllers
import { getAssociation } from '../controllers/association';

// Get specific association
router.get('/', getAssociation);

// Chat related routes
router.use('/chat', chatRouter);

export default router;
