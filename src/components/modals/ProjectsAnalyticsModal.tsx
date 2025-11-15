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

  useEffect(() => {
    if (isOpen) {
      fetchAnalytics();
    }
  }, [isOpen]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await analyticsService.getProjectsWorkload();
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
        {loading ? (
          <LoadingState message="Загрузка аналитики..." />
        ) : error ? (
          <div className="error-state">
            <p className="error-message">{error}</p>
            <Button onClick={fetchAnalytics} variant="primary">
              Повторить попытку
            </Button>
          </div>
        ) : data && data.projects.length > 0 ? (
          <div className="analytics-content">
            <div className="analytics-header">
              <div className="analytics-info">
                <p className="analytics-date">
                  <strong>Анализ за:</strong> {formatDate(data.date)}
                </p>
                <p className="analytics-compare">
                  <strong>Сравнение с:</strong> {formatDate(data.compareDate)}
                </p>
              </div>
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
