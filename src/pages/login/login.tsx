import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Navigate } from 'react-router-dom';
import { PageTitle, AppRoute } from '../../const';
import { loginUser, clearError } from '../../store/slices/auth_slice';
import type { RootState } from '../../store/types';
import type { AppDispatch } from '../../store';

function Login(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  // Redux state
  const { isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);
  
  // Local form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // If user is already authenticated, redirect to projects
  if (isAuthenticated) {
    return <Navigate to={AppRoute.Projects} replace />;
  }

  // Clear auth error when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }

    // Clear general error
    if (error) {
      dispatch(clearError());
    }
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const errors = {
      email: '',
      password: '',
    };

    if (!formData.email.trim()) {
      errors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Введите корректный email';
    }

    if (!formData.password.trim()) {
      errors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      errors.password = 'Пароль должен содержать минимум 6 символов';
    }

    setFieldErrors(errors);
    return !errors.email && !errors.password;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(loginUser({
        email: formData.email.trim(),
        password: formData.password,
      }));

      if (loginUser.fulfilled.match(result)) {
        // Navigate after successful login - no delay needed since App component handles initialization
        console.log('Login successful, navigating to projects...');
        navigate(AppRoute.Projects, { replace: true });
      }
    } catch (error) {
      // Error is handled by Redux and displayed in UI
      console.error('Login error:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title>{PageTitle.Login}</title>
      </Helmet>
      <div className="login">
        <div className="login__container">
          <div className="login__logo">
            <h1 className="login__title">LenconDB</h1>
            <p className="login__subtitle">Система управления проектами</p>
          </div>
          
          <form className="login__form" onSubmit={handleSubmit}>
            <div className="form__group">
              <label htmlFor="email" className="form__label form__label--required">
                Email
              </label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email}
                onChange={handleInputChange}
                className={`form__input ${fieldErrors.email ? 'form__input--error' : ''}`}
                placeholder="user@company.com" 
                required
                autoComplete="username"
                disabled={loading}
              />
              {fieldErrors.email && (
                <div className="form__error" style={{display: 'block'}}>
                  {fieldErrors.email}
                </div>
              )}
            </div>
            
            <div className="form__group">
              <label htmlFor="password" className="form__label form__label--required">
                Пароль
              </label>
              <div className="form__input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`form__input ${fieldErrors.password ? 'form__input--error' : ''}`}
                  placeholder="Введите пароль"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="form__password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  disabled={loading}
                >
                  <svg
                    className="form__password-icon"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    {showPassword ? (
                      // Eye-slash icon (hide password)
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </>
                    ) : (
                      // Eye icon (show password)
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
              {fieldErrors.password && (
                <div className="form__error" style={{display: 'block'}}>
                  {fieldErrors.password}
                </div>
              )}
            </div>
            
            {error && (
              <div className="form__error" style={{display: 'block', marginTop: '1rem'}}>
                {error}
              </div>
            )}
            
            <button 
              type="submit" 
              className="button button--primary button--large login__submit"
              disabled={loading}
            >
              <span>
                {loading ? 'Вход...' : 'Войти'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;