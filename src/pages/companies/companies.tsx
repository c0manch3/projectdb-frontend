import Header from '../../components/layout/header/header';
import PageHeader from '../../components/layout/page_header/page_header';
import Card from '../../components/common/card/card';
import Button from '../../components/common/button/button';
import SearchInput from '../../components/common/search_input/search_input';
import Filters from '../../components/common/filters/filters';
import StatCard from '../../components/data_display/stat_card/stat_card';
import Modal from '../../components/common/modal/modal';
import FormGroup from '../../components/forms/form_group/form_group';
import FormInput from '../../components/forms/form_input/form_input';
import FormSelect from '../../components/forms/form_select/form_select';
import FormTextarea from '../../components/forms/form_textarea/form_textarea';
import LoadingState from '../../components/common/loading_state/loading_state';
import EmptyState from '../../components/common/empty_state/empty_state';

function Companies(): JSX.Element {
  return (
    <>
      {/* Header */}
      <Header activeNavItem="companies" />

      {/* Main Content */}
      <main className="main">
        <PageHeader 
          title="Компании" 
          subtitle="Управление компаниями-заказчиками и подрядчиками" 
        />

        <div className="container">
          {/* Search and Actions */}
          <Card>
            <Filters>
              <SearchInput 
                id="searchInput" 
                placeholder="Поиск по названию компании..."
              />

              <Button id="newCompanyButton">
                + Новая компания
              </Button>
            </Filters>
          </Card>

          {/* Statistics Cards */}
          <StatCard.Grid>
            <StatCard 
              value={0} 
              label="Всего компаний" 
              color="primary" 
              id="totalCompanies" 
            />
            <StatCard 
              value={0} 
              label="Активных проектов" 
              color="success" 
              id="activeProjects" 
            />
            <StatCard 
              value={0} 
              label="Заказчиков" 
              color="warning" 
              id="customersCount" 
            />
            <StatCard 
              value={0} 
              label="Подрядчиков" 
              color="secondary" 
              id="contractorsCount" 
            />
          </StatCard.Grid>

          {/* Companies Grid */}
          <div id="companiesGrid" className="project-grid">
            {/* Карточки компаний будут загружены здесь */}
          </div>

          {/* Loading State */}
          <LoadingState id="loadingState" message="Загрузка компаний..." />

          {/* Empty State */}
          <EmptyState 
            id="emptyState" 
            message="Компании не найдены" 
            show={false}
            actionButton={<Button>Создать первую компанию</Button>}
          />
        </div>
      </main>

      {/* New Company Modal */}
      <Modal id="newCompanyModal">
        <Modal.Header>Новая компания</Modal.Header>
        <Modal.Content>
          <form className="form" id="newCompanyForm">
            <FormGroup>
              <FormGroup.Label htmlFor="companyName" required>Название компании</FormGroup.Label>
              <FormInput 
                type="text" 
                id="companyName" 
                placeholder='ООО "СтройКомпания"' 
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
              <FormGroup.Label htmlFor="inn">ИНН</FormGroup.Label>
              <FormInput 
                type="text" 
                id="inn" 
                placeholder="1234567890" 
                maxLength={12}
                pattern="[0-9]{10,12}"
              />
              <FormGroup.Help>10 цифр для организаций, 12 для ИП</FormGroup.Help>
            </FormGroup>
            
            <FormGroup>
              <FormGroup.Label htmlFor="kpp">КПП</FormGroup.Label>
              <FormInput 
                type="text" 
                id="kpp" 
                placeholder="123456789" 
                maxLength={9}
                pattern="[0-9]{9}"
              />
            </FormGroup>
            
            <FormGroup>
              <FormGroup.Label htmlFor="address">Юридический адрес</FormGroup.Label>
              <FormTextarea 
                id="address" 
                placeholder="г. Санкт-Петербург, ул. Примерная, д. 1, оф. 100"
              />
            </FormGroup>
            
            <FormGroup>
              <FormGroup.Label htmlFor="phone">Телефон</FormGroup.Label>
              <FormInput 
                type="tel" 
                id="phone" 
                placeholder="+7 (812) 123-45-67"
              />
            </FormGroup>
            
            <FormGroup>
              <FormGroup.Label htmlFor="email">Email</FormGroup.Label>
              <FormInput 
                type="email" 
                id="email" 
                placeholder="info@company.com"
              />
            </FormGroup>
            
            <FormGroup>
              <FormGroup.Label htmlFor="website">Сайт</FormGroup.Label>
              <FormInput 
                type="url" 
                id="website" 
                placeholder="https://company.com"
              />
            </FormGroup>
            
            <FormGroup>
              <FormGroup.Label htmlFor="description">Описание</FormGroup.Label>
              <FormTextarea 
                id="description" 
                placeholder="Краткое описание деятельности компании"
              />
            </FormGroup>
          </form>
        </Modal.Content>
        <Modal.Footer>
          <Button variant="secondary">Отмена</Button>
          <Button id="createCompanyButton">
            <span id="createButtonText">Создать</span>
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Company Details Modal */}
      <div className="modal-overlay" id="companyDetailsModal">
        <div className="modal">
          <div className="modal__header">
            <h3 className="modal__title" id="detailsModalTitle">Информация о компании</h3>
            <button className="modal__close">×</button>
          </div>
          <div className="modal__content">
            <div id="companyDetailsContent">
              {/* Содержимое будет заполнено динамически */}
            </div>
          </div>
          <div className="modal__footer">
            <button className="button button--secondary">Закрыть</button>
            <button className="button button--primary" id="editCompanyButton">
              Редактировать
            </button>
          </div>
        </div>
      </div>

      {/* Edit Company Modal */}
      <div className="modal-overlay" id="editCompanyModal">
        <div className="modal">
          <div className="modal__header">
            <h3 className="modal__title">Редактировать компанию</h3>
            <button className="modal__close">×</button>
          </div>
          <div className="modal__content">
            <form className="form" id="editCompanyForm">
              <input type="hidden" id="editCompanyId" />
              
              <div className="form__group">
                <label htmlFor="editCompanyName" className="form__label form__label--required">Название компании</label>
                <input type="text" id="editCompanyName" className="form__input" required />
              </div>
              
              <div className="form__group">
                <label htmlFor="editCompanyType" className="form__label form__label--required">Тип компании</label>
                <select id="editCompanyType" className="form__select" required>
                  <option value="customer">Заказчик</option>
                  <option value="contractor">Подрядчик</option>
                  <option value="partner">Партнер</option>
                </select>
              </div>
              
              <div className="form__group">
                <label htmlFor="editInn" className="form__label">ИНН</label>
                <input type="text" id="editInn" className="form__input" maxLength={12} pattern="[0-9]{10,12}" />
              </div>
              
              <div className="form__group">
                <label htmlFor="editKpp" className="form__label">КПП</label>
                <input type="text" id="editKpp" className="form__input" maxLength={9} pattern="[0-9]{9}" />
              </div>
              
              <div className="form__group">
                <label htmlFor="editAddress" className="form__label">Юридический адрес</label>
                <textarea id="editAddress" className="form__textarea"></textarea>
              </div>
              
              <div className="form__group">
                <label htmlFor="editPhone" className="form__label">Телефон</label>
                <input type="tel" id="editPhone" className="form__input" />
              </div>
              
              <div className="form__group">
                <label htmlFor="editEmail" className="form__label">Email</label>
                <input type="email" id="editEmail" className="form__input" />
              </div>
              
              <div className="form__group">
                <label htmlFor="editWebsite" className="form__label">Сайт</label>
                <input type="url" id="editWebsite" className="form__input" />
              </div>
              
              <div className="form__group">
                <label htmlFor="editDescription" className="form__label">Описание</label>
                <textarea id="editDescription" className="form__textarea"></textarea>
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

export default Companies;