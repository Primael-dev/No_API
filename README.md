# API d'authentification — Mot de passe & OAuth 🔐

Une API légère d'authentification (réinitialisation de mot de passe, changement de mot de passe, OAuth Google) avec des endpoints pratiques pour les développeurs.

---

## 🚀 Démarrage rapide

1. Installer les dépendances

```bash
npm install
```

2. Créer un fichier d'environnement local

- Copier `.env.example` → `.env` et remplir les secrets (JWT, SMTP, clés OAuth).
- **Ne pas** committer vos vraies valeurs de secrets.

3. Lancer en développement

```bash
npm run dev
```

Le serveur écoute par défaut sur `http://localhost:3000`.

---

## 🔧 Endpoints utiles

- Health: GET `/`
- Mot de passe oublié: POST `/api/auth/password/forgot-password`
  - Body: `{ "email": "user@example.com" }`
- Réinitialiser le mot de passe: POST `/api/auth/password/reset-password`
  - Body: `{ "token": "TOKEN", "newPassword": "NewPass123!" }`
- Changer le mot de passe (authentifié): POST `/api/auth/password/change-password`
  - Header: `Authorization: Bearer <JWT>`
  - Body: `{ "currentPassword": "old", "newPassword": "new" }`
- OAuth (Google): GET `/api/auth/oauth/google` et callback `/api/auth/oauth/google/callback`

> Astuce : en développement, la page `/test-oauth` (si activée) propose des liens rapides pour tester Google OAuth.

---

## 📁 Collection Postman

Vous pouvez importer la collection Postman utilisée pour tester les endpoints :

disponible dans le dossier Collection en fichier json

## 🧪 Tests & débogage

- Générer un JWT de test (dev uniquement) :

```bash
node -e "const jwt=require('jsonwebtoken');console.log(jwt.sign({id:'test-user-id'},process.env.JWT_SECRET || 'dev_secret',{expiresIn:'1h'}))"
```

- Les tokens de réinitialisation apparaissent dans les logs du serveur en mode dev.

---

## ⚠️ Remarques

- Gardez les secrets hors du dépôt. Utilisez `.env` pour les valeurs locales et les secrets CI pour les pipelines.
- Appliquer les migrations Prisma après modification du schéma :

```bash
npx prisma migrate dev
```
