import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../types';
import type { AnalyticsState } from '../types';
import { analyticsService } from '../../services/analytics';

// Initial state
const initialState: AnalyticsState = {
  projectsWorkload: null,
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
      });
  }
});

// Actions
export const { clearAnalyticsError, clearProjectsWorkload } = analyticsSlice.actions;

// Selectors
export const selectProjectsWorkload = (state: RootState) => state.analytics.projectsWorkload;
export const selectAnalyticsLoading = (state: RootState) => state.analytics.loading;
export const selectAnalyticsError = (state: RootState) => state.analytics.error;

// Reducer
export default analyticsSlice.reducer;
