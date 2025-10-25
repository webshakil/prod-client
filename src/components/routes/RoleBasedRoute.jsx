import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../redux/hooks';
import { isAuthenticated, hasRole } from './useRouteGuards';
import { Loader } from 'lucide-react';

const RoleBasedRoute = ({ 
  children, 
  requiredRoles = [], 
  fallback = '/dashboard',
  requireAll = false 
}) => {
  const auth = useAuth();

  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!isAuthenticated(auth)) {
    return <Navigate to="/" replace />;
  }

  const userRole = auth.user?.role;
  let hasAccess = false;

  if (requireAll) {
    hasAccess = requiredRoles.every(role => userRole === role);
  } else {
    hasAccess = hasRole(userRole, requiredRoles);
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h1>
          <p className="text-red-800 mb-6">
            Your role does not have permission to access this page.
          </p>
          <a
            href={fallback}
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Go Back
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default RoleBasedRoute;
