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
import AddCompanyModal from '../../components/modals/AddCompanyModal';
import EditCompanyModal from '../../components/modals/EditCompanyModal';
import CompanyDetailsModal from '../../components/modals/CompanyDetailsModal';
import ConfirmDeleteCompanyModal from '../../components/modals/ConfirmDeleteCompanyModal';

import type { AppDispatch } from '../../store';
import {
  fetchCompaniesData,
  fetchCompanyStats,
  deleteCompany,
  updateCompanyFilters,
  selectFilteredCompanies,
  selectCompaniesLoading,
  selectCompanyError,
  selectCompanyStats,
  selectCompanyStatsLoading,
  selectCompanyFilters
} from '../../store/slices/users_slice';
import { selectCurrentUser } from '../../store/slices/auth_slice';
import type { Company, CompanyType } from '../../store/types';

function Companies(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const filteredCompanies = useSelector(selectFilteredCompanies);
  const loading = useSelector(selectCompaniesLoading);
  const error = useSelector(selectCompanyError);
  const stats = useSelector(selectCompanyStats);
  const statsLoading = useSelector(selectCompanyStatsLoading);
  const filters = useSelector(selectCompanyFilters);
  const currentUser = useSelector(selectCurrentUser);

  // Local state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check user permissions
  const canManageCompanies = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';
  const canViewCompanies = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';

  // Load data on component mount
  useEffect(() => {
    if (canViewCompanies) {
      dispatch(fetchCompaniesData());
      dispatch(fetchCompanyStats());
    }
  }, [dispatch, canViewCompanies]);

  // Handle filter changes
  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value === 'all' ? null : e.target.value as CompanyType;
    dispatch(updateCompanyFilters({ type }));
  };

  const handleSearchChange = (value: string) => {
    dispatch(updateCompanyFilters({ search: value }));
  };

  // Handle company actions
  const handleView = (company: Company) => {
    setSelectedCompany(company);
    setShowDetailsModal(true);
  };

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setShowEditModal(true);
  };

  const handleEditFromDetails = (company: Company) => {
    setShowDetailsModal(false);
    setSelectedCompany(company);
    setShowEditModal(true);
  };

  const handleDelete = (company: Company) => {
    setSelectedCompany(company);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async (company: Company) => {
    setIsDeleting(true);
    try {
      await dispatch(deleteCompany(company.id)).unwrap();
      toast.success('Компания успешно удалена');
      dispatch(fetchCompaniesData());
      dispatch(fetchCompanyStats());
      setShowDeleteModal(false);
      setSelectedCompany(null);
    } catch (error: any) {
      toast.error(typeof error === 'string' ? error : error?.message || 'Ошибка при удалении компании');
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper functions
  const getCompanyTypeDisplayName = (type: CompanyType) => {
    switch (type) {
      case 'Customer': return 'Заказчик';
      case 'Contractor': return 'Подрядчик';
      default: return type;
    }
  };

  // If user doesn't have permission, show access denied
  if (!canViewCompanies) {
    return (
      <>
        <Helmet>
          <title>{PageTitle.Companies}</title>
        </Helmet>
        <Header activeNavItem="companies" />
        <main className="main">
          <div className="container">
            <div className="access-denied">
              <h2>Доступ запрещен</h2>
              <p>У вас нет прав для просмотра списка компаний</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{PageTitle.Companies}</title>
      </Helmet>
      <Header activeNavItem="companies" />

      <main className="main">
        <PageHeader
          title="Компании"
          subtitle="Управление клиентами и подрядчиками в системе"
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
                <Filters.Label htmlFor="typeFilter">Тип:</Filters.Label>
                <FormSelect
                  id="typeFilter"
                  className="filters__select"
                  value={filters.type || 'all'}
                  onChange={handleTypeFilterChange}
                >
                  <option value="all">Все</option>
                  <option value="Customer">Заказчик</option>
                  <option value="Contractor">Подрядчик</option>
                </FormSelect>
              </Filters.Group>

              <SearchInput
                id="searchInput"
                placeholder="Поиск по названию, email, адресу..."
                value={filters.search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)}
              />

              {canManageCompanies && (
                <Button
                  id="newCompanyButton"
                  onClick={() => setShowCreateModal(true)}
                >
                  + Добавить компанию
                </Button>
              )}
            </Filters>
          </Card>

          {/* Statistics Cards */}
          <StatCard.Grid>
            <StatCard
              value={statsLoading ? 0 : stats.total}
              label="Всего компаний"
              color="primary"
              id="totalCompanies"
            />
            <StatCard
              value={statsLoading ? 0 : stats.active}
              label="Активных"
              color="success"
              id="activeCompanies"
            />
            <StatCard
              value={statsLoading ? 0 : stats.customers}
              label="Заказчиков"
              color="warning"
              id="customersCount"
            />
            <StatCard
              value={statsLoading ? 0 : stats.contractors}
              label="Подрядчиков"
              color="secondary"
              id="contractorsCount"
            />
          </StatCard.Grid>

          {/* Companies Table */}
          <Table.Container>
            {loading ? (
              <LoadingState message="Загрузка компаний..." />
            ) : filteredCompanies.length === 0 ? (
              <EmptyState
                message="Компании не найдены"
                show={true}
                actionButton={canManageCompanies ? (
                  <Button onClick={() => setShowCreateModal(true)}>
                    Добавить первую компанию
                  </Button>
                ) : undefined}
              />
            ) : (
              <Table>
                <Table.Head>
                  <tr>
                    <Table.Header>Название</Table.Header>
                    <Table.Header>Тип</Table.Header>
                    <Table.Header>Email</Table.Header>
                    <Table.Header>Телефон</Table.Header>
                    {canManageCompanies && <Table.Header>Действия</Table.Header>}
                  </tr>
                </Table.Head>
                <Table.Body id="companiesTableBody">
                  {filteredCompanies.map((company) => (
                    <tr
                      key={company.id}
                      className="table__row table__row--clickable"
                      onClick={() => handleView(company)}
                    >
                      <Table.Cell>
                        <span className="company-name">
                          {company.name}
                        </span>
                      </Table.Cell>
                      <Table.Cell>{getCompanyTypeDisplayName(company.type)}</Table.Cell>
                      <Table.Cell>{company.email || 'Не указан'}</Table.Cell>
                      <Table.Cell>{company.phone || 'Не указан'}</Table.Cell>
                      {canManageCompanies && (
                        <Table.Cell className="table__cell--actions">
                          <div className="company-actions" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="small"
                              variant="secondary"
                              onClick={() => handleEdit(company)}
                            >
                              Редактировать
                            </Button>
                            <Button
                              size="small"
                              variant="secondary"
                              onClick={() => handleDelete(company)}
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

      {/* Add Company Modal */}
      <AddCompanyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Edit Company Modal */}
      <EditCompanyModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCompany(null);
        }}
        company={selectedCompany}
      />

      {/* Company Details Modal */}
      <CompanyDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedCompany(null);
        }}
        company={selectedCompany}
        onEdit={canManageCompanies ? handleEditFromDetails : undefined}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteCompanyModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCompany(null);
        }}
        company={selectedCompany}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
}

export default Companies;