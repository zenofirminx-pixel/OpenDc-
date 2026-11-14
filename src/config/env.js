export const config = {
  apiBaseUrl: (
    import.meta.env.OPEN_DC_API_BASE_URL ||
    'https://backend-two-teal-20.vercel.app'
  ).replace(/\/$/, ''),

  apiEnabled: import.meta.env.OPEN_DC_API_ENABLED === 'true',

  firebase: {
    apiKey: import.meta.env.OPEN_DC_FIREBASE_WEB_CONFIG_KEY,
    authDomain: import.meta.env.OPEN_DC_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.OPEN_DC_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.OPEN_DC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.OPEN_DC_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.OPEN_DC_FIREBASE_APP_ID
  }
};

export const firebaseConfigured = Object.values(config.firebase).every(
  value => typeof value === 'string' && value.trim() !== ''
);
