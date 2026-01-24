
// 🌐 OFFLINE SLICE - NEW FILE


import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Network status
  isOnline: navigator.onLine, // Browser's online status
  
  // Last sync info
  lastSyncTime: null,
  
  // Cached data info
  hasCachedData: false,
  cacheSize: 0,
  
  // User notifications
  showOfflineIndicator: false,
  offlineMessage: null,
  
  // Read-only mode info
  isReadOnlyMode: false,
};

export const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    // ✅ SET ONLINE/OFFLINE STATUS
    setOnlineStatus: (state, action) => {
      const wasOffline = !state.isOnline;
      state.isOnline = action.payload;
      
      // Show indicator when going offline
      if (!action.payload && wasOffline === false) {
        state.showOfflineIndicator = true;
        state.offlineMessage = 'You are offline. Showing cached data.';
        state.isReadOnlyMode = true;
        console.log('📡 Offline mode activated');
      }
      
      // Hide indicator when back online
      if (action.payload && wasOffline === true) {
        state.showOfflineIndicator = false;
        state.offlineMessage = 'Back online!';
        state.isReadOnlyMode = false;
        state.lastSyncTime = new Date().toISOString();
        console.log('📡 Online mode activated');
        
        // Auto-hide "back online" message after 3 seconds
        setTimeout(() => {
          // You'll dispatch this from your component
        }, 3000);
      }
    },

    // ✅ UPDATE LAST SYNC TIME
    setLastSyncTime: (state, action) => {
      state.lastSyncTime = action.payload || new Date().toISOString();
    },

    // ✅ SET CACHED DATA INFO
    setCachedDataInfo: (state, action) => {
      state.hasCachedData = action.payload.hasCachedData;
      state.cacheSize = action.payload.cacheSize || 0;
    },

    // ✅ SHOW/HIDE OFFLINE INDICATOR
    setShowOfflineIndicator: (state, action) => {
      state.showOfflineIndicator = action.payload;
    },

    // ✅ SET OFFLINE MESSAGE
    setOfflineMessage: (state, action) => {
      state.offlineMessage = action.payload;
    },

    // ✅ CLEAR OFFLINE MESSAGE
    clearOfflineMessage: (state) => {
      state.offlineMessage = null;
    },

    // ✅ RESET OFFLINE STATE
    /*eslint-disable*/
    resetOfflineState: (state) => {
      return {
        ...initialState,
        isOnline: navigator.onLine,
      };
    },
  },
});

export const {
  setOnlineStatus,
  setLastSyncTime,
  setCachedDataInfo,
  setShowOfflineIndicator,
  setOfflineMessage,
  clearOfflineMessage,
  resetOfflineState,
} = offlineSlice.actions;

export default offlineSlice.reducer;


// 🎯 SELECTORS (for easy access in components)

export const selectIsOnline = (state) => state.offline.isOnline;
export const selectShowOfflineIndicator = (state) => state.offline.showOfflineIndicator;
export const selectOfflineMessage = (state) => state.offline.offlineMessage;
export const selectIsReadOnlyMode = (state) => state.offline.isReadOnlyMode;
export const selectLastSyncTime = (state) => state.offline.lastSyncTime;