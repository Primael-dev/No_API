import { sessionService } from '../services/sessionService.js';

export const sessionController = {
  // Rafraîchir le token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Le refresh token est requis'
        });
      }

      const result = await sessionService.refreshAccessToken(refreshToken);

      res.status(200).json({
        success: true,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Lister les sessions
  async getSessions(req, res) {
    try {
      const userId = req.user.userId;
      const sessions = await sessionService.getUserSessions(userId);

      res.status(200).json({
        success: true,
        sessions
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Révoquer une session
  async revokeSession(req, res) {
    try {
      const userId = req.user.userId;
      const sessionId = req.params.id;

      await sessionService.revokeSessionById(userId, sessionId);

      res.status(200).json({
        success: true,
        message: 'Session révoquée'
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Révoquer toutes les autres sessions
  async revokeAllOtherSessions(req, res) {
    try {
      const userId = req.user.userId;
      await sessionService.revokeAllOtherSessions(userId);

      res.status(200).json({
        success: true,
        message: 'Toutes les autres sessions ont été révoquées'
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  }
};