import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
// import {
//   useGetAllPermissionsQuery,
//   useCreatePermissionMutation,
//   useUpdatePermissionMutation,
//   useDeletePermissionMutation,
//   useGetRolePermissionsQuery,
//   useAssignPermissionToRoleMutation,
//   useRemovePermissionFromRoleMutation,
// } from '../../../redux/api/role/permissionApi';
//import { useGetAllRolesQuery } from '../../../redux/api/role/roleApi';
//import { groupPermissionsByCategory } from '../../../utils/roleHelpers';
import { Search, Plus, Edit2, Trash2, X, Loader, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { useGetAllPermissionsQuery,useCreatePermissionMutation,useUpdatePermissionMutation, useDeletePermissionMutation,useGetRolePermissionsQuery,useAssignPermissionToRoleMutation,useRemovePermissionFromRoleMutation} from '../../../../redux/api/role/permissionApi';
import { useGetAllRolesQuery } from '../../../../redux/api/role/roleApi';
import { groupPermissionsByCategory } from '../../../../utils/roleHelpers';

export default function PermissionManagement() {
    /*eslint-disable*/
  const dispatch = useDispatch();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRolePermissionsModal, setShowRolePermissionsModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // Form state
  const [formData, setFormData] = useState({
    permission_name: '',
    permission_category: 'election',
    description: '',
    resource_type: 'election',
    action_type: 'create',
  });
  
  // API hooks
  const { data: permissionsData, isLoading, error, refetch } = useGetAllPermissionsQuery({
    permission_category: filterCategory === 'all' ? undefined : filterCategory,
  });
  
  const { data: rolesData } = useGetAllRolesQuery({});
  const { data: rolePermissionsData, refetch: refetchRolePermissions } = useGetRolePermissionsQuery(
    selectedRole?.role_id,
    { skip: !selectedRole }
  );
  
  const [createPermission, { isLoading: creating }] = useCreatePermissionMutation();
  const [updatePermission, { isLoading: updating }] = useUpdatePermissionMutation();
  const [deletePermission, { isLoading: deleting }] = useDeletePermissionMutation();
  const [assignPermission, { isLoading: assigning }] = useAssignPermissionToRoleMutation();
  const [removePermission, { isLoading: removing }] = useRemovePermissionFromRoleMutation();
  
  // Group permissions by category
  const groupedPermissions = groupPermissionsByCategory(
    permissionsData?.data?.filter(p =>
      p.permission_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []
  );
  
  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  // Handle create permission
  const handleCreatePermission = async (e) => {
    e.preventDefault();
    
    try {
      await createPermission(formData).unwrap();
      toast.success('Permission created successfully!');
      setShowCreateModal(false);
      resetForm();
      refetch();
    } catch (error) {
      toast.error(error.data?.message || 'Failed to create permission');
    }
  };
  
  // Handle update permission
  const handleUpdatePermission = async (e) => {
    e.preventDefault();
    
    try {
      await updatePermission({
        permissionId: selectedPermission.permission_id,
        ...formData,
      }).unwrap();
      toast.success('Permission updated successfully!');
      setShowEditModal(false);
      resetForm();
      refetch();
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update permission');
    }
  };
  
  // Handle delete permission
  const handleDeletePermission = async (permissionId) => {
    if (!window.confirm('Are you sure you want to delete this permission?')) return;
    
    try {
      await deletePermission(permissionId).unwrap();
      toast.success('Permission deleted successfully!');
      refetch();
    } catch (error) {
      toast.error(error.data?.message || 'Failed to delete permission');
    }
  };
  
  // Handle assign permission to role
  const handleAssignPermission = async (permissionId) => {
    if (!selectedRole) return;
    
    try {
      await assignPermission({
        roleId: selectedRole.role_id,
        permissionId: permissionId,
      }).unwrap();
      toast.success('Permission assigned to role!');
      refetchRolePermissions();
    } catch (error) {
      toast.error(error.data?.message || 'Failed to assign permission');
    }
  };
  
  // Handle remove permission from role
  const handleRemovePermission = async (permissionId) => {
    if (!selectedRole) return;
    
    try {
      await removePermission({
        roleId: selectedRole.role_id,
        permissionId: permissionId,
      }).unwrap();
      toast.success('Permission removed from role!');
      refetchRolePermissions();
    } catch (error) {
      toast.error(error.data?.message || 'Failed to remove permission');
    }
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      permission_name: '',
      permission_category: 'election',
      description: '',
      resource_type: 'election',
      action_type: 'create',
    });
    setSelectedPermission(null);
  };
  
  // Open edit modal
  const openEditModal = (permission) => {
    setSelectedPermission(permission);
    setFormData({
      permission_name: permission.permission_name,
      permission_category: permission.permission_category,
      description: permission.description || '',
      resource_type: permission.resource_type,
      action_type: permission.action_type,
    });
    setShowEditModal(true);
  };
  
  // Check if permission is assigned to current role
  const isPermissionAssigned = (permissionId) => {
    return rolePermissionsData?.data?.some(p => p.permission_id === permissionId);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Permission Management</h2>
          <p className="text-gray-600 mt-1">Manage system permissions and role assignments</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowRolePermissionsModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Shield size={20} />
            <span>Role Permissions</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            <span>Create Permission</span>
          </button>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Filter by category */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="admin">Admin</option>
            <option value="election">Election</option>
            <option value="voting">Voting</option>
            <option value="financial">Financial</option>
            <option value="content">Content</option>
            <option value="analytics">Analytics</option>
            <option value="security">Security</option>
          </select>
        </div>
      </div>
      
      {/* Permissions by Category */}
      <div className="space-y-4">
        {Object.entries(groupedPermissions).map(([category, permissions]) => (
          <div key={category} className="bg-white rounded-lg shadow overflow-hidden">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-3">
                <Shield className="text-blue-600" size={20} />
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">
                    {category}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {permissions.length} permission{permissions.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              {expandedCategories[category] ? (
                <ChevronUp className="text-gray-500" size={20} />
              ) : (
                <ChevronDown className="text-gray-500" size={20} />
              )}
            </button>
            
            {expandedCategories[category] && (
              <div className="divide-y divide-gray-200">
                {permissions.map((permission) => (
                  <div
                    key={permission.permission_id}
                    className="px-6 py-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                          {permission.permission_name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {permission.description || 'No description'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {permission.resource_type}
                          </span>
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                            {permission.action_type}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => openEditModal(permission)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Edit permission"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeletePermission(permission.permission_id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete permission"
                          disabled={deleting}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {Object.keys(groupedPermissions).length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No permissions found</p>
        </div>
      )}
      
      {/* Create Permission Modal */}
      {showCreateModal && (
        <PermissionFormModal
          title="Create New Permission"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreatePermission}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          isLoading={creating}
        />
      )}
      
      {/* Edit Permission Modal */}
      {showEditModal && (
        <PermissionFormModal
          title="Edit Permission"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleUpdatePermission}
          onClose={() => {
            setShowEditModal(false);
            resetForm();
          }}
          isLoading={updating}
        />
      )}
      
      {/* Role Permissions Modal */}
      {showRolePermissionsModal && (
        <RolePermissionsModal
          roles={rolesData?.data || []}
          permissions={permissionsData?.data || []}
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          rolePermissions={rolePermissionsData?.data || []}
          onAssign={handleAssignPermission}
          onRemove={handleRemovePermission}
          onClose={() => {
            setShowRolePermissionsModal(false);
            setSelectedRole(null);
          }}
          isLoading={assigning || removing}
          isPermissionAssigned={isPermissionAssigned}
        />
      )}
    </div>
  );
}

// Permission Form Modal Component
function PermissionFormModal({ title, formData, setFormData, onSubmit, onClose, isLoading }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {/* Permission Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permission Name *
            </label>
            <input
              type="text"
              required
              value={formData.permission_name}
              onChange={(e) => setFormData({ ...formData, permission_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., create_election"
            />
          </div>
          
          {/* Permission Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              required
              value={formData.permission_category}
              onChange={(e) => setFormData({ ...formData, permission_category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="admin">Admin</option>
              <option value="election">Election</option>
              <option value="voting">Voting</option>
              <option value="financial">Financial</option>
              <option value="content">Content</option>
              <option value="analytics">Analytics</option>
              <option value="security">Security</option>
            </select>
          </div>
          
          {/* Resource Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource Type *
            </label>
            <select
              required
              value={formData.resource_type}
              onChange={(e) => setFormData({ ...formData, resource_type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="user">User</option>
              <option value="election">Election</option>
              <option value="vote">Vote</option>
              <option value="payment">Payment</option>
              <option value="lottery">Lottery</option>
              <option value="content">Content</option>
              <option value="system">System</option>
              <option value="audit">Audit</option>
              <option value="security">Security</option>
              <option value="analytics">Analytics</option>
              <option value="advertisement">Advertisement</option>
              <option value="role">Role</option>
            </select>
          </div>
          
          {/* Action Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action Type *
            </label>
            <select
              required
              value={formData.action_type}
              onChange={(e) => setFormData({ ...formData, action_type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="create">Create</option>
              <option value="read">Read</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="execute">Execute</option>
            </select>
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Enter permission description"
            />
          </div>
          
          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader className="animate-spin" size={16} />
                  Saving...
                </span>
              ) : (
                'Save Permission'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Role Permissions Modal Component
function RolePermissionsModal({
  roles,
  permissions,
  selectedRole,
  setSelectedRole,
  /*eslint-disable*/
  rolePermissions,
  onAssign,
  onRemove,
  onClose,
  isLoading,
  isPermissionAssigned
}) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredPermissions = permissions.filter(p =>
    p.permission_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const groupedPermissions = groupPermissionsByCategory(filteredPermissions);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Manage Role Permissions</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Role Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Role
            </label>
            <select
              value={selectedRole?.role_id || ''}
              onChange={(e) => {
                const role = roles.find(r => r.role_id === parseInt(e.target.value));
                setSelectedRole(role);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a role...</option>
              {roles.map(role => (
                <option key={role.role_id} value={role.role_id}>
                  {role.role_name}
                </option>
              ))}
            </select>
          </div>
          
          {selectedRole && (
            <>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search permissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Permissions List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <div key={category}>
                    <h4 className="text-sm font-semibold text-gray-700 uppercase mb-2">
                      {category}
                    </h4>
                    <div className="space-y-2">
                      {perms.map(permission => {
                        const assigned = isPermissionAssigned(permission.permission_id);
                        return (
                          <div
                            key={permission.permission_id}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {permission.permission_name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {permission.description}
                              </p>
                            </div>
                            <button
                              onClick={() => assigned ? onRemove(permission.permission_id) : onAssign(permission.permission_id)}
                              disabled={isLoading}
                              className={`px-4 py-2 text-sm rounded-lg transition ${
                                assigned
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              } disabled:opacity-50`}
                            >
                              {assigned ? 'Remove' : 'Assign'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          
          {!selectedRole && (
            <div className="text-center py-12 text-gray-500">
              Please select a role to manage permissions
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}