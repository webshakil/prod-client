// src/redux/api/walllet/depositApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const VOTING_SERVICE_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api';

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

export const depositApi = createApi({
  reducerPath: 'depositApi',
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
  tagTypes: ['Deposit'],
  endpoints: (builder) => ({
    
    // Initiate deposit
    createDeposit: builder.mutation({
      query: ({ amount, paymentMethod, regionCode }) => ({
        url: `/wallet/deposit`,
        method: 'POST',
        body: {
          amount,
          paymentMethod,
          regionCode: regionCode || 'region_1_us_canada',
        },
      }),
      invalidatesTags: ['Deposit'],
    }),

    // Confirm deposit (webhook callback)
    confirmDeposit: builder.mutation({
      query: ({ paymentIntentId }) => ({
        url: `/wallet/deposit/confirm`,
        method: 'POST',
        body: { paymentIntentId },
      }),
      invalidatesTags: ['Deposit', 'Wallet', 'Transactions'],
    }),

  }),
});

export const {
  useCreateDepositMutation,
  useConfirmDepositMutation,
} = depositApi;