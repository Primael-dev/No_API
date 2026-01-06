import { Router } from 'express';
import { emailController } from '../controllers/emailController.js';
import { rateLimitMiddleware } from '../middleware/rateLimit.js';

const router = Router();

// POST /api/auth/send-verification-email
router.post('/send-verification-email', rateLimitMiddleware, emailController.sendVerificationEmail);

// POST /api/auth/verify-email
router.post('/verify-email', rateLimitMiddleware, emailController.verifyEmail);

export function registerEmailRoutes(app) {
  app.use('/api/auth', router);
}