import express from 'express';
import passwordController from '../controllers/passwordController.js';
// import authMiddleware from '../middleware/authMiddleware.js'; // Plus tard

const router = express.Router();

router.post('/forgot-password', passwordController.forgotPassword);
router.post('/reset-password', passwordController.resetPassword);
router.post('/change-password', passwordController.changePassword); // Ajouter authMiddleware plus tard

export default router;  