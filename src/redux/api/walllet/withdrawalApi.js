// src/redux/api/walllet/withdrawalApi.js
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

export const withdrawalApi = createApi({
  reducerPath: 'withdrawalApi',
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
  tagTypes: ['Withdrawal', 'WithdrawalRequests', 'PendingWithdrawals'],
  endpoints: (builder) => ({
    
    // Request withdrawal
    requestWithdrawal: builder.mutation({
      query: ({ amount, paymentMethod, paymentDetails }) => ({
        url: `/wallet/withdraw`,
        method: 'POST',
        body: {
          amount,
          paymentMethod,
          paymentDetails,
        },
      }),
      invalidatesTags: ['Withdrawal', 'WithdrawalRequests', 'Wallet'],
    }),

    // Get user's withdrawal requests
    getWithdrawalRequests: builder.query({
      query: ({ status } = {}) => {
        const params = status ? `?status=${status}` : '';
        return `/wallet/withdrawals${params}`;
      },
      providesTags: ['WithdrawalRequests'],
    }),

    // Admin: Get pending withdrawals
    getPendingWithdrawals: builder.query({
      query: () => `/admin/wallet/withdrawals/pending`,
      providesTags: ['PendingWithdrawals'],
    }),

    // Admin: Review withdrawal (approve/reject)
    reviewWithdrawal: builder.mutation({
      query: ({ requestId, action, adminNotes }) => ({
        url: `/admin/wallet/withdrawals/${requestId}/review`,
        method: 'PUT',
        body: {
          action, // 'approve' or 'reject'
          adminNotes,
        },
      }),
      invalidatesTags: ['PendingWithdrawals', 'WithdrawalRequests', 'Wallet'],
    }),

  }),
});

export const {
  useRequestWithdrawalMutation,
  useGetWithdrawalRequestsQuery,
  useGetPendingWithdrawalsQuery,
  useReviewWithdrawalMutation,
} = withdrawalApi;