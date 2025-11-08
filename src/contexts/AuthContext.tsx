import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { UserProfile, getStoredData, saveUser, logout as logoutStorage } from '@/lib/storage';

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string, about?: string, level?: string, semester?: string) => boolean;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const data = getStoredData();
    setUser(data.user);
  }, []);

  const signup = (name: string, email: string, password: string, about?: string, level: string = '100', semester: string = '1') => {
    const newUser: UserProfile = {
      id: crypto.randomUUID(),
      name,
      email,
      about,
      currentLevel: level,
      currentSemester: semester,
      createdAt: new Date().toISOString(),
    };
    
    saveUser(newUser);
    setUser(newUser);
    return true;
  };

  const login = (email: string, password: string) => {
    const data = getStoredData();
    if (data.user && data.user.email === email) {
      setUser(data.user);
      return true;
    }
    return false;
  };

  const logout = () => {
    logoutStorage();
    setUser(null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    saveUser(updatedUser);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile }}>
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
