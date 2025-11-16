import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../common/modal/modal';
import Button from '../common/button/button';
import LoadingState from '../common/loading_state/loading_state';
import ProjectsBubbleChart from '../data_display/projects_bubble_chart/projects_bubble_chart';
import { analyticsService } from '../../services/analytics';
import type { ProjectsWorkloadAnalytics } from '../../store/types';

interface ProjectsAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function ProjectsAnalyticsModal({ isOpen, onClose }: ProjectsAnalyticsModalProps): JSX.Element {
  const [data, setData] = useState<ProjectsWorkloadAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [compareDate, setCompareDate] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSelectedDate('');
      setCompareDate('');
      fetchAnalytics();
    }
  }, [isOpen]);

  const fetchAnalytics = async (customDate?: string, customCompareDate?: string) => {
    setLoading(true);
    setError(null);
    try {
      const query: { date?: string; compareDate?: string } = {};
      if (customDate) {
        query.date = customDate;
      }
      if (customCompareDate) {
        query.compareDate = customCompareDate;
      }
      const response = await analyticsService.getProjectsWorkload(Object.keys(query).length > 0 ? query : undefined);
      setData(response);
    } catch (err: any) {
      const errorMessage = typeof err === 'string' ? err : err?.message || 'Ошибка при загрузке аналитики';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;

    // Валидация: дата анализа не может быть раньше даты сравнения
    if (compareDate && newDate && newDate < compareDate) {
      toast.error('Дата анализа не может быть раньше даты сравнения');
      return;
    }

    setSelectedDate(newDate);
    fetchAnalytics(newDate || undefined, compareDate || undefined);
  };

  const handleCompareDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;

    // Валидация: дата сравнения не может быть позже даты анализа
    if (selectedDate && newDate && newDate > selectedDate) {
      toast.error('Дата сравнения не может быть позже даты анализа');
      return;
    }

    setCompareDate(newDate);
    fetchAnalytics(selectedDate || undefined, newDate || undefined);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!isOpen) return <></>;

  return (
    <Modal isOpen={isOpen} onClose={onClose} id="projectsAnalyticsModal" size="large">
      <Modal.Header onClose={onClose}>
        Аналитика по проектам
      </Modal.Header>

      <Modal.Content>
        <div className="analytics-controls">
          <div className="analytics-date-container">
            <label htmlFor="analysisDate" className="analytics-date-label">
              <strong>Анализ за:</strong>
            </label>
            <input
              id="analysisDate"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="analytics-date-input"
              min={compareDate ? compareDate : undefined}
              placeholder="Сегодня"
            />
            {selectedDate ? (
              <span className="analytics-date-current">
                ({formatDate(selectedDate)})
              </span>
            ) : data?.date && (
              <span className="analytics-date-current">
                ({formatDate(data.date)})
              </span>
            )}
          </div>
          <div className="analytics-compare-container">
            <label htmlFor="compareDate" className="analytics-compare-label">
              <strong>Сравнение с:</strong>
            </label>
            <input
              id="compareDate"
              type="date"
              value={compareDate}
              onChange={handleCompareDateChange}
              className="analytics-compare-input"
              max={selectedDate || data?.date}
              placeholder="Предыдущий день"
            />
            {compareDate ? (
              <span className="analytics-compare-current">
                ({formatDate(compareDate)})
              </span>
            ) : data?.compareDate && (
              <span className="analytics-compare-current">
                ({formatDate(data.compareDate)})
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <LoadingState message="Загрузка аналитики..." />
        ) : error ? (
          <div className="error-state">
            <p className="error-message">{error}</p>
            <Button onClick={() => fetchAnalytics()} variant="primary">
              Повторить попытку
            </Button>
          </div>
        ) : data && data.projects.length > 0 ? (
          <div className="analytics-content">
            <div className="analytics-legend">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#22c55e' }}></div>
                <span>Рост числа сотрудников</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#6b7280' }}></div>
                <span>Без изменений</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#ef4444' }}></div>
                <span>Снижение числа сотрудников</span>
              </div>
            </div>

            <ProjectsBubbleChart
              data={data.projects}
              width={1000}
              height={600}
            />

            <div className="analytics-summary">
              <p>
                <strong>Всего проектов:</strong> {data.projects.length}
              </p>
              <p>
                <strong>Всего сотрудников задействовано:</strong>{' '}
                {data.projects.reduce((sum, p) => sum + p.employeeCount, 0)}
              </p>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>Нет данных для отображения за выбранный период</p>
          </div>
        )}
      </Modal.Content>

      <Modal.Footer>
        <Button onClick={onClose}>
          Закрыть
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ProjectsAnalyticsModal;
