import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { PageTitle, AppRoute } from '../../const';

function NotFound(): JSX.Element {
  return (
    <>
      <Helmet>
        <title>{PageTitle.NotFound}</title>
      </Helmet>
      {/* Header */}
      <header className="header">
        <Link to={AppRoute.Projects} className="header__logo">LenconDB</Link>
        
        <nav className="header__nav">
          <Link to={AppRoute.Projects} className="header__nav-link">Проекты</Link>
          <Link to={AppRoute.Employees} className="header__nav-link" id="employeesNav">Сотрудники</Link>
          <Link to={AppRoute.Companies} className="header__nav-link">Компании</Link>
          <Link to={AppRoute.Workload} className="header__nav-link">Загруженность</Link>
        </nav>
        
        <div className="header__user">
          <div className="header__user-info">
            <div className="header__user-name" id="userName">Гость</div>
            <div className="header__user-role" id="userRole">Неизвестно</div>
          </div>
          <div className="header__user-avatar" id="userAvatar">?</div>
          <button className="button button--secondary button--small">Войти</button>
        </div>
      </header>

      {/* 404 Content */}
      <main className="main">
        <div className="not-found">
          <div className="not-found__container">
            <div className="not-found__code">404</div>
            <h1 className="not-found__title">Страница не найдена</h1>
            <p className="not-found__message">
              Запрашиваемая страница не существует или у вас нет прав для ее просмотра.
              Возможно, страница была перемещена или удалена.
            </p>
            
            {/* Useful Links */}
            <div className="not-found__links">
              <h3 className="not-found__links-title">Полезные ссылки:</h3>
              <div className="not-found__buttons">
                <Link to={AppRoute.Projects} className="button button--primary">Проекты</Link>
                <Link to={AppRoute.Companies} className="button button--secondary">Компании</Link>
                <Link to={AppRoute.Workload} className="button button--secondary">Загруженность</Link>
                <Link to={AppRoute.Profile} className="button button--secondary">Профиль</Link>
              </div>
            </div>
            
            {/* Search */}
            <div style={{marginBottom: '2rem'}}>
              <div className="search-input" style={{maxWidth: '400px', margin: '0 auto'}}>
                <input 
                  type="text" 
                  id="searchInput" 
                  className="form__input search-input__field" 
                  placeholder="Поиск по сайту..."
                />
                <span className="search-input__icon">🔍</span>
              </div>
            </div>

            <Link to={AppRoute.Projects} className="button button--primary button--large">
              Вернуться на главную
            </Link>
          </div>
        </div>
      </main>

      {/* Error Details (for developers) */}
      <div id="errorDetails" style={{display: 'none', position: 'fixed', bottom: '20px', left: '20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--border-radius)', padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '400px'}}>
        <div style={{fontWeight: '600', marginBottom: '0.5rem'}}>Технические детали:</div>
        <div>URL: <span id="currentUrl"></span></div>
        <div>Referrer: <span id="referrerUrl"></span></div>
        <div>User Agent: <span id="userAgent"></span></div>
        <div>Время: <span id="errorTime"></span></div>
      </div>
    </>
  );
}

export default NotFound;