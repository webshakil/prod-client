// src/redux/api/verification/auditTrailApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const VOTING_SERVICE_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api';

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

export const auditTrailApi = createApi({
  reducerPath: 'auditTrailApi',
  baseQuery: fetchBaseQuery({
    baseUrl: VOTING_SERVICE_URL,
    prepareHeaders: (headers) => {
      const userData = getUserData();
      if (userData) {
        headers.set('x-user-id', userData.userId?.toString());
        headers.set('x-user-data', JSON.stringify(userData));
      }
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['AuditLogs', 'AuditStats', 'HashChain', 'Integrity', 'Verifications'],
  endpoints: (builder) => ({
    
    // Get audit trail logs with filters
    getAuditLogs: builder.query({
      query: ({ electionId, page = 1, limit = 20, actionType, startDate, endDate, userId }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (electionId) params.append('electionId', electionId);
        if (actionType) params.append('actionType', actionType);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (userId) params.append('userId', userId);
        
        return `/verification/audit/logs?${params.toString()}`;
      },
      providesTags: ['AuditLogs'],
    }),

    // Get audit trail for specific election
    getElectionAuditLogs: builder.query({
      query: ({ electionId, page = 1, limit = 50 }) => 
        `/verification/audit/logs/${electionId}?page=${page}&limit=${limit}`,
      providesTags: ['AuditLogs'],
    }),

    // Get audit statistics
    getAuditStats: builder.query({
      query: (electionId) => 
        `/verification/audit/stats${electionId ? `?electionId=${electionId}` : ''}`,
      providesTags: ['AuditStats'],
    }),

    // Get hash chain for election
    getHashChain: builder.query({
      query: ({ electionId, limit = 100 }) => 
        `/verification/audit/hash-chain/${electionId}?limit=${limit}`,
      providesTags: ['HashChain'],
    }),

    // Verify audit trail integrity
    verifyIntegrity: builder.query({
      query: (electionId) => `/verification/audit/verify/${electionId}`,
      providesTags: ['Integrity'],
    }),

    // Export audit trail
    exportAuditTrail: builder.query({
      query: ({ electionId, format = 'json', startDate, endDate }) => {
        const params = new URLSearchParams({ format });
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return `/verification/audit/export/${electionId}?${params.toString()}`;
      },
    }),

    // Get vote verifications
    getVoteVerifications: builder.query({
      query: ({ electionId, page = 1, limit = 50 }) => 
        `/verification/audit/verifications${electionId ? `/${electionId}` : ''}?page=${page}&limit=${limit}`,
      providesTags: ['Verifications'],
    }),

  }),
});

export const {
  useGetAuditLogsQuery,
  useGetElectionAuditLogsQuery,
  useGetAuditStatsQuery,
  useGetHashChainQuery,
  useVerifyIntegrityQuery,
  useLazyVerifyIntegrityQuery,
  useLazyExportAuditTrailQuery,
  useGetVoteVerificationsQuery,
  useLazyGetHashChainQuery,
} = auditTrailApi;
// // src/redux/api/verification/auditTrailApi.js
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const VOTING_SERVICE_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api';

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

// export const auditTrailApi = createApi({
//   reducerPath: 'auditTrailApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: VOTING_SERVICE_URL,
//     prepareHeaders: (headers) => {
//       const userData = getUserData();
//       if (userData) {
//         headers.set('x-user-id', userData.userId?.toString());
//         headers.set('x-user-data', JSON.stringify(userData));
//       }
//       const token = localStorage.getItem('accessToken');
//       if (token) {
//         headers.set('Authorization', `Bearer ${token}`);
//       }
//       return headers;
//     },
//   }),
//   tagTypes: ['AuditLogs', 'AuditStats', 'HashChain', 'Integrity', 'Verifications'],
//   endpoints: (builder) => ({
    
//     // Get audit trail logs with filters
//     getAuditLogs: builder.query({
//       query: ({ electionId, page = 1, limit = 20, actionType, startDate, endDate, userId }) => {
//         const params = new URLSearchParams({
//           page: page.toString(),
//           limit: limit.toString(),
//         });
//         if (electionId) params.append('electionId', electionId);
//         if (actionType) params.append('actionType', actionType);
//         if (startDate) params.append('startDate', startDate);
//         if (endDate) params.append('endDate', endDate);
//         if (userId) params.append('userId', userId);
        
//         return `/verification/audit/logs?${params.toString()}`;
//       },
//       providesTags: ['AuditLogs'],
//     }),

//     // Get audit trail for specific election
//     getElectionAuditLogs: builder.query({
//       query: ({ electionId, page = 1, limit = 50 }) => 
//         `/verification/audit/logs/${electionId}?page=${page}&limit=${limit}`,
//       providesTags: ['AuditLogs'],
//     }),

//     // Get audit statistics
//     getAuditStats: builder.query({
//       query: (electionId) => 
//         `/verification/audit/stats${electionId ? `?electionId=${electionId}` : ''}`,
//       providesTags: ['AuditStats'],
//     }),

//     // Get hash chain for election
//     getHashChain: builder.query({
//       query: ({ electionId, limit = 100 }) => 
//         `/verification/audit/hash-chain/${electionId}?limit=${limit}`,
//       providesTags: ['HashChain'],
//     }),

//     // Verify audit trail integrity
//     verifyIntegrity: builder.query({
//       query: (electionId) => `/verification/audit/verify/${electionId}`,
//       providesTags: ['Integrity'],
//     }),

//     // Export audit trail
//     exportAuditTrail: builder.query({
//       query: ({ electionId, format = 'json', startDate, endDate }) => {
//         const params = new URLSearchParams({ format });
//         if (startDate) params.append('startDate', startDate);
//         if (endDate) params.append('endDate', endDate);
//         return `/verification/audit/export/${electionId}?${params.toString()}`;
//       },
//     }),

//     // Get vote verifications
//     getVoteVerifications: builder.query({
//       query: ({ electionId, page = 1, limit = 50 }) => 
//         `/verification/audit/verifications${electionId ? `/${electionId}` : ''}?page=${page}&limit=${limit}`,
//       providesTags: ['Verifications'],
//     }),

//   }),
// });

// export const {
//   useGetAuditLogsQuery,
//   useGetElectionAuditLogsQuery,
//   useGetAuditStatsQuery,
//   useGetHashChainQuery,
//   useVerifyIntegrityQuery,
//   useLazyVerifyIntegrityQuery,
//   useLazyExportAuditTrailQuery,
//   useGetVoteVerificationsQuery,
//   useLazyGetHashChainQuery,
// } = auditTrailApi;
// // src/redux/api/verification/auditTrailApi.js
// // ✨ Issue #3: Election Process Auditability
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

// export const auditTrailApi = createApi({
//   reducerPath: 'auditTrailApi',
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
//   tagTypes: ['AuditTrail', 'Integrity'],
//   endpoints: (builder) => ({
    
//     // Get audit trail for election
//     getAuditTrail: builder.query({
//       query: ({ electionId, page = 1, limit = 50 }) => 
//         `/verification/verify/audit-trail/${electionId}?page=${page}&limit=${limit}`,
//       providesTags: ['AuditTrail'],
//     }),

//     // Verify audit trail integrity
//     verifyAuditTrailIntegrity: builder.query({
//       query: (electionId) => `/verification/verify/audit-trail/${electionId}/integrity`,
//       providesTags: ['Integrity'],
//     }),

//     // Export audit trail
//     exportAuditTrail: builder.query({
//       query: ({ electionId, format = 'json' }) => 
//         `/verification/verify/audit-trail/${electionId}/export?format=${format}`,
//     }),

//   }),
// });

// export const {
//   useGetAuditTrailQuery,
//   useVerifyAuditTrailIntegrityQuery,
//   useLazyExportAuditTrailQuery,
// } = auditTrailApi;