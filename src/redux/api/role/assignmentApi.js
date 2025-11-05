// src/redux/api/role/assignmentApi.js
// ✅ COMPLETE FILE WITH FIX

import axios from 'axios';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const ROLE_SERVICE_BASE_URL = import.meta.env.VITE_ROLE_SERVICE_URL || 'http://localhost:3004/api';

// ✅ Create axios instance
const assignmentAPI = axios.create({
  baseURL: ROLE_SERVICE_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ Request interceptor to add user data
assignmentAPI.interceptors.request.use(
  (config) => {
    const userDataStr = localStorage.getItem('userData');
    
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        
        config.headers['x-user-data'] = JSON.stringify({
          userId: userData.userId,
          email: userData.email,
          phone: userData.phone || null,
          username: userData.username || null,
          roles: (userData.roles || ['Voter']).map(role => 
            role === 'ContentCreator' ? 'Content_Creator' : role
          ),
          subscriptionType: userData.subscriptionType || 'Free',
          isSubscribed: userData.isSubscribed || false
        });

        config.headers['x-user-id'] = userData.userId;
      } catch (error) {
        console.error('Error parsing userData:', error);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Export axios instance
export { assignmentAPI };

// ✅ RTK Query API
export const assignmentApi = createApi({
  reducerPath: 'assignmentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: ROLE_SERVICE_BASE_URL,
    prepareHeaders: (headers) => {
      const userDataStr = localStorage.getItem('userData');
      
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          
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
        } catch (error) {
          console.error('Error parsing userData:', error);
        }
      }
      
      // ✅ DON'T manually set Content-Type - RTK Query handles it
      return headers;
    },
  }),
  tagTypes: ['Assignment', 'AssignmentHistory'],
  endpoints: (builder) => ({
    // Assign default role
    assignDefaultRole: builder.mutation({
      query: (userId) => ({
        url: '/assignments/default',
        method: 'POST',
        body: { userId },
      }),
      invalidatesTags: (result, error, userId) => [
        { type: 'Assignment', id: userId },
      ],
    }),

    // ✅ Assign role to user - FIXED
    assignRole: builder.mutation({
      query: (data) => {
        console.log('🔥🔥🔥 assignRole MUTATION CALLED 🔥🔥🔥');
        console.log('📦 Input data:', data);
        console.log('📦 Data type:', typeof data);
        console.log('📦 Data keys:', Object.keys(data || {}));
        console.log('📦 Stringified:', JSON.stringify(data));
        
        // ✅ Return plain object - RTK Query will handle serialization
        return {
          url: '/assignments',
          method: 'POST',
          body: data, // ✅ Pass as plain object, not stringified
        };
      },
      invalidatesTags: (result, error, args) => [
        { type: 'Assignment', id: args?.user_id },
        'Assignment',
      ],
    }),

    // ✅ Deactivate role assignment - FIXED
    deactivateRoleAssignment: builder.mutation({
      query: ({ user_id, role_name, reason }) => {
        console.log('🔥 Deactivating:', { user_id, role_name, reason });
        return {
          url: '/assignments/deactivate',
          method: 'POST',
          body: { user_id, role_name, reason },
        };
      },
      invalidatesTags: ['Assignment'],
    }),

    // Get user role history
    getUserRoleHistory: builder.query({
      query: ({ userId, ...filters }) => {
        const params = new URLSearchParams();
        if (filters.action) params.append('action', filters.action);
        if (filters.role_id) params.append('role_id', filters.role_id);
        if (filters.limit) params.append('limit', filters.limit);
        return `/users/${userId}/assignment-history?${params.toString()}`;
      },
      providesTags: (result, error, { userId }) => [
        { type: 'AssignmentHistory', id: userId },
      ],
    }),

    // Get all role assignments
    getRoleAssignments: builder.query({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.user_id) params.append('user_id', filters.user_id);
        if (filters.role_id) params.append('role_id', filters.role_id);
        if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
        if (filters.assignment_type) params.append('assignment_type', filters.assignment_type);
        return `/assignments?${params.toString()}`;
      },
      providesTags: ['Assignment'],
    }),

    // Handle action trigger
    handleActionTrigger: builder.mutation({
      query: (data) => ({
        url: '/assignments/action-trigger',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'Assignment', id: userId },
      ],
    }),

    // Handle subscription change
    handleSubscriptionChange: builder.mutation({
      query: (data) => ({
        url: '/assignments/subscription-change',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'Assignment', id: userId },
      ],
    }),

    deleteRoleAssignment: builder.mutation({
  query: ({ user_id, role_name }) => {
    console.log('🗑️ API: Deleting role assignment:', { user_id, role_name });
    return {
      url: '/assignments',
      method: 'DELETE',
      body: { user_id, role_name },
    };
  },
  invalidatesTags: ['Assignment'],
})
  }),
});

export const {
  useAssignDefaultRoleMutation,
  useAssignRoleMutation,
  useDeactivateRoleAssignmentMutation,
  useGetUserRoleHistoryQuery,
  useGetRoleAssignmentsQuery,
  useHandleActionTriggerMutation,
  useHandleSubscriptionChangeMutation,
  useDeleteRoleAssignmentMutation
} = assignmentApi;

export default assignmentApi;
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const ROLE_SERVICE_BASE_URL = import.meta.env.VITE_ROLE_SERVICE_URL || 'http://localhost:3004/api';

// export const assignmentApi = createApi({
//   reducerPath: 'assignmentApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: ROLE_SERVICE_BASE_URL,
//     prepareHeaders: (headers, { getState }) => {
//       const state = getState();
//       const userId = state.auth?.userId || localStorage.getItem('userId');
//       const token = state.auth?.accessToken || localStorage.getItem('accessToken');
      
//       if (userId) {
//         headers.set('x-user-id', userId);
//       }
      
//       if (token) {
//         headers.set('Authorization', `Bearer ${token}`);
//       }
      
//       headers.set('Content-Type', 'application/json');
//       return headers;
//     },
//   }),
//   tagTypes: ['Assignment', 'AssignmentHistory'],
//   endpoints: (builder) => ({
//     // Assign default role (System call)
//     assignDefaultRole: builder.mutation({
//       query: (userId) => ({
//         url: '/assignments/default',
//         method: 'POST',
//         body: { userId },
//       }),
//       invalidatesTags: (result, error, userId) => [
//         { type: 'Assignment', id: userId },
//       ],
//     }),

//     // Assign role to user
//     assignRole: builder.mutation({
//       query: (assignmentData) => ({
//         url: '/assignments',
//         method: 'POST',
//         body: assignmentData,
//       }),
//       invalidatesTags: (result, error, { userId }) => [
//         { type: 'Assignment', id: userId },
//         'Assignment',
//       ],
//     }),

//     // Deactivate role assignment
//     deactivateRoleAssignment: builder.mutation({
//       query: ({ assignmentId, reason }) => ({
//         url: `/assignments/${assignmentId}`,
//         method: 'DELETE',
//         body: { reason },
//       }),
//       invalidatesTags: ['Assignment'],
//     }),

//     // Get user role history
//     getUserRoleHistory: builder.query({
//       query: ({ userId, ...filters }) => {
//         const params = new URLSearchParams();
//         if (filters.action) params.append('action', filters.action);
//         if (filters.role_id) params.append('role_id', filters.role_id);
//         if (filters.limit) params.append('limit', filters.limit);
//         return `/users/${userId}/assignment-history?${params.toString()}`;
//       },
//       providesTags: (result, error, { userId }) => [
//         { type: 'AssignmentHistory', id: userId },
//       ],
//     }),

//     // Get all role assignments
//     getRoleAssignments: builder.query({
//       query: (filters = {}) => {
//         const params = new URLSearchParams();
//         if (filters.user_id) params.append('user_id', filters.user_id);
//         if (filters.role_id) params.append('role_id', filters.role_id);
//         if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
//         if (filters.assignment_type) params.append('assignment_type', filters.assignment_type);
//         return `/assignments?${params.toString()}`;
//       },
//       providesTags: ['Assignment'],
//     }),

//     // Handle action trigger
//     handleActionTrigger: builder.mutation({
//       query: (data) => ({
//         url: '/assignments/action-trigger',
//         method: 'POST',
//         body: data,
//       }),
//       invalidatesTags: (result, error, { userId }) => [
//         { type: 'Assignment', id: userId },
//       ],
//     }),

//     // Handle subscription change
//     handleSubscriptionChange: builder.mutation({
//       query: (data) => ({
//         url: '/assignments/subscription-change',
//         method: 'POST',
//         body: data,
//       }),
//       invalidatesTags: (result, error, { userId }) => [
//         { type: 'Assignment', id: userId },
//       ],
//     }),
//   }),
// });

// export const {
//   useAssignDefaultRoleMutation,
//   useAssignRoleMutation,
//   useDeactivateRoleAssignmentMutation,
//   useGetUserRoleHistoryQuery,
//   useGetRoleAssignmentsQuery,
//   useHandleActionTriggerMutation,
//   useHandleSubscriptionChangeMutation,
// } = assignmentApi;