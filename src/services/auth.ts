import { apiRequest } from './api';
import { User } from '../store/types';
import { decodeJWT, isTokenExpired } from '../utils/jwt';

// Types for authentication API
export interface LoginCredentials {
  email: string;
  password: string;
}

// API response format (based on actual server response)
export interface LoginApiResponse {
  id: string; // User UUID from backend
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
  refreshToken?: string; // Backend may optionally return new refresh token
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Authentication service
export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiRequest.post<LoginApiResponse>('/auth/login', credentials);
      const apiData = response.data;
      
      // Decode JWT token to get additional user info including role
      const jwtPayload = decodeJWT(apiData.accessToken);

      // Transform API response to our internal format
      // Use ID from API response (backend now returns it)
      const user: User = {
        id: apiData.id || (jwtPayload?.sub as string) || 'temp-id', // Prefer API response id, fallback to JWT sub
        email: apiData.email,
        firstName: apiData.firstName,
        lastName: apiData.lastName,
        phone: '', // Not provided in login response
        dateBirth: '', // Not provided in login response
        // telegramId is optional, so we can omit it
        role: jwtPayload?.role || 'Employee', // Extract from JWT token or default to Employee
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
      // Silently ignore logout errors
    }
  },

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      // Backend expects refresh token in Authorization header, not in body
      const response = await apiRequest.post<RefreshTokenResponse>(
        '/auth/refresh',
        {}, // Empty body
        {
          headers: {
            'Authorization': `Bearer ${refreshToken}`
          }
        }
      );
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
    try {
      const accessToken = tokenStorage.getAccessToken();
      const refreshToken = tokenStorage.getRefreshToken();

      if (!accessToken || !refreshToken) {
        return false;
      }

      // Check if REFRESH token is expired (not access token!)
      // If access token is expired but refresh token is valid, we can refresh it
      if (isTokenExpired(refreshToken)) {
        return false;
      }

      // TODO: Implement server-side token verification when endpoint is available
      // For now, just check if we have valid tokens
      return true;
    } catch (error) {
      return false;
    }
  },

  // Change password
  async changePassword(data: ChangePasswordRequest): Promise<User> {
    try {
      const response = await apiRequest.patch<User>('/auth/change-password', data);
      return response.data;
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 400) {
        throw new Error('Невалидные данные. Пароль должен содержать от 6 до 24 символов');
      } else if (error.response?.status === 401) {
        const message = error.response?.data?.message || '';
        if (message.includes('password')) {
          throw new Error('Неверный текущий пароль');
        }
        throw new Error('Необходима авторизация');
      } else if (error.response?.status === 404) {
        throw new Error('Пользователь не найден');
      } else if (error.response?.status >= 500) {
        throw new Error('Ошибка сервера. Попробуйте позже');
      } else {
        throw new Error(error.response?.data?.message || 'Ошибка при смене пароля');
      }
    }
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
        const storedUser = JSON.parse(userData);
        
        // If we have a stored access token, try to get updated role from JWT
        const accessToken = this.getAccessToken();
        if (accessToken) {
          const jwtPayload = decodeJWT(accessToken);
          if (jwtPayload) {
            // Update user with fresh data from JWT
            return {
              ...storedUser,
              id: jwtPayload.sub || storedUser.id,
              role: jwtPayload.role || storedUser.role,
            };
          }
        }
        
        return storedUser;
      } catch (error) {
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

    if (!accessToken || !refreshToken) {
      return false;
    }

    // Check if REFRESH token is expired (not access token!)
    // Access token can be expired - it will be refreshed automatically
    if (isTokenExpired(refreshToken)) {
      return false;
    }

    return true;
  },
};