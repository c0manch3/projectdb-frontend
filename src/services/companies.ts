import { apiRequest } from './api';
import { Company, CompanyType } from '../store/types';

// DTOs for company operations
export interface CreateCompanyDto {
  name: string;
  type: CompanyType;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface UpdateCompanyDto {
  name?: string;
  type?: CompanyType;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface CompaniesFilters {
  type?: CompanyType;
  search?: string;
}

// API response types
export interface CompaniesApiResponse {
  companies: Company[];
  total: number;
}

export interface CompanyApiResponse {
  company: Company;
}

// Company service with all CRUD operations
export const companiesService = {
  // Get all companies with optional filters
  async getCompanies(filters?: CompaniesFilters): Promise<Company[]> {
    try {
      const params = new URLSearchParams();

      if (filters?.type) {
        params.append('type', filters.type);
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }

      const queryString = params.toString();
      const url = queryString ? `/company?${queryString}` : '/company';

      const response = await apiRequest.get<Company[]>(url);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching companies:', error);
      if (error.response?.status === 403) {
        throw new Error('У вас нет прав для просмотра списка компаний');
      } else if (error.response?.status >= 500) {
        throw new Error('Ошибка сервера при загрузке компаний');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке списка компаний');
    }
  },

  // Get company by ID
  async getCompanyById(id: string): Promise<Company> {
    try {
      const response = await apiRequest.get<Company>(`/company/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching company:', error);
      if (error.response?.status === 404) {
        throw new Error('Компания не найдена');
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для просмотра данных компании');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при загрузке данных компании');
    }
  },

  // Create new company (Admin/Manager only)
  async createCompany(companyData: CreateCompanyDto): Promise<Company> {
    try {
      // Validate required fields
      const requiredFields: (keyof CreateCompanyDto)[] = [
        'name', 'type'
      ];

      for (const field of requiredFields) {
        if (!companyData[field]) {
          throw new Error(`Поле "${field}" обязательно для заполнения`);
        }
      }

      // Validate email format if provided
      if (companyData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(companyData.email)) {
          throw new Error('Неверный формат email адреса');
        }
      }

      // Validate phone format if provided (basic)
      if (companyData.phone && companyData.phone.length < 10) {
        throw new Error('Неверный формат номера телефона');
      }

      // Validate website URL if provided
      if (companyData.website) {
        try {
          new URL(companyData.website);
        } catch {
          throw new Error('Неверный формат сайта компании');
        }
      }

      const response = await apiRequest.post<Company>('/company/create', companyData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating company:', error);
      if (error.response?.status === 409) {
        throw new Error('Компания с таким названием уже существует');
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для создания новой компании');
      } else if (error.response?.status === 422) {
        throw new Error('Некорректные данные компании');
      } else if (error.message && !error.response) {
        // This is a validation error from our code
        throw error;
      }
      throw new Error(error.response?.data?.message || 'Ошибка при создании компании');
    }
  },

  // Update company (Admin/Manager only)
  async updateCompany(id: string, companyData: UpdateCompanyDto): Promise<Company> {
    try {
      // Validate email format if provided
      if (companyData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(companyData.email)) {
          throw new Error('Неверный формат email адреса');
        }
      }

      // Validate phone format if provided
      if (companyData.phone && companyData.phone.length < 10) {
        throw new Error('Неверный формат номера телефона');
      }

      // Validate website URL if provided
      if (companyData.website) {
        try {
          new URL(companyData.website);
        } catch {
          throw new Error('Неверный формат сайта компании');
        }
      }

      const response = await apiRequest.patch<Company>(`/company/${id}`, companyData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating company:', error);
      if (error.response?.status === 404) {
        throw new Error('Компания не найдена');
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для редактирования данных компании');
      } else if (error.response?.status === 409) {
        throw new Error('Компания с таким названием уже существует');
      } else if (error.response?.status === 422) {
        throw new Error('Некорректные данные компании');
      } else if (error.message && !error.response) {
        // This is a validation error from our code
        throw error;
      }
      throw new Error(error.response?.data?.message || 'Ошибка при обновлении данных компании');
    }
  },

  // Delete company (Admin/Manager only)
  async deleteCompany(id: string): Promise<void> {
    try {
      await apiRequest.delete(`/company/${id}`);
    } catch (error: any) {
      console.error('Error deleting company:', error);
      if (error.response?.status === 404) {
        throw new Error('Компания не найдена');
      } else if (error.response?.status === 403) {
        throw new Error('У вас нет прав для удаления компании');
      } else if (error.response?.status === 409) {
        throw new Error('Невозможно удалить компанию: есть связанные проекты');
      }
      throw new Error(error.response?.data?.message || 'Ошибка при удалении компании');
    }
  },

  // Get company statistics
  async getCompanyStats(): Promise<{
    total: number;
    customers: number;
    contractors: number;
    active: number;
  }> {
    try {
      const companies = await this.getCompanies();

      const stats = {
        total: companies.length,
        active: companies.length, // All fetched companies are active
        customers: companies.filter(company => company.type === 'Customer').length,
        contractors: companies.filter(company => company.type === 'Contractor').length,
      };

      return stats;
    } catch (error) {
      console.error('Error calculating company stats:', error);
      throw error;
    }
  }
};