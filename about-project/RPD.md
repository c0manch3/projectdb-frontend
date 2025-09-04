# LenconDB Frontend - Product Requirements Document

## 1. Краткое описание проекта (Executive Summary)

### 1.1 Описание продукта
LenconDB - система управления проектами и документооборотом для конструкторского бюро, специализирующегося на проектировании железобетонных конструкций. Система обеспечивает централизованное хранение проектной документации, управление командой и учет рабочего времени сотрудников.

### 1.2 Ключевые цели
- Централизация и структурирование проектной документации
- Автоматизация учета рабочего времени конструкторов
- Упрощение доступа к документам проекта для всех участников
- Оптимизация распределения нагрузки между сотрудниками
- Контроль сроков и статусов проектов

### 1.3 Основные метрики успеха
- Сокращение времени поиска документов на 70%
- 100% учет рабочего времени сотрудников
- Снижение количества ошибок при работе с версиями документов
- Повышение загрузки сотрудников до оптимальных 85%
- Соблюдение сроков проектов в 95% случаев

## 2. Анализ проблемы и рыночные возможности

### 2.1 Текущие проблемы
- Отсутствие централизованного хранилища проектной документации
- Сложность отслеживания актуальных версий чертежей КЖ и РПЗ
- Неэффективное распределение нагрузки между конструкторами
- Отсутствие прозрачности в учете рабочего времени
- Риски потери документации при передаче между отделами

### 2.2 Целевая аудитория
**Основные пользователи:**
- Конструкторы ЖБК (70-80 человек)
- Руководители проектов (10-15 человек)  
- Администраторы системы (2-3 человека)
- Руководство компании (5-7 человек)

### 2.3 Конкурентные преимущества
- Специализация на нуждах конструкторских бюро
- Интеграция с Telegram для удобного учета времени
- Типизация документов согласно ГОСТ и стандартам проектирования
- Простой и понятный интерфейс без избыточного функционала

## 3. Цели и метрики успеха

### 3.1 Бизнес-цели
- **Повышение производительности**: Экономия 2-3 часов в неделю на каждого конструктора
- **Улучшение контроля**: 100% прозрачность загрузки сотрудников
- **Снижение рисков**: Исключение потери документации
- **Оптимизация затрат**: Равномерное распределение нагрузки

### 3.2 Технические метрики
- Время загрузки страниц < 2 секунд
- Загрузка файлов до 100 МБ < 2 минут
- Доступность системы 99.5%
- Поддержка 100 одновременных пользователей

### 3.3 Пользовательские метрики
- Время на загрузку документа < 30 секунд
- Время на поиск документа < 10 секунд
- NPS (Net Promoter Score) > 70
- Ежедневное использование > 90% сотрудников

## 4. Пользовательские персоны и истории

### 4.1 Персоны

#### Персона 1: Иван - Конструктор ЖБК
- **Возраст**: 32 года
- **Опыт**: 7 лет в проектировании
- **Технические навыки**: Средние (AutoCAD, Revit, Office)
- **Цели**: Быстрый доступ к документам, удобная отчетность по времени
- **Боли**: Поиск актуальных версий чертежей, ручной учет времени

#### Персона 2: Елена - Руководитель проектов
- **Возраст**: 45 лет
- **Опыт**: 15 лет, из них 5 в управлении
- **Технические навыки**: Базовые
- **Цели**: Контроль сроков, распределение нагрузки, отчетность
- **Боли**: Отсутствие видимости загрузки команды, риски срыва сроков

#### Персона 3: Алексей - Администратор
- **Возраст**: 28 лет
- **Опыт**: 3 года в IT-поддержке
- **Технические навыки**: Продвинутые
- **Цели**: Стабильная работа системы, быстрое решение проблем
- **Боли**: Управление правами доступа, восстановление документов

### 4.2 Пользовательские истории

#### Администратор
- Как администратор, я хочу добавлять новых пользователей, чтобы предоставить доступ новым сотрудникам
- Как администратор, я хочу управлять ролями пользователей, чтобы контролировать уровни доступа
- Как администратор, я хочу создавать новые проекты и назначать менеджеров

#### Менеджер
- Как менеджер, я хочу видеть загруженность всех сотрудников, чтобы эффективно распределять задачи
- Как менеджер, я хочу управлять документами своих проектов
- Как менеджер, я хочу добавлять сотрудников в команду проекта

#### Сотрудник (Конструктор)
- Как конструктор, я хочу быстро находить нужные документы проекта
- Как конструктор, я хочу загружать новые версии чертежей КЖ
- Как конструктор, я хочу отмечать отработанное время через Telegram

## 5. Функциональные требования

### 5.1 Управление пользователями и аутентификация

#### 5.1.1 Аутентификация
- **Вход в систему**: Email + пароль
- **JWT токены**: Access (24 часа) + Refresh (7 дней)
- **Автоматическое обновление токенов**
- **Выход из системы** с очисткой токенов

#### 5.1.2 Управление пользователями (Admin)
- Создание нового пользователя
- Просмотр списка всех пользователей
- Изменение данных пользователя
- Изменение роли пользователя
- Удаление пользователя
- Поиск по имени/фамилии

### 5.2 Управление проектами

#### 5.2.1 Операции с проектами
**Admin и Manager:**
- Создание проекта (основной/дополнительный)
- Редактирование данных проекта
- Просмотр всех проектов
- Назначение менеджера на проект
- Добавление сотрудников в команду

**Employee:**
- Просмотр проектов, где участвует
- Просмотр деталей проекта

#### 5.2.2 Отображение проектов
- Группировка основных проектов с дополнительными соглашениями
- Статусы: Активный / Завершен / Просрочен
- Фильтрация по: дате, заказчику, стоимости, статусу
- Сортировка по всем полям
- Пагинация (20 проектов на страницу)

### 5.3 Управление конструкциями

- Создание конструкции в рамках проекта
- Просмотр списка конструкций проекта
- Редактирование названия конструкции
- Удаление конструкции (с подтверждением)
- Привязка документов к конструкции

### 5.4 Управление документами

#### 5.4.1 Типы документов
**Проектная документация:**
- КМ (km) - Конструкции металлические
- КЖ (kz) - Конструкции железобетонные  
- РПЗ (rpz) - Расчетно-пояснительная записка

**Исходные данные:**
- ТЗ (tz) - Техническое задание
- ГП (gp) - Генплан
- ИГИ (igi) - Инженерно-геологические изыскания
- СПОЗУ (spozu) - Схема планировочной организации земельного участка
- Договор (contract)

#### 5.4.2 Операции с документами
- Загрузка файлов (до 100 МБ)
- Множественная загрузка (drag & drop)
- Прогресс-бар загрузки
- Скачивание документов
- Удаление документов
- Предпросмотр PDF
- Фильтрация по типу документа
- Поиск по названию

### 5.5 Управление компаниями

**Admin:**
- Добавление новой компании
- Редактирование данных компании
- Удаление компании

**Все роли:**
- Просмотр списка компаний
- Поиск по названию
- Просмотр карточки компании

### 5.6 Управление загруженностью

#### 5.6.1 Плановая загруженность
- Внесение плана на день (в часах)
- Календарный вид (месяц/неделя)
- Копирование плана на период
- Просмотр свободных сотрудников

#### 5.6.2 Фактическая загруженность
- Внесение отработанного времени через веб-форму
- Интеграция с Telegram ботом
- Описание выполненных работ
- История внесенных данных

#### 5.6.3 Отчеты
- Сводка по проектам
- Недельный вид загрузки
- Месячный вид с пагинацией
- Экспорт в Excel

## 6. Нефункциональные требования

### 6.1 Производительность
- Загрузка страниц < 2 сек
- Отклик интерфейса < 200 мс
- Поддержка 100 одновременных пользователей
- Оптимизация для больших списков (виртуальная прокрутка)

### 6.2 Безопасность
- JWT аутентификация
- Ролевая модель доступа
- HTTPS для всех соединений
- Валидация всех форм
- Защита от XSS и CSRF атак

### 6.3 Надежность
- Доступность 99.5%
- Обработка ошибок с понятными сообщениями
- Автосохранение форм
- Восстановление сессии после обрыва связи

### 6.4 Юзабилити
- Адаптивный дизайн (desktop-first)
- Поддержка браузеров: Chrome, Firefox, Safari, Edge
- Горячие клавиши для частых действий
- Контекстные подсказки
- Breadcrumbs навигация

## 7. Техническая архитектура

### 7.1 Технологический стек

#### Frontend
- **React 18+** - UI библиотека
- **Redux Toolkit** - State management
- **React Router v6** - Маршрутизация
- **Axios** - HTTP клиент
- **React Hook Form** - Работа с формами
- **React Query** - Кэширование запросов
- **PDF.js** - Предпросмотр PDF
- **React Dropzone** - Загрузка файлов

#### Инфраструктура
- **Node.js 18+** - Среда выполнения
- **Webpack 5** - Сборщик
- **Babel** - Транспиляция
- **ESLint + Prettier** - Линтинг и форматирование

### 7.2 Структура проекта

```
src/
├── components/           # Переиспользуемые компоненты
│   ├── common/          # Общие компоненты (Button, Input, Modal)
│   ├── layout/          # Header, Sidebar, Footer
│   └── features/        # Бизнес-компоненты
├── pages/               # Страницы приложения
│   ├── login/
│   ├── projects/
│   ├── employees/
│   ├── companies/
│   ├── workload/
│   └── user_profile/
├── store/               # Redux store
│   ├── slices/         # Redux slices
│   └── middleware/     # Custom middleware
├── services/           # API сервисы
├── hooks/              # Custom hooks
├── utils/              # Утилиты
├── types/              # TypeScript типы
└── assets/             # Статические ресурсы
```

### 7.3 Redux Store структура

```javascript
{
  auth: {
    user: User | null,
    accessToken: string | null,
    refreshToken: string | null,
    isAuthenticated: boolean,
    loading: boolean
  },
  projects: {
    list: Project[],
    current: Project | null,
    filters: {
      status: 'all' | 'active' | 'completed' | 'overdue',
      customerId: string | null,
      managerId: string | null,
      type: 'all' | 'main' | 'additional'
    },
    pagination: {
      page: number,
      limit: number,
      total: number
    },
    loading: boolean
  },
  users: {
    list: User[],
    current: User | null,
    filters: {
      role: UserRole | null,
      companyId: string | null,
      search: string
    },
    loading: boolean
  },
  documents: {
    list: Document[],
    byProject: { [projectId: string]: Document[] },
    byConstruction: { [constructionId: string]: Document[] },
    uploadProgress: number,
    filters: {
      type: DocumentType | null,
      context: DocumentContext | null
    },
    loading: boolean
  },
  constructions: {
    list: Construction[],
    byProject: { [projectId: string]: Construction[] },
    current: Construction | null,
    loading: boolean
  },
  workload: {
    plans: WorkloadPlan[],
    actuals: WorkloadActual[],
    filters: {
      userId: string | null,
      projectId: string | null,
      dateFrom: string | null,
      dateTo: string | null
    },
    view: 'week' | 'month',
    selectedUser: string | null,
    loading: boolean
  },
  companies: {
    list: Company[],
    current: Company | null,
    search: string,
    loading: boolean
  },
  projectUsers: {
    byProject: { [projectId: string]: User[] },
    loading: boolean
  },
  ui: {
    notifications: {
      id: string,
      type: 'success' | 'error' | 'warning' | 'info',
      message: string,
      duration?: number
    }[],
    modals: {
      isOpen: boolean,
      type: string | null,
      data: any
    },
    sidebar: {
      isCollapsed: boolean
    }
  }
}
```
### 7.4 Наименование файлов в проекте
- имя файла соответствует функции или классу содержащемуся в проекте
- имя функции начинается с заглавной буквы и записвается в CamelCase ex: GetData
- имя файла в котором хранится функция или класс начинается с прописной буквы и записывается в snake-case ex: get-data

## 8. API Спецификация

### 8.1 Базовая конфигурация
- **Base URL**: `http://localhost:3000`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer {accessToken}`

### 8.2 Система авторизации

#### Guards и права доступа
- **Admin**: Полный доступ ко всем операциям
- **Manager**: Управление проектами, конструкциями, документами
- **Employee**: Работа с назначенными проектами, просмотр и загрузка документов
- **Customer**: Просмотр проектов своей компании (не используется в MVP)

#### JWT токены
- **Access Token**: Время жизни 24 часа
- **Refresh Token**: Время жизни 7 дней, хранится в БД

### 8.3 Реализованные endpoints

#### Authentication (/auth)
```
POST   /auth/register      - Регистрация пользователя (Admin только)
POST   /auth/login         - Вход в систему  
POST   /auth/refresh       - Обновление токенов
POST   /auth/check         - Проверка токена
GET    /auth              - Получить всех пользователей (Admin только)
```

#### Company (/company)
```
GET    /company/:uuid      - Получить компанию по ID
GET    /company/          - Получить все компании
POST   /company/create    - Создать компанию
DELETE /company/:uuid     - Удалить компанию (Admin только)
PATCH  /company/:uuid     - Обновить компанию (Admin только)
```

#### Project (/project)
```
GET    /project/:id       - Получить проект по ID
GET    /project/         - Получить все проекты
POST   /project/create   - Создать проект (Manager+)
DELETE /project/:id      - Удалить проект (Admin только)
PATCH  /project/:id      - Обновить проект (Admin только)
```

#### Construction (/construction)
```
GET    /construction/:id      - Получить конструкцию по ID
GET    /construction/        - Получить все конструкции
POST   /construction/create  - Создать конструкцию (Manager+)
DELETE /construction/:id     - Удалить конструкцию (Manager+)
PATCH  /construction/:id     - Обновить конструкцию (Manager+)
```

#### Document (/document)
```
POST   /document/upload      - Загрузить документ (Manager+)
GET    /document/:fileId     - Получить документ по ID
GET    /document/:projectId  - Получить документы по ID проекта
```

#### Workload Plan (/workload-plan)
```
GET    /workload-plan/:id    - Получить план по ID
GET    /workload-plan/       - Получить все планы
POST   /workload-plan/create - Создать план
PATCH  /workload-plan/:id    - Обновить план
DELETE /workload-plan/:id    - Удалить план
```

#### Workload Actual (/workload-actual)
```
GET    /workload-actual/:uuid    - Получить факт по ID
GET    /workload-actual/        - Получить все факты
POST   /workload-actual/create  - Создать факт
DELETE /workload-actual/:uuid   - Удалить факт
```

### 8.4 Требуемые дополнительные endpoints

#### Users
```
GET    /auth/:id              - Получить пользователя по ID
PATCH  /auth/:id              - Обновить данные пользователя (Admin)
DELETE /auth/:id              - Удалить пользователя (Admin)
PATCH  /auth/change-password  - Изменить пароль (для себя)
```

#### Projects
```
GET    /project/:id/users     - Получить участников проекта
POST   /project/:id/users     - Добавить участника в проект
DELETE /project/:id/users/:userId - Удалить участника из проекта
GET    /project/by-manager/:managerId - Проекты менеджера
```

#### Documents
```
DELETE /document/:id          - Удалить документ
GET    /construction/:id/documents - Документы конструкции
GET    /document/download/:id - Скачать файл документа
```

#### Workload
```
GET    /workload-plan/user/:userId      - Планы пользователя
GET    /workload-plan/project/:projectId - Планы по проекту
GET    /workload-actual/user/:userId    - Факты пользователя  
GET    /workload-actual/project/:projectId - Факты по проекту
PATCH  /workload-actual/:id    - Обновить факт
GET    /workload/report        - Сводный отчет
GET    /workload/free-employees - Свободные сотрудники на период
```

#### Filters & Search
```
GET    /project?status=active&customerId=uuid&managerId=uuid
GET    /document?type=kz&projectId=uuid
GET    /company?search=name
GET    /auth?role=Employee&companyId=uuid
```

### 8.5 Структура данных (DTOs)

#### CreateUserDto
```typescript
{
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateBirth: string; // ISO date
  companyId: string;
  password: string;
  telegramId?: number;
}
```

#### CreateProjectDto
```typescript
{
  name: string;
  customerId: string;
  contractDate: string;
  expirationDate: string;
  cost: number;
  type: "main" | "additional";
  managerId?: string;
  mainProjectId?: string; // для additional проектов
}
```

#### CreateDocumentDto (FormData)
```typescript
{
  file: File;
  type: "km" | "kz" | "rpz" | "tz" | "gp" | "igi" | "spozu" | "contract";
  context: "initial_data" | "project_doc";
  version: number;
  projectId: string;
  constructionId?: string;
}
```

#### CreateWorkloadPlanDto
```typescript
{
  userId: string;
  projectId: string;
  managerId: string;
}
```

#### CreateWorkloadActualDto
```typescript
{
  userId: string;
  projectId: string;
  hoursWorked: number;
  userText: string; // описание работы
}
```

## 9. Дизайн и UX

### 9.1 Принципы дизайна
- **Минимализм**: Чистый интерфейс без лишних элементов
- **Консистентность**: Единообразие элементов и паттернов
- **Отзывчивость**: Мгновенная обратная связь на действия
- **Доступность**: WCAG 2.1 уровень AA

### 9.2 Цветовая схема
```css
:root {
  --primary: #2563EB;      /* Основной синий */
  --secondary: #64748B;    /* Серый */
  --success: #10B981;      /* Зеленый */
  --danger: #EF4444;       /* Красный */
  --warning: #F59E0B;      /* Оранжевый */
  --background: #FFFFFF;   /* Белый фон */
  --surface: #F8FAFC;      /* Светло-серый */
  --text-primary: #1E293B; /* Основной текст */
  --text-secondary: #64748B; /* Вторичный текст */
  --border: #E2E8F0;       /* Границы */
}
```

### 9.3 Типографика
- **Заголовки**: Inter, system-ui, sans-serif
- **Основной текст**: Inter, system-ui, sans-serif
- **Моноширинный**: 'Fira Code', monospace

### 9.4 Компоненты интерфейса

#### Header
- Логотип LenconDB слева
- Навигационное меню по центру
- Профиль пользователя справа
- Высота: 64px
- Фиксированный при прокрутке

#### Sidebar (опционально)
- Ширина: 240px
- Сворачиваемый
- Иконки + текст

#### Таблицы
- Зебра-стиль для строк
- Сортировка по клику на заголовок
- Пагинация внизу
- Действия в последней колонке

#### Формы
- Label над полем
- Placeholder с примером
- Валидация в реальном времени
- Сообщения об ошибках под полем

#### Модальные окна
- Затемнение фона
- Анимация появления
- Закрытие по Escape и клику вне

## 10. Структура страниц

### 10.1 Страница входа (/login)
```
┌─────────────────────────────────┐
│         LenconDB Logo           │
│                                 │
│    ┌─────────────────────┐     │
│    │ Email               │     │
│    └─────────────────────┘     │
│    ┌─────────────────────┐     │
│    │ Пароль              │     │
│    └─────────────────────┘     │
│    [────── Войти ──────]       │
│                                 │
└─────────────────────────────────┘
```

### 10.2 Главная страница - Проекты (/projects)
```
┌─────────────────────────────────────────┐
│ Header                                  │
├─────────────────────────────────────────┤
│ Проекты                                 │
│ ┌──────────┬─────────┬────────────────┐│
│ │Фильтры   │ Поиск   │ [Новый проект] ││
│ └──────────┴─────────┴────────────────┘│
│ ┌─────────────────────────────────────┐│
│ │ Таблица проектов                    ││
│ │ - Название                          ││
│ │ - Заказчик                          ││
│ │ - Сроки                             ││
│ │ - Статус                            ││
│ │ - Действия                          ││
│ └─────────────────────────────────────┘│
│ [Пагинация]                            │
└─────────────────────────────────────────┘
```

### 10.3 Страница проекта (/projects/{id})
```
┌──────────────────────────────────────────┐
│ Header                                   │
├──────────────────────────────────────────┤
│ Breadcrumbs: Проекты > {Название}        │
│                                          │
│ ┌──────────────────────────────────────┐│
│ │ Информация о проекте                 ││
│ │ - Название, Заказчик, Сроки          ││
│ │ - Менеджер, Стоимость, Статус        ││
│ └──────────────────────────────────────┘│
│                                          │
│ Вкладки: [Конструкции] [Документы]       │
│          [Команда] [Загруженность]       │
│                                          │
│ ┌──────────────────────────────────────┐│
│ │ Содержимое активной вкладки          ││
│ └──────────────────────────────────────┘│
└──────────────────────────────────────────┘
```

### 10.4 Страница сотрудников (/employees)
```
┌──────────────────────────────────────────┐
│ Header                                   │
├──────────────────────────────────────────┤
│ Сотрудники                               │
│ ┌────────────┬──────────────────────────┐│
│ │ Поиск      │ [Добавить сотрудника]    ││
│ └────────────┴──────────────────────────┘│
│ ┌──────────────────────────────────────┐│
│ │ Таблица сотрудников                  ││
│ │ - ФИО                                ││
│ │ - Email                              ││
│ │ - Телефон                            ││
│ │ - Роль                               ││
│ │ - Компания                           ││
│ │ - Действия                           ││
│ └──────────────────────────────────────┘│
└──────────────────────────────────────────┘
```

### 10.6 Страница загруженности (/workload)
```
┌──────────────────────────────────────────┐
│ Header                                   │
├──────────────────────────────────────────┤
│ Загруженность                            │
│ ┌──────────┬──────────┬─────────────────┐│
│ │Сотрудник │ Период   │ [Неделя/Месяц]  ││
│ └──────────┴──────────┴─────────────────┘│
│                                          │
│ Вкладки: [Плановая] [Фактическая]        │
│                                          │
│ ┌──────────────────────────────────────┐│
│ │ Календарная сетка                    ││
│ │ ПН  ВТ  СР  ЧТ  ПТ  СБ  ВС          ││
│ │ [8] [8] [8] [8] [8] [0] [0]         ││
│ │                                      ││
│ │ Проекты и часы по дням               ││
│ └──────────────────────────────────────┘│
│                                          │
│ [Сводка по проектам]                     │
└──────────────────────────────────────────┘
```

### 10.7 Страница 404 - Not Found (/404)
```
┌──────────────────────────────────────────┐
│ Header                                   │
├──────────────────────────────────────────┤
│                                          │
│           ┌─────────────┐                │
│           │     404     │                │
│           └─────────────┘                │
│                                          │
│       Страница не найдена                │
│                                          │
│   Запрашиваемая страница не существует   │
│   или у вас нет прав для ее просмотра    │
│                                          │
│        [Вернуться на главную]            │
│                                          │
└──────────────────────────────────────────┘
```

## 11. Требования к компонентам

### 11.1 Структура компонентов
Все компоненты должны следовать соглашениям:
- Папка с именем в snake_case
- Файл компонента с тем же именем
- Функция компонента в CamelCase
- Наследование от JSX.Element

Пример:
```typescript
// src/pages/project_list/project_list.tsx
function ProjectList(): JSX.Element {
  return <div className="project-list">...</div>;
}
```

### 11.2 Стилизация
- Все стили в `public/style.css`
- БЭМ методология для именования классов
- Никаких inline стилей
- CSS переменные для цветов и размеров

### 11.3 Общие компоненты

#### Button
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
}
```

#### Table
```typescript
interface TableProps {
  columns: Column[];
  data: any[];
  onSort?: (column: string) => void;
  onRowClick?: (row: any) => void;
  pagination?: PaginationProps;
}
```

#### Modal
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'small' | 'medium' | 'large';
}
```

#### FileUpload
```typescript
interface FileUploadProps {
  accept?: string;
  maxSize?: number; // в байтах
  multiple?: boolean;
  onUpload: (files: File[]) => void;
  onProgress?: (progress: number) => void;
}
```

#### NotFound
```typescript
interface NotFoundProps {
  // Компонент не принимает props
}

// src/pages/not_found/not_found.tsx
function NotFound(): JSX.Element {
  const navigate = useNavigate();
  
  return (
    <div className="not-found">
      <div className="not-found__container">
        <h1 className="not-found__code">404</h1>
        <h2 className="not-found__title">Страница не найдена</h2>
        <p className="not-found__message">
          Запрашиваемая страница не существует или у вас нет прав для ее просмотра
        </p>
        <button 
          className="not-found__button"
          onClick={() => navigate('/')}
        >
          Вернуться на главную
        </button>
      </div>
    </div>
  );
}
```

### 11.4 Стили для страницы 404 (в public/style.css)

```css
/* Страница 404 - Not Found */
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px); /* Высота экрана минус header */
  background: var(--background);
}

.not-found__container {
  text-align: center;
  padding: 2rem;
  max-width: 500px;
}

.not-found__code {
  font-size: 8rem;
  font-weight: 700;
  color: var(--primary);
  margin: 0;
  line-height: 1;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.not-found__title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 1rem 0;
}

.not-found__message {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin: 1.5rem 0 2rem;
  line-height: 1.6;
}

.not-found__button {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 500;
  color: white;
  background: var(--primary);
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.not-found__button:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.not-found__button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```

## 12. План разработки

### 12.1 Фазы разработки

#### Фаза 1: Базовая инфраструктура (1 неделя)
- [ ] Настройка проекта (React, Redux, Router)
- [ ] Настройка сборки (Webpack, Babel)
- [ ] Базовая структура проекта
- [ ] Конфигурация ESLint и Prettier
- [ ] Базовые стили и CSS переменные
- [ ] Общие компоненты (Button, Input, Modal)

#### Фаза 2: Аутентификация (1 неделя)
- [ ] Страница входа
- [ ] Redux slice для auth
- [ ] JWT token management
- [ ] Axios interceptors для токенов
- [ ] Protected routes
- [ ] Auto refresh tokens

#### Фаза 3: Управление проектами (2 недели)
- [ ] Страница списка проектов
- [ ] Фильтрация и сортировка
- [ ] Страница деталей проекта
- [ ] Создание/редактирование проекта
- [ ] Управление конструкциями
- [ ] Группировка основных и доп. проектов

#### Фаза 4: Управление документами (1.5 недели)
- [ ] Компонент загрузки файлов
- [ ] Drag & drop интерфейс
- [ ] Прогресс-бар загрузки
- [ ] Список документов
- [ ] PDF предпросмотр
- [ ] Фильтрация по типу документа

#### Фаза 5: Управление пользователями (1 неделя)
- [ ] Страница списка сотрудников
- [ ] Добавление/редактирование пользователя
- [ ] Управление ролями
- [ ] Поиск и фильтрация
- [ ] Карточка сотрудника

#### Фаза 6: Управление компаниями (0.5 недели)
- [ ] Страница списка компаний
- [ ] CRUD операции
- [ ] Поиск по названию
- [ ] Карточка компании

#### Фаза 7: Учет загруженности (2 недели)
- [ ] Календарный компонент
- [ ] Плановая загруженность
- [ ] Фактическая загруженность
- [ ] Недельный/месячный вид
- [ ] Сводка по проектам
- [ ] Интеграция с Telegram данными

#### Фаза 8: Оптимизация и тестирование (1 неделя)
- [ ] Оптимизация производительности
- [ ] Виртуальная прокрутка для больших списков
- [ ] Кэширование с React Query
- [ ] Error boundaries
- [ ] Loading states
- [ ] Юнит-тесты критического функционала

### 12.2 Приоритеты разработки

#### Критические (MVP)
1. Аутентификация и авторизация
2. Просмотр проектов и документов
3. Загрузка документов
4. Базовый учет времени

#### Важные
1. Полноценное управление проектами
2. Управление пользователями
3. Календарь загруженности
4. PDF предпросмотр

#### Желательные
1. Расширенная фильтрация
2. Экспорт отчетов
3. Массовые операции
4. Горячие клавиши

### 12.3 Ресурсы и команда

#### Необходимая команда
- **Frontend разработчик** (Senior) - 1 человек
- **Frontend разработчик** (Middle) - 1 человек
- **Backend разработчик** (для доработки API) - 0.5 человека
- **UI/UX дизайнер** - 0.5 человека
- **QA инженер** - 0.5 человека

#### Временные оценки
- **Общее время разработки**: 8-10 недель
- **MVP версия**: 4-5 недель
- **Полная версия**: 8-10 недель

## 13. Технические особенности реализации

### 13.1 Файловая система документов
- **Путь хранения**: `/uploads/{year}/{newName}/{hashName}_{originalName}`
- **Максимальный размер**: 100 МБ
- **Поддерживаемые форматы**: PDF, DWG, DOC, DOCX, XLS, XLSX
- **Версионирование**: Поле version в БД (только последняя версия в MVP)

### 13.2 Интеграция с Telegram
- **Поле telegramId** у пользователей для связи аккаунтов
- **userText** в WorkloadActual хранит исходное сообщение
- **LLM обработка** на стороне бота для распознавания проекта и времени

### 13.3 Обработка токенов
```javascript
// Axios interceptor для автообновления токенов
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const refreshToken = store.getState().auth.refreshToken;
      if (refreshToken) {
        const { data } = await axios.post('/auth/refresh', {
          headers: { Authorization: `Bearer ${refreshToken}` }
        });
        store.dispatch(setTokens(data));
        return axios(error.config);
      }
    }
    return Promise.reject(error);
  }
);
```

### 13.4 Оптимизация загрузки файлов
```javascript
// Chunked upload для больших файлов
const uploadFile = async (file: File, onProgress: (percent: number) => void) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', documentType);
  formData.append('projectId', projectId);
  
  return axios.post('/document/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      onProgress(percent);
    }
  });
};
```

### 13.5 Группировка проектов
```javascript
// Группировка основных и дополнительных проектов
const groupProjects = (projects: Project[]) => {
  const mainProjects = projects.filter(p => p.type === 'main');
  return mainProjects.map(main => ({
    ...main,
    additionalProjects: projects.filter(p => p.mainProjectId === main.id)
  }));
};
```

## 13. Риски и митигация

### 13.1 Технические риски

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Производительность при больших объемах данных | Средняя | Высокое | Виртуальная прокрутка, пагинация, lazy loading |
| Проблемы с загрузкой больших файлов | Средняя | Среднее | Chunked upload, retry механизм |
| Совместимость браузеров | Низкая | Среднее | Полифиллы, тестирование |
| Потеря данных форм | Низкая | Высокое | Автосохранение, localStorage |

### 13.2 Бизнес-риски

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Низкая адаптация пользователями | Средняя | Высокое | Обучение, простой интерфейс |
| Изменение требований | Высокая | Среднее | Модульная архитектура |
| Интеграция с Telegram | Низкая | Низкое | Fallback на ручной ввод |

## 14. Метрики успеха и KPI

### 14.1 Технические метрики
- **Performance Score (Lighthouse)**: > 90
- **Время первой отрисовки (FCP)**: < 1.5s
- **Время до интерактивности (TTI)**: < 3.5s
- **Покрытие тестами**: > 70%
- **Количество критических багов**: < 5 в месяц

### 14.2 Бизнес-метрики
- **Adoption Rate**: > 80% за первый месяц
- **Daily Active Users**: > 70%
- **Среднее время сессии**: > 30 минут
- **Количество загруженных документов**: > 1000 в месяц
- **Точность учета времени**: > 95%

### 14.3 UX метрики
- **Task Success Rate**: > 90%
- **Error Rate**: < 5%
- **System Usability Scale (SUS)**: > 75
- **Customer Satisfaction (CSAT)**: > 4.0/5.0

## 15. Поддержка и развитие

### 15.1 Документация
- Техническая документация кода
- Руководство пользователя
- Видео-туториалы для основных сценариев
- FAQ раздел
- API документация для интеграций

### 15.2 Обучение
- Вводный тренинг для новых пользователей (2 часа)
- Расширенный курс для менеджеров (4 часа)
- Материалы для самостоятельного изучения
- Регулярные вебинары с обновлениями

### 15.3 Техподдержка
- Уровень 1: Базовая поддержка через чат
- Уровень 2: Техническая поддержка
- SLA: ответ в течение 4 часов в рабочее время
- База знаний с решениями типовых проблем

### 15.4 Будущие улучшения
- Мобильное приложение (iOS/Android)
- Интеграция с 1С
- AI-помощник для категоризации документов
- Расширенная аналитика и дашборды
- Интеграция с AutoCAD/Revit
- Электронная подпись документов
- Версионирование документов
- Уведомления через email/push

## 16. Соответствие требованиям и ограничения

### 16.1 Соответствие стандартам
- ГОСТ Р 21.1101-2013 (СПДС)
- ISO 9001:2015 (Система менеджмента качества)
- Федеральный закон "О персональных данных" №152-ФЗ

### 16.2 Ограничения системы
- Максимальный размер файла: 100 МБ
- Поддерживаемые форматы: PDF, DWG, DOC, XLS
- Максимум 100 одновременных пользователей
- Только последняя версия документа (без истории)
- Только веб-версия (без мобильных приложений в MVP)

### 16.3 Зависимости
- Стабильное интернет-соединение
- Современный браузер (Chrome 90+, Firefox 88+, Safari 14+)
- Разрешение экрана минимум 1366x768
- Backend API должен быть доступен
- Telegram Bot API для интеграции учета времени

## 17. Глоссарий

- **ЖБК** - Железобетонные конструкции
- **КЖ** - Конструкции железобетонные (раздел проекта)
- **КМ** - Конструкции металлические (раздел проекта)
- **РПЗ** - Расчетно-пояснительная записка
- **ТЗ** - Техническое задание
- **ГП** - Генеральный план
- **ИГИ** - Инженерно-геологические изыскания
- **СПОЗУ** - Схема планировочной организации земельного участка
- **JWT** - JSON Web Token
- **MVP** - Minimum Viable Product
- **CRUD** - Create, Read, Update, Delete
- **SPA** - Single Page Application

## 18. Приложения

### Приложение А: Примеры API запросов

#### Авторизация
```javascript
// Login
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "user": { ...userData },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### Создание проекта
```javascript
POST /project/create
Headers: { Authorization: "Bearer {token}" }
{
  "name": "ЖК Солнечный",
  "customerId": "uuid",
  "contractDate": "2025-01-15",
  "expirationDate": "2025-12-31",
  "cost": 5000000,
  "type": "main",
  "managerId": "uuid"
}
```

#### Загрузка документа
```javascript
POST /document/upload
Content-Type: multipart/form-data

FormData:
- file: File
- type: "kz"
- context: "project_doc"
- version: 1
- projectId: "uuid"
- constructionId?: "uuid"
```

#### Плановая загруженность
```javascript
// Создание плана
POST /workload-plan/create
{
  "userId": "86169311-74ed-41ab-934e-bb76c6ed5568",
  "projectId": "7318f67f-a04e-46ea-9268-c5f9a2ac2208",
  "managerId": "86169311-74ed-41ab-934e-bb76c6ed5568"
}

// Получение планов
GET /workload-plan
Headers: { Authorization: "Bearer {token}" }
```

#### Фактическая загруженность
```javascript
// Внесение факта работы
POST /workload-actual/create
{
  "userId": "86169311-74ed-41ab-934e-bb76c6ed5568",
  "projectId": "7318f67f-a04e-46ea-9268-c5f9a2ac2208",
  "userText": "Разработка чертежей КЖ для корпуса 3",
  "hoursWorked": 8
}

// Получение фактов
GET /workload-actual
Headers: { Authorization: "Bearer {token}" }
```

### Приложение Б: Redux Actions примеры

```javascript
// Auth actions
dispatch(login({ email, password }))
dispatch(logout())
dispatch(refreshToken())

// Project actions
dispatch(fetchProjects({ page, filters }))
dispatch(createProject(projectData))
dispatch(updateProject({ id, data }))
dispatch(deleteProject(id))

// Document actions
dispatch(uploadDocument({ file, metadata }))
dispatch(fetchDocuments({ projectId }))
dispatch(deleteDocument(id))

// Workload actions
dispatch(fetchWorkloadPlan({ userId, period }))
dispatch(updateWorkloadPlan({ id, hours }))
dispatch(submitWorkloadActual({ projectId, hours, description }))
```

### Приложение В: Структура маршрутов

```javascript
const routes = [
  // Публичные маршруты
  { path: '/login', component: Login, public: true },
  
  // Защищенные маршруты
  { path: '/', component: Projects, protected: true, exact: true },
  { path: '/projects', component: Projects, protected: true },
  { path: '/projects/:id', component: ProjectDetail, protected: true },
  
  // Управление сотрудниками (Admin, Manager)
  { path: '/employees', component: Employees, protected: true, roles: ['Admin', 'Manager'] },
  { path: '/employees/:id', component: EmployeeDetail, protected: true, roles: ['Admin', 'Manager'] },
  
  // Управление компаниями
  { path: '/companies', component: Companies, protected: true },
  { path: '/companies/:id', component: CompanyDetail, protected: true },
  
  // Загруженность
  { path: '/workload', component: Workload, protected: true },
  { path: '/workload/:userId', component: UserWorkload, protected: true },
  
  // Профиль пользователя
  { path: '/profile', component: UserProfile, protected: true },
  
  // 404 - Страница не найдена (должна быть последней)
  { path: '/404', component: NotFound },
  { path: '*', component: NotFound }
];

// Компонент обработки маршрутов
const AppRouter = () => {
  return (
    <Routes>
      {routes.map(route => (
        <Route
          key={route.path}
          path={route.path}
          element={
            route.protected ? (
              <ProtectedRoute roles={route.roles}>
                <route.component />
              </ProtectedRoute>
            ) : (
              <route.component />
            )
          }
        />
      ))}
    </Routes>
  );
};

// Компонент защищенного маршрута
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/404" replace />;
  }
  
  return children;
};
```

---

## Заключение

Данный PRD описывает комплексную систему управления проектами и документооборотом для конструкторского бюро. Система решает критические проблемы организации: централизованное хранение документации, учет рабочего времени и оптимизацию загрузки сотрудников.

Ключевые особенности решения:
- Специализация под нужды конструкторов ЖБК
- Интеграция с Telegram для удобного учета времени
- Типизация документов согласно отраслевым стандартам
- Простой и эффективный интерфейс

При следовании данному PRD и соблюдении технических требований, система будет успешно внедрена и обеспечит значительное повышение эффективности работы конструкторского бюро.

**Версия документа**: 1.0
**Дата создания**: Январь 2025
**Автор**: LenconDB Team