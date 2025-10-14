import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Document, DocumentVersion, ConstructionDocumentType } from '../../../store/types';
import { constructionsService } from '../../../services/constructions';

// Type definitions for the document tree structure
interface DocumentTreeProps {
  constructionId: string;
  constructionName: string;
  documents: Document[];
  onDownload: (document: Document) => void;
  onReplace: (document: Document) => void;
  onDelete: (document: Document) => void;
  onAddDocument: (version: number, category: ConstructionDocumentType) => void;
  currentUser: { role: string } | null;
  isLoading?: boolean;
}

interface GroupedDocuments {
  [version: number]: {
    working_documentation: Document[];
    project_documentation: Document[];
  };
}

// Helper function to group documents by version and category
function groupDocumentsByVersion(documents: Document[]): GroupedDocuments {
  const grouped: GroupedDocuments = {};

  documents.forEach((doc) => {
    const version = doc.version || 1;

    if (!grouped[version]) {
      grouped[version] = {
        working_documentation: [],
        project_documentation: [],
      };
    }

    if (doc.type === 'working_documentation' || doc.type === 'project_documentation') {
      grouped[version][doc.type].push(doc);
    }
  });

  return grouped;
}

// Document Item Component
interface DocumentItemProps {
  document: Document;
  onDownload: () => void;
  onReplace: () => void;
  onDelete: () => void;
  canEdit: boolean;
}

function DocumentItem({
  document,
  onDownload,
  onReplace,
  onDelete,
  canEdit,
}: DocumentItemProps): JSX.Element {
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string | undefined): string => {
    if (!mimeType) return '📎';
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return '📊';
    if (mimeType.includes('dwg')) return '📐';
    return '📎';
  };

  return (
    <motion.div
      className="document-tree__item"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }}
      role="treeitem"
      aria-label={`Document: ${document.originalName}`}
    >
      <div className="document-tree__item-content">
        <span className="document-tree__item-icon" aria-hidden="true">
          {getFileIcon(document.mimeType)}
        </span>
        <div className="document-tree__item-info">
          <span className="document-tree__item-name" title={document.originalName}>
            {document.originalName}
          </span>
          <span className="document-tree__item-meta">
            {formatFileSize(document.fileSize)} • {new Date(document.uploadedAt).toLocaleDateString('ru-RU')}
          </span>
        </div>
      </div>

      <div className="document-tree__item-actions">
        <button
          className="document-tree__action-button document-tree__action-button--download"
          onClick={onDownload}
          title="Скачать документ"
          aria-label="Скачать документ"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>

        {canEdit && (
          <>
            <button
              className="document-tree__action-button document-tree__action-button--replace"
              onClick={onReplace}
              title="Заменить документ (создать новую версию)"
              aria-label="Заменить документ"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              className="document-tree__action-button document-tree__action-button--delete"
              onClick={onDelete}
              title="Удалить документ"
              aria-label="Удалить документ"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

// Document Category Folder Component
interface DocumentCategoryFolderProps {
  categoryType: ConstructionDocumentType;
  documents: Document[];
  version: number;
  isExpanded: boolean;
  onToggle: () => void;
  onDownload: (document: Document) => void;
  onReplace: (document: Document) => void;
  onDelete: (document: Document) => void;
  onAddDocument: () => void;
  canEdit: boolean;
}

function DocumentCategoryFolder({
  categoryType,
  documents,
  version,
  isExpanded,
  onToggle,
  onDownload,
  onReplace,
  onDelete,
  onAddDocument,
  canEdit,
}: DocumentCategoryFolderProps): JSX.Element {
  const categoryLabel =
    categoryType === 'working_documentation'
      ? 'Рабочая документация'
      : 'Проектная документация';

  const categoryIcon = categoryType === 'working_documentation' ? '📋' : '📁';

  return (
    <div className="document-tree__category" role="group" aria-label={categoryLabel}>
      <button
        className={`document-tree__folder ${isExpanded ? 'document-tree__folder--expanded' : ''}`}
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-label={`${categoryLabel}, ${documents.length} документов`}
      >
        <span className="document-tree__folder-icon" aria-hidden="true">
          {isExpanded ? '📂' : categoryIcon}
        </span>
        <span className="document-tree__folder-name">{categoryLabel}</span>
        <span className="document-tree__folder-count" aria-label={`${documents.length} документов`}>
          ({documents.length})
        </span>
        <span className="document-tree__folder-chevron" aria-hidden="true">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="document-tree__folder-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="group"
          >
            {documents.length === 0 ? (
              <div className="document-tree__empty">
                <p className="document-tree__empty-text">Нет документов</p>
                {canEdit && (
                  <button
                    className="document-tree__add-button"
                    onClick={onAddDocument}
                    aria-label={`Добавить документ в ${categoryLabel}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Добавить документ
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="document-tree__items" role="list">
                  {documents.map((doc) => (
                    <DocumentItem
                      key={doc.id}
                      document={doc}
                      onDownload={() => onDownload(doc)}
                      onReplace={() => onReplace(doc)}
                      onDelete={() => onDelete(doc)}
                      canEdit={canEdit}
                    />
                  ))}
                </div>
                {canEdit && (
                  <button
                    className="document-tree__add-button document-tree__add-button--inline"
                    onClick={onAddDocument}
                    aria-label={`Добавить ещё документ в ${categoryLabel}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Добавить документ
                  </button>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Version Folder Component
interface VersionFolderProps {
  version: number;
  documents: {
    working_documentation: Document[];
    project_documentation: Document[];
  };
  isExpanded: boolean;
  onToggle: () => void;
  isLatest: boolean;
  onDownload: (document: Document) => void;
  onReplace: (document: Document) => void;
  onDelete: (document: Document) => void;
  onAddDocument: (category: ConstructionDocumentType) => void;
  canEdit: boolean;
}

function VersionFolder({
  version,
  documents,
  isExpanded,
  onToggle,
  isLatest,
  onDownload,
  onReplace,
  onDelete,
  onAddDocument,
  canEdit,
}: VersionFolderProps): JSX.Element {
  const [expandedCategories, setExpandedCategories] = useState<Set<ConstructionDocumentType>>(
    new Set()
  );

  const toggleCategory = useCallback((category: ConstructionDocumentType) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);

  const totalDocuments =
    documents.working_documentation.length + documents.project_documentation.length;

  return (
    <div className="document-tree__version" role="group" aria-label={`Версия ${version}`}>
      <button
        className={`document-tree__folder document-tree__folder--version ${
          isExpanded ? 'document-tree__folder--expanded' : ''
        }`}
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-label={`Версия ${version}, ${totalDocuments} документов`}
      >
        <span className="document-tree__folder-icon" aria-hidden="true">
          {isExpanded ? '📂' : '📁'}
        </span>
        <span className="document-tree__folder-name">v{version}</span>
        {isLatest && (
          <span className="document-tree__version-badge" aria-label="Актуальная версия">
            Актуальная
          </span>
        )}
        <span className="document-tree__folder-count" aria-label={`${totalDocuments} документов`}>
          ({totalDocuments})
        </span>
        <span className="document-tree__folder-chevron" aria-hidden="true">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="document-tree__folder-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="group"
          >
            <DocumentCategoryFolder
              categoryType="working_documentation"
              documents={documents.working_documentation}
              version={version}
              isExpanded={expandedCategories.has('working_documentation')}
              onToggle={() => toggleCategory('working_documentation')}
              onDownload={onDownload}
              onReplace={onReplace}
              onDelete={onDelete}
              onAddDocument={() => onAddDocument('working_documentation')}
              canEdit={canEdit}
            />
            <DocumentCategoryFolder
              categoryType="project_documentation"
              documents={documents.project_documentation}
              version={version}
              isExpanded={expandedCategories.has('project_documentation')}
              onToggle={() => toggleCategory('project_documentation')}
              onDownload={onDownload}
              onReplace={onReplace}
              onDelete={onDelete}
              onAddDocument={() => onAddDocument('project_documentation')}
              canEdit={canEdit}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Main Document Tree Component
function DocumentTree({
  constructionId,
  constructionName,
  documents,
  onDownload,
  onReplace,
  onDelete,
  onAddDocument,
  currentUser,
  isLoading = false,
}: DocumentTreeProps): JSX.Element {
  const [expandedVersions, setExpandedVersions] = useState<Set<number>>(new Set());

  const canEdit = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';

  const toggleVersion = useCallback((version: number) => {
    setExpandedVersions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(version)) {
        newSet.delete(version);
      } else {
        newSet.add(version);
      }
      return newSet;
    });
  }, []);

  const groupedDocs = groupDocumentsByVersion(documents);
  const versions = Object.keys(groupedDocs)
    .map(Number)
    .sort((a, b) => b - a); // Sort in descending order (newest first)

  const latestVersion = versions.length > 0 ? Math.max(...versions) : 1;

  if (isLoading) {
    return (
      <div className="document-tree document-tree--loading">
        <div className="document-tree__loading">
          <div className="document-tree__loading-spinner" aria-label="Загрузка документов"></div>
          <p className="document-tree__loading-text">Загрузка документов...</p>
        </div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="document-tree document-tree--empty">
        <div className="document-tree__empty-state">
          <div className="document-tree__empty-icon" aria-hidden="true">
            📂
          </div>
          <h3 className="document-tree__empty-title">Нет документов</h3>
          <p className="document-tree__empty-description">
            Для сооружения &quot;{constructionName}&quot; пока не загружено ни одного документа.
          </p>
          {canEdit && (
            <button
              className="document-tree__add-button document-tree__add-button--primary"
              onClick={() => onAddDocument(1, undefined as any)}
              aria-label="Добавить первый документ"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Добавить первый документ
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="document-tree" role="tree" aria-label={`Документы сооружения ${constructionName}`}>
      <div className="document-tree__header">
        <h3 className="document-tree__title">Версии документов</h3>
        <div className="document-tree__stats">
          <span className="document-tree__stat">
            Версий: <strong>{versions.length}</strong>
          </span>
          <span className="document-tree__stat">
            Документов: <strong>{documents.length}</strong>
          </span>
        </div>
      </div>

      <div className="document-tree__content">
        {versions.map((version) => (
          <VersionFolder
            key={version}
            version={version}
            documents={groupedDocs[version]}
            isExpanded={expandedVersions.has(version)}
            onToggle={() => toggleVersion(version)}
            isLatest={version === latestVersion}
            onDownload={onDownload}
            onReplace={onReplace}
            onDelete={onDelete}
            onAddDocument={(category) => onAddDocument(version, category)}
            canEdit={canEdit}
          />
        ))}
      </div>

      {canEdit && (
        <div className="document-tree__footer">
          <button
            className="document-tree__create-version-button"
            onClick={() => onAddDocument(latestVersion + 1, undefined as any)}
            aria-label="Создать новую версию"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Создать новую версию (v{latestVersion + 1})
          </button>
        </div>
      )}
    </div>
  );
}

export default DocumentTree;
