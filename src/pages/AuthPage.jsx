import React, { useEffect } from 'react';
import AuthLayout from '../components/Auth/AuthLayout';

export default function AuthPage() {
  useEffect(() => {
    // Catch the error early
    try {
      const pathname = window.location.pathname;
      console.log('Current pathname:', pathname);
    } catch (e) {
      console.error('Pathname error:', e);
    }
  }, []);

  return (
    <div>
      <AuthLayout />
    </div>
  );
}
// import React from 'react';
// import AuthLayout from '../components/Auth/AuthLayout';

// export default function AuthPage() {
//   return (
//     <div>
//       <AuthLayout />
//     </div>
//   );
// }