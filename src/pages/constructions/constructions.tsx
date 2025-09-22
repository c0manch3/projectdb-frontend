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
import FormSelect from '../../components/forms/form_select/form_select';
import AddConstructionModal from '../../components/modals/AddConstructionModal';
import EditConstructionModal from '../../components/modals/EditConstructionModal';
import ConfirmDeleteConstructionModal from '../../components/modals/ConfirmDeleteConstructionModal';
import DocumentsTable from '../../components/data_display/documents_table/documents_table';
import ConstructionCardsList from '../../components/data_display/construction_cards_list/construction_cards_list';
import UploadDocumentModal from '../../components/modals/UploadDocumentModal';

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
import type { Construction, Document } from '../../store/types';

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

  // Local state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedConstruction, setSelectedConstruction] = useState<Construction | null>(null);
  const [activeTab, setActiveTab] = useState<'constructions' | 'documents'>('constructions');
  const [documentsLoaded, setDocumentsLoaded] = useState(false);

  // Check user permissions
  const canCreateConstructions = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';
  const canViewConstructions = currentUser?.role === 'Admin' || currentUser?.role === 'Manager' || currentUser?.role === 'Employee';
  const canEditConstructions = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';
  const canDeleteConstructions = currentUser?.role === 'Admin';
  const canUploadDocuments = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';

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
  const handleDocumentTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const documentType = e.target.value as 'km' | 'kz' | 'rpz' | 'tz' | 'gp' | 'igi' | 'spozu' | 'contract' | null;
    dispatch(updateFilters({ documentType: documentType || null }));
  };

  const handleDocumentContextFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const documentContext = e.target.value as 'initial_data' | 'project_doc' | null;
    dispatch(updateFilters({ documentContext: documentContext || null }));
  };

  // Handle construction actions

  const handleEdit = (construction: Construction) => {
    setSelectedConstruction(construction);
    setShowEditModal(true);
  };

  const handleDelete = (construction: Construction) => {
    setSelectedConstruction(construction);
    setShowDeleteModal(true);
  };

  const handleUploadDocument = (construction?: Construction) => {
    setSelectedConstruction(construction || null);
    setShowUploadModal(true);
  };

  const handleDownloadDocument = async (document: Document) => {
    try {
      await dispatch(downloadDocument({ documentId: document.id, fileName: document.originalName }));
    } catch (error) {
      toast.error('Ошибка при скачивании документа');
    }
  };

  const handleDeleteDocument = async (document: Document) => {
    if (window.confirm(`Вы уверены, что хотите удалить документ "${document.originalName}"?`)) {
      try {
        await dispatch(deleteDocument(document.id));
        toast.success('Документ успешно удален');
      } catch (error) {
        toast.error('Ошибка при удалении документа');
      }
    }
  };

  // Helper functions

  const getTotalDocumentsCount = (): number => {
    if (projectId) {
      return documents.filter(doc => doc.projectId === projectId).length;
    }
    return documents.length;
  };

  const getTotalConstructionsCount = (): number => {
    if (projectId && constructionsByProject[projectId]) {
      return constructionsByProject[projectId].length;
    }
    return filteredConstructions.length;
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
              <div className="constructions-hero__stat">
                <div className="constructions-hero__stat-icon">📄</div>
                <div className="constructions-hero__stat-content">
                  <div className="constructions-hero__stat-value">{getTotalDocumentsCount()}</div>
                  <div className="constructions-hero__stat-label">Документов</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="constructions-tabs">
            <div className="constructions-tabs__nav">
              <button
                className={`constructions-tabs__nav-item ${activeTab === 'constructions' ? 'constructions-tabs__nav-item--active' : ''}`}
                onClick={() => setActiveTab('constructions')}
              >
                <span className="constructions-tabs__icon">🏗️</span>
                <span className="constructions-tabs__label">
                  Сооружения
                  <span className="constructions-tabs__count">({getTotalConstructionsCount()})</span>
                </span>
              </button>
              <button
                className={`constructions-tabs__nav-item ${activeTab === 'documents' ? 'constructions-tabs__nav-item--active' : ''}`}
                onClick={() => setActiveTab('documents')}
              >
                <span className="constructions-tabs__icon">📄</span>
                <span className="constructions-tabs__label">
                  Документы
                  <span className="constructions-tabs__count">({getTotalDocumentsCount()})</span>
                </span>
              </button>
            </div>
          </div>

          {/* Constructions Tab */}
          {activeTab === 'constructions' && (
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
                    canDeleteDocuments={canDeleteConstructions}
                    canCreateConstructions={canCreateConstructions}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onUploadDocument={handleUploadDocument}
                    onDownloadDocument={handleDownloadDocument}
                    onDeleteDocument={handleDeleteDocument}
                    onCreateConstruction={() => setShowCreateModal(true)}
                    projectId={projectId || ''}
                  />
                </Card.Content>
              </Card>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="constructions-content">
              {/* Document Filters */}
              <Card className="constructions-filters-card">
                <Card.Content>
                  <Filters>
                    <Filters.Group>
                      <Filters.Label htmlFor="documentTypeFilter">Тип документа:</Filters.Label>
                      <FormSelect
                        id="documentTypeFilter"
                        className="filters__select"
                        value={filters.documentType || ''}
                        onChange={handleDocumentTypeFilterChange}
                      >
                        <option value="">Все</option>
                        <option value="km">КМ</option>
                        <option value="kz">КЖ</option>
                        <option value="rpz">РПЗ</option>
                        <option value="tz">ТЗ</option>
                        <option value="gp">ГП</option>
                        <option value="igi">ИГИ</option>
                        <option value="spozu">СПОЗУ</option>
                        <option value="contract">Договор</option>
                      </FormSelect>
                    </Filters.Group>

                    <Filters.Group>
                      <Filters.Label htmlFor="documentContextFilter">Контекст:</Filters.Label>
                      <FormSelect
                        id="documentContextFilter"
                        className="filters__select"
                        value={filters.documentContext || ''}
                        onChange={handleDocumentContextFilterChange}
                      >
                        <option value="">Все</option>
                        <option value="initial_data">Исходные данные</option>
                        <option value="project_doc">Проектная документация</option>
                      </FormSelect>
                    </Filters.Group>

                    {canUploadDocuments && (
                      <Button
                        id="uploadDocumentButton"
                        onClick={() => handleUploadDocument()}
                      >
                        + Загрузить документ
                      </Button>
                    )}
                  </Filters>
                </Card.Content>
              </Card>

              {/* Documents Table */}
              <Card className="constructions-table-card">
                <Card.Content>
                  <DocumentsTable
                    documents={documents.filter(doc => {
                      if (projectId && doc.projectId !== projectId) return false;
                      if (filters.documentType && doc.type !== filters.documentType) return false;
                      if (filters.documentContext && doc.context !== filters.documentContext) return false;
                      return true;
                    })}
                    loading={documentsLoading}
                    canDelete={canDeleteConstructions}
                    constructions={filteredConstructions}
                  />
                </Card.Content>
              </Card>
            </div>
          )}
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
    </>
  );
}

export default Constructions;