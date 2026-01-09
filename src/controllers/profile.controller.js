import { profileService } from '../services/profile.service.js';

export const profileController = {
  async getProfile(req, res, next) {
    try {
      const user = await profileService.getProfile(req.user.userId);
      if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
      res.json(user);
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const { firstName, lastName } = req.body;
      const updatedUser = await profileService.updateProfile(req.user.userId, firstName, lastName);
      res.json(updatedUser);
    } catch (err) {
      next(err);
    }
  },

  async deleteAccount(req, res, next) {
    try {
      const deletedUser = await profileService.deleteAccount(req.user.userId);
      res.json({ message: 'Compte désactivé avec succès', user: deletedUser });
    } catch (err) {
      next(err);
    }
  },

  async getLoginHistory(req, res, next) {
    try {
      const history = await profileService.getLoginHistory(req.user.userId);
      res.json(history);
    } catch (err) {
      next(err);
    }
  }
};