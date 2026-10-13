import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyD0ImqlRAMhEcCYXU8Rkz5w7AwXUCSgwGo',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'sreyas-campusconnect.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'sreyas-campusconnect',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'sreyas-campusconnect.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1026460032680',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1026460032680:web:863ed3c6e21c5db7b92c9d',
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
  return true;
};

export { app, auth, googleProvider };
