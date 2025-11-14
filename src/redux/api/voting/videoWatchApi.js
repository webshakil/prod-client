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
        // ✅ FIXED: Set x-user-data with full user object (same as electionApi)
        headers.set('x-user-data', JSON.stringify({
          userId: userData.userId,
          email: userData.email,
          phone: userData.phone || null,
          username: userData.username || null,
          roles: (userData.roles || ['Voter']).map(role => 
            role === 'ContentCreator' ? 'Content_Creator' : role
          ),
          subscriptionType: userData.subscriptionType || 'Free',
          isSubscribed: userData.isSubscribed || false
        }));
        
        // Also set x-user-id for backward compatibility
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