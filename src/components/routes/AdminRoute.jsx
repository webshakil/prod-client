import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';  // ✅ Import useSelector directly
import { useGetUserRolesQuery } from '../../redux/api/role/roleApi';
import { useDispatch } from 'react-redux';
import { setUserRoles } from '../../redux/slices/roleSlice';
import { isAuthenticated } from './useRouteGuards';
import { Loader } from 'lucide-react';

const AdminRoute = ({ children, requiredRole = 'manager', requiredRoles = [], fallback = '/dashboard' }) => {
  // ✅ FIX: Get auth data directly from Redux state
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  // Fetch user roles from role service
  const { data: userRolesData, isLoading: rolesLoading, error: rolesError } = useGetUserRolesQuery(
    auth.userId,
    { skip: !auth.userId || !auth.isAuthenticated }
  );

  // Update Redux store when roles are fetched
  useEffect(() => {
    if (userRolesData?.data) {
      dispatch(setUserRoles(userRolesData.data));
    }
  }, [userRolesData, dispatch]);

  // Don't wait too long for role service
  const [timeoutReached, setTimeoutReached] = React.useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 1500); // Reduced to 1.5 seconds
    
    return () => clearTimeout(timer);
  }, []);

  // Show loading only briefly
  if (auth.loading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated(auth)) {
    return <Navigate to="/" replace />;
  }

  // ✅ FIX: Get roles from BOTH possible locations immediately
  let userRoles = [];
  
  // Priority 1: Role service data (if available and no timeout)
  if (userRolesData?.data && userRolesData.data.length > 0 && !timeoutReached && !rolesError) {
    userRoles = userRolesData.data;
    console.log('✅ Using role service data:', userRoles);
  } 
  // Priority 2: Auth state userData.roles (immediate fallback)
  else if (auth.userData?.roles) {
    const authRoles = auth.userData.roles;
    userRoles = Array.isArray(authRoles) ? authRoles : Object.values(authRoles);
    userRoles = userRoles.map(role => 
      typeof role === 'string' ? { role_name: role } : role
    );
    console.log('✅ Using userData.roles:', userRoles);
  }
  // Priority 3: Auth state roles (second fallback)
  else if (auth.roles) {
    const authRoles = auth.roles;
    userRoles = Array.isArray(authRoles) ? authRoles : Object.values(authRoles);
    userRoles = userRoles.map(role => 
      typeof role === 'string' ? { role_name: role } : role
    );
    console.log('✅ Using auth.roles:', userRoles);
  }
  // Priority 4: Still loading (show spinner only if no fallback data)
  else if (rolesLoading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }
  
  // Extract role names
  let roleNames = [];
  if (userRoles.length > 0) {
    if (typeof userRoles[0] === 'object' && userRoles[0].role_name) {
      roleNames = userRoles.map(r => r.role_name);
    } else {
      roleNames = userRoles.map(r => String(r));
    }
  }
  
  console.log('🔍 Final role names for checking:', roleNames);
  
  // Normalize to lowercase for comparison
  const normalizedRoles = roleNames.map(r => r.toLowerCase().trim());

  // Determine access
  let hasAccess = false;

  if (requiredRoles && requiredRoles.length > 0) {
    hasAccess = requiredRoles.some(role => 
      normalizedRoles.includes(role.toLowerCase().trim())
    );
  } else if (requiredRole) {
    hasAccess = normalizedRoles.includes(requiredRole.toLowerCase().trim());
  }

  console.log('🔐 Access check:', { hasAccess, requiredRole, requiredRoles, normalizedRoles });

  // Access denied
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h1>
          <p className="text-red-800 mb-4">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-red-700 mb-6">
            Required role: <span className="font-semibold">
              {requiredRoles.length > 0 ? requiredRoles.join(' or ') : requiredRole}
            </span>
          </p>
          <div className="space-y-2">
            <p className="text-xs text-red-600">Your current roles:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {roleNames.length > 0 ? (
                roleNames.map((role, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full border border-red-200"
                  >
                    {role}
                  </span>
                ))
              ) : (
                <span className="text-xs text-red-600">No roles assigned</span>
              )}
            </div>
          </div>
          
          <a
            href={fallback}
            className="inline-block mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Go Back
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;



//last workable code
// import React, { useEffect } from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../../redux/hooks';
// import { useGetUserRolesQuery } from '../../redux/api/role/roleApi';
// import { useDispatch } from 'react-redux';
// import { setUserRoles } from '../../redux/slices/roleSlice';
// import { isAuthenticated } from './useRouteGuards';
// /*eslint-disable*/
// import { hasRole, hasAnyRole } from '../../utils/roleHelpers';
// import { Loader } from 'lucide-react';

// const AdminRoute = ({ children, requiredRole = 'manager', requiredRoles = [], fallback = '/dashboard' }) => {
//   const auth = useAuth();
//   const dispatch = useDispatch();
  
//   // Fetch user roles from role service
//   const { data: userRolesData, isLoading: rolesLoading, error: rolesError } = useGetUserRolesQuery(
//     auth.userId,
//     { skip: !auth.userId || !auth.isAuthenticated }
//   );

//   // Update Redux store when roles are fetched
//   useEffect(() => {
//     if (userRolesData?.data) {
//       dispatch(setUserRoles(userRolesData.data));
//     }
//   }, [userRolesData, dispatch]);

//   // Show loading state
//   if (auth.loading || rolesLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <Loader className="animate-spin text-blue-600" size={48} />
//       </div>
//     );
//   }

//   // Check authentication
//   if (!isAuthenticated(auth)) {
//     return <Navigate to="/" replace />;
//   }

//   // Handle role service errors - fallback to auth roles
//   if (rolesError) {
//     console.warn('Role service error, falling back to auth roles:', rolesError);
//   }

//   // Get roles from role service OR fallback to auth roles
//   let userRoles = userRolesData?.data || auth.roles || [];
  
//   // Normalize roles from role service (array of objects) or auth (array of strings)
//   let roleNames = [];
//   if (userRoles.length > 0) {
//     if (typeof userRoles[0] === 'object' && userRoles[0].role_name) {
//       // Roles from role service (objects with role_name property)
//       roleNames = userRoles.map(r => r.role_name);
//     } else {
//       // Roles from auth service (strings or mixed)
//       if (!Array.isArray(userRoles)) {
//         userRoles = Object.values(userRoles);
//       }
//       roleNames = userRoles.map(r => String(r));
//     }
//   }
  
//   // Normalize to lowercase for comparison
//   const normalizedRoles = roleNames.map(r => r.toLowerCase().trim());

//   // Determine access based on requiredRole or requiredRoles
//   let hasAccess = false;

//   if (requiredRoles && requiredRoles.length > 0) {
//     // Check if user has ANY of the required roles
//     hasAccess = requiredRoles.some(role => 
//       normalizedRoles.includes(role.toLowerCase().trim())
//     );
//   } else if (requiredRole) {
//     // Check if user has the specific required role
//     hasAccess = normalizedRoles.includes(requiredRole.toLowerCase().trim());
//   }

//   // Access denied
//   if (!hasAccess) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-md">
//           <h1 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h1>
//           <p className="text-red-800 mb-4">
//             You don't have permission to access this page.
//           </p>
//           <p className="text-sm text-red-700 mb-6">
//             Required role: <span className="font-semibold">
//               {requiredRoles.length > 0 ? requiredRoles.join(' or ') : requiredRole}
//             </span>
//           </p>
//           <div className="space-y-2">
//             <p className="text-xs text-red-600">Your current roles:</p>
//             <div className="flex flex-wrap gap-2 justify-center">
//               {roleNames.length > 0 ? (
//                 roleNames.map((role, index) => (
//                   <span
//                     key={index}
//                     className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full border border-red-200"
//                   >
//                     {role}
//                   </span>
//                 ))
//               ) : (
//                 <span className="text-xs text-red-600">No roles assigned</span>
//               )}
//             </div>
//           </div>

//           {/* ✅ Fixed missing opening <a> tag */}
//           <a
//             href={fallback}
//             className="inline-block mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
//           >
//             Go Back
//           </a>
//         </div>
//       </div>
//     );
//   }

//   return children;
// };

// export default AdminRoute;

// import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../../redux/hooks';
// import { isAuthenticated } from './useRouteGuards';
// import { Loader } from 'lucide-react';

// const AdminRoute = ({ children, requiredRole = 'manager', fallback = '/dashboard' }) => {
//   const auth = useAuth();

//   if (auth.loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <Loader className="animate-spin text-blue-600" size={48} />
//       </div>
//     );
//   }

//   if (!isAuthenticated(auth)) {
//     return <Navigate to="/" replace />;
//   }

//   // Get user roles and normalize to lowercase
//   let userRoles = auth.roles || [];
//   if (!Array.isArray(userRoles)) {
//     userRoles = Object.values(userRoles);
//   }
//   const normalizedRoles = userRoles.map(r => String(r).toLowerCase().trim());

//   // Check if user has required role
//   const hasAccess = normalizedRoles.includes(requiredRole.toLowerCase());

//   if (!hasAccess) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-md">
//           <h1 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h1>
//           <p className="text-red-800 mb-6">
//             You don't have permission to access this page.
//           </p>
//           <a
//             href={fallback}
//             className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
//           >
//             Go Back
//           </a>
//         </div>
//       </div>
//     );
//   }

//   return children;
// };

// export default AdminRoute;

