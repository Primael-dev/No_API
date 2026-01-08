const express = require('express')
const router = express.Router()
const oauthController = require('../controllers/oauthController')

// GET /api/auth/oauth/google
router.get('/google', oauthController.redirectToGoogle)

// GET /api/auth/oauth/google/callback
router.get('/google/callback', oauthController.handleGoogleCallback)

module.exports = router