import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Import slices
import authSlice from './slices/auth_slice';
import projectsSlice from './slices/projects_slice';
import constructionsSlice from './slices/constructions_slice';
import usersSlice from './slices/users_slice';
import workloadSlice from './slices/workload_slice';
import analyticsSlice from './slices/analytics_slice';
import uiSlice from './slices/ui_slice';

// Import types
// import type { RootState } from './types';

// Configure the store
export const store = configureStore({
  reducer: {
    auth: authSlice,
    projects: projectsSlice,
    constructions: constructionsSlice,
    users: usersSlice,
    workload: workloadSlice,
    analytics: analyticsSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type AppRootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<AppRootState> = useSelector;

export default store;