import { sessionService } from '../services/sessionService.js';

export const sessionController = {
  
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      const result = await sessionService.refreshAccessToken(refreshToken);
      
      res.status(200).json({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getSessions(req, res) {
    try {
      const userId = req.user.userId;
      const sessions = await sessionService.getUserSessions(userId);
      
      res.status(200).json({ sessions });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async revokeSession(req, res) {
    try {
      const userId = req.user.userId;
      const sessionId = req.params.id;
      await sessionService.revokeSessionById(userId, sessionId);
      
      res.status(200).json({ message: 'Session revoked' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async revokeAllOtherSessions(req, res) {
    try {
      const userId = req.user.userId;
      await sessionService.revokeAllOtherSessions(userId);
      
      res.status(200).json({ message: 'All other sessions revoked' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};