# 🔐 Répartition des Tâches - Auth API

## 👤 Regina: Authentification de Base

**Endpoints:**
- `POST /api/auth/register` - Inscrire un utilisateur
- `POST /api/auth/login` - Se connecter
- `POST /api/auth/logout` - Se déconnecter (protégé)

**Comment s'y prendre:**

1. **Créer `src/controllers/authController.js`**
   - Créer un objet `authController` avec 3 fonctions: `register`, `login`, `logout`
   - Chaque fonction valide les inputs et appelle le service
   - Retourner les réponses avec les bons statusCode

2. **Créer `src/services/authService.js`**
   - Créer un objet `authService` avec 3 fonctions correspondantes
   - C'est là qu'on cherche/crée l'utilisateur en BD avec Prisma
   - C'est là qu'on hash le password, génère les tokens, enregistre en LoginHistory
   - Lancer les erreurs si ça échoue

3. **Créer `src/routes/auth.js`**
   - Importer le router d'Express
   - Ajouter 3 routes POST qui appellent les controllers
   - Logout doit avoir `authMiddleware` pour vérifier le token
   - Exporter la fonction `registerAuthRoutes(app)` qui enregistre au démarrage

---

## 🔄 Floriane: JWT et Sessions

**Endpoints:**
- `POST /api/auth/refresh` - Rafraîchir le token
- `GET /api/auth/sessions` - Lister les sessions (protégé)
- `DELETE /api/auth/sessions/:id` - Révoquer une session (protégé)
- `DELETE /api/auth/sessions/all-others` - Révoquer les autres (protégé)

**Comment s'y prendre:**

1. **Créer `src/controllers/sessionController.js`**
   - 4 fonctions dans l'objet `sessionController`
   - Valider les inputs (refreshToken, sessionId, etc.)
   - Appeler le service et retourner les résultats

2. **Créer `src/services/sessionService.js`**
   - `refreshToken`: vérifier que le refreshToken existe en BD, pas révoqué, pas expiré
   - `getSessions`: chercher tous les RefreshTokens de l'utilisateur
   - `revokeSession`: mettre à jour un token avec revokedAt = maintenant
   - `revokeAllOtherSessions`: révoquer tous les autres sauf le token actuel

3. **Créer `src/routes/sessions.js`**
   - POST `/refresh` sans protection (n'importe qui peut)
   - GET `/sessions` avec `authMiddleware` (utilisateur connecté)
   - DELETE `/sessions/:id` avec `authMiddleware`
   - DELETE `/sessions/all-others` avec `authMiddleware`

---

## ✉️ Primael: Email & 2FA

**Endpoints:**
- `POST /api/auth/send-verification-email` - Envoyer email
- `POST /api/auth/verify-email` - Vérifier avec token
- `POST /api/auth/2fa/enable` - Générer secret TOTP + QR code (protégé)
- `POST /api/auth/2fa/confirm` - Confirmer 2FA (protégé)
- `POST /api/auth/2fa/disable` - Désactiver 2FA (protégé)
- `POST /api/auth/2fa/verify` - Vérifier code TOTP

**Comment s'y prendre:**

1. **Créer `src/controllers/emailController.js` et `twoFactorController.js`**
   - emailController: 2 fonctions (sendVerificationEmail, verifyEmail)
   - twoFactorController: 4 fonctions (enable, confirm, disable, verify)
   - Valider les inputs avec Zod
   - Appeler les services correspondants

2. **Créer `src/services/emailService.js` et `twoFactorService.js`**
   - emailService: générer tokens, vérifier expiration, envoyer emails avec sendEmail()
   - twoFactorService: générer secret TOTP avec speakeasy, générer QR code, vérifier codes

3. **Créer `src/routes/email.js` et `twoFactor.js`**
   - email: 2 routes POST (sans protection)
   - 2FA: 4 routes POST (enable/confirm/disable avec authMiddleware, verify sans)

---

## 🔐 Kevin: OAuth & Password

**Endpoints:**
- `POST /api/auth/forgot-password` - Envoyer email reset
- `POST /api/auth/reset-password` - Réinitialiser password
- `POST /api/auth/change-password` - Changer password (protégé)
- `GET /api/auth/oauth/google` - Redirection Google OAuth
- `GET /api/auth/oauth/google/callback` - Callback Google

**Comment s'y prendre:**

1. **Créer `src/controllers/oauthController.js` et `passwordController.js`**
   - passwordController: 3 fonctions
   - oauthController: 2 fonctions
   - Valider les inputs et appeler les services

2. **Créer `src/services/oauthService.js` et `passwordService.js`**
   - passwordService: générer tokens, hash password, vérifier expiration, envoyer emails
   - oauthService: faire appels HTTP à Google, créer/chercher utilisateur, créer OAuthAccount

3. **Créer `src/routes/oauth.js` et `password.js`**
   - password: 3 routes POST (change-password avec authMiddleware)
   - oauth: 2 routes GET (google et google/callback)

---

## 👥 Prunelle: Profil & Sécurité

**Endpoints:**
- `GET /api/auth/profile` - Récupérer profil (protégé)
- `PATCH /api/auth/profile` - Modifier profil (protégé)
- `DELETE /api/auth/account` - Supprimer compte (protégé)
- `GET /api/auth/login-history` - Historique connexions (protégé)

**Comment s'y prendre:**

1. **Créer `src/controllers/profileController.js`**
   - 4 fonctions (getProfile, updateProfile, deleteAccount, getLoginHistory)
   - Valider les inputs, appeler le service

2. **Créer `src/services/profileService.js`**
   - Chercher/mettre à jour l'utilisateur en BD
   - Soft delete: mettre disabledAt au lieu de supprimer
   - Retourner les données formatées (emailVerified, twoFactorEnabled, etc.)

3. **Créer `src/routes/profile.js`**
   - Toutes les 4 routes avec `authMiddleware` (tout est protégé)

---

## 📝 Convention

- **Nommage:** camelCase
- **Validation:** Zod pour tous les inputs
- **BD:** Prisma déjà configuré
- **Erreurs:** statusCode + message cohérent
- **Test:** Postman/Thunder Client

---

**🚀 Vous êtes prêts!**