// src/utils/generateAuthToken.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export function generateAuthToken(userId) {
  const secret = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET non défini dans .env. Ajoute: JWT_SECRET=ton_secret');
  }
  
  return jwt.sign({ userId }, secret, { expiresIn: '1h' });
}

// Exécution directe
if (process.argv[1] && process.argv[1].includes('generateAuthToken.js')) {
  const userId = process.argv[2] || 'cmk78ojpz0000xw5xnmqjild0';
  
  try {
    const token = generateAuthToken(userId);
    const secret = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;
    
    console.log('='.repeat(60));
    console.log('🔐 TOKEN JWT GÉNÉRÉ');
    console.log('='.repeat(60));
    console.log('👤 User ID:', userId);
    console.log('🔑 Secret utilisé:', secret ? '✓ Défini' : '❌ Indéfini');
    console.log('⏱️  Expire dans: 1 heure');
    console.log('\n📋 TOKEN:');
    console.log(token);
    console.log('\n📝 Pour Postman:');
    console.log('Authorization: Bearer ' + token);
    console.log('='.repeat(60));
    
    // Vérifie le token
    const decoded = jwt.verify(token, secret);
    console.log('✅ Token vérifié:', decoded);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\n🔧 Problèmes possibles:');
    console.log('1. JWT_SECRET manquant dans .env');
    console.log('2. .env non chargé');
    console.log('\n💡 Solution:');
    console.log('Ajoute dans .env:');
    console.log('JWT_SECRET=ton_super_secret_jwt_pour_auth');
    console.log('JWT_ACCESS_SECRET=ton_super_secret_jwt_pour_auth');
  }
}