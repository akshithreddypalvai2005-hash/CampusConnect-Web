import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoDummyKeyForSreyasCampus2026',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'sreyas-lost-found.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'sreyas-lost-found',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'sreyas-lost-found.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef123456',
};

// Initialize Firebase safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Prompt account selection every time
googleProvider.setCustomParameters({
  prompt: 'select_account',
  hd: 'sreyas.ac.in', // Google hosted domain hint to pre-select or recommend sreyas.ac.in
});

export const isFirebaseConfigured = () => {
  return (
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_API_KEY !== 'AIzaSyDemoDummyKeyForSreyasCampus2026'
  );
};

export { app, auth, googleProvider };
