import type { UserRole } from '../store/types';

/**
 * Role-based utility functions for checking user permissions
 */

/**
 * Roles that can create new projects
 */
const PROJECT_CREATION_ROLES: UserRole[] = ['Admin', 'Manager'];

/**
 * Roles that can see all customer filters
 */
const CUSTOMER_FILTER_ROLES: UserRole[] = ['Admin', 'Manager', 'Employee'];

/**
 * Roles that can edit/create/delete data (all except Trial)
 */
const DATA_MODIFICATION_ROLES: UserRole[] = ['Admin', 'Manager', 'Employee'];

/**
 * Check if user role can create projects
 */
export const canCreateProjects = (role: UserRole | null): boolean => {
  if (!role) return false;
  return PROJECT_CREATION_ROLES.includes(role);
};

/**
 * Check if user role can see customer filters
 */
export const canSeeCustomerFilters = (role: UserRole | null): boolean => {
  if (!role) return false;
  return CUSTOMER_FILTER_ROLES.includes(role);
};

/**
 * Check if user role is Admin
 */
export const isAdmin = (role: UserRole | null): boolean => {
  return role === 'Admin';
};

/**
 * Check if user role is Manager
 */
export const isManager = (role: UserRole | null): boolean => {
  return role === 'Manager';
};

/**
 * Check if user role is Employee
 */
export const isEmployee = (role: UserRole | null): boolean => {
  return role === 'Employee';
};

/**
 * Check if user role is Trial
 */
export const isTrial = (role: UserRole | null): boolean => {
  return role === 'Trial';
};

/**
 * Check if user has administrative privileges (Admin or Manager)
 */
export const hasAdminPrivileges = (role: UserRole | null): boolean => {
  return isAdmin(role) || isManager(role);
};

/**
 * Check if user can modify data (create/edit/delete)
 * Trial users have read-only access
 */
export const canModifyData = (role: UserRole | null): boolean => {
  if (!role) return false;
  return DATA_MODIFICATION_ROLES.includes(role);
};

/**
 * Check if user can view employee data
 * Trial users cannot see employees
 */
export const canViewEmployees = (role: UserRole | null): boolean => {
  if (!role) return false;
  return role !== 'Trial';
};

/**
 * Check if user can upload/download/delete documents
 * Trial users can only view document metadata
 */
export const canManageDocuments = (role: UserRole | null): boolean => {
  if (!role) return false;
  return DATA_MODIFICATION_ROLES.includes(role);
};

/**
 * Roles that can manage companies
 */
const COMPANY_MANAGEMENT_ROLES: UserRole[] = ['Admin', 'Manager'];

/**
 * Check if user role can manage companies
 */
export const canManageCompanies = (role: UserRole | null): boolean => {
  if (!role) return false;
  return COMPANY_MANAGEMENT_ROLES.includes(role);
};

/**
 * Check if user role can view companies
 */
export const canViewCompanies = (role: UserRole | null): boolean => {
  if (!role) return false;
  return COMPANY_MANAGEMENT_ROLES.includes(role);
};