// src/services/passwordService.js
import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';

const passwordService = {
  // Oubli de mot de passe (déjà fait)
  async sendResetPasswordEmail(email) {
    console.log(`[SERVICE] sendResetPasswordEmail: ${email}`);
    // Logique d'envoi d'email (à implémenter)
    return { success: true };
  },

  // Réinitialisation de mot de passe (À FAIRE)
  async resetPassword(token, newPassword) {
    console.log(`[SERVICE] resetPassword called`);
    console.log(`Token: ${token}, New password: ${newPassword}`);
    
    // 1. Vérifier que le token existe
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetToken) {
      throw new Error('Invalid or expired reset token');
    }

    // 2. Vérifier l'expiration (1 heure)
    const now = new Date();
    if (resetToken.expiresAt < now) {
      // Supprimer le token expiré
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      });
      throw new Error('Reset token has expired');
    }

    // 3. Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Mettre à jour le mot de passe utilisateur
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword }
    });

    // 5. Supprimer le token utilisé
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id }
    });

    // 6. Révoquer tous les refresh tokens (sécurité)
    await prisma.refreshToken.updateMany({
      where: { 
        userId: resetToken.userId,
        revokedAt: null 
      },
      data: { revokedAt: now }
    });

    return { 
      success: true, 
      userId: resetToken.userId 
    };
  },

  // Changement de mot de passe (pour plus tard)
  async changePassword(userId, currentPassword, newPassword) {
    console.log(`[SERVICE] changePassword pour user: ${userId}`);
    // À implémenter
    return { success: true };
  }
};

export default passwordService;