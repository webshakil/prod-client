import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useGetUserRolesQuery } from '../../../redux/api/role/roleApi';
import { useAssignRoleMutation } from '../../../redux/api/role/assignmentApi';
import { getRoleBadgeColor } from '../../../utils/roleHelpers';
import { Search, Edit, Trash2, Shield, UserPlus, Loader, Mail, Calendar, Eye, X } from 'lucide-react';

export default function UserManagement() {
  // State
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  
  // Mock users data - Replace with actual API call
  useEffect(() => {
    // TODO: Replace with actual API call to user service
    const mockUsers = [
      {
        user_id: 1,
        email: 'john@example.com',
        user_firstname: 'John',
        user_lastname: 'Doe',
        is_active: true,
        created_at: '2024-01-15T10:30:00Z',
      },
      {
        user_id: 2,
        email: 'jane@example.com',
        user_firstname: 'Jane',
        user_lastname: 'Smith',
        is_active: true,
        created_at: '2024-02-20T14:20:00Z',
      },
      {
        user_id: 3,
        email: 'bob@example.com',
        user_firstname: 'Bob',
        user_lastname: 'Johnson',
        is_active: false,
        created_at: '2024-03-10T09:15:00Z',
      },
    ];
    setUsers(mockUsers);
  }, []);
  
  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_lastname?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.is_active) ||
      (filterStatus === 'inactive' && !user.is_active);
    
    return matchesSearch && matchesStatus;
  });
  
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetailsModal(true);
  };
  
  const handleAssignRole = (user) => {
    setSelectedUser(user);
    setShowAssignRoleModal(true);
  };
  
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      // TODO: Implement delete user API call
      toast.success('User deleted successfully!');
      setUsers(users.filter(u => u.user_id !== userId));
      /*eslint-disable*/
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">Manage users, roles, and permissions</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <UserPlus size={20} />
          <span>Add User</span>
        </button>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Filter by Role */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="voter">Voters</option>
            <option value="creator">Creators</option>
            <option value="admin">Admins</option>
            <option value="manager">Managers</option>
          </select>
          
          {/* Filter by Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<UserPlus className="text-blue-600" size={24} />}
          label="Total Users"
          value={users.length}
          bgColor="bg-blue-100"
        />
        <StatCard
          icon={<Shield className="text-green-600" size={24} />}
          label="Active Users"
          value={users.filter(u => u.is_active).length}
          bgColor="bg-green-100"
        />
        <StatCard
          icon={<Shield className="text-yellow-600" size={24} />}
          label="Admins"
          value="2"
          bgColor="bg-yellow-100"
        />
        <StatCard
          icon={<Shield className="text-purple-600" size={24} />}
          label="Creators"
          value="12"
          bgColor="bg-purple-100"
        />
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
                  Email
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
              {filteredUsers.map((user) => (
                <UserTableRow
                  key={user.user_id}
                  user={user}
                  onView={handleViewUser}
                  onAssignRole={handleAssignRole}
                  onDelete={handleDeleteUser}
                />
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No users found
          </div>
        )}
      </div>
      
      {/* User Details Modal */}
      {showUserDetailsModal && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => {
            setShowUserDetailsModal(false);
            setSelectedUser(null);
          }}
        />
      )}
      
      {/* Assign Role Modal */}
      {showAssignRoleModal && selectedUser && (
        <AssignRoleModal
          user={selectedUser}
          onClose={() => {
            setShowAssignRoleModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, label, value, bgColor }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 ${bgColor} rounded-lg`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

// User Table Row Component with Role Integration
function UserTableRow({ user, onView, onAssignRole, onDelete }) {
  const { data: userRolesData, isLoading } = useGetUserRolesQuery(user.user_id);
  
  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            {user.user_firstname?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {user.user_firstname} {user.user_lastname}
            </p>
            <p className="text-xs text-gray-500">ID: {user.user_id}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail size={14} />
          {user.email}
        </div>
      </td>
      <td className="px-6 py-4">
        <UserRolesDisplay
          roles={userRolesData?.data || []}
          isLoading={isLoading}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
          user.is_active
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {user.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex gap-2">
          <button
            onClick={() => onView(user)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
            title="View details"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => onAssignRole(user)}
            className="p-2 text-green-600 hover:bg-green-50 rounded transition"
            title="Assign role"
          >
            <Shield size={16} />
          </button>
          <button
            onClick={() => onDelete(user.user_id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
            title="Delete user"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// User Roles Display Component
function UserRolesDisplay({ roles, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader className="animate-spin text-gray-400" size={14} />
        <span className="text-xs text-gray-500">Loading...</span>
      </div>
    );
  }
  
  if (!roles || roles.length === 0) {
    return <span className="text-xs text-gray-500">No roles assigned</span>;
  }
  
  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((role) => (
        <span
          key={role.role_id}
          className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(role.role_name)}`}
        >
          {role.role_name}
        </span>
      ))}
    </div>
  );
}

// User Details Modal Component
function UserDetailsModal({ user, onClose }) {
  const { data: userRolesData, isLoading: rolesLoading } = useGetUserRolesQuery(user.user_id);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">User Details</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.user_firstname?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h4 className="text-2xl font-bold text-gray-900">
                {user.user_firstname} {user.user_lastname}
              </h4>
              <p className="text-gray-600">{user.email}</p>
              <span className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${
                user.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          
          {/* User Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">User ID</p>
              <p className="text-lg font-semibold text-gray-900">{user.user_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Joined</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {/* Roles Section */}
          <div>
            <h5 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Shield size={20} />
              Assigned Roles
            </h5>
            {rolesLoading ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin text-blue-600" size={20} />
                <span className="text-gray-500">Loading roles...</span>
              </div>
            ) : userRolesData?.data && userRolesData.data.length > 0 ? (
              <div className="space-y-2">
                {userRolesData.data.map((role) => (
                  <div
                    key={role.role_id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${getRoleBadgeColor(role.role_name)}`}>
                        {role.role_name}
                      </span>
                      <p className="text-xs text-gray-600 mt-1">
                        {role.role_category} • {role.assignment_type}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(role.assigned_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No roles assigned</p>
            )}
          </div>
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

// Assign Role Modal Component
function AssignRoleModal({ user, onClose }) {
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [reason, setReason] = useState('');
  
  const [assignRole, { isLoading }] = useAssignRoleMutation();
  
  // Mock roles - Replace with actual API call
  const roles = [
    { role_id: 1, role_name: 'Voter (Free)' },
    { role_id: 2, role_name: 'Individual Election Creator (Free)' },
    { role_id: 3, role_name: 'Individual Election Creator (Subscribed)' },
    { role_id: 4, role_name: 'Content Creator (Subscribed)' },
    { role_id: 5, role_name: 'Sponsor' },
    { role_id: 6, role_name: 'Admin' },
    { role_id: 7, role_name: 'Manager' },
  ];
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedRoleId) {
      toast.error('Please select a role');
      return;
    }
    
    try {
      await assignRole({
        userId: user.user_id,
        roleId: parseInt(selectedRoleId),
        assignment_type: 'manual',
        reason: reason || 'Manual assignment by admin',
      }).unwrap();
      
      toast.success('Role assigned successfully!');
      onClose();
    } catch (error) {
      toast.error(error.data?.message || 'Failed to assign role');
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Assign Role</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Assign role to: <span className="font-semibold">{user.email}</span>
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Role *
            </label>
            <select
              required
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="2"
              placeholder="Enter reason for assignment"
            />
          </div>
          
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
                  Assigning...
                </span>
              ) : (
                'Assign Role'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}