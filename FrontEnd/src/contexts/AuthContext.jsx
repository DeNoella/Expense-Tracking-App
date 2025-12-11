import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { authAPI } from '@/lib/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on mount
  // Cookies are checked automatically by backend
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authAPI.getMe();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      
      // If 2FA is required, return the response
      if (response.requiresTwoFactor) {
        return { requiresTwoFactor: true, twoFactorMethod: response.twoFactorMethod };
      }
      
      // If login successful, tokens are in cookies, get user data
      const userData = await authAPI.getMe();
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true, user: userData };
    } catch (error) {
      throw error;
    }
  };

  const verify2FA = async (email, otp) => {
    try {
      const response = await authAPI.verify2FA({ email, otp });
      
      // Tokens are in cookies, get user data
      const userData = await authAPI.getMe();
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true, user: userData };
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const register = async (data) => {
    try {
      return await authAPI.register(data);
    } catch (error) {
      throw error;
    }
  };

  const verifyEmail = async (email, otp) => {
    try {
      return await authAPI.verifyEmail({ Email: email, Otp: otp });
    } catch (error) {
      throw error;
    }
  };

  const resendOtp = async (email) => {
    try {
      return await authAPI.resendOtp(email);
    } catch (error) {
      throw error;
    }
  };

  // Helper to check if user is admin - reactive to user changes
  const isAdmin = useMemo(() => {
    if (!user) return false;
    
    // Handle both camelCase and PascalCase property names from API
    const hasAdminPermissions = user.HasAdminPermissions !== undefined 
      ? user.HasAdminPermissions 
      : user.hasAdminPermissions !== undefined 
        ? user.hasAdminPermissions 
        : undefined;
    
    if (hasAdminPermissions !== undefined) {
      return Boolean(hasAdminPermissions);
    }
    
    // Fallback: check permissions array (handle both camelCase and PascalCase)
    const permissions = user.Permissions || user.permissions || [];
    const permissionsArray = Array.isArray(permissions) ? permissions : [];
    
    // Check if user has admin permissions
    return permissionsArray.includes('order.view.any') || 
           permissionsArray.some(p => 
             typeof p === 'string' && (
               p.includes('admin') || 
               p === 'user.manage' || 
               p === 'user.view.any'
             )
           );
  }, [user]);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    verify2FA,
    logout,
    register,
    verifyEmail,
    resendOtp,
    refreshUser: async () => {
      try {
        const userData = await authAPI.getMe();
        setUser(userData);
        return userData;
      } catch (error) {
        console.error('Failed to refresh user:', error);
        throw error;
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

