// Redux store type definitions based on RPD requirements

// Base interfaces
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateBirth: string;
  telegramId?: string;
  role: UserRole;
  salary?: number; // Optional, visible only to Admin
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'Admin' | 'Manager' | 'Employee';

// Payment Schedule types
export type PaymentType = 'Advance' | 'MainPayment' | 'FinalPayment' | 'Other';

export interface PaymentSchedule {
  id: string;
  projectId: string;
  type: PaymentType;
  name: string;
  amount: number;
  percentage?: number;
  expectedDate: string;
  actualDate?: string;
  isPaid: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  customerId?: string;
  contractDate: string;
  expirationDate: string;
  cost: number; // Вычисляется автоматически как сумма paymentSchedules[].amount
  type: 'main' | 'additional';
  managerId?: string;
  mainProjectId?: string;
  status: 'Active' | 'Completed';
  paymentSchedules?: PaymentSchedule[]; // Массив платежей проекта
  createdAt: string;
  updatedAt: string;
}

export type CompanyType = 'Customer' | 'Contractor';

export interface Company {
  id: string;
  name: string;
  type: CompanyType;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  postalCode?: string;
  inn?: string;
  kpp?: string;
  ogrn?: string;
  account?: string;
  bank?: string;
  bik?: string;
  corrAccount?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Construction {
  id: string;
  name: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  type: DocumentType;
  version: number;
  projectId?: string;
  constructionId?: string;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

// New document types: 4 types instead of old 8
// For Projects: tz, contract
// For Constructions: working_documentation, project_documentation
export type DocumentType =
  | 'tz'                        // Техническое задание (Projects only)
  | 'contract'                  // Контракт (Projects only)
  | 'working_documentation'     // Рабочая документация (Constructions only)
  | 'project_documentation';    // Проектная документация (Constructions only)

// Helper type for categorizing document types
export type ProjectDocumentType = 'tz' | 'contract';
export type ConstructionDocumentType = 'working_documentation' | 'project_documentation';

// Document version structure for constructions
export interface DocumentVersion {
  versionNumber: number;
  documents: {
    working_documentation: Document[];
    project_documentation: Document[];
  };
}

// Workload Plan - планирование рабочей нагрузки
export interface WorkloadPlan {
  id: string;
  userId: string;        // UUID сотрудника
  projectId: string;     // UUID проекта
  managerId: string;     // UUID менеджера, который создал план
  date: string;          // Дата, на которую планируется работа (ISO date)
  createdAt: string;     // Дата создания записи
  updatedAt: string;     // Дата последнего обновления
}

// Workload Actual - учет фактически отработанного времени
export interface WorkloadActual {
  id: string;
  userId: string;        // UUID сотрудника
  projectId: string;     // UUID проекта
  date: string;          // Дата, за которую отчитывается работа (ISO date)
  hoursWorked: number;   // Количество отработанных часов
  userText: string;      // Описание выполненной работы
  createdAt: string;     // Дата создания записи
  updatedAt: string;     // Дата последнего обновления
}

// Unified Workload - объединенные данные о плане и факте для одной даты
export interface UnifiedWorkload {
  date: string;          // Дата работы (ISO date)
  userId: string;        // UUID сотрудника
  projectId: string;     // UUID проекта

  // Данные плана (если есть)
  planId?: string;
  managerId?: string;
  planCreatedAt?: string;
  planUpdatedAt?: string;

  // Данные факта (если есть)
  actualId?: string;
  hoursWorked?: number;
  userText?: string;
  actualCreatedAt?: string;
  actualUpdatedAt?: string;
}

// State interfaces
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  loading: boolean;
  error: string | null;
}

export interface ProjectsState {
  list: Project[];
  current: Project | null;
  filters: {
    status: 'all' | 'active' | 'completed' | 'overdue';
    customerId: string | null;
    managerId: string | null;
    type: 'all' | 'main' | 'additional';
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  loading: boolean;
  error: string | null;
}

export interface UsersState {
  list: User[];
  current: User | null;
  filters: {
    role: UserRole | null;
    search: string;
  };
  loading: boolean;
  error: string | null;
}

export interface DocumentsState {
  list: Document[];
  byProject: { [projectId: string]: Document[] };
  byConstruction: { [constructionId: string]: Document[] };
  uploadProgress: number;
  filters: {
    type: DocumentType | null;
  };
  loading: boolean;
  error: string | null;
}

export interface ConstructionsState {
  list: Construction[];
  byProject: { [projectId: string]: Construction[] };
  current: Construction | null;
  loading: boolean;
  error: string | null;
}

export interface WorkloadState {
  // Separate arrays for plans and actuals
  plans: WorkloadPlan[];
  actuals: WorkloadActual[];

  // Unified workload data (combined plan and actual for display)
  unified: UnifiedWorkload[];

  // Current workload record being viewed/edited
  current: UnifiedWorkload | null;

  // Filters for data fetching
  filters: {
    userId?: string | undefined;
    projectId?: string | undefined;
    type?: 'plan' | 'actual' | undefined;
    startDate?: string | undefined;  // YYYY-MM-DD format
    endDate?: string | undefined;    // YYYY-MM-DD format
  };

  // UI state
  view: 'week' | 'month';
  activeTab: 'planned' | 'actual' | 'comparison';
  selectedDate: string; // Current selected date for calendar view

  // Loading and error states
  loading: boolean;
  planLoading: boolean;
  actualLoading: boolean;
  unifiedLoading: boolean;
  error: string | null;

  // Statistics
  stats: {
    totalPlanned: number;
    totalActual: number;
    utilizationRate: number;
    activeEmployees: number;
  } | null;
  statsLoading: boolean;
}

export interface CompaniesState {
  list: Company[];
  current: Company | null;
  search: string;
  loading: boolean;
  error: string | null;
}

export interface ProjectUsersState {
  byProject: { [projectId: string]: User[] };
  loading: boolean;
  error: string | null;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  timestamp: number;
}

export interface Modal {
  isOpen: boolean;
  type: string | null;
  data: any;
}

export interface UiState {
  notifications: Notification[];
  modals: Modal;
  sidebar: {
    isCollapsed: boolean;
  };
  loading: {
    global: boolean;
  };
}

// Analytics types
export interface EmployeeWorkload {
  userId: string;
  firstName: string;
  lastName: string;
  hoursWorked: number;
}

export interface ProjectWorkloadAnalytics {
  projectId: string;
  projectName: string;
  employeeCount: number;
  previousEmployeeCount: number;
  changePercent: number;
  employees: EmployeeWorkload[];
}

export interface ProjectsWorkloadAnalytics {
  date: string;
  compareDate: string;
  projects: ProjectWorkloadAnalytics[];
}

export interface AnalyticsState {
  projectsWorkload: ProjectsWorkloadAnalytics | null;
  loading: boolean;
  error: string | null;
}

export interface PaymentSchedulesState {
  list: PaymentSchedule[];
  byProject: { [projectId: string]: PaymentSchedule[] };
  current: PaymentSchedule | null;
  filters: {
    projectId?: string;
    status?: 'all' | 'paid' | 'unpaid' | 'overdue';
  };
  loading: boolean;
  error: string | null;
}

// Root state interface
export interface RootState {
  auth: AuthState;
  projects: ProjectsState;
  users: UsersState;
  documents: DocumentsState;
  constructions: ConstructionsState;
  workload: WorkloadState;
  companies: CompaniesState;
  projectUsers: ProjectUsersState;
  ui: UiState;
  analytics: AnalyticsState;
  paymentSchedules: PaymentSchedulesState;
}