import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Modal from '../common/modal/modal';
import Button from '../common/button/button';
import FormInput from '../forms/form_input/form_input';
import FormSelect from '../forms/form_select/form_select';
import FormTextarea from '../forms/form_textarea/form_textarea';
import LoadingState from '../common/loading_state/loading_state';
import type { AppDispatch } from '../../store';
import type { UnifiedWorkload, User, Project, WorkloadPlan, WorkloadActual } from '../../store/types';
import {
  selectWorkloadEmployees,
  selectWorkloadProjects,
  selectWorkloadPlanLoading,
  selectWorkloadActualLoading,
  createWorkloadPlan,
  updateWorkloadPlan,
  deleteWorkloadPlan,
  createWorkloadActual,
  updateWorkloadActual,
  deleteWorkloadActual,
  fetchWorkloadPlanById,
  fetchWorkloadActualById
} from '../../store/slices/workload_slice';
import { workloadService } from '../../services/workload';

interface WorkloadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  date: string;
  workloads: UnifiedWorkload[];
  selectedEmployeeId?: string | null;
  userRole?: 'admin' | 'manager' | 'employee';
}

interface WorkloadFormData {
  userId: string;
  projectId: string;
  date: string;
  description?: string;
  hoursWorked?: number;
  userText?: string;
}

type ModalMode = 'view' | 'create-plan' | 'edit-plan' | 'create-actual' | 'edit-actual';

function WorkloadDetailModal({
  isOpen,
  onClose,
  onSuccess,
  date,
  workloads,
  selectedEmployeeId,
  userRole = 'employee'
}: WorkloadDetailModalProps): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const employees = useSelector(selectWorkloadEmployees);
  const projects = useSelector(selectWorkloadProjects);
  const planLoading = useSelector(selectWorkloadPlanLoading);
  const actualLoading = useSelector(selectWorkloadActualLoading);

  // Local state
  const [mode, setMode] = useState<ModalMode>('view');
  const [selectedWorkload, setSelectedWorkload] = useState<UnifiedWorkload | null>(null);
  const [formData, setFormData] = useState<WorkloadFormData>({
    userId: selectedEmployeeId || '',
    projectId: '',
    date: date,
    description: '',
    hoursWorked: 0,
    userText: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Check if user can edit
  const canEdit = useMemo(() => {
    return userRole === 'admin' || userRole === 'manager';
  }, [userRole]);

  // Check if date is in the past
  const isPastDate = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return date < today;
  }, [date]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setMode('view');
      setSelectedWorkload(null);
      setFormData({
        userId: selectedEmployeeId || '',
        projectId: '',
        date: date,
        description: '',
        hoursWorked: 0,
        userText: ''
      });
      setShowDeleteConfirm(null);
    }
  }, [isOpen, date, selectedEmployeeId]);

  // Handle form input changes
  const handleInputChange = (field: keyof WorkloadFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle workload selection for editing
  const handleEditWorkload = async (workload: UnifiedWorkload, type: 'plan' | 'actual') => {
    try {
      setSelectedWorkload(workload);

      if (type === 'plan' && workload.planId) {
        const plan = await dispatch(fetchWorkloadPlanById(workload.planId)).unwrap();
        setFormData({
          userId: plan.userId,
          projectId: plan.projectId,
          date: plan.date.split('T')[0],
          description: plan.description || ''
        });
        setMode('edit-plan');
      } else if (type === 'actual' && workload.actualId) {
        const actual = await dispatch(fetchWorkloadActualById(workload.actualId)).unwrap();
        setFormData({
          userId: actual.userId,
          projectId: actual.projectId,
          date: actual.date.split('T')[0],
          hoursWorked: actual.hoursWorked,
          userText: actual.userText || ''
        });
        setMode('edit-actual');
      }
    } catch (error) {
      toast.error('Ошибка при загрузке данных');
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (mode === 'create-plan') {
        await dispatch(createWorkloadPlan({
          userId: formData.userId,
          projectId: formData.projectId,
          date: formData.date,
          description: formData.description
        })).unwrap();
        toast.success('План создан');
      } else if (mode === 'edit-plan' && selectedWorkload?.planId) {
        await dispatch(updateWorkloadPlan({
          id: selectedWorkload.planId,
          data: {
            userId: formData.userId,
            projectId: formData.projectId,
            date: formData.date,
            description: formData.description
          }
        })).unwrap();
        toast.success('План обновлен');
      } else if (mode === 'create-actual') {
        await dispatch(createWorkloadActual({
          userId: formData.userId,
          projectId: formData.projectId,
          date: formData.date,
          hoursWorked: formData.hoursWorked || 0,
          userText: formData.userText
        })).unwrap();
        toast.success('Время добавлено');
      } else if (mode === 'edit-actual' && selectedWorkload?.actualId) {
        await dispatch(updateWorkloadActual({
          id: selectedWorkload.actualId,
          data: {
            userId: formData.userId,
            projectId: formData.projectId,
            date: formData.date,
            hoursWorked: formData.hoursWorked || 0,
            userText: formData.userText
          }
        })).unwrap();
        toast.success('Время обновлено');
      }

      onSuccess?.();
      setMode('view');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при сохранении');
    }
  };

  // Handle delete
  const handleDelete = async (workload: UnifiedWorkload, type: 'plan' | 'actual') => {
    try {
      if (type === 'plan' && workload.planId) {
        await dispatch(deleteWorkloadPlan(workload.planId)).unwrap();
        toast.success('План удален');
      } else if (type === 'actual' && workload.actualId) {
        await dispatch(deleteWorkloadActual(workload.actualId)).unwrap();
        toast.success('Время удалено');
      }

      onSuccess?.();
      setShowDeleteConfirm(null);
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при удалении');
    }
  };

  // Get employee name
  const getEmployeeName = (userId: string): string => {
    const employee = employees.find(emp => emp.id === userId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';
  };

  // Get project name
  const getProjectName = (projectId: string): string => {
    const project = projects.find(proj => proj.id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  // Format date for display
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Render workload item in view mode
  const renderWorkloadItem = (workload: UnifiedWorkload) => {
    const status = workloadService.getWorkloadStatus(workload);
    const statusLabel = workloadService.getWorkloadStatusLabel(status);

    return (
      <motion.div
        key={`${workload.userId}-${workload.projectId}`}
        className="workload-detail-modal__item"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="workload-detail-modal__item-header">
          <div className="workload-detail-modal__item-info">
            <h4 className="workload-detail-modal__employee-name">
              {getEmployeeName(workload.userId)}
            </h4>
            <p className="workload-detail-modal__project-name">
              {getProjectName(workload.projectId)}
            </p>
          </div>
          <div className={`workload-detail-modal__status workload-detail-modal__status--${status}`}>
            {statusLabel}
          </div>
        </div>

        <div className="workload-detail-modal__item-content">
          {/* Plan Information */}
          {workload.planId && (
            <div className="workload-detail-modal__plan-section">
              <div className="workload-detail-modal__section-header">
                <span className="workload-detail-modal__section-title">📋 План</span>
                {canEdit && !isPastDate && (
                  <div className="workload-detail-modal__section-actions">
                    <button
                      className="workload-detail-modal__action-btn workload-detail-modal__action-btn--edit"
                      onClick={() => handleEditWorkload(workload, 'plan')}
                      title="Редактировать план"
                    >
                      ✏️
                    </button>
                    <button
                      className="workload-detail-modal__action-btn workload-detail-modal__action-btn--delete"
                      onClick={() => setShowDeleteConfirm(`plan-${workload.planId}`)}
                      title="Удалить план"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
              {workload.description && (
                <p className="workload-detail-modal__description">
                  {workload.description}
                </p>
              )}
            </div>
          )}

          {/* Actual Information */}
          {workload.actualId && (
            <div className="workload-detail-modal__actual-section">
              <div className="workload-detail-modal__section-header">
                <span className="workload-detail-modal__section-title">
                  ✅ Фактически ({workloadService.formatHours(workload.hoursWorked || 0)})
                </span>
                {canEdit && !isPastDate && (
                  <div className="workload-detail-modal__section-actions">
                    <button
                      className="workload-detail-modal__action-btn workload-detail-modal__action-btn--edit"
                      onClick={() => handleEditWorkload(workload, 'actual')}
                      title="Редактировать время"
                    >
                      ✏️
                    </button>
                    <button
                      className="workload-detail-modal__action-btn workload-detail-modal__action-btn--delete"
                      onClick={() => setShowDeleteConfirm(`actual-${workload.actualId}`)}
                      title="Удалить время"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
              {workload.userText && (
                <p className="workload-detail-modal__user-text">
                  {workload.userText}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Delete Confirmation */}
        <AnimatePresence>
          {showDeleteConfirm === `plan-${workload.planId}` && (
            <motion.div
              className="workload-detail-modal__confirm-delete"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <p>Удалить план?</p>
              <div className="workload-detail-modal__confirm-actions">
                <Button
                  variant="danger"
                  size="small"
                  onClick={() => handleDelete(workload, 'plan')}
                  disabled={planLoading}
                >
                  Удалить
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Отмена
                </Button>
              </div>
            </motion.div>
          )}
          {showDeleteConfirm === `actual-${workload.actualId}` && (
            <motion.div
              className="workload-detail-modal__confirm-delete"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <p>Удалить время?</p>
              <div className="workload-detail-modal__confirm-actions">
                <Button
                  variant="danger"
                  size="small"
                  onClick={() => handleDelete(workload, 'actual')}
                  disabled={actualLoading}
                >
                  Удалить
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Отмена
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Render form for creating/editing
  const renderForm = () => {
    const isActualForm = mode === 'create-actual' || mode === 'edit-actual';
    const isLoading = isActualForm ? actualLoading : planLoading;

    return (
      <form
        className="workload-detail-modal__form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {/* Employee Selection */}
        <div className="workload-detail-modal__form-group">
          <label className="workload-detail-modal__form-label">
            Сотрудник:
          </label>
          <FormSelect
            value={formData.userId}
            onChange={(e) => handleInputChange('userId', e.target.value)}
            required
            disabled={!!selectedEmployeeId || isLoading}
          >
            <option value="">Выберите сотрудника</option>
            {employees.map(employee => (
              <option key={employee.id} value={employee.id}>
                {employee.firstName} {employee.lastName}
              </option>
            ))}
          </FormSelect>
        </div>

        {/* Project Selection */}
        <div className="workload-detail-modal__form-group">
          <label className="workload-detail-modal__form-label">
            Проект:
          </label>
          <FormSelect
            value={formData.projectId}
            onChange={(e) => handleInputChange('projectId', e.target.value)}
            required
            disabled={isLoading}
          >
            <option value="">Выберите проект</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </FormSelect>
        </div>

        {/* Date */}
        <div className="workload-detail-modal__form-group">
          <label className="workload-detail-modal__form-label">
            Дата:
          </label>
          <FormInput
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        {/* Plan Description or Actual Hours/Text */}
        {isActualForm ? (
          <>
            <div className="workload-detail-modal__form-group">
              <label className="workload-detail-modal__form-label">
                Часы работы:
              </label>
              <FormInput
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={formData.hoursWorked?.toString() || ''}
                onChange={(e) => handleInputChange('hoursWorked', parseFloat(e.target.value) || 0)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="workload-detail-modal__form-group">
              <label className="workload-detail-modal__form-label">
                Описание работы:
              </label>
              <FormTextarea
                value={formData.userText || ''}
                onChange={(e) => handleInputChange('userText', e.target.value)}
                placeholder="Опишите выполненную работу..."
                rows={3}
                disabled={isLoading}
              />
            </div>
          </>
        ) : (
          <div className="workload-detail-modal__form-group">
            <label className="workload-detail-modal__form-label">
              Описание плана:
            </label>
            <FormTextarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Опишите планируемую работу..."
              rows={3}
              disabled={isLoading}
            />
          </div>
        )}

        {/* Form Actions */}
        <div className="workload-detail-modal__form-actions">
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || !formData.userId || !formData.projectId}
          >
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setMode('view')}
            disabled={isLoading}
          >
            Отмена
          </Button>
        </div>
      </form>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Рабочая нагрузка - ${formatDate(date)}`}
      size="large"
    >
      <div className="workload-detail-modal">
        {/* Header Actions */}
        {mode === 'view' && canEdit && !isPastDate && (
          <div className="workload-detail-modal__header-actions">
            <Button
              variant="primary"
              size="small"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  userId: selectedEmployeeId || '',
                  projectId: '',
                  date: date
                }));
                setMode('create-plan');
              }}
            >
              + Добавить план
            </Button>
            <Button
              variant="success"
              size="small"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  userId: selectedEmployeeId || '',
                  projectId: '',
                  date: date,
                  hoursWorked: 0,
                  userText: ''
                }));
                setMode('create-actual');
              }}
            >
              + Добавить время
            </Button>
          </div>
        )}

        {/* Date Restriction Notice */}
        {isPastDate && (
          <div className="workload-detail-modal__notice workload-detail-modal__notice--warning">
            <span>📅</span>
            <p>Эта дата в прошлом. Редактирование ограничено.</p>
          </div>
        )}

        {/* Content */}
        <div className="workload-detail-modal__content">
          {mode === 'view' ? (
            <div className="workload-detail-modal__view">
              {workloads.length > 0 ? (
                <div className="workload-detail-modal__workloads">
                  <AnimatePresence>
                    {workloads.map(renderWorkloadItem)}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="workload-detail-modal__empty">
                  <div className="workload-detail-modal__empty-icon">📅</div>
                  <h3>Нет запланированных работ</h3>
                  <p>На эту дату нет планов или отчетов о работе.</p>
                  {canEdit && !isPastDate && (
                    <div className="workload-detail-modal__empty-actions">
                      <Button
                        variant="primary"
                        onClick={() => setMode('create-plan')}
                      >
                        Добавить план
                      </Button>
                      <Button
                        variant="success"
                        onClick={() => setMode('create-actual')}
                      >
                        Добавить время
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="workload-detail-modal__form-container">
              <h3 className="workload-detail-modal__form-title">
                {mode === 'create-plan' && 'Добавить план'}
                {mode === 'edit-plan' && 'Редактировать план'}
                {mode === 'create-actual' && 'Добавить время'}
                {mode === 'edit-actual' && 'Редактировать время'}
              </h3>
              {renderForm()}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default WorkloadDetailModal;