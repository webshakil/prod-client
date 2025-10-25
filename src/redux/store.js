import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import userReducer from './slices/userSlice.js';
import subscriptionReducer from './slices/subscriptionSlice.js';
import { authApi } from './api/auth/authApi.js';
import { userApi } from './api/user/userApi.js';
import { subscriptionApi } from './api/subscription/subscriptionApi.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    subscription: subscriptionReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [subscriptionApi.reducerPath]: subscriptionApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'auth/setAuthenticationComplete',
          'auth/restoreAuthFromStorage',
        ],
        ignoredPaths: ['auth.tokenExpiresAt'],
      },
    })
      .concat(authApi.middleware)
      .concat(userApi.middleware)
      .concat(subscriptionApi.middleware),
});

export default store;
// import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './slices/authSlice.js';
// import userReducer from './slices/userSlice.js';
// import subscriptionReducer from './slices/subscriptionSlice.js'; // ADD THIS
// import { authApi } from './api/auth/authApi.js';
// import { userApi } from './api/user/userApi.js';
// import { subscriptionApi } from './api/subscription/subscriptionApi.js';

// export const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     user: userReducer,
//     subscription: subscriptionReducer, // ADD THIS
//     [authApi.reducerPath]: authApi.reducer,
//     [userApi.reducerPath]: userApi.reducer,
//     [subscriptionApi.reducerPath]: subscriptionApi.reducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         ignoredActions: ['auth/setAuthenticationComplete'],
//         ignoredPaths: ['auth.tokenExpiresAt'],
//       },
//     })
//       .concat(authApi.middleware)
//       .concat(userApi.middleware)
//       .concat(subscriptionApi.middleware),
// });

// export default store;
// // redux/store.js

// import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './slices/authSlice.js';
// import userReducer from './slices/userSlice.js';
// import { authApi } from './api/auth/authApi.js';
// import { userApi } from './api/user/userApi.js';
// import { subscriptionApi } from './api/subscription/subscriptionApi.js';

// export const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     user: userReducer,
//     [authApi.reducerPath]: authApi.reducer,
//     [userApi.reducerPath]: userApi.reducer,
//     [subscriptionApi.reducerPath]: subscriptionApi.reducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         ignoredActions: ['auth/setAuthenticationComplete'],
//         ignoredPaths: ['auth.tokenExpiresAt'],
//       },
//     })
//       .concat(authApi.middleware)
//       .concat(userApi.middleware)
//       .concat(subscriptionApi.middleware),
// });

// export default store;
// // redux/store.js (Update to include subscriptionSlice)

// import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './slices/authSlice.js';
// import userReducer from './slices/userSlice.js';
// import { authApi } from './api/auth/authApi.js';
// import { userApi } from './api/user/userApi.js';

// export const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     user: userReducer,
//     [authApi.reducerPath]: authApi.reducer,
//     [userApi.reducerPath]: userApi.reducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware()
//       .concat(authApi.middleware)
//       .concat(userApi.middleware),
// });

// export default store;

// import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './slices/authSlice';
// import uiReducer from './slices/uiSlice';
// import subscriptionReducer from './slices/subscriptionSlice';
// import { indexApi } from './api/indexApi';

// export const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     ui: uiReducer,
//     subscription: subscriptionReducer,
//     [indexApi.reducerPath]: indexApi.reducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware().concat(indexApi.middleware),
// });

// export default store;
// import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './slices/authSlice';
// import uiReducer from './slices/uiSlice';
// import subscriptionReducer from './slices/subscriptionSlice';
// import { indexApi } from './api/indexApi';

// export const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     ui: uiReducer,
//     subscription: subscriptionReducer,
//     [indexApi.reducerPath]: indexApi.reducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware().concat(indexApi.middleware),
// });

// export default store;