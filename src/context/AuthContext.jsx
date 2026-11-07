import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mirac_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('mirac_token'));
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      if (token) {
        try {
          const res = await api.auth.me();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('mirac_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session verification failed, logging out', err);
          logout();
        }
      }
      setInitialLoading(false);
    }
    checkAuth();
  }, [token]);

  const loginWithPassword = async (username, password) => {
    setLoading(true);
    try {
      const res = await api.auth.login(username, password);
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('mirac_token', res.token);
        localStorage.setItem('mirac_user', JSON.stringify(res.user));
        return { success: true, message: res.message, user: res.user };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Network error during login' };
    } finally {
      setLoading(false);
    }
  };

  const loginWithFaceId = async (payload) => {
    setLoading(true);
    try {
      const res = await api.auth.faceLogin(payload);
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('mirac_token', res.token);
        localStorage.setItem('mirac_user', JSON.stringify(res.user));
        return { success: true, message: res.message, match_score: res.match_score, user: res.user };
      }
      return { success: false, message: res.message || 'Face not recognized' };
    } catch (err) {
      return { success: false, message: err.message || 'Biometric authentication error' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.auth.logout();
      }
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('mirac_token');
      localStorage.removeItem('mirac_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        initialLoading,
        isAuthenticated: !!user && !!token,
        loginWithPassword,
        loginWithFaceId,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
