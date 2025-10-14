import React from 'react';
import Modal from '../common/modal/modal';
import Button from '../common/button/button';
import type { Company } from '../../store/types';

interface ConfirmDeleteCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  onConfirm: (company: Company) => Promise<void>;
  isDeleting?: boolean;
}

function ConfirmDeleteCompanyModal({ 
  isOpen, 
  onClose, 
  company, 
  onConfirm, 
  isDeleting = false 
}: ConfirmDeleteCompanyModalProps): JSX.Element {
  const handleConfirm = async () => {
    if (company) {
      await onConfirm(company);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isDeleting) {
      onClose();
    }
  };

  if (!isOpen || !company) return <></>;

  return (
    <Modal isOpen={isOpen} onClose={onClose} id="confirmDeleteCompanyModal">
      <div onKeyDown={handleKeyDown}>
        <Modal.Header onClose={isDeleting ? undefined : onClose}>
          Подтверждение удаления
        </Modal.Header>

        <Modal.Content>
          <div className="confirm-delete">
            <div className="confirm-delete__icon">
              ⚠️
            </div>
            
            <div className="confirm-delete__content">
              <h3 className="confirm-delete__title">
                Удалить компанию?
              </h3>
              
              <p className="confirm-delete__message">
                Вы действительно хотите удалить компанию <strong>"{company.name}"</strong>?
              </p>
              
              <div className="confirm-delete__warning">
                <p><strong>Внимание!</strong> Это действие нельзя отменить.</p>
                <p>Все связанные данные (проекты, сотрудники) могут быть затронуты.</p>
              </div>
            </div>
          </div>
        </Modal.Content>

        <Modal.Footer>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isDeleting}
            style={{ marginRight: '1rem' }}
          >
            Отмена
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Удаление...' : 'Удалить компанию'}
          </Button>
        </Modal.Footer>
      </div>
    </Modal>
  );
}

export default ConfirmDeleteCompanyModal;