import express, { Router } from 'express';
const router: Router = express.Router();

// Import auth middleware
import { authenticate } from '../middleware/auth';
// Import param verification middleware
import { verifyIDParam } from '../middleware/params';

// Import routers
import userRouter from './user';
import meRouter from './me';
import associationRouter from './association';

// Handle index route
import { homeRoute } from '../controllers/home';
router.get('/', homeRoute);

// Load routers
router.use('/users', userRouter);
router.use('/me', authenticate, meRouter);
router.use(
    '/associations/:id',
    authenticate,
    verifyIDParam('id'),
    associationRouter
);

export default router;
