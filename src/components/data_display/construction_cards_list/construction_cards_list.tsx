import ConstructionCard from '../construction_card/construction_card';
import EmptyState from '../../common/empty_state/empty_state';
import Button from '../../common/button/button';
import type { Construction, Document, ConstructionDocumentType } from '../../../store/types';

interface ConstructionCardsListProps {
  constructions: Construction[];
  documents: Document[];
  loading: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canUploadDocuments: boolean;
  canDeleteDocuments: boolean;
  canCreateConstructions: boolean;
  onEdit: (construction: Construction) => void;
  onDelete: (construction: Construction) => void;
  onUploadDocument: (construction: Construction, version?: number, type?: ConstructionDocumentType) => void;
  onDownloadDocument: (document: Document) => void;
  onReplaceDocument?: (document: Document) => void;
  onDeleteDocument: (document: Document) => void;
  onCreateConstruction: () => void;
  projectId?: string;
  isLoadingDocuments?: boolean;
}

function ConstructionCardsList({
  constructions,
  documents,
  loading,
  canEdit,
  canDelete,
  canUploadDocuments,
  canDeleteDocuments,
  canCreateConstructions,
  onEdit,
  onDelete,
  onUploadDocument,
  onDownloadDocument,
  onReplaceDocument,
  onDeleteDocument,
  onCreateConstruction,
  projectId,
  isLoadingDocuments = false
}: ConstructionCardsListProps): JSX.Element {
  const getDocumentCount = (constructionId: string): number => {
    return documents.filter(doc => doc.constructionId === constructionId).length;
  };

  const getConstructionDocuments = (constructionId: string): Document[] => {
    return documents.filter(doc => doc.constructionId === constructionId);
  };

  if (loading) {
    return (
      <div className="construction-cards-loading">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="construction-card-skeleton">
            <div className="construction-card-skeleton__header">
              <div className="construction-card-skeleton__title"></div>
              <div className="construction-card-skeleton__badge"></div>
            </div>
            <div className="construction-card-skeleton__meta">
              <div className="construction-card-skeleton__meta-item"></div>
              <div className="construction-card-skeleton__meta-item"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (constructions.length === 0) {
    return (
      <EmptyState
        message="Сооружения не найдены"
        actionButton={
          canCreateConstructions ? (
            <Button onClick={onCreateConstruction}>
              Создать первое сооружение
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="construction-cards-container">
      {constructions.map((construction) => (
        <ConstructionCard
          key={construction.id}
          construction={construction}
          documents={getConstructionDocuments(construction.id)}
          documentsCount={getDocumentCount(construction.id)}
          canEdit={canEdit}
          canDelete={canDelete}
          canUploadDocuments={canUploadDocuments}
          canDeleteDocuments={canDeleteDocuments}
          onEdit={onEdit}
          onDelete={onDelete}
          onUploadDocument={onUploadDocument}
          onDownloadDocument={onDownloadDocument}
          onReplaceDocument={onReplaceDocument}
          onDeleteDocument={onDeleteDocument}
          projectId={projectId}
          isLoadingDocuments={isLoadingDocuments}
        />
      ))}
    </div>
  );
}

export default ConstructionCardsList;