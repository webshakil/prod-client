import { useDispatch as reduxUseDispatch, useSelector } from 'react-redux';

// ✅ CORRECT WAY - Re-export with custom names
export const useAppDispatch = () => reduxUseDispatch();
export const useAppSelector = useSelector;

// If you need the raw dispatch too (uncomment if needed)
export const useDispatch = reduxUseDispatch;

// ==================== AUTH HOOKS ====================
export const useAuth = () => {
  const auth = useSelector((state) => state.auth);
  
  // ✅ FIX: Get roles from userData if not in auth directly
  const roles = auth.roles || auth.userData?.roles || [];
  
  return {
    ...auth,
    roles, // ✅ Now roles will always be available from correct location
  };
};

export const useIsAuthenticated = () => {
  return useSelector((state) => state.auth.isAuthenticated);
};

export const useUserId = () => {
  return useSelector((state) => state.auth.userId);
};

export const useUserRoles = () => {
  // ✅ FIX: Get roles from correct location
  const auth = useSelector((state) => state.auth);
  return auth.roles || auth.userData?.roles || [];
};

export const useCurrentAuthStep = () => {
  return useSelector((state) => state.auth.currentAuthStep);
};

export const useAuthLoading = () => {
  return useSelector((state) => state.auth.loading);
};

export const useAuthError = () => {
  return useSelector((state) => state.auth.error);
};

export const useUserCountry = () => {
  return useSelector((state) => state.auth.country);
};

export const useUserCity = () => {
  return useSelector((state) => state.auth.city);
};

export const useUserTimezone = () => {
  return useSelector((state) => state.auth.timezone);
};

export const useUserLanguage = () => {
  return useSelector((state) => state.auth.language);
};

export const useIsSubscribed = () => {
  return useSelector((state) => state.auth.isSubscribed);
};

export const useSubscriptionType = () => {
  return useSelector((state) => state.auth.subscriptionType);
};

export const useUserEmail = () => {
  return useSelector((state) => state.auth.email);
};

export const useUserPhone = () => {
  return useSelector((state) => state.auth.phone);
};

// ==================== SUBSCRIPTION HOOKS ====================
export const useSubscription = () => {
  return useSelector((state) => state.subscription);
};

export const useSubscriptionPlans = () => {
  return useSelector((state) => state.subscription.plans);
};

export const useSelectedPlan = () => {
  return useSelector((state) => state.subscription.selectedPlan);
};

export const useUserSubscription = () => {
  return useSelector((state) => state.subscription.userSubscription);
};

export const useSubscriptionStatus = () => {
  return useSelector((state) => state.subscription.subscriptionStatus);
};

export const usePaymentStatus = () => {
  return useSelector((state) => state.subscription.paymentStatus);
};

export const usePaymentData = () => {
  return useSelector((state) => state.subscription.paymentData);
};

export const usePaymentError = () => {
  return useSelector((state) => state.subscription.paymentError);
};

export const useSelectedGateway = () => {
  return useSelector((state) => state.subscription.selectedGateway);
};

export const useGatewayRecommendation = () => {
  return useSelector((state) => state.subscription.gatewayRecommendation);
};

export const useCheckoutStep = () => {
  return useSelector((state) => state.subscription.checkoutStep);
};

export const useCheckoutData = () => {
  return useSelector((state) => state.subscription.checkoutData);
};

export const useProcessingFee = () => {
  return useSelector((state) => state.subscription.processingFee);
};

export const useParticipationFee = () => {
  return useSelector((state) => ({
    fee: state.subscription.participationFee,
    percentage: state.subscription.participationFeePercentage,
  }));
};

export const useSubscriptionLoading = () => {
  return useSelector((state) => state.subscription.loading);
};

export const useSubscriptionError = () => {
  return useSelector((state) => state.subscription.error);
};

export const useSubscriptionSuccess = () => {
  return useSelector((state) => state.subscription.successMessage);
};

// ==================== USER HOOKS ====================
export const useUser = () => {
  return useSelector((state) => state.user);
};

// ==================== UI HOOKS ====================
export const useUI = () => {
  return useSelector((state) => state.ui);
};

//last workable code
// import { useDispatch as reduxUseDispatch, useSelector } from 'react-redux';

// // ✅ CORRECT WAY - Re-export with custom names
// export const useAppDispatch = () => reduxUseDispatch();
// export const useAppSelector = useSelector;

// // If you need the raw dispatch too (uncomment if needed)
// export const useDispatch = reduxUseDispatch;

// // ==================== AUTH HOOKS ====================
// export const useAuth = () => {
//   return useSelector((state) => state.auth);
// };

// export const useIsAuthenticated = () => {
//   return useSelector((state) => state.auth.isAuthenticated);
// };

// export const useUserId = () => {
//   return useSelector((state) => state.auth.userId);
// };

// export const useUserRoles = () => {
//   return useSelector((state) => state.auth.roles);
// };

// export const useCurrentAuthStep = () => {
//   return useSelector((state) => state.auth.currentAuthStep);
// };

// export const useAuthLoading = () => {
//   return useSelector((state) => state.auth.loading);
// };

// export const useAuthError = () => {
//   return useSelector((state) => state.auth.error);
// };

// export const useUserCountry = () => {
//   return useSelector((state) => state.auth.country);
// };

// export const useUserCity = () => {
//   return useSelector((state) => state.auth.city);
// };

// export const useUserTimezone = () => {
//   return useSelector((state) => state.auth.timezone);
// };

// export const useUserLanguage = () => {
//   return useSelector((state) => state.auth.language);
// };

// export const useIsSubscribed = () => {
//   return useSelector((state) => state.auth.isSubscribed);
// };

// export const useSubscriptionType = () => {
//   return useSelector((state) => state.auth.subscriptionType);
// };

// export const useUserEmail = () => {
//   return useSelector((state) => state.auth.email);
// };

// export const useUserPhone = () => {
//   return useSelector((state) => state.auth.phone);
// };

// // ==================== SUBSCRIPTION HOOKS ====================
// export const useSubscription = () => {
//   return useSelector((state) => state.subscription);
// };

// export const useSubscriptionPlans = () => {
//   return useSelector((state) => state.subscription.plans);
// };

// export const useSelectedPlan = () => {
//   return useSelector((state) => state.subscription.selectedPlan);
// };

// export const useUserSubscription = () => {
//   return useSelector((state) => state.subscription.userSubscription);
// };

// export const useSubscriptionStatus = () => {
//   return useSelector((state) => state.subscription.subscriptionStatus);
// };

// export const usePaymentStatus = () => {
//   return useSelector((state) => state.subscription.paymentStatus);
// };

// export const usePaymentData = () => {
//   return useSelector((state) => state.subscription.paymentData);
// };

// export const usePaymentError = () => {
//   return useSelector((state) => state.subscription.paymentError);
// };

// export const useSelectedGateway = () => {
//   return useSelector((state) => state.subscription.selectedGateway);
// };

// export const useGatewayRecommendation = () => {
//   return useSelector((state) => state.subscription.gatewayRecommendation);
// };

// export const useCheckoutStep = () => {
//   return useSelector((state) => state.subscription.checkoutStep);
// };

// export const useCheckoutData = () => {
//   return useSelector((state) => state.subscription.checkoutData);
// };

// export const useProcessingFee = () => {
//   return useSelector((state) => state.subscription.processingFee);
// };

// export const useParticipationFee = () => {
//   return useSelector((state) => ({
//     fee: state.subscription.participationFee,
//     percentage: state.subscription.participationFeePercentage,
//   }));
// };

// export const useSubscriptionLoading = () => {
//   return useSelector((state) => state.subscription.loading);
// };

// export const useSubscriptionError = () => {
//   return useSelector((state) => state.subscription.error);
// };

// export const useSubscriptionSuccess = () => {
//   return useSelector((state) => state.subscription.successMessage);
// };

// // ==================== USER HOOKS ====================
// export const useUser = () => {
//   return useSelector((state) => state.user);
// };

// // ==================== UI HOOKS ====================
// export const useUI = () => {
//   return useSelector((state) => state.ui);
// };
// import { useDispatch, useSelector } from 'react-redux';

// export const useAppDispatch = () => useDispatch();
// export const useAppSelector = useSelector;

// // ==================== AUTH HOOKS ====================
// export const useAuth = () => {
//   return useSelector((state) => state.auth);
// };

// export const useIsAuthenticated = () => {
//   return useSelector((state) => state.auth.isAuthenticated);
// };

// export const useUserId = () => {
//   return useSelector((state) => state.auth.userId);
// };

// export const useUserRoles = () => {
//   return useSelector((state) => state.auth.roles);
// };

// export const useCurrentAuthStep = () => {
//   return useSelector((state) => state.auth.currentAuthStep);
// };

// export const useAuthLoading = () => {
//   return useSelector((state) => state.auth.loading);
// };

// export const useAuthError = () => {
//   return useSelector((state) => state.auth.error);
// };

// export const useUserCountry = () => {
//   return useSelector((state) => state.auth.country);
// };

// export const useUserCity = () => {
//   return useSelector((state) => state.auth.city);
// };

// export const useUserTimezone = () => {
//   return useSelector((state) => state.auth.timezone);
// };

// export const useUserLanguage = () => {
//   return useSelector((state) => state.auth.language);
// };

// export const useIsSubscribed = () => {
//   return useSelector((state) => state.auth.isSubscribed);
// };

// export const useSubscriptionType = () => {
//   return useSelector((state) => state.auth.subscriptionType);
// };

// export const useUserEmail = () => {
//   return useSelector((state) => state.auth.email);
// };

// export const useUserPhone = () => {
//   return useSelector((state) => state.auth.phone);
// };

// // ==================== SUBSCRIPTION HOOKS ====================
// export const useSubscription = () => {
//   return useSelector((state) => state.subscription);
// };

// export const useSubscriptionPlans = () => {
//   return useSelector((state) => state.subscription.plans);
// };

// export const useSelectedPlan = () => {
//   return useSelector((state) => state.subscription.selectedPlan);
// };

// export const useUserSubscription = () => {
//   return useSelector((state) => state.subscription.userSubscription);
// };

// export const useSubscriptionStatus = () => {
//   return useSelector((state) => state.subscription.subscriptionStatus);
// };

// export const usePaymentStatus = () => {
//   return useSelector((state) => state.subscription.paymentStatus);
// };

// export const usePaymentData = () => {
//   return useSelector((state) => state.subscription.paymentData);
// };

// export const usePaymentError = () => {
//   return useSelector((state) => state.subscription.paymentError);
// };

// export const useSelectedGateway = () => {
//   return useSelector((state) => state.subscription.selectedGateway);
// };

// export const useGatewayRecommendation = () => {
//   return useSelector((state) => state.subscription.gatewayRecommendation);
// };

// export const useCheckoutStep = () => {
//   return useSelector((state) => state.subscription.checkoutStep);
// };

// export const useCheckoutData = () => {
//   return useSelector((state) => state.subscription.checkoutData);
// };

// export const useProcessingFee = () => {
//   return useSelector((state) => state.subscription.processingFee);
// };

// export const useParticipationFee = () => {
//   return useSelector((state) => ({
//     fee: state.subscription.participationFee,
//     percentage: state.subscription.participationFeePercentage,
//   }));
// };

// export const useSubscriptionLoading = () => {
//   return useSelector((state) => state.subscription.loading);
// };

// export const useSubscriptionError = () => {
//   return useSelector((state) => state.subscription.error);
// };

// export const useSubscriptionSuccess = () => {
//   return useSelector((state) => state.subscription.successMessage);
// };

// // ==================== USER HOOKS ====================
// export const useUser = () => {
//   return useSelector((state) => state.user);
// };

// // ==================== UI HOOKS ====================
// export const useUI = () => {
//   return useSelector((state) => state.ui);
// };
// import { useDispatch, useSelector } from 'react-redux';

// export const useAppDispatch = () => useDispatch();
// export const useAppSelector = useSelector;

// export const useAuth = () => {
//   return useSelector(state => state.auth);
// };

// export const useUI = () => {
//   return useSelector(state => state.ui);
// };

// export const useSubscription = () => {
//   return useSelector(state => state.subscription);
// };

// // Selector hooks for specific auth properties
// export const useIsAuthenticated = () => {
//   return useSelector(state => state.auth.isAuthenticated);
// };

// export const useUserId = () => {
//   return useSelector(state => state.auth.userId);
// };

// export const useUserRoles = () => {
//   return useSelector(state => state.auth.roles);
// };

// export const useCurrentAuthStep = () => {
//   return useSelector(state => state.auth.currentAuthStep);
// };

// export const useAuthLoading = () => {
//   return useSelector(state => state.auth.loading);
// };

// export const useAuthError = () => {
//   return useSelector(state => state.auth.error);
// };
