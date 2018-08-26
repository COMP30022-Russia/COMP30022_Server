import express, { Router } from 'express';
const router: Router = express.Router({ mergeParams: true });

// Import controllers
import { getAssociation } from '../controllers/association';

// Get specific association
router.get('/', getAssociation);

export default router;
