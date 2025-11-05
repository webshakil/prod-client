import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Current user's roles
  userRoles: [],
  userPermissions: [],
  
  // All available roles in system
  allRoles: [],
  
  // Selected role for management
  selectedRole: null,
  
  // UI states
  loading: false,
  error: null,
  
  // Cache
  rolesCache: {},
  permissionsCache: {},
  
  // Filters
  filters: {
    role_type: null,
    role_category: null,
    is_active: true,
  },
};

const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    // Set user roles
    setUserRoles: (state, action) => {
      state.userRoles = action.payload;
    },
    
    // Set user permissions
    setUserPermissions: (state, action) => {
      state.userPermissions = action.payload;
    },
    
    // Set all roles
    setAllRoles: (state, action) => {
      state.allRoles = action.payload;
    },
    
    // Select role for management
    selectRole: (state, action) => {
      state.selectedRole = action.payload;
    },
    
    // Clear selected role
    clearSelectedRole: (state) => {
      state.selectedRole = null;
    },
    
    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    // Set error
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Update filters
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Reset filters
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    // Cache role data
    cacheRole: (state, action) => {
      const { roleId, data } = action.payload;
      state.rolesCache[roleId] = data;
    },
    
    // Cache permission data
    cachePermission: (state, action) => {
      const { permissionId, data } = action.payload;
      state.permissionsCache[permissionId] = data;
    },
    
    // Clear all caches
    clearCaches: (state) => {
      state.rolesCache = {};
      state.permissionsCache = {};
    },
    
    // Add role to user
    addUserRole: (state, action) => {
      if (!state.userRoles.find(r => r.role_id === action.payload.role_id)) {
        state.userRoles.push(action.payload);
      }
    },
    
    // Remove role from user
    removeUserRole: (state, action) => {
      state.userRoles = state.userRoles.filter(
        r => r.role_id !== action.payload
      );
    },
    
    // Reset entire state
    resetRoleState: () => initialState,
  },
});

export const {
  setUserRoles,
  setUserPermissions,
  setAllRoles,
  selectRole,
  clearSelectedRole,
  setLoading,
  setError,
  clearError,
  updateFilters,
  resetFilters,
  cacheRole,
  cachePermission,
  clearCaches,
  addUserRole,
  removeUserRole,
  resetRoleState,
} = roleSlice.actions;

export default roleSlice.reducer;