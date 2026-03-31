'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { auth as authApi } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('flow_token');
    if (token) {
      authApi.me()
        .then(data => setUser(data.user || data))
        .catch(() => {
          localStorage.removeItem('flow_token');
          localStorage.removeItem('flow_refresh_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    localStorage.setItem('flow_token', data.session.access_token);
    localStorage.setItem('flow_refresh_token', data.session.refresh_token);
    setUser(data.user);
    return data;
  };

  const register = async (email, password, name, organizationName) => {
    const data = await authApi.register(email, password, name, organizationName);
    localStorage.setItem('flow_token', data.session.access_token);
    localStorage.setItem('flow_refresh_token', data.session.refresh_token);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    localStorage.removeItem('flow_token');
    localStorage.removeItem('flow_refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
