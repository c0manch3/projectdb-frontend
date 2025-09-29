import { apiRequest } from './api';
import { Project, User, Company, Document } from '../store/types';

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
  status?: 'Active' | 'Completed';
}

export interface ProjectsFilters {
  status?: 'all' | 'Active' | 'Completed';
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
  totalCost: number;
  averageCost: number;
}

// Project document DTOs
export interface UploadProjectDocumentDto {
  file: File;
  type: 'tz' | 'contract'; // Only TZ and Contract for projects
  projectId: string;
}

export interface ProjectDocumentsFilters {
  projectId: string;
  type?: 'tz' | 'contract';
}

// Project service with all CRUD operations
export const projectsService = {
  // Get all projects with optional filters
  async getProjects(filters?: ProjectsFilters): Promise<Project[]> {
    try {
      // Build query parameters for backend filtering
      const params = new URLSearchParams();

      if (filters?.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }

      const url = params.toString() ? `/project?${params.toString()}` : '/project';
      const response = await apiRequest.get<Project[]>(url);
      let projects = response.data;

      // Apply remaining frontend filtering (for filters not supported by backend yet)
      if (filters) {
        if (filters.customerId) {
          projects = projects.filter(p => p.customerId === filters.customerId);
        }
        if (filters.managerId) {
          projects = projects.filter(p => p.managerId === filters.managerId);
        }
        if (filters.type && filters.type !== 'all') {
          projects = projects.filter(p => p.type === filters.type);
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          projects = projects.filter(p => p.name.toLowerCase().includes(searchLower));
        }
      }

      return projects;
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
      const response = await apiRequest.get<Project>(`/project/${id}`);
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

      const response = await apiRequest.post<Project>('/project/create', projectData);
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

      const response = await apiRequest.patch<Project>(`/project/${id}`, projectData);
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
      await apiRequest.delete(`/project/${id}`);
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
      // Calculate stats from all projects since backend might not have /stats endpoint
      const projects = await this.getProjects();

      const stats: ProjectStatsResponse = {
        total: projects.length,
        active: projects.filter(p => p.status === 'Active').length,
        completed: projects.filter(p => p.status === 'Completed').length,
        totalCost: projects.reduce((sum, p) => sum + p.cost, 0),
        averageCost: projects.length > 0 ? projects.reduce((sum, p) => sum + p.cost, 0) / projects.length : 0
      };

      return stats;
    } catch (error: any) {
      console.error('Error calculating project stats:', error);
      if (error.response?.status === 403) {
        throw new Error('У вас нет прав для просмотра статистики проектов');
      }
      throw new Error('Ошибка при загрузке статистики проектов');
    }
  },

  // Get customers for forms (companies with type 'Customer')
  async getCustomers(): Promise<Company[]> {
    try {
      const response = await apiRequest.get<Company[]>('/company');
      // Filter only Customer type on frontend
      return response.data.filter(company => company.type === 'Customer');
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке списка заказчиков');
    }
  },

  // Get managers for forms (users with role 'Manager' or 'Admin')
  async getManagers(): Promise<User[]> {
    try {
      const response = await apiRequest.get<User[]>('/auth');
      // Filter only Manager and Admin roles on frontend
      return response.data.filter(user => user.role === 'Manager' || user.role === 'Admin');
    } catch (error: any) {
      console.error('Error fetching managers:', error);
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке списка менеджеров');
    }
  },

  // Get main projects for additional projects
  async getMainProjects(): Promise<Project[]> {
    try {
      const response = await apiRequest.get<Project[]>('/project?type=main');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching main projects:', error);
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке основных проектов');
    }
  },

  // Project Document Operations

  // Get project documents (TZ and Contract)
  async getProjectDocuments(filters: ProjectDocumentsFilters): Promise<Document[]> {
    try {
      const params = new URLSearchParams();

      if (filters.type) {
        params.append('type', filters.type);
      } else {
        // Get both TZ and Contract documents
        params.append('type', 'contract,tz');
      }

      const url = `/document/project/${filters.projectId}?${params.toString()}`;
      const response = await apiRequest.get<Document[]>(url);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching project documents:', error);
      if (error.response?.status === 403) {
        throw new Error('У вас нет прав для просмотра документов проекта');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке документов проекта');
    }
  },

  // Upload project document (TZ or Contract)
  async uploadProjectDocument(uploadData: UploadProjectDocumentDto, onProgress?: (progress: number) => void): Promise<Document> {
    try {
      // Validate file
      if (!uploadData.file) {
        throw new Error('Файл обязателен для загрузки');
      }

      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB in bytes
      if (uploadData.file.size > maxSize) {
        throw new Error('Размер файла не должен превышать 100 МБ');
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/bmp',
        'image/webp',
        'image/svg+xml'
      ];

      if (!allowedTypes.includes(uploadData.file.type)) {
        throw new Error('Неподдерживаемый тип файла. Поддерживаются: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, BMP, WebP, SVG');
      }

      // Validate required fields
      if (!uploadData.type) {
        throw new Error('Тип документа обязателен для заполнения');
      }
      if (!uploadData.projectId) {
        throw new Error('ID проекта обязателен для заполнения');
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('type', uploadData.type);
      formData.append('version', '1'); // Add version field
      formData.append('projectId', uploadData.projectId);

      const response = await apiRequest.post<Document>('/document/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Error uploading project document:', error);
      if (error.response?.status === 403) {
        throw new Error('У вас нет прав для загрузки документов проекта');
      } else if (error.response?.status === 413) {
        throw new Error('Файл слишком большой для загрузки');
      } else if (error.response?.status >= 500) {
        throw new Error('Ошибка сервера при загрузке файла');
      }

      // Return the validation error if it's a client error
      if (error.message && !error.response) {
        throw error;
      }

      throw new Error(error.response?.data?.message || 'Ошибка при загрузке документа проекта');
    }
  },

  // Download project document
  async downloadProjectDocument(documentId: string, originalName: string): Promise<void> {
    try {
      // First, get document info to get the download path
      const docInfoResponse = await apiRequest.get(`/document/${documentId}`);
      const documentInfo = docInfoResponse.data;

      // Then download the file using the path
      const fileResponse = await apiRequest.get(documentInfo.path, {
        responseType: 'blob',
      });

      // Create download link
      const blob = fileResponse.data;
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = originalName || documentInfo.originalName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error downloading project document:', error);
      if (error.response?.status === 404) {
        throw new Error('Документ не найден');
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для скачивания этого документа');
      }
      throw new Error('Ошибка при скачивании документа');
    }
  },

  // Delete project document
  async deleteProjectDocument(documentId: string): Promise<void> {
    try {
      await apiRequest.delete(`/document/${documentId}`);
    } catch (error: any) {
      console.error('Error deleting project document:', error);
      if (error.response?.status === 404) {
        throw new Error('Документ не найден');
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для удаления этого документа');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при удалении документа');
    }
  },

  // Helper functions for project documents
  getProjectDocumentTypeLabel: (type: 'tz' | 'contract'): string => {
    switch (type) {
      case 'tz':
        return 'ТЗ - Техническое задание';
      case 'contract':
        return 'Договор - Договорная документация';
      default:
        return type;
    }
  },

  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};