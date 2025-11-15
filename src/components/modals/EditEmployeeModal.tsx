import React, { useEffect } from 'react';
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
  updateEmployee,
  fetchEmployees,
  fetchEmployeeStats
} from '../../store/slices/users_slice';
import type { UpdateEmployeeDto } from '../../services/employees';
import type { UserRole, User } from '../../store/types';

// Validation schema using Zod
const editEmployeeSchema = z.object({
  firstName: z.string()
    .min(1, 'Имя обязательно для заполнения')
    .min(2, 'Имя должно содержать минимум 2 символа'),

  lastName: z.string()
    .min(1, 'Фамилия обязательна для заполнения')
    .min(2, 'Фамилия должна содержать минимум 2 символа'),

  email: z.string()
    .min(1, 'Email обязателен для заполнения')
    .email('Неверный формат email адреса'),

  phone: z.string()
    .min(1, 'Телефон обязателен для заполнения')
    .min(10, 'Телефон должен содержать минимум 10 символов')
    .regex(/^[\+\d\s\-\(\)]+$/, 'Неверный формат номера телефона'),

  telegramId: z.string().optional(),

  role: z.enum(['Admin', 'Manager', 'Employee'] as const, {
    required_error: 'Роль обязательна для выбора'
  }),

  dateBirth: z.string()
    .min(1, 'Дата рождения обязательна для заполнения')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      return birthDate < today;
    }, 'Дата рождения не может быть в будущем')
    .refine((date) => {
      const birthDate = new Date(date);
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 100);
      return birthDate > minDate;
    }, 'Дата рождения не может быть более 100 лет назад'),

  salary: z.union([
    z.string().transform((val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      const num = parseFloat(val);
      if (isNaN(num)) return undefined;
      return num;
    }),
    z.number(),
    z.undefined()
  ]).optional()
    .refine((val) => val === undefined || val === null || val >= 0,
      'Зарплата не может быть отрицательной'),
});

type FormData = z.infer<typeof editEmployeeSchema>;

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: User | null;
}

function EditEmployeeModal({ isOpen, onClose, employee }: EditEmployeeModalProps): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  
  
  // Form setup with validation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(editEmployeeSchema),
  });

  // Reset form when employee changes or modal opens
  useEffect(() => {
    if (isOpen && employee) {
      reset({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        telegramId: employee.telegramId || '',
        role: employee.role,
        dateBirth: employee.dateBirth ? employee.dateBirth.split('T')[0] : '', // Convert to YYYY-MM-DD format
        salary: employee.salary
      });
    }
  }, [isOpen, employee, reset]);


  // Handle form submission
  const onSubmit = async (data: FormData) => {
    if (!employee) {
      toast.error('Ошибка: нет данных о сотруднике для редактирования');
      return;
    }

    try {
      // Prepare update data
      const updateEmployeeDto: UpdateEmployeeDto = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role: data.role,
        dateBirth: data.dateBirth
      };

      // Add telegramId only if provided
      if (data.telegramId && data.telegramId.trim() !== '') {
        updateEmployeeDto.telegramId = data.telegramId.trim();
      }

      // Add salary only if provided and is a valid number
      if (data.salary !== undefined && data.salary !== null && !isNaN(Number(data.salary))) {
        updateEmployeeDto.salary = Number(data.salary);
      }

      await dispatch(updateEmployee({ id: employee.id, data: updateEmployeeDto })).unwrap();
      
      // Success: refresh data and close modal
      toast.success('Сотрудник успешно обновлен');
      dispatch(fetchEmployees());
      dispatch(fetchEmployeeStats());
      handleClose();
    } catch (error: any) {
      // Error handling
      const errorMessage = error || 'Ошибка при обновлении сотрудника';
      toast.error(errorMessage);
      console.error('Update employee error:', error);
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

  // Role display names for select options
  const roleOptions: { value: UserRole; label: string }[] = [
    { value: 'Employee', label: 'Сотрудник' },
    { value: 'Manager', label: 'Менеджер' },
    { value: 'Admin', label: 'Администратор' }
  ];

  if (!isOpen || !employee) return <></>;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} id="editEmployeeModal">
      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown}>
        <Modal.Header onClose={handleClose}>
          Редактировать сотрудника
        </Modal.Header>

        <Modal.Content>
          <div className="form">
            {/* Name Fields Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormGroup>
                <label htmlFor="firstName">Имя *</label>
                <FormInput
                  id="firstName"
                  type="text"
                  placeholder="Введите имя"
                  {...register('firstName')}
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && (
                  <span className="error-message">{errors.firstName.message}</span>
                )}
              </FormGroup>

              <FormGroup>
                <label htmlFor="lastName">Фамилия *</label>
                <FormInput
                  id="lastName"
                  type="text"
                  placeholder="Введите фамилию"
                  {...register('lastName')}
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && (
                  <span className="error-message">{errors.lastName.message}</span>
                )}
              </FormGroup>
            </div>

            {/* Contact Information */}
            <FormGroup>
              <label htmlFor="email">Email *</label>
              <FormInput
                id="email"
                type="email"
                placeholder="example@company.com"
                {...register('email')}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && (
                <span className="error-message">{errors.email.message}</span>
              )}
            </FormGroup>

            <FormGroup>
              <label htmlFor="phone">Телефон *</label>
              <FormInput
                id="phone"
                type="tel"
                placeholder="+7 (999) 123-45-67"
                {...register('phone')}
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && (
                <span className="error-message">{errors.phone.message}</span>
              )}
            </FormGroup>

            <FormGroup>
              <label htmlFor="telegramId">Telegram ID</label>
              <FormInput
                id="telegramId"
                type="text"
                placeholder="Например: 1234567890"
                {...register('telegramId')}
                className={errors.telegramId ? 'error' : ''}
              />
              {errors.telegramId && (
                <span className="error-message">{errors.telegramId.message}</span>
              )}
            </FormGroup>

            {/* Role */}
            <FormGroup>
              <label htmlFor="role">Роль *</label>
              <FormSelect
                id="role"
                {...register('role')}
                className={errors.role ? 'error' : ''}
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </FormSelect>
              {errors.role && (
                <span className="error-message">{errors.role.message}</span>
              )}
            </FormGroup>

            {/* Date of Birth */}
            <FormGroup>
              <label htmlFor="dateBirth">Дата рождения *</label>
              <FormInput
                id="dateBirth"
                type="date"
                {...register('dateBirth')}
                className={errors.dateBirth ? 'error' : ''}
                max={new Date().toISOString().split('T')[0]} // Prevent future dates
              />
              {errors.dateBirth && (
                <span className="error-message">{errors.dateBirth.message}</span>
              )}
            </FormGroup>

            {/* Salary (optional, Admin only) */}
            <FormGroup>
              <label htmlFor="salary">Зарплата (₽)</label>
              <FormInput
                id="salary"
                type="number"
                step="0.01"
                min="0"
                placeholder="Например: 50000"
                {...register('salary')}
                className={errors.salary ? 'error' : ''}
              />
              {errors.salary && (
                <span className="error-message">{errors.salary.message}</span>
              )}
              <span style={{ fontSize: '0.875rem', color: '#666' }}>
                Опциональное поле. Видно только администратору.
              </span>
            </FormGroup>
          </div>
        </Modal.Content>

        <Modal.Footer>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
            style={{ marginRight: '1rem' }}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default EditEmployeeModal;