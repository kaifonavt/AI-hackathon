'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  verifyToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const BACKEND_URL = process.env.BACKEND_URL;

  const verifyToken = async () => {
    if (typeof window === 'undefined') return;
    const access_token = localStorage.getItem('access_token');
    
    if (!access_token) {
      setIsLoggedIn(false);
      return;
    }

    try {
      await axios.get(`${BACKEND_URL}/users/verify-token`, {
        headers: { 'Authorization': `Bearer ${access_token}` }
      });
      setIsLoggedIn(true);
    } catch (error) {
      setIsLoggedIn(false);
      localStorage.removeItem('access_token');
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, verifyToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};