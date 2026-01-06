import { PrismaClient } from '@prisma/client';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '../utils/jwt.js';

const prisma = new PrismaClient();

export const sessionService = {

  async refreshAccessToken(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    
    if (!decoded) {
      throw new Error('Token invalide');
    }

    const tokenInDb = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: decoded.userId,
        revokedAt: null,
        expiresAt: { gt: new Date() }
      }
    });

    if (!tokenInDb) {
      throw new Error('Token non trouvé');
    }

    const newAccessToken = generateAccessToken(decoded.userId);
    const newRefreshToken = generateRefreshToken(decoded.userId);

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

    await prisma.refreshToken.update({
      where: { id: tokenInDb.id },
      data: { revokedAt: new Date() }
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

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
      isCurrentSession: false
    }));
  },

  async revokeSessionById(userId, sessionId) {
    const session = await prisma.refreshToken.findFirst({
      where: { id: sessionId, userId, revokedAt: null }
    });

    if (!session) {
      throw new Error('Session non trouvée');
    }

    await prisma.refreshToken.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() }
    });
  },

  async revokeAllOtherSessions(userId) {
    const sessions = await prisma.refreshToken.findMany({
      where: { userId, revokedAt: null },
      orderBy: { createdAt: 'desc' }
    });

    const keepSessionId = sessions[0]?.id;

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