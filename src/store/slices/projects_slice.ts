import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ProjectsState, Project } from '../types';

// Initial state
const initialState: ProjectsState = {
  list: [],
  current: null,
  filters: {
    status: 'all',
    customerId: null,
    managerId: null,
    type: 'all',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
  loading: false,
  error: null,
};

// Projects slice
const projectsSlice = createSlice({
  name: 'projects',
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

    // Set projects list
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.list = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Add new project
    addProject: (state, action: PayloadAction<Project>) => {
      state.list.unshift(action.payload);
      state.pagination.total += 1;
    },

    // Update project
    updateProject: (state, action: PayloadAction<Project>) => {
      const index = state.list.findIndex(project => project.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
      if (state.current && state.current.id === action.payload.id) {
        state.current = action.payload;
      }
    },

    // Remove project
    removeProject: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter(project => project.id !== action.payload);
      if (state.current && state.current.id === action.payload) {
        state.current = null;
      }
      state.pagination.total -= 1;
    },

    // Set current project
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.current = action.payload;
    },

    // Update filters
    updateFilters: (state, action: PayloadAction<Partial<typeof initialState.filters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset to first page when filters change
      state.pagination.page = 1;
    },

    // Reset filters
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },

    // Update pagination
    updatePagination: (state, action: PayloadAction<Partial<typeof initialState.pagination>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },

    // Set pagination
    setPagination: (state, action: PayloadAction<typeof initialState.pagination>) => {
      state.pagination = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset projects state
    resetProjectsState: () => initialState,
  },
});

// Export actions
export const {
  setLoading,
  setError,
  setProjects,
  addProject,
  updateProject,
  removeProject,
  setCurrentProject,
  updateFilters,
  resetFilters,
  updatePagination,
  setPagination,
  clearError,
  resetProjectsState,
} = projectsSlice.actions;

// Export reducer
export default projectsSlice.reducer;

// Selectors
export const selectProjects = (state: { projects: ProjectsState }) => state.projects;
export const selectProjectsList = (state: { projects: ProjectsState }) => state.projects.list;
export const selectCurrentProject = (state: { projects: ProjectsState }) => state.projects.current;
export const selectProjectsFilters = (state: { projects: ProjectsState }) => state.projects.filters;
export const selectProjectsPagination = (state: { projects: ProjectsState }) => state.projects.pagination;
export const selectProjectsLoading = (state: { projects: ProjectsState }) => state.projects.loading;
export const selectProjectsError = (state: { projects: ProjectsState }) => state.projects.error;

// Complex selectors
export const selectFilteredProjects = (state: { projects: ProjectsState }) => {
  const { list, filters } = state.projects;
  return list.filter(project => {
    if (filters.status !== 'all' && project.status !== filters.status) return false;
    if (filters.customerId && project.customerId !== filters.customerId) return false;
    if (filters.managerId && project.managerId !== filters.managerId) return false;
    if (filters.type !== 'all' && project.type !== filters.type) return false;
    return true;
  });
};

export const selectProjectById = (state: { projects: ProjectsState }, projectId: string) => {
  return state.projects.list.find(project => project.id === projectId) || null;
};