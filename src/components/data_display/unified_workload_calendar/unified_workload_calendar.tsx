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
    onCellClick?.(day.date, day.workloads);
  };

  // Handle day double-click for creating workload
  const handleDayDoubleClick = (day: CalendarDay) => {
    // Only allow creation on future dates and current date, and only if employee is selected
    if (!day.isPast && selectedEmployee && onCreateWorkload) {
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

  // Render workload cell
  const renderWorkloadCell = (day: CalendarDay) => {
    const summary = getWorkloadSummary(day.workloads);
    const hasWorkload = day.workloads.length > 0;
    const isHovered = hoveredDate === day.date;

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
        className={`unified-workload-calendar__cell ${statusClass} ${
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

        {/* Workload Indicators */}
        {hasWorkload && (
          <div className="unified-workload-calendar__workload-indicators">
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

            {/* Hours worked */}
            {summary.totalHours > 0 && (
              <div className="unified-workload-calendar__hours">
                {workloadService.formatHours(summary.totalHours)}
              </div>
            )}
          </div>
        )}

        {/* Hover tooltip */}
        {isHovered && hasWorkload && (
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
                {day.workloads.map((workload, index) => (
                  <div key={index} className="unified-workload-calendar__tooltip-item">
                    <div className="unified-workload-calendar__tooltip-employee">
                      {!selectedEmployee && getEmployeeName(workload.userId)}
                    </div>
                    <div className="unified-workload-calendar__tooltip-project">
                      {getProjectName(workload.projectId)}
                    </div>
                    <div className="unified-workload-calendar__tooltip-status">
                      {workloadService.getWorkloadStatusLabel(workloadService.getWorkloadStatus(workload))}
                      {workload.hoursWorked && ` - ${workloadService.formatHours(workload.hoursWorked)}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add button for editable days when employee is selected */}
        {isDateEditable(day.date) && day.isCurrentMonth && selectedEmployee && (
          <div className="unified-workload-calendar__add-button" onClick={(e) => {
            e.stopPropagation();
            onCreateWorkload?.(day.date);
          }}>
            +
          </div>
        )}
      </motion.div>
    );
  };

  // Day names
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="unified-workload-calendar">
      {/* Employee Selection Header */}
      <div className="unified-workload-calendar__header">
        <div className="unified-workload-calendar__employee-section">
          <label className="unified-workload-calendar__employee-label" htmlFor="employee-select">
            Сотрудник:
          </label>
          <select
            id="employee-select"
            className="unified-workload-calendar__employee-select"
            value={filters.userId || ''}
            onChange={(e) => handleEmployeeChange(e.target.value)}
            disabled={loading}
          >
            <option value="">Все сотрудники</option>
            {employees.filter(employee => employee.role === 'Employee').map(employee => (
              <option key={employee.id} value={employee.id}>
                {employee.firstName} {employee.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="unified-workload-calendar__current-selection">
          <span className="unified-workload-calendar__selection-text">
            {selectedEmployee
              ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
              : 'Все сотрудники'
            }
          </span>
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
            selectedEmployee && onCreateWorkload && (
              <Button
                variant="primary"
                onClick={() => onCreateWorkload(selectedDate)}
              >
                Добавить план
              </Button>
            )
          }
        />
      )}
    </div>
  );
}

export default UnifiedWorkloadCalendar;