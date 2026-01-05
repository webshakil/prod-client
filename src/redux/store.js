// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// Base API
import indexApi from './api/indexApi';

// All other APIs (add all that exist)
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

// Slices
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import electionReducer from './slices/electionSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import notificationReducer from './slices/notificationSlice';
import walletReducer from './slices/wallletSlice';
import votingNewReducer from './slices/votingNewSlice'; // ⭐ ADD THIS IMPORT
import lotteryyReducer from './slices/lotteryySlice'; 

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'user'],
};

// Collect all APIs
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
];

// Build reducers object dynamically
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
  votingNew: votingNewReducer, // ⭐ ADD THIS LINE
  lotteryyy: lotteryyReducer,  // ⭐ ADD THIS LINE (if not already)
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => {
    let middleware = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'auth/setCredentials'],
      },
    });
    
    // Add all API middlewares
    allApis.forEach(api => {
      middleware = middleware.concat(api.middleware);
    });
    
    return middleware;
  },
});

export const persistor = persistStore(store);
export default store;