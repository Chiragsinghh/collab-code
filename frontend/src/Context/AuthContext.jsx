import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('codesync_token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Verify token with backend
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (err) {
        console.error("Auth check failed:", err);
        localStorage.removeItem('codesync_token');
        localStorage.removeItem('codesync_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('codesync_user', JSON.stringify(userData));
    localStorage.setItem('codesync_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('codesync_user');
    localStorage.removeItem('codesync_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);