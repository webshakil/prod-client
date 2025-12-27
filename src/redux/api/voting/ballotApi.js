// src/redux/api/voting/ballotApi.js
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

export const ballotApi = createApi({
  reducerPath: 'ballotApi',
  baseQuery: fetchBaseQuery({
    baseUrl: VOTING_SERVICE_URL,
    prepareHeaders: (headers) => {
      const userData = getUserData();
      
      if (userData) {
        // ✅ Set x-user-data with full user object (matching electionApi)
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
        
        // Also set x-user-id for backward compatibility
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

    // ✅ FIXED: Get live results with proper response transformation
    getLiveResults: builder.query({
      query: (electionId) => `/voting/elections/${electionId}/live-results`,
      providesTags: (result, error, electionId) => [
        { type: 'LiveResults', id: electionId }
      ],
      // ✅ ADDED: Transform response to extract data
      transformResponse: (response) => {
        console.log('📊 Raw API response:', response);
        
        // Handle both response formats:
        // 1. { success: true, data: {...} }
        // 2. Direct data object
        const data = response.data || response;
        
        console.log('✅ Transformed data:', data);
        
        return {
          electionId: data.electionId,
          electionTitle: data.electionTitle,
          votingType: data.votingType,
          totalVotes: data.totalVotes || 0,
          questions: data.questions || [],
          lastUpdated: data.lastUpdated,
        };
      },
    }),

  }),
});

export const {
  useGetBallotDetailsQuery,
  useGetLiveResultsQuery,
} = ballotApi;



