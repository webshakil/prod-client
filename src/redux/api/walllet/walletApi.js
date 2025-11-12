// src/redux/api/walllet/walletApi.js
// ✨ 3 l's to avoid conflict with existing wallet files
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

export const wallletApi = createApi({
  reducerPath: 'wallletApi',
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
  tagTypes: ['Wallet', 'Transactions', 'BlockedAccounts', 'Analytics'],
  endpoints: (builder) => ({
    
    // Get user wallet
    getWallet: builder.query({
      query: () => `/wallet`,
      providesTags: ['Wallet'],
      // Poll every 30 seconds for balance updates
      pollingInterval: 30000,
    }),

    // Get wallet transactions with filters
    getTransactions: builder.query({
      query: ({ page = 1, limit = 20, type, status, filterType, dateFrom, dateTo }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        
        if (type) params.append('type', type);
        if (status) params.append('status', status);
        if (filterType) params.append('filterType', filterType);
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);
        
        return `/wallet/transactions?${params.toString()}`;
      },
      providesTags: ['Transactions'],
    }),

    // Get blocked accounts
    getBlockedAccounts: builder.query({
      query: () => `/wallet/blocked-accounts`,
      providesTags: ['BlockedAccounts'],
    }),

    // Get wallet analytics
    getWalletAnalytics: builder.query({
      query: () => `/wallet/analytics`,
      providesTags: ['Analytics'],
    }),

  }),
});

export const {
  useGetWalletQuery,
  useGetTransactionsQuery,
  useGetBlockedAccountsQuery,
  useGetWalletAnalyticsQuery,
} = wallletApi;