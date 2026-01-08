import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';

const prisma = new PrismaClient();

export const authService = {

  async registerUser(email, password, firstName, lastName) {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('Email already in use');
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName
      }
    });

    return {
      userId: user.id,
      email: user.email
    };
  },

  async loginUser(email, password, ipAddress, userAgent) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      await prisma.loginHistory.create({
        data: {
          userId: null,
          ipAddress,
          userAgent,
          success: false
        }
      });
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          ipAddress,
          userAgent,
          success: false
        }
      });
      throw new Error('Invalid email or password');
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        userAgent,
        ipAddress,
        expiresAt
      }
    });

    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        ipAddress,
        userAgent,
        success: true
      }
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() }
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    };
  },

  async logoutUser(userId, accessToken) {
    await prisma.blacklistedAccessToken.create({
      data: {
        token: accessToken,
        userId,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      }
    });

    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() }
    });

    await prisma.user.update({
      where: { id: userId },
      data: { updatedAt: new Date() }
    });
  }
};