import { google } from 'googleapis'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js'

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
   
      const { tokens } = await oauth2Client.getToken(code)
      oauth2Client.setCredentials(tokens)

      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
      const { data } = await oauth2.userinfo.get()

      let user = await prisma.user.findUnique({
        where: { email: data.email }
      })

      if (!user) {

        user = await prisma.user.create({
          data: {
            email: data.email,
            firstName: data.given_name,
            lastName: data.family_name,
            emailVerifiedAt: new Date(), 
            password: null 
          }
        })
      }

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

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt,
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip
        }
      })

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

export default oauthService   