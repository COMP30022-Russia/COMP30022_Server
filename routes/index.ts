import express, { Router } from 'express';
const router: Router = express.Router();

// Import auth middleware
import {
    authenticate,
    ensureRequestedUserIsAssociated,
    ensureRequestedUserIsInRequestedAssociation
} from '../middleware/auth';
// Import param verification middleware
import { verifyIDParam } from '../middleware/params';

// Import routers
import authRouter from './auth';
import userRouter from './user';
import meRouter from './me';
import associationRouter from './association';
import navigationRouter from './navigation';
import emergencyRouter from './emergency';
import { retrieveEmergencyEvent } from '../middleware/emergency';

// Handle index route
import { homeRoute } from '../controllers/home';
router.get('/', homeRoute);

// Load routers
router.use('/users', authRouter);
router.use(
    '/users/:userID',
    verifyIDParam('userID'),
    authenticate,
    ensureRequestedUserIsAssociated,
    userRouter
);
router.use('/me', authenticate, meRouter);
router.use(
    '/associations/:associationID',
    authenticate,
    verifyIDParam('associationID'),
    ensureRequestedUserIsInRequestedAssociation,
    associationRouter
);
router.use(
    '/navigation/:sessionID',
    authenticate,
    verifyIDParam('sessionID'),
    navigationRouter
);
router.use(
    '/emergency/:eventID',
    authenticate,
    verifyIDParam('eventID'),
    retrieveEmergencyEvent,
    emergencyRouter
);

export default router;
