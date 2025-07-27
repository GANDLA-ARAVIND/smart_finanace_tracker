import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (data: { name: string; email: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://localhost:5000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(response => {
          setUser(response.data);
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        });
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    setUser(user);
    setIsAuthenticated(true);
  };

  const signup = async (name: string, email: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/signup`, { name, email, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    setUser(user);
    setIsAuthenticated(true);
  };

  const updateProfile = async (data: { name: string; email: string }) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/auth/profile`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(response.data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};