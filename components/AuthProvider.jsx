'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext({
  isLoggedIn: false,
  user: null,
  session: null,
  login: () => { },
  logout: () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Helper function to fetch INTEGER user_id from backend by email
    const fetchUserIdByEmail = async (email) => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/user-by-email/${encodeURIComponent(email)}`);
        if (response.ok) {
          const data = await response.json();
          return data.user_id; // INTEGER user_id from users table
        }
      } catch (error) {
        console.error('Error fetching user_id:', error);
      }
      return null;
    };

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setSession(session);
        // Fetch INTEGER user_id from backend by email
        const userId = await fetchUserIdByEmail(session.user.email);
        setUser({
          user_id: userId || session.user.id, // Use INTEGER user_id if available, fallback to UUID
          email: session.user.email,
          ...session.user.user_metadata
        });
        setIsLoggedIn(true);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        // Fetch INTEGER user_id from backend by email
        const userId = await fetchUserIdByEmail(session.user.email);
        setUser({
          user_id: userId || session.user.id, // Use INTEGER user_id if available, fallback to UUID
          email: session.user.email,
          ...session.user.user_metadata
        });
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (userData, sessionData = null) => {
    if (sessionData) {
      // Set session in Supabase client
      await supabase.auth.setSession(sessionData);
    }
    setIsLoggedIn(true);
    setUser(userData);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUser(null);
    setSession(null);
    // Redirect to home page after logout
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
