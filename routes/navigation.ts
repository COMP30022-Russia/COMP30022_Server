import express, { Router } from 'express';
const router: Router = express.Router({ mergeParams: true });

import {
    getNavigationSession,
    endNavigationSession
} from '../controllers/navigation';

// Get requested navigation session
router.get('/', getNavigationSession);

// End requested navigation session
router.post('/end', endNavigationSession);

export default router;
