//role management disabled version
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { Search, Plus, Edit2, Trash2, X, Loader, Lock, Eye } from 'lucide-react';
import { useCreateRoleMutation, useDeleteRoleMutation, useGetAllRolesQuery, useUpdateRoleMutation } from '../../../../redux/api/role/roleApi';
import { setAllRoles } from '../../../../redux/slices/roleSlice';
import { setError, setLoading } from '../../../../redux/slices/authSlice';
import { getRoleBadgeColor, filterRoles } from '../../../../utils/roleHelpers';

export default function RoleManagement() {
  const dispatch = useDispatch();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showViewModal, setShowViewModal] = useState(false); // ✅ Changed from create/edit to view
  const [selectedRole, setSelectedRole] = useState(null);
  
  // API hooks
  const { data: rolesData, isLoading, error } = useGetAllRolesQuery({
    role_type: filterType === 'all' ? undefined : filterType,
  });
  
  // ✅ Keep these for future use (but don't use them now)
  /*eslint-disable*/
  const [createRole, { isLoading: creating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: updating }] = useUpdateRoleMutation();
  const [deleteRole, { isLoading: deleting }] = useDeleteRoleMutation();
  
  // Update Redux store when roles data changes
  useEffect(() => {
    if (rolesData?.data) {
      dispatch(setAllRoles(rolesData.data));
    }
  }, [rolesData, dispatch]);
  
  useEffect(() => {
    dispatch(setLoading(isLoading));
  }, [isLoading, dispatch]);
  
  useEffect(() => {
    if (error) {
      dispatch(setError(error.data?.message || 'Failed to load roles'));
    }
  }, [error, dispatch]);
  
  // Filter roles
  const filteredRoles = filterRoles(rolesData?.data || [], searchTerm);
  
  // ✅ View role details (read-only)
  const openViewModal = (role) => {
    setSelectedRole(role);
    setShowViewModal(true);
  };
  
  // ✅ Disabled actions with toast notifications
  const handleCreateRole = () => {
    toast.info('Role creation is currently disabled. This feature will be available soon.', {
      position: 'top-center',
      autoClose: 3000,
    });
  };
  
  const handleEditRole = (role) => {
    toast.info('Role editing is currently disabled. Roles are read-only for now.', {
      position: 'top-center',
      autoClose: 3000,
    });
  };
  
  const handleDeleteRole = (role) => {
    toast.info('Role deletion is currently disabled. Roles are read-only for now.', {
      position: 'top-center',
      autoClose: 3000,
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
          <h2 className="text-3xl font-bold text-gray-900">Role Management</h2>
          <p className="text-gray-600 mt-1">View system roles and permissions (Read-Only Mode)</p>
        </div>
        {/* ✅ Disabled Create Button */}
        <button
          onClick={handleCreateRole}
          className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-60"
          title="Role creation is currently disabled"
        >
          <Lock size={20} />
          <span>Create Role (Disabled)</span>
        </button>
      </div>
      
      {/* ✅ Read-Only Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Lock className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <p className="text-blue-900 font-medium">Read-Only Mode</p>
          <p className="text-blue-700 text-sm">
            Role management is currently in read-only mode. You can view role details but cannot create, edit, or delete roles at this time.
          </p>
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
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Filter by type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="admin">Admin Roles</option>
            <option value="user">User Roles</option>
          </select>
        </div>
      </div>
      
      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoles.map((role) => (
          <div
            key={role.role_id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-l-4 border-gray-400"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {role.role_name}
                  </h3>
                  <Lock size={14} className="text-gray-500" title="Read-only" />
                </div>
                <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(role.role_name)}`}>
                  {role.role_type}
                </span>
              </div>
              
              {/* ✅ Action Buttons (All Disabled) */}
              <div className="flex gap-2">
                {/* View Button (Active) */}
                <button
                  onClick={() => openViewModal(role)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                  title="View role details"
                >
                  <Eye size={16} />
                </button>
                
                {/* Edit Button (Disabled) */}
                <button
                  onClick={() => handleEditRole(role)}
                  className="p-2 text-gray-400 cursor-not-allowed rounded"
                  title="Editing is currently disabled"
                >
                  <Edit2 size={16} />
                </button>
                
                {/* Delete Button (Disabled) */}
                <button
                  onClick={() => handleDeleteRole(role)}
                  className="p-2 text-gray-400 cursor-not-allowed rounded"
                  title="Deletion is currently disabled"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              {role.description || 'No description'}
            </p>
            
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="font-medium">{role.role_category}</span>
              </div>
              <div className="flex justify-between">
                <span>Subscription:</span>
                <span className="font-medium">
                  {role.requires_subscription ? 'Required' : 'Not required'}
                </span>
              </div>
              {role.action_trigger && (
                <div className="flex justify-between">
                  <span>Trigger:</span>
                  <span className="font-medium">{role.action_trigger}</span>
                </div>
              )}
            </div>
            
            {/* ✅ Read-only indicator */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Lock size={12} />
                Read-only mode
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {filteredRoles.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No roles found</p>
        </div>
      )}
      
      {/* ✅ View Role Modal (Read-Only) */}
      {showViewModal && selectedRole && (
        <RoleViewModal
          role={selectedRole}
          onClose={() => {
            setShowViewModal(false);
            setSelectedRole(null);
          }}
        />
      )}
    </div>
  );
}

// ✅ Read-Only Role View Modal
function RoleViewModal({ role, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-gray-900">Role Details</h3>
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded flex items-center gap-1">
              <Lock size={12} />
              Read-Only
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Role Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Name
            </label>
            <div className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
              {role.role_name}
            </div>
          </div>
          
          {/* Role Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Type
            </label>
            <div className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(role.role_name)}`}>
                {role.role_type}
              </span>
            </div>
          </div>
          
          {/* Role Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Category
            </label>
            <div className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
              {role.role_category}
            </div>
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <div className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 min-h-[80px]">
              {role.description || 'No description provided'}
            </div>
          </div>
          
          {/* Settings */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Settings
            </label>
            
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
              <input
                type="checkbox"
                checked={role.requires_subscription}
                disabled
                className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-not-allowed"
              />
              <span className="text-sm text-gray-700">Requires Subscription</span>
            </div>
            
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
              <input
                type="checkbox"
                checked={role.requires_action_trigger}
                disabled
                className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-not-allowed"
              />
              <span className="text-sm text-gray-700">Requires Action Trigger</span>
            </div>
          </div>
          
          {/* Action Trigger */}
          {role.action_trigger && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action Trigger
              </label>
              <div className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                {role.action_trigger}
              </div>
            </div>
          )}
          
          {/* Metadata */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Role ID:</span>
                <span className="ml-2 font-medium text-gray-900">{role.role_id}</span>
              </div>
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {role.created_at ? new Date(role.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
//role management enabled version
// import React, { useState, useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import { toast } from 'react-toastify';

// import { Search, Plus, Edit2, Trash2, X, Loader } from 'lucide-react';
// import { useCreateRoleMutation, useDeleteRoleMutation, useGetAllRolesQuery, useUpdateRoleMutation } from '../../../../redux/api/role/roleApi';
// import { setAllRoles } from '../../../../redux/slices/roleSlice';
// import { setError, setLoading } from '../../../../redux/slices/authSlice';
// import { getRoleBadgeColor, filterRoles } from '../../../../utils/roleHelpers';

// export default function RoleManagement() {
//   const dispatch = useDispatch();
  
//   // State
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterType, setFilterType] = useState('all');
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [selectedRole, setSelectedRole] = useState(null);
  
//   // Form state
//   const [formData, setFormData] = useState({
//     role_name: '',
//     role_type: 'user',
//     role_category: 'voter',
//     description: '',
//     requires_subscription: false,
//     requires_action_trigger: false,
//     action_trigger: '',
//   });
  
//   // API hooks
//   const { data: rolesData, isLoading, error, refetch } = useGetAllRolesQuery({
//     role_type: filterType === 'all' ? undefined : filterType,
//   });
  
//   const [createRole, { isLoading: creating }] = useCreateRoleMutation();
//   const [updateRole, { isLoading: updating }] = useUpdateRoleMutation();
//   const [deleteRole, { isLoading: deleting }] = useDeleteRoleMutation();
  
//   // Update Redux store when roles data changes
//   useEffect(() => {
//     if (rolesData?.data) {
//       dispatch(setAllRoles(rolesData.data));
//     }
//   }, [rolesData, dispatch]);
  
//   useEffect(() => {
//     dispatch(setLoading(isLoading));
//   }, [isLoading, dispatch]);
  
//   useEffect(() => {
//     if (error) {
//       dispatch(setError(error.data?.message || 'Failed to load roles'));
//     }
//   }, [error, dispatch]);
  
//   // Filter roles
//   const filteredRoles = filterRoles(rolesData?.data || [], searchTerm);
  
//   // Handle create role
//   const handleCreateRole = async (e) => {
//     e.preventDefault();
    
//     try {
//       await createRole(formData).unwrap();
//       toast.success('Role created successfully!');
//       setShowCreateModal(false);
//       resetForm();
//       refetch();
//     } catch (error) {
//       toast.error(error.data?.message || 'Failed to create role');
//     }
//   };
  
//   // Handle update role
//   const handleUpdateRole = async (e) => {
//     e.preventDefault();
    
//     try {
//       await updateRole({
//         roleId: selectedRole.role_id,
//         ...formData,
//       }).unwrap();
//       toast.success('Role updated successfully!');
//       setShowEditModal(false);
//       resetForm();
//       refetch();
//     } catch (error) {
//       toast.error(error.data?.message || 'Failed to update role');
//     }
//   };
  
//   // Handle delete role
//   const handleDeleteRole = async (roleId) => {
//     if (!window.confirm('Are you sure you want to delete this role?')) return;
    
//     try {
//       await deleteRole(roleId).unwrap();
//       toast.success('Role deleted successfully!');
//       refetch();
//     } catch (error) {
//       toast.error(error.data?.message || 'Failed to delete role');
//     }
//   };
  
//   // Reset form
//   const resetForm = () => {
//     setFormData({
//       role_name: '',
//       role_type: 'user',
//       role_category: 'voter',
//       description: '',
//       requires_subscription: false,
//       requires_action_trigger: false,
//       action_trigger: '',
//     });
//     setSelectedRole(null);
//   };
  
//   // Open edit modal
//   const openEditModal = (role) => {
//     setSelectedRole(role);
//     setFormData({
//       role_name: role.role_name,
//       role_type: role.role_type,
//       role_category: role.role_category,
//       description: role.description || '',
//       requires_subscription: role.requires_subscription,
//       requires_action_trigger: role.requires_action_trigger,
//       action_trigger: role.action_trigger || '',
//     });
//     setShowEditModal(true);
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
//           <h2 className="text-3xl font-bold text-gray-900">Role Management</h2>
//           <p className="text-gray-600 mt-1">Manage system roles and permissions</p>
//         </div>
//         <button
//           onClick={() => setShowCreateModal(true)}
//           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//         >
//           <Plus size={20} />
//           <span>Create Role</span>
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
//               placeholder="Search roles..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
          
//           {/* Filter by type */}
//           <select
//             value={filterType}
//             onChange={(e) => setFilterType(e.target.value)}
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           >
//             <option value="all">All Types</option>
//             <option value="admin">Admin Roles</option>
//             <option value="user">User Roles</option>
//           </select>
//         </div>
//       </div>
      
//       {/* Roles Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {filteredRoles.map((role) => (
//           <div
//             key={role.role_id}
//             className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
//           >
//             <div className="flex justify-between items-start mb-4">
//               <div className="flex-1">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                   {role.role_name}
//                 </h3>
//                 <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(role.role_name)}`}>
//                   {role.role_type}
//                 </span>
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => openEditModal(role)}
//                   className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
//                   title="Edit role"
//                 >
//                   <Edit2 size={16} />
//                 </button>
//                 <button
//                   onClick={() => handleDeleteRole(role.role_id)}
//                   className="p-2 text-red-600 hover:bg-red-50 rounded transition"
//                   title="Delete role"
//                   disabled={deleting}
//                 >
//                   <Trash2 size={16} />
//                 </button>
//               </div>
//             </div>
            
//             <p className="text-sm text-gray-600 mb-4">
//               {role.description || 'No description'}
//             </p>
            
//             <div className="space-y-2 text-xs text-gray-500">
//               <div className="flex justify-between">
//                 <span>Category:</span>
//                 <span className="font-medium">{role.role_category}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Subscription:</span>
//                 <span className="font-medium">
//                   {role.requires_subscription ? 'Required' : 'Not required'}
//                 </span>
//               </div>
//               {role.action_trigger && (
//                 <div className="flex justify-between">
//                   <span>Trigger:</span>
//                   <span className="font-medium">{role.action_trigger}</span>
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>
      
//       {filteredRoles.length === 0 && (
//         <div className="bg-white rounded-lg shadow p-12 text-center">
//           <p className="text-gray-500">No roles found</p>
//         </div>
//       )}
      
//       {/* Create Role Modal */}
//       {showCreateModal && (
//         <RoleFormModal
//           title="Create New Role"
//           formData={formData}
//           setFormData={setFormData}
//           onSubmit={handleCreateRole}
//           onClose={() => {
//             setShowCreateModal(false);
//             resetForm();
//           }}
//           isLoading={creating}
//         />
//       )}
      
//       {/* Edit Role Modal */}
//       {showEditModal && (
//         <RoleFormModal
//           title="Edit Role"
//           formData={formData}
//           setFormData={setFormData}
//           onSubmit={handleUpdateRole}
//           onClose={() => {
//             setShowEditModal(false);
//             resetForm();
//           }}
//           isLoading={updating}
//         />
//       )}
//     </div>
//   );
// }

// // Role Form Modal Component
// function RoleFormModal({ title, formData, setFormData, onSubmit, onClose, isLoading }) {
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
//           <h3 className="text-xl font-bold text-gray-900">{title}</h3>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-gray-100 rounded transition"
//           >
//             <X size={20} />
//           </button>
//         </div>
        
//         <form onSubmit={onSubmit} className="p-6 space-y-4">
//           {/* Role Name */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Role Name *
//             </label>
//             <input
//               type="text"
//               required
//               value={formData.role_name}
//               onChange={(e) => setFormData({ ...formData, role_name: e.target.value })}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="Enter role name"
//             />
//           </div>
          
//           {/* Role Type */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Role Type *
//             </label>
//             <select
//               required
//               value={formData.role_type}
//               onChange={(e) => setFormData({ ...formData, role_type: e.target.value })}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               <option value="admin">Admin</option>
//               <option value="user">User</option>
//             </select>
//           </div>
          
//           {/* Role Category */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Role Category *
//             </label>
//             <select
//               required
//               value={formData.role_category}
//               onChange={(e) => setFormData({ ...formData, role_category: e.target.value })}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               <option value="platform">Platform</option>
//               <option value="election_creator">Election Creator</option>
//               <option value="voter">Voter</option>
//               <option value="sponsor">Sponsor</option>
//             </select>
//           </div>
          
//           {/* Description */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Description
//             </label>
//             <textarea
//               value={formData.description}
//               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               rows="3"
//               placeholder="Enter role description"
//             />
//           </div>
          
//           {/* Checkboxes */}
//           <div className="space-y-3">
//             <label className="flex items-center gap-3">
//               <input
//                 type="checkbox"
//                 checked={formData.requires_subscription}
//                 onChange={(e) => setFormData({ ...formData, requires_subscription: e.target.checked })}
//                 className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//               />
//               <span className="text-sm text-gray-700">Requires Subscription</span>
//             </label>
            
//             <label className="flex items-center gap-3">
//               <input
//                 type="checkbox"
//                 checked={formData.requires_action_trigger}
//                 onChange={(e) => setFormData({ ...formData, requires_action_trigger: e.target.checked })}
//                 className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//               />
//               <span className="text-sm text-gray-700">Requires Action Trigger</span>
//             </label>
//           </div>
          
//           {/* Action Trigger */}
//           {formData.requires_action_trigger && (
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Action Trigger
//               </label>
//               <select
//                 value={formData.action_trigger}
//                 onChange={(e) => setFormData({ ...formData, action_trigger: e.target.value })}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="">Select trigger</option>
//                 <option value="create_election">Create Election</option>
//                 <option value="create_organization_election">Create Organization Election</option>
//                 <option value="content_integration">Content Integration</option>
//                 <option value="deposit_funds">Deposit Funds</option>
//               </select>
//             </div>
//           )}
          
//           {/* Actions */}
//           <div className="flex justify-end gap-3 pt-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
//               disabled={isLoading}
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <span className="flex items-center gap-2">
//                   <Loader className="animate-spin" size={16} />
//                   Saving...
//                 </span>
//               ) : (
//                 'Save Role'
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }