import {
  getGoogleAuthURL,
  handleGoogleCallback
} from "../services/oauthService.js";

export const googleRedirect = (req, res) => {
  res.redirect(getGoogleAuthURL());
};

export const googleCallback = async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) throw new Error("Missing code");

    const tokens = await handleGoogleCallback(code, {
      ip: req.ip,
      userAgent: req.headers["user-agent"]
    });

    res.redirect(
      `${process.env.FRONTEND_URL}/oauth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`
    );
  } catch (err) {
    next(err);
  }
};
