import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../types';
import type { AnalyticsState } from '../types';
import { analyticsService } from '../../services/analytics';

// Initial state
const initialState: AnalyticsState = {
  projectsWorkload: null,
  employeeWorkHours: null,
  loading: false,
  error: null
};

// Async thunks
export const fetchProjectsWorkload = createAsyncThunk(
  'analytics/fetchProjectsWorkload',
  async (date?: string) => {
    const response = await analyticsService.getProjectsWorkload(date ? { date } : undefined);
    return response;
  }
);

export const fetchEmployeeWorkHours = createAsyncThunk(
  'analytics/fetchEmployeeWorkHours',
  async (date?: string) => {
    const response = await analyticsService.getEmployeeWorkHours(date ? { date } : undefined);
    return response;
  }
);

// Slice
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAnalyticsError: (state) => {
      state.error = null;
    },
    clearProjectsWorkload: (state) => {
      state.projectsWorkload = null;
    },
    clearEmployeeWorkHours: (state) => {
      state.employeeWorkHours = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch projects workload
      .addCase(fetchProjectsWorkload.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectsWorkload.fulfilled, (state, action) => {
        state.loading = false;
        state.projectsWorkload = action.payload;
        state.error = null;
      })
      .addCase(fetchProjectsWorkload.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка при загрузке аналитики';
      })
      // Fetch employee work hours
      .addCase(fetchEmployeeWorkHours.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeWorkHours.fulfilled, (state, action) => {
        state.loading = false;
        state.employeeWorkHours = action.payload;
        state.error = null;
      })
      .addCase(fetchEmployeeWorkHours.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка при загрузке аналитики рабочих часов';
      });
  }
});

// Actions
export const { clearAnalyticsError, clearProjectsWorkload, clearEmployeeWorkHours } = analyticsSlice.actions;

// Selectors
export const selectProjectsWorkload = (state: RootState) => state.analytics.projectsWorkload;
export const selectEmployeeWorkHours = (state: RootState) => state.analytics.employeeWorkHours;
export const selectAnalyticsLoading = (state: RootState) => state.analytics.loading;
export const selectAnalyticsError = (state: RootState) => state.analytics.error;

// Reducer
export default analyticsSlice.reducer;
