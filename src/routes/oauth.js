import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../lib/prisma.js';
import oauthController from '../controllers/oauthController.js';

const router = express.Router();


router.get('/google', oauthController.redirectToGoogle)

router.get('/google/callback', oauthController.handleGoogleCallback)

export default router;