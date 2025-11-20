// src/redux/api/admin/electionStatsApi.js
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

export const electionStatsApi = createApi({
  reducerPath: 'electionStatsApi',
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
  tagTypes: ['ElectionStats', 'ElectionDetails', 'LotteryWinners'],
  endpoints: (builder) => ({
    
    // Get all elections with lottery stats (admin)
    getAllElectionStats: builder.query({
      query: ({ status, page = 1, limit = 50 }) => ({
        url: `/admin/elections/stats`,
        params: { status, page, limit },
      }),
      providesTags: ['ElectionStats'],
      transformResponse: (response) => {
        const data = response.data || response;
        return {
          elections: data.elections || [],
          summary: data.summary || {
            totalElections: 0,
            activeElections: 0,
            totalPrizePool: 0,
            totalVotes: 0,
            failedDraws: 0,
            todayDraws: 0,
            tomorrowDraws: 0,
          },
          pagination: data.pagination || { total: 0, page: 1, pages: 1 },
        };
      },
    }),

    // Get detailed election info with winners (admin)
    getElectionDetails: builder.query({
      query: (electionId) => `/admin/elections/${electionId}/details`,
      providesTags: (result, error, electionId) => [
        { type: 'ElectionDetails', id: electionId }
      ],
      transformResponse: (response) => {
        const data = response.data || response;
        return {
          election: data.election || {},
          lottery: data.lottery || {},
          winners: data.winners || [],
          stats: data.stats || {},
        };
      },
    }),

    // Trigger manual lottery draw (admin)
    triggerManualDraw: builder.mutation({
      query: (electionId) => ({
        url: `/lottery/elections/${electionId}/lottery/draw`,
        method: 'POST',
      }),
      invalidatesTags: ['ElectionStats', 'LotteryWinners'],
    }),

    // Get lottery winners for election
    getLotteryWinners: builder.query({
      query: (electionId) => `/lottery/elections/${electionId}/winners`,
      providesTags: (result, error, electionId) => [
        { type: 'LotteryWinners', id: electionId }
      ],
      transformResponse: (response) => {
        const data = response.data || response;
        return data.winners || [];
      },
    }),

  }),
});

export const {
  useGetAllElectionStatsQuery,
  useGetElectionDetailsQuery,
  useTriggerManualDrawMutation,
  useGetLotteryWinnersQuery,
} = electionStatsApi;