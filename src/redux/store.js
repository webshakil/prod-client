// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // uses localStorage
import { combineReducers } from 'redux';

// ========================================
// EXISTING SLICE REDUCERS (UNCHANGED)
// ========================================
import authReducer from './slices/authSlice.js';
import userReducer from './slices/userSlice.js';
import subscriptionReducer from './slices/subscriptionSlice.js';
import electionReducer from './slices/electionSlice.js';
import votingReducer from './slices/votingSlice.js';
import walletReducer from './slices/walletSlice.js';
import lotteryReducer from './slices/lotterySlice.js';
import roleReducer from './slices/roleSlice.js';
import notificationReducer from './slices/notificationSlice.js';

// ========================================
// ✨ NEW ENHANCED SLICES (ADDED)
// ========================================
import votingNewReducer from './slices/votingNewSlice.js';
import lotteryyReducer from './slices/lotteryySlice.js';
import wallletReducer from './slices/wallletSlice.js';
import verificationReducer from './slices/verificationSlice.js';

// ========================================
// EXISTING API IMPORTS (UNCHANGED)
// ========================================
import { authApi } from './api/auth/authApi.js';
import { userApi } from './api/user/userApi.js';
import { subscriptionApi } from './api/subscription/subscriptionApi.js';
import { electionApiRTK } from './api/election/electionApi.js';
import { votingApi } from './api/voting/votingApi.js';
import { roleApi } from './api/role/roleApi.js';
import { permissionApi } from './api/role/permissionApi.js';
import { assignmentApi } from './api/role/assignmentApi.js';

// ========================================
//  NEW VOTING APIs (ADDED)
// ========================================
import { ballotApi } from './api/voting/ballotApi.js';
import { videoWatchApi } from './api/voting/videoWatchApi.js';

// ========================================
//  NEW LOTTERY APIs (ADDED)
// ========================================
import { lotteryyApi } from './api/lotteryyy/lotteryApi.js';
import { lotteryDrawApi } from './api/lotteryyy/lotteryDrawApi.js';
import { lotteryTicketApi } from './api/lotteryyy/lotteryTicketApi.js';

// ========================================
// NEW WALLET APIs (ADDED)
// ========================================
//import { wallletApi } from './api/walllet/wallletApi.js';
import { depositApi } from './api/walllet/depositApi.js';
import { withdrawalApi } from './api/walllet/withdrawalApi.js';
import { electionPaymentApi } from './api/walllet/electionPaymentApi.js';

// ========================================
//  NEW VERIFICATION APIs (ADDED)
// ========================================
import { verificationApi } from './api/verification/verificationApi.js';
import { encryptionApi } from './api/verification/encryptionApi.js';
import { auditTrailApi } from './api/verification/auditTrailApi.js';

// ========================================
//  NEW ANALYTICS API (ADDED)
// ========================================
import { analyticsApi } from './api/analytics/analyticsApi.js';
import wallletApi from './api/walllet/wallletApi.js';
import { electionStatsApi } from './api/admin/electionStatsApi.js';
import paymentConfigApi from './api/walllet/paymentConfigApi.js';
import apiKeyApi from './api/election/apiKeyApi.js';

// ========================================
// ✨ NEW API KEY API (ADDED)
// ========================================
//import { apiKeyApi } from './api/apiKey/apiKeyApi.js';
//import { apiKeyApi } from './api/apiKey/apiKeyApi.js';

// ========================================
// ✨ NEW PAYMENT CONFIG API (ADDED)
// ========================================
//import { paymentConfigApi } from './api/payment/paymentConfigApi.js';

// ========================================
// PERSIST CONFIGURATION
// ========================================
const persistConfig = {
  key: 'vottery-root',
  version: 1,
  storage,
  whitelist: [
    'auth', 
    'subscription', 
    'election', 
    'voting', 
    'lottery', 
    'role',
    'notifications',
    //  NEW: Add new slices to persist (optional)
    // 'votingNew',
    // 'lotteryyy',
    // 'walllet',
    // 'verification',
  ],
};

// ========================================
// COMBINE ALL REDUCERS
// ========================================
const rootReducer = combineReducers({
  // ========================================
  // EXISTING SLICE REDUCERS (UNCHANGED)
  // ========================================
  auth: authReducer,
  user: userReducer,
  subscription: subscriptionReducer,
  election: electionReducer,
  voting: votingReducer,
  wallet: walletReducer,
  lottery: lotteryReducer,
  role: roleReducer,
  notifications: notificationReducer,
  
  // ========================================
  //  NEW ENHANCED SLICES (ADDED)
  // ========================================
  votingNew: votingNewReducer,
  lotteryyy: lotteryyReducer,
  walllet: wallletReducer,
  verification: verificationReducer,
  
  // ========================================
  // EXISTING API REDUCERS (UNCHANGED)
  // ========================================
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [subscriptionApi.reducerPath]: subscriptionApi.reducer,
  [electionApiRTK.reducerPath]: electionApiRTK.reducer,
  [votingApi.reducerPath]: votingApi.reducer,
  [roleApi.reducerPath]: roleApi.reducer,
  [permissionApi.reducerPath]: permissionApi.reducer,
  [assignmentApi.reducerPath]: assignmentApi.reducer,
  [electionStatsApi.reducerPath]: electionStatsApi.reducer,
  
  // ========================================
  //  NEW VOTING API REDUCERS (ADDED)
  // ========================================
  [ballotApi.reducerPath]: ballotApi.reducer,
  [videoWatchApi.reducerPath]: videoWatchApi.reducer,
  
  // ========================================
  //  NEW LOTTERY API REDUCERS (ADDED)
  // ========================================
  [lotteryyApi.reducerPath]: lotteryyApi.reducer,
  [lotteryDrawApi.reducerPath]: lotteryDrawApi.reducer,
  [lotteryTicketApi.reducerPath]: lotteryTicketApi.reducer,
  
  // ========================================
  //  NEW WALLET API REDUCERS (ADDED)
  // ========================================
  [wallletApi.reducerPath]: wallletApi.reducer,
  [depositApi.reducerPath]: depositApi.reducer,
  [withdrawalApi.reducerPath]: withdrawalApi.reducer,
  [electionPaymentApi.reducerPath]: electionPaymentApi.reducer,
  
  // ========================================
  //  NEW VERIFICATION API REDUCERS (ADDED)
  // ========================================
  [verificationApi.reducerPath]: verificationApi.reducer,
  [encryptionApi.reducerPath]: encryptionApi.reducer,
  [auditTrailApi.reducerPath]: auditTrailApi.reducer,
  
  // ========================================
  //  NEW ANALYTICS API REDUCER (ADDED)
  // ========================================
  [analyticsApi.reducerPath]: analyticsApi.reducer,
  
  // ========================================
  // ✨ NEW PAYMENT CONFIG API REDUCER (ADDED)
  // ========================================
  [paymentConfigApi.reducerPath]: paymentConfigApi.reducer,
  
  // ========================================
  // ✨ NEW API KEY API REDUCER (ADDED)
  // ========================================
  [apiKeyApi.reducerPath]: apiKeyApi.reducer,
});

// ========================================
// CREATE PERSISTED REDUCER
// ========================================
const persistedReducer = persistReducer(persistConfig, rootReducer);

// ========================================
// CREATE STORE
// ========================================
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
          // ========================================
          // EXISTING ACTIONS (UNCHANGED)
          // ========================================
          'auth/setAuthenticationComplete',
          'auth/restoreAuthFromStorage',
          'election/updateDraftElection',
          'election/updateDraftField',
          'voting/setCurrentVote',
          'voting/updateVoteAnswer',
          'voting/clearVote',
          'wallet/updateBalance',
          'lottery/setTickets',
          'role/setUserRoles',
          'role/setUserPermissions',
          'role/addUserRole',
          'role/removeUserRole',
          'role/cacheRole',
          'role/cachePermission',
          'notifications/addNotification',
          'notifications/markAsRead',
          'notifications/markAllAsRead',
          'notifications/deleteNotification',
          'notifications/clearAllNotifications',
          'notifications/loadNotifications',
          // ========================================
          // NEW ACTIONS (ADDED)
          // ========================================
          'votingNew/setBallot',
          'votingNew/setAnswer',
          'votingNew/setVoteSubmitted',
          'votingNew/setVideoProgress',
          'lotteryyy/setLotteryInfo',
          'lotteryyy/setMyTicket',
          'lotteryyy/setWinners',
          'lotteryyy/setAnimationState',
          'walllet/setWallet',
          'walllet/setTransactions',
          'walllet/updateBalance',
          'walllet/startDeposit',
          'walllet/startWithdrawal',
          'verification/setReceiptVerification',
          'verification/setHashVerification',
          'verification/setEncryptionVerification',
          'verification/setAuditTrail',
        ],
        ignoredPaths: [
          // ========================================
          // EXISTING PATHS (UNCHANGED)
          // ========================================
          'auth.tokenExpiresAt',
          'election.draftElection.topic_image',
          'election.draftElection.topic_video',
          'election.draftElection.logo',
          'election.draftElection.questions',
          'voting.currentVote.timestamp',
          'voting.videoProgress.lastUpdated',
          'wallet.lastTransaction.timestamp',
          'lottery.tickets',
          'role.rolesCache',
          'role.permissionsCache',
          'role.selectedRole',
          'notifications.notifications',
          'notifications.unreadCount',
          'notifications.lastChecked',
          // ========================================
          // ✨ NEW PATHS (ADDED)
          // ========================================
          'votingNew.currentBallot',
          'votingNew.videoProgress.lastPosition',
          'lotteryyy.currentLottery',
          'lotteryyy.participants',
          'lotteryyy.winners',
          'lotteryyy.lastUpdate',
          'walllet.transactions',
          'walllet.blockedAccounts',
          'walllet.lastUpdate',
          'verification.bulletinBoard',
          'verification.auditTrail',
          'verification.encryptionDetails',
        ],
      },
    })
      // ========================================
      // EXISTING API MIDDLEWARE (UNCHANGED)
      // ========================================
      .concat(authApi.middleware)
      .concat(userApi.middleware)
      .concat(subscriptionApi.middleware)
      .concat(electionApiRTK.middleware)
      .concat(votingApi.middleware)
      .concat(roleApi.middleware)
      .concat(permissionApi.middleware)
      .concat(assignmentApi.middleware)
      // ========================================
      // ✨ NEW VOTING API MIDDLEWARE (ADDED)
      // ========================================
      .concat(ballotApi.middleware)
      .concat(videoWatchApi.middleware)
      // ========================================
      //  NEW LOTTERY API MIDDLEWARE (ADDED)
      // ========================================
      .concat(lotteryyApi.middleware)
      .concat(lotteryDrawApi.middleware)
      .concat(lotteryTicketApi.middleware)
      .concat(electionStatsApi.middleware)
      // ========================================
      //  NEW WALLET API MIDDLEWARE (ADDED)
      // ========================================
      .concat(wallletApi.middleware)
      .concat(depositApi.middleware)
      .concat(withdrawalApi.middleware)
      .concat(electionPaymentApi.middleware)
      // ========================================
      //  NEW VERIFICATION API MIDDLEWARE (ADDED)
      // ========================================
      .concat(verificationApi.middleware)
      .concat(encryptionApi.middleware)
      .concat(auditTrailApi.middleware)
      // ========================================
      //  NEW ANALYTICS API MIDDLEWARE (ADDED)
      // ========================================
      .concat(analyticsApi.middleware)
      // ========================================
      // ✨ NEW PAYMENT CONFIG API MIDDLEWARE (ADDED)
      // ========================================
      .concat(paymentConfigApi.middleware)
      // ========================================
      // ✨ NEW API KEY API MIDDLEWARE (ADDED)
      // ========================================
      .concat(apiKeyApi.middleware),
});

// ========================================
// SETUP LISTENERS FOR RTK QUERY
// ========================================
setupListeners(store.dispatch);

// ========================================
// CREATE PERSISTOR
// ========================================
export const persistor = persistStore(store);

export default store;
//last workable code only to add apikeyapi above code
// // src/redux/store.js
// import { configureStore } from '@reduxjs/toolkit';
// import { setupListeners } from '@reduxjs/toolkit/query';
// import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
// import storage from 'redux-persist/lib/storage'; // uses localStorage
// import { combineReducers } from 'redux';

// // ========================================
// // EXISTING SLICE REDUCERS (UNCHANGED)
// // ========================================
// import authReducer from './slices/authSlice.js';
// import userReducer from './slices/userSlice.js';
// import subscriptionReducer from './slices/subscriptionSlice.js';
// import electionReducer from './slices/electionSlice.js';
// import votingReducer from './slices/votingSlice.js';
// import walletReducer from './slices/walletSlice.js';
// import lotteryReducer from './slices/lotterySlice.js';
// import roleReducer from './slices/roleSlice.js';
// import notificationReducer from './slices/notificationSlice.js';

// // ========================================
// // ✨ NEW ENHANCED SLICES (ADDED)
// // ========================================
// import votingNewReducer from './slices/votingNewSlice.js';
// import lotteryyReducer from './slices/lotteryySlice.js';
// import wallletReducer from './slices/wallletSlice.js';
// import verificationReducer from './slices/verificationSlice.js';

// // ========================================
// // EXISTING API IMPORTS (UNCHANGED)
// // ========================================
// import { authApi } from './api/auth/authApi.js';
// import { userApi } from './api/user/userApi.js';
// import { subscriptionApi } from './api/subscription/subscriptionApi.js';
// import { electionApiRTK } from './api/election/electionApi.js';
// import { votingApi } from './api/voting/votingApi.js';
// import { roleApi } from './api/role/roleApi.js';
// import { permissionApi } from './api/role/permissionApi.js';
// import { assignmentApi } from './api/role/assignmentApi.js';

// // ========================================
// //  NEW VOTING APIs (ADDED)
// // ========================================
// import { ballotApi } from './api/voting/ballotApi.js';
// import { videoWatchApi } from './api/voting/videoWatchApi.js';

// // ========================================
// //  NEW LOTTERY APIs (ADDED)
// // ========================================
// import { lotteryyApi } from './api/lotteryyy/lotteryApi.js';
// import { lotteryDrawApi } from './api/lotteryyy/lotteryDrawApi.js';
// import { lotteryTicketApi } from './api/lotteryyy/lotteryTicketApi.js';

// // ========================================
// // NEW WALLET APIs (ADDED)
// // ========================================
// //import { wallletApi } from './api/walllet/wallletApi.js';
// import { depositApi } from './api/walllet/depositApi.js';
// import { withdrawalApi } from './api/walllet/withdrawalApi.js';
// import { electionPaymentApi } from './api/walllet/electionPaymentApi.js';

// // ========================================
// //  NEW VERIFICATION APIs (ADDED)
// // ========================================
// import { verificationApi } from './api/verification/verificationApi.js';
// import { encryptionApi } from './api/verification/encryptionApi.js';
// import { auditTrailApi } from './api/verification/auditTrailApi.js';

// // ========================================
// //  NEW ANALYTICS API (ADDED)
// // ========================================
// import { analyticsApi } from './api/analytics/analyticsApi.js';
// import wallletApi from './api/walllet/wallletApi.js';
// import { electionStatsApi } from './api/admin/electionStatsApi.js';
// import paymentConfigApi from './api/walllet/paymentConfigApi.js';

// // ========================================
// // ✨ NEW PAYMENT CONFIG API (ADDED)
// // ========================================
// //import { paymentConfigApi } from './api/payment/paymentConfigApi.js';

// // ========================================
// // PERSIST CONFIGURATION
// // ========================================
// const persistConfig = {
//   key: 'vottery-root',
//   version: 1,
//   storage,
//   whitelist: [
//     'auth', 
//     'subscription', 
//     'election', 
//     'voting', 
//     'lottery', 
//     'role',
//     'notifications',
//     //  NEW: Add new slices to persist (optional)
//     // 'votingNew',
//     // 'lotteryyy',
//     // 'walllet',
//     // 'verification',
//   ],
// };

// // ========================================
// // COMBINE ALL REDUCERS
// // ========================================
// const rootReducer = combineReducers({
//   // ========================================
//   // EXISTING SLICE REDUCERS (UNCHANGED)
//   // ========================================
//   auth: authReducer,
//   user: userReducer,
//   subscription: subscriptionReducer,
//   election: electionReducer,
//   voting: votingReducer,
//   wallet: walletReducer,
//   lottery: lotteryReducer,
//   role: roleReducer,
//   notifications: notificationReducer,
  
//   // ========================================
//   //  NEW ENHANCED SLICES (ADDED)
//   // ========================================
//   votingNew: votingNewReducer,
//   lotteryyy: lotteryyReducer,
//   walllet: wallletReducer,
//   verification: verificationReducer,
  
//   // ========================================
//   // EXISTING API REDUCERS (UNCHANGED)
//   // ========================================
//   [authApi.reducerPath]: authApi.reducer,
//   [userApi.reducerPath]: userApi.reducer,
//   [subscriptionApi.reducerPath]: subscriptionApi.reducer,
//   [electionApiRTK.reducerPath]: electionApiRTK.reducer,
//   [votingApi.reducerPath]: votingApi.reducer,
//   [roleApi.reducerPath]: roleApi.reducer,
//   [permissionApi.reducerPath]: permissionApi.reducer,
//   [assignmentApi.reducerPath]: assignmentApi.reducer,
//   [electionStatsApi.reducerPath]: electionStatsApi.reducer,
  
//   // ========================================
//   //  NEW VOTING API REDUCERS (ADDED)
//   // ========================================
//   [ballotApi.reducerPath]: ballotApi.reducer,
//   [videoWatchApi.reducerPath]: videoWatchApi.reducer,
  
//   // ========================================
//   //  NEW LOTTERY API REDUCERS (ADDED)
//   // ========================================
//   [lotteryyApi.reducerPath]: lotteryyApi.reducer,
//   [lotteryDrawApi.reducerPath]: lotteryDrawApi.reducer,
//   [lotteryTicketApi.reducerPath]: lotteryTicketApi.reducer,
  
//   // ========================================
//   //  NEW WALLET API REDUCERS (ADDED)
//   // ========================================
//   [wallletApi.reducerPath]: wallletApi.reducer,
//   [depositApi.reducerPath]: depositApi.reducer,
//   [withdrawalApi.reducerPath]: withdrawalApi.reducer,
//   [electionPaymentApi.reducerPath]: electionPaymentApi.reducer,
  
//   // ========================================
//   //  NEW VERIFICATION API REDUCERS (ADDED)
//   // ========================================
//   [verificationApi.reducerPath]: verificationApi.reducer,
//   [encryptionApi.reducerPath]: encryptionApi.reducer,
//   [auditTrailApi.reducerPath]: auditTrailApi.reducer,
  
//   // ========================================
//   //  NEW ANALYTICS API REDUCER (ADDED)
//   // ========================================
//   [analyticsApi.reducerPath]: analyticsApi.reducer,
  
//   // ========================================
//   // ✨ NEW PAYMENT CONFIG API REDUCER (ADDED)
//   // ========================================
//   [paymentConfigApi.reducerPath]: paymentConfigApi.reducer,
// });

// // ========================================
// // CREATE PERSISTED REDUCER
// // ========================================
// const persistedReducer = persistReducer(persistConfig, rootReducer);

// // ========================================
// // CREATE STORE
// // ========================================
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
//           // ========================================
//           // EXISTING ACTIONS (UNCHANGED)
//           // ========================================
//           'auth/setAuthenticationComplete',
//           'auth/restoreAuthFromStorage',
//           'election/updateDraftElection',
//           'election/updateDraftField',
//           'voting/setCurrentVote',
//           'voting/updateVoteAnswer',
//           'voting/clearVote',
//           'wallet/updateBalance',
//           'lottery/setTickets',
//           'role/setUserRoles',
//           'role/setUserPermissions',
//           'role/addUserRole',
//           'role/removeUserRole',
//           'role/cacheRole',
//           'role/cachePermission',
//           'notifications/addNotification',
//           'notifications/markAsRead',
//           'notifications/markAllAsRead',
//           'notifications/deleteNotification',
//           'notifications/clearAllNotifications',
//           'notifications/loadNotifications',
//           // ========================================
//           // NEW ACTIONS (ADDED)
//           // ========================================
//           'votingNew/setBallot',
//           'votingNew/setAnswer',
//           'votingNew/setVoteSubmitted',
//           'votingNew/setVideoProgress',
//           'lotteryyy/setLotteryInfo',
//           'lotteryyy/setMyTicket',
//           'lotteryyy/setWinners',
//           'lotteryyy/setAnimationState',
//           'walllet/setWallet',
//           'walllet/setTransactions',
//           'walllet/updateBalance',
//           'walllet/startDeposit',
//           'walllet/startWithdrawal',
//           'verification/setReceiptVerification',
//           'verification/setHashVerification',
//           'verification/setEncryptionVerification',
//           'verification/setAuditTrail',
//         ],
//         ignoredPaths: [
//           // ========================================
//           // EXISTING PATHS (UNCHANGED)
//           // ========================================
//           'auth.tokenExpiresAt',
//           'election.draftElection.topic_image',
//           'election.draftElection.topic_video',
//           'election.draftElection.logo',
//           'election.draftElection.questions',
//           'voting.currentVote.timestamp',
//           'voting.videoProgress.lastUpdated',
//           'wallet.lastTransaction.timestamp',
//           'lottery.tickets',
//           'role.rolesCache',
//           'role.permissionsCache',
//           'role.selectedRole',
//           'notifications.notifications',
//           'notifications.unreadCount',
//           'notifications.lastChecked',
//           // ========================================
//           // ✨ NEW PATHS (ADDED)
//           // ========================================
//           'votingNew.currentBallot',
//           'votingNew.videoProgress.lastPosition',
//           'lotteryyy.currentLottery',
//           'lotteryyy.participants',
//           'lotteryyy.winners',
//           'lotteryyy.lastUpdate',
//           'walllet.transactions',
//           'walllet.blockedAccounts',
//           'walllet.lastUpdate',
//           'verification.bulletinBoard',
//           'verification.auditTrail',
//           'verification.encryptionDetails',
//         ],
//       },
//     })
//       // ========================================
//       // EXISTING API MIDDLEWARE (UNCHANGED)
//       // ========================================
//       .concat(authApi.middleware)
//       .concat(userApi.middleware)
//       .concat(subscriptionApi.middleware)
//       .concat(electionApiRTK.middleware)
//       .concat(votingApi.middleware)
//       .concat(roleApi.middleware)
//       .concat(permissionApi.middleware)
//       .concat(assignmentApi.middleware)
//       // ========================================
//       // ✨ NEW VOTING API MIDDLEWARE (ADDED)
//       // ========================================
//       .concat(ballotApi.middleware)
//       .concat(videoWatchApi.middleware)
//       // ========================================
//       //  NEW LOTTERY API MIDDLEWARE (ADDED)
//       // ========================================
//       .concat(lotteryyApi.middleware)
//       .concat(lotteryDrawApi.middleware)
//       .concat(lotteryTicketApi.middleware)
//       .concat(electionStatsApi.middleware)
//       // ========================================
//       //  NEW WALLET API MIDDLEWARE (ADDED)
//       // ========================================
//       .concat(wallletApi.middleware)
//       .concat(depositApi.middleware)
//       .concat(withdrawalApi.middleware)
//       .concat(electionPaymentApi.middleware)
//       // ========================================
//       //  NEW VERIFICATION API MIDDLEWARE (ADDED)
//       // ========================================
//       .concat(verificationApi.middleware)
//       .concat(encryptionApi.middleware)
//       .concat(auditTrailApi.middleware)
//       // ========================================
//       //  NEW ANALYTICS API MIDDLEWARE (ADDED)
//       // ========================================
//       .concat(analyticsApi.middleware)
//       // ========================================
//       // ✨ NEW PAYMENT CONFIG API MIDDLEWARE (ADDED)
//       // ========================================
//       .concat(paymentConfigApi.middleware),
// });

// // ========================================
// // SETUP LISTENERS FOR RTK QUERY
// // ========================================
// setupListeners(store.dispatch);

// // ========================================
// // CREATE PERSISTOR
// // ========================================
// export const persistor = persistStore(store);

// export default store;
//last workbale code. just to add payment gateway cofig above code
// // src/redux/store.js
// import { configureStore } from '@reduxjs/toolkit';
// import { setupListeners } from '@reduxjs/toolkit/query';
// import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
// import storage from 'redux-persist/lib/storage'; // uses localStorage
// import { combineReducers } from 'redux';

// // ========================================
// // EXISTING SLICE REDUCERS (UNCHANGED)
// // ========================================
// import authReducer from './slices/authSlice.js';
// import userReducer from './slices/userSlice.js';
// import subscriptionReducer from './slices/subscriptionSlice.js';
// import electionReducer from './slices/electionSlice.js';
// import votingReducer from './slices/votingSlice.js';
// import walletReducer from './slices/walletSlice.js';
// import lotteryReducer from './slices/lotterySlice.js';
// import roleReducer from './slices/roleSlice.js';
// import notificationReducer from './slices/notificationSlice.js';

// // ========================================
// // ✨ NEW ENHANCED SLICES (ADDED)
// // ========================================
// import votingNewReducer from './slices/votingNewSlice.js';
// import lotteryyReducer from './slices/lotteryySlice.js';
// import wallletReducer from './slices/wallletSlice.js';
// import verificationReducer from './slices/verificationSlice.js';

// // ========================================
// // EXISTING API IMPORTS (UNCHANGED)
// // ========================================
// import { authApi } from './api/auth/authApi.js';
// import { userApi } from './api/user/userApi.js';
// import { subscriptionApi } from './api/subscription/subscriptionApi.js';
// import { electionApiRTK } from './api/election/electionApi.js';
// import { votingApi } from './api/voting/votingApi.js';
// import { roleApi } from './api/role/roleApi.js';
// import { permissionApi } from './api/role/permissionApi.js';
// import { assignmentApi } from './api/role/assignmentApi.js';

// // ========================================
// //  NEW VOTING APIs (ADDED)
// // ========================================
// import { ballotApi } from './api/voting/ballotApi.js';
// import { videoWatchApi } from './api/voting/videoWatchApi.js';

// // ========================================
// //  NEW LOTTERY APIs (ADDED)
// // ========================================
// import { lotteryyApi } from './api/lotteryyy/lotteryApi.js';
// import { lotteryDrawApi } from './api/lotteryyy/lotteryDrawApi.js';
// import { lotteryTicketApi } from './api/lotteryyy/lotteryTicketApi.js';

// // ========================================
// // NEW WALLET APIs (ADDED)
// // ========================================
// //import { wallletApi } from './api/walllet/wallletApi.js';
// import { depositApi } from './api/walllet/depositApi.js';
// import { withdrawalApi } from './api/walllet/withdrawalApi.js';
// import { electionPaymentApi } from './api/walllet/electionPaymentApi.js';

// // ========================================
// //  NEW VERIFICATION APIs (ADDED)
// // ========================================
// import { verificationApi } from './api/verification/verificationApi.js';
// import { encryptionApi } from './api/verification/encryptionApi.js';
// import { auditTrailApi } from './api/verification/auditTrailApi.js';

// // ========================================
// //  NEW ANALYTICS API (ADDED)
// // ========================================
// import { analyticsApi } from './api/analytics/analyticsApi.js';
// import wallletApi from './api/walllet/wallletApi.js';
// import { electionStatsApi } from './api/admin/electionStatsApi.js';

// // ========================================
// // PERSIST CONFIGURATION
// // ========================================
// const persistConfig = {
//   key: 'vottery-root',
//   version: 1,
//   storage,
//   whitelist: [
//     'auth', 
//     'subscription', 
//     'election', 
//     'voting', 
//     'lottery', 
//     'role',
//     'notifications',
//     //  NEW: Add new slices to persist (optional)
//     // 'votingNew',
//     // 'lotteryyy',
//     // 'walllet',
//     // 'verification',
//   ],
// };

// // ========================================
// // COMBINE ALL REDUCERS
// // ========================================
// const rootReducer = combineReducers({
//   // ========================================
//   // EXISTING SLICE REDUCERS (UNCHANGED)
//   // ========================================
//   auth: authReducer,
//   user: userReducer,
//   subscription: subscriptionReducer,
//   election: electionReducer,
//   voting: votingReducer,
//   wallet: walletReducer,
//   lottery: lotteryReducer,
//   role: roleReducer,
//   notifications: notificationReducer,
  
//   // ========================================
//   //  NEW ENHANCED SLICES (ADDED)
//   // ========================================
//   votingNew: votingNewReducer,
//   lotteryyy: lotteryyReducer,
//   walllet: wallletReducer,
//   verification: verificationReducer,
  
//   // ========================================
//   // EXISTING API REDUCERS (UNCHANGED)
//   // ========================================
//   [authApi.reducerPath]: authApi.reducer,
//   [userApi.reducerPath]: userApi.reducer,
//   [subscriptionApi.reducerPath]: subscriptionApi.reducer,
//   [electionApiRTK.reducerPath]: electionApiRTK.reducer,
//   [votingApi.reducerPath]: votingApi.reducer,
//   [roleApi.reducerPath]: roleApi.reducer,
//   [permissionApi.reducerPath]: permissionApi.reducer,
//   [assignmentApi.reducerPath]: assignmentApi.reducer,
//   [electionStatsApi.reducerPath]: electionStatsApi.reducer,
  
//   // ========================================
//   //  NEW VOTING API REDUCERS (ADDED)
//   // ========================================
//   [ballotApi.reducerPath]: ballotApi.reducer,
//   [videoWatchApi.reducerPath]: videoWatchApi.reducer,
  
//   // ========================================
//   //  NEW LOTTERY API REDUCERS (ADDED)
//   // ========================================
//   [lotteryyApi.reducerPath]: lotteryyApi.reducer,
//   [lotteryDrawApi.reducerPath]: lotteryDrawApi.reducer,
//   [lotteryTicketApi.reducerPath]: lotteryTicketApi.reducer,
  
//   // ========================================
//   //  NEW WALLET API REDUCERS (ADDED)
//   // ========================================
//   [wallletApi.reducerPath]: wallletApi.reducer,
//   [depositApi.reducerPath]: depositApi.reducer,
//   [withdrawalApi.reducerPath]: withdrawalApi.reducer,
//   [electionPaymentApi.reducerPath]: electionPaymentApi.reducer,
  
//   // ========================================
//   //  NEW VERIFICATION API REDUCERS (ADDED)
//   // ========================================
//   [verificationApi.reducerPath]: verificationApi.reducer,
//   [encryptionApi.reducerPath]: encryptionApi.reducer,
//   [auditTrailApi.reducerPath]: auditTrailApi.reducer,
  
//   // ========================================
//   //  NEW ANALYTICS API REDUCER (ADDED)
//   // ========================================
//   [analyticsApi.reducerPath]: analyticsApi.reducer,
// });

// // ========================================
// // CREATE PERSISTED REDUCER
// // ========================================
// const persistedReducer = persistReducer(persistConfig, rootReducer);

// // ========================================
// // CREATE STORE
// // ========================================
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
//           // ========================================
//           // EXISTING ACTIONS (UNCHANGED)
//           // ========================================
//           'auth/setAuthenticationComplete',
//           'auth/restoreAuthFromStorage',
//           'election/updateDraftElection',
//           'election/updateDraftField',
//           'voting/setCurrentVote',
//           'voting/updateVoteAnswer',
//           'voting/clearVote',
//           'wallet/updateBalance',
//           'lottery/setTickets',
//           'role/setUserRoles',
//           'role/setUserPermissions',
//           'role/addUserRole',
//           'role/removeUserRole',
//           'role/cacheRole',
//           'role/cachePermission',
//           'notifications/addNotification',
//           'notifications/markAsRead',
//           'notifications/markAllAsRead',
//           'notifications/deleteNotification',
//           'notifications/clearAllNotifications',
//           'notifications/loadNotifications',
//           // ========================================
//           // NEW ACTIONS (ADDED)
//           // ========================================
//           'votingNew/setBallot',
//           'votingNew/setAnswer',
//           'votingNew/setVoteSubmitted',
//           'votingNew/setVideoProgress',
//           'lotteryyy/setLotteryInfo',
//           'lotteryyy/setMyTicket',
//           'lotteryyy/setWinners',
//           'lotteryyy/setAnimationState',
//           'walllet/setWallet',
//           'walllet/setTransactions',
//           'walllet/updateBalance',
//           'walllet/startDeposit',
//           'walllet/startWithdrawal',
//           'verification/setReceiptVerification',
//           'verification/setHashVerification',
//           'verification/setEncryptionVerification',
//           'verification/setAuditTrail',
//         ],
//         ignoredPaths: [
//           // ========================================
//           // EXISTING PATHS (UNCHANGED)
//           // ========================================
//           'auth.tokenExpiresAt',
//           'election.draftElection.topic_image',
//           'election.draftElection.topic_video',
//           'election.draftElection.logo',
//           'election.draftElection.questions',
//           'voting.currentVote.timestamp',
//           'voting.videoProgress.lastUpdated',
//           'wallet.lastTransaction.timestamp',
//           'lottery.tickets',
//           'role.rolesCache',
//           'role.permissionsCache',
//           'role.selectedRole',
//           'notifications.notifications',
//           'notifications.unreadCount',
//           'notifications.lastChecked',
//           // ========================================
//           // ✨ NEW PATHS (ADDED)
//           // ========================================
//           'votingNew.currentBallot',
//           'votingNew.videoProgress.lastPosition',
//           'lotteryyy.currentLottery',
//           'lotteryyy.participants',
//           'lotteryyy.winners',
//           'lotteryyy.lastUpdate',
//           'walllet.transactions',
//           'walllet.blockedAccounts',
//           'walllet.lastUpdate',
//           'verification.bulletinBoard',
//           'verification.auditTrail',
//           'verification.encryptionDetails',
//         ],
//       },
//     })
//       // ========================================
//       // EXISTING API MIDDLEWARE (UNCHANGED)
//       // ========================================
//       .concat(authApi.middleware)
//       .concat(userApi.middleware)
//       .concat(subscriptionApi.middleware)
//       .concat(electionApiRTK.middleware)
//       .concat(votingApi.middleware)
//       .concat(roleApi.middleware)
//       .concat(permissionApi.middleware)
//       .concat(assignmentApi.middleware)
//       // ========================================
//       // ✨ NEW VOTING API MIDDLEWARE (ADDED)
//       // ========================================
//       .concat(ballotApi.middleware)
//       .concat(videoWatchApi.middleware)
//       // ========================================
//       //  NEW LOTTERY API MIDDLEWARE (ADDED)
//       // ========================================
//       .concat(lotteryyApi.middleware)
//       .concat(lotteryDrawApi.middleware)
//       .concat(lotteryTicketApi.middleware)
//       .concat(electionStatsApi.middleware)
//       // ========================================
//       //  NEW WALLET API MIDDLEWARE (ADDED)
//       // ========================================
//       .concat(wallletApi.middleware)
//       .concat(depositApi.middleware)
//       .concat(withdrawalApi.middleware)
//       .concat(electionPaymentApi.middleware)
//       // ========================================
//       //  NEW VERIFICATION API MIDDLEWARE (ADDED)
//       // ========================================
//       .concat(verificationApi.middleware)
//       .concat(encryptionApi.middleware)
//       .concat(auditTrailApi.middleware)
//       // ========================================
//       //  NEW ANALYTICS API MIDDLEWARE (ADDED)
//       // ========================================
//       .concat(analyticsApi.middleware),
// });

// // ========================================
// // SETUP LISTENERS FOR RTK QUERY
// // ========================================
// setupListeners(store.dispatch);

// // ========================================
// // CREATE PERSISTOR
// // ========================================
// export const persistor = persistStore(store);

// export default store;
//last workable perfect code just to add notification slice above code
// // src/redux/store.js
// import { configureStore } from '@reduxjs/toolkit';
// import { setupListeners } from '@reduxjs/toolkit/query';
// import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
// import storage from 'redux-persist/lib/storage'; // uses localStorage
// import { combineReducers } from 'redux';

// // ========================================
// // EXISTING SLICE REDUCERS (UNCHANGED)
// // ========================================
// import authReducer from './slices/authSlice.js';
// import userReducer from './slices/userSlice.js';
// import subscriptionReducer from './slices/subscriptionSlice.js';
// import electionReducer from './slices/electionSlice.js';
// import votingReducer from './slices/votingSlice.js';
// import walletReducer from './slices/walletSlice.js';
// import lotteryReducer from './slices/lotterySlice.js';
// import roleReducer from './slices/roleSlice.js';

// // ========================================
// // ✨ NEW ENHANCED SLICES (ADDED)
// // ========================================
// import votingNewReducer from './slices/votingNewSlice.js';
// import lotteryyReducer from './slices/lotteryySlice.js';
// import wallletReducer from './slices/wallletSlice.js';
// import verificationReducer from './slices/verificationSlice.js';

// // ========================================
// // EXISTING API IMPORTS (UNCHANGED)
// // ========================================
// import { authApi } from './api/auth/authApi.js';
// import { userApi } from './api/user/userApi.js';
// import { subscriptionApi } from './api/subscription/subscriptionApi.js';
// import { electionApiRTK } from './api/election/electionApi.js';
// import { votingApi } from './api/voting/votingApi.js';
// import { roleApi } from './api/role/roleApi.js';
// import { permissionApi } from './api/role/permissionApi.js';
// import { assignmentApi } from './api/role/assignmentApi.js';

// // ========================================
// //  NEW VOTING APIs (ADDED)
// // ========================================
// import { ballotApi } from './api/voting/ballotApi.js';
// import { videoWatchApi } from './api/voting/videoWatchApi.js';

// // ========================================
// //  NEW LOTTERY APIs (ADDED)
// // ========================================
// import { lotteryyApi } from './api/lotteryyy/lotteryApi.js';
// import { lotteryDrawApi } from './api/lotteryyy/lotteryDrawApi.js';
// import { lotteryTicketApi } from './api/lotteryyy/lotteryTicketApi.js';

// // ========================================
// // NEW WALLET APIs (ADDED)
// // ========================================
// //import { wallletApi } from './api/walllet/wallletApi.js';
// import { depositApi } from './api/walllet/depositApi.js';
// import { withdrawalApi } from './api/walllet/withdrawalApi.js';
// import { electionPaymentApi } from './api/walllet/electionPaymentApi.js';

// // ========================================
// //  NEW VERIFICATION APIs (ADDED)
// // ========================================
// import { verificationApi } from './api/verification/verificationApi.js';
// import { encryptionApi } from './api/verification/encryptionApi.js';
// import { auditTrailApi } from './api/verification/auditTrailApi.js';

// // ========================================
// //  NEW ANALYTICS API (ADDED)
// // ========================================
// import { analyticsApi } from './api/analytics/analyticsApi.js';
// import wallletApi from './api/walllet/wallletApi.js';

// // ========================================
// // PERSIST CONFIGURATION
// // ========================================
// const persistConfig = {
//   key: 'vottery-root',
//   version: 1,
//   storage,
//   whitelist: [
//     'auth', 
//     'subscription', 
//     'election', 
//     'voting', 
//     'lottery', 
//     'role',
//     //  NEW: Add new slices to persist (optional)
//     // 'votingNew',
//     // 'lotteryyy',
//     // 'walllet',
//     // 'verification',
//   ],
// };

// // ========================================
// // COMBINE ALL REDUCERS
// // ========================================
// const rootReducer = combineReducers({
//   // ========================================
//   // EXISTING SLICE REDUCERS (UNCHANGED)
//   // ========================================
//   auth: authReducer,
//   user: userReducer,
//   subscription: subscriptionReducer,
//   election: electionReducer,
//   voting: votingReducer,
//   wallet: walletReducer,
//   lottery: lotteryReducer,
//   role: roleReducer,
  
//   // ========================================
//   //  NEW ENHANCED SLICES (ADDED)
//   // ========================================
//   votingNew: votingNewReducer,
//   lotteryyy: lotteryyReducer,
//   walllet: wallletReducer,
//   verification: verificationReducer,
  
//   // ========================================
//   // EXISTING API REDUCERS (UNCHANGED)
//   // ========================================
//   [authApi.reducerPath]: authApi.reducer,
//   [userApi.reducerPath]: userApi.reducer,
//   [subscriptionApi.reducerPath]: subscriptionApi.reducer,
//   [electionApiRTK.reducerPath]: electionApiRTK.reducer,
//   [votingApi.reducerPath]: votingApi.reducer,
//   [roleApi.reducerPath]: roleApi.reducer,
//   [permissionApi.reducerPath]: permissionApi.reducer,
//   [assignmentApi.reducerPath]: assignmentApi.reducer,
  
//   // ========================================
//   //  NEW VOTING API REDUCERS (ADDED)
//   // ========================================
//   [ballotApi.reducerPath]: ballotApi.reducer,
//   [videoWatchApi.reducerPath]: videoWatchApi.reducer,
  
//   // ========================================
//   //  NEW LOTTERY API REDUCERS (ADDED)
//   // ========================================
//   [lotteryyApi.reducerPath]: lotteryyApi.reducer,
//   [lotteryDrawApi.reducerPath]: lotteryDrawApi.reducer,
//   [lotteryTicketApi.reducerPath]: lotteryTicketApi.reducer,
  
//   // ========================================
//   //  NEW WALLET API REDUCERS (ADDED)
//   // ========================================
//   [wallletApi.reducerPath]: wallletApi.reducer,
//   [depositApi.reducerPath]: depositApi.reducer,
//   [withdrawalApi.reducerPath]: withdrawalApi.reducer,
//   [electionPaymentApi.reducerPath]: electionPaymentApi.reducer,
  
//   // ========================================
//   //  NEW VERIFICATION API REDUCERS (ADDED)
//   // ========================================
//   [verificationApi.reducerPath]: verificationApi.reducer,
//   [encryptionApi.reducerPath]: encryptionApi.reducer,
//   [auditTrailApi.reducerPath]: auditTrailApi.reducer,
  
//   // ========================================
//   //  NEW ANALYTICS API REDUCER (ADDED)
//   // ========================================
//   [analyticsApi.reducerPath]: analyticsApi.reducer,
// });

// // ========================================
// // CREATE PERSISTED REDUCER
// // ========================================
// const persistedReducer = persistReducer(persistConfig, rootReducer);

// // ========================================
// // CREATE STORE
// // ========================================
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
//           // ========================================
//           // EXISTING ACTIONS (UNCHANGED)
//           // ========================================
//           'auth/setAuthenticationComplete',
//           'auth/restoreAuthFromStorage',
//           'election/updateDraftElection',
//           'election/updateDraftField',
//           'voting/setCurrentVote',
//           'voting/updateVoteAnswer',
//           'voting/clearVote',
//           'wallet/updateBalance',
//           'lottery/setTickets',
//           'role/setUserRoles',
//           'role/setUserPermissions',
//           'role/addUserRole',
//           'role/removeUserRole',
//           'role/cacheRole',
//           'role/cachePermission',
//           // ========================================
//           // NEW ACTIONS (ADDED)
//           // ========================================
//           'votingNew/setBallot',
//           'votingNew/setAnswer',
//           'votingNew/setVoteSubmitted',
//           'votingNew/setVideoProgress',
//           'lotteryyy/setLotteryInfo',
//           'lotteryyy/setMyTicket',
//           'lotteryyy/setWinners',
//           'lotteryyy/setAnimationState',
//           'walllet/setWallet',
//           'walllet/setTransactions',
//           'walllet/updateBalance',
//           'walllet/startDeposit',
//           'walllet/startWithdrawal',
//           'verification/setReceiptVerification',
//           'verification/setHashVerification',
//           'verification/setEncryptionVerification',
//           'verification/setAuditTrail',
//         ],
//         ignoredPaths: [
//           // ========================================
//           // EXISTING PATHS (UNCHANGED)
//           // ========================================
//           'auth.tokenExpiresAt',
//           'election.draftElection.topic_image',
//           'election.draftElection.topic_video',
//           'election.draftElection.logo',
//           'election.draftElection.questions',
//           'voting.currentVote.timestamp',
//           'voting.videoProgress.lastUpdated',
//           'wallet.lastTransaction.timestamp',
//           'lottery.tickets',
//           'role.rolesCache',
//           'role.permissionsCache',
//           'role.selectedRole',
//           // ========================================
//           // ✨ NEW PATHS (ADDED)
//           // ========================================
//           'votingNew.currentBallot',
//           'votingNew.videoProgress.lastPosition',
//           'lotteryyy.currentLottery',
//           'lotteryyy.participants',
//           'lotteryyy.winners',
//           'lotteryyy.lastUpdate',
//           'walllet.transactions',
//           'walllet.blockedAccounts',
//           'walllet.lastUpdate',
//           'verification.bulletinBoard',
//           'verification.auditTrail',
//           'verification.encryptionDetails',
//         ],
//       },
//     })
//       // ========================================
//       // EXISTING API MIDDLEWARE (UNCHANGED)
//       // ========================================
//       .concat(authApi.middleware)
//       .concat(userApi.middleware)
//       .concat(subscriptionApi.middleware)
//       .concat(electionApiRTK.middleware)
//       .concat(votingApi.middleware)
//       .concat(roleApi.middleware)
//       .concat(permissionApi.middleware)
//       .concat(assignmentApi.middleware)
//       // ========================================
//       // ✨ NEW VOTING API MIDDLEWARE (ADDED)
//       // ========================================
//       .concat(ballotApi.middleware)
//       .concat(videoWatchApi.middleware)
//       // ========================================
//       //  NEW LOTTERY API MIDDLEWARE (ADDED)
//       // ========================================
//       .concat(lotteryyApi.middleware)
//       .concat(lotteryDrawApi.middleware)
//       .concat(lotteryTicketApi.middleware)
//       // ========================================
//       //  NEW WALLET API MIDDLEWARE (ADDED)
//       // ========================================
//       .concat(wallletApi.middleware)
//       .concat(depositApi.middleware)
//       .concat(withdrawalApi.middleware)
//       .concat(electionPaymentApi.middleware)
//       // ========================================
//       //  NEW VERIFICATION API MIDDLEWARE (ADDED)
//       // ========================================
//       .concat(verificationApi.middleware)
//       .concat(encryptionApi.middleware)
//       .concat(auditTrailApi.middleware)
//       // ========================================
//       //  NEW ANALYTICS API MIDDLEWARE (ADDED)
//       // ========================================
//       .concat(analyticsApi.middleware),
// });

// // ========================================
// // SETUP LISTENERS FOR RTK QUERY
// // ========================================
// setupListeners(store.dispatch);

// // ========================================
// // CREATE PERSISTOR
// // ========================================
// export const persistor = persistStore(store);

// export default store;
//last working code
// // src/redux/store.js
// import { configureStore } from '@reduxjs/toolkit';
// import { setupListeners } from '@reduxjs/toolkit/query';
// import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
// import storage from 'redux-persist/lib/storage'; // uses localStorage
// import { combineReducers } from 'redux';

// // ========================================
// // EXISTING SLICE REDUCERS (UNCHANGED)
// // ========================================
// import authReducer from './slices/authSlice.js';
// import userReducer from './slices/userSlice.js';
// import subscriptionReducer from './slices/subscriptionSlice.js';
// import electionReducer from './slices/electionSlice.js';
// import votingReducer from './slices/votingSlice.js';
// import walletReducer from './slices/walletSlice.js';
// import lotteryReducer from './slices/lotterySlice.js';
// import roleReducer from './slices/roleSlice.js';

// // ========================================
// // ✨ NEW ENHANCED SLICES (ADDED)
// // ========================================
// import votingNewReducer from './slices/votingNewSlice.js';
// import lotteryyReducer from './slices/lotteryySlice.js';
// import wallletReducer from './slices/wallletSlice.js';
// import verificationReducer from './slices/verificationSlice.js';

// // ========================================
// // EXISTING API IMPORTS (UNCHANGED)
// // ========================================
// import { authApi } from './api/auth/authApi.js';
// import { userApi } from './api/user/userApi.js';
// import { subscriptionApi } from './api/subscription/subscriptionApi.js';
// import { electionApiRTK } from './api/election/electionApi.js';
// import { votingApi } from './api/voting/votingApi.js';
// import { roleApi } from './api/role/roleApi.js';
// import { permissionApi } from './api/role/permissionApi.js';
// import { assignmentApi } from './api/role/assignmentApi.js';

// // ========================================
// //  NEW VOTING APIs (ADDED)
// // ========================================
// import { ballotApi } from './api/voting/ballotApi.js';
// import { videoWatchApi } from './api/voting/videoWatchApi.js';

// // ========================================
// //  NEW LOTTERY APIs (ADDED)
// // ========================================
// import { lotteryyApi } from './api/lotteryyy/lotteryApi.js';
// import { lotteryDrawApi } from './api/lotteryyy/lotteryDrawApi.js';
// import { lotteryTicketApi } from './api/lotteryyy/lotteryTicketApi.js';

// // ========================================
// // NEW WALLET APIs (ADDED)
// // ========================================
// import { wallletApi } from './api/walllet/walletApi.js';
// import { depositApi } from './api/walllet/depositApi.js';
// import { withdrawalApi } from './api/walllet/withdrawalApi.js';
// import { electionPaymentApi } from './api/walllet/electionPaymentApi.js';

// // ========================================
// //  NEW VERIFICATION APIs (ADDED)
// // ========================================
// import { verificationApi } from './api/verification/verificationApi.js';
// import { encryptionApi } from './api/verification/encryptionApi.js';
// import { auditTrailApi } from './api/verification/auditTrailApi.js';

// // ========================================
// //  NEW ANALYTICS API (ADDED)
// // ========================================
// import { analyticsApi } from './api/analytics/analyticsApi.js';

// // ========================================
// // PERSIST CONFIGURATION
// // ========================================
// const persistConfig = {
//   key: 'vottery-root',
//   version: 1,
//   storage,
//   whitelist: [
//     'auth', 
//     'subscription', 
//     'election', 
//     'voting', 
//     'lottery', 
//     'role',
//     //  NEW: Add new slices to persist (optional)
//     // 'votingNew',
//     // 'lotteryyy',
//     // 'walllet',
//     // 'verification',
//   ],
// };

// // ========================================
// // COMBINE ALL REDUCERS
// // ========================================
// const rootReducer = combineReducers({
//   // ========================================
//   // EXISTING SLICE REDUCERS (UNCHANGED)
//   // ========================================
//   auth: authReducer,
//   user: userReducer,
//   subscription: subscriptionReducer,
//   election: electionReducer,
//   voting: votingReducer,
//   wallet: walletReducer,
//   lottery: lotteryReducer,
//   role: roleReducer,
  
//   // ========================================
//   //  NEW ENHANCED SLICES (ADDED)
//   // ========================================
//   votingNew: votingNewReducer,
//   lotteryyy: lotteryyReducer,
//   walllet: wallletReducer,
//   verification: verificationReducer,
  
//   // ========================================
//   // EXISTING API REDUCERS (UNCHANGED)
//   // ========================================
//   [authApi.reducerPath]: authApi.reducer,
//   [userApi.reducerPath]: userApi.reducer,
//   [subscriptionApi.reducerPath]: subscriptionApi.reducer,
//   [electionApiRTK.reducerPath]: electionApiRTK.reducer,
//   [votingApi.reducerPath]: votingApi.reducer,
//   [roleApi.reducerPath]: roleApi.reducer,
//   [permissionApi.reducerPath]: permissionApi.reducer,
//   [assignmentApi.reducerPath]: assignmentApi.reducer,
  
//   // ========================================
//   //  NEW VOTING API REDUCERS (ADDED)
//   // ========================================
//   [ballotApi.reducerPath]: ballotApi.reducer,
//   [videoWatchApi.reducerPath]: videoWatchApi.reducer,
  
//   // ========================================
//   //  NEW LOTTERY API REDUCERS (ADDED)
//   // ========================================
//   [lotteryyApi.reducerPath]: lotteryyApi.reducer,
//   [lotteryDrawApi.reducerPath]: lotteryDrawApi.reducer,
//   [lotteryTicketApi.reducerPath]: lotteryTicketApi.reducer,
  
//   // ========================================
//   //  NEW WALLET API REDUCERS (ADDED)
//   // ========================================
//   [wallletApi.reducerPath]: wallletApi.reducer,
//   [depositApi.reducerPath]: depositApi.reducer,
//   [withdrawalApi.reducerPath]: withdrawalApi.reducer,
//   [electionPaymentApi.reducerPath]: electionPaymentApi.reducer,
  
//   // ========================================
//   //  NEW VERIFICATION API REDUCERS (ADDED)
//   // ========================================
//   [verificationApi.reducerPath]: verificationApi.reducer,
//   [encryptionApi.reducerPath]: encryptionApi.reducer,
//   [auditTrailApi.reducerPath]: auditTrailApi.reducer,
  
//   // ========================================
//   //  NEW ANALYTICS API REDUCER (ADDED)
//   // ========================================
//   [analyticsApi.reducerPath]: analyticsApi.reducer,
// });

// // ========================================
// // CREATE PERSISTED REDUCER
// // ========================================
// const persistedReducer = persistReducer(persistConfig, rootReducer);

// // ========================================
// // CREATE STORE
// // ========================================
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
//           // ========================================
//           // EXISTING ACTIONS (UNCHANGED)
//           // ========================================
//           'auth/setAuthenticationComplete',
//           'auth/restoreAuthFromStorage',
//           'election/updateDraftElection',
//           'election/updateDraftField',
//           'voting/setCurrentVote',
//           'voting/updateVoteAnswer',
//           'voting/clearVote',
//           'wallet/updateBalance',
//           'lottery/setTickets',
//           'role/setUserRoles',
//           'role/setUserPermissions',
//           'role/addUserRole',
//           'role/removeUserRole',
//           'role/cacheRole',
//           'role/cachePermission',
//           // ========================================
//           // NEW ACTIONS (ADDED)
//           // ========================================
//           'votingNew/setBallot',
//           'votingNew/setAnswer',
//           'votingNew/setVoteSubmitted',
//           'votingNew/setVideoProgress',
//           'lotteryyy/setLotteryInfo',
//           'lotteryyy/setMyTicket',
//           'lotteryyy/setWinners',
//           'lotteryyy/setAnimationState',
//           'walllet/setWallet',
//           'walllet/setTransactions',
//           'walllet/updateBalance',
//           'walllet/startDeposit',
//           'walllet/startWithdrawal',
//           'verification/setReceiptVerification',
//           'verification/setHashVerification',
//           'verification/setEncryptionVerification',
//           'verification/setAuditTrail',
//         ],
//         ignoredPaths: [
//           // ========================================
//           // EXISTING PATHS (UNCHANGED)
//           // ========================================
//           'auth.tokenExpiresAt',
//           'election.draftElection.topic_image',
//           'election.draftElection.topic_video',
//           'election.draftElection.logo',
//           'election.draftElection.questions',
//           'voting.currentVote.timestamp',
//           'voting.videoProgress.lastUpdated',
//           'wallet.lastTransaction.timestamp',
//           'lottery.tickets',
//           'role.rolesCache',
//           'role.permissionsCache',
//           'role.selectedRole',
//           // ========================================
//           // ✨ NEW PATHS (ADDED)
//           // ========================================
//           'votingNew.currentBallot',
//           'votingNew.videoProgress.lastPosition',
//           'lotteryyy.currentLottery',
//           'lotteryyy.participants',
//           'lotteryyy.winners',
//           'lotteryyy.lastUpdate',
//           'walllet.transactions',
//           'walllet.blockedAccounts',
//           'walllet.lastUpdate',
//           'verification.bulletinBoard',
//           'verification.auditTrail',
//           'verification.encryptionDetails',
//         ],
//       },
//     })
//       // ========================================
//       // EXISTING API MIDDLEWARE (UNCHANGED)
//       // ========================================
//       .concat(authApi.middleware)
//       .concat(userApi.middleware)
//       .concat(subscriptionApi.middleware)
//       .concat(electionApiRTK.middleware)
//       .concat(votingApi.middleware)
//       .concat(roleApi.middleware)
//       .concat(permissionApi.middleware)
//       .concat(assignmentApi.middleware)
//       // ========================================
//       // ✨ NEW VOTING API MIDDLEWARE (ADDED)
//       // ========================================
//       .concat(ballotApi.middleware)
//       .concat(videoWatchApi.middleware)
//       // ========================================
//       //  NEW LOTTERY API MIDDLEWARE (ADDED)
//       // ========================================
//       .concat(lotteryyApi.middleware)
//       .concat(lotteryDrawApi.middleware)
//       .concat(lotteryTicketApi.middleware)
//       // ========================================
//       //  NEW WALLET API MIDDLEWARE (ADDED)
//       // ========================================
//       .concat(wallletApi.middleware)
//       .concat(depositApi.middleware)
//       .concat(withdrawalApi.middleware)
//       .concat(electionPaymentApi.middleware)
//       // ========================================
//       //  NEW VERIFICATION API MIDDLEWARE (ADDED)
//       // ========================================
//       .concat(verificationApi.middleware)
//       .concat(encryptionApi.middleware)
//       .concat(auditTrailApi.middleware)
//       // ========================================
//       //  NEW ANALYTICS API MIDDLEWARE (ADDED)
//       // ========================================
//       .concat(analyticsApi.middleware),
// });

// // ========================================
// // SETUP LISTENERS FOR RTK QUERY
// // ========================================
// setupListeners(store.dispatch);

// // ========================================
// // CREATE PERSISTOR
// // ========================================
// export const persistor = persistStore(store);

// export default store;






//last workable codes
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
// import roleReducer from './slices/roleSlice.js'; // ✅ NEW: Role management slice

// // API Imports
// import { authApi } from './api/auth/authApi.js';
// import { userApi } from './api/user/userApi.js';
// import { subscriptionApi } from './api/subscription/subscriptionApi.js';
// import { electionApiRTK } from './api/election/electionApi.js';
// import { votingApi } from './api/voting/votingApi.js';
// // ✅ NEW: Role management APIs
// import { roleApi } from './api/role/roleApi.js';
// import { permissionApi } from './api/role/permissionApi.js';
// import { assignmentApi } from './api/role/assignmentApi.js';

// // Persist configuration
// const persistConfig = {
//   key: 'vottery-root',
//   version: 1,
//   storage,
//   whitelist: ['auth', 'subscription', 'election', 'voting', 'lottery', 'role'], // ✅ NEW: Added 'role' to persist
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
//   role: roleReducer, // ✅ NEW: Role management slice
  
//   // API Reducers (these should NOT be persisted)
//   [authApi.reducerPath]: authApi.reducer,
//   [userApi.reducerPath]: userApi.reducer,
//   [subscriptionApi.reducerPath]: subscriptionApi.reducer,
//   [electionApiRTK.reducerPath]: electionApiRTK.reducer,
//   [votingApi.reducerPath]: votingApi.reducer,
//   // ✅ NEW: Role management API reducers
//   [roleApi.reducerPath]: roleApi.reducer,
//   [permissionApi.reducerPath]: permissionApi.reducer,
//   [assignmentApi.reducerPath]: assignmentApi.reducer,
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
//           // ✅ NEW: Role management actions
//           'role/setUserRoles',
//           'role/setUserPermissions',
//           'role/addUserRole',
//           'role/removeUserRole',
//           'role/cacheRole',
//           'role/cachePermission',
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
//           // ✅ NEW: Role management paths
//           'role.rolesCache',
//           'role.permissionsCache',
//           'role.selectedRole',
//         ],
//       },
//     })
//       .concat(authApi.middleware)
//       .concat(userApi.middleware)
//       .concat(subscriptionApi.middleware)
//       .concat(electionApiRTK.middleware)
//       .concat(votingApi.middleware)
//       // ✅ NEW: Role management API middleware
//       .concat(roleApi.middleware)
//       .concat(permissionApi.middleware)
//       .concat(assignmentApi.middleware),
// });

// // Setup listeners for RTK Query
// setupListeners(store.dispatch);

// // Create persistor
// export const persistor = persistStore(store);

// export default store;
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
