import { apiRequest } from './api';
import { Project, User, Company } from '../store/types';

// DTOs for project operations
export interface CreateProjectDto {
  name: string;
  customerId: string;
  contractDate: string; // ISO date string
  expirationDate: string; // ISO date string
  cost: number;
  type: 'main' | 'additional';
  managerId?: string;
  mainProjectId?: string; // Required when type is 'additional'
}

export interface UpdateProjectDto {
  name?: string;
  customerId?: string;
  contractDate?: string;
  expirationDate?: string;
  cost?: number;
  type?: 'main' | 'additional';
  managerId?: string;
  mainProjectId?: string;
  status?: 'active' | 'completed' | 'overdue';
}

export interface ProjectsFilters {
  status?: 'all' | 'active' | 'completed' | 'overdue';
  customerId?: string;
  managerId?: string;
  type?: 'all' | 'main' | 'additional';
  search?: string;
}

// API response types
export interface ProjectsApiResponse {
  projects: Project[];
  total: number;
}

export interface ProjectApiResponse {
  project: Project;
}

export interface ProjectStatsResponse {
  total: number;
  active: number;
  completed: number;
  overdue: number;
  totalCost: number;
  averageCost: number;
}

// Project service with all CRUD operations
export const projectsService = {
  // Get all projects with optional filters
  async getProjects(filters?: ProjectsFilters): Promise<Project[]> {
    try {
      const params = new URLSearchParams();

      if (filters?.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters?.customerId) {
        params.append('customerId', filters.customerId);
      }
      if (filters?.managerId) {
        params.append('managerId', filters.managerId);
      }
      if (filters?.type && filters.type !== 'all') {
        params.append('type', filters.type);
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }

      const queryString = params.toString();
      const url = queryString ? `/projects?${queryString}` : '/projects';

      const response = await apiRequest.get<Project[]>(url);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      if (error.response?.status === 403) {
        throw new Error('У вас нет прав для просмотра списка проектов');
      } else if (error.response?.status >= 500) {
        throw new Error('Ошибка сервера при загрузке проектов');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке списка проектов');
    }
  },

  // Get project by ID
  async getProjectById(id: string): Promise<Project> {
    try {
      const response = await apiRequest.get<Project>(`/projects/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching project:', error);
      if (error.response?.status === 404) {
        throw new Error('Проект не найден');
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для просмотра данных проекта');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке данных проекта');
    }
  },

  // Create new project
  async createProject(projectData: CreateProjectDto): Promise<Project> {
    try {
      // Validate required fields
      const requiredFields: (keyof CreateProjectDto)[] = [
        'name', 'customerId', 'contractDate', 'expirationDate', 'cost', 'type'
      ];

      for (const field of requiredFields) {
        if (!projectData[field]) {
          throw new Error(`Поле "${field}" обязательно для заполнения`);
        }
      }

      // Validate additional project specific requirements
      if (projectData.type === 'additional' && !projectData.mainProjectId) {
        throw new Error('Для дополнительного соглашения необходимо выбрать основной проект');
      }

      // Validate dates
      const contractDate = new Date(projectData.contractDate);
      const expirationDate = new Date(projectData.expirationDate);

      if (contractDate >= expirationDate) {
        throw new Error('Срок сдачи должен быть позже даты договора');
      }

      // Validate cost
      if (projectData.cost <= 0) {
        throw new Error('Стоимость проекта должна быть больше нуля');
      }

      const response = await apiRequest.post<Project>('/projects', projectData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating project:', error);
      if (error.response?.status === 403) {
        throw new Error('У вас нет прав для создания проектов');
      } else if (error.response?.status === 409) {
        throw new Error('Проект с таким названием уже существует');
      } else if (error.response?.status >= 500) {
        throw new Error('Ошибка сервера при создании проекта');
      }

      // Return the validation error if it's a client error
      if (error.message && !error.response) {
        throw error;
      }

      throw new Error(error.response?.data?.message || 'Ошибка при создании проекта');
    }
  },

  // Update project
  async updateProject(id: string, projectData: UpdateProjectDto): Promise<Project> {
    try {
      // Validate dates if both are provided
      if (projectData.contractDate && projectData.expirationDate) {
        const contractDate = new Date(projectData.contractDate);
        const expirationDate = new Date(projectData.expirationDate);

        if (contractDate >= expirationDate) {
          throw new Error('Срок сдачи должен быть позже даты договора');
        }
      }

      // Validate cost if provided
      if (projectData.cost !== undefined && projectData.cost <= 0) {
        throw new Error('Стоимость проекта должна быть больше нуля');
      }

      // Validate additional project specific requirements
      if (projectData.type === 'additional' && !projectData.mainProjectId) {
        throw new Error('Для дополнительного соглашения необходимо выбрать основной проект');
      }

      const response = await apiRequest.put<Project>(`/projects/${id}`, projectData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating project:', error);
      if (error.response?.status === 404) {
        throw new Error('Проект не найден');
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для редактирования этого проекта');
      } else if (error.response?.status === 409) {
        throw new Error('Проект с таким названием уже существует');
      }

      // Return the validation error if it's a client error
      if (error.message && !error.response) {
        throw error;
      }

      throw new Error(error.response?.data?.message || 'Ошибка при обновлении проекта');
    }
  },

  // Delete project
  async deleteProject(id: string): Promise<void> {
    try {
      await apiRequest.delete(`/projects/${id}`);
    } catch (error: any) {
      console.error('Error deleting project:', error);
      if (error.response?.status === 404) {
        throw new Error('Проект не найден');
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для удаления этого проекта');
      } else if (error.response?.status === 409) {
        throw new Error('Невозможно удалить проект - к нему привязаны документы или другие данные');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при удалении проекта');
    }
  },

  // Get project statistics
  async getProjectStats(): Promise<ProjectStatsResponse> {
    try {
      const response = await apiRequest.get<ProjectStatsResponse>('/projects/stats');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching project stats:', error);
      if (error.response?.status === 403) {
        throw new Error('У вас нет прав для просмотра статистики проектов');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке статистики проектов');
    }
  },

  // Get customers for forms (companies with type 'Customer')
  async getCustomers(): Promise<Company[]> {
    try {
      const response = await apiRequest.get<Company[]>('/companies?type=Customer');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке списка заказчиков');
    }
  },

  // Get managers for forms (users with role 'Manager' or 'Admin')
  async getManagers(): Promise<User[]> {
    try {
      const response = await apiRequest.get<User[]>('/auth?role=Manager,Admin');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching managers:', error);
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке списка менеджеров');
    }
  },

  // Get main projects for additional projects
  async getMainProjects(): Promise<Project[]> {
    try {
      const response = await apiRequest.get<Project[]>('/projects?type=main');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching main projects:', error);
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке основных проектов');
    }
  }
};