import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';

import Modal from '../common/modal/modal';
import Button from '../common/button/button';
import FormInput from '../forms/form_input/form_input';
import FormSelect from '../forms/form_select/form_select';
import FormGroup from '../forms/form_group/form_group';

import type { AppDispatch } from '../../store';
import {
  createPaymentSchedule,
  fetchPaymentSchedulesByProject,
} from '../../store/slices/payment_schedules_slice';
import { fetchProjects } from '../../store/slices/projects_slice';
import type { CreatePaymentScheduleDto } from '../../services/payment_schedules';
import type { PaymentType } from '../../store/types';

// Validation schema using Zod
const createPaymentScheduleSchema = z.object({
  type: z.enum(['Advance', 'MainPayment', 'FinalPayment', 'Other'] as const, {
    required_error: 'Тип платежа обязателен для выбора'
  }),

  name: z.string()
    .min(1, 'Название платежа обязательно для заполнения')
    .min(2, 'Название должно содержать минимум 2 символа')
    .max(255, 'Название не должно превышать 255 символов'),

  amount: z.number({
    required_error: 'Сумма платежа обязательна для заполнения',
    invalid_type_error: 'Сумма должна быть числом'
  })
    .min(1, 'Сумма должна быть больше нуля'),


  expectedDate: z.string()
    .min(1, 'Ожидаемая дата платежа обязательна для заполнения'),

  actualDate: z.string().optional(),

  isPaid: z.boolean().optional(),

  description: z.string()
    .max(1000, 'Описание не должно превышать 1000 символов')
    .optional()
});

type FormData = z.infer<typeof createPaymentScheduleSchema>;

interface AddPaymentScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess?: () => void;
}

// Payment type options with Russian labels
const paymentTypeOptions: { value: PaymentType; label: string }[] = [
  { value: 'Advance', label: 'Аванс' },
  { value: 'MainPayment', label: 'Основной платеж' },
  { value: 'FinalPayment', label: 'Окончательный расчет' },
  { value: 'Other', label: 'Другое' }
];

function AddPaymentScheduleModal({ isOpen, onClose, projectId, onSuccess }: AddPaymentScheduleModalProps): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();

  // Form setup with validation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(createPaymentScheduleSchema),
    defaultValues: {
      type: 'Advance',
      name: '',
      amount: 0,
      expectedDate: '',
      actualDate: '',
      isPaid: false,
      description: ''
    }
  });

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      const createDto: CreatePaymentScheduleDto = {
        projectId,
        type: data.type,
        name: data.name,
        amount: data.amount,
        expectedDate: data.expectedDate,
        ...(data.actualDate && { actualDate: data.actualDate }),
        ...(data.isPaid !== undefined && { isPaid: data.isPaid }),
        ...(data.description?.trim() && { description: data.description.trim() })
      };

      await dispatch(createPaymentSchedule(createDto)).unwrap();

      // Success: refresh data and close modal
      toast.success('Платеж успешно добавлен');
      dispatch(fetchPaymentSchedulesByProject(projectId));
      dispatch(fetchProjects()); // Refresh projects to update cost

      if (onSuccess) {
        onSuccess();
      }

      handleClose();
    } catch (error: any) {
      // Error handling
      const errorMessage = error || 'Ошибка при создании платежа';
      toast.error(errorMessage);
      console.error('Create payment schedule error:', error);
    }
  };

  // Handle modal close with form reset
  const handleClose = () => {
    reset();
    onClose();
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!isOpen) return <></>;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} id="addPaymentScheduleModal">
      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown}>
        <Modal.Header onClose={handleClose}>
          Добавить платеж
        </Modal.Header>

        <Modal.Content>
          <div className="form">
            {/* Payment Type */}
            <FormGroup>
              <label htmlFor="type">Тип платежа *</label>
              <FormSelect
                id="type"
                {...register('type')}
                className={errors.type ? 'error' : ''}
              >
                {paymentTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </FormSelect>
              {errors.type && (
                <span className="error-message">{errors.type.message}</span>
              )}
            </FormGroup>

            {/* Payment Name */}
            <FormGroup>
              <label htmlFor="name">Название платежа *</label>
              <FormInput
                id="name"
                type="text"
                placeholder="Например: Аванс 30%"
                {...register('name')}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && (
                <span className="error-message">{errors.name.message}</span>
              )}
            </FormGroup>

            {/* Amount */}
            <FormGroup>
              <label htmlFor="amount">Сумма (руб.) *</label>
              <FormInput
                id="amount"
                type="number"
                placeholder="1000000"
                min="0"
                step="1000"
                {...register('amount', { valueAsNumber: true })}
                className={errors.amount ? 'error' : ''}
              />
              {errors.amount && (
                <span className="error-message">{errors.amount.message}</span>
              )}
            </FormGroup>

            {/* Expected Date and Actual Date */}
            <div className="form__grid--two-columns">
              <FormGroup>
                <label htmlFor="expectedDate">Ожидаемая дата платежа *</label>
                <FormInput
                  id="expectedDate"
                  type="date"
                  {...register('expectedDate')}
                  className={errors.expectedDate ? 'error' : ''}
                />
                {errors.expectedDate && (
                  <span className="error-message">{errors.expectedDate.message}</span>
                )}
              </FormGroup>

              <FormGroup>
                <label htmlFor="actualDate">Фактическая дата оплаты</label>
                <FormInput
                  id="actualDate"
                  type="date"
                  {...register('actualDate')}
                  className={errors.actualDate ? 'error' : ''}
                />
                {errors.actualDate && (
                  <span className="error-message">{errors.actualDate.message}</span>
                )}
              </FormGroup>
            </div>

            {/* Is Paid Checkbox */}
            <FormGroup>
              <div className="form__checkbox-wrapper">
                <input
                  id="isPaid"
                  type="checkbox"
                  {...register('isPaid')}
                  className="form__checkbox"
                />
                <label htmlFor="isPaid" className="form__checkbox-label">
                  Платеж оплачен
                </label>
              </div>
            </FormGroup>

            {/* Description */}
            <FormGroup>
              <label htmlFor="description">Описание</label>
              <textarea
                id="description"
                placeholder="Дополнительная информация о платеже..."
                {...register('description')}
                className={`form__textarea ${errors.description ? 'error' : ''}`}
                rows={3}
              />
              {errors.description && (
                <span className="error-message">{errors.description.message}</span>
              )}
            </FormGroup>
          </div>
        </Modal.Content>

        <Modal.Footer>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Создание...' : 'Добавить платеж'}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default AddPaymentScheduleModal;
