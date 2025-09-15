import React from 'react';
import Modal from '../common/modal/modal';
import Button from '../common/button/button';
import FormInput from '../forms/form_input/form_input';
import FormSelect from '../forms/form_select/form_select';
import FormGroup from '../forms/form_group/form_group';
import type { Company } from '../../store/types';

interface EditCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
}

function EditCompanyModal({ isOpen, onClose, company }: EditCompanyModalProps): JSX.Element {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement company update
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen || !company) return <></>;

  return (
    <Modal isOpen={isOpen} onClose={onClose} id="editCompanyModal">
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        <Modal.Header onClose={onClose}>
          Редактировать компанию
        </Modal.Header>

        <Modal.Content>
          <div className="form">
            <FormGroup>
              <FormGroup.Label htmlFor="editCompanyName" required>Название компании</FormGroup.Label>
              <FormInput
                id="editCompanyName"
                type="text"
                placeholder="Введите название компании"
                defaultValue={company.name}
                required
              />
            </FormGroup>

            <FormGroup>
              <FormGroup.Label htmlFor="editCompanyType" required>Тип компании</FormGroup.Label>
              <FormSelect id="editCompanyType" defaultValue={company.type || ''} required>
                <option value="">Выберите тип</option>
                <option value="customer">Заказчик</option>
                <option value="contractor">Подрядчик</option>
                <option value="partner">Партнер</option>
              </FormSelect>
            </FormGroup>

            <FormGroup>
              <FormGroup.Label htmlFor="editCompanyInn">ИНН</FormGroup.Label>
              <FormInput
                id="editCompanyInn"
                type="text"
                placeholder="Введите ИНН"
                defaultValue={company.inn || ''}
              />
            </FormGroup>

            <FormGroup>
              <FormGroup.Label htmlFor="editCompanyAddress">Адрес</FormGroup.Label>
              <FormInput
                id="editCompanyAddress"
                type="text"
                placeholder="Введите адрес"
                defaultValue={company.address || ''}
              />
            </FormGroup>

            <FormGroup>
              <FormGroup.Label htmlFor="editCompanyPhone">Телефон</FormGroup.Label>
              <FormInput
                id="editCompanyPhone"
                type="tel"
                placeholder="Введите телефон"
                defaultValue={company.phone || ''}
              />
            </FormGroup>

            <FormGroup>
              <FormGroup.Label htmlFor="editCompanyEmail">Email</FormGroup.Label>
              <FormInput
                id="editCompanyEmail"
                type="email"
                placeholder="Введите email"
                defaultValue={company.email || ''}
              />
            </FormGroup>
          </div>
        </Modal.Content>

        <Modal.Footer>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            style={{ marginRight: '1rem' }}
          >
            Отмена
          </Button>
          <Button type="submit">
            Сохранить изменения
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default EditCompanyModal;