import { Helmet } from 'react-helmet-async';
import { PageTitle } from '../../const';

function Login(): JSX.Element {
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
        
        <form className="login__form" id="loginForm">
          <div className="form__group">
            <label htmlFor="email" className="form__label form__label--required">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              className="form__input" 
              placeholder="user@company.com" 
              required
              autoComplete="username"
            />
            <div className="form__error" id="emailError" style={{display: 'none'}}></div>
          </div>
          
          <div className="form__group">
            <label htmlFor="password" className="form__label form__label--required">Пароль</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              className="form__input" 
              placeholder="Введите пароль" 
              required
              autoComplete="current-password"
            />
            <div className="form__error" id="passwordError" style={{display: 'none'}}></div>
          </div>
          
          <div className="form__error" id="generalError" style={{display: 'none', marginTop: '1rem'}}></div>
          
          <button type="submit" className="button button--primary button--large login__submit" id="submitButton">
            <span id="submitText">Войти</span>
          </button>
        </form>
      </div>
    </div>
    </>
  );
}

export default Login;