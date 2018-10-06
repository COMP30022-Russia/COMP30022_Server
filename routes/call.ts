import express, { Router } from 'express';
const router: Router = express.Router({ mergeParams: true });

// Import controllers
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

// Set state
router.post('/state', retrieveCall(), setCallState);

// Update failure count
router.post('/failure', retrieveCall(), updateCallFailureCount);

// End voice/video call
router.post('/end', retrieveCall(), endCall);

export default router;
