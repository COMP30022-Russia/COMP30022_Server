import express, { Router } from 'express';
const router: Router = express.Router();

// Import controllers
import {
    getAssociationToken,
    createAssociation,
    getAssociations
} from '../controllers/association';
import { setSelfLocation, getSelfLocation } from '../controllers/location';
import {
    updateFirebaseToken,
    getFirebaseTokens
} from '../controllers/notification';

// Get association token
router.get('/association_token', getAssociationToken);

// Create association
router.post('/associate', createAssociation);

// Get associations
router.get('/associations', getAssociations);

// Set location
router.post('/location', setSelfLocation);

// Get location
router.get('/location', getSelfLocation);

// Get/update token
router.post('/token', updateFirebaseToken);
router.get('/token', getFirebaseTokens);

export default router;
