import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { useNotifications } from './NotificationsContext';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
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
    // Simulate checking for existing session
    const savedUser = localStorage.getItem('user');
    console.log('Saved user:', savedUser);
    
    // For development: Clear any existing user to force login page
    if (savedUser) {
      console.log('Found saved user, clearing for development...');
      localStorage.removeItem('user');
    }
    
    setIsLoading(false);
    console.log('AuthContext loading set to false');
  }, []);

  const login = async (email: string, _password: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data - in real app, this would come from API
    const mockUser: User = {
      id: '1',
      fullName: 'John Doe',
      email,
      username: email.split('@')[0],
      role: email.includes('admin') ? 'admin' : 'enterprise',
      profileComplete: !email.includes('new'),
      createdAt: new Date().toISOString(),
    };
    
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const signup = async (data: SignupData) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Date.now().toString(),
      fullName: data.fullName,
      email: data.email,
      username: data.username,
      role: data.role,
      profileComplete: false,
      createdAt: new Date().toISOString(),
    };
    
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    // Create notification for admin when new user signs up
    if (notificationsContext) {
      notificationsContext.createSignupNotification(
        data.fullName,
        data.email,
        data.role
      );
    }
    
    // Removed the mock application creation for enterprise users.
    // The ProfileWizard now handles actual startup creation.
    
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
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