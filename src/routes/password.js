const express = require('express')
const router = express.Router()
const passwordController = require('../controllers/passwordController')
const authMiddleware = require('../middleware/authMiddleware')

// POST /api/auth/forgot-password
router.post('/forgot-password', passwordController.forgotPassword)

// POST /api/auth/reset-password
router.post('/reset-password', passwordController.resetPassword)

// POST /api/auth/change-password
router.post('/change-password', authMiddleware, passwordController.changePassword)

module.exports = router