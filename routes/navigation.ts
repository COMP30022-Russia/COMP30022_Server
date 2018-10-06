import express, { Router } from 'express';
const router: Router = express.Router({ mergeParams: true });
import models from '../models';

import { retrieveNavigationSession } from '../middleware/navigation';

import {
    getNavigationSession,
    endNavigationSession,
    startNavigationCall
} from '../controllers/navigation';
import {
    switchNavigationControl,
    updateAPLocation,
    getAPLocation,
    getRoute,
    setDestination,
    sendOffTrackNotification
} from '../controllers/navigation_session';

// Get requested navigation session
router.get(
    '/',
    retrieveNavigationSession(models.Session.rawAttributes, true, true),
    getNavigationSession
);

// End requested navigation session
router.post(
    '/end',
    retrieveNavigationSession(['id', 'active', 'carerId', 'APId']),
    endNavigationSession
);

// Switch navigation control
router.post(
    '/control',
    retrieveNavigationSession(['id', 'carerHasControl', 'APId', 'carerId']),
    switchNavigationControl
);

// Update location (As AP)
// Note that session validation is done inside controller function
router.post('/location', updateAPLocation);

// Get AP location (as carer)
router.get(
    '/location',
    retrieveNavigationSession(['id', 'APId']),
    getAPLocation
);

// Get route
router.get('/route', retrieveNavigationSession(['route']), getRoute);

// Set destination
router.post(
    '/destination',
    retrieveNavigationSession(['id', 'APId', 'carerId']),
    setDestination
);

// Off track notification
router.post(
    '/off_track',
    retrieveNavigationSession(['id', 'APId', 'carerId']),
    sendOffTrackNotification
);

// Start call
router.post(
    '/call',
    retrieveNavigationSession(['id', 'APId', 'carerId']),
    startNavigationCall
);

export default router;
