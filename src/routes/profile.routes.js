import { Router } from 'express';
import { profileController } from '../controllers/profile.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, profileController.getProfile);

router.patch('/', authMiddleware, profileController.updateProfile);

router.delete('/account', authMiddleware, profileController.deleteAccount);

router.get('/login-history', authMiddleware, profileController.getLoginHistory);

export function registerProfileRoutes(app) {
  app.use('/api/auth/profile', router);
}