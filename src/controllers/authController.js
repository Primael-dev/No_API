import { authService } from '../services/authService.js';

export const authController = {
  
  async register(req, res) {
    try {
      const { email, password, firstName, lastName } = req.body;
      const result = await authService.registerUser(email, password, firstName, lastName);
      
      res.status(201).json({
        userId: result.userId,
        email: result.email,
        message: 'User registered successfully'
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const ip = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'Unknown';
      
      const result = await authService.loginUser(email, password, ip, userAgent);
      
      res.status(200).json({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user
      });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  },

  async logout(req, res) {
    try {
      const userId = req.user.userId;
      const token = req.headers.authorization.split(' ')[1];
      
      await authService.logoutUser(userId, token);
      
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};