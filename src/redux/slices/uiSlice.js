import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  error: null,
  success: null,
  notification: {
    type: null, // 'success', 'error', 'warning', 'info'
    message: null,
    visible: false,
    duration: 3000,
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    setSuccess: (state, action) => {
      state.success = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    clearSuccess: (state) => {
      state.success = null;
    },

    showNotification: (state, action) => {
      const { type, message, duration } = action.payload;
      state.notification = {
        type,
        message,
        visible: true,
        duration: duration || 3000,
      };
    },

    hideNotification: (state) => {
      state.notification.visible = false;
    },
  },
});

export const {
  setLoading,
  setError,
  setSuccess,
  clearError,
  clearSuccess,
  showNotification,
  hideNotification,
} = uiSlice.actions;

export default uiSlice.reducer;