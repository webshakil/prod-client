import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../redux/hooks'; // ✅ Changed
import { useNavigate } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import UserCheckForm from './UserCheckForm';
import EmailVerificationForm from './EmailVerificationForm';
import SMSVerificationForm from './SMSVerificationForm';
import UserDetailsForm from './UserDetailsForm';
import BiometricCollection from './BiometricCollection';
import SecurityQuestionsForm from './SecurityQuestionsForm';
import { useCompleteAuthenticationMutation } from '../../redux/api/auth/sessionApi';
import { setAuthenticationComplete, setSuccess, setError } from '../../redux/slices/authSlice';
import Loading from '../Common/Loading';
import { useAuth } from '../../redux/hooks';

export default function AuthLayout() {
  const dispatch = useAppDispatch(); // ✅ Changed
  const navigate = useNavigate();
  const auth = useAuth();
  const [localStep, setLocalStep] = useState(1);
  const [completeAuthentication, { isLoading }] = useCompleteAuthenticationMutation();

  const totalSteps = auth.isFirstTimeUser ? 7 : 3;

  useEffect(() => {
    console.log('📊 Redux Auth State Updated:', {
      currentStep: auth.currentAuthStep,
      sessionId: auth.sessionId,
      isFirstTimeUser: auth.isFirstTimeUser,
      totalSteps,
    });

    setLocalStep(auth.currentAuthStep);
  }, [auth.currentAuthStep, auth.sessionId, auth.isFirstTimeUser]);

  // ✅ ADD THIS - Monitor authentication completion
  useEffect(() => {
    if (
      auth.isAuthenticated &&
      auth.authenticationStatus === 'completed' &&
      auth.accessToken &&
      !isLoading
    ) {
      console.log('✅ Auth completed, redirecting to dashboard');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 300);
    }
  }, [auth.isAuthenticated, auth.authenticationStatus, auth.accessToken, isLoading, navigate]);

  const handleUserCheckNext = (data) => {
    console.log('✅ Step 1 Complete: User Check', {
      userId: data.userId,
      sessionId: data.sessionId,
      isFirstTime: data.isFirstTime,
    });
    setLocalStep(2);
  };

  const handleEmailOTPNext = () => {
    console.log('✅ Step 2 Complete: Email OTP');
    console.log('Current session:', auth.sessionId);
    setLocalStep(3);
  };

  const handleSMSOTPNext = () => {
    console.log('✅ Step 3 Complete: SMS OTP');
    console.log('Redux State:', {
      isFirstTimeUser: auth.isFirstTimeUser,
      currentAuthStep: auth.currentAuthStep,
      completedAuthSteps: auth.completedAuthSteps,
    });

    // ✅ Use a small delay to ensure Redux state is updated
    setTimeout(() => {
      if (auth.isFirstTimeUser) {
        console.log('→ First-time user detected, moving to Step 4');
        setLocalStep(4);
      } else {
        console.log('→ Returning user, completing auth');
        completeAuth();
      }
    }, 100);
  };

  const handleUserDetailsNext = () => {
    console.log('✅ Step 4 Complete: User Details');
    console.log('Current session:', auth.sessionId);
    setLocalStep(5);
  };

  const handleBiometricNext = () => {
    console.log('✅ Step 5 Complete: Biometric');
    console.log('Current session:', auth.sessionId);
    setLocalStep(6);
  };

  const handleSecurityQuestionsNext = () => {
    console.log('✅ Step 6 Complete: Security Questions');
    console.log('Current session:', auth.sessionId);
    completeAuth();
  };

  const completeAuth = async () => {
    try {
      console.log('🔐 Calling completeAuthentication mutation...', {
        sessionId: auth.sessionId,
        userId: auth.userId,
      });

      if (!auth.sessionId) {
        throw new Error('Session ID is missing!');
      }

      const result = await completeAuthentication({ sessionId: auth.sessionId }).unwrap();

      console.log('✅ completeAuthentication response received:', result);
      console.log('Response keys:', Object.keys(result));
      console.log('Response data:', result.data || result);

      // ✅ IMPROVED - Handle both response structures better
      const userData = result.data?.user || result.user || result.data;
      const tokens = result.data || result;

      console.log('Extracted user data:', userData);
      console.log('Has accessToken:', !!tokens.accessToken);

      if (!userData || !userData.userId) {
        console.error('Invalid user data:', userData);
        throw new Error('No valid user data in response');
      }

      console.log('User data contains:', {
        userId: userData.userId,
        email: userData.email,
        phone: userData.phone,
        firstName: userData.firstName,
        lastName: userData.lastName,
        roles: userData.roles,
      });

      // ✅ Store complete user data in localStorage for page refresh restoration
      console.log('Storing user data in localStorage...');
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('userId', userData.userId.toString());
      localStorage.setItem('sessionId', auth.sessionId);
      localStorage.setItem('accessToken', tokens.accessToken || '');
      localStorage.setItem('refreshToken', tokens.refreshToken || '');

      console.log('✅ User data stored in localStorage');

      // ✅ CRITICAL - Dispatch with proper structure
      const authPayload = {
        userId: userData.userId,
        email: userData.email,
        phone: userData.phone,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        age: userData.age,
        gender: userData.gender,
        country: userData.country,
        city: userData.city,
        timezone: userData.timezone,
        language: userData.language || 'en_us',
        roles: userData.roles || [],
        primaryRole: userData.primaryRole || 'Voter',
        isSubscribed: userData.isSubscribed || false,
        subscriptionType: userData.subscriptionType || null,
        electionCreationLimit: userData.electionCreationLimit || 2,
        isContentCreator: userData.isContentCreator || false,
        isOrganization: userData.isOrganization || false,
        isVerified: userData.isVerified || false,
        isBanned: userData.isBanned || false,
        deviceId: userData.deviceId,
        deviceType: userData.deviceType,
        osName: userData.osName,
        browserName: userData.browserName,
        ipAddress: userData.ipAddress,
        registrationDate: userData.registrationDate,
        biometricEnabled: userData.biometricEnabled || false,
        biometricType: userData.biometricType,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };

      console.log('Dispatching setAuthenticationComplete with payload:', authPayload);
      dispatch(setAuthenticationComplete(authPayload));

      console.log('✅ Redux updated with complete user data');
      dispatch(setSuccess('Authentication completed successfully'));

      console.log('✅ Tokens stored:');
      console.log('   - Redux state ✅');
      console.log('   - HTTP-only cookies ✅ (auto by backend)');
      console.log('   - LocalStorage ✅');

      // ✅ Don't navigate here - let the useEffect handle it
      console.log('Auth completion dispatch finished - waiting for redirect via useEffect');
    } catch (error) {
      const errorMessage = error.data?.message || error.message || 'Authentication completion failed';
      console.error('❌ completeAuth error:', errorMessage);
      console.error('Full error object:', error);
      dispatch(setError(errorMessage));
    }
  };

  console.log('🎯 Current Render State:', {
    localStep,
    reduxStep: auth.currentAuthStep,
    isFirstTimeUser: auth.isFirstTimeUser,
    sessionId: auth.sessionId,
    isAuthenticated: auth.isAuthenticated,
    authStatus: auth.authenticationStatus,
    hasToken: !!auth.accessToken,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto">
        <ProgressBar currentStep={localStep} totalSteps={totalSteps} />

        {isLoading && <Loading />}

        {localStep === 1 && <UserCheckForm onNext={handleUserCheckNext} />}

        {localStep === 2 && auth.sessionId && (
          <EmailVerificationForm
            sessionId={auth.sessionId}
            email={auth.email}
            onNext={handleEmailOTPNext}
          />
        )}

        {localStep === 3 && auth.sessionId && (
          <SMSVerificationForm
            sessionId={auth.sessionId}
            phone={auth.phone}
            onNext={handleSMSOTPNext}
          />
        )}

        {localStep === 4 && auth.isFirstTimeUser && auth.sessionId && (
          <UserDetailsForm sessionId={auth.sessionId} onNext={handleUserDetailsNext} />
        )}

        {localStep === 5 && auth.isFirstTimeUser && auth.sessionId && (
          <BiometricCollection sessionId={auth.sessionId} onNext={handleBiometricNext} />
        )}

        {localStep === 6 && auth.isFirstTimeUser && auth.sessionId && (
          <SecurityQuestionsForm sessionId={auth.sessionId} onNext={handleSecurityQuestionsNext} />
        )}
      </div>
    </div>
  );
}
// import React, { useState, useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import ProgressBar from './ProgressBar';
// import UserCheckForm from './UserCheckForm';
// import EmailVerificationForm from './EmailVerificationForm';
// import SMSVerificationForm from './SMSVerificationForm';
// import UserDetailsForm from './UserDetailsForm';
// import BiometricCollection from './BiometricCollection';
// import SecurityQuestionsForm from './SecurityQuestionsForm';
// import { useCompleteAuthenticationMutation } from '../../redux/api/auth/sessionApi';
// import { setAuthenticationComplete, setSuccess, setError } from '../../redux/slices/authSlice';
// import Loading from '../Common/Loading';
// import { useAuth } from '../../redux/hooks';

// export default function AuthLayout() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const auth = useAuth();
//   const [localStep, setLocalStep] = useState(1);
//   const [completeAuthentication, { isLoading }] = useCompleteAuthenticationMutation();

//   const totalSteps = auth.isFirstTimeUser ? 7 : 3;

//   useEffect(() => {
//     console.log('📊 Redux Auth State Updated:', {
//       currentStep: auth.currentAuthStep,
//       sessionId: auth.sessionId,
//       isFirstTimeUser: auth.isFirstTimeUser,
//       totalSteps,
//     });

//     setLocalStep(auth.currentAuthStep);
//   }, [auth.currentAuthStep, auth.sessionId, auth.isFirstTimeUser]);

//   const handleUserCheckNext = (data) => {
//     console.log('✅ Step 1 Complete: User Check', {
//       userId: data.userId,
//       sessionId: data.sessionId,
//       isFirstTime: data.isFirstTime,
//     });
//     setLocalStep(2);
//   };

//   const handleEmailOTPNext = () => {
//     console.log('✅ Step 2 Complete: Email OTP');
//     console.log('Current session:', auth.sessionId);
//     setLocalStep(3);
//   };

//   const handleSMSOTPNext = () => {
//     console.log('✅ Step 3 Complete: SMS OTP');
//     console.log('Redux State:', {
//       isFirstTimeUser: auth.isFirstTimeUser,
//       currentAuthStep: auth.currentAuthStep,
//       completedAuthSteps: auth.completedAuthSteps,
//     });

//     if (auth.isFirstTimeUser) {
//       console.log('→ First-time user detected, moving to Step 4');
//       setLocalStep(4);
//     } else {
//       console.log('→ Returning user, completing auth');
//       completeAuth();
//     }
//   };

//   const handleUserDetailsNext = () => {
//     console.log('✅ Step 4 Complete: User Details');
//     console.log('Current session:', auth.sessionId);
//     setLocalStep(5);
//   };

//   const handleBiometricNext = () => {
//     console.log('✅ Step 5 Complete: Biometric');
//     console.log('Current session:', auth.sessionId);
//     setLocalStep(6);
//   };

//   const handleSecurityQuestionsNext = () => {
//     console.log('✅ Step 6 Complete: Security Questions');
//     console.log('Current session:', auth.sessionId);
//     completeAuth();
//   };

//   const completeAuth = async () => {
//     try {
//       console.log('🔐 Calling completeAuthentication mutation...', {
//         sessionId: auth.sessionId,
//         userId: auth.userId,
//       });

//       if (!auth.sessionId) {
//         throw new Error('Session ID is missing!');
//       }

//       const result = await completeAuthentication({ sessionId: auth.sessionId }).unwrap();

//       console.log('✅ completeAuthentication response received:', result);
//       console.log('Response keys:', Object.keys(result));
//       console.log('Response data:', result.data || result);

//       // Handle both response structures
//       const userData = result.data?.user || result.user;
//       const tokens = result.data || result;

//       console.log('Extracted user data:', userData);
//       console.log('Has accessToken:', !!tokens.accessToken);

//       if (!userData) {
//         throw new Error('No user data in response');
//       }

//       console.log('User data contains:', {
//         userId: userData.userId,
//         email: userData.email,
//         phone: userData.phone,
//         firstName: userData.firstName,
//         lastName: userData.lastName,
//       });

//       // Store complete user data in localStorage for page refresh restoration
//       console.log('Storing user data in localStorage...');
//       localStorage.setItem('userData', JSON.stringify(userData));
//       localStorage.setItem('userId', userData.userId.toString());
//       localStorage.setItem('sessionId', auth.sessionId);
//       localStorage.setItem('accessToken', tokens.accessToken);
//       localStorage.setItem('refreshToken', tokens.refreshToken);

//       console.log('✅ User data stored in localStorage:', userData);

//       // Update Redux with complete data
//       dispatch(setAuthenticationComplete(userData));

//       console.log('✅ Redux updated with complete user data');

//       dispatch(setSuccess('Authentication completed successfully'));

//       console.log('✅ Tokens stored:');
//       console.log('   - Redux state ✅');
//       console.log('   - HTTP-only cookies ✅ (auto by backend)');
//       console.log('   - LocalStorage ✅');

//       // Wait a moment for Redux to update, then redirect
//       setTimeout(() => {
//         console.log('🚀 Redirecting to dashboard...');
//         navigate('/dashboard', { replace: true });
//         console.log('✅ Navigation called');
//       }, 500);
//     } catch (error) {
//       const errorMessage = error.data?.message || error.message || 'Authentication completion failed';
//       console.error('❌ completeAuth error:', errorMessage);
//       console.error('Full error object:', error);
//       dispatch(setError(errorMessage));
//     }
//   };

//   console.log('🎯 Current Render State:', {
//     localStep,
//     reduxStep: auth.currentAuthStep,
//     isFirstTimeUser: auth.isFirstTimeUser,
//     sessionId: auth.sessionId,
//   });

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
//       <div className="max-w-4xl mx-auto">
//         <ProgressBar currentStep={localStep} totalSteps={totalSteps} />

//         {isLoading && <Loading />}

//         {localStep === 1 && <UserCheckForm onNext={handleUserCheckNext} />}

//         {localStep === 2 && auth.sessionId && (
//           <EmailVerificationForm
//             sessionId={auth.sessionId}
//             email={auth.email}
//             onNext={handleEmailOTPNext}
//           />
//         )}

//         {localStep === 3 && auth.sessionId && (
//           <SMSVerificationForm
//             sessionId={auth.sessionId}
//             phone={auth.phone}
//             onNext={handleSMSOTPNext}
//           />
//         )}

//         {localStep === 4 && auth.isFirstTimeUser && auth.sessionId && (
//           <UserDetailsForm sessionId={auth.sessionId} onNext={handleUserDetailsNext} />
//         )}

//         {localStep === 5 && auth.isFirstTimeUser && auth.sessionId && (
//           <BiometricCollection sessionId={auth.sessionId} onNext={handleBiometricNext} />
//         )}

//         {localStep === 6 && auth.isFirstTimeUser && auth.sessionId && (
//           <SecurityQuestionsForm sessionId={auth.sessionId} onNext={handleSecurityQuestionsNext} />
//         )}
//       </div>
//     </div>
//   );
// }
// // import React, { useState, useEffect } from 'react';
// // import { useDispatch } from 'react-redux';
// // import { useNavigate } from 'react-router-dom'; // ✅ USE THIS INSTEAD OF window
// // import ProgressBar from './ProgressBar';
// // import UserCheckForm from './UserCheckForm';
// // import EmailVerificationForm from './EmailVerificationForm';
// // import SMSVerificationForm from './SMSVerificationForm';
// // import UserDetailsForm from './UserDetailsForm';
// // import BiometricCollection from './BiometricCollection';
// // import SecurityQuestionsForm from './SecurityQuestionsForm';
// // import { useCompleteAuthenticationMutation } from '../../redux/api/auth/sessionApi';
// // import { setAuthenticationComplete, setSuccess, setError } from '../../redux/slices/authSlice';
// // import Loading from '../Common/Loading';
// // import { useAuth } from '../../redux/hooks';

// // export default function AuthLayout() {
// //   const dispatch = useDispatch();
// //   const navigate = useNavigate(); // ✅ NO window.location
// //   const auth = useAuth();
// //   const [localStep, setLocalStep] = useState(1);
// //   const [completeAuthentication, { isLoading }] = useCompleteAuthenticationMutation();

// //   const totalSteps = auth.isFirstTimeUser ? 7 : 3;

// //   useEffect(() => {
// //     console.log('📊 Redux Auth State Updated:', {
// //       currentStep: auth.currentAuthStep,
// //       sessionId: auth.sessionId,
// //       isFirstTimeUser: auth.isFirstTimeUser,
// //       totalSteps,
// //     });

// //     setLocalStep(auth.currentAuthStep);
// //   }, [auth.currentAuthStep, auth.sessionId, auth.isFirstTimeUser]);

// //   const handleUserCheckNext = (data) => {
// //     console.log('✅ Step 1 Complete: User Check', {
// //       userId: data.userId,
// //       sessionId: data.sessionId,
// //       isFirstTime: data.isFirstTime,
// //     });
// //     setLocalStep(2);
// //   };

// //   const handleEmailOTPNext = () => {
// //     console.log('✅ Step 2 Complete: Email OTP');
// //     console.log('Current session:', auth.sessionId);
// //     setLocalStep(3);
// //   };

// //   const handleSMSOTPNext = () => {
// //   console.log('✅ Step 3 Complete: SMS OTP');
// //   console.log('Redux State:', {
// //     isFirstTimeUser: auth.isFirstTimeUser,
// //     currentAuthStep: auth.currentAuthStep,
// //     completedAuthSteps: auth.completedAuthSteps,
// //   });

// //   // Trust Redux state, not local logic
// //   if (auth.isFirstTimeUser) {
// //     console.log('→ First-time user detected, moving to Step 4');
// //     setLocalStep(4);
// //   } else {
// //     console.log('→ Returning user, completing auth');
// //     completeAuth();
// //   }
// // };


// //   const handleUserDetailsNext = () => {
// //     console.log('✅ Step 4 Complete: User Details');
// //     console.log('Current session:', auth.sessionId);
// //     setLocalStep(5);
// //   };

// //   const handleBiometricNext = () => {
// //     console.log('✅ Step 5 Complete: Biometric');
// //     console.log('Current session:', auth.sessionId);
// //     setLocalStep(6);
// //   };

// //   const handleSecurityQuestionsNext = () => {
// //     console.log('✅ Step 6 Complete: Security Questions');
// //     console.log('Current session:', auth.sessionId);
// //     completeAuth();
// //   };

// //   const completeAuth = async () => {
// //     try {
// //       console.log('🔐 Completing authentication...', {
// //         sessionId: auth.sessionId,
// //         userId: auth.userId,
// //       });

// //       if (!auth.sessionId) {
// //         throw new Error('Session ID is missing!');
// //       }

// //       const result = await completeAuthentication({ sessionId: auth.sessionId }).unwrap();

// //       console.log('✅ Authentication completed:', {
// //         hasAccessToken: !!result.data.accessToken,
// //         hasRefreshToken: !!result.data.refreshToken,
// //       });

// //       // ✅ STORE IN REDUX (in-memory)
// //       dispatch(setAuthenticationComplete(result.data.user));

// //       // ✅ ALSO STORE IN LOCALSTORAGE AS BACKUP
// //       localStorage.setItem('accessToken', result.data.accessToken);
// //       localStorage.setItem('refreshToken', result.data.refreshToken);

// //       dispatch(setSuccess('Authentication completed successfully'));

// //       console.log('✅ Tokens stored:');
// //       console.log('   - Redux state ✅');
// //       console.log('   - HTTP-only cookies ✅ (auto by backend)');
// //       console.log('   - LocalStorage ✅ (backup)');

// //       // ✅ USE navigate INSTEAD OF window.location
// //       setTimeout(() => {
// //         console.log('🚀 Redirecting to dashboard...');
// //         navigate('/dashboard', { replace: true }); // ✅ NO window
// //       }, 1000);
// //     } catch (error) {
// //       const errorMessage = error.data?.message || error.message || 'Authentication completion failed';
// //       console.error('❌ Auth error:', errorMessage);
// //       dispatch(setError(errorMessage));
// //     }
// //   };

// //   console.log('🎯 Current Render State:', {
// //     localStep,
// //     reduxStep: auth.currentAuthStep,
// //     isFirstTimeUser: auth.isFirstTimeUser,
// //     sessionId: auth.sessionId,
// //   });

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
// //       <div className="max-w-4xl mx-auto">
// //         <ProgressBar currentStep={localStep} totalSteps={totalSteps} />

// //         {isLoading && <Loading />}

// //         {localStep === 1 && <UserCheckForm onNext={handleUserCheckNext} />}

// //         {localStep === 2 && auth.sessionId && (
// //           <EmailVerificationForm
// //             sessionId={auth.sessionId}
// //             email={auth.email}
// //             onNext={handleEmailOTPNext}
// //           />
// //         )}

// //         {localStep === 3 && auth.sessionId && (
// //           <SMSVerificationForm
// //             sessionId={auth.sessionId}
// //             phone={auth.phone}
// //             onNext={handleSMSOTPNext}
// //           />
// //         )}

// //         {localStep === 4 && auth.isFirstTimeUser && auth.sessionId && (
// //           <UserDetailsForm sessionId={auth.sessionId} onNext={handleUserDetailsNext} />
// //         )}

// //         {localStep === 5 && auth.isFirstTimeUser && auth.sessionId && (
// //           <BiometricCollection sessionId={auth.sessionId} onNext={handleBiometricNext} />
// //         )}

// //         {localStep === 6 && auth.isFirstTimeUser && auth.sessionId && (
// //           <SecurityQuestionsForm sessionId={auth.sessionId} onNext={handleSecurityQuestionsNext} />
// //         )}
// //       </div>
// //     </div>
// //   );
// // }
