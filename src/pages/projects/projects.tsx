import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PageTitle } from '../../const';
import Header from '../../components/layout/header/header';
import PageHeader from '../../components/layout/page_header/page_header';
import Card from '../../components/common/card/card';
import Button from '../../components/common/button/button';
import SearchInput from '../../components/common/search_input/search_input';
import Filters from '../../components/common/filters/filters';
import FormSelect from '../../components/forms/form_select/form_select';
import StatCard from '../../components/data_display/stat_card/stat_card';
import Table from '../../components/data_display/table/table';
import LoadingState from '../../components/common/loading_state/loading_state';
import EmptyState from '../../components/common/empty_state/empty_state';
import AddProjectModal from '../../components/modals/AddProjectModal';
import EditProjectModal from '../../components/modals/EditProjectModal';
import ProjectDetailsModal from '../../components/modals/ProjectDetailsModal';
import ConfirmDeleteProjectModal from '../../components/modals/ConfirmDeleteProjectModal';

import type { AppDispatch } from '../../store';
import {
  fetchProjects,
  fetchProjectStats,
  fetchCustomers,
  fetchManagers,
  updateFilters,
  updateSearchQuery,
  selectFilteredProjects,
  selectProjectsLoading,
  selectProjectsError,
  selectProjectStats,
  selectProjectStatsLoading,
  selectProjectsFilters,
  selectProjectSearchQuery,
  selectProjectCustomers,
  selectProjectManagers
} from '../../store/slices/projects_slice';
import { selectCurrentUser } from '../../store/slices/auth_slice';
import type { Project } from '../../store/types';

function Projects(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const filteredProjects = useSelector(selectFilteredProjects);
  const loading = useSelector(selectProjectsLoading);
  const error = useSelector(selectProjectsError);
  const stats = useSelector(selectProjectStats);
  const statsLoading = useSelector(selectProjectStatsLoading);
  const filters = useSelector(selectProjectsFilters);
  const searchQuery = useSelector(selectProjectSearchQuery);
  const customers = useSelector(selectProjectCustomers);
  const managers = useSelector(selectProjectManagers);
  const currentUser = useSelector(selectCurrentUser);

  // Local state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Check user permissions
  const canCreateProjects = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';
  const canViewProjects = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';
  const canEditProjects = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';
  const canDeleteProjects = currentUser?.role === 'Admin';
  const canSeeCustomerFilter = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';

  // Load data on component mount
  useEffect(() => {
    if (canViewProjects) {
      dispatch(fetchProjects());
      dispatch(fetchProjectStats());
      dispatch(fetchCustomers());
      dispatch(fetchManagers());
    }
  }, [dispatch, canViewProjects]);

  // Handle filter changes
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value as 'all' | 'active' | 'completed' | 'overdue';
    dispatch(updateFilters({ status }));
  };

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as 'all' | 'main' | 'additional';
    dispatch(updateFilters({ type }));
  };

  const handleCustomerFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const customerId = e.target.value || null;
    dispatch(updateFilters({ customerId }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateSearchQuery(e.target.value));
  };

  // Handle project actions
  const handleView = (project: Project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const handleEditFromDetails = (project: Project) => {
    setShowDetailsModal(false);
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const handleDelete = (project: Project) => {
    setSelectedProject(project);
    setShowDeleteModal(true);
  };

  const handleDeleteFromDetails = (project: Project) => {
    setShowDetailsModal(false);
    setSelectedProject(project);
    setShowDeleteModal(true);
  };

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

  const getCustomerName = (customerId: string): string => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Неизвестен';
  };

  const getManagerName = (managerId?: string): string => {
    if (!managerId) return 'Не назначен';
    const manager = managers.find(m => m.id === managerId);
    return manager ? `${manager.firstName} ${manager.lastName}` : 'Неизвестен';
  };

  // Show error message
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (!canViewProjects) {
    return (
      <>
        <Helmet>
          <title>{PageTitle.Projects}</title>
        </Helmet>
        <Header activeNavItem="projects" />
        <main className="main">
          <PageHeader
            title="Проекты"
            subtitle="Управление строительными проектами и документооборотом"
          />
          <div className="container">
            <Card>
              <div className="access-denied">
                <h3>Доступ запрещен</h3>
                <p>У вас нет прав для просмотра списка проектов.</p>
              </div>
            </Card>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{PageTitle.Projects}</title>
      </Helmet>
      {/* Header */}
      <Header activeNavItem="projects" />

      {/* Main Content */}
      <main className="main">
        <PageHeader
          title="Проекты"
          subtitle="Управление строительными проектами и документооборотом"
        />

        <div className="container">
          {/* Statistics Cards */}
          {stats && !statsLoading && (
            <div className="stats-grid">
              <StatCard
                label="Всего проектов"
                value={stats.total.toString()}
                color="primary"
              />
              <StatCard
                label="Активные"
                value={stats.active.toString()}
                color="success"
              />
              <StatCard
                label="Завершенные"
                value={stats.completed.toString()}
                color="primary"
              />
              <StatCard
                label="Просроченные"
                value={stats.overdue.toString()}
                color="warning"
              />
              <StatCard
                label="Общая стоимость"
                value={formatCost(stats.totalCost)}
                color="primary"
              />
              <StatCard
                label="Средняя стоимость"
                value={formatCost(stats.averageCost)}
                color="secondary"
              />
            </div>
          )}

          {/* Filters and Search */}
          <Card>
            <Filters>
              <Filters.Group>
                <Filters.Label htmlFor="statusFilter">Статус:</Filters.Label>
                <FormSelect
                  id="statusFilter"
                  className="filters__select"
                  value={filters.status}
                  onChange={handleStatusFilterChange}
                >
                  <option value="all">Все</option>
                  <option value="active">Активные</option>
                  <option value="completed">Завершенные</option>
                  <option value="overdue">Просроченные</option>
                </FormSelect>
              </Filters.Group>

              <Filters.Group>
                <Filters.Label htmlFor="typeFilter">Тип:</Filters.Label>
                <FormSelect
                  id="typeFilter"
                  className="filters__select"
                  value={filters.type}
                  onChange={handleTypeFilterChange}
                >
                  <option value="all">Все</option>
                  <option value="main">Основные</option>
                  <option value="additional">Дополнительные</option>
                </FormSelect>
              </Filters.Group>

              {canSeeCustomerFilter && (
                <Filters.Group>
                  <Filters.Label htmlFor="customerFilter">Заказчик:</Filters.Label>
                  <FormSelect
                    id="customerFilter"
                    className="filters__select"
                    value={filters.customerId || ''}
                    onChange={handleCustomerFilterChange}
                  >
                    <option value="">Все</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </FormSelect>
                </Filters.Group>
              )}

              <SearchInput
                id="searchInput"
                placeholder="Поиск проектов..."
                value={searchQuery}
                onChange={handleSearchChange}
              />

              {canCreateProjects && (
                <Button
                  id="newProjectButton"
                  onClick={() => setShowCreateModal(true)}
                >
                  + Новый проект
                </Button>
              )}
            </Filters>
          </Card>

          {/* Projects Table */}
          <Table.Container>
            {loading ? (
              <LoadingState message="Загрузка проектов..." />
            ) : filteredProjects.length === 0 ? (
              <EmptyState
                message="Проекты не найдены"
                actionButton={
                  canCreateProjects ? (
                    <Button onClick={() => setShowCreateModal(true)}>
                      Создать первый проект
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <Table>
                <Table.Head>
                  <tr>
                    <Table.Header>Название проекта</Table.Header>
                    <Table.Header>Заказчик</Table.Header>
                    <Table.Header>Менеджер</Table.Header>
                    <Table.Header>Дата договора</Table.Header>
                    <Table.Header>Срок сдачи</Table.Header>
                    <Table.Header>Стоимость</Table.Header>
                    <Table.Header>Статус</Table.Header>
                    <Table.Header>Действия</Table.Header>
                  </tr>
                </Table.Head>
                <Table.Body>
                  {filteredProjects.map((project) => (
                    <tr key={project.id}>
                      <Table.Cell>
                        <div className="project-name">
                          <Link
                            to={`/projects/${project.id}`}
                            className="project-name__link"
                          >
                            {project.name}
                          </Link>
                          {project.type === 'additional' && (
                            <span className="project-type-badge project-type-badge--additional">
                              Доп.
                            </span>
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell>{getCustomerName(project.customerId)}</Table.Cell>
                      <Table.Cell>{getManagerName(project.managerId)}</Table.Cell>
                      <Table.Cell>{formatDate(project.contractDate)}</Table.Cell>
                      <Table.Cell>{formatDate(project.expirationDate)}</Table.Cell>
                      <Table.Cell>
                        <span className="project-cost">
                          {formatCost(project.cost)}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className={`status-badge status-badge--${project.status}`}>
                          {getStatusLabel(project.status)}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="table-actions">
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() => handleView(project)}
                          >
                            Просмотр
                          </Button>
                          {canEditProjects && (
                            <Button
                              variant="outline"
                              size="small"
                              onClick={() => handleEdit(project)}
                            >
                              Изменить
                            </Button>
                          )}
                          {canDeleteProjects && (
                            <Button
                              variant="danger"
                              size="small"
                              onClick={() => handleDelete(project)}
                            >
                              Удалить
                            </Button>
                          )}
                        </div>
                      </Table.Cell>
                    </tr>
                  ))}
                </Table.Body>
              </Table>
            )}
          </Table.Container>
        </div>
      </main>

      {/* Modals */}
      <AddProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <EditProjectModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        project={selectedProject}
      />

      <ProjectDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        project={selectedProject}
        onEdit={handleEditFromDetails}
        onDelete={handleDeleteFromDetails}
      />

      <ConfirmDeleteProjectModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        project={selectedProject}
      />
    </>
  );
}

export default Projects;