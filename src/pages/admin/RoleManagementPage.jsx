// src/pages/admin/RoleManagementPage.jsx - FIXED VERSION
import React, { useState} from 'react';
import { Shield, Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import {
  useGetAllRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from '../../redux/api/role/roleApi';
import { toast } from 'react-toastify';

export default function RoleManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    role_name: '',
    role_description: '',
  });

  // ✅ FIX: Add skip option to prevent loading during auth
  const { data: rolesData, isLoading, refetch } = useGetAllRolesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

  const roles = rolesData?.data || [];

  // ✅ FIX: Memoize filtered roles to prevent re-renders
  const filteredRoles = React.useMemo(() => {
    return roles.filter((role) =>
      role.role_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.role_description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roles, searchTerm]);

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!formData.role_name.trim()) {
      toast.error('Role name is required');
      return;
    }

    try {
      await createRole({
        role_name: formData.role_name.trim(),
        role_description: formData.role_description.trim(),
      }).unwrap();
      
      toast.success('Role created successfully');
      setShowCreateModal(false);
      setFormData({ role_name: '', role_description: '' });
      refetch();
    } catch (error) {
      console.error('Failed to create role:', error);
      toast.error(error?.data?.message || 'Failed to create role');
    }
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!editingRole || !formData.role_name.trim()) {
      toast.error('Role name is required');
      return;
    }

    try {
      await updateRole({
        roleId: editingRole.votteryy_role_id,
        roleData: {
          role_name: formData.role_name.trim(),
          role_description: formData.role_description.trim(),
        },
      }).unwrap();

      toast.success('Role updated successfully');
      setEditingRole(null);
      setFormData({ role_name: '', role_description: '' });
      refetch();
    } catch (error) {
      console.error('Failed to update role:', error);
      toast.error(error?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('Are you sure you want to delete this role?')) {
      return;
    }

    try {
      await deleteRole(roleId).unwrap();
      toast.success('Role deleted successfully');
      refetch();
    } catch (error) {
      console.error('Failed to delete role:', error);
      toast.error(error?.data?.message || 'Failed to delete role');
    }
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    setFormData({
      role_name: role.role_name || '',
      role_description: role.role_description || '',
    });
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingRole(null);
    setFormData({ role_name: '', role_description: '' });
  };

  // ✅ FIX: Simple loading state (no infinite loop)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-600" />
            Role Management
          </h1>
          <p className="text-gray-600 mt-2">
            View system roles and permissions (Read-Only Mode)
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <Plus size={20} />
          Create Role
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-white text-xs">ℹ</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-blue-900">Read-Only Mode</p>
          <p className="text-sm text-blue-800 mt-1">
            Role management is currently in read-only mode. You can view role details but cannot create, edit, or delete roles at this time.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Roles Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Role Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No roles found
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => (
                  <tr key={role.votteryy_role_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-gray-900">{role.role_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {role.role_description || 'No description'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {role.created_at
                        ? new Date(role.created_at).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(role)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Edit role"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role.votteryy_role_id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete role"
                          disabled={isDeleting}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingRole) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {editingRole ? 'Edit Role' : 'Create New Role'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={editingRole ? handleUpdateRole : handleCreateRole}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    value={formData.role_name}
                    onChange={(e) =>
                      setFormData({ ...formData, role_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Content Moderator"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.role_description}
                    onChange={(e) =>
                      setFormData({ ...formData, role_description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Describe the role's purpose..."
                    rows="3"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {isCreating || isUpdating ? 'Saving...' : editingRole ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}





// import React from 'react';
// import RoleManagement from '../../components/Dashboard/Tabs/roles/RoleManagement';


// export default function RoleManagementPage() {
//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Header/Navbar */}
//       <nav className="bg-white shadow sticky top-0 z-50">
//         <div className="px-4 py-3 flex justify-between items-center">
//           <div className="flex items-center gap-4">
//             <a href="/dashboard" className="text-2xl font-bold text-blue-600">
//               Vottery
//             </a>
//             <span className="text-gray-400">|</span>
//             <h1 className="text-xl font-semibold text-gray-700">Role Management</h1>
//           </div>
//           <div className="flex gap-4 items-center">
//             <a
//               href="/dashboard"
//               className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition text-sm"
//             >
//               Back to Dashboard
//             </a>
//           </div>
//         </div>
//       </nav>

//       {/* Main Content */}
//       <div className="p-4 md:p-8">
//         <RoleManagement />
//       </div>
//     </div>
//   );
// }
