// src/redux/api/verification/verificationApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const VOTING_SERVICE_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:5003/api';

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

export const verificationApi = createApi({
  reducerPath: 'verificationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: VOTING_SERVICE_URL,
    prepareHeaders: (headers) => {
      // Get user data
      const userData = getUserData();
      
      if (userData) {
        // Add x-user-id header
        headers.set('x-user-id', userData.userId);
        
        // Add x-user-data header (matching axios interceptor pattern)
        headers.set('x-user-data', JSON.stringify(userData));
      }
      
      // Add authorization token
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  tagTypes: ['Verification', 'Receipt', 'Hash', 'BulletinBoard', 'UserVerifications', 'AnonymousVerification'],
  endpoints: (builder) => ({
    
    // Verify vote by receipt ID (Issue #2 - Public)
    verifyByReceipt: builder.query({
      query: (receiptId) => `/verification/verify/receipt/${receiptId}`,
      providesTags: ['Receipt'],
    }),

    // Verify vote by hash (Issue #2 - Public)
    verifyByHash: builder.query({
      query: (voteHash) => `/verification/verify/hash/${voteHash}`,
      providesTags: ['Hash'],
    }),

    // Get public bulletin board for election (Issue #2)
    getPublicBulletinBoard: builder.query({
      query: ({ electionId, page = 1, limit = 50 }) => 
        `/verification/verify/bulletin-board/${electionId}?page=${page}&limit=${limit}`,
      providesTags: ['BulletinBoard'],
    }),

    // ✅ NEW: Verify anonymous vote with zero-knowledge proof (Issue #3)
    verifyAnonymousVote: builder.mutation({
      query: ({ receiptId, voteToken, verificationCode }) => ({
        url: `/verification/verify/anonymous-vote`,
        method: 'POST',
        body: { receiptId, voteToken, verificationCode },
      }),
      invalidatesTags: ['AnonymousVerification'],
    }),

    // Verify encryption (Issue #1 - Authenticated)
    verifyEncryption: builder.mutation({
      query: ({ electionId, voteHash }) => ({
        url: `/verification/verify/encryption/${electionId}`,
        method: 'POST',
        body: { voteHash },
      }),
      invalidatesTags: ['Verification'],
    }),

    // Get user's verification data
    getMyVerificationData: builder.query({
      query: (electionId) => `/verification/verify/my-vote/${electionId}`,
      providesTags: ['Verification'],
    }),

    // Get all user verifications
    getUserVerifications: builder.query({
      query: () => `/verification/verify/my-verifications`,
      providesTags: ['UserVerifications'],
    }),

  }),
});

export const {
  useVerifyByReceiptQuery,
  useVerifyByHashQuery,
  useGetPublicBulletinBoardQuery,
  useVerifyAnonymousVoteMutation,
  useVerifyEncryptionMutation,
  useGetMyVerificationDataQuery,
  useGetUserVerificationsQuery,
} = verificationApi;
// // src/redux/api/verification/verificationApi.js
// // ✨ Issues #1, #2, #3 implementation
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

// export const verificationApi = createApi({
//   reducerPath: 'verificationApi',
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
//   tagTypes: ['Verification', 'Receipt', 'Hash', 'BulletinBoard', 'UserVerifications'],
//   endpoints: (builder) => ({
    
//     // Verify vote by receipt ID (Issue #2 - Public)
//     verifyByReceipt: builder.query({
//       query: (receiptId) => `/verification/verify/receipt/${receiptId}`,
//       providesTags: ['Receipt'],
//     }),

//     // Verify vote by hash (Issue #2 - Public)
//     verifyByHash: builder.query({
//       query: (voteHash) => `/verification/verify/hash/${voteHash}`,
//       providesTags: ['Hash'],
//     }),

//     // Verify encryption (Issue #1 - Authenticated)
//     verifyEncryption: builder.mutation({
//       query: ({ electionId, voteHash }) => ({
//         url: `/verification/verify/encryption/${electionId}`,
//         method: 'POST',
//         body: { voteHash },
//       }),
//       invalidatesTags: ['Verification'],
//     }),

//     // Get user's verification data
//     getMyVerificationData: builder.query({
//       query: (electionId) => `/verification/verify/my-vote/${electionId}`,
//       providesTags: ['Verification'],
//     }),

//     // Get public bulletin board for election (Issue #2)
//     getPublicBulletinBoard: builder.query({
//       query: ({ electionId, page = 1, limit = 50 }) => 
//         `/verification/verify/bulletin-board/${electionId}?page=${page}&limit=${limit}`,
//       providesTags: ['BulletinBoard'],
//     }),

//     // Get all user verifications
//     getUserVerifications: builder.query({
//       query: () => `/verification/verify/my-verifications`,
//       providesTags: ['UserVerifications'],
//     }),

//   }),
// });

// export const {
//   useVerifyByReceiptQuery,
//   useVerifyByHashQuery,
//   useVerifyEncryptionMutation,
//   useGetMyVerificationDataQuery,
//   useGetPublicBulletinBoardQuery,
//   useGetUserVerificationsQuery,
// } = verificationApi;