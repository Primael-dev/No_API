const bcrypt = require('bcrypt')
const crypto = require('crypto')
const prisma = require('../lib/prisma')
const { sendEmail } = require('../utils/emailService')

const passwordService = {
  async sendResetPasswordEmail(email) {
    // 1. Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Ne pas révéler si l'utilisateur existe ou non
    if (!user) return

    // 2. Supprimer les anciens tokens
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    })

    // 3. Générer un nouveau token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 3600000) // 1 heure

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    })

    // 4. Envoyer l'email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`
    
    await sendEmail({
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <h1>Réinitialisation du mot de passe</h1>
        <p>Cliquez sur le lien suivant pour réinitialiser votre mot de passe :</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Ce lien expirera dans 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
      `
    })
  },

  async resetPassword(token, newPassword) {
    // 1. Trouver le token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!resetToken) {
      throw new Error('Invalid or expired reset token')
    }

    // 2. Vérifier l'expiration
    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      })
      throw new Error('Reset token has expired')
    }

    // 3. Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 4. Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword }
    })

    // 5. Supprimer le token utilisé
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id }
    })

    // 6. Révoquer tous les refresh tokens (sécurité)
    await prisma.refreshToken.updateMany({
      where: { 
        userId: resetToken.userId,
        revokedAt: null 
      },
      data: { revokedAt: new Date() }
    })
  },

  async changePassword(userId, currentPassword, newPassword) {
    // 1. Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // 2. Vérifier le mot de passe actuel
    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      throw new Error('Current password is incorrect')
    }

    // 3. Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 4. Mettre à jour
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })

    // 5. Révoquer tous les refresh tokens sauf celui actuel (optionnel)
    // Pour plus de sécurité, forcez une nouvelle connexion
  }
}

module.exports = passwordService