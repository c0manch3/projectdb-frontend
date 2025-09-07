import { apiRequest } from './api';
import { User } from '../store/types';

// Types for authentication API
export interface LoginCredentials {
  email: string;
  password: string;
}

// API response format (based on actual server response)
export interface LoginApiResponse {
  email: string;
  firstName: string;
  lastName: string;
  accessToken: string;
  refreshToken: string;
}

// Our internal response format
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

// Authentication service
export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiRequest.post<LoginApiResponse>('/auth/login', credentials);
      const apiData = response.data;
      
      // Transform API response to our internal format
      const user: User = {
        id: 'temp-id', // Will be replaced when we get user details from another endpoint
        email: apiData.email,
        firstName: apiData.firstName,
        lastName: apiData.lastName,
        phone: '', // Not provided in login response
        dateBirth: '', // Not provided in login response
        companyId: '', // Not provided in login response
        // telegramId is optional, so we can omit it
        role: 'Admin', // Assuming from JWT token, could decode to get actual role
        createdAt: new Date().toISOString(), // Default value
        updatedAt: new Date().toISOString(), // Default value
      };

      return {
        user,
        accessToken: apiData.accessToken,
        refreshToken: apiData.refreshToken,
      };
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error('Неверный email или пароль');
      } else if (error.response?.status === 422) {
        throw new Error('Некорректные данные для входа');
      } else if (error.response?.status >= 500) {
        throw new Error('Ошибка сервера. Попробуйте позже');
      } else {
        throw new Error(error.response?.data?.message || 'Ошибка при входе в систему');
      }
    }
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await apiRequest.post('/auth/logout');
    } catch (error) {
      // Even if logout fails on server (endpoint not available), we still want to clear local state
      console.warn('Logout request failed, but clearing local state:', error);
    }
  },

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      const response = await apiRequest.post<RefreshTokenResponse>('/auth/refresh', {
        refreshToken,
      });
      return response.data;
    } catch (error: any) {
      // If refresh fails, token is probably expired
      throw new Error(error.response?.data?.message || 'Токен истек. Необходимо войти заново');
    }
  },

  // Get current user profile (currently not available on server)
  async getCurrentUser(): Promise<User> {
    // TODO: Implement when /auth/me endpoint is available
    throw new Error('getCurrentUser endpoint not available');
  },

  // Verify token validity
  async verifyToken(): Promise<boolean> {
    // For now, we'll assume token is valid if it exists
    // TODO: Implement proper token verification when endpoint is available
    return true;
  },
};

// Local storage helpers
export const tokenStorage = {
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },

  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser(): User | null {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        return null;
      }
    }
    return null;
  },

  clearAll(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  hasValidTokens(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    return Boolean(accessToken && refreshToken);
  },
};