import { Router } from 'express';
import { twoFactorController } from '../controllers/twoFactorController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/2fa/enable', authMiddleware, twoFactorController.enable);

router.post('/2fa/confirm', authMiddleware, twoFactorController.confirm);

router.post('/2fa/disable', authMiddleware, twoFactorController.disable);

router.post('/2fa/verify', twoFactorController.verify);

export function registerTwoFactorRoutes(app) {
  app.use('/api/auth', router);
}