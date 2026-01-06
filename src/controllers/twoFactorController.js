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
      res.status(200).json({ message: '2FA confirm - TODO' });
    } catch (error) {
      next(error);
    }
  },

  async disable(req, res, next) {
    try {
      res.status(200).json({ message: '2FA disable - TODO' });
    } catch (error) {
      next(error);
    }
  },

  async verify(req, res, next) {
    try {
      res.status(200).json({ message: '2FA verify - TODO' });
    } catch (error) {
      next(error);
    }
  }
};