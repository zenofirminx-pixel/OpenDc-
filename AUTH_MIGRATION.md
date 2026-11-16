# OpenDC — migration de l’authentification côté serveur

## État de cette livraison

Le frontend n’utilise plus Firebase Authentication. Les écrans de connexion, d’inscription, de récupération du mot de passe, le contexte de session, la déconnexion et la mise à jour du profil passent désormais par l’API OpenDC avec `credentials: 'include'`.

**Cette livraison frontend ne rend pas encore l’inscription/connexion opérationnelle à elle seule.** Le backend actuel doit implémenter les routes ci-dessous avant le déploiement en production. Tant que ces routes ne sont pas disponibles, l’interface affichera une erreur réseau/API au lieu de tenter Firebase Auth.

## Contrat API attendu

Toutes les réponses JSON doivent avoir `Content-Type: application/json`.

- `POST /api/auth/register` — JSON `{ firstName, lastName, birthDate, gender, email, password }`; crée le compte, crée la session et renvoie `{ user, profile }`.
- `POST /api/auth/login` — JSON `{ email, password }`; crée la session et renvoie `{ user, profile }`.
- `POST /api/auth/logout` — invalide la session côté serveur, expire le cookie.
- `GET /api/auth/me` — renvoie `{ user, profile }` si la session est valide; sinon HTTP 401.
- `POST /api/auth/forgot-password` — JSON `{ email }`; réponse neutre qui ne révèle pas si le compte existe.
- `POST /api/auth/reset-password` — JSON `{ token, newPassword }`.
- `POST /api/auth/change-password` — JSON `{ currentPassword, newPassword }`.
- `GET /api/profile` — renvoie `{ profile }`.
- `PATCH /api/profile` — valide et met à jour les champs autorisés; renvoie `{ profile }`.

Les réponses de succès d’inscription/connexion doivent contenir au minimum `user: { uid, email, firstName, lastName }` (ou un identifiant `id` stable), et éventuellement `profile`.

Les erreurs peuvent renvoyer un code stable : `EMAIL_EXISTS`, `INVALID_CREDENTIALS`, `VALIDATION_ERROR`, `RATE_LIMITED`.

## Exigences de sécurité backend

1. Firebase Admin SDK uniquement côté serveur, avec compte de service stocké dans les variables privées du backend. Ne jamais exposer la clé privée Admin au frontend, à Vite ou à Git.
2. Stocker les mots de passe avec Argon2id (ou bcrypt avec paramètres adaptés), jamais en clair et jamais dans Firestore en clair.
3. Utiliser des sessions aléatoires opaques, stockées côté serveur (Firestore ou base dédiée), et un cookie `HttpOnly; Secure; SameSite` avec expiration raisonnable. Stocker uniquement un hash du jeton de session en base.
4. Vérifier et renouveler/invalider les sessions côté serveur; ajouter limitation de débit aux routes de connexion, inscription et récupération.
5. Ajouter protection CSRF aux requêtes qui modifient les données. Valider `Origin` et configurer CORS avec une origine frontend explicite et `credentials: true`.
6. Ne jamais renvoyer les hashes de mot de passe, jetons de réinitialisation ou secrets dans les réponses/logs.
7. La clé Firebase Web n’est plus utilisée pour authentifier les comptes. Les autres fonctions frontend qui lisent directement Firestore/Storage restent à migrer vers l’API avant de pouvoir fonctionner avec des règles Firebase strictes sans utilisateur Firebase connecté.

## Cookies et hébergement

Le frontend est configuré pour envoyer les cookies avec `credentials: 'include'`. Idéalement, exposer l’API sous le même domaine via un proxy/rewrite Vercel. Si l’API reste sur un autre domaine, le backend doit configurer CORS pour l’origine exacte du frontend, `Access-Control-Allow-Credentials: true` et un cookie `SameSite=None; Secure`; les restrictions de cookies tiers des navigateurs peuvent néanmoins bloquer ce montage.

## Variables frontend

- `OPEN_DC_API_BASE_URL` : URL de l’API OpenDC.
- `OPEN_DC_FIREBASE_*` : encore utilisées par les fonctions de contenu Firestore/Storage existantes, mais plus pour Firebase Authentication.
