import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Modal from '../common/modal/modal';
import Button from '../common/button/button';
import FormGroup from '../forms/form_group/form_group';
import FormInput from '../forms/form_input/form_input';
import FormSelect from '../forms/form_select/form_select';
import FormTextarea from '../forms/form_textarea/form_textarea';
import LoadingState from '../common/loading_state/loading_state';
import type { AppDispatch } from '../../store';
import {
  selectWorkloadEmployees,
  selectWorkloadProjects,
  fetchWorkloadEmployees,
  fetchWorkloadProjects
} from '../../store/slices/workload_slice';
import {
  selectCurrentUser
} from '../../store/slices/auth_slice';
import type { UnifiedWorkload, WorkloadPlan, WorkloadActual } from '../../store/types';
import { workloadService } from '../../services/workload';

interface WorkloadDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  date: string;
  workloads: UnifiedWorkload[];
  selectedEmployeeId?: string;
}

interface WorkloadFormData {
  userId: string;
  projectId: string;
  date: string;
  hoursWorked: number;
  userText: string;
}

function WorkloadDetailsModal({
  isOpen,
  onClose,
  onSuccess,
  date,
  workloads,
  selectedEmployeeId
}: WorkloadDetailsModalProps): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const employees = useSelector(selectWorkloadEmployees);
  const projects = useSelector(selectWorkloadProjects);
  const currentUser = useSelector(selectCurrentUser);

  // Local state
  const [mode, setMode] = useState<'view' | 'edit' | 'create' | 'create-plan'>('view');
  const [loading, setLoading] = useState(false);
  const [selectedWorkload, setSelectedWorkload] = useState<UnifiedWorkload | null>(null);
  const [formData, setFormData] = useState<WorkloadFormData>({
    userId: selectedEmployeeId || currentUser?.id || '',
    projectId: '',
    date: date,
    hoursWorked: 8,
    userText: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Determine if we're in single-employee mode
  const isSingleEmployeeMode = !!selectedEmployeeId;

  // Date object for display and validation
  const dateObj = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
  dateObj.setHours(0, 0, 0, 0);

  const isPast = dateObj < today;
  const isPastOrToday = dateObj <= today; // Plans can only be created/edited/deleted for future dates
  const isManager = currentUser?.role === 'Manager';
  const currentUserId = currentUser?.id;

  // Role-based permissions
  const canEdit = isManager || (!isPast && workloads.some(w => w.userId === currentUserId));
  const canCreate = !isPast && currentUser; // Authenticated users can create workload
  const canCreatePlan = isManager && !isPastOrToday; // Only Manager can create plans
  const canEditOtherUsers = isManager;
  const canDeleteWorkload = isManager || workloads.some(w => w.userId === currentUserId && !isPast);

  // Load employees and projects when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchWorkloadEmployees());
      // Load all projects without filtering
      dispatch(fetchWorkloadProjects());
    }
  }, [isOpen, dispatch]);

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      // If no workloads and user is Manager, go to create-plan mode
      // Otherwise, just show view mode
      const initialMode = workloads.length === 0 && currentUser?.role === 'Manager' && !isPastOrToday
        ? 'create-plan'
        : 'view';
      setMode(initialMode);
      setSelectedWorkload(null);
      setFormData({
        userId: selectedEmployeeId || currentUser?.id || '',
        projectId: '',
        date: date,
        hoursWorked: 8,
        userText: ''
      });
      setErrors({});
    }
  }, [isOpen, date, currentUser?.id, currentUser?.role, workloads.length, selectedEmployeeId, isPastOrToday]);

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

  // Get workload status
  const getWorkloadStatus = (workload: UnifiedWorkload) => {
    return workloadService.getWorkloadStatus(workload);
  };

  // Get workload status label
  const getWorkloadStatusLabel = (workload: UnifiedWorkload) => {
    return workloadService.getWorkloadStatusLabel(getWorkloadStatus(workload));
  };

  // Handle form input changes
  const handleInputChange = (field: keyof WorkloadFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.userId) {
      newErrors.userId = 'Выберите сотрудника';
    }

    if (!formData.projectId) {
      newErrors.projectId = 'Выберите проект';
    }

    if (formData.hoursWorked <= 0 || formData.hoursWorked > 24) {
      newErrors.hoursWorked = 'Количество часов должно быть от 0.1 до 24';
    }

    if (mode === 'create' && formData.userText.length < 10) {
      newErrors.userText = 'Описание работы должно содержать минимум 10 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle create workload
  const handleCreateWorkload = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await workloadService.createWorkloadActual({
        userId: formData.userId,
        projectId: formData.projectId,
        date: formData.date,
        hoursWorked: formData.hoursWorked,
        userText: formData.userText
      });

      toast.success('Рабочее время успешно добавлено');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при создании записи');
    } finally {
      setLoading(false);
    }
  };

  // Handle create plan
  const handleCreatePlan = async () => {
    if (!formData.userId || !formData.projectId) {
      toast.error('Выберите сотрудника и проект');
      return;
    }

    // Check if trying to create plan for today or past
    if (isPastOrToday) {
      toast.error('Планы можно создавать только на будущие дни');
      return;
    }

    setLoading(true);
    try {
      await workloadService.createWorkloadPlan({
        userId: formData.userId,
        projectId: formData.projectId,
        date: formData.date
      });

      toast.success('План успешно создан');
      onSuccess();
      onClose();
    } catch (error: any) {
      // Check if error is about permissions
      const errorMessage = error.message || 'Ошибка при создании плана';
      if (errorMessage.includes('нет прав для создания планов')) {
        toast.error('У вас нет прав для создания плана по этому проекту. Вы можете создавать планы только для проектов, которые ведёте.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle edit workload
  const handleEditWorkload = async (workload: UnifiedWorkload) => {
    if (!workload.actualId) return;

    setLoading(true);
    try {
      await workloadService.updateWorkloadActual(workload.actualId, {
        hoursWorked: formData.hoursWorked,
        userText: formData.userText
      });

      toast.success('Рабочее время успешно обновлено');
      onSuccess();
      setMode('view');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при обновлении записи');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete workload plan only
  const handleDeletePlan = async (workload: UnifiedWorkload) => {
    if (!workload.planId) {
      toast.error('У этого сотрудника нет плана для удаления');
      return;
    }

    if (!confirm(`Вы уверены, что хотите удалить план для ${getEmployeeName(workload.userId)}?`)) return;

    setLoading(true);
    try {
      await workloadService.deleteWorkloadPlan(workload.planId);
      toast.success('План успешно удален');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при удалении плана');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete workload
  const handleDeleteWorkload = async (workload: UnifiedWorkload) => {
    if (!confirm('Вы уверены, что хотите удалить эту запись?')) return;

    setLoading(true);
    try {
      if (workload.planId) {
        await workloadService.deleteWorkloadPlan(workload.planId);
      }
      if (workload.actualId) {
        await workloadService.deleteWorkloadActual(workload.actualId);
      }

      toast.success('Запись успешно удалена');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при удалении записи');
    } finally {
      setLoading(false);
    }
  };

  // Handle start editing
  const handleStartEdit = (workload: UnifiedWorkload) => {
    setSelectedWorkload(workload);
    setFormData({
      userId: workload.userId,
      projectId: workload.projectId,
      date: workload.date.split('T')[0],
      hoursWorked: workload.hoursWorked || 8,
      userText: workload.userText || ''
    });
    setMode('edit');
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Check if current user is the project owner
  const isProjectOwner = (projectId: string): boolean => {
    if (!currentUser || currentUser.role !== 'Manager') return false;
    const project = projects.find(p => p.id === projectId);
    return project?.managerId === currentUser.id;
  };

  // Filter projects for managers - show only their own projects
  const filteredProjects = currentUser?.role === 'Manager'
    ? projects.filter(project => project.managerId === currentUser.id)
    : projects;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'create'
          ? 'Добавить рабочее время'
          : mode === 'create-plan'
          ? 'Создать план'
          : mode === 'edit'
          ? 'Редактировать рабочее время'
          : `Рабочая нагрузка - ${formatDate(date)}`
      }
      size="large"
    >
      <div className="workload-details-modal">
        {loading && <LoadingState message="Обработка запроса..." />}

        {!loading && mode === 'view' && (
          <div className="workload-details-modal__view" style={{ padding: '1.5rem' }}>
            {workloads.length === 0 ? (
              <div className="workload-details-modal__empty">
                <div className="workload-details-modal__empty-icon">📅</div>
                <h3>Нет запланированной работы</h3>
                <p>На эту дату нет запланированной работы или отчетов о проделанной работе.</p>

                {/* Only Manager can create plans */}
                {canCreatePlan && (
                  <div className="workload-details-modal__empty-actions">
                    <Button
                      variant="primary"
                      onClick={() => setMode('create-plan')}
                    >
                      Создать план
                    </Button>
                  </div>
                )}
                {isPastOrToday && (
                  <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
                    Планы можно создавать только на будущие дни
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="workload-details-modal__workloads">
                  {workloads.map((workload, index) => (
                    <motion.div
                      key={index}
                      className={`workload-details-modal__workload workload-details-modal__workload--${getWorkloadStatus(workload)}`}
                      style={{
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="workload-details-modal__workload-header">
                        <div className="workload-details-modal__workload-info">
                          <h4>{getEmployeeName(workload.userId)}</h4>
                          {workload.projectId && !workload.projectWorkloadDistributions && (
                            <p>{getProjectName(workload.projectId)}</p>
                          )}
                        </div>
                      </div>

                      <div className="workload-details-modal__workload-content">
                        {workload.hoursWorked && (
                          <div className="workload-details-modal__workload-hours">
                            <strong>Всего отработано:</strong> {workloadService.formatHours(workload.hoursWorked)}
                          </div>
                        )}

                        {workload.userText && (
                          <div className="workload-details-modal__workload-text">
                            <strong>Общее описание дня:</strong>
                            <p>{workload.userText}</p>
                          </div>
                        )}

                        {/* Display project distributions if available */}
                        {workload.projectWorkloadDistributions && workload.projectWorkloadDistributions.length > 0 && (
                          <div className="workload-details-modal__distributions">
                            <strong>Распределение по проектам:</strong>
                            {workload.projectWorkloadDistributions.map((dist, distIndex) => (
                              <div key={distIndex} className="workload-details-modal__distribution-item" style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                <div className="workload-details-modal__distribution-header">
                                  <h5 style={{ margin: '0 0 0.5rem 0' }}>{dist.project?.name || getProjectName(dist.projectId)}</h5>
                                  <span style={{ color: 'var(--text-secondary)' }}>{workloadService.formatHours(dist.hours)}</span>
                                </div>
                                <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>{dist.description}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Only Manager who owns the project can delete plans */}
                      {isManager && workload.planId && !isPastOrToday && isProjectOwner(workload.projectId) && (
                        <div className="workload-details-modal__workload-actions">
                          <Button
                            variant="warning"
                            size="small"
                            onClick={() => handleDeletePlan(workload)}
                          >
                            Удалить из плана
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {!loading && (mode === 'create' || mode === 'edit' || mode === 'create-plan') && (
          <form className="form">
            {!isSingleEmployeeMode && (
              <FormGroup>
                <FormGroup.Label htmlFor="workloadEmployee" required>
                  Сотрудник
                </FormGroup.Label>
                <FormSelect
                  id="workloadEmployee"
                  value={formData.userId}
                  onChange={(e) => handleInputChange('userId', e.target.value)}
                  disabled={mode === 'edit' || (mode === 'create' && !canEditOtherUsers)}
                  required
                >
                  <option value="">Выберите сотрудника</option>
                  {(canEditOtherUsers || mode === 'create-plan' ? employees.filter(emp => emp.role === 'Employee') : employees.filter(emp => emp.id === currentUserId && emp.role === 'Employee')).map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </option>
                  ))}
                </FormSelect>
                {errors.userId && (
                  <FormGroup.Error>{errors.userId}</FormGroup.Error>
                )}
              </FormGroup>
            )}

            <FormGroup>
              <FormGroup.Label htmlFor="workloadProject" required>
                Проект
              </FormGroup.Label>
              <FormSelect
                id="workloadProject"
                value={formData.projectId}
                onChange={(e) => handleInputChange('projectId', e.target.value)}
                disabled={mode === 'edit'}
                required
              >
                <option value="">Выберите проект</option>
                {filteredProjects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </FormSelect>
              {errors.projectId && (
                <FormGroup.Error>{errors.projectId}</FormGroup.Error>
              )}
            </FormGroup>

            <FormGroup>
              <FormGroup.Label htmlFor="workloadDate" required>
                Дата
              </FormGroup.Label>
              <FormInput
                type="date"
                id="workloadDate"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                disabled={mode === 'edit'}
                required
              />
            </FormGroup>

            {mode !== 'create-plan' && (
              <FormGroup>
                <FormGroup.Label htmlFor="workloadHours" required>
                  Количество часов
                </FormGroup.Label>
                <FormInput
                  type="number"
                  id="workloadHours"
                  min="0.1"
                  max="24"
                  step="0.1"
                  value={formData.hoursWorked.toString()}
                  onChange={(e) => handleInputChange('hoursWorked', parseFloat(e.target.value) || 0)}
                  required
                />
                {errors.hoursWorked && (
                  <FormGroup.Error>{errors.hoursWorked}</FormGroup.Error>
                )}
              </FormGroup>
            )}

            {mode !== 'create-plan' && (
              <FormGroup>
                <FormGroup.Label htmlFor="workloadDescription" required>
                  Описание работы
                </FormGroup.Label>
                <FormTextarea
                  id="workloadDescription"
                  value={formData.userText}
                  onChange={(e) => handleInputChange('userText', e.target.value)}
                  placeholder="Опишите выполненную работу..."
                  rows={4}
                  required
                />
                {errors.userText && (
                  <FormGroup.Error>{errors.userText}</FormGroup.Error>
                )}
              </FormGroup>
            )}

            <div className="modal__footer">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (mode === 'edit') {
                    setMode('view');
                  } else {
                    // Всегда закрываем модал при отмене в режимах create и create-plan
                    onClose();
                  }
                }}
              >
                Отмена
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  if (mode === 'create') {
                    handleCreateWorkload();
                  } else if (mode === 'create-plan') {
                    handleCreatePlan();
                  } else if (mode === 'edit' && selectedWorkload) {
                    handleEditWorkload(selectedWorkload);
                  }
                }}
              >
                {mode === 'create' ? 'Добавить' : mode === 'create-plan' ? 'Создать план' : 'Сохранить'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

export default WorkloadDetailsModal;