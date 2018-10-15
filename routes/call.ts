import express, { Router } from 'express';
const router: Router = express.Router({ mergeParams: true });

import {
    getCall,
    setCallState,
    updateCallFailureCount,
    endCall,
    acceptCall,
    rejectCall
} from '../controllers/call';
import { retrieveCall } from '../middleware/call';

// Get call
router.get('/', retrieveCall(true), getCall);

// Accept call
router.post('/accept', retrieveCall(), acceptCall);

// Reject call
router.post('/reject', retrieveCall(), rejectCall);

// Set call state
router.post('/state', retrieveCall(), setCallState);

// Update failure count of call
router.post('/failure', retrieveCall(), updateCallFailureCount);

// End call
router.post('/end', retrieveCall(), endCall);

export default router;
