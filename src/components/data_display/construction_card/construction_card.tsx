import React, { useState } from 'react';
import type { Construction, Document, ConstructionDocumentType } from '../../../store/types';
import DocumentTree from '../document_tree/document_tree';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../store/slices/auth_slice';

interface ConstructionCardProps {
  construction: Construction;
  documents: Document[];
  documentsCount: number;
  canEdit: boolean;
  canDelete: boolean;
  canUploadDocuments: boolean;
  canDeleteDocuments: boolean;
  onEdit: (construction: Construction) => void;
  onDelete: (construction: Construction) => void;
  onUploadDocument: (construction: Construction, version?: number, type?: ConstructionDocumentType) => void;
  onDownloadDocument: (document: Document) => void;
  onReplaceDocument?: (document: Document) => void;
  onDeleteDocument: (document: Document) => void;
  projectId?: string;
  isLoadingDocuments?: boolean;
}

function ConstructionCard({
  construction,
  documents,
  documentsCount,
  canEdit,
  canDelete,
  canUploadDocuments,
  canDeleteDocuments,
  onEdit,
  onDelete,
  onUploadDocument,
  onDownloadDocument,
  onReplaceDocument,
  onDeleteDocument,
  isLoadingDocuments = false
}: ConstructionCardProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentUser = useSelector(selectCurrentUser);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(construction);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(construction);
  };

  const handleUploadDocument = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUploadDocument(construction, undefined, undefined);
  };

  const handleAddDocument = (version: number, type: ConstructionDocumentType) => {
    onUploadDocument(construction, version, type);
  };

  const handleDownloadDocument = (document: Document) => {
    onDownloadDocument(document);
  };

  const handleReplaceDocument = (document: Document) => {
    if (onReplaceDocument) {
      onReplaceDocument(document);
    }
  };

  const handleDeleteDocument = (document: Document) => {
    onDeleteDocument(document);
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('ru-RU');
  };

  const constructionDocuments = documents.filter(doc => doc.constructionId === construction.id);

  return (
    <div className={`construction-card ${isExpanded ? 'construction-card--expanded' : ''}`}>
      {/* Card Header - Always Visible */}
      <div className="construction-card__header" onClick={handleToggleExpand}>
        <div className="construction-card__header-content">
          <div className="construction-card__main-info">
            <h3 className="construction-card__name">{construction.name}</h3>
            <div className="construction-card__meta">
              <div className="construction-card__meta-item">
                <span className="construction-card__meta-icon">📅</span>
                <span className="construction-card__meta-label">Создано:</span>
                <span className="construction-card__meta-value">{formatDate(construction.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="construction-card__controls">
            <div className={`construction-card__documents-badge ${documentsCount === 0 ? 'construction-card__documents-badge--empty' : ''}`}>
              {documentsCount > 0 ? `${documentsCount} документов` : 'Нет документов'}
            </div>

            <div className="construction-card__quick-actions">
              {canEdit && (
                <button
                  className="construction-card__action-button"
                  onClick={handleEdit}
                  title="Редактировать сооружение"
                >
                  Изменить
                </button>
              )}

              {canUploadDocuments && (
                <button
                  className="construction-card__action-button construction-card__action-button--secondary"
                  onClick={handleUploadDocument}
                  title="Загрузить документ"
                >
                  Загрузить документ
                </button>
              )}

              {canDelete && (
                <button
                  className="construction-card__action-button construction-card__action-button--danger"
                  onClick={handleDelete}
                  title="Удалить сооружение"
                >
                  Удалить
                </button>
              )}
            </div>

            <button className="construction-card__expand-toggle" title={isExpanded ? 'Скрыть документы' : 'Показать документы'}>
              <span className="construction-card__expand-icon">▼</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Content - Documents with Version Tree */}
      <div className="construction-card__content">
        <div className="construction-card__content-inner">
          <DocumentTree
            constructionId={construction.id}
            constructionName={construction.name}
            documents={constructionDocuments}
            onDownload={handleDownloadDocument}
            onReplace={handleReplaceDocument}
            onDelete={handleDeleteDocument}
            onAddDocument={handleAddDocument}
            currentUser={currentUser}
            isLoading={isLoadingDocuments}
          />
        </div>
      </div>
    </div>
  );
}

export default ConstructionCard;