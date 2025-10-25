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
      state.plans = action.payload;
      state.error = null;
    },

    setCurrentPlan: (state, action) => {
      state.currentPlan = action.payload;
    },

    setSelectedPlan: (state, action) => {
      state.selectedPlan = action.payload;
      state.checkoutData.planId = action.payload?.id;
    },

    // User Subscription
    setUserSubscription: (state, action) => {
      state.userSubscription = action.payload;
      state.subscriptionStatus = action.payload ? 'active' : 'none';
    },

    updateSubscriptionStatus: (state, action) => {
      state.subscriptionStatus = action.payload;
    },

    setSubscriptionHistory: (state, action) => {
      state.subscriptionHistory = action.payload;
    },

    // Payment State
    setPaymentStatus: (state, action) => {
      state.paymentStatus = action.payload;
    },

    setPaymentData: (state, action) => {
      state.paymentData = action.payload;
      state.paymentError = null;
    },

    setPaymentError: (state, action) => {
      state.paymentError = action.payload;
      state.paymentStatus = 'failed';
    },

    setSelectedGateway: (state, action) => {
      state.selectedGateway = action.payload;
      state.checkoutData.gateway = action.payload;
    },

    // Gateway Recommendation
    setGatewayRecommendation: (state, action) => {
      state.gatewayRecommendation = action.payload;
    },

    // Checkout
    setCheckoutStep: (state, action) => {
      state.checkoutStep = action.payload;
    },

    updateCheckoutData: (state, action) => {
      state.checkoutData = {
        ...state.checkoutData,
        ...action.payload,
      };
    },

    // Fees
    setProcessingFee: (state, action) => {
      state.processingFee = action.payload;
    },

    setParticipationFee: (state, action) => {
      const { fee, percentage } = action.payload;
      state.participationFee = fee;
      state.participationFeePercentage = percentage;
    },

    // Admin - Gateway Config
    setAllPlans: (state, action) => {
      state.allPlans = action.payload;
    },

    setGatewayConfigs: (state, action) => {
      state.gatewayConfigs = action.payload;
    },

    setRegionalPricing: (state, action) => {
      state.regionalPricing = action.payload;
    },

    // Loading & Error
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
      state.successMessage = null;
      state.loading = false;
    },

    setSuccess: (state, action) => {
      state.successMessage = action.payload;
      state.error = null;
      state.loading = false;
    },

    clearError: (state) => {
      state.error = null;
    },

    clearSuccess: (state) => {
      state.successMessage = null;
    },

    // Clear Checkout
    clearCheckout: (state) => {
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
      state.paymentStatus = null;
      state.paymentError = null;
      state.paymentData = null;
    },

    // Reset
    /*eslint-disable*/
    resetSubscription: (state) => {
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