import { Router } from 'express';
import { twoFactorController } from '../controllers/twoFactorController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/2fa/enable (protégé)
router.post('/2fa/enable', authMiddleware, twoFactorController.enable);

// POST /api/auth/2fa/confirm (protégé)
router.post('/2fa/confirm', authMiddleware, twoFactorController.confirm);

// POST /api/auth/2fa/disable (protégé)
router.post('/2fa/disable', authMiddleware, twoFactorController.disable);

// POST /api/auth/2fa/verify (pas protégé, utilisé lors du login)
router.post('/2fa/verify', twoFactorController.verify);

export function registerTwoFactorRoutes(app) {
  app.use('/api/auth', router);
}