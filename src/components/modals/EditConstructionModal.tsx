import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Modal from '../common/modal/modal';
import FormGroup from '../forms/form_group/form_group';
import FormInput from '../forms/form_input/form_input';
import Button from '../common/button/button';

import type { AppDispatch } from '../../store';
import {
  updateConstruction,
  selectConstructionsLoading,
  selectConstructionsError
} from '../../store/slices/constructions_slice';
import { selectCurrentUser } from '../../store/slices/auth_slice';
import type { Construction } from '../../store/types';

// Validation schema
const updateConstructionSchema = z.object({
  name: z
    .string()
    .min(1, 'Название сооружения обязательно для заполнения')
    .max(200, 'Название не должно превышать 200 символов')
    .refine((val) => val.trim().length > 0, 'Название не может состоять только из пробелов')
});

type UpdateConstructionFormData = z.infer<typeof updateConstructionSchema>;

interface EditConstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  construction: Construction | null;
}

function EditConstructionModal({ isOpen, onClose, construction }: EditConstructionModalProps): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const loading = useSelector(selectConstructionsLoading);
  const error = useSelector(selectConstructionsError);
  const currentUser = useSelector(selectCurrentUser);

  // Local state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<UpdateConstructionFormData>({
    resolver: zodResolver(updateConstructionSchema),
    defaultValues: {
      name: ''
    }
  });

  // Set form values when construction changes
  useEffect(() => {
    if (construction) {
      setValue('name', construction.name);
    }
  }, [construction, setValue]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  // Handle form submission
  const onSubmit = async (data: UpdateConstructionFormData) => {
    if (!construction || isSubmitting) return;

    // Check if there are any changes
    if (data.name.trim() === construction.name.trim()) {
      toast.info('Изменений не обнаружено');
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(updateConstruction({
        id: construction.id,
        data: {
          name: data.name.trim()
        }
      })).unwrap();

      toast.success('Сооружение успешно обновлено');
      onClose();
    } catch (error: any) {
      console.error('Error updating construction:', error);
      toast.error(error || 'Ошибка при обновлении сооружения');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  // Check permissions
  const canEditConstructions = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';

  if (!canEditConstructions) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose}>
        <Modal.Header>Доступ запрещен</Modal.Header>
        <Modal.Content>
          <div className="modal-access-denied">
            <p>У вас нет прав для редактирования сооружений.</p>
            <div className="modal-actions">
              <Button onClick={handleClose}>Закрыть</Button>
            </div>
          </div>
        </Modal.Content>
      </Modal>
    );
  }

  if (!construction) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose}>
        <Modal.Header>Ошибка</Modal.Header>
        <Modal.Content>
          <div className="modal-error">
            <p>Сооружение не найдено.</p>
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
      <Modal.Header>Редактировать сооружение</Modal.Header>
      <Modal.Content>
        <form onSubmit={handleSubmit(onSubmit)} className="form">
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

          {error && (
            <div className="form-error-message">
              <p>{error}</p>
            </div>
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
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditConstructionModal;