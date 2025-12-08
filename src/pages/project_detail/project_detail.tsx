import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { PageTitle, AppRoute } from '../../const';
import Header from '../../components/layout/header/header';
import PageHeader from '../../components/layout/page_header/page_header';
import Card from '../../components/common/card/card';
import LoadingState from '../../components/common/loading_state/loading_state';
import EmptyState from '../../components/common/empty_state/empty_state';
import Button from '../../components/common/button/button';
import UploadProjectDocumentModal from '../../components/modals/UploadProjectDocumentModal';
import ConfirmDeleteDocumentModal from '../../components/modals/ConfirmDeleteDocumentModal';
import EditProjectModal from '../../components/modals/EditProjectModal';
import AddPaymentScheduleModal from '../../components/modals/AddPaymentScheduleModal';
import EditPaymentScheduleModal from '../../components/modals/EditPaymentScheduleModal';
import ConfirmDeletePaymentScheduleModal from '../../components/modals/ConfirmDeletePaymentScheduleModal';

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
import { projectsService } from '../../services/projects';
import { paymentSchedulesService } from '../../services/payment_schedules';
import type { Document, PaymentSchedule } from '../../store/types';
import { usePermissions } from '../../hooks/use_permissions';

function ProjectDetail(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Redux state
  const currentProject = useSelector(selectCurrentProject);
  const loading = useSelector(selectProjectsLoading);
  const error = useSelector(selectProjectsError);
  const customers = useSelector(selectProjectCustomers);
  const managers = useSelector(selectProjectManagers);
  const currentUser = useSelector(selectCurrentUser);

  // Local state for project documents
  const [projectDocuments, setProjectDocuments] = useState<Document[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadDocumentType, setUploadDocumentType] = useState<'tz' | 'contract'>('tz');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Local state for edit project modal
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Local state for payment schedules
  const [paymentSchedules, setPaymentSchedules] = useState<PaymentSchedule[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [addPaymentModalOpen, setAddPaymentModalOpen] = useState(false);
  const [editPaymentModalOpen, setEditPaymentModalOpen] = useState(false);
  const [deletePaymentModalOpen, setDeletePaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentSchedule | null>(null);

  // Check user permissions using hook
  const permissions = usePermissions();
  const {
    canViewProjects,
    canEditProjects,
    canManageDocuments,
    canManagePaymentSchedules,
    isTrial
  } = permissions;

  // Load data on component mount
  useEffect(() => {
    if (id && canViewProjects) {
      dispatch(fetchProjectById(id));
      dispatch(fetchCustomers());
      dispatch(fetchManagers());
    }
  }, [dispatch, id, canViewProjects]);

  // Load project documents
  const loadProjectDocuments = async () => {
    if (!id) return;

    setDocumentsLoading(true);
    try {
      const documents = await projectsService.getProjectDocuments({ projectId: id });
      setProjectDocuments(documents);
    } catch (error: any) {
      console.error('Error loading project documents:', error);
      toast.error(error?.message || error?.toString() || 'Ошибка при загрузке документов проекта');
    } finally {
      setDocumentsLoading(false);
    }
  };

  // Load documents when project loads
  useEffect(() => {
    if (id && canViewProjects && currentProject) {
      loadProjectDocuments();
    }
  }, [id, canViewProjects, currentProject]);

  // Load payment schedules
  const loadPaymentSchedules = async () => {
    if (!id) return;

    setPaymentsLoading(true);
    try {
      const payments = await paymentSchedulesService.getPaymentSchedulesByProject(id);
      setPaymentSchedules(payments);
    } catch (error: any) {
      console.error('Error loading payment schedules:', error);
      toast.error(error?.message || error?.toString() || 'Ошибка при загрузке графиков платежей');
    } finally {
      setPaymentsLoading(false);
    }
  };

  // Load payment schedules when project loads
  useEffect(() => {
    if (id && canViewProjects && currentProject) {
      loadPaymentSchedules();
    }
  }, [id, canViewProjects, currentProject]);

  // Payment schedule handlers
  const handleAddPayment = () => {
    setAddPaymentModalOpen(true);
  };

  const handleEditPayment = (payment: PaymentSchedule) => {
    setSelectedPayment(payment);
    setEditPaymentModalOpen(true);
  };

  const handleDeletePayment = (payment: PaymentSchedule) => {
    setSelectedPayment(payment);
    setDeletePaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    loadPaymentSchedules();
    // Also refresh project to update cost
    if (id) {
      dispatch(fetchProjectById(id));
    }
  };

  // Document operations handlers
  const handleUploadDocument = (type: 'tz' | 'contract') => {
    setUploadDocumentType(type);
    setUploadModalOpen(true);
  };

  const handleUploadSuccess = () => {
    loadProjectDocuments();
    setUploadModalOpen(false);
  };

  const handleDownloadDocument = async (document: Document) => {
    try {
      await projectsService.downloadProjectDocument(document.id, document.originalName);
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast.error(error?.message || error?.toString() || 'Ошибка при скачивании документа');
    }
  };

  const handleDeleteDocument = (document: Document) => {
    setDocumentToDelete(document);
    setDeleteModalOpen(true);
  };

  const handleConfirmDeleteDocument = async () => {
    if (!documentToDelete) return;

    setIsDeleting(true);
    try {
      await projectsService.deleteProjectDocument(documentToDelete.id);
      toast.success('Документ успешно удален');
      loadProjectDocuments();
      setDeleteModalOpen(false);
      setDocumentToDelete(null);
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error(error?.message || error?.toString() || 'Ошибка при удалении документа');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setDeleteModalOpen(false);
      setDocumentToDelete(null);
    }
  };

  // Edit project handlers
  const handleEditProject = () => {
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    if (id) {
      dispatch(fetchProjectById(id));
    }
    setEditModalOpen(false);
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

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('ru-RU');
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

  // Document helper functions
  const getDocumentsByType = (type: 'tz' | 'contract'): Document[] => {
    return projectDocuments.filter(doc => doc.type === type);
  };

  const formatFileSize = (bytes: number | undefined): string => {
    if (typeof bytes !== 'number' || isNaN(bytes)) return '—';
    return projectsService.formatFileSize(bytes);
  };

  // Navigation handlers
  const handleNavigateToConstructions = () => {
    if (currentProject?.id) {
      navigate(`/projects/${currentProject.id}/constructions`);
    }
  };

  const handleNavigateToDocuments = () => {
    if (currentProject?.id) {
      navigate(`/projects/${currentProject.id}/constructions`);
    }
  };



  // Show error message
  useEffect(() => {
    if (error) {
      toast.error(typeof error === 'string' ? error : error?.message || 'Произошла ошибка');
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

              {/* Quick Actions Card */}
              <Card className="project-actions-card">
                <Card.Header>
                  <Card.Title>Быстрые действия</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="project-quick-actions">
                    {canEditProjects && (
                      <button
                        className="quick-action-btn"
                        onClick={handleEditProject}
                        title="Редактировать проект"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        <span className="quick-action-btn__label">Редактировать</span>
                      </button>
                    )}
                    <button
                      className="quick-action-btn"
                      onClick={handleNavigateToConstructions}
                      title="Перейти к сооружениям"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 20h20"></path>
                        <path d="M5 20V8l7-5 7 5v12"></path>
                        <path d="M9 20v-4h6v4"></path>
                      </svg>
                      <span className="quick-action-btn__label">Сооружения</span>
                    </button>
                  </div>
                </Card.Content>
              </Card>
            </div>

            {/* Project Documents Section */}
            <div className="project-documents-section">
              <div className="section-header">
                <h2 className="section-title">Документы проекта</h2>
                {canManageDocuments && (
                  <div className="section-header__actions">
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleUploadDocument('tz')}
                    >
                      + ТЗ
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleUploadDocument('contract')}
                    >
                      + Договор
                    </Button>
                  </div>
                )}
              </div>

              <Card className="project-documents-card">
                <Card.Content>
                  {documentsLoading ? (
                    <LoadingState message="Загрузка документов..." />
                  ) : projectDocuments.length > 0 ? (
                    <div className="documents-table">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Тип</th>
                            <th>Название документа</th>
                            <th>Дата загрузки</th>
                            <th>Действия</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projectDocuments.map((document) => (
                            <tr key={document.id}>
                              <td>
                                <span className={`document-type-badge document-type-badge--${document.type}`}>
                                  {document.type === 'tz' ? 'ТЗ' : 'Договор'}
                                </span>
                              </td>
                              <td>
                                <div className="document-name-cell">
                                  <span className="document-name-cell__icon">
                                    {document.mimeType?.includes('pdf') ? '📄' :
                                     document.mimeType?.includes('word') ? '📝' :
                                     document.mimeType?.includes('excel') || document.mimeType?.includes('sheet') ? '📊' : '📎'}
                                  </span>
                                  <span className="document-name-cell__text">{document.originalName}</span>
                                </div>
                              </td>
                              <td>{formatDate(document.uploadedAt)}</td>
                              <td className="actions-cell">
                                {canManageDocuments && (
                                  <button
                                    className="action-btn action-btn--download"
                                    onClick={() => handleDownloadDocument(document)}
                                    title="Скачать"
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                      <polyline points="7 10 12 15 17 10"></polyline>
                                      <line x1="12" y1="15" x2="12" y2="3"></line>
                                    </svg>
                                  </button>
                                )}
                                {canManageDocuments && (
                                  <button
                                    className="action-btn action-btn--delete"
                                    onClick={() => handleDeleteDocument(document)}
                                    title="Удалить"
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <polyline points="3 6 5 6 21 6"></polyline>
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                  </button>
                                )}
                                {isTrial && (
                                  <div className="trial-access-message trial-access-message--compact">
                                    <span className="trial-access-message__icon">🔒</span>
                                    <span className="trial-access-message__text">Просмотр документов недоступен в тестовом режиме</span>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState
                      title="Нет документов"
                      description="Загрузите техническое задание или договор для этого проекта"
                    />
                  )}
                </Card.Content>
              </Card>
            </div>

            {/* Payment Schedules Section */}
            <div className="project-payments-section">
              <div className="section-header">
                <h2 className="section-title">График платежей</h2>
                {canEditProjects && (
                  <Button
                    variant="primary"
                    size="small"
                    onClick={handleAddPayment}
                  >
                    + Добавить платеж
                  </Button>
                )}
              </div>

              <Card className="project-payments-card">
                <Card.Content>
                  {paymentsLoading ? (
                    <LoadingState message="Загрузка графиков платежей..." />
                  ) : paymentSchedules.length > 0 ? (
                    <div className="payment-schedules-table">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Название</th>
                            <th>Тип</th>
                            <th>Сумма</th>
                            <th>%</th>
                            <th>Ожидаемая дата</th>
                            <th>Статус</th>
                            {canEditProjects && <th>Действия</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {paymentSchedules.map((payment) => (
                            <tr key={payment.id} className={payment.isPaid ? 'payment-row--paid' : paymentSchedulesService.isOverdue(payment) ? 'payment-row--overdue' : ''}>
                              <td>{payment.name}</td>
                              <td>{paymentSchedulesService.getPaymentTypeLabel(payment.type)}</td>
                              <td className="payment-amount">{paymentSchedulesService.formatAmount(payment.amount)}</td>
                              <td>{payment.percentage ? `${payment.percentage}%` : '-'}</td>
                              <td>{formatDate(payment.expectedDate)}</td>
                              <td>
                                <span className={`status-badge ${payment.isPaid ? 'status-badge--paid' : paymentSchedulesService.isOverdue(payment) ? 'status-badge--overdue' : 'status-badge--pending'}`}>
                                  {payment.isPaid ? 'Оплачен' : paymentSchedulesService.isOverdue(payment) ? 'Просрочен' : 'Ожидается'}
                                </span>
                              </td>
                              {canEditProjects && (
                                <td className="actions-cell">
                                  <button
                                    className="action-btn action-btn--edit"
                                    onClick={() => handleEditPayment(payment)}
                                    title="Редактировать"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    className="action-btn action-btn--delete"
                                    onClick={() => handleDeletePayment(payment)}
                                    title="Удалить"
                                  >
                                    🗑️
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="payment-totals-row">
                            <td colSpan={2}><strong>Итого:</strong></td>
                            <td className="payment-amount"><strong>{paymentSchedulesService.formatAmount(paymentSchedulesService.calculateTotalAmount(paymentSchedules))}</strong></td>
                            <td>100%</td>
                            <td colSpan={canEditProjects ? 3 : 2}>
                              Оплачено: {paymentSchedulesService.formatAmount(paymentSchedulesService.calculatePaidAmount(paymentSchedules))}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <EmptyState
                      title="Нет платежей"
                      description="Добавьте график платежей для этого проекта"
                    />
                  )}
                </Card.Content>
              </Card>
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
                      <div className="future-feature__title">Управление сооружениями</div>
                      <div className="future-feature__description">Создание и отслеживание сооружений проекта</div>
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

        {/* Edit Project Modal */}
        {currentProject && (
          <EditProjectModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            project={currentProject}
            onSuccess={handleEditSuccess}
          />
        )}

        {/* Upload Project Document Modal */}
        {currentProject && (
          <UploadProjectDocumentModal
            isOpen={uploadModalOpen}
            onClose={() => setUploadModalOpen(false)}
            projectId={currentProject.id}
            documentType={uploadDocumentType}
            onUploadSuccess={handleUploadSuccess}
          />
        )}

        {/* Confirm Delete Document Modal */}
        <ConfirmDeleteDocumentModal
          isOpen={deleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDeleteDocument}
          document={documentToDelete}
          isLoading={isDeleting}
        />

        {/* Payment Schedule Modals */}
        {currentProject && (
          <AddPaymentScheduleModal
            isOpen={addPaymentModalOpen}
            onClose={() => setAddPaymentModalOpen(false)}
            projectId={currentProject.id}
            onSuccess={handlePaymentSuccess}
          />
        )}

        <EditPaymentScheduleModal
          isOpen={editPaymentModalOpen}
          onClose={() => {
            setEditPaymentModalOpen(false);
            setSelectedPayment(null);
          }}
          paymentSchedule={selectedPayment}
          onSuccess={handlePaymentSuccess}
        />

        <ConfirmDeletePaymentScheduleModal
          isOpen={deletePaymentModalOpen}
          onClose={() => {
            setDeletePaymentModalOpen(false);
            setSelectedPayment(null);
          }}
          paymentSchedule={selectedPayment}
          onSuccess={handlePaymentSuccess}
        />
      </main>
    </>
  );
}

export default ProjectDetail;