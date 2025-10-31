// src/utils/loadSubscriptionData.js
import { checkEligibility } from '../redux/api/election/electionApi';
import {
  setSubscriptionType,
  setIsSubscribed,
  setElectionCreationLimit,
  setCurrentSubscription,
  updateSubscriptionStatus
} from '../redux/slices/authSlice';
import {
  setCurrentPlan,
  setUserSubscription,
  setProcessingFee,
  setParticipationFee,
  updateSubscriptionStatus as updateSubSliceStatus
} from '../redux/slices/subscriptionSlice';

export const loadSubscriptionData = async (dispatch) => {
  try {
    const response = await checkEligibility();
    const eligibilityData = response.data;

    console.log('✅ Loading subscription data globally:', eligibilityData);

    // 1. UPDATE AUTH SLICE - Subscription Type & Status
    if (eligibilityData.subscriptionType && eligibilityData.subscriptionType.toLowerCase() !== 'free') {
      dispatch(setSubscriptionType(eligibilityData.subscriptionType));
      dispatch(setIsSubscribed(true));
      dispatch(updateSubscriptionStatus('active'));
    } else {
      dispatch(setSubscriptionType('Free'));
      dispatch(setIsSubscribed(false));
      dispatch(updateSubscriptionStatus('none'));
    }

    // 2. UPDATE AUTH SLICE - Election Creation Limit
    if (eligibilityData.maxElections) {
      const limit = eligibilityData.maxElections === 'Unlimited' 
        ? 999999 
        : parseInt(eligibilityData.maxElections);
      dispatch(setElectionCreationLimit(limit));
    }

    // 3. UPDATE AUTH SLICE - Current Subscription Object
    if (eligibilityData.subscriptionType && eligibilityData.subscriptionType.toLowerCase() !== 'free') {
      const currentSubscriptionData = {
        id: eligibilityData.subscriptionId || null,
        plan_name: eligibilityData.planName || eligibilityData.subscriptionType,
        subscription_type: eligibilityData.subscriptionType,
        amount: eligibilityData.amount || 0,
        currency: eligibilityData.currency || 'USD',
        status: 'active',
        max_elections: eligibilityData.maxElections,
        current_elections_count: eligibilityData.currentElectionsCount || 0,
        remaining_elections: eligibilityData.remainingElections,
        can_create_paid_elections: eligibilityData.canCreatePaidElections || false,
        processing_fee_percentage: eligibilityData.processingFeePercentage || 0,
      };
      
      dispatch(setCurrentSubscription(currentSubscriptionData));
    } else {
      dispatch(setCurrentSubscription(null));
    }

    // 4. UPDATE SUBSCRIPTION SLICE - Current Plan
    const planData = {
      id: eligibilityData.planId || null,
      name: eligibilityData.planName || eligibilityData.subscriptionType || 'Free',
      type: eligibilityData.subscriptionType || 'Free',
      amount: eligibilityData.amount || 0,
      currency: eligibilityData.currency || 'USD',
      maxElections: eligibilityData.maxElections || 0,
      canCreatePaidElections: eligibilityData.canCreatePaidElections || false,
      processingFeePercentage: eligibilityData.processingFeePercentage || 0,
    };
    
    dispatch(setCurrentPlan(planData));

    // 5. UPDATE SUBSCRIPTION SLICE - User Subscription
    if (eligibilityData.subscriptionType && eligibilityData.subscriptionType.toLowerCase() !== 'free') {
      const subscriptionData = {
        id: eligibilityData.subscriptionId || null,
        user_id: eligibilityData.userId || null,
        plan_id: eligibilityData.planId || null,
        status: 'active',
        start_date: eligibilityData.startDate || new Date().toISOString(),
        end_date: eligibilityData.endDate || null,
        gateway: eligibilityData.gateway || 'manual',
        payment_type: eligibilityData.subscriptionType?.toLowerCase()?.replace(/-/g, '_') || 'pay_as_you_go',
        auto_renew: eligibilityData.autoRenew || false,
        external_subscription_id: eligibilityData.externalSubscriptionId || null,
        plan_name: eligibilityData.planName || eligibilityData.subscriptionType,
        amount: eligibilityData.amount || 0,
        billing_cycle: eligibilityData.billingCycle || null,
        currency: eligibilityData.currency || 'USD',
        days_remaining: eligibilityData.daysRemaining || null,
        created_at: eligibilityData.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      dispatch(setUserSubscription(subscriptionData));
      dispatch(updateSubSliceStatus('active'));
    } else {
      dispatch(setUserSubscription(null));
      dispatch(updateSubSliceStatus('none'));
    }

    // 6. UPDATE SUBSCRIPTION SLICE - Processing Fee
    if (eligibilityData.processingFeePercentage !== undefined && eligibilityData.processingFeePercentage !== null) {
      const processingFeeValue = parseFloat(eligibilityData.processingFeePercentage) || 0;
      dispatch(setProcessingFee(processingFeeValue));
      console.log('✅ Processing Fee set globally:', processingFeeValue + '%');
    } else {
      dispatch(setProcessingFee(0));
    }

    // 7. UPDATE SUBSCRIPTION SLICE - Participation Fee
    if (eligibilityData.participationFeePercentage !== undefined && eligibilityData.participationFeePercentage !== null) {
      const participationFeeValue = parseFloat(eligibilityData.participationFee) || 0;
      const participationFeePercentageValue = parseFloat(eligibilityData.participationFeePercentage) || 0;
      
      dispatch(setParticipationFee({
        fee: participationFeeValue,
        percentage: participationFeePercentageValue
      }));
      console.log('✅ Participation Fee set globally:', participationFeePercentageValue + '%');
    }

    console.log('✅ Global subscription data loaded successfully');
    return true;
  } catch (error) {
    console.error('❌ Error loading subscription data globally:', error);
    return false;
  }
};