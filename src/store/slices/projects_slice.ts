import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { ProjectsState, Project, User, Company } from '../types';
import {
  projectsService,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectsFilters,
  ProjectStatsResponse
} from '../../services/projects';

// Extend ProjectsState with additional fields
interface ExtendedProjectsState extends ProjectsState {
  stats: ProjectStatsResponse | null;
  statsLoading: boolean;
  customers: Company[];
  managers: User[];
  mainProjects: Project[];
  searchQuery: string;
}

// Initial state
const initialState: ExtendedProjectsState = {
  list: [],
  current: null,
  filters: {
    status: 'Active',
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
  stats: null,
  statsLoading: false,
  customers: [],
  managers: [],
  mainProjects: [],
  searchQuery: '',
};

// Async thunks for project operations

// Fetch all projects with optional filters
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (filters: ProjectsFilters | undefined = undefined, { rejectWithValue }) => {
    try {
      const projects = await projectsService.getProjects(filters);
      return projects;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке проектов');
    }
  }
);

// Fetch project by ID
export const fetchProjectById = createAsyncThunk(
  'projects/fetchProjectById',
  async (id: string, { rejectWithValue }) => {
    try {
      const project = await projectsService.getProjectById(id);
      return project;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке данных проекта');
    }
  }
);

// Create new project
export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData: CreateProjectDto, { rejectWithValue }) => {
    try {
      const newProject = await projectsService.createProject(projectData);
      return newProject;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при создании проекта');
    }
  }
);

// Update project
export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, data }: { id: string; data: UpdateProjectDto }, { rejectWithValue }) => {
    try {
      const updatedProject = await projectsService.updateProject(id, data);
      return updatedProject;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при обновлении данных проекта');
    }
  }
);

// Delete project
export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (id: string, { rejectWithValue }) => {
    try {
      await projectsService.deleteProject(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при удалении проекта');
    }
  }
);

// Fetch project statistics
export const fetchProjectStats = createAsyncThunk(
  'projects/fetchProjectStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await projectsService.getProjectStats();
      return stats;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке статистики');
    }
  }
);

// Fetch customers for forms
export const fetchCustomers = createAsyncThunk(
  'projects/fetchCustomers',
  async (_, { rejectWithValue }) => {
    try {
      const customers = await projectsService.getCustomers();
      return customers;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке заказчиков');
    }
  }
);

// Fetch managers for forms
export const fetchManagers = createAsyncThunk(
  'projects/fetchManagers',
  async (_, { rejectWithValue }) => {
    try {
      const managers = await projectsService.getManagers();
      return managers;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке менеджеров');
    }
  }
);

// Fetch main projects for additional projects
export const fetchMainProjects = createAsyncThunk(
  'projects/fetchMainProjects',
  async (_, { rejectWithValue }) => {
    try {
      const mainProjects = await projectsService.getMainProjects();
      return mainProjects;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке основных проектов');
    }
  }
);

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
    updateProjectAction: (state, action: PayloadAction<Project>) => {
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

    // Update search query
    updateSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      // Reset to first page when search changes
      state.pagination.page = 1;
    },

    // Reset filters
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.searchQuery = '';
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
  extraReducers: (builder) => {
    // Fetch projects
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
        state.pagination.total = action.payload.length;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Fetch project by ID
      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Create project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Update project
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(project => project.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.current && state.current.id === action.payload.id) {
          state.current = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Delete project
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(project => project.id !== action.payload);
        if (state.current && state.current.id === action.payload) {
          state.current = null;
        }
        state.pagination.total -= 1;
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Fetch project stats
      .addCase(fetchProjectStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchProjectStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchProjectStats.rejected, (state) => {
        state.statsLoading = false;
      })

    // Fetch customers
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.customers = action.payload;
      })

    // Fetch managers
      .addCase(fetchManagers.fulfilled, (state, action) => {
        state.managers = action.payload;
      })

    // Fetch main projects
      .addCase(fetchMainProjects.fulfilled, (state, action) => {
        state.mainProjects = action.payload;
      });
  },
});

// Export actions
export const {
  setLoading,
  setError,
  setProjects,
  addProject,
  updateProjectAction,
  removeProject,
  setCurrentProject,
  updateFilters,
  updateSearchQuery,
  resetFilters,
  updatePagination,
  setPagination,
  clearError,
  resetProjectsState,
} = projectsSlice.actions;

// Export reducer
export default projectsSlice.reducer;

// Selectors
export const selectProjects = (state: { projects: ExtendedProjectsState }) => state.projects;
export const selectProjectsList = (state: { projects: ExtendedProjectsState }) => state.projects.list;
export const selectCurrentProject = (state: { projects: ExtendedProjectsState }) => state.projects.current;
export const selectProjectsFilters = (state: { projects: ExtendedProjectsState }) => state.projects.filters;
export const selectProjectsPagination = (state: { projects: ExtendedProjectsState }) => state.projects.pagination;
export const selectProjectsLoading = (state: { projects: ExtendedProjectsState }) => state.projects.loading;
export const selectProjectsError = (state: { projects: ExtendedProjectsState }) => state.projects.error;
export const selectProjectStats = (state: { projects: ExtendedProjectsState }) => state.projects.stats;
export const selectProjectStatsLoading = (state: { projects: ExtendedProjectsState }) => state.projects.statsLoading;
export const selectProjectCustomers = (state: { projects: ExtendedProjectsState }) => state.projects.customers;
export const selectProjectManagers = (state: { projects: ExtendedProjectsState }) => state.projects.managers;
export const selectMainProjects = (state: { projects: ExtendedProjectsState }) => state.projects.mainProjects;
export const selectProjectSearchQuery = (state: { projects: ExtendedProjectsState }) => state.projects.searchQuery;

// Complex selectors
export const selectFilteredProjects = (state: { projects: ExtendedProjectsState }) => {
  const { list, filters, searchQuery } = state.projects;
  return list.filter(project => {
    // Apply status filter
    if (filters.status !== 'all' && project.status !== filters.status) return false;

    // Apply customer filter
    if (filters.customerId && project.customerId !== filters.customerId) return false;

    // Apply manager filter
    if (filters.managerId && project.managerId !== filters.managerId) return false;

    // Apply type filter
    if (filters.type !== 'all' && project.type !== filters.type) return false;

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchFields = [
        project.name,
        // We could add customer name here if we join the data
      ].filter(Boolean);

      const matchesSearch = searchFields.some(field =>
        field.toLowerCase().includes(query)
      );

      if (!matchesSearch) return false;
    }

    return true;
  });
};

export const selectProjectById = (state: { projects: ExtendedProjectsState }, projectId: string) => {
  return state.projects.list.find(project => project.id === projectId) || null;
};

// Helper selectors for project status
export const selectProjectsByStatus = (state: { projects: ExtendedProjectsState }, status: 'Active' | 'Completed') => {
  return state.projects.list.filter(project => project.status === status);
};

// Helper selector for customer name lookup
export const selectCustomerById = (state: { projects: ExtendedProjectsState }, customerId: string) => {
  return state.projects.customers.find(customer => customer.id === customerId) || null;
};

// Helper selector for manager name lookup
export const selectManagerById = (state: { projects: ExtendedProjectsState }, managerId: string) => {
  return state.projects.managers.find(manager => manager.id === managerId) || null;
};