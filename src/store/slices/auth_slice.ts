import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '../types';

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Login success
    loginSuccess: (state, action: PayloadAction<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },

    // Set user data
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },

    // Set tokens
    setTokens: (state, action: PayloadAction<{
      accessToken: string;
      refreshToken: string;
    }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.error = null;
    },

    // Update access token
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },

    // Logout
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset auth state
    resetAuthState: () => initialState,
  },
});

// Export actions
export const {
  setLoading,
  setError,
  loginSuccess,
  setUser,
  setTokens,
  updateAccessToken,
  logout,
  clearError,
  resetAuthState,
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectRefreshToken = (state: { auth: AuthState }) => state.auth.refreshToken;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;