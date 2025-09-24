import React from 'react';
import Modal from '../common/modal/modal';
import Button from '../common/button/button';
import type { Document } from '../../store/types';

interface ConfirmDeleteDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  document: Document | null;
  isLoading?: boolean;
}

function ConfirmDeleteDocumentModal({
  isOpen,
  onClose,
  onConfirm,
  document,
  isLoading = false
}: ConfirmDeleteDocumentModalProps): JSX.Element {
  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isLoading) {
      onClose();
    }
    if (e.key === 'Enter' && !isLoading) {
      onConfirm();
    }
  };

  // Get file icon based on file type
  const getFileIcon = (fileName: string): JSX.Element => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const iconStyle = { width: '20px', height: '20px', marginRight: '8px' };

    switch (extension) {
      case 'pdf':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
        );
      case 'doc':
      case 'docx':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        );
      case 'xls':
      case 'xlsx':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <rect x="8" y="12" width="2" height="2"/>
            <rect x="10" y="12" width="2" height="2"/>
            <rect x="12" y="12" width="2" height="2"/>
            <rect x="8" y="14" width="2" height="2"/>
            <rect x="10" y="14" width="2" height="2"/>
            <rect x="12" y="14" width="2" height="2"/>
          </svg>
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21,15 16,10 5,21"/>
          </svg>
        );
      default:
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
          </svg>
        );
    }
  };

  // Format file size
  const formatFileSize = (size?: number): string => {
    if (!size) return '';
    const kb = size / 1024;
    const mb = kb / 1024;

    if (mb >= 1) {
      return ` (${mb.toFixed(1)} МБ)`;
    } else if (kb >= 1) {
      return ` (${kb.toFixed(0)} КБ)`;
    } else {
      return ` (${size} байт)`;
    }
  };

  if (!isOpen || !document) return <></>;

  return (
    <Modal
      isOpen={isOpen}
      onClose={!isLoading ? onClose : undefined}
      id="confirmDeleteDocumentModal"
      onKeyDown={handleKeyDown}
    >
      <Modal.Header onClose={!isLoading ? onClose : undefined}>
        Удаление документа
      </Modal.Header>

      <Modal.Content>
        <div className="delete-confirmation">
          <div className="delete-confirmation__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="delete-confirmation__content">
            <h3>Вы действительно хотите удалить этот документ?</h3>

            {/* Document Information Card */}
            <div className="document-details">
              <div className="detail-item">
                <span className="detail-label">
                  {getFileIcon(document.originalName)}
                  Файл:
                </span>
                <span className="detail-value">
                  {document.originalName}
                  {formatFileSize(document.fileSize)}
                </span>
              </div>
              {document.type && (
                <div className="detail-item">
                  <span className="detail-label">Тип:</span>
                  <span className="detail-value">{document.type.toUpperCase()}</span>
                </div>
              )}
            </div>

            <p className="delete-warning">
              <strong>Внимание:</strong> Это действие нельзя будет отменить. Документ будет удален безвозвратно.
            </p>
          </div>
        </div>
      </Modal.Content>

      <Modal.Footer>
        <div className="modal-actions">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Отмена
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    marginRight: '8px',
                    animation: 'spin 1s linear infinite'
                  }}
                >
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                Удаление...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
                Удалить документ
              </>
            )}
          </Button>
        </div>
      </Modal.Footer>

      {/* Add keyframe animation for spinner */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Modal>
  );
}

export default ConfirmDeleteDocumentModal;