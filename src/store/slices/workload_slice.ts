import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { WorkloadState, WorkloadPlan, WorkloadActual, UnifiedWorkload, User, Project } from '../types';
import {
  workloadService,
  CreateWorkloadPlanDto,
  UpdateWorkloadPlanDto,
  CreateWorkloadActualDto,
  UpdateWorkloadActualDto,
  WorkloadFilters,
  WorkloadStatsResponse
} from '../../services/workload';

// Extended WorkloadState with additional fields
interface ExtendedWorkloadState extends WorkloadState {
  employees: User[];
  projects: Project[];
}

// Initial state
const initialState: ExtendedWorkloadState = {
  // Data arrays
  plans: [],
  actuals: [],
  unified: [],
  current: null,

  // Filters
  filters: {},

  // UI state
  view: 'month',
  activeTab: 'planned',
  selectedDate: new Date().toISOString().split('T')[0], // Today

  // Loading states
  loading: false,
  planLoading: false,
  actualLoading: false,
  unifiedLoading: false,
  error: null,

  // Statistics
  stats: null,
  statsLoading: false,

  // Additional data
  employees: [],
  projects: [],
};

// === ASYNC THUNKS FOR WORKLOAD PLAN OPERATIONS ===

// Fetch all workload plans
export const fetchWorkloadPlans = createAsyncThunk(
  'workload/fetchWorkloadPlans',
  async (_, { rejectWithValue }) => {
    try {
      const plans = await workloadService.getWorkloadPlans();
      return plans;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке планов рабочей нагрузки');
    }
  }
);

// Fetch workload plan by ID
export const fetchWorkloadPlanById = createAsyncThunk(
  'workload/fetchWorkloadPlanById',
  async (id: string, { rejectWithValue }) => {
    try {
      const plan = await workloadService.getWorkloadPlanById(id);
      return plan;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке плана');
    }
  }
);

// Create new workload plan
export const createWorkloadPlan = createAsyncThunk(
  'workload/createWorkloadPlan',
  async (planData: CreateWorkloadPlanDto, { rejectWithValue }) => {
    try {
      const newPlan = await workloadService.createWorkloadPlan(planData);
      return newPlan;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при создании плана');
    }
  }
);

// Update workload plan
export const updateWorkloadPlan = createAsyncThunk(
  'workload/updateWorkloadPlan',
  async ({ id, data }: { id: string; data: UpdateWorkloadPlanDto }, { rejectWithValue }) => {
    try {
      const updatedPlan = await workloadService.updateWorkloadPlan(id, data);
      return updatedPlan;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при обновлении плана');
    }
  }
);

// Delete workload plan
export const deleteWorkloadPlan = createAsyncThunk(
  'workload/deleteWorkloadPlan',
  async (id: string, { rejectWithValue }) => {
    try {
      await workloadService.deleteWorkloadPlan(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при удалении плана');
    }
  }
);

// === ASYNC THUNKS FOR WORKLOAD ACTUAL OPERATIONS ===

// Fetch all workload actuals
export const fetchWorkloadActuals = createAsyncThunk(
  'workload/fetchWorkloadActuals',
  async (_, { rejectWithValue }) => {
    try {
      const actuals = await workloadService.getWorkloadActuals();
      return actuals;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке фактической нагрузки');
    }
  }
);

// Fetch workload actual by ID
export const fetchWorkloadActualById = createAsyncThunk(
  'workload/fetchWorkloadActualById',
  async (id: string, { rejectWithValue }) => {
    try {
      const actual = await workloadService.getWorkloadActualById(id);
      return actual;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке записи');
    }
  }
);

// Create new workload actual
export const createWorkloadActual = createAsyncThunk(
  'workload/createWorkloadActual',
  async (actualData: CreateWorkloadActualDto, { rejectWithValue }) => {
    try {
      const newActual = await workloadService.createWorkloadActual(actualData);
      return newActual;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при создании записи');
    }
  }
);

// Update workload actual
export const updateWorkloadActual = createAsyncThunk(
  'workload/updateWorkloadActual',
  async ({ id, data }: { id: string; data: UpdateWorkloadActualDto }, { rejectWithValue }) => {
    try {
      const updatedActual = await workloadService.updateWorkloadActual(id, data);
      return updatedActual;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при обновлении записи');
    }
  }
);

// Delete workload actual
export const deleteWorkloadActual = createAsyncThunk(
  'workload/deleteWorkloadActual',
  async (id: string, { rejectWithValue }) => {
    try {
      await workloadService.deleteWorkloadActual(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при удалении записи');
    }
  }
);

// === ASYNC THUNKS FOR UNIFIED WORKLOAD OPERATIONS ===

// Fetch unified workload data
export const fetchUnifiedWorkload = createAsyncThunk(
  'workload/fetchUnifiedWorkload',
  async (filters: WorkloadFilters | undefined = undefined, { rejectWithValue, getState }) => {
    try {
      // Get current user role from auth state
      const state = getState() as any;
      const userRole = state.auth?.user?.role;

      const unified = await workloadService.getUnifiedWorkload(filters, userRole);
      return unified;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке рабочей нагрузки');
    }
  }
);

// Fetch workload statistics
export const fetchWorkloadStats = createAsyncThunk(
  'workload/fetchWorkloadStats',
  async (filters: WorkloadFilters | undefined = undefined, { rejectWithValue, getState }) => {
    try {
      // Get current user role from auth state
      const state = getState() as any;
      const userRole = state.auth?.user?.role;

      const stats = await workloadService.getWorkloadStats(filters, userRole);
      return stats;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке статистики');
    }
  }
);

// === ASYNC THUNKS FOR AUXILIARY DATA ===

// Fetch employees for workload management
export const fetchWorkloadEmployees = createAsyncThunk(
  'workload/fetchWorkloadEmployees',
  async (_, { rejectWithValue }) => {
    try {
      const employees = await workloadService.getEmployees();
      return employees;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке сотрудников');
    }
  }
);

// Fetch projects for workload management
export const fetchWorkloadProjects = createAsyncThunk(
  'workload/fetchWorkloadProjects',
  async (managerId: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const projects = await workloadService.getProjects(managerId);
      return projects;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке проектов');
    }
  }
);

// === WORKLOAD SLICE ===
const workloadSlice = createSlice({
  name: 'workload',
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

    // Set current workload record
    setCurrentWorkload: (state, action: PayloadAction<UnifiedWorkload | null>) => {
      state.current = action.payload;
    },

    // Update filters
    updateFilters: (state, action: PayloadAction<Partial<WorkloadFilters>>) => {
      state.filters = action.payload;
    },

    // Reset filters
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Update view type
    updateView: (state, action: PayloadAction<'week' | 'month'>) => {
      state.view = action.payload;
    },

    // Update active tab
    updateActiveTab: (state, action: PayloadAction<'planned' | 'actual' | 'comparison'>) => {
      state.activeTab = action.payload;
    },

    // Update selected date
    updateSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },

    // Add new plan
    addPlan: (state, action: PayloadAction<WorkloadPlan>) => {
      state.plans.unshift(action.payload);
    },

    // Update plan
    updatePlanAction: (state, action: PayloadAction<WorkloadPlan>) => {
      const index = state.plans.findIndex(plan => plan.id === action.payload.id);
      if (index !== -1) {
        state.plans[index] = action.payload;
      }
    },

    // Remove plan
    removePlan: (state, action: PayloadAction<string>) => {
      state.plans = state.plans.filter(plan => plan.id !== action.payload);
    },

    // Add new actual
    addActual: (state, action: PayloadAction<WorkloadActual>) => {
      state.actuals.unshift(action.payload);
    },

    // Update actual
    updateActualAction: (state, action: PayloadAction<WorkloadActual>) => {
      const index = state.actuals.findIndex(actual => actual.id === action.payload.id);
      if (index !== -1) {
        state.actuals[index] = action.payload;
      }
    },

    // Remove actual
    removeActual: (state, action: PayloadAction<string>) => {
      state.actuals = state.actuals.filter(actual => actual.id !== action.payload);
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset workload state
    resetWorkloadState: () => initialState,
  },
  extraReducers: (builder) => {
    // === WORKLOAD PLANS ===
    builder
      // Fetch workload plans
      .addCase(fetchWorkloadPlans.pending, (state) => {
        state.planLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkloadPlans.fulfilled, (state, action) => {
        state.planLoading = false;
        state.plans = action.payload;
      })
      .addCase(fetchWorkloadPlans.rejected, (state, action) => {
        state.planLoading = false;
        state.error = action.payload as string;
      })

      // Create workload plan
      .addCase(createWorkloadPlan.pending, (state) => {
        state.planLoading = true;
        state.error = null;
      })
      .addCase(createWorkloadPlan.fulfilled, (state, action) => {
        state.planLoading = false;
        state.plans.unshift(action.payload);
      })
      .addCase(createWorkloadPlan.rejected, (state, action) => {
        state.planLoading = false;
        state.error = action.payload as string;
      })

      // Update workload plan
      .addCase(updateWorkloadPlan.pending, (state) => {
        state.planLoading = true;
        state.error = null;
      })
      .addCase(updateWorkloadPlan.fulfilled, (state, action) => {
        state.planLoading = false;
        const index = state.plans.findIndex(plan => plan.id === action.payload.id);
        if (index !== -1) {
          state.plans[index] = action.payload;
        }
      })
      .addCase(updateWorkloadPlan.rejected, (state, action) => {
        state.planLoading = false;
        state.error = action.payload as string;
      })

      // Delete workload plan
      .addCase(deleteWorkloadPlan.pending, (state) => {
        state.planLoading = true;
        state.error = null;
      })
      .addCase(deleteWorkloadPlan.fulfilled, (state, action) => {
        state.planLoading = false;
        state.plans = state.plans.filter(plan => plan.id !== action.payload);
      })
      .addCase(deleteWorkloadPlan.rejected, (state, action) => {
        state.planLoading = false;
        state.error = action.payload as string;
      })

      // === WORKLOAD ACTUALS ===
      // Fetch workload actuals
      .addCase(fetchWorkloadActuals.pending, (state) => {
        state.actualLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkloadActuals.fulfilled, (state, action) => {
        state.actualLoading = false;
        state.actuals = action.payload;
      })
      .addCase(fetchWorkloadActuals.rejected, (state, action) => {
        state.actualLoading = false;
        state.error = action.payload as string;
      })

      // Create workload actual
      .addCase(createWorkloadActual.pending, (state) => {
        state.actualLoading = true;
        state.error = null;
      })
      .addCase(createWorkloadActual.fulfilled, (state, action) => {
        state.actualLoading = false;
        state.actuals.unshift(action.payload);
      })
      .addCase(createWorkloadActual.rejected, (state, action) => {
        state.actualLoading = false;
        state.error = action.payload as string;
      })

      // Update workload actual
      .addCase(updateWorkloadActual.pending, (state) => {
        state.actualLoading = true;
        state.error = null;
      })
      .addCase(updateWorkloadActual.fulfilled, (state, action) => {
        state.actualLoading = false;
        const index = state.actuals.findIndex(actual => actual.id === action.payload.id);
        if (index !== -1) {
          state.actuals[index] = action.payload;
        }
      })
      .addCase(updateWorkloadActual.rejected, (state, action) => {
        state.actualLoading = false;
        state.error = action.payload as string;
      })

      // Delete workload actual
      .addCase(deleteWorkloadActual.pending, (state) => {
        state.actualLoading = true;
        state.error = null;
      })
      .addCase(deleteWorkloadActual.fulfilled, (state, action) => {
        state.actualLoading = false;
        state.actuals = state.actuals.filter(actual => actual.id !== action.payload);
      })
      .addCase(deleteWorkloadActual.rejected, (state, action) => {
        state.actualLoading = false;
        state.error = action.payload as string;
      })

      // === UNIFIED WORKLOAD ===
      // Fetch unified workload
      .addCase(fetchUnifiedWorkload.pending, (state) => {
        state.unifiedLoading = true;
        state.error = null;
      })
      .addCase(fetchUnifiedWorkload.fulfilled, (state, action) => {
        state.unifiedLoading = false;
        state.unified = action.payload;
      })
      .addCase(fetchUnifiedWorkload.rejected, (state, action) => {
        state.unifiedLoading = false;
        state.error = action.payload as string;
      })

      // === STATISTICS ===
      // Fetch workload stats
      .addCase(fetchWorkloadStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchWorkloadStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchWorkloadStats.rejected, (state, action) => {
        state.statsLoading = false;
        // Don't set error for stats, it's not critical
      })

      // === AUXILIARY DATA ===
      // Fetch employees
      .addCase(fetchWorkloadEmployees.fulfilled, (state, action) => {
        state.employees = action.payload;
      })

      // Fetch projects
      .addCase(fetchWorkloadProjects.fulfilled, (state, action) => {
        state.projects = action.payload;
      });
  },
});

// Export actions
export const {
  setLoading,
  setError,
  setCurrentWorkload,
  updateFilters,
  resetFilters,
  updateView,
  updateActiveTab,
  updateSelectedDate,
  addPlan,
  updatePlanAction,
  removePlan,
  addActual,
  updateActualAction,
  removeActual,
  clearError,
  resetWorkloadState,
} = workloadSlice.actions;

// Export reducer
export default workloadSlice.reducer;

// === SELECTORS ===
export const selectWorkload = (state: { workload: ExtendedWorkloadState }) => state.workload;
export const selectWorkloadPlans = (state: { workload: ExtendedWorkloadState }) => state.workload.plans;
export const selectWorkloadActuals = (state: { workload: ExtendedWorkloadState }) => state.workload.actuals;
export const selectUnifiedWorkload = (state: { workload: ExtendedWorkloadState }) => state.workload.unified;
export const selectCurrentWorkload = (state: { workload: ExtendedWorkloadState }) => state.workload.current;
export const selectWorkloadFilters = (state: { workload: ExtendedWorkloadState }) => state.workload.filters;
export const selectWorkloadView = (state: { workload: ExtendedWorkloadState }) => state.workload.view;
export const selectWorkloadActiveTab = (state: { workload: ExtendedWorkloadState }) => state.workload.activeTab;
export const selectWorkloadSelectedDate = (state: { workload: ExtendedWorkloadState }) => state.workload.selectedDate;
export const selectWorkloadLoading = (state: { workload: ExtendedWorkloadState }) => state.workload.loading;
export const selectWorkloadPlanLoading = (state: { workload: ExtendedWorkloadState }) => state.workload.planLoading;
export const selectWorkloadActualLoading = (state: { workload: ExtendedWorkloadState }) => state.workload.actualLoading;
export const selectWorkloadUnifiedLoading = (state: { workload: ExtendedWorkloadState }) => state.workload.unifiedLoading;
export const selectWorkloadError = (state: { workload: ExtendedWorkloadState }) => state.workload.error;
export const selectWorkloadStats = (state: { workload: ExtendedWorkloadState }) => state.workload.stats;
export const selectWorkloadStatsLoading = (state: { workload: ExtendedWorkloadState }) => state.workload.statsLoading;
export const selectWorkloadEmployees = (state: { workload: ExtendedWorkloadState }) => state.workload.employees;
export const selectWorkloadProjects = (state: { workload: ExtendedWorkloadState }) => state.workload.projects;

// Complex selectors
export const selectFilteredUnifiedWorkload = (state: { workload: ExtendedWorkloadState }) => {
  const { unified, filters } = state.workload;
  return unified.filter(workload => {
    // Apply userId filter
    if (filters.userId && workload.userId !== filters.userId) return false;

    // Apply projectId filter
    if (filters.projectId && workload.projectId !== filters.projectId) return false;

    // Apply type filter
    if (filters.type === 'plan' && !workload.planId) return false;
    if (filters.type === 'actual' && !workload.actualId) return false;

    // Apply date range filters
    if (filters.startDate && workload.date < filters.startDate) return false;
    if (filters.endDate && workload.date > filters.endDate) return false;

    return true;
  });
};

export const selectWorkloadByDate = (state: { workload: ExtendedWorkloadState }, date: string) => {
  return state.workload.unified.filter(workload => workload.date === date);
};

export const selectWorkloadByUser = (state: { workload: ExtendedWorkloadState }, userId: string) => {
  return state.workload.unified.filter(workload => workload.userId === userId);
};

export const selectWorkloadByProject = (state: { workload: ExtendedWorkloadState }, projectId: string) => {
  return state.workload.unified.filter(workload => workload.projectId === projectId);
};

// Helper selectors for employee and project name lookup
export const selectEmployeeById = (state: { workload: ExtendedWorkloadState }, userId: string) => {
  return state.workload.employees.find(employee => employee.id === userId) || null;
};

export const selectProjectById = (state: { workload: ExtendedWorkloadState }, projectId: string) => {
  return state.workload.projects.find(project => project.id === projectId) || null;
};