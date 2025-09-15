import React from 'react';
import Modal from '../common/modal/modal';
import Button from '../common/button/button';
import FormInput from '../forms/form_input/form_input';
import FormSelect from '../forms/form_select/form_select';
import FormGroup from '../forms/form_group/form_group';

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function AddCompanyModal({ isOpen, onClose }: AddCompanyModalProps): JSX.Element {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement company creation
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return <></>;

  return (
    <Modal isOpen={isOpen} onClose={onClose} id="addCompanyModal">
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        <Modal.Header onClose={onClose}>
          Добавить компанию
        </Modal.Header>

        <Modal.Content>
          <div className="form">
            <FormGroup>
              <FormGroup.Label htmlFor="companyName" required>Название компании</FormGroup.Label>
              <FormInput
                id="companyName"
                type="text"
                placeholder="Введите название компании"
                required
              />
            </FormGroup>

            <FormGroup>
              <FormGroup.Label htmlFor="companyType" required>Тип компании</FormGroup.Label>
              <FormSelect id="companyType" required>
                <option value="">Выберите тип</option>
                <option value="customer">Заказчик</option>
                <option value="contractor">Подрядчик</option>
                <option value="partner">Партнер</option>
              </FormSelect>
            </FormGroup>

            <FormGroup>
              <FormGroup.Label htmlFor="companyInn">ИНН</FormGroup.Label>
              <FormInput
                id="companyInn"
                type="text"
                placeholder="Введите ИНН"
              />
            </FormGroup>

            <FormGroup>
              <FormGroup.Label htmlFor="companyAddress">Адрес</FormGroup.Label>
              <FormInput
                id="companyAddress"
                type="text"
                placeholder="Введите адрес"
              />
            </FormGroup>

            <FormGroup>
              <FormGroup.Label htmlFor="companyPhone">Телефон</FormGroup.Label>
              <FormInput
                id="companyPhone"
                type="tel"
                placeholder="Введите телефон"
              />
            </FormGroup>

            <FormGroup>
              <FormGroup.Label htmlFor="companyEmail">Email</FormGroup.Label>
              <FormInput
                id="companyEmail"
                type="email"
                placeholder="Введите email"
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
            Создать компанию
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default AddCompanyModal;