const profileService = require('../services/profile.service');

exports.getProfile = async (req, res) => {
  try {
    const user = await profileService.getProfile(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const updatedUser = await profileService.updateProfile(req.user.id, firstName, lastName);
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const deletedUser = await profileService.deleteAccount(req.user.id);
    res.json({ message: 'Compte désactivé avec succès', user: deletedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getLoginHistory = async (req, res) => {
  try {
    const history = await profileService.getLoginHistory(req.user.id);
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};