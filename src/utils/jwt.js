// src/utils/jwt.js - Version robuste
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Valeurs par défaut pour le développement
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'dev_access_secret_' + crypto.randomBytes(16).toString('hex');
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_' + crypto.randomBytes(16).toString('hex');
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Avertissement si on utilise des valeurs par défaut
if (!process.env.JWT_ACCESS_SECRET && !process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET non défini, utilisation d\'un secret de développement');
  console.warn('   Pour la production, définissez JWT_SECRET dans .env');
}

export function generateAccessToken(userId) {
  return jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}

export function generateRefreshToken(userId) {
  return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}