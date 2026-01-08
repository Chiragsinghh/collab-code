import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Persistent login check
    const savedUser = localStorage.getItem('codesync_user');
    const token = localStorage.getItem('codesync_token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
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
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);