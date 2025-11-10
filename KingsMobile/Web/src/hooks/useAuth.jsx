import { useState, useEffect, createContext, useContext } from 'react';
import { apiService } from '../services/api.jsx';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        apiService.setToken(token);
        const response = await apiService.getProfile();
        setUser(response.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
      apiService.setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.login(credentials);
      setUser(response.user);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isSalesStaff: user?.role === 'SALES_STAFF',
    isTechnician: user?.role === 'TECHNICIAN',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
