import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const VOTING_SERVICE_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:5004/api';

export const votingApi = createApi({
  reducerPath: 'votingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: VOTING_SERVICE_URL,
    prepareHeaders: (headers) => {
      const userData = localStorage.getItem('userData');
      if (userData) {
        headers.set('x-user-data', userData);
      }
      return headers;
    },
  }),
  tagTypes: ['Vote', 'Lottery', 'Wallet', 'VideoProgress', 'Analytics'],
  endpoints: (builder) => ({
    // ==================== VOTE ENDPOINTS ====================
    
    // Submit vote
    submitVote: builder.mutation({
      query: (data) => ({
        url: '/votes/submit',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Vote', 'Lottery'],
    }),

    // Edit vote
    editVote: builder.mutation({
      query: (data) => ({
        url: '/votes/edit',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Vote'],
    }),

    // Get my vote for election
    getMyVote: builder.query({
      query: (electionId) => `/votes/my-vote/${electionId}`,
      providesTags: ['Vote'],
    }),

    // Get voting history
    getVotingHistory: builder.query({
      query: (params) => ({
        url: '/votes/history',
        params,
      }),
      providesTags: ['Vote'],
    }),

    // Verify receipt
    verifyReceipt: builder.query({
      query: (receiptId) => `/votes/verify/${receiptId}`,
    }),

    // Get election results
    getElectionResults: builder.query({
      query: (electionId) => `/votes/results/${electionId}`,
    }),

    // ==================== LOTTERY ENDPOINTS ====================
    
    // Get my tickets
    getMyTickets: builder.query({
      query: (params) => ({
        url: '/lottery/tickets',
        params,
      }),
      providesTags: ['Lottery'],
    }),

    // Get lottery stats
    getLotteryStats: builder.query({
      query: (electionId) => `/lottery/${electionId}/stats`,
      providesTags: ['Lottery'],
    }),

    // Get lottery winners
    getLotteryWinners: builder.query({
      query: (electionId) => `/lottery/${electionId}/winners`,
      providesTags: ['Lottery'],
    }),

    // Run lottery draw (Admin)
    runLotteryDraw: builder.mutation({
      query: (electionId) => ({
        url: `/lottery/${electionId}/draw`,
        method: 'POST',
      }),
      invalidatesTags: ['Lottery'],
    }),

    // Claim prize
    claimPrize: builder.mutation({
      query: (winnerId) => ({
        url: `/lottery/claim/${winnerId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Lottery', 'Wallet'],
    }),

    // ==================== PAYMENT ENDPOINTS ====================
    
    // Create payment intent
    createPaymentIntent: builder.mutation({
      query: ({ electionId, ...data }) => ({
        url: `/payments/election/${electionId}/create-intent`,
        method: 'POST',
        body: data,
      }),
    }),

    // Verify payment
    verifyPayment: builder.query({
      query: (paymentId) => `/payments/verify/${paymentId}`,
    }),

    // ==================== VIDEO ENDPOINTS ====================
    
    // Update video progress
    updateVideoProgress: builder.mutation({
      query: ({ electionId, ...data }) => ({
        url: `/video/${electionId}/progress`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['VideoProgress'],
    }),

    // Get video progress
    getVideoProgress: builder.query({
      query: (electionId) => `/video/${electionId}/progress`,
      providesTags: ['VideoProgress'],
    }),

    // ==================== WALLET ENDPOINTS ====================
    
    // Get balance
    getWalletBalance: builder.query({
      query: () => '/wallet/balance',
      providesTags: ['Wallet'],
    }),

    // Get transactions
    getWalletTransactions: builder.query({
      query: (params) => ({
        url: '/wallet/transactions',
        params,
      }),
      providesTags: ['Wallet'],
    }),

    // Request withdrawal
    requestWithdrawal: builder.mutation({
      query: (data) => ({
        url: '/wallet/withdraw',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wallet'],
    }),

    // Get withdrawal requests (Admin)
    getWithdrawalRequests: builder.query({
      query: (params) => ({
        url: '/wallet/withdrawals',
        params,
      }),
      providesTags: ['Wallet'],
    }),

    // Approve withdrawal (Admin)
    approveWithdrawal: builder.mutation({
      query: (requestId) => ({
        url: `/wallet/withdrawals/${requestId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['Wallet'],
    }),

    // Reject withdrawal (Admin)
    rejectWithdrawal: builder.mutation({
      query: ({ requestId, notes }) => ({
        url: `/wallet/withdrawals/${requestId}/reject`,
        method: 'POST',
        body: { notes },
      }),
      invalidatesTags: ['Wallet'],
    }),

    // ==================== ANALYTICS ENDPOINTS ====================
    
    // Get analytics
    getElectionAnalytics: builder.query({
      query: ({ electionId, ...params }) => ({
        url: `/analytics/${electionId}`,
        params,
      }),
      providesTags: ['Analytics'],
    }),

    // Export votes
    exportVotes: builder.query({
      query: ({ electionId, ...params }) => ({
        url: `/analytics/${electionId}/export-votes`,
        params,
      }),
    }),

    // Export results
    exportResults: builder.query({
      query: ({ electionId, ...params }) => ({
        url: `/analytics/${electionId}/export-results`,
        params,
      }),
    }),
  }),
});

export const {
  // Votes
  useSubmitVoteMutation,
  useEditVoteMutation,
  useGetMyVoteQuery,
  useGetVotingHistoryQuery,
  useVerifyReceiptQuery,
  useGetElectionResultsQuery,
  
  // Lottery
  useGetMyTicketsQuery,
  useGetLotteryStatsQuery,
  useGetLotteryWinnersQuery,
  useRunLotteryDrawMutation,
  useClaimPrizeMutation,
  
  // Payment
  useCreatePaymentIntentMutation,
  useVerifyPaymentQuery,
  
  // Video
  useUpdateVideoProgressMutation,
  useGetVideoProgressQuery,
  
  // Wallet
  useGetWalletBalanceQuery,
  useGetWalletTransactionsQuery,
  useRequestWithdrawalMutation,
  useGetWithdrawalRequestsQuery,
  useApproveWithdrawalMutation,
  useRejectWithdrawalMutation,
  
  // Analytics
  useGetElectionAnalyticsQuery,
  useLazyExportVotesQuery,
  useLazyExportResultsQuery,
} = votingApi;