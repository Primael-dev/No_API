import express from 'express';
import passwordController from '../controllers/passwordController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/forgot-password', passwordController.forgotPassword);
router.post('/reset-password', passwordController.resetPassword);
router.post('/change-password', authMiddleware, passwordController.changePassword);

router.post('/change-password-test', passwordController.changePasswordTest);

export default router;