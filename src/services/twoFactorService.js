import { PrismaClient } from '@prisma/client';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

export const twoFactorService = {
  async enable(userId) {
    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Vérifier que 2FA n'est pas déjà activé
    if (user.twoFactorEnabledAt) {
      const error = new Error('2FA is already enabled');
      error.statusCode = 400;
      throw error;
    }

    // Générer un secret TOTP
    const secret = speakeasy.generateSecret({
      name: `Auth API (${user.email})`,
      issuer: 'Auth API',
      length: 32
    });

    // Générer un QR code en base64
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    // Retourner le secret et le QR code (PAS d'activation en BD)
    return {
      secret: secret.base32,
      qrCode: qrCode,
      message: 'Please scan the QR code and confirm with your code'
    };
  },

  async confirm(userId, code, secret) {
    // Vérifier le code TOTP
    const isValid = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: code,
      window: parseInt(process.env.TOTP_WINDOW || 2)
    });

    if (!isValid) {
      const error = new Error('Invalid 2FA code');
      error.statusCode = 400;
      throw error;
    }

    // Mettre à jour l'utilisateur pour activer le 2FA
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret,
        twoFactorEnabledAt: new Date()
      }
    });

    return { message: '2FA enabled successfully' };
  },

  async disable(userId, code) {
    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Vérifier que 2FA est activé
    if (!user.twoFactorEnabledAt) {
      const error = new Error('2FA is not enabled');
      error.statusCode = 400;
      throw error;
    }

    // Vérifier le code TOTP
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: parseInt(process.env.TOTP_WINDOW || 2)
    });

    if (!isValid) {
      const error = new Error('Invalid 2FA code');
      error.statusCode = 400;
      throw error;
    }

    // Désactiver le 2FA
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: null,
        twoFactorEnabledAt: null
      }
    });

    return { message: '2FA disabled successfully' };
  },

  async verify(email, code) {
    // Chercher l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Vérifier que 2FA est activé
    if (!user.twoFactorEnabledAt) {
      const error = new Error('2FA is not enabled');
      error.statusCode = 400;
      throw error;
    }

    // Vérifier le code TOTP
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: parseInt(process.env.TOTP_WINDOW || 2)
    });

    if (!isValid) {
      const error = new Error('Invalid 2FA code');
      error.statusCode = 400;
      throw error;
    }

    return { verified: true, userId: user.id };
  }
};