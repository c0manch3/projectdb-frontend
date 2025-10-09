import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import Modal from '../common/modal/modal';
import FormGroup from '../forms/form_group/form_group';
import FormInput from '../forms/form_input/form_input';
import FormSelect from '../forms/form_select/form_select';
import FormTextarea from '../forms/form_textarea/form_textarea';
import Button from '../common/button/button';
import type { AppDispatch, AppRootState } from '../../store';
import {
  createWorkloadActual,
  fetchWorkloadEmployees,
  fetchWorkloadProjects,
  selectWorkloadActualLoading,
  selectWorkloadEmployees,
  selectWorkloadProjects,
  selectWorkloadError,
  clearError
} from '../../store/slices/workload_slice';
import { selectCurrentUser } from '../../store/slices/auth_slice';
import type { CreateWorkloadActualDto } from '../../services/workload';

interface AddWorkloadActualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultUserId?: string;
  defaultProjectId?: string;
  defaultDate?: string;
}

interface FormData {
  userId: string;
  projectId: string;
  date: string;
  hoursWorked: string;
  userText: string;
}

interface FormErrors {
  userId?: string;
  projectId?: string;
  date?: string;
  hoursWorked?: string;
  userText?: string;
}

function AddWorkloadActualModal({
  isOpen,
  onClose,
  onSuccess,
  defaultUserId = '',
  defaultProjectId = '',
  defaultDate = ''
}: AddWorkloadActualModalProps): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const loading = useSelector(selectWorkloadActualLoading);
  const employees = useSelector(selectWorkloadEmployees);
  const projects = useSelector(selectWorkloadProjects);
  const error = useSelector(selectWorkloadError);
  const currentUser = useSelector(selectCurrentUser);

  // Local state
  const [formData, setFormData] = useState<FormData>({
    userId: defaultUserId || (currentUser?.id || ''),
    projectId: defaultProjectId,
    date: defaultDate || new Date().toISOString().split('T')[0],
    hoursWorked: '8',
    userText: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load employees and projects when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchWorkloadEmployees());

      // For managers, filter projects by their managerId
      const isValidUUID = currentUser?.id && !currentUser.id.startsWith('temp-');
      const managerId = currentUser?.role === 'Manager' && isValidUUID
        ? currentUser.id
        : undefined;
      dispatch(fetchWorkloadProjects(managerId));

      dispatch(clearError());
    }
  }, [isOpen, dispatch, currentUser?.role, currentUser?.id]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        userId: defaultUserId || (currentUser?.id || ''),
        projectId: defaultProjectId,
        date: defaultDate || new Date().toISOString().split('T')[0],
        hoursWorked: '8',
        userText: ''
      });
      setFormErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, defaultUserId, defaultProjectId, defaultDate, currentUser]);

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

    if (!formData.userId.trim()) {
      errors.userId = 'Выберите сотрудника';
    }

    if (!formData.projectId.trim()) {
      errors.projectId = 'Выберите проект';
    }

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

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const actualData: CreateWorkloadActualDto = {
        userId: formData.userId,
        projectId: formData.projectId,
        date: formData.date,
        hoursWorked: parseFloat(formData.hoursWorked),
        userText: formData.userText.trim()
      };

      await dispatch(createWorkloadActual(actualData)).unwrap();

      toast.success('Запись о выполненной работе создана успешно');
      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при создании записи');
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Добавить отработанное время"
      size="medium"
    >
      <form onSubmit={handleSubmit} className="form">
        {/* Employee Selection */}
        <FormGroup>
          <FormGroup.Label htmlFor="actualEmployee" required>
            Сотрудник
          </FormGroup.Label>
          <FormSelect
            id="actualEmployee"
            value={formData.userId}
            onChange={(e) => handleInputChange('userId', e.target.value)}
            disabled={loading || isSubmitting || (currentUser?.role === 'Employee')}
            required
          >
            <option value="">Выберите сотрудника</option>
            {employees.map(employee => (
              <option key={employee.id} value={employee.id}>
                {employee.firstName} {employee.lastName} ({employee.role})
              </option>
            ))}
          </FormSelect>
          {formErrors.userId && (
            <FormGroup.Error>{formErrors.userId}</FormGroup.Error>
          )}
          {currentUser?.role === 'Employee' && (
            <FormGroup.Help>
              Вы можете создавать записи только для себя
            </FormGroup.Help>
          )}
        </FormGroup>

        {/* Project Selection */}
        <FormGroup>
          <FormGroup.Label htmlFor="actualProject" required>
            Проект
          </FormGroup.Label>
          <FormSelect
            id="actualProject"
            value={formData.projectId}
            onChange={(e) => handleInputChange('projectId', e.target.value)}
            disabled={loading || isSubmitting}
            required
          >
            <option value="">Выберите проект</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </FormSelect>
          {formErrors.projectId && (
            <FormGroup.Error>{formErrors.projectId}</FormGroup.Error>
          )}
        </FormGroup>

        {/* Date Selection */}
        <FormGroup>
          <FormGroup.Label htmlFor="actualDate" required>
            Дата
          </FormGroup.Label>
          <FormInput
            type="date"
            id="actualDate"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            disabled={isSubmitting}
            required
          />
          {formErrors.date && (
            <FormGroup.Error>{formErrors.date}</FormGroup.Error>
          )}
          <FormGroup.Help>
            Дата, за которую вы отчитываетесь о выполненной работе
          </FormGroup.Help>
        </FormGroup>

        {/* Hours Worked */}
        <FormGroup>
          <FormGroup.Label htmlFor="actualHours" required>
            Часы работы
          </FormGroup.Label>
          <div className="form__input-group">
            <FormInput
              type="number"
              id="actualHours"
              value={formData.hoursWorked}
              onChange={(e) => handleInputChange('hoursWorked', e.target.value)}
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
          <FormGroup.Label htmlFor="actualDescription" required>
            Описание выполненных работ
          </FormGroup.Label>
          <FormTextarea
            id="actualDescription"
            value={formData.userText}
            onChange={(e) => handleInputChange('userText', e.target.value)}
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
            disabled={loading}
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить время'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default AddWorkloadActualModal;