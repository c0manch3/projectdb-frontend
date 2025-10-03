import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../common/button/button';
import LoadingState from '../../common/loading_state/loading_state';
import EmptyState from '../../common/empty_state/empty_state';
import type { AppDispatch } from '../../../store';
import {
  selectUnifiedWorkload,
  selectWorkloadUnifiedLoading,
  selectWorkloadView,
  selectWorkloadSelectedDate,
  selectWorkloadEmployees,
  selectWorkloadProjects,
  selectWorkloadFilters,
  updateSelectedDate,
  updateFilters,
  fetchUnifiedWorkload
} from '../../../store/slices/workload_slice';
import type { UnifiedWorkload } from '../../../store/types';
import { workloadService } from '../../../services/workload';

type CalendarDisplayMode = 'by-project' | 'single-employee';

interface UnifiedWorkloadCalendarProps {
  onCellClick?: (date: string, workloads: UnifiedWorkload[]) => void;
  onCreateWorkload?: (date: string) => void;
  displayMode?: CalendarDisplayMode;
  onDisplayModeChange?: (mode: CalendarDisplayMode) => void;
}

interface CalendarDay {
  date: string;
  workloads: UnifiedWorkload[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isPast: boolean;
  isWeekend: boolean;
}

interface WorkloadSummary {
  plannedCount: number;
  actualCount: number;
  completedCount: number;
  missingCount: number;
  overtimeCount: number;
  totalHours: number;
}

function UnifiedWorkloadCalendar({
  onCellClick,
  onCreateWorkload,
  displayMode = 'by-project',
  onDisplayModeChange
}: UnifiedWorkloadCalendarProps): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const unified = useSelector(selectUnifiedWorkload);
  const loading = useSelector(selectWorkloadUnifiedLoading);
  const view = useSelector(selectWorkloadView);
  const selectedDate = useSelector(selectWorkloadSelectedDate);
  const employees = useSelector(selectWorkloadEmployees);
  const projects = useSelector(selectWorkloadProjects);
  const filters = useSelector(selectWorkloadFilters);

  // Local state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [localDisplayMode, setLocalDisplayMode] = useState<CalendarDisplayMode>(displayMode);

  // Get selected employee for filtering
  const selectedEmployee = useMemo(() => {
    if (!filters.userId) return null;
    return employees.find(emp => emp.id === filters.userId);
  }, [filters.userId, employees]);

  // Get selected project for filtering
  const selectedProject = useMemo(() => {
    if (!filters.projectId) return null;
    return projects.find(proj => proj.id === filters.projectId);
  }, [filters.projectId, projects]);

  // Handle employee selection change
  const handleEmployeeChange = (employeeId: string) => {
    const newFilters = { ...filters };
    if (employeeId === '' || employeeId === 'all') {
      delete newFilters.userId;
    } else {
      newFilters.userId = employeeId;
    }
    dispatch(updateFilters(newFilters));
  };

  // Handle project selection change
  const handleProjectChange = (projectId: string) => {
    const newFilters = { ...filters };
    if (projectId === '' || projectId === 'all') {
      delete newFilters.projectId;
    } else {
      newFilters.projectId = projectId;
    }
    dispatch(updateFilters(newFilters));
  };

  // Handle display mode change
  const handleDisplayModeChange = (mode: CalendarDisplayMode) => {
    setLocalDisplayMode(mode);
    onDisplayModeChange?.(mode);
  };

  // Generate calendar days based on current view
  const calendarDays = useMemo(() => {
    const days: CalendarDay[] = [];
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    if (view === 'week') {
      // Week view - show 7 days from Monday
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday

      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dateString = date.toISOString().split('T')[0];

        days.push({
          date: dateString,
          workloads: unified.filter(w => w.date.split('T')[0] === dateString),
          isCurrentMonth: true, // Always true for week view
          isToday: dateString === todayString,
          isSelected: dateString === selectedDate,
          isPast: date < today,
          isWeekend: date.getDay() === 0 || date.getDay() === 6
        });
      }
    } else {
      // Month view - show full calendar month
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      // First day of month
      const firstDay = new Date(year, month, 1);
      // Last day of month
      const lastDay = new Date(year, month + 1, 0);

      // Start from Monday of the week containing first day
      const startDate = new Date(firstDay);
      startDate.setDate(firstDay.getDate() - firstDay.getDay() + 1);

      // End at Sunday of the week containing last day
      const endDate = new Date(lastDay);
      endDate.setDate(lastDay.getDate() + (7 - lastDay.getDay()));

      const currentDateObj = new Date(startDate);

      while (currentDateObj <= endDate) {
        const dateString = currentDateObj.toISOString().split('T')[0];

        days.push({
          date: dateString,
          workloads: unified.filter(w => w.date.split('T')[0] === dateString),
          isCurrentMonth: currentDateObj.getMonth() === month,
          isToday: dateString === todayString,
          isSelected: dateString === selectedDate,
          isPast: currentDateObj < today,
          isWeekend: currentDateObj.getDay() === 0 || currentDateObj.getDay() === 6
        });

        currentDateObj.setDate(currentDateObj.getDate() + 1);
      }
    }

    return days;
  }, [currentDate, view, unified, selectedDate]);

  // Calculate workload summary for a day
  const getWorkloadSummary = (workloads: UnifiedWorkload[]): WorkloadSummary => {
    return workloads.reduce((summary, workload) => {
      const status = workloadService.getWorkloadStatus(workload);

      if (workload.planId) summary.plannedCount++;
      if (workload.actualId) summary.actualCount++;

      switch (status) {
        case 'completed':
          summary.completedCount++;
          break;
        case 'missing':
          summary.missingCount++;
          break;
        case 'overtime':
          summary.overtimeCount++;
          break;
      }

      if (workload.hoursWorked) {
        summary.totalHours += workload.hoursWorked;
      }

      return summary;
    }, {
      plannedCount: 0,
      actualCount: 0,
      completedCount: 0,
      missingCount: 0,
      overtimeCount: 0,
      totalHours: 0
    });
  };

  // Navigation functions
  const navigatePrevious = () => {
    if (view === 'week') {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    } else {
      const newDate = new Date(currentDate);
      newDate.setMonth(currentDate.getMonth() - 1);
      setCurrentDate(newDate);
    }
  };

  const navigateNext = () => {
    if (view === 'week') {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    } else {
      const newDate = new Date(currentDate);
      newDate.setMonth(currentDate.getMonth() + 1);
      setCurrentDate(newDate);
    }
  };

  const navigateToday = () => {
    const today = new Date();
    setCurrentDate(today);
    dispatch(updateSelectedDate(today.toISOString().split('T')[0]));
  };

  // Handle day click
  const handleDayClick = (day: CalendarDay) => {
    dispatch(updateSelectedDate(day.date));

    // Different behavior based on display mode
    if (localDisplayMode === 'by-project') {
      // In by-project mode, filter workloads for selected project
      const projectWorkloads = selectedProject
        ? day.workloads.filter(w => w.projectId === selectedProject.id)
        : [];
      onCellClick?.(day.date, projectWorkloads);
    } else {
      // In single-employee mode, filter workloads for selected employee
      const employeeWorkloads = selectedEmployee
        ? day.workloads.filter(w => w.userId === selectedEmployee.id)
        : [];
      onCellClick?.(day.date, employeeWorkloads);
    }
  };

  // Handle day double-click for creating workload
  const handleDayDoubleClick = (day: CalendarDay) => {
    // Only allow creation on future dates and current date
    if (!day.isPast && onCreateWorkload) {
      if (localDisplayMode === 'single-employee' && selectedEmployee) {
        // In single-employee mode, create for selected employee
        onCreateWorkload(day.date);
      } else if (localDisplayMode === 'by-project' && selectedProject) {
        // In by-project mode, show creation modal for project
        onCreateWorkload(day.date);
      }
    }
  };

  // Check if date editing is allowed
  const isDateEditable = (date: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return date >= today; // Allow editing today and future dates
  };

  // Get employee name by ID
  const getEmployeeName = (userId: string): string => {
    const employee = employees.find(emp => emp.id === userId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
  };

  // Get project name by ID
  const getProjectName = (projectId: string): string => {
    const project = projects.find(proj => proj.id === projectId);
    return project ? project.name : 'Unknown';
  };

  // Format title for current period
  const formatPeriodTitle = (): string => {
    if (view === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return `${startOfWeek.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    }
  };

  // Render workload cell based on display mode
  const renderWorkloadCell = (day: CalendarDay) => {
    const summary = getWorkloadSummary(day.workloads);
    const hasWorkload = day.workloads.length > 0;
    const isHovered = hoveredDate === day.date;

    // Render different views based on display mode
    if (localDisplayMode === 'single-employee') {
      return renderSingleEmployeeCell(day, summary, hasWorkload, isHovered);
    } else {
      return renderByProjectCell(day, summary, hasWorkload, isHovered);
    }
  };

  // Render cell for by-project mode
  const renderByProjectCell = (day: CalendarDay, summary: WorkloadSummary, hasWorkload: boolean, isHovered: boolean) => {
    // Filter workloads for selected project on this day
    const projectWorkloads = selectedProject
      ? day.workloads.filter(w => w.projectId === selectedProject.id)
      : [];
    const hasProjectWorkload = projectWorkloads.length > 0;

    // Get unique employees working on this project on this day
    const employeesOnProject = Array.from(
      new Set(projectWorkloads.map(w => w.userId))
    ).map(userId => {
      const employee = employees.find(emp => emp.id === userId);
      return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
    });
    // Determine cell status class
    let statusClass = '';
    if (hasWorkload) {
      if (summary.missingCount > 0) {
        statusClass = 'unified-workload-calendar__cell--missing';
      } else if (summary.overtimeCount > 0) {
        statusClass = 'unified-workload-calendar__cell--overtime';
      } else if (summary.completedCount > 0) {
        statusClass = 'unified-workload-calendar__cell--completed';
      } else if (summary.plannedCount > 0) {
        statusClass = 'unified-workload-calendar__cell--planned';
      }
    }

    return (
      <motion.div
        key={day.date}
        className={`unified-workload-calendar__cell unified-workload-calendar__cell--by-project ${statusClass} ${
          day.isCurrentMonth ? '' : 'unified-workload-calendar__cell--other-month'
        } ${
          day.isToday ? 'unified-workload-calendar__cell--today' : ''
        } ${
          day.isSelected ? 'unified-workload-calendar__cell--selected' : ''
        } ${
          day.isPast ? 'unified-workload-calendar__cell--past' : ''
        } ${
          day.isWeekend ? 'unified-workload-calendar__cell--weekend' : ''
        }`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        onClick={() => handleDayClick(day)}
        onDoubleClick={() => handleDayDoubleClick(day)}
        onMouseEnter={() => setHoveredDate(day.date)}
        onMouseLeave={() => setHoveredDate(null)}
      >
        {/* Day Number */}
        <div className="unified-workload-calendar__day-number">
          {new Date(day.date).getDate()}
        </div>

        {/* By Project Mode: Show employees working on project */}
        {hasProjectWorkload && selectedProject && (
          <div className="unified-workload-calendar__workload-indicators">
            {/* Employee count indicator */}
            <div className="unified-workload-calendar__employee-count">
              {employeesOnProject.length} сотр.
            </div>

            {/* Status indicators */}
            <div className="unified-workload-calendar__status-indicators">
              {summary.completedCount > 0 && (
                <div className="unified-workload-calendar__indicator unified-workload-calendar__indicator--completed">
                  {summary.completedCount}
                </div>
              )}
              {summary.missingCount > 0 && (
                <div className="unified-workload-calendar__indicator unified-workload-calendar__indicator--missing">
                  {summary.missingCount}
                </div>
              )}
              {summary.overtimeCount > 0 && (
                <div className="unified-workload-calendar__indicator unified-workload-calendar__indicator--overtime">
                  {summary.overtimeCount}
                </div>
              )}
              {summary.plannedCount > 0 && summary.actualCount === 0 && (
                <div className="unified-workload-calendar__indicator unified-workload-calendar__indicator--planned">
                  {summary.plannedCount}
                </div>
              )}
            </div>

            {/* Total hours worked */}
            {summary.totalHours > 0 && (
              <div className="unified-workload-calendar__hours">
                {workloadService.formatHours(summary.totalHours)}
              </div>
            )}
          </div>
        )}

        {/* Hover tooltip for by-project mode */}
        {isHovered && selectedProject && (
          <div className="unified-workload-calendar__tooltip">
            <div className="unified-workload-calendar__tooltip-content">
              <div className="unified-workload-calendar__tooltip-header">
                {new Date(day.date).toLocaleDateString('ru-RU', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </div>
              <div className="unified-workload-calendar__tooltip-body">
                {hasProjectWorkload ? (
                  <>
                    <div className="unified-workload-calendar__tooltip-summary">
                      Проект: {selectedProject.name}
                    </div>
                    <div className="unified-workload-calendar__tooltip-summary">
                      Сотрудников на проекте: {employeesOnProject.length}
                    </div>
                    <div className="unified-workload-calendar__tooltip-stats">
                      <div className="unified-workload-calendar__tooltip-stat">
                        <span className="unified-workload-calendar__tooltip-stat-label">Завершено:</span>
                        <span className="unified-workload-calendar__tooltip-stat-value unified-workload-calendar__tooltip-stat-value--success">
                          {summary.completedCount}
                        </span>
                      </div>
                      <div className="unified-workload-calendar__tooltip-stat">
                        <span className="unified-workload-calendar__tooltip-stat-label">Планы:</span>
                        <span className="unified-workload-calendar__tooltip-stat-value unified-workload-calendar__tooltip-stat-value--primary">
                          {summary.plannedCount}
                        </span>
                      </div>
                      {summary.missingCount > 0 && (
                        <div className="unified-workload-calendar__tooltip-stat">
                          <span className="unified-workload-calendar__tooltip-stat-label">Не отчитались:</span>
                          <span className="unified-workload-calendar__tooltip-stat-value unified-workload-calendar__tooltip-stat-value--warning">
                            {summary.missingCount}
                          </span>
                        </div>
                      )}
                      {summary.overtimeCount > 0 && (
                        <div className="unified-workload-calendar__tooltip-stat">
                          <span className="unified-workload-calendar__tooltip-stat-label">Сверхурочно:</span>
                          <span className="unified-workload-calendar__tooltip-stat-value unified-workload-calendar__tooltip-stat-value--info">
                            {summary.overtimeCount}
                          </span>
                        </div>
                      )}
                      {summary.totalHours > 0 && (
                        <div className="unified-workload-calendar__tooltip-stat">
                          <span className="unified-workload-calendar__tooltip-stat-label">Всего часов:</span>
                          <span className="unified-workload-calendar__tooltip-stat-value">
                            {workloadService.formatHours(summary.totalHours)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="unified-workload-calendar__tooltip-divider"></div>
                    <div className="unified-workload-calendar__tooltip-employees">
                      {projectWorkloads.slice(0, 5).map((workload, index) => (
                        <div key={index} className="unified-workload-calendar__tooltip-item">
                          <div className="unified-workload-calendar__tooltip-employee">
                            {getEmployeeName(workload.userId)}
                          </div>
                          <div className={`unified-workload-calendar__tooltip-status unified-workload-calendar__tooltip-status--${workloadService.getWorkloadStatus(workload)}`}>
                            {workloadService.getWorkloadStatusLabel(workloadService.getWorkloadStatus(workload))}
                            {workload.hoursWorked && ` - ${workloadService.formatHours(workload.hoursWorked)}`}
                          </div>
                        </div>
                      ))}
                      {projectWorkloads.length > 5 && (
                        <div className="unified-workload-calendar__tooltip-more">
                          И еще {projectWorkloads.length - 5} сотрудник(ов)...
                        </div>
                      )}
                    </div>
                    <div className="unified-workload-calendar__tooltip-action">
                      Нажмите для просмотра подробностей
                    </div>
                  </>
                ) : (
                  <div className="unified-workload-calendar__tooltip-empty">
                    <div className="unified-workload-calendar__tooltip-empty-message">
                      Нет сотрудников на проекте в этот день
                    </div>
                    {!day.isPast && (
                      <div className="unified-workload-calendar__tooltip-action">
                        Нажмите для назначения сотрудника
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add button for editable days when project is selected and no workload */}
        {isDateEditable(day.date) && day.isCurrentMonth && selectedProject && !hasProjectWorkload && (
          <div className="unified-workload-calendar__add-button" onClick={(e) => {
            e.stopPropagation();
            onCreateWorkload?.(day.date);
          }}>
            <span className="unified-workload-calendar__add-button-icon">+</span>
            <span className="unified-workload-calendar__add-button-text">Добавить сотрудника</span>
          </div>
        )}

        {/* Edit button for editable days when project has employees assigned */}
        {isDateEditable(day.date) && day.isCurrentMonth && selectedProject && hasProjectWorkload && (
          <div className="unified-workload-calendar__edit-button" onClick={(e) => {
            e.stopPropagation();
            onCellClick?.(day.date, projectWorkloads);
          }}>
            <span className="unified-workload-calendar__edit-button-icon">👁️</span>
            <span className="unified-workload-calendar__edit-button-text">Просмотреть план</span>
          </div>
        )}
      </motion.div>
    );
  };

  // Render cell for single-employee mode with plan/fact split
  const renderSingleEmployeeCell = (day: CalendarDay, summary: WorkloadSummary, hasWorkload: boolean, isHovered: boolean) => {
    // Get all workloads for selected employee on this day
    const employeeWorkloads = day.workloads.filter(w => w.userId === selectedEmployee?.id);

    // Find workload with plan (for displaying in ПЛАН section)
    const workloadWithPlan = employeeWorkloads.find(w => w.planId);
    // Find workload with actual (for displaying in ФАКТ section)
    const workloadWithActual = employeeWorkloads.find(w => w.actualId);

    // Use combined data - prefer workload that has both, otherwise use separate
    const employeeWorkload = employeeWorkloads.find(w => w.planId && w.actualId) || workloadWithPlan || workloadWithActual;

    const hasPlan = !!workloadWithPlan?.planId;
    const hasActual = !!workloadWithActual?.actualId;

    // Determine cell status class
    let statusClass = '';
    if (employeeWorkload) {
      const status = workloadService.getWorkloadStatus(employeeWorkload);
      statusClass = `unified-workload-calendar__cell--${status}`;
    }

    return (
      <motion.div
        key={day.date}
        className={`unified-workload-calendar__cell unified-workload-calendar__cell--single-employee ${statusClass} ${
          day.isCurrentMonth ? '' : 'unified-workload-calendar__cell--other-month'
        } ${
          day.isToday ? 'unified-workload-calendar__cell--today' : ''
        } ${
          day.isSelected ? 'unified-workload-calendar__cell--selected' : ''
        } ${
          day.isPast ? 'unified-workload-calendar__cell--past' : ''
        } ${
          day.isWeekend ? 'unified-workload-calendar__cell--weekend' : ''
        }`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        onClick={() => handleDayClick(day)}
        onDoubleClick={() => handleDayDoubleClick(day)}
        onMouseEnter={() => setHoveredDate(day.date)}
        onMouseLeave={() => setHoveredDate(null)}
      >
        {/* Day Number */}
        <div className="unified-workload-calendar__day-number">
          {new Date(day.date).getDate()}
        </div>

        {/* Single Employee Mode: Split plan/fact */}
        <div className="unified-workload-calendar__split-content">
          {/* Plan Section (Top Half) */}
          <div className={`unified-workload-calendar__plan-section ${
            hasPlan ? 'unified-workload-calendar__plan-section--has-plan' : 'unified-workload-calendar__plan-section--empty'
          }`}>
            <div className="unified-workload-calendar__section-label">План</div>
            {hasPlan && workloadWithPlan && (
              <div className="unified-workload-calendar__plan-info">
                <div className="unified-workload-calendar__project-name">
                  {getProjectName(workloadWithPlan.projectId)}
                </div>
              </div>
            )}
          </div>

          {/* Fact Section (Bottom Half) */}
          <div className={`unified-workload-calendar__fact-section ${
            hasActual ? 'unified-workload-calendar__fact-section--has-fact' : 'unified-workload-calendar__fact-section--empty'
          }`}>
            <div className="unified-workload-calendar__section-label">Факт</div>
            {hasActual && workloadWithActual && (
              <div className="unified-workload-calendar__fact-info">
                <div className="unified-workload-calendar__project-name">
                  {getProjectName(workloadWithActual.projectId)}
                </div>
                {workloadWithActual.userText && (
                  <div className="unified-workload-calendar__work-description">
                    {workloadWithActual.userText.length > 20
                      ? `${workloadWithActual.userText.substring(0, 20)}...`
                      : workloadWithActual.userText
                    }
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Empty state - when no plan and employee is selected */}
        {!hasWorkload && selectedEmployee && day.isCurrentMonth && (
          <div className="unified-workload-calendar__empty-state">
            <div className="unified-workload-calendar__empty-message">
              Нет плана
            </div>
          </div>
        )}

        {/* Hover tooltip for single employee mode */}
        {isHovered && (
          <div className="unified-workload-calendar__tooltip">
            <div className="unified-workload-calendar__tooltip-content">
              <div className="unified-workload-calendar__tooltip-header">
                {new Date(day.date).toLocaleDateString('ru-RU', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </div>
              <div className="unified-workload-calendar__tooltip-body">
                {employeeWorkload ? (
                  <>
                    <div className="unified-workload-calendar__tooltip-employee">
                      {getEmployeeName(employeeWorkload.userId)}
                    </div>
                    <div className="unified-workload-calendar__tooltip-project">
                      Проект: {getProjectName(employeeWorkload.projectId)}
                    </div>

                    <div className="unified-workload-calendar__tooltip-sections">
                      <div className="unified-workload-calendar__tooltip-section">
                        <div className="unified-workload-calendar__tooltip-section-header">
                          <span className="unified-workload-calendar__tooltip-section-title">План</span>
                          <span className={`unified-workload-calendar__tooltip-section-status ${hasPlan ? 'unified-workload-calendar__tooltip-section-status--active' : 'unified-workload-calendar__tooltip-section-status--empty'}`}>
                            {hasPlan ? 'Есть' : 'Нет'}
                          </span>
                        </div>
                        {hasPlan && (
                          <div className="unified-workload-calendar__tooltip-section-content">
                            Запланирована работа на проекте
                          </div>
                        )}
                      </div>

                      <div className="unified-workload-calendar__tooltip-section">
                        <div className="unified-workload-calendar__tooltip-section-header">
                          <span className="unified-workload-calendar__tooltip-section-title">Факт</span>
                          <span className={`unified-workload-calendar__tooltip-section-status ${hasActual ? 'unified-workload-calendar__tooltip-section-status--active' : 'unified-workload-calendar__tooltip-section-status--empty'}`}>
                            {hasActual ? workloadService.formatHours(employeeWorkload.hoursWorked || 0) : 'Нет'}
                          </span>
                        </div>
                        {hasActual && employeeWorkload.userText && (
                          <div className="unified-workload-calendar__tooltip-section-content">
                            {employeeWorkload.userText.length > 50
                              ? `${employeeWorkload.userText.substring(0, 50)}...`
                              : employeeWorkload.userText
                            }
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="unified-workload-calendar__tooltip-divider"></div>
                    <div className={`unified-workload-calendar__tooltip-status unified-workload-calendar__tooltip-status--${workloadService.getWorkloadStatus(employeeWorkload)}`}>
                      Статус: {workloadService.getWorkloadStatusLabel(workloadService.getWorkloadStatus(employeeWorkload))}
                    </div>
                    <div className="unified-workload-calendar__tooltip-action">
                      Нажмите для подробностей
                    </div>
                  </>
                ) : (
                  <div className="unified-workload-calendar__tooltip-empty">
                    {selectedEmployee ? (
                      <>
                        <div className="unified-workload-calendar__tooltip-employee">
                          {selectedEmployee.firstName} {selectedEmployee.lastName}
                        </div>
                        <div className="unified-workload-calendar__tooltip-empty-message">
                          Нет запланированной работы
                        </div>
                        {!day.isPast && (
                          <div className="unified-workload-calendar__tooltip-action">
                            Двойной клик для создания плана
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="unified-workload-calendar__tooltip-empty-message">
                        Выберите сотрудника для просмотра
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add button for editable days when employee is selected and no workload */}
        {isDateEditable(day.date) && day.isCurrentMonth && selectedEmployee && !employeeWorkload && (
          <div className="unified-workload-calendar__add-button" onClick={(e) => {
            e.stopPropagation();
            onCreateWorkload?.(day.date);
          }}>
            <span className="unified-workload-calendar__add-button-icon">+</span>
            <span className="unified-workload-calendar__add-button-text">Добавить план</span>
          </div>
        )}

        {/* Edit button for editable days when employee has a plan */}
        {isDateEditable(day.date) && day.isCurrentMonth && selectedEmployee && employeeWorkload && hasPlan && (
          <div className="unified-workload-calendar__edit-button" onClick={(e) => {
            e.stopPropagation();
            onCellClick?.(day.date, [employeeWorkload]);
          }}>
            <span className="unified-workload-calendar__edit-button-icon">✏️</span>
            <span className="unified-workload-calendar__edit-button-text">Редактировать план</span>
          </div>
        )}
      </motion.div>
    );
  };

  // Day names
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="unified-workload-calendar">
      {/* Display Mode Toggle */}
      <div className="unified-workload-calendar__mode-toggle">
        <div className="unified-workload-calendar__mode-tabs">
          <button
            className={`unified-workload-calendar__mode-tab ${
              localDisplayMode === 'by-project' ? 'unified-workload-calendar__mode-tab--active' : ''
            }`}
            onClick={() => handleDisplayModeChange('by-project')}
            disabled={loading}
          >
            <span className="unified-workload-calendar__mode-icon">📁</span>
            <span className="unified-workload-calendar__mode-label">Проект</span>
          </button>
          <button
            className={`unified-workload-calendar__mode-tab ${
              localDisplayMode === 'single-employee' ? 'unified-workload-calendar__mode-tab--active' : ''
            }`}
            onClick={() => handleDisplayModeChange('single-employee')}
            disabled={loading}
          >
            <span className="unified-workload-calendar__mode-icon">👤</span>
            <span className="unified-workload-calendar__mode-label">Сотрудник</span>
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="unified-workload-calendar__navigation">
        <div className="unified-workload-calendar__nav-controls">
          <Button
            variant="secondary"
            size="small"
            onClick={navigatePrevious}
            disabled={loading}
          >
            ← Пред.
          </Button>

          <h3 className="unified-workload-calendar__title">
            {formatPeriodTitle()}
            {selectedEmployee && (
              <span className="unified-workload-calendar__employee-name">
                - {selectedEmployee.firstName} {selectedEmployee.lastName}
              </span>
            )}
            {selectedProject && localDisplayMode === 'by-project' && (
              <span className="unified-workload-calendar__employee-name">
                - {selectedProject.name}
              </span>
            )}
          </h3>

          <Button
            variant="secondary"
            size="small"
            onClick={navigateNext}
            disabled={loading}
          >
            След. →
          </Button>
        </div>

        <div className="unified-workload-calendar__actions">
          <Button
            variant="primary"
            size="small"
            onClick={navigateToday}
            disabled={loading}
          >
            Сегодня
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="unified-workload-calendar__legend">
        <div className="unified-workload-calendar__legend-item">
          <div className="unified-workload-calendar__legend-indicator unified-workload-calendar__legend-indicator--completed"></div>
          <span>Выполнено</span>
        </div>
        <div className="unified-workload-calendar__legend-item">
          <div className="unified-workload-calendar__legend-indicator unified-workload-calendar__legend-indicator--planned"></div>
          <span>Запланировано</span>
        </div>
        <div className="unified-workload-calendar__legend-item">
          <div className="unified-workload-calendar__legend-indicator unified-workload-calendar__legend-indicator--missing"></div>
          <span>Не отчитался</span>
        </div>
        <div className="unified-workload-calendar__legend-item">
          <div className="unified-workload-calendar__legend-indicator unified-workload-calendar__legend-indicator--overtime"></div>
          <span>Сверхурочно</span>
        </div>
      </div>

      {/* Loading State */}
      {loading && <LoadingState message="Загрузка календаря..." />}

      {/* Calendar Grid */}
      {!loading && (
        <div className={`unified-workload-calendar__grid unified-workload-calendar__grid--${view}`}>
          {/* Day Headers */}
          <div className="unified-workload-calendar__day-headers">
            {dayNames.map(dayName => (
              <div key={dayName} className="unified-workload-calendar__day-header">
                {dayName}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="unified-workload-calendar__days">
            <AnimatePresence mode="wait">
              {calendarDays.map(renderWorkloadCell)}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && unified.length === 0 && (
        <EmptyState
          icon="📅"
          title={localDisplayMode === 'single-employee'
            ? "Нет данных о рабочей нагрузке"
            : "Нет данных о рабочей нагрузке"
          }
          description={
            localDisplayMode === 'single-employee'
              ? selectedEmployee
                ? `Нет данных для сотрудника ${selectedEmployee.firstName} ${selectedEmployee.lastName}`
                : "Выберите сотрудника для просмотра рабочей нагрузки"
              : selectedProject
                ? `Нет данных для проекта ${selectedProject.name}`
                : "Выберите проект для просмотра рабочей нагрузки"
          }
          action={
            localDisplayMode === 'single-employee' && selectedEmployee && onCreateWorkload ? (
              <Button
                variant="primary"
                onClick={() => onCreateWorkload(selectedDate)}
              >
                Добавить план
              </Button>
            ) : localDisplayMode === 'by-project' && selectedProject && onCreateWorkload ? (
              <Button
                variant="primary"
                onClick={() => onCreateWorkload(selectedDate)}
              >
                Назначить сотрудника
              </Button>
            ) : undefined
          }
        />
      )}
    </div>
  );
}

export default UnifiedWorkloadCalendar;
export type { CalendarDisplayMode };