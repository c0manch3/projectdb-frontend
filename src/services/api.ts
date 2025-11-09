/* eslint-disable @typescript-eslint/no-unused-vars */
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosRequestConfig } from 'axios';
import { store } from '../store';
import { updateAccessToken, logout } from '../store/slices/auth_slice';
import { tokenStorage } from './auth';

// API Configuration
// Development: local backend server
// Production: use /api proxy (nginx)
export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ||
  ((import.meta as any).env?.DEV ? 'http://localhost:3000' : '/api');

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased to 30 seconds for slower backend operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState();
    const accessToken = state.auth.accessToken;
    
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track ongoing refresh request to prevent multiple simultaneous refreshes
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Another request is already refreshing the token, queue this one
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const state = store.getState();
      const refreshToken = state.auth.refreshToken;

      if (refreshToken) {
        try {
          // Try to refresh the token
          // Backend expects refresh token in Authorization header
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {}, // Empty body
            {
              headers: {
                'Authorization': `Bearer ${refreshToken}`
              }
            }
          );

          // Backend may return both accessToken and refreshToken or just accessToken
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;

          // Update tokens in store (which will also update localStorage)
          store.dispatch(updateAccessToken({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
          }));

          // Process queued requests with new token
          processQueue(null, newAccessToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);

        } catch (refreshError) {
          // Process queued requests with error
          processQueue(refreshError, null);

          // Refresh token is invalid, logout user
          store.dispatch(logout());

          // Redirect to login page
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        isRefreshing = false;
        // No refresh token available, logout user
        store.dispatch(logout());
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Helper functions for common API operations
export const apiRequest = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.get(url, config),
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.post(url, data, config),
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.put(url, data, config),
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.patch(url, data, config),
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.delete(url, config),
};

export default api;