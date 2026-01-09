// src/lib/prisma.js
import { PrismaClient } from '@prisma/client';

// Crée une instance de Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});

// Export par défaut (important pour ES modules)
export default prisma;