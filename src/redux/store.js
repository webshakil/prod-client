// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // uses localStorage
import { combineReducers } from 'redux';

// Slice Reducers
import authReducer from './slices/authSlice.js';
import userReducer from './slices/userSlice.js';
import subscriptionReducer from './slices/subscriptionSlice.js';
import electionReducer from './slices/electionSlice.js';
import votingReducer from './slices/votingSlice.js';
import walletReducer from './slices/walletSlice.js';
import lotteryReducer from './slices/lotterySlice.js';
import roleReducer from './slices/roleSlice.js'; // ✅ NEW: Role management slice

// API Imports
import { authApi } from './api/auth/authApi.js';
import { userApi } from './api/user/userApi.js';
import { subscriptionApi } from './api/subscription/subscriptionApi.js';
import { electionApiRTK } from './api/election/electionApi.js';
import { votingApi } from './api/voting/votingApi.js';
// ✅ NEW: Role management APIs
import { roleApi } from './api/role/roleApi.js';
import { permissionApi } from './api/role/permissionApi.js';
import { assignmentApi } from './api/role/assignmentApi.js';

// Persist configuration
const persistConfig = {
  key: 'vottery-root',
  version: 1,
  storage,
  whitelist: ['auth', 'subscription', 'election', 'voting', 'lottery', 'role'], // ✅ NEW: Added 'role' to persist
  //blacklist: ['election', 'voting', 'wallet', 'lottery'], // Don't persist these
};

// Combine all reducers
const rootReducer = combineReducers({
  // Slice Reducers
  auth: authReducer,
  user: userReducer,
  subscription: subscriptionReducer,
  election: electionReducer,
  voting: votingReducer,
  wallet: walletReducer,
  lottery: lotteryReducer,
  role: roleReducer, // ✅ NEW: Role management slice
  
  // API Reducers (these should NOT be persisted)
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [subscriptionApi.reducerPath]: subscriptionApi.reducer,
  [electionApiRTK.reducerPath]: electionApiRTK.reducer,
  [votingApi.reducerPath]: votingApi.reducer,
  // ✅ NEW: Role management API reducers
  [roleApi.reducerPath]: roleApi.reducer,
  [permissionApi.reducerPath]: permissionApi.reducer,
  [assignmentApi.reducerPath]: assignmentApi.reducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          // Redux Persist actions
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          // Your existing actions
          'auth/setAuthenticationComplete',
          'auth/restoreAuthFromStorage',
          'election/updateDraftElection',
          'election/updateDraftField',
          'voting/setCurrentVote',
          'voting/updateVoteAnswer',
          'voting/clearVote',
          'wallet/updateBalance',
          'lottery/setTickets',
          // ✅ NEW: Role management actions
          'role/setUserRoles',
          'role/setUserPermissions',
          'role/addUserRole',
          'role/removeUserRole',
          'role/cacheRole',
          'role/cachePermission',
        ],
        ignoredPaths: [
          'auth.tokenExpiresAt',
          'election.draftElection.topic_image',
          'election.draftElection.topic_video',
          'election.draftElection.logo',
          'election.draftElection.questions',
          'voting.currentVote.timestamp',
          'voting.videoProgress.lastUpdated',
          'wallet.lastTransaction.timestamp',
          'lottery.tickets',
          // ✅ NEW: Role management paths
          'role.rolesCache',
          'role.permissionsCache',
          'role.selectedRole',
        ],
      },
    })
      .concat(authApi.middleware)
      .concat(userApi.middleware)
      .concat(subscriptionApi.middleware)
      .concat(electionApiRTK.middleware)
      .concat(votingApi.middleware)
      // ✅ NEW: Role management API middleware
      .concat(roleApi.middleware)
      .concat(permissionApi.middleware)
      .concat(assignmentApi.middleware),
});

// Setup listeners for RTK Query
setupListeners(store.dispatch);

// Create persistor
export const persistor = persistStore(store);

export default store;
//last workable code
// // src/redux/store.js
// import { configureStore } from '@reduxjs/toolkit';
// import { setupListeners } from '@reduxjs/toolkit/query';
// import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
// import storage from 'redux-persist/lib/storage'; // uses localStorage
// import { combineReducers } from 'redux';

// // Slice Reducers
// import authReducer from './slices/authSlice.js';
// import userReducer from './slices/userSlice.js';
// import subscriptionReducer from './slices/subscriptionSlice.js';
// import electionReducer from './slices/electionSlice.js';
// import votingReducer from './slices/votingSlice.js';
// import walletReducer from './slices/walletSlice.js';
// import lotteryReducer from './slices/lotterySlice.js';

// // API Imports
// import { authApi } from './api/auth/authApi.js';
// import { userApi } from './api/user/userApi.js';
// import { subscriptionApi } from './api/subscription/subscriptionApi.js';
// import { electionApiRTK } from './api/election/electionApi.js';
// import { votingApi } from './api/voting/votingApi.js';

// // Persist configuration
// const persistConfig = {
//   key: 'vottery-root',
//   version: 1,
//   storage,
//   whitelist: ['auth', 'subscription', 'election', 'voting', 'lottery'], // Only persist auth and subscription
//   //blacklist: ['election', 'voting', 'wallet', 'lottery'], // Don't persist these
// };

// // Combine all reducers
// const rootReducer = combineReducers({
//   // Slice Reducers
//   auth: authReducer,
//   user: userReducer,
//   subscription: subscriptionReducer,
//   election: electionReducer,
//   voting: votingReducer,
//   wallet: walletReducer,
//   lottery: lotteryReducer,
  
//   // API Reducers (these should NOT be persisted)
//   [authApi.reducerPath]: authApi.reducer,
//   [userApi.reducerPath]: userApi.reducer,
//   [subscriptionApi.reducerPath]: subscriptionApi.reducer,
//   [electionApiRTK.reducerPath]: electionApiRTK.reducer,
//   [votingApi.reducerPath]: votingApi.reducer,
// });

// // Create persisted reducer
// const persistedReducer = persistReducer(persistConfig, rootReducer);

// // Create store
// export const store = configureStore({
//   reducer: persistedReducer,
  
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         ignoredActions: [
//           // Redux Persist actions
//           FLUSH,
//           REHYDRATE,
//           PAUSE,
//           PERSIST,
//           PURGE,
//           REGISTER,
//           // Your existing actions
//           'auth/setAuthenticationComplete',
//           'auth/restoreAuthFromStorage',
//           'election/updateDraftElection',
//           'election/updateDraftField',
//           'voting/setCurrentVote',
//           'voting/updateVoteAnswer',
//           'voting/clearVote',
//           'wallet/updateBalance',
//           'lottery/setTickets',
//         ],
//         ignoredPaths: [
//           'auth.tokenExpiresAt',
//           'election.draftElection.topic_image',
//           'election.draftElection.topic_video',
//           'election.draftElection.logo',
//           'election.draftElection.questions',
//           'voting.currentVote.timestamp',
//           'voting.videoProgress.lastUpdated',
//           'wallet.lastTransaction.timestamp',
//           'lottery.tickets',
//         ],
//       },
//     })
//       .concat(authApi.middleware)
//       .concat(userApi.middleware)
//       .concat(subscriptionApi.middleware)
//       .concat(electionApiRTK.middleware)
//       .concat(votingApi.middleware),
// });

// // Setup listeners for RTK Query
// setupListeners(store.dispatch);

// // Create persistor
// export const persistor = persistStore(store);

// export default store;
