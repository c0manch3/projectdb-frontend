# Backend Requirement: Projects Workload Analytics API

## Описание
Эндпоинт для получения аналитики по задействованным сотрудникам на проектах за определенный день с возможностью сравнения с предыдущим днем.

## Эндпоинт

```
GET /api/analytics/projects-workload
```

## Query параметры

| Параметр | Тип | Обязательный | Описание | Пример |
|----------|-----|--------------|----------|--------|
| `date` | string | Нет | Дата для анализа в формате YYYY-MM-DD. По умолчанию: вчерашний день | `2025-11-14` |

## Response Schema

```typescript
{
  "date": string,              // ISO date string (YYYY-MM-DD) - день анализа
  "compareDate": string,       // ISO date string (YYYY-MM-DD) - день для сравнения (предыдущий)
  "projects": [
    {
      "projectId": string,           // UUID проекта
      "projectName": string,         // Название проекта
      "employeeCount": number,       // Количество уникальных сотрудников за date
      "previousEmployeeCount": number, // Количество уникальных сотрудников за compareDate
      "changePercent": number,       // Процент изменения (может быть отрицательным)
      "employees": [                 // Массив сотрудников, работавших над проектом в date
        {
          "userId": string,          // UUID сотрудника
          "firstName": string,       // Имя сотрудника
          "lastName": string,        // Фамилия сотрудника
          "hoursWorked": number      // Количество часов, отработанных сотрудником за date
        }
      ]
    }
  ]
}
```

## Пример запроса

```
GET /api/analytics/projects-workload?date=2025-11-14
```

## Пример успешного ответа

**Status: 200 OK**

```json
{
  "date": "2025-11-14",
  "compareDate": "2025-11-13",
  "projects": [
    {
      "projectId": "123e4567-e89b-12d3-a456-426614174000",
      "projectName": "Строительство торгового центра",
      "employeeCount": 12,
      "previousEmployeeCount": 10,
      "changePercent": 20.0,
      "employees": [
        {
          "userId": "user-uuid-1",
          "firstName": "Иван",
          "lastName": "Иванов",
          "hoursWorked": 8.0
        },
        {
          "userId": "user-uuid-2",
          "firstName": "Петр",
          "lastName": "Петров",
          "hoursWorked": 7.5
        },
        {
          "userId": "user-uuid-3",
          "firstName": "Сидор",
          "lastName": "Сидоров",
          "hoursWorked": 8.0
        }
      ]
    },
    {
      "projectId": "223e4567-e89b-12d3-a456-426614174001",
      "projectName": "Реконструкция офисного здания",
      "employeeCount": 8,
      "previousEmployeeCount": 10,
      "changePercent": -20.0,
      "employees": [
        {
          "userId": "user-uuid-4",
          "firstName": "Анна",
          "lastName": "Смирнова",
          "hoursWorked": 8.0
        },
        {
          "userId": "user-uuid-5",
          "firstName": "Мария",
          "lastName": "Кузнецова",
          "hoursWorked": 6.5
        }
      ]
    }
  ]
}
```

## Логика расчета

### 1. Определение дат
- `date` - день для анализа (из query параметра или вчерашний день по умолчанию)
- `compareDate` - день для сравнения (день перед `date`)

### 2. Получение данных за `date`
Для каждого проекта:
- Получить все записи из таблицы `workload_actual` за указанный `date`
- Сгруппировать по `projectId`
- Подсчитать количество **уникальных** `userId` → `employeeCount`
- Собрать информацию о сотрудниках (userId, firstName, lastName, hoursWorked)

```sql
SELECT
  wa.projectId,
  p.name as projectName,
  COUNT(DISTINCT wa.userId) as employeeCount,
  json_agg(
    json_build_object(
      'userId', u.id,
      'firstName', u.firstName,
      'lastName', u.lastName,
      'hoursWorked', wa.hoursWorked
    )
  ) as employees
FROM workload_actual wa
JOIN projects p ON p.id = wa.projectId
JOIN users u ON u.id = wa.userId
WHERE wa.date = '2025-11-14'
GROUP BY wa.projectId, p.name
```

### 3. Получение данных за `compareDate`
Для каждого проекта:
- Получить количество уникальных сотрудников за `compareDate`

```sql
SELECT
  projectId,
  COUNT(DISTINCT userId) as previousEmployeeCount
FROM workload_actual
WHERE date = '2025-11-13'
GROUP BY projectId
```

### 4. Расчет процента изменения
```javascript
if (previousEmployeeCount > 0) {
  changePercent = ((employeeCount - previousEmployeeCount) / previousEmployeeCount) * 100;
} else {
  changePercent = 100; // Если проекта не было в compareDate, значит рост на 100%
}
```

**Формула:**
```
changePercent = ((employeeCount - previousEmployeeCount) / previousEmployeeCount) × 100
```

**Примеры:**
- Было 10, стало 12: `((12 - 10) / 10) × 100 = 20%` ✅
- Было 10, стало 8: `((8 - 10) / 10) × 100 = -20%` ✅
- Было 0, стало 5: `changePercent = 100%` ✅

### 5. Обработка особых случаев

#### Проект есть в `date`, но нет в `compareDate`
```json
{
  "projectId": "new-project-uuid",
  "projectName": "Новый проект",
  "employeeCount": 5,
  "previousEmployeeCount": 0,
  "changePercent": 100.0,
  "employees": [...]
}
```

#### Проект был в `compareDate`, но нет в `date`
Такие проекты **НЕ включаются** в response, так как в `date` на них нет сотрудников.

## Сортировка данных

Проекты в массиве `projects` должны быть отсортированы по `employeeCount` в **убывающем порядке** (проекты с большим количеством сотрудников первыми).

Сотрудники в массиве `employees` должны быть отсортированы по `hoursWorked` в **убывающем порядке** (кто больше отработал - первым).

## Обработка ошибок

### 400 Bad Request
Неверный формат даты в параметре `date`

```json
{
  "statusCode": 400,
  "message": "Invalid date format. Expected YYYY-MM-DD",
  "error": "Bad Request"
}
```

### 401 Unauthorized
Пользователь не авторизован

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden
Пользователь не имеет прав на просмотр аналитики (доступно только для Admin и Manager)

```json
{
  "statusCode": 403,
  "message": "Access denied. Only Admin and Manager can view analytics",
  "error": "Forbidden"
}
```

### 500 Internal Server Error
Ошибка сервера

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

## Права доступа

Эндпоинт доступен только для пользователей с ролями:
- **Admin** - полный доступ
- **Manager** - полный доступ
- **Employee** - доступ запрещен

## Производительность

### Рекомендации по оптимизации:

1. **Индексы на таблице `workload_actual`:**
   ```sql
   CREATE INDEX idx_workload_actual_date ON workload_actual(date);
   CREATE INDEX idx_workload_actual_project_date ON workload_actual(projectId, date);
   CREATE INDEX idx_workload_actual_user_date ON workload_actual(userId, date);
   ```

2. **Кэширование:**
   - Результат можно кэшировать на 1 час (т.к. данные за прошедший день не меняются)
   - Cache key: `analytics:projects-workload:${date}`

3. **Пагинация:**
   - Для текущей версии пагинация не требуется
   - Если количество проектов превысит 100, можно добавить параметры `limit` и `offset`

## Примечания

1. **Уникальность сотрудников:**
   - Если сотрудник работал над проектом несколько раз в течение дня (несколько записей в `workload_actual`), он считается **один раз**
   - В массиве `employees` должна быть **одна запись** для каждого сотрудника
   - `hoursWorked` для сотрудника - это **сумма** всех его часов за день на этом проекте

2. **Формат данных:**
   - Даты всегда в формате ISO: `YYYY-MM-DD`
   - Числа с плавающей точкой округляются до 1 знака после запятой
   - Процент может быть отрицательным

3. **Пустой результат:**
   Если за указанный день нет данных, вернуть:
   ```json
   {
     "date": "2025-11-14",
     "compareDate": "2025-11-13",
     "projects": []
   }
   ```

## Пример использования на фронтенде

Фронтенд будет:
1. Отображать пузыри (bubble chart), где:
   - Размер пузыря = `employeeCount`
   - Цвет = зеленый если `changePercent >= 0`, красный если `changePercent < 0`
   - Текст в пузыре = `projectName` и `changePercent`

2. При наведении на пузырь показывать tooltip:
   ```
   Проект: Строительство торгового центра
   Сотрудников: 12 (+2 от предыдущего дня)

   Сотрудники:
   • Иван Иванов — 8.0 ч
   • Петр Петров — 7.5 ч
   • Сидор Сидоров — 8.0 ч
   ...
   ```

## Версия API
v1

## Дата создания требования
2025-11-15

## Автор требования
Frontend Team
