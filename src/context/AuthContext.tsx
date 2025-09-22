import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { useNotifications } from './NotificationsContext';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ redirectUrl?: string }>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

interface SignupData {
  fullName: string;
  email: string;
  username: string;
  password: string;
  role: 'individual' | 'enterprise';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get contexts - these will be undefined if not wrapped in their providers
  let notificationsContext;
  try {
    notificationsContext = useNotifications();
  } catch {
    // NotificationsProvider not available, continue without notifications
    notificationsContext = null;
  }
  
  // Removed applicationsContext as startup creation is now handled by ProfileWizard

  useEffect(() => {
    console.log('AuthContext useEffect running');
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Verify token with backend
      const response = await api.get('/auth/me');
      if (response.data.success && response.data.data.user) {
        const userData = response.data.data.user;
        // Map backend user format to frontend user format
        const user: User = {
          id: userData.id,
          fullName: userData.fullName,
          email: userData.email,
          username: userData.username,
          role: userData.role.toLowerCase() === 'admin' ? 'admin' : 
                userData.role.toLowerCase() === 'enterprise' ? 'enterprise' : 'individual',
          profileComplete: userData.profileComplete,
          createdAt: userData.createdAt,
          startupId: userData.startupId
        };
        setUser(user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ redirectUrl?: string }> => {
    setIsLoading(true);
    try {
      // Determine if this is an admin login
      const isAdminLogin = email.includes('admin') || email === 'admin@citbif.com';
      const endpoint = isAdminLogin ? '/auth/admin/login' : '/auth/login';
      
      const response = await api.post(endpoint, { email, password });
      
      if (response.data.success) {
        const { user: userData, accessToken, refreshToken, redirectUrl } = response.data.data;
        
        // Store tokens
        localStorage.setItem('token', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        // Map backend user format to frontend user format
        const user: User = {
          id: userData.id,
          fullName: userData.fullName,
          email: userData.email,
          username: userData.username,
          role: userData.role.toLowerCase() === 'admin' ? 'admin' : 
                userData.role.toLowerCase() === 'enterprise' ? 'enterprise' : 'individual',
          profileComplete: userData.profileComplete,
          createdAt: userData.createdAt,
          startupId: userData.startupId
        };
        
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        
        return { redirectUrl };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage = (error as any).response?.data?.message || (error as Error).message || 'Login failed';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupData) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/signup', data);
      
      if (response.data.success) {
        const { user: userData, accessToken, refreshToken } = response.data.data;
        
        // Store tokens
        localStorage.setItem('token', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        // Map backend user format to frontend user format
        const user: User = {
          id: userData.id,
          fullName: userData.fullName,
          email: userData.email,
          username: userData.username,
          role: userData.role.toLowerCase() === 'admin' ? 'admin' : 
                userData.role.toLowerCase() === 'enterprise' ? 'enterprise' : 'individual',
          profileComplete: userData.profileComplete,
          createdAt: userData.createdAt,
          startupId: userData.startupId
        };
        
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Create notification for admin when new user signs up
        if (notificationsContext) {
          notificationsContext.createSignupNotification(
            data.fullName,
            data.email,
            data.role
          );
        }
      } else {
        throw new Error(response.data.message || 'Signup failed');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Signup failed';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all local data regardless of API call success
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      signup,
      logout,
      updateUser,
    }}>
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