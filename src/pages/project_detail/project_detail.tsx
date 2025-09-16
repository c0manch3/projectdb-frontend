import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { PageTitle, AppRoute } from '../../const';
import Header from '../../components/layout/header/header';
import PageHeader from '../../components/layout/page_header/page_header';
import Card from '../../components/common/card/card';
import LoadingState from '../../components/common/loading_state/loading_state';
import EmptyState from '../../components/common/empty_state/empty_state';
import Button from '../../components/common/button/button';

import type { AppDispatch } from '../../store';
import {
  fetchProjectById,
  fetchCustomers,
  fetchManagers,
  selectCurrentProject,
  selectProjectsLoading,
  selectProjectsError,
  selectProjectCustomers,
  selectProjectManagers
} from '../../store/slices/projects_slice';
import { selectCurrentUser } from '../../store/slices/auth_slice';

function ProjectDetail(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();

  // Redux state
  const currentProject = useSelector(selectCurrentProject);
  const loading = useSelector(selectProjectsLoading);
  const error = useSelector(selectProjectsError);
  const customers = useSelector(selectProjectCustomers);
  const managers = useSelector(selectProjectManagers);
  const currentUser = useSelector(selectCurrentUser);

  // Check user permissions
  const canViewProjects = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';
  const canEditProjects = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';

  // Load data on component mount
  useEffect(() => {
    if (id && canViewProjects) {
      dispatch(fetchProjectById(id));
      dispatch(fetchCustomers());
      dispatch(fetchManagers());
    }
  }, [dispatch, id, canViewProjects]);

  // Helper functions
  const formatCost = (cost: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(cost);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'active':
        return 'Активный';
      case 'completed':
        return 'Завершенный';
      case 'overdue':
        return 'Просроченный';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'main':
        return 'Основной проект';
      case 'additional':
        return 'Дополнительное соглашение';
      default:
        return type;
    }
  };

  const getCustomerName = (customerId: string): string => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Неизвестен';
  };

  const getManagerName = (managerId?: string): string => {
    if (!managerId) return 'Не назначен';
    const manager = managers.find(m => m.id === managerId);
    return manager ? `${manager.firstName} ${manager.lastName}` : 'Неизвестен';
  };

  const getMainProjectName = (mainProjectId?: string): string => {
    if (!mainProjectId) return 'Не применимо';
    // In a real app, you would need to fetch main projects or have them in state
    return 'Основной проект';
  };


  // Show error message
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Redirect if no ID provided
  if (!id) {
    return <Navigate to={AppRoute.Projects} replace />;
  }

  // Show access denied if user doesn't have permissions
  if (!canViewProjects) {
    return (
      <>
        <Helmet>
          <title>{PageTitle.ProjectDetail}</title>
        </Helmet>
        <Header activeNavItem="projects" />
        <main className="main">
          <PageHeader
            title="Проект"
            subtitle="Детальная информация о проекте"
          />
          <div className="container">
            <Card>
              <div className="access-denied">
                <h3>Доступ запрещен</h3>
                <p>У вас нет прав для просмотра информации о проектах.</p>
                <Link to={AppRoute.Projects}>
                  <Button variant="primary">Вернуться к списку</Button>
                </Link>
              </div>
            </Card>
          </div>
        </main>
      </>
    );
  }

  // Show loading state
  if (loading && !currentProject) {
    return (
      <>
        <Helmet>
          <title>{PageTitle.ProjectDetail}</title>
        </Helmet>
        <Header activeNavItem="projects" />
        <main className="main">
          <PageHeader
            title="Проект"
            subtitle="Детальная информация о проекте"
          />
          <div className="container">
            <LoadingState message="Загрузка информации о проекте..." />
          </div>
        </main>
      </>
    );
  }

  // Show error state if project not found
  if (!loading && !currentProject) {
    return (
      <>
        <Helmet>
          <title>{PageTitle.ProjectDetail}</title>
        </Helmet>
        <Header activeNavItem="projects" />
        <main className="main">
          <PageHeader
            title="Проект"
            subtitle="Детальная информация о проекте"
          />
          <div className="container">
            <EmptyState
              message="Проект не найден"
              actionButton={
                <Link to={AppRoute.Projects}>
                  <Button variant="primary">Вернуться к списку</Button>
                </Link>
              }
            />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{currentProject?.name || 'Проект'} - {PageTitle.ProjectDetail}</title>
      </Helmet>

      {/* Header */}
      <Header activeNavItem="projects" />

      {/* Main Content */}
      <main className="main">
        <PageHeader
          title="Детали проекта"
          subtitle="Полная информация о строительном проекте"
        />

        {/* Breadcrumbs */}
        <div className="container">
          <div className="breadcrumbs">
            <Link to={AppRoute.Projects} className="breadcrumbs__link">
              Проекты
            </Link>
            <span className="breadcrumbs__separator">›</span>
            <span className="breadcrumbs__item">{currentProject?.name || 'Загрузка...'}</span>
          </div>
        </div>

        {currentProject && (
          <div className="container">
            {/* Hero Section */}
            <div className="project-hero">
              <div className="project-hero__main">
                <div className="project-hero__header">
                  <h1 className="project-hero__title">
                    {currentProject.name}
                    {currentProject.type === 'additional' && (
                      <span className="project-type-badge project-type-badge--additional">
                        Дополнительное соглашение
                      </span>
                    )}
                  </h1>
                  <div className="project-hero__badges">
                    <span className={`status-badge status-badge--${currentProject.status}`}>
                      {getStatusLabel(currentProject.status)}
                    </span>
                    <span className="project-type-badge project-type-badge--main">
                      {getTypeLabel(currentProject.type)}
                    </span>
                  </div>
                </div>
                <div className="project-hero__meta">
                  <span className="project-hero__customer">{getCustomerName(currentProject.customerId)}</span>
                  <span className="project-hero__separator">•</span>
                  <span className="project-hero__manager">{getManagerName(currentProject.managerId)}</span>
                </div>
              </div>
              <div className="project-hero__cost">
                <div className="project-hero__cost-label">Стоимость проекта</div>
                <div className="project-hero__cost-value">{formatCost(currentProject.cost)}</div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="project-content-grid">
              {/* Project Details Card */}
              <Card className="project-details-card">
                <Card.Header>
                  <Card.Title>Детали проекта</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="project-details-grid">
                    <div className="project-detail-item">
                      <div className="project-detail-item__label">ID проекта</div>
                      <div className="project-detail-item__value project-detail-item__value--id">{currentProject.id}</div>
                    </div>
                    <div className="project-detail-item">
                      <div className="project-detail-item__label">Тип проекта</div>
                      <div className="project-detail-item__value">{getTypeLabel(currentProject.type)}</div>
                    </div>
                    {currentProject.type === 'additional' && currentProject.mainProjectId && (
                      <div className="project-detail-item">
                        <div className="project-detail-item__label">Основной проект</div>
                        <div className="project-detail-item__value">{getMainProjectName(currentProject.mainProjectId)}</div>
                      </div>
                    )}
                    <div className="project-detail-item">
                      <div className="project-detail-item__label">Текущий статус</div>
                      <div className="project-detail-item__value">
                        <span className={`status-badge status-badge--${currentProject.status}`}>
                          {getStatusLabel(currentProject.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card.Content>
              </Card>

              {/* Team Information Card */}
              <Card className="project-team-card">
                <Card.Header>
                  <Card.Title>Команда проекта</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="project-team">
                    <div className="team-member">
                      <div className="team-member__avatar">
                        {getCustomerName(currentProject.customerId).charAt(0).toUpperCase()}
                      </div>
                      <div className="team-member__info">
                        <div className="team-member__name">{getCustomerName(currentProject.customerId)}</div>
                        <div className="team-member__role">Заказчик</div>
                      </div>
                    </div>
                    <div className="team-member">
                      <div className="team-member__avatar">
                        {getManagerName(currentProject.managerId).split(' ').map(n => n.charAt(0)).join('').toUpperCase()}
                      </div>
                      <div className="team-member__info">
                        <div className="team-member__name">{getManagerName(currentProject.managerId)}</div>
                        <div className="team-member__role">Менеджер проекта</div>
                      </div>
                    </div>
                  </div>
                </Card.Content>
              </Card>

              {/* Project Timeline Card */}
              <Card className="project-timeline-card">
                <Card.Header>
                  <Card.Title>Сроки проекта</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="project-timeline">
                    <div className="timeline-item">
                      <div className="timeline-item__icon">
                        📋
                      </div>
                      <div className="timeline-item__content">
                        <div className="timeline-item__label">Дата договора</div>
                        <div className="timeline-item__value">{formatDate(currentProject.contractDate)}</div>
                      </div>
                    </div>
                    <div className={`timeline-item ${(() => {
                      const expDate = new Date(currentProject.expirationDate);
                      const today = new Date();
                      const daysUntilDeadline = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                      if (daysUntilDeadline < 0) return 'timeline-item--overdue';
                      if (daysUntilDeadline <= 7) return 'timeline-item--warning';
                      return '';
                    })()}`}>
                      <div className="timeline-item__icon">
                        🎯
                      </div>
                      <div className="timeline-item__content">
                        <div className="timeline-item__label">Срок сдачи</div>
                        <div className="timeline-item__value">{formatDate(currentProject.expirationDate)}</div>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-item__icon">
                        📅
                      </div>
                      <div className="timeline-item__content">
                        <div className="timeline-item__label">Дата создания</div>
                        <div className="timeline-item__value">{formatDate(currentProject.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                </Card.Content>
              </Card>

              {/* Actions Card */}
              {canEditProjects && (
                <Card className="project-actions-card">
                  <Card.Header>
                    <Card.Title>Действия</Card.Title>
                  </Card.Header>
                  <Card.Content>
                    <div className="project-actions">
                      <Link to={`/projects/${currentProject.id}/edit`}>
                        <Button variant="primary" className="project-action-button">
                          ✏️ Редактировать проект
                        </Button>
                      </Link>
                      <Button variant="outline" className="project-action-button">
                        📄 Управление документами
                      </Button>
                      <Button variant="outline" className="project-action-button">
                        🏗️ Конструкции
                      </Button>
                      <Button variant="outline" className="project-action-button">
                        📊 Отчеты
                      </Button>
                    </div>
                  </Card.Content>
                </Card>
              )}
            </div>

            {/* Future Features Card */}
            <Card className="project-future-features">
              <Card.Header>
                <Card.Title>Планируемые функции</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="future-features">
                  <div className="future-feature">
                    <div className="future-feature__icon">🏗️</div>
                    <div className="future-feature__content">
                      <div className="future-feature__title">Управление конструкциями</div>
                      <div className="future-feature__description">Создание и отслеживание конструкций проекта</div>
                    </div>
                  </div>
                  <div className="future-feature">
                    <div className="future-feature__icon">📄</div>
                    <div className="future-feature__content">
                      <div className="future-feature__title">Документооборот</div>
                      <div className="future-feature__description">Загрузка и управление проектными документами</div>
                    </div>
                  </div>
                  <div className="future-feature">
                    <div className="future-feature__icon">👥</div>
                    <div className="future-feature__content">
                      <div className="future-feature__title">Команда проекта</div>
                      <div className="future-feature__description">Назначение сотрудников и распределение задач</div>
                    </div>
                  </div>
                  <div className="future-feature">
                    <div className="future-feature__icon">📊</div>
                    <div className="future-feature__content">
                      <div className="future-feature__title">Загруженность</div>
                      <div className="future-feature__description">Планирование ресурсов и отслеживание прогресса</div>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>
        )}
      </main>
    </>
  );
}

export default ProjectDetail;