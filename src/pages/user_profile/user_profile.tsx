import { Helmet } from 'react-helmet-async';
import { PageTitle } from '../../const';

function UserProfile(): JSX.Element {
  return (
    <>
      <Helmet>
        <title>{PageTitle.Profile}</title>
      </Helmet>
      {/* Header */}
      <header className="header">
        <a href="projects.html" className="header__logo">LenconDB</a>
        
        <nav className="header__nav">
          <a href="projects.html" className="header__nav-link">Проекты</a>
          <a href="employees.html" className="header__nav-link" id="employeesNav">Сотрудники</a>
          <a href="companies.html" className="header__nav-link">Компании</a>
          <a href="workload.html" className="header__nav-link">Загруженность</a>
        </nav>
        
        <div className="header__user">
          <div className="header__user-info">
            <div className="header__user-name" id="userName">Загрузка...</div>
            <div className="header__user-role" id="userRole">Загрузка...</div>
          </div>
          <div className="header__user-avatar" id="userAvatar">?</div>
          <button className="button button--secondary button--small">Выйти</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        <div className="page-header">
          <div className="container">
            <div className="breadcrumbs">
              <a href="projects.html" className="breadcrumbs__link">Главная</a>
              <span className="breadcrumbs__separator">›</span>
              <span className="breadcrumbs__item">Профиль пользователя</span>
            </div>
            <h1 className="page-header__title">Профиль пользователя</h1>
            <p className="page-header__subtitle">Управление личной информацией и настройками аккаунта</p>
          </div>
        </div>

        <div className="container">
          <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem'}}>
            {/* Profile Sidebar */}
            <div>
              {/* Profile Avatar Card */}
              <div className="card profile-section">
                <div className="card__content text-center">
                  <div className="profile-avatar" id="profileAvatar">
                    ?
                  </div>
                  <h2 id="profileFullName">Загрузка...</h2>
                  <p style={{color: 'var(--text-secondary)', marginBottom: '1.5rem'}} id="profileRoleText">Загрузка...</p>
                  
                  <button className="button button--secondary w-full">
                    📷 Изменить аватар
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="card profile-section">
                <div className="card__header">
                  <h3 className="card__title">Статистика</h3>
                </div>
                <div className="card__content">
                  <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span style={{color: 'var(--text-secondary)'}}>Проекты:</span>
                      <span style={{fontWeight: '600'}} id="userProjectsCount">0</span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span style={{color: 'var(--text-secondary)'}}>Часов в месяце:</span>
                      <span style={{fontWeight: '600'}} id="userMonthlyHours">0</span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span style={{color: 'var(--text-secondary)'}}>Загруженность:</span>
                      <span style={{fontWeight: '600', color: 'var(--success)'}} id="userUtilization">0%</span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span style={{color: 'var(--text-secondary)'}}>Дата регистрации:</span>
                      <span style={{fontWeight: '600'}} id="userJoinDate">-</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Main Content */}
            <div>
              {/* Personal Information */}
              <div className="card profile-section">
                <div className="card__header">
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h3 className="card__title">Личная информация</h3>
                    <button className="button button--secondary">
                      <span id="editPersonalButton">✏️ Редактировать</span>
                    </button>
                  </div>
                </div>
                <div className="card__content">
                  <form className="form" id="personalInfoForm">
                    <div className="profile-info">
                      <div className="profile-info__item">
                        <label className="profile-info__label">Имя</label>
                        <input type="text" id="firstName" className="form__input" readOnly />
                      </div>
                      <div className="profile-info__item">
                        <label className="profile-info__label">Фамилия</label>
                        <input type="text" id="lastName" className="form__input" readOnly />
                      </div>
                      <div className="profile-info__item">
                        <label className="profile-info__label">Email</label>
                        <input type="email" id="email" className="form__input" readOnly />
                      </div>
                      <div className="profile-info__item">
                        <label className="profile-info__label">Телефон</label>
                        <input type="tel" id="phone" className="form__input" readOnly />
                      </div>
                      <div className="profile-info__item">
                        <label className="profile-info__label">Дата рождения</label>
                        <input type="date" id="dateBirth" className="form__input" readOnly />
                      </div>
                      <div className="profile-info__item">
                        <label className="profile-info__label">Компания</label>
                        <div className="profile-info__value" id="companyName">Загрузка...</div>
                      </div>
                    </div>
                    
                    <div id="personalInfoActions" style={{display: 'none', marginTop: '1.5rem', gap: '0.5rem'}} className="flex">
                      <button type="button" className="button button--primary">Сохранить</button>
                      <button type="button" className="button button--secondary">Отмена</button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Security Settings */}
              <div className="card profile-section">
                <div className="card__header">
                  <h3 className="card__title">Безопасность</h3>
                </div>
                <div className="card__content">
                  <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                    <div>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
                        <span style={{fontWeight: '500'}}>Пароль</span>
                        <button className="button button--secondary button--small">
                          🔐 Изменить пароль
                        </button>
                      </div>
                      <p style={{color: 'var(--text-secondary)', fontSize: '0.875rem'}}>
                        Последнее изменение: <span id="lastPasswordChange">Никогда</span>
                      </p>
                    </div>
                    
                    <div>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
                        <span style={{fontWeight: '500'}}>Telegram интеграция</span>
                        <button className="button button--secondary button--small">
                          📱 <span id="telegramButtonText">Подключить</span>
                        </button>
                      </div>
                      <p style={{color: 'var(--text-secondary)', fontSize: '0.875rem'}} id="telegramStatus">
                        Telegram не подключен
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Log */}
              <div className="card profile-section">
                <div className="card__header">
                  <h3 className="card__title">Последняя активность</h3>
                </div>
                <div className="card__content">
                  <div id="activityLog" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    {/* Activity items will be loaded here */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Change Password Modal */}
      <div className="modal-overlay" id="changePasswordModal">
        <div className="modal">
          <div className="modal__header">
            <h3 className="modal__title">Изменить пароль</h3>
            <button className="modal__close">×</button>
          </div>
          <div className="modal__content">
            <form className="form" id="changePasswordForm">
              <div className="form__group">
                <label htmlFor="currentPassword" className="form__label form__label--required">Текущий пароль</label>
                <input type="password" id="currentPassword" className="form__input" required />
                <div className="form__error" id="currentPasswordError" style={{display: 'none'}}></div>
              </div>
              
              <div className="form__group">
                <label htmlFor="newPassword" className="form__label form__label--required">Новый пароль</label>
                <input type="password" id="newPassword" className="form__input" required minLength={6} />
                <div className="form__help">Минимум 6 символов</div>
                <div className="form__error" id="newPasswordError" style={{display: 'none'}}></div>
              </div>
              
              <div className="form__group">
                <label htmlFor="confirmPassword" className="form__label form__label--required">Подтвердите пароль</label>
                <input type="password" id="confirmPassword" className="form__input" required />
                <div className="form__error" id="confirmPasswordError" style={{display: 'none'}}></div>
              </div>
            </form>
          </div>
          <div className="modal__footer">
            <button className="button button--secondary">Отмена</button>
            <button className="button button--primary" id="changePasswordButton">
              <span id="changePasswordButtonText">Изменить пароль</span>
            </button>
          </div>
        </div>
      </div>

      {/* Telegram Modal */}
      <div className="modal-overlay" id="telegramModal">
        <div className="modal">
          <div className="modal__header">
            <h3 className="modal__title">Telegram интеграция</h3>
            <button className="modal__close">×</button>
          </div>
          <div className="modal__content">
            <div id="telegramContent">
              {/* Content will be loaded dynamically */}
            </div>
          </div>
          <div className="modal__footer">
            <button className="button button--secondary">Закрыть</button>
            <button className="button button--primary" id="telegramActionButton">
              <span id="telegramActionText">Сохранить</span>
            </button>
          </div>
        </div>
      </div>

      {/* Change Avatar Modal */}
      <div className="modal-overlay" id="changeAvatarModal">
        <div className="modal">
          <div className="modal__header">
            <h3 className="modal__title">Изменить аватар</h3>
            <button className="modal__close">×</button>
          </div>
          <div className="modal__content">
            <div className="text-center">
              <p style={{marginBottom: '1.5rem'}}>Выберите новый аватар или загрузите изображение</p>
              
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem'}}>
                {['🏗️', '👷', '📐', '🔨', '🏢', '📋', '⚡', '🎯'].map((emoji, index) => (
                  <button key={index} className="button button--secondary" style={{fontSize: '2rem', padding: '1rem'}}>
                    {emoji}
                  </button>
                ))}
              </div>
              
              <div className="file-upload">
                <input type="file" id="avatarFileInput" className="file-upload__input" accept="image/*" />
                <div className="file-upload__icon">🖼️</div>
                <div className="file-upload__text">Загрузить изображение</div>
                <div className="file-upload__hint">JPG, PNG до 5 МБ</div>
              </div>
            </div>
          </div>
          <div className="modal__footer">
            <button className="button button--secondary">Отмена</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserProfile;