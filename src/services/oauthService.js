    const { google } = require('googleapis')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const prisma = require('../lib/prisma')

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BACKEND_URL}/api/auth/oauth/google/callback`
)

const oauthService = {
  getGoogleAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ]

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    })
  },

  async handleGoogleCallback(code) {
    try {
      // 1. Échanger le code contre un token
      const { tokens } = await oauth2Client.getToken(code)
      oauth2Client.setCredentials(tokens)

      // 2. Récupérer les infos utilisateur
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
      const { data } = await oauth2.userinfo.get()

      // 3. Chercher ou créer l'utilisateur
      let user = await prisma.user.findUnique({
        where: { email: data.email }
      })

      if (!user) {
        // Créer un nouvel utilisateur
        user = await prisma.user.create({
          data: {
            email: data.email,
            firstName: data.given_name,
            lastName: data.family_name,
            emailVerifiedAt: new Date(), // Google vérifie l'email
            password: null // Pas de password pour OAuth
          }
        })
      }

      // 4. Lier le compte OAuth
      const oauthAccount = await prisma.oAuthAccount.upsert({
        where: {
          provider_providerId: {
            provider: 'google',
            providerId: data.id
          }
        },
        update: {},
        create: {
          provider: 'google',
          providerId: data.id,
          userId: user.id
        }
      })

      // 5. Générer les tokens JWT
      const accessToken = jwt.sign(
        { 
          id: user.id, 
          email: user.email 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
      )

      const refreshToken = crypto.randomBytes(40).toString('hex')
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours

      // 6. Sauvegarder le refresh token
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt,
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip
        }
      })

      // 7. Enregistrer dans l'historique
      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          success: true
        }
      })

      return {
        user,
        accessToken,
        refreshToken
      }

    } catch (error) {
      console.error('OAuth error:', error)
      throw new Error('Failed to authenticate with Google')
    }
  }
}

module.exports = oauthService   