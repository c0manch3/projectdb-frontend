import { apiRequest } from './api';
import { WorkloadPlan, WorkloadActual, UnifiedWorkload, User, Project } from '../store/types';

// DTOs for workload plan operations
export interface CreateWorkloadPlanDto {
  userId: string;
  projectId: string;
  date: string; // YYYY-MM-DD format
}

export interface UpdateWorkloadPlanDto {
  date?: string; // YYYY-MM-DD format
}

// DTOs for workload actual operations
export interface CreateWorkloadActualDto {
  userId: string;
  projectId: string;
  date: string; // YYYY-MM-DD format
  hoursWorked: number;
  userText: string;
}

export interface UpdateWorkloadActualDto {
  date?: string;
  hoursWorked?: number;
  userText?: string;
}

// Filters for unified workload API
export interface WorkloadFilters {
  userId?: string;
  projectId?: string;
  type?: 'plan' | 'actual';
  startDate?: string; // YYYY-MM-DD format
  endDate?: string; // YYYY-MM-DD format
}

// Statistics response
export interface WorkloadStatsResponse {
  totalPlanned: number;
  totalActual: number;
  utilizationRate: number; // percentage
  activeEmployees: number;
}

// Workload service with all CRUD operations
export const workloadService = {
  // === WORKLOAD PLAN OPERATIONS ===

  // Get all workload plans
  async getWorkloadPlans(): Promise<WorkloadPlan[]> {
    try {
      const response = await apiRequest.get<WorkloadPlan[]>('/workload-plan');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching workload plans:', error);
      if (error.response?.status === 403) {
        throw new Error('У вас нет прав для просмотра планов рабочей нагрузки');
      } else if (error.response?.status >= 500) {
        throw new Error('Ошибка сервера при загрузке планов');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке планов рабочей нагрузки');
    }
  },

  // Get workload plan by ID
  async getWorkloadPlanById(id: string): Promise<WorkloadPlan> {
    try {
      const response = await apiRequest.get<WorkloadPlan>(`/workload-plan/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching workload plan:', error);
      if (error.response?.status === 404) {
        throw new Error('План рабочей нагрузки не найден');
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для просмотра этого плана');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке плана рабочей нагрузки');
    }
  },

  // Create new workload plan
  async createWorkloadPlan(planData: CreateWorkloadPlanDto): Promise<WorkloadPlan> {
    try {
      // Validate required fields
      const requiredFields: (keyof CreateWorkloadPlanDto)[] = [
        'userId', 'projectId', 'date'
      ];

      for (const field of requiredFields) {
        if (!planData[field]) {
          throw new Error(`Поле "${field}" обязательно для заполнения`);
        }
      }

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(planData.date)) {
        throw new Error('Неверный формат даты. Используйте формат YYYY-MM-DD');
      }

      // Validate date is not in the past
      const planDate = new Date(planData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (planDate < today) {
        throw new Error('Нельзя создавать планы на прошедшие даты');
      }

      const response = await apiRequest.post<WorkloadPlan>('/workload-plan/create', planData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating workload plan:', error);
      if (error.response?.status === 403) {
        throw new Error('У вас нет прав для создания планов рабочей нагрузки');
      } else if (error.response?.status === 409) {
        throw new Error('План на эту дату уже существует для данного сотрудника и проекта');
      } else if (error.response?.status >= 500) {
        throw new Error('Ошибка сервера при создании плана');
      }

      // Return the validation error if it's a client error
      if (error.message && !error.response) {
        throw error;
      }

      throw new Error(error.response?.data?.message || 'Ошибка при создании плана рабочей нагрузки');
    }
  },

  // Update workload plan
  async updateWorkloadPlan(id: string, planData: UpdateWorkloadPlanDto): Promise<WorkloadPlan> {
    try {
      // Validate date format if provided
      if (planData.date) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(planData.date)) {
          throw new Error('Неверный формат даты. Используйте формат YYYY-MM-DD');
        }

        // Validate date is not in the past
        const planDate = new Date(planData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (planDate < today) {
          throw new Error('Нельзя переносить планы на прошедшие даты');
        }
      }

      const response = await apiRequest.patch<WorkloadPlan>(`/workload-plan/${id}`, planData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating workload plan:', error);
      if (error.response?.status === 404) {
        throw new Error('План рабочей нагрузки не найден');
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для редактирования этого плана');
      } else if (error.response?.status === 409) {
        throw new Error('План на эту дату уже существует для данного сотрудника и проекта');
      }

      // Return the validation error if it's a client error
      if (error.message && !error.response) {
        throw error;
      }

      throw new Error(error.response?.data?.message || 'Ошибка при обновлении плана рабочей нагрузки');
    }
  },

  // Delete workload plan
  async deleteWorkloadPlan(id: string): Promise<void> {
    try {
      await apiRequest.delete(`/workload-plan/${id}`);
    } catch (error: any) {
      console.error('Error deleting workload plan:', error);
      if (error.response?.status === 404) {
        throw new Error('План рабочей нагрузки не найден');
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для удаления этого плана');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при удалении плана рабочей нагрузки');
    }
  },

  // === WORKLOAD ACTUAL OPERATIONS ===

  // Get all workload actuals
  async getWorkloadActuals(): Promise<WorkloadActual[]> {
    try {
      const response = await apiRequest.get<WorkloadActual[]>('/workload-actual');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching workload actuals:', error);
      if (error.response?.status === 403) {
        throw new Error('У вас нет прав для просмотра фактической нагрузки');
      } else if (error.response?.status >= 500) {
        throw new Error('Ошибка сервера при загрузке фактических данных');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке фактической рабочей нагрузки');
    }
  },

  // Get workload actual by ID
  async getWorkloadActualById(id: string): Promise<WorkloadActual> {
    try {
      const response = await apiRequest.get<WorkloadActual>(`/workload-actual/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching workload actual:', error);
      if (error.response?.status === 404) {
        throw new Error('Запись о фактической нагрузке не найдена');
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для просмотра этих данных');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке фактической рабочей нагрузки');
    }
  },

  // Create new workload actual
  async createWorkloadActual(actualData: CreateWorkloadActualDto): Promise<WorkloadActual> {
    try {
      // Validate required fields
      const requiredFields: (keyof CreateWorkloadActualDto)[] = [
        'userId', 'projectId', 'date', 'hoursWorked', 'userText'
      ];

      for (const field of requiredFields) {
        if (actualData[field] === undefined || actualData[field] === null || actualData[field] === '') {
          throw new Error(`Поле "${field}" обязательно для заполнения`);
        }
      }

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(actualData.date)) {
        throw new Error('Неверный формат даты. Используйте формат YYYY-MM-DD');
      }

      // Validate hours worked
      if (actualData.hoursWorked <= 0 || actualData.hoursWorked > 24) {
        throw new Error('Количество часов должно быть от 0.1 до 24');
      }

      // Validate user text length
      if (actualData.userText.length < 10) {
        throw new Error('Описание работы должно содержать минимум 10 символов');
      }

      if (actualData.userText.length > 1000) {
        throw new Error('Описание работы не должно превышать 1000 символов');
      }

      const response = await apiRequest.post<WorkloadActual>('/workload-actual/create', actualData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating workload actual:', error);
      if (error.response?.status === 403) {
        throw new Error('У вас нет прав для создания записей о фактической нагрузке');
      } else if (error.response?.status === 409) {
        throw new Error('Запись на эту дату уже существует для данного сотрудника и проекта');
      } else if (error.response?.status >= 500) {
        throw new Error('Ошибка сервера при создании записи');
      }

      // Return the validation error if it's a client error
      if (error.message && !error.response) {
        throw error;
      }

      throw new Error(error.response?.data?.message || 'Ошибка при создании записи о фактической рабочей нагрузке');
    }
  },

  // Update workload actual
  async updateWorkloadActual(id: string, actualData: UpdateWorkloadActualDto): Promise<WorkloadActual> {
    try {
      // Validate date format if provided
      if (actualData.date) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(actualData.date)) {
          throw new Error('Неверный формат даты. Используйте формат YYYY-MM-DD');
        }
      }

      // Validate hours worked if provided
      if (actualData.hoursWorked !== undefined) {
        if (actualData.hoursWorked <= 0 || actualData.hoursWorked > 24) {
          throw new Error('Количество часов должно быть от 0.1 до 24');
        }
      }

      // Validate user text length if provided
      if (actualData.userText !== undefined) {
        if (actualData.userText.length < 10) {
          throw new Error('Описание работы должно содержать минимум 10 символов');
        }

        if (actualData.userText.length > 1000) {
          throw new Error('Описание работы не должно превышать 1000 символов');
        }
      }

      const response = await apiRequest.patch<WorkloadActual>(`/workload-actual/${id}`, actualData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating workload actual:', error);
      if (error.response?.status === 404) {
        throw new Error('Запись о фактической нагрузке не найдена');
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для редактирования этой записи');
      } else if (error.response?.status === 409) {
        throw new Error('Запись на эту дату уже существует для данного сотрудника и проекта');
      }

      // Return the validation error if it's a client error
      if (error.message && !error.response) {
        throw error;
      }

      throw new Error(error.response?.data?.message || 'Ошибка при обновлении записи о фактической рабочей нагрузке');
    }
  },

  // Delete workload actual
  async deleteWorkloadActual(id: string): Promise<void> {
    try {
      await apiRequest.delete(`/workload-actual/${id}`);
    } catch (error: any) {
      console.error('Error deleting workload actual:', error);
      if (error.response?.status === 404) {
        throw new Error('Запись о фактической нагрузке не найдена');
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для удаления этой записи');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при удалении записи о фактической рабочей нагрузке');
    }
  },

  // === UNIFIED WORKLOAD OPERATIONS ===

  // Get unified workload data for Employee (only their own data)
  async getMyWorkload(filters?: Omit<WorkloadFilters, 'userId'>): Promise<UnifiedWorkload[]> {
    try {
      // Build query parameters (without userId - extracted from JWT)
      const params = new URLSearchParams();

      if (filters?.projectId) {
        params.append('projectId', filters.projectId);
      }
      if (filters?.type) {
        params.append('type', filters.type);
      }
      if (filters?.startDate) {
        params.append('startDate', filters.startDate);
      }
      if (filters?.endDate) {
        params.append('endDate', filters.endDate);
      }

      const url = params.toString() ? `/workload/my?${params.toString()}` : '/workload/my';
      const response = await apiRequest.get<UnifiedWorkload[]>(url);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching my workload:', error);
      if (error.response?.status === 403) {
        throw new Error('У вас нет прав для просмотра рабочей нагрузки');
      } else if (error.response?.status >= 500) {
        throw new Error('Ошибка сервера при загрузке данных');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке рабочей нагрузки');
    }
  },

  // Get unified workload data (combined plans and actuals)
  // For Manager/Admin: can filter by any userId
  // For Employee: automatically uses /workload/my endpoint
  async getUnifiedWorkload(filters?: WorkloadFilters, userRole?: string): Promise<UnifiedWorkload[]> {
    try {
      // If Employee role, use /workload/my endpoint
      if (userRole === 'Employee') {
        return await this.getMyWorkload(filters);
      }

      // For Manager/Admin, use /workload endpoint
      // Build query parameters
      const params = new URLSearchParams();

      if (filters?.userId) {
        params.append('userId', filters.userId);
      }
      if (filters?.projectId) {
        params.append('projectId', filters.projectId);
      }
      if (filters?.type) {
        params.append('type', filters.type);
      }
      if (filters?.startDate) {
        params.append('startDate', filters.startDate);
      }
      if (filters?.endDate) {
        params.append('endDate', filters.endDate);
      }

      const url = params.toString() ? `/workload?${params.toString()}` : '/workload';
      const response = await apiRequest.get<UnifiedWorkload[]>(url);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching unified workload:', error);
      if (error.response?.status === 403) {
        throw new Error('У вас нет прав для просмотра рабочей нагрузки');
      } else if (error.response?.status >= 500) {
        throw new Error('Ошибка сервера при загрузке данных');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке рабочей нагрузки');
    }
  },

  // === HELPER FUNCTIONS ===

  // Get workload statistics
  async getWorkloadStats(filters?: WorkloadFilters, userRole?: string): Promise<WorkloadStatsResponse> {
    try {
      // Get unified workload data and calculate stats
      const workloads = await this.getUnifiedWorkload(filters, userRole);

      const stats: WorkloadStatsResponse = {
        totalPlanned: workloads.filter(w => w.planId).length,
        totalActual: workloads.reduce((sum, w) => sum + (w.hoursWorked || 0), 0),
        utilizationRate: 0,
        activeEmployees: new Set(workloads.map(w => w.userId)).size
      };

      // Calculate utilization rate
      const totalPlannedDays = workloads.filter(w => w.planId).length;
      const totalActualDays = workloads.filter(w => w.actualId).length;

      if (totalPlannedDays > 0) {
        stats.utilizationRate = Math.round((totalActualDays / totalPlannedDays) * 100);
      }

      return stats;
    } catch (error: any) {
      console.error('Error calculating workload stats:', error);
      throw new Error('Ошибка при расчете статистики рабочей нагрузки');
    }
  },

  // Get employees for workload management
  async getEmployees(): Promise<User[]> {
    try {
      const response = await apiRequest.get<User[]>('/auth');
      // Return all users - plans can be created for any user
      return response.data;
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке списка сотрудников');
    }
  },

  // Get projects for workload management
  async getProjects(managerId?: string): Promise<Project[]> {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('status', 'Active'); // Only active projects for workload planning

      // Add managerId filter if provided (for managers)
      if (managerId) {
        params.append('managerId', managerId);
      }

      const url = `/project?${params.toString()}`;
      const response = await apiRequest.get<Project[]>(url);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке списка проектов');
    }
  },

  // Format hours for display
  formatHours: (hours: number): string => {
    if (hours === 0) return '0 ч';
    if (hours % 1 === 0) return `${hours} ч`;
    return `${hours.toFixed(1)} ч`;
  },

  // Get workload status for a unified record
  getWorkloadStatus: (workload: UnifiedWorkload): 'planned' | 'completed' | 'missing' | 'overtime' => {
    if (workload.planId && workload.actualId) {
      // Both plan and actual exist - completed
      return 'completed';
    } else if (workload.planId && !workload.actualId) {
      // Plan exists but no actual - missing
      return 'missing';
    } else if (!workload.planId && workload.actualId) {
      // Actual exists but no plan - overtime
      return 'overtime';
    } else {
      // Only plan exists
      return 'planned';
    }
  },

  // Get workload status label
  getWorkloadStatusLabel: (status: 'planned' | 'completed' | 'missing' | 'overtime'): string => {
    switch (status) {
      case 'planned':
        return 'Запланировано';
      case 'completed':
        return 'Выполнено';
      case 'missing':
        return 'Не отчитался';
      case 'overtime':
        return 'Сверхурочно';
      default:
        return status;
    }
  },

  // Validate date range
  validateDateRange: (startDate: string, endDate: string): void => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      throw new Error('Дата начала не может быть позже даты окончания');
    }

    // Validate that range is not too large (max 1 year)
    const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
    if (end.getTime() - start.getTime() > maxRange) {
      throw new Error('Период не может превышать 1 год');
    }
  },

  // Generate date range for calendar view
  generateDateRange: (startDate: string, endDate: string): string[] => {
    const dates: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      if (dateStr) dates.push(dateStr);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }
};