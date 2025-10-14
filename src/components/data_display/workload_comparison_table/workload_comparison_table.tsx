import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingState from '../../common/loading_state/loading_state';
import EmptyState from '../../common/empty_state/empty_state';
import Table from '../table/table';
import {
  selectUnifiedWorkload,
  selectWorkloadUnifiedLoading,
  selectWorkloadEmployees,
  selectWorkloadProjects
} from '../../../store/slices/workload_slice';
import type { UnifiedWorkload } from '../../../store/types';
import { workloadService } from '../../../services/workload';

interface WorkloadComparisonTableProps {
  onViewDetails?: (workload: UnifiedWorkload) => void;
}

interface ComparisonRow {
  key: string;
  userId: string;
  userName: string;
  projectId: string;
  projectName: string;
  plannedDays: number;
  actualHours: number;
  averageHours: number;
  completionRate: number;
  utilizationStatus: 'low' | 'normal' | 'high' | 'over';
  workloads: UnifiedWorkload[];
}

function WorkloadComparisonTable({
  onViewDetails
}: WorkloadComparisonTableProps): JSX.Element {
  // Redux state
  const unified = useSelector(selectUnifiedWorkload);
  const loading = useSelector(selectWorkloadUnifiedLoading);
  const employees = useSelector(selectWorkloadEmployees);
  const projects = useSelector(selectWorkloadProjects);

  // Process data for comparison table
  const comparisonRows = useMemo(() => {
    const rows: ComparisonRow[] = [];

    // Group workloads by user and project
    const groupedWorkloads = unified.reduce((acc, workload) => {
      const key = `${workload.userId}-${workload.projectId}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(workload);
      return acc;
    }, {} as Record<string, UnifiedWorkload[]>);

    // Process each group
    Object.entries(groupedWorkloads).forEach(([key, workloads]) => {
      const firstWorkload = workloads[0];
      const employee = employees.find(emp => emp.id === firstWorkload.userId);
      const project = projects.find(proj => proj.id === firstWorkload.projectId);

      if (!employee || !project) return;

      const plannedDays = workloads.filter(w => w.planId).length;
      const actualHours = workloads.reduce((sum, w) => sum + (w.hoursWorked || 0), 0);
      const actualDays = workloads.filter(w => w.actualId).length;
      const averageHours = actualDays > 0 ? actualHours / actualDays : 0;
      const completionRate = plannedDays > 0 ? (actualDays / plannedDays) * 100 : 0;

      // Determine utilization status
      let utilizationStatus: ComparisonRow['utilizationStatus'] = 'normal';
      if (completionRate === 0) {
        utilizationStatus = 'low';
      } else if (completionRate < 80) {
        utilizationStatus = 'low';
      } else if (completionRate > 120) {
        utilizationStatus = 'over';
      } else if (completionRate > 100) {
        utilizationStatus = 'high';
      }

      rows.push({
        key,
        userId: firstWorkload.userId,
        userName: `${employee.firstName} ${employee.lastName}`,
        projectId: firstWorkload.projectId,
        projectName: project.name,
        plannedDays,
        actualHours,
        averageHours,
        completionRate,
        utilizationStatus,
        workloads
      });
    });

    // Sort by completion rate (ascending - problematic first)
    return rows.sort((a, b) => a.completionRate - b.completionRate);
  }, [unified, employees, projects]);

  // Get utilization status color and label
  const getUtilizationInfo = (status: ComparisonRow['utilizationStatus']) => {
    switch (status) {
      case 'low':
        return { color: 'danger', label: 'Низкая', emoji: '🔴' };
      case 'normal':
        return { color: 'success', label: 'Нормальная', emoji: '🟢' };
      case 'high':
        return { color: 'warning', label: 'Высокая', emoji: '🟡' };
      case 'over':
        return { color: 'info', label: 'Переработка', emoji: '🔵' };
      default:
        return { color: 'secondary', label: 'Неизвестно', emoji: '⚪' };
    }
  };

  // Format completion rate
  const formatCompletionRate = (rate: number): string => {
    if (rate === 0) return '0%';
    return `${Math.round(rate)}%`;
  };

  // Handle row click
  const handleRowClick = (row: ComparisonRow) => {
    // Show the first workload for details
    if (row.workloads.length > 0 && onViewDetails) {
      onViewDetails(row.workloads[0]);
    }
  };

  return (
    <div className="workload-comparison-table">
      {/* Loading State */}
      {loading && <LoadingState message="Загрузка данных сравнения..." />}

      {/* Table */}
      {!loading && comparisonRows.length > 0 && (
        <div className="table-container">
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.Header>Сотрудник</Table.Header>
                <Table.Header>Проект</Table.Header>
                <Table.Header align="center">План (дн)</Table.Header>
                <Table.Header align="center">Факт (ч)</Table.Header>
                <Table.Header align="center">Среднее (ч/день)</Table.Header>
                <Table.Header align="center">Выполнение</Table.Header>
                <Table.Header align="center">Загруженность</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              <AnimatePresence>
                {comparisonRows.map((row, index) => {
                  const utilizationInfo = getUtilizationInfo(row.utilizationStatus);

                  return (
                    <motion.tr
                      key={row.key}
                      className="table__row table__row--clickable"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      onClick={() => handleRowClick(row)}
                    >
                      <Table.Cell>
                        <div className="employee-info">
                          <span className="employee-info__name">{row.userName}</span>
                          <span className="employee-info__id">ID: {row.userId.slice(-8)}</span>
                        </div>
                      </Table.Cell>

                      <Table.Cell>
                        <div className="project-info">
                          <span className="project-info__name">{row.projectName}</span>
                          <span className="project-info__records">
                            {row.workloads.length} записей
                          </span>
                        </div>
                      </Table.Cell>

                      <Table.Cell align="center">
                        <span className="stat-value stat-value--planned">
                          {row.plannedDays}
                        </span>
                      </Table.Cell>

                      <Table.Cell align="center">
                        <span className="stat-value stat-value--actual">
                          {workloadService.formatHours(row.actualHours)}
                        </span>
                      </Table.Cell>

                      <Table.Cell align="center">
                        <span className="stat-value stat-value--average">
                          {row.averageHours > 0 ? workloadService.formatHours(row.averageHours) : '—'}
                        </span>
                      </Table.Cell>

                      <Table.Cell align="center">
                        <div className={`completion-rate completion-rate--${row.utilizationStatus}`}>
                          <span className="completion-rate__value">
                            {formatCompletionRate(row.completionRate)}
                          </span>
                          <div className="completion-rate__bar">
                            <div
                              className="completion-rate__fill"
                              style={{ width: `${Math.min(row.completionRate, 100)}%` }}
                            />
                          </div>
                        </div>
                      </Table.Cell>

                      <Table.Cell align="center">
                        <div className={`utilization-status utilization-status--${utilizationInfo.color}`}>
                          <span className="utilization-status__emoji">
                            {utilizationInfo.emoji}
                          </span>
                          <span className="utilization-status__label">
                            {utilizationInfo.label}
                          </span>
                        </div>
                      </Table.Cell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </Table.Body>
          </Table>
        </div>
      )}

      {/* Empty State */}
      {!loading && comparisonRows.length === 0 && (
        <EmptyState
          icon="📊"
          title="Нет данных для сравнения"
          description="Создайте планы и добавьте отработанное время для просмотра сравнительной статистики"
        />
      )}

      {/* Summary Statistics */}
      {!loading && comparisonRows.length > 0 && (
        <div className="workload-comparison-summary">
          <h4 className="workload-comparison-summary__title">Общая статистика</h4>
          <div className="workload-comparison-summary__stats">
            <div className="summary-stat">
              <span className="summary-stat__label">Всего записей:</span>
              <span className="summary-stat__value">{comparisonRows.length}</span>
            </div>
            <div className="summary-stat">
              <span className="summary-stat__label">Общий план:</span>
              <span className="summary-stat__value">
                {comparisonRows.reduce((sum, row) => sum + row.plannedDays, 0)} дн
              </span>
            </div>
            <div className="summary-stat">
              <span className="summary-stat__label">Общий факт:</span>
              <span className="summary-stat__value">
                {workloadService.formatHours(
                  comparisonRows.reduce((sum, row) => sum + row.actualHours, 0)
                )}
              </span>
            </div>
            <div className="summary-stat">
              <span className="summary-stat__label">Средняя загруженность:</span>
              <span className="summary-stat__value">
                {comparisonRows.length > 0
                  ? formatCompletionRate(
                      comparisonRows.reduce((sum, row) => sum + row.completionRate, 0) /
                      comparisonRows.length
                    )
                  : '0%'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkloadComparisonTable;