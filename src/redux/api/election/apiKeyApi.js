// src/redux/api/apiKey/apiKeyApi.js
// RTK Query API for API Key Management

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_ELECTION_SERVICE_URL || 'http://localhost:3005/api';

export const apiKeyApi = createApi({
  reducerPath: 'apiKeyApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      // Add user data header (required by your authMiddleware)
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
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
        } catch (error) {
          console.error('Error parsing userData:', error);
        }
      }
      
      return headers;
    },
  }),
  tagTypes: ['ApiKey', 'ApiKeys', 'ApiKeyUsage'],
  endpoints: (builder) => ({
    
    // Get all API keys
    getApiKeys: builder.query({
      query: () => '/admin/api-keys',
      transformResponse: (response) => {
        if (response.success && response.data) {
          return response.data;
        }
        return [];
      },
      providesTags: ['ApiKeys'],
    }),

    // Get single API key by ID
    getApiKeyById: builder.query({
      query: (id) => `/admin/api-keys/${id}`,
      transformResponse: (response) => {
        if (response.success && response.data) {
          return response.data;
        }
        return null;
      },
      providesTags: (result, error, id) => [{ type: 'ApiKey', id }],
    }),

    // Create new API key
    createApiKey: builder.mutation({
      query: (data) => ({
        url: '/admin/api-keys',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response) => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to create API key');
      },
      invalidatesTags: ['ApiKeys'],
    }),

    // Update API key
    updateApiKey: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/api-keys/${id}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response) => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to update API key');
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'ApiKey', id },
        'ApiKeys'
      ],
    }),

    // Toggle API key status (enable/disable)
    toggleApiKeyStatus: builder.mutation({
      query: ({ id, is_active }) => ({
        url: `/admin/api-keys/${id}`,
        method: 'PATCH',
        body: { is_active },
      }),
      transformResponse: (response) => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to update API key status');
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'ApiKey', id },
        'ApiKeys'
      ],
    }),

    // Revoke (delete) API key
    revokeApiKey: builder.mutation({
      query: (id) => ({
        url: `/admin/api-keys/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => {
        if (response.success) {
          return true;
        }
        throw new Error(response.message || 'Failed to revoke API key');
      },
      invalidatesTags: ['ApiKeys'],
    }),

    // Get API key usage statistics
    getApiKeyUsage: builder.query({
      query: ({ id, days = 30 }) => `/admin/api-keys/${id}/usage?days=${days}`,
      transformResponse: (response) => {
        if (response.success && response.data) {
          return response.data;
        }
        return [];
      },
      providesTags: (result, error, { id }) => [{ type: 'ApiKeyUsage', id }],
    }),

  }),
});

// Export hooks
export const {
  useGetApiKeysQuery,
  useGetApiKeyByIdQuery,
  useCreateApiKeyMutation,
  useUpdateApiKeyMutation,
  useToggleApiKeyStatusMutation,
  useRevokeApiKeyMutation,
  useGetApiKeyUsageQuery,
  useLazyGetApiKeyUsageQuery,
} = apiKeyApi;

export default apiKeyApi;