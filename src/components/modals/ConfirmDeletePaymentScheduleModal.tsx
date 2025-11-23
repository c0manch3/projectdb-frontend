import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';

import Modal from '../common/modal/modal';
import Button from '../common/button/button';

import type { AppDispatch } from '../../store';
import {
  deletePaymentSchedule,
  fetchPaymentSchedulesByProject,
} from '../../store/slices/payment_schedules_slice';
import { fetchProjects } from '../../store/slices/projects_slice';
import type { PaymentSchedule } from '../../store/types';
import { paymentSchedulesService } from '../../services/payment_schedules';

interface ConfirmDeletePaymentScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentSchedule: PaymentSchedule | null;
  onSuccess?: () => void;
}

function ConfirmDeletePaymentScheduleModal({
  isOpen,
  onClose,
  paymentSchedule,
  onSuccess
}: ConfirmDeletePaymentScheduleModalProps): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle delete confirmation
  const handleDelete = async () => {
    if (!paymentSchedule) return;

    setIsDeleting(true);
    try {
      await dispatch(deletePaymentSchedule(paymentSchedule.id)).unwrap();

      // Success: refresh data and close modal
      toast.success('Платеж успешно удален');
      dispatch(fetchPaymentSchedulesByProject(paymentSchedule.projectId));
      dispatch(fetchProjects()); // Refresh projects to update cost

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error: any) {
      // Error handling
      const errorMessage = error || 'Ошибка при удалении платежа';
      toast.error(errorMessage);
      console.error('Delete payment schedule error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !paymentSchedule) return <></>;

  // Format amount for display
  const formattedAmount = paymentSchedulesService.formatAmount(paymentSchedule.amount);
  const paymentTypeLabel = paymentSchedulesService.getPaymentTypeLabel(paymentSchedule.type);

  return (
    <Modal isOpen={isOpen} onClose={onClose} id="confirmDeletePaymentScheduleModal">
      <Modal.Header onClose={onClose}>
        Удаление платежа
      </Modal.Header>

      <Modal.Content>
        <div className="confirm-delete">
          <div className="confirm-delete__icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </div>

          <p className="confirm-delete__message">
            Вы уверены, что хотите удалить платеж?
          </p>

          <div className="confirm-delete__details">
            <p><strong>Название:</strong> {paymentSchedule.name}</p>
            <p><strong>Тип:</strong> {paymentTypeLabel}</p>
            <p><strong>Сумма:</strong> {formattedAmount}</p>
            {paymentSchedule.isPaid && (
              <p className="confirm-delete__warning">
                Внимание: Этот платеж отмечен как оплаченный!
              </p>
            )}
          </div>

          <p className="confirm-delete__warning-text">
            Это действие нельзя отменить. Стоимость проекта будет пересчитана автоматически.
          </p>
        </div>
      </Modal.Content>

      <Modal.Footer>
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={isDeleting}
        >
          Отмена
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? 'Удаление...' : 'Удалить платеж'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmDeletePaymentScheduleModal;
