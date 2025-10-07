import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import Modal from '../common/modal/modal';
import Button from '../common/button/button';

import type { AppDispatch } from '../../store';
import {
  deleteProject,
  fetchProjects,
  fetchProjectStats,
  selectProjectsLoading
} from '../../store/slices/projects_slice';
import { selectCurrentUser } from '../../store/slices/auth_slice';
import type { Project } from '../../store/types';

interface ConfirmDeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

function ConfirmDeleteProjectModal({ isOpen, onClose, project }: ConfirmDeleteProjectModalProps): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const loading = useSelector(selectProjectsLoading);
  const currentUser = useSelector(selectCurrentUser);

  // Local state
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle project deletion
  const handleDelete = async () => {
    if (!project) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteProject(project.id)).unwrap();

      toast.success('Проект успешно удален');

      // Refresh data
      dispatch(fetchProjects());
      dispatch(fetchProjectStats());

      // Close modal
      onClose();

    } catch (error: any) {
      toast.error(typeof error === 'string' ? error : error?.message || 'Ошибка при удалении проекта');
    } finally {
      setIsDeleting(false);
    }
  };

  // Check user permissions
  const canDeleteProjects = currentUser?.role === 'Admin';

  if (!canDeleteProjects || !project) {
    return <></>;
  }

  // Format project cost for display
  const formatCost = (cost: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(cost);
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  // Get status label
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

  // Get type label
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

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header onClose={!isDeleting ? onClose : undefined}>
        Удалить проект
      </Modal.Header>
      <Modal.Content>
        <div className="confirm-delete">
          <div className="confirm-delete__message">
            <p className="confirm-delete__text">
              Вы действительно хотите удалить проект?
            </p>
            <p className="confirm-delete__warning">
              Это действие нельзя отменить. Все связанные данные (документы, конструкции, планы загруженности) также будут удалены.
            </p>
          </div>

          <div className="confirm-delete__details">
            <h4 className="confirm-delete__details-title">Информация о проекте:</h4>

            <div className="project-details">
              <div className="project-details__row">
                <span className="project-details__label">Название:</span>
                <span className="project-details__value">{project.name}</span>
              </div>

              <div className="project-details__row">
                <span className="project-details__label">Тип:</span>
                <span className="project-details__value">{getTypeLabel(project.type)}</span>
              </div>

              <div className="project-details__row">
                <span className="project-details__label">Статус:</span>
                <span className={`project-details__value status-badge status-badge--${project.status}`}>
                  {getStatusLabel(project.status)}
                </span>
              </div>

              <div className="project-details__row">
                <span className="project-details__label">Дата договора:</span>
                <span className="project-details__value">{formatDate(project.contractDate)}</span>
              </div>

              <div className="project-details__row">
                <span className="project-details__label">Срок сдачи:</span>
                <span className="project-details__value">{formatDate(project.expirationDate)}</span>
              </div>

              <div className="project-details__row">
                <span className="project-details__label">Стоимость:</span>
                <span className="project-details__value project-details__cost">
                  {formatCost(project.cost)}
                </span>
              </div>

              <div className="project-details__row">
                <span className="project-details__label">Создан:</span>
                <span className="project-details__value">{formatDate(project.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={isDeleting || loading}>
          Отмена
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={isDeleting || loading}
        >
          {isDeleting ? 'Удаление...' : 'Удалить проект'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmDeleteProjectModal;