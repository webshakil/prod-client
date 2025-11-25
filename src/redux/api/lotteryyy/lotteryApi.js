// src/redux/api/lotteryyy/lotteryApi.js
// ✨ 3 y's to avoid conflict with existing lottery files
// ✅ ENHANCED: Full lottery prize disbursement system
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

export const lotteryyApi = createApi({
  reducerPath: 'lotteryyApi',
  baseQuery: fetchBaseQuery({
    baseUrl: VOTING_SERVICE_URL,
    prepareHeaders: (headers) => {
      const userData = getUserData();
      
      if (userData) {
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
        
        headers.set('x-user-id', userData.userId);
      }
      
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  tagTypes: [
    'Lottery', 
    'LotteryTicket', 
    'LotteryParticipants', 
    'LotteryWinners',
    'MyWinnings',
    'PendingApprovals',
    'DisbursementHistory',
    'DisbursementConfig'
  ],
  endpoints: (builder) => ({
    
    // =====================================================
    // PUBLIC ENDPOINTS
    // =====================================================
    
    // Get lottery info for election (includes winners if drawn)
    getLotteryInfo: builder.query({
      query: (electionId) => `/elections/${electionId}/lottery`,
      providesTags: (result, error, electionId) => [
        { type: 'Lottery', id: electionId },
        'LotteryWinners'
      ],
    }),

    // Get public winners announcement (masked names)
    getWinnersAnnouncement: builder.query({
      query: (electionId) => `/elections/${electionId}/lottery/winners`,
      providesTags: (result, error, electionId) => [
        { type: 'LotteryWinners', id: electionId }
      ],
    }),

    // =====================================================
    // USER ENDPOINTS
    // =====================================================

    // Get user's lottery ticket for specific election
    getMyLotteryTicket: builder.query({
      query: (electionId) => `/elections/${electionId}/lottery/my-ticket`,
      providesTags: (result, error, electionId) => [
        { type: 'LotteryTicket', id: electionId }
      ],
    }),

    // ✅ NEW: Get user's complete winning history across ALL elections
    getMyWinnings: builder.query({
      query: () => `/lottery/my-winnings`,
      providesTags: ['MyWinnings'],
      // Transform response to ensure consistent structure
      transformResponse: (response) => ({
        winnings: response.winnings || [],
        summary: response.summary || {
          total_wins: 0,
          total_won: 0,
          claimed: 0,
          disbursed: 0,
          pending: 0,
          unclaimed: 0,
          rejected: 0,
        },
      }),
    }),

    // ✅ ENHANCED: Claim lottery prize with full response handling
    claimPrize: builder.mutation({
      query: (winnerId) => ({
        url: `/lottery/winners/${winnerId}/claim`,
        method: 'POST',
      }),
      // Invalidate relevant caches after claiming
      /*eslint-disable*/
      invalidatesTags: (result, error, winnerId) => [
        'MyWinnings',
        'LotteryWinners',
        { type: 'Lottery' },
      ],
    }),

    // =====================================================
    // ADMIN/CREATOR ENDPOINTS - Lottery Management
    // =====================================================

    // Get all lottery participants for an election
    getLotteryParticipants: builder.query({
      query: (electionId) => `/elections/${electionId}/lottery/participants`,
      providesTags: (result, error, electionId) => [
        { type: 'LotteryParticipants', id: electionId }
      ],
    }),

    // ✅ NEW: Draw lottery manually (admin only)
    drawLottery: builder.mutation({
      query: (electionId) => ({
        url: `/elections/${electionId}/lottery/draw`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, electionId) => [
        { type: 'Lottery', id: electionId },
        { type: 'LotteryWinners', id: electionId },
        'PendingApprovals',
      ],
    }),

    // =====================================================
    // ADMIN ENDPOINTS - Disbursement Management
    // =====================================================

    // ✅ NEW: Get pending disbursement approvals
      getPendingApprovals: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append('status', params.status);
        if (params.minAmount) queryParams.append('minAmount', params.minAmount);
        if (params.maxAmount) queryParams.append('maxAmount', params.maxAmount);
        const queryString = queryParams.toString();
        return `/lottery/admin/pending-approvals${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['PendingApprovals'],
      transformResponse: (response) => ({
        pendingApprovals: response.pendingApprovals || response.pending_approvals || [],
        stats: response.stats || {
          total_pending: 0,
          total_amount: 0,
          pending_approval: 0,
          pending_senior_approval: 0,
        },
        thresholds: response.thresholds || {},
      }),
    }),
    // getPendingApprovals: builder.query({
    //   query: (params = {}) => {
    //     const queryParams = new URLSearchParams();
    //     if (params.status) queryParams.append('status', params.status);
    //     if (params.minAmount) queryParams.append('minAmount', params.minAmount);
    //     if (params.maxAmount) queryParams.append('maxAmount', params.maxAmount);
    //     const queryString = queryParams.toString();
    //     return `/admin/lottery/pending-approvals${queryString ? `?${queryString}` : ''}`;
    //   },
    //   providesTags: ['PendingApprovals'],
    //   // Transform to ensure consistent structure
    //   transformResponse: (response) => ({
    //     pendingApprovals: response.pendingApprovals || response.pending_approvals || [],
    //     stats: response.stats || {
    //       total_pending: 0,
    //       total_amount: 0,
    //       pending_approval: 0,
    //       pending_senior_approval: 0,
    //     },
    //     thresholds: response.thresholds || {},
    //   }),
    // }),

    // ✅ NEW: Get disbursement history with pagination
    getDisbursementHistory: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.status) queryParams.append('status', params.status);
        if (params.electionId) queryParams.append('electionId', params.electionId);
        if (params.fromDate) queryParams.append('fromDate', params.fromDate);
        if (params.toDate) queryParams.append('toDate', params.toDate);
        const queryString = queryParams.toString();
        return `/lottery/admin/disbursements${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['DisbursementHistory'],
      transformResponse: (response) => ({
        disbursements: response.disbursements || [],
        pagination: response.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1,
        },
      }),
    }),
    // getDisbursementHistory: builder.query({
    //   query: (params = {}) => {
    //     const queryParams = new URLSearchParams();
    //     if (params.electionId) queryParams.append('electionId', params.electionId);
    //     if (params.status) queryParams.append('status', params.status);
    //     if (params.fromDate) queryParams.append('fromDate', params.fromDate);
    //     if (params.toDate) queryParams.append('toDate', params.toDate);
    //     if (params.page) queryParams.append('page', params.page);
    //     if (params.limit) queryParams.append('limit', params.limit);
    //     const queryString = queryParams.toString();
    //     return `/admin/lottery/disbursements${queryString ? `?${queryString}` : ''}`;
    //   },
    //   providesTags: ['DisbursementHistory'],
    //   transformResponse: (response) => ({
    //     disbursements: response.disbursements || [],
    //     pagination: response.pagination || {
    //       page: 1,
    //       limit: 20,
    //       total: 0,
    //       totalPages: 0,
    //     },
    //   }),
    // }),

    // ✅ NEW: Approve single disbursement
      approveDisbursement: builder.mutation({
      query: ({ winnerId, notes }) => ({
        url: `/lottery/admin/winners/${winnerId}/approve`,
        method: 'POST',
        body: { notes },
      }),
      invalidatesTags: ['PendingApprovals', 'DisbursementHistory', 'MyWinnings'],
    }),
    // approveDisbursement: builder.mutation({
    //   query: ({ winnerId, notes }) => ({
    //     url: `/admin/lottery/winners/${winnerId}/approve`,
    //     method: 'POST',
    //     body: { notes },
    //   }),
    //   invalidatesTags: ['PendingApprovals', 'DisbursementHistory', 'MyWinnings'],
    // }),

    // ✅ NEW: Reject single disbursement
    rejectDisbursement: builder.mutation({
      query: ({ winnerId, reason }) => ({
        url: `/lottery/admin/winners/${winnerId}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['PendingApprovals', 'DisbursementHistory', 'MyWinnings'],
    }),
    // rejectDisbursement: builder.mutation({
    //   query: ({ winnerId, reason }) => ({
    //     url: `/admin/lottery/winners/${winnerId}/reject`,
    //     method: 'POST',
    //     body: { reason },
    //   }),
    //   invalidatesTags: ['PendingApprovals', 'DisbursementHistory', 'MyWinnings'],
    // }),

    // ✅ NEW: Bulk approve multiple disbursements
      bulkApproveDisbursements: builder.mutation({
      query: (winnerIds) => ({
        url: `/lottery/admin/disbursements/bulk-approve`,
        method: 'POST',
        body: { winnerIds },
      }),
      invalidatesTags: ['PendingApprovals', 'DisbursementHistory', 'MyWinnings'],
    }),
    // bulkApproveDisbursements: builder.mutation({
    //   query: (winnerIds) => ({
    //     url: `/admin/lottery/disbursements/bulk-approve`,
    //     method: 'POST',
    //     body: { winnerIds },
    //   }),
    //   invalidatesTags: ['PendingApprovals', 'DisbursementHistory', 'MyWinnings'],
    // }),

    // =====================================================
    // ADMIN ENDPOINTS - Configuration
    // =====================================================

    // ✅ NEW: Get disbursement configuration (thresholds)
     getDisbursementConfig: builder.query({
      query: () => `/lottery/admin/config`,
      providesTags: ['DisbursementConfig'],
      transformResponse: (response) => ({
        config: response.config || [],
        thresholds: response.thresholds || {
          AUTO_DISBURSE_THRESHOLD: 5000,
          LARGE_AMOUNT_THRESHOLD: 10000,
          MAX_AUTO_DISBURSE_DAILY: 50000,
        },
      }),
    }),
    // getDisbursementConfig: builder.query({
    //   query: () => `/admin/lottery/config`,
    //   providesTags: ['DisbursementConfig'],
    //   transformResponse: (response) => ({
    //     config: response.config || [],
    //     current: response.current || {
    //       AUTO_DISBURSE_THRESHOLD: 1000,
    //       LARGE_AMOUNT_THRESHOLD: 10000,
    //       MAX_AUTO_DISBURSE_DAILY: 50000,
    //       CURRENCY: 'USD',
    //     },
    //   }),
    // }),

    // ✅ NEW: Update disbursement configuration (manager only)
      updateDisbursementConfig: builder.mutation({
      query: ({ config_key, config_value }) => ({
        url: `/lottery/admin/config`,
        method: 'PUT',
        body: { config_key, config_value },
      }),
      invalidatesTags: ['DisbursementConfig'],
    }),
    // updateDisbursementConfig: builder.mutation({
    //   query: ({ config_key, config_value }) => ({
    //     url: `/admin/lottery/config`,
    //     method: 'PUT',
    //     body: { config_key, config_value },
    //   }),
    //   invalidatesTags: ['DisbursementConfig'],
    // }),

  }),
});

// =====================================================
// EXPORT HOOKS
// =====================================================

export const {
  // Public
  useGetLotteryInfoQuery,
  useGetWinnersAnnouncementQuery,
  
  // User
  useGetMyLotteryTicketQuery,
  useGetMyWinningsQuery,
  useClaimPrizeMutation,
  
  // Admin - Lottery Management
  useGetLotteryParticipantsQuery,
  useDrawLotteryMutation,
  
  // Admin - Disbursement Management
  useGetPendingApprovalsQuery,
  useGetDisbursementHistoryQuery,
  useApproveDisbursementMutation,
  useRejectDisbursementMutation,
  useBulkApproveDisbursementsMutation,
  
  // Admin - Configuration
  useGetDisbursementConfigQuery,
  useUpdateDisbursementConfigMutation,
} = lotteryyApi;

export default lotteryyApi;
// // src/redux/api/lotteryyy/lotteryApi.js
// // ✨ 3 y's to avoid conflict with existing lottery files
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const VOTING_SERVICE_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api';

// const getUserData = () => {
//   const userDataStr = localStorage.getItem('userData');
//   if (userDataStr) {
//     try {
//       return JSON.parse(userDataStr);
//     } catch (error) {
//       console.error('Error parsing userData:', error);
//     }
//   }
//   return null;
// };

// export const lotteryyApi = createApi({
//   reducerPath: 'lotteryyApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: VOTING_SERVICE_URL,
//     prepareHeaders: (headers) => {
//       const userData = getUserData();
      
//       if (userData) {
//         // ✅ FIXED: Set x-user-data with full user object (same as electionApi)
//         headers.set('x-user-data', JSON.stringify({
//           userId: userData.userId,
//           email: userData.email,
//           phone: userData.phone || null,
//           username: userData.username || null,
//           roles: (userData.roles || ['Voter']).map(role => 
//             role === 'ContentCreator' ? 'Content_Creator' : role
//           ),
//           subscriptionType: userData.subscriptionType || 'Free',
//           isSubscribed: userData.isSubscribed || false
//         }));
        
//         // Also set x-user-id for backward compatibility
//         headers.set('x-user-id', userData.userId);
//       }
      
//       const token = localStorage.getItem('accessToken');
//       if (token) {
//         headers.set('Authorization', `Bearer ${token}`);
//       }
      
//       return headers;
//     },
//   }),
//   tagTypes: ['Lottery', 'LotteryTicket', 'LotteryParticipants', 'LotteryWinners'],
//   endpoints: (builder) => ({
    
//     // Get lottery info for election
//     getLotteryInfo: builder.query({
//       query: (electionId) => `/lottery/elections/${electionId}/lottery`,
//       providesTags: ['Lottery'],
//       // Poll every 5 seconds for real-time updates
//       pollingInterval: 5000,
//     }),

//     // Get user's lottery ticket
//     getMyLotteryTicket: builder.query({
//       query: (electionId) => `/lottery/elections/${electionId}/lottery/my-ticket`,
//       providesTags: ['LotteryTicket'],
//     }),

//     // Get all lottery participants (admin/creator)
//     getLotteryParticipants: builder.query({
//       query: (electionId) => `/lottery/elections/${electionId}/lottery/participants`,
//       providesTags: ['LotteryParticipants'],
//     }),

//     // Claim lottery prize
//     claimPrize: builder.mutation({
//       query: (winnerId) => ({
//         url: `/lottery/winners/${winnerId}/claim`,
//         method: 'POST',
//       }),
//       invalidatesTags: ['LotteryWinners'],
//     }),

//   }),
// });

// export const {
//   useGetLotteryInfoQuery,
//   useGetMyLotteryTicketQuery,
//   useGetLotteryParticipantsQuery,
//   useClaimPrizeMutation,
// } = lotteryyApi;

// export default lotteryyApi;
// // src/redux/api/lotteryyy/lotteryApi.js
// // ✨ 3 y's to avoid conflict with existing lottery files
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const VOTING_SERVICE_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api';

// const getUserData = () => {
//   const userDataStr = localStorage.getItem('userData');
//   if (userDataStr) {
//     try {
//       return JSON.parse(userDataStr);
//     } catch (error) {
//       console.error('Error parsing userData:', error);
//     }
//   }
//   return null;
// };

// export const lotteryyApi = createApi({
//   reducerPath: 'lotteryyApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: VOTING_SERVICE_URL,
//     prepareHeaders: (headers) => {
//       const userData = getUserData();
//       if (userData) {
//         headers.set('x-user-id', userData.userId);
//       }
//       const token = localStorage.getItem('accessToken');
//       if (token) {
//         headers.set('Authorization', `Bearer ${token}`);
//       }
//       return headers;
//     },
//   }),
//   tagTypes: ['Lottery', 'LotteryTicket', 'LotteryParticipants', 'LotteryWinners'],
//   endpoints: (builder) => ({
    
//     // Get lottery info for election
//     getLotteryInfo: builder.query({
//       query: (electionId) => `/lottery/elections/${electionId}/lottery`,
//       providesTags: ['Lottery'],
//       // Poll every 5 seconds for real-time updates
//       pollingInterval: 5000,
//     }),

//     // Get user's lottery ticket
//     getMyLotteryTicket: builder.query({
//       query: (electionId) => `/lottery/elections/${electionId}/lottery/my-ticket`,
//       providesTags: ['LotteryTicket'],
//     }),

//     // Get all lottery participants (admin/creator)
//     getLotteryParticipants: builder.query({
//       query: (electionId) => `/lottery/elections/${electionId}/lottery/participants`,
//       providesTags: ['LotteryParticipants'],
//     }),

//     // Claim lottery prize
//     claimPrize: builder.mutation({
//       query: (winnerId) => ({
//         url: `/lottery/winners/${winnerId}/claim`,
//         method: 'POST',
//       }),
//       invalidatesTags: ['LotteryWinners'],
//     }),

//   }),
// });

// export const {
//   useGetLotteryInfoQuery,
//   useGetMyLotteryTicketQuery,
//   useGetLotteryParticipantsQuery,
//   useClaimPrizeMutation,
// } = lotteryyApi;

// export default lotteryyApi;