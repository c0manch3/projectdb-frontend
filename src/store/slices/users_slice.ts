import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UsersState, User, UserRole } from '../types';

// Initial state
const initialState: UsersState = {
  list: [],
  current: null,
  filters: {
    role: null,
    companyId: null,
    search: '',
  },
  loading: false,
  error: null,
};

// Users slice
const usersSlice = createSlice({
  name: 'users',
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

    // Set users list
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.list = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Add new user
    addUser: (state, action: PayloadAction<User>) => {
      state.list.unshift(action.payload);
    },

    // Update user
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.list.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
      if (state.current && state.current.id === action.payload.id) {
        state.current = action.payload;
      }
    },

    // Remove user
    removeUser: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter(user => user.id !== action.payload);
      if (state.current && state.current.id === action.payload) {
        state.current = null;
      }
    },

    // Set current user
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.current = action.payload;
    },

    // Update user role
    updateUserRole: (state, action: PayloadAction<{ userId: string; role: UserRole }>) => {
      const user = state.list.find(user => user.id === action.payload.userId);
      if (user) {
        user.role = action.payload.role;
      }
      if (state.current && state.current.id === action.payload.userId) {
        state.current.role = action.payload.role;
      }
    },

    // Update filters
    updateFilters: (state, action: PayloadAction<Partial<typeof initialState.filters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Reset filters
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Set search query
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset users state
    resetUsersState: () => initialState,
  },
});

// Export actions
export const {
  setLoading,
  setError,
  setUsers,
  addUser,
  updateUser,
  removeUser,
  setCurrentUser,
  updateUserRole,
  updateFilters,
  resetFilters,
  setSearchQuery,
  clearError,
  resetUsersState,
} = usersSlice.actions;

// Export reducer
export default usersSlice.reducer;

// Selectors
export const selectUsers = (state: { users: UsersState }) => state.users;
export const selectUsersList = (state: { users: UsersState }) => state.users.list;
export const selectCurrentUser = (state: { users: UsersState }) => state.users.current;
export const selectUsersFilters = (state: { users: UsersState }) => state.users.filters;
export const selectUsersLoading = (state: { users: UsersState }) => state.users.loading;
export const selectUsersError = (state: { users: UsersState }) => state.users.error;
export const selectUsersSearchQuery = (state: { users: UsersState }) => state.users.filters.search;

// Complex selectors
export const selectFilteredUsers = (state: { users: UsersState }) => {
  const { list, filters } = state.users;
  return list.filter(user => {
    if (filters.role && user.role !== filters.role) return false;
    if (filters.companyId && user.companyId !== filters.companyId) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      return fullName.includes(search) || user.email.toLowerCase().includes(search);
    }
    return true;
  });
};

export const selectUserById = (state: { users: UsersState }, userId: string) => {
  return state.users.list.find(user => user.id === userId) || null;
};

export const selectUsersByRole = (state: { users: UsersState }, role: UserRole) => {
  return state.users.list.filter(user => user.role === role);
};

export const selectUsersByCompany = (state: { users: UsersState }, companyId: string) => {
  return state.users.list.filter(user => user.companyId === companyId);
};