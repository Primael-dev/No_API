import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../lib/prisma.js';
import oauthController from '../controllers/oauthController.js';

const router = express.Router();

// GET /api/auth/oauth/google
router.get('/google', oauthController.redirectToGoogle)

// GET /api/auth/oauth/google/callback
router.get('/google/callback', oauthController.handleGoogleCallback)

export default router;