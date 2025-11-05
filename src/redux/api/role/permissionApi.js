import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const ROLE_SERVICE_BASE_URL = import.meta.env.VITE_ROLE_SERVICE_URL || 'http://localhost:3004/api';

export const permissionApi = createApi({
  reducerPath: 'permissionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: ROLE_SERVICE_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState();
      const userId = state.auth?.userId || localStorage.getItem('userId');
      const token = state.auth?.accessToken || localStorage.getItem('accessToken');
      
      if (userId) {
        headers.set('x-user-id', userId);
      }
      
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Permission', 'RolePermissions'],
  endpoints: (builder) => ({
    // Get all permissions
    getAllPermissions: builder.query({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.permission_category) params.append('permission_category', filters.permission_category);
        if (filters.resource_type) params.append('resource_type', filters.resource_type);
        if (filters.action_type) params.append('action_type', filters.action_type);
        if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
        return `/permissions?${params.toString()}`;
      },
      providesTags: ['Permission'],
    }),

    // Get permission by ID
    getPermissionById: builder.query({
      query: (permissionId) => `/permissions/${permissionId}`,
      providesTags: (result, error, permissionId) => [
        { type: 'Permission', id: permissionId },
      ],
    }),

    // Create permission (Admin only)
    createPermission: builder.mutation({
      query: (permissionData) => ({
        url: '/permissions',
        method: 'POST',
        body: permissionData,
      }),
      invalidatesTags: ['Permission'],
    }),

    // Update permission (Admin only)
    updatePermission: builder.mutation({
      query: ({ permissionId, ...updateData }) => ({
        url: `/permissions/${permissionId}`,
        method: 'PUT',
        body: updateData,
      }),
      invalidatesTags: (result, error, { permissionId }) => [
        'Permission',
        { type: 'Permission', id: permissionId },
      ],
    }),

    // Delete permission (Manager only)
    deletePermission: builder.mutation({
      query: (permissionId) => ({
        url: `/permissions/${permissionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Permission'],
    }),

    // Get permissions for a role
    getRolePermissions: builder.query({
      query: (roleId) => `/roles/${roleId}/permissions`,
      providesTags: (result, error, roleId) => [
        { type: 'RolePermissions', id: roleId },
      ],
    }),

    // Assign permission to role
    assignPermissionToRole: builder.mutation({
      query: (data) => ({
        url: '/role-permissions/assign',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { roleId }) => [
        { type: 'RolePermissions', id: roleId },
      ],
    }),

    // Remove permission from role
    removePermissionFromRole: builder.mutation({
      query: (data) => ({
        url: '/role-permissions/remove',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { roleId }) => [
        { type: 'RolePermissions', id: roleId },
      ],
    }),

    // Bulk assign permissions to role
    bulkAssignPermissions: builder.mutation({
      query: (data) => ({
        url: '/role-permissions/bulk-assign',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { roleId }) => [
        { type: 'RolePermissions', id: roleId },
      ],
    }),
  }),
});

export const {
  useGetAllPermissionsQuery,
  useGetPermissionByIdQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
  useGetRolePermissionsQuery,
  useAssignPermissionToRoleMutation,
  useRemovePermissionFromRoleMutation,
  useBulkAssignPermissionsMutation,
} = permissionApi;