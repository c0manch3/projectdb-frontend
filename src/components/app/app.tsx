import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppRoute, AuthorizationStatus } from '../../const';
import { PrivateRoute } from '../common';
import Login from '../../pages/login/login';
import Projects from '../../pages/projects/projects';
import ProjectDetail from '../../pages/project_detail/project_detail';
import Employees from '../../pages/employees/employees';
import Companies from '../../pages/companies/companies';
import Workload from '../../pages/workload/workload';
import UserProfile from '../../pages/user_profile/user_profile';
import NotFound from '../../pages/not_found/not_found';

function App(): JSX.Element {
  // TODO: Заменить на реальный статус авторизации из store
  const authorizationStatus = AuthorizationStatus.NoAuth;
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path={AppRoute.Login} element={<Login />} />
        
        {/* Default Route - Redirect to main page (projects) */}
        <Route path={AppRoute.Root} element={<Navigate to={AppRoute.Projects} replace />} />
        
        {/* Protected Routes */}
        <Route 
          path={AppRoute.Projects} 
          element={
            <PrivateRoute authorizationStatus={authorizationStatus}>
              <Projects />
            </PrivateRoute>
          } 
        />
        <Route 
          path={AppRoute.ProjectDetail} 
          element={
            <PrivateRoute authorizationStatus={authorizationStatus}>
              <ProjectDetail />
            </PrivateRoute>
          } 
        />
        <Route 
          path={AppRoute.Employees} 
          element={
            <PrivateRoute authorizationStatus={authorizationStatus}>
              <Employees />
            </PrivateRoute>
          } 
        />
        <Route 
          path={AppRoute.Companies} 
          element={
            <PrivateRoute authorizationStatus={authorizationStatus}>
              <Companies />
            </PrivateRoute>
          } 
        />
        <Route 
          path={AppRoute.Workload} 
          element={
            <PrivateRoute authorizationStatus={authorizationStatus}>
              <Workload />
            </PrivateRoute>
          } 
        />
        <Route 
          path={AppRoute.Profile} 
          element={
            <PrivateRoute authorizationStatus={authorizationStatus}>
              <UserProfile />
            </PrivateRoute>
          } 
        />
        
        {/* Error Routes */}
        <Route path={AppRoute.NotFound} element={<NotFound />} />
        <Route path="*" element={<Navigate to={AppRoute.NotFound} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;