import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('aurora_user');
    const token = localStorage.getItem('aurora_token');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('aurora_user');
        localStorage.removeItem('aurora_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const response = await api.login(email, password);
      const loggedUser = response.user;
      const token = response.token;
      localStorage.setItem('aurora_token', token);
      localStorage.setItem('aurora_user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      return loggedUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('aurora_token');
    localStorage.removeItem('aurora_user');
    setUser(null);
    api.logout().catch(() => {});
  };

  return { user, loading, login, logout, isAuthenticated: !!user };
}
