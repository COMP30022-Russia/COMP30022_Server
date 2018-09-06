import express, { Router } from 'express';
const router: Router = express.Router({ mergeParams: true });

// Import controllers
import { getUserLocation } from '../controllers/location';

// Get user location
router.get('/location', getUserLocation);

export default router;
