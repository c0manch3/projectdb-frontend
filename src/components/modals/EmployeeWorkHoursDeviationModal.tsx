import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../common/modal/modal';
import Button from '../common/button/button';
import LoadingState from '../common/loading_state/loading_state';
import { analyticsService } from '../../services/analytics';
import type { EmployeeWorkHoursResponse, EmployeeWorkHourItem } from '../../store/types';

interface EmployeeWorkHoursDeviationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SortOption = 'deviation' | 'name' | 'hours';
type FilterOption = 'all' | 'overtime' | 'undertime';

function EmployeeWorkHoursDeviationModal({ isOpen, onClose }: EmployeeWorkHoursDeviationModalProps): JSX.Element {
  const [data, setData] = useState<EmployeeWorkHoursResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('deviation');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  // Get yesterday's date in YYYY-MM-DD format
  const getYesterdayDate = (): string => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (isOpen) {
      const yesterday = getYesterdayDate();
      setSelectedDate(yesterday);
      fetchAnalytics(yesterday);
    }
  }, [isOpen]);

  const fetchAnalytics = async (customDate?: string) => {
    setLoading(true);
    setError(null);
    try {
      const query = customDate ? { date: customDate } : undefined;
      const response = await analyticsService.getEmployeeWorkHours(query);
      setData(response);
    } catch (err: any) {
      const errorMessage = typeof err === 'string' ? err : err?.message || 'Ошибка при загрузке аналитики';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Employee work hours analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    fetchAnalytics(newDate || undefined);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatHours = (hours: number): string => {
    return hours.toFixed(1);
  };

  const getPercentage = (hoursWorked: number): number => {
    return Math.round((hoursWorked / 8) * 100);
  };

  // Calculate summary statistics
  const calculateSummary = (employees: EmployeeWorkHourItem[]) => {
    const overtime = employees.filter(emp => emp.deviation > 0);
    const undertime = employees.filter(emp => emp.deviation < 0);

    const totalOvertime = overtime.reduce((sum, emp) => sum + emp.deviation, 0);
    const totalUndertime = Math.abs(undertime.reduce((sum, emp) => sum + emp.deviation, 0));

    return {
      overtimeHours: totalOvertime,
      overtimeCount: overtime.length,
      undertimeHours: totalUndertime,
      undertimeCount: undertime.length,
      totalCount: employees.length
    };
  };

  // Sort employees
  const sortEmployees = (employees: EmployeeWorkHourItem[]): EmployeeWorkHourItem[] => {
    const sorted = [...employees];

    switch (sortBy) {
      case 'deviation':
        return sorted.sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));
      case 'name':
        return sorted.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
      case 'hours':
        return sorted.sort((a, b) => b.hoursWorked - a.hoursWorked);
      default:
        return sorted;
    }
  };

  // Filter employees
  const filterEmployees = (employees: EmployeeWorkHourItem[]): EmployeeWorkHourItem[] => {
    switch (filterBy) {
      case 'overtime':
        return employees.filter(emp => emp.deviation > 0);
      case 'undertime':
        return employees.filter(emp => emp.deviation < 0);
      default:
        return employees;
    }
  };

  const getFilteredAndSortedEmployees = (): EmployeeWorkHourItem[] => {
    if (!data?.employees) return [];
    return sortEmployees(filterEmployees(data.employees));
  };

  if (!isOpen) return <></>;

  const summary = data?.employees ? calculateSummary(data.employees) : null;
  const displayedEmployees = getFilteredAndSortedEmployees();

  return (
    <Modal isOpen={isOpen} onClose={onClose} id="employeeWorkHoursDeviationModal" size="large">
      <Modal.Header onClose={onClose}>
        Отклонения рабочих часов сотрудников
      </Modal.Header>

      <Modal.Content>
        {/* Date Selector Section */}
        <div className="employee-deviation-modal__date-section">
          <div className="employee-deviation-modal__date-container">
            <label htmlFor="analysisDate" className="employee-deviation-modal__date-label">
              <span className="employee-deviation-modal__date-icon">📅</span>
              Дата анализа:
            </label>
            <input
              id="analysisDate"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="employee-deviation-modal__date-input"
            />
            {selectedDate && (
              <span className="employee-deviation-modal__date-display">
                ({formatDate(selectedDate)})
              </span>
            )}
          </div>
          <div className="employee-deviation-modal__info-message">
            <span className="employee-deviation-modal__info-icon">💡</span>
            Показаны сотрудники с отклонением от 8 часов
          </div>
        </div>

        {loading ? (
          <LoadingState message="Загрузка аналитики..." />
        ) : error ? (
          <div className="employee-deviation-modal__error">
            <span className="employee-deviation-modal__error-icon">⚠️</span>
            <p className="employee-deviation-modal__error-message">{error}</p>
            <Button onClick={() => fetchAnalytics(selectedDate)} variant="primary">
              Повторить попытку
            </Button>
          </div>
        ) : data ? (
          <>
            {/* Summary Cards */}
            {summary && summary.totalCount > 0 && (
              <div className="employee-deviation-modal__summary">
                <div className="employee-deviation-modal__summary-card employee-deviation-modal__summary-card--overtime">
                  <div className="employee-deviation-modal__summary-label">Переработка</div>
                  <div className="employee-deviation-modal__summary-value employee-deviation-modal__summary-value--overtime">
                    +{formatHours(summary.overtimeHours)}ч
                  </div>
                  <div className="employee-deviation-modal__summary-subtitle">
                    ({summary.overtimeCount} {summary.overtimeCount === 1 ? 'чел.' : 'чел.'})
                  </div>
                </div>

                <div className="employee-deviation-modal__summary-card employee-deviation-modal__summary-card--undertime">
                  <div className="employee-deviation-modal__summary-label">Недоработка</div>
                  <div className="employee-deviation-modal__summary-value employee-deviation-modal__summary-value--undertime">
                    -{formatHours(summary.undertimeHours)}ч
                  </div>
                  <div className="employee-deviation-modal__summary-subtitle">
                    ({summary.undertimeCount} {summary.undertimeCount === 1 ? 'чел.' : 'чел.'})
                  </div>
                </div>

                <div className="employee-deviation-modal__summary-card employee-deviation-modal__summary-card--neutral">
                  <div className="employee-deviation-modal__summary-label">Всего записей</div>
                  <div className="employee-deviation-modal__summary-value">
                    {summary.totalCount}
                  </div>
                  <div className="employee-deviation-modal__summary-subtitle">
                    сотрудников
                  </div>
                </div>
              </div>
            )}

            {/* Controls Section */}
            {data.employees.length > 0 && (
              <div className="employee-deviation-modal__controls">
                <div className="employee-deviation-modal__sort-group">
                  <label htmlFor="sortSelect" className="employee-deviation-modal__sort-label">
                    Сортировка:
                  </label>
                  <select
                    id="sortSelect"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="employee-deviation-modal__sort-select"
                  >
                    <option value="deviation">По величине отклонения</option>
                    <option value="name">По имени (А-Я)</option>
                    <option value="hours">По часам работы</option>
                  </select>
                </div>

                <div className="employee-deviation-modal__filter-group">
                  <button
                    className={`employee-deviation-modal__filter-button ${filterBy === 'all' ? 'employee-deviation-modal__filter-button--active' : ''}`}
                    onClick={() => setFilterBy('all')}
                  >
                    Все
                  </button>
                  <button
                    className={`employee-deviation-modal__filter-button ${filterBy === 'overtime' ? 'employee-deviation-modal__filter-button--active' : ''}`}
                    onClick={() => setFilterBy('overtime')}
                  >
                    Переработка
                  </button>
                  <button
                    className={`employee-deviation-modal__filter-button ${filterBy === 'undertime' ? 'employee-deviation-modal__filter-button--active' : ''}`}
                    onClick={() => setFilterBy('undertime')}
                  >
                    Недоработка
                  </button>
                </div>
              </div>
            )}

            {/* Employee List */}
            {displayedEmployees.length > 0 ? (
              <div className="employee-deviation-modal__list">
                {displayedEmployees.map((employee) => {
                  const percentage = getPercentage(employee.hoursWorked);
                  const isOvertime = employee.deviation > 0;

                  return (
                    <div
                      key={employee.userId}
                      className={`employee-deviation-modal__card ${isOvertime ? 'employee-deviation-modal__card--overtime' : 'employee-deviation-modal__card--undertime'}`}
                    >
                      <div className="employee-deviation-modal__card-header">
                        <div className="employee-deviation-modal__employee-info">
                          <div className="employee-deviation-modal__employee-name">
                            <span className="employee-deviation-modal__employee-icon">👤</span>
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="employee-deviation-modal__employee-email">
                            {employee.email}
                          </div>
                        </div>
                        <div className={`employee-deviation-modal__deviation-badge ${isOvertime ? 'employee-deviation-modal__deviation-badge--positive' : 'employee-deviation-modal__deviation-badge--negative'}`}>
                          {isOvertime ? '+' : ''}{formatHours(employee.deviation)}ч
                          <span className="employee-deviation-modal__deviation-arrow">
                            {isOvertime ? '⬆️' : '⬇️'}
                          </span>
                        </div>
                      </div>

                      <div className="employee-deviation-modal__card-content">
                        <div className="employee-deviation-modal__hours-row">
                          <span className="employee-deviation-modal__hours-icon">⏰</span>
                          <span className="employee-deviation-modal__hours-label">Отработано:</span>
                          <span className="employee-deviation-modal__hours-value">
                            {formatHours(employee.hoursWorked)} часов
                          </span>
                        </div>
                        <div className="employee-deviation-modal__hours-row">
                          <span className="employee-deviation-modal__hours-icon">📊</span>
                          <span className="employee-deviation-modal__hours-label">Норма:</span>
                          <span className="employee-deviation-modal__hours-value">8.0 часов</span>
                        </div>

                        <div className="employee-deviation-modal__progress">
                          <div className="employee-deviation-modal__progress-bar-container">
                            <div
                              className={`employee-deviation-modal__progress-bar ${isOvertime ? 'employee-deviation-modal__progress-bar--overtime' : 'employee-deviation-modal__progress-bar--undertime'}`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <div className="employee-deviation-modal__progress-percentage">
                            {percentage}%
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="employee-deviation-modal__empty">
                <div className="employee-deviation-modal__empty-icon">✅</div>
                <h3 className="employee-deviation-modal__empty-title">
                  Все сотрудники отработали ровно 8 часов
                </h3>
                <p className="employee-deviation-modal__empty-description">
                  В выбранную дату все сотрудники работали согласно стандартному графику работы.
                </p>
              </div>
            )}
          </>
        ) : null}
      </Modal.Content>

      <Modal.Footer>
        <Button onClick={onClose} variant="secondary">
          Закрыть
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EmployeeWorkHoursDeviationModal;
