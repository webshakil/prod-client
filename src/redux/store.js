// ✅ COMPATIBLE STORE.JS - NO CHANGES TO YOUR EXISTING CODE
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import userReducer from './slices/userSlice.js';
import subscriptionReducer from './slices/subscriptionSlice.js';
import electionReducer from './slices/electionSlice.js'; // 🆕 ADD THIS
import { authApi } from './api/auth/authApi.js';
import { userApi } from './api/user/userApi.js';
import { subscriptionApi } from './api/subscription/subscriptionApi.js';

export const store = configureStore({
  reducer: {
    // ✅ YOUR EXISTING REDUCERS - NOT CHANGED
    auth: authReducer,
    user: userReducer,
    subscription: subscriptionReducer,
    election: electionReducer, // 🆕 ADD THIS LINE ONLY
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [subscriptionApi.reducerPath]: subscriptionApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // ✅ YOUR EXISTING IGNORED ACTIONS - NOT CHANGED
        ignoredActions: [
          'auth/setAuthenticationComplete',
          'auth/restoreAuthFromStorage',
          // 🆕 ADD THESE FOR ELECTION FILE UPLOADS
          'election/updateDraftElection',
          'election/updateDraftField',
        ],
        // ✅ YOUR EXISTING IGNORED PATHS - NOT CHANGED
        ignoredPaths: [
          'auth.tokenExpiresAt',
          // 🆕 ADD THESE FOR ELECTION FILE UPLOADS
          'election.draftElection.topic_image',
          'election.draftElection.topic_video',
          'election.draftElection.logo',
          'election.draftElection.questions',
        ],
      },
    })
      // ✅ YOUR EXISTING MIDDLEWARE - NOT CHANGED
      .concat(authApi.middleware)
      .concat(userApi.middleware)
      .concat(subscriptionApi.middleware),
});

export default store;
//last workable file
// import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './slices/authSlice.js';
// import userReducer from './slices/userSlice.js';
// import subscriptionReducer from './slices/subscriptionSlice.js';
// import { authApi } from './api/auth/authApi.js';
// import { userApi } from './api/user/userApi.js';
// import { subscriptionApi } from './api/subscription/subscriptionApi.js';

// export const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     user: userReducer,
//     subscription: subscriptionReducer,
//     [authApi.reducerPath]: authApi.reducer,
//     [userApi.reducerPath]: userApi.reducer,
//     [subscriptionApi.reducerPath]: subscriptionApi.reducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         ignoredActions: [
//           'auth/setAuthenticationComplete',
//           'auth/restoreAuthFromStorage',
//         ],
//         ignoredPaths: ['auth.tokenExpiresAt'],
//       },
//     })
//       .concat(authApi.middleware)
//       .concat(userApi.middleware)
//       .concat(subscriptionApi.middleware),
// });

// export default store;
