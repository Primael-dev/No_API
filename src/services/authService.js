import prisma from '../utils/prisma.js';
import bcrypt from 'bcryptjs';

export const authService = {

  async register(userData) {
    const { email, password, firstName, lastName } = userData;

    // Vérifier si l'email existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      const error = new Error('Cet email est déjà utilisé');
      error.statusCode = 409;
      throw error;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    return await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName
      }
    });
  },

  async login(email, password, loginInfo) {
    
    const user = await prisma.user.findUnique({
      where: { email }
    });

    let isPasswordValid = false;

    if (user && user.password) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    }

    await prisma.loginHistory.create({
      data: {
        userId: user ? user.id : null,
        ipAddress: loginInfo.ipAddress,
        userAgent: loginInfo.userAgent,
        success: (user !== null && isPasswordValid)
      }
    });


    if (!user || !isPasswordValid) {
      const error = new Error('Identifiants incorrects');
      error.statusCode = 401;
      throw error;
    }

    // Vérifier que le compte n'est pas désactivé
    if (user.disabledAt) {
      const error = new Error('Ce compte a été désactivé');
      error.statusCode = 401;
      throw error;
    }

    return user;
  },

  // Déconnexion
  async logout(userId, token) {
    if (!token) return;

    // Ajouter le token à la blacklist
    return await prisma.blacklistedAccessToken.create({
      data: {
        token,
        userId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
      }
    });
  }
};