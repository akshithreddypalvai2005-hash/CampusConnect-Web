import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../config/firebase';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  const checkAuth = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setUnreadCount(res.data.unreadNotificationsCount || 0);
      }
    } catch (err) {
      setUser(null);
      setUnreadCount(0);
      localStorage.removeItem('cc_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Client-side helper to check <rollnumber>@sreyas.ac.in format
  const validateSreyasEmailClient = (email) => {
    if (!email) return false;
    const lower = email.trim().toLowerCase();
    if (!lower.endsWith('@sreyas.ac.in')) return false;
    const prefix = lower.slice(0, -'@sreyas.ac.in'.length);
    if (prefix === 'admin' || prefix === 'lostandfound' || prefix === 'principal') return true;
    return /^[a-z0-9]+$/.test(prefix);
  };

  // Google Sign-In with Firebase Auth
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const userEmail = firebaseUser.email;

      // 1. STRICT VALIDATION: only <rollnumber>@sreyas.ac.in
      if (!validateSreyasEmailClient(userEmail)) {
        await signOut(auth);
        const errMsg = `Access Denied: Only Sreyas college emails matching <rollnumber>@sreyas.ac.in are allowed. You signed in with: ${userEmail}`;
        toast.error(errMsg, 8000);
        return { success: false, error: 'INVALID_DOMAIN', message: errMsg };
      }

      // 2. Token extraction & backend verification
      const idToken = await firebaseUser.getIdToken();
      const res = await api.post('/auth/google-login', {
        email: userEmail,
        name: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        idToken,
      });

      if (res.data.success) {
        if (res.data.token) {
          localStorage.setItem('cc_token', res.data.token);
        }
        setUser(res.data.user);
        toast.success(`Welcome, ${res.data.user.name} (${res.data.user.studentId})!`);
        checkAuth();
        return { success: true };
      }
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        toast.info('Google sign-in popup closed.');
      } else if (err.code === 'auth/api-key-not-valid' || err.code === 'auth/invalid-api-key') {
        toast.error('Firebase Web API key not configured yet in client/.env. Check instructions or use the Sreyas Roll Number tester.');
        return { success: false, error: 'FIREBASE_NOT_CONFIGURED', err };
      } else if (err.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
        toast.error(`Domain "${domain}" is not authorized in Firebase Console. Add it under Firebase Console > Authentication > Settings > Authorized Domains.`);
        return { success: false, error: 'UNAUTHORIZED_DOMAIN', err };
      } else {
        toast.error(err.message || 'Google sign-in failed.');
      }
      return { success: false, error: err };
    }
  };

  // Direct Sreyas Roll Number Login (Works directly with backend verification)
  const loginWithSreyasRollNumber = async (rollNumber, studentName) => {
    try {
      const cleanRoll = rollNumber.trim().toLowerCase();
      const email = `${cleanRoll}@sreyas.ac.in`;

      if (!validateSreyasEmailClient(email)) {
        toast.error('Invalid roll number format. Must be alphanumeric (e.g. 21ve1a0521).');
        return { success: false };
      }

      const res = await api.post('/auth/google-login', {
        email,
        name: studentName ? studentName.trim() : `Student ${cleanRoll.toUpperCase()}`,
      });

      if (res.data.success) {
        if (res.data.token) {
          localStorage.setItem('cc_token', res.data.token);
        }
        setUser(res.data.user);
        toast.success(`Successfully logged in as Sreyas Student: ${cleanRoll.toUpperCase()} (${email})`);
        checkAuth();
        return { success: true };
      }
    } catch (err) {
      toast.error(err.message || 'Sreyas login failed.');
      return { success: false, error: err };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        if (res.data.token) {
          localStorage.setItem('cc_token', res.data.token);
        }
        setUser(res.data.user);
        toast.success(res.data.message || 'Login successful!');
        checkAuth();
        return { success: true };
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check credentials.');
      return { success: false, error: err };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.success) {
        if (res.data.token) {
          localStorage.setItem('cc_token', res.data.token);
        }
        setUser(res.data.user);
        toast.success(res.data.message || 'Registration successful!');
        checkAuth();
        return { success: true };
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
      return { success: false, error: err };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth).catch(() => {});
      await api.post('/auth/logout').catch(() => {});
    } catch (err) {
      // Clear state regardless
    } finally {
      localStorage.removeItem('cc_token');
      setUser(null);
      setUnreadCount(0);
      toast.info('You have been logged out.');
    }
  };

  const refreshUser = () => {
    return checkAuth();
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    unreadCount,
    setUnreadCount,
    login,
    register,
    loginWithGoogle,
    loginWithSreyasRollNumber,
    logout,
    refreshUser,
    isFirebaseConfigured,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
