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
  updateCompany,
  fetchCompaniesData,
  fetchCompanyStats
} from '../../store/slices/users_slice';
import type { UpdateCompanyDto } from '../../services/companies';
import type { CompanyType, Company } from '../../store/types';

// Validation schema using Zod
const editCompanySchema = z.object({
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
    }, 'Неверный формат сайта компании'),

  postalCode: z.string()
    .optional()
    .refine((code) => {
      if (!code || code.trim() === '') return true;
      return /^\d{6}$/.test(code);
    }, 'Почтовый индекс должен содержать 6 цифр'),

  inn: z.string()
    .optional()
    .refine((inn) => {
      if (!inn || inn.trim() === '') return true;
      return /^\d{10}$/.test(inn) || /^\d{12}$/.test(inn);
    }, 'ИНН должен содержать 10 или 12 цифр'),

  kpp: z.string()
    .optional()
    .refine((kpp) => {
      if (!kpp || kpp.trim() === '') return true;
      return /^\d{9}$/.test(kpp);
    }, 'КПП должен содержать 9 цифр'),

  ogrn: z.string()
    .optional()
    .refine((ogrn) => {
      if (!ogrn || ogrn.trim() === '') return true;
      return /^\d{13}$/.test(ogrn) || /^\d{15}$/.test(ogrn);
    }, 'ОГРН должен содержать 13 или 15 цифр'),

  account: z.string()
    .optional()
    .refine((account) => {
      if (!account || account.trim() === '') return true;
      return /^\d{20}$/.test(account);
    }, 'Расчётный счёт должен содержать 20 цифр'),

  bank: z.string().optional(),

  bik: z.string()
    .optional()
    .refine((bik) => {
      if (!bik || bik.trim() === '') return true;
      return /^\d{9}$/.test(bik);
    }, 'БИК должен содержать 9 цифр'),

  corrAccount: z.string()
    .optional()
    .refine((corrAccount) => {
      if (!corrAccount || corrAccount.trim() === '') return true;
      return /^\d{20}$/.test(corrAccount);
    }, 'Корреспондентский счёт должен содержать 20 цифр')
});

type FormData = z.infer<typeof editCompanySchema>;

interface EditCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
}

function EditCompanyModal({ isOpen, onClose, company }: EditCompanyModalProps): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();

  // Form setup with validation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(editCompanySchema),
  });

  // Reset form when company changes or modal opens
  useEffect(() => {
    if (isOpen && company) {
      reset({
        name: company.name,
        type: company.type,
        address: company.address || '',
        phone: company.phone || '',
        email: company.email || '',
        website: company.website || '',
        postalCode: company.postalCode || '',
        inn: company.inn || '',
        kpp: company.kpp || '',
        ogrn: company.ogrn || '',
        account: company.account || '',
        bank: company.bank || '',
        bik: company.bik || '',
        corrAccount: company.corrAccount || ''
      });
    }
  }, [isOpen, company, reset]);

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    if (!company) {
      toast.error('Ошибка: нет данных о компании для редактирования');
      return;
    }

    try {
      const updateCompanyDto: UpdateCompanyDto = {
        name: data.name,
        type: data.type,
        // Remove empty optional fields
        ...(data.address?.trim() && { address: data.address.trim() }),
        ...(data.phone?.trim() && { phone: data.phone.trim() }),
        ...(data.email?.trim() && { email: data.email.trim() }),
        ...(data.website?.trim() && { website: data.website.trim() }),
        ...(data.postalCode?.trim() && { postalCode: data.postalCode.trim() }),
        ...(data.inn?.trim() && { inn: data.inn.trim() }),
        ...(data.kpp?.trim() && { kpp: data.kpp.trim() }),
        ...(data.ogrn?.trim() && { ogrn: data.ogrn.trim() }),
        ...(data.account?.trim() && { account: data.account.trim() }),
        ...(data.bank?.trim() && { bank: data.bank.trim() }),
        ...(data.bik?.trim() && { bik: data.bik.trim() }),
        ...(data.corrAccount?.trim() && { corrAccount: data.corrAccount.trim() })
      };

      await dispatch(updateCompany({ id: company.id, data: updateCompanyDto })).unwrap();

      // Success: refresh data and close modal
      toast.success('Компания успешно обновлена');
      dispatch(fetchCompaniesData());
      dispatch(fetchCompanyStats());
      handleClose();
    } catch (error: any) {
      // Error handling
      const errorMessage = error || 'Ошибка при обновлении компании';
      toast.error(errorMessage);
      console.error('Update company error:', error);
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

  if (!isOpen || !company) return <></>;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} id="editCompanyModal">
      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown}>
        <Modal.Header onClose={handleClose}>
          Редактировать компанию
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

            {/* Address and Postal Code */}
            <div className="form__grid--address">
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

              <FormGroup>
                <label htmlFor="postalCode">Почтовый индекс</label>
                <FormInput
                  id="postalCode"
                  type="text"
                  placeholder="123456"
                  {...register('postalCode')}
                  className={errors.postalCode ? 'error' : ''}
                />
                {errors.postalCode && (
                  <span className="error-message">{errors.postalCode.message}</span>
                )}
              </FormGroup>
            </div>

            {/* Contact Information */}
            <div className="form__grid--two-columns">
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

            {/* Divider for Company Details */}
            <div className="form__section-divider">
              <h3 className="form__section-title">
                Реквизиты компании
              </h3>
            </div>

            {/* Tax Information */}
            <div className="form__grid--three-columns">
              <FormGroup>
                <label htmlFor="inn">ИНН</label>
                <FormInput
                  id="inn"
                  type="text"
                  placeholder="1234567890"
                  {...register('inn')}
                  className={errors.inn ? 'error' : ''}
                />
                {errors.inn && (
                  <span className="error-message">{errors.inn.message}</span>
                )}
              </FormGroup>

              <FormGroup>
                <label htmlFor="kpp">КПП</label>
                <FormInput
                  id="kpp"
                  type="text"
                  placeholder="123456789"
                  {...register('kpp')}
                  className={errors.kpp ? 'error' : ''}
                />
                {errors.kpp && (
                  <span className="error-message">{errors.kpp.message}</span>
                )}
              </FormGroup>

              <FormGroup>
                <label htmlFor="ogrn">ОГРН</label>
                <FormInput
                  id="ogrn"
                  type="text"
                  placeholder="1234567890123"
                  {...register('ogrn')}
                  className={errors.ogrn ? 'error' : ''}
                />
                {errors.ogrn && (
                  <span className="error-message">{errors.ogrn.message}</span>
                )}
              </FormGroup>
            </div>

            {/* Divider for Banking Details */}
            <div className="form__section-divider">
              <h3 className="form__section-title">
                Банковские реквизиты
              </h3>
            </div>

            {/* Bank Information */}
            <FormGroup>
              <label htmlFor="bank">Наименование банка</label>
              <FormInput
                id="bank"
                type="text"
                placeholder="ПАО Сбербанк"
                {...register('bank')}
                className={errors.bank ? 'error' : ''}
              />
              {errors.bank && (
                <span className="error-message">{errors.bank.message}</span>
              )}
            </FormGroup>

            <div className="form__grid--banking">
              <FormGroup>
                <label htmlFor="account">Расчётный счёт</label>
                <FormInput
                  id="account"
                  type="text"
                  placeholder="12345678901234567890"
                  {...register('account')}
                  className={errors.account ? 'error' : ''}
                />
                {errors.account && (
                  <span className="error-message">{errors.account.message}</span>
                )}
              </FormGroup>

              <FormGroup>
                <label htmlFor="bik">БИК</label>
                <FormInput
                  id="bik"
                  type="text"
                  placeholder="123456789"
                  {...register('bik')}
                  className={errors.bik ? 'error' : ''}
                />
                {errors.bik && (
                  <span className="error-message">{errors.bik.message}</span>
                )}
              </FormGroup>
            </div>

            <FormGroup>
              <label htmlFor="corrAccount">Корреспондентский счёт</label>
              <FormInput
                id="corrAccount"
                type="text"
                placeholder="12345678901234567890"
                {...register('corrAccount')}
                className={errors.corrAccount ? 'error' : ''}
              />
              {errors.corrAccount && (
                <span className="error-message">{errors.corrAccount.message}</span>
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

export default EditCompanyModal;