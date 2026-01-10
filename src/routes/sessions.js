import express from 'express';
import { sessionController } from '../controllers/sessionController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/refresh', sessionController.refreshToken);

router.get('/sessions', authMiddleware, sessionController.getSessions);

router.delete('/sessions/:id', authMiddleware, sessionController.revokeSession);

router.delete('/sessions/all-others', authMiddleware, sessionController.revokeAllOtherSessions);

export default router;