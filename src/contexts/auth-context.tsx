'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { User, getCurrentUser, logout as logoutUser } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { clearUser, setLoading, setUser } from '@/store/auth-slice';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state: RootState) => state.auth);
  const router = useRouter();

  const refreshUser = async () => {
    dispatch(setLoading(true));
    try {
      const currentUser = await getCurrentUser();
      dispatch(setUser(currentUser));
    } catch (error) {
      console.error('Error refreshing user:', error);
      dispatch(setUser(null));
    }
  };

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (userData: User) => {
    dispatch(setUser(userData));
  };

  const logout = async () => {
    try {
      await logoutUser();
      dispatch(clearUser());
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      dispatch(clearUser());
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

