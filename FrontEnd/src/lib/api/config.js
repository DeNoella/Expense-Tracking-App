// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5144/api';

// Note: Tokens are stored in httpOnly cookies by the backend
// We cannot access them via JavaScript (this is by design for security)
// The browser automatically sends cookies with requests

// Check if user is authenticated (by checking if we can get user info)
export const isAuthenticated = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/Auth/me`, {
      method: 'GET',
      credentials: 'include', // Important: Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch {
    return false;
  }
};

// Create headers (cookies are sent automatically by browser)
export const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

// Base fetch function with error handling
export const apiRequest = async (url, options = {}) => {
  // If body is FormData, don't set Content-Type (browser will set it with boundary)
  const isFormData = options.body instanceof FormData;
  const headers = isFormData ? {} : getAuthHeaders();
  
  const config = {
    ...options,
    credentials: 'include', // Important: Include cookies in all requests
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    
    // Handle 401 Unauthorized - token expired, try to refresh
    if (response.status === 401 && url !== '/Auth/refresh' && url !== '/Auth/login' && url !== '/Auth/verify-2fa') {
      try {
        // Try to refresh token
        const refreshResponse = await fetch(`${API_BASE_URL}/Auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (refreshResponse.ok) {
          // Retry original request
          return apiRequest(url, options);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
      }
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      throw new Error('Unauthorized - Please login again');
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      
      // Handle validation errors
      if (errorData.errors && Array.isArray(errorData.errors)) {
        const validationErrors = errorData.errors.join(', ');
        throw new Error(validationErrors || errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      throw new Error(errorData.message || errorData.title || `HTTP error! status: ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

