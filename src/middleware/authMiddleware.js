// src/middleware/authMiddleware.js - VERSION CORRIGÉE
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

async function authMiddleware(req, res, next) {
  console.log('🔐 [AUTH MIDDLEWARE] Début - Path:', req.path);
  
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔐 [AUTH MIDDLEWARE] Pas de token JWT');
      return res.status(401).json({ 
        success: false,
        error: 'No token provided. Use: Authorization: Bearer <jwt_token>' 
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('🔐 [AUTH MIDDLEWARE] Token reçu (début):', token.substring(0, 20) + '...');
    
    // Vérifier si le token est blacklisté
    const blacklisted = await prisma.blacklistedAccessToken.findUnique({
      where: { token }
    });

    if (blacklisted) {
      console.log('🔐 [AUTH MIDDLEWARE] Token blacklisté');
      return res.status(401).json({ 
        success: false,
        error: 'Token has been revoked' 
      });
    }

    // Vérifier le JWT
    const secret = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      console.error('❌ JWT_SECRET non défini dans .env');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET);
    console.log('🔐 [AUTH MIDDLEWARE] JWT décodé:', decoded);
    
    // Vérifier que l'utilisateur existe et n'est pas désactivé
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.userId || decoded.id,
        disabledAt: null 
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerifiedAt: true,
        password: true  // Important pour change-password
      }
    });

    if (!user) {
      console.log('🔐 [AUTH MIDDLEWARE] Utilisateur non trouvé ou désactivé');
      return res.status(401).json({ 
        success: false,
        error: 'User not found or account disabled' 
      });
    }

    req.user = user;
    console.log('🔐 [AUTH MIDDLEWARE] Utilisateur défini:', user.id, user.email);
    next();
    
  } catch (error) {
    console.error('[AUTH MIDDLEWARE] Error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token expired' 
      });
    }
    res.status(500).json({ 
      success: false,
      error: 'Authentication failed' 
    });
  }
}

export default authMiddleware;