import express, { Router } from 'express';
const router: Router = express.Router();

// Import controllers
import {
    getAssociationToken,
    createAssociation,
    getAssociations
} from '../controllers/association';

// Get association token
router.get('/association_token', getAssociationToken);

// Create association
router.post('/associate', createAssociation);

// Get associations
router.get('/associations', getAssociations);

export default router;
