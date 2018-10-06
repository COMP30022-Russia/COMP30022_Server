import express, { Router } from 'express';
const router: Router = express.Router({ mergeParams: true });

// Import controllers
import {
    handleEmergencyEvent,
    getEmergencyEvent
} from '../controllers/emergency';

// Get specified emergency
router.get('/', getEmergencyEvent);
// Handle specified emergency
router.post('/', handleEmergencyEvent);

export default router;
