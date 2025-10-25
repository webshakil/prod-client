import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { restoreAuthFromStorage } from '../redux/slices/authSlice';

export const useAuthCheck = () => {
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userId = localStorage.getItem('userId');
    /*eslint-disable*/
    const sessionId = localStorage.getItem('sessionId');

    if (accessToken && refreshToken && userId) {
      console.log('✅ User authenticated, restoring session');

      // Get full user data from localStorage if available
      const userDataStr = localStorage.getItem('userData');
      let userData = {};

      if (userDataStr) {
        try {
          userData = JSON.parse(userDataStr);
          console.log('Restored user data from localStorage:', userData);
        } catch (err) {
          console.error('Error parsing userData:', err);
        }
      }

      dispatch(restoreAuthFromStorage({
        userId: parseInt(userId),
        email: userData.email || null, // ✅ Restore email
        phone: userData.phone || null, // ✅ Restore phone
        username: userData.username || null,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        age: userData.age || null,
        gender: userData.gender || null,
        country: userData.country || null,
        city: userData.city || null,
        timezone: userData.timezone || 'UTC',
        language: userData.language || 'en_us',
        roles: userData.roles || ['Voter'],
        primaryRole: userData.primaryRole || 'Voter',
        isSubscribed: userData.isSubscribed || false,
        subscriptionType: userData.subscriptionType || 'Free',
        electionCreationLimit: userData.electionCreationLimit || 2,
        isContentCreator: userData.isContentCreator || false,
        isOrganization: userData.isOrganization || false,
        isVerified: userData.isVerified || false,
        isBanned: userData.isBanned || false,
        biometricEnabled: userData.biometricEnabled || false,
        biometricType: userData.biometricType || null,
        accessToken,
        refreshToken,
      }));
    }
  }, [dispatch]);

  return auth;
};

export default useAuthCheck;
// import { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAppDispatch } from '../redux/hooks';
// import { restoreAuthFromStorage, logout } from '../redux/slices/authSlice';

// export const useAuthCheck = () => {
//   const dispatch = useAppDispatch();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         // Check if user has tokens
//         const accessToken = localStorage.getItem('accessToken');
//         const refreshToken = localStorage.getItem('refreshToken');

//         if (!accessToken || !refreshToken) {
//           console.log('ℹ️ No tokens found, user not authenticated');
//           return;
//         }

//         // Try to verify token validity
//         const response = await fetch(
//           `${import.meta.env.VITE_API_URL}/auth/verify`,
//           {
//             method: 'GET',
//             credentials: 'include',
//             headers: {
//               'Authorization': `Bearer ${accessToken}`,
//               'Content-Type': 'application/json',
//             },
//           }
//         );

//         if (response.ok) {
//           const data = await response.json();
//           console.log('✅ User authenticated, restoring session');

//           // Restore user data to Redux
//           dispatch(restoreAuthFromStorage(data.data));
//         } else if (response.status === 401) {
//           console.warn('⚠️ Token expired, clearing auth');
//           dispatch(logout());
//           navigate('/auth', { replace: true });
//         }
//       } catch (error) {
//         console.error('Auth check error:', error);
//       }
//     };

//     checkAuth();
//   }, [dispatch, navigate]);
// };

// export default useAuthCheck;
// import { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // ✅ USE THIS
// import { useAppDispatch } from '../redux/hooks';
// import { restoreAuthFromStorage, logout } from '../redux/slices/authSlice';

// export const useAuthCheck = () => {
//   const dispatch = useAppDispatch();
//   const navigate = useNavigate(); // ✅ NO window

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         // Check if user has tokens
//         const accessToken = localStorage.getItem('accessToken');
//         const refreshToken = localStorage.getItem('refreshToken');

//         if (!accessToken || !refreshToken) {
//           console.log('ℹ️ No tokens found, user not authenticated');
//           return;
//         }

//         // Try to verify token validity
//         const response = await fetch(
//           `${import.meta.env.VITE_API_URL}/auth/verify`,
//           {
//             method: 'GET',
//             credentials: 'include',
//             headers: {
//               'Authorization': `Bearer ${accessToken}`,
//               'Content-Type': 'application/json',
//             },
//           }
//         );

//         if (response.ok) {
//           const data = await response.json();
//           console.log('✅ User authenticated, restoring session');
          
//           // Restore user data to Redux
//           dispatch(restoreAuthFromStorage(data.data));
//         } else if (response.status === 401) {
//           console.warn('⚠️ Token expired, clearing auth');
//           dispatch(logout());
//           navigate('/auth', { replace: true }); // ✅ NO window
//         }
//       } catch (error) {
//         console.error('Auth check error:', error);
//       }
//     };

//     checkAuth();
//   }, [dispatch, navigate]);
// };

// export default useAuthCheck;