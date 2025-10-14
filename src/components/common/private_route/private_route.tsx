import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AppRoute } from '../../../const';
import type { RootState } from '../../../store/types';

type PrivateRouteProps = {
  children: JSX.Element;
}

function PrivateRoute(props: PrivateRouteProps): JSX.Element {
  const { children } = props;
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  // Show loading state if still processing auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to={AppRoute.Login} replace />;
}

export default PrivateRoute;