import React from 'react';
import Modal from '../common/modal/modal';
import Button from '../common/button/button';
import type { Company } from '../../store/types';

interface CompanyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  onEdit?: (company: Company) => void;
}

function CompanyDetailsModal({ isOpen, onClose, company, onEdit }: CompanyDetailsModalProps): JSX.Element {
  const handleEdit = () => {
    if (company && onEdit) {
      onEdit(company);
    }
  };

  const getCompanyTypeDisplayName = (type: string | undefined): string => {
    const typeMap: { [key: string]: string } = {
      'customer': 'Заказчик',
      'contractor': 'Подрядчик', 
      'partner': 'Партнер'
    };
    return type ? (typeMap[type] || type) : 'Не указан';
  };

  if (!isOpen || !company) return <></>;

  return (
    <Modal isOpen={isOpen} onClose={onClose} id="companyDetailsModal">
      <Modal.Header onClose={onClose}>
        Информация о компании
      </Modal.Header>

      <Modal.Content>
        <div className="company-details">
          <div className="company-details__section">
            <h3 className="company-details__title">Основная информация</h3>
            
            <div className="company-details__field">
              <label className="company-details__label">Название:</label>
              <span className="company-details__value">{company.name}</span>
            </div>

            <div className="company-details__field">
              <label className="company-details__label">Тип:</label>
              <span className="company-details__value">{getCompanyTypeDisplayName(company.type)}</span>
            </div>

            {company.inn && (
              <div className="company-details__field">
                <label className="company-details__label">ИНН:</label>
                <span className="company-details__value">{company.inn}</span>
              </div>
            )}
          </div>

          {(company.address || company.phone || company.email) && (
            <div className="company-details__section">
              <h3 className="company-details__title">Контактная информация</h3>
              
              {company.address && (
                <div className="company-details__field">
                  <label className="company-details__label">Адрес:</label>
                  <span className="company-details__value">{company.address}</span>
                </div>
              )}

              {company.phone && (
                <div className="company-details__field">
                  <label className="company-details__label">Телефон:</label>
                  <span className="company-details__value">{company.phone}</span>
                </div>
              )}

              {company.email && (
                <div className="company-details__field">
                  <label className="company-details__label">Email:</label>
                  <span className="company-details__value">
                    <a href={`mailto:${company.email}`}>{company.email}</a>
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="company-details__section">
            <h3 className="company-details__title">Системная информация</h3>
            
            <div className="company-details__field">
              <label className="company-details__label">Дата создания:</label>
              <span className="company-details__value">
                {new Date(company.createdAt).toLocaleDateString('ru-RU')}
              </span>
            </div>

            <div className="company-details__field">
              <label className="company-details__label">Последнее обновление:</label>
              <span className="company-details__value">
                {new Date(company.updatedAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>
        </div>
      </Modal.Content>

      <Modal.Footer>
        {onEdit && (
          <Button
            variant="secondary"
            onClick={handleEdit}
            style={{ marginRight: '1rem' }}
          >
            Редактировать
          </Button>
        )}
        <Button onClick={onClose}>
          Закрыть
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CompanyDetailsModal;