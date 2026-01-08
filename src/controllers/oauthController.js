const oauthService = require('../services/oauthService')
const jwt = require('jsonwebtoken')

const oauthController = {
  async redirectToGoogle(req, res) {
    try {
      const authUrl = oauthService.getGoogleAuthUrl()
      res.redirect(authUrl)
    } catch (error) {
      res.status(500).json({ error: 'Failed to initiate OAuth flow' })
    }
  },

  async handleGoogleCallback(req, res) {
    try {
      const { code } = req.query
      const { user, accessToken, refreshToken } = await oauthService.handleGoogleCallback(code)
      
      // Rediriger vers le frontend avec les tokens
      res.redirect(
        `${process.env.FRONTEND_URL}/oauth/callback?` +
        `access_token=${accessToken}&` +
        `refresh_token=${refreshToken}&` +
        `user_id=${user.id}`
      )
    } catch (error) {
      console.error('OAuth callback error:', error)
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`)
    }
  }
}

module.exports = oauthController