import { apiRequest } from './config';

// Authentication API
// Note: Tokens are stored in httpOnly cookies by the backend
// We don't need to manually manage tokens - browser handles cookies automatically
export const authAPI = {
  // Register new user
  register: async (data) => {
    return apiRequest('/Auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Verify email with OTP
  verifyEmail: async (data) => {
    return apiRequest('/Auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Resend OTP for email verification
  resendOtp: async (email) => {
    return apiRequest('/Auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Login
  // Tokens are automatically set as httpOnly cookies by backend
  login: async (data) => {
    const response = await apiRequest('/Auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Handle 2FA response
    if (response.requiresTwoFactor) {
      return response; // Return 2FA requirement
    }
    
    // Tokens are in cookies, return user info
    return response;
  },

  // Verify 2FA code
  // Tokens are automatically set as httpOnly cookies by backend
  verify2FA: async (data) => {
    const response = await apiRequest('/Auth/verify-2fa', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Tokens are in cookies, return user info
    return response;
  },

  // Get current user info
  getMe: async () => {
    return apiRequest('/Auth/me');
  },

  // Refresh token
  // Refresh token is read from cookie by backend
  refreshToken: async () => {
    return apiRequest('/Auth/refresh', {
      method: 'POST',
    });
  },

  // Logout
  // Backend clears cookies automatically
  logout: async () => {
    try {
      await apiRequest('/Auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to login
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    return apiRequest('/Auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Reset password
  resetPassword: async (data) => {
    return apiRequest('/Auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Enable 2FA
  enable2FA: async (method) => {
    return apiRequest('/Auth/enable-2fa', {
      method: 'POST',
      body: JSON.stringify({ method }),
    });
  },

  // Disable 2FA
  disable2FA: async () => {
    return apiRequest('/Auth/disable-2fa', {
      method: 'POST',
    });
  },
};

