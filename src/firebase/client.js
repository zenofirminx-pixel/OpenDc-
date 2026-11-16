// Firebase client SDK is retained only for public/read-only content features.
// Account authentication is exclusively handled by the OpenDC server API.
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { config, firebaseConfigured } from '../config/env';

const app = firebaseConfigured
  ? (getApps().length ? getApps()[0] : initializeApp(config.firebase))
  : null;

export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;
