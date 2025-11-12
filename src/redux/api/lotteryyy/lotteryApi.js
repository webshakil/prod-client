// src/redux/api/lotteryyy/lotteryApi.js
// ✨ 3 y's to avoid conflict with existing lottery files
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
        headers.set('x-user-id', userData.userId);
      }
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Lottery', 'LotteryTicket', 'LotteryParticipants', 'LotteryWinners'],
  endpoints: (builder) => ({
    
    // Get lottery info for election
    getLotteryInfo: builder.query({
      query: (electionId) => `/lottery/elections/${electionId}/lottery`,
      providesTags: ['Lottery'],
      // Poll every 5 seconds for real-time updates
      pollingInterval: 5000,
    }),

    // Get user's lottery ticket
    getMyLotteryTicket: builder.query({
      query: (electionId) => `/lottery/elections/${electionId}/lottery/my-ticket`,
      providesTags: ['LotteryTicket'],
    }),

    // Get all lottery participants (admin/creator)
    getLotteryParticipants: builder.query({
      query: (electionId) => `/lottery/elections/${electionId}/lottery/participants`,
      providesTags: ['LotteryParticipants'],
    }),

    // Claim lottery prize
    claimPrize: builder.mutation({
      query: (winnerId) => ({
        url: `/lottery/winners/${winnerId}/claim`,
        method: 'POST',
      }),
      invalidatesTags: ['LotteryWinners'],
    }),

  }),
});

export const {
  useGetLotteryInfoQuery,
  useGetMyLotteryTicketQuery,
  useGetLotteryParticipantsQuery,
  useClaimPrizeMutation,
} = lotteryyApi;

export default lotteryyApi;