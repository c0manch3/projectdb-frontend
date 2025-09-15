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
 * Check if user has administrative privileges (Admin or Manager)
 */
export const hasAdminPrivileges = (role: UserRole | null): boolean => {
  return isAdmin(role) || isManager(role);
};