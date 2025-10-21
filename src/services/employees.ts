import { apiRequest } from './api';
import { User, UserRole, Company } from '../store/types';

// DTOs for employee operations
export interface CreateEmployeeDto {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateBirth: string; // ISO date string
  password: string;
  role: UserRole;
  telegramId?: string;
}

export interface UpdateEmployeeDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateBirth?: string;
  role?: UserRole;
  telegramId?: string;
}

export interface EmployeesFilters {
  role?: UserRole;
  search?: string;
}

// API response types
export interface EmployeesApiResponse {
  users: User[];
  total: number;
}

export interface EmployeeApiResponse {
  user: User;
}

// Employee service with all CRUD operations
export const employeesService = {
  // Get all employees with optional filters
  async getEmployees(filters?: EmployeesFilters): Promise<User[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.role) {
        params.append('role', filters.role);
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }

      const queryString = params.toString();
      const url = queryString ? `/auth?${queryString}` : '/auth';
      
      const response = await apiRequest.get<User[]>(url);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      if (error.response?.status === 403) {
        throw new Error('У вас нет прав для просмотра списка сотрудников');
      } else if (error.response?.status >= 500) {
        throw new Error('Ошибка сервера при загрузке сотрудников');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке списка сотрудников');
    }
  },

  // Get employee by ID
  async getEmployeeById(id: string): Promise<User> {
    try {
      const response = await apiRequest.get<User>(`/auth/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching employee:', error);
      if (error.response?.status === 404) {
        throw new Error('Сотрудник не найден');
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для просмотра данных сотрудника');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке данных сотрудника');
    }
  },

  // Create new employee (Admin only)
  async createEmployee(employeeData: CreateEmployeeDto): Promise<User> {
    try {
      // Validate required fields
      const requiredFields: (keyof CreateEmployeeDto)[] = [
        'email', 'firstName', 'lastName', 'phone', 'dateBirth',
        'password', 'role'
      ];
      
      for (const field of requiredFields) {
        if (!employeeData[field]) {
          throw new Error(`Поле "${field}" обязательно для заполнения`);
        }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(employeeData.email)) {
        throw new Error('Неверный формат email адреса');
      }

      // Validate password length
      if (employeeData.password.length < 6) {
        throw new Error('Пароль должен содержать минимум 6 символов');
      }

      // Validate phone format (basic)
      if (employeeData.phone.length < 10) {
        throw new Error('Неверный формат номера телефона');
      }

      // Validate birth date (not in future)
      const birthDate = new Date(employeeData.dateBirth);
      const today = new Date();
      if (birthDate >= today) {
        throw new Error('Дата рождения не может быть в будущем');
      }

      const response = await apiRequest.post<User>('/auth/register', employeeData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating employee:', error);
      if (error.response?.status === 409) {
        throw new Error('Пользователь с таким email уже существует');
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для создания нового сотрудника');
      } else if (error.response?.status === 422) {
        throw new Error('Некорректные данные сотрудника');
      } else if (error.message && !error.response) {
        // This is a validation error from our code
        throw error;
      }
      throw new Error(error.response?.data?.message || 'Ошибка при создании сотрудника');
    }
  },

  // Update employee (Admin only)
  async updateEmployee(id: string, employeeData: UpdateEmployeeDto): Promise<User> {
    try {
      // Validate email format if provided
      if (employeeData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(employeeData.email)) {
          throw new Error('Неверный формат email адреса');
        }
      }

      // Validate phone format if provided
      if (employeeData.phone && employeeData.phone.length < 10) {
        throw new Error('Неверный формат номера телефона');
      }

      // Validate birth date if provided
      if (employeeData.dateBirth) {
        const birthDate = new Date(employeeData.dateBirth);
        const today = new Date();
        if (birthDate >= today) {
          throw new Error('Дата рождения не может быть в будущем');
        }
      }

      const response = await apiRequest.patch<User>(`/auth/${id}`, employeeData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating employee:', error);
      if (error.response?.status === 404) {
        throw new Error('Сотрудник не найден');
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для редактирования данных сотрудника');
      } else if (error.response?.status === 409) {
        throw new Error('Пользователь с таким email уже существует');
      } else if (error.response?.status === 422) {
        throw new Error('Некорректные данные сотрудника');
      } else if (error.message && !error.response) {
        // This is a validation error from our code
        throw error;
      }
      throw new Error(error.response?.data?.message || 'Ошибка при обновлении данных сотрудника');
    }
  },

  // Delete employee (Admin only)
  async deleteEmployee(id: string): Promise<void> {
    try {
      await apiRequest.delete(`/auth/${id}`);
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      if (error.response?.status === 404) {
        throw new Error('Сотрудник не найден');
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для удаления сотрудника');
      } else if (error.response?.status === 409) {
        throw new Error('Невозможно удалить сотрудника: есть связанные данные');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при удалении сотрудника');
    }
  },

  // Get all companies (for forms)
  async getCompanies(): Promise<Company[]> {
    try {
      const response = await apiRequest.get<Company[]>('/company/');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching companies:', error);
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке списка компаний');
    }
  },

  // Get employee statistics
  async getEmployeeStats(): Promise<{
    total: number;
    active: number;
    managers: number;
    employees: number;
  }> {
    try {
      const employees = await this.getEmployees();
      
      const stats = {
        total: employees.length,
        active: employees.length, // All fetched employees are active
        managers: employees.filter(emp => emp.role === 'Manager').length,
        employees: employees.filter(emp => emp.role === 'Employee').length,
      };

      return stats;
    } catch (error) {
      console.error('Error calculating employee stats:', error);
      throw error;
    }
  }
};

