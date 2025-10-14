import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Header from '../../components/layout/header/header';
import { PageTitle } from '../../const';
import { authService } from '../../services/auth';
import type { RootState } from '../../store/types';

// Validation schema for password change
const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .max(24, 'Пароль должен содержать максимум 24 символа'),
  newPassword: z.string()
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .max(24, 'Пароль должен содержать максимум 24 символа'),
  confirmPassword: z.string()
    .min(6, 'Пароль должен содержать минимум 6 символов'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

function UserProfile(): JSX.Element {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  // Get user avatar letters
  const getUserAvatarLetters = () => {
    if (!user) return '?';
    const firstLetter = user.firstName?.charAt(0)?.toUpperCase() || '';
    const lastLetter = user.lastName?.charAt(0)?.toUpperCase() || '';
    return `${firstLetter}${lastLetter}` || '?';
  };

  // Get user role display name
  const getUserRoleDisplayName = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'Администратор';
      case 'Manager':
        return 'Менеджер';
      case 'Employee':
        return 'Сотрудник';
      case 'Customer':
        return 'Клиент';
      default:
        return role;
    }
  };

  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  // Format date for input
  const formatDateForInput = (dateString: string | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Handle password change
  const onSubmitPasswordChange = async (data: ChangePasswordFormData) => {
    setIsChangingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      toast.success('Пароль успешно изменен');
      setIsPasswordModalOpen(false);
      reset();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при смене пароля');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle modal close
  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    reset();
  };

  return (
    <>
      <Helmet>
        <title>{PageTitle.Profile}</title>
      </Helmet>

      <Header />

      <main className="main">
        <div className="page-header">
          <div className="container">
            <h1 className="page-header__title">Профиль пользователя</h1>
            <p className="page-header__subtitle">
              Управление личной информацией и настройками аккаунта
            </p>
          </div>
        </div>

        <div className="container">
          <div className="profile">
            {/* Profile Sidebar */}
            <div className="profile__sidebar">
              {/* Profile Avatar Card */}
              <div className="card profile__card">
                <div className="profile__avatar-section">
                  <div className="profile__avatar-large">
                    {getUserAvatarLetters()}
                  </div>
                  <h2 className="profile__name">
                    {user ? `${user.firstName} ${user.lastName}` : 'Загрузка...'}
                  </h2>
                  <p className="profile__role">
                    {user ? getUserRoleDisplayName(user.role) : 'Загрузка...'}
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="card profile__card">
                <div className="card__header">
                  <h3 className="card__title">Информация</h3>
                </div>
                <div className="card__content">
                  <div className="profile__stats">
                    <div className="profile__stat-item">
                      <span className="profile__stat-label">Email:</span>
                      <span className="profile__stat-value">{user?.email || '-'}</span>
                    </div>
                    <div className="profile__stat-item">
                      <span className="profile__stat-label">Телефон:</span>
                      <span className="profile__stat-value">{user?.phone || '-'}</span>
                    </div>
                    <div className="profile__stat-item">
                      <span className="profile__stat-label">Дата рождения:</span>
                      <span className="profile__stat-value">
                        {formatDate(user?.dateBirth)}
                      </span>
                    </div>
                    {user?.telegramId && (
                      <div className="profile__stat-item">
                        <span className="profile__stat-label">Telegram ID:</span>
                        <span className="profile__stat-value">{user.telegramId}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Main Content */}
            <div className="profile__content">
              {/* Personal Information */}
              <div className="card profile__card">
                <div className="card__header">
                  <h3 className="card__title">Личная информация</h3>
                </div>
                <div className="card__content">
                  <div className="profile__info">
                    <div className="profile__info-item">
                      <label className="profile__info-label">Имя</label>
                      <div className="profile__info-value">{user?.firstName || '-'}</div>
                    </div>
                    <div className="profile__info-item">
                      <label className="profile__info-label">Фамилия</label>
                      <div className="profile__info-value">{user?.lastName || '-'}</div>
                    </div>
                    <div className="profile__info-item">
                      <label className="profile__info-label">Email</label>
                      <div className="profile__info-value">{user?.email || '-'}</div>
                    </div>
                    <div className="profile__info-item">
                      <label className="profile__info-label">Телефон</label>
                      <div className="profile__info-value">{user?.phone || '-'}</div>
                    </div>
                    <div className="profile__info-item">
                      <label className="profile__info-label">Дата рождения</label>
                      <div className="profile__info-value">
                        {formatDate(user?.dateBirth)}
                      </div>
                    </div>
                    <div className="profile__info-item">
                      <label className="profile__info-label">Роль</label>
                      <div className="profile__info-value">
                        {user ? getUserRoleDisplayName(user.role) : '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="card profile__card">
                <div className="card__header">
                  <h3 className="card__title">Безопасность</h3>
                </div>
                <div className="card__content">
                  <div className="profile__security">
                    <div className="profile__security-item">
                      <div className="profile__security-info">
                        <span className="profile__security-title">Пароль</span>
                        <p className="profile__security-description">
                          Изменить пароль для входа в систему
                        </p>
                      </div>
                      <button
                        className="button button--secondary button--small"
                        onClick={() => setIsPasswordModalOpen(true)}
                        type="button"
                      >
                        Изменить пароль
                      </button>
                    </div>

                    {user?.telegramId && (
                      <div className="profile__security-item">
                        <div className="profile__security-info">
                          <span className="profile__security-title">
                            Telegram интеграция
                          </span>
                          <p className="profile__security-description">
                            Подключен: ID {user.telegramId}
                          </p>
                        </div>
                        <span className="badge badge--success">Подключено</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="modal-overlay modal-overlay--open" onClick={handleClosePasswordModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">Изменить пароль</h3>
              <button
                className="modal__close"
                onClick={handleClosePasswordModal}
                type="button"
              >
                ×
              </button>
            </div>
            <div className="modal__content">
              <form
                className="form"
                onSubmit={handleSubmit(onSubmitPasswordChange)}
                id="changePasswordForm"
              >
                <div className="form__group">
                  <label htmlFor="currentPassword" className="form__label">
                    Текущий пароль <span className="form__label-required">*</span>
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    className={`form__input ${errors.currentPassword ? 'form__input--error' : ''}`}
                    {...register('currentPassword')}
                    disabled={isChangingPassword}
                  />
                  {errors.currentPassword && (
                    <div className="form__error">{errors.currentPassword.message}</div>
                  )}
                </div>

                <div className="form__group">
                  <label htmlFor="newPassword" className="form__label">
                    Новый пароль <span className="form__label-required">*</span>
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    className={`form__input ${errors.newPassword ? 'form__input--error' : ''}`}
                    {...register('newPassword')}
                    disabled={isChangingPassword}
                  />
                  <div className="form__help">Минимум 6 символов, максимум 24</div>
                  {errors.newPassword && (
                    <div className="form__error">{errors.newPassword.message}</div>
                  )}
                </div>

                <div className="form__group">
                  <label htmlFor="confirmPassword" className="form__label">
                    Подтвердите пароль <span className="form__label-required">*</span>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    className={`form__input ${errors.confirmPassword ? 'form__input--error' : ''}`}
                    {...register('confirmPassword')}
                    disabled={isChangingPassword}
                  />
                  {errors.confirmPassword && (
                    <div className="form__error">{errors.confirmPassword.message}</div>
                  )}
                </div>
              </form>
            </div>
            <div className="modal__footer">
              <button
                className="button button--secondary"
                onClick={handleClosePasswordModal}
                type="button"
                disabled={isChangingPassword}
              >
                Отмена
              </button>
              <button
                className="button button--primary"
                type="submit"
                form="changePasswordForm"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? 'Изменение...' : 'Изменить пароль'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UserProfile;
