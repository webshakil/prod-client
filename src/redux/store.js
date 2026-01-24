// ============================================
// 🚀 ENHANCED REDUX STORE WITH OFFLINE SUPPORT
// ============================================
// This is your UPDATED store.js with offline capabilities
// Drop-in replacement for src/redux/store.js

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // LocalStorage for web
import { combineReducers } from '@reduxjs/toolkit';

// Base API
import indexApi from './api/indexApi';

// All other APIs
import { userApi } from './api/user/userApi';
import { electionStatsApi } from './api/admin/electionStatsApi';
import { analyticsApi } from './api/analytics/analyticsApi';
import { analyticsApiKeyApi } from './api/analytics/analyticsApiKeyApi';
import { platformAnalyticsApi } from './api/analytics/platformAnalyticsApi';
import { apiKeyApi } from './api/election/apiKeyApi';
import { electionApiRTK } from './api/election/electionApi';
import { lotteryyApi } from './api/lotteryyy/lotteryApi';
import { lotteryDrawApi } from './api/lotteryyy/lotteryDrawApi';
import { lotteryTicketApi } from './api/lotteryyy/lotteryTicketApi';
import { paymentApi } from './api/payment/paymentApi';
import { assignmentApi } from './api/role/assignmentApi';
import { permissionApi } from './api/role/permissionApi';
import { roleApi } from './api/role/roleApi';
import { subscriptionApi } from './api/subscription/subscriptionApi';
import { auditTrailApi } from './api/verification/auditTrailApi';
import { encryptionApi } from './api/verification/encryptionApi';
import { verificationApi } from './api/verification/verificationApi';
import { ballotApi } from './api/voting/ballotApi';
import { videoWatchApi } from './api/voting/videoWatchApi';
import { votingApi } from './api/voting/votingApi';
import { depositApi } from './api/walllet/depositApi';
import { electionPaymentApi } from './api/walllet/electionPaymentApi';
import { paymentConfigApi } from './api/walllet/paymentConfigApi';
import { wallletApi } from './api/walllet/wallletApi';
import { withdrawalApi } from './api/walllet/withdrawalApi';
import { recommendationApi } from './api/recommendations/recommendationApi';

// Slices
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import electionReducer from './slices/electionSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import notificationReducer from './slices/notificationSlice';
import walletReducer from './slices/wallletSlice';
import votingNewReducer from './slices/votingNewSlice';
import lotteryyReducer from './slices/lotteryySlice';
import recommendationReducer from './slices/recommendationSlice';

// ============================================
// 🆕 OFFLINE SLICE - NEW ADDITION
// ============================================
import offlineReducer from './slices/offlineSlice'; // You'll create this

// ============================================
// 📦 PERSIST CONFIG - ENHANCED FOR OFFLINE
// ============================================
const persistConfig = {
  key: 'root',
  storage, // LocalStorage for web
  version: 1,
  
  // ✅ Persist these reducers for offline access
  whitelist: [
    'auth',           // User auth data
    'user',           // User profile
    'election',       // Elections data
    'subscription',   // Subscription info
    'wallet',         // Wallet data
    'votingNew',      // Voting data
    'lotteryyy',      // Lottery data
    'recommendations', // Recommendations
    'offline',        // Offline state (NEW)
    
    // ✅ PERSIST ALL API CACHES FOR OFFLINE READ ACCESS
    indexApi.reducerPath,
    userApi.reducerPath,
    electionStatsApi.reducerPath,
    analyticsApi.reducerPath,
    analyticsApiKeyApi.reducerPath,
    platformAnalyticsApi.reducerPath,
    apiKeyApi.reducerPath,
    electionApiRTK.reducerPath,
    lotteryyApi.reducerPath,
    lotteryDrawApi.reducerPath,
    lotteryTicketApi.reducerPath,
    paymentApi.reducerPath,
    assignmentApi.reducerPath,
    permissionApi.reducerPath,
    roleApi.reducerPath,
    subscriptionApi.reducerPath,
    auditTrailApi.reducerPath,
    encryptionApi.reducerPath,
    verificationApi.reducerPath,
    ballotApi.reducerPath,
    videoWatchApi.reducerPath,
    votingApi.reducerPath,
    depositApi.reducerPath,
    electionPaymentApi.reducerPath,
    paymentConfigApi.reducerPath,
    wallletApi.reducerPath,
    withdrawalApi.reducerPath,
    recommendationApi.reducerPath,
  ],
  
  // Blacklist (don't persist these - they're temporary)
  blacklist: ['notifications'], // Don't persist notifications
};


// 📋 COLLECT ALL APIS

const allApis = [
  indexApi,
  userApi,
  electionStatsApi,
  analyticsApi,
  analyticsApiKeyApi,
  platformAnalyticsApi,
  apiKeyApi,
  electionApiRTK,
  lotteryyApi,
  lotteryDrawApi,
  lotteryTicketApi,
  paymentApi,
  assignmentApi,
  permissionApi,
  roleApi,
  subscriptionApi,
  auditTrailApi,
  encryptionApi,
  verificationApi,
  ballotApi,
  videoWatchApi,
  votingApi,
  depositApi,
  electionPaymentApi,
  paymentConfigApi,
  wallletApi,
  withdrawalApi,
  recommendationApi,
];


// 🔧 BUILD REDUCERS DYNAMICALLY

const apiReducers = {};
allApis.forEach(api => {
  apiReducers[api.reducerPath] = api.reducer;
});

const rootReducer = combineReducers({
  ...apiReducers,
  auth: authReducer,
  user: userReducer,
  election: electionReducer,
  subscription: subscriptionReducer,
  notifications: notificationReducer,
  wallet: walletReducer,
  votingNew: votingNewReducer,
  lotteryyy: lotteryyReducer,
  recommendations: recommendationReducer,
  offline: offlineReducer, // 🆕 NEW
});


// 💾 CREATE PERSISTED REDUCER

const persistedReducer = persistReducer(persistConfig, rootReducer);


// 🏪 CONFIGURE STORE WITH OFFLINE SUPPORT

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => {
    let middleware = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'auth/setCredentials',
          // Add offline actions if needed
        ],
      },
    });
    
    // Add all API middlewares
    allApis.forEach(api => {
      middleware = middleware.concat(api.middleware);
    });
    
    return middleware;
  },
});


// 🔄 CREATE PERSISTOR

export const persistor = persistStore(store);

export default store;









//last workable code only to add offline capabilities above code
// // src/redux/store.js - UPDATED WITH SHAPED AI RECOMMENDATIONS
// import { configureStore } from '@reduxjs/toolkit';
// import { persistStore, persistReducer } from 'redux-persist';
// import storage from 'redux-persist/lib/storage';
// import { combineReducers } from '@reduxjs/toolkit';

// // Base API
// import indexApi from './api/indexApi';

// // All other APIs (add all that exist)
// import { userApi } from './api/user/userApi';
// import { electionStatsApi } from './api/admin/electionStatsApi';
// import { analyticsApi } from './api/analytics/analyticsApi';
// import { analyticsApiKeyApi } from './api/analytics/analyticsApiKeyApi';
// import { platformAnalyticsApi } from './api/analytics/platformAnalyticsApi';
// import { apiKeyApi } from './api/election/apiKeyApi';
// import { electionApiRTK } from './api/election/electionApi';
// import { lotteryyApi } from './api/lotteryyy/lotteryApi';
// import { lotteryDrawApi } from './api/lotteryyy/lotteryDrawApi';
// import { lotteryTicketApi } from './api/lotteryyy/lotteryTicketApi';
// import { paymentApi } from './api/payment/paymentApi';
// import { assignmentApi } from './api/role/assignmentApi';
// import { permissionApi } from './api/role/permissionApi';
// import { roleApi } from './api/role/roleApi';
// import { subscriptionApi } from './api/subscription/subscriptionApi';
// import { auditTrailApi } from './api/verification/auditTrailApi';
// import { encryptionApi } from './api/verification/encryptionApi';
// import { verificationApi } from './api/verification/verificationApi';
// import { ballotApi } from './api/voting/ballotApi';
// import { videoWatchApi } from './api/voting/videoWatchApi';
// import { votingApi } from './api/voting/votingApi';
// import { depositApi } from './api/walllet/depositApi';
// import { electionPaymentApi } from './api/walllet/electionPaymentApi';
// import { paymentConfigApi } from './api/walllet/paymentConfigApi';
// import { wallletApi } from './api/walllet/wallletApi';
// import { withdrawalApi } from './api/walllet/withdrawalApi';

// // ✅ NEW: Import Shaped AI Recommendation API
// import { recommendationApi } from './api/recommendations/recommendationApi';

// // Slices
// import authReducer from './slices/authSlice';
// import userReducer from './slices/userSlice';
// import electionReducer from './slices/electionSlice';
// import subscriptionReducer from './slices/subscriptionSlice';
// import notificationReducer from './slices/notificationSlice';
// import walletReducer from './slices/wallletSlice';
// import votingNewReducer from './slices/votingNewSlice';
// import lotteryyReducer from './slices/lotteryySlice';

// // ✅ NEW: Import Shaped AI Recommendation Slice
// import recommendationReducer from './slices/recommendationSlice';

// const persistConfig = {
//   key: 'root',
//   storage,
//   whitelist: ['auth', 'user'],
// };

// // Collect all APIs
// const allApis = [
//   indexApi,
//   userApi,
//   electionStatsApi,
//   analyticsApi,
//   analyticsApiKeyApi,
//   platformAnalyticsApi,
//   apiKeyApi,
//   electionApiRTK,
//   lotteryyApi,
//   lotteryDrawApi,
//   lotteryTicketApi,
//   paymentApi,
//   assignmentApi,
//   permissionApi,
//   roleApi,
//   subscriptionApi,
//   auditTrailApi,
//   encryptionApi,
//   verificationApi,
//   ballotApi,
//   videoWatchApi,
//   votingApi,
//   depositApi,
//   electionPaymentApi,
//   paymentConfigApi,
//   wallletApi,
//   withdrawalApi,
//   // ✅ NEW: Add Recommendation API
//   recommendationApi,
// ];

// // Build reducers object dynamically
// const apiReducers = {};
// allApis.forEach(api => {
//   apiReducers[api.reducerPath] = api.reducer;
// });

// const rootReducer = combineReducers({
//   ...apiReducers,
//   auth: authReducer,
//   user: userReducer,
//   election: electionReducer,
//   subscription: subscriptionReducer,
//   notifications: notificationReducer,
//   wallet: walletReducer,
//   votingNew: votingNewReducer,
//   lotteryyy: lotteryyReducer,
//   // ✅ NEW: Add Shaped AI Recommendation Reducer
//   recommendations: recommendationReducer,
// });

// const persistedReducer = persistReducer(persistConfig, rootReducer);

// export const store = configureStore({
//   reducer: persistedReducer,
//   middleware: (getDefaultMiddleware) => {
//     let middleware = getDefaultMiddleware({
//       serializableCheck: {
//         ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'auth/setCredentials'],
//       },
//     });
    
//     // Add all API middlewares
//     allApis.forEach(api => {
//       middleware = middleware.concat(api.middleware);
//     });
    
//     return middleware;
//   },
// });

// export const persistor = persistStore(store);
// export default store;
