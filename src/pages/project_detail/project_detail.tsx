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
import type { Document } from '../../store/types';

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

  // Check user permissions
  const canViewProjects = currentUser?.role === 'Admin' || currentUser?.role === 'Manager' || currentUser?.role === 'Employee';
  const canEditProjects = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';

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

              {/* Actions Card */}
              <Card className="project-actions-card">
                <Card.Header>
                  <Card.Title>Действия</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="project-actions">
                    {canEditProjects && (
                      <Button
                        variant="primary"
                        className="project-action-button"
                        onClick={handleEditProject}
                      >
                        ✏️ Редактировать проект
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="project-action-button"
                      onClick={handleNavigateToConstructions}
                    >
                      🏗️ Сооружения
                    </Button>
                  </div>
                </Card.Content>
              </Card>
            </div>

            {/* Project Documents Section */}
            <div className="project-documents-section">
              <h2 className="section-title">Документы проекта</h2>

              <div className="project-documents-grid">
                {/* Technical Specification (TZ) */}
                <Card className="project-document-card constructions-table-card">
                  <Card.Header>
                    <div className="document-card-header">
                      <Card.Title className="document-card-title">
                        📋 Техническое задание (ТЗ)
                      </Card.Title>
                      {canEditProjects && (
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => handleUploadDocument('tz')}
                        >
                          Загрузить ТЗ
                        </Button>
                      )}
                    </div>
                  </Card.Header>
                  <Card.Content>
                    {documentsLoading ? (
                      <LoadingState message="Загрузка документов..." />
                    ) : (
                      <div className="construction-card__documents-list">
                        {getDocumentsByType('tz').length > 0 ? (
                          getDocumentsByType('tz').map((document) => (
                            <div key={document.id} className="construction-document-item">
                              <div className="construction-document-item__info">
                                <div className="construction-document-item__icon">
                                  {document.mimeType?.includes('pdf') ? '📄' :
                                   document.mimeType?.includes('word') ? '📝' :
                                   document.mimeType?.includes('excel') || document.mimeType?.includes('sheet') ? '📊' : '📎'}
                                </div>
                                <div className="construction-document-item__details">
                                  <div className="construction-document-item__name">{document.originalName}</div>
                                  <div className="construction-document-item__meta">
                                    <span className="construction-document-item__type-badge">
                                      ТЗ
                                    </span>
                                    <span className="document-separator">•</span>
                                    <span className="construction-document-item__date">
                                      Дата загрузки: {formatDate(document.uploadedAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="construction-document-item__actions">
                                <button
                                  className="construction-document-item__action"
                                  onClick={() => handleDownloadDocument(document)}
                                  title="Скачать документ"
                                >
                                  <span className="construction-document-item__action-icon">⬇️</span>
                                  Скачать
                                </button>
                                {canEditProjects && (
                                  <button
                                    className="construction-document-item__action construction-document-item__action--danger"
                                    onClick={() => handleDeleteDocument(document)}
                                    title="Удалить документ"
                                  >
                                    <span className="construction-document-item__action-icon">🗑️</span>
                                    Удалить
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="document-empty-state">
                            <div className="document-empty-icon">📋</div>
                            <div className="document-empty-text">
                              <div className="document-empty-title">Техническое задание не загружено</div>
                              <div className="document-empty-description">
                                Загрузите техническое задание для проекта
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Card.Content>
                </Card>

                {/* Contract */}
                <Card className="project-document-card constructions-table-card">
                  <Card.Header>
                    <div className="document-card-header">
                      <Card.Title className="document-card-title">
                        📄 Договор
                      </Card.Title>
                      {canEditProjects && (
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => handleUploadDocument('contract')}
                        >
                          Загрузить договор
                        </Button>
                      )}
                    </div>
                  </Card.Header>
                  <Card.Content>
                    {documentsLoading ? (
                      <LoadingState message="Загрузка документов..." />
                    ) : (
                      <div className="construction-card__documents-list">
                        {getDocumentsByType('contract').length > 0 ? (
                          getDocumentsByType('contract').map((document) => (
                            <div key={document.id} className="construction-document-item">
                              <div className="construction-document-item__info">
                                <div className="construction-document-item__icon">
                                  {document.mimeType?.includes('pdf') ? '📄' :
                                   document.mimeType?.includes('word') ? '📝' :
                                   document.mimeType?.includes('excel') || document.mimeType?.includes('sheet') ? '📊' : '📎'}
                                </div>
                                <div className="construction-document-item__details">
                                  <div className="construction-document-item__name">{document.originalName}</div>
                                  <div className="construction-document-item__meta">
                                    <span className="construction-document-item__type-badge">
                                      Договор
                                    </span>
                                    <span className="document-separator">•</span>
                                    <span className="construction-document-item__date">
                                      Дата загрузки: {formatDate(document.uploadedAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="construction-document-item__actions">
                                <button
                                  className="construction-document-item__action"
                                  onClick={() => handleDownloadDocument(document)}
                                  title="Скачать документ"
                                >
                                  <span className="construction-document-item__action-icon">⬇️</span>
                                  Скачать
                                </button>
                                {canEditProjects && (
                                  <button
                                    className="construction-document-item__action construction-document-item__action--danger"
                                    onClick={() => handleDeleteDocument(document)}
                                    title="Удалить документ"
                                  >
                                    <span className="construction-document-item__action-icon">🗑️</span>
                                    Удалить
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="document-empty-state">
                            <div className="document-empty-icon">📄</div>
                            <div className="document-empty-text">
                              <div className="document-empty-title">Договор не загружен</div>
                              <div className="document-empty-description">
                                Загрузите договор для проекта
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Card.Content>
                </Card>
              </div>
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
      </main>
    </>
  );
}

export default ProjectDetail;