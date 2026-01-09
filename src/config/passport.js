// src/config/passport.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from '../lib/prisma.js';

// Configuration de la stratégie Google
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/auth/oauth/google/callback`,
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google OAuth profile:', profile.id);
        
        // 1. Chercher un compte OAuth existant
        const existingOAuth = await prisma.oAuthAccount.findUnique({
          where: {
            provider_providerId: {
              provider: 'google',
              providerId: profile.id
            }
          },
          include: { user: true }
        });

        if (existingOAuth) {
          return done(null, existingOAuth.user);
        }

        // 2. Vérifier si l'email existe déjà
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email provided by Google'));
        }

        let user = await prisma.user.findUnique({
          where: { email }
        });

        if (!user) {
          // 3. Créer un nouvel utilisateur
          user = await prisma.user.create({
            data: {
              email,
              firstName: profile.name?.givenName || '',
              lastName: profile.name?.familyName || '',
              emailVerifiedAt: new Date()
            }
          });
        }

        // 4. Lier le compte OAuth
        await prisma.oAuthAccount.create({
          data: {
            provider: 'google',
            providerId: profile.id,
            userId: user.id
          }
        });

        done(null, user);
      } catch (error) {
        console.error('Passport Google Strategy error:', error);
        done(error, null);
      }
    }
  )
);

// Sérialisation de l'utilisateur
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Désérialisation de l'utilisateur
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerifiedAt: true
      }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;