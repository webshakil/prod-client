import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// ✅ BASE QUERY WITH CREDENTIALS FOR HTTP-ONLY COOKIES
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include', // ✅ CRITICAL: Include cookies in requests
  /*eslint-disable*/
  prepareHeaders: (headers, { getState }) => {
    // ✅ NO NEED TO ADD accessToken TO HEADER
    // It's already in HTTP-only cookie and sent automatically
    // But we CAN still add it if it's in localStorage for non-cookie scenarios

    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    headers.set('Content-Type', 'application/json');
    headers.set('X-Requested-With', 'XMLHttpRequest');
    headers.set('Accept', 'application/json');

    return headers;
  },
});

// ✅ BASE QUERY WITH TOKEN REFRESH LOGIC
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // ✅ IF 401, REFRESH TOKEN
  if (result.error?.status === 401) {
    console.warn('⚠️ 401 Unauthorized - Attempting token refresh');

    const refreshToken = localStorage.getItem('refreshToken');

    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/token/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data?.data?.accessToken) {
        const newAccessToken = refreshResult.data.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);
        console.log('✅ Token refreshed successfully');

        // ✅ RETRY ORIGINAL REQUEST WITH NEW TOKEN
        result = await baseQuery(args, api, extraOptions);
      } else {
        console.error('❌ Token refresh failed');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth';
      }
    } else {
      console.error('❌ No refresh token available');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/auth';
    }
  }

  return result;
};

// Create API instance
export const indexApi = createApi({
  reducerPath: 'indexApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'User', 'Verification', 'Biometric', 'SecurityQuestions', 'Session'],
  endpoints: () => ({}),
});

export default indexApi;
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// // Base query with headers and token management
// const baseQuery = fetchBaseQuery({
//   baseUrl: API_BASE_URL,
//   credentials: 'include', // Include cookies for refresh token
//   /*eslint-disable*/
//   prepareHeaders: (headers, { getState }) => {
//     const accessToken = localStorage.getItem('accessToken');
    
//     if (accessToken) {
//       headers.set('Authorization', `Bearer ${accessToken}`);
//     }

//     headers.set('Content-Type', 'application/json');
//     headers.set('X-Requested-With', 'XMLHttpRequest');
//     headers.set('Accept', 'application/json');

//     return headers;
//   },
// });

// // Base query with token refresh logic
// const baseQueryWithReauth = async (args, api, extraOptions) => {
//   let result = await baseQuery(args, api, extraOptions);

//   if (result.error?.status === 401) {
//     const refreshToken = localStorage.getItem('refreshToken');
    
//     if (refreshToken) {
//       const refreshResult = await baseQuery(
//         {
//           url: '/token/refresh',
//           method: 'POST',
//           body: { refreshToken },
//         },
//         api,
//         extraOptions
//       );

//       if (refreshResult.data?.data?.accessToken) {
//         localStorage.setItem('accessToken', refreshResult.data.data.accessToken);
        
//         // Retry original request with new token
//         result = await baseQuery(args, api, extraOptions);
//       } else {
//         localStorage.removeItem('accessToken');
//         localStorage.removeItem('refreshToken');
//         window.location.href = '/auth';
//       }
//     } else {
//       localStorage.removeItem('accessToken');
//       localStorage.removeItem('refreshToken');
//       window.location.href = '/auth';
//     }
//   }

//   return result;
// };

// // Create API instance
// export const indexApi = createApi({
//   reducerPath: 'indexApi',
//   baseQuery: baseQueryWithReauth,
//   tagTypes: ['Auth', 'User', 'Verification', 'Biometric', 'SecurityQuestions', 'Session'],
//   endpoints: () => ({}),
// });

// export default indexApi;