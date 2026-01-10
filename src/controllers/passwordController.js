import passwordService from '../services/passwordService.js';

const passwordController = {
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

  // 3. Change Password 
  async changePassword(req, res) {
    try {
    
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      console.log(`[CONTROLLER] changePassword pour user: ${userId}`);
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current and new password are required'
        });
      }
      
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'New password must be at least 8 characters'
        });
      }
      
      if (currentPassword === newPassword) {
        return res.status(400).json({
          success: false,
          error: 'New password must be different from current password'
        });
      }
    
      const result = await passwordService.changePassword(
        userId, 
        currentPassword, 
        newPassword
      );
      
      res.json({
        success: true,
        message: 'Password changed successfully',
        email: result.email,
        timestamp: result.timestamp
      });
      
    } catch (error) {
      console.error('[CONTROLLER] changePassword error:', error);
      
      if (error.message.includes('incorrect') || error.message.includes('Incorrect')) {
        return res.status(401).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }
      
      if (error.message.includes('OAuth')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to change password'
      });
    }
  },

  async changePasswordTest(req, res) {
    try {
      console.log('🔧 [TEST] change-password-test appelé');
      
      const { userId, currentPassword, newPassword } = req.body;
      
      if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'userId, currentPassword and newPassword are required for testing',
          example: {
            "userId": "cmk78ojpz0000xw5xnmqjild0",
            "currentPassword": "password123", 
            "newPassword": "Nouveau456!"
          }
        });
      }
            const result = await passwordService.changePassword(
        userId, 
        currentPassword, 
        newPassword
      );
      
      res.json({
        success: true,
        message: 'Password changed successfully (test mode)',
        userId: result.userId,
        note: 'Cette route est pour test seulement. En production, utilise /change-password avec JWT.'
      });
      
    } catch (error) {
      console.error('[TEST CONTROLLER] Error:', error.message);
      res.status(400).json({
        success: false,
        error: error.message,
        debug: 'Check server logs for details'
      });
    }
  }
};

export default passwordController;