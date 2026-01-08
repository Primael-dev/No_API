const jwt = require('jsonwebtoken')
const prisma = require('../lib/prisma')

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    
    // Vérifier si le token est blacklisté
    const blacklisted = await prisma.blacklistedAccessToken.findUnique({
      where: { token }
    })

    if (blacklisted) {
      return res.status(401).json({ error: 'Token has been revoked' })
    }

    // Vérifier le JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Vérifier que l'utilisateur existe et n'est pas désactivé
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.id,
        disabledAt: null 
      }
    })

    if (!user) {
      return res.status(401).json({ error: 'User not found or account disabled' })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' })
    }
    res.status(500).json({ error: 'Authentication failed' })
  }
}

module.exports = authMiddleware