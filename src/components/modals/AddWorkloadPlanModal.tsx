import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Modal from '../common/modal/modal';
import FormGroup from '../forms/form_group/form_group';
import FormInput from '../forms/form_input/form_input';
import FormSelect from '../forms/form_select/form_select';
import Button from '../common/button/button';
import type { AppDispatch, AppRootState } from '../../store';
import {
  createWorkloadPlan,
  fetchWorkloadEmployees,
  fetchWorkloadProjects,
  selectWorkloadPlanLoading,
  selectWorkloadEmployees,
  selectWorkloadProjects,
  selectWorkloadError,
  clearError
} from '../../store/slices/workload_slice';
import { selectCurrentUser } from '../../store/slices/auth_slice';
import type { CreateWorkloadPlanDto } from '../../services/workload';

interface AddWorkloadPlanModalProps {
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
}

interface FormErrors {
  userId?: string;
  projectId?: string;
  date?: string;
}

function AddWorkloadPlanModal({
  isOpen,
  onClose,
  onSuccess,
  defaultUserId = '',
  defaultProjectId = '',
  defaultDate = ''
}: AddWorkloadPlanModalProps): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const loading = useSelector(selectWorkloadPlanLoading);
  const employees = useSelector(selectWorkloadEmployees);
  const projects = useSelector(selectWorkloadProjects);
  const error = useSelector(selectWorkloadError);
  const currentUser = useSelector(selectCurrentUser);

  // Local state
  const [formData, setFormData] = useState<FormData>({
    userId: defaultUserId,
    projectId: defaultProjectId,
    date: defaultDate || new Date().toISOString().split('T')[0]
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load employees and projects when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchWorkloadEmployees());
      dispatch(fetchWorkloadProjects());
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        userId: defaultUserId,
        projectId: defaultProjectId,
        date: defaultDate || new Date().toISOString().split('T')[0]
      });
      setFormErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, defaultUserId, defaultProjectId, defaultDate]);

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
    } else {
      // Validate date is not in the past
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.date = 'Нельзя создавать планы на прошедшие даты';
      }
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
      if (!currentUser) {
        throw new Error('Пользователь не авторизован');
      }

      const planData: CreateWorkloadPlanDto = {
        userId: formData.userId,
        projectId: formData.projectId,
        date: formData.date
      };

      console.log('Creating workload plan with data:', planData);
      await dispatch(createWorkloadPlan(planData)).unwrap();

      toast.success('План рабочей нагрузки создан успешно');
      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при создании плана');
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Добавить план"
      size="medium"
    >
      <form onSubmit={handleSubmit} className="form">
        {/* Employee Selection */}
        <FormGroup>
          <FormGroup.Label htmlFor="planEmployee" required>
            Сотрудник
          </FormGroup.Label>
          <FormSelect
            id="planEmployee"
            value={formData.userId}
            onChange={(e) => handleInputChange('userId', e.target.value)}
            disabled={loading || isSubmitting}
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
        </FormGroup>

        {/* Project Selection */}
        <FormGroup>
          <FormGroup.Label htmlFor="planProject" required>
            Проект
          </FormGroup.Label>
          <FormSelect
            id="planProject"
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
          <FormGroup.Label htmlFor="planDate" required>
            Дата
          </FormGroup.Label>
          <FormInput
            type="date"
            id="planDate"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            disabled={isSubmitting}
            required
          />
          {formErrors.date && (
            <FormGroup.Error>{formErrors.date}</FormGroup.Error>
          )}
          <FormGroup.Help>
            Дата, на которую планируется работа сотрудника
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
            disabled={loading || isSubmitting}
          >
            {isSubmitting ? 'Создание...' : 'Создать план'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default AddWorkloadPlanModal;