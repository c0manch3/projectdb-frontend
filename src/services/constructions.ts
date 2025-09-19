import { apiRequest } from './api';
import { Construction, Document } from '../store/types';

// DTOs for construction operations
export interface CreateConstructionDto {
  name: string;
  projectId: string;
}

export interface UpdateConstructionDto {
  name?: string;
}

export interface ConstructionsFilters {
  projectId?: string;
  search?: string;
}

// DTOs for document operations
export interface UploadDocumentDto {
  file: File;
  type: 'km' | 'kz' | 'rpz' | 'tz' | 'gp' | 'igi' | 'spozu' | 'contract';
  context: 'initial_data' | 'project_doc';
  projectId: string;
  constructionId?: string | undefined;
}

export interface DocumentsFilters {
  projectId?: string;
  constructionId?: string;
  type?: 'km' | 'kz' | 'rpz' | 'tz' | 'gp' | 'igi' | 'spozu' | 'contract';
  context?: 'initial_data' | 'project_doc';
}

// API response types
export interface ConstructionsApiResponse {
  constructions: Construction[];
  total: number;
}

export interface ConstructionApiResponse {
  construction: Construction;
}

export interface DocumentsApiResponse {
  documents: Document[];
  total: number;
}

export interface DocumentApiResponse {
  document: Document;
}

export interface ConstructionStatsResponse {
  total: number;
  documentsCount: number;
  lastUpdated: string | null;
}

// Constructions service with all CRUD operations
export const constructionsService = {
  // Get all constructions with optional filters
  async getConstructions(filters?: ConstructionsFilters): Promise<Construction[]> {
    try {
      const params = new URLSearchParams();

      if (filters?.projectId) {
        params.append('projectId', filters.projectId);
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }

      const queryString = params.toString();
      const url = queryString ? `/construction?${queryString}` : '/construction';

      const response = await apiRequest.get<Construction[]>(url);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching constructions:', error);
      if (error.response?.status === 403) {
        throw new Error('У вас нет прав для просмотра списка сооружений');
      } else if (error.response?.status >= 500) {
        throw new Error('Ошибка сервера при загрузке сооружений');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке списка сооружений');
    }
  },

  // Get constructions by project ID
  async getConstructionsByProject(projectId: string): Promise<Construction[]> {
    try {
      const response = await apiRequest.get<Construction[]>(`/construction?projectId=${projectId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching constructions by project:', error);
      if (error.response?.status === 403) {
        throw new Error('У вас нет прав для просмотра сооружений данного проекта');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке сооружений проекта');
    }
  },

  // Get construction by ID
  async getConstructionById(id: string): Promise<Construction> {
    try {
      const response = await apiRequest.get<Construction>(`/construction/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching construction:', error);
      if (error.response?.status === 404) {
        throw new Error('Сооружение не найдено');
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для просмотра данных сооружения');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке данных сооружения');
    }
  },

  // Create new construction
  async createConstruction(constructionData: CreateConstructionDto): Promise<Construction> {
    try {
      // Validate required fields
      if (!constructionData.name?.trim()) {
        throw new Error('Название сооружения обязательно для заполнения');
      }
      if (!constructionData.projectId) {
        throw new Error('ID проекта обязательно для заполнения');
      }

      // Validate name length
      if (constructionData.name.length > 200) {
        throw new Error('Название сооружения не должно превышать 200 символов');
      }

      const response = await apiRequest.post<Construction>('/construction/create', constructionData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating construction:', error);
      if (error.response?.status === 403) {
        throw new Error('У вас нет прав для создания сооружений');
      } else if (error.response?.status === 409) {
        throw new Error('Сооружение с таким названием уже существует в данном проекте');
      } else if (error.response?.status >= 500) {
        throw new Error('Ошибка сервера при создании сооружения');
      }

      // Return the validation error if it's a client error
      if (error.message && !error.response) {
        throw error;
      }

      throw new Error(error.response?.data?.message || 'Ошибка при создании сооружения');
    }
  },

  // Update construction
  async updateConstruction(id: string, constructionData: UpdateConstructionDto): Promise<Construction> {
    try {
      // Validate name if provided
      if (constructionData.name !== undefined) {
        if (!constructionData.name.trim()) {
          throw new Error('Название сооружения не может быть пустым');
        }
        if (constructionData.name.length > 200) {
          throw new Error('Название сооружения не должно превышать 200 символов');
        }
      }

      const response = await apiRequest.patch<Construction>(`/construction/${id}`, constructionData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating construction:', error);
      if (error.response?.status === 404) {
        throw new Error('Сооружение не найдено');
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для редактирования этого сооружения');
      } else if (error.response?.status === 409) {
        throw new Error('Сооружение с таким названием уже существует в данном проекте');
      }

      // Return the validation error if it's a client error
      if (error.message && !error.response) {
        throw error;
      }

      throw new Error(error.response?.data?.message || 'Ошибка при обновлении сооружения');
    }
  },

  // Delete construction
  async deleteConstruction(id: string): Promise<void> {
    try {
      await apiRequest.delete(`/construction/${id}`);
    } catch (error: any) {
      console.error('Error deleting construction:', error);
      if (error.response?.status === 404) {
        throw new Error('Сооружение не найдено');
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для удаления этого сооружения');
      } else if (error.response?.status === 409) {
        throw new Error('Невозможно удалить сооружение - к нему привязаны документы');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при удалении сооружения');
    }
  },

  // Get construction statistics
  async getConstructionStats(constructionId: string): Promise<ConstructionStatsResponse> {
    try {
      const response = await apiRequest.get<ConstructionStatsResponse>(`/construction/${constructionId}/stats`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching construction stats:', error);
      if (error.response?.status === 403) {
        throw new Error('У вас нет прав для просмотра статистики сооружения');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке статистики сооружения');
    }
  },

  // Document operations

  // Get documents with optional filters
  async getDocuments(filters?: DocumentsFilters): Promise<Document[]> {
    try {
      // If constructionId is provided, use the new specific endpoint
      if (filters?.constructionId) {
        const response = await apiRequest.get<Document[]>(`/document/construction/${filters.constructionId}`);
        return response.data;
      }

      // For construction service, we only support constructionId filter
      // Project documents should be fetched via projectsService
      if (filters?.projectId) {
        throw new Error('Project documents should be fetched via projectsService.getProjectDocuments()');
      }

      // For generic document listing (no filters), return empty array
      // Individual construction documents are loaded separately
      return [];
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      if (error.response?.status === 403) {
        throw new Error('У вас нет прав для просмотра списка документов');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке списка документов');
    }
  },

  // Get documents by construction ID
  async getDocumentsByConstruction(constructionId: string): Promise<Document[]> {
    try {
      const response = await apiRequest.get<Document[]>(`/document?constructionId=${constructionId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching documents by construction:', error);
      if (error.response?.status === 403) {
        throw new Error('У вас нет прав для просмотра документов данного сооружения');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке документов сооружения');
    }
  },

  // Upload document
  async uploadDocument(uploadData: UploadDocumentDto, onProgress?: (progress: number) => void): Promise<Document> {
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
        'image/dwg',
        'application/dwg',
        'application/autocad',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/bmp',
        'image/webp',
        'image/svg+xml'
      ];

      if (!allowedTypes.includes(uploadData.file.type)) {
        throw new Error('Неподдерживаемый тип файла. Поддерживаются: PDF, DOC, DOCX, XLS, XLSX, DWG, JPG, PNG, GIF, BMP, WebP, SVG');
      }

      // Validate required fields
      if (!uploadData.type) {
        throw new Error('Тип документа обязателен для заполнения');
      }
      if (!uploadData.context) {
        throw new Error('Контекст документа обязателен для заполнения');
      }
      if (!uploadData.projectId) {
        throw new Error('ID проекта обязателен для заполнения');
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('type', uploadData.type);
      formData.append('context', uploadData.context);
      formData.append('projectId', uploadData.projectId);

      if (uploadData.constructionId) {
        formData.append('constructionId', uploadData.constructionId);
      }

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
      console.error('Error uploading document:', error);
      if (error.response?.status === 403) {
        throw new Error('У вас нет прав для загрузки документов');
      } else if (error.response?.status === 413) {
        throw new Error('Файл слишком большой для загрузки');
      } else if (error.response?.status >= 500) {
        throw new Error('Ошибка сервера при загрузке файла');
      }

      // Return the validation error if it's a client error
      if (error.message && !error.response) {
        throw error;
      }

      throw new Error(error.response?.data?.message || 'Ошибка при загрузке документа');
    }
  },

  // Download document
  async downloadDocument(documentId: string, originalName: string): Promise<void> {
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
      console.error('Error downloading document:', error);
      if (error.response?.status === 404) {
        throw new Error('Документ не найден');
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для скачивания этого документа');
      }
      throw new Error('Ошибка при скачивании документа');
    }
  },

  // Delete document
  async deleteDocument(documentId: string): Promise<void> {
    try {
      await apiRequest.delete(`/document/${documentId}`);
    } catch (error: any) {
      console.error('Error deleting document:', error);
      if (error.response?.status === 404) {
        throw new Error('Документ не найден');
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для удаления этого документа');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при удалении документа');
    }
  },

  // Get document by ID
  async getDocumentById(documentId: string): Promise<Document> {
    try {
      const response = await apiRequest.get<Document>(`/document/${documentId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching document:', error);
      if (error.response?.status === 404) {
        throw new Error('Документ не найден');
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для просмотра этого документа');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке данных документа');
    }
  },

  // Helper function to get readable file size
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Helper function to get document type label
  getDocumentTypeLabel: (type: string): string => {
    switch (type) {
      case 'km':
        return 'КМ';
      case 'kz':
        return 'КЖ';
      case 'rpz':
        return 'РПЗ';
      case 'tz':
        return 'ТЗ';
      case 'gp':
        return 'ГП';
      case 'igi':
        return 'ИГИ';
      case 'spozu':
        return 'СПОЗУ';
      case 'contract':
        return 'Договор';
      default:
        return type.toUpperCase();
    }
  },

  // Helper function to get document context label
  getDocumentContextLabel: (context: string): string => {
    switch (context) {
      case 'initial_data':
        return 'Исходные данные';
      case 'project_doc':
        return 'Проектная документация';
      default:
        return context;
    }
  }
};