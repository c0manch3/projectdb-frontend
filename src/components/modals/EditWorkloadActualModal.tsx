import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import Modal from '../common/modal/modal';
import FormGroup from '../forms/form_group/form_group';
import FormInput from '../forms/form_input/form_input';
import FormTextarea from '../forms/form_textarea/form_textarea';
import Button from '../common/button/button';
import type { AppDispatch } from '../../store';
import {
  updateWorkloadActual,
  selectWorkloadActualLoading,
  selectWorkloadError,
  clearError
} from '../../store/slices/workload_slice';
import type { WorkloadActual } from '../../store/types';
import type { UpdateWorkloadActualDto } from '../../services/workload';

interface EditWorkloadActualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  actual: WorkloadActual | null;
}

interface FormData {
  date: string;
  hoursWorked: string;
  userText: string;
}

interface FormErrors {
  date?: string;
  hoursWorked?: string;
  userText?: string;
}

function EditWorkloadActualModal({
  isOpen,
  onClose,
  onSuccess,
  actual
}: EditWorkloadActualModalProps): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const loading = useSelector(selectWorkloadActualLoading);
  const error = useSelector(selectWorkloadError);

  // Local state
  const [formData, setFormData] = useState<FormData>({
    date: '',
    hoursWorked: '',
    userText: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens or actual changes
  useEffect(() => {
    if (isOpen && actual) {
      setFormData({
        date: actual.date.split('T')[0], // Convert ISO date to YYYY-MM-DD
        hoursWorked: actual.hoursWorked.toString(),
        userText: actual.userText
      });
      setFormErrors({});
      setIsSubmitting(false);
      dispatch(clearError());
    }
  }, [isOpen, actual, dispatch]);

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
    }

    if (!formData.hoursWorked.trim()) {
      errors.hoursWorked = 'Укажите количество часов';
    } else {
      const hours = parseFloat(formData.hoursWorked);
      if (isNaN(hours) || hours <= 0 || hours > 24) {
        errors.hoursWorked = 'Количество часов должно быть от 0.1 до 24';
      }
    }

    if (!formData.userText.trim()) {
      errors.userText = 'Опишите выполненную работу';
    } else if (formData.userText.length < 10) {
      errors.userText = 'Описание должно содержать минимум 10 символов';
    } else if (formData.userText.length > 1000) {
      errors.userText = 'Описание не должно превышать 1000 символов';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!actual) return;

    if (!validateForm()) {
      return;
    }

    // Check if anything changed
    const originalDate = actual.date.split('T')[0];
    const originalHours = actual.hoursWorked.toString();
    const originalText = actual.userText;

    const hasChanges = (
      formData.date !== originalDate ||
      formData.hoursWorked !== originalHours ||
      formData.userText !== originalText
    );

    if (!hasChanges) {
      toast.success('Никаких изменений не внесено');
      onClose();
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData: UpdateWorkloadActualDto = {};

      // Only include changed fields
      if (formData.date !== originalDate) {
        updateData.date = formData.date;
      }
      if (formData.hoursWorked !== originalHours) {
        updateData.hoursWorked = parseFloat(formData.hoursWorked);
      }
      if (formData.userText !== originalText) {
        updateData.userText = formData.userText.trim();
      }

      await dispatch(updateWorkloadActual({
        id: actual.id,
        data: updateData
      })).unwrap();

      toast.success('Запись о выполненной работе обновлена успешно');
      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при обновлении записи');
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

  // Quick hour buttons
  const quickHours = [4, 6, 8, 10, 12];

  if (!actual) {
    return <></>;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Редактировать время"
      size="medium"
    >
      <form onSubmit={handleSubmit} className="form">
        {/* Record Information Display */}
        <div className="form__info">
          <h4 className="form__info-title">Информация о записи</h4>
          <div className="form__info-grid">
            <div className="form__info-item">
              <span className="form__info-label">Сотрудник:</span>
              <span className="form__info-value">
                {/* Note: Employee name would need to be looked up from employees list */}
                ID: {actual.userId}
              </span>
            </div>
            <div className="form__info-item">
              <span className="form__info-label">Проект:</span>
              <span className="form__info-value">
                {/* Note: Project name would need to be looked up from projects list */}
                ID: {actual.projectId}
              </span>
            </div>
            <div className="form__info-item">
              <span className="form__info-label">Создана:</span>
              <span className="form__info-value">
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

        {/* Date Selection */}
        <FormGroup>
          <FormGroup.Label htmlFor="editActualDate" required>
            Дата
          </FormGroup.Label>
          <FormInput
            type="date"
            id="editActualDate"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            error={!!formErrors.date}
            disabled={isSubmitting}
            required
          />
          {formErrors.date && (
            <FormGroup.Error>{formErrors.date}</FormGroup.Error>
          )}
          <FormGroup.Help>
            Измените дату, за которую отчитываетесь о работе
          </FormGroup.Help>
        </FormGroup>

        {/* Hours Worked */}
        <FormGroup>
          <FormGroup.Label htmlFor="editActualHours" required>
            Часы работы
          </FormGroup.Label>
          <div className="form__input-group">
            <FormInput
              type="number"
              id="editActualHours"
              value={formData.hoursWorked}
              onChange={(e) => handleInputChange('hoursWorked', e.target.value)}
              error={!!formErrors.hoursWorked}
              disabled={isSubmitting}
              min="0.1"
              max="24"
              step="0.1"
              placeholder="8.0"
              required
            />
            <div className="form__quick-buttons">
              {quickHours.map(hours => (
                <button
                  key={hours}
                  type="button"
                  className="form__quick-button"
                  onClick={() => handleInputChange('hoursWorked', hours.toString())}
                  disabled={isSubmitting}
                >
                  {hours}ч
                </button>
              ))}
            </div>
          </div>
          {formErrors.hoursWorked && (
            <FormGroup.Error>{formErrors.hoursWorked}</FormGroup.Error>
          )}
          <FormGroup.Help>
            Количество часов от 0.1 до 24. Используйте кнопки для быстрого выбора
          </FormGroup.Help>
        </FormGroup>

        {/* Work Description */}
        <FormGroup>
          <FormGroup.Label htmlFor="editActualDescription" required>
            Описание выполненных работ
          </FormGroup.Label>
          <FormTextarea
            id="editActualDescription"
            value={formData.userText}
            onChange={(e) => handleInputChange('userText', e.target.value)}
            error={!!formErrors.userText}
            disabled={isSubmitting}
            placeholder="Детальное описание выполненной работы..."
            rows={4}
            maxLength={1000}
            required
          />
          <div className="form__char-count">
            {formData.userText.length}/1000 символов
          </div>
          {formErrors.userText && (
            <FormGroup.Error>{formErrors.userText}</FormGroup.Error>
          )}
          <FormGroup.Help>
            Подробно опишите что было сделано (минимум 10 символов)
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

export default EditWorkloadActualModal;