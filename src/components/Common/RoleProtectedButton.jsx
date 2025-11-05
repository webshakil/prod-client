import React from 'react';
import { useSelector } from 'react-redux';
import { hasRole, hasPermission } from '../../utils/roleHelpers';

export default function RoleProtectedButton({
  children,
  requiredRole,
  requiredPermission,
  onClick,
  className,
  disabled,
  ...props
}) {
  const { userRoles, userPermissions } = useSelector((state) => state.role);
  
  // Check if user has required role or permission
  const hasAccess = requiredRole
    ? hasRole(userRoles, requiredRole)
    : requiredPermission
    ? hasPermission(userPermissions, requiredPermission)
    : true;
  
  if (!hasAccess) {
    return null; // Hide button if no access
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

// Usage example:
// <RoleProtectedButton
//   requiredRole="Manager"
//   onClick={handleDelete}
//   className="px-4 py-2 bg-red-600 text-white rounded"
// >
//   Delete
// </RoleProtectedButton>