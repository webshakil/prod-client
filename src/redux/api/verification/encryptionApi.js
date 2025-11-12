// src/redux/api/verification/encryptionApi.js
// ✨ Issue #1: End-to-End Encryption Verification
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

export const encryptionApi = createApi({
  reducerPath: 'encryptionApi',
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
  tagTypes: ['EncryptionKeys', 'EncryptionVerification'],
  endpoints: (builder) => ({
    
    // Get election public encryption key
    getPublicKey: builder.query({
      query: (electionId) => `/verification/encryption/public-key/${electionId}`,
      providesTags: ['EncryptionKeys'],
    }),

    // Verify vote encryption
    verifyVoteEncryption: builder.mutation({
      query: ({ electionId, voteHash }) => ({
        url: `/verification/verify/encryption/${electionId}`,
        method: 'POST',
        body: { voteHash },
      }),
      invalidatesTags: ['EncryptionVerification'],
    }),

    // Get encryption verification details
    getEncryptionDetails: builder.query({
      query: ({ electionId, voteHash }) => 
        `/verification/encryption/details/${electionId}?voteHash=${voteHash}`,
      providesTags: ['EncryptionVerification'],
    }),

  }),
});

export const {
  useGetPublicKeyQuery,
  useVerifyVoteEncryptionMutation,
  useGetEncryptionDetailsQuery,
} = encryptionApi;