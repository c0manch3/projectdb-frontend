import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import Modal from '../common/modal/modal';
import Button from '../common/button/button';
import type { AppDispatch } from '../../store';
import {
  deleteWorkloadPlan,
  selectWorkloadPlanLoading,
  selectWorkloadError
} from '../../store/slices/workload_slice';
import type { WorkloadPlan } from '../../store/types';

interface ConfirmDeleteWorkloadPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  plan: WorkloadPlan | null;
}

function ConfirmDeleteWorkloadPlanModal({
  isOpen,
  onClose,
  onSuccess,
  plan
}: ConfirmDeleteWorkloadPlanModalProps): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const loading = useSelector(selectWorkloadPlanLoading);
  const error = useSelector(selectWorkloadError);

  // Local state
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle delete confirmation
  const handleDelete = async () => {
    if (!plan) return;

    setIsDeleting(true);

    try {
      await dispatch(deleteWorkloadPlan(plan.id)).unwrap();
      toast.success('План рабочей нагрузки удален успешно');
      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при удалении плана');
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

  if (!plan) {
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
              Это действие нельзя отменить. План рабочей нагрузки будет удален безвозвратно.
            </p>
          </div>
        </div>

        {/* Plan Details */}
        <div className="confirmation-details">
          <h4 className="confirmation-details__title">Детали плана:</h4>
          <div className="confirmation-details__grid">
            <div className="confirmation-details__item">
              <span className="confirmation-details__label">Сотрудник:</span>
              <span className="confirmation-details__value">
                {/* Note: Employee name would need to be looked up from employees list */}
                ID: {plan.userId}
              </span>
            </div>
            <div className="confirmation-details__item">
              <span className="confirmation-details__label">Проект:</span>
              <span className="confirmation-details__value">
                {/* Note: Project name would need to be looked up from projects list */}
                ID: {plan.projectId}
              </span>
            </div>
            <div className="confirmation-details__item">
              <span className="confirmation-details__label">Дата:</span>
              <span className="confirmation-details__value">
                {new Date(plan.date).toLocaleDateString('ru-RU')}
              </span>
            </div>
            <div className="confirmation-details__item">
              <span className="confirmation-details__label">Создан:</span>
              <span className="confirmation-details__value">
                {new Date(plan.createdAt).toLocaleDateString('ru-RU', {
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
            {isDeleting ? 'Удаление...' : 'Удалить план'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDeleteWorkloadPlanModal;