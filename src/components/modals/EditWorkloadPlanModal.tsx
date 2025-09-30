import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import Modal from '../common/modal/modal';
import FormGroup from '../forms/form_group/form_group';
import FormInput from '../forms/form_input/form_input';
import Button from '../common/button/button';
import type { AppDispatch } from '../../store';
import {
  updateWorkloadPlan,
  selectWorkloadPlanLoading,
  selectWorkloadError,
  clearError
} from '../../store/slices/workload_slice';
import type { WorkloadPlan } from '../../store/types';
import type { UpdateWorkloadPlanDto } from '../../services/workload';

interface EditWorkloadPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  plan: WorkloadPlan | null;
}

interface FormData {
  date: string;
}

interface FormErrors {
  date?: string;
}

function EditWorkloadPlanModal({
  isOpen,
  onClose,
  onSuccess,
  plan
}: EditWorkloadPlanModalProps): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const loading = useSelector(selectWorkloadPlanLoading);
  const error = useSelector(selectWorkloadError);

  // Local state
  const [formData, setFormData] = useState<FormData>({
    date: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens or plan changes
  useEffect(() => {
    if (isOpen && plan) {
      setFormData({
        date: plan.date.split('T')[0] // Convert ISO date to YYYY-MM-DD
      });
      setFormErrors({});
      setIsSubmitting(false);
      dispatch(clearError());
    }
  }, [isOpen, plan, dispatch]);

  // Handle form input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.date) {
      errors.date = 'Выберите дату';
    } else {
      // Validate date is not in the past
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.date = 'Нельзя переносить планы на прошедшие даты';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!plan) return;

    if (!validateForm()) {
      return;
    }

    // Check if anything changed
    const originalDate = plan.date.split('T')[0];
    if (formData.date === originalDate) {
      toast.success('Никаких изменений не внесено');
      onClose();
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData: UpdateWorkloadPlanDto = {
        date: formData.date
      };

      await dispatch(updateWorkloadPlan({
        id: plan.id,
        data: updateData
      })).unwrap();

      toast.success('План рабочей нагрузки обновлен успешно');
      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при обновлении плана');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!isSubmitting) {
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
      title="Редактировать план"
      size="medium"
    >
      <form onSubmit={handleSubmit} className="form">
        {/* Plan Information Display */}
        <div className="form__info">
          <h4 className="form__info-title">Информация о плане</h4>
          <div className="form__info-grid">
            <div className="form__info-item">
              <span className="form__info-label">Сотрудник:</span>
              <span className="form__info-value">
                {/* Note: Employee name would need to be looked up from employees list */}
                ID: {plan.userId}
              </span>
            </div>
            <div className="form__info-item">
              <span className="form__info-label">Проект:</span>
              <span className="form__info-value">
                {/* Note: Project name would need to be looked up from projects list */}
                ID: {plan.projectId}
              </span>
            </div>
            <div className="form__info-item">
              <span className="form__info-label">Создан:</span>
              <span className="form__info-value">
                {new Date(plan.createdAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>
        </div>

        {/* Date Selection */}
        <FormGroup>
          <FormGroup.Label htmlFor="editPlanDate" required>
            Дата
          </FormGroup.Label>
          <FormInput
            type="date"
            id="editPlanDate"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            disabled={isSubmitting}
            required
          />
          {formErrors.date && (
            <FormGroup.Error>{formErrors.date}</FormGroup.Error>
          )}
          <FormGroup.Help>
            Измените дату, на которую планируется работа
          </FormGroup.Help>
        </FormGroup>

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
            disabled={isSubmitting}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={loading}
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default EditWorkloadPlanModal;