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

```
GET /workload/employees
```

**Response:** All users including those with role `Employee`, regardless of requesting user's role

**Access:** Available to `Admin`, `Manager`, `Employee`, and `Trial` users

**Purpose:** This endpoint is specifically for the workload page employee selector dropdown

#### Option 2: Modify Existing Endpoint Behavior

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
