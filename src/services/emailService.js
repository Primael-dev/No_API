import { PrismaClient } from '@prisma/client';
import { generateToken, getTokenExpiry } from '../utils/tokens.js';
import { sendEmail } from '../utils/email.js';

const prisma = new PrismaClient();

export const emailService = {
  async verifyEmail(token) {
    // Chercher le token en BD
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken) {
      const error = new Error('Token not found');
      error.statusCode = 400;
      throw error;
    }

    // Vérifier que le token n'a pas expiré
    if (new Date() > verificationToken.expiresAt) {
      const error = new Error('Token has expired');
      error.statusCode = 400;
      throw error;
    }

    // Mettre à jour l'utilisateur: marquer l'email comme vérifié
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerifiedAt: new Date() }
    });

    // Supprimer le token utilisé
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id }
    });

    return { message: 'Email verified successfully' };
  },

  async sendVerificationEmail(email) {
    // Chercher l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Vérifier que l'email n'est pas déjà vérifié
    if (user.emailVerifiedAt) {
      const error = new Error('Email already verified');
      error.statusCode = 400;
      throw error;
    }

    // Générer un token unique
    const token = generateToken();

    // Créer le VerificationToken avec expiry 24h
    const expiresAt = getTokenExpiry('24h');
    await prisma.verificationToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    });

    // Construire le lien de vérification
    const verificationLink = `http://localhost:3000/api/auth/verify-email?token=${token}`;

    // Envoyer l'email
    const htmlContent = `
      <h2>Vérifiez votre adresse email</h2>
      <p>Cliquez sur le lien ci-dessous pour vérifier votre adresse email:</p>
      <a href="${verificationLink}">Vérifier mon email</a>
      <p>Ce lien expire dans 24 heures.</p>
    `;

    await sendEmail(email, 'Email Verification', htmlContent);

    return { message: 'Verification email sent' };
  }
};