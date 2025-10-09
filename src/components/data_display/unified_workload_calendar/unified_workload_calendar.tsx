import { useState, useMemo } from 'react';
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
  updateSelectedDate
} from '../../../store/slices/workload_slice';
import type { UnifiedWorkload } from '../../../store/types';
import { workloadService } from '../../../services/workload';

interface UnifiedWorkloadCalendarProps {
  onCellClick?: (date: string, workloads: UnifiedWorkload[]) => void;
  onCreateWorkload?: (date: string) => void;
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

function UnifiedWorkloadCalendar({
  onCellClick,
  onCreateWorkload
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

  // Get selected employee for filtering
  const selectedEmployee = useMemo(() => {
    if (!filters.userId) return null;
    return employees.find(emp => emp.id === filters.userId);
  }, [filters.userId, employees]);

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

    // In single-employee mode, filter workloads for selected employee
    const employeeWorkloads = selectedEmployee
      ? day.workloads.filter(w => w.userId === selectedEmployee.id)
      : [];
    onCellClick?.(day.date, employeeWorkloads);
  };

  // Handle day double-click for creating workload
  const handleDayDoubleClick = (day: CalendarDay) => {
    // Only allow creation on future dates and current date
    if (!day.isPast && onCreateWorkload && selectedEmployee) {
      // In single-employee mode, create for selected employee
      onCreateWorkload(day.date);
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

  // Render workload cell for single-employee mode
  const renderWorkloadCell = (day: CalendarDay) => {
    const hasWorkload = day.workloads.length > 0;
    const isHovered = hoveredDate === day.date;

    return renderSingleEmployeeCell(day, hasWorkload, isHovered);
  };

  // Render cell for single-employee mode with plan/fact split
  const renderSingleEmployeeCell = (day: CalendarDay, hasWorkload: boolean, isHovered: boolean) => {
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
            <span className="unified-workload-calendar__edit-button-text">Редактировать<br />план</span>
          </div>
        )}
      </motion.div>
    );
  };

  // Day names
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="unified-workload-calendar">
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
          title="Нет данных о рабочей нагрузке"
          description={
            selectedEmployee
              ? `Нет данных для сотрудника ${selectedEmployee.firstName} ${selectedEmployee.lastName}`
              : "Выберите сотрудника для просмотра рабочей нагрузки"
          }
          action={
            selectedEmployee && onCreateWorkload ? (
              <Button
                variant="primary"
                onClick={() => onCreateWorkload(selectedDate)}
              >
                Добавить план
              </Button>
            ) : undefined
          }
        />
      )}
    </div>
  );
}

export default UnifiedWorkloadCalendar;