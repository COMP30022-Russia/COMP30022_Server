import express, { Router } from 'express';
const router: Router = express.Router();

// Handle index route
import { indexRoute } from '../controllers/home';
router.get('/', indexRoute);

export default router;
