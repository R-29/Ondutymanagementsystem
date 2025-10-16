import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (role: UserRole, id: string, password: string) => boolean;
  logout: () => void;
  signup: (userData: Omit<User, 'id'>) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database
const mockUsers: User[] = [
  { id: '1', name: 'Dr. John Smith', staffId: 'STAFF001', role: 'hod', department: 'Computer Science' },
  { id: '2', name: 'Prof. Jane Doe', staffId: 'STAFF002', role: 'staff', department: 'Computer Science' },
  { id: '3', name: 'Alice Johnson', regNo: 'REG001', role: 'student', year: 3, section: 'A', department: 'Computer Science' },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole, id: string, password: string): boolean => {
    // Mock authentication - in real app, this would call an API
    const foundUser = mockUsers.find(u => 
      u.role === role && (u.staffId === id || u.regNo === id)
    );
    
    if (foundUser && password) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const signup = (userData: Omit<User, 'id'>): boolean => {
    // Mock signup - in real app, this would call an API
    const newUser: User = {
      ...userData,
      id: `USER${Date.now()}`,
    };
    mockUsers.push(newUser);
    setUser(newUser);
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup }}>
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