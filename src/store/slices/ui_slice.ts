import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UiState, Notification } from '../types';

// Initial state
const initialState: UiState = {
  notifications: [],
  modals: {
    isOpen: false,
    type: null,
    data: null,
  },
  sidebar: {
    isCollapsed: false,
  },
  loading: {
    global: false,
  },
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Notifications
    showNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },

    hideNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },

    clearAllNotifications: (state) => {
      state.notifications = [];
    },

    // Modals
    openModal: (state, action: PayloadAction<{ type: string; data?: any }>) => {
      state.modals = {
        isOpen: true,
        type: action.payload.type,
        data: action.payload.data || null,
      };
    },

    closeModal: (state) => {
      state.modals = {
        isOpen: false,
        type: null,
        data: null,
      };
    },

    updateModalData: (state, action: PayloadAction<any>) => {
      if (state.modals.isOpen) {
        state.modals.data = action.payload;
      }
    },

    // Sidebar
    toggleSidebar: (state) => {
      state.sidebar.isCollapsed = !state.sidebar.isCollapsed;
    },

    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isCollapsed = action.payload;
    },

    // Global loading
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },

    // Reset UI state
    resetUiState: () => initialState,

    // Bulk notification actions
    showSuccessNotification: (state, action: PayloadAction<{ message: string; duration?: number }>) => {
      const notification: Notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: 'success',
        message: action.payload.message,
        ...(action.payload.duration !== undefined && { duration: action.payload.duration }),
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },

    showErrorNotification: (state, action: PayloadAction<{ message: string; duration?: number }>) => {
      const notification: Notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: 'error',
        message: action.payload.message,
        ...(action.payload.duration !== undefined && { duration: action.payload.duration }),
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },

    showWarningNotification: (state, action: PayloadAction<{ message: string; duration?: number }>) => {
      const notification: Notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: 'warning',
        message: action.payload.message,
        ...(action.payload.duration !== undefined && { duration: action.payload.duration }),
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },

    showInfoNotification: (state, action: PayloadAction<{ message: string; duration?: number }>) => {
      const notification: Notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: 'info',
        message: action.payload.message,
        ...(action.payload.duration !== undefined && { duration: action.payload.duration }),
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
  },
});

// Export actions
export const {
  showNotification,
  hideNotification,
  clearAllNotifications,
  openModal,
  closeModal,
  updateModalData,
  toggleSidebar,
  setSidebarCollapsed,
  setGlobalLoading,
  resetUiState,
  showSuccessNotification,
  showErrorNotification,
  showWarningNotification,
  showInfoNotification,
} = uiSlice.actions;

// Export reducer
export default uiSlice.reducer;

// Selectors
export const selectUi = (state: { ui: UiState }) => state.ui;
export const selectNotifications = (state: { ui: UiState }) => state.ui.notifications;
export const selectModal = (state: { ui: UiState }) => state.ui.modals;
export const selectSidebar = (state: { ui: UiState }) => state.ui.sidebar;
export const selectGlobalLoading = (state: { ui: UiState }) => state.ui.loading.global;

// Complex selectors
export const selectActiveNotifications = (state: { ui: UiState }) => {
  const now = Date.now();
  return state.ui.notifications.filter(notification => {
    if (!notification.duration) return true;
    return (now - notification.timestamp) < notification.duration;
  });
};

export const selectModalByType = (state: { ui: UiState }, modalType: string) => {
  return state.ui.modals.isOpen && state.ui.modals.type === modalType ? state.ui.modals : null;
};

export const selectIsModalOpen = (state: { ui: UiState }, modalType?: string) => {
  if (!modalType) return state.ui.modals.isOpen;
  return state.ui.modals.isOpen && state.ui.modals.type === modalType;
};