import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const profileService = {
  async getProfile(userId) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerifiedAt: true,
        twoFactorEnabledAt: true,
        disabledAt: true,
      },
    });
  },

  async updateProfile(userId, firstName, lastName) {
    return prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName, updatedAt: new Date() },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerifiedAt: true,
        twoFactorEnabledAt: true,
        disabledAt: true,
      },
    });
  },

  async deleteAccount(userId) {
    return prisma.user.update({
      where: { id: userId },
      data: { disabledAt: new Date() },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        disabledAt: true
      },
    });
  },

  async getLoginHistory(userId) {
    return prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }
};