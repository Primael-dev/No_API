import express from 'express';
import { authController } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Inscription
router.post('/register', authController.register);

// Connexion
router.post('/login', authController.login);

// Déconnexion (protégé)
router.post('/logout', authMiddleware, authController.logout);

export default router;