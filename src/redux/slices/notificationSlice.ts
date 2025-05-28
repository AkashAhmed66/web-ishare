import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/apiService';
import { API_ENDPOINTS } from '../../config/apiConfig';

// Notification interface
export interface Notification {
  id: string;
  userId?: string;
  title: string;
  body: string;
  read: boolean;
  type: string;
  createdAt: string;
  relatedId?: string;
  data?: Record<string, any>;
}

// Define the state
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

// Async thunks
export const getNotifications = createAsyncThunk(
  'notification/getNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<{ success: boolean; notifications: Notification[] }>(API_ENDPOINTS.GET_NOTIFICATIONS);
      return response.notifications; // Extract notifications array from the response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get notifications');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiService.patch(API_ENDPOINTS.MARK_NOTIFICATION_READ(id), {});
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await apiService.patch(API_ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ, {});
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiService.delete(API_ENDPOINTS.DELETE_NOTIFICATION(id));
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
    }
  }
);

export const clearAllNotifications = createAsyncThunk(
  'notification/clearAll',
  async (_, { rejectWithValue }) => {
    try {
      await apiService.delete(API_ENDPOINTS.CLEAR_NOTIFICATIONS);
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear notifications');
    }
  }
);

export const getUnreadCount = createAsyncThunk(
  'notification/getUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<{ success: boolean; count: number }>(API_ENDPOINTS.NOTIFICATION_UNREAD_COUNT);
      return response; // Return the whole response since the reducer expects { count: number }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get unread count');
    }
  }
);

// Create the notification slice
const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      // Validate that the payload is a valid notification object
      if (action.payload && typeof action.payload === 'object' && action.payload.id) {
        state.notifications.unshift(action.payload);
        if (!action.payload.read) {
          state.unreadCount += 1;
        }
      } else {
        console.error('Invalid notification payload:', action.payload);
      }
    },
    resetNotificationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get notifications
      .addCase(getNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure action.payload is an array before setting notifications
        if (Array.isArray(action.payload)) {
          state.notifications = action.payload;
          state.unreadCount = action.payload.filter((notification) => !notification.read).length;
        } else {
          console.error('Invalid notifications payload:', action.payload);
          state.notifications = [];
          state.unreadCount = 0;
        }
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Mark notification as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find((n) => n.id === action.payload);
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      // Mark all notifications as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach((notification) => {
          notification.read = true;
        });
        state.unreadCount = 0;
      })

      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const index = state.notifications.findIndex((n) => n.id === action.payload);
        if (index !== -1) {
          const wasUnread = !state.notifications[index].read;
          state.notifications.splice(index, 1);
          if (wasUnread) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      })

      // Clear all notifications
      .addCase(clearAllNotifications.fulfilled, (state) => {
        state.notifications = [];
        state.unreadCount = 0;
      })

      // Get unread count
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.count;
      });
  },
});

export const { addNotification, resetNotificationError } = notificationSlice.actions;
export default notificationSlice.reducer; 