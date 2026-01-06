import { emailService } from '../services/emailService.js';

export const emailController = {
  async verifyEmail(req, res, next) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: 'Token is required' });
      }

      const result = await emailService.verifyEmail(token);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async sendVerificationEmail(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const result = await emailService.sendVerificationEmail(email);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
};