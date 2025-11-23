import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { PaymentSchedulesState, PaymentSchedule } from '../types';
import {
  paymentSchedulesService,
  CreatePaymentScheduleDto,
  UpdatePaymentScheduleDto,
  PaymentSchedulesFilters,
} from '../../services/payment_schedules';

// Initial state
const initialState: PaymentSchedulesState = {
  list: [],
  byProject: {},
  current: null,
  filters: {},
  loading: false,
  error: null,
};

// Async Thunks

// Fetch all payment schedules
export const fetchPaymentSchedules = createAsyncThunk(
  'paymentSchedules/fetchPaymentSchedules',
  async (filters: PaymentSchedulesFilters | undefined = undefined, { rejectWithValue }) => {
    try {
      return await paymentSchedulesService.getPaymentSchedules(filters);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке графиков платежей');
    }
  }
);

// Fetch payment schedule by ID
export const fetchPaymentScheduleById = createAsyncThunk(
  'paymentSchedules/fetchPaymentScheduleById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await paymentSchedulesService.getPaymentScheduleById(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке платежа');
    }
  }
);

// Fetch payment schedules by project ID
export const fetchPaymentSchedulesByProject = createAsyncThunk(
  'paymentSchedules/fetchPaymentSchedulesByProject',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const paymentSchedules = await paymentSchedulesService.getPaymentSchedulesByProject(projectId);
      return { projectId, paymentSchedules };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке графиков платежей проекта');
    }
  }
);

// Create payment schedule
export const createPaymentSchedule = createAsyncThunk(
  'paymentSchedules/createPaymentSchedule',
  async (data: CreatePaymentScheduleDto, { rejectWithValue }) => {
    try {
      return await paymentSchedulesService.createPaymentSchedule(data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при создании платежа');
    }
  }
);

// Update payment schedule
export const updatePaymentSchedule = createAsyncThunk(
  'paymentSchedules/updatePaymentSchedule',
  async ({ id, data }: { id: string; data: UpdatePaymentScheduleDto }, { rejectWithValue }) => {
    try {
      return await paymentSchedulesService.updatePaymentSchedule(id, data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при обновлении платежа');
    }
  }
);

// Delete payment schedule
export const deletePaymentSchedule = createAsyncThunk(
  'paymentSchedules/deletePaymentSchedule',
  async (id: string, { rejectWithValue }) => {
    try {
      await paymentSchedulesService.deletePaymentSchedule(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при удалении платежа');
    }
  }
);

// Mark payment as paid
export const markPaymentAsPaid = createAsyncThunk(
  'paymentSchedules/markPaymentAsPaid',
  async ({ id, actualDate }: { id: string; actualDate?: string }, { rejectWithValue }) => {
    try {
      return await paymentSchedulesService.markAsPaid(id, actualDate);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при отметке платежа как оплаченного');
    }
  }
);

// Mark payment as unpaid
export const markPaymentAsUnpaid = createAsyncThunk(
  'paymentSchedules/markPaymentAsUnpaid',
  async (id: string, { rejectWithValue }) => {
    try {
      return await paymentSchedulesService.markAsUnpaid(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при отметке платежа как неоплаченного');
    }
  }
);

// Slice
const paymentSchedulesSlice = createSlice({
  name: 'paymentSchedules',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCurrentPaymentSchedule: (state, action: PayloadAction<PaymentSchedule | null>) => {
      state.current = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<PaymentSchedulesState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearPaymentSchedules: (state) => {
      state.list = [];
      state.byProject = {};
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all payment schedules
    builder
      .addCase(fetchPaymentSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchPaymentSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch payment schedule by ID
      .addCase(fetchPaymentScheduleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentScheduleById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchPaymentScheduleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch payment schedules by project
      .addCase(fetchPaymentSchedulesByProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentSchedulesByProject.fulfilled, (state, action) => {
        state.loading = false;
        const { projectId, paymentSchedules } = action.payload;
        state.byProject[projectId] = paymentSchedules;
      })
      .addCase(fetchPaymentSchedulesByProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create payment schedule
      .addCase(createPaymentSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
        // Also update byProject cache
        const projectId = action.payload.projectId;
        if (state.byProject[projectId]) {
          state.byProject[projectId].unshift(action.payload);
        } else {
          state.byProject[projectId] = [action.payload];
        }
      })
      .addCase(createPaymentSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update payment schedule
      .addCase(updatePaymentSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaymentSchedule.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        // Update in list
        const listIndex = state.list.findIndex(ps => ps.id === updated.id);
        if (listIndex !== -1) {
          state.list[listIndex] = updated;
        }
        // Update in byProject cache
        const projectId = updated.projectId;
        if (state.byProject[projectId]) {
          const projectIndex = state.byProject[projectId].findIndex(ps => ps.id === updated.id);
          if (projectIndex !== -1) {
            state.byProject[projectId][projectIndex] = updated;
          }
        }
        // Update current if it's the same
        if (state.current?.id === updated.id) {
          state.current = updated;
        }
      })
      .addCase(updatePaymentSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete payment schedule
      .addCase(deletePaymentSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePaymentSchedule.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        // Find the payment schedule to get projectId before removing
        const deletedItem = state.list.find(ps => ps.id === deletedId);
        // Remove from list
        state.list = state.list.filter(ps => ps.id !== deletedId);
        // Remove from byProject cache
        if (deletedItem) {
          const projectId = deletedItem.projectId;
          if (state.byProject[projectId]) {
            state.byProject[projectId] = state.byProject[projectId].filter(ps => ps.id !== deletedId);
          }
        }
        // Clear current if it's the deleted one
        if (state.current?.id === deletedId) {
          state.current = null;
        }
      })
      .addCase(deletePaymentSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Mark payment as paid
      .addCase(markPaymentAsPaid.fulfilled, (state, action) => {
        const updated = action.payload;
        // Update in list
        const listIndex = state.list.findIndex(ps => ps.id === updated.id);
        if (listIndex !== -1) {
          state.list[listIndex] = updated;
        }
        // Update in byProject cache
        const projectId = updated.projectId;
        if (state.byProject[projectId]) {
          const projectIndex = state.byProject[projectId].findIndex(ps => ps.id === updated.id);
          if (projectIndex !== -1) {
            state.byProject[projectId][projectIndex] = updated;
          }
        }
        // Update current if it's the same
        if (state.current?.id === updated.id) {
          state.current = updated;
        }
      })

      // Mark payment as unpaid
      .addCase(markPaymentAsUnpaid.fulfilled, (state, action) => {
        const updated = action.payload;
        // Update in list
        const listIndex = state.list.findIndex(ps => ps.id === updated.id);
        if (listIndex !== -1) {
          state.list[listIndex] = updated;
        }
        // Update in byProject cache
        const projectId = updated.projectId;
        if (state.byProject[projectId]) {
          const projectIndex = state.byProject[projectId].findIndex(ps => ps.id === updated.id);
          if (projectIndex !== -1) {
            state.byProject[projectId][projectIndex] = updated;
          }
        }
        // Update current if it's the same
        if (state.current?.id === updated.id) {
          state.current = updated;
        }
      });
  },
});

// Export actions
export const {
  setLoading,
  setError,
  setCurrentPaymentSchedule,
  updateFilters,
  resetFilters,
  clearError,
  clearPaymentSchedules,
} = paymentSchedulesSlice.actions;

// Export reducer
export default paymentSchedulesSlice.reducer;

// Selectors
export const selectPaymentSchedules = (state: { paymentSchedules: PaymentSchedulesState }) =>
  state.paymentSchedules;

export const selectPaymentSchedulesList = (state: { paymentSchedules: PaymentSchedulesState }) =>
  state.paymentSchedules.list;

export const selectCurrentPaymentSchedule = (state: { paymentSchedules: PaymentSchedulesState }) =>
  state.paymentSchedules.current;

export const selectPaymentSchedulesLoading = (state: { paymentSchedules: PaymentSchedulesState }) =>
  state.paymentSchedules.loading;

export const selectPaymentSchedulesError = (state: { paymentSchedules: PaymentSchedulesState }) =>
  state.paymentSchedules.error;

export const selectPaymentSchedulesFilters = (state: { paymentSchedules: PaymentSchedulesState }) =>
  state.paymentSchedules.filters;

export const selectPaymentSchedulesByProjectId = (projectId: string) =>
  (state: { paymentSchedules: PaymentSchedulesState }) =>
    state.paymentSchedules.byProject[projectId] || [];

// Filtered selector
export const selectFilteredPaymentSchedules = (state: { paymentSchedules: PaymentSchedulesState }) => {
  const { list, filters } = state.paymentSchedules;
  const now = new Date();

  return list.filter(ps => {
    // Filter by projectId
    if (filters.projectId && ps.projectId !== filters.projectId) {
      return false;
    }

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      switch (filters.status) {
        case 'paid':
          if (!ps.isPaid) return false;
          break;
        case 'unpaid':
          if (ps.isPaid) return false;
          break;
        case 'overdue':
          if (ps.isPaid || new Date(ps.expectedDate) >= now) return false;
          break;
      }
    }

    return true;
  });
};

// Statistics selector
export const selectPaymentSchedulesStats = (state: { paymentSchedules: PaymentSchedulesState }) => {
  const { list } = state.paymentSchedules;
  const now = new Date();

  const totalAmount = list.reduce((sum, ps) => sum + ps.amount, 0);
  const paidAmount = list.filter(ps => ps.isPaid).reduce((sum, ps) => sum + ps.amount, 0);
  const unpaidAmount = list.filter(ps => !ps.isPaid).reduce((sum, ps) => sum + ps.amount, 0);
  const overdueAmount = list
    .filter(ps => !ps.isPaid && new Date(ps.expectedDate) < now)
    .reduce((sum, ps) => sum + ps.amount, 0);

  const totalCount = list.length;
  const paidCount = list.filter(ps => ps.isPaid).length;
  const unpaidCount = list.filter(ps => !ps.isPaid).length;
  const overdueCount = list.filter(ps => !ps.isPaid && new Date(ps.expectedDate) < now).length;

  return {
    totalAmount,
    paidAmount,
    unpaidAmount,
    overdueAmount,
    totalCount,
    paidCount,
    unpaidCount,
    overdueCount,
    paidPercentage: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0,
  };
};

// Project-specific statistics selector
export const selectProjectPaymentSchedulesStats = (projectId: string) =>
  (state: { paymentSchedules: PaymentSchedulesState }) => {
    const projectPayments = state.paymentSchedules.byProject[projectId] || [];
    const now = new Date();

    const totalAmount = projectPayments.reduce((sum, ps) => sum + ps.amount, 0);
    const paidAmount = projectPayments.filter(ps => ps.isPaid).reduce((sum, ps) => sum + ps.amount, 0);
    const unpaidAmount = projectPayments.filter(ps => !ps.isPaid).reduce((sum, ps) => sum + ps.amount, 0);
    const overdueAmount = projectPayments
      .filter(ps => !ps.isPaid && new Date(ps.expectedDate) < now)
      .reduce((sum, ps) => sum + ps.amount, 0);

    return {
      totalAmount,
      paidAmount,
      unpaidAmount,
      overdueAmount,
      paidPercentage: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0,
    };
  };
