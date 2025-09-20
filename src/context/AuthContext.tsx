import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { useNotifications } from './NotificationsContext';
import { useApplications } from './ApplicationsContext';

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
  let applicationsContext;
  try {
    notificationsContext = useNotifications();
  } catch {
    // NotificationsProvider not available, continue without notifications
    notificationsContext = null;
  }
  
  try {
    applicationsContext = useApplications();
  } catch {
    // ApplicationsProvider not available, continue without applications
    applicationsContext = null;
  }

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
    
    // Create application for enterprise users (startups)
    if (data.role === 'enterprise' && applicationsContext) {
      // Generate a random TRL level between 1-9
      const trlLevel = Math.floor(Math.random() * 9) + 1;
      
      // Determine application type based on TRL level
      const type = trlLevel <= 5 ? 'incubation' : 'innovation';
      
      // Generate a startup name if not provided
      const startupName = data.fullName.includes(' ') 
        ? `${data.fullName.split(' ')[0]}'s Startup`
        : `${data.fullName}'s Startup`;
      
      // Generate a sector based on email domain or random
      const sectors = ['CleanTech', 'HealthTech', 'EdTech', 'FinTech', 'AgriTech', 'AI/ML', 'IoT', 'Blockchain'];
      const sector = sectors[Math.floor(Math.random() * sectors.length)];
      
      applicationsContext.addApplication({
        name: startupName,
        founder: data.fullName,
        sector: sector,
        type: type,
        trlLevel: trlLevel,
        email: data.email,
        submissionDate: new Date().toISOString().split('T')[0]
      });
    }
    
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