// Redux store type definitions based on RPD requirements

// Base interfaces
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateBirth: string;
  telegramId?: number;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'Admin' | 'Manager' | 'Employee';

export interface Project {
  id: string;
  name: string;
  customerId: string;
  contractDate: string;
  expirationDate: string;
  cost: number;
  type: 'main' | 'additional';
  managerId?: string;
  mainProjectId?: string;
  status: 'active' | 'completed' | 'overdue';
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
  projectId: string;
  constructionId?: string;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type DocumentType = 'km' | 'kz' | 'rpz' | 'tz' | 'gp' | 'igi' | 'spozu' | 'contract';

export interface WorkloadPlan {
  id: string;
  userId: string;
  projectId: string;
  managerId: string;
  date: string;
  hoursPlanned: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkloadActual {
  id: string;
  userId: string;
  projectId: string;
  hoursWorked: number;
  userText: string;
  date: string;
  createdAt: string;
  updatedAt: string;
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
  plans: WorkloadPlan[];
  actuals: WorkloadActual[];
  filters: {
    userId: string | null;
    projectId: string | null;
    dateFrom: string | null;
    dateTo: string | null;
  };
  view: 'week' | 'month';
  selectedUser: string | null;
  loading: boolean;
  error: string | null;
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
}