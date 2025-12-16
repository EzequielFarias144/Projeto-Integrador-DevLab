import { useState, useEffect } from 'react';
import { authService, User } from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      await authService.login({ username, password });
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error: any) {
      console.error('Erro no login:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Erro ao fazer login',
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };
};
