import express, { Router } from 'express';
const router: Router = express.Router();

import { register, login } from '../controllers/auth';

// User registration
router.post('/register', register);
// User login
router.post('/login', login);

export default router;
