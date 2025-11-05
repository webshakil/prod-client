// Role and Permission helper utilities

export const ROLE_TYPES = {
  ADMIN: 'admin',
  USER: 'user',
};

export const ROLE_CATEGORIES = {
  PLATFORM: 'platform',
  ELECTION_CREATOR: 'election_creator',
  VOTER: 'voter',
  SPONSOR: 'sponsor',
};

export const ADMIN_ROLES = [
  'Manager',
  'Admin',
  'Moderator',
  'Auditor',
  'Editor',
  'Advertiser',
  'Analyst',
];

export const USER_ROLES = [
  'Voter (Free)',
  'Individual Election Creator (Free)',
  'Individual Election Creator (Subscribed)',
  'Organization Election Creator (Free)',
  'Organization Election Creator (Subscribed)',
  'Content Creator (Subscribed)',
  'Sponsor',
];

// Check if user has specific role
export const hasRole = (userRoles, roleName) => {
  if (!userRoles || !Array.isArray(userRoles)) return false;
  return userRoles.some(role => 
    role.role_name === roleName || role === roleName
  );
};

// Check if user has any of the specified roles
export const hasAnyRole = (userRoles, roleNames) => {
  if (!userRoles || !Array.isArray(userRoles)) return false;
  return roleNames.some(roleName => hasRole(userRoles, roleName));
};

// Check if user is admin
export const isAdmin = (userRoles) => {
  return hasAnyRole(userRoles, ADMIN_ROLES);
};

// Check if user is manager
export const isManager = (userRoles) => {
  return hasRole(userRoles, 'Manager');
};

// Check if user has specific permission
export const hasPermission = (userPermissions, permissionName) => {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  return userPermissions.includes(permissionName);
};

// Get role badge color
export const getRoleBadgeColor = (roleName) => {
  const roleColors = {
    Manager: 'bg-purple-100 text-purple-800 border-purple-200',
    Admin: 'bg-red-100 text-red-800 border-red-200',
    Moderator: 'bg-orange-100 text-orange-800 border-orange-200',
    Auditor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Editor: 'bg-green-100 text-green-800 border-green-200',
    Advertiser: 'bg-pink-100 text-pink-800 border-pink-200',
    Analyst: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    Sponsor: 'bg-blue-100 text-blue-800 border-blue-200',
    'Voter (Free)': 'bg-gray-100 text-gray-800 border-gray-200',
    'Individual Election Creator (Free)': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'Individual Election Creator (Subscribed)': 'bg-teal-100 text-teal-800 border-teal-200',
    'Content Creator (Subscribed)': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };
  
  return roleColors[roleName] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Format role assignment type
export const formatAssignmentType = (type) => {
  const types = {
    automatic: 'Automatic',
    manual: 'Manual',
    subscription: 'Subscription',
    action_triggered: 'Action Triggered',
  };
  
  return types[type] || type;
};

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Group permissions by category
export const groupPermissionsByCategory = (permissions) => {
  const grouped = {};
  
  permissions.forEach(permission => {
    const category = permission.permission_category || 'other';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(permission);
  });
  
  return grouped;
};

// Filter roles by search term
export const filterRoles = (roles, searchTerm) => {
  if (!searchTerm) return roles;
  
  const term = searchTerm.toLowerCase();
  return roles.filter(role =>
    role.role_name.toLowerCase().includes(term) ||
    role.description?.toLowerCase().includes(term) ||
    role.role_category?.toLowerCase().includes(term)
  );
};

export default {
  ROLE_TYPES,
  ROLE_CATEGORIES,
  ADMIN_ROLES,
  USER_ROLES,
  hasRole,
  hasAnyRole,
  isAdmin,
  isManager,
  hasPermission,
  getRoleBadgeColor,
  formatAssignmentType,
  formatDate,
  groupPermissionsByCategory,
  filterRoles,
};