// src/redux/api/role/roleApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const ROLE_SERVICE_BASE_URL = import.meta.env.VITE_ROLE_SERVICE_URL || 'http://localhost:5004/api';

export const roleApi = createApi({
  reducerPath: 'roleApi',
  baseQuery: fetchBaseQuery({
    baseUrl: ROLE_SERVICE_BASE_URL,
    prepareHeaders: (headers) => {
      // ✅ Get userData from localStorage
      const userDataStr = localStorage.getItem('userData');
      
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          
          // ✅ CRITICAL: Add x-user-id header (backend expects this!)
          if (userData.userId) {
            headers.set('x-user-id', userData.userId.toString());
          }
        } catch (error) {
          console.error('❌ Error parsing userData:', error);
        }
      }
      
      headers.set('Content-Type', 'application/json');
      
      return headers;
    },
  }),
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: 30,
  tagTypes: ['Role', 'UserRoles', 'RolePermissions', 'RoleAssignments', 'Permission'],
  endpoints: (builder) => ({
    // ==================== ROLE ENDPOINTS ====================
    
    // Get all roles
    getAllRoles: builder.query({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.role_type) params.append('role_type', filters.role_type);
        if (filters.role_category) params.append('role_category', filters.role_category);
        if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
        return `/roles?${params.toString()}`;
      },
      providesTags: ['Role'],
    }),

    // Get single role
    getRole: builder.query({
      query: (roleId) => `/roles/${roleId}`,
      providesTags: (result, error, roleId) => [{ type: 'Role', id: roleId }],
    }),

    // Create role
    createRole: builder.mutation({
      query: (roleData) => ({
        url: '/roles',
        method: 'POST',
        body: roleData,
      }),
      invalidatesTags: ['Role'],
    }),

    // Update role
    updateRole: builder.mutation({
      query: ({ roleId, ...roleData }) => ({
        url: `/roles/${roleId}`,
        method: 'PUT',
        body: roleData,
      }),
      invalidatesTags: ['Role'],
    }),

    // Delete role
    deleteRole: builder.mutation({
      query: (roleId) => ({
        url: `/roles/${roleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Role'],
    }),

    // ==================== USER ROLE ENDPOINTS ====================

    // Get user's roles
    getUserRoles: builder.query({
      query: (userId) => `/users/${userId}/roles`,
      providesTags: (result, error, userId) => [
        { type: 'UserRoles', id: userId },
      ],
    }),

    // ==================== ROLE ASSIGNMENT ENDPOINTS ====================

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
      providesTags: ['RoleAssignments'],
    }),

    // Assign role to user
    assignRole: builder.mutation({
      query: ({ userId, roleId, assignmentData }) => ({
        url: `/assignments`,
        method: 'POST',
        body: {
          user_id: userId,
          role_id: roleId,
          ...assignmentData,
        },
      }),
      invalidatesTags: ['RoleAssignments', 'UserRoles'],
    }),

    // Deactivate role assignment
    deactivateRoleAssignment: builder.mutation({
      query: ({ assignmentId, reason }) => ({
        url: `/assignments/${assignmentId}/deactivate`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['RoleAssignments', 'UserRoles'],
    }),

    // Get user's role assignment history
    getUserRoleHistory: builder.query({
      query: ({ userId, filters = {} }) => {
        const params = new URLSearchParams();
        if (filters.action) params.append('action', filters.action);
        if (filters.role_id) params.append('role_id', filters.role_id);
        if (filters.limit) params.append('limit', filters.limit);
        return `/users/${userId}/assignment-history?${params.toString()}`;
      },
    }),

    // ==================== PERMISSION ENDPOINTS ====================

    // Get all permissions
    getAllPermissions: builder.query({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.resource) params.append('resource', filters.resource);
        if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
        return `/permissions?${params.toString()}`;
      },
      providesTags: ['Permission'],
    }),

    // Create permission
    createPermission: builder.mutation({
      query: (permissionData) => ({
        url: '/permissions',
        method: 'POST',
        body: permissionData,
      }),
      invalidatesTags: ['Permission'],
    }),

    // Update permission
    updatePermission: builder.mutation({
      query: ({ permissionId, ...permissionData }) => ({
        url: `/permissions/${permissionId}`,
        method: 'PUT',
        body: permissionData,
      }),
      invalidatesTags: ['Permission'],
    }),

    // Delete permission
    deletePermission: builder.mutation({
      query: (permissionId) => ({
        url: `/permissions/${permissionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Permission'],
    }),

    // ==================== ROLE PERMISSION ENDPOINTS ====================

    // Get role's permissions
    getRolePermissions: builder.query({
      query: (roleId) => `/roles/${roleId}/permissions`,
      providesTags: (result, error, roleId) => [
        { type: 'RolePermissions', id: roleId },
      ],
    }),

    // Assign permission to role
    assignPermission: builder.mutation({
      query: ({ roleId, permissionId }) => ({
        url: `/roles/${roleId}/permissions`,
        method: 'POST',
        body: { permission_id: permissionId },
      }),
      invalidatesTags: ['RolePermissions'],
    }),

    // Remove permission from role
    removePermission: builder.mutation({
      query: ({ roleId, permissionId }) => ({
        url: `/roles/${roleId}/permissions/${permissionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RolePermissions'],
    }),

    // Get user's permissions
    getUserPermissions: builder.query({
      query: (userId) => `/users/${userId}/permissions`,
      providesTags: (result, error, userId) => [
        { type: 'UserRoles', id: userId },
      ],
    }),

    // ==================== USER SEARCH ENDPOINT ====================

    // Search users
    searchUsers: builder.query({
      query: (searchTerm) => `/users/search?q=${encodeURIComponent(searchTerm)}`,
    }),
  }),
});

// ✅ Export hooks
export const {
  // Role hooks
  useGetAllRolesQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  
  // User role hooks
  useGetUserRolesQuery,
  
  // Assignment hooks
  useGetRoleAssignmentsQuery,
  useAssignRoleMutation,
  useDeactivateRoleAssignmentMutation,
  useGetUserRoleHistoryQuery,
  
  // Permission hooks
  useGetAllPermissionsQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
  
  // Role permission hooks
  useGetRolePermissionsQuery,
  useAssignPermissionMutation,
  useRemovePermissionMutation,
  useGetUserPermissionsQuery,
  
  // User search hook
  useSearchUsersQuery,
} = roleApi;

export default roleApi;
// // src/redux/api/role/roleApi.js
// // ✅ COMPLETE FILE WITH BOTH AXIOS AND RTK QUERY

// import axios from 'axios';
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const ROLE_SERVICE_BASE_URL = import.meta.env.VITE_ROLE_SERVICE_URL || 'http://localhost:5004/api';

// // ✅ Create axios instance for role service
// const roleAPI = axios.create({
//   baseURL: ROLE_SERVICE_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json'
//   }
// });

// // ✅ Request interceptor to add user data
// roleAPI.interceptors.request.use(
//   (config) => {
//     // Get user data from localStorage
//     const userDataStr = localStorage.getItem('userData');
    
//     if (userDataStr) {
//       try {
//         const userData = JSON.parse(userDataStr);
        
//         // Add x-user-data header
//         config.headers['x-user-data'] = JSON.stringify({
//           userId: userData.userId,
//           email: userData.email,
//           phone: userData.phone || null,
//           username: userData.username || null,
//           roles: (userData.roles || ['Voter']).map(role => 
//             role === 'ContentCreator' ? 'Content_Creator' : role
//           ),
//           subscriptionType: userData.subscriptionType || 'Free',
//           isSubscribed: userData.isSubscribed || false
//         });

//         // Also add x-user-id header for backend compatibility
//         config.headers['x-user-id'] = userData.userId;
//       } catch (error) {
//         console.error('Error parsing userData:', error);
//       }
//     }
    
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // ✅ Export axios instance for direct API calls
// export { roleAPI };

// // ✅ RTK Query API
// export const roleApi = createApi({
//   reducerPath: 'roleApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: ROLE_SERVICE_BASE_URL,
//     prepareHeaders: (headers) => {
//       // Get user data from localStorage
//       const userDataStr = localStorage.getItem('userData');
      
//       if (userDataStr) {
//         try {
//           const userData = JSON.parse(userDataStr);
          
//           // Add x-user-data header
//           headers.set('x-user-data', JSON.stringify({
//             userId: userData.userId,
//             email: userData.email,
//             phone: userData.phone || null,
//             username: userData.username || null,
//             roles: (userData.roles || ['Voter']).map(role => 
//               role === 'ContentCreator' ? 'Content_Creator' : role
//             ),
//             subscriptionType: userData.subscriptionType || 'Free',
//             isSubscribed: userData.isSubscribed || false
//           }));

//           // Also add x-user-id header for backend compatibility
//           headers.set('x-user-id', userData.userId);
//         } catch (error) {
//           console.error('Error parsing userData:', error);
//         }
//       }
      
//       headers.set('Content-Type', 'application/json');
      
//       return headers;
//     },
//   }),
//   refetchOnReconnect: true,
//   refetchOnMountOrArgChange: 30,
//   tagTypes: ['Role', 'UserRoles', 'RolePermissions', 'RoleAssignments', 'Permission'],
//   endpoints: (builder) => ({
//     // ==================== ROLE ENDPOINTS ====================
    
//     // Get all roles
//     getAllRoles: builder.query({
//       query: (filters = {}) => {
//         const params = new URLSearchParams();
//         if (filters.role_type) params.append('role_type', filters.role_type);
//         if (filters.role_category) params.append('role_category', filters.role_category);
//         if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
//         return `/roles?${params.toString()}`;
//       },
//       providesTags: ['Role'],
//     }),

//     // Get single role
//     getRole: builder.query({
//       query: (roleId) => `/roles/${roleId}`,
//       providesTags: (result, error, roleId) => [{ type: 'Role', id: roleId }],
//     }),

//     // Create role
//     createRole: builder.mutation({
//       query: (roleData) => ({
//         url: '/roles',
//         method: 'POST',
//         body: roleData,
//       }),
//       invalidatesTags: ['Role'],
//     }),

//     // Update role
//     updateRole: builder.mutation({
//       query: ({ roleId, ...roleData }) => ({
//         url: `/roles/${roleId}`,
//         method: 'PUT',
//         body: roleData,
//       }),
//       invalidatesTags: ['Role'],
//     }),

//     // Delete role
//     deleteRole: builder.mutation({
//       query: (roleId) => ({
//         url: `/roles/${roleId}`,
//         method: 'DELETE',
//       }),
//       invalidatesTags: ['Role'],
//     }),

//     // ==================== USER ROLE ENDPOINTS ====================

//     // Get user's roles
//     getUserRoles: builder.query({
//       query: (userId) => `/users/${userId}/roles`,
//       providesTags: (result, error, userId) => [
//         { type: 'UserRoles', id: userId },
//       ],
//     }),

//     // ==================== ROLE ASSIGNMENT ENDPOINTS ====================

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
//       providesTags: ['RoleAssignments'],
//     }),

//     // Assign role to user
//     assignRole: builder.mutation({
//       query: ({ userId, roleId, assignmentData }) => ({
//         url: `/assignments`,
//         method: 'POST',
//         body: {
//           user_id: userId,
//           role_id: roleId,
//           ...assignmentData,
//         },
//       }),
//       invalidatesTags: ['RoleAssignments', 'UserRoles'],
//     }),

//     // Deactivate role assignment
//     deactivateRoleAssignment: builder.mutation({
//       query: ({ assignmentId, reason }) => ({
//         url: `/assignments/${assignmentId}/deactivate`,
//         method: 'POST',
//         body: { reason },
//       }),
//       invalidatesTags: ['RoleAssignments', 'UserRoles'],
//     }),

//     // Get user's role assignment history
//     getUserRoleHistory: builder.query({
//       query: ({ userId, filters = {} }) => {
//         const params = new URLSearchParams();
//         if (filters.action) params.append('action', filters.action);
//         if (filters.role_id) params.append('role_id', filters.role_id);
//         if (filters.limit) params.append('limit', filters.limit);
//         return `/users/${userId}/assignment-history?${params.toString()}`;
//       },
//     }),

//     // ==================== PERMISSION ENDPOINTS ====================

//     // Get all permissions
//     getAllPermissions: builder.query({
//       query: (filters = {}) => {
//         const params = new URLSearchParams();
//         if (filters.category) params.append('category', filters.category);
//         if (filters.resource) params.append('resource', filters.resource);
//         if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
//         return `/permissions?${params.toString()}`;
//       },
//       providesTags: ['Permission'],
//     }),

//     // Create permission
//     createPermission: builder.mutation({
//       query: (permissionData) => ({
//         url: '/permissions',
//         method: 'POST',
//         body: permissionData,
//       }),
//       invalidatesTags: ['Permission'],
//     }),

//     // Update permission
//     updatePermission: builder.mutation({
//       query: ({ permissionId, ...permissionData }) => ({
//         url: `/permissions/${permissionId}`,
//         method: 'PUT',
//         body: permissionData,
//       }),
//       invalidatesTags: ['Permission'],
//     }),

//     // Delete permission
//     deletePermission: builder.mutation({
//       query: (permissionId) => ({
//         url: `/permissions/${permissionId}`,
//         method: 'DELETE',
//       }),
//       invalidatesTags: ['Permission'],
//     }),

//     // ==================== ROLE PERMISSION ENDPOINTS ====================

//     // Get role's permissions
//     getRolePermissions: builder.query({
//       query: (roleId) => `/roles/${roleId}/permissions`,
//       providesTags: (result, error, roleId) => [
//         { type: 'RolePermissions', id: roleId },
//       ],
//     }),

//     // Assign permission to role
//     assignPermission: builder.mutation({
//       query: ({ roleId, permissionId }) => ({
//         url: `/roles/${roleId}/permissions`,
//         method: 'POST',
//         body: { permission_id: permissionId },
//       }),
//       invalidatesTags: ['RolePermissions'],
//     }),

//     // Remove permission from role
//     removePermission: builder.mutation({
//       query: ({ roleId, permissionId }) => ({
//         url: `/roles/${roleId}/permissions/${permissionId}`,
//         method: 'DELETE',
//       }),
//       invalidatesTags: ['RolePermissions'],
//     }),

//     // Get user's permissions
//     getUserPermissions: builder.query({
//       query: (userId) => `/users/${userId}/permissions`,
//       providesTags: (result, error, userId) => [
//         { type: 'UserRoles', id: userId },
//       ],
//     }),

//     // ==================== USER SEARCH ENDPOINT ====================

//     // Search users
//     searchUsers: builder.query({
//       query: (searchTerm) => `/users/search?q=${encodeURIComponent(searchTerm)}`,
//     }),
//   }),
// });

// // ✅ Export hooks
// export const {
//   // Role hooks
//   useGetAllRolesQuery,
//   useGetRoleQuery,
//   useCreateRoleMutation,
//   useUpdateRoleMutation,
//   useDeleteRoleMutation,
  
//   // User role hooks
//   useGetUserRolesQuery,
  
//   // Assignment hooks
//   useGetRoleAssignmentsQuery,
//   useAssignRoleMutation,
//   useDeactivateRoleAssignmentMutation,
//   useGetUserRoleHistoryQuery,
  
//   // Permission hooks
//   useGetAllPermissionsQuery,
//   useCreatePermissionMutation,
//   useUpdatePermissionMutation,
//   useDeletePermissionMutation,
  
//   // Role permission hooks
//   useGetRolePermissionsQuery,
//   useAssignPermissionMutation,
//   useRemovePermissionMutation,
//   useGetUserPermissionsQuery,
  
//   // User search hook
//   useSearchUsersQuery,
// } = roleApi;

// // ✅ Default export
// export default roleApi;
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const ROLE_SERVICE_BASE_URL = import.meta.env.VITE_ROLE_SERVICE_URL || 'http://localhost:3004/api';

// export const roleApi = createApi({
//   reducerPath: 'roleApi',
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
//   tagTypes: ['Role', 'UserRoles', 'RolePermissions'],
//   endpoints: (builder) => ({
//     // Get all roles
//     getAllRoles: builder.query({
//       query: (filters = {}) => {
//         const params = new URLSearchParams();
//         if (filters.role_type) params.append('role_type', filters.role_type);
//         if (filters.role_category) params.append('role_category', filters.role_category);
//         if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
//         return `/roles?${params.toString()}`;
//       },
//       providesTags: ['Role'],
//     }),

//     // Get role by ID
//     getRoleById: builder.query({
//       query: (roleId) => `/roles/${roleId}`,
//       providesTags: (result, error, roleId) => [{ type: 'Role', id: roleId }],
//     }),

//     // Get role by name
//     getRoleByName: builder.query({
//       query: (roleName) => `/roles/name/${roleName}`,
//       providesTags: (result, error, roleName) => [{ type: 'Role', id: roleName }],
//     }),

//     // Create role (Admin only)
//     createRole: builder.mutation({
//       query: (roleData) => ({
//         url: '/roles',
//         method: 'POST',
//         body: roleData,
//       }),
//       invalidatesTags: ['Role'],
//     }),

//     // Update role (Admin only)
//     updateRole: builder.mutation({
//       query: ({ roleId, ...updateData }) => ({
//         url: `/roles/${roleId}`,
//         method: 'PUT',
//         body: updateData,
//       }),
//       invalidatesTags: (result, error, { roleId }) => [
//         'Role',
//         { type: 'Role', id: roleId },
//       ],
//     }),

//     // Delete role (Manager only)
//     deleteRole: builder.mutation({
//       query: (roleId) => ({
//         url: `/roles/${roleId}`,
//         method: 'DELETE',
//       }),
//       invalidatesTags: ['Role'],
//     }),

//     // Get user's roles
//     getUserRoles: builder.query({
//       query: (userId) => `/users/${userId}/roles`,
//       providesTags: (result, error, userId) => [
//         { type: 'UserRoles', id: userId },
//       ],
//     }),

//     // Get user's permissions
//     getUserPermissions: builder.query({
//       query: (userId) => `/users/${userId}/permissions`,
//       providesTags: (result, error, userId) => [
//         { type: 'UserRoles', id: userId },
//       ],
//     }),

//     // Check if user has role
//     checkUserRole: builder.query({
//       query: ({ userId, roleName }) => `/users/${userId}/roles/${roleName}/check`,
//     }),

//     // Check if user has permission
//     checkUserPermission: builder.query({
//       query: ({ userId, permissionName }) => `/users/${userId}/permissions/${permissionName}/check`,
//     }),

//     // Invalidate user cache
//     invalidateUserCache: builder.mutation({
//       query: (userId) => ({
//         url: `/users/${userId}/cache/invalidate`,
//         method: 'POST',
//       }),
//       invalidatesTags: (result, error, userId) => [
//         { type: 'UserRoles', id: userId },
//       ],
//     }),
//   }),
// });

// export const {
//   useGetAllRolesQuery,
//   useGetRoleByIdQuery,
//   useGetRoleByNameQuery,
//   useCreateRoleMutation,
//   useUpdateRoleMutation,
//   useDeleteRoleMutation,
//   useGetUserRolesQuery,
//   useGetUserPermissionsQuery,
//   useCheckUserRoleQuery,
//   useCheckUserPermissionQuery,
//   useInvalidateUserCacheMutation,
// } = roleApi;