// src/redux/api/analytics/platformAnalyticsApi.js
// RTK Query API for Platform Analytics Data (voting-service 3007)

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const VOTING_SERVICE_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api';

// Helper to get user data from localStorage
const getUserData = () => {
  const userDataStr = localStorage.getItem('userData');
  if (userDataStr) {
    try {
      const userData = JSON.parse(userDataStr);
      return {
        userId: userData.userId,
        email: userData.email,
        phone: userData.phone || null,
        username: userData.username || null,
        roles: (userData.roles || ['Voter']).map(role => 
          role === 'ContentCreator' ? 'Content_Creator' : role
        ),
        subscriptionType: userData.subscriptionType || 'Free',
        isSubscribed: userData.isSubscribed || false
      };
    } catch (error) {
      console.error('Error parsing userData:', error);
    }
  }
  return null;
};

export const platformAnalyticsApi = createApi({
  reducerPath: 'platformAnalyticsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: VOTING_SERVICE_URL,
    /*eslint-disable*/
    prepareHeaders: (headers, { getState }) => {
      // For analytics endpoints, we need the analytics API key
      const analyticsApiKey = localStorage.getItem('analyticsApiKey');
      if (analyticsApiKey) {
        headers.set('x-api-key', analyticsApiKey);
      }
      
      // Also add user data for role-based access
      const userData = getUserData();
      if (userData) {
        headers.set('x-user-id', userData.userId);
        headers.set('x-user-data', JSON.stringify(userData));
      }
      
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['PlatformReport', 'RevenueReport', 'RealTimeStats', 'ElectionAnalytics', 'VoterDemographics'],
  endpoints: (builder) => ({

    // Get comprehensive platform report
    getPlatformReport: builder.query({
      query: (period = 30) => `/analytics/platform/report?period=${period}`,
      providesTags: ['PlatformReport'],
    }),

    // Get revenue report
    getRevenueReport: builder.query({
      query: ({ dateFrom, dateTo, groupBy = 'day' } = {}) => {
        const params = new URLSearchParams();
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);
        if (groupBy) params.append('groupBy', groupBy);
        return `/analytics/platform/revenue?${params.toString()}`;
      },
      providesTags: ['RevenueReport'],
    }),

    // Get real-time stats
    getRealTimeStats: builder.query({
      query: () => '/analytics/platform/realtime',
      providesTags: ['RealTimeStats'],
    }),

    // Get election-specific analytics
    getElectionAnalytics: builder.query({
      query: (electionId) => `/analytics/elections/${electionId}/analytics`,
      providesTags: (result, error, electionId) => [{ type: 'ElectionAnalytics', id: electionId }],
    }),

    // Get voter demographics for an election
    getVoterDemographics: builder.query({
      query: (electionId) => `/analytics/elections/${electionId}/demographics`,
      providesTags: (result, error, electionId) => [{ type: 'VoterDemographics', id: electionId }],
    }),

    getPlatformRevenueReport: builder.query({
  query: ({ period = 30 } = {}) => `/analytics/revenue/platform?period=${period}`,
  providesTags: ['Revenue'],
}),

  }),
});

export const {
  useGetPlatformReportQuery,
  useGetRevenueReportQuery,
  useGetPlatformRevenueReportQuery,
  useGetRealTimeStatsQuery,
  useGetElectionAnalyticsQuery,
  useGetVoterDemographicsQuery,
} = platformAnalyticsApi;

export default platformAnalyticsApi;