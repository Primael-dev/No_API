  import prisma from '../utils/prisma.js';
import jwt from "jsonwebtoken";

/**
 * URL Google OAuth
 */
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export const getGoogleAuthURL = () => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_CALLBACK_URL,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent"
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
};

/**
 * Callback Google OAuth
 */
export const handleGoogleCallback = async (code, meta = {}) => {
  // 1. Exchange code -> Google token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
      grant_type: "authorization_code"
    })
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error("Google token exchange failed");
  }

  // 2. Fetch Google user
  const userRes = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    }
  );

  const googleUser = await userRes.json();

  // 3. Find or create user
  let user = await prisma.user.findUnique({
    where: { email: googleUser.email }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: googleUser.email,
        emailVerifiedAt: new Date()
      }
    });
  }

  // 4. Link OAuth account
  await prisma.oAuthAccount.upsert({
    where: {
      provider_providerId: {
        provider: "google",
        providerId: googleUser.sub
      }
    },
    update: {},
    create: {
      provider: "google",
      providerId: googleUser.sub,
      userId: user.id
    }
  });

  // 5. Generate JWT
  const accessToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  // 6. Store refresh token (sessions)
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      userAgent: meta.userAgent,
      ipAddress: meta.ip,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  return { accessToken, refreshToken };
};
