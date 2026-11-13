# OpenDC — plateforme Web v1.0

Application React + Vite responsive, avec Firebase Authentication, Firestore et Storage côté client, et une couche API prête à communiquer avec le backend OpenDC indépendant.

## 1. Prérequis
- Node.js 20 ou plus récent
- Un projet Firebase créé dans la console Firebase
- Le dépôt backend OpenDC déployé séparément lorsqu'il sera prêt

## 2. Installation
```bash
npm install
cp .env.example .env
npm run dev
```
Puis ouvrir l'URL indiquée par Vite.

## 3. Configuration Firebase
Dans Firebase Console :
1. Créer un projet et enregistrer une application Web.
2. Activer Authentication > Email/Password.
3. Créer une base Cloud Firestore.
4. Activer Firebase Storage.
5. Copier les paramètres de l'application Web dans `.env`.

Les mots de passe sont gérés exclusivement par Firebase Authentication. Le document `users/{uid}` ne contient que les données de profil. Ne jamais ajouter de mot de passe dans Firestore.

### Règles Firestore minimales (à adapter avant production)
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/conversations/{conversationId}/messages/{messageId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /news/{id} { allow read: if true; allow write: if false; }
    match /projects/{id} { allow read: if true; allow write: if false; }
  }
}
```

### Règles Storage minimales
```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

## 4. Backend OpenDC
L'URL est centralisée dans `VITE_API_BASE_URL`. Les appels sont préparés pour :
- `POST /api/assistant/chat`
- `GET/PATCH /api/profile`
- `GET /api/projects`
- `GET /api/news`
- `GET /api/services`

Le frontend envoie le Firebase ID token dans `Authorization: Bearer <token>`. Le backend devra vérifier ce token avec Firebase Admin SDK avant de traiter toute requête privée. Il devra aussi appliquer ses propres validations, autorisations, limites de débit et contrôles de données.

Le backend n'est pas encore disponible : gardez `VITE_API_ENABLED=false` jusqu'à son déploiement. L'interface affiche alors un message explicite au lieu de prétendre que les endpoints fonctionnent. Le nom de domaine fourni dans `.env.example` est une URL prévue, pas la preuve que le service existe.

## 5. Structure
```
src/
  app/              routes et gardes d'authentification
  components/       navigation, cartes, assistant, galerie
  config/           configuration centralisée
  contexts/         session et langue
  firebase/         initialisation Firebase
  i18n/             dictionnaires FR/EN/LN/SW
  pages/            pages de l'application
  services/         appels API, profil et actualités
  styles/           styles globaux
  utils/            validations
public/assets/      logo et visuels SVG locaux
```

## 6. Lancement et déploiement
```bash
npm run build
```
Publier le contenu de `dist/` sur Vercel, Netlify ou un hébergement statique. Ajouter les variables `VITE_*` dans les paramètres de build de l'hébergeur. Les variables Vite sont publiques : n'y placer aucune clé OpenAI, clé privée Firebase Admin ou secret serveur.

## 7. Points à compléter avant production
- Remplacer les valeurs Firebase de démonstration par la configuration réelle.
- Déployer le backend et activer `VITE_API_ENABLED=true` uniquement après tests des routes.
- Ajouter les règles Firebase définitives et configurer les domaines autorisés dans Firebase Auth.
- Créer les contenus officiels réels des actualités et projets dans Firestore.
- Remplacer les visuels SVG illustratifs de la galerie par les 10 images IA finales si vous souhaitez des portraits photoréalistes. Les dix visuels fournis ici sont des illustrations originales locales, pas des photographies.
- Configurer une politique de confidentialité et les conditions d'utilisation avant ouverture publique.
