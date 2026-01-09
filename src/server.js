// ============================================
// src/server.js - Express Server
// ============================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';

// Import de vos routes
import passwordRoutes from './routes/password.js';
import oauthRoutes from './routes/oauth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Middlewares Globaux
// ============================================

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session pour OAuth (nécessaire pour Passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 heures
  }
}));

// Initialisation Passport
app.use(passport.initialize());
app.use(passport.session());

// ============================================
// Import et configuration Passport
// ============================================

import('./config/passport.js').catch(err => {
  console.error('Failed to load passport config:', err);
});

// ============================================
// Routes
// ============================================

// Health check
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API Auth opérationnelle',
    endpoints: {
      password: '/api/auth/password',
      oauth: '/api/auth/oauth'
    }
  });
});

// Vos routes OAuth et Password
app.use('/api/auth/password', passwordRoutes);
app.use('/api/auth/oauth', oauthRoutes);

// ============================================
// Test Routes pour OAuth (à retirer en production)
// ============================================

if (process.env.NODE_ENV === 'development') {
  app.get('/test-oauth', (req, res) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test OAuth</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .container { max-width: 600px; margin: 0 auto; }
          h1 { color: #333; }
          .btn { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #4285f4; 
            color: white; 
            text-decoration: none; 
            border-radius: 4px; 
            margin: 10px 0;
          }
          .btn:hover { background: #3367d6; }
          .endpoints { background: #f5f5f5; padding: 20px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔐 Test OAuth Google</h1>
          <a href="/api/auth/oauth/google" class="btn">Login with Google</a>
          
          <div class="endpoints">
            <h3>Endpoints disponibles:</h3>
            <ul>
              <li><strong>POST</strong> /api/auth/password/forgot-password</li>
              <li><strong>POST</strong> /api/auth/password/reset-password</li>
              <li><strong>POST</strong> /api/auth/password/change-password</li>
              <li><strong>GET</strong> /api/auth/oauth/google</li>
              <li><strong>GET</strong> /api/auth/oauth/google/callback</li>
            </ul>
          </div>
        </div>
      </body>
      </html>
    `;
    res.send(html);
  });
}

// ============================================
// Error Handlers
// ============================================

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler (doit être le dernier)
app.use(errorHandler);

// ============================================
// Démarrage du serveur
// ============================================

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
  console.log(`🔗 Test OAuth: http://localhost:${PORT}/test-oauth`);
  
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('⚠️  Variables OAuth manquantes dans .env');
    console.warn('   - GOOGLE_CLIENT_ID');
    console.warn('   - GOOGLE_CLIENT_SECRET');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});