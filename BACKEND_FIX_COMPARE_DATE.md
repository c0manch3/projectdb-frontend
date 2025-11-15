# Исправление эндпоинта аналитики - поддержка кастомной даты сравнения

## Проблема

Эндпоинт `GET /analytics/projects-workload` в данный момент игнорирует параметр `compareDate` из query string и всегда сравнивает с предыдущим днем.

### Текущее поведение:
```
GET /analytics/projects-workload?compareDate=2025-11-05
```

Возвращает:
```json
{
  "date": "2025-11-14",
  "compareDate": "2025-11-13",  // ❌ Игнорирует переданный параметр!
  "projects": [...]
}
```

## Требуемая реализация

### Эндпоинт
```
GET /analytics/projects-workload
```

### Query параметры

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `date` | string (YYYY-MM-DD) | Нет | Дата для анализа. По умолчанию: текущая дата |
| `compareDate` | string (YYYY-MM-DD) | Нет | Дата для сравнения. По умолчанию: предыдущий день от `date` |

### Примеры запросов

#### 1. Без параметров (текущее поведение должно остаться)
```http
GET /analytics/projects-workload
```

Ответ:
```json
{
  "date": "2025-11-14",
  "compareDate": "2025-11-13",  // Предыдущий день
  "projects": [...]
}
```

#### 2. С кастомной датой сравнения
```http
GET /analytics/projects-workload?compareDate=2025-11-05
```

Ожидаемый ответ:
```json
{
  "date": "2025-11-14",
  "compareDate": "2025-11-05",  // ✅ Использует переданный параметр
  "projects": [
    {
      "projectId": "...",
      "projectName": "ПИК Токарево РД 9 корпус",
      "employeeCount": 3,
      "previousEmployeeCount": 5,  // Количество на 2025-11-05
      "changePercent": -40,  // Рассчитано от 2025-11-05
      "employees": [...]
    }
  ]
}
```

#### 3. С обеими датами
```http
GET /analytics/projects-workload?date=2025-11-10&compareDate=2025-11-05
```

Ожидаемый ответ:
```json
{
  "date": "2025-11-10",
  "compareDate": "2025-11-05",
  "projects": [...]  // Сравнивает 10 ноября с 5 ноября
}
```

## Логика расчета

### changePercent
```typescript
changePercent = ((employeeCount - previousEmployeeCount) / previousEmployeeCount) * 100
```

Где:
- `employeeCount` - количество сотрудников на дату `date`
- `previousEmployeeCount` - количество сотрудников на дату `compareDate`

### Примеры расчета

**Пример 1:**
- На 14 ноября: 3 сотрудника
- На 5 ноября: 5 сотрудников
- changePercent = ((3 - 5) / 5) * 100 = -40%

**Пример 2:**
- На 14 ноября: 2 сотрудника
- На 5 ноября: 1 сотрудник
- changePercent = ((2 - 1) / 1) * 100 = +100%

**Пример 3:**
- На 14 ноября: 2 сотрудника
- На 5 ноября: 0 сотрудников (проект не существовал)
- changePercent = +100% (или можно использовать специальную логику для новых проектов)

## Валидация

### Ограничения:
1. `compareDate` не может быть позже `date`
2. Если `compareDate` не указан, использовать `date - 1 день`
3. Формат даты: `YYYY-MM-DD`

### Обработка ошибок:

```json
// compareDate > date
{
  "statusCode": 400,
  "message": "compareDate cannot be later than date"
}
```

```json
// Неверный формат даты
{
  "statusCode": 400,
  "message": "Invalid date format. Expected YYYY-MM-DD"
}
```

## Текущая реализация фронтенда

Фронтенд уже реализован и корректно отправляет запросы:

```typescript
// src/services/analytics.ts
export interface ProjectsWorkloadQuery {
  date?: string;
  compareDate?: string;
}

async getProjectsWorkload(query?: ProjectsWorkloadQuery) {
  const params = new URLSearchParams();

  if (query?.date) {
    params.append('date', query.date);
  }

  if (query?.compareDate) {
    params.append('compareDate', query.compareDate);
  }

  const url = queryString
    ? `/analytics/projects-workload?${queryString}`
    : '/analytics/projects-workload';

  return await apiRequest.get(url);
}
```

## Тестирование

После исправления проверьте следующие сценарии:

1. ✅ Запрос без параметров возвращает сравнение с предыдущим днем
2. ✅ Запрос с `compareDate=2025-11-05` возвращает `compareDate: "2025-11-05"` в ответе
3. ✅ Значения `previousEmployeeCount` и `changePercent` корректно рассчитываются для выбранной даты
4. ✅ Валидация работает корректно (compareDate не позже date)

## Приоритет

**ВЫСОКИЙ** - функционал уже реализован на фронтенде и ожидает исправления бэкенда.
