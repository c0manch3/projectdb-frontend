import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Modal from '../common/modal/modal';
import Button from '../common/button/button';

import type { AppDispatch } from '../../store';
import {
  deleteConstruction,
  selectConstructionsLoading,
  selectConstructionsError
} from '../../store/slices/constructions_slice';
import { selectCurrentUser } from '../../store/slices/auth_slice';
import type { Construction } from '../../store/types';

interface ConfirmDeleteConstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  construction: Construction | null;
}

function ConfirmDeleteConstructionModal({
  isOpen,
  onClose,
  construction
}: ConfirmDeleteConstructionModalProps): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const loading = useSelector(selectConstructionsLoading);
  const error = useSelector(selectConstructionsError);
  const currentUser = useSelector(selectCurrentUser);

  // Local state
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!construction || isDeleting) return;

    setIsDeleting(true);

    try {
      await dispatch(deleteConstruction(construction.id)).unwrap();
      toast.success('Сооружение успешно удалено');
      onClose();
    } catch (error: any) {
      console.error('Error deleting construction:', error);
      toast.error(typeof error === 'string' ? error : error?.message || 'Ошибка при удалении сооружения');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (isDeleting) return;
    onClose();
  };

  // Check permissions
  const canDeleteConstructions = currentUser?.role === 'Admin';

  if (!canDeleteConstructions) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Доступ запрещен">
        <div className="modal-access-denied">
          <p>У вас нет прав для удаления сооружений.</p>
          <div className="modal-actions">
            <Button onClick={handleClose}>Закрыть</Button>
          </div>
        </div>
      </Modal>
    );
  }

  if (!construction) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Ошибка">
        <div className="modal-error">
          <p>Сооружение не найдено.</p>
          <div className="modal-actions">
            <Button onClick={handleClose}>Закрыть</Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={!isDeleting ? handleClose : undefined}
    >
      <Modal.Header onClose={!isDeleting ? handleClose : undefined}>
        Удаление сооружения
      </Modal.Header>

      <Modal.Content>
        <div className="delete-confirmation">
          <div className="delete-confirmation__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="delete-confirmation__content">
            <h3>Вы действительно хотите удалить это сооружение?</h3>

            {/* Construction Information Card */}
            <div className="document-details">
              <div className="detail-item">
                <span className="detail-label">
                  🏗️ Сооружение:
                </span>
                <span className="detail-value">
                  {construction.name}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">ID:</span>
                <span className="detail-value">{construction.id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Создано:</span>
                <span className="detail-value">
                  {new Date(construction.createdAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Последнее изменение:</span>
                <span className="detail-value">
                  {new Date(construction.updatedAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
            </div>

            <p className="delete-warning">
              <strong>Внимание:</strong> Это действие нельзя будет отменить.
              Все связанные с сооружением документы также будут удалены.
            </p>
          </div>
        </div>

        {error && (
          <div className="form-error-message">
            <p>{error}</p>
          </div>
        )}
      </Modal.Content>

      <Modal.Footer>
        <div className="modal-actions">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Отмена
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    marginRight: '8px',
                    animation: 'spin 1s linear infinite'
                  }}
                >
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                Удаление...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
                Удалить сооружение
              </>
            )}
          </Button>
        </div>
      </Modal.Footer>

      {/* Add keyframe animation for spinner */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Modal>
  );
}

export default ConfirmDeleteConstructionModal;