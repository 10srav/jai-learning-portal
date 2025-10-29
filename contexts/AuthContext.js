'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, getCurrentUser, getCurrentStreak } from '@/lib/api';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    const initAuth = async () => {
      const savedUser = getCurrentUser();
      const savedStreak = getCurrentStreak();

      if (savedUser) {
        setUser(savedUser);
        setStreak(savedStreak);

        // Verify token is still valid
        try {
          const response = await authAPI.getMe();
          setUser(response.user);
          setStreak(response.streak);
          localStorage.setItem('user', JSON.stringify(response.user));
          if (response.streak) {
            localStorage.setItem('streak', JSON.stringify(response.streak));
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          // Token is invalid, log out
          logout();
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      setUser(response.user);
      setStreak(response.streak);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      setUser(response.user);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setStreak(null);
    router.push('/login');
  };

  const updateProfile = async (updates) => {
    try {
      const response = await authAPI.updateProfile(updates);
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const refreshUserData = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.user);
      setStreak(response.streak);
      localStorage.setItem('user', JSON.stringify(response.user));
      if (response.streak) {
        localStorage.setItem('streak', JSON.stringify(response.streak));
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    streak,
    loading,
    login,
    register,
    logout,
    updateProfile,
    refreshUserData,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}