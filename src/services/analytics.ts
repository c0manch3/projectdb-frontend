import { apiRequest } from './api';
import type { ProjectsWorkloadAnalytics } from '../store/types';

export interface ProjectsWorkloadQuery {
  date?: string; // YYYY-MM-DD format
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
  }
};
