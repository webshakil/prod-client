// src/redux/api/recommendations/recommendationApi.js
// ✅ Shaped AI Recommendation API Integration - FIXED with proper user data
// ✅ UPDATED: Added Popular Elections endpoint

import axios from 'axios';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const RECOMMENDATION_SERVICE_URL = import.meta.env.VITE_REACT_APP_RECOMMENDATION_API_URL || 'http://localhost:3008';

// ✅ Create axios instance for direct API calls
export const recommendationAxios = axios.create({
  baseURL: RECOMMENDATION_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ Request interceptor to add user data
recommendationAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    const userDataStr = localStorage.getItem('userData');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (userId) {
      config.headers['x-user-id'] = userId;
    }
    
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        config.headers['x-user-data'] = JSON.stringify({
          userId: userData.userId || userId,
          email: userData.email,
          roles: userData.roles || ['Voter'],
        });
      } catch (error) {
        console.error('Error parsing userData:', error);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ RTK Query API (for components that use hooks)
export const recommendationApi = createApi({
  reducerPath: 'recommendationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: RECOMMENDATION_SERVICE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('userId');
      const userDataStr = localStorage.getItem('userData');
      
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      if (userId) {
        headers.set('x-user-id', userId);
      }
      
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          headers.set('x-user-data', JSON.stringify({
            userId: userData.userId || userId,
            email: userData.email,
            roles: userData.roles || ['Voter'],
          }));
        } catch (error) {
          console.error('Error parsing userData:', error);
        }
      }
      
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Recommendations', 'Trending', 'Popular', 'Similar', 'Lottery'],
  endpoints: (builder) => ({
    
    // 🤖 SHAPED AI: Personalized recommendations for user
    getPersonalizedRecommendations: builder.query({
      query: ({ userId, limit = 10 }) => ({
        url: `/api/recommendations/elections`,
        params: { userId, limit },
      }),
      transformResponse: (response) => ({
        ...response,
        source: 'shaped_ai',
        isAIPowered: true,
      }),
      providesTags: ['Recommendations'],
    }),

    // 🤖 SHAPED AI: Similar elections based on current election
    getSimilarElections: builder.query({
      query: ({ electionId, limit = 5 }) => ({
        url: `/api/recommendations/similar/${electionId}`,
        params: { limit },
      }),
      transformResponse: (response) => ({
        ...response,
        source: 'shaped_ai',
        isAIPowered: true,
      }),
      providesTags: (result, error, { electionId }) => [
        { type: 'Similar', id: electionId },
      ],
    }),

    // 🤖 SHAPED AI: Trending elections
    getTrendingElections: builder.query({
      query: ({ limit = 10 }) => ({
        url: `/api/recommendations/trending`,
        params: { limit },
      }),
      transformResponse: (response) => ({
        ...response,
        source: 'shaped_ai',
        isAIPowered: true,
      }),
      providesTags: ['Trending'],
    }),

    // 🤖 SHAPED AI: Popular elections (most votes/views)
    getPopularElections: builder.query({
      query: ({ limit = 10 }) => ({
        url: `/api/recommendations/popular`,
        params: { limit },
      }),
      transformResponse: (response) => ({
        ...response,
        source: 'shaped_ai',
        isAIPowered: true,
      }),
      providesTags: ['Popular'],
    }),

    // 🤖 SHAPED AI: Top lottery elections
    getLotteryElections: builder.query({
      query: ({ limit = 10 }) => ({
        url: `/api/recommendations/lotterized`,
        params: { limit },
      }),
      transformResponse: (response) => ({
        ...response,
        source: 'shaped_ai',
        isAIPowered: true,
      }),
      providesTags: ['Lottery'],
    }),

    // 🤖 SHAPED AI: Elections by category
    getElectionsByCategory: builder.query({
      query: ({ categoryId, limit = 10 }) => ({
        url: `/api/recommendations/by-category`,
        params: { categoryId, limit },
      }),
      transformResponse: (response) => ({
        ...response,
        source: 'shaped_ai',
        isAIPowered: true,
      }),
      providesTags: (result, error, { categoryId }) => [
        { type: 'Recommendations', id: `category-${categoryId}` },
      ],
    }),

    // 🤖 SHAPED AI: Audience insights for election creators
    getAudienceForElection: builder.query({
      query: ({ electionId, limit = 10 }) => ({
        url: `/api/recommendations/audience/${electionId}`,
        params: { limit },
      }),
      transformResponse: (response) => ({
        ...response,
        source: 'shaped_ai',
        isAIPowered: true,
      }),
      providesTags: (result, error, { electionId }) => [
        { type: 'Recommendations', id: `audience-${electionId}` },
      ],
    }),

    // 🔧 Health check for recommendation service
    checkRecommendationHealth: builder.query({
      query: () => '/api/recommendations/health',
    }),

  }),
});

// ✅ Direct API functions using axios (with user data headers)

export const getPersonalizedElections = async (userId, limit = 10) => {
  const response = await recommendationAxios.get('/api/recommendations/elections', {
    params: { userId, limit }
  });
  return response.data;
};

export const getSimilarElectionsApi = async (electionId, limit = 5) => {
  const response = await recommendationAxios.get(`/api/recommendations/similar/${electionId}`, {
    params: { limit }
  });
  return response.data;
};

export const getTrendingElectionsApi = async (limit = 10) => {
  const response = await recommendationAxios.get('/api/recommendations/trending', {
    params: { limit }
  });
  return response.data;
};

// ✅ NEW: Popular elections API function
export const getPopularElectionsApi = async (limit = 10) => {
  const response = await recommendationAxios.get('/api/recommendations/popular', {
    params: { limit }
  });
  return response.data;
};

export const getLotteryElectionsApi = async (limit = 10) => {
  const response = await recommendationAxios.get('/api/recommendations/lotterized', {
    params: { limit }
  });
  return response.data;
};

// ✅ NEW: Elections by category API function
export const getElectionsByCategoryApi = async (categoryId, limit = 10) => {
  const response = await recommendationAxios.get('/api/recommendations/by-category', {
    params: { categoryId, limit }
  });
  return response.data;
};

// ✅ NEW: Audience insights API function
export const getAudienceForElectionApi = async (electionId, limit = 10) => {
  const response = await recommendationAxios.get(`/api/recommendations/audience/${electionId}`, {
    params: { limit }
  });
  return response.data;
};

export const checkHealthApi = async () => {
  const response = await recommendationAxios.get('/api/recommendations/health');
  return response.data;
};

// Export hooks for usage in components
export const {
  useGetPersonalizedRecommendationsQuery,
  useGetSimilarElectionsQuery,
  useGetTrendingElectionsQuery,
  useGetPopularElectionsQuery,
  useGetLotteryElectionsQuery,
  useGetElectionsByCategoryQuery,
  useGetAudienceForElectionQuery,
  useCheckRecommendationHealthQuery,
} = recommendationApi;

export default recommendationApi;
// // src/redux/api/recommendations/recommendationApi.js
// // ✅ Shaped AI Recommendation API Integration - FIXED with proper user data

// import axios from 'axios';
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const RECOMMENDATION_SERVICE_URL = import.meta.env.VITE_REACT_APP_RECOMMENDATION_API_URL || 'http://localhost:3008';

// // ✅ Create axios instance for direct API calls
// export const recommendationAxios = axios.create({
//   baseURL: RECOMMENDATION_SERVICE_URL,
//   headers: {
//     'Content-Type': 'application/json'
//   }
// });

// // ✅ Request interceptor to add user data
// recommendationAxios.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('accessToken');
//     const userId = localStorage.getItem('userId');
//     const userDataStr = localStorage.getItem('userData');
    
//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }
    
//     if (userId) {
//       config.headers['x-user-id'] = userId;
//     }
    
//     if (userDataStr) {
//       try {
//         const userData = JSON.parse(userDataStr);
//         config.headers['x-user-data'] = JSON.stringify({
//           userId: userData.userId || userId,
//           email: userData.email,
//           roles: userData.roles || ['Voter'],
//         });
//       } catch (error) {
//         console.error('Error parsing userData:', error);
//       }
//     }
    
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // ✅ RTK Query API (for components that use hooks)
// export const recommendationApi = createApi({
//   reducerPath: 'recommendationApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: RECOMMENDATION_SERVICE_URL,
//     prepareHeaders: (headers) => {
//       const token = localStorage.getItem('accessToken');
//       const userId = localStorage.getItem('userId');
//       const userDataStr = localStorage.getItem('userData');
      
//       if (token) {
//         headers.set('Authorization', `Bearer ${token}`);
//       }
      
//       if (userId) {
//         headers.set('x-user-id', userId);
//       }
      
//       if (userDataStr) {
//         try {
//           const userData = JSON.parse(userDataStr);
//           headers.set('x-user-data', JSON.stringify({
//             userId: userData.userId || userId,
//             email: userData.email,
//             roles: userData.roles || ['Voter'],
//           }));
//         } catch (error) {
//           console.error('Error parsing userData:', error);
//         }
//       }
      
//       headers.set('Content-Type', 'application/json');
//       return headers;
//     },
//   }),
//   tagTypes: ['Recommendations', 'Trending', 'Similar', 'Lottery'],
//   endpoints: (builder) => ({
    
//     // 🤖 SHAPED AI: Personalized recommendations for user
//     getPersonalizedRecommendations: builder.query({
//       query: ({ userId, limit = 10 }) => ({
//         url: `/api/recommendations/elections`,
//         params: { userId, limit },
//       }),
//       transformResponse: (response) => ({
//         ...response,
//         source: 'shaped_ai',
//         isAIPowered: true,
//       }),
//       providesTags: ['Recommendations'],
//     }),

//     // 🤖 SHAPED AI: Similar elections based on current election
//     getSimilarElections: builder.query({
//       query: ({ electionId, limit = 5 }) => ({
//         url: `/api/recommendations/similar/${electionId}`,
//         params: { limit },
//       }),
//       transformResponse: (response) => ({
//         ...response,
//         source: 'shaped_ai',
//         isAIPowered: true,
//       }),
//       providesTags: (result, error, { electionId }) => [
//         { type: 'Similar', id: electionId },
//       ],
//     }),

//     // 🤖 SHAPED AI: Trending elections
//     getTrendingElections: builder.query({
//       query: ({ limit = 10 }) => ({
//         url: `/api/recommendations/trending`,
//         params: { limit },
//       }),
//       transformResponse: (response) => ({
//         ...response,
//         source: 'shaped_ai',
//         isAIPowered: true,
//       }),
//       providesTags: ['Trending'],
//     }),

//     // 🤖 SHAPED AI: Top lottery elections
//     getLotteryElections: builder.query({
//       query: ({ limit = 10 }) => ({
//         url: `/api/recommendations/lotterized`,
//         params: { limit },
//       }),
//       transformResponse: (response) => ({
//         ...response,
//         source: 'shaped_ai',
//         isAIPowered: true,
//       }),
//       providesTags: ['Lottery'],
//     }),

//     // 🔧 Health check for recommendation service
//     checkRecommendationHealth: builder.query({
//       query: () => '/api/recommendations/health',
//     }),

//   }),
// });

// // ✅ Direct API functions using axios (with user data headers)
// export const getPersonalizedElections = async (userId, limit = 10) => {
//   const response = await recommendationAxios.get('/api/recommendations/elections', {
//     params: { userId, limit }
//   });
//   return response.data;
// };

// export const getSimilarElectionsApi = async (electionId, limit = 5) => {
//   const response = await recommendationAxios.get(`/api/recommendations/similar/${electionId}`, {
//     params: { limit }
//   });
//   return response.data;
// };

// export const getTrendingElectionsApi = async (limit = 10) => {
//   const response = await recommendationAxios.get('/api/recommendations/trending', {
//     params: { limit }
//   });
//   return response.data;
// };

// export const getLotteryElectionsApi = async (limit = 10) => {
//   const response = await recommendationAxios.get('/api/recommendations/lotterized', {
//     params: { limit }
//   });
//   return response.data;
// };

// export const checkHealthApi = async () => {
//   const response = await recommendationAxios.get('/api/recommendations/health');
//   return response.data;
// };

// // Export hooks for usage in components
// export const {
//   useGetPersonalizedRecommendationsQuery,
//   useGetSimilarElectionsQuery,
//   useGetTrendingElectionsQuery,
//   useGetLotteryElectionsQuery,
//   useCheckRecommendationHealthQuery,
// } = recommendationApi;

// export default recommendationApi;
// // src/redux/api/recommendations/recommendationApi.js
// // ✅ Shaped AI Recommendation API Integration
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// // Base URL for your recommendation service
// const RECOMMENDATION_SERVICE_URL = import.meta.env.VITE_REACT_APP_RECOMMENDATION_API_URL || 'http://localhost:3008';

// export const recommendationApi = createApi({
//   reducerPath: 'recommendationApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: RECOMMENDATION_SERVICE_URL,
//     /*eslint-disable*/
//     prepareHeaders: (headers, { getState }) => {
//       // Get token from auth state if needed
//       const token = localStorage.getItem('accessToken');
//       if (token) {
//         headers.set('Authorization', `Bearer ${token}`);
//       }
//       headers.set('Content-Type', 'application/json');
//       return headers;
//     },
//   }),
//   tagTypes: ['Recommendations', 'Trending', 'Similar', 'Lottery'],
//   endpoints: (builder) => ({
    
//     // 🤖 SHAPED AI: Personalized recommendations for user
//     getPersonalizedRecommendations: builder.query({
//       query: ({ userId, limit = 10 }) => ({
//         url: `/api/recommendations/elections`,
//         params: { userId, limit },
//       }),
//       transformResponse: (response) => ({
//         ...response,
//         source: 'shaped_ai',
//         isAIPowered: true,
//       }),
//       providesTags: ['Recommendations'],
//     }),

//     // 🤖 SHAPED AI: Similar elections based on current election
//     getSimilarElections: builder.query({
//       query: ({ electionId, limit = 5 }) => ({
//         url: `/api/recommendations/similar/${electionId}`,
//         params: { limit },
//       }),
//       transformResponse: (response) => ({
//         ...response,
//         source: 'shaped_ai',
//         isAIPowered: true,
//       }),
//       providesTags: (result, error, { electionId }) => [
//         { type: 'Similar', id: electionId },
//       ],
//     }),

//     // 🤖 SHAPED AI: Trending elections
//     getTrendingElections: builder.query({
//       query: ({ limit = 10 }) => ({
//         url: `/api/recommendations/trending`,
//         params: { limit },
//       }),
//       transformResponse: (response) => ({
//         ...response,
//         source: 'shaped_ai',
//         isAIPowered: true,
//       }),
//       providesTags: ['Trending'],
//     }),

//     // 🤖 SHAPED AI: Top lottery elections
//     getLotteryElections: builder.query({
//       query: ({ limit = 10 }) => ({
//         url: `/api/recommendations/lotterized`,
//         params: { limit },
//       }),
//       transformResponse: (response) => ({
//         ...response,
//         source: 'shaped_ai',
//         isAIPowered: true,
//       }),
//       providesTags: ['Lottery'],
//     }),

//     // 🔧 Health check for recommendation service
//     checkRecommendationHealth: builder.query({
//       query: () => '/api/recommendations/health',
//     }),

//   }),
// });

// // Export hooks for usage in components
// export const {
//   useGetPersonalizedRecommendationsQuery,
//   useGetSimilarElectionsQuery,
//   useGetTrendingElectionsQuery,
//   useGetLotteryElectionsQuery,
//   useCheckRecommendationHealthQuery,
// } = recommendationApi;

// export default recommendationApi;