import express, { Router } from 'express';
const router: Router = express.Router();

// Import routers
import userRouter from './user';

// Handle index route
import { homeRoute } from '../controllers/home';
router.get('/', homeRoute);

// Load routers
router.use('/users', userRouter);

export default router;
