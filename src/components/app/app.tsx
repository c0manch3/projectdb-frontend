import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { AppRoute } from '../../const';
import { PrivateRoute, RoleBasedRoute, ErrorBoundary } from '../common';
import { checkAuthStatus } from '../../store/slices/auth_slice';
import type { RootState } from '../../store/types';
import type { AppDispatch } from '../../store';

// Direct imports for all page components
import Login from '../../pages/login/login';
import Projects from '../../pages/projects/projects';
import ProjectDetail from '../../pages/project_detail/project_detail';
import Constructions from '../../pages/constructions/constructions';
import Employees from '../../pages/employees/employees';
import Companies from '../../pages/companies/companies';
import Workload from '../../pages/workload/workload';
import UserProfile from '../../pages/user_profile/user_profile';
import NotFound from '../../pages/not_found/not_found';

function App(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const { isInitialized, loading } = useSelector((state: RootState) => state.auth);
  const authCheckInitiated = useRef(false);

  // Check authentication status on app initialization (only once)
  useEffect(() => {
    if (!authCheckInitiated.current) {
      authCheckInitiated.current = true;
      dispatch(checkAuthStatus());
    }
  }, [dispatch]);

  // Show loading screen while auth is being initialized
  if (!isInitialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">LenconDB</h2>
          <p className="text-gray-600">Инициализация приложения...</p>
        </div>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#4ade80',
              },
            },
            error: {
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route 
            path={AppRoute.Login} 
            element={<Login />} 
          />
          
          {/* Default Route - Redirect to main page (projects) */}
          <Route path={AppRoute.Root} element={<Navigate to={AppRoute.Projects} replace />} />
          
          {/* Protected Routes */}
          <Route 
            path={AppRoute.Projects} 
            element={
              <PrivateRoute>
                <Projects />
              </PrivateRoute>
            } 
          />
          <Route
            path={AppRoute.ProjectDetail}
            element={
              <PrivateRoute>
                <ProjectDetail />
              </PrivateRoute>
            }
          />
          <Route
            path={AppRoute.ProjectConstructions}
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'Manager', 'Employee']}>
                <Constructions />
              </RoleBasedRoute>
            }
          />
          <Route
            path={AppRoute.Constructions}
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'Manager', 'Employee']}>
                <Constructions />
              </RoleBasedRoute>
            }
          />
          <Route
            path={AppRoute.Employees}
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'Manager']}>
                <Employees />
              </RoleBasedRoute>
            }
          />
          <Route 
            path={AppRoute.Companies} 
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'Manager']}>
                <Companies />
              </RoleBasedRoute>
            } 
          />
          <Route 
            path={AppRoute.Workload} 
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'Manager', 'Employee']}>
                <Workload />
              </RoleBasedRoute>
            } 
          />
          <Route 
            path={AppRoute.Profile} 
            element={
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            } 
          />
          
          {/* Error Routes */}
          <Route 
            path={AppRoute.NotFound} 
            element={<NotFound />} 
          />
          <Route path="*" element={<Navigate to={AppRoute.NotFound} replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;