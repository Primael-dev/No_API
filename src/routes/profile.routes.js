const express = require('express');
const router = express.Router();

// Controller
const profileController = require('../controllers/profile.controller');

// Middleware pour protéger la route
const authMiddleware = require('../middlewares/auth.middleware');

// GET /profile - Récupérer le profil
router.get('/', authMiddleware, profileController.getProfile);

module.exports = router;

// PATCH /profile - Modifier le profil
router.patch('/', authMiddleware, profileController.updateProfile);

// DELETE /account - Supprimer le compte
router.delete('/account', authMiddleware, profileController.deleteAccount);

// GET /login-history
router.get('/login-history', authMiddleware, profileController.getLoginHistory); 