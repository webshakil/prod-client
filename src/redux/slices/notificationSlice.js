// src/redux/slices/notificationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const NOTIFICATION_TYPES = {
  NEW_USER: 'new_user',
  NEW_ELECTION: 'new_election',
  NEW_VOTE: 'new_vote',
  NEW_SUBSCRIPTION: 'new_subscription',
  VOTE_PAYMENT: 'vote_payment',
  ELECTION_STATUS: 'election_status',
  WALLET_TRANSACTION: 'wallet_transaction',
  SYSTEM: 'system',
};

const initialState = {
  notifications: [],
  unreadCount: 0,
  lastChecked: null,
};

// Helper to load from localStorage
const loadNotificationsFromStorage = () => {
  try {
    const stored = localStorage.getItem('vottery_notifications');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        notifications: parsed.notifications || [],
        unreadCount: parsed.unreadCount || 0,
        lastChecked: parsed.lastChecked || null,
      };
    }
  } catch (error) {
    console.error('Failed to load notifications from storage:', error);
  }
  return initialState;
};

// Helper to save to localStorage
const saveNotificationsToStorage = (state) => {
  try {
    localStorage.setItem('vottery_notifications', JSON.stringify({
      notifications: state.notifications,
      unreadCount: state.unreadCount,
      lastChecked: state.lastChecked,
    }));
  } catch (error) {
    console.error('Failed to save notifications to storage:', error);
  }
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: loadNotificationsFromStorage(),
  reducers: {
    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload,
      };
      
      state.notifications.unshift(notification);
      state.unreadCount += 1;
      
      // Keep only last 100 notifications
      if (state.notifications.length > 100) {
        state.notifications = state.notifications.slice(0, 100);
      }
      
      saveNotificationsToStorage(state);
    },

    markAsRead: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
        saveNotificationsToStorage(state);
      }
    },

    markAllAsRead: (state) => {
      state.notifications.forEach(n => n.read = true);
      state.unreadCount = 0;
      state.lastChecked = new Date().toISOString();
      saveNotificationsToStorage(state);
    },

    deleteNotification: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      
      if (notification && !notification.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      
      state.notifications = state.notifications.filter(n => n.id !== notificationId);
      saveNotificationsToStorage(state);
    },

    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.lastChecked = new Date().toISOString();
      saveNotificationsToStorage(state);
    },

    loadNotifications: (state) => {
      const loaded = loadNotificationsFromStorage();
      state.notifications = loaded.notifications;
      state.unreadCount = loaded.unreadCount;
      state.lastChecked = loaded.lastChecked;
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  loadNotifications,
} = notificationSlice.actions;

export const NOTIFICATION_TYPES_EXPORT = NOTIFICATION_TYPES;

export default notificationSlice.reducer;