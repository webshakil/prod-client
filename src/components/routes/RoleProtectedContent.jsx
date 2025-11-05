import React from 'react';
import { useSelector } from 'react-redux';
import { hasRole, hasAnyRole, hasPermission } from '../../utils/roleHelpers';

export default function RoleProtectedContent({
  children,
  requiredRole,
  requiredRoles,
  requiredPermission,
  fallback = null,
}) {
  const { userRoles, userPermissions } = useSelector((state) => state.role);
  
  // Check access
  let hasAccess = false;
  
  if (requiredRole) {
    hasAccess = hasRole(userRoles, requiredRole);
  } else if (requiredRoles && Array.isArray(requiredRoles)) {
    hasAccess = hasAnyRole(userRoles, requiredRoles);
  } else if (requiredPermission) {
    hasAccess = hasPermission(userPermissions, requiredPermission);
  } else {
    hasAccess = true;
  }
  
  if (!hasAccess) {
    return fallback;
  }
  
  return <>{children}</>;
}

// Usage example:
// <RoleProtectedContent requiredRoles={['Manager', 'Admin']}>
//   <AdminPanel />
// </RoleProtectedContent>