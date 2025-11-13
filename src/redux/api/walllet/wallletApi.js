// src/redux/api/walllet/walletApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const VOTING_SERVICE_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api';

const getUserData = () => {
  const userDataStr = localStorage.getItem('userData');
  console.log('📦 Getting userData from localStorage:', userDataStr ? 'Found' : 'Not found'); // ✅ LOG
  
  if (userDataStr) {
    try {
      const parsed = JSON.parse(userDataStr);
      console.log('✅ Parsed userData:', parsed); // ✅ LOG
      return parsed;
    } catch (error) {
      console.error('❌ Error parsing userData:', error);
    }
  }
  return null;
};

export const wallletApi = createApi({
  reducerPath: 'walletApi',
  baseQuery: fetchBaseQuery({
    baseUrl: VOTING_SERVICE_URL,
    prepareHeaders: (headers) => {
      console.log('🔧 prepareHeaders called for wallet API'); // ✅ LOG
      
      const userData = getUserData();
      
      if (userData) {
        const headerData = {
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
        
        console.log('📤 Setting x-user-data header:', headerData); // ✅ LOG
        
        headers.set('x-user-data', JSON.stringify(headerData));
        headers.set('x-user-id', userData.userId);
      } else {
        console.error('❌ No userData found in localStorage!'); // ✅ LOG
      }
      
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
        console.log('🔑 Authorization header set'); // ✅ LOG
      }
      
      console.log('📋 Final headers:', Object.fromEntries(headers.entries())); // ✅ LOG
      
      return headers;
    },
  }),
  tagTypes: [
    'Wallet', 
    'Transactions', 
    'BlockedAccounts', 
    'Analytics', 
    'Withdrawals',
    'ElectionPayment',
    'Prizes',
    'SponsoredElections',
    'PendingWithdrawals',
    'PendingPrizes'
  ],
  endpoints: (builder) => ({
    
    // ===== WALLET CORE =====
    getWallet: builder.query({
      query: () => {
        console.log('🔵 getWallet query called'); // ✅ LOG
        return `/wallet`;
      },
      providesTags: ['Wallet'],
    }),

    // ... rest of your endpoints (keep them as is)
    
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

    getBlockedAccounts: builder.query({
      query: () => `/wallet/blocked-accounts`,
      providesTags: ['BlockedAccounts'],
    }),

    getWalletAnalytics: builder.query({
      query: () => `/wallet/analytics`,
      providesTags: ['Analytics'],
    }),

    deposit: builder.mutation({
      query: (data) => ({
        url: `/wallet/deposit`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wallet', 'Transactions'],
    }),

    confirmDeposit: builder.mutation({
      query: (data) => ({
        url: `/wallet/deposit/confirm`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wallet', 'Transactions'],
    }),

    requestWithdrawal: builder.mutation({
      query: (data) => ({
        url: `/wallet/withdraw`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wallet', 'Withdrawals', 'Transactions'],
    }),

    getWithdrawalRequests: builder.query({
      query: ({ status } = {}) => {
        const params = status ? `?status=${status}` : '';
        return `/wallet/withdrawals${params}`;
      },
      providesTags: ['Withdrawals'],
    }),

    getPendingWithdrawals: builder.query({
      query: () => `/wallet/admin/withdrawals/pending`,
      providesTags: ['PendingWithdrawals'],
    }),

    reviewWithdrawal: builder.mutation({
      query: ({ requestId, action, adminNotes }) => ({
        url: `/wallet/admin/withdrawals/${requestId}/review`,
        method: 'PUT',
        body: { action, adminNotes },
      }),
      invalidatesTags: ['PendingWithdrawals', 'Withdrawals', 'Wallet'],
    }),

    payForElection: builder.mutation({
      query: (data) => ({
        url: `/wallet/pay-election`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wallet', 'BlockedAccounts', 'ElectionPayment'],
    }),

    confirmElectionPayment: builder.mutation({
      query: (data) => ({
        url: `/wallet/election-payment/confirm`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ElectionPayment', 'BlockedAccounts'],
    }),

    checkElectionPaymentStatus: builder.query({
      query: (electionId) => `/wallet/election-payment/status/${electionId}`,
      providesTags: (result, error, electionId) => [
        { type: 'ElectionPayment', id: electionId }
      ],
    }),

    canUserVote: builder.query({
      query: (electionId) => `/wallet/can-vote/${electionId}`,
      providesTags: (result, error, electionId) => [
        { type: 'ElectionPayment', id: electionId }
      ],
    }),

    getMyPrizes: builder.query({
      query: () => `/wallet/prizes/my-prizes`,
      providesTags: ['Prizes'],
    }),

    distributeLotteryPrizes: builder.mutation({
      query: (electionId) => ({
        url: `/wallet/prizes/distribute/${electionId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Prizes', 'Wallet', 'Transactions'],
    }),

    getPendingPrizeDistributions: builder.query({
      query: () => `/wallet/admin/prizes/pending`,
      providesTags: ['PendingPrizes'],
    }),

    reviewPrizeDistribution: builder.mutation({
      query: ({ queueId, action, adminNotes }) => ({
        url: `/wallet/admin/prizes/${queueId}/review`,
        method: 'PUT',
        body: { action, adminNotes },
      }),
      invalidatesTags: ['PendingPrizes', 'Prizes', 'Wallet'],
    }),

    fundPrizePool: builder.mutation({
      query: (data) => ({
        url: `/wallet/sponsor/fund-prize-pool`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SponsoredElections'],
    }),

    confirmPrizeFunding: builder.mutation({
      query: (data) => ({
        url: `/wallet/sponsor/fund-prize-pool/confirm`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SponsoredElections'],
    }),

    getSponsoredElections: builder.query({
      query: () => `/wallet/sponsor/my-elections`,
      providesTags: ['SponsoredElections'],
    }),

    refundFailedElection: builder.mutation({
      query: ({ electionId, reason }) => ({
        url: `/wallet/admin/refund-election/${electionId}`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Wallet', 'Transactions', 'BlockedAccounts'],
    }),

  }),
});

export const {
  useGetWalletQuery,
  useGetTransactionsQuery,
  useGetBlockedAccountsQuery,
  useGetWalletAnalyticsQuery,
  useDepositMutation,
  useConfirmDepositMutation,
  useRequestWithdrawalMutation,
  useGetWithdrawalRequestsQuery,
  useGetPendingWithdrawalsQuery,
  useReviewWithdrawalMutation,
  usePayForElectionMutation,
  useConfirmElectionPaymentMutation,
  useCheckElectionPaymentStatusQuery,
  useCanUserVoteQuery,
  useGetMyPrizesQuery,
  useDistributeLotteryPrizesMutation,
  useGetPendingPrizeDistributionsQuery,
  useReviewPrizeDistributionMutation,
  useFundPrizePoolMutation,
  useConfirmPrizeFundingMutation,
  useGetSponsoredElectionsQuery,
  useRefundFailedElectionMutation,
} = wallletApi;

export default wallletApi;