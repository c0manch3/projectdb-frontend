import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import Modal from '../common/modal/modal';
import Button from '../common/button/button';
import type { AppDispatch } from '../../store';
import {
  deleteWorkloadActual,
  selectWorkloadActualLoading,
  selectWorkloadError
} from '../../store/slices/workload_slice';
import type { WorkloadActual } from '../../store/types';
import { workloadService } from '../../services/workload';

interface ConfirmDeleteWorkloadActualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  actual: WorkloadActual | null;
}

function ConfirmDeleteWorkloadActualModal({
  isOpen,
  onClose,
  onSuccess,
  actual
}: ConfirmDeleteWorkloadActualModalProps): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const loading = useSelector(selectWorkloadActualLoading);
  const error = useSelector(selectWorkloadError);

  // Local state
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle delete confirmation
  const handleDelete = async () => {
    if (!actual) return;

    setIsDeleting(true);

    try {
      await dispatch(deleteWorkloadActual(actual.id)).unwrap();
      toast.success('Запись о выполненной работе удалена успешно');
      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при удалении записи');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  if (!actual) {
    return <></>;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Подтвердите удаление"
      size="small"
    >
      <div className="modal__content">
        {/* Warning Message */}
        <div className="alert alert--warning">
          <div className="alert__icon">⚠️</div>
          <div className="alert__content">
            <h4 className="alert__title">Внимание!</h4>
            <p className="alert__message">
              Это действие нельзя отменить. Запись о выполненной работе будет удалена безвозвратно.
            </p>
          </div>
        </div>

        {/* Actual Details */}
        <div className="confirmation-details">
          <h4 className="confirmation-details__title">Детали записи:</h4>
          <div className="confirmation-details__grid">
            <div className="confirmation-details__item">
              <span className="confirmation-details__label">Сотрудник:</span>
              <span className="confirmation-details__value">
                {/* Note: Employee name would need to be looked up from employees list */}
                ID: {actual.userId}
              </span>
            </div>
            <div className="confirmation-details__item">
              <span className="confirmation-details__label">Проект:</span>
              <span className="confirmation-details__value">
                {/* Note: Project name would need to be looked up from projects list */}
                ID: {actual.projectId}
              </span>
            </div>
            <div className="confirmation-details__item">
              <span className="confirmation-details__label">Дата:</span>
              <span className="confirmation-details__value">
                {new Date(actual.date).toLocaleDateString('ru-RU')}
              </span>
            </div>
            <div className="confirmation-details__item">
              <span className="confirmation-details__label">Часов отработано:</span>
              <span className="confirmation-details__value">
                {workloadService.formatHours(actual.hoursWorked)}
              </span>
            </div>
            <div className="confirmation-details__item confirmation-details__item--full">
              <span className="confirmation-details__label">Описание работы:</span>
              <span className="confirmation-details__value">
                {actual.userText}
              </span>
            </div>
            <div className="confirmation-details__item">
              <span className="confirmation-details__label">Создана:</span>
              <span className="confirmation-details__value">
                {new Date(actual.createdAt).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Additional Warning for Recent Records */}
        {(() => {
          const createdDate = new Date(actual.createdAt);
          const now = new Date();
          const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

          if (daysDiff <= 7) {
            return (
              <div className="alert alert--info">
                <div className="alert__icon">ℹ️</div>
                <div className="alert__content">
                  <p className="alert__message">
                    Эта запись была создана {daysDiff === 0 ? 'сегодня' : `${daysDiff} дн. назад`}.
                    Убедитесь, что вы действительно хотите ее удалить.
                  </p>
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Global Error */}
        {error && (
          <div className="form__error">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="modal__footer">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Отмена
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            loading={isDeleting}
            disabled={loading}
          >
            {isDeleting ? 'Удаление...' : 'Удалить запись'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDeleteWorkloadActualModal;