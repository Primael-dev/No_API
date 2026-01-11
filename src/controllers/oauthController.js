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

    // If a frontend URL is configured, redirect there with tokens in query string
    if (process.env.FRONTEND_URL) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/oauth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`
      );
    }

    // Otherwise, redirect to a server-side success page that shows a friendly message
    // The route is mounted under /api/auth (see server.js), so the full path will be /api/auth/google/success
    return res.redirect(`/api/auth/google/success?accessToken=${encodeURIComponent(tokens.accessToken)}&refreshToken=${encodeURIComponent(tokens.refreshToken)}`);
  } catch (err) {
    next(err);
  }
};

export const oauthSuccess = (req, res) => {
  const { accessToken, refreshToken } = req.query;

  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Connexion réussie</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
        .card { display: inline-block; padding: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .success { color: #2b8a3e; font-size: 20px; margin-bottom: 12px }
        .btn { display:inline-block; margin-top: 12px; padding:8px 14px; background:#4285f4; color:#fff; text-decoration:none; border-radius:4px }
        .tokens { margin-top:12px; font-size:12px; color:#444; word-break:break-all }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="success">✅ Connexion réussie</div>
        <div>Vous pouvez fermer cette fenêtre.</div>
        <a class="btn" href="#" onclick="window.close();return false;">Fermer</a>
        <div class="tokens" id="tokens" style="display:none">
          <pre>Access Token: ${accessToken || 'N/A'}\nRefresh Token: ${refreshToken || 'N/A'}</pre>
        </div>
      </div>

      <script>
        // If this page was opened as a popup, send tokens to the opener and close
        (function () {
          try {
            const tokens = { accessToken: '${accessToken || ''}', refreshToken: '${refreshToken || ''}' };
            if (window.opener && !window.opener.closed) {
              window.opener.postMessage({ type: 'oauth:success', payload: tokens }, '*');
              setTimeout(() => window.close(), 700);
            } else {
              // Show tokens for manual copy if no opener
              document.getElementById('tokens').style.display = 'block';
            }
          } catch (e) {
            console.error(e);
          }
        })();
      </script>
    </body>
  </html>`;

  res.status(200).send(html);
};
