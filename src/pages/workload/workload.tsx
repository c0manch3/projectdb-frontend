import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { PageTitle } from '../../const';
import Header from '../../components/layout/header/header';
import PageHeader from '../../components/layout/page_header/page_header';
import Card from '../../components/common/card/card';
import Button from '../../components/common/button/button';
import Filters from '../../components/common/filters/filters';
import FormSelect from '../../components/forms/form_select/form_select';
import FormInput from '../../components/forms/form_input/form_input';
import StatCard from '../../components/data_display/stat_card/stat_card';
import LoadingState from '../../components/common/loading_state/loading_state';
import ErrorBoundary from '../../components/common/error_boundary/error_boundary';

// Workload components
import UnifiedWorkloadCalendar from '../../components/data_display/unified_workload_calendar/unified_workload_calendar';

// Modal components
import AddWorkloadPlanModal from '../../components/modals/AddWorkloadPlanModal';
import EditWorkloadPlanModal from '../../components/modals/EditWorkloadPlanModal';
import ConfirmDeleteWorkloadPlanModal from '../../components/modals/ConfirmDeleteWorkloadPlanModal';
import AddWorkloadActualModal from '../../components/modals/AddWorkloadActualModal';
import EditWorkloadActualModal from '../../components/modals/EditWorkloadActualModal';
import ConfirmDeleteWorkloadActualModal from '../../components/modals/ConfirmDeleteWorkloadActualModal';
import WorkloadDetailsModal from '../../components/modals/WorkloadDetailsModal';

import type { AppDispatch, AppRootState } from '../../store';
import type { UnifiedWorkload, WorkloadPlan, WorkloadActual } from '../../store/types';
import {
  fetchUnifiedWorkload,
  fetchWorkloadStats,
  fetchWorkloadEmployees,
  fetchWorkloadProjects,
  fetchWorkloadPlanById,
  fetchWorkloadActualById,
  selectWorkload,
  selectWorkloadStats,
  selectWorkloadStatsLoading,
  selectWorkloadEmployees,
  selectWorkloadProjects,
  selectWorkloadView,
  selectWorkloadFilters,
  selectWorkloadSelectedDate,
  updateFilters,
  updateView,
  updateSelectedDate,
  clearError
} from '../../store/slices/workload_slice';
import {
  selectCurrentUser
} from '../../store/slices/auth_slice';

interface ModalState {
  type: 'add-plan' | 'edit-plan' | 'delete-plan' | 'add-actual' | 'edit-actual' | 'delete-actual' | 'workload-details' | null;
  data?: {
    date?: string;
    planId?: string;
    actualId?: string;
    plan?: WorkloadPlan;
    actual?: WorkloadActual;
    workloads?: UnifiedWorkload[];
  };
}

function Workload(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const workloadState = useSelector(selectWorkload);
  const stats = useSelector(selectWorkloadStats);
  const statsLoading = useSelector(selectWorkloadStatsLoading);
  const employees = useSelector(selectWorkloadEmployees);
  const projects = useSelector(selectWorkloadProjects);
  const view = useSelector(selectWorkloadView);
  const filters = useSelector(selectWorkloadFilters);
  const selectedDate = useSelector(selectWorkloadSelectedDate);
  const currentUser = useSelector(selectCurrentUser);

  // Local state
  const [modalState, setModalState] = useState<ModalState>({ type: null });
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize data on component mount
  useEffect(() => {
    if (!isInitialized && currentUser) {
      dispatch(fetchWorkloadEmployees());

      // Load all projects for workload view (no filtering by manager)
      dispatch(fetchWorkloadProjects());

      // For Employee, automatically set userId filter to current user
      const initialFilters = currentUser.role === 'Employee'
        ? { ...filters, userId: currentUser.id }
        : filters;

      dispatch(updateFilters(initialFilters));
      dispatch(fetchUnifiedWorkload(initialFilters));
      dispatch(fetchWorkloadStats(initialFilters));
      setIsInitialized(true);
    }
  }, [dispatch, isInitialized, currentUser]);

  // Refresh data when filters change
  useEffect(() => {
    if (isInitialized) {
      dispatch(fetchUnifiedWorkload(filters));
      dispatch(fetchWorkloadStats(filters));
    }
  }, [dispatch, filters, isInitialized]);

  // Clear errors on mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Handle filter changes
  const handleFilterChange = (field: string, value: string) => {
    const newFilters = { ...filters };

    if (value === '' || value === 'all') {
      delete newFilters[field as keyof typeof filters];
    } else {
      newFilters[field as keyof typeof filters] = value as any;
    }

    console.log('Filter change:', field, value, 'New filters:', newFilters);
    dispatch(updateFilters(newFilters));
  };

  // Handle date range change
  const handleDateRangeChange = (startDate: string, endDate: string) => {
    dispatch(updateFilters({
      ...filters,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    }));
  };

  // Handle view change
  const handleViewChange = (newView: 'week' | 'month') => {
    dispatch(updateView(newView));
  };

  // Modal handlers
  const closeModal = () => {
    setModalState({ type: null });
  };

  const handleSuccess = () => {
    // Refresh data after successful operations
    dispatch(fetchUnifiedWorkload(filters));
    dispatch(fetchWorkloadStats(filters));
  };

  // Plan modal handlers
  const handleAddPlan = (date?: string) => {
    setModalState({
      type: 'add-plan',
      data: { date: date || selectedDate }
    });
  };

  const handleEditPlan = async (planId: string) => {
    try {
      const plan = await dispatch(fetchWorkloadPlanById(planId)).unwrap();
      setModalState({
        type: 'edit-plan',
        data: { planId, plan }
      });
    } catch (error) {
      toast.error('Ошибка при загрузке плана');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      const plan = await dispatch(fetchWorkloadPlanById(planId)).unwrap();
      setModalState({
        type: 'delete-plan',
        data: { planId, plan }
      });
    } catch (error) {
      toast.error('Ошибка при загрузке плана');
    }
  };

  // Actual modal handlers
  const handleAddActual = (date?: string) => {
    setModalState({
      type: 'add-actual',
      data: { date: date || selectedDate }
    });
  };

  const handleEditActual = async (actualId: string) => {
    try {
      const actual = await dispatch(fetchWorkloadActualById(actualId)).unwrap();
      setModalState({
        type: 'edit-actual',
        data: { actualId, actual }
      });
    } catch (error) {
      toast.error('Ошибка при загрузке записи');
    }
  };

  const handleDeleteActual = async (actualId: string) => {
    try {
      const actual = await dispatch(fetchWorkloadActualById(actualId)).unwrap();
      setModalState({
        type: 'delete-actual',
        data: { actualId, actual }
      });
    } catch (error) {
      toast.error('Ошибка при загрузке записи');
    }
  };

  // Handle workload details view
  const handleViewDetails = (workload: UnifiedWorkload) => {
    // For now, just show a toast with details
    const employeeName = employees.find(emp => emp.id === workload.userId)?.firstName || 'Unknown';
    const projectName = projects.find(proj => proj.id === workload.projectId)?.name || 'Unknown';

    toast.success(`${employeeName} - ${projectName} на ${new Date(workload.date).toLocaleDateString('ru-RU')}`);
  };

  // Handle workload cell click in unified calendar
  const handleWorkloadCellClick = (date: string, workloads: UnifiedWorkload[]) => {
    // Only open modal if there are workloads to show
    if (workloads.length > 0) {
      setModalState({
        type: 'workload-details',
        data: { date, workloads }
      });
    }
  };

  // Handle create workload from unified calendar
  const handleCreateWorkloadFromCalendar = (date: string) => {
    // Open workload details modal which will show create-plan mode for empty cells
    setModalState({
      type: 'workload-details',
      data: { date, workloads: [] }
    });
  };

  // Export functionality (placeholder)
  const handleExport = () => {
    toast('Функция экспорта будет добавлена в следующих версиях', {
      icon: 'ℹ️',
      duration: 3000,
    });
  };

  return (
    <>
      <Helmet>
        <title>{PageTitle.Workload}</title>
      </Helmet>

      {/* Header */}
      <Header activeNavItem="workload" />

      {/* Main Content */}
      <main className="main">
        <PageHeader
          title="Загруженность"
          subtitle="Планирование и учет рабочего времени сотрудников"
        />

        <div className="container">
          {/* Filters and Controls */}
          <Card>
            <Filters>
              {/* Hide employee filter for Employee role - they can only see their own data */}
              {currentUser?.role !== 'Employee' && (
                <Filters.Group>
                  <Filters.Label htmlFor="employeeFilter">Сотрудник:</Filters.Label>
                  <FormSelect
                    id="employeeFilter"
                    value={filters.userId || 'all'}
                    onChange={(e) => handleFilterChange('userId', e.target.value)}
                    className="filters__select"
                  >
                    <option value="all">Все сотрудники</option>
                    {employees.filter(emp => emp.role === 'Employee').map(employee => (
                      <option key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName}
                      </option>
                    ))}
                  </FormSelect>
                </Filters.Group>
              )}

              <Filters.Group>
                <Filters.Label htmlFor="periodFilter">Вид:</Filters.Label>
                <FormSelect
                  id="periodFilter"
                  value={view}
                  onChange={(e) => handleViewChange(e.target.value as 'week' | 'month')}
                  className="filters__select"
                >
                  <option value="week">Неделя</option>
                  <option value="month">Месяц</option>
                </FormSelect>
              </Filters.Group>

              <Filters.Group>
                <Filters.Label htmlFor="startDateInput">От:</Filters.Label>
                <FormInput
                  type="date"
                  id="startDateInput"
                  value={filters.startDate || ''}
                  onChange={(e) => handleDateRangeChange(e.target.value, filters.endDate || '')}
                  style={{minWidth: '150px'}}
                />
              </Filters.Group>

              <Filters.Group>
                <Filters.Label htmlFor="endDateInput">До:</Filters.Label>
                <FormInput
                  type="date"
                  id="endDateInput"
                  value={filters.endDate || ''}
                  onChange={(e) => handleDateRangeChange(filters.startDate || '', e.target.value)}
                  style={{minWidth: '150px'}}
                />
              </Filters.Group>

              <Button
                variant="secondary"
                onClick={handleExport}
                title="Экспорт в Excel"
              >
                📊 Экспорт
              </Button>
            </Filters>
          </Card>

          {/* Summary Cards */}
          <StatCard.Grid>
            <StatCard
              value={statsLoading ? '...' : (stats?.totalPlanned || 0)}
              label="Дней запланировано"
              color="primary"
              id="totalPlanned"
            />
            <StatCard
              value={statsLoading ? '...' : (stats?.totalActual || 0)}
              label="Часов отработано"
              color="success"
              id="totalActual"
            />
            <StatCard
              value={statsLoading ? '...' : `${stats?.utilizationRate || 0}%`}
              label="Загруженность"
              color="warning"
              id="utilizationRate"
            />
            <StatCard
              value={statsLoading ? '...' : (stats?.activeEmployees || 0)}
              label="Активных сотрудников"
              color="secondary"
              id="activeEmployees"
            />
          </StatCard.Grid>

          {/* Main Workload Calendar */}
          <ErrorBoundary>
            <div className="workload-main-calendar">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                <h3 style={{margin: 0, color: 'var(--text-primary)'}}>
                  Календарь рабочей нагрузки
                </h3>
              </div>
              <UnifiedWorkloadCalendar
                onCellClick={handleWorkloadCellClick}
                onCreateWorkload={handleCreateWorkloadFromCalendar}
              />
            </div>
          </ErrorBoundary>
        </div>
      </main>

      {/* Modals */}
      <AddWorkloadPlanModal
        isOpen={modalState.type === 'add-plan'}
        onClose={closeModal}
        onSuccess={handleSuccess}
        defaultDate={modalState.data?.date || ''}
      />

      <EditWorkloadPlanModal
        isOpen={modalState.type === 'edit-plan'}
        onClose={closeModal}
        onSuccess={handleSuccess}
        plan={modalState.data?.plan || null}
      />

      <ConfirmDeleteWorkloadPlanModal
        isOpen={modalState.type === 'delete-plan'}
        onClose={closeModal}
        onSuccess={handleSuccess}
        plan={modalState.data?.plan || null}
      />

      <AddWorkloadActualModal
        isOpen={modalState.type === 'add-actual'}
        onClose={closeModal}
        onSuccess={handleSuccess}
        defaultDate={modalState.data?.date || ''}
      />

      <EditWorkloadActualModal
        isOpen={modalState.type === 'edit-actual'}
        onClose={closeModal}
        onSuccess={handleSuccess}
        actual={modalState.data?.actual || null}
      />

      <ConfirmDeleteWorkloadActualModal
        isOpen={modalState.type === 'delete-actual'}
        onClose={closeModal}
        onSuccess={handleSuccess}
        actual={modalState.data?.actual || null}
      />

      <WorkloadDetailsModal
        isOpen={modalState.type === 'workload-details'}
        onClose={closeModal}
        onSuccess={handleSuccess}
        date={modalState.data?.date || ''}
        workloads={modalState.data?.workloads || []}
        selectedEmployeeId={filters.userId}
      />
    </>
  );
}

export default Workload;