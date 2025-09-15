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
  createCompany,
  fetchCompaniesData,
  fetchCompanyStats
} from '../../store/slices/users_slice';
import type { CreateCompanyDto } from '../../services/companies';
import type { CompanyType } from '../../store/types';

// Validation schema using Zod
const createCompanySchema = z.object({
  name: z.string()
    .min(1, 'Название компании обязательно для заполнения')
    .min(2, 'Название должно содержать минимум 2 символа'),

  type: z.enum(['Customer', 'Contractor'] as const, {
    required_error: 'Тип компании обязателен для выбора'
  }),

  address: z.string().optional(),

  phone: z.string()
    .optional()
    .refine((phone) => {
      if (!phone || phone.trim() === '') return true;
      return phone.length >= 10;
    }, 'Телефон должен содержать минимум 10 символов')
    .refine((phone) => {
      if (!phone || phone.trim() === '') return true;
      return /^[\+\d\s\-\(\)]+$/.test(phone);
    }, 'Неверный формат номера телефона'),

  email: z.string()
    .optional()
    .refine((email) => {
      if (!email || email.trim() === '') return true;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }, 'Неверный формат email адреса'),

  website: z.string()
    .optional()
    .refine((website) => {
      if (!website || website.trim() === '') return true;
      try {
        new URL(website);
        return true;
      } catch {
        return false;
      }
    }, 'Неверный формат сайта компании')
});

type FormData = z.infer<typeof createCompanySchema>;

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function AddCompanyModal({ isOpen, onClose }: AddCompanyModalProps): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();

  // Form setup with validation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: '',
      type: 'Customer',
      address: '',
      phone: '',
      email: '',
      website: ''
    }
  });

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      const createCompanyDto: CreateCompanyDto = {
        name: data.name,
        type: data.type,
        // Only include optional fields if they have values
        ...(data.address?.trim() && { address: data.address.trim() }),
        ...(data.phone?.trim() && { phone: data.phone.trim() }),
        ...(data.email?.trim() && { email: data.email.trim() }),
        ...(data.website?.trim() && { website: data.website.trim() })
      };

      await dispatch(createCompany(createCompanyDto)).unwrap();

      // Success: refresh data and close modal
      toast.success('Компания успешно создана');
      dispatch(fetchCompaniesData());
      dispatch(fetchCompanyStats());
      handleClose();
    } catch (error: any) {
      // Error handling
      const errorMessage = error || 'Ошибка при создании компании';
      toast.error(errorMessage);
      console.error('Create company error:', error);
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

  // Company type options
  const typeOptions: { value: CompanyType; label: string }[] = [
    { value: 'Customer', label: 'Заказчик' },
    { value: 'Contractor', label: 'Подрядчик' }
  ];

  if (!isOpen) return <></>;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} id="addCompanyModal">
      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown}>
        <Modal.Header onClose={handleClose}>
          Добавить компанию
        </Modal.Header>

        <Modal.Content>
          <div className="form">
            {/* Company Name */}
            <FormGroup>
              <label htmlFor="name">Название компании *</label>
              <FormInput
                id="name"
                type="text"
                placeholder="Введите название компании"
                {...register('name')}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && (
                <span className="error-message">{errors.name.message}</span>
              )}
            </FormGroup>

            {/* Company Type */}
            <FormGroup>
              <label htmlFor="type">Тип компании *</label>
              <FormSelect
                id="type"
                {...register('type')}
                className={errors.type ? 'error' : ''}
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </FormSelect>
              {errors.type && (
                <span className="error-message">{errors.type.message}</span>
              )}
            </FormGroup>

            {/* Address */}
            <FormGroup>
              <label htmlFor="address">Адрес</label>
              <FormInput
                id="address"
                type="text"
                placeholder="Введите адрес"
                {...register('address')}
                className={errors.address ? 'error' : ''}
              />
              {errors.address && (
                <span className="error-message">{errors.address.message}</span>
              )}
            </FormGroup>

            {/* Contact Information */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormGroup>
                <label htmlFor="phone">Телефон</label>
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
                <label htmlFor="email">Email</label>
                <FormInput
                  id="email"
                  type="email"
                  placeholder="company@example.com"
                  {...register('email')}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && (
                  <span className="error-message">{errors.email.message}</span>
                )}
              </FormGroup>
            </div>

            {/* Website */}
            <FormGroup>
              <label htmlFor="website">Веб-сайт</label>
              <FormInput
                id="website"
                type="url"
                placeholder="https://example.com"
                {...register('website')}
                className={errors.website ? 'error' : ''}
              />
              {errors.website && (
                <span className="error-message">{errors.website.message}</span>
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
            {isSubmitting ? 'Создание...' : 'Создать компанию'}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default AddCompanyModal;