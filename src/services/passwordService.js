// Version SIMPLIFIÉE pour commencer
import prisma from '../lib/prisma.js';
import { sendEmail } from '../utils/emailService.js';

export const sendResetPasswordEmail = async (email) => {
  console.log(`[SERVICE] Demande reset password pour: ${email}`);
  
  // 1. Chercher l'utilisateur (simulé)
  // const user = await prisma.user.findUnique({ where: { email } });
  // if (!user) return; // Pour la sécurité, on ne dit pas si l'email existe
  
  // 2. Générer token (simulé)
  const token = 'simulated-token-' + Date.now();
  
  // 3. Envoyer email (simulé)
  await sendEmail({
    to: email,
    subject: 'Reset your password',
    html: `<p>Use this token: ${token}</p>`
  });
  
  return { success: true };
};

export const resetPassword = async (token, newPassword) => {
  console.log(`[SERVICE] Reset avec token: ${token}, nouveau mdp: ${newPassword}`);
  
  // Vérifier token, expiration, etc.
  if (!token.startsWith('simulated-token-')) {
    throw new Error('Invalid token');
  }
  
  if (newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  
  return { success: true };
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  console.log(`[SERVICE] Change password pour user: ${userId}`);
  
  if (newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters');
  }
  
  return { success: true };
};

// Export par défaut
export default {
  sendResetPasswordEmail,
  resetPassword,
  changePassword
};