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
  createEmployee,
  fetchEmployees,
  fetchEmployeeStats
} from '../../store/slices/users_slice';
import type { CreateEmployeeDto } from '../../services/employees';
import type { UserRole } from '../../store/types';

// Validation schema using Zod
const createEmployeeSchema = z.object({
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

  password: z.string()
    .min(1, 'Пароль обязателен для заполнения')
    .min(6, 'Пароль должен содержать минимум 6 символов'),
  
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
});

type FormData = z.infer<typeof createEmployeeSchema>;

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function AddEmployeeModal({ isOpen, onClose }: AddEmployeeModalProps): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  
  
  // Form setup with validation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      telegramId: '',
      password: '',
      role: 'Employee',
      dateBirth: ''
    }
  });


  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      // Prepare create data
      const createEmployeeDto: CreateEmployeeDto = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
        dateBirth: data.dateBirth
      };

      // Add telegramId only if provided
      if (data.telegramId && data.telegramId.trim() !== '') {
        createEmployeeDto.telegramId = data.telegramId.trim();
      }

      await dispatch(createEmployee(createEmployeeDto)).unwrap();
      
      // Success: refresh data and close modal
      toast.success('Сотрудник успешно создан');
      dispatch(fetchEmployees());
      dispatch(fetchEmployeeStats());
      handleClose();
    } catch (error: any) {
      // Error handling
      const errorMessage = error || 'Ошибка при создании сотрудника';
      toast.error(errorMessage);
      console.error('Create employee error:', error);
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

  if (!isOpen) return <></>;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} id="addEmployeeModal">
      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown}>
        <Modal.Header onClose={handleClose}>
          Добавить сотрудника
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

            {/* Password */}
            <FormGroup>
              <label htmlFor="password">Пароль *</label>
              <FormInput
                id="password"
                type="password"
                placeholder="Минимум 6 символов"
                {...register('password')}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && (
                <span className="error-message">{errors.password.message}</span>
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
            {isSubmitting ? 'Создание...' : 'Создать сотрудника'}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default AddEmployeeModal;