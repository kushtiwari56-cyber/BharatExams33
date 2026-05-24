import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import defaultAppletConfig from '../../firebase-applet-config.json';

const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || defaultAppletConfig.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || defaultAppletConfig.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || defaultAppletConfig.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || defaultAppletConfig.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultAppletConfig.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || defaultAppletConfig.appId,
  measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || defaultAppletConfig.measurementId || ""
};

const databaseId = metaEnv.VITE_FIREBASE_FIRESTORE_DATABASE_ID || defaultAppletConfig.firestoreDatabaseId || "(default)";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, databaseId);
export const auth = getAuth(app);
