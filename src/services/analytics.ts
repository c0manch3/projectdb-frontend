import { apiRequest } from './api';
import type {
  ProjectsWorkloadAnalytics,
  EmployeeWorkHoursResponse,
  EmployeeWorkloadDetailsResponse
} from '../store/types';

export interface ProjectsWorkloadQuery {
  date?: string; // YYYY-MM-DD format
  compareDate?: string; // YYYY-MM-DD format
}

export interface EmployeeWorkHoursQuery {
  date?: string; // YYYY-MM-DD format
}

export interface EmployeeWorkloadDetailsQuery {
  employeeId: string;
  date: string; // YYYY-MM-DD format
  type: 'actual'; // Currently only actual workload details
}

// Analytics service
export const analyticsService = {
  // Get projects workload analytics
  async getProjectsWorkload(query?: ProjectsWorkloadQuery): Promise<ProjectsWorkloadAnalytics> {
    try {
      const params = new URLSearchParams();

      if (query?.date) {
        params.append('date', query.date);
      }

      if (query?.compareDate) {
        params.append('compareDate', query.compareDate);
      }

      const queryString = params.toString();
      const url = queryString ? `/analytics/projects-workload?${queryString}` : '/analytics/projects-workload';

      const response = await apiRequest.get<ProjectsWorkloadAnalytics>(url);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching projects workload analytics:', error);
      if (error.response?.status === 403) {
        throw new Error('У вас нет прав для просмотра аналитики');
      } else if (error.response?.status >= 500) {
        throw new Error('Ошибка сервера при загрузке аналитики');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке аналитики');
    }
  },

  // Get employee work hours deviation analytics
  async getEmployeeWorkHours(query?: EmployeeWorkHoursQuery): Promise<EmployeeWorkHoursResponse> {
    try {
      const params = new URLSearchParams();

      if (query?.date) {
        params.append('date', query.date);
      }

      const queryString = params.toString();
      const url = queryString ? `/analytics/employee-work-hours?${queryString}` : '/analytics/employee-work-hours';

      const response = await apiRequest.get<EmployeeWorkHoursResponse>(url);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching employee work hours analytics:', error);
      if (error.response?.status === 403) {
        throw new Error('У вас нет прав для просмотра аналитики рабочих часов');
      } else if (error.response?.status === 400) {
        throw new Error('Неверный формат даты');
      } else if (error.response?.status >= 500) {
        throw new Error('Ошибка сервера при загрузке аналитики');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке аналитики рабочих часов');
    }
  },

  // Get detailed workload records for a specific employee and date
  async getEmployeeWorkloadDetails(query: EmployeeWorkloadDetailsQuery): Promise<EmployeeWorkloadDetailsResponse> {
    try {
      const params = new URLSearchParams();
      params.append('employeeId', query.employeeId);
      params.append('date', query.date);
      params.append('type', query.type);

      const url = `/workload?${params.toString()}`;
      const response = await apiRequest.get<EmployeeWorkloadDetailsResponse>(url);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching employee workload details:', error);
      if (error.response?.status === 404) {
        // Return empty response for 404 - no workload data found
        return {
          userId: query.employeeId,
          date: query.date,
          workloads: [],
          totalHours: 0
        };
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для просмотра детальной информации о нагрузке');
      } else if (error.response?.status === 400) {
        throw new Error('Неверные параметры запроса');
      } else if (error.response?.status >= 500) {
        throw new Error('Ошибка сервера при загрузке детальной информации');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке детальной информации о нагрузке');
    }
  }
};
