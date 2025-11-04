import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '../types';
import { authService, tokenStorage, LoginCredentials } from '../../services/auth';

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isInitialized: false,
  loading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      
      // Store tokens and user in localStorage
      tokenStorage.setTokens(response.accessToken, response.refreshToken);
      tokenStorage.setUser(response.user);
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    // Client-side logout: only clear local storage and state
    // No API call to backend as per requirements
    tokenStorage.clearAll();
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      // Check if we have stored tokens
      if (!tokenStorage.hasValidTokens()) {
        throw new Error('No valid tokens found');
      }

      const storedUser = tokenStorage.getUser();
      let storedAccessToken = tokenStorage.getAccessToken();
      let storedRefreshToken = tokenStorage.getRefreshToken();

      if (!storedUser || !storedAccessToken || !storedRefreshToken) {
        throw new Error('Incomplete authentication data');
      }

      // Check if access token is expired (with small buffer)
      const { isTokenExpired } = await import('../../utils/jwt');
      if (isTokenExpired(storedAccessToken, 5)) {
        // Access token expired, try to refresh it
        try {
          const refreshResponse = await authService.refreshToken(storedRefreshToken);
          storedAccessToken = refreshResponse.accessToken;

          // Backend may return new refresh token
          if (refreshResponse.refreshToken) {
            storedRefreshToken = refreshResponse.refreshToken;
          }

          // Update tokens in storage
          tokenStorage.setTokens(storedAccessToken, storedRefreshToken);
        } catch (refreshError: any) {
          // If refresh fails, clear tokens and reject
          tokenStorage.clearAll();

          // Check if it's a server error (5xx) vs authentication error (4xx)
          if (refreshError.response?.status >= 500) {
            // Server error - maybe temporary, don't logout immediately
            throw new Error('Server error during token refresh. Please try again.');
          }

          throw new Error('Token refresh failed');
        }
      }

      return {
        user: storedUser,
        accessToken: storedAccessToken,
        refreshToken: storedRefreshToken,
      };
    } catch (error: any) {
      // Clear invalid tokens
      tokenStorage.clearAll();
      return rejectWithValue(error.message);
    }
  }
);

export const refreshUserToken = createAsyncThunk(
  'auth/refreshUserToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.refreshToken;

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authService.refreshToken(refreshToken);

      // Update stored tokens (use new refresh token if provided, otherwise keep old one)
      const newRefreshToken = response.refreshToken || refreshToken;
      tokenStorage.setTokens(response.accessToken, newRefreshToken);

      return {
        accessToken: response.accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error: any) {
      // Clear invalid tokens
      tokenStorage.clearAll();
      return rejectWithValue(error.message);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Update access token and optionally refresh token
    updateAccessToken: (state, action: PayloadAction<string | { accessToken: string; refreshToken?: string }>) => {
      if (typeof action.payload === 'string') {
        // Legacy: just update access token
        state.accessToken = action.payload;
        const currentRefreshToken = state.refreshToken;
        if (currentRefreshToken) {
          tokenStorage.setTokens(action.payload, currentRefreshToken);
        }
      } else {
        // New: update both tokens
        state.accessToken = action.payload.accessToken;
        if (action.payload.refreshToken) {
          state.refreshToken = action.payload.refreshToken;
          tokenStorage.setTokens(action.payload.accessToken, action.payload.refreshToken);
        } else {
          const currentRefreshToken = state.refreshToken;
          if (currentRefreshToken) {
            tokenStorage.setTokens(action.payload.accessToken, currentRefreshToken);
          }
        }
      }
    },

    // Set user data
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset auth state
    resetAuthState: () => initialState,

    // Client-side logout (synchronous)
    logout: (state) => {
      // Clear local storage
      tokenStorage.clearAll();
      // Reset state to initial values
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login user
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.isInitialized = true;
      });

    // Logout user
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even if logout fails, clear the local state
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
        state.loading = false;
        state.error = null;
      });

    // Check auth status
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
        state.error = action.payload as string;
      });

    // Refresh token
    builder
      .addCase(refreshUserToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(refreshUserToken.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
        state.error = 'Session expired. Please login again.';
      });
  },
});

// Export actions
export const {
  updateAccessToken,
  setUser,
  clearError,
  resetAuthState,
  logout,
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsInitialized = (state: { auth: AuthState }) => state.auth.isInitialized;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectRefreshToken = (state: { auth: AuthState }) => state.auth.refreshToken;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;