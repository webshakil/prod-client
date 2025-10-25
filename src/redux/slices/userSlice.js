import { createSlice } from '@reduxjs/toolkit';
import { userApi } from '../api/user/userApi.js';

const initialState = {
  currentUser: null,
  profile: null,
  preferences: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    setPreferences: (state, action) => {
      state.preferences = action.payload;
    },
    clearUserData: (state) => {
      state.currentUser = null;
      state.profile = null;
      state.preferences = null;
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get Complete User Data
    builder
      .addMatcher(
        userApi.endpoints.getCompleteUserData.matchPending,
        (state) => {
          state.loading = true;
        }
      )
      .addMatcher(
        userApi.endpoints.getCompleteUserData.matchFulfilled,
        (state, action) => {
          state.loading = false;
          state.currentUser = action.payload.data.user;
          state.profile = action.payload.data.profile;
          state.preferences = action.payload.data.preferences;
          state.error = null;
        }
      )
      .addMatcher(
        userApi.endpoints.getCompleteUserData.matchRejected,
        (state, action) => {
          state.loading = false;
          state.error = action.error.message;
        }
      );

    // Get Profile
    builder
      .addMatcher(
        userApi.endpoints.getProfile.matchFulfilled,
        (state, action) => {
          state.profile = action.payload.data;
        }
      );

    // Get Preferences
    builder
      .addMatcher(
        userApi.endpoints.getPreferences.matchFulfilled,
        (state, action) => {
          state.preferences = action.payload.data;
        }
      );
  },
});

export const {
  setCurrentUser,
  setProfile,
  setPreferences,
  clearUserData,
  setError,
  clearError,
} = userSlice.actions;

export default userSlice.reducer;
