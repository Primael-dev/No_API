import express from 'express';
import { authController } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { googleCallback, oauthSuccess } from '../controllers/oauthController.js';

const router = express.Router();

router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/logout', authMiddleware, authController.logout);

// Fallback OAuth routes in case Google is configured to use /api/auth/google/callback
router.get('/google/callback', googleCallback);
router.get('/google/success', oauthSuccess);

export default router;