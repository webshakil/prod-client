// src/redux/api/recommendations/recommendationApi.js
// ✅ Shaped AI Recommendation API Integration
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base URL for your recommendation service
const RECOMMENDATION_SERVICE_URL = import.meta.env.REACT_APP_RECOMMENDATION_API_URL || 'http://localhost:3008';

export const recommendationApi = createApi({
  reducerPath: 'recommendationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: RECOMMENDATION_SERVICE_URL,
    /*eslint-disable*/
    prepareHeaders: (headers, { getState }) => {
      // Get token from auth state if needed
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Recommendations', 'Trending', 'Similar', 'Lottery'],
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

    // 🔧 Health check for recommendation service
    checkRecommendationHealth: builder.query({
      query: () => '/api/recommendations/health',
    }),

  }),
});

// Export hooks for usage in components
export const {
  useGetPersonalizedRecommendationsQuery,
  useGetSimilarElectionsQuery,
  useGetTrendingElectionsQuery,
  useGetLotteryElectionsQuery,
  useCheckRecommendationHealthQuery,
} = recommendationApi;

export default recommendationApi;