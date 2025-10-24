import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import Modal from '../common/modal/modal';
import Button from '../common/button/button';
import FormInput from '../forms/form_input/form_input';
import FormSelect from '../forms/form_select/form_select';
import FormGroup from '../forms/form_group/form_group';

import type { AppDispatch } from '../../store';
import {
  updateProject,
  fetchProjects,
  fetchProjectStats,
  fetchCustomers,
  fetchManagers,
  fetchMainProjects,
  selectProjectCustomers,
  selectProjectManagers,
  selectMainProjects,
  selectProjectsLoading
} from '../../store/slices/projects_slice';
import { selectCurrentUser } from '../../store/slices/auth_slice';
import type { Project } from '../../store/types';
import type { UpdateProjectDto } from '../../services/projects';

// Validation schema using Zod
const updateProjectSchema = z.object({
  name: z.string()
    .min(1, 'Название проекта обязательно для заполнения')
    .min(2, 'Название должно содержать минимум 2 символа')
    .max(255, 'Название не должно превышать 255 символов'),

  type: z.enum(['main', 'additional'] as const, {
    required_error: 'Тип проекта обязателен для выбора'
  }),

  mainProjectId: z.string().optional(),

  customerId: z.string().optional(),

  managerId: z.string().optional(),

  contractDate: z.string()
    .min(1, 'Дата договора обязательна для заполнения'),

  expirationDate: z.string()
    .min(1, 'Срок сдачи обязателен для заполнения'),

  cost: z.number({
    required_error: 'Стоимость проекта обязательна для заполнения',
    invalid_type_error: 'Стоимость должна быть числом'
  })
    .min(1, 'Стоимость должна быть больше нуля')
    .max(999999999999, 'Стоимость слишком большая'),

  status: z.enum(['Active', 'Completed'] as const, {
    required_error: 'Статус проекта обязателен для выбора'
  })
}).refine((data) => {
  if (data.contractDate && data.expirationDate) {
    const contractDate = new Date(data.contractDate);
    const expirationDate = new Date(data.expirationDate);
    return expirationDate > contractDate;
  }
  return true;
}, {
  message: 'Срок сдачи должен быть позже даты договора',
  path: ['expirationDate']
}).refine((data) => {
  if (data.type === 'additional' && !data.mainProjectId) {
    return false;
  }
  return true;
}, {
  message: 'Для дополнительного соглашения необходимо выбрать основной проект',
  path: ['mainProjectId']
});

type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

function EditProjectModal({ isOpen, onClose, project }: EditProjectModalProps): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const customers = useSelector(selectProjectCustomers);
  const managers = useSelector(selectProjectManagers);
  const mainProjects = useSelector(selectMainProjects);
  const loading = useSelector(selectProjectsLoading);
  const currentUser = useSelector(selectCurrentUser);

  // Local state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<UpdateProjectFormData>({
    resolver: zodResolver(updateProjectSchema)
  });

  const watchedType = watch('type');

  // Load form data on mount and populate form when project changes
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchCustomers());
      dispatch(fetchManagers());
      dispatch(fetchMainProjects());
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        type: project.type,
        customerId: project.customerId || '',
        managerId: project.managerId || '',
        mainProjectId: project.mainProjectId || '',
        contractDate: project.contractDate.split('T')[0], // Convert to YYYY-MM-DD format
        expirationDate: project.expirationDate.split('T')[0], // Convert to YYYY-MM-DD format
        cost: project.cost,
        status: project.status
      });
    }
  }, [project, reset]);

  // Clear mainProjectId when type changes to 'main'
  useEffect(() => {
    if (watchedType === 'main') {
      setValue('mainProjectId', '');
    }
  }, [watchedType, setValue]);

  // Handle form submission
  const onSubmit = async (data: UpdateProjectFormData) => {
    if (!project) return;

    setIsSubmitting(true);
    try {
      const projectData: UpdateProjectDto = {
        name: data.name,
        type: data.type,
        contractDate: data.contractDate,
        expirationDate: data.expirationDate,
        cost: data.cost,
        status: data.status,
        ...(data.customerId && { customerId: data.customerId }),
        ...(data.managerId && { managerId: data.managerId }),
        ...(data.type === 'additional' && data.mainProjectId && { mainProjectId: data.mainProjectId })
      };

      await dispatch(updateProject({ id: project.id, data: projectData })).unwrap();

      toast.success('Проект успешно обновлен');

      // Refresh data
      // For managers, filter projects by their managerId
      // For admins, show all projects
      const isValidUUID = currentUser?.id && !currentUser.id.startsWith('temp-');
      const filterParams = currentUser?.role === 'Manager' && isValidUUID
        ? { managerId: currentUser.id }
        : undefined;
      dispatch(fetchProjects(filterParams));
      dispatch(fetchProjectStats());

      // Close modal
      handleClose();

    } catch (error: any) {
      toast.error(typeof error === 'string' ? error : error?.message || 'Ошибка при обновлении проекта');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    reset();
    onClose();
  };

  // Check user permissions
  const canEditProjects = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';

  if (!canEditProjects || !project) {
    return <></>;
  }

  // Filter main projects to exclude current project if it's already main type
  const availableMainProjects = mainProjects.filter(p => p.id !== project.id);

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Modal.Header onClose={handleClose}>Редактировать проект</Modal.Header>
      <Modal.Content>
        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <FormGroup>
            <FormGroup.Label htmlFor="edit-name" required>
              Название проекта
            </FormGroup.Label>
            <FormInput
              {...register('name')}
              id="edit-name"
              type="text"
              placeholder="ЖК Солнечный"
              error={errors.name?.message}
            />
          </FormGroup>

          <FormGroup>
            <FormGroup.Label htmlFor="edit-type" required>
              Тип проекта
            </FormGroup.Label>
            <FormSelect
              {...register('type')}
              id="edit-type"
              error={errors.type?.message}
            >
              <option value="main">Основной</option>
              <option value="additional">Дополнительное соглашение</option>
            </FormSelect>
          </FormGroup>

          {watchedType === 'additional' && (
            <FormGroup>
              <FormGroup.Label htmlFor="edit-mainProjectId" required>
                Основной проект
              </FormGroup.Label>
              <FormSelect
                {...register('mainProjectId')}
                id="edit-mainProjectId"
                error={errors.mainProjectId?.message}
              >
                <option value="">Выберите основной проект</option>
                {availableMainProjects.map((mainProject) => (
                  <option key={mainProject.id} value={mainProject.id}>
                    {mainProject.name}
                  </option>
                ))}
              </FormSelect>
            </FormGroup>
          )}

          <FormGroup>
            <FormGroup.Label htmlFor="edit-customerId">
              Заказчик
            </FormGroup.Label>
            <FormSelect
              {...register('customerId')}
              id="edit-customerId"
              error={errors.customerId?.message}
            >
              <option value="">Выберите заказчика (необязательно)</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </FormSelect>
          </FormGroup>

          <FormGroup>
            <FormGroup.Label htmlFor="edit-managerId">
              Менеджер проекта
            </FormGroup.Label>
            <FormSelect
              {...register('managerId')}
              id="edit-managerId"
              error={errors.managerId?.message}
            >
              <option value="">Назначить позже</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.firstName} {manager.lastName}
                </option>
              ))}
            </FormSelect>
          </FormGroup>

          <FormGroup>
            <FormGroup.Label htmlFor="edit-contractDate" required>
              Дата договора
            </FormGroup.Label>
            <FormInput
              {...register('contractDate')}
              id="edit-contractDate"
              type="date"
              error={errors.contractDate?.message}
            />
          </FormGroup>

          <FormGroup>
            <FormGroup.Label htmlFor="edit-expirationDate" required>
              Срок сдачи
            </FormGroup.Label>
            <FormInput
              {...register('expirationDate')}
              id="edit-expirationDate"
              type="date"
              error={errors.expirationDate?.message}
            />
          </FormGroup>

          <FormGroup>
            <FormGroup.Label htmlFor="edit-cost" required>
              Стоимость (руб.)
            </FormGroup.Label>
            <FormInput
              {...register('cost', { valueAsNumber: true })}
              id="edit-cost"
              type="number"
              placeholder="5000000"
              min="0"
              step="1000"
              error={errors.cost?.message}
            />
          </FormGroup>

          <FormGroup>
            <FormGroup.Label htmlFor="edit-status" required>
              Статус проекта
            </FormGroup.Label>
            <FormSelect
              {...register('status')}
              id="edit-status"
              error={errors.status?.message}
            >
              <option value="Active">Активный</option>
              <option value="Completed">Завершенный</option>
            </FormSelect>
          </FormGroup>
        </form>
      </Modal.Content>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
          Отмена
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting || loading}
        >
          {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditProjectModal;