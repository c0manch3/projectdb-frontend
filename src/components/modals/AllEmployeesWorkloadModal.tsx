import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../common/modal/modal';
import Button from '../common/button/button';
import LoadingState from '../common/loading_state/loading_state';
import EmptyState from '../common/empty_state/empty_state';
import {
  selectWorkloadEmployees,
  selectWorkloadProjects,
  selectWorkloadUnifiedLoading
} from '../../store/slices/workload_slice';
import type { UnifiedWorkload } from '../../store/types';
import { workloadService } from '../../services/workload';

interface AllEmployeesWorkloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  workloads: UnifiedWorkload[];
  onEmployeeClick?: (employeeId: string, workloads: UnifiedWorkload[]) => void;
  onCreateWorkload?: (date: string, employeeId?: string) => void;
}

interface EmployeeWorkloadGroup {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
  };
  workloads: UnifiedWorkload[];
  projects: string[];
  totalHours: number;
  status: 'completed' | 'planned' | 'missing' | 'overtime' | 'mixed';
}

function AllEmployeesWorkloadModal({
  isOpen,
  onClose,
  date,
  workloads,
  onEmployeeClick,
  onCreateWorkload
}: AllEmployeesWorkloadModalProps): JSX.Element {
  // Redux state
  const employees = useSelector(selectWorkloadEmployees);
  const projects = useSelector(selectWorkloadProjects);
  const loading = useSelector(selectWorkloadUnifiedLoading);

  // Date object for display
  const dateObj = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dateObj.setHours(0, 0, 0, 0);

  const isPast = dateObj < today;
  const isToday = dateObj.getTime() === today.getTime();

  // Group workloads by employee
  const employeeGroups = useMemo((): EmployeeWorkloadGroup[] => {
    const groups = new Map<string, EmployeeWorkloadGroup>();

    // Initialize groups for employees with workloads
    workloads.forEach(workload => {
      const employee = employees.find(emp => emp.id === workload.userId);
      if (!employee) return;

      if (!groups.has(workload.userId)) {
        groups.set(workload.userId, {
          employee: {
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName
          },
          workloads: [],
          projects: [],
          totalHours: 0,
          status: 'planned'
        });
      }

      const group = groups.get(workload.userId)!;
      group.workloads.push(workload);

      // Add project if not already added
      const project = projects.find(p => p.id === workload.projectId);
      if (project && !group.projects.includes(project.name)) {
        group.projects.push(project.name);
      }

      // Add hours
      if (workload.hoursWorked) {
        group.totalHours += workload.hoursWorked;
      }
    });

    // Determine status for each group
    groups.forEach(group => {
      const statuses = group.workloads.map(w => workloadService.getWorkloadStatus(w));
      const uniqueStatuses = Array.from(new Set(statuses));

      if (uniqueStatuses.length === 1) {
        group.status = uniqueStatuses[0] as any;
      } else {
        group.status = 'mixed';
      }
    });

    return Array.from(groups.values()).sort((a, b) =>
      a.employee.firstName.localeCompare(b.employee.firstName)
    );
  }, [workloads, employees, projects]);

  // Get employee name
  const getEmployeeName = (employee: { firstName: string; lastName: string }): string => {
    return `${employee.firstName} ${employee.lastName}`;
  };

  // Get status label
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'Выполнено';
      case 'planned':
        return 'Запланировано';
      case 'missing':
        return 'Не отчитался';
      case 'overtime':
        return 'Сверхурочно';
      case 'mixed':
        return 'Смешанный статус';
      default:
        return 'Неизвестно';
    }
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'var(--success)';
      case 'planned':
        return 'var(--primary)';
      case 'missing':
        return 'var(--warning)';
      case 'overtime':
        return 'var(--info)';
      case 'mixed':
        return 'var(--secondary)';
      default:
        return 'var(--text-secondary)';
    }
  };

  // Handle employee click
  const handleEmployeeClick = (group: EmployeeWorkloadGroup) => {
    onEmployeeClick?.(group.employee.id, group.workloads);
  };

  // Handle create workload for specific employee
  const handleCreateWorkloadForEmployee = (employeeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onCreateWorkload?.(date, employeeId);
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Все сотрудники - ${formatDate(date)}`}
      size="large"
    >
      <div className="all-employees-workload-modal">
        {loading && <LoadingState message="Загрузка данных сотрудников..." />}

        {!loading && employeeGroups.length === 0 && (
          <EmptyState
            icon="👥"
            title="Нет работающих сотрудников"
            description={`На ${formatDate(date)} нет запланированной работы для сотрудников.`}
            action={
              !isPast && onCreateWorkload && (
                <Button
                  variant="primary"
                  onClick={() => onCreateWorkload(date)}
                >
                  Запланировать работу
                </Button>
              )
            }
          />
        )}

        {!loading && employeeGroups.length > 0 && (
          <div className="all-employees-workload-modal__content">
            {/* Summary Stats */}
            <div className="all-employees-workload-modal__summary">
              <div className="all-employees-workload-modal__stat">
                <div className="all-employees-workload-modal__stat-value">
                  {employeeGroups.length}
                </div>
                <div className="all-employees-workload-modal__stat-label">
                  Сотрудников работает
                </div>
              </div>
              <div className="all-employees-workload-modal__stat">
                <div className="all-employees-workload-modal__stat-value">
                  {workloadService.formatHours(
                    employeeGroups.reduce((sum, group) => sum + group.totalHours, 0)
                  )}
                </div>
                <div className="all-employees-workload-modal__stat-label">
                  Общее время работы
                </div>
              </div>
              <div className="all-employees-workload-modal__stat">
                <div className="all-employees-workload-modal__stat-value">
                  {Array.from(new Set(employeeGroups.flatMap(g => g.projects))).length}
                </div>
                <div className="all-employees-workload-modal__stat-label">
                  Активных проектов
                </div>
              </div>
            </div>

            {/* Employee List */}
            <div className="all-employees-workload-modal__employees">
              <AnimatePresence>
                {employeeGroups.map((group, index) => (
                  <motion.div
                    key={group.employee.id}
                    className="all-employees-workload-modal__employee"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleEmployeeClick(group)}
                  >
                    <div className="all-employees-workload-modal__employee-header">
                      <div className="all-employees-workload-modal__employee-info">
                        <div className="all-employees-workload-modal__employee-name">
                          {getEmployeeName(group.employee)}
                        </div>
                        <div className="all-employees-workload-modal__employee-details">
                          {group.projects.length > 0 && (
                            <span className="all-employees-workload-modal__projects">
                              {group.projects.length === 1
                                ? group.projects[0]
                                : `${group.projects.length} проект(а/ов)`
                              }
                            </span>
                          )}
                          {group.totalHours > 0 && (
                            <span className="all-employees-workload-modal__hours">
                              {workloadService.formatHours(group.totalHours)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="all-employees-workload-modal__employee-status">
                        <div
                          className="all-employees-workload-modal__status-indicator"
                          style={{ backgroundColor: getStatusColor(group.status) }}
                        />
                        <span className="all-employees-workload-modal__status-label">
                          {getStatusLabel(group.status)}
                        </span>
                      </div>
                    </div>

                    <div className="all-employees-workload-modal__employee-workloads">
                      {group.workloads.map((workload, workloadIndex) => (
                        <div
                          key={workloadIndex}
                          className="all-employees-workload-modal__workload-item"
                        >
                          <div className="all-employees-workload-modal__workload-project">
                            {projects.find(p => p.id === workload.projectId)?.name || 'Неизвестный проект'}
                          </div>
                          <div className="all-employees-workload-modal__workload-status">
                            {workloadService.getWorkloadStatusLabel(
                              workloadService.getWorkloadStatus(workload)
                            )}
                            {workload.hoursWorked && (
                              <span className="all-employees-workload-modal__workload-hours">
                                {workloadService.formatHours(workload.hoursWorked)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {!isPast && onCreateWorkload && (
                      <div className="all-employees-workload-modal__employee-actions">
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={(e) => handleCreateWorkloadForEmployee(group.employee.id, e)}
                        >
                          Добавить задачу
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Add Employee Action */}
            {!isPast && onCreateWorkload && (
              <div className="all-employees-workload-modal__add-employee">
                <Button
                  variant="primary"
                  onClick={() => onCreateWorkload(date)}
                >
                  Запланировать работу для сотрудника
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="modal__footer">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Закрыть
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default AllEmployeesWorkloadModal;