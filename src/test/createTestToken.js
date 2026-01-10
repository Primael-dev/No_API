// src/test/createTestToken.js - Version complète
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// 1. Vérifie/crée les secrets
const JWT_SECRET = process.env.JWT_SECRET || 'test_secret_' + crypto.randomBytes(16).toString('hex');
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || JWT_SECRET;

console.log('='.repeat(50));
console.log('🔧 CRÉATION DE TOKEN DE TEST');
console.log('='.repeat(50));

// 2. Utilisateur test (modifie avec ton ID)
const testUserId = 'cmk78ojpz0000xw5xnmqjild0';

// 3. Génère le token
const token = jwt.sign(
  { userId: testUserId },
  JWT_ACCESS_SECRET,
  { expiresIn: '1h' }
);

// 4. Affiche tout
console.log('👤 User ID:', testUserId);
console.log('🔑 Secret utilisé:', JWT_ACCESS_SECRET.substring(0, 10) + '...');
console.log('\n✅ TOKEN JWT :');
console.log(token);
console.log('\n📋 Pour Postman :');
console.log('Authorization: Bearer ' + token);
console.log('\n📝 Pour ton .env :');
console.log('JWT_SECRET=' + JWT_SECRET);
console.log('JWT_ACCESS_SECRET=' + JWT_ACCESS_SECRET);
console.log('='.repeat(50));

// 5. Vérifie le token (optionnel)
try {
  const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
  console.log('🔍 Token vérifié avec succès');
  console.log('Contenu:', decoded);
} catch (error) {
  console.log('❌ Erreur vérification:', error.message);
}