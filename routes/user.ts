import express, { Router } from 'express';
const router: Router = express.Router({ mergeParams: true });

// Import controllers
import { getUserLocation } from '../controllers/location';
import { getUserDetails } from '../controllers/user_details';

// Get user location
router.get('/location', getUserLocation);

// Get user details
router.get('/', getUserDetails);

export default router;
