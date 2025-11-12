// src/redux/api/analytics/analyticsApi.js
// ✨ NEW: Analytics API
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

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
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
  tagTypes: ['ElectionAnalytics', 'PlatformAnalytics', 'VotingHistory', 'Demographics'],
  endpoints: (builder) => ({
    
    // Get election analytics
    getElectionAnalytics: builder.query({
      query: (electionId) => `/analytics/elections/${electionId}/analytics`,
      providesTags: ['ElectionAnalytics'],
      // Poll every 30 seconds for real-time updates
      pollingInterval: 30000,
    }),

    // Get election results
    getElectionResults: builder.query({
      query: (electionId) => `/analytics/elections/${electionId}/results`,
      providesTags: ['ElectionAnalytics'],
    }),

    // Get platform analytics (admin only)
    getPlatformAnalytics: builder.query({
      query: ({ dateFrom, dateTo } = {}) => {
        const params = new URLSearchParams();
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);
        return `/analytics/platform/analytics?${params.toString()}`;
      },
      providesTags: ['PlatformAnalytics'],
    }),

    // Get user voting history
    getVotingHistory: builder.query({
      query: ({ page = 1, limit = 20 }) => 
        `/analytics/users/me/voting-history?page=${page}&limit=${limit}`,
      providesTags: ['VotingHistory'],
    }),

    // Get voter demographics (admin/creator)
    getVoterDemographics: builder.query({
      query: (electionId) => `/analytics/elections/${electionId}/demographics`,
      providesTags: ['Demographics'],
    }),

  }),
});

export const {
  useGetElectionAnalyticsQuery,
  useGetElectionResultsQuery,
  useGetPlatformAnalyticsQuery,
  useGetVotingHistoryQuery,
  useGetVoterDemographicsQuery,
} = analyticsApi;