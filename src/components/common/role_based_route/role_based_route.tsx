import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AppRoute } from '../../../const';
import type { RootState } from '../../../store/types';
import type { UserRole } from '../../../store/types';

type RoleBasedRouteProps = {
  children: JSX.Element;
  allowedRoles?: UserRole[];
  fallbackRoute?: string;
}

function RoleBasedRoute(props: RoleBasedRouteProps): JSX.Element {
  const { children, allowedRoles = [], fallbackRoute = AppRoute.Projects } = props;
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  // Show loading state if still processing auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Проверка прав доступа...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={AppRoute.Login} replace />;
  }

  // If no roles specified, just check authentication
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user has required role
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackRoute} replace />;
  }

  return children;
}

export default RoleBasedRoute;