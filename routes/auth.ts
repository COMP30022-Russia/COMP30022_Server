import express, { Router } from 'express';
const router: Router = express.Router();

// Import controllers
import { register, login } from '../controllers/user';

// User registration
router.post('/register', register);
// User login
router.post('/login', login);

export default router;
