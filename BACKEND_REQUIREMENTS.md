# Backend Requirements for Trial Role Implementation

## Issue: Trial Users Cannot Select Employees on Workload Page

### Problem Description

Trial users need to be able to view workload data for all employees (including those with role `Employee`) to properly evaluate the system. However, the current backend implementation filters out users with role `Employee` from the `/auth` endpoint response when the requesting user has role `Trial`.

### Current Backend Behavior

**Endpoint:** `GET /auth`
**Current response for Trial users:** Returns only users with roles: `Admin`, `Manager`, `Trial`
**Missing:** Users with role `Employee` are filtered out

### Required Backend Changes

#### Option 1: Create New Endpoint (Recommended)

Create a new endpoint specifically for workload employee selection:

---

## Новый эндпоинт: GET /workload/employees

### Описание

Специальный эндпоинт для получения списка всех сотрудников (включая роль Employee) для использования на странице workload. Этот эндпоинт создан специально для Trial пользователей, которым нужно видеть всех сотрудников в dropdown селекторе для полноценной оценки функционала управления рабочей нагрузкой.

### URL

```
GET /workload/employees
```

### Аутентификация

Требуется JWT токен в заголовке:
```
Authorization: Bearer <token>
```

### Доступ

- ✅ Admin
- ✅ Manager
- ✅ Trial
- ✅ Employee (для просмотра списка коллег)

### Query параметры

Отсутствуют

### Пример запроса

```typescript
const response = await fetch('http://localhost:3000/workload/employees', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const employees = await response.json();
```

### Пример ответа (200 OK)

```json
[
  {
    "id": "b1c4a3e5-a818-4ebc-9cee-f6b4d672a6e3",
    "email": "ivan.petrov@example.com",
    "firstName": "Иван",
    "lastName": "Петров",
    "role": "Employee",
    "phone": "+79111111111",
    "dateBirth": "1990-01-15T00:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": "c2d5b4f6-b919-5fcd-adff-g7c5e783b7f4",
    "email": "maria.sidorova@example.com",
    "firstName": "Мария",
    "lastName": "Сидорова",
    "role": "Manager",
    "phone": "+79222222222",
    "dateBirth": "1985-05-20T00:00:00.000Z",
    "createdAt": "2024-01-10T09:15:00.000Z",
    "updatedAt": "2024-01-10T09:15:00.000Z"
  },
  {
    "id": "d3e6c5g7-c020-6gde-beg0-h8d6f894c8g5",
    "email": "trial.user@example.com",
    "firstName": "Тестовый",
    "lastName": "Пользователь",
    "role": "Trial",
    "phone": "+79333333333",
    "dateBirth": "1995-12-01T00:00:00.000Z",
    "createdAt": "2024-12-01T14:20:00.000Z",
    "updatedAt": "2024-12-01T14:20:00.000Z"
  }
]
```

### Отличие от GET /auth

| Эндпоинт                | Для Trial пользователей возвращает   |
|-------------------------|--------------------------------------|
| GET /auth               | ❌ Все пользователи КРОМЕ Employee    |
| GET /workload/employees | ✅ ВСЕ пользователи, включая Employee |

### Использование на фронтенде

Этот эндпоинт следует использовать только на странице workload для заполнения dropdown списка сотрудников. Для всех остальных страниц продолжайте использовать GET /auth.

```typescript
// В файле: src/services/workload.ts
async getEmployees(): Promise<User[]> {
  try {
    const response = await apiRequest.get<User[]>('/workload/employees');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    throw new Error(error.response?.data?.message || 'Ошибка при загрузке списка сотрудников');
  }
}
```

### Коды ответов

- `200 OK` - Успешно получен список сотрудников
- `401 Unauthorized` - Отсутствует или невалидный JWT токен
- `403 Forbidden` - Пользователь не имеет прав (роль Customer не имеет доступа)

### Примечания

- Эндпоинт возвращает всех пользователей независимо от роли запрашивающего
- Для Trial пользователей это единственный эндпоинт, который возвращает Employee роли
- Данные не должны содержать пароль и другую чувствительную информацию
- Эндпоинт не требует query параметров - всегда возвращает полный список

---

#### Option 2: Modify Existing Endpoint Behavior (NOT Recommended)

Modify the `/auth` endpoint to include users with role `Employee` in responses to Trial users.

**Note:** This might have side effects on other parts of the application where Trial users should NOT see Employee users (e.g., Employees page).

### Frontend Code Location

The issue is in:
- **File:** `src/services/workload.ts`
- **Method:** `getEmployees()`
- **Current code:**
```typescript
async getEmployees(): Promise<User[]> {
  try {
    const response = await apiRequest.get<User[]>('/auth');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    throw new Error(error.response?.data?.message || 'Ошибка при загрузке списка сотрудников');
  }
}
```

**Expected fix:** Change to use `/workload/employees` endpoint once available

### Impact

**Current Impact:**
- Trial users see the "Сотрудник:" (Employee) dropdown on workload page
- Dropdown only shows "Все сотрудники" (All employees) option
- No individual employees available for selection
- Trial users cannot view individual employee workload data

**Expected Behavior After Fix:**
- Trial users can see all employees in the dropdown
- Trial users can select individual employees to view their workload
- Trial users can properly evaluate the workload management feature

### Security Considerations

- Trial users should be able to VIEW workload data for all employees (read-only)
- Trial users should NOT be able to CREATE, UPDATE, or DELETE workload entries (already implemented)
- This is an exception to the general rule that Trial users cannot see Employee role users
- The exception is justified because workload data viewing is essential for evaluating the system

### Testing

Once backend changes are implemented, test:
1. Login as Trial user
2. Navigate to "Загруженность" (Workload) page
3. Click on "Сотрудник:" dropdown
4. Verify that all employees with role `Employee` are listed
5. Select an employee
6. Verify workload data loads for selected employee

### Related Frontend Files

- `src/pages/workload/workload.tsx` - Employee filter UI
- `src/services/workload.ts` - API calls
- `src/store/slices/workload_slice.ts` - State management
- `TRIAL_ROLE_IMPLEMENTATION.md` - Trial role documentation

### Priority

**HIGH** - This blocks Trial users from properly evaluating one of the core features of the system.

### Contact

For questions about this requirement, contact the frontend development team.

---

**Date:** 2025-12-08
**Frontend Version:** Current development branch
