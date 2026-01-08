const passwordService = require('../services/passwordService')
const { z } = require('zod')

// Schéma de validation
const forgotPasswordSchema = z.object({
  email: z.string().email()
})

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8)
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8)
})

const passwordController = {
  async forgotPassword(req, res) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body)
      await passwordService.sendResetPasswordEmail(email)
      res.json({ 
        message: 'If an account exists with this email, you will receive a reset link' 
      })
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  },

  async resetPassword(req, res) {
    try {
      const { token, newPassword } = resetPasswordSchema.parse(req.body)
      await passwordService.resetPassword(token, newPassword)
      res.json({ message: 'Password has been reset successfully' })
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  },

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body)
      const userId = req.user.id
      
      await passwordService.changePassword(userId, currentPassword, newPassword)
      res.json({ message: 'Password changed successfully' })
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  }
}

module.exports = passwordController