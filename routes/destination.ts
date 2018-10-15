import express, { Router } from 'express';
const router: Router = express.Router({ mergeParams: true });

import {
    setFavouriteDestination,
    getDestinations
} from '../controllers/destination';
import { verifyIDParam } from '../middleware/params';

// Get destinations
router.get('/', getDestinations);

// Set/unset destination as favourite
router.post(
    '/:destinationID',
    verifyIDParam('destinationID'),
    setFavouriteDestination
);

export default router;
