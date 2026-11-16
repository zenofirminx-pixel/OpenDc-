
# OpenDC — frontend React + Vite

Interface React 18 + Vite conservant le design et les pages OpenDC existantes. L'authentification est maintenant gérée par l'API Node/Express ; le navigateur n'utilise plus Firebase Authentication ni le SDK Firestore.

## Développement

```bash
npm install
cp .env.example .env
npm run dev
```

Configurer `OPEN_DC_API_BASE_URL` vers l'API OpenDC et `OPEN_DC_API_ENABLED=true`. En local, le frontend tourne par défaut sur `http://localhost:5173` et le backend sur `http://localhost:3000`.

## Sécurité navigateur

Les appels API envoient les cookies avec `credentials: include`. Les opérations d'écriture récupèrent un jeton CSRF puis l'envoient dans `X-CSRF-Token`. Le cookie de session est HttpOnly et n'est pas lisible par le JavaScript.

Le frontend ne contient aucun secret Firebase Admin, aucune clé SMTP et aucun mot de passe stocké côté client. Le compte Firebase Admin et Firestore sont utilisés uniquement par le backend.

## Pages conservées

Connexion/inscription, tableau de bord, projets, services, assistant, profil, actualités et paramètres. Les opérations d'authentification proposées : inscription, connexion, déconnexion, vérification e-mail, mot de passe oublié/réinitialisation et changement de mot de passe.

Pour la configuration serveur et le déploiement, consulter `../Backend/README.md`.
