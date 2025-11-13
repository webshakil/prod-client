// src/redux/api/walllet/electionPaymentApi.js
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

export const electionPaymentApi = createApi({
  reducerPath: 'electionPaymentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: VOTING_SERVICE_URL,
    prepareHeaders: (headers) => {
      console.log('🔧 electionPaymentApi prepareHeaders called');
      
      const userData = getUserData();
      
      if (userData) {
        // ✅ Add x-user-data header with full user info
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
        
        console.log('📤 Setting x-user-data header:', headerData);
        
        headers.set('x-user-data', JSON.stringify(headerData));
        headers.set('x-user-id', userData.userId);
      } else {
        console.error('❌ No userData found in localStorage!');
      }
      
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      console.log('📋 Final headers:', Object.fromEntries(headers.entries()));
      
      return headers;
    },
  }),
  tagTypes: ['ElectionPayment', 'PaymentStatus', 'VoteEligibility'],
  endpoints: (builder) => ({
    
    // Pay for election participation
    payForElection: builder.mutation({
      query: ({ electionId, regionCode }) => {
        console.log('🔵 Calling POST /wallet/pay-election:', { electionId, regionCode });
        return {
          url: `/wallet/pay-election`,
          method: 'POST',
          body: {
            electionId,
            regionCode,
          },
        };
      },
      invalidatesTags: ['ElectionPayment'],
    }),

    // Confirm election payment (webhook callback)
    confirmElectionPayment: builder.mutation({
      query: ({ paymentIntentId, electionId }) => ({
        url: `/wallet/election-payment/confirm`,
        method: 'POST',
        body: {
          paymentIntentId,
          electionId,
        },
      }),
      invalidatesTags: ['ElectionPayment', 'PaymentStatus'],
    }),

    // Check payment status for election
    checkElectionPaymentStatus: builder.query({
      query: (electionId) => {
        console.log('🔵 Calling GET /wallet/election-payment/status/' + electionId);
        return `/wallet/election-payment/status/${electionId}`;
      },
      providesTags: (result, error, electionId) => [
        { type: 'PaymentStatus', id: electionId }
      ],
    }),

    // Check if user can vote
    checkCanVote: builder.query({
      query: (electionId) => {
        console.log('🔵 Calling GET /wallet/can-vote/' + electionId);
        return `/wallet/can-vote/${electionId}`;
      },
      providesTags: (result, error, electionId) => [
        { type: 'VoteEligibility', id: electionId }
      ],
    }),

  }),
});

export const {
  usePayForElectionMutation,
  useConfirmElectionPaymentMutation,
  useCheckElectionPaymentStatusQuery,
  useCheckCanVoteQuery
} = electionPaymentApi;
// // src/redux/api/walllet/electionPaymentApi.js
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const VOTING_SERVICE_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:5003/api';

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

// export const electionPaymentApi = createApi({
//   reducerPath: 'electionPaymentApi',
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
//   tagTypes: ['ElectionPayment', 'PaymentStatus'],
//   endpoints: (builder) => ({
    
//     // Pay for election participation
//     payForElection: builder.mutation({
//       query: ({ electionId, regionCode }) => ({
//         url: `/wallet/pay-election`,
//         method: 'POST',
//         body: {
//           electionId,
//           regionCode,
//         },
//       }),
//       invalidatesTags: ['ElectionPayment'],
//     }),

//     // Confirm election payment (webhook callback)
//     confirmElectionPayment: builder.mutation({
//       query: ({ paymentIntentId, electionId }) => ({
//         url: `/wallet/election-payment/confirm`,
//         method: 'POST',
//         body: {
//           paymentIntentId,
//           electionId,
//         },
//       }),
//       invalidatesTags: ['ElectionPayment', 'PaymentStatus', 'Wallet', 'BlockedAccounts'],
//     }),

//     // Check payment status for election
//     checkElectionPaymentStatus: builder.query({
//       query: (electionId) => `/wallet/election-payment/status/${electionId}`,
//       providesTags: ['PaymentStatus'],
//     }),

//       checkCanVote: builder.query({
//       query: (electionId) => `/wallet/can-vote/${electionId}`,
//       providesTags: ['VoteEligibility'],
//     }),

//   }),
// });

// export const {
//   usePayForElectionMutation,
//   useConfirmElectionPaymentMutation,
//   useCheckElectionPaymentStatusQuery,
//   useCheckCanVoteQuery
// } = electionPaymentApi;