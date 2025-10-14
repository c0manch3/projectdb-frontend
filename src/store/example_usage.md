# Redux Store Usage Examples

This file demonstrates how to use the Redux store that has been set up for the LenconDB project.

## Basic Usage in Components

### 1. Import the typed hooks

```typescript
import { useAppDispatch, useAppSelector } from '../store';
```

### 2. Using selectors to access state

```typescript
import React from 'react';
import { useAppSelector } from '../store';
import { selectCurrentUser, selectIsAuthenticated } from '../store/slices/auth_slice';

function UserProfile(): JSX.Element {
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.firstName} {user?.lastName}</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
}
```

### 3. Dispatching actions

```typescript
import React from 'react';
import { useAppDispatch } from '../store';
import { logout, setUser } from '../store/slices/auth_slice';
import { showSuccessNotification } from '../store/slices/ui_slice';

function LoginComponent(): JSX.Element {
  const dispatch = useAppDispatch();

  const handleLogin = (userData: User) => {
    // Set user data
    dispatch(setUser(userData));
    
    // Show success notification
    dispatch(showSuccessNotification({ 
      message: 'Successfully logged in!',
      duration: 3000 
    }));
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(showSuccessNotification({ 
      message: 'Successfully logged out!' 
    }));
  };

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

## Available Actions

### Auth Actions
- `loginSuccess({ user, accessToken, refreshToken })` - Complete login
- `setUser(user)` - Set user data
- `setTokens({ accessToken, refreshToken })` - Update tokens
- `logout()` - Clear auth state
- `setLoading(boolean)` - Set loading state
- `setError(string | null)` - Set error message

### Projects Actions
- `setProjects(projects[])` - Set projects list
- `addProject(project)` - Add new project
- `updateProject(project)` - Update existing project
- `removeProject(projectId)` - Remove project
- `setCurrentProject(project | null)` - Set current project
- `updateFilters(filters)` - Update project filters
- `updatePagination(pagination)` - Update pagination

### Users Actions
- `setUsers(users[])` - Set users list
- `addUser(user)` - Add new user
- `updateUser(user)` - Update existing user
- `removeUser(userId)` - Remove user
- `updateUserRole({ userId, role })` - Update user role
- `setSearchQuery(query)` - Set search query

### UI Actions
- `showSuccessNotification({ message, duration? })` - Show success notification
- `showErrorNotification({ message, duration? })` - Show error notification
- `showWarningNotification({ message, duration? })` - Show warning notification
- `showInfoNotification({ message, duration? })` - Show info notification
- `hideNotification(notificationId)` - Hide specific notification
- `openModal({ type, data? })` - Open modal
- `closeModal()` - Close modal
- `toggleSidebar()` - Toggle sidebar collapse state

## Available Selectors

### Auth Selectors
- `selectAuth` - Complete auth state
- `selectCurrentUser` - Current user data
- `selectIsAuthenticated` - Authentication status
- `selectAccessToken` - Access token
- `selectAuthLoading` - Auth loading state

### Projects Selectors
- `selectProjectsList` - Projects list
- `selectCurrentProject` - Current project
- `selectProjectsFilters` - Current filters
- `selectFilteredProjects` - Filtered projects list
- `selectProjectById(state, projectId)` - Specific project by ID

### Users Selectors
- `selectUsersList` - Users list
- `selectFilteredUsers` - Filtered users list
- `selectUserById(state, userId)` - Specific user by ID
- `selectUsersByRole(state, role)` - Users by role

### UI Selectors
- `selectNotifications` - All notifications
- `selectModal` - Modal state
- `selectSidebar` - Sidebar state
- `selectGlobalLoading` - Global loading state

## Complete Component Example

```typescript
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  selectProjectsList, 
  selectProjectsLoading, 
  selectProjectsError 
} from '../store/slices/projects_slice';
import { setProjects, setLoading } from '../store/slices/projects_slice';
import { showErrorNotification } from '../store/slices/ui_slice';

function ProjectsList(): JSX.Element {
  const dispatch = useAppDispatch();
  const projects = useAppSelector(selectProjectsList);
  const loading = useAppSelector(selectProjectsLoading);
  const error = useAppSelector(selectProjectsError);

  useEffect(() => {
    const fetchProjects = async () => {
      dispatch(setLoading(true));
      try {
        // Fetch projects from API
        const response = await fetch('/api/projects');
        const projectsData = await response.json();
        dispatch(setProjects(projectsData));
      } catch (err) {
        dispatch(showErrorNotification({ 
          message: 'Failed to load projects' 
        }));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchProjects();
  }, [dispatch]);

  if (loading) {
    return <div>Loading projects...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Projects ({projects.length})</h1>
      <ul>
        {projects.map(project => (
          <li key={project.id}>
            {project.name} - {project.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Next Steps

1. Create async thunks for API calls using `createAsyncThunk`
2. Add middleware for API error handling
3. Implement persistence for auth tokens
4. Add more complex selectors with memoization using `createSelector`
5. Consider adding RTK Query for advanced API state management