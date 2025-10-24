import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import Modal from '../common/modal/modal';
import Button from '../common/button/button';

import {
  selectProjectCustomers,
  selectProjectManagers,
  selectMainProjects
} from '../../store/slices/projects_slice';
import { selectCurrentUser } from '../../store/slices/auth_slice';
import type { Project } from '../../store/types';
import { AppRoute } from '../../const';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

function ProjectDetailsModal({ isOpen, onClose, project, onEdit, onDelete }: ProjectDetailsModalProps): JSX.Element {
  // Redux state
  const customers = useSelector(selectProjectCustomers);
  const managers = useSelector(selectProjectManagers);
  const mainProjects = useSelector(selectMainProjects);
  const currentUser = useSelector(selectCurrentUser);

  if (!project) {
    return <></>;
  }

  // Helper functions
  const formatCost = (cost: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(cost);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'Active':
        return 'Активный';
      case 'Completed':
        return 'Завершенный';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'main':
        return 'Основной';
      case 'additional':
        return 'Дополнительное соглашение';
      default:
        return type;
    }
  };

  // Get related data
  const customer = customers.find(c => c.id === project.customerId);
  const manager = managers.find(m => m.id === project.managerId);
  const mainProject = project.mainProjectId ? mainProjects.find(p => p.id === project.mainProjectId) : null;

  // Check user permissions
  const canEditProjects = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';
  const canDeleteProjects = currentUser?.role === 'Admin';

  // Calculate project duration
  const contractDate = new Date(project.contractDate);
  const expirationDate = new Date(project.expirationDate);
  const durationMs = expirationDate.getTime() - contractDate.getTime();
  const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

  // Calculate remaining days
  const today = new Date();
  const remainingMs = expirationDate.getTime() - today.getTime();
  const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <Modal.Header onClose={onClose}>
        Детали проекта
      </Modal.Header>
      <Modal.Content>
        <div className="project-details-modal">
          <div className="project-header">
            <div className="project-header__main">
              <h2 className="project-header__title">{project.name}</h2>
              <div className="project-header__meta">
                <span className={`status-badge status-badge--${project.status}`}>
                  {getStatusLabel(project.status)}
                </span>
                <span className="project-type-badge">
                  {getTypeLabel(project.type)}
                </span>
              </div>
            </div>
            <div className="project-header__cost">
              <span className="project-cost">{formatCost(project.cost)}</span>
            </div>
          </div>

          <div className="project-info-grid">
            <div className="project-info-section">
              <h3 className="project-info-section__title">Основная информация</h3>
              <div className="project-info-list">
                <div className="project-info-item">
                  <span className="project-info-item__label">Заказчик:</span>
                  <span className="project-info-item__value">
                    {customer ? customer.name : project.customerId ? 'Неизвестен' : 'Не указан'}
                  </span>
                </div>

                <div className="project-info-item">
                  <span className="project-info-item__label">Менеджер проекта:</span>
                  <span className="project-info-item__value">
                    {manager ? `${manager.firstName} ${manager.lastName}` : 'Не назначен'}
                  </span>
                </div>

                {project.type === 'additional' && mainProject && (
                  <div className="project-info-item">
                    <span className="project-info-item__label">Основной проект:</span>
                    <span className="project-info-item__value">
                      {mainProject.name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="project-info-section">
              <h3 className="project-info-section__title">Временные рамки</h3>
              <div className="project-info-list">
                <div className="project-info-item">
                  <span className="project-info-item__label">Дата договора:</span>
                  <span className="project-info-item__value">{formatDate(project.contractDate)}</span>
                </div>

                <div className="project-info-item">
                  <span className="project-info-item__label">Срок сдачи:</span>
                  <span className="project-info-item__value">{formatDate(project.expirationDate)}</span>
                </div>

                <div className="project-info-item">
                  <span className="project-info-item__label">Длительность:</span>
                  <span className="project-info-item__value">{durationDays} дн.</span>
                </div>

                <div className="project-info-item">
                  <span className="project-info-item__label">Осталось дней:</span>
                  <span className={`project-info-item__value ${remainingDays < 0 ? 'text-danger' : remainingDays < 30 ? 'text-warning' : 'text-success'}`}>
                    {remainingDays < 0 ? `Просрочен на ${Math.abs(remainingDays)} дн.` : `${remainingDays} дн.`}
                  </span>
                </div>
              </div>
            </div>

            <div className="project-info-section">
              <h3 className="project-info-section__title">Системная информация</h3>
              <div className="project-info-list">
                <div className="project-info-item">
                  <span className="project-info-item__label">ID проекта:</span>
                  <span className="project-info-item__value project-info-item__id">{project.id}</span>
                </div>

                <div className="project-info-item">
                  <span className="project-info-item__label">Создан:</span>
                  <span className="project-info-item__value">{formatDateTime(project.createdAt)}</span>
                </div>

                <div className="project-info-item">
                  <span className="project-info-item__label">Обновлен:</span>
                  <span className="project-info-item__value">{formatDateTime(project.updatedAt)}</span>
                </div>
              </div>
            </div>

            <div className="project-info-section">
              <h3 className="project-info-section__title">Быстрые действия</h3>
              <div className="project-actions">
                <Link
                  to={`/projects/${project.id}`}
                  className="button button--outline button--small"
                >
                  Открыть проект
                </Link>

                {customer && (
                  <Link
                    to={`/companies`}
                    className="button button--outline button--small"
                  >
                    Профиль заказчика
                  </Link>
                )}

                {manager && (
                  <Link
                    to={`/employees`}
                    className="button button--outline button--small"
                  >
                    Профиль менеджера
                  </Link>
                )}
              </div>
            </div>
          </div>

          {project.type === 'main' && (
            <div className="project-additional-info">
              <h3 className="project-additional-info__title">Дополнительная информация</h3>
              <p className="project-additional-info__text">
                Это основной проект. К нему могут быть привязаны дополнительные соглашения.
              </p>
            </div>
          )}
        </div>
      </Modal.Content>
      <Modal.Footer>
        <div className="modal-footer__left">
          <Button variant="secondary" onClick={onClose}>
            Закрыть
          </Button>
        </div>
        <div className="modal-footer__right">
          {canEditProjects && onEdit && (
            <Button
              variant="outline"
              onClick={() => onEdit(project)}
            >
              Редактировать
            </Button>
          )}
          {canDeleteProjects && onDelete && (
            <Button
              variant="danger"
              onClick={() => onDelete(project)}
            >
              Удалить
            </Button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default ProjectDetailsModal;