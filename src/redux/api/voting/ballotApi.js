// src/redux/api/voting/ballotApi.js
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

export const ballotApi = createApi({
  reducerPath: 'ballotApi',
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
  tagTypes: ['BallotQuestions', 'LiveResults'],
  endpoints: (builder) => ({
    
    // Get ballot with questions and options
    getBallotDetails: builder.query({
      query: (electionId) => `/voting/elections/${electionId}/ballot`,
      providesTags: ['BallotQuestions'],
      transformResponse: (response) => {
        // Transform ballot data for easy consumption
        return {
          election: response.election,
          questions: response.questions,
          votingType: response.votingType,
          hasVoted: response.hasVoted,
          voteEditingAllowed: response.voteEditingAllowed,
          anonymousVotingEnabled: response.anonymousVotingEnabled,
          liveResults: response.liveResults,
          votingId: response.votingId,
        };
      },
    }),

    // Get live results (if enabled)
    getLiveResults: builder.query({
      query: (electionId) => `/analytics/elections/${electionId}/results`,
      providesTags: ['LiveResults'],
      // Poll every 10 seconds if live results are enabled
      pollingInterval: 10000,
    }),

  }),
});

export const {
  useGetBallotDetailsQuery,
  useGetLiveResultsQuery,
} = ballotApi;