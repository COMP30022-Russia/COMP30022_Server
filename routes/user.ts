import express, { Router } from 'express';
const router: Router = express.Router({ mergeParams: true });

// Import controllers
import { getUserLocation } from '../controllers/location';
import { getAssociatedUserDetails } from '../controllers/user';
import { getProfilePicture } from '../controllers/user_picture';

// Get user location
router.get('/location', getUserLocation);

// Get associated user details
router.get('/', getAssociatedUserDetails);

// Get associated user's profile picture
router.get('/picture', getProfilePicture);

export default router;
