import passwordService from '../services/passwordService.js';

export const forgotPassword = async (req, res) => {
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
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token and new password are required'
      });
    }
    
    await passwordService.resetPassword(token, newPassword);
    
    res.json({
      success: true,
      message: 'Password has been reset successfully'
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id || req.body.userId; // Temporaire
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Both current and new password are required'
      });
    }
    
    await passwordService.changePassword(userId, currentPassword, newPassword);
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Export par défaut
export default {
  forgotPassword,
  resetPassword,
  changePassword
};