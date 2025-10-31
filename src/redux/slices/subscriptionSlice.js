import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Plans
  plans: [],
  currentPlan: null,
  selectedPlan: null,

  // User Subscription
  userSubscription: null,
  subscriptionStatus: null, // 'active', 'expired', 'none'
  subscriptionHistory: [],

  // Payment State
  paymentStatus: null, // 'idle', 'pending', 'success', 'failed'
  paymentError: null,
  paymentData: null,
  selectedGateway: null, // 'stripe' or 'paddle'

  // Gateway Recommendation
  gatewayRecommendation: null,

  // Checkout State
  checkoutStep: 'plan-selection', // 'plan-selection', 'gateway-selection', 'payment', 'confirmation'
  checkoutData: {
    planId: null,
    countryCode: null,
    paymentMethod: 'card',
    gateway: null,
  },

  // Processing Fee
  processingFee: 0,

  // Participation Fee
  participationFee: null,
  participationFeePercentage: null,

  // Admin State
  allPlans: [],
  gatewayConfigs: [],
  regionalPricing: {},

  // Loading & Error
  loading: false,
  error: null,
  successMessage: null,
  
};

export const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    // Plans
    setPlans: (state, action) => {
      console.log('🔧 [subscriptionSlice] setPlans called:', action.payload);
      state.plans = action.payload;
      state.error = null;
    },

    setCurrentPlan: (state, action) => {
      console.log('🔧 [subscriptionSlice] setCurrentPlan called:', action.payload);
      state.currentPlan = action.payload;
    },

    setSelectedPlan: (state, action) => {
      console.log('🔧 [subscriptionSlice] setSelectedPlan called:', action.payload);
      state.selectedPlan = action.payload;
      state.checkoutData.planId = action.payload?.id;
    },

    // User Subscription
    setUserSubscription: (state, action) => {
      console.log('🔧 [subscriptionSlice] setUserSubscription called:', action.payload);
      console.trace('👆 Called from:');
      state.userSubscription = action.payload;
      state.subscriptionStatus = action.payload ? 'active' : 'none';
    },

    updateSubscriptionStatus: (state, action) => {
      console.log('🔧 [subscriptionSlice] updateSubscriptionStatus called:', action.payload);
      state.subscriptionStatus = action.payload;
    },

    setSubscriptionHistory: (state, action) => {
      console.log('🔧 [subscriptionSlice] setSubscriptionHistory called:', action.payload);
      state.subscriptionHistory = action.payload;
    },

    // Payment State
    setPaymentStatus: (state, action) => {
      console.log('🔧 [subscriptionSlice] setPaymentStatus called:', action.payload);
      state.paymentStatus = action.payload;
    },

    setPaymentData: (state, action) => {
      console.log('🔧 [subscriptionSlice] setPaymentData called:', action.payload);
      state.paymentData = action.payload;
      state.paymentError = null;
    },

    setPaymentError: (state, action) => {
      console.log('🔧 [subscriptionSlice] setPaymentError called:', action.payload);
      state.paymentError = action.payload;
      state.paymentStatus = 'failed';
    },

    setSelectedGateway: (state, action) => {
      console.log('🔧 [subscriptionSlice] setSelectedGateway called:', action.payload);
      state.selectedGateway = action.payload;
      state.checkoutData.gateway = action.payload;
    },

    // Gateway Recommendation
    setGatewayRecommendation: (state, action) => {
      console.log('🔧 [subscriptionSlice] setGatewayRecommendation called:', action.payload);
      state.gatewayRecommendation = action.payload;
    },

    // Checkout
    setCheckoutStep: (state, action) => {
      console.log('🔧 [subscriptionSlice] setCheckoutStep called:', action.payload);
      state.checkoutStep = action.payload;
    },

    updateCheckoutData: (state, action) => {
      console.log('🔧 [subscriptionSlice] updateCheckoutData called:', action.payload);
      state.checkoutData = {
        ...state.checkoutData,
        ...action.payload,
      };
    },

    // Fees
    setProcessingFee: (state, action) => {
      console.log('🔧 [subscriptionSlice] setProcessingFee called:', action.payload);
      console.trace('👆 Called from:');
      state.processingFee = action.payload;
    },

    setParticipationFee: (state, action) => {
      console.log('🔧 [subscriptionSlice] setParticipationFee called:', action.payload);
      const { fee, percentage } = action.payload;
      state.participationFee = fee;
      state.participationFeePercentage = percentage;
    },

    // Admin - Gateway Config
    setAllPlans: (state, action) => {
      console.log('🔧 [subscriptionSlice] setAllPlans called:', action.payload);
      state.allPlans = action.payload;
    },

    setGatewayConfigs: (state, action) => {
      console.log('🔧 [subscriptionSlice] setGatewayConfigs called:', action.payload);
      state.gatewayConfigs = action.payload;
    },

    setRegionalPricing: (state, action) => {
      console.log('🔧 [subscriptionSlice] setRegionalPricing called:', action.payload);
      state.regionalPricing = action.payload;
    },

    // Loading & Error
    setLoading: (state, action) => {
      console.log('🔧 [subscriptionSlice] setLoading called:', action.payload);
      state.loading = action.payload;
    },

    setError: (state, action) => {
      console.log('🔧 [subscriptionSlice] setError called:', action.payload);
      state.error = action.payload;
      state.successMessage = null;
      state.loading = false;
    },

    setSuccess: (state, action) => {
      console.log('🔧 [subscriptionSlice] setSuccess called:', action.payload);
      state.successMessage = action.payload;
      state.error = null;
      state.loading = false;
    },

    clearError: (state) => {
      console.log('🔧 [subscriptionSlice] clearError called');
      state.error = null;
    },

    clearSuccess: (state) => {
      console.log('🔧 [subscriptionSlice] clearSuccess called');
      state.successMessage = null;
    },

    // Clear Checkout
    clearCheckout: (state) => {
      console.log('🔧 [subscriptionSlice] clearCheckout called');
      state.checkoutStep = 'plan-selection';
      state.checkoutData = {
        planId: null,
        countryCode: null,
        paymentMethod: 'card',
        gateway: null,
      };
      state.selectedPlan = null;
      state.selectedGateway = null;
      state.paymentStatus = null;
      state.paymentError = null;
      state.paymentData = null;
    },

    // Reset Payment
    resetPaymentStatus: (state) => {
      console.log('🔧 [subscriptionSlice] resetPaymentStatus called');
      state.paymentStatus = null;
      state.paymentError = null;
      state.paymentData = null;
    },

    // Reset
    /*eslint-disable*/
    resetSubscription: (state) => {
      console.log('💥💥💥 [subscriptionSlice] RESET SUBSCRIPTION CALLED - ALL DATA WILL BE CLEARED! 💥💥💥');
      console.trace('👆 WHO CALLED RESET? Stack trace above:');
      return initialState;
    },
  },
});

export const {
  setPlans,
  setCurrentPlan,
  setSelectedPlan,
  setUserSubscription,
  updateSubscriptionStatus,
  setSubscriptionHistory,
  setPaymentStatus,
  setPaymentData,
  setPaymentError,
  setSelectedGateway,
  setGatewayRecommendation,
  setCheckoutStep,
  updateCheckoutData,
  setProcessingFee,
  setParticipationFee,
  setAllPlans,
  setGatewayConfigs,
  setRegionalPricing,
  setLoading,
  setError,
  setSuccess,
  clearError,
  clearSuccess,
  clearCheckout,
  resetPaymentStatus,
  resetSubscription,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;

// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   // Plans
//   plans: [],
//   currentPlan: null,
//   selectedPlan: null,

//   // User Subscription
//   userSubscription: null,
//   subscriptionStatus: null, // 'active', 'expired', 'none'
//   subscriptionHistory: [],

//   // Payment State
//   paymentStatus: null, // 'idle', 'pending', 'success', 'failed'
//   paymentError: null,
//   paymentData: null,
//   selectedGateway: null, // 'stripe' or 'paddle'

//   // Gateway Recommendation
//   gatewayRecommendation: null,

//   // Checkout State
//   checkoutStep: 'plan-selection', // 'plan-selection', 'gateway-selection', 'payment', 'confirmation'
//   checkoutData: {
//     planId: null,
//     countryCode: null,
//     paymentMethod: 'card',
//     gateway: null,
//   },

//   // Processing Fee
//   processingFee: 0,

//   // Participation Fee
//   participationFee: null,
//   participationFeePercentage: null,

//   // Admin State
//   allPlans: [],
//   gatewayConfigs: [],
//   regionalPricing: {},

//   // Loading & Error
//   loading: false,
//   error: null,
//   successMessage: null,
  
// };

// export const subscriptionSlice = createSlice({
//   name: 'subscription',
//   initialState,
//   reducers: {
//     // Plans
//     setPlans: (state, action) => {
//       state.plans = action.payload;
//       state.error = null;
//     },

//     setCurrentPlan: (state, action) => {
//       state.currentPlan = action.payload;
//     },

//     setSelectedPlan: (state, action) => {
//       state.selectedPlan = action.payload;
//       state.checkoutData.planId = action.payload?.id;
//     },

//     // User Subscription
//     setUserSubscription: (state, action) => {
//       state.userSubscription = action.payload;
//       state.subscriptionStatus = action.payload ? 'active' : 'none';
//     },

//     updateSubscriptionStatus: (state, action) => {
//       state.subscriptionStatus = action.payload;
//     },

//     setSubscriptionHistory: (state, action) => {
//       state.subscriptionHistory = action.payload;
//     },

//     // Payment State
//     setPaymentStatus: (state, action) => {
//       state.paymentStatus = action.payload;
//     },

//     setPaymentData: (state, action) => {
//       state.paymentData = action.payload;
//       state.paymentError = null;
//     },

//     setPaymentError: (state, action) => {
//       state.paymentError = action.payload;
//       state.paymentStatus = 'failed';
//     },

//     setSelectedGateway: (state, action) => {
//       state.selectedGateway = action.payload;
//       state.checkoutData.gateway = action.payload;
//     },

//     // Gateway Recommendation
//     setGatewayRecommendation: (state, action) => {
//       state.gatewayRecommendation = action.payload;
//     },

//     // Checkout
//     setCheckoutStep: (state, action) => {
//       state.checkoutStep = action.payload;
//     },

//     updateCheckoutData: (state, action) => {
//       state.checkoutData = {
//         ...state.checkoutData,
//         ...action.payload,
//       };
//     },

//     // Fees
//     setProcessingFee: (state, action) => {
//       state.processingFee = action.payload;
//     },

//     setParticipationFee: (state, action) => {
//       const { fee, percentage } = action.payload;
//       state.participationFee = fee;
//       state.participationFeePercentage = percentage;
//     },

//     // Admin - Gateway Config
//     setAllPlans: (state, action) => {
//       state.allPlans = action.payload;
//     },

//     setGatewayConfigs: (state, action) => {
//       state.gatewayConfigs = action.payload;
//     },

//     setRegionalPricing: (state, action) => {
//       state.regionalPricing = action.payload;
//     },

//     // Loading & Error
//     setLoading: (state, action) => {
//       state.loading = action.payload;
//     },

//     setError: (state, action) => {
//       state.error = action.payload;
//       state.successMessage = null;
//       state.loading = false;
//     },

//     setSuccess: (state, action) => {
//       state.successMessage = action.payload;
//       state.error = null;
//       state.loading = false;
//     },

//     clearError: (state) => {
//       state.error = null;
//     },

//     clearSuccess: (state) => {
//       state.successMessage = null;
//     },

//     // Clear Checkout
//     clearCheckout: (state) => {
//       state.checkoutStep = 'plan-selection';
//       state.checkoutData = {
//         planId: null,
//         countryCode: null,
//         paymentMethod: 'card',
//         gateway: null,
//       };
//       state.selectedPlan = null;
//       state.selectedGateway = null;
//       state.paymentStatus = null;
//       state.paymentError = null;
//       state.paymentData = null;
//     },

//     // Reset Payment
//     resetPaymentStatus: (state) => {
//       state.paymentStatus = null;
//       state.paymentError = null;
//       state.paymentData = null;
//     },

//     // Reset
//     /*eslint-disable*/
//     resetSubscription: (state) => {
//       return initialState;
//     },
//   },
// });

// export const {
//   setPlans,
//   setCurrentPlan,
//   setSelectedPlan,
//   setUserSubscription,
//   updateSubscriptionStatus,
//   setSubscriptionHistory,
//   setPaymentStatus,
//   setPaymentData,
//   setPaymentError,
//   setSelectedGateway,
//   setGatewayRecommendation,
//   setCheckoutStep,
//   updateCheckoutData,
//   setProcessingFee,
//   setParticipationFee,
//   setAllPlans,
//   setGatewayConfigs,
//   setRegionalPricing,
//   setLoading,
//   setError,
//   setSuccess,
//   clearError,
//   clearSuccess,
//   clearCheckout,
//   resetPaymentStatus,
//   resetSubscription,
// } = subscriptionSlice.actions;

// export default subscriptionSlice.reducer;