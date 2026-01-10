// src/controllers/passwordController.js
import passwordService from '../services/passwordService.js';

const passwordController = {
  // Oubli de mot de passe
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email is required' 
        });
      }
      
      await passwordService.sendResetPasswordEmail(email);
      
      res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a reset link'
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // RÉINITIALISATION DE MOT DE PASSE
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      
      // Validation
      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Token and new password are required'
        });
      }
      
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 8 characters'
        });
      }
      
      // Appel du service
      const result = await passwordService.resetPassword(token, newPassword);
      
      res.json({
        success: true,
        message: 'Password has been reset successfully',
        userId: result.userId
      });
      
    } catch (error) {
      // Erreurs spécifiques
      if (error.message.includes('Invalid') || error.message.includes('expired')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to reset password'
      });
    }
  },

  // Changement de mot de passe (pour plus tard)
  async changePassword(req, res) {
    // À implémenter
    res.json({ success: true, message: 'Change password endpoint' });
  }
};

export default passwordController;