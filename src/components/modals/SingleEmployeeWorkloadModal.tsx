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

interface SingleEmployeeWorkloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  date: string;
  employeeId: string;
  workload: UnifiedWorkload | null;
}

interface WorkloadFormData {
  userId: string;
  projectId: string;
  date: string;
  hoursWorked: number;
  userText: string;
}

function SingleEmployeeWorkloadModal({
  isOpen,
  onClose,
  onSuccess,
  date,
  employeeId,
  workload
}: SingleEmployeeWorkloadModalProps): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const employees = useSelector(selectWorkloadEmployees);
  const projects = useSelector(selectWorkloadProjects);
  const currentUser = useSelector(selectCurrentUser);

  // Local state
  const [mode, setMode] = useState<'view' | 'edit' | 'create' | 'create-plan' | 'edit-plan'>('view');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<WorkloadFormData>({
    userId: employeeId,
    projectId: '',
    date: date,
    hoursWorked: 8,
    userText: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Date object for display and validation
  const dateObj = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dateObj.setHours(0, 0, 0, 0);

  const isPast = dateObj < today;
  const isToday = dateObj.getTime() === today.getTime();
  const isManager = currentUser?.role === 'Manager';
  const currentUserId = currentUser?.id;

  // Role-based permissions
  const canEdit = isManager || (!isPast && workload?.userId === currentUserId);
  const canCreate = !isPast && currentUser;
  const canEditOtherUsers = isManager;
  const canDeleteWorkload = isManager || (workload?.userId === currentUserId && !isPast);

  // Get employee info
  const employee = employees.find(emp => emp.id === employeeId);

  // Load employees and projects when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchWorkloadEmployees());

      // For managers, filter projects by their managerId
      const isValidUUID = currentUser?.id && !currentUser.id.startsWith('temp-');
      const managerId = currentUser?.role === 'Manager' && isValidUUID
        ? currentUser.id
        : undefined;
      dispatch(fetchWorkloadProjects(managerId));
    }
  }, [isOpen, dispatch, currentUser?.role, currentUser?.id]);

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (!workload) {
        setMode('create-plan');
        setFormData({
          userId: employeeId,
          projectId: '',
          date: date,
          hoursWorked: 8,
          userText: ''
        });
      } else {
        setMode('view');
        setFormData({
          userId: workload.userId,
          projectId: workload.projectId,
          date: workload.date.split('T')[0],
          hoursWorked: workload.hoursWorked || 8,
          userText: workload.userText || ''
        });
      }
      setErrors({});
    }
  }, [isOpen, date, employeeId, workload]);

  // Get employee name
  const getEmployeeName = (userId: string): string => {
    const emp = employees.find(e => e.id === userId);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown Employee';
  };

  // Get project name
  const getProjectName = (projectId: string): string => {
    const project = projects.find(proj => proj.id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  // Get workload status
  const getWorkloadStatus = () => {
    if (!workload) return null;
    return workloadService.getWorkloadStatus(workload);
  };

  // Get workload status label
  const getWorkloadStatusLabel = () => {
    const status = getWorkloadStatus();
    return status ? workloadService.getWorkloadStatusLabel(status) : '';
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

    if (!formData.projectId) {
      newErrors.projectId = 'Выберите проект';
    }

    if (mode !== 'create-plan' && formData.hoursWorked <= 0 || formData.hoursWorked > 24) {
      newErrors.hoursWorked = 'Количество часов должно быть от 0.1 до 24';
    }

    if (mode !== 'create-plan' && formData.userText.length < 10) {
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
    if (!formData.projectId) {
      toast.error('Выберите проект');
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
      setMode('view');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при создании плана');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit plan
  const handleEditPlan = async () => {
    if (!workload?.planId) return;

    if (!formData.projectId) {
      toast.error('Выберите проект');
      return;
    }

    setLoading(true);
    try {
      // Delete old plan and create new one with different project
      await workloadService.deleteWorkloadPlan(workload.planId);
      await workloadService.createWorkloadPlan({
        userId: formData.userId,
        projectId: formData.projectId,
        date: formData.date
      });

      toast.success('План успешно обновлен');
      onSuccess();
      setMode('view');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при обновлении плана');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit workload
  const handleEditWorkload = async () => {
    if (!workload?.actualId) return;

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

  // Handle delete workload
  const handleDeleteWorkload = async () => {
    if (!workload || !confirm('Вы уверены, что хотите удалить эту запись?')) return;

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
  const handleStartEdit = () => {
    if (!workload) return;
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

  const modalTitle = () => {
    if (mode === 'create') return 'Добавить рабочее время';
    if (mode === 'create-plan') return 'Создать план работы';
    if (mode === 'edit-plan') return 'Редактировать план работы';
    if (mode === 'edit') return 'Редактировать рабочее время';
    return `${employee ? getEmployeeName(employee.id) : 'Сотрудник'} - ${formatDate(date)}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle()}
      size="large"
    >
      <div className="single-employee-workload-modal">
        {loading && <LoadingState message="Обработка запроса..." />}

        {!loading && mode === 'view' && (
          <div className="single-employee-workload-modal__view">
            {!workload ? (
              <div className="single-employee-workload-modal__empty">
                <div className="single-employee-workload-modal__empty-icon">📅</div>
                <h3>Нет плана работы</h3>
                <p>На эту дату нет запланированной работы или отчетов о проделанной работе для данного сотрудника.</p>

                {canCreate && (
                  <div className="single-employee-workload-modal__empty-actions">
                    <Button
                      variant="primary"
                      onClick={() => setMode('create-plan')}
                    >
                      Создать план
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="single-employee-workload-modal__workload">
                {/* Employee Info */}
                <div className="single-employee-workload-modal__employee-info">
                  <div className="single-employee-workload-modal__employee-avatar">
                    {employee?.firstName.charAt(0)}{employee?.lastName.charAt(0)}
                  </div>
                  <div className="single-employee-workload-modal__employee-details">
                    <h3 className="single-employee-workload-modal__employee-name">
                      {employee ? getEmployeeName(employee.id) : 'Неизвестный сотрудник'}
                    </h3>
                    <p className="single-employee-workload-modal__employee-role">
                      Сотрудник
                    </p>
                  </div>
                </div>

                {/* Plan and Fact Sections */}
                <div className="single-employee-workload-modal__plan-fact">
                  {/* Plan Section */}
                  <div className={`single-employee-workload-modal__section single-employee-workload-modal__plan ${
                    workload.planId ? 'single-employee-workload-modal__section--has-data' : 'single-employee-workload-modal__section--empty'
                  }`}>
                    <div className="single-employee-workload-modal__section-header">
                      <h4>План</h4>
                      <div className="single-employee-workload-modal__section-status">
                        {workload.planId ? '✓ Запланировано' : '○ Не запланировано'}
                      </div>
                    </div>
                    {workload.planId && (
                      <div className="single-employee-workload-modal__section-content">
                        <div className="single-employee-workload-modal__field">
                          <label>Проект:</label>
                          <span>{getProjectName(workload.projectId)}</span>
                        </div>
                        <div className="single-employee-workload-modal__field">
                          <label>Дата создания плана:</label>
                          <span>{workload.planCreatedAt ? new Date(workload.planCreatedAt).toLocaleString('ru-RU') : '-'}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Fact Section */}
                  <div className={`single-employee-workload-modal__section single-employee-workload-modal__fact ${
                    workload.actualId ? 'single-employee-workload-modal__section--has-data' : 'single-employee-workload-modal__section--empty'
                  }`}>
                    <div className="single-employee-workload-modal__section-header">
                      <h4>Факт</h4>
                      <div className="single-employee-workload-modal__section-status">
                        {workload.actualId ? '✓ Отчет сдан' : '○ Нет отчета'}
                      </div>
                    </div>
                    {workload.actualId && (
                      <div className="single-employee-workload-modal__section-content">
                        <div className="single-employee-workload-modal__field">
                          <label>Часов отработано:</label>
                          <span className="single-employee-workload-modal__hours">
                            {workloadService.formatHours(workload.hoursWorked || 0)}
                          </span>
                        </div>
                        <div className="single-employee-workload-modal__field">
                          <label>Описание работы:</label>
                          <div className="single-employee-workload-modal__description">
                            {workload.userText || 'Нет описания'}
                          </div>
                        </div>
                        <div className="single-employee-workload-modal__field">
                          <label>Дата создания отчета:</label>
                          <span>{workload.actualCreatedAt ? new Date(workload.actualCreatedAt).toLocaleString('ru-RU') : '-'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Summary */}
                <div className="single-employee-workload-modal__status-summary">
                  <div className="single-employee-workload-modal__status-indicator">
                    <div
                      className="single-employee-workload-modal__status-dot"
                      style={{
                        backgroundColor: workload ? (() => {
                          const status = getWorkloadStatus();
                          switch (status) {
                            case 'completed': return 'var(--success)';
                            case 'planned': return 'var(--primary)';
                            case 'missing': return 'var(--warning)';
                            case 'overtime': return 'var(--info)';
                            default: return 'var(--text-secondary)';
                          }
                        })() : 'var(--text-secondary)'
                      }}
                    />
                    <span className="single-employee-workload-modal__status-text">
                      {getWorkloadStatusLabel() || 'Нет данных'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {(canEdit && (workload.userId === currentUserId || isManager)) && (
                  <div className="single-employee-workload-modal__actions">
                    {workload.planId && !isPast && (
                      <Button
                        variant="secondary"
                        onClick={() => setMode('edit-plan')}
                      >
                        Редактировать план
                      </Button>
                    )}
                    {workload.actualId && !isPast && (
                      <Button
                        variant="secondary"
                        onClick={handleStartEdit}
                        disabled={workload.userId !== currentUserId && !isManager}
                      >
                        Редактировать отчет
                      </Button>
                    )}
                    {!workload.actualId && !isPast && (
                      <Button
                        variant="primary"
                        onClick={() => setMode('create')}
                      >
                        Добавить отчет
                      </Button>
                    )}
                    {canDeleteWorkload && (workload.userId === currentUserId || isManager) && (
                      <Button
                        variant="danger"
                        onClick={handleDeleteWorkload}
                        disabled={isPast && !isManager}
                      >
                        Удалить
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!loading && (mode === 'create' || mode === 'edit' || mode === 'create-plan' || mode === 'edit-plan') && (
          <form className="form">
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
                {projects.map(project => (
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
                disabled
                required
              />
            </FormGroup>

            {mode !== 'create-plan' && mode !== 'edit-plan' && (
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

            {mode !== 'create-plan' && mode !== 'edit-plan' && (
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
                  } else if (mode === 'edit-plan') {
                    setMode('view');
                  } else if (mode === 'create-plan' && !workload) {
                    onClose();
                  } else if (mode === 'create-plan') {
                    setMode('view');
                  } else {
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
                  } else if (mode === 'edit-plan') {
                    handleEditPlan();
                  } else if (mode === 'edit') {
                    handleEditWorkload();
                  }
                }}
              >
                {mode === 'create' ? 'Добавить' : mode === 'create-plan' ? 'Создать план' : mode === 'edit-plan' ? 'Сохранить изменения' : 'Сохранить'}
              </Button>
            </div>
          </form>
        )}

        {mode === 'view' && workload && (
          <div className="modal__footer">
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Закрыть
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default SingleEmployeeWorkloadModal;