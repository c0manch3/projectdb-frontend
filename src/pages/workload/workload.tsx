import Header from '../../components/layout/header/header';
import PageHeader from '../../components/layout/page_header/page_header';
import Card from '../../components/common/card/card';
import Button from '../../components/common/button/button';
import Filters from '../../components/common/filters/filters';
import FormSelect from '../../components/forms/form_select/form_select';
import FormInput from '../../components/forms/form_input/form_input';
import StatCard from '../../components/data_display/stat_card/stat_card';
import Table from '../../components/data_display/table/table';
import Modal from '../../components/common/modal/modal';
import FormGroup from '../../components/forms/form_group/form_group';
import FormTextarea from '../../components/forms/form_textarea/form_textarea';

function Workload(): JSX.Element {
  return (
    <>
      {/* Header */}
      <Header activeNavItem="workload" />

      {/* Main Content */}
      <main className="main">
        <PageHeader 
          title="Загруженность" 
          subtitle="Планирование и учет рабочего времени сотрудников" 
        />

        <div className="container">
          {/* Filters and Controls */}
          <Card>
            <Filters>
              <Filters.Group>
                <Filters.Label htmlFor="employeeFilter">Сотрудник:</Filters.Label>
                <FormSelect id="employeeFilter" className="filters__select">
                  <option value="all">Все сотрудники</option>
                </FormSelect>
              </Filters.Group>
              
              <Filters.Group>
                <Filters.Label htmlFor="projectFilter">Проект:</Filters.Label>
                <FormSelect id="projectFilter" className="filters__select">
                  <option value="all">Все проекты</option>
                </FormSelect>
              </Filters.Group>
              
              <Filters.Group>
                <Filters.Label htmlFor="periodFilter">Период:</Filters.Label>
                <FormSelect id="periodFilter" className="filters__select">
                  <option value="week">Неделя</option>
                  <option value="month" selected>Месяц</option>
                </FormSelect>
              </Filters.Group>

              <Filters.Group>
                <Filters.Label htmlFor="dateInput">Дата:</Filters.Label>
                <FormInput type="date" id="dateInput" style={{minWidth: '150px'}} />
              </Filters.Group>

              <Button title="Экспорт в Excel">
                📊 Экспорт
              </Button>
            </Filters>
          </Card>

          {/* Summary Cards */}
          <StatCard.Grid>
            <StatCard 
              value={0} 
              label="Часов запланировано" 
              color="primary" 
              id="totalHoursPlanned" 
            />
            <StatCard 
              value={0} 
              label="Часов отработано" 
              color="success" 
              id="totalHoursActual" 
            />
            <StatCard 
              value="0%" 
              label="Загруженность" 
              color="warning" 
              id="utilizationRate" 
            />
            <StatCard 
              value={0} 
              label="Активных сотрудников" 
              color="secondary" 
              id="activeEmployees" 
            />
          </StatCard.Grid>

          {/* Tabs */}
          <div className="card">
            <div className="tabs">
              <div className="tabs__list">
                <button className="tabs__button tabs__button--active" data-tab="planned">
                  Плановая загруженность
                </button>
                <button className="tabs__button" data-tab="actual">
                  Фактическая загруженность
                </button>
                <button className="tabs__button" data-tab="comparison">
                  Сравнение план/факт
                </button>
              </div>
            </div>
            
            <div className="tabs__content">
              {/* Planned Workload Tab */}
              <div id="planned-tab" className="tab-content">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                  <h3>Плановая загруженность</h3>
                  <div style={{display: 'flex', gap: '0.5rem'}}>
                    <button className="button button--secondary">
                      📋 Копировать неделю
                    </button>
                    <button className="button button--primary">
                      + Добавить план
                    </button>
                  </div>
                </div>
                
                <div className="workload-calendar" id="plannedWorkloadCalendar">
                  {/* Календарь плановой загруженности */}
                </div>
              </div>

              {/* Actual Workload Tab */}
              <div id="actual-tab" className="tab-content" style={{display: 'none'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                  <h3>Фактическая загруженность</h3>
                  <button className="button button--primary">
                    + Добавить время
                  </button>
                </div>
                
                <div className="workload-calendar" id="actualWorkloadCalendar">
                  {/* Календарь фактической загруженности */}
                </div>
              </div>

              {/* Comparison Tab */}
              <div id="comparison-tab" className="tab-content" style={{display: 'none'}}>
                <h3 style={{marginBottom: '1.5rem'}}>Сравнение план/факт</h3>
                
                <div className="table-container">
                  <table className="table">
                    <thead className="table__head">
                      <tr>
                        <th className="table__header">Сотрудник</th>
                        <th className="table__header">Проект</th>
                        <th className="table__header">План (ч)</th>
                        <th className="table__header">Факт (ч)</th>
                        <th className="table__header">Отклонение</th>
                        <th className="table__header">Загруженность</th>
                      </tr>
                    </thead>
                    <tbody className="table__body" id="comparisonTableBody">
                      {/* Сравнительные данные будут загружены здесь */}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Plan Modal */}
      <div className="modal-overlay" id="addPlanModal">
        <div className="modal">
          <div className="modal__header">
            <h3 className="modal__title">Добавить план</h3>
            <button className="modal__close">×</button>
          </div>
          <div className="modal__content">
            <form className="form" id="addPlanForm">
              <div className="form__group">
                <label htmlFor="planEmployee" className="form__label form__label--required">Сотрудник</label>
                <select id="planEmployee" className="form__select" required>
                  <option value="">Выберите сотрудника</option>
                </select>
              </div>
              
              <div className="form__group">
                <label htmlFor="planProject" className="form__label form__label--required">Проект</label>
                <select id="planProject" className="form__select" required>
                  <option value="">Выберите проект</option>
                </select>
              </div>
              
              <div className="form__group">
                <label htmlFor="planDate" className="form__label form__label--required">Дата</label>
                <input type="date" id="planDate" className="form__input" required />
              </div>
              
              <div className="form__group">
                <label htmlFor="planHours" className="form__label form__label--required">Часы</label>
                <input type="number" id="planHours" className="form__input" min="0" max="24" step="0.5" placeholder="8" required />
              </div>
              
              <div className="form__group">
                <label htmlFor="planDescription" className="form__label">Описание работ</label>
                <textarea id="planDescription" className="form__textarea" placeholder="Описание планируемых работ"></textarea>
              </div>
            </form>
          </div>
          <div className="modal__footer">
            <button className="button button--secondary">Отмена</button>
            <button className="button button--primary">Добавить</button>
          </div>
        </div>
      </div>

      {/* Add Actual Modal */}
      <div className="modal-overlay" id="addActualModal">
        <div className="modal">
          <div className="modal__header">
            <h3 className="modal__title">Добавить отработанное время</h3>
            <button className="modal__close">×</button>
          </div>
          <div className="modal__content">
            <form className="form" id="addActualForm">
              <div className="form__group">
                <label htmlFor="actualEmployee" className="form__label form__label--required">Сотрудник</label>
                <select id="actualEmployee" className="form__select" required>
                  <option value="">Выберите сотрудника</option>
                </select>
              </div>
              
              <div className="form__group">
                <label htmlFor="actualProject" className="form__label form__label--required">Проект</label>
                <select id="actualProject" className="form__select" required>
                  <option value="">Выберите проект</option>
                </select>
              </div>
              
              <div className="form__group">
                <label htmlFor="actualDate" className="form__label form__label--required">Дата</label>
                <input type="date" id="actualDate" className="form__input" required />
              </div>
              
              <div className="form__group">
                <label htmlFor="actualHours" className="form__label form__label--required">Часы</label>
                <input type="number" id="actualHours" className="form__input" min="0" max="24" step="0.5" placeholder="8" required />
              </div>
              
              <div className="form__group">
                <label htmlFor="actualDescription" className="form__label form__label--required">Описание выполненных работ</label>
                <textarea id="actualDescription" className="form__textarea" placeholder="Детальное описание выполненных работ" required></textarea>
                <div className="form__help">Это поле заполняется автоматически из Telegram бота или вручную</div>
              </div>
            </form>
          </div>
          <div className="modal__footer">
            <button className="button button--secondary">Отмена</button>
            <button className="button button--primary">Добавить</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Workload;