import express, { Router, Request, Response, NextFunction } from 'express';
const router: Router = express.Router();
import multer from 'multer';

// Import controllers
import { logout } from '../controllers/auth';
import {
    getAssociationToken,
    createAssociation,
    getAssociations
} from '../controllers/association';
import { inititateEmergencyEvent } from '../controllers/emergency';
import { setSelfLocation, getSelfLocation } from '../controllers/location';
import {
    updateFirebaseToken,
    getFirebaseTokens
} from '../controllers/notification';
import { getSelfNavigationSession } from '../controllers/navigation';
import { getSelfDetails, updateUserDetails } from '../controllers/user';
import {
    setProfilePicture,
    getProfilePicture
} from '../controllers/user_picture';

// Configure multer for profile picture uploads
export const PROFILE_PICTURE_DEST = 'uploads/profile';
const upload = multer({ dest: PROFILE_PICTURE_DEST }).single('picture');

// Logout
router.post('/logout', logout);

// Edit/update user information
router.patch('/profile', updateUserDetails);
// Get profile information
router.get('/profile', getSelfDetails);

// Add/update profile picture
router.post(
    '/profile/picture',
    (req: Request, res: Response, next: NextFunction) => {
        upload(req, res, (err: Error) => {
            if (err) {
                res.status(400);
                next(err);
            }
            if (!req.file) {
                res.status(400);
                next(new Error('No file given'));
            }
            next();
        });
    },
    setProfilePicture
);
// Get profile picture
router.get('/profile/picture', getProfilePicture);

// Get association token
router.get('/association_token', getAssociationToken);
// Create association
router.post('/associate', createAssociation);
// Get associations
router.get('/associations', getAssociations);

// Start emergency event
router.post('/emergency', inititateEmergencyEvent);

// Set location
router.post('/location', setSelfLocation);
// Get location
router.get('/location', getSelfLocation);

// Get/update token
router.post('/token', updateFirebaseToken);
router.get('/token', getFirebaseTokens);

// Get active navigation session
router.get('/navigation', getSelfNavigationSession);

export default router;
