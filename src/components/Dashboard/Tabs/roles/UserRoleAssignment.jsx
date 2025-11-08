//voter role will never be deleted
import React, { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { Search, UserPlus, X, Loader, Trash2, Calendar, User, Shield, ChevronDown, ChevronUp } from 'lucide-react';

import { 
  useGetAllRolesQuery, 
  useSearchUsersQuery 
} from '../../../../redux/api/role/roleApi';

import { 
  useAssignRoleMutation, 
  useDeactivateRoleAssignmentMutation,
  useDeleteRoleAssignmentMutation, // ✅ NEW: Import delete mutation
  useGetRoleAssignmentsQuery 
} from '../../../../redux/api/role/assignmentApi';

import { 
  formatAssignmentType, 
  formatDate, 
  getRoleBadgeColor 
} from '../../../../utils/roleHelpers';

export default function UserRoleAssignment() {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState(new Set());
  
  // User search state
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form state
  const [assignFormData, setAssignFormData] = useState({
    roleId: '',
    assignment_type: 'manual',
    expires_at: '',
    reason: '',
  });
  
  // API hooks
  const { data: assignmentsData, isLoading, refetch } = useGetRoleAssignmentsQuery({
    is_active: filterActive === 'all' ? undefined : filterActive === 'active',
  });
  
  const { data: rolesData } = useGetAllRolesQuery({});
  
  
  // User search
  const { data: usersSearchData, isFetching: searchingUsers } = useSearchUsersQuery(
    userSearchTerm,
    { skip: userSearchTerm.length < 3 }
  );
  
  const [assignRole, { isLoading: assigning }] = useAssignRoleMutation();
  /*eslint-disable*/
  const [deactivateAssignment, { isLoading: deactivating }] = useDeactivateRoleAssignmentMutation();
  const [deleteAssignment, { isLoading: deleting }] = useDeleteRoleAssignmentMutation(); 
  
  // Group assignments by user
  const groupedUsers = useMemo(() => {
    const assignments = assignmentsData?.data || [];
    const userMap = new Map();
    
    assignments.forEach(assignment => {
      const userId = assignment.user_id;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          user_id: userId,
          user_email: assignment.user_email,
          roles: [],
        });
      }
      userMap.get(userId).roles.push(assignment);
    });
    
    return Array.from(userMap.values());
  }, [assignmentsData]);
  
  // Filter users by search
  const filteredUsers = groupedUsers.filter(user =>
    user.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Calculate stats
  const stats = useMemo(() => {
    const assignments = assignmentsData?.data || [];
    const uniqueUsers = new Set(assignments.map(a => a.user_id)).size;
    const activeAssignments = assignments.filter(a => a.is_active).length;
    const inactiveAssignments = assignments.filter(a => !a.is_active).length;
    
    return {
      totalUsers: uniqueUsers,
      totalAssignments: assignments.length,
      activeAssignments,
      inactiveAssignments,
    };
  }, [assignmentsData]);
  
  // Toggle expanded row
  const toggleExpanded = (userId) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };
  
  // Handle assign role
  const handleAssignRole = async (e) => {
    e.preventDefault();
    
    if (!selectedUser || !assignFormData.roleId) {
      toast.error('Please select a user and role');
      return;
    }
    
    try {
      // Get role name from role ID
      const selectedRole = rolesData?.data?.find(r => r.role_id === parseInt(assignFormData.roleId));
      
      if (!selectedRole) {
        toast.error('Selected role not found');
        return;
      }
      
      await assignRole({
        user_id: selectedUser.user_id,
        role_name: selectedRole.role_name,
        assignment_type: assignFormData.assignment_type,
        expires_at: assignFormData.expires_at || null,
        metadata: assignFormData.reason ? { reason: assignFormData.reason } : null,
      }).unwrap();
      
      toast.success('Role assigned successfully!');
      setShowAssignModal(false);
      resetForm();
      refetch();
    } catch (error) {
      toast.error(error.data?.message || 'Failed to assign role');
    }
  };
  


const handleDelete = async (userId, roleName) => {
  // ✅ Frontend protection check - NEVER allow Voter deletion
  if (roleName.toLowerCase() === 'voter') {
    toast.error('❌ Cannot delete Voter role - it is the base role for all users', {
      position: 'top-center',
      autoClose: 4000,
    });
    return;
  }

  toast.warning(
    ({ closeToast }) => (
      <div>
        <p className="font-semibold mb-2">Remove "{roleName}" role?</p>
        <p className="text-xs text-gray-600 mb-3">This action cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={closeToast}
            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition text-sm"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              closeToast();
              const loading = toast.loading('Removing role...', { position: 'top-right' });
              
              try {
                await deleteAssignment({ 
                  user_id: userId, 
                  role_name: roleName 
                }).unwrap();
                
                toast.dismiss(loading);
                toast.success('✅ Role permanently removed!', { 
                  position: 'top-right',
                  autoClose: 2000 
                });
                
                await refetch();
                
                const currentUserId = parseInt(localStorage.getItem('userId'));
                if (userId === currentUserId) {
                  setTimeout(() => {
                    window.location.reload();
                  }, 1500);
                }
              } catch (error) {
                toast.dismiss(loading);
                
                // ✅ Show user-friendly error message
                const errorMessage = error.data?.message || error.message || 'Failed to remove role';
                toast.error(`❌ ${errorMessage}`, { 
                  position: 'top-right',
                  autoClose: 5000 
                });
              }
            }}
            className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    ),
    { 
      position: 'top-center', 
      autoClose: false, 
      closeButton: true,
      closeOnClick: false,
      draggable: false,
    }
  );
};
  
  // Handle deactivate assignment (kept for backward compatibility)
  const handleDeactivate = async (userId, roleName) => {
    if (!window.confirm(`Are you sure you want to remove "${roleName}" role from this user?`)) return;
    
    try {
      await deactivateAssignment({
        user_id: userId,
        role_name: roleName,
        reason: 'Manual deactivation by admin',
      }).unwrap();
      
      toast.success('Role removed successfully!');
      refetch();
    } catch (error) {
      toast.error(error.data?.message || 'Failed to remove role');
    }
  };
  
  // Reset form
  const resetForm = () => {
    setUserSearchTerm('');
    setSelectedUser(null);
    setAssignFormData({
      roleId: '',
      assignment_type: 'manual',
      expires_at: '',
      reason: '',
    });
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
          <h2 className="text-3xl font-bold text-gray-900">User Role Assignments</h2>
          <p className="text-gray-600 mt-1">Manage user role assignments and permissions </p>
        </div>
        <button
          onClick={() => setShowAssignModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <UserPlus size={20} />
          <span>Assign Role</span>
        </button>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by user email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Filter by status */}
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Assignments</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <User className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Shield className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Shield className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeAssignments}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <Shield className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactiveAssignments}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const isExpanded = expandedUsers.has(user.user_id);
                const activeRoles = user.roles.filter(r => r.is_active);
                const inactiveRoles = user.roles.filter(r => !r.is_active);
                
                return (
                  <React.Fragment key={user.user_id}>
                    {/* Main Row */}
                    <tr className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {user.user_email?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.user_email}
                            </p>
                            <p className="text-xs text-gray-500">
                              User ID: {user.user_id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {activeRoles.map((role, index) => (
                            <span
                              key={index}
                              className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(role.role_name)}`}
                            >
                              {role.role_name}
                            </span>
                          ))}
                          {activeRoles.length === 0 && (
                            <span className="text-sm text-gray-500">No active roles</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <span className="text-green-600 font-medium">{activeRoles.length} Active</span>
                          {inactiveRoles.length > 0 && (
                            <span className="text-gray-400"> / {inactiveRoles.length} Inactive</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleExpanded(user.user_id)}
                          className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp size={16} />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <ChevronDown size={16} />
                              Manage Roles
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Details Row */}
                    {isExpanded && (
                      <tr className="bg-gray-50">
                        <td colSpan="4" className="px-6 py-4">
                          <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Role Details</h4>
                            
                            {/* Active Roles */}
               {activeRoles.length > 0 && (
  <div>
    <h5 className="text-sm font-medium text-gray-700 mb-2">Active Roles</h5>
    <div className="space-y-2">
      {activeRoles.map((role, index) => {
        // ✅ Check if this is Voter role - NEVER allow deletion
        const isVoter = role.role_name.toLowerCase() === 'voter';
        
        return (
          <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(role.role_name)}`}>
                  {role.role_name}
                </span>
                <span className="text-xs text-gray-500">
                  {formatAssignmentType(role.assignment_type)}
                </span>
                {/* ✅ Show badge if role is protected */}
                {isVoter && (
                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded border border-blue-300">
                    Protected
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-4 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  Assigned: {formatDate(role.assigned_at)}
                </span>
                {role.expires_at && (
                  <span className="text-orange-600">
                    Expires: {formatDate(role.expires_at)}
                  </span>
                )}
              </div>
            </div>
            
            {/* ✅ NEVER show delete button for Voter role */}
            {!isVoter && (
              <button
                onClick={() => handleDelete(user.user_id, role.role_name)}
                disabled={deleting}
                className="p-2 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                title="Permanently remove role"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  </div>
)}
                            
                            {/* Inactive Roles */}
                            {inactiveRoles.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Inactive Roles</h5>
                                <div className="space-y-2">
                                  {inactiveRoles.map((role, index) => (
                                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 opacity-60">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-300">
                                            {role.role_name}
                                          </span>
                                          <span className="text-xs text-gray-500">Deactivated</span>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500">
                                          Deactivated: {formatDate(role.deactivated_at || role.assigned_at)}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No users found
          </div>
        )}
      </div>
      
      {/* Assign Role Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">Assign Role to User</h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded transition"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAssignRole} className="p-6 space-y-4">
              {/* User Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search User (by email, phone, or name) *
                </label>
                <input
                  type="text"
                  value={userSearchTerm}
                  onChange={(e) => {
                    setUserSearchTerm(e.target.value);
                    setSelectedUser(null);
                  }}
                  placeholder="Type at least 3 characters..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                
                {/* User Search Results */}
                {userSearchTerm.length >= 3 && (
                  <div className="mt-2 border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                    {searchingUsers ? (
                      <div className="p-4 text-center">
                        <Loader className="animate-spin mx-auto text-blue-600" size={24} />
                      </div>
                    ) : Array.isArray(usersSearchData?.data) && usersSearchData.data.length > 0 ? (
                      usersSearchData.data.map((user) => (
                        <button
                          key={user.user_id}
                          type="button"
                          onClick={() => {
                            setSelectedUser(user);
                            setUserSearchTerm(user.user_email || user.user_phone || user.user_name);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-200 last:border-0"
                        >
                          <div className="font-medium text-gray-900">
                            {user.user_firstname && user.user_lastname 
                              ? `${user.user_firstname} ${user.user_lastname}`
                              : user.user_name || 'Unknown User'
                            }
                          </div>
                          <div className="text-sm text-gray-600">{user.user_email}</div>
                          <div className="text-xs text-gray-500">
                            {user.user_phone && `Phone: ${user.user_phone} | `}
                            ID: {user.user_id}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">No users found</div>
                    )}
                  </div>
                )}

                {/* Selected User */}
                {selectedUser && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">
                          {selectedUser.user_firstname && selectedUser.user_lastname
                            ? `${selectedUser.user_firstname} ${selectedUser.user_lastname}`
                            : selectedUser.user_name || 'Unknown User'
                          }
                        </div>
                        <div className="text-sm text-gray-600">{selectedUser.user_email}</div>
                        {selectedUser.user_phone && (
                          <div className="text-xs text-gray-500">Phone: {selectedUser.user_phone}</div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUser(null);
                          setUserSearchTerm('');
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Role */}
   {/* Role */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Select Role * (Admin Roles Only)
  </label>
  <select
    required
    value={assignFormData.roleId}
    onChange={(e) => setAssignFormData({ ...assignFormData, roleId: e.target.value })}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
  >
    <option value="">-- Select a role --</option>
    {/* ✅ Filter to show only admin roles */}
    {(rolesData?.data || [])
      .filter(role => role.role_type === 'admin')
      .map(role => (
        <option key={role.role_id} value={role.role_id}>
          {role.role_name}
        </option>
      ))}
  </select>
  {/* ✅ Helper text */}
  <p className="mt-1 text-xs text-gray-500">
    Only admin roles can be manually assigned. User roles are system-managed.
  </p>
</div>
              {/* Assignment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Type
                </label>
                <select
                  value={assignFormData.assignment_type}
                  onChange={(e) => setAssignFormData({ ...assignFormData, assignment_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                  <option value="subscription">Subscription</option>
                  <option value="action_triggered">Action Triggered</option>
                </select>
              </div>
              
              {/* Expires At */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expires At (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={assignFormData.expires_at}
                  onChange={(e) => setAssignFormData({ ...assignFormData, expires_at: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (Optional)
                </label>
                <textarea
                  value={assignFormData.reason}
                  onChange={(e) => setAssignFormData({ ...assignFormData, reason: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Add any additional notes..."
                />
              </div>
              
              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  disabled={assigning}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 flex items-center gap-2"
                  disabled={!selectedUser || !assignFormData.roleId || assigning}
                >
                  {assigning && <Loader className="animate-spin" size={16} />}
                  {assigning ? 'Assigning...' : 'Assign Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
//last working code
// import React, { useState, useMemo } from 'react';
// import { toast } from 'react-toastify';
// import { Search, UserPlus, X, Loader, Trash2, Calendar, User, Shield, ChevronDown, ChevronUp } from 'lucide-react';

// import { 
//   useGetAllRolesQuery, 
//   useSearchUsersQuery 
// } from '../../../../redux/api/role/roleApi';

// import { 
//   useAssignRoleMutation, 
//   useDeactivateRoleAssignmentMutation,
//   useDeleteRoleAssignmentMutation, // ✅ NEW: Import delete mutation
//   useGetRoleAssignmentsQuery 
// } from '../../../../redux/api/role/assignmentApi';

// import { 
//   formatAssignmentType, 
//   formatDate, 
//   getRoleBadgeColor 
// } from '../../../../utils/roleHelpers';

// export default function UserRoleAssignment() {
//   // State
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterActive, setFilterActive] = useState('all');
//   const [showAssignModal, setShowAssignModal] = useState(false);
//   const [expandedUsers, setExpandedUsers] = useState(new Set());
  
//   // User search state
//   const [userSearchTerm, setUserSearchTerm] = useState('');
//   const [selectedUser, setSelectedUser] = useState(null);
  
//   // Form state
//   const [assignFormData, setAssignFormData] = useState({
//     roleId: '',
//     assignment_type: 'manual',
//     expires_at: '',
//     reason: '',
//   });
  
//   // API hooks
//   const { data: assignmentsData, isLoading, refetch } = useGetRoleAssignmentsQuery({
//     is_active: filterActive === 'all' ? undefined : filterActive === 'active',
//   });
  
//   const { data: rolesData } = useGetAllRolesQuery({});
  
  
//   // User search
//   const { data: usersSearchData, isFetching: searchingUsers } = useSearchUsersQuery(
//     userSearchTerm,
//     { skip: userSearchTerm.length < 3 }
//   );
  
//   const [assignRole, { isLoading: assigning }] = useAssignRoleMutation();
//   /*eslint-disable*/
//   const [deactivateAssignment, { isLoading: deactivating }] = useDeactivateRoleAssignmentMutation();
//   const [deleteAssignment, { isLoading: deleting }] = useDeleteRoleAssignmentMutation(); 
  
//   // Group assignments by user
//   const groupedUsers = useMemo(() => {
//     const assignments = assignmentsData?.data || [];
//     const userMap = new Map();
    
//     assignments.forEach(assignment => {
//       const userId = assignment.user_id;
//       if (!userMap.has(userId)) {
//         userMap.set(userId, {
//           user_id: userId,
//           user_email: assignment.user_email,
//           roles: [],
//         });
//       }
//       userMap.get(userId).roles.push(assignment);
//     });
    
//     return Array.from(userMap.values());
//   }, [assignmentsData]);
  
//   // Filter users by search
//   const filteredUsers = groupedUsers.filter(user =>
//     user.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
//   );
  
//   // Calculate stats
//   const stats = useMemo(() => {
//     const assignments = assignmentsData?.data || [];
//     const uniqueUsers = new Set(assignments.map(a => a.user_id)).size;
//     const activeAssignments = assignments.filter(a => a.is_active).length;
//     const inactiveAssignments = assignments.filter(a => !a.is_active).length;
    
//     return {
//       totalUsers: uniqueUsers,
//       totalAssignments: assignments.length,
//       activeAssignments,
//       inactiveAssignments,
//     };
//   }, [assignmentsData]);
  
//   // Toggle expanded row
//   const toggleExpanded = (userId) => {
//     setExpandedUsers(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(userId)) {
//         newSet.delete(userId);
//       } else {
//         newSet.add(userId);
//       }
//       return newSet;
//     });
//   };
  
//   // Handle assign role
//   const handleAssignRole = async (e) => {
//     e.preventDefault();
    
//     if (!selectedUser || !assignFormData.roleId) {
//       toast.error('Please select a user and role');
//       return;
//     }
    
//     try {
//       // Get role name from role ID
//       const selectedRole = rolesData?.data?.find(r => r.role_id === parseInt(assignFormData.roleId));
      
//       if (!selectedRole) {
//         toast.error('Selected role not found');
//         return;
//       }
      
//       await assignRole({
//         user_id: selectedUser.user_id,
//         role_name: selectedRole.role_name,
//         assignment_type: assignFormData.assignment_type,
//         expires_at: assignFormData.expires_at || null,
//         metadata: assignFormData.reason ? { reason: assignFormData.reason } : null,
//       }).unwrap();
      
//       toast.success('Role assigned successfully!');
//       setShowAssignModal(false);
//       resetForm();
//       refetch();
//     } catch (error) {
//       toast.error(error.data?.message || 'Failed to assign role');
//     }
//   };
  


// const handleDelete = async (userId, roleName) => {
//   // ✅ Frontend protection check
//   if (roleName.toLowerCase() === 'voter') {
//     toast.error('❌ Cannot delete Voter role - it is the base role for all users', {
//       position: 'top-center',
//       autoClose: 4000,
//     });
//     return;
//   }

//   toast.warning(
//     ({ closeToast }) => (
//       <div>
//         <p className="font-semibold mb-2">Remove "{roleName}" role?</p>
//         <p className="text-xs text-gray-600 mb-3">This action cannot be undone.</p>
//         <div className="flex gap-2 justify-end">
//           <button
//             onClick={closeToast}
//             className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition text-sm"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={async () => {
//               closeToast();
//               const loading = toast.loading('Removing role...', { position: 'top-right' });
              
//               try {
//                 await deleteAssignment({ 
//                   user_id: userId, 
//                   role_name: roleName 
//                 }).unwrap();
                
//                 toast.dismiss(loading);
//                 toast.success('✅ Role permanently removed!', { 
//                   position: 'top-right',
//                   autoClose: 2000 
//                 });
                
//                 await refetch();
                
//                 const currentUserId = parseInt(localStorage.getItem('userId'));
//                 if (userId === currentUserId) {
//                   setTimeout(() => {
//                     window.location.reload();
//                   }, 1500);
//                 }
//               } catch (error) {
//                 toast.dismiss(loading);
                
//                 // ✅ Show user-friendly error message
//                 const errorMessage = error.data?.message || error.message || 'Failed to remove role';
//                 toast.error(`❌ ${errorMessage}`, { 
//                   position: 'top-right',
//                   autoClose: 5000 
//                 });
//               }
//             }}
//             className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
//           >
//             Confirm Delete
//           </button>
//         </div>
//       </div>
//     ),
//     { 
//       position: 'top-center', 
//       autoClose: false, 
//       closeButton: true,
//       closeOnClick: false,
//       draggable: false,
//     }
//   );
// };
  
//   // Handle deactivate assignment (kept for backward compatibility)
//   const handleDeactivate = async (userId, roleName) => {
//     if (!window.confirm(`Are you sure you want to remove "${roleName}" role from this user?`)) return;
    
//     try {
//       await deactivateAssignment({
//         user_id: userId,
//         role_name: roleName,
//         reason: 'Manual deactivation by admin',
//       }).unwrap();
      
//       toast.success('Role removed successfully!');
//       refetch();
//     } catch (error) {
//       toast.error(error.data?.message || 'Failed to remove role');
//     }
//   };
  
//   // Reset form
//   const resetForm = () => {
//     setUserSearchTerm('');
//     setSelectedUser(null);
//     setAssignFormData({
//       roleId: '',
//       assignment_type: 'manual',
//       expires_at: '',
//       reason: '',
//     });
//   };
  
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <Loader className="animate-spin text-blue-600" size={48} />
//       </div>
//     );
//   }
  
//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-900">User Role Assignments</h2>
//           <p className="text-gray-600 mt-1">Manage user role assignments and permissions </p>
//         </div>
//         <button
//           onClick={() => setShowAssignModal(true)}
//           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//         >
//           <UserPlus size={20} />
//           <span>Assign Role</span>
//         </button>
//       </div>
      
//       {/* Filters and Search */}
//       <div className="bg-white rounded-lg shadow p-4 space-y-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {/* Search */}
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//             <input
//               type="text"
//               placeholder="Search by user email..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
          
//           {/* Filter by status */}
//           <select
//             value={filterActive}
//             onChange={(e) => setFilterActive(e.target.value)}
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           >
//             <option value="all">All Assignments</option>
//             <option value="active">Active Only</option>
//             <option value="inactive">Inactive Only</option>
//           </select>
//         </div>
//       </div>
      
//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center gap-4">
//             <div className="p-3 bg-purple-100 rounded-lg">
//               <User className="text-purple-600" size={24} />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600">Total Users</p>
//               <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center gap-4">
//             <div className="p-3 bg-blue-100 rounded-lg">
//               <Shield className="text-blue-600" size={24} />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600">Total Assignments</p>
//               <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center gap-4">
//             <div className="p-3 bg-green-100 rounded-lg">
//               <Shield className="text-green-600" size={24} />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600">Active</p>
//               <p className="text-2xl font-bold text-gray-900">{stats.activeAssignments}</p>
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center gap-4">
//             <div className="p-3 bg-red-100 rounded-lg">
//               <Shield className="text-red-600" size={24} />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600">Inactive</p>
//               <p className="text-2xl font-bold text-gray-900">{stats.inactiveAssignments}</p>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {/* Users Table */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   User
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Roles
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredUsers.map((user) => {
//                 const isExpanded = expandedUsers.has(user.user_id);
//                 const activeRoles = user.roles.filter(r => r.is_active);
//                 const inactiveRoles = user.roles.filter(r => !r.is_active);
                
//                 return (
//                   <React.Fragment key={user.user_id}>
//                     {/* Main Row */}
//                     <tr className="hover:bg-gray-50 transition">
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-3">
//                           <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
//                             {user.user_email?.[0]?.toUpperCase() || 'U'}
//                           </div>
//                           <div>
//                             <p className="text-sm font-medium text-gray-900">
//                               {user.user_email}
//                             </p>
//                             <p className="text-xs text-gray-500">
//                               User ID: {user.user_id}
//                             </p>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex flex-wrap gap-2">
//                           {activeRoles.map((role, index) => (
//                             <span
//                               key={index}
//                               className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(role.role_name)}`}
//                             >
//                               {role.role_name}
//                             </span>
//                           ))}
//                           {activeRoles.length === 0 && (
//                             <span className="text-sm text-gray-500">No active roles</span>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm">
//                           <span className="text-green-600 font-medium">{activeRoles.length} Active</span>
//                           {inactiveRoles.length > 0 && (
//                             <span className="text-gray-400"> / {inactiveRoles.length} Inactive</span>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <button
//                           onClick={() => toggleExpanded(user.user_id)}
//                           className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition"
//                         >
//                           {isExpanded ? (
//                             <>
//                               <ChevronUp size={16} />
//                               Hide Details
//                             </>
//                           ) : (
//                             <>
//                               <ChevronDown size={16} />
//                               Manage Roles
//                             </>
//                           )}
//                         </button>
//                       </td>
//                     </tr>
                    
//                     {/* Expanded Details Row */}
//                     {isExpanded && (
//                       <tr className="bg-gray-50">
//                         <td colSpan="4" className="px-6 py-4">
//                           <div className="space-y-4">
//                             <h4 className="font-semibold text-gray-900 mb-3">Role Details</h4>
                            
//                             {/* Active Roles */}
//                {activeRoles.length > 0 && (
//   <div>
//     <h5 className="text-sm font-medium text-gray-700 mb-2">Active Roles</h5>
//     <div className="space-y-2">
//       {activeRoles.map((role, index) => {
//         // ✅ Check if this is Voter role and the only role
//         const isVoter = role.role_name.toLowerCase() === 'voter';
//         const isOnlyRole = activeRoles.length === 1;
//         const cannotDelete = isVoter && (isOnlyRole || activeRoles.every(r => r.role_name.toLowerCase() === 'voter'));
        
//         return (
//           <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
//             <div className="flex-1">
//               <div className="flex items-center gap-3">
//                 <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(role.role_name)}`}>
//                   {role.role_name}
//                 </span>
//                 <span className="text-xs text-gray-500">
//                   {formatAssignmentType(role.assignment_type)}
//                 </span>
//                 {/* ✅ Show badge if role is protected */}
//                 {isVoter && (
//                   <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded border border-blue-300">
//                     Protected
//                   </span>
//                 )}
//               </div>
//               <div className="mt-2 flex items-center gap-4 text-xs text-gray-600">
//                 <span className="flex items-center gap-1">
//                   <Calendar size={12} />
//                   Assigned: {formatDate(role.assigned_at)}
//                 </span>
//                 {role.expires_at && (
//                   <span className="text-orange-600">
//                     Expires: {formatDate(role.expires_at)}
//                   </span>
//                 )}
//               </div>
//             </div>
            
//             {/* ✅ Delete button with protection */}
//             {cannotDelete ? (
//               <div 
//                 className="p-2 text-gray-400 cursor-not-allowed" 
//                 title="Voter is the base role and cannot be deleted"
//               >
//                 <Trash2 size={16} />
//               </div>
//             ) : (
//               <button
//                 onClick={() => handleDelete(user.user_id, role.role_name)}
//                 disabled={deleting}
//                 className="p-2 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
//                 title="Permanently remove role"
//               >
//                 <Trash2 size={16} />
//               </button>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   </div>
// )}
                            
//                             {/* Inactive Roles */}
//                             {inactiveRoles.length > 0 && (
//                               <div>
//                                 <h5 className="text-sm font-medium text-gray-700 mb-2">Inactive Roles</h5>
//                                 <div className="space-y-2">
//                                   {inactiveRoles.map((role, index) => (
//                                     <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 opacity-60">
//                                       <div className="flex-1">
//                                         <div className="flex items-center gap-3">
//                                           <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-300">
//                                             {role.role_name}
//                                           </span>
//                                           <span className="text-xs text-gray-500">Deactivated</span>
//                                         </div>
//                                         <div className="mt-2 text-xs text-gray-500">
//                                           Deactivated: {formatDate(role.deactivated_at || role.assigned_at)}
//                                         </div>
//                                       </div>
//                                     </div>
//                                   ))}
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         </td>
//                       </tr>
//                     )}
//                   </React.Fragment>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
        
//         {filteredUsers.length === 0 && (
//           <div className="text-center py-12 text-gray-500">
//             No users found
//           </div>
//         )}
//       </div>
      
//       {/* Assign Role Modal */}
//       {showAssignModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
//             <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 bg-white">
//               <h3 className="text-xl font-bold text-gray-900">Assign Role to User</h3>
//               <button
//                 onClick={() => {
//                   setShowAssignModal(false);
//                   resetForm();
//                 }}
//                 className="p-2 hover:bg-gray-100 rounded transition"
//               >
//                 <X size={20} />
//               </button>
//             </div>
            
//             <form onSubmit={handleAssignRole} className="p-6 space-y-4">
//               {/* User Search */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Search User (by email, phone, or name) *
//                 </label>
//                 <input
//                   type="text"
//                   value={userSearchTerm}
//                   onChange={(e) => {
//                     setUserSearchTerm(e.target.value);
//                     setSelectedUser(null);
//                   }}
//                   placeholder="Type at least 3 characters..."
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 />
                
//                 {/* User Search Results */}
//                 {userSearchTerm.length >= 3 && (
//                   <div className="mt-2 border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
//                     {searchingUsers ? (
//                       <div className="p-4 text-center">
//                         <Loader className="animate-spin mx-auto text-blue-600" size={24} />
//                       </div>
//                     ) : Array.isArray(usersSearchData?.data) && usersSearchData.data.length > 0 ? (
//                       usersSearchData.data.map((user) => (
//                         <button
//                           key={user.user_id}
//                           type="button"
//                           onClick={() => {
//                             setSelectedUser(user);
//                             setUserSearchTerm(user.user_email || user.user_phone || user.user_name);
//                           }}
//                           className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-200 last:border-0"
//                         >
//                           <div className="font-medium text-gray-900">
//                             {user.user_firstname && user.user_lastname 
//                               ? `${user.user_firstname} ${user.user_lastname}`
//                               : user.user_name || 'Unknown User'
//                             }
//                           </div>
//                           <div className="text-sm text-gray-600">{user.user_email}</div>
//                           <div className="text-xs text-gray-500">
//                             {user.user_phone && `Phone: ${user.user_phone} | `}
//                             ID: {user.user_id}
//                           </div>
//                         </button>
//                       ))
//                     ) : (
//                       <div className="p-4 text-center text-gray-500">No users found</div>
//                     )}
//                   </div>
//                 )}

//                 {/* Selected User */}
//                 {selectedUser && (
//                   <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <div className="font-medium text-gray-900">
//                           {selectedUser.user_firstname && selectedUser.user_lastname
//                             ? `${selectedUser.user_firstname} ${selectedUser.user_lastname}`
//                             : selectedUser.user_name || 'Unknown User'
//                           }
//                         </div>
//                         <div className="text-sm text-gray-600">{selectedUser.user_email}</div>
//                         {selectedUser.user_phone && (
//                           <div className="text-xs text-gray-500">Phone: {selectedUser.user_phone}</div>
//                         )}
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setSelectedUser(null);
//                           setUserSearchTerm('');
//                         }}
//                         className="text-gray-400 hover:text-gray-600"
//                       >
//                         <X size={16} />
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
              
//               {/* Role */}
//    {/* Role */}
// <div>
//   <label className="block text-sm font-medium text-gray-700 mb-2">
//     Select Role * (Admin Roles Only)
//   </label>
//   <select
//     required
//     value={assignFormData.roleId}
//     onChange={(e) => setAssignFormData({ ...assignFormData, roleId: e.target.value })}
//     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//   >
//     <option value="">-- Select a role --</option>
//     {/* ✅ Filter to show only admin roles */}
//     {(rolesData?.data || [])
//       .filter(role => role.role_type === 'admin')
//       .map(role => (
//         <option key={role.role_id} value={role.role_id}>
//           {role.role_name}
//         </option>
//       ))}
//   </select>
//   {/* ✅ Helper text */}
//   <p className="mt-1 text-xs text-gray-500">
//     Only admin roles can be manually assigned. User roles are system-managed.
//   </p>
// </div>
//               {/* Assignment Type */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Assignment Type
//                 </label>
//                 <select
//                   value={assignFormData.assignment_type}
//                   onChange={(e) => setAssignFormData({ ...assignFormData, assignment_type: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="manual">Manual</option>
//                   <option value="automatic">Automatic</option>
//                   <option value="subscription">Subscription</option>
//                   <option value="action_triggered">Action Triggered</option>
//                 </select>
//               </div>
              
//               {/* Expires At */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Expires At (Optional)
//                 </label>
//                 <input
//                   type="datetime-local"
//                   value={assignFormData.expires_at}
//                   onChange={(e) => setAssignFormData({ ...assignFormData, expires_at: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
              
//               {/* Reason */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Note (Optional)
//                 </label>
//                 <textarea
//                   value={assignFormData.reason}
//                   onChange={(e) => setAssignFormData({ ...assignFormData, reason: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                   rows="2"
//                   placeholder="Add any additional notes..."
//                 />
//               </div>
              
//               {/* Actions */}
//               <div className="flex justify-end gap-3 pt-4">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowAssignModal(false);
//                     resetForm();
//                   }}
//                   className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
//                   disabled={assigning}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 flex items-center gap-2"
//                   disabled={!selectedUser || !assignFormData.roleId || assigning}
//                 >
//                   {assigning && <Loader className="animate-spin" size={16} />}
//                   {assigning ? 'Assigning...' : 'Assign Role'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
