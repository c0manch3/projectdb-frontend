import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
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
import AddEmployeeModal from '../../components/modals/AddEmployeeModal';
import EditEmployeeModal from '../../components/modals/EditEmployeeModal';
import ConfirmDeleteModal from '../../components/modals/ConfirmDeleteModal';

import type { AppDispatch } from '../../store';
import {
  fetchEmployees,
  fetchEmployeeStats,
  deleteEmployee,
  updateFilters,
  selectFilteredUsers,
  selectUsersLoading,
  selectUsersError,
  selectEmployeeStats,
  selectStatsLoading,
  selectUsersFilters
} from '../../store/slices/users_slice';
import { selectCurrentUser } from '../../store/slices/auth_slice';
import type { User, UserRole } from '../../store/types';

function Employees(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const filteredUsers = useSelector(selectFilteredUsers);
  const loading = useSelector(selectUsersLoading);
  const error = useSelector(selectUsersError);
  const stats = useSelector(selectEmployeeStats);
  const statsLoading = useSelector(selectStatsLoading);
  const filters = useSelector(selectUsersFilters);
  const currentUser = useSelector(selectCurrentUser);
  
  // Local state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Check user permissions
  const canManageEmployees = currentUser?.role === 'Admin';
  const canViewEmployees = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';

  // Load data on component mount
  useEffect(() => {
    if (canViewEmployees) {
      dispatch(fetchEmployees());
      dispatch(fetchEmployeeStats());
    }
  }, [dispatch, canViewEmployees]);


  // Handle filter changes
  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value === 'all' ? null : e.target.value as UserRole;
    dispatch(updateFilters({ role }));
  };


  const handleSearchChange = (value: string) => {
    dispatch(updateFilters({ search: value }));
  };

  // Handle employee actions
  const handleEdit = (employee: User) => {
    setEditingEmployee(employee);
    setShowEditModal(true);
  };

  const handleDelete = (employee: User) => {
    setDeletingEmployee(employee);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async (employee: User) => {
    setIsDeleting(true);
    try {
      await dispatch(deleteEmployee(employee.id)).unwrap();
      toast.success('Сотрудник успешно удален');
      dispatch(fetchEmployees());
      dispatch(fetchEmployeeStats());
      setShowDeleteModal(false);
      setDeletingEmployee(null);
    } catch (error: any) {
      toast.error(typeof error === 'string' ? error : error?.message || 'Ошибка при удалении сотрудника');
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper functions

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'Admin': return 'Администратор';
      case 'Manager': return 'Менеджер';
      case 'Employee': return 'Сотрудник';
      default: return role;
    }
  };

  // If user doesn't have permission, show access denied
  if (!canViewEmployees) {
    return (
      <>
        <Helmet>
          <title>{PageTitle.Employees}</title>
        </Helmet>
        <Header activeNavItem="employees" />
        <main className="main">
          <div className="container">
            <div className="access-denied">
              <h2>Доступ запрещен</h2>
              <p>У вас нет прав для просмотра списка сотрудников</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{PageTitle.Employees}</title>
      </Helmet>
      <Header activeNavItem="employees" />

      <main className="main">
        <PageHeader 
          title="Сотрудники" 
          subtitle="Управление пользователями и их ролями в системе" 
        />

        <div className="container">
          {/* Error Message */}
          {error && (
            <Card>
              <div className="error-message" style={{ color: 'red', padding: '1rem' }}>
                {error}
              </div>
            </Card>
          )}

          {/* Filters and Search */}
          <Card>
            <Filters>
              <Filters.Group>
                <Filters.Label htmlFor="roleFilter">Роль:</Filters.Label>
                <FormSelect 
                  id="roleFilter" 
                  className="filters__select"
                  value={filters.role || 'all'}
                  onChange={handleRoleFilterChange}
                >
                  <option value="all">Все</option>
                  <option value="Admin">Администратор</option>
                  <option value="Manager">Менеджер</option>
                  <option value="Employee">Сотрудник</option>
                </FormSelect>
              </Filters.Group>
              

              <SearchInput 
                id="searchInput" 
                placeholder="Поиск по имени, email..."
                value={filters.search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)}
              />

              {canManageEmployees && (
                <Button 
                  id="newEmployeeButton"
                  onClick={() => setShowCreateModal(true)}
                >
                  + Добавить сотрудника
                </Button>
              )}
            </Filters>
          </Card>

          {/* Statistics Cards */}
          <StatCard.Grid>
            <StatCard 
              value={statsLoading ? 0 : stats.total} 
              label="Всего сотрудников" 
              color="primary" 
              id="totalEmployees" 
            />
            <StatCard 
              value={statsLoading ? 0 : stats.active} 
              label="Активных" 
              color="success" 
              id="activeEmployees" 
            />
            <StatCard 
              value={statsLoading ? 0 : stats.managers} 
              label="Менеджеров" 
              color="warning" 
              id="managersCount" 
            />
            <StatCard 
              value={statsLoading ? 0 : stats.employees} 
              label="Конструкторов" 
              color="secondary" 
              id="employeesCount" 
            />
          </StatCard.Grid>

          {/* Employees Table */}
          <Table.Container>
            {loading ? (
              <LoadingState id="loadingState" message="Загрузка сотрудников..." />
            ) : filteredUsers.length === 0 ? (
              <EmptyState 
                id="emptyState" 
                message="Сотрудники не найдены" 
                show={true}
                actionButton={canManageEmployees ? (
                  <Button onClick={() => setShowCreateModal(true)}>
                    Добавить первого сотрудника
                  </Button>
                ) : undefined}
              />
            ) : (
              <Table>
                <Table.Head>
                  <tr>
                    <Table.Header>ФИО</Table.Header>
                    <Table.Header>Email</Table.Header>
                    <Table.Header>Телефон</Table.Header>
                    <Table.Header>Роль</Table.Header>
                    {canManageEmployees && <Table.Header>Действия</Table.Header>}
                  </tr>
                </Table.Head>
                <Table.Body id="employeesTableBody">
                  {filteredUsers.map((employee) => (
                    <tr
                      key={employee.id}
                      className={`table__row ${canManageEmployees ? 'table__row--clickable' : ''}`}
                      onClick={() => canManageEmployees && handleEdit(employee)}
                    >
                      <Table.Cell>
                        <span className="employee-name">
                          {employee.firstName} {employee.lastName}
                        </span>
                      </Table.Cell>
                      <Table.Cell>{employee.email}</Table.Cell>
                      <Table.Cell>{employee.phone || 'Не указан'}</Table.Cell>
                      <Table.Cell>{getRoleDisplayName(employee.role)}</Table.Cell>
                      {canManageEmployees && (
                        <Table.Cell className="table__cell--actions">
                          <div className="employee-actions" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="small"
                              variant="secondary"
                              onClick={() => handleEdit(employee)}
                            >
                              Редактировать
                            </Button>
                            <Button
                              size="small"
                              variant="secondary"
                              onClick={() => handleDelete(employee)}
                            >
                              Удалить
                            </Button>
                          </div>
                        </Table.Cell>
                      )}
                    </tr>
                  ))}
                </Table.Body>
              </Table>
            )}
          </Table.Container>
        </div>
      </main>

      {/* Add Employee Modal */}
      <AddEmployeeModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
      
      {/* Edit Employee Modal */}
      <EditEmployeeModal 
        isOpen={showEditModal} 
        onClose={() => {
          setShowEditModal(false);
          setEditingEmployee(null);
        }}
        employee={editingEmployee}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal 
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingEmployee(null);
        }}
        employee={deletingEmployee}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
}

export default Employees;