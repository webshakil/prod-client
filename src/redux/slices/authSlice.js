import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Session Information
  sessionId: null,
  isAuthenticated: false,
  authenticationStatus: 'idle', // idle, pending, completed, failed

  // User Information
  userId: null,
  email: null,
  phone: null,
  username: null,
  firstName: null,
  lastName: null,
  profilePicture: null,

  // User Details (First-time only)
  age: null,
  gender: null,
  country: null,
  city: null,
  timezone: null,
  language: 'en_us',

  // Roles and Permissions
  roles: [],
  primaryRole: 'Voter',
  isAdmin: false,
  isModerator: false,

  // Subscription Info
  isSubscribed: false,
  subscriptionType: null,
  electionCreationLimit: 2,
  isContentCreator: false,
  isOrganization: false,
  currentSubscription: null,
  subscriptionStatus: null, // 'active', 'expired', 'none'

  // Verification and Security
  isVerified: false,
  isBanned: false,
  emailVerified: false,
  phoneVerified: false,
  biometricEnabled: false,
  biometricType: null,

  // Device and Location
  deviceId: null,
  deviceType: null,
  osName: null,
  browserName: null,
  ipAddress: null,
  registrationDate: null,

  // Authentication Flow
  isFirstTimeUser: false,
  currentAuthStep: 1,
  completedAuthSteps: {
    userCheck: false,
    emailOTP: false,
    smsOTP: false,
    userDetails: false,
    biometric: false,
    securityQuestions: false,
    sessionComplete: false,
  },

  // Tokens (stored in Redux, also in HTTP-only cookies)
  accessToken: null,
  refreshToken: null,
  tokenExpiresAt: null,

  // UI State
  loading: false,
  error: null,
  successMessage: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // ✅ SET SESSION ID - MUST PERSIST
    setSessionId: (state, action) => {
      state.sessionId = action.payload;
      console.log('🔄 Redux: Session ID set:', action.payload);
    },

    // ✅ USER CHECK - SETS SESSION ID AND USER INFO
    setUserCheckData: (state, action) => {
      const {
        userId,
        email,
        phone,
        username,
        firstName,
        lastName,
        isFirstTime,
        sessionId,
      } = action.payload;

      state.userId = userId;
      state.email = email;
      state.phone = phone;
      state.username = username;
      state.firstName = firstName;
      state.lastName = lastName;
      state.isFirstTimeUser = isFirstTime;
      state.sessionId = sessionId;
      state.completedAuthSteps.userCheck = true;
      state.currentAuthStep = 2;
      state.loading = false;
      state.error = null;

      console.log('🔄 Redux: User check data set', {
        userId,
        sessionId,
        isFirstTime,
      });
    },

    // ✅ EMAIL OTP VERIFIED - KEEP SESSION ID
    setEmailOTPVerified: (state) => {
      state.emailVerified = true;
      state.completedAuthSteps.emailOTP = true;
      state.currentAuthStep = 3;
      state.loading = false;
      state.error = null;

      console.log('🔄 Redux: Email OTP verified, session:', state.sessionId);
    },

    // ✅ SMS OTP VERIFIED - KEEP SESSION ID
    // setSMSOTPVerified: (state) => {
    //   state.phoneVerified = true;
    //   state.completedAuthSteps.smsOTP = true;

    //   if (state.isFirstTimeUser) {
    //     state.currentAuthStep = 4;
    //     console.log('🔄 Redux: SMS OTP verified (first-time), step 4, session:', state.sessionId);
    //   } else {
    //     state.currentAuthStep = 7;
    //     console.log('🔄 Redux: SMS OTP verified (returning), completing, session:', state.sessionId);
    //   }

    //   state.loading = false;
    //   state.error = null;
    // },

    setSMSOTPVerified: (state) => {
  state.phoneVerified = true;
  state.completedAuthSteps.smsOTP = true;

  // ✅ CRITICAL: Check first-time user status
  if (state.isFirstTimeUser === true) {
    state.currentAuthStep = 4;
    // ✅ DO NOT SET isAuthenticated = true yet!
    state.isAuthenticated = false;
    state.authenticationStatus = 'pending';
    console.log('🔄 Redux: SMS OTP verified (FIRST-TIME USER)', {
      session: state.sessionId,
      nextStep: 4,
      mustComplete: 'Steps 4, 5, 6 before dashboard access',
    });
  } else {
    state.currentAuthStep = 7;
    // ✅ Returning users can proceed to completion
    console.log('🔄 Redux: SMS OTP verified (RETURNING USER)', {
      session: state.sessionId,
      canComplete: true,
    });
  }

  state.loading = false;
  state.error = null;
},

    // ✅ USER DETAILS - KEEP SESSION ID
    setUserDetails: (state, action) => {
      const {
        firstName,
        lastName,
        age,
        gender,
        country,
        city,
        timezone,
        language,
      } = action.payload;

      state.firstName = firstName;
      state.lastName = lastName;
      state.age = age;
      state.gender = gender;
      state.country = country;
      state.city = city;
      state.timezone = timezone;
      state.language = language;
      state.completedAuthSteps.userDetails = true;
      state.currentAuthStep = 5;
      state.loading = false;
      state.error = null;

      console.log('🔄 Redux: User details saved, step 5, session:', state.sessionId);
    },

    // ✅ BIOMETRIC DATA - KEEP SESSION ID
    setBiometricData: (state, action) => {
      const { biometricType, deviceInfo } = action.payload;

      state.biometricEnabled = true;
      state.biometricType = biometricType;
      state.deviceType = deviceInfo.deviceType;
      state.osName = deviceInfo.os;
      state.browserName = deviceInfo.browser;
      state.completedAuthSteps.biometric = true;
      state.currentAuthStep = 6;
      state.loading = false;
      state.error = null;

      console.log('🔄 Redux: Biometric collected, step 6, session:', state.sessionId);
    },

    // ✅ SECURITY QUESTIONS - KEEP SESSION ID
    setSecurityQuestionsAnswered: (state) => {
      state.completedAuthSteps.securityQuestions = true;
      state.currentAuthStep = 7;
      state.loading = false;
      state.error = null;

      console.log('🔄 Redux: Security questions answered, step 7, session:', state.sessionId);
    },

    // ✅ UPDATE SESSION FLAGS AFTER EACH STEP
    setSessionFlags: (state, action) => {
      const {
        user_details_collected,
        biometric_collected,
        security_questions_answered,
        step_number,
      } = action.payload;

      if (user_details_collected !== undefined) {
        state.completedAuthSteps.userDetails = user_details_collected;
      }
      if (biometric_collected !== undefined) {
        state.completedAuthSteps.biometric = biometric_collected;
      }
      if (security_questions_answered !== undefined) {
        state.completedAuthSteps.securityQuestions = security_questions_answered;
      }
      if (step_number !== undefined) {
        state.currentAuthStep = step_number;
      }

      console.log('🔄 Redux: Session flags updated', {
        user_details_collected,
        biometric_collected,
        security_questions_answered,
        step_number,
      });
    },

    // ✅ AUTHENTICATION COMPLETE - SET ALL DATA AND TOKENS
    setAuthenticationComplete: (state, action) => {
      const {
        userId,
        email,
        phone,
        username,
        firstName,
        lastName,
        age,
        gender,
        country,
        city,
        timezone,
        language,
        roles,
        primaryRole,
        isSubscribed,
        subscriptionType,
        electionCreationLimit,
        isContentCreator,
        isOrganization,
        isVerified,
        isBanned,
        deviceId,
        deviceType,
        osName,
        browserName,
        ipAddress,
        registrationDate,
        biometricEnabled,
        biometricType,
        accessToken,
        refreshToken,
      } = action.payload;

      state.isAuthenticated = true;
      state.authenticationStatus = 'completed';
      state.userId = userId;
      state.email = email;
      state.phone = phone;
      state.username = username;
      state.firstName = firstName;
      state.lastName = lastName;
      state.age = age;
      state.gender = gender;
      state.country = country;
      state.city = city;
      state.timezone = timezone;
      state.language = language;
      state.roles = roles || [];
      state.primaryRole = primaryRole || 'Voter';
      state.isAdmin = roles?.includes('Admin') || false;
      state.isModerator = roles?.includes('Moderator') || false;
      state.isSubscribed = isSubscribed || false;
      state.subscriptionType = subscriptionType;
      state.electionCreationLimit = electionCreationLimit || 2;
      state.isContentCreator = isContentCreator || false;
      state.isOrganization = isOrganization || false;
      state.isVerified = isVerified || false;
      state.isBanned = isBanned || false;
      state.deviceId = deviceId;
      state.deviceType = deviceType;
      state.osName = osName;
      state.browserName = browserName;
      state.ipAddress = ipAddress;
      state.registrationDate = registrationDate;
      state.biometricEnabled = biometricEnabled || false;
      state.biometricType = biometricType;

      // ✅ STORE TOKENS IN REDUX (in-memory)
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      // ✅ ALSO STORE IN LOCALSTORAGE AS BACKUP
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userId', userId);
      localStorage.setItem('sessionId', state.sessionId);

      state.completedAuthSteps.sessionComplete = true;
      state.loading = false;
      state.error = null;
      state.successMessage = 'Authentication successful';

      console.log('✅ Redux: Authentication complete, tokens stored', {
        sessionId: state.sessionId,
        userId,
      });
    },

    // ✅ SKIP OTP VERIFICATION
    skipOTPVerification: (state) => {
      state.emailVerified = true;
      state.phoneVerified = true;
      state.completedAuthSteps.emailOTP = true;
      state.completedAuthSteps.smsOTP = true;
      state.loading = false;
      state.error = null;

      console.log('🔄 Redux: OTP skipped, session:', state.sessionId);
    },

    // ✅ SET USER LOCATION DATA FOR SUBSCRIPTION
    setUserLocationData: (state, action) => {
      const { country, city, timezone } = action.payload;
      state.country = country;
      state.city = city;
      state.timezone = timezone;
      localStorage.setItem('userCountry', country);
      localStorage.setItem('userCity', city);
      localStorage.setItem('userTimezone', timezone);

      console.log('🔄 Redux: User location data set', { country, city, timezone });
    },

    // ✅ UPDATE COUNTRY
    updateCountry: (state, action) => {
      state.country = action.payload;
      localStorage.setItem('userCountry', action.payload);

      console.log('🔄 Redux: Country updated', action.payload);
    },

    // ✅ UPDATE CITY
    updateCity: (state, action) => {
      state.city = action.payload;
      localStorage.setItem('userCity', action.payload);

      console.log('🔄 Redux: City updated', action.payload);
    },

    // ✅ UPDATE TIMEZONE
    updateTimezone: (state, action) => {
      state.timezone = action.payload;
      localStorage.setItem('userTimezone', action.payload);

      console.log('🔄 Redux: Timezone updated', action.payload);
    },

    // ✅ SET CURRENT SUBSCRIPTION (FROM SUBSCRIPTION API)
    setCurrentSubscription: (state, action) => {
      state.currentSubscription = action.payload;
      state.subscriptionStatus = action.payload ? 'active' : 'none';

      console.log('🔄 Redux: Current subscription set', action.payload?.id);
    },

    // ✅ UPDATE SUBSCRIPTION STATUS
    updateSubscriptionStatus: (state, action) => {
      state.subscriptionStatus = action.payload;

      console.log('🔄 Redux: Subscription status updated', action.payload);
    },

    // ✅ UPDATE IS SUBSCRIBED FLAG
    setIsSubscribed: (state, action) => {
      state.isSubscribed = action.payload;

      // 🆕 UPDATE LOCALSTORAGE
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      userData.isSubscribed = action.payload;
      localStorage.setItem('userData', JSON.stringify(userData));

      console.log('🔄 Redux: Is subscribed flag updated', action.payload);
    },

    // ✅ UPDATE SUBSCRIPTION TYPE
    setSubscriptionType: (state, action) => {
      state.subscriptionType = action.payload;

      // 🆕 UPDATE LOCALSTORAGE
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      userData.subscriptionType = action.payload;
      localStorage.setItem('userData', JSON.stringify(userData));

      console.log('🔄 Redux: Subscription type updated', action.payload);
    },

    // ✅ UPDATE ELECTION CREATION LIMIT
    setElectionCreationLimit: (state, action) => {
      state.electionCreationLimit = action.payload;

      console.log('🔄 Redux: Election creation limit updated', action.payload);
    },

    // ✅ UPDATE IS CONTENT CREATOR
    setIsContentCreator: (state, action) => {
      state.isContentCreator = action.payload;

      console.log('🔄 Redux: Is content creator updated', action.payload);
    },

    // ✅ UPDATE IS ORGANIZATION
    setIsOrganization: (state, action) => {
      state.isOrganization = action.payload;

      console.log('🔄 Redux: Is organization updated', action.payload);
    },

    // ✅ UPDATE CURRENT ELECTIONS COUNT
    setCurrentElectionsCount: (state, action) => {
      state.currentElectionsCount = action.payload;

      console.log('🔄 Redux: Current elections count updated', action.payload);
    },

    // ✅ LOADING STATE
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // ✅ ERROR STATE
    setError: (state, action) => {
      state.error = action.payload;
      state.successMessage = null;
      state.loading = false;

      console.error('❌ Redux Error:', action.payload);
    },

    // ✅ SUCCESS STATE
    setSuccess: (state, action) => {
      state.successMessage = action.payload;
      state.error = null;

      console.log('✅ Redux Success:', action.payload);
    },

    // ✅ CLEAR SUCCESS
    clearSuccess: (state) => {
      state.successMessage = null;
    },

    // ✅ CLEAR ERROR
    clearError: (state) => {
      state.error = null;
    },

    // ✅ REFRESH ACCESS TOKEN
    refreshAccessToken: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      localStorage.setItem('accessToken', action.payload.accessToken);

      console.log('🔄 Redux: Access token refreshed');
    },

    // ✅ LOGOUT - CLEAR EVERYTHING
    /*eslint-disable*/
    logout: (state) => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('sessionId');
      localStorage.removeItem('userCountry');
      localStorage.removeItem('userCity');
      localStorage.removeItem('userTimezone');

      console.log('🚀 Redux: User logged out, all data cleared');

      return initialState;
    },

    // ✅ RESTORE AUTH FROM STORAGE (for page refresh)
    restoreAuthFromStorage: (state, action) => {
      const {
        userId,
        email,
        phone,
        username,
        firstName,
        lastName,
        age,
        gender,
        country,
        city,
        timezone,
        language,
        roles,
        primaryRole,
        isSubscribed,
        subscriptionType,
        electionCreationLimit,
        isContentCreator,
        isOrganization,
        isVerified,
        isBanned,
        biometricEnabled,
        biometricType,
        accessToken,
        refreshToken,
      } = action.payload;

      state.isAuthenticated = true;
      state.authenticationStatus = 'completed';
      state.userId = userId;
      state.email = email;
      state.phone = phone;
      state.username = username;
      state.firstName = firstName;
      state.lastName = lastName;
      state.age = age;
      state.gender = gender;
      state.country = country;
      state.city = city;
      state.timezone = timezone;
      state.language = language;
      state.roles = roles || [];
      state.primaryRole = primaryRole || 'Voter';
      state.isAdmin = roles?.includes('Admin') || false;
      state.isModerator = roles?.includes('Moderator') || false;
      state.isSubscribed = isSubscribed || false;
      state.subscriptionType = subscriptionType;
      state.electionCreationLimit = electionCreationLimit || 2;
      state.isContentCreator = isContentCreator || false;
      state.isOrganization = isOrganization || false;
      state.isVerified = isVerified || false;
      state.isBanned = isBanned || false;
      state.biometricEnabled = biometricEnabled || false;
      state.biometricType = biometricType;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;

      console.log('✅ Redux: Auth restored from storage', { userId });
    },

    // ✅ RESET AUTH STATE
    resetAuthState: (state) => {
      state.isAuthenticated = false;
      state.authenticationStatus = 'idle';
      state.sessionId = null;
      state.currentAuthStep = 1;
      state.completedAuthSteps = {
        userCheck: false,
        emailOTP: false,
        smsOTP: false,
        userDetails: false,
        biometric: false,
        securityQuestions: false,
        sessionComplete: false,
      };
      state.userId = null;
      state.email = null;
      state.phone = null;
      state.username = null;
      state.firstName = null;
      state.lastName = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.loading = false;
      state.error = null;
      state.successMessage = null;
      state.currentSubscription = null;
      state.subscriptionStatus = null;

      console.log('🔄 Redux: Auth state reset');
    },
  },
});

export const {
  setSessionId,
  setUserCheckData,
  setEmailOTPVerified,
  setSMSOTPVerified,
  setUserDetails,
  setBiometricData,
  setSecurityQuestionsAnswered,
  setAuthenticationComplete,
  setSessionFlags,
  skipOTPVerification,
  setUserLocationData,
  updateCountry,
  updateCity,
  updateTimezone,
  setCurrentSubscription,
  updateSubscriptionStatus,
  setIsSubscribed,
  setSubscriptionType,
  setElectionCreationLimit,
  setIsContentCreator,
  setIsOrganization,
  setCurrentElectionsCount,
  setLoading,
  setError,
  setSuccess,
  clearSuccess,
  clearError,
  refreshAccessToken,
  logout,
  restoreAuthFromStorage,
  resetAuthState,
} = authSlice.actions;

export default authSlice.reducer;
// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   // Session Information
//   sessionId: null,
//   isAuthenticated: false,
//   authenticationStatus: 'idle', // idle, pending, completed, failed

//   // User Information
//   userId: null,
//   email: null,
//   phone: null,
//   username: null,
//   firstName: null,
//   lastName: null,
//   profilePicture: null,

//   // User Details (First-time only)
//   age: null,
//   gender: null,
//   country: null,
//   city: null,
//   timezone: null,
//   language: 'en_us',

//   // Roles and Permissions
//   roles: [],
//   primaryRole: 'Voter',
//   isAdmin: false,
//   isModerator: false,

//   // Subscription Info
//   isSubscribed: false,
//   subscriptionType: null,
//   electionCreationLimit: 2,
//   isContentCreator: false,
//   isOrganization: false,
//   currentSubscription: null,
//   subscriptionStatus: null, // 'active', 'expired', 'none'

//   // Verification and Security
//   isVerified: false,
//   isBanned: false,
//   emailVerified: false,
//   phoneVerified: false,
//   biometricEnabled: false,
//   biometricType: null,

//   // Device and Location
//   deviceId: null,
//   deviceType: null,
//   osName: null,
//   browserName: null,
//   ipAddress: null,
//   registrationDate: null,

//   // Authentication Flow
//   isFirstTimeUser: false,
//   currentAuthStep: 1,
//   completedAuthSteps: {
//     userCheck: false,
//     emailOTP: false,
//     smsOTP: false,
//     userDetails: false,
//     biometric: false,
//     securityQuestions: false,
//     sessionComplete: false,
//   },

//   // Tokens (stored in Redux, also in HTTP-only cookies)
//   accessToken: null,
//   refreshToken: null,
//   tokenExpiresAt: null,

//   // UI State
//   loading: false,
//   error: null,
//   successMessage: null,
// };

// export const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     // ✅ SET SESSION ID - MUST PERSIST
//     setSessionId: (state, action) => {
//       state.sessionId = action.payload;
//       console.log('🔄 Redux: Session ID set:', action.payload);
//     },

//     // ✅ USER CHECK - SETS SESSION ID AND USER INFO
//     setUserCheckData: (state, action) => {
//       const {
//         userId,
//         email,
//         phone,
//         username,
//         firstName,
//         lastName,
//         isFirstTime,
//         sessionId,
//       } = action.payload;

//       state.userId = userId;
//       state.email = email;
//       state.phone = phone;
//       state.username = username;
//       state.firstName = firstName;
//       state.lastName = lastName;
//       state.isFirstTimeUser = isFirstTime;
//       state.sessionId = sessionId;
//       state.completedAuthSteps.userCheck = true;
//       state.currentAuthStep = 2;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: User check data set', {
//         userId,
//         sessionId,
//         isFirstTime,
//       });
//     },

//     // ✅ EMAIL OTP VERIFIED - KEEP SESSION ID
//     setEmailOTPVerified: (state) => {
//       state.emailVerified = true;
//       state.completedAuthSteps.emailOTP = true;
//       state.currentAuthStep = 3;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: Email OTP verified, session:', state.sessionId);
//     },

//     // ✅ SMS OTP VERIFIED - KEEP SESSION ID
//     setSMSOTPVerified: (state) => {
//       state.phoneVerified = true;
//       state.completedAuthSteps.smsOTP = true;

//       if (state.isFirstTimeUser) {
//         state.currentAuthStep = 4;
//         console.log('🔄 Redux: SMS OTP verified (first-time), step 4, session:', state.sessionId);
//       } else {
//         state.currentAuthStep = 7;
//         console.log('🔄 Redux: SMS OTP verified (returning), completing, session:', state.sessionId);
//       }

//       state.loading = false;
//       state.error = null;
//     },

//     // ✅ USER DETAILS - KEEP SESSION ID
//     setUserDetails: (state, action) => {
//       const {
//         firstName,
//         lastName,
//         age,
//         gender,
//         country,
//         city,
//         timezone,
//         language,
//       } = action.payload;

//       state.firstName = firstName;
//       state.lastName = lastName;
//       state.age = age;
//       state.gender = gender;
//       state.country = country;
//       state.city = city;
//       state.timezone = timezone;
//       state.language = language;
//       state.completedAuthSteps.userDetails = true;
//       state.currentAuthStep = 5;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: User details saved, step 5, session:', state.sessionId);
//     },

//     // ✅ BIOMETRIC DATA - KEEP SESSION ID
//     setBiometricData: (state, action) => {
//       const { biometricType, deviceInfo } = action.payload;

//       state.biometricEnabled = true;
//       state.biometricType = biometricType;
//       state.deviceType = deviceInfo.deviceType;
//       state.osName = deviceInfo.os;
//       state.browserName = deviceInfo.browser;
//       state.completedAuthSteps.biometric = true;
//       state.currentAuthStep = 6;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: Biometric collected, step 6, session:', state.sessionId);
//     },

//     // ✅ SECURITY QUESTIONS - KEEP SESSION ID
//     setSecurityQuestionsAnswered: (state) => {
//       state.completedAuthSteps.securityQuestions = true;
//       state.currentAuthStep = 7;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: Security questions answered, step 7, session:', state.sessionId);
//     },

//     // ✅ UPDATE SESSION FLAGS AFTER EACH STEP
//     setSessionFlags: (state, action) => {
//       const {
//         user_details_collected,
//         biometric_collected,
//         security_questions_answered,
//         step_number,
//       } = action.payload;

//       if (user_details_collected !== undefined) {
//         state.completedAuthSteps.userDetails = user_details_collected;
//       }
//       if (biometric_collected !== undefined) {
//         state.completedAuthSteps.biometric = biometric_collected;
//       }
//       if (security_questions_answered !== undefined) {
//         state.completedAuthSteps.securityQuestions = security_questions_answered;
//       }
//       if (step_number !== undefined) {
//         state.currentAuthStep = step_number;
//       }

//       console.log('🔄 Redux: Session flags updated', {
//         user_details_collected,
//         biometric_collected,
//         security_questions_answered,
//         step_number,
//       });
//     },

//     // ✅ AUTHENTICATION COMPLETE - SET ALL DATA AND TOKENS
//     setAuthenticationComplete: (state, action) => {
//       const {
//         userId,
//         email,
//         phone,
//         username,
//         firstName,
//         lastName,
//         age,
//         gender,
//         country,
//         city,
//         timezone,
//         language,
//         roles,
//         primaryRole,
//         isSubscribed,
//         subscriptionType,
//         electionCreationLimit,
//         isContentCreator,
//         isOrganization,
//         isVerified,
//         isBanned,
//         deviceId,
//         deviceType,
//         osName,
//         browserName,
//         ipAddress,
//         registrationDate,
//         biometricEnabled,
//         biometricType,
//         accessToken,
//         refreshToken,
//       } = action.payload;

//       state.isAuthenticated = true;
//       state.authenticationStatus = 'completed';
//       state.userId = userId;
//       state.email = email;
//       state.phone = phone;
//       state.username = username;
//       state.firstName = firstName;
//       state.lastName = lastName;
//       state.age = age;
//       state.gender = gender;
//       state.country = country;
//       state.city = city;
//       state.timezone = timezone;
//       state.language = language;
//       state.roles = roles || [];
//       state.primaryRole = primaryRole || 'Voter';
//       state.isAdmin = roles?.includes('Admin') || false;
//       state.isModerator = roles?.includes('Moderator') || false;
//       state.isSubscribed = isSubscribed || false;
//       state.subscriptionType = subscriptionType;
//       state.electionCreationLimit = electionCreationLimit || 2;
//       state.isContentCreator = isContentCreator || false;
//       state.isOrganization = isOrganization || false;
//       state.isVerified = isVerified || false;
//       state.isBanned = isBanned || false;
//       state.deviceId = deviceId;
//       state.deviceType = deviceType;
//       state.osName = osName;
//       state.browserName = browserName;
//       state.ipAddress = ipAddress;
//       state.registrationDate = registrationDate;
//       state.biometricEnabled = biometricEnabled || false;
//       state.biometricType = biometricType;

//       // ✅ STORE TOKENS IN REDUX (in-memory)
//       state.accessToken = accessToken;
//       state.refreshToken = refreshToken;
//       state.tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

//       // ✅ ALSO STORE IN LOCALSTORAGE AS BACKUP
//       localStorage.setItem('accessToken', accessToken);
//       localStorage.setItem('refreshToken', refreshToken);
//       localStorage.setItem('userId', userId);
//       localStorage.setItem('sessionId', state.sessionId);

//       state.completedAuthSteps.sessionComplete = true;
//       state.loading = false;
//       state.error = null;
//       state.successMessage = 'Authentication successful';

//       console.log('✅ Redux: Authentication complete, tokens stored', {
//         sessionId: state.sessionId,
//         userId,
//       });
//     },

//     // ✅ SKIP OTP VERIFICATION
//     skipOTPVerification: (state) => {
//       state.emailVerified = true;
//       state.phoneVerified = true;
//       state.completedAuthSteps.emailOTP = true;
//       state.completedAuthSteps.smsOTP = true;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: OTP skipped, session:', state.sessionId);
//     },

//     // ✅ SET USER LOCATION DATA FOR SUBSCRIPTION
//     setUserLocationData: (state, action) => {
//       const { country, city, timezone } = action.payload;
//       state.country = country;
//       state.city = city;
//       state.timezone = timezone;
//       localStorage.setItem('userCountry', country);
//       localStorage.setItem('userCity', city);
//       localStorage.setItem('userTimezone', timezone);

//       console.log('🔄 Redux: User location data set', { country, city, timezone });
//     },

//     // ✅ UPDATE COUNTRY
//     updateCountry: (state, action) => {
//       state.country = action.payload;
//       localStorage.setItem('userCountry', action.payload);

//       console.log('🔄 Redux: Country updated', action.payload);
//     },

//     // ✅ UPDATE CITY
//     updateCity: (state, action) => {
//       state.city = action.payload;
//       localStorage.setItem('userCity', action.payload);

//       console.log('🔄 Redux: City updated', action.payload);
//     },

//     // ✅ UPDATE TIMEZONE
//     updateTimezone: (state, action) => {
//       state.timezone = action.payload;
//       localStorage.setItem('userTimezone', action.payload);

//       console.log('🔄 Redux: Timezone updated', action.payload);
//     },

//     // ✅ SET CURRENT SUBSCRIPTION (FROM SUBSCRIPTION API)
//     setCurrentSubscription: (state, action) => {
//       state.currentSubscription = action.payload;
//       state.subscriptionStatus = action.payload ? 'active' : 'none';

//       console.log('🔄 Redux: Current subscription set', action.payload?.id);
//     },

//     // ✅ UPDATE SUBSCRIPTION STATUS
//     updateSubscriptionStatus: (state, action) => {
//       state.subscriptionStatus = action.payload;

//       console.log('🔄 Redux: Subscription status updated', action.payload);
//     },

//     // ✅ UPDATE IS SUBSCRIBED FLAG
//     setIsSubscribed: (state, action) => {
//       state.isSubscribed = action.payload;

//       console.log('🔄 Redux: Is subscribed flag updated', action.payload);
//     },

//     // ✅ UPDATE SUBSCRIPTION TYPE
//     setSubscriptionType: (state, action) => {
//       state.subscriptionType = action.payload;

//       console.log('🔄 Redux: Subscription type updated', action.payload);
//     },

//     // ✅ UPDATE ELECTION CREATION LIMIT
//     setElectionCreationLimit: (state, action) => {
//       state.electionCreationLimit = action.payload;

//       console.log('🔄 Redux: Election creation limit updated', action.payload);
//     },

//     // ✅ UPDATE IS CONTENT CREATOR
//     setIsContentCreator: (state, action) => {
//       state.isContentCreator = action.payload;

//       console.log('🔄 Redux: Is content creator updated', action.payload);
//     },

//     // ✅ UPDATE IS ORGANIZATION
//     setIsOrganization: (state, action) => {
//       state.isOrganization = action.payload;

//       console.log('🔄 Redux: Is organization updated', action.payload);
//     },

//     // ✅ UPDATE CURRENT ELECTIONS COUNT
//     setCurrentElectionsCount: (state, action) => {
//       state.currentElectionsCount = action.payload;

//       console.log('🔄 Redux: Current elections count updated', action.payload);
//     },

//     // ✅ LOADING STATE
//     setLoading: (state, action) => {
//       state.loading = action.payload;
//     },

//     // ✅ ERROR STATE
//     setError: (state, action) => {
//       state.error = action.payload;
//       state.successMessage = null;
//       state.loading = false;

//       console.error('❌ Redux Error:', action.payload);
//     },

//     // ✅ SUCCESS STATE
//     setSuccess: (state, action) => {
//       state.successMessage = action.payload;
//       state.error = null;

//       console.log('✅ Redux Success:', action.payload);
//     },

//     // ✅ CLEAR SUCCESS
//     clearSuccess: (state) => {
//       state.successMessage = null;
//     },

//     // ✅ CLEAR ERROR
//     clearError: (state) => {
//       state.error = null;
//     },

//     // ✅ REFRESH ACCESS TOKEN
//     refreshAccessToken: (state, action) => {
//       state.accessToken = action.payload.accessToken;
//       state.tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

//       localStorage.setItem('accessToken', action.payload.accessToken);

//       console.log('🔄 Redux: Access token refreshed');
//     },

//     // ✅ LOGOUT - CLEAR EVERYTHING
//     /*eslint-disable*/
//     logout: (state) => {
//       localStorage.removeItem('accessToken');
//       localStorage.removeItem('refreshToken');
//       localStorage.removeItem('userId');
//       localStorage.removeItem('sessionId');
//       localStorage.removeItem('userCountry');
//       localStorage.removeItem('userCity');
//       localStorage.removeItem('userTimezone');

//       console.log('🚀 Redux: User logged out, all data cleared');

//       return initialState;
//     },

//     // ✅ RESTORE AUTH FROM STORAGE (for page refresh)
//     restoreAuthFromStorage: (state, action) => {
//       const {
//         userId,
//         email,
//         phone,
//         username,
//         firstName,
//         lastName,
//         age,
//         gender,
//         country,
//         city,
//         timezone,
//         language,
//         roles,
//         primaryRole,
//         isSubscribed,
//         subscriptionType,
//         electionCreationLimit,
//         isContentCreator,
//         isOrganization,
//         isVerified,
//         isBanned,
//         biometricEnabled,
//         biometricType,
//         accessToken,
//         refreshToken,
//       } = action.payload;

//       state.isAuthenticated = true;
//       state.authenticationStatus = 'completed';
//       state.userId = userId;
//       state.email = email;
//       state.phone = phone;
//       state.username = username;
//       state.firstName = firstName;
//       state.lastName = lastName;
//       state.age = age;
//       state.gender = gender;
//       state.country = country;
//       state.city = city;
//       state.timezone = timezone;
//       state.language = language;
//       state.roles = roles || [];
//       state.primaryRole = primaryRole || 'Voter';
//       state.isAdmin = roles?.includes('Admin') || false;
//       state.isModerator = roles?.includes('Moderator') || false;
//       state.isSubscribed = isSubscribed || false;
//       state.subscriptionType = subscriptionType;
//       state.electionCreationLimit = electionCreationLimit || 2;
//       state.isContentCreator = isContentCreator || false;
//       state.isOrganization = isOrganization || false;
//       state.isVerified = isVerified || false;
//       state.isBanned = isBanned || false;
//       state.biometricEnabled = biometricEnabled || false;
//       state.biometricType = biometricType;
//       state.accessToken = accessToken;
//       state.refreshToken = refreshToken;

//       console.log('✅ Redux: Auth restored from storage', { userId });
//     },

//     // ✅ RESET AUTH STATE
//     resetAuthState: (state) => {
//       state.isAuthenticated = false;
//       state.authenticationStatus = 'idle';
//       state.sessionId = null;
//       state.currentAuthStep = 1;
//       state.completedAuthSteps = {
//         userCheck: false,
//         emailOTP: false,
//         smsOTP: false,
//         userDetails: false,
//         biometric: false,
//         securityQuestions: false,
//         sessionComplete: false,
//       };
//       state.userId = null;
//       state.email = null;
//       state.phone = null;
//       state.username = null;
//       state.firstName = null;
//       state.lastName = null;
//       state.accessToken = null;
//       state.refreshToken = null;
//       state.loading = false;
//       state.error = null;
//       state.successMessage = null;
//       state.currentSubscription = null;
//       state.subscriptionStatus = null;

//       console.log('🔄 Redux: Auth state reset');
//     },
//   },
// });

// export const {
//   setSessionId,
//   setUserCheckData,
//   setEmailOTPVerified,
//   setSMSOTPVerified,
//   setUserDetails,
//   setBiometricData,
//   setSecurityQuestionsAnswered,
//   setAuthenticationComplete,
//   setSessionFlags,
//   skipOTPVerification,
//   setUserLocationData,
//   updateCountry,
//   updateCity,
//   updateTimezone,
//   setCurrentSubscription,
//   updateSubscriptionStatus,
//   setIsSubscribed,
//   setSubscriptionType,
//   setElectionCreationLimit,
//   setIsContentCreator,
//   setIsOrganization,
//   setCurrentElectionsCount,
//   setLoading,
//   setError,
//   setSuccess,
//   clearSuccess,
//   clearError,
//   refreshAccessToken,
//   logout,
//   restoreAuthFromStorage,
//   resetAuthState,
// } = authSlice.actions;

// export default authSlice.reducer;

// //last workable file
// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   // Session Information
//   sessionId: null,
//   isAuthenticated: false,
//   authenticationStatus: 'idle', // idle, pending, completed, failed

//   // User Information
//   userId: null,
//   email: null,
//   phone: null,
//   username: null,
//   firstName: null,
//   lastName: null,
//   profilePicture: null,

//   // User Details (First-time only)
//   age: null,
//   gender: null,
//   country: null,
//   city: null,
//   timezone: null,
//   language: 'en_us',

//   // Roles and Permissions
//   roles: [],
//   primaryRole: 'Voter',
//   isAdmin: false,
//   isModerator: false,

//   // Subscription Info
//   isSubscribed: false,
//   subscriptionType: null,
//   electionCreationLimit: 2,
//   isContentCreator: false,
//   isOrganization: false,
//   currentSubscription: null,
//   subscriptionStatus: null, // 'active', 'expired', 'none'

//   // Verification and Security
//   isVerified: false,
//   isBanned: false,
//   emailVerified: false,
//   phoneVerified: false,
//   biometricEnabled: false,
//   biometricType: null,

//   // Device and Location
//   deviceId: null,
//   deviceType: null,
//   osName: null,
//   browserName: null,
//   ipAddress: null,
//   registrationDate: null,

//   // Authentication Flow
//   isFirstTimeUser: false,
//   currentAuthStep: 1,
//   completedAuthSteps: {
//     userCheck: false,
//     emailOTP: false,
//     smsOTP: false,
//     userDetails: false,
//     biometric: false,
//     securityQuestions: false,
//     sessionComplete: false,
//   },

//   // Tokens (stored in Redux, also in HTTP-only cookies)
//   accessToken: null,
//   refreshToken: null,
//   tokenExpiresAt: null,

//   // UI State
//   loading: false,
//   error: null,
//   successMessage: null,
// };

// export const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     // ✅ SET SESSION ID - MUST PERSIST
//     setSessionId: (state, action) => {
//       state.sessionId = action.payload;
//       console.log('🔄 Redux: Session ID set:', action.payload);
//     },

//     // ✅ USER CHECK - SETS SESSION ID AND USER INFO
//     setUserCheckData: (state, action) => {
//       const {
//         userId,
//         email,
//         phone,
//         username,
//         firstName,
//         lastName,
//         isFirstTime,
//         sessionId,
//       } = action.payload;

//       state.userId = userId;
//       state.email = email;
//       state.phone = phone;
//       state.username = username;
//       state.firstName = firstName;
//       state.lastName = lastName;
//       state.isFirstTimeUser = isFirstTime;
//       state.sessionId = sessionId;
//       state.completedAuthSteps.userCheck = true;
//       state.currentAuthStep = 2;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: User check data set', {
//         userId,
//         sessionId,
//         isFirstTime,
//       });
//     },

//     // ✅ EMAIL OTP VERIFIED - KEEP SESSION ID
//     setEmailOTPVerified: (state) => {
//       state.emailVerified = true;
//       state.completedAuthSteps.emailOTP = true;
//       state.currentAuthStep = 3;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: Email OTP verified, session:', state.sessionId);
//     },

//     // ✅ SMS OTP VERIFIED - KEEP SESSION ID
//     setSMSOTPVerified: (state) => {
//       state.phoneVerified = true;
//       state.completedAuthSteps.smsOTP = true;

//       if (state.isFirstTimeUser) {
//         state.currentAuthStep = 4;
//         console.log('🔄 Redux: SMS OTP verified (first-time), step 4, session:', state.sessionId);
//       } else {
//         state.currentAuthStep = 7;
//         console.log('🔄 Redux: SMS OTP verified (returning), completing, session:', state.sessionId);
//       }

//       state.loading = false;
//       state.error = null;
//     },

//     // ✅ USER DETAILS - KEEP SESSION ID
//     setUserDetails: (state, action) => {
//       const {
//         firstName,
//         lastName,
//         age,
//         gender,
//         country,
//         city,
//         timezone,
//         language,
//       } = action.payload;

//       state.firstName = firstName;
//       state.lastName = lastName;
//       state.age = age;
//       state.gender = gender;
//       state.country = country;
//       state.city = city;
//       state.timezone = timezone;
//       state.language = language;
//       state.completedAuthSteps.userDetails = true;
//       state.currentAuthStep = 5;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: User details saved, step 5, session:', state.sessionId);
//     },

//     // ✅ BIOMETRIC DATA - KEEP SESSION ID
//     setBiometricData: (state, action) => {
//       const { biometricType, deviceInfo } = action.payload;

//       state.biometricEnabled = true;
//       state.biometricType = biometricType;
//       state.deviceType = deviceInfo.deviceType;
//       state.osName = deviceInfo.os;
//       state.browserName = deviceInfo.browser;
//       state.completedAuthSteps.biometric = true;
//       state.currentAuthStep = 6;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: Biometric collected, step 6, session:', state.sessionId);
//     },

//     // ✅ SECURITY QUESTIONS - KEEP SESSION ID
//     setSecurityQuestionsAnswered: (state) => {
//       state.completedAuthSteps.securityQuestions = true;
//       state.currentAuthStep = 7;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: Security questions answered, step 7, session:', state.sessionId);
//     },

//     // ✅ UPDATE SESSION FLAGS AFTER EACH STEP
//     setSessionFlags: (state, action) => {
//       const {
//         user_details_collected,
//         biometric_collected,
//         security_questions_answered,
//         step_number,
//       } = action.payload;

//       if (user_details_collected !== undefined) {
//         state.completedAuthSteps.userDetails = user_details_collected;
//       }
//       if (biometric_collected !== undefined) {
//         state.completedAuthSteps.biometric = biometric_collected;
//       }
//       if (security_questions_answered !== undefined) {
//         state.completedAuthSteps.securityQuestions = security_questions_answered;
//       }
//       if (step_number !== undefined) {
//         state.currentAuthStep = step_number;
//       }

//       console.log('🔄 Redux: Session flags updated', {
//         user_details_collected,
//         biometric_collected,
//         security_questions_answered,
//         step_number,
//       });
//     },

//     // ✅ AUTHENTICATION COMPLETE - SET ALL DATA AND TOKENS
//     setAuthenticationComplete: (state, action) => {
//       const {
//         userId,
//         email,
//         phone,
//         username,
//         firstName,
//         lastName,
//         age,
//         gender,
//         country,
//         city,
//         timezone,
//         language,
//         roles,
//         primaryRole,
//         isSubscribed,
//         subscriptionType,
//         electionCreationLimit,
//         isContentCreator,
//         isOrganization,
//         isVerified,
//         isBanned,
//         deviceId,
//         deviceType,
//         osName,
//         browserName,
//         ipAddress,
//         registrationDate,
//         biometricEnabled,
//         biometricType,
//         accessToken,
//         refreshToken,
//       } = action.payload;

//       state.isAuthenticated = true;
//       state.authenticationStatus = 'completed';
//       state.userId = userId;
//       state.email = email;
//       state.phone = phone;
//       state.username = username;
//       state.firstName = firstName;
//       state.lastName = lastName;
//       state.age = age;
//       state.gender = gender;
//       state.country = country;
//       state.city = city;
//       state.timezone = timezone;
//       state.language = language;
//       state.roles = roles || [];
//       state.primaryRole = primaryRole || 'Voter';
//       state.isAdmin = roles?.includes('Admin') || false;
//       state.isModerator = roles?.includes('Moderator') || false;
//       state.isSubscribed = isSubscribed || false;
//       state.subscriptionType = subscriptionType;
//       state.electionCreationLimit = electionCreationLimit || 2;
//       state.isContentCreator = isContentCreator || false;
//       state.isOrganization = isOrganization || false;
//       state.isVerified = isVerified || false;
//       state.isBanned = isBanned || false;
//       state.deviceId = deviceId;
//       state.deviceType = deviceType;
//       state.osName = osName;
//       state.browserName = browserName;
//       state.ipAddress = ipAddress;
//       state.registrationDate = registrationDate;
//       state.biometricEnabled = biometricEnabled || false;
//       state.biometricType = biometricType;

//       // ✅ STORE TOKENS IN REDUX (in-memory)
//       state.accessToken = accessToken;
//       state.refreshToken = refreshToken;
//       state.tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

//       // ✅ ALSO STORE IN LOCALSTORAGE AS BACKUP
//       localStorage.setItem('accessToken', accessToken);
//       localStorage.setItem('refreshToken', refreshToken);
//       localStorage.setItem('userId', userId);
//       localStorage.setItem('sessionId', state.sessionId);

//       state.completedAuthSteps.sessionComplete = true;
//       state.loading = false;
//       state.error = null;
//       state.successMessage = 'Authentication successful';

//       console.log('✅ Redux: Authentication complete, tokens stored', {
//         sessionId: state.sessionId,
//         userId,
//       });
//     },

//     // ✅ SKIP OTP VERIFICATION
//     skipOTPVerification: (state) => {
//       state.emailVerified = true;
//       state.phoneVerified = true;
//       state.completedAuthSteps.emailOTP = true;
//       state.completedAuthSteps.smsOTP = true;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: OTP skipped, session:', state.sessionId);
//     },

//     // ✅ SET USER LOCATION DATA FOR SUBSCRIPTION
//     setUserLocationData: (state, action) => {
//       const { country, city, timezone } = action.payload;
//       state.country = country;
//       state.city = city;
//       state.timezone = timezone;
//       localStorage.setItem('userCountry', country);
//       localStorage.setItem('userCity', city);
//       localStorage.setItem('userTimezone', timezone);

//       console.log('🔄 Redux: User location data set', { country, city, timezone });
//     },

//     // ✅ UPDATE COUNTRY
//     updateCountry: (state, action) => {
//       state.country = action.payload;
//       localStorage.setItem('userCountry', action.payload);

//       console.log('🔄 Redux: Country updated', action.payload);
//     },

//     // ✅ UPDATE CITY
//     updateCity: (state, action) => {
//       state.city = action.payload;
//       localStorage.setItem('userCity', action.payload);

//       console.log('🔄 Redux: City updated', action.payload);
//     },

//     // ✅ UPDATE TIMEZONE
//     updateTimezone: (state, action) => {
//       state.timezone = action.payload;
//       localStorage.setItem('userTimezone', action.payload);

//       console.log('🔄 Redux: Timezone updated', action.payload);
//     },

//     // ✅ SET CURRENT SUBSCRIPTION (FROM SUBSCRIPTION API)
//     setCurrentSubscription: (state, action) => {
//       state.currentSubscription = action.payload;
//       state.subscriptionStatus = action.payload ? 'active' : 'none';

//       console.log('🔄 Redux: Current subscription set', action.payload?.id);
//     },

//     // ✅ UPDATE SUBSCRIPTION STATUS
//     updateSubscriptionStatus: (state, action) => {
//       state.subscriptionStatus = action.payload;

//       console.log('🔄 Redux: Subscription status updated', action.payload);
//     },

//     // ✅ UPDATE IS SUBSCRIBED FLAG
//     setIsSubscribed: (state, action) => {
//       state.isSubscribed = action.payload;

//       console.log('🔄 Redux: Is subscribed flag updated', action.payload);
//     },

//     // ✅ UPDATE SUBSCRIPTION TYPE
//     setSubscriptionType: (state, action) => {
//       state.subscriptionType = action.payload;

//       console.log('🔄 Redux: Subscription type updated', action.payload);
//     },

//     // ✅ UPDATE ELECTION CREATION LIMIT
//     setElectionCreationLimit: (state, action) => {
//       state.electionCreationLimit = action.payload;

//       console.log('🔄 Redux: Election creation limit updated', action.payload);
//     },

//     // ✅ UPDATE IS CONTENT CREATOR
//     setIsContentCreator: (state, action) => {
//       state.isContentCreator = action.payload;

//       console.log('🔄 Redux: Is content creator updated', action.payload);
//     },

//     // ✅ UPDATE IS ORGANIZATION
//     setIsOrganization: (state, action) => {
//       state.isOrganization = action.payload;

//       console.log('🔄 Redux: Is organization updated', action.payload);
//     },

//     // ✅ LOADING STATE
//     setLoading: (state, action) => {
//       state.loading = action.payload;
//     },

//     // ✅ ERROR STATE
//     setError: (state, action) => {
//       state.error = action.payload;
//       state.successMessage = null;
//       state.loading = false;

//       console.error('❌ Redux Error:', action.payload);
//     },

//     // ✅ SUCCESS STATE
//     setSuccess: (state, action) => {
//       state.successMessage = action.payload;
//       state.error = null;

//       console.log('✅ Redux Success:', action.payload);
//     },

//     // ✅ CLEAR SUCCESS
//     clearSuccess: (state) => {
//       state.successMessage = null;
//     },

//     // ✅ CLEAR ERROR
//     clearError: (state) => {
//       state.error = null;
//     },

//     // ✅ REFRESH ACCESS TOKEN
//     refreshAccessToken: (state, action) => {
//       state.accessToken = action.payload.accessToken;
//       state.tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

//       localStorage.setItem('accessToken', action.payload.accessToken);

//       console.log('🔄 Redux: Access token refreshed');
//     },

//     // ✅ LOGOUT - CLEAR EVERYTHING
//     /*eslint-disable*/
//     logout: (state) => {
//       localStorage.removeItem('accessToken');
//       localStorage.removeItem('refreshToken');
//       localStorage.removeItem('userId');
//       localStorage.removeItem('sessionId');
//       localStorage.removeItem('userCountry');
//       localStorage.removeItem('userCity');
//       localStorage.removeItem('userTimezone');

//       console.log('🚀 Redux: User logged out, all data cleared');

//       return initialState;
//     },

//     // ✅ RESTORE AUTH FROM STORAGE (for page refresh)
//     restoreAuthFromStorage: (state, action) => {
//       const {
//         userId,
//         email,
//         phone,
//         username,
//         firstName,
//         lastName,
//         age,
//         gender,
//         country,
//         city,
//         timezone,
//         language,
//         roles,
//         primaryRole,
//         isSubscribed,
//         subscriptionType,
//         electionCreationLimit,
//         isContentCreator,
//         isOrganization,
//         isVerified,
//         isBanned,
//         biometricEnabled,
//         biometricType,
//         accessToken,
//         refreshToken,
//       } = action.payload;

//       state.isAuthenticated = true;
//       state.authenticationStatus = 'completed';
//       state.userId = userId;
//       state.email = email;
//       state.phone = phone;
//       state.username = username;
//       state.firstName = firstName;
//       state.lastName = lastName;
//       state.age = age;
//       state.gender = gender;
//       state.country = country;
//       state.city = city;
//       state.timezone = timezone;
//       state.language = language;
//       state.roles = roles || [];
//       state.primaryRole = primaryRole || 'Voter';
//       state.isAdmin = roles?.includes('Admin') || false;
//       state.isModerator = roles?.includes('Moderator') || false;
//       state.isSubscribed = isSubscribed || false;
//       state.subscriptionType = subscriptionType;
//       state.electionCreationLimit = electionCreationLimit || 2;
//       state.isContentCreator = isContentCreator || false;
//       state.isOrganization = isOrganization || false;
//       state.isVerified = isVerified || false;
//       state.isBanned = isBanned || false;
//       state.biometricEnabled = biometricEnabled || false;
//       state.biometricType = biometricType;
//       state.accessToken = accessToken;
//       state.refreshToken = refreshToken;

//       console.log('✅ Redux: Auth restored from storage', { userId });
//     },

//     // ✅ RESET AUTH STATE
//     resetAuthState: (state) => {
//       state.isAuthenticated = false;
//       state.authenticationStatus = 'idle';
//       state.sessionId = null;
//       state.currentAuthStep = 1;
//       state.completedAuthSteps = {
//         userCheck: false,
//         emailOTP: false,
//         smsOTP: false,
//         userDetails: false,
//         biometric: false,
//         securityQuestions: false,
//         sessionComplete: false,
//       };
//       state.userId = null;
//       state.email = null;
//       state.phone = null;
//       state.username = null;
//       state.firstName = null;
//       state.lastName = null;
//       state.accessToken = null;
//       state.refreshToken = null;
//       state.loading = false;
//       state.error = null;
//       state.successMessage = null;
//       state.currentSubscription = null;
//       state.subscriptionStatus = null;

//       console.log('🔄 Redux: Auth state reset');
//     },
//   },
// });

// export const {
//   setSessionId,
//   setUserCheckData,
//   setEmailOTPVerified,
//   setSMSOTPVerified,
//   setUserDetails,
//   setBiometricData,
//   setSecurityQuestionsAnswered,
//   setAuthenticationComplete,
//   setSessionFlags,
//   skipOTPVerification,
//   setUserLocationData,
//   updateCountry,
//   updateCity,
//   updateTimezone,
//   setCurrentSubscription,
//   updateSubscriptionStatus,
//   setIsSubscribed,
//   setSubscriptionType,
//   setElectionCreationLimit,
//   setIsContentCreator,
//   setIsOrganization,
//   setLoading,
//   setError,
//   setSuccess,
//   clearSuccess,
//   clearError,
//   refreshAccessToken,
//   logout,
//   restoreAuthFromStorage,
//   resetAuthState,
// } = authSlice.actions;

// export default authSlice.reducer;

































// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   // Session Information
//   sessionId: null,
//   isAuthenticated: false,
//   authenticationStatus: 'idle', // idle, pending, completed, failed

//   // User Information
//   userId: null,
//   email: null,
//   phone: null,
//   username: null,
//   firstName: null,
//   lastName: null,
//   profilePicture: null,

//   // User Details (First-time only)
//   age: null,
//   gender: null,
//   country: null,
//   city: null,
//   timezone: null,
//   language: 'en_us',

//   // Roles and Permissions
//   roles: [],
//   primaryRole: 'Voter',
//   isAdmin: false,
//   isModerator: false,

//   // Subscription Info
//   isSubscribed: false,
//   subscriptionType: null,
//   electionCreationLimit: 2,
//   isContentCreator: false,
//   isOrganization: false,

//   // Verification and Security
//   isVerified: false,
//   isBanned: false,
//   emailVerified: false,
//   phoneVerified: false,
//   biometricEnabled: false,
//   biometricType: null,

//   // Device and Location
//   deviceId: null,
//   deviceType: null,
//   osName: null,
//   browserName: null,
//   ipAddress: null,
//   registrationDate: null,

//   // Authentication Flow
//   isFirstTimeUser: false,
//   currentAuthStep: 1,
//   completedAuthSteps: {
//     userCheck: false,
//     emailOTP: false,
//     smsOTP: false,
//     userDetails: false,
//     biometric: false,
//     securityQuestions: false,
//     sessionComplete: false,
//   },

//   // Tokens (stored in Redux, also in HTTP-only cookies)
//   accessToken: null,
//   refreshToken: null,
//   tokenExpiresAt: null,

//   // UI State
//   loading: false,
//   error: null,
//   successMessage: null,
// };

// export const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     // ✅ SET SESSION ID - MUST PERSIST
//     setSessionId: (state, action) => {
//       state.sessionId = action.payload;
//       console.log('🔄 Redux: Session ID set:', action.payload);
//     },

//     // ✅ USER CHECK - SETS SESSION ID AND USER INFO
//     setUserCheckData: (state, action) => {
//       const {
//         userId,
//         email,
//         phone,
//         username,
//         firstName,
//         lastName,
//         isFirstTime,
//         sessionId,
//       } = action.payload;

//       state.userId = userId;
//       state.email = email;
//       state.phone = phone;
//       state.username = username;
//       state.firstName = firstName;
//       state.lastName = lastName;
//       state.isFirstTimeUser = isFirstTime;
//       state.sessionId = sessionId;
//       state.completedAuthSteps.userCheck = true;
//       state.currentAuthStep = 2;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: User check data set', {
//         userId,
//         sessionId,
//         isFirstTime,
//       });
//     },

//     // ✅ EMAIL OTP VERIFIED - KEEP SESSION ID
//     setEmailOTPVerified: (state) => {
//       state.emailVerified = true;
//       state.completedAuthSteps.emailOTP = true;
//       state.currentAuthStep = 3;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: Email OTP verified, session:', state.sessionId);
//     },

//     // ✅ SMS OTP VERIFIED - KEEP SESSION ID
//     setSMSOTPVerified: (state) => {
//       state.phoneVerified = true;
//       state.completedAuthSteps.smsOTP = true;

//       if (state.isFirstTimeUser) {
//         state.currentAuthStep = 4;
//         console.log('🔄 Redux: SMS OTP verified (first-time), step 4, session:', state.sessionId);
//       } else {
//         state.currentAuthStep = 7;
//         console.log('🔄 Redux: SMS OTP verified (returning), completing, session:', state.sessionId);
//       }

//       state.loading = false;
//       state.error = null;
//     },

//     // ✅ USER DETAILS - KEEP SESSION ID
//     setUserDetails: (state, action) => {
//       const {
//         firstName,
//         lastName,
//         age,
//         gender,
//         country,
//         city,
//         timezone,
//         language,
//       } = action.payload;

//       state.firstName = firstName;
//       state.lastName = lastName;
//       state.age = age;
//       state.gender = gender;
//       state.country = country;
//       state.city = city;
//       state.timezone = timezone;
//       state.language = language;
//       state.completedAuthSteps.userDetails = true;
//       state.currentAuthStep = 5;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: User details saved, step 5, session:', state.sessionId);
//     },

//     // ✅ BIOMETRIC DATA - KEEP SESSION ID
//     setBiometricData: (state, action) => {
//       const { biometricType, deviceInfo } = action.payload;

//       state.biometricEnabled = true;
//       state.biometricType = biometricType;
//       state.deviceType = deviceInfo.deviceType;
//       state.osName = deviceInfo.os;
//       state.browserName = deviceInfo.browser;
//       state.completedAuthSteps.biometric = true;
//       state.currentAuthStep = 6;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: Biometric collected, step 6, session:', state.sessionId);
//     },

//     // ✅ SECURITY QUESTIONS - KEEP SESSION ID
//     setSecurityQuestionsAnswered: (state) => {
//       state.completedAuthSteps.securityQuestions = true;
//       state.currentAuthStep = 7;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: Security questions answered, step 7, session:', state.sessionId);
//     },

//     // ✅ UPDATE SESSION FLAGS AFTER EACH STEP
//     setSessionFlags: (state, action) => {
//       const {
//         user_details_collected,
//         biometric_collected,
//         security_questions_answered,
//         step_number,
//       } = action.payload;

//       if (user_details_collected !== undefined) {
//         state.completedAuthSteps.userDetails = user_details_collected;
//       }
//       if (biometric_collected !== undefined) {
//         state.completedAuthSteps.biometric = biometric_collected;
//       }
//       if (security_questions_answered !== undefined) {
//         state.completedAuthSteps.securityQuestions = security_questions_answered;
//       }
//       if (step_number !== undefined) {
//         state.currentAuthStep = step_number;
//       }

//       console.log('🔄 Redux: Session flags updated', {
//         user_details_collected,
//         biometric_collected,
//         security_questions_answered,
//         step_number,
//       });
//     },

//     // ✅ AUTHENTICATION COMPLETE - SET ALL DATA AND TOKENS
//     setAuthenticationComplete: (state, action) => {
//       const {
//         userId,
//         email,
//         phone,
//         username,
//         firstName,
//         lastName,
//         age,
//         gender,
//         country,
//         city,
//         timezone,
//         language,
//         roles,
//         primaryRole,
//         isSubscribed,
//         subscriptionType,
//         electionCreationLimit,
//         isContentCreator,
//         isOrganization,
//         isVerified,
//         isBanned,
//         deviceId,
//         deviceType,
//         osName,
//         browserName,
//         ipAddress,
//         registrationDate,
//         biometricEnabled,
//         biometricType,
//         accessToken,
//         refreshToken,
//       } = action.payload;

//       state.isAuthenticated = true;
//       state.authenticationStatus = 'completed';
//       state.userId = userId;
//       state.email = email;
//       state.phone = phone;
//       state.username = username;
//       state.firstName = firstName;
//       state.lastName = lastName;
//       state.age = age;
//       state.gender = gender;
//       state.country = country;
//       state.city = city;
//       state.timezone = timezone;
//       state.language = language;
//       state.roles = roles || [];
//       state.primaryRole = primaryRole || 'Voter';
//       state.isAdmin = roles?.includes('Admin') || false;
//       state.isModerator = roles?.includes('Moderator') || false;
//       state.isSubscribed = isSubscribed || false;
//       state.subscriptionType = subscriptionType;
//       state.electionCreationLimit = electionCreationLimit || 2;
//       state.isContentCreator = isContentCreator || false;
//       state.isOrganization = isOrganization || false;
//       state.isVerified = isVerified || false;
//       state.isBanned = isBanned || false;
//       state.deviceId = deviceId;
//       state.deviceType = deviceType;
//       state.osName = osName;
//       state.browserName = browserName;
//       state.ipAddress = ipAddress;
//       state.registrationDate = registrationDate;
//       state.biometricEnabled = biometricEnabled || false;
//       state.biometricType = biometricType;

//       // ✅ STORE TOKENS IN REDUX (in-memory)
//       state.accessToken = accessToken;
//       state.refreshToken = refreshToken;
//       state.tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

//       // ✅ ALSO STORE IN LOCALSTORAGE AS BACKUP
//       localStorage.setItem('accessToken', accessToken);
//       localStorage.setItem('refreshToken', refreshToken);
//       localStorage.setItem('userId', userId);
//       localStorage.setItem('sessionId', state.sessionId);

//       state.completedAuthSteps.sessionComplete = true;
//       state.loading = false;
//       state.error = null;
//       state.successMessage = 'Authentication successful';

//       console.log('✅ Redux: Authentication complete, tokens stored', {
//         sessionId: state.sessionId,
//         userId,
//       });
//     },

//     // ✅ SKIP OTP VERIFICATION
//     skipOTPVerification: (state) => {
//       state.emailVerified = true;
//       state.phoneVerified = true;
//       state.completedAuthSteps.emailOTP = true;
//       state.completedAuthSteps.smsOTP = true;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: OTP skipped, session:', state.sessionId);
//     },

//     // ✅ LOADING STATE
//     setLoading: (state, action) => {
//       state.loading = action.payload;
//     },

//     // ✅ ERROR STATE
//     setError: (state, action) => {
//       state.error = action.payload;
//       state.successMessage = null;
//       state.loading = false;

//       console.error('❌ Redux Error:', action.payload);
//     },

//     // ✅ SUCCESS STATE
//     setSuccess: (state, action) => {
//       state.successMessage = action.payload;
//       state.error = null;

//       console.log('✅ Redux Success:', action.payload);
//     },

//     // ✅ CLEAR SUCCESS
//     clearSuccess: (state) => {
//       state.successMessage = null;
//     },

//     // ✅ CLEAR ERROR
//     clearError: (state) => {
//       state.error = null;
//     },

//     // ✅ REFRESH ACCESS TOKEN
//     refreshAccessToken: (state, action) => {
//       state.accessToken = action.payload.accessToken;
//       state.tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

//       localStorage.setItem('accessToken', action.payload.accessToken);

//       console.log('🔄 Redux: Access token refreshed');
//     },

//     // ✅ LOGOUT - CLEAR EVERYTHING
//     /*eslint-disable*/
//     logout: (state) => {
//       localStorage.removeItem('accessToken');
//       localStorage.removeItem('refreshToken');
//       localStorage.removeItem('userId');
//       localStorage.removeItem('sessionId');

//       console.log('🚀 Redux: User logged out, all data cleared');

//       return initialState;
//     },

//     // ✅ RESTORE AUTH FROM STORAGE (for page refresh)
//     restoreAuthFromStorage: (state, action) => {
//       const {
//         userId,
//         email,
//         phone,
//         username,
//         firstName,
//         lastName,
//         age,
//         gender,
//         country,
//         city,
//         timezone,
//         language,
//         roles,
//         primaryRole,
//         isSubscribed,
//         subscriptionType,
//         electionCreationLimit,
//         isContentCreator,
//         isOrganization,
//         isVerified,
//         isBanned,
//         biometricEnabled,
//         biometricType,
//         accessToken,
//         refreshToken,
//       } = action.payload;

//       state.isAuthenticated = true;
//       state.authenticationStatus = 'completed';
//       state.userId = userId;
//       state.email = email;
//       state.phone = phone;
//       state.username = username;
//       state.firstName = firstName;
//       state.lastName = lastName;
//       state.age = age;
//       state.gender = gender;
//       state.country = country;
//       state.city = city;
//       state.timezone = timezone;
//       state.language = language;
//       state.roles = roles || [];
//       state.primaryRole = primaryRole || 'Voter';
//       state.isAdmin = roles?.includes('Admin') || false;
//       state.isModerator = roles?.includes('Moderator') || false;
//       state.isSubscribed = isSubscribed || false;
//       state.subscriptionType = subscriptionType;
//       state.electionCreationLimit = electionCreationLimit || 2;
//       state.isContentCreator = isContentCreator || false;
//       state.isOrganization = isOrganization || false;
//       state.isVerified = isVerified || false;
//       state.isBanned = isBanned || false;
//       state.biometricEnabled = biometricEnabled || false;
//       state.biometricType = biometricType;
//       state.accessToken = accessToken;
//       state.refreshToken = refreshToken;

//       console.log('✅ Redux: Auth restored from storage', { userId });
//     },

//     // ✅ RESET AUTH STATE
//     resetAuthState: (state) => {
//       state.isAuthenticated = false;
//       state.authenticationStatus = 'idle';
//       state.sessionId = null;
//       state.currentAuthStep = 1;
//       state.completedAuthSteps = {
//         userCheck: false,
//         emailOTP: false,
//         smsOTP: false,
//         userDetails: false,
//         biometric: false,
//         securityQuestions: false,
//         sessionComplete: false,
//       };
//       state.userId = null;
//       state.email = null;
//       state.phone = null;
//       state.username = null;
//       state.firstName = null;
//       state.lastName = null;
//       state.accessToken = null;
//       state.refreshToken = null;
//       state.loading = false;
//       state.error = null;
//       state.successMessage = null;

//       console.log('🔄 Redux: Auth state reset');
//     },
//   },
// });

// export const {
//   setSessionId,
//   setUserCheckData,
//   setEmailOTPVerified,
//   setSMSOTPVerified,
//   setUserDetails,
//   setBiometricData,
//   setSecurityQuestionsAnswered,
//   setAuthenticationComplete,
//   setSessionFlags,
//   skipOTPVerification,
//   setLoading,
//   setError,
//   setSuccess,
//   clearSuccess,
//   clearError,
//   refreshAccessToken,
//   logout,
//   restoreAuthFromStorage,
//   resetAuthState,
// } = authSlice.actions;

// export default authSlice.reducer;
















// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   // Session Information
//   sessionId: null,
//   isAuthenticated: false,
//   authenticationStatus: 'idle', // idle, pending, completed, failed

//   // User Information
//   userId: null,
//   email: null,
//   phone: null,
//   username: null,
//   firstName: null,
//   lastName: null,
//   profilePicture: null,

//   // User Details (First-time only)
//   age: null,
//   gender: null,
//   country: null,
//   city: null,
//   timezone: null,
//   language: 'en_us',

//   // Roles and Permissions
//   roles: [],
//   primaryRole: 'Voter',
//   isAdmin: false,
//   isModerator: false,

//   // Subscription Info
//   isSubscribed: false,
//   subscriptionType: null,
//   electionCreationLimit: 2,
//   isContentCreator: false,
//   isOrganization: false,

//   // Verification and Security
//   isVerified: false,
//   isBanned: false,
//   emailVerified: false,
//   phoneVerified: false,
//   biometricEnabled: false,
//   biometricType: null,

//   // Device and Location
//   deviceId: null,
//   deviceType: null,
//   osName: null,
//   browserName: null,
//   ipAddress: null,
//   registrationDate: null,

//   // Authentication Flow
//   isFirstTimeUser: false,
//   currentAuthStep: 1,
//   completedAuthSteps: {
//     userCheck: false,
//     emailOTP: false,
//     smsOTP: false,
//     userDetails: false,
//     biometric: false,
//     securityQuestions: false,
//     sessionComplete: false,
//   },

//   // Tokens (stored in Redux, also in HTTP-only cookies)
//   accessToken: null,
//   refreshToken: null,
//   tokenExpiresAt: null,

//   // UI State
//   loading: false,
//   error: null,
//   successMessage: null,
// };

// export const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     // ✅ SET SESSION ID - MUST PERSIST
//     setSessionId: (state, action) => {
//       state.sessionId = action.payload;
//       console.log('🔄 Redux: Session ID set:', action.payload);
//     },

//     // ✅ USER CHECK - SETS SESSION ID AND USER INFO
//     setUserCheckData: (state, action) => {
//       const {
//         userId,
//         email,
//         phone,
//         username,
//         firstName,
//         lastName,
//         isFirstTime,
//         sessionId,
//       } = action.payload;

//       state.userId = userId;
//       state.email = email;
//       state.phone = phone;
//       state.username = username;
//       state.firstName = firstName;
//       state.lastName = lastName;
//       state.isFirstTimeUser = isFirstTime;
//       state.sessionId = sessionId; // ✅ PERSIST SESSION ID
//       state.completedAuthSteps.userCheck = true;
//       state.currentAuthStep = 2;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: User check data set', {
//         userId,
//         sessionId,
//         isFirstTime,
//       });
//     },

//     // ✅ EMAIL OTP VERIFIED - KEEP SESSION ID
//     setEmailOTPVerified: (state) => {
//       state.emailVerified = true;
//       state.completedAuthSteps.emailOTP = true;
//       state.currentAuthStep = 3;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: Email OTP verified, session:', state.sessionId);
//     },

//     // ✅ SMS OTP VERIFIED - KEEP SESSION ID
//     setSMSOTPVerified: (state) => {
//       state.phoneVerified = true;
//       state.completedAuthSteps.smsOTP = true;

//       if (state.isFirstTimeUser) {
//         state.currentAuthStep = 4;
//         console.log('🔄 Redux: SMS OTP verified (first-time), step 4, session:', state.sessionId);
//       } else {
//         state.currentAuthStep = 7;
//         console.log('🔄 Redux: SMS OTP verified (returning), completing, session:', state.sessionId);
//       }

//       state.loading = false;
//       state.error = null;
//     },

//     // ✅ USER DETAILS - KEEP SESSION ID
//     setUserDetails: (state, action) => {
//       const {
//         firstName,
//         lastName,
//         age,
//         gender,
//         country,
//         city,
//         timezone,
//         language,
//       } = action.payload;

//       state.firstName = firstName;
//       state.lastName = lastName;
//       state.age = age;
//       state.gender = gender;
//       state.country = country;
//       state.city = city;
//       state.timezone = timezone;
//       state.language = language;
//       state.completedAuthSteps.userDetails = true;
//       state.currentAuthStep = 5;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: User details saved, step 5, session:', state.sessionId);
//     },

//     // ✅ BIOMETRIC DATA - KEEP SESSION ID
//     setBiometricData: (state, action) => {
//       const { biometricType, deviceInfo } = action.payload;

//       state.biometricEnabled = true;
//       state.biometricType = biometricType;
//       state.deviceType = deviceInfo.deviceType;
//       state.osName = deviceInfo.os;
//       state.browserName = deviceInfo.browser;
//       state.completedAuthSteps.biometric = true;
//       state.currentAuthStep = 6;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: Biometric collected, step 6, session:', state.sessionId);
//     },

//     // ✅ SECURITY QUESTIONS - KEEP SESSION ID
//     setSecurityQuestionsAnswered: (state) => {
//       state.completedAuthSteps.securityQuestions = true;
//       state.currentAuthStep = 7;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: Security questions answered, step 7, session:', state.sessionId);
//     },

//     // ✅ AUTHENTICATION COMPLETE - SET ALL DATA AND TOKENS
//     setAuthenticationComplete: (state, action) => {
//       const {
//         userId,
//         email,
//         phone,
//         username,
//         firstName,
//         lastName,
//         age,
//         gender,
//         country,
//         city,
//         timezone,
//         language,
//         roles,
//         primaryRole,
//         isSubscribed,
//         subscriptionType,
//         electionCreationLimit,
//         isContentCreator,
//         isOrganization,
//         isVerified,
//         isBanned,
//         deviceId,
//         deviceType,
//         osName,
//         browserName,
//         ipAddress,
//         registrationDate,
//         biometricEnabled,
//         biometricType,
//         accessToken,
//         refreshToken,
//       } = action.payload;

//       state.isAuthenticated = true;
//       state.authenticationStatus = 'completed';
//       state.userId = userId;
//       state.email = email;
//       state.phone = phone;
//       state.username = username;
//       state.firstName = firstName;
//       state.lastName = lastName;
//       state.age = age;
//       state.gender = gender;
//       state.country = country;
//       state.city = city;
//       state.timezone = timezone;
//       state.language = language;
//       state.roles = roles || [];
//       state.primaryRole = primaryRole || 'Voter';
//       state.isAdmin = roles?.includes('Admin') || false;
//       state.isModerator = roles?.includes('Moderator') || false;
//       state.isSubscribed = isSubscribed || false;
//       state.subscriptionType = subscriptionType;
//       state.electionCreationLimit = electionCreationLimit || 2;
//       state.isContentCreator = isContentCreator || false;
//       state.isOrganization = isOrganization || false;
//       state.isVerified = isVerified || false;
//       state.isBanned = isBanned || false;
//       state.deviceId = deviceId;
//       state.deviceType = deviceType;
//       state.osName = osName;
//       state.browserName = browserName;
//       state.ipAddress = ipAddress;
//       state.registrationDate = registrationDate;
//       state.biometricEnabled = biometricEnabled || false;
//       state.biometricType = biometricType;

//       // ✅ STORE TOKENS IN REDUX (in-memory)
//       state.accessToken = accessToken;
//       state.refreshToken = refreshToken;
//       state.tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

//       // ✅ ALSO STORE IN LOCALSTORAGE AS BACKUP
//       // (in case user refreshes page, we can still make requests)
//       localStorage.setItem('accessToken', accessToken);
//       localStorage.setItem('refreshToken', refreshToken);
//       localStorage.setItem('userId', userId);
//       localStorage.setItem('sessionId', state.sessionId);

//       state.completedAuthSteps.sessionComplete = true;
//       state.loading = false;
//       state.error = null;
//       state.successMessage = 'Authentication successful';

//       console.log('✅ Redux: Authentication complete, tokens stored', {
//         sessionId: state.sessionId,
//         userId,
//       });
//     },

//     // ✅ SKIP OTP VERIFICATION
//     skipOTPVerification: (state) => {
//       state.emailVerified = true;
//       state.phoneVerified = true;
//       state.completedAuthSteps.emailOTP = true;
//       state.completedAuthSteps.smsOTP = true;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: OTP skipped, session:', state.sessionId);
//     },

//     // ✅ LOADING STATE
//     setLoading: (state, action) => {
//       state.loading = action.payload;
//     },

//     // ✅ ERROR STATE
//     setError: (state, action) => {
//       state.error = action.payload;
//       state.successMessage = null;
//       state.loading = false;

//       console.error('❌ Redux Error:', action.payload);
//     },

//     // ✅ SUCCESS STATE
//     setSuccess: (state, action) => {
//       state.successMessage = action.payload;
//       state.error = null;

//       console.log('✅ Redux Success:', action.payload);
//     },

//     // ✅ CLEAR SUCCESS
//     clearSuccess: (state) => {
//       state.successMessage = null;
//     },

//     // ✅ CLEAR ERROR
//     clearError: (state) => {
//       state.error = null;
//     },

//     // ✅ REFRESH ACCESS TOKEN
//     refreshAccessToken: (state, action) => {
//       state.accessToken = action.payload.accessToken;
//       state.tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

//       // Also update localStorage
//       localStorage.setItem('accessToken', action.payload.accessToken);

//       console.log('🔄 Redux: Access token refreshed');
//     },

//     // ✅ LOGOUT - CLEAR EVERYTHING
//     /*eslint-disable*/
//     logout: (state) => {
//       // Clear localStorage
//       localStorage.removeItem('accessToken');
//       localStorage.removeItem('refreshToken');
//       localStorage.removeItem('userId');
//       localStorage.removeItem('sessionId');

//       console.log('🚀 Redux: User logged out, all data cleared');

//       return initialState;
//     },

//     // ✅ RESTORE AUTH FROM STORAGE (for page refresh)
//     restoreAuthFromStorage: (state, action) => {
//       const {
//         userId,
//         email,
//         phone,
//         username,
//         firstName,
//         lastName,
//         age,
//         gender,
//         country,
//         city,
//         timezone,
//         language,
//         roles,
//         primaryRole,
//         isSubscribed,
//         subscriptionType,
//         electionCreationLimit,
//         isContentCreator,
//         isOrganization,
//         isVerified,
//         isBanned,
//         biometricEnabled,
//         biometricType,
//         accessToken,
//         refreshToken,
//       } = action.payload;

//       state.isAuthenticated = true;
//       state.authenticationStatus = 'completed';
//       state.userId = userId;
//       state.email = email;
//       state.phone = phone;
//       state.username = username;
//       state.firstName = firstName;
//       state.lastName = lastName;
//       state.age = age;
//       state.gender = gender;
//       state.country = country;
//       state.city = city;
//       state.timezone = timezone;
//       state.language = language;
//       state.roles = roles || [];
//       state.primaryRole = primaryRole || 'Voter';
//       state.isAdmin = roles?.includes('Admin') || false;
//       state.isModerator = roles?.includes('Moderator') || false;
//       state.isSubscribed = isSubscribed || false;
//       state.subscriptionType = subscriptionType;
//       state.electionCreationLimit = electionCreationLimit || 2;
//       state.isContentCreator = isContentCreator || false;
//       state.isOrganization = isOrganization || false;
//       state.isVerified = isVerified || false;
//       state.isBanned = isBanned || false;
//       state.biometricEnabled = biometricEnabled || false;
//       state.biometricType = biometricType;
//       state.accessToken = accessToken;
//       state.refreshToken = refreshToken;

//       console.log('✅ Redux: Auth restored from storage', { userId });
//     },

//     // ✅ RESET AUTH STATE
//     resetAuthState: (state) => {
//       state.isAuthenticated = false;
//       state.authenticationStatus = 'idle';
//       state.sessionId = null;
//       state.currentAuthStep = 1;
//       state.completedAuthSteps = {
//         userCheck: false,
//         emailOTP: false,
//         smsOTP: false,
//         userDetails: false,
//         biometric: false,
//         securityQuestions: false,
//         sessionComplete: false,
//       };
//       state.userId = null;
//       state.email = null;
//       state.phone = null;
//       state.username = null;
//       state.firstName = null;
//       state.lastName = null;
//       state.accessToken = null;
//       state.refreshToken = null;
//       state.loading = false;
//       state.error = null;
//       state.successMessage = null;

//       console.log('🔄 Redux: Auth state reset');
//     },
//   },

//   setSessionFlags: (state, action) => {
//   const {
//     user_details_collected,
//     biometric_collected,
//     security_questions_answered,
//     step_number,
//   } = action.payload;

//   if (user_details_collected !== undefined) {
//     state.completedAuthSteps.userDetails = user_details_collected;
//   }
//   if (biometric_collected !== undefined) {
//     state.completedAuthSteps.biometric = biometric_collected;
//   }
//   if (security_questions_answered !== undefined) {
//     state.completedAuthSteps.securityQuestions = security_questions_answered;
//   }
//   if (step_number !== undefined) {
//     state.currentAuthStep = step_number;
//   }

//   console.log('🔄 Redux: Session flags updated', {
//     user_details_collected,
//     biometric_collected,
//     security_questions_answered,
//     step_number,
//   });
// },
// });

// export const {
//   setSessionId,
//   setUserCheckData,
//   setEmailOTPVerified,
//   setSMSOTPVerified,
  
//   setUserDetails,
//   setBiometricData,
//   setSecurityQuestionsAnswered,
//   setAuthenticationComplete,
//   skipOTPVerification,
//   setLoading,
//   setError,
//   setSuccess,
//   clearSuccess,
//   setSessionFlags,
//   clearError,
//   refreshAccessToken,
//   logout,
//   restoreAuthFromStorage,
//   resetAuthState,
// } = authSlice.actions;

// export default authSlice.reducer;






// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   // Session Information
//   sessionId: null,
//   isAuthenticated: false,
//   authenticationStatus: 'idle', // idle, pending, completed, failed

//   // User Information
//   userId: null,
//   email: null,
//   phone: null,
//   username: null,
//   firstName: null,
//   lastName: null,
//   profilePicture: null,

//   // User Details (First-time only)
//   age: null,
//   gender: null,
//   country: null,
//   city: null,
//   timezone: null,
//   language: 'en_us',

//   // Roles and Permissions
//   roles: [],
//   primaryRole: 'Voter',
//   isAdmin: false,
//   isModerator: false,

//   // Subscription Info
//   isSubscribed: false,
//   subscriptionType: null,
//   electionCreationLimit: 2,
//   isContentCreator: false,
//   isOrganization: false,

//   // Verification and Security
//   isVerified: false,
//   isBanned: false,
//   emailVerified: false,
//   phoneVerified: false,
//   biometricEnabled: false,
//   biometricType: null,

//   // Device and Location
//   deviceId: null,
//   deviceType: null,
//   osName: null,
//   browserName: null,
//   ipAddress: null,
//   registrationDate: null,

//   // Authentication Flow
//   isFirstTimeUser: false,
//   currentAuthStep: 1,
//   completedAuthSteps: {
//     userCheck: false,
//     emailOTP: false,
//     smsOTP: false,
//     userDetails: false,
//     biometric: false,
//     securityQuestions: false,
//     sessionComplete: false,
//   },

//   // Tokens (stored in Redux, also in HTTP-only cookies)
//   accessToken: null,
//   refreshToken: null,
//   tokenExpiresAt: null,

//   // UI State
//   loading: false,
//   error: null,
//   successMessage: null,
// };

// export const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     // ✅ SET SESSION ID - MUST PERSIST
//     setSessionId: (state, action) => {
//       state.sessionId = action.payload;
//       console.log('🔄 Redux: Session ID set:', action.payload);
//     },

//     // ✅ USER CHECK - SETS SESSION ID AND USER INFO
//     setUserCheckData: (state, action) => {
//       const {
//         userId,
//         email,
//         phone,
//         username,
//         firstName,
//         lastName,
//         isFirstTime,
//         sessionId,
//       } = action.payload;

//       state.userId = userId;
//       state.email = email;
//       state.phone = phone;
//       state.username = username;
//       state.firstName = firstName;
//       state.lastName = lastName;
//       state.isFirstTimeUser = isFirstTime;
//       state.sessionId = sessionId; // ✅ PERSIST SESSION ID
//       state.completedAuthSteps.userCheck = true;
//       state.currentAuthStep = 2;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: User check data set', {
//         userId,
//         sessionId,
//         isFirstTime,
//       });
//     },

//     // ✅ EMAIL OTP VERIFIED - KEEP SESSION ID
//     setEmailOTPVerified: (state) => {
//       state.emailVerified = true;
//       state.completedAuthSteps.emailOTP = true;
//       state.currentAuthStep = 3;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: Email OTP verified, session:', state.sessionId);
//     },

//     // ✅ SMS OTP VERIFIED - KEEP SESSION ID
//     setSMSOTPVerified: (state) => {
//       state.phoneVerified = true;
//       state.completedAuthSteps.smsOTP = true;

//       if (state.isFirstTimeUser) {
//         state.currentAuthStep = 4;
//         console.log('🔄 Redux: SMS OTP verified (first-time), step 4, session:', state.sessionId);
//       } else {
//         state.currentAuthStep = 7;
//         console.log('🔄 Redux: SMS OTP verified (returning), completing, session:', state.sessionId);
//       }

//       state.loading = false;
//       state.error = null;
//     },

//     // ✅ USER DETAILS - KEEP SESSION ID
//     setUserDetails: (state, action) => {
//       const {
//         firstName,
//         lastName,
//         age,
//         gender,
//         country,
//         city,
//         timezone,
//         language,
//       } = action.payload;

//       state.firstName = firstName;
//       state.lastName = lastName;
//       state.age = age;
//       state.gender = gender;
//       state.country = country;
//       state.city = city;
//       state.timezone = timezone;
//       state.language = language;
//       state.completedAuthSteps.userDetails = true;
//       state.currentAuthStep = 5;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: User details saved, step 5, session:', state.sessionId);
//     },

//     // ✅ BIOMETRIC DATA - KEEP SESSION ID
//     setBiometricData: (state, action) => {
//       const { biometricType, deviceInfo } = action.payload;

//       state.biometricEnabled = true;
//       state.biometricType = biometricType;
//       state.deviceType = deviceInfo.deviceType;
//       state.osName = deviceInfo.os;
//       state.browserName = deviceInfo.browser;
//       state.completedAuthSteps.biometric = true;
//       state.currentAuthStep = 6;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: Biometric collected, step 6, session:', state.sessionId);
//     },

//     // ✅ SECURITY QUESTIONS - KEEP SESSION ID
//     setSecurityQuestionsAnswered: (state) => {
//       state.completedAuthSteps.securityQuestions = true;
//       state.currentAuthStep = 7;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: Security questions answered, step 7, session:', state.sessionId);
//     },

//     // ✅ AUTHENTICATION COMPLETE - SET ALL DATA AND TOKENS
//     setAuthenticationComplete: (state, action) => {
//       const {
//         userId,
//         email,
//         phone,
//         username,
//         firstName,
//         lastName,
//         age,
//         gender,
//         country,
//         city,
//         timezone,
//         language,
//         roles,
//         primaryRole,
//         isSubscribed,
//         subscriptionType,
//         electionCreationLimit,
//         isContentCreator,
//         isOrganization,
//         isVerified,
//         isBanned,
//         deviceId,
//         deviceType,
//         osName,
//         browserName,
//         ipAddress,
//         registrationDate,
//         biometricEnabled,
//         biometricType,
//         accessToken,
//         refreshToken,
//       } = action.payload;

//       state.isAuthenticated = true;
//       state.authenticationStatus = 'completed';
//       state.userId = userId;
//       state.email = email;
//       state.phone = phone;
//       state.username = username;
//       state.firstName = firstName;
//       state.lastName = lastName;
//       state.age = age;
//       state.gender = gender;
//       state.country = country;
//       state.city = city;
//       state.timezone = timezone;
//       state.language = language;
//       state.roles = roles || [];
//       state.primaryRole = primaryRole || 'Voter';
//       state.isAdmin = roles?.includes('Admin') || false;
//       state.isModerator = roles?.includes('Moderator') || false;
//       state.isSubscribed = isSubscribed || false;
//       state.subscriptionType = subscriptionType;
//       state.electionCreationLimit = electionCreationLimit || 2;
//       state.isContentCreator = isContentCreator || false;
//       state.isOrganization = isOrganization || false;
//       state.isVerified = isVerified || false;
//       state.isBanned = isBanned || false;
//       state.deviceId = deviceId;
//       state.deviceType = deviceType;
//       state.osName = osName;
//       state.browserName = browserName;
//       state.ipAddress = ipAddress;
//       state.registrationDate = registrationDate;
//       state.biometricEnabled = biometricEnabled || false;
//       state.biometricType = biometricType;

//       // ✅ STORE TOKENS IN REDUX (in-memory)
//       state.accessToken = accessToken;
//       state.refreshToken = refreshToken;
//       state.tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

//       // ✅ ALSO STORE IN LOCALSTORAGE AS BACKUP
//       // (in case user refreshes page, we can still make requests)
//       localStorage.setItem('accessToken', accessToken);
//       localStorage.setItem('refreshToken', refreshToken);
//       localStorage.setItem('userId', userId);
//       localStorage.setItem('sessionId', state.sessionId);

//       state.completedAuthSteps.sessionComplete = true;
//       state.loading = false;
//       state.error = null;
//       state.successMessage = 'Authentication successful';

//       console.log('✅ Redux: Authentication complete, tokens stored', {
//         sessionId: state.sessionId,
//         userId,
//       });
//     },

//     // ✅ SKIP OTP VERIFICATION
//     skipOTPVerification: (state) => {
//       state.emailVerified = true;
//       state.phoneVerified = true;
//       state.completedAuthSteps.emailOTP = true;
//       state.completedAuthSteps.smsOTP = true;
//       state.loading = false;
//       state.error = null;

//       console.log('🔄 Redux: OTP skipped, session:', state.sessionId);
//     },

//     // ✅ LOADING STATE
//     setLoading: (state, action) => {
//       state.loading = action.payload;
//     },

//     // ✅ ERROR STATE
//     setError: (state, action) => {
//       state.error = action.payload;
//       state.successMessage = null;
//       state.loading = false;

//       console.error('❌ Redux Error:', action.payload);
//     },

//     // ✅ SUCCESS STATE
//     setSuccess: (state, action) => {
//       state.successMessage = action.payload;
//       state.error = null;

//       console.log('✅ Redux Success:', action.payload);
//     },

//     // ✅ CLEAR SUCCESS
//     clearSuccess: (state) => {
//       state.successMessage = null;
//     },

//     // ✅ CLEAR ERROR
//     clearError: (state) => {
//       state.error = null;
//     },

//     // ✅ REFRESH ACCESS TOKEN
//     refreshAccessToken: (state, action) => {
//       state.accessToken = action.payload.accessToken;
//       state.tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

//       // Also update localStorage
//       localStorage.setItem('accessToken', action.payload.accessToken);

//       console.log('🔄 Redux: Access token refreshed');
//     },

//     // ✅ LOGOUT - CLEAR EVERYTHING
//     /*eslint-disable*/
//     logout: (state) => {
//       // Clear localStorage
//       localStorage.removeItem('accessToken');
//       localStorage.removeItem('refreshToken');
//       localStorage.removeItem('userId');
//       localStorage.removeItem('sessionId');

//       console.log('🚀 Redux: User logged out, all data cleared');

//       return initialState;
//     },

//     // ✅ RESTORE AUTH FROM STORAGE (for page refresh)
//     restoreAuthFromStorage: (state, action) => {
//       const {
//         userId,
//         email,
//         phone,
//         username,
//         firstName,
//         lastName,
//         age,
//         gender,
//         country,
//         city,
//         timezone,
//         language,
//         roles,
//         primaryRole,
//         isSubscribed,
//         subscriptionType,
//         electionCreationLimit,
//         isContentCreator,
//         isOrganization,
//         isVerified,
//         isBanned,
//         biometricEnabled,
//         biometricType,
//         accessToken,
//         refreshToken,
//       } = action.payload;

//       state.isAuthenticated = true;
//       state.authenticationStatus = 'completed';
//       state.userId = userId;
//       state.email = email;
//       state.phone = phone;
//       state.username = username;
//       state.firstName = firstName;
//       state.lastName = lastName;
//       state.age = age;
//       state.gender = gender;
//       state.country = country;
//       state.city = city;
//       state.timezone = timezone;
//       state.language = language;
//       state.roles = roles || [];
//       state.primaryRole = primaryRole || 'Voter';
//       state.isAdmin = roles?.includes('Admin') || false;
//       state.isModerator = roles?.includes('Moderator') || false;
//       state.isSubscribed = isSubscribed || false;
//       state.subscriptionType = subscriptionType;
//       state.electionCreationLimit = electionCreationLimit || 2;
//       state.isContentCreator = isContentCreator || false;
//       state.isOrganization = isOrganization || false;
//       state.isVerified = isVerified || false;
//       state.isBanned = isBanned || false;
//       state.biometricEnabled = biometricEnabled || false;
//       state.biometricType = biometricType;
//       state.accessToken = accessToken;
//       state.refreshToken = refreshToken;

//       console.log('✅ Redux: Auth restored from storage', { userId });
//     },

//     // ✅ RESET AUTH STATE
//     resetAuthState: (state) => {
//       state.isAuthenticated = false;
//       state.authenticationStatus = 'idle';
//       state.sessionId = null;
//       state.currentAuthStep = 1;
//       state.completedAuthSteps = {
//         userCheck: false,
//         emailOTP: false,
//         smsOTP: false,
//         userDetails: false,
//         biometric: false,
//         securityQuestions: false,
//         sessionComplete: false,
//       };
//       state.userId = null;
//       state.email = null;
//       state.phone = null;
//       state.username = null;
//       state.firstName = null;
//       state.lastName = null;
//       state.accessToken = null;
//       state.refreshToken = null;
//       state.loading = false;
//       state.error = null;
//       state.successMessage = null;

//       console.log('🔄 Redux: Auth state reset');
//     },
//   },
// });

// export const {
//   setSessionId,
//   setUserCheckData,
//   setEmailOTPVerified,
//   setSMSOTPVerified,
//   setUserDetails,
//   setBiometricData,
//   setSecurityQuestionsAnswered,
//   setAuthenticationComplete,
//   skipOTPVerification,
//   setLoading,
//   setError,
//   setSuccess,
//   clearSuccess,
//   clearError,
//   refreshAccessToken,
//   logout,
//   restoreAuthFromStorage,
//   resetAuthState,
// } = authSlice.actions;

// export default authSlice.reducer;
