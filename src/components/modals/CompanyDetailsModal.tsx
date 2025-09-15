import React from 'react';
import Modal from '../common/modal/modal';
import Button from '../common/button/button';
import type { Company } from '../../store/types';

interface CompanyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  onEdit?: ((company: Company) => void) | undefined;
}

function CompanyDetailsModal({ isOpen, onClose, company, onEdit }: CompanyDetailsModalProps): JSX.Element {
  const handleEdit = () => {
    if (company && onEdit) {
      onEdit(company);
    }
  };

  const getCompanyTypeDisplayName = (type: string): string => {
    switch (type) {
      case 'Customer': return 'Заказчик';
      case 'Contractor': return 'Подрядчик';
      default: return type;
    }
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

          </div>

          {(company.address || company.postalCode || company.phone || company.email || company.website) && (
            <div className="company-details__section">
              <h3 className="company-details__title">Контактная информация</h3>

              {company.address && (
                <div className="company-details__field">
                  <label className="company-details__label">Адрес:</label>
                  <span className="company-details__value">{company.address}</span>
                </div>
              )}

              {company.postalCode && (
                <div className="company-details__field">
                  <label className="company-details__label">Почтовый индекс:</label>
                  <span className="company-details__value">{company.postalCode}</span>
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

              {company.website && (
                <div className="company-details__field">
                  <label className="company-details__label">Веб-сайт:</label>
                  <span className="company-details__value">
                    <a href={company.website} target="_blank" rel="noopener noreferrer">
                      {company.website}
                    </a>
                  </span>
                </div>
              )}
            </div>
          )}

          {(company.inn || company.kpp || company.ogrn) && (
            <div className="company-details__section">
              <h3 className="company-details__title">Реквизиты компании</h3>

              {company.inn && (
                <div className="company-details__field">
                  <label className="company-details__label">ИНН:</label>
                  <span className="company-details__value">{company.inn}</span>
                </div>
              )}

              {company.kpp && (
                <div className="company-details__field">
                  <label className="company-details__label">КПП:</label>
                  <span className="company-details__value">{company.kpp}</span>
                </div>
              )}

              {company.ogrn && (
                <div className="company-details__field">
                  <label className="company-details__label">ОГРН:</label>
                  <span className="company-details__value">{company.ogrn}</span>
                </div>
              )}
            </div>
          )}

          {(company.bank || company.account || company.bik || company.corrAccount) && (
            <div className="company-details__section">
              <h3 className="company-details__title">Банковские реквизиты</h3>

              {company.bank && (
                <div className="company-details__field">
                  <label className="company-details__label">Банк:</label>
                  <span className="company-details__value">{company.bank}</span>
                </div>
              )}

              {company.account && (
                <div className="company-details__field">
                  <label className="company-details__label">Расчётный счёт:</label>
                  <span className="company-details__value">{company.account}</span>
                </div>
              )}

              {company.bik && (
                <div className="company-details__field">
                  <label className="company-details__label">БИК:</label>
                  <span className="company-details__value">{company.bik}</span>
                </div>
              )}

              {company.corrAccount && (
                <div className="company-details__field">
                  <label className="company-details__label">Корреспондентский счёт:</label>
                  <span className="company-details__value">{company.corrAccount}</span>
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