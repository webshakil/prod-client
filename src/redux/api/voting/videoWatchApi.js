// src/redux/api/voting/videoWatchApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const VOTING_SERVICE_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:5003/api';

const getUserData = () => {
  const userDataStr = localStorage.getItem('userData');
  if (userDataStr) {
    try {
      return JSON.parse(userDataStr);
    } catch (error) {
      console.error('Error parsing userData:', error);
    }
  }
  return null;
};

export const videoWatchApi = createApi({
  reducerPath: 'videoWatchApi',
  baseQuery: fetchBaseQuery({
    baseUrl: VOTING_SERVICE_URL,
    prepareHeaders: (headers) => {
      const userData = getUserData();
      if (userData) {
        headers.set('x-user-id', userData.userId);
      }
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['VideoProgress'],
  endpoints: (builder) => ({
    
    // ✅ Get video watch progress
    getVideoProgress: builder.query({
      query: (electionId) => `/voting/elections/${electionId}/video-progress`,
      providesTags: ['VideoProgress'],
    }),

    // Update video watch progress
    updateWatchProgress: builder.mutation({
      query: ({ electionId, watchPercentage, lastPosition, totalDuration, completed }) => ({
        url: `/voting/elections/${electionId}/video-progress`,
        method: 'POST',
        body: {
          watchPercentage,
          lastPosition,
          totalDuration,
          completed,
        },
      }),
      invalidatesTags: ['VideoProgress'],
    }),

  }),
});

export const {
  useGetVideoProgressQuery,
  useUpdateWatchProgressMutation,
} = videoWatchApi;
// // src/redux/api/voting/videoWatchApi.js
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const VOTING_SERVICE_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:5003/api';

// const getUserData = () => {
//   const userDataStr = localStorage.getItem('userData');
//   if (userDataStr) {
//     try {
//       return JSON.parse(userDataStr);
//     } catch (error) {
//       console.error('Error parsing userData:', error);
//     }
//   }
//   return null;
// };

// export const videoWatchApi = createApi({
//   reducerPath: 'videoWatchApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: VOTING_SERVICE_URL,
//     prepareHeaders: (headers) => {
//       const userData = getUserData();
//       if (userData) {
//         headers.set('x-user-id', userData.userId);
//       }
//       const token = localStorage.getItem('accessToken');
//       if (token) {
//         headers.set('Authorization', `Bearer ${token}`);
//       }
//       return headers;
//     },
//   }),
//   tagTypes: ['VideoProgress'],
//   endpoints: (builder) => ({
    
//     // Update video watch progress
//     updateWatchProgress: builder.mutation({
//       query: ({ electionId, watchPercentage, lastPosition, totalDuration }) => ({
//         url: `/voting/elections/${electionId}/video-progress`,
//         method: 'POST',
//         body: {
//           watchPercentage,
//           lastPosition,
//           totalDuration,
//         },
//       }),
//       invalidatesTags: ['VideoProgress'],
//     }),

//     // Get video watch progress
//     getWatchProgress: builder.query({
//       query: (electionId) => `/voting/elections/${electionId}/video-progress`,
//       providesTags: ['VideoProgress'],
//     }),

//   }),
// });

// export const {
//   useUpdateWatchProgressMutation,
//   useGetWatchProgressQuery,
// } = videoWatchApi;