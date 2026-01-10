// src/services/passwordService.js
import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendEmail } from '../utils/emailService.js';

const passwordService = {
  /**
   * Envoie un email de réinitialisation de mot de passe
   * @param {string} email - Email de l'utilisateur
   */
  async sendResetPasswordEmail(email) {
    try {
      // Dans sendResetPasswordEmail
console.log(`[DEBUG] Recherche email: "${email}"`);
console.log(`[DEBUG] Emails dans la base:`);
const allUsers = await prisma.user.findMany({
  select: { email: true }
});
allUsers.forEach(u => console.log(`  - "${u.email}"`));
      console.log(`[PASSWORD SERVICE] Demande reset pour: ${email}`);
      
      // 1. Vérifier si l'utilisateur existe
      const user = await prisma.user.findUnique({
        where: { email }
      });

      // Pour des raisons de sécurité, on ne révèle pas si l'email existe
      if (!user) {
        console.log(`[PASSWORD SERVICE] Aucun utilisateur avec email: ${email}`);
        return; // On ne fait rien, mais on ne le dit pas
      }

      // 2. Vérifier si l'utilisateur a un mot de passe (pas OAuth only)
      if (!user.password) {
        console.log(`[PASSWORD SERVICE] Utilisateur ${email} n'a pas de mot de passe (OAuth only)`);
        // On pourrait envoyer un email spécial pour OAuth users
        return;
      }

      // 3. Supprimer les anciens tokens de cet utilisateur
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id }
      });

      // 4. Générer un nouveau token sécurisé
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 3600000); // 1 heure

      // 5. Sauvegarder le token en base
      await prisma.passwordResetToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt
        }
      });

      // 6. Construire le lien de réinitialisation
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
      const resetLink = `${frontendUrl}/reset-password?token=${token}`;

      // 7. Envoyer l'email
      await sendEmail({
        to: user.email,
        subject: 'Réinitialisation de votre mot de passe',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Réinitialisation de votre mot de passe</h2>
            <p>Bonjour ${user.firstName || ''},</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
            <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #4285f4; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 4px; font-weight: bold;">
                Réinitialiser mon mot de passe
              </a>
            </div>
            <p>Ou copiez-collez ce lien dans votre navigateur :</p>
            <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; 
                      word-break: break-all;">
              ${resetLink}
            </p>
            <p><strong>Ce lien expirera dans 1 heure.</strong></p>
            <p>Si vous n'avez pas fait cette demande, ignorez simplement cet email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              Ceci est un email automatique, merci de ne pas y répondre.
            </p>
          </div>
        `,
        text: `Réinitialisation de mot de passe\n\n
               Cliquez sur ce lien pour réinitialiser votre mot de passe : ${resetLink}\n
               Ce lien expirera dans 1 heure.`
      });

      console.log(`[PASSWORD SERVICE] Email de reset envoyé à: ${email}`);
      
      return {
        success: true,
        userId: user.id,
        emailSent: true,
        tokenCreated: true
      };

    } catch (error) {
      console.error('[PASSWORD SERVICE] Erreur sendResetPasswordEmail:', error);
      throw new Error('Échec de l\'envoi de l\'email de réinitialisation');
    }
  },

  /**
   * Réinitialise le mot de passe avec un token
   * @param {string} token - Token de réinitialisation
   * @param {string} newPassword - Nouveau mot de passe
   */
  async resetPassword(token, newPassword) {
    try {
      console.log(`[PASSWORD SERVICE] Tentative reset avec token: ${token.substring(0, 10)}...`);
      
      // 1. Validation du mot de passe
      if (!newPassword || newPassword.length < 8) {
        throw new Error('Le mot de passe doit contenir au moins 8 caractères');
      }

      // 2. Rechercher le token
      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true }
      });

      if (!resetToken) {
        throw new Error('Token de réinitialisation invalide ou expiré');
      }

      // 3. Vérifier l'expiration
      const now = new Date();
      if (resetToken.expiresAt < now) {
        // Nettoyer le token expiré
        await prisma.passwordResetToken.delete({
          where: { id: resetToken.id }
        });
        throw new Error('Le token de réinitialisation a expiré');
      }

      // 4. Vérifier que l'utilisateur existe toujours
      if (!resetToken.user) {
        await prisma.passwordResetToken.delete({
          where: { id: resetToken.id }
        });
        throw new Error('Utilisateur non trouvé');
      }

      // 5. Vérifier que le compte n'est pas désactivé
      if (resetToken.user.disabledAt) {
        throw new Error('Ce compte est désactivé');
      }

      // 6. Hasher le nouveau mot de passe
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // 7. Mettre à jour le mot de passe de l'utilisateur
      await prisma.user.update({
        where: { id: resetToken.userId },
        data: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      });

      // 8. Supprimer le token utilisé
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      });

      // 9. Révoquer tous les tokens de rafraîchissement existants (sécurité)
      await prisma.refreshToken.updateMany({
        where: { 
          userId: resetToken.userId,
          revokedAt: null 
        },
        data: { 
          revokedAt: now,
          updatedAt: now
        }
      });

      // 10. Enregistrer dans l'historique
      await prisma.loginHistory.create({
        data: {
          userId: resetToken.userId,
          success: true,
          ipAddress: 'SYSTEM', // Pas disponible dans ce contexte
          userAgent: 'PASSWORD_RESET',
          createdAt: now
        }
      });

      // 11. Envoyer un email de confirmation
      await sendEmail({
        to: resetToken.user.email,
        subject: 'Votre mot de passe a été réinitialisé',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Mot de passe réinitialisé avec succès</h2>
            <p>Bonjour ${resetToken.user.firstName || ''},</p>
            <p>Votre mot de passe a été réinitialisé avec succès.</p>
            <div style="background-color: #e8f5e9; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="color: #2e7d32; margin: 0;">
                <strong>✅ Mot de passe mis à jour</strong>
              </p>
            </div>
            <p><strong>Sécurité :</strong></p>
            <ul>
              <li>Toutes vos sessions actives ont été déconnectées</li>
              <li>Vous devez vous reconnecter avec votre nouveau mot de passe</li>
              <li>Si vous n'êtes pas à l'origine de cette action, contactez-nous immédiatement</li>
            </ul>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              Date: ${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR')}
            </p>
          </div>
        `
      });

      console.log(`[PASSWORD SERVICE] Password reset réussi pour user: ${resetToken.userId}`);
      
      return {
        success: true,
        userId: resetToken.userId,
        email: resetToken.user.email,
        timestamp: now.toISOString(),
        securityActions: [
          'password_updated',
          'all_sessions_revoked',
          'confirmation_email_sent'
        ]
      };

    } catch (error) {
      console.error('[PASSWORD SERVICE] Erreur resetPassword:', error);
      
      // Ne pas révéler trop d'informations dans l'erreur
      if (error.message.includes('Token') || error.message.includes('expiré')) {
        throw error; // Garder les messages spécifiques aux tokens
      }
      
      throw new Error('Échec de la réinitialisation du mot de passe');
    }
  },

  /**
   * Change le mot de passe (utilisateur connecté)
   * @param {string} userId - ID de l'utilisateur
   * @param {string} currentPassword - Mot de passe actuel
   * @param {string} newPassword - Nouveau mot de passe
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      console.log(`[PASSWORD SERVICE] Tentative changement pour user: ${userId}`);
      
      // 1. Validation
      if (!currentPassword || !newPassword) {
        throw new Error('Les deux mots de passe sont requis');
      }

      if (newPassword.length < 8) {
        throw new Error('Le nouveau mot de passe doit contenir au moins 8 caractères');
      }

      if (currentPassword === newPassword) {
        throw new Error('Le nouveau mot de passe doit être différent de l\'ancien');
      }

      // 2. Récupérer l'utilisateur
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      if (!user.password) {
        throw new Error('Ce compte utilise l\'authentification OAuth');
      }

      if (user.disabledAt) {
        throw new Error('Ce compte est désactivé');
      }

      // 3. Vérifier le mot de passe actuel
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new Error('Mot de passe actuel incorrect');
      }

      // 4. Hasher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 5. Mettre à jour le mot de passe
      await prisma.user.update({
        where: { id: userId },
        data: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      });

      // 6. Envoyer un email de confirmation
      await sendEmail({
        to: user.email,
        subject: 'Votre mot de passe a été changé',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Mot de passe changé avec succès</h2>
            <p>Bonjour ${user.firstName || ''},</p>
            <p>Votre mot de passe a été changé avec succès.</p>
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="color: #1565c0; margin: 0;">
                <strong>🔒 Sécurité renforcée</strong>
              </p>
            </div>
            <p><strong>Informations :</strong></p>
            <ul>
              <li>Changement effectué le : ${new Date().toLocaleDateString('fr-FR')}</li>
              <li>Votre session actuelle reste active</li>
              <li>Si vous n'êtes pas à l'origine de cette action, changez immédiatement votre mot de passe</li>
            </ul>
          </div>
        `
      });

      console.log(`[PASSWORD SERVICE] Password change réussi pour user: ${userId}`);
      
      return {
        success: true,
        userId: user.id,
        email: user.email,
        timestamp: new Date().toISOString(),
        message: 'Mot de passe changé avec succès'
      };

    } catch (error) {
      console.error('[PASSWORD SERVICE] Erreur changePassword:', error);
      throw error; // Propager l'erreur originale
    }
  },

  /**
   * Vérifie si un token de réinitialisation est valide
   * @param {string} token - Token à vérifier
   */
  async validateResetToken(token) {
    try {
      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true }
      });

      if (!resetToken) {
        return { valid: false, reason: 'Token non trouvé' };
      }

      if (resetToken.expiresAt < new Date()) {
        // Nettoyer le token expiré
        await prisma.passwordResetToken.delete({
          where: { id: resetToken.id }
        });
        return { valid: false, reason: 'Token expiré' };
      }

      if (!resetToken.user) {
        return { valid: false, reason: 'Utilisateur non trouvé' };
      }

      if (resetToken.user.disabledAt) {
        return { valid: false, reason: 'Compte désactivé' };
      }

      return {
        valid: true,
        userId: resetToken.userId,
        email: resetToken.user.email,
        expiresAt: resetToken.expiresAt
      };

    } catch (error) {
      console.error('[PASSWORD SERVICE] Erreur validateResetToken:', error);
      return { valid: false, reason: 'Erreur de validation' };
    }
  }
};

export default passwordService;