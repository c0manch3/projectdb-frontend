export enum AppRoute {
  Root = '/',
  Login = '/login',
  Projects = '/projects',
  ProjectDetail = '/projects/:id',
  Employees = '/employees',
  Companies = '/companies',
  Workload = '/workload',
  Profile = '/profile',
  NotFound = '/404'
}

export enum AuthorizationStatus {
  Auth = 'AUTH',
  NoAuth = 'NO_AUTH',
  Unknown = 'UNKNOWN',
}

export enum PageTitle {
  Login = 'Вход в систему - LenconDB',
  Projects = 'Проекты - LenconDB',
  ProjectDetail = 'Детали проекта - LenconDB',
  Employees = 'Сотрудники - LenconDB',
  Companies = 'Компании - LenconDB',
  Workload = 'Загруженность - LenconDB',
  Profile = 'Профиль - LenconDB',
  NotFound = 'Страница не найдена - LenconDB',
}