// src/redux/api/verification/auditTrailApi.js
// ✨ Issue #3: Election Process Auditability
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

export const auditTrailApi = createApi({
  reducerPath: 'auditTrailApi',
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
  tagTypes: ['AuditTrail', 'Integrity'],
  endpoints: (builder) => ({
    
    // Get audit trail for election
    getAuditTrail: builder.query({
      query: ({ electionId, page = 1, limit = 50 }) => 
        `/verification/verify/audit-trail/${electionId}?page=${page}&limit=${limit}`,
      providesTags: ['AuditTrail'],
    }),

    // Verify audit trail integrity
    verifyAuditTrailIntegrity: builder.query({
      query: (electionId) => `/verification/verify/audit-trail/${electionId}/integrity`,
      providesTags: ['Integrity'],
    }),

    // Export audit trail
    exportAuditTrail: builder.query({
      query: ({ electionId, format = 'json' }) => 
        `/verification/verify/audit-trail/${electionId}/export?format=${format}`,
    }),

  }),
});

export const {
  useGetAuditTrailQuery,
  useVerifyAuditTrailIntegrityQuery,
  useLazyExportAuditTrailQuery,
} = auditTrailApi;