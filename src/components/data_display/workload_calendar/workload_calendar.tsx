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
  updateSelectedDate,
  fetchUnifiedWorkload
} from '../../../store/slices/workload_slice';
import type { UnifiedWorkload } from '../../../store/types';
import { workloadService } from '../../../services/workload';

interface WorkloadCalendarProps {
  onAddPlan?: (date: string) => void;
  onEditPlan?: (planId: string) => void;
  onDeletePlan?: (planId: string) => void;
  onAddActual?: (date: string) => void;
  onEditActual?: (actualId: string) => void;
  onDeleteActual?: (actualId: string) => void;
  onViewDetails?: (workload: UnifiedWorkload) => void;
}

interface CalendarDay {
  date: string;
  workloads: UnifiedWorkload[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

function WorkloadCalendar({
  onAddPlan,
  onEditPlan,
  onDeletePlan,
  onAddActual,
  onEditActual,
  onDeleteActual,
  onViewDetails
}: WorkloadCalendarProps): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const unified = useSelector(selectUnifiedWorkload);
  const loading = useSelector(selectWorkloadUnifiedLoading);
  const view = useSelector(selectWorkloadView);
  const selectedDate = useSelector(selectWorkloadSelectedDate);
  const employees = useSelector(selectWorkloadEmployees);
  const projects = useSelector(selectWorkloadProjects);

  // Local state
  const [currentDate, setCurrentDate] = useState(new Date());

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
          isSelected: dateString === selectedDate
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
          isSelected: dateString === selectedDate
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
  const handleDayClick = (date: string) => {
    dispatch(updateSelectedDate(date));
  };

  // Get employee name by ID
  const getEmployeeName = (userId: string): string => {
    const employee = employees.find(emp => emp.id === userId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';
  };

  // Get project name by ID
  const getProjectName = (projectId: string): string => {
    const project = projects.find(proj => proj.id === projectId);
    return project ? project.name : 'Unknown Project';
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

  // Render workload item
  const renderWorkloadItem = (workload: UnifiedWorkload) => {
    const status = workloadService.getWorkloadStatus(workload);
    const statusClass = `workload-item--${status}`;

    return (
      <motion.div
        key={`${workload.date}-${workload.userId}-${workload.projectId}`}
        className={`workload-item ${statusClass}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        onClick={() => onViewDetails?.(workload)}
      >
        <div className="workload-item__header">
          <span className="workload-item__employee">
            {getEmployeeName(workload.userId)}
          </span>
          <span className="workload-item__project">
            {getProjectName(workload.projectId)}
          </span>
        </div>

        <div className="workload-item__content">
          {workload.planId && !workload.actualId && (
            <div className="workload-item__plan">
              📋 Запланировано
            </div>
          )}

          {workload.actualId && (
            <div className="workload-item__actual">
              ✅ {workloadService.formatHours(workload.hoursWorked || 0)}
              {workload.userText && (
                <div className="workload-item__description">
                  {workload.userText.substring(0, 50)}
                  {workload.userText.length > 50 ? '...' : ''}
                </div>
              )}
            </div>
          )}

          {workload.planId && !workload.actualId && (
            <div className="workload-item__missing">
              ⚠️ Не отчитался
            </div>
          )}

          {!workload.planId && workload.actualId && (
            <div className="workload-item__overtime">
              ⏰ Сверхурочно
            </div>
          )}
        </div>

        <div className="workload-item__actions">
          {workload.planId && (
            <>
              <button
                className="workload-item__action"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditPlan?.(workload.planId!);
                }}
                title="Редактировать план"
              >
                ✏️
              </button>
              <button
                className="workload-item__action workload-item__action--danger"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeletePlan?.(workload.planId!);
                }}
                title="Удалить план"
              >
                🗑️
              </button>
            </>
          )}

          {workload.actualId && (
            <>
              <button
                className="workload-item__action"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditActual?.(workload.actualId!);
                }}
                title="Редактировать время"
              >
                ✏️
              </button>
              <button
                className="workload-item__action workload-item__action--danger"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteActual?.(workload.actualId!);
                }}
                title="Удалить время"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </motion.div>
    );
  };

  // Day names
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="workload-calendar">
      {/* Calendar Header */}
      <div className="workload-calendar__header">
        <div className="workload-calendar__navigation">
          <Button
            variant="secondary"
            size="small"
            onClick={navigatePrevious}
            disabled={loading}
          >
            ← Пред.
          </Button>

          <h3 className="workload-calendar__title">
            {formatPeriodTitle()}
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

        <div className="workload-calendar__actions">
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

      {/* Loading State */}
      {loading && <LoadingState message="Загрузка календаря..." />}

      {/* Calendar Grid */}
      {!loading && (
        <div className={`workload-calendar__grid workload-calendar__grid--${view}`}>
          {/* Day Headers */}
          <div className="workload-calendar__day-headers">
            {dayNames.map(dayName => (
              <div key={dayName} className="workload-calendar__day-header">
                {dayName}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="workload-calendar__days">
            <AnimatePresence mode="wait">
              {calendarDays.map(day => (
                <motion.div
                  key={day.date}
                  className={`workload-calendar__day ${
                    day.isCurrentMonth ? '' : 'workload-calendar__day--other-month'
                  } ${
                    day.isToday ? 'workload-calendar__day--today' : ''
                  } ${
                    day.isSelected ? 'workload-calendar__day--selected' : ''
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleDayClick(day.date)}
                >
                  {/* Day Number */}
                  <div className="workload-calendar__day-number">
                    {new Date(day.date).getDate()}
                  </div>

                  {/* Add Buttons */}
                  {day.isCurrentMonth && (
                    <div className="workload-calendar__day-actions">
                      {onAddPlan && (
                        <button
                          className="workload-calendar__add-button workload-calendar__add-button--plan"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddPlan(day.date);
                          }}
                          title="Добавить план"
                        >
                          📋
                        </button>
                      )}
                      {onAddActual && (
                        <button
                          className="workload-calendar__add-button workload-calendar__add-button--actual"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddActual(day.date);
                          }}
                          title="Добавить время"
                        >
                          ⏱️
                        </button>
                      )}
                    </div>
                  )}

                  {/* Workload Items */}
                  <div className="workload-calendar__day-content">
                    <AnimatePresence>
                      {day.workloads.map(renderWorkloadItem)}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && unified.length === 0 && (
        <EmptyState
          icon="📅"
          title="Нет данных о рабочей нагрузке"
          description="Создайте первый план или добавьте отработанное время"
          action={
            onAddPlan && (
              <Button
                variant="primary"
                onClick={() => onAddPlan(selectedDate)}
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

export default WorkloadCalendar;