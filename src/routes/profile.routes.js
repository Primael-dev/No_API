import { Router } from 'express';
import { profileController } from '../controllers/profile.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /profile - Récupérer le profil
router.get('/', authMiddleware, profileController.getProfile);

// PATCH /profile - Modifier le profil
router.patch('/', authMiddleware, profileController.updateProfile);

// DELETE /account - Supprimer le compte
router.delete('/account', authMiddleware, profileController.deleteAccount);

// GET /login-history
router.get('/login-history', authMiddleware, profileController.getLoginHistory);

export function registerProfileRoutes(app) {
  app.use('/api/auth/profile', router);
}