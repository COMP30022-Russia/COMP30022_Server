import express, { Router } from 'express';
const router: Router = express.Router();

// Import controllers
import { register, login } from '../controllers/user';
import { getUserLocation } from '../controllers/location';
import { authenticate, ensureAssociated } from '../middleware/auth';
import { verifyIDParam } from '../middleware/params';

// User registration
router.post('/register', register);
// User login
router.post('/login', login);

// Get user location
router.get(
    '/:userID/location',
    authenticate,
    verifyIDParam('userID'),
    ensureAssociated,
    getUserLocation
);

export default router;
