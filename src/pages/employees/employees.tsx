import Header from '../../components/layout/header/header';
import PageHeader from '../../components/layout/page_header/page_header';
import Card from '../../components/common/card/card';
import Button from '../../components/common/button/button';
import SearchInput from '../../components/common/search_input/search_input';
import Filters from '../../components/common/filters/filters';
import FormSelect from '../../components/forms/form_select/form_select';
import StatCard from '../../components/data_display/stat_card/stat_card';
import Table from '../../components/data_display/table/table';
import Pagination from '../../components/common/pagination/pagination';
import Modal from '../../components/common/modal/modal';
import FormGroup from '../../components/forms/form_group/form_group';
import FormInput from '../../components/forms/form_input/form_input';
import LoadingState from '../../components/common/loading_state/loading_state';
import EmptyState from '../../components/common/empty_state/empty_state';

function Employees(): JSX.Element {
  return (
    <>
      {/* Header */}
      <Header activeNavItem="employees" />

      {/* Main Content */}
      <main className="main">
        <PageHeader 
          title="Сотрудники" 
          subtitle="Управление пользователями и их ролями в системе" 
        />

        <div className="container">
          {/* Filters and Search */}
          <Card>
            <Filters>
              <Filters.Group>
                <Filters.Label htmlFor="roleFilter">Роль:</Filters.Label>
                <FormSelect id="roleFilter" className="filters__select">
                  <option value="all">Все</option>
                  <option value="Admin">Администратор</option>
                  <option value="Manager">Менеджер</option>
                  <option value="Employee">Сотрудник</option>
                  <option value="Customer">Заказчик</option>
                </FormSelect>
              </Filters.Group>
              
              <Filters.Group>
                <Filters.Label htmlFor="companyFilter">Компания:</Filters.Label>
                <FormSelect id="companyFilter" className="filters__select">
                  <option value="all">Все</option>
                </FormSelect>
              </Filters.Group>

              <SearchInput 
                id="searchInput" 
                placeholder="Поиск по имени, email..."
              />

              <Button id="newEmployeeButton">
                + Добавить сотрудника
              </Button>
            </Filters>
          </Card>

          {/* Statistics Cards */}
          <StatCard.Grid>
            <StatCard 
              value={0} 
              label="Всего сотрудников" 
              color="primary" 
              id="totalEmployees" 
            />
            <StatCard 
              value={0} 
              label="Активных" 
              color="success" 
              id="activeEmployees" 
            />
            <StatCard 
              value={0} 
              label="Менеджеров" 
              color="warning" 
              id="managersCount" 
            />
            <StatCard 
              value={0} 
              label="Конструкторов" 
              color="secondary" 
              id="employeesCount" 
            />
          </StatCard.Grid>

          {/* Employees Table */}
          <Table.Container>
            <Table>
              <Table.Head>
                <tr>
                  <Table.Header sortable sortKey="firstName">ФИО</Table.Header>
                  <Table.Header sortable sortKey="email">Email</Table.Header>
                  <Table.Header sortable sortKey="phone">Телефон</Table.Header>
                  <Table.Header sortable sortKey="role">Роль</Table.Header>
                  <Table.Header sortable sortKey="companyName">Компания</Table.Header>
                  <Table.Header sortable sortKey="dateBirth">Дата рождения</Table.Header>
                  <Table.Header sortable sortKey="createdAt">Дата создания</Table.Header>
                  <Table.Header>Действия</Table.Header>
                </tr>
              </Table.Head>
              <Table.Body id="employeesTableBody">
                {/* Сотрудники будут загружены здесь */}
              </Table.Body>
            </Table>

            {/* Loading State */}
            <LoadingState id="loadingState" message="Загрузка сотрудников..." />

            {/* Empty State */}
            <EmptyState 
              id="emptyState" 
              message="Сотрудники не найдены" 
              show={false}
              actionButton={<Button>Добавить первого сотрудника</Button>}
            />
          </Table.Container>

          {/* Pagination */}
          <Pagination>
            <Pagination.Info 
              itemsShown={0} 
              totalItems={0} 
              itemName="сотрудников" 
            />
            <Pagination.Controls>
              <Pagination.Button id="prevButton">← Назад</Pagination.Button>
              <div id="pageNumbers"></div>
              <Pagination.Button id="nextButton">Далее →</Pagination.Button>
            </Pagination.Controls>
          </Pagination>
        </div>
      </main>

      {/* New Employee Modal */}
      <div className="modal-overlay" id="newEmployeeModal">
        <div className="modal">
          <div className="modal__header">
            <h3 className="modal__title">Новый сотрудник</h3>
            <button className="modal__close">×</button>
          </div>
          <div className="modal__content">
            <form className="form" id="newEmployeeForm">
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <div className="form__group">
                  <label htmlFor="firstName" className="form__label form__label--required">Имя</label>
                  <input type="text" id="firstName" className="form__input" placeholder="Иван" required />
                </div>
                
                <div className="form__group">
                  <label htmlFor="lastName" className="form__label form__label--required">Фамилия</label>
                  <input type="text" id="lastName" className="form__input" placeholder="Иванов" required />
                </div>
              </div>
              
              <div className="form__group">
                <label htmlFor="email" className="form__label form__label--required">Email</label>
                <input type="email" id="email" className="form__input" placeholder="ivan@company.com" required />
                <div className="form__error" id="emailError" style={{display: 'none'}}></div>
              </div>
              
              <div className="form__group">
                <label htmlFor="phone" className="form__label form__label--required">Телефон</label>
                <input type="tel" id="phone" className="form__input" placeholder="+7 (999) 123-45-67" required />
              </div>
              
              <div className="form__group">
                <label htmlFor="dateBirth" className="form__label form__label--required">Дата рождения</label>
                <input type="date" id="dateBirth" className="form__input" required />
              </div>
              
              <div className="form__group">
                <label htmlFor="role" className="form__label form__label--required">Роль</label>
                <select id="role" className="form__select" required>
                  <option value="">Выберите роль</option>
                  <option value="Admin">Администратор</option>
                  <option value="Manager">Менеджер</option>
                  <option value="Employee">Сотрудник</option>
                  <option value="Customer">Заказчик</option>
                </select>
              </div>
              
              <div className="form__group">
                <label htmlFor="companyId" className="form__label form__label--required">Компания</label>
                <select id="companyId" className="form__select" required>
                  <option value="">Выберите компанию</option>
                </select>
              </div>
              
              <div className="form__group">
                <label htmlFor="password" className="form__label form__label--required">Временный пароль</label>
                <input type="password" id="password" className="form__input" placeholder="Минимум 6 символов" required minLength={6} />
                <div className="form__help">Пользователь сможет изменить пароль после первого входа</div>
              </div>

              <div className="form__group">
                <label htmlFor="telegramId" className="form__label">Telegram ID</label>
                <input type="number" id="telegramId" className="form__input" placeholder="123456789" />
                <div className="form__help">Опционально: для интеграции с Telegram ботом учета времени</div>
              </div>
            </form>
          </div>
          <div className="modal__footer">
            <button className="button button--secondary">Отмена</button>
            <button className="button button--primary" id="createEmployeeButton">
              <span id="createButtonText">Создать</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Employee Modal */}
      <div className="modal-overlay" id="editEmployeeModal">
        <div className="modal">
          <div className="modal__header">
            <h3 className="modal__title">Редактировать сотрудника</h3>
            <button className="modal__close">×</button>
          </div>
          <div className="modal__content">
            <form className="form" id="editEmployeeForm">
              <input type="hidden" id="editEmployeeId" />
              
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <div className="form__group">
                  <label htmlFor="editFirstName" className="form__label form__label--required">Имя</label>
                  <input type="text" id="editFirstName" className="form__input" required />
                </div>
                
                <div className="form__group">
                  <label htmlFor="editLastName" className="form__label form__label--required">Фамилия</label>
                  <input type="text" id="editLastName" className="form__input" required />
                </div>
              </div>
              
              <div className="form__group">
                <label htmlFor="editEmail" className="form__label form__label--required">Email</label>
                <input type="email" id="editEmail" className="form__input" required />
              </div>
              
              <div className="form__group">
                <label htmlFor="editPhone" className="form__label form__label--required">Телефон</label>
                <input type="tel" id="editPhone" className="form__input" required />
              </div>
              
              <div className="form__group">
                <label htmlFor="editDateBirth" className="form__label form__label--required">Дата рождения</label>
                <input type="date" id="editDateBirth" className="form__input" required />
              </div>
              
              <div className="form__group">
                <label htmlFor="editRole" className="form__label form__label--required">Роль</label>
                <select id="editRole" className="form__select" required>
                  <option value="Admin">Администратор</option>
                  <option value="Manager">Менеджер</option>
                  <option value="Employee">Сотрудник</option>
                  <option value="Customer">Заказчик</option>
                </select>
              </div>
              
              <div className="form__group">
                <label htmlFor="editCompanyId" className="form__label form__label--required">Компания</label>
                <select id="editCompanyId" className="form__select" required>
                </select>
              </div>

              <div className="form__group">
                <label htmlFor="editTelegramId" className="form__label">Telegram ID</label>
                <input type="number" id="editTelegramId" className="form__input" />
              </div>
            </form>
          </div>
          <div className="modal__footer">
            <button className="button button--secondary">Отмена</button>
            <button className="button button--primary">Сохранить</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Employees;