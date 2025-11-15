import React from 'react';
import { useSelector } from 'react-redux';
import Modal from '../common/modal/modal';
import Button from '../common/button/button';
import type { User } from '../../store/types';
import { selectCurrentUser } from '../../store/slices/auth_slice';

interface EmployeeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: User | null;
  onEdit?: ((employee: User) => void) | undefined;
}

function EmployeeDetailsModal({ isOpen, onClose, employee, onEdit }: EmployeeDetailsModalProps): JSX.Element {
  const currentUser = useSelector(selectCurrentUser);
  const isAdmin = currentUser?.role === 'Admin';

  const handleEdit = () => {
    if (employee && onEdit) {
      onEdit(employee);
    }
  };

  const getRoleDisplayName = (role: string): string => {
    switch (role) {
      case 'Admin': return 'Администратор';
      case 'Manager': return 'Менеджер';
      case 'Employee': return 'Сотрудник';
      default: return role;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  if (!isOpen || !employee) return <></>;

  return (
    <Modal isOpen={isOpen} onClose={onClose} id="employeeDetailsModal">
      <Modal.Header onClose={onClose}>
        Информация о сотруднике
      </Modal.Header>

      <Modal.Content>
        <div className="employee-details">
          <div className="employee-details__section">
            <h3 className="employee-details__title">Основная информация</h3>

            <div className="employee-details__field">
              <label className="employee-details__label">Имя:</label>
              <span className="employee-details__value">{employee.firstName}</span>
            </div>

            <div className="employee-details__field">
              <label className="employee-details__label">Фамилия:</label>
              <span className="employee-details__value">{employee.lastName}</span>
            </div>

            <div className="employee-details__field">
              <label className="employee-details__label">Роль:</label>
              <span className="employee-details__value">{getRoleDisplayName(employee.role)}</span>
            </div>

            <div className="employee-details__field">
              <label className="employee-details__label">Дата рождения:</label>
              <span className="employee-details__value">{formatDate(employee.dateBirth)}</span>
            </div>

            {isAdmin && (
              <div className="employee-details__field">
                <label className="employee-details__label">Зарплата:</label>
                <span className="employee-details__value">
                  {employee.salary !== undefined && employee.salary !== null
                    ? `${employee.salary.toLocaleString('ru-RU')} ₽`
                    : 'Не указана'}
                </span>
              </div>
            )}
          </div>

          <div className="employee-details__section">
            <h3 className="employee-details__title">Контактная информация</h3>

            <div className="employee-details__field">
              <label className="employee-details__label">Email:</label>
              <span className="employee-details__value">
                <a href={`mailto:${employee.email}`}>{employee.email}</a>
              </span>
            </div>

            <div className="employee-details__field">
              <label className="employee-details__label">Телефон:</label>
              <span className="employee-details__value">{employee.phone}</span>
            </div>

            {employee.telegramId && (
              <div className="employee-details__field">
                <label className="employee-details__label">Telegram ID:</label>
                <span className="employee-details__value">{employee.telegramId}</span>
              </div>
            )}
          </div>

          <div className="employee-details__section">
            <h3 className="employee-details__title">Системная информация</h3>

            <div className="employee-details__field">
              <label className="employee-details__label">Дата создания:</label>
              <span className="employee-details__value">
                {formatDate(employee.createdAt)}
              </span>
            </div>

            <div className="employee-details__field">
              <label className="employee-details__label">Последнее обновление:</label>
              <span className="employee-details__value">
                {formatDate(employee.updatedAt)}
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

export default EmployeeDetailsModal;
