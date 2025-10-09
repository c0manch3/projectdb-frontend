import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Modal from '../common/modal/modal';
import FormGroup from '../forms/form_group/form_group';
import FormInput from '../forms/form_input/form_input';
import FormSelect from '../forms/form_select/form_select';
import Button from '../common/button/button';
import LoadingState from '../common/loading_state/loading_state';

import type { AppDispatch } from '../../store';
import {
  createConstruction,
  selectConstructionsLoading,
  selectConstructionsError
} from '../../store/slices/constructions_slice';
import {
  fetchProjects,
  selectProjectsList,
  selectProjectsLoading
} from '../../store/slices/projects_slice';
import { selectCurrentUser } from '../../store/slices/auth_slice';

// Validation schema
const createConstructionSchema = z.object({
  name: z
    .string()
    .min(1, 'Название сооружения обязательно для заполнения')
    .max(200, 'Название не должно превышать 200 символов')
    .refine((val) => val.trim().length > 0, 'Название не может состоять только из пробелов'),
  projectId: z
    .string()
    .min(1, 'Выберите проект')
});

type CreateConstructionFormData = z.infer<typeof createConstructionSchema>;

interface AddConstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string | undefined; // If provided, pre-select and disable project selection
}

function AddConstructionModal({ isOpen, onClose, projectId }: AddConstructionModalProps): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const loading = useSelector(selectConstructionsLoading);
  const error = useSelector(selectConstructionsError);
  const projects = useSelector(selectProjectsList);
  const projectsLoading = useSelector(selectProjectsLoading);
  const currentUser = useSelector(selectCurrentUser);

  // Local state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<CreateConstructionFormData>({
    resolver: zodResolver(createConstructionSchema),
    defaultValues: {
      name: '',
      projectId: projectId || ''
    }
  });

  // Watch form values
  const selectedProjectId = watch('projectId');

  // Load projects when modal opens
  useEffect(() => {
    if (isOpen && projects.length === 0 && !projectsLoading) {
      // For managers, filter projects by their managerId
      // For admins, show all projects
      const isValidUUID = currentUser?.id && !currentUser.id.startsWith('temp-');
      const filterParams = currentUser?.role === 'Manager' && isValidUUID
        ? { managerId: currentUser.id }
        : undefined;
      dispatch(fetchProjects(filterParams));
    }
  }, [isOpen, projects.length, projectsLoading, dispatch, currentUser?.id, currentUser?.role]);

  // Set project ID if provided
  useEffect(() => {
    if (projectId) {
      setValue('projectId', projectId);
    }
  }, [projectId, setValue]);

  // Handle form submission
  const onSubmit = async (data: CreateConstructionFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      await dispatch(createConstruction({
        name: data.name.trim(),
        projectId: data.projectId
      })).unwrap();

      toast.success('Сооружение успешно создано');
      onClose();
      reset();
    } catch (error: any) {
      console.error('Error creating construction:', error);
      toast.error(typeof error === 'string' ? error : error?.message || 'Ошибка при создании сооружения');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
    reset();
  };

  // Check permissions
  const canCreateConstructions = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';

  if (!canCreateConstructions) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose}>
        <Modal.Header>Доступ запрещен</Modal.Header>
        <Modal.Content>
          <div className="modal-access-denied">
            <p>У вас нет прав для создания сооружений.</p>
            <div className="modal-actions">
              <Button onClick={handleClose}>Закрыть</Button>
            </div>
          </div>
        </Modal.Content>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Modal.Header>Создать новое сооружение</Modal.Header>
      <Modal.Content>
        <form onSubmit={handleSubmit(onSubmit)} className="form">
        {projectsLoading && (
          <LoadingState message="Загрузка списка проектов..." />
        )}

        {!projectsLoading && (
          <>
            <FormGroup>
              <FormGroup.Label htmlFor="constructionName" required>
                Название сооружения
              </FormGroup.Label>
              <FormInput
                {...register('name')}
                id="constructionName"
                type="text"
                placeholder="Введите название сооружения"
                error={errors.name?.message}
              />
            </FormGroup>

            <FormGroup>
              <FormGroup.Label htmlFor="projectSelect" required>
                Проект
              </FormGroup.Label>
              <FormSelect
                {...register('projectId')}
                id="projectSelect"
                error={errors.projectId?.message}
                disabled={!!projectId || projects.length === 0}
              >
                <option value="">Выберите проект</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </FormSelect>
              {projectId && (
                <div className="form-help">
                  Сооружение будет создано в рамках выбранного проекта
                </div>
              )}
            </FormGroup>

            {projects.length === 0 && !projectsLoading && (
              <div className="form-notice">
                <p>Нет доступных проектов для создания сооружений.</p>
              </div>
            )}

            {error && (
              <div className="form-error-message">
                <p>{error}</p>
              </div>
            )}

          </>
        )}
        </form>
      </Modal.Content>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={handleClose}
          disabled={isSubmitting}
        >
          Отмена
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting || projects.length === 0 || !selectedProjectId}
        >
          {isSubmitting ? 'Создание...' : 'Создать сооружение'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AddConstructionModal;