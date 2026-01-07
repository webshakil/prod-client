// src/redux/api/voting/votingApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const VOTING_SERVICE_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api';

// Helper to get user data from localStorage
const getUserData = () => {
  const userDataStr = localStorage.getItem('userData');
  if (userDataStr) {
    try {
      const userData = JSON.parse(userDataStr);
      return {
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
    } catch (error) {
      console.error('Error parsing userData:', error);
    }
  }
  return null;
};

export const votingApi = createApi({
  reducerPath: 'votingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: VOTING_SERVICE_URL,
    prepareHeaders: (headers) => {
      const userData = getUserData();
      if (userData) {
        headers.set('x-user-id', userData.userId);
        headers.set('x-user-data', JSON.stringify(userData));
      }
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Vote', 'Ballot', 'VideoProgress', 'VoteHistory', 'VoteAudit', 'LiveResults'],
  endpoints: (builder) => ({
    
    // ============ ORIGINAL ENDPOINTS ============
    
    // Get election ballot
    getBallot: builder.query({
      query: (electionId) => `/voting/elections/${electionId}/ballot`,
      providesTags: (result, error, electionId) => [
        { type: 'Ballot', id: electionId },
        'Ballot'
      ],
      keepUnusedDataFor: 0,
    }),

    // Cast vote
    // ✅ FIXED: Removed 'Ballot' from invalidatesTags to prevent refetch after voting
    // This allows ElectionVotingView to show success screen instead of "Already Voted"
    castVote: builder.mutation({
      query: ({ electionId, answers, isAbstention = false }) => ({
        url: `/voting/elections/${electionId}/vote`,
        method: 'POST',
        body: { answers, isAbstention },
      }),
      invalidatesTags: ['Vote', 'VoteHistory', 'LiveResults'], // ✅ Removed 'Ballot'
    }),

    // Get user's vote for an election
    getUserVote: builder.query({
      query: (electionId) => `/voting/elections/${electionId}/my-vote`,
      providesTags: ['Vote'],
    }),
    
    // Get voting history
    getVotingHistory: builder.query({
      query: ({ page = 1, limit = 10 }) => `/voting/history?page=${page}&limit=${limit}`,
      providesTags: ['VoteHistory'],
    }),

    // Update video watch progress
    updateVideoProgress: builder.mutation({
      query: ({ electionId, watchPercentage, lastPosition, totalDuration }) => ({
        url: `/voting/elections/${electionId}/video-progress`,
        method: 'POST',
        body: { watchPercentage, lastPosition, totalDuration },
      }),
      invalidatesTags: ['VideoProgress'],
    }),

    // Record abstention
    recordAbstention: builder.mutation({
      query: ({ electionId, questionId, reason }) => ({
        url: `/voting/elections/${electionId}/abstain`,
        method: 'POST',
        body: { questionId, reason },
      }),
      invalidatesTags: ['Vote', 'LiveResults'],
    }),

    // Get vote audit logs
    getVoteAuditLogs: builder.query({
      query: ({ electionId, page = 1, limit = 50 }) => ({
        url: `/voting/elections/${electionId}/audit-logs`,
        params: { page, limit },
      }),
      providesTags: ['VoteAudit'],
    }),

    // ============ NEW ENDPOINTS ============

    // Get live results for an election
    getLiveResults: builder.query({
      query: ({ electionId, questionId }) => {
        let url = `/voting/elections/${electionId}/live-results`;
        if (questionId) {
          url += `?questionId=${questionId}`;
        }
        return url;
      },
      providesTags: ['LiveResults'],
    }),

    // Get election results (after voting ends)
    getElectionResults: builder.query({
      query: (electionId) => `/voting/elections/${electionId}/results`,
      providesTags: ['LiveResults'],
    }),

    // Verify vote
    verifyVote: builder.query({
      query: ({ electionId, receiptId, verificationCode }) => ({
        url: `/voting/elections/${electionId}/verify`,
        params: { receiptId, verificationCode },
      }),
    }),

  }),
});

// ============ EXPORT ALL HOOKS ============
export const {
  // Original exports
  useGetBallotQuery,
  useCastVoteMutation,
  useGetUserVoteQuery,
  useUpdateVideoProgressMutation,
  useRecordAbstentionMutation,
  useGetVotingHistoryQuery,
  useGetVoteAuditLogsQuery,
  // New exports
  useGetLiveResultsQuery,
  useGetElectionResultsQuery,
  useVerifyVoteQuery,
} = votingApi;
// // src/redux/api/voting/votingApi.js
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const VOTING_SERVICE_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api';

// // Helper to get user data from localStorage
// const getUserData = () => {
//   const userDataStr = localStorage.getItem('userData');
//   if (userDataStr) {
//     try {
//       const userData = JSON.parse(userDataStr);
//       return {
//         userId: userData.userId,
//         email: userData.email,
//         phone: userData.phone || null,
//         username: userData.username || null,
//         roles: (userData.roles || ['Voter']).map(role => 
//           role === 'ContentCreator' ? 'Content_Creator' : role
//         ),
//         subscriptionType: userData.subscriptionType || 'Free',
//         isSubscribed: userData.isSubscribed || false
//       };
//     } catch (error) {
//       console.error('Error parsing userData:', error);
//     }
//   }
//   return null;
// };

// export const votingApi = createApi({
//   reducerPath: 'votingApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: VOTING_SERVICE_URL,
//     prepareHeaders: (headers) => {
//       const userData = getUserData();
//       if (userData) {
//         headers.set('x-user-id', userData.userId);
//         headers.set('x-user-data', JSON.stringify(userData));
//       }
//       const token = localStorage.getItem('accessToken');
//       if (token) {
//         headers.set('Authorization', `Bearer ${token}`);
//       }
//       return headers;
//     },
//   }),
//   tagTypes: ['Vote', 'Ballot', 'VideoProgress', 'VoteHistory', 'VoteAudit', 'LiveResults'],
//   endpoints: (builder) => ({
    
//     // ============ ORIGINAL ENDPOINTS ============
    
//     // Get election ballot
//     // ✅ FIXED: Added keepUnusedDataFor: 0 to prevent caching issues with hasVoted
//     getBallot: builder.query({
//       query: (electionId) => `/voting/elections/${electionId}/ballot`,
//       providesTags: (result, error, electionId) => [
//         { type: 'Ballot', id: electionId },
//         'Ballot'
//       ],
//       keepUnusedDataFor: 0, // Don't cache - always fetch fresh data
//     }),

//     // Cast vote
//     castVote: builder.mutation({
//       query: ({ electionId, answers, isAbstention = false }) => ({
//         url: `/voting/elections/${electionId}/vote`,
//         method: 'POST',
//         body: { answers, isAbstention },
//       }),
//       invalidatesTags: ['Vote', 'Ballot', 'VoteHistory', 'LiveResults'],
//     }),

//     // Get user's vote for an election
//     getUserVote: builder.query({
//       query: (electionId) => `/voting/elections/${electionId}/my-vote`,
//       providesTags: ['Vote'],
//     }),
    
//     // Get voting history
//     getVotingHistory: builder.query({
//       query: ({ page = 1, limit = 10 }) => `/voting/history?page=${page}&limit=${limit}`,
//       providesTags: ['VoteHistory'],
//     }),

//     // Update video watch progress
//     updateVideoProgress: builder.mutation({
//       query: ({ electionId, watchPercentage, lastPosition, totalDuration }) => ({
//         url: `/voting/elections/${electionId}/video-progress`,
//         method: 'POST',
//         body: { watchPercentage, lastPosition, totalDuration },
//       }),
//       invalidatesTags: ['VideoProgress'],
//     }),

//     // Record abstention
//     recordAbstention: builder.mutation({
//       query: ({ electionId, questionId, reason }) => ({
//         url: `/voting/elections/${electionId}/abstain`,
//         method: 'POST',
//         body: { questionId, reason },
//       }),
//       invalidatesTags: ['Vote', 'LiveResults'],
//     }),

//     // Get vote audit logs
//     getVoteAuditLogs: builder.query({
//       query: ({ electionId, page = 1, limit = 50 }) => ({
//         url: `/voting/elections/${electionId}/audit-logs`,
//         params: { page, limit },
//       }),
//       providesTags: ['VoteAudit'],
//     }),

//     // ============ NEW ENDPOINTS ============

//     // Get live results for an election
//     getLiveResults: builder.query({
//       query: ({ electionId, questionId }) => {
//         let url = `/voting/elections/${electionId}/live-results`;
//         if (questionId) {
//           url += `?questionId=${questionId}`;
//         }
//         return url;
//       },
//       providesTags: ['LiveResults'],
//     }),

//     // Get election results (after voting ends)
//     getElectionResults: builder.query({
//       query: (electionId) => `/voting/elections/${electionId}/results`,
//       providesTags: ['LiveResults'],
//     }),

//     // Verify vote
//     verifyVote: builder.query({
//       query: ({ electionId, receiptId, verificationCode }) => ({
//         url: `/voting/elections/${electionId}/verify`,
//         params: { receiptId, verificationCode },
//       }),
//     }),

//   }),
// });

// // ============ EXPORT ALL HOOKS ============
// export const {
//   // Original exports
//   useGetBallotQuery,
//   useCastVoteMutation,
//   useGetUserVoteQuery,
//   useUpdateVideoProgressMutation,
//   useRecordAbstentionMutation,
//   useGetVotingHistoryQuery,
//   useGetVoteAuditLogsQuery,
//   // New exports
//   useGetLiveResultsQuery,
//   useGetElectionResultsQuery,
//   useVerifyVoteQuery,
// } = votingApi;
// // src/redux/api/voting/votingApi.js
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const VOTING_SERVICE_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api';

// // Helper to get user data from localStorage
// const getUserData = () => {
//   const userDataStr = localStorage.getItem('userData');
//   if (userDataStr) {
//     try {
//       const userData = JSON.parse(userDataStr);
//       return {
//         userId: userData.userId,
//         email: userData.email,
//         phone: userData.phone || null,
//         username: userData.username || null,
//         roles: (userData.roles || ['Voter']).map(role => 
//           role === 'ContentCreator' ? 'Content_Creator' : role
//         ),
//         subscriptionType: userData.subscriptionType || 'Free',
//         isSubscribed: userData.isSubscribed || false
//       };
//     } catch (error) {
//       console.error('Error parsing userData:', error);
//     }
//   }
//   return null;
// };

// export const votingApi = createApi({
//   reducerPath: 'votingApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: VOTING_SERVICE_URL,
//     prepareHeaders: (headers) => {
//       const userData = getUserData();
//       if (userData) {
//         headers.set('x-user-id', userData.userId);
//         headers.set('x-user-data', JSON.stringify(userData));
//       }
//       const token = localStorage.getItem('accessToken');
//       if (token) {
//         headers.set('Authorization', `Bearer ${token}`);
//       }
//       return headers;
//     },
//   }),
//   tagTypes: ['Vote', 'Ballot', 'VideoProgress', 'VoteHistory', 'VoteAudit', 'LiveResults'],
//   endpoints: (builder) => ({
    
//     // ============ ORIGINAL ENDPOINTS ============
    
//     // Get election ballot
//     // ✅ FIXED: Added keepUnusedDataFor: 0 to prevent caching issues with hasVoted
//     getBallot: builder.query({
//       query: (electionId) => `/voting/elections/${electionId}/ballot`,
//       providesTags: (result, error, electionId) => [
//         { type: 'Ballot', id: electionId },
//         'Ballot'
//       ],
//       keepUnusedDataFor: 0, // Don't cache - always fetch fresh data
//     }),

//     // Cast vote
//     castVote: builder.mutation({
//       query: ({ electionId, answers, isAbstention = false }) => ({
//         url: `/voting/elections/${electionId}/vote`,
//         method: 'POST',
//         body: { answers, isAbstention },
//       }),
//       invalidatesTags: ['Vote', 'Ballot', 'VoteHistory', 'LiveResults'],
//     }),

//     // Get user's vote for an election
//     getUserVote: builder.query({
//       query: (electionId) => `/voting/elections/${electionId}/my-vote`,
//       providesTags: ['Vote'],
//     }),
    
//     // Get voting history
//     getVotingHistory: builder.query({
//       query: ({ page = 1, limit = 10 }) => `/voting/history?page=${page}&limit=${limit}`,
//       providesTags: ['VoteHistory'],
//     }),

//     // Update video watch progress
//     updateVideoProgress: builder.mutation({
//       query: ({ electionId, watchPercentage, lastPosition, totalDuration }) => ({
//         url: `/voting/elections/${electionId}/video-progress`,
//         method: 'POST',
//         body: { watchPercentage, lastPosition, totalDuration },
//       }),
//       invalidatesTags: ['VideoProgress'],
//     }),

//     // Record abstention
//     recordAbstention: builder.mutation({
//       query: ({ electionId, questionId, reason }) => ({
//         url: `/voting/elections/${electionId}/abstain`,
//         method: 'POST',
//         body: { questionId, reason },
//       }),
//       invalidatesTags: ['Vote', 'LiveResults'],
//     }),

//     // Get vote audit logs
//     getVoteAuditLogs: builder.query({
//       query: ({ electionId, page = 1, limit = 50 }) => ({
//         url: `/voting/elections/${electionId}/audit-logs`,
//         params: { page, limit },
//       }),
//       providesTags: ['VoteAudit'],
//     }),

//     // ============ NEW ENDPOINTS ============

//     // Get live results for an election
//     getLiveResults: builder.query({
//       query: ({ electionId, questionId }) => {
//         let url = `/voting/elections/${electionId}/live-results`;
//         if (questionId) {
//           url += `?questionId=${questionId}`;
//         }
//         return url;
//       },
//       providesTags: ['LiveResults'],
//     }),

//     // Get election results (after voting ends)
//     getElectionResults: builder.query({
//       query: (electionId) => `/voting/elections/${electionId}/results`,
//       providesTags: ['LiveResults'],
//     }),

//     // Verify vote
//     verifyVote: builder.query({
//       query: ({ electionId, receiptId, verificationCode }) => ({
//         url: `/voting/elections/${electionId}/verify`,
//         params: { receiptId, verificationCode },
//       }),
//     }),

//   }),
// });

// // ============ EXPORT ALL HOOKS ============
// export const {
//   // Original exports
//   useGetBallotQuery,
//   useCastVoteMutation,
//   useGetUserVoteQuery,
//   useUpdateVideoProgressMutation,
//   useRecordAbstentionMutation,
//   useGetVotingHistoryQuery,
//   useGetVoteAuditLogsQuery,
//   // New exports
//   useGetLiveResultsQuery,
//   useGetElectionResultsQuery,
//   useVerifyVoteQuery,
// } = votingApi;
//last workable code
// // src/redux/api/voting/votingApi.js
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const VOTING_SERVICE_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api';

// // Helper to get user data from localStorage
// const getUserData = () => {
//   const userDataStr = localStorage.getItem('userData');
//   if (userDataStr) {
//     try {
//       const userData = JSON.parse(userDataStr);
//       return {
//         userId: userData.userId,
//         email: userData.email,
//         phone: userData.phone || null,
//         username: userData.username || null,
//         roles: (userData.roles || ['Voter']).map(role => 
//           role === 'ContentCreator' ? 'Content_Creator' : role
//         ),
//         subscriptionType: userData.subscriptionType || 'Free',
//         isSubscribed: userData.isSubscribed || false
//       };
//     } catch (error) {
//       console.error('Error parsing userData:', error);
//     }
//   }
//   return null;
// };

// export const votingApi = createApi({
//   reducerPath: 'votingApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: VOTING_SERVICE_URL,
//     prepareHeaders: (headers) => {
//       const userData = getUserData();
//       if (userData) {
//         headers.set('x-user-id', userData.userId);
//         headers.set('x-user-data', JSON.stringify(userData));
//       }
//       const token = localStorage.getItem('accessToken');
//       if (token) {
//         headers.set('Authorization', `Bearer ${token}`);
//       }
//       return headers;
//     },
//   }),
//   tagTypes: ['Vote', 'Ballot', 'VideoProgress', 'VoteHistory', 'VoteAudit', 'LiveResults'],
//   endpoints: (builder) => ({
    
//     // ============ ORIGINAL ENDPOINTS ============
    
//     // Get election ballot
//     getBallot: builder.query({
//       query: (electionId) => `/voting/elections/${electionId}/ballot`,
//       providesTags: ['Ballot'],
//     }),

//     // Cast vote
//     castVote: builder.mutation({
//       query: ({ electionId, answers, isAbstention = false }) => ({
//         url: `/voting/elections/${electionId}/vote`,
//         method: 'POST',
//         body: { answers, isAbstention },
//       }),
//       invalidatesTags: ['Vote', 'Ballot', 'VoteHistory', 'LiveResults'],
//     }),

//     // Get user's vote for an election
//     getUserVote: builder.query({
//       query: (electionId) => `/voting/elections/${electionId}/my-vote`,
//       providesTags: ['Vote'],
//     }),
    
//     // Get voting history
//     getVotingHistory: builder.query({
//       query: ({ page = 1, limit = 10 }) => `/voting/history?page=${page}&limit=${limit}`,
//       providesTags: ['VoteHistory'],
//     }),

//     // Update video watch progress
//     updateVideoProgress: builder.mutation({
//       query: ({ electionId, watchPercentage, lastPosition, totalDuration }) => ({
//         url: `/voting/elections/${electionId}/video-progress`,
//         method: 'POST',
//         body: { watchPercentage, lastPosition, totalDuration },
//       }),
//       invalidatesTags: ['VideoProgress'],
//     }),

//     // Record abstention
//     recordAbstention: builder.mutation({
//       query: ({ electionId, questionId, reason }) => ({
//         url: `/voting/elections/${electionId}/abstain`,
//         method: 'POST',
//         body: { questionId, reason },
//       }),
//       invalidatesTags: ['Vote', 'LiveResults'],
//     }),

//     // Get vote audit logs
//     getVoteAuditLogs: builder.query({
//       query: ({ electionId, page = 1, limit = 50 }) => ({
//         url: `/voting/elections/${electionId}/audit-logs`,
//         params: { page, limit },
//       }),
//       providesTags: ['VoteAudit'],
//     }),

//     // ============ NEW ENDPOINTS ============

//     // Get live results for an election
//     getLiveResults: builder.query({
//       query: ({ electionId, questionId }) => {
//         let url = `/voting/elections/${electionId}/live-results`;
//         if (questionId) {
//           url += `?questionId=${questionId}`;
//         }
//         return url;
//       },
//       providesTags: ['LiveResults'],
//     }),

//     // Get election results (after voting ends)
//     getElectionResults: builder.query({
//       query: (electionId) => `/voting/elections/${electionId}/results`,
//       providesTags: ['LiveResults'],
//     }),

//     // Verify vote
//     verifyVote: builder.query({
//       query: ({ electionId, receiptId, verificationCode }) => ({
//         url: `/voting/elections/${electionId}/verify`,
//         params: { receiptId, verificationCode },
//       }),
//     }),

//   }),
// });

// // ============ EXPORT ALL HOOKS ============
// export const {
//   // Original exports
//   useGetBallotQuery,
//   useCastVoteMutation,
//   useGetUserVoteQuery,
//   useUpdateVideoProgressMutation,
//   useRecordAbstentionMutation,
//   useGetVotingHistoryQuery,
//   useGetVoteAuditLogsQuery,
//   // New exports
//   useGetLiveResultsQuery,
//   useGetElectionResultsQuery,
//   useVerifyVoteQuery,
// } = votingApi;
