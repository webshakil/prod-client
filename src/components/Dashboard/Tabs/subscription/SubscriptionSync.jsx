import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { checkEligibility } from '../../../../redux/api/election/electionApi';
import { setCurrentElectionsCount, setElectionCreationLimit, setIsSubscribed, setSubscriptionType } from '../../../../redux/slices/authSlice';

/**
 * SubscriptionSync Component
 * 
 * This component runs once on app load to sync the user's REAL subscription
 * data from the database into Redux and localStorage.
 * 
 * Usage: Add this to your App.jsx or main layout
 * <SubscriptionSync />
 */
export default function SubscriptionSync() {
  const dispatch = useDispatch();
  const { isAuthenticated, userId } = useSelector((state) => state.auth);
  
  useEffect(() => {
    // Only fetch if user is authenticated
    if (isAuthenticated && userId) {
      syncSubscription();
    }
  }, [isAuthenticated, userId]);
  
  const syncSubscription = async () => {
    try {
      console.log('🔄 Syncing subscription data from database...');
      
      const response = await checkEligibility();
      const eligibilityData = response.data;
      
      console.log('✅ Subscription synced:', eligibilityData);
      
      // Update Redux with real subscription data
      if (eligibilityData.subscriptionType && eligibilityData.subscriptionType.toLowerCase() !== 'free') {
        dispatch(setSubscriptionType(eligibilityData.subscriptionType));
        dispatch(setIsSubscribed(true));
      } else {
        dispatch(setSubscriptionType('Free'));
        dispatch(setIsSubscribed(false));
      }
      
      // Update election limits
      if (eligibilityData.maxElections) {
        const limit = eligibilityData.maxElections === 'Unlimited' 
          ? 999999 
          : parseInt(eligibilityData.maxElections);
        dispatch(setElectionCreationLimit(limit));
      }
      
      if (eligibilityData.currentElectionsCount !== undefined) {
        dispatch(setCurrentElectionsCount(eligibilityData.currentElectionsCount));
      }
      
      console.log('✅ Redux and localStorage updated with real subscription data');
      
    } catch (error) {
      console.error('❌ Failed to sync subscription:', error);
      // Don't show error to user, just keep default values
    }
  };
  
  // This component doesn't render anything
  return null;
}