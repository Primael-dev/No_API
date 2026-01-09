import prisma from '../utils/prisma.js';
import jwt from 'jsonwebtoken';

export const sessionService = {
  // Rafraîchir le token
  async refreshAccessToken(refreshToken) {
    // Vérifier le token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      const error = new Error('Token invalide ou expiré');
      error.statusCode = 401;
      throw error;
    }

    // Vérifier en base de données
    const tokenInDb = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: decoded.userId,
        revokedAt: null,
        expiresAt: { gt: new Date() }
      }
    });

    if (!tokenInDb) {
      const error = new Error('Token non trouvé ou révoqué');
      error.statusCode = 401;
      throw error;
    }

    // Générer de nouveaux tokens
    const newAccessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
    const newRefreshToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    // Créer le nouveau refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: decoded.userId,
        userAgent: tokenInDb.userAgent,
        ipAddress: tokenInDb.ipAddress,
        expiresAt
      }
    });

    // Révoquer l'ancien token
    await prisma.refreshToken.update({
      where: { id: tokenInDb.id },
      data: { revokedAt: new Date() }
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  },

  // Récupérer les sessions
  async getUserSessions(userId) {
    const sessions = await prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    return sessions.map(session => ({
      id: session.id,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt.toISOString(),
      expiresAt: session.expiresAt.toISOString()
    }));
  },

  // Révoquer une session
  async revokeSessionById(userId, sessionId) {
    const session = await prisma.refreshToken.findFirst({
      where: {
        id: sessionId,
        userId,
        revokedAt: null
      }
    });

    if (!session) {
      const error = new Error('Session non trouvée');
      error.statusCode = 404;
      throw error;
    }

    await prisma.refreshToken.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() }
    });
  },

  // Révoquer toutes les autres sessions
  async revokeAllOtherSessions(userId) {
    const sessions = await prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null
      },
      orderBy: { createdAt: 'desc' }
    });

    const keepSessionId = sessions[0]?.id;

    if (!keepSessionId) return;

    await prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
        id: { not: keepSessionId }
      },
      data: { revokedAt: new Date() }
    });
  }
};