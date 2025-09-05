import Header from '../../components/layout/header/header';
import PageHeader from '../../components/layout/page_header/page_header';
import Card from '../../components/common/card/card';
import Button from '../../components/common/button/button';
import SearchInput from '../../components/common/search_input/search_input';
import Filters from '../../components/common/filters/filters';
import FormSelect from '../../components/forms/form_select/form_select';
import Table from '../../components/data_display/table/table';
import Pagination from '../../components/common/pagination/pagination';
import Modal from '../../components/common/modal/modal';
import FormGroup from '../../components/forms/form_group/form_group';
import FormInput from '../../components/forms/form_input/form_input';
import LoadingState from '../../components/common/loading_state/loading_state';
import EmptyState from '../../components/common/empty_state/empty_state';

function Projects(): JSX.Element {
  return (
    <>
      {/* Header */}
      <Header activeNavItem="projects" />

      {/* Main Content */}
      <main className="main">
        <PageHeader 
          title="Проекты" 
          subtitle="Управление строительными проектами и документооборотом" 
        />

        <div className="container">
          {/* Filters and Search */}
          <Card>
            <Filters>
              <Filters.Group>
                <Filters.Label htmlFor="statusFilter">Статус:</Filters.Label>
                <FormSelect id="statusFilter" className="filters__select">
                  <option value="all">Все</option>
                  <option value="active">Активные</option>
                  <option value="completed">Завершенные</option>
                  <option value="overdue">Просроченные</option>
                </FormSelect>
              </Filters.Group>
              
              <Filters.Group>
                <Filters.Label htmlFor="typeFilter">Тип:</Filters.Label>
                <FormSelect id="typeFilter" className="filters__select">
                  <option value="all">Все</option>
                  <option value="main">Основные</option>
                  <option value="additional">Дополнительные</option>
                </FormSelect>
              </Filters.Group>
              
              <Filters.Group>
                <Filters.Label htmlFor="customerFilter">Заказчик:</Filters.Label>
                <FormSelect id="customerFilter" className="filters__select">
                  <option value="all">Все</option>
                </FormSelect>
              </Filters.Group>

              <SearchInput 
                id="searchInput" 
                placeholder="Поиск проектов..."
              />

              <Button id="newProjectButton">
                + Новый проект
              </Button>
            </Filters>
          </Card>

          {/* Projects Table */}
          <Table.Container>
            <Table>
              <Table.Head>
                <tr>
                  <Table.Header sortable sortKey="name">Название проекта</Table.Header>
                  <Table.Header sortable sortKey="customer">Заказчик</Table.Header>
                  <Table.Header sortable sortKey="manager">Менеджер</Table.Header>
                  <Table.Header sortable sortKey="contractDate">Дата договора</Table.Header>
                  <Table.Header sortable sortKey="expirationDate">Срок сдачи</Table.Header>
                  <Table.Header sortable sortKey="cost">Стоимость</Table.Header>
                  <Table.Header sortable sortKey="status">Статус</Table.Header>
                  <Table.Header>Действия</Table.Header>
                </tr>
              </Table.Head>
              <Table.Body id="projectsTableBody">
                {/* Проекты будут загружены здесь */}
              </Table.Body>
            </Table>

            {/* Loading State */}
            <LoadingState id="loadingState" message="Загрузка проектов..." />

            {/* Empty State */}
            <EmptyState 
              id="emptyState" 
              message="Проекты не найдены" 
              show={false}
              actionButton={<Button>Создать первый проект</Button>}
            />
          </Table.Container>

          {/* Pagination */}
          <Pagination>
            <Pagination.Info 
              itemsShown={0} 
              totalItems={0} 
              itemName="проектов" 
            />
            <Pagination.Controls>
              <Pagination.Button id="prevButton">← Назад</Pagination.Button>
              <div id="pageNumbers"></div>
              <Pagination.Button id="nextButton">Далее →</Pagination.Button>
            </Pagination.Controls>
          </Pagination>
        </div>
      </main>

      {/* New Project Modal */}
      <Modal id="newProjectModal">
        <Modal.Header>Новый проект</Modal.Header>
        <Modal.Content>
          <form className="form" id="newProjectForm">
            <FormGroup>
              <FormGroup.Label htmlFor="projectName" required>Название проекта</FormGroup.Label>
              <FormInput type="text" id="projectName" placeholder="ЖК Солнечный" required />
            </FormGroup>
            
            <FormGroup>
              <FormGroup.Label htmlFor="projectType" required>Тип проекта</FormGroup.Label>
              <FormSelect id="projectType" required>
                <option value="">Выберите тип</option>
                <option value="main">Основной</option>
                <option value="additional">Дополнительное соглашение</option>
              </FormSelect>
            </FormGroup>

            <FormGroup id="mainProjectGroup" style={{display: 'none'}}>
              <FormGroup.Label htmlFor="mainProject" required>Основной проект</FormGroup.Label>
              <FormSelect id="mainProject">
                <option value="">Выберите основной проект</option>
              </FormSelect>
            </FormGroup>
            
            <FormGroup>
              <FormGroup.Label htmlFor="projectCustomer" required>Заказчик</FormGroup.Label>
              <FormSelect id="projectCustomer" required>
                <option value="">Выберите заказчика</option>
              </FormSelect>
            </FormGroup>
            
            <FormGroup>
              <FormGroup.Label htmlFor="projectManager">Менеджер проекта</FormGroup.Label>
              <FormSelect id="projectManager">
                <option value="">Назначить позже</option>
              </FormSelect>
            </FormGroup>
            
            <FormGroup>
              <FormGroup.Label htmlFor="contractDate" required>Дата договора</FormGroup.Label>
              <FormInput type="date" id="contractDate" required />
            </FormGroup>
            
            <FormGroup>
              <FormGroup.Label htmlFor="expirationDate" required>Срок сдачи</FormGroup.Label>
              <FormInput type="date" id="expirationDate" required />
            </FormGroup>
            
            <FormGroup>
              <FormGroup.Label htmlFor="projectCost" required>Стоимость (руб.)</FormGroup.Label>
              <FormInput type="number" id="projectCost" placeholder="5000000" required min="0" step="1000" />
            </FormGroup>
          </form>
        </Modal.Content>
        <Modal.Footer>
          <Button variant="secondary">Отмена</Button>
          <Button id="createProjectButton">Создать проект</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Projects;