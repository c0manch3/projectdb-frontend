import React, { useState } from 'react';
import type { Document, DocumentVersion, ConstructionDocumentType } from '../../../store/types';
import { constructionsService } from '../../../services/constructions';
import Button from '../../common/button/button';

interface VersionedDocumentsViewerProps {
  documents: Document[];
  canDownload?: boolean;
  canDelete?: boolean;
  canReplace?: boolean;
  onDownload: (document: Document) => void;
  onDelete: (document: Document) => void;
  onReplace?: (document: Document) => void;
  onUpload?: (version: number, type: ConstructionDocumentType) => void;
}

function VersionedDocumentsViewer({
  documents,
  canDownload = true,
  canDelete = false,
  canReplace = false,
  onDownload,
  onDelete,
  onReplace,
  onUpload
}: VersionedDocumentsViewerProps): JSX.Element {
  // Organize documents by version
  const versions = constructionsService.organizeDocumentsByVersion(documents);

  // Track which versions are expanded
  const [expandedVersions, setExpandedVersions] = useState<Set<number>>(new Set([versions[0]?.versionNumber]));

  const toggleVersion = (versionNumber: number) => {
    setExpandedVersions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(versionNumber)) {
        newSet.delete(versionNumber);
      } else {
        newSet.add(versionNumber);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number): string => {
    return constructionsService.formatFileSize(bytes);
  };

  const getFileIcon = (mimeType: string | undefined): string => {
    if (!mimeType) return '📎';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('dwg') || mimeType.includes('autocad')) return '📐';
    return '📎';
  };

  const renderDocumentItem = (document: Document) => (
    <div key={document.id} className="versioned-document-item">
      <div className="versioned-document-item__info">
        <div className="versioned-document-item__icon">
          {getFileIcon(document.mimeType)}
        </div>
        <div className="versioned-document-item__details">
          <div className="versioned-document-item__name">
            {document.originalName}
          </div>
          <div className="versioned-document-item__meta">
            <span className="versioned-document-item__size">
              {formatFileSize(document.fileSize)}
            </span>
            <span className="document-separator">•</span>
            <span className="versioned-document-item__date">
              {formatDate(document.uploadedAt)}
            </span>
          </div>
        </div>
      </div>
      <div className="versioned-document-item__actions">
        {canDownload && (
          <Button
            variant="outline"
            size="small"
            onClick={() => onDownload(document)}
            title="Скачать документ"
          >
            Скачать
          </Button>
        )}
        {canReplace && onReplace && (
          <Button
            variant="secondary"
            size="small"
            onClick={() => onReplace(document)}
            title="Заменить документ (создаст новую версию)"
          >
            Заменить
          </Button>
        )}
        {canDelete && (
          <Button
            variant="danger"
            size="small"
            onClick={() => onDelete(document)}
            title="Удалить документ"
          >
            Удалить
          </Button>
        )}
      </div>
    </div>
  );

  const renderDocumentCategory = (
    categoryType: ConstructionDocumentType,
    categoryDocuments: Document[],
    versionNumber: number
  ) => {
    const categoryLabel = constructionsService.getDocumentTypeLabel(categoryType);
    const hasDocuments = categoryDocuments.length > 0;

    return (
      <div className="versioned-category" key={categoryType}>
        <div className="versioned-category__header">
          <div className="versioned-category__title">
            <span className="versioned-category__icon">📁</span>
            <span className="versioned-category__label">{categoryLabel}</span>
            <span className="versioned-category__count">
              ({categoryDocuments.length})
            </span>
          </div>
          {onUpload && !hasDocuments && (
            <Button
              variant="outline"
              size="small"
              onClick={() => onUpload(versionNumber, categoryType)}
            >
              + Добавить
            </Button>
          )}
        </div>
        <div className="versioned-category__content">
          {hasDocuments ? (
            categoryDocuments.map(doc => renderDocumentItem(doc))
          ) : (
            <div className="versioned-category__empty">
              Документы отсутствуют
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderVersion = (version: DocumentVersion, index: number) => {
    const isExpanded = expandedVersions.has(version.versionNumber);
    const isLatest = index === 0;
    const totalDocs = version.documents.working_documentation.length +
                     version.documents.project_documentation.length;

    return (
      <div
        key={version.versionNumber}
        className={`versioned-folder ${isExpanded ? 'versioned-folder--expanded' : ''} ${isLatest ? 'versioned-folder--latest' : ''}`}
      >
        <div
          className="versioned-folder__header"
          onClick={() => toggleVersion(version.versionNumber)}
        >
          <div className="versioned-folder__header-left">
            <button className="versioned-folder__toggle">
              <span className="versioned-folder__toggle-icon">
                {isExpanded ? '▼' : '▶'}
              </span>
            </button>
            <div className="versioned-folder__title">
              <span className="versioned-folder__icon">📂</span>
              <span className="versioned-folder__label">
                Версия {version.versionNumber}
                {isLatest && <span className="versioned-folder__badge">Актуальная</span>}
              </span>
            </div>
          </div>
          <div className="versioned-folder__header-right">
            <span className="versioned-folder__doc-count">
              {totalDocs} {totalDocs === 1 ? 'документ' : totalDocs > 1 && totalDocs < 5 ? 'документа' : 'документов'}
            </span>
          </div>
        </div>

        {isExpanded && (
          <div className="versioned-folder__content">
            {renderDocumentCategory(
              'working_documentation',
              version.documents.working_documentation,
              version.versionNumber
            )}
            {renderDocumentCategory(
              'project_documentation',
              version.documents.project_documentation,
              version.versionNumber
            )}
          </div>
        )}
      </div>
    );
  };

  if (documents.length === 0) {
    return (
      <div className="versioned-documents-empty">
        <div className="versioned-documents-empty__icon">📁</div>
        <div className="versioned-documents-empty__title">
          Документы отсутствуют
        </div>
        <div className="versioned-documents-empty__description">
          К этому сооружению пока не загружены документы. Нажмите кнопку "Загрузить документ" для добавления.
        </div>
      </div>
    );
  }

  return (
    <div className="versioned-documents-viewer">
      <div className="versioned-documents-viewer__header">
        <div className="versioned-documents-viewer__title">
          <span className="versioned-documents-viewer__icon">📚</span>
          <span>Документы по версиям</span>
        </div>
        <div className="versioned-documents-viewer__info">
          Всего версий: {versions.length}
        </div>
      </div>
      <div className="versioned-documents-viewer__content">
        {versions.map((version, index) => renderVersion(version, index))}
      </div>
    </div>
  );
}

export default VersionedDocumentsViewer;
