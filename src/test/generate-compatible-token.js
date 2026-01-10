// src/test/generate-compatible-token.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Le SECRET que ton middleware utilise
const SECRET = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;

if (!SECRET) {
  console.error('❌ ERREUR: Aucun secret JWT dans .env');
  console.log('💡 Ajoute dans .env:');
  console.log('JWT_SECRET=ton_secret_ici');
  console.log('JWT_ACCESS_SECRET=ton_secret_ici');
  process.exit(1);
}

// User ID de test
const USER_ID = 'cmk78ojpz0000xw5xnmqjild0';

// 1. Génère le token exactement comme ton middleware l'attend
const token = jwt.sign(
  { 
    userId: USER_ID,  // Format IMPORTANT
    // ou 'id' selon ce que ton middleware attend
  }, 
  SECRET, 
  { expiresIn: '1h' }
);

// 2. Vérifie-le immédiatement
try {
  const decoded = jwt.verify(token, SECRET);
  
  console.log('='.repeat(60));
  console.log('✅ TOKEN COMPATIBLE GÉNÉRÉ');
  console.log('='.repeat(60));
  console.log('👤 User ID:', USER_ID);
  console.log('🔑 Secret utilisé:', SECRET.substring(0, 10) + '...');
  console.log('📦 Payload dans le token:', decoded);
  console.log('\n📋 TOKEN:');
  console.log(token);
  console.log('\n📝 Pour Postman:');
  console.log('Authorization: Bearer ' + token);
  console.log('='.repeat(60));
  
} catch (error) {
  console.error('❌ Erreur de vérification:', error.message);
}