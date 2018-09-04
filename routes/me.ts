import express, { Router } from 'express';
const router: Router = express.Router();

// Import controllers
import {
    getAssociationToken,
    createAssociation,
    getAssociations
} from '../controllers/association';
import { setSelfLocation, getSelfLocation } from '../controllers/location';

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

export default router;
