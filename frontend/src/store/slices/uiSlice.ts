import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// UI state interface
interface UIState {
  isLoading: boolean;
  notifications: Notification[];
  modals: {
    isOpen: boolean;
    type: string | null;
    data: any;
  };
  sidebar: {
    isOpen: boolean;
    collapsed: boolean;
  };
  theme: 'light' | 'dark';
}

// Notification interface
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  timestamp: number;
}

// Initial state
const initialState: UIState = {
  isLoading: false,
  notifications: [],
  modals: {
    isOpen: false,
    type: null,
    data: null,
  },
  sidebar: {
    isOpen: false,
    collapsed: false,
  },
  theme: 'light',
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Notifications
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Modals
    openModal: (state, action: PayloadAction<{ type: string; data?: any }>) => {
      state.modals.isOpen = true;
      state.modals.type = action.payload.type;
      state.modals.data = action.payload.data || null;
    },
    
    closeModal: (state) => {
      state.modals.isOpen = false;
      state.modals.type = null;
      state.modals.data = null;
    },

    // Sidebar
    toggleSidebar: (state) => {
      state.sidebar.isOpen = !state.sidebar.isOpen;
    },
    
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isOpen = action.payload;
    },
    
    toggleSidebarCollapsed: (state) => {
      state.sidebar.collapsed = !state.sidebar.collapsed;
    },
    
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebar.collapsed = action.payload;
    },

    // Theme
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

// Export actions
export const {
  setLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapsed,
  setSidebarCollapsed,
  setTheme,
  toggleTheme,
} = uiSlice.actions;

// Export reducer
export default uiSlice.reducer;