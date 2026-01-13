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
  
  // ✅ FIXED: Only skip Step 1 if coming from Sngine (check sessionStorage)
  const [localStep, setLocalStep] = useState(() => {
    const authMethod = sessionStorage.getItem('auth_method');
    // Only skip Step 1 if:
    // 1. auth_method is 'sngine_token' (set by SngineCallbackHandler)
    // 2. AND sessionId exists (meaning Sngine flow completed)
    if (authMethod === 'sngine_token' && auth.sessionId) {
      console.log('[AUTH-LAYOUT] ✅ Sngine flow detected, starting at step 2');
      return 2;
    }
    return 1;
  });

  const [completeAuthentication, { isLoading }] = useCompleteAuthenticationMutation();

  const totalSteps = auth.isFirstTimeUser ? 7 : 3;

  // ✅ FIXED: Only sync for Sngine flow
  useEffect(() => {
    const authMethod = sessionStorage.getItem('auth_method');
    if (authMethod === 'sngine_token' && auth.sessionId && localStep === 1) {
      console.log('[AUTH-LAYOUT] ✅ Sngine flow - moving to step 2');
      setLocalStep(2);
    }
  }, [auth.sessionId, localStep]);

  useEffect(() => {
  // ✅ CRITICAL: First-time users MUST complete all steps before redirect
  const shouldRedirect = 
    auth.isAuthenticated &&
    auth.authenticationStatus === 'completed' &&
    auth.accessToken &&
    !isLoading &&
    // ✅ NEW: Ensure first-time users completed all steps
    (!auth.isFirstTimeUser || auth.completedAuthSteps.sessionComplete);

  if (shouldRedirect) {
    console.log('✅ Auth fully completed, redirecting to dashboard', {
      isFirstTimeUser: auth.isFirstTimeUser,
      allStepsComplete: auth.completedAuthSteps.sessionComplete,
    });
    setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 300);
  } else if (auth.isAuthenticated && auth.isFirstTimeUser && !auth.completedAuthSteps.sessionComplete) {
    console.log('⚠️ First-time user has NOT completed all steps - staying in auth flow', {
      currentStep: auth.currentAuthStep,
      completedSteps: auth.completedAuthSteps,
    });
  }
}, [
  auth.isAuthenticated,
  auth.authenticationStatus,
  auth.accessToken,
  auth.isFirstTimeUser,
  auth.completedAuthSteps.sessionComplete,
  auth.currentAuthStep,
  isLoading,
  navigate,
]);

  // useEffect(() => {
  //   console.log('📊 Redux Auth State Updated:', {
  //     currentStep: auth.currentAuthStep,
  //     sessionId: auth.sessionId,
  //     isFirstTimeUser: auth.isFirstTimeUser,
  //     totalSteps,
  //   });

  //   setLocalStep(auth.currentAuthStep);
  // }, [auth.currentAuthStep, auth.sessionId, auth.isFirstTimeUser]);

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
  console.log('📊 Checking user type...', {
    isFirstTimeUser: auth.isFirstTimeUser,
    currentAuthStep: auth.currentAuthStep,
    completedAuthSteps: auth.completedAuthSteps,
  });

  // ✅ CRITICAL: Explicit boolean check
  setTimeout(() => {
    if (auth.isFirstTimeUser === true) {
      console.log('→ FIRST-TIME USER: Moving to Step 4 (User Details)');
      console.log('   → Steps 4, 5, 6 are REQUIRED before dashboard access');
      setLocalStep(4);
    } else if (auth.isFirstTimeUser === false) {
      console.log('→ RETURNING USER: Completing authentication');
      console.log('   → Skipping steps 4, 5, 6 - proceeding to dashboard');
      completeAuth();
    } else {
      console.error('❌ ERROR: isFirstTimeUser is undefined!', {
        value: auth.isFirstTimeUser,
        type: typeof auth.isFirstTimeUser,
      });
      // ✅ Safety fallback - assume first-time user
      console.log('   → Safety fallback: Treating as first-time user');
      setLocalStep(4);
    }
  }, 100);
};

  // const handleSMSOTPNext = () => {
  //   console.log('✅ Step 3 Complete: SMS OTP');
  //   console.log('Redux State:', {
  //     isFirstTimeUser: auth.isFirstTimeUser,
  //     currentAuthStep: auth.currentAuthStep,
  //     completedAuthSteps: auth.completedAuthSteps,
  //   });

  //   // ✅ Use a small delay to ensure Redux state is updated
  //   setTimeout(() => {
  //     if (auth.isFirstTimeUser) {
  //       console.log('→ First-time user detected, moving to Step 4');
  //       setLocalStep(4);
  //     } else {
  //       console.log('→ Returning user, completing auth');
  //       completeAuth();
  //     }
  //   }, 100);
  // };

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
    authMethod: sessionStorage.getItem('auth_method'), // ✅ NEW: Log this
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
//last working code only to have api above code
// import React, { useState, useEffect } from 'react';
// import { useAppDispatch } from '../../redux/hooks'; // ✅ Changed
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
//   const dispatch = useAppDispatch(); // ✅ Changed
//   const navigate = useNavigate();
//   const auth = useAuth();
//   const [localStep, setLocalStep] = useState(1);
//   const [completeAuthentication, { isLoading }] = useCompleteAuthenticationMutation();

//   const totalSteps = auth.isFirstTimeUser ? 7 : 3;
//   useEffect(() => {
//   // ✅ CRITICAL: First-time users MUST complete all steps before redirect
//   const shouldRedirect = 
//     auth.isAuthenticated &&
//     auth.authenticationStatus === 'completed' &&
//     auth.accessToken &&
//     !isLoading &&
//     // ✅ NEW: Ensure first-time users completed all steps
//     (!auth.isFirstTimeUser || auth.completedAuthSteps.sessionComplete);

//   if (shouldRedirect) {
//     console.log('✅ Auth fully completed, redirecting to dashboard', {
//       isFirstTimeUser: auth.isFirstTimeUser,
//       allStepsComplete: auth.completedAuthSteps.sessionComplete,
//     });
//     setTimeout(() => {
//       navigate('/dashboard', { replace: true });
//     }, 300);
//   } else if (auth.isAuthenticated && auth.isFirstTimeUser && !auth.completedAuthSteps.sessionComplete) {
//     console.log('⚠️ First-time user has NOT completed all steps - staying in auth flow', {
//       currentStep: auth.currentAuthStep,
//       completedSteps: auth.completedAuthSteps,
//     });
//   }
// }, [
//   auth.isAuthenticated,
//   auth.authenticationStatus,
//   auth.accessToken,
//   auth.isFirstTimeUser,
//   auth.completedAuthSteps.sessionComplete,
//   auth.currentAuthStep,
//   isLoading,
//   navigate,
// ]);

//   // useEffect(() => {
//   //   console.log('📊 Redux Auth State Updated:', {
//   //     currentStep: auth.currentAuthStep,
//   //     sessionId: auth.sessionId,
//   //     isFirstTimeUser: auth.isFirstTimeUser,
//   //     totalSteps,
//   //   });

//   //   setLocalStep(auth.currentAuthStep);
//   // }, [auth.currentAuthStep, auth.sessionId, auth.isFirstTimeUser]);

//   // ✅ ADD THIS - Monitor authentication completion
//   useEffect(() => {
//     if (
//       auth.isAuthenticated &&
//       auth.authenticationStatus === 'completed' &&
//       auth.accessToken &&
//       !isLoading
//     ) {
//       console.log('✅ Auth completed, redirecting to dashboard');
//       setTimeout(() => {
//         navigate('/dashboard', { replace: true });
//       }, 300);
//     }
//   }, [auth.isAuthenticated, auth.authenticationStatus, auth.accessToken, isLoading, navigate]);

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
//   console.log('✅ Step 3 Complete: SMS OTP');
//   console.log('📊 Checking user type...', {
//     isFirstTimeUser: auth.isFirstTimeUser,
//     currentAuthStep: auth.currentAuthStep,
//     completedAuthSteps: auth.completedAuthSteps,
//   });

//   // ✅ CRITICAL: Explicit boolean check
//   setTimeout(() => {
//     if (auth.isFirstTimeUser === true) {
//       console.log('→ FIRST-TIME USER: Moving to Step 4 (User Details)');
//       console.log('   → Steps 4, 5, 6 are REQUIRED before dashboard access');
//       setLocalStep(4);
//     } else if (auth.isFirstTimeUser === false) {
//       console.log('→ RETURNING USER: Completing authentication');
//       console.log('   → Skipping steps 4, 5, 6 - proceeding to dashboard');
//       completeAuth();
//     } else {
//       console.error('❌ ERROR: isFirstTimeUser is undefined!', {
//         value: auth.isFirstTimeUser,
//         type: typeof auth.isFirstTimeUser,
//       });
//       // ✅ Safety fallback - assume first-time user
//       console.log('   → Safety fallback: Treating as first-time user');
//       setLocalStep(4);
//     }
//   }, 100);
// };

//   // const handleSMSOTPNext = () => {
//   //   console.log('✅ Step 3 Complete: SMS OTP');
//   //   console.log('Redux State:', {
//   //     isFirstTimeUser: auth.isFirstTimeUser,
//   //     currentAuthStep: auth.currentAuthStep,
//   //     completedAuthSteps: auth.completedAuthSteps,
//   //   });

//   //   // ✅ Use a small delay to ensure Redux state is updated
//   //   setTimeout(() => {
//   //     if (auth.isFirstTimeUser) {
//   //       console.log('→ First-time user detected, moving to Step 4');
//   //       setLocalStep(4);
//   //     } else {
//   //       console.log('→ Returning user, completing auth');
//   //       completeAuth();
//   //     }
//   //   }, 100);
//   // };

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

//       // ✅ IMPROVED - Handle both response structures better
//       const userData = result.data?.user || result.user || result.data;
//       const tokens = result.data || result;

//       console.log('Extracted user data:', userData);
//       console.log('Has accessToken:', !!tokens.accessToken);

//       if (!userData || !userData.userId) {
//         console.error('Invalid user data:', userData);
//         throw new Error('No valid user data in response');
//       }

//       console.log('User data contains:', {
//         userId: userData.userId,
//         email: userData.email,
//         phone: userData.phone,
//         firstName: userData.firstName,
//         lastName: userData.lastName,
//         roles: userData.roles,
//       });

//       // ✅ Store complete user data in localStorage for page refresh restoration
//       console.log('Storing user data in localStorage...');
//       localStorage.setItem('userData', JSON.stringify(userData));
//       localStorage.setItem('userId', userData.userId.toString());
//       localStorage.setItem('sessionId', auth.sessionId);
//       localStorage.setItem('accessToken', tokens.accessToken || '');
//       localStorage.setItem('refreshToken', tokens.refreshToken || '');

//       console.log('✅ User data stored in localStorage');

//       // ✅ CRITICAL - Dispatch with proper structure
//       const authPayload = {
//         userId: userData.userId,
//         email: userData.email,
//         phone: userData.phone,
//         username: userData.username,
//         firstName: userData.firstName,
//         lastName: userData.lastName,
//         age: userData.age,
//         gender: userData.gender,
//         country: userData.country,
//         city: userData.city,
//         timezone: userData.timezone,
//         language: userData.language || 'en_us',
//         roles: userData.roles || [],
//         primaryRole: userData.primaryRole || 'Voter',
//         isSubscribed: userData.isSubscribed || false,
//         subscriptionType: userData.subscriptionType || null,
//         electionCreationLimit: userData.electionCreationLimit || 2,
//         isContentCreator: userData.isContentCreator || false,
//         isOrganization: userData.isOrganization || false,
//         isVerified: userData.isVerified || false,
//         isBanned: userData.isBanned || false,
//         deviceId: userData.deviceId,
//         deviceType: userData.deviceType,
//         osName: userData.osName,
//         browserName: userData.browserName,
//         ipAddress: userData.ipAddress,
//         registrationDate: userData.registrationDate,
//         biometricEnabled: userData.biometricEnabled || false,
//         biometricType: userData.biometricType,
//         accessToken: tokens.accessToken,
//         refreshToken: tokens.refreshToken,
//       };

//       console.log('Dispatching setAuthenticationComplete with payload:', authPayload);
//       dispatch(setAuthenticationComplete(authPayload));

//       console.log('✅ Redux updated with complete user data');
//       dispatch(setSuccess('Authentication completed successfully'));

//       console.log('✅ Tokens stored:');
//       console.log('   - Redux state ✅');
//       console.log('   - HTTP-only cookies ✅ (auto by backend)');
//       console.log('   - LocalStorage ✅');

//       // ✅ Don't navigate here - let the useEffect handle it
//       console.log('Auth completion dispatch finished - waiting for redirect via useEffect');
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
//     isAuthenticated: auth.isAuthenticated,
//     authStatus: auth.authenticationStatus,
//     hasToken: !!auth.accessToken,
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
