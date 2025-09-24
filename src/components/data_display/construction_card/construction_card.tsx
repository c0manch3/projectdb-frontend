import React, { useState } from 'react';
import type { Construction, Document } from '../../../store/types';

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
  onUploadDocument: (construction: Construction) => void;
  onDownloadDocument: (document: Document) => void;
  onDeleteDocument: (document: Document) => void;
  projectId?: string;
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
  onDeleteDocument
}: ConstructionCardProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);

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
    onUploadDocument(construction);
  };

  const handleDownloadDocument = (document: Document) => {
    onDownloadDocument(document);
  };

  const handleDeleteDocument = (document: Document) => {
    onDeleteDocument(document);
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('ru-RU');
  };

  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getDocumentTypeLabel = (type: string): string => {
    const typeLabels: { [key: string]: string } = {
      km: 'КМ',
      kz: 'КЖ',
      rpz: 'РПЗ',
      tz: 'ТЗ',
      gp: 'ГП',
      igi: 'ИГИ',
      spozu: 'СПОЗУ',
      contract: 'Договор'
    };
    return typeLabels[type] || type.toUpperCase();
  };

  const getDocumentIcon = (mimeType: string | undefined): string => {
    if (!mimeType) return '📎';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '🗜️';
    return '📎';
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

      {/* Expandable Content - Documents */}
      <div className="construction-card__content">
        <div className="construction-card__content-inner">
          <div className="construction-card__documents-section">
            <div className="construction-card__documents-header">
              <h4 className="construction-card__documents-title">
                Документы
                <span className="construction-card__documents-count">({constructionDocuments.length})</span>
              </h4>
              {canUploadDocuments && (
                <button
                  className="construction-card__upload-button"
                  onClick={() => onUploadDocument(construction)}
                >
                  + Загрузить документ
                </button>
              )}
            </div>

            {constructionDocuments.length > 0 ? (
              <div className="construction-card__documents-list">
                {constructionDocuments.map((document) => (
                  <div key={document.id} className="construction-document-item">
                    <div className="construction-document-item__info">
                      <div className="construction-document-item__icon">
                        {getDocumentIcon(document.mimeType)}
                      </div>
                      <div className="construction-document-item__details">
                        <div className="construction-document-item__name">
                          {document.originalName}
                        </div>
                        <div className="construction-document-item__meta">
                          <span className="construction-document-item__type-badge">
                            {getDocumentTypeLabel(document.type)}
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
                      {canDeleteDocuments && (
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
                ))}
              </div>
            ) : (
              <div className="construction-card__documents-empty">
                <div className="construction-card__documents-empty-icon">📁</div>
                <div className="construction-card__documents-empty-title">
                  Документы не найдены
                </div>
                <div className="construction-card__documents-empty-description">
                  К этому сооружению пока не загружены документы. Нажмите кнопку "Загрузить документ" для добавления документов.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConstructionCard;