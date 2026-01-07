import { twoFactorService } from '../services/twoFactorService.js';

export const twoFactorController = {
  async enable(req, res, next) {
    try {
      const userId = req.user.userId;

      const result = await twoFactorService.enable(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async confirm(req, res, next) {
    try {
      const userId = req.user.userId;
      const { code, secret } = req.body;

      if (!code || !secret) {
        return res.status(400).json({ error: 'Code and secret are required' });
      }

      const result = await twoFactorService.confirm(userId, code, secret);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async disable(req, res, next) {
    try {
      const userId = req.user.userId;
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ error: 'Code is required' });
      }

      const result = await twoFactorService.disable(userId, code);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async verify(req, res, next) {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({ error: 'Email and code are required' });
      }

      const result = await twoFactorService.verify(email, code);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
};