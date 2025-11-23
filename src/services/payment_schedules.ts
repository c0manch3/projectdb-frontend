import { apiRequest } from './api';
import { PaymentSchedule, PaymentType } from '../store/types';

// DTOs for payment schedule operations
export interface CreatePaymentScheduleDto {
  projectId: string;
  type: PaymentType;
  name: string;
  amount: number;
  percentage?: number;
  expectedDate: string; // ISO date string
  actualDate?: string; // ISO date string
  isPaid?: boolean;
  description?: string;
}

export interface UpdatePaymentScheduleDto {
  projectId?: string;
  type?: PaymentType;
  name?: string;
  amount?: number;
  percentage?: number;
  expectedDate?: string;
  actualDate?: string;
  isPaid?: boolean;
  description?: string;
}

export interface PaymentSchedulesFilters {
  projectId?: string;
  status?: 'all' | 'paid' | 'unpaid' | 'overdue';
}

// Payment schedule service with all CRUD operations
export const paymentSchedulesService = {
  // Get all payment schedules with optional filters
  async getPaymentSchedules(filters?: PaymentSchedulesFilters): Promise<PaymentSchedule[]> {
    try {
      let url = '/payment-schedule';

      // If projectId filter is provided, use the project-specific endpoint
      if (filters?.projectId) {
        url = `/payment-schedule/project/${filters.projectId}`;
      }

      const response = await apiRequest.get<PaymentSchedule[]>(url);
      let paymentSchedules = response.data;

      // Apply frontend filtering for status
      if (filters?.status && filters.status !== 'all') {
        const now = new Date();
        paymentSchedules = paymentSchedules.filter(ps => {
          switch (filters.status) {
            case 'paid':
              return ps.isPaid;
            case 'unpaid':
              return !ps.isPaid;
            case 'overdue':
              return !ps.isPaid && new Date(ps.expectedDate) < now;
            default:
              return true;
          }
        });
      }

      return paymentSchedules;
    } catch (error: any) {
      console.error('Error fetching payment schedules:', error);
      if (error.response?.status === 403) {
        throw new Error('У вас нет прав для просмотра графиков платежей');
      } else if (error.response?.status >= 500) {
        throw new Error('Ошибка сервера при загрузке графиков платежей');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке графиков платежей');
    }
  },

  // Get payment schedule by ID
  async getPaymentScheduleById(id: string): Promise<PaymentSchedule> {
    try {
      const response = await apiRequest.get<PaymentSchedule>(`/payment-schedule/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching payment schedule:', error);
      if (error.response?.status === 404) {
        throw new Error('Платеж не найден');
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для просмотра данных платежа');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке данных платежа');
    }
  },

  // Get payment schedules by project ID
  async getPaymentSchedulesByProject(projectId: string): Promise<PaymentSchedule[]> {
    try {
      const response = await apiRequest.get<PaymentSchedule[]>(`/payment-schedule/project/${projectId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching payment schedules for project:', error);
      if (error.response?.status === 404) {
        throw new Error('Проект не найден');
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для просмотра графиков платежей проекта');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке графиков платежей проекта');
    }
  },

  // Create new payment schedule
  async createPaymentSchedule(data: CreatePaymentScheduleDto): Promise<PaymentSchedule> {
    try {
      // Validate required fields
      if (!data.projectId) {
        throw new Error('ID проекта обязателен');
      }
      if (!data.type) {
        throw new Error('Тип платежа обязателен');
      }
      if (!data.name) {
        throw new Error('Название платежа обязательно');
      }
      if (!data.amount || data.amount <= 0) {
        throw new Error('Сумма платежа должна быть больше нуля');
      }
      if (!data.expectedDate) {
        throw new Error('Ожидаемая дата платежа обязательна');
      }

      // Validate percentage if provided
      if (data.percentage !== undefined && (data.percentage < 0 || data.percentage > 100)) {
        throw new Error('Процент должен быть от 0 до 100');
      }

      const response = await apiRequest.post<PaymentSchedule>('/payment-schedule/create', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating payment schedule:', error);
      if (error.response?.status === 403) {
        throw new Error('У вас нет прав для создания графиков платежей');
      } else if (error.response?.status === 404) {
        throw new Error('Проект не найден');
      } else if (error.response?.status >= 500) {
        throw new Error('Ошибка сервера при создании платежа');
      }

      // Return the validation error if it's a client error
      if (error.message && !error.response) {
        throw error;
      }

      throw new Error(error.response?.data?.message || 'Ошибка при создании платежа');
    }
  },

  // Update payment schedule
  async updatePaymentSchedule(id: string, data: UpdatePaymentScheduleDto): Promise<PaymentSchedule> {
    try {
      // Validate amount if provided
      if (data.amount !== undefined && data.amount <= 0) {
        throw new Error('Сумма платежа должна быть больше нуля');
      }

      // Validate percentage if provided
      if (data.percentage !== undefined && (data.percentage < 0 || data.percentage > 100)) {
        throw new Error('Процент должен быть от 0 до 100');
      }

      const response = await apiRequest.patch<PaymentSchedule>(`/payment-schedule/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating payment schedule:', error);
      if (error.response?.status === 404) {
        throw new Error('Платеж не найден');
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для редактирования этого платежа');
      }

      // Return the validation error if it's a client error
      if (error.message && !error.response) {
        throw error;
      }

      throw new Error(error.response?.data?.message || 'Ошибка при обновлении платежа');
    }
  },

  // Delete payment schedule
  async deletePaymentSchedule(id: string): Promise<void> {
    try {
      await apiRequest.delete(`/payment-schedule/${id}`);
    } catch (error: any) {
      console.error('Error deleting payment schedule:', error);
      if (error.response?.status === 404) {
        throw new Error('Платеж не найден');
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для удаления этого платежа');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при удалении платежа');
    }
  },

  // Mark payment as paid
  async markAsPaid(id: string, actualDate?: string): Promise<PaymentSchedule> {
    return this.updatePaymentSchedule(id, {
      isPaid: true,
      actualDate: actualDate ?? new Date().toISOString().split('T')[0],
    } as UpdatePaymentScheduleDto);
  },

  // Mark payment as unpaid
  async markAsUnpaid(id: string): Promise<PaymentSchedule> {
    const data: UpdatePaymentScheduleDto = {
      isPaid: false,
    };
    return this.updatePaymentSchedule(id, data);
  },

  // Helper function to get payment type label in Russian
  getPaymentTypeLabel(type: PaymentType): string {
    switch (type) {
      case 'Advance':
        return 'Аванс';
      case 'MainPayment':
        return 'Основной платеж';
      case 'FinalPayment':
        return 'Окончательный расчет';
      case 'Other':
        return 'Другое';
      default:
        return type;
    }
  },

  // Helper function to format amount as currency
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  // Helper function to check if payment is overdue
  isOverdue(paymentSchedule: PaymentSchedule): boolean {
    if (paymentSchedule.isPaid) return false;
    return new Date(paymentSchedule.expectedDate) < new Date();
  },

  // Helper function to calculate total amount from payment schedules
  calculateTotalAmount(paymentSchedules: PaymentSchedule[]): number {
    return paymentSchedules.reduce((sum, ps) => sum + ps.amount, 0);
  },

  // Helper function to calculate paid amount from payment schedules
  calculatePaidAmount(paymentSchedules: PaymentSchedule[]): number {
    return paymentSchedules
      .filter(ps => ps.isPaid)
      .reduce((sum, ps) => sum + ps.amount, 0);
  },

  // Helper function to calculate unpaid amount from payment schedules
  calculateUnpaidAmount(paymentSchedules: PaymentSchedule[]): number {
    return paymentSchedules
      .filter(ps => !ps.isPaid)
      .reduce((sum, ps) => sum + ps.amount, 0);
  },
};
