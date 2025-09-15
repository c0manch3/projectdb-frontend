import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { UsersState, User, UserRole, Company } from '../types';
import { employeesService, CreateEmployeeDto, UpdateEmployeeDto, EmployeesFilters } from '../../services/employees';

// Async thunks for employee operations

// Fetch all employees with optional filters
export const fetchEmployees = createAsyncThunk(
  'users/fetchEmployees',
  async (filters: EmployeesFilters | undefined, { rejectWithValue }) => {
    try {
      const employees = await employeesService.getEmployees(filters);
      return employees;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке сотрудников');
    }
  }
);

// Fetch employee by ID
export const fetchEmployeeById = createAsyncThunk(
  'users/fetchEmployeeById',
  async (id: string, { rejectWithValue }) => {
    try {
      const employee = await employeesService.getEmployeeById(id);
      return employee;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке данных сотрудника');
    }
  }
);

// Create new employee
export const createEmployee = createAsyncThunk(
  'users/createEmployee',
  async (employeeData: CreateEmployeeDto, { rejectWithValue }) => {
    try {
      const newEmployee = await employeesService.createEmployee(employeeData);
      return newEmployee;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при создании сотрудника');
    }
  }
);

// Update employee
export const updateEmployee = createAsyncThunk(
  'users/updateEmployee',
  async ({ id, data }: { id: string; data: UpdateEmployeeDto }, { rejectWithValue }) => {
    try {
      const updatedEmployee = await employeesService.updateEmployee(id, data);
      return updatedEmployee;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при обновлении данных сотрудника');
    }
  }
);

// Delete employee
export const deleteEmployee = createAsyncThunk(
  'users/deleteEmployee',
  async (id: string, { rejectWithValue }) => {
    try {
      await employeesService.deleteEmployee(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при удалении сотрудника');
    }
  }
);

// Fetch companies for forms
export const fetchCompanies = createAsyncThunk(
  'users/fetchCompanies',
  async (_, { rejectWithValue }) => {
    try {
      const companies = await employeesService.getCompanies();
      return companies;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке компаний');
    }
  }
);

// Fetch employee statistics
export const fetchEmployeeStats = createAsyncThunk(
  'users/fetchEmployeeStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await employeesService.getEmployeeStats();
      return stats;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке статистики');
    }
  }
);

// Extended state interface for additional data
interface ExtendedUsersState extends UsersState {
  companies: Company[];
  stats: {
    total: number;
    active: number;
    managers: number;
    employees: number;
  };
  companiesLoading: boolean;
  statsLoading: boolean;
}

// Initial state
const initialState: ExtendedUsersState = {
  list: [],
  current: null,
  filters: {
    role: null,
    search: '',
  },
  loading: false,
  error: null,
  companies: [],
  stats: {
    total: 0,
    active: 0,
    managers: 0,
    employees: 0,
  },
  companiesLoading: false,
  statsLoading: false,
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
  extraReducers: (builder) => {
    // Fetch employees
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
        state.error = null;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch employee by ID
      .addCase(fetchEmployeeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
        state.error = null;
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create employee
      .addCase(createEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
        state.error = null;
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update employee
      .addCase(updateEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.current && state.current.id === action.payload.id) {
          state.current = action.payload;
        }
        state.error = null;
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete employee
      .addCase(deleteEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(user => user.id !== action.payload);
        if (state.current && state.current.id === action.payload) {
          state.current = null;
        }
        state.error = null;
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch companies
      .addCase(fetchCompanies.pending, (state) => {
        state.companiesLoading = true;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.companiesLoading = false;
        state.companies = action.payload;
      })
      .addCase(fetchCompanies.rejected, (state) => {
        state.companiesLoading = false;
      })

      // Fetch employee stats
      .addCase(fetchEmployeeStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchEmployeeStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchEmployeeStats.rejected, (state) => {
        state.statsLoading = false;
      });
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
export const selectUsers = (state: { users: ExtendedUsersState }) => state.users;
export const selectUsersList = (state: { users: ExtendedUsersState }) => state.users.list;
export const selectCurrentUser = (state: { users: ExtendedUsersState }) => state.users.current;
export const selectUsersFilters = (state: { users: ExtendedUsersState }) => state.users.filters;
export const selectUsersLoading = (state: { users: ExtendedUsersState }) => state.users.loading;
export const selectUsersError = (state: { users: ExtendedUsersState }) => state.users.error;
export const selectUsersSearchQuery = (state: { users: ExtendedUsersState }) => state.users.filters.search;

// New selectors for companies and stats
export const selectCompanies = (state: { users: ExtendedUsersState }) => state.users.companies;
export const selectCompaniesLoading = (state: { users: ExtendedUsersState }) => state.users.companiesLoading;
export const selectEmployeeStats = (state: { users: ExtendedUsersState }) => state.users.stats;
export const selectStatsLoading = (state: { users: ExtendedUsersState }) => state.users.statsLoading;

// Complex selectors with memoization
export const selectFilteredUsers = createSelector(
  [selectUsersList, selectUsersFilters],
  (list, filters) => {
    return list.filter(user => {
      if (filters.role && user.role !== filters.role) return false;
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        return fullName.includes(search) || user.email.toLowerCase().includes(search);
      }
      return true;
    });
  }
);

export const selectUserById = createSelector(
  [(state: { users: ExtendedUsersState }) => state.users.list, (_, userId: string) => userId],
  (list, userId) => list.find(user => user.id === userId) || null
);

export const selectUsersByRole = createSelector(
  [(state: { users: ExtendedUsersState }) => state.users.list, (_, role: UserRole) => role],
  (list, role) => list.filter(user => user.role === role)
);


// Selector to get company by ID
export const selectCompanyById = createSelector(
  [(state: { users: ExtendedUsersState }) => state.users.companies, (_, companyId: string) => companyId],
  (companies, companyId) => companies.find(company => company.id === companyId) || null
);