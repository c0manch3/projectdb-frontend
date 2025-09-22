import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Table from '../table/table';
import Button from '../../common/button/button';
import LoadingState from '../../common/loading_state/loading_state';
import EmptyState from '../../common/empty_state/empty_state';
import GenericConfirmDeleteModal from '../../modals/GenericConfirmDeleteModal';

import type { AppDispatch } from '../../../store';
import {
  downloadDocument,
  deleteDocument,
  selectDocumentsLoading
} from '../../../store/slices/constructions_slice';
import { selectCurrentUser } from '../../../store/slices/auth_slice';
import type { Document, Construction } from '../../../store/types';
import { constructionsService } from '../../../services/constructions';

interface DocumentsTableProps {
  documents: Document[];
  loading?: boolean;
  canDelete?: boolean;
  constructions?: Construction[];
  onDocumentDeleted?: (documentId: string) => void;
}

function DocumentsTable({
  documents,
  loading = false,
  canDelete = false,
  constructions = [],
  onDocumentDeleted
}: DocumentsTableProps): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const documentsLoading = useSelector(selectDocumentsLoading);
  const currentUser = useSelector(selectCurrentUser);

  // Local state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [downloadingDocuments, setDownloadingDocuments] = useState<Set<string>>(new Set());

  // Handle document download
  const handleDownloadDocument = async (document: Document) => {
    if (downloadingDocuments.has(document.id)) return;

    setDownloadingDocuments(prev => new Set(prev).add(document.id));

    try {
      await dispatch(downloadDocument({
        documentId: document.id,
        fileName: document.originalName
      })).unwrap();

      toast.success('Документ успешно загружен');
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast.error(error?.message || error?.toString() || 'Ошибка при скачивании документа');
    } finally {
      setDownloadingDocuments(prev => {
        const newSet = new Set(prev);
        newSet.delete(document.id);
        return newSet;
      });
    }
  };

  // Handle document delete
  const handleDeleteDocument = (document: Document) => {
    setSelectedDocument(document);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDocument) return;

    try {
      await dispatch(deleteDocument(selectedDocument.id)).unwrap();
      toast.success('Документ успешно удален');
      setShowDeleteModal(false);
      setSelectedDocument(null);

      // Call callback if provided
      if (onDocumentDeleted) {
        onDocumentDeleted(selectedDocument.id);
      }
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error(error?.message || error?.toString() || 'Ошибка при удалении документа');
    }
  };

  // Helper functions
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('ru-RU');
  };

  const formatFileSize = (bytes: number | undefined): string => {
    if (typeof bytes !== 'number' || isNaN(bytes)) return '—';
    return constructionsService.formatFileSize(bytes);
  };

  const getDocumentTypeLabel = (type: string): string => {
    return constructionsService.getDocumentTypeLabel(type);
  };

  const getDocumentContextLabel = (context: string): string => {
    return constructionsService.getDocumentContextLabel(context);
  };

  const getConstructionName = (constructionId?: string): string => {
    if (!constructionId) return '—';
    const construction = constructions.find(c => c.id === constructionId);
    return construction ? construction.name : 'Неизвестно';
  };

  // Check user permissions
  const canDownloadDocuments = currentUser?.role === 'Admin' || currentUser?.role === 'Manager' || currentUser?.role === 'Employee';

  if (loading || documentsLoading) {
    return <LoadingState message="Загрузка документов..." />;
  }

  if (documents.length === 0) {
    return (
      <EmptyState
        message="Документы не найдены"
        description="Нет документов, соответствующих выбранным фильтрам"
      />
    );
  }

  return (
    <>
      <Table.Container>
        <Table>
          <Table.Head>
            <tr>
              <Table.Header>Название документа</Table.Header>
              <Table.Header>Дата загрузки</Table.Header>
              <Table.Header>Действия</Table.Header>
            </tr>
          </Table.Head>
          <Table.Body>
            {documents.map((document) => (
              <tr key={document.id}>
                <Table.Cell>
                  <div className="document-name">
                    <div className="document-name__original">
                      {document.originalName}
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <span className="upload-date">
                    {formatDate(document.uploadedAt)}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <div className="table-actions">
                    {canDownloadDocuments && (
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => handleDownloadDocument(document)}
                        disabled={downloadingDocuments.has(document.id)}
                      >
                        {downloadingDocuments.has(document.id) ? 'Загрузка...' : 'Скачать'}
                      </Button>
                    )}

                    {canDelete && (
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => handleDeleteDocument(document)}
                      >
                        Удалить
                      </Button>
                    )}
                  </div>
                </Table.Cell>
              </tr>
            ))}
          </Table.Body>
        </Table>
      </Table.Container>

      {/* Delete Document Modal */}
      <GenericConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedDocument(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Удалить документ"
        message={
          selectedDocument
            ? `Вы действительно хотите удалить документ "${selectedDocument.originalName}"?`
            : ''
        }
        confirmText="Удалить документ"
        isLoading={documentsLoading}
      />
    </>
  );
}

export default DocumentsTable;