interface HeaderProps {
  activeNavItem: 'projects' | 'employees' | 'companies' | 'workload';
}

function Header({ activeNavItem }: HeaderProps): JSX.Element {
  return (
    <header className="header">
      <a href="projects.html" className="header__logo">LenconDB</a>
      
      <nav className="header__nav">
        <a 
          href="projects.html" 
          className={`header__nav-link ${activeNavItem === 'projects' ? 'header__nav-link--active' : ''}`}
        >
          Проекты
        </a>
        <a 
          href="employees.html" 
          className={`header__nav-link ${activeNavItem === 'employees' ? 'header__nav-link--active' : ''}`}
          id="employeesNav"
        >
          Сотрудники
        </a>
        <a 
          href="companies.html" 
          className={`header__nav-link ${activeNavItem === 'companies' ? 'header__nav-link--active' : ''}`}
        >
          Компании
        </a>
        <a 
          href="workload.html" 
          className={`header__nav-link ${activeNavItem === 'workload' ? 'header__nav-link--active' : ''}`}
        >
          Загруженность
        </a>
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
  );
}

export default Header;