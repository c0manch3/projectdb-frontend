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
  createProject,
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
import type { CreateProjectDto } from '../../services/projects';

// Validation schema using Zod
const createProjectSchema = z.object({
  name: z.string()
    .min(1, 'Название проекта обязательно для заполнения')
    .min(2, 'Название должно содержать минимум 2 символа')
    .max(255, 'Название не должно превышать 255 символов'),

  type: z.enum(['main', 'additional'] as const, {
    required_error: 'Тип проекта обязателен для выбора'
  }),

  mainProjectId: z.string().optional(),

  customerId: z.string()
    .min(1, 'Заказчик обязателен для выбора'),

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
    .max(999999999999, 'Стоимость слишком большая')
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

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function AddProjectModal({ isOpen, onClose }: AddProjectModalProps): JSX.Element {
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
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      type: 'main',
      cost: 0
    }
  });

  const watchedType = watch('type');

  // Load form data on mount
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchCustomers());
      dispatch(fetchManagers());
      dispatch(fetchMainProjects());
    }
  }, [isOpen, dispatch]);

  // Clear mainProjectId when type changes to 'main'
  useEffect(() => {
    if (watchedType === 'main') {
      setValue('mainProjectId', '');
    }
  }, [watchedType, setValue]);

  // Handle form submission
  const onSubmit = async (data: CreateProjectFormData) => {
    setIsSubmitting(true);
    try {
      const projectData: CreateProjectDto = {
        name: data.name,
        type: data.type,
        customerId: data.customerId,
        contractDate: data.contractDate,
        expirationDate: data.expirationDate,
        cost: data.cost,
        ...(data.managerId && { managerId: data.managerId }),
        ...(data.type === 'additional' && data.mainProjectId && { mainProjectId: data.mainProjectId })
      };

      await dispatch(createProject(projectData)).unwrap();

      toast.success('Проект успешно создан');

      // Refresh data
      // For managers, filter projects by their managerId
      // For admins, show all projects
      const isValidUUID = currentUser?.id && !currentUser.id.startsWith('temp-');
      const filterParams = currentUser?.role === 'Manager' && isValidUUID
        ? { managerId: currentUser.id }
        : undefined;
      dispatch(fetchProjects(filterParams));
      dispatch(fetchProjectStats());

      // Close modal and reset form
      handleClose();

    } catch (error: any) {
      toast.error(typeof error === 'string' ? error : error?.message || 'Ошибка при создании проекта');
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
  const canCreateProjects = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';

  if (!canCreateProjects) {
    return <></>;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Modal.Header>Новый проект</Modal.Header>
      <Modal.Content>
        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <FormGroup>
            <FormGroup.Label htmlFor="name" required>
              Название проекта
            </FormGroup.Label>
            <FormInput
              {...register('name')}
              id="name"
              type="text"
              placeholder="ЖК Солнечный"
              error={errors.name?.message}
            />
          </FormGroup>

          <FormGroup>
            <FormGroup.Label htmlFor="type" required>
              Тип проекта
            </FormGroup.Label>
            <FormSelect
              {...register('type')}
              id="type"
              error={errors.type?.message}
            >
              <option value="main">Основной</option>
              <option value="additional">Дополнительное соглашение</option>
            </FormSelect>
          </FormGroup>

          {watchedType === 'additional' && (
            <FormGroup>
              <FormGroup.Label htmlFor="mainProjectId" required>
                Основной проект
              </FormGroup.Label>
              <FormSelect
                {...register('mainProjectId')}
                id="mainProjectId"
                error={errors.mainProjectId?.message}
              >
                <option value="">Выберите основной проект</option>
                {mainProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </FormSelect>
            </FormGroup>
          )}

          <FormGroup>
            <FormGroup.Label htmlFor="customerId" required>
              Заказчик
            </FormGroup.Label>
            <FormSelect
              {...register('customerId')}
              id="customerId"
              error={errors.customerId?.message}
            >
              <option value="">Выберите заказчика</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </FormSelect>
          </FormGroup>


          <FormGroup>
            <FormGroup.Label htmlFor="contractDate" required>
              Дата договора
            </FormGroup.Label>
            <FormInput
              {...register('contractDate')}
              id="contractDate"
              type="date"
              error={errors.contractDate?.message}
            />
          </FormGroup>

          <FormGroup>
            <FormGroup.Label htmlFor="expirationDate" required>
              Срок сдачи
            </FormGroup.Label>
            <FormInput
              {...register('expirationDate')}
              id="expirationDate"
              type="date"
              error={errors.expirationDate?.message}
            />
          </FormGroup>

          <FormGroup>
            <FormGroup.Label htmlFor="cost" required>
              Стоимость (руб.)
            </FormGroup.Label>
            <FormInput
              {...register('cost', { valueAsNumber: true })}
              id="cost"
              type="number"
              placeholder="5000000"
              min="0"
              step="1000"
              error={errors.cost?.message}
            />
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
          {isSubmitting ? 'Создание...' : 'Создать проект'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AddProjectModal;