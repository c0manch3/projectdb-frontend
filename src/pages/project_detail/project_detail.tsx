function ProjectDetail(): JSX.Element {
  return (
    <>
      {/* Header */}
      <header className="header">
        <a href="projects.html" className="header__logo">LenconDB</a>
        
        <nav className="header__nav">
          <a href="projects.html" className="header__nav-link">Проекты</a>
          <a href="employees.html" className="header__nav-link" id="employeesNav">Сотрудники</a>
          <a href="companies.html" className="header__nav-link">Компании</a>
          <a href="workload.html" className="header__nav-link">Загруженность</a>
        </nav>
        
        <div className="header__user">
          <div className="header__user-info">
            <div className="header__user-name" id="userName">Загрузка...</div>
            <div className="header__user-role" id="userRole">Загрузка...</div>
          </div>
          <div className="header__user-avatar" id="userAvatar">?</div>
          <button className="button button--secondary button--small">Выйти</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        <div className="page-header">
          <div className="container">
            <div className="breadcrumbs">
              <a href="projects.html" className="breadcrumbs__link">Проекты</a>
              <span className="breadcrumbs__separator">›</span>
              <span className="breadcrumbs__item" id="projectBreadcrumb">Загрузка...</span>
            </div>
            <h1 className="page-header__title" id="projectTitle">Загрузка...</h1>
            <p className="page-header__subtitle" id="projectSubtitle">Загрузка...</p>
          </div>
        </div>

        <div className="container">
          {/* Project Info Card */}
          <div className="card" id="projectInfoCard">
            <div className="card__content">
              <div id="projectInfoContent">
                <p>Загрузка информации о проекте...</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="card" style={{marginTop: '1.5rem'}}>
            <div className="tabs">
              <div className="tabs__list">
                <button className="tabs__button tabs__button--active" data-tab="constructions">
                  Конструкции <span id="constructionsCount" className="status-badge status-badge--pending">0</span>
                </button>
                <button className="tabs__button" data-tab="documents">
                  Документы <span id="documentsCount" className="status-badge status-badge--pending">0</span>
                </button>
                <button className="tabs__button" data-tab="team">
                  Команда <span id="teamCount" className="status-badge status-badge--pending">0</span>
                </button>
                <button className="tabs__button" data-tab="workload">
                  Загруженность
                </button>
              </div>
            </div>
            
            <div className="tabs__content">
              {/* Constructions Tab */}
              <div id="constructions-tab" className="tab-content">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                  <h3>Конструкции</h3>
                  <button className="button button--primary" id="newConstructionButton">
                    + Новая конструкция
                  </button>
                </div>
                
                <div className="table-container">
                  <table className="table">
                    <thead className="table__head">
                      <tr>
                        <th className="table__header">Название конструкции</th>
                        <th className="table__header">Количество документов</th>
                        <th className="table__header">Дата создания</th>
                        <th className="table__header">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="table__body" id="constructionsTableBody">
                      {/* Конструкции будут загружены здесь */}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Documents Tab */}
              <div id="documents-tab" className="tab-content" style={{display: 'none'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                  <h3>Документы</h3>
                  <button className="button button--primary" id="uploadDocumentButton">
                    📤 Загрузить документ
                  </button>
                </div>

                <div style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem'}}>
                  <select id="documentTypeFilter" className="form__select" style={{minWidth: '200px'}}>
                    <option value="all">Все типы документов</option>
                    <option value="km">КМ - Конструкции металлические</option>
                    <option value="kz">КЖ - Конструкции железобетонные</option>
                    <option value="rpz">РПЗ - Расчетно-пояснительная записка</option>
                    <option value="tz">ТЗ - Техническое задание</option>
                    <option value="gp">ГП - Генплан</option>
                    <option value="igi">ИГИ - Инженерно-геологические изыскания</option>
                    <option value="spozu">СПОЗУ - Схема планировочной организации</option>
                    <option value="contract">Договор</option>
                  </select>
                  <select id="documentContextFilter" className="form__select" style={{minWidth: '200px'}}>
                    <option value="all">Все контексты</option>
                    <option value="initial_data">Исходные данные</option>
                    <option value="project_doc">Проектная документация</option>
                  </select>
                </div>
                
                <div className="table-container">
                  <table className="table">
                    <thead className="table__head">
                      <tr>
                        <th className="table__header">Название файла</th>
                        <th className="table__header">Тип</th>
                        <th className="table__header">Контекст</th>
                        <th className="table__header">Конструкция</th>
                        <th className="table__header">Размер</th>
                        <th className="table__header">Дата загрузки</th>
                        <th className="table__header">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="table__body" id="documentsTableBody">
                      {/* Документы будут загружены здесь */}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Team Tab */}
              <div id="team-tab" className="tab-content" style={{display: 'none'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                  <h3>Команда проекта</h3>
                  <button className="button button--primary" id="addTeamMemberButton">
                    + Добавить участника
                  </button>
                </div>
                
                <div className="table-container">
                  <table className="table">
                    <thead className="table__head">
                      <tr>
                        <th className="table__header">ФИО</th>
                        <th className="table__header">Email</th>
                        <th className="table__header">Роль</th>
                        <th className="table__header">Компания</th>
                        <th className="table__header">Дата добавления</th>
                        <th className="table__header">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="table__body" id="teamTableBody">
                      {/* Участники команды будут загружены здесь */}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Workload Tab */}
              <div id="workload-tab" className="tab-content" style={{display: 'none'}}>
                <h3 style={{marginBottom: '1.5rem'}}>Загруженность по проекту</h3>
                
                <div style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem'}}>
                  <select id="workloadPeriod" className="form__select">
                    <option value="week">Текущая неделя</option>
                    <option value="month">Текущий месяц</option>
                  </select>
                  <select id="workloadEmployee" className="form__select">
                    <option value="all">Все сотрудники</option>
                  </select>
                </div>

                <div className="workload-calendar" id="workloadCalendar">
                  {/* Календарь загруженности будет отрендерен здесь */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* New Construction Modal */}
      <div className="modal-overlay" id="newConstructionModal">
        <div className="modal">
          <div className="modal__header">
            <h3 className="modal__title">Новая конструкция</h3>
            <button className="modal__close">×</button>
          </div>
          <div className="modal__content">
            <form className="form" id="newConstructionForm">
              <div className="form__group">
                <label htmlFor="constructionName" className="form__label form__label--required">Название конструкции</label>
                <input 
                  type="text" 
                  id="constructionName" 
                  className="form__input" 
                  placeholder="Например: Фундаментная плита корпуса А" 
                  required
                />
              </div>
            </form>
          </div>
          <div className="modal__footer">
            <button className="button button--secondary">Отмена</button>
            <button className="button button--primary">Создать</button>
          </div>
        </div>
      </div>

      {/* Upload Document Modal */}
      <div className="modal-overlay" id="uploadDocumentModal">
        <div className="modal">
          <div className="modal__header">
            <h3 className="modal__title">Загрузить документ</h3>
            <button className="modal__close">×</button>
          </div>
          <div className="modal__content">
            <form className="form" id="uploadDocumentForm">
              <div className="file-upload" id="fileUpload">
                <input type="file" id="fileInput" className="file-upload__input" accept=".pdf,.dwg,.doc,.docx,.xls,.xlsx" multiple />
                <div className="file-upload__icon">📄</div>
                <div className="file-upload__text">Перетащите файлы сюда или нажмите для выбора</div>
                <div className="file-upload__hint">Поддерживаемые форматы: PDF, DWG, DOC, DOCX, XLS, XLSX (до 100 МБ)</div>
              </div>

              <div className="form__group">
                <label htmlFor="documentType" className="form__label form__label--required">Тип документа</label>
                <select id="documentType" className="form__select" required>
                  <option value="">Выберите тип</option>
                  <option value="km">КМ - Конструкции металлические</option>
                  <option value="kz">КЖ - Конструкции железобетонные</option>
                  <option value="rpz">РПЗ - Расчетно-пояснительная записка</option>
                  <option value="tz">ТЗ - Техническое задание</option>
                  <option value="gp">ГП - Генплан</option>
                  <option value="igi">ИГИ - Инженерно-геологические изыскания</option>
                  <option value="spozu">СПОЗУ - Схема планировочной организации</option>
                  <option value="contract">Договор</option>
                </select>
              </div>

              <div className="form__group">
                <label htmlFor="documentContext" className="form__label form__label--required">Контекст документа</label>
                <select id="documentContext" className="form__select" required>
                  <option value="">Выберите контекст</option>
                  <option value="initial_data">Исходные данные</option>
                  <option value="project_doc">Проектная документация</option>
                </select>
              </div>

              <div className="form__group">
                <label htmlFor="constructionSelect" className="form__label">Конструкция (опционально)</label>
                <select id="constructionSelect" className="form__select">
                  <option value="">Не привязан к конструкции</option>
                </select>
              </div>

              <div className="progress-bar" id="uploadProgress" style={{display: 'none'}}>
                <div className="progress-bar__fill" id="progressFill"></div>
              </div>
            </form>
          </div>
          <div className="modal__footer">
            <button className="button button--secondary">Отмена</button>
            <button className="button button--primary" id="uploadButton">Загрузить</button>
          </div>
        </div>
      </div>

      {/* Add Team Member Modal */}
      <div className="modal-overlay" id="addTeamMemberModal">
        <div className="modal">
          <div className="modal__header">
            <h3 className="modal__title">Добавить участника</h3>
            <button className="modal__close">×</button>
          </div>
          <div className="modal__content">
            <form className="form" id="addTeamMemberForm">
              <div className="form__group">
                <label htmlFor="employeeSelect" className="form__label form__label--required">Сотрудник</label>
                <select id="employeeSelect" className="form__select" required>
                  <option value="">Выберите сотрудника</option>
                </select>
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

export default ProjectDetail;