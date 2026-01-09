import express from 'express';
import { sessionController } from '../controllers/sessionController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Rafraîchir le token (sans protection)
router.post('/refresh', sessionController.refreshToken);

// Lister les sessions (protégé)
router.get('/sessions', authMiddleware, sessionController.getSessions);

// Révoquer une session (protégé)
router.delete('/sessions/:id', authMiddleware, sessionController.revokeSession);

// Révoquer toutes les autres sessions (protégé)
router.delete('/sessions/all-others', authMiddleware, sessionController.revokeAllOtherSessions);

export default router;