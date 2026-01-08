// ============================================
// src/server.js - Express Server
// ============================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import sessionRoutes from './routes/sessions.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Middlewares Globaux
// ============================================

app.use(helmet());
app.use(cors());
app.use(express.json());

// ============================================
// Routes
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/auth', sessionRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'API Auth opérationnelle' });
});

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
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});