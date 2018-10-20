import express, { Router } from 'express';
const router: Router = express.Router();

// Import middleware
import { authenticate } from '../middleware/authenticate';
import {
    ensureRequestedUserIsAssociated,
    retrieveAssociation
} from '../middleware/association';
import { retrieveEmergencyEvent } from '../middleware/emergency';
// Import param verification middleware
import { verifyIDParam } from '../middleware/params';

// Import routers
import authRouter from './auth';
import userRouter from './user';
import meRouter from './me';
import associationRouter from './association';
import navigationRouter from './navigation';
import emergencyRouter from './emergency';
import callRouter from './call';

// Handle index route
import { homeRoute } from '../controllers/home';
router.get('/', homeRoute);

// Load routers
router.use('/users', authRouter);
router.use(
    '/users/:userID',
    authenticate,
    verifyIDParam('userID'),
    ensureRequestedUserIsAssociated,
    userRouter
);
router.use('/me', authenticate, meRouter);
router.use(
    '/associations/:associationID',
    authenticate,
    verifyIDParam('associationID'),
    retrieveAssociation,
    associationRouter
);
router.use(
    '/navigation/:sessionID',
    authenticate,
    verifyIDParam('sessionID'),
    navigationRouter
);
router.use(
    '/emergencies/:eventID',
    authenticate,
    verifyIDParam('eventID'),
    retrieveEmergencyEvent,
    emergencyRouter
);
router.use('/calls/:callID', authenticate, verifyIDParam('callID'), callRouter);

export default router;
