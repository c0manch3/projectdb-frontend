import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/slices/auth_slice';
import {
  canModifyData,
  canViewEmployees,
  canManageDocuments,
  isTrial,
  isAdmin,
  isManager,
  isEmployee,
  canCreateProjects as utilCanCreateProjects,
  canManageCompanies as utilCanManageCompanies,
  hasAdminPrivileges as utilHasAdminPrivileges,
} from '../utils/roles';
import type { UserRole } from '../store/types';

/**
 * Custom hook for checking user permissions throughout the application
 * Simplifies role-based access control by providing all permission checks in one place
 */
export const usePermissions = () => {
  const currentUser = useSelector(selectCurrentUser);
  const role = currentUser?.role || null;

  return {
    // User role checks
    role,
    isAdmin: isAdmin(role),
    isManager: isManager(role),
    isEmployee: isEmployee(role),
    isTrial: isTrial(role),
    hasAdminPrivileges: utilHasAdminPrivileges(role),

    // Data modification permissions (Trial = read-only)
    canModifyData: canModifyData(role),
    canCreateProjects: utilCanCreateProjects(role),
    canEditProjects: utilCanCreateProjects(role), // Same as create
    canDeleteProjects: isAdmin(role), // Only admin can delete

    // Employee permissions
    canViewEmployees: canViewEmployees(role),
    canManageEmployees: isAdmin(role), // Only admin can manage employees

    // Company permissions
    canManageCompanies: utilCanManageCompanies(role),

    // Document permissions (Trial can view metadata but not download/upload)
    canManageDocuments: canManageDocuments(role),
    canUploadDocuments: canManageDocuments(role),
    canDownloadDocuments: canManageDocuments(role),
    canDeleteDocuments: canManageDocuments(role),

    // Workload permissions
    canManageWorkload: canModifyData(role),
    canCreateWorkload: canModifyData(role),
    canEditWorkload: canModifyData(role),
    canDeleteWorkload: canModifyData(role),

    // General view permissions
    canViewProjects: true, // All authenticated users can view projects
    canViewCompanies: utilCanManageCompanies(role) || isTrial(role), // Managers, Admins, and Trial
    canViewAnalytics: !isEmployee(role), // All except Employee

    // Payment schedules
    canManagePaymentSchedules: utilHasAdminPrivileges(role),
  };
};

/**
 * Hook for checking specific role
 */
export const useUserRole = (): UserRole | null => {
  const currentUser = useSelector(selectCurrentUser);
  return currentUser?.role || null;
};

/**
 * Hook to check if current user is Trial
 */
export const useIsTrialUser = (): boolean => {
  const currentUser = useSelector(selectCurrentUser);
  return isTrial(currentUser?.role || null);
};
