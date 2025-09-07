import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AppRoute } from '../../../const';
import { logoutUser } from '../../../store/slices/auth_slice';
import type { RootState } from '../../../store/types';
import type { AppDispatch } from '../../../store';

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
    return 'projects'; // default
  })();

  // Handle logout
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
      navigate(AppRoute.Login);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to login page
      navigate(AppRoute.Login);
    }
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
      case 'Customer':
        return 'Заказчик';
      default:
        return role;
    }
  };

  // Check if user has access to a specific navigation item
  const hasAccessToNavItem = (navItem: string) => {
    if (!user) return false;
    
    switch (navItem) {
      case 'employees':
        return user.role === 'Admin' || user.role === 'Manager';
      case 'companies':
        return user.role === 'Admin' || user.role === 'Manager';
      case 'workload':
        return user.role === 'Admin' || user.role === 'Manager' || user.role === 'Employee';
      case 'projects':
        return true; // All authenticated users can access projects
      default:
        return false;
    }
  };

  return (
    <header className="header">
      <Link to={AppRoute.Projects} className="header__logo">
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
        <div className="header__user-info">
          <div className="header__user-name">
            {user ? `${user.firstName} ${user.lastName}` : 'Загрузка...'}
          </div>
          <div className="header__user-role">
            {user ? getUserRoleDisplayName(user.role) : 'Загрузка...'}
          </div>
        </div>
        <div className="header__user-avatar">
          {getUserAvatarLetters()}
        </div>
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