'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({
  isLoggedIn: false,
  user: null,
  login: () => { },
  logout: () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedAuth = localStorage.getItem('isLoggedIn') === 'true';
    const savedUser = localStorage.getItem('user');
    setIsLoggedIn(savedAuth);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('user');
  };

  if (!mounted) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
