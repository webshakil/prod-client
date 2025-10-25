import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../redux/hooks';
import { Loader } from 'lucide-react';

const ProtectedRoute = ({ children, fallback = '/auth' }) => {
  const auth = useAuth();

  console.log('🔒 ProtectedRoute check:', {
    isAuthenticated: auth.isAuthenticated,
    hasToken: !!auth.accessToken,
    userId: auth.userId,
    loading: auth.loading,
    authenticationStatus: auth.authenticationStatus,
  });

  if (auth.loading) {
    console.log('⏳ Still loading auth...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  // ✅ FIX - Simplified check
  const isAuthValid = auth.isAuthenticated && auth.accessToken;
  
  console.log('✅ Auth validation result:', isAuthValid);

  if (!isAuthValid) {
    console.log('❌ Not authenticated, redirecting to:', fallback);
    return <Navigate to={fallback} replace />;
  }

  console.log('✅ Authenticated, rendering protected content');
  return children;
};

export default ProtectedRoute;
// import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../../redux/hooks';
// import { isAuthenticated } from './useRouteGuards';
// import { Loader } from 'lucide-react';

// const ProtectedRoute = ({ children, fallback = '/auth' }) => {
//   const auth = useAuth();

//   console.log('🔒 ProtectedRoute check:', {
//     isAuthenticated: auth.isAuthenticated,
//     hasToken: !!auth.accessToken,
//     userId: auth.userId,
//     loading: auth.loading,
//   });

//   if (auth.loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <Loader className="animate-spin text-blue-600" size={48} />
//       </div>
//     );
//   }

//   if (!isAuthenticated(auth)) {
//     console.log('❌ Not authenticated, redirecting to:', fallback);
//     return <Navigate to={fallback} replace />;
//   }

//   console.log('✅ Authenticated, rendering protected content');
//   return children;
// };

// export default ProtectedRoute;
// import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../../redux/hooks';
// import { isAuthenticated } from './useRouteGuards';
// import { Loader } from 'lucide-react';

// const ProtectedRoute = ({ children, fallback = '/auth' }) => {
//   const auth = useAuth();

//   if (auth.loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <Loader className="animate-spin text-blue-600" size={48} />
//       </div>
//     );
//   }

//   if (!isAuthenticated(auth)) {
//     return <Navigate to={fallback} replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;