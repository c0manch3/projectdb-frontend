import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AppRoute } from '../../../const';
import { logout } from '../../../store/slices/auth_slice';
import type { RootState } from '../../../store/types';
import type { AppDispatch } from '../../../store';
import TrialBadge from '../../common/trial_badge/trial_badge';

interface HeaderProps {
  activeNavItem?: 'projects' | 'employees' | 'companies' | 'workload';
}

function Header({ activeNavItem }: HeaderProps): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  // Determine active nav item based on current route if not explicitly passed
  const currentActiveNavItem = activeNavItem || (() => {
    const pathname = location.pathname;
    if (pathname.startsWith('/projects')) return 'projects';
    if (pathname.startsWith('/employees')) return 'employees';
    if (pathname.startsWith('/companies')) return 'companies';
    if (pathname.startsWith('/workload')) return 'workload';
    // Default route based on user role
    if (user?.role === 'Employee') return 'workload';
    return 'projects';
  })();

  // Get home route based on user role
  const getHomeRoute = () => {
    if (user?.role === 'Employee') return AppRoute.Workload;
    return AppRoute.Projects;
  };

  // Handle logout (client-side only)
  const handleLogout = () => {
    // Use synchronous logout for immediate client-side logout
    dispatch(logout());
    navigate(AppRoute.Login);
  };

  // Generate user avatar letters
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
      case 'Trial':
        return 'Тестовый доступ';
      default:
        return role;
    }
  };

  // Check if user has access to a specific navigation item
  const hasAccessToNavItem = (navItem: string) => {
    if (!user) return false;

    switch (navItem) {
      case 'employees':
        // Trial users cannot access employees section
        return user.role === 'Admin' || user.role === 'Manager';
      case 'companies':
        // Trial can view companies
        return user.role === 'Admin' || user.role === 'Manager' || user.role === 'Trial';
      case 'workload':
        // Trial can view workload
        return user.role === 'Admin' || user.role === 'Manager' || user.role === 'Employee' || user.role === 'Trial';
      case 'projects':
        // Trial can view projects (read-only)
        return user.role === 'Admin' || user.role === 'Manager' || user.role === 'Trial';
      default:
        return false;
    }
  };

  return (
    <header className="header">
      <Link to={getHomeRoute()} className="header__logo">
        LenconDB
      </Link>
      
      <nav className="header__nav">
        {hasAccessToNavItem('projects') && (
          <Link 
            to={AppRoute.Projects}
            className={`header__nav-link ${currentActiveNavItem === 'projects' ? 'header__nav-link--active' : ''}`}
          >
            Проекты
          </Link>
        )}
        {hasAccessToNavItem('employees') && (
          <Link 
            to={AppRoute.Employees}
            className={`header__nav-link ${currentActiveNavItem === 'employees' ? 'header__nav-link--active' : ''}`}
          >
            Сотрудники
          </Link>
        )}
        {hasAccessToNavItem('companies') && (
          <Link 
            to={AppRoute.Companies}
            className={`header__nav-link ${currentActiveNavItem === 'companies' ? 'header__nav-link--active' : ''}`}
          >
            Компании
          </Link>
        )}
        {hasAccessToNavItem('workload') && (
          <Link 
            to={AppRoute.Workload}
            className={`header__nav-link ${currentActiveNavItem === 'workload' ? 'header__nav-link--active' : ''}`}
          >
            Загруженность
          </Link>
        )}
      </nav>
      
      <div className="header__user">
        <TrialBadge />
        <div className="header__user-info">
          <div className="header__user-name">
            {user ? `${user.firstName} ${user.lastName}` : 'Загрузка...'}
          </div>
          <div className="header__user-role">
            {user ? getUserRoleDisplayName(user.role) : 'Загрузка...'}
          </div>
        </div>
        <Link to={AppRoute.Profile} className="header__user-avatar">
          {getUserAvatarLetters()}
        </Link>
        <button
          className="button button--secondary button--small"
          onClick={handleLogout}
          disabled={loading}
        >
          {loading ? 'Выход...' : 'Выйти'}
        </button>
      </div>
    </header>
  );
}

export default Header;