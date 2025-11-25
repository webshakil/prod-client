// src/redux/api/analytics/analyticsApiKeyApi.js
// RTK Query API for Analytics API Keys (voting-service 3007)

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

export const analyticsApiKeyApi = createApi({
  reducerPath: 'analyticsApiKeyApi',
  baseQuery: fetchBaseQuery({
    baseUrl: VOTING_SERVICE_URL,
    prepareHeaders: (headers) => {
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
  tagTypes: ['AnalyticsApiKey', 'AnalyticsApiKeyUsage'],
  endpoints: (builder) => ({

    // Get all analytics API keys
    getAnalyticsApiKeys: builder.query({
      query: () => '/admin/analytics-api-keys',
      transformResponse: (response) => response.data || [],
      providesTags: ['AnalyticsApiKey'],
    }),

    // Create new analytics API key
    createAnalyticsApiKey: builder.mutation({
      query: (body) => ({
        url: '/admin/analytics-api-keys',
        method: 'POST',
        body,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['AnalyticsApiKey'],
    }),

    // Toggle analytics API key status (enable/disable)
    toggleAnalyticsApiKeyStatus: builder.mutation({
      query: ({ id, is_active }) => ({
        url: `/admin/analytics-api-keys/${id}/status`,
        method: 'PATCH',
        body: { is_active },
      }),
      invalidatesTags: ['AnalyticsApiKey'],
    }),

    // Revoke/Delete analytics API key
    revokeAnalyticsApiKey: builder.mutation({
      query: (id) => ({
        url: `/admin/analytics-api-keys/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AnalyticsApiKey'],
    }),

    // Get usage stats for an analytics API key
    getAnalyticsApiKeyUsage: builder.query({
      query: ({ id, days = 30 }) => `/admin/analytics-api-keys/${id}/usage?days=${days}`,
      transformResponse: (response) => response.data || [],
      providesTags: ['AnalyticsApiKeyUsage'],
    }),

  }),
});

export const {
  useGetAnalyticsApiKeysQuery,
  useCreateAnalyticsApiKeyMutation,
  useToggleAnalyticsApiKeyStatusMutation,
  useRevokeAnalyticsApiKeyMutation,
  useLazyGetAnalyticsApiKeyUsageQuery,
} = analyticsApiKeyApi;

export default analyticsApiKeyApi;