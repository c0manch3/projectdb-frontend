import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { PageTitle } from '../../const';
import Header from '../../components/layout/header/header';
import PageHeader from '../../components/layout/page_header/page_header';
import Card from '../../components/common/card/card';
import Button from '../../components/common/button/button';
import SearchInput from '../../components/common/search_input/search_input';
import Filters from '../../components/common/filters/filters';
import AddConstructionModal from '../../components/modals/AddConstructionModal';
import EditConstructionModal from '../../components/modals/EditConstructionModal';
import ConfirmDeleteConstructionModal from '../../components/modals/ConfirmDeleteConstructionModal';
import ConfirmDeleteDocumentModal from '../../components/modals/ConfirmDeleteDocumentModal';
import ConstructionCardsList from '../../components/data_display/construction_cards_list/construction_cards_list';
import UploadDocumentModal from '../../components/modals/UploadDocumentModal';
import ReplaceDocumentModal from '../../components/modals/ReplaceDocumentModal';
import UploadConstructionDocumentModal from '../../components/modals/UploadConstructionDocumentModal';

import type { AppDispatch } from '../../store';
import {
  fetchConstructions,
  fetchConstructionsByProject,
  fetchDocumentsByConstruction,
  downloadDocument,
  deleteDocument,
  updateSearchQuery,
  updateFilters,
  selectFilteredConstructions,
  selectConstructionsLoading,
  selectConstructionsError,
  selectConstructionSearchQuery,
  selectConstructionsFilters,
  selectDocuments,
  selectDocumentsLoading,
  selectDocumentsError,
  selectConstructionsByProject
} from '../../store/slices/constructions_slice';
import { selectCurrentUser } from '../../store/slices/auth_slice';
import { fetchProjectById, selectCurrentProject } from '../../store/slices/projects_slice';
import type { Construction, Document, ConstructionDocumentType } from '../../store/types';
import { usePermissions } from '../../hooks/use_permissions';

function Constructions(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const { projectId } = useParams<{ projectId: string }>();

  // Redux state
  const filteredConstructions = useSelector(selectFilteredConstructions);
  const constructionsLoading = useSelector(selectConstructionsLoading);
  const constructionsError = useSelector(selectConstructionsError);
  const searchQuery = useSelector(selectConstructionSearchQuery);
  const filters = useSelector(selectConstructionsFilters);
  const documents = useSelector(selectDocuments);
  const documentsLoading = useSelector(selectDocumentsLoading);
  const documentsError = useSelector(selectDocumentsError);
  const currentUser = useSelector(selectCurrentUser);
  const currentProject = useSelector(selectCurrentProject);
  const constructionsByProject = useSelector(selectConstructionsByProject);

  // Permissions hook
  const permissions = usePermissions();
  const {
    canModifyData,
    canManageDocuments,
    canUploadDocuments,
    canDownloadDocuments,
    canDeleteDocuments,
    hasAdminPrivileges,
    isTrial
  } = permissions;

  // Local state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showUploadConstructionModal, setShowUploadConstructionModal] = useState(false);
  const [showReplaceDocumentModal, setShowReplaceDocumentModal] = useState(false);
  const [showDeleteDocumentModal, setShowDeleteDocumentModal] = useState(false);
  const [selectedConstruction, setSelectedConstruction] = useState<Construction | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [uploadVersion, setUploadVersion] = useState<number | undefined>(undefined);
  const [uploadDocumentType, setUploadDocumentType] = useState<ConstructionDocumentType | undefined>(undefined);
  const [documentsLoaded, setDocumentsLoaded] = useState(false);

  // Check user permissions - Trial users can view but not modify
  const canCreateConstructions = canModifyData;
  const canViewConstructions = true; // All authenticated users can view (including Trial)
  const canEditConstructions = canModifyData;
  const canDeleteConstructions = hasAdminPrivileges;

  // Load data on component mount
  useEffect(() => {
    if (canViewConstructions) {
      if (projectId) {
        // Load specific project and its constructions
        dispatch(fetchProjectById(projectId));
        dispatch(fetchConstructionsByProject(projectId));
        // Note: Documents for each construction are loaded individually when construction is selected
        // Set project filter
        dispatch(updateFilters({ projectId }));
      } else {
        // Load all constructions
        dispatch(fetchConstructions());
        // Note: Documents are loaded individually when construction is selected
      }
    }
  }, [dispatch, projectId, canViewConstructions]);

  // Load documents for constructions after they are loaded (only once)
  useEffect(() => {
    if (canViewConstructions && !constructionsLoading && filteredConstructions.length > 0 && !documentsLoaded) {
      setDocumentsLoaded(true); // Устанавливаем флаг СРАЗУ, чтобы избежать повторных вызовов
      filteredConstructions.forEach(construction => {
        dispatch(fetchDocumentsByConstruction(construction.id));
      });
    }
  }, [dispatch, canViewConstructions, constructionsLoading, filteredConstructions, documentsLoaded]);

  // Handle search changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateSearchQuery(e.target.value));
  };

  // Handle filter changes

  // Handle construction actions

  const handleEdit = (construction: Construction) => {
    setSelectedConstruction(construction);
    setShowEditModal(true);
  };

  const handleDelete = (construction: Construction) => {
    setSelectedConstruction(construction);
    setShowDeleteModal(true);
  };

  const handleUploadDocument = (construction?: Construction, version?: number, type?: ConstructionDocumentType) => {
    setSelectedConstruction(construction || null);
    setUploadVersion(version);
    setUploadDocumentType(type);
    setShowUploadConstructionModal(true);
  };

  const handleReplaceDocument = (document: Document) => {
    setSelectedDocument(document);
    setShowReplaceDocumentModal(true);
  };

  const handleDownloadDocument = async (document: Document) => {
    try {
      await dispatch(downloadDocument({ documentId: document.id, fileName: document.originalName }));
    } catch (error) {
      toast.error('Ошибка при скачивании документа');
    }
  };

  const handleDeleteDocument = (document: Document) => {
    setSelectedDocument(document);
    setShowDeleteDocumentModal(true);
  };

  const handleConfirmDeleteDocument = async () => {
    if (!selectedDocument) return;

    try {
      await dispatch(deleteDocument(selectedDocument.id));
      toast.success('Документ успешно удален');
      setShowDeleteDocumentModal(false);
      setSelectedDocument(null);
    } catch (error) {
      toast.error('Ошибка при удалении документа');
    }
  };

  // Helper functions


  const getTotalConstructionsCount = (): number => {
    if (projectId) {
      return filteredConstructions.length;
    }
    return constructions.length;
  };

  // Show error messages
  useEffect(() => {
    if (constructionsError) {
      toast.error(constructionsError);
    }
    if (documentsError) {
      toast.error(documentsError);
    }
  }, [constructionsError, documentsError]);

  if (!canViewConstructions) {
    return (
      <>
        <Helmet>
          <title>{projectId ? `${PageTitle.Projects} - Сооружения` : 'Сооружения'}</title>
        </Helmet>
        <Header activeNavItem="projects" />
        <main className="main">
          <PageHeader
            title={projectId ? `Сооружения проекта` : 'Сооружения'}
            subtitle="Управление сооружениями и документооборотом"
            breadcrumbs={projectId && currentProject ? [
              { name: 'Проекты', path: '/projects' },
              { name: currentProject.name, path: `/projects/${projectId}` },
              { name: 'Сооружения' }
            ] : undefined}
          />
          <div className="container">
            <Card>
              <div className="access-denied">
                <h3>Доступ запрещен</h3>
                <p>У вас нет прав для просмотра списка сооружений.</p>
              </div>
            </Card>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{projectId ? `${PageTitle.Projects} - Сооружения` : 'Сооружения'}</title>
      </Helmet>

      {/* Header */}
      <Header activeNavItem="projects" />

      {/* Main Content */}
      <main className="main">
        {/* Breadcrumbs */}
        <div className="container">
          <div className="breadcrumbs">
            <Link to="/projects" className="breadcrumbs__link">
              Проекты
            </Link>
            <span className="breadcrumbs__separator">›</span>
            {projectId && currentProject && (
              <>
                <Link to={`/projects/${projectId}`} className="breadcrumbs__link">
                  {currentProject.name}
                </Link>
                <span className="breadcrumbs__separator">›</span>
              </>
            )}
            <span className="breadcrumbs__item">Сооружения</span>
          </div>
        </div>

        <div className="container">
          {/* Hero Section */}
          <div className="constructions-hero">
            <div className="constructions-hero__main">
              <div className="constructions-hero__header">
                <h1 className="constructions-hero__title">
                  {projectId && currentProject ? (
                    <>
                      Сооружения проекта
                      <span className="constructions-hero__project-name">"{currentProject.name}"</span>
                    </>
                  ) : (
                    'Сооружения'
                  )}
                </h1>
                <div className="constructions-hero__badges">
                  {projectId && currentProject && (
                    <>
                      <span className={`status-badge status-badge--${currentProject.status}`}>
                        {currentProject.status === 'active' ? 'Активный' :
                         currentProject.status === 'completed' ? 'Завершенный' : 'Просроченный'}
                      </span>
                      <span className="project-type-badge project-type-badge--main">
                        {currentProject.type === 'main' ? 'Основной проект' : 'Дополнительное соглашение'}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="constructions-hero__meta">
                <span className="constructions-hero__description">
                  Управление сооружениями и документооборотом
                </span>
                {projectId && currentProject && (
                  <>
                    <span className="constructions-hero__separator">•</span>
                    <Link to={`/projects/${projectId}`} className="constructions-hero__back-link">
                      ← Вернуться к проекту
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="constructions-hero__stats">
              <div className="constructions-hero__stat">
                <div className="constructions-hero__stat-icon">🏗️</div>
                <div className="constructions-hero__stat-content">
                  <div className="constructions-hero__stat-value">{getTotalConstructionsCount()}</div>
                  <div className="constructions-hero__stat-label">Сооружений</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="constructions-tabs">
            <div className="constructions-tabs__nav">
              <button
                className="constructions-tabs__nav-item constructions-tabs__nav-item--active"
              >
                <span className="constructions-tabs__icon">🏗️</span>
                <span className="constructions-tabs__label">
                  Сооружения
                  <span className="constructions-tabs__count">({getTotalConstructionsCount()})</span>
                </span>
              </button>
            </div>
          </div>

          {/* Constructions Content */}
          <div className="constructions-content">
              {/* Filters and Search */}
              <Card className="constructions-filters-card">
                <Card.Content>
                  <Filters>
                    <SearchInput
                      id="searchInput"
                      placeholder="Поиск сооружений..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />

                    {canCreateConstructions && (
                      <Button
                        id="newConstructionButton"
                        onClick={() => setShowCreateModal(true)}
                      >
                        + Новое сооружение
                      </Button>
                    )}
                  </Filters>
                </Card.Content>
              </Card>

              {/* Construction Cards */}
              <Card className="constructions-table-card">
                <Card.Content>
                  <ConstructionCardsList
                    constructions={filteredConstructions}
                    documents={documents}
                    loading={constructionsLoading}
                    canEdit={canEditConstructions}
                    canDelete={canDeleteConstructions}
                    canUploadDocuments={canUploadDocuments}
                    canDeleteDocuments={canDeleteDocuments}
                    canCreateConstructions={canCreateConstructions}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onUploadDocument={handleUploadDocument}
                    onDownloadDocument={handleDownloadDocument}
                    onReplaceDocument={handleReplaceDocument}
                    onDeleteDocument={handleDeleteDocument}
                    onCreateConstruction={() => setShowCreateModal(true)}
                    projectId={projectId || ''}
                    isLoadingDocuments={documentsLoading}
                  />
                </Card.Content>
              </Card>
          </div>

        </div>
      </main>

      {/* Modals */}
      <AddConstructionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        projectId={projectId || undefined}
      />

      <EditConstructionModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        construction={selectedConstruction}
      />

      <ConfirmDeleteConstructionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        construction={selectedConstruction}
      />

      <UploadDocumentModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        projectId={projectId || undefined}
        construction={selectedConstruction}
        existingDocuments={selectedConstruction ? documents.filter(doc => doc.constructionId === selectedConstruction.id) : []}
      />

      {selectedConstruction && (
        <UploadConstructionDocumentModal
          isOpen={showUploadConstructionModal}
          onClose={() => {
            setShowUploadConstructionModal(false);
            setSelectedConstruction(null);
            setUploadVersion(undefined);
            setUploadDocumentType(undefined);
          }}
          construction={selectedConstruction}
          initialVersion={uploadVersion}
          initialType={uploadDocumentType}
          onUploadSuccess={() => {
            if (selectedConstruction) {
              dispatch(fetchDocumentsByConstruction(selectedConstruction.id));
            }
          }}
        />
      )}

      {selectedDocument && (
        <ReplaceDocumentModal
          isOpen={showReplaceDocumentModal}
          onClose={() => {
            setShowReplaceDocumentModal(false);
            setSelectedDocument(null);
          }}
          document={selectedDocument}
          onReplaceSuccess={() => {
            if (selectedDocument?.constructionId) {
              dispatch(fetchDocumentsByConstruction(selectedDocument.constructionId));
            }
          }}
        />
      )}

      <ConfirmDeleteDocumentModal
        isOpen={showDeleteDocumentModal}
        onClose={() => {
          setShowDeleteDocumentModal(false);
          setSelectedDocument(null);
        }}
        onConfirm={handleConfirmDeleteDocument}
        document={selectedDocument}
      />
    </>
  );
}

export default Constructions;