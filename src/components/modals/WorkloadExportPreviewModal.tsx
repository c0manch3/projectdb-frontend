import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Modal from '../common/modal/modal';
import Button from '../common/button/button';
import FormSelect from '../forms/form_select/form_select';
import {
  workloadExportService,
  ExportData,
  ExportFormat,
  ExportRow
} from '../../services/workload_export';
import type { AppRootState } from '../../store';
import type { UnifiedWorkload } from '../../store/types';

interface WorkloadExportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function WorkloadExportPreviewModal({
  isOpen,
  onClose
}: WorkloadExportPreviewModalProps): JSX.Element {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all');

  // Get data from Redux store
  const workloads = useSelector((state: AppRootState) => state.workload.unified);
  const employees = useSelector((state: AppRootState) => state.workload.employees);
  const projects = useSelector((state: AppRootState) => state.workload.projects);
  const filters = useSelector((state: AppRootState) => state.workload.filters);
  const currentUser = useSelector((state: AppRootState) => state.auth.user);

  // Filter workloads based on selected employee
  const filteredWorkloads = useMemo(() => {
    if (selectedEmployeeId === 'all') {
      return workloads;
    }
    return workloads.filter(w => w.userId === selectedEmployeeId);
  }, [workloads, selectedEmployeeId]);

  // Prepare export data
  const exportData: ExportData = useMemo(() => ({
    workloads: filteredWorkloads,
    employees,
    projects,
    filters: {
      ...filters,
      userId: selectedEmployeeId === 'all' ? undefined : selectedEmployeeId
    }
  }), [filteredWorkloads, employees, projects, filters, selectedEmployeeId]);

  // Prepare preview rows
  const previewRows: ExportRow[] = useMemo(() => {
    return workloadExportService.prepareExportData(exportData);
  }, [exportData]);

  // Calculate summary
  const summary = useMemo(() => {
    return workloadExportService.calculateSummary(exportData);
  }, [exportData]);

  // Handle export
  const handleExport = async () => {
    if (previewRows.length === 0) {
      toast.error('Нет данных для экспорта');
      return;
    }

    setIsExporting(true);

    try {
      if (selectedFormat === 'pdf') {
        workloadExportService.exportToPDF(exportData);
        toast.success('PDF файл успешно сформирован');
      } else if (selectedFormat === 'google-sheets') {
        workloadExportService.exportToGoogleSheets(exportData);
        toast.success('CSV файл готов для импорта в Google Таблицы');

        // Show instructions
        const instructions = workloadExportService.getGoogleSheetsInstructions();
        setTimeout(() => {
          toast(instructions, {
            duration: 10000,
            icon: 'ℹ️',
          });
        }, 1000);
      }

      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Ошибка при экспорте данных');
    } finally {
      setIsExporting(false);
    }
  };

  // Reset state on modal open
  useEffect(() => {
    if (isOpen) {
      setSelectedFormat('pdf');
      // Set initial employee filter based on page filters or current user
      if (filters.userId) {
        setSelectedEmployeeId(filters.userId);
      } else if (currentUser?.role === 'Employee') {
        setSelectedEmployeeId(currentUser.id);
      } else {
        setSelectedEmployeeId('all');
      }
    }
  }, [isOpen, filters.userId, currentUser]);

  // Show employee filter only if user can see all employees (not Employee role)
  const showEmployeeFilter = currentUser?.role !== 'Employee';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Предварительный просмотр экспорта"
      size="xlarge"
    >
      <div className="export-preview-modal">
        {/* Employee Filter Section (only for Admin/Manager) */}
        {showEmployeeFilter && (
          <div className="export-preview-modal__filter">
            <h3 className="export-preview-modal__filter-title">Фильтр по сотруднику</h3>
            <FormSelect
              id="exportEmployeeFilter"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="export-preview-modal__filter-select"
            >
              <option value="all">Все сотрудники</option>
              {employees.filter(emp => emp.role === 'Employee').map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName}
                </option>
              ))}
            </FormSelect>
          </div>
        )}

        {/* Summary Section */}
        <div className="export-preview-modal__summary">
          <h3 className="export-preview-modal__summary-title">Сводка</h3>
          <div className="export-preview-modal__summary-grid">
            <div className="export-preview-modal__summary-item">
              <span className="export-preview-modal__summary-label">Всего записей:</span>
              <span className="export-preview-modal__summary-value">{summary.totalWorkloads}</span>
            </div>
            <div className="export-preview-modal__summary-item">
              <span className="export-preview-modal__summary-label">Запланировано:</span>
              <span className="export-preview-modal__summary-value">{summary.totalPlanned}</span>
            </div>
            <div className="export-preview-modal__summary-item">
              <span className="export-preview-modal__summary-label">Выполнено:</span>
              <span className="export-preview-modal__summary-value">{summary.totalCompleted}</span>
            </div>
            <div className="export-preview-modal__summary-item">
              <span className="export-preview-modal__summary-label">Не отчитались:</span>
              <span className="export-preview-modal__summary-value">{summary.totalMissing}</span>
            </div>
            <div className="export-preview-modal__summary-item">
              <span className="export-preview-modal__summary-label">Всего часов:</span>
              <span className="export-preview-modal__summary-value">{summary.totalHours}</span>
            </div>
            <div className="export-preview-modal__summary-item">
              <span className="export-preview-modal__summary-label">Сотрудников:</span>
              <span className="export-preview-modal__summary-value">{summary.uniqueEmployees}</span>
            </div>
            <div className="export-preview-modal__summary-item">
              <span className="export-preview-modal__summary-label">Проектов:</span>
              <span className="export-preview-modal__summary-value">{summary.uniqueProjects}</span>
            </div>
          </div>
        </div>

        {/* Format Selection */}
        <div className="export-preview-modal__format">
          <h3 className="export-preview-modal__format-title">Формат экспорта</h3>
          <div className="export-preview-modal__format-options">
            <label className="export-preview-modal__format-option">
              <input
                type="radio"
                name="exportFormat"
                value="pdf"
                checked={selectedFormat === 'pdf'}
                onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
              />
              <div className="export-preview-modal__format-option-content">
                <span className="export-preview-modal__format-option-icon">📄</span>
                <div>
                  <div className="export-preview-modal__format-option-name">PDF</div>
                  <div className="export-preview-modal__format-option-desc">
                    Готовый документ для печати или отправки
                  </div>
                </div>
              </div>
            </label>

            <label className="export-preview-modal__format-option">
              <input
                type="radio"
                name="exportFormat"
                value="google-sheets"
                checked={selectedFormat === 'google-sheets'}
                onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
              />
              <div className="export-preview-modal__format-option-content">
                <span className="export-preview-modal__format-option-icon">📊</span>
                <div>
                  <div className="export-preview-modal__format-option-name">Google Таблицы</div>
                  <div className="export-preview-modal__format-option-desc">
                    CSV файл для импорта в Google Sheets
                  </div>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Preview Table */}
        <div className="export-preview-modal__preview">
          <h3 className="export-preview-modal__preview-title">
            Предварительный просмотр данных ({previewRows.length} записей)
          </h3>

          {previewRows.length === 0 ? (
            <div className="export-preview-modal__empty">
              <p>Нет данных для экспорта</p>
              <p className="export-preview-modal__empty-hint">
                Попробуйте изменить фильтры на странице загруженности
              </p>
            </div>
          ) : (
            <div className="export-preview-modal__table-wrapper">
              <table className="export-preview-modal__table">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Сотрудник</th>
                    <th>Проект</th>
                    <th>Статус</th>
                    <th>Часы</th>
                    <th>Описание работы</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.slice(0, 10).map((row, index) => (
                    <tr key={index}>
                      <td>{row.date}</td>
                      <td>{row.employeeName}</td>
                      <td>{row.projectName}</td>
                      <td>
                        <span className={`export-preview-modal__status export-preview-modal__status--${getStatusClass(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                      <td>{row.hoursWorked}</td>
                      <td className="export-preview-modal__text-cell">
                        {row.userText.length > 50
                          ? `${row.userText.substring(0, 50)}...`
                          : row.userText
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {previewRows.length > 10 && (
                <div className="export-preview-modal__table-note">
                  Показаны первые 10 записей из {previewRows.length}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="export-preview-modal__actions">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isExporting}
          >
            Отмена
          </Button>
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={isExporting || previewRows.length === 0}
          >
            {isExporting ? 'Экспортирую...' : 'Экспортировать'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Helper function to get status CSS class
function getStatusClass(status: string): string {
  switch (status) {
    case 'Запланировано':
      return 'planned';
    case 'Выполнено':
      return 'completed';
    case 'Не отчитался':
      return 'missing';
    case 'Сверхурочно':
      return 'overtime';
    default:
      return '';
  }
}

export default WorkloadExportPreviewModal;
