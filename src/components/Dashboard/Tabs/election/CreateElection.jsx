import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { checkEligibility } from '../../../redux/api/election/electionApi';
import { 
  setSubscriptionType,
  setIsSubscribed,
  setElectionCreationLimit,
  setIsContentCreator,
  setIsOrganization,
  setCurrentSubscription,
  updateSubscriptionStatus
} from '../../../redux/slices/authSlice';
import {
  setCurrentPlan,
  setUserSubscription,
  setProcessingFee,
  setParticipationFee
} from '../../../redux/slices/subscriptionSlice';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaInfoCircle,
  FaUser,
  FaUsers,
  FaVideo,
  FaArrowRight,
  FaRocket,
  FaCrown,
  FaStar,
  FaSpinner
} from 'react-icons/fa';
import ElectionWizard from './election/ElectionWizard/ElectionWizard';
//import ElectionWizard from './ElectionWizard/ElectionWizard';

export default function CreateElection() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { roles } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(true);
  const [selectedCreatorType, setSelectedCreatorType] = useState('individual');
  const [eligibility, setEligibility] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  
  // Fetch real eligibility data from backend
  useEffect(() => {
    fetchEligibility();
  }, []);
  
  const fetchEligibility = async () => {
    setLoading(true);
    try {
      const response = await checkEligibility();
      
      // Response structure: { success, message, data: { actual eligibility data } }
      const eligibilityData = response.data;
      
      console.log('✅ Eligibility data:', eligibilityData);
      setEligibility(eligibilityData);
      
      // 🆕 UPDATE ALL REDUX SLICES WITH COMPLETE SUBSCRIPTION DATA
      
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
          plan_id: eligibilityData.planId || null,
          plan_name: eligibilityData.planName || eligibilityData.subscriptionType,
          subscription_type: eligibilityData.subscriptionType,
          amount: eligibilityData.amount || 0,
          currency: eligibilityData.currency || 'USD',
          status: 'active',
          max_elections: eligibilityData.maxElections,
          current_elections: eligibilityData.currentElectionsCount || 0,
          remaining_elections: eligibilityData.remainingElections,
          can_create_paid_elections: eligibilityData.canCreatePaidElections || false,
          processing_fee_percentage: eligibilityData.processingFeePercentage || 0,
          created_at: new Date().toISOString(),
        };
        
        dispatch(setUserSubscription(subscriptionData));
      } else {
        dispatch(setUserSubscription(null));
      }
      
      // 6. UPDATE SUBSCRIPTION SLICE - Processing Fee
      if (eligibilityData.processingFeePercentage !== undefined) {
        dispatch(setProcessingFee(eligibilityData.processingFeePercentage));
      }
      
      // 7. UPDATE SUBSCRIPTION SLICE - Participation Fee (if available)
      if (eligibilityData.participationFeePercentage !== undefined) {
        dispatch(setParticipationFee({
          fee: eligibilityData.participationFee || 0,
          percentage: eligibilityData.participationFeePercentage
        }));
      }
      
      // 8. UPDATE AUTH SLICE - Role Flags
      if (eligibilityData.canCreatePaidElections) {
        // User has paid subscription, update roles if needed
        if (roles?.includes('ContentCreator') || roles?.includes('Content_Creator')) {
          dispatch(setIsContentCreator(true));
        }
        if (roles?.includes('Manager') || roles?.includes('Admin')) {
          dispatch(setIsOrganization(true));
        }
      }
      
      console.log('✅ Redux Store Updated Successfully:');
      console.log('📋 Auth Slice - Subscription Type:', eligibilityData.subscriptionType);
      console.log('💰 Auth Slice - Amount:', eligibilityData.amount, eligibilityData.currency);
      console.log('💰 Subscription Slice - Amount:', eligibilityData.amount, eligibilityData.currency);
      console.log('📈 Subscription Slice - Processing Fee:', eligibilityData.processingFeePercentage + '%');
      console.log('🎯 Auth & Subscription Slice - Status:', eligibilityData.subscriptionType?.toLowerCase() !== 'free' ? 'active' : 'none');
      
    } catch (error) {
      console.error('❌ Error fetching eligibility:', error);
      toast.error('Failed to load eligibility data');
      setEligibility(null);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStartCreation = () => {
    if (eligibility?.canCreate) {
      console.log('🚀 Opening wizard with creator type:', selectedCreatorType);
      setShowWizard(true);
    } else {
      toast.warning('You cannot create elections at this time');
    }
  };
  
  const handleWizardClose = () => {
    setShowWizard(false);
    // Refresh eligibility after wizard closes (in case election was created)
    fetchEligibility();
  };
  
  const getSubscriptionIcon = (type) => {
    const icons = {
      'Free': '🆓',
      'free': '🆓',
      'Pay-as-You-Go': '💳',
      'pay-as-you-go': '💳',
      'pay_as_you_go': '💳',
      'Monthly': '📅',
      'monthly': '📅',
      '3-Month': '📆',
      'quarterly': '📆',
      '6-Month': '📆',
      'semi-annual': '📆',
      'Yearly': '🗓️',
      'yearly': '🗓️',
      'annual': '🗓️'
    };
    return icons[type] || '📋';
  };
  
  // If wizard is open, show only the wizard
  if (showWizard) {
    return (
      <ElectionWizard 
        creatorType={selectedCreatorType}
        onClose={handleWizardClose}
        eligibility={eligibility}
      />
    );
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading eligibility data...</p>
        </div>
      </div>
    );
  }
  
  if (!eligibility) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaTimesCircle className="text-5xl text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Failed to load eligibility data</p>
          <button
            onClick={fetchEligibility}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create New Election
        </h1>
        <p className="text-gray-600">
          Check your plan details and start creating your election 
        </p>
      </div>
      
      {/* Eligibility Status Card */}
      <div className={`rounded-xl shadow-lg p-6 mb-6 ${
        eligibility.canCreate 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200'
          : 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200'
      }`}>
        <div className="flex items-start space-x-4">
          {eligibility.canCreate ? (
            <FaCheckCircle className="text-green-600 text-3xl mt-1 flex-shrink-0" />
          ) : (
            <FaTimesCircle className="text-red-600 text-3xl mt-1 flex-shrink-0" />
          )}
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {eligibility.canCreate ? 'You can create elections! 🎉' : 'Election creation limit reached 😔'}
            </h2>
            <p className="text-gray-700 text-lg">
              {eligibility.message}
            </p>
          </div>
        </div>
      </div>
      
      {/* Current Plan Details */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Plan Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FaCrown className="text-yellow-500" />
              Your Plan 
            </h3>
            <span className="text-3xl">
              {getSubscriptionIcon(eligibility.subscriptionType)}
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600 font-medium">Subscription</span>
              <span className="font-bold text-lg text-blue-600 capitalize">
                {eligibility.planName || eligibility.subscriptionType || 'Free'}
              </span>
            </div>
            
            {eligibility.amount && parseFloat(eligibility.amount) > 0 && (
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Amount Paid</span>
                <span className="font-bold text-green-600">
                  ${eligibility.amount} {eligibility.currency || 'USD'}
                </span>
              </div>
            )}
            
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600 font-medium">Elections Created</span>
              <span className="font-bold text-gray-900">
                {eligibility.currentElectionsCount} / {eligibility.maxElections === 'Unlimited' ? '∞' : eligibility.maxElections}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600 font-medium">Remaining</span>
              <span className="font-bold text-2xl text-green-600">
                {eligibility.remainingElections === 'Unlimited' ? '∞' : eligibility.remainingElections}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600 font-medium">Processing Fee</span>
              <span className="font-bold text-gray-900 text-lg">
                {eligibility.processingFeePercentage}%
              </span>
            </div>
          </div>
          
          {!eligibility.canCreate && (
            <button
              onClick={() => navigate('/dashboard/subscription')}
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-md transform hover:scale-105"
            >
              Upgrade Plan Now
            </button>
          )}
        </div>
        
        {/* Features Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-purple-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FaStar className="text-purple-500" />
              Plan Features
            </h3>
            <FaInfoCircle className="text-purple-500 text-xl" />
          </div>
          
          <div className="space-y-2.5">
            <FeatureItem enabled={true} text="Create Elections" />
            <FeatureItem enabled={eligibility.canCreatePaidElections} text="Paid Elections (Regional Pricing)" />
            <FeatureItem enabled={eligibility.subscriptionType !== 'Free' && eligibility.subscriptionType !== 'free'} text="Custom Branding & Logo" />
            <FeatureItem enabled={eligibility.subscriptionType !== 'Free' && eligibility.subscriptionType !== 'free'} text="Unlimited Voters" />
            <FeatureItem enabled={eligibility.subscriptionType !== 'Free' && eligibility.subscriptionType !== 'free'} text="Lottery Prizes" />
            <FeatureItem enabled={eligibility.subscriptionType !== 'Free' && eligibility.subscriptionType !== 'free'} text="Advanced Analytics" />
            <FeatureItem enabled={roles?.includes('ContentCreator') || roles?.includes('Content_Creator')} text="Content Creator Tools" />
            <FeatureItem enabled={roles?.includes('Manager') || roles?.includes('Admin')} text="Organization Management" />
          </div>
        </div>
      </div>
      
      {/* Creator Type Selection */}
      {eligibility.canCreate && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaRocket className="text-orange-500" />
            Who is creating this election?
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            {/* Individual */}
            <CreatorTypeCard
              selected={selectedCreatorType === 'individual'}
              onClick={() => setSelectedCreatorType('individual')}
              icon={<FaUser className="text-4xl" />}
              title="Individual"
              description="Create as an individual creator"
              available={true}
            />
            
            {/* Content Creator */}
            <CreatorTypeCard
              selected={selectedCreatorType === 'content_creator'}
              onClick={() => setSelectedCreatorType('content_creator')}
              icon={<FaVideo className="text-4xl" />}
              title="Content Creator"
              description="Create with content creator features"
              available={
                roles?.includes('ContentCreator') || 
                roles?.includes('Content_Creator') ||
                roles?.includes('Admin')
              }
            />
            
            {/* Organization */}
            <CreatorTypeCard
              selected={selectedCreatorType === 'organization'}
              onClick={() => setSelectedCreatorType('organization')}
              icon={<FaUsers className="text-4xl" />}
              title="Organization"
              description="Create as an organization"
              available={
                roles?.includes('Manager') || 
                roles?.includes('Admin')
              }
            />
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      {eligibility.canCreate && (
        <div className="flex justify-center">
          <button
            onClick={handleStartCreation}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-xl font-bold text-lg flex items-center space-x-3"
          >
            <FaRocket className="text-xl" />
            <span>Start Creating Election</span>
            <FaArrowRight />
          </button>
        </div>
      )}
    </div>
  );
}

// Feature Item Component
function FeatureItem({ enabled, text }) {
  return (
    <div className="flex items-center space-x-3 py-1">
      {enabled ? (
        <FaCheckCircle className="text-green-500 text-lg flex-shrink-0" />
      ) : (
        <FaTimesCircle className="text-gray-300 text-lg flex-shrink-0" />
      )}
      <span className={`text-sm ${enabled ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
        {text}
      </span>
    </div>
  );
}

// Creator Type Card Component
function CreatorTypeCard({ selected, onClick, icon, title, description, available }) {
  return (
    <button
      onClick={available ? onClick : null}
      disabled={!available}
      className={`p-6 rounded-xl border-2 transition-all transform ${
        selected
          ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
          : available
          ? 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:scale-102'
          : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
      }`}
    >
      <div className={`mb-3 ${selected ? 'text-blue-600' : available ? 'text-gray-600' : 'text-gray-400'}`}>
        {icon}
      </div>
      <h4 className={`font-bold text-lg mb-2 ${selected ? 'text-blue-600' : 'text-gray-800'}`}>
        {title}
      </h4>
      <p className="text-gray-600 text-sm">
        {description}
      </p>
      {!available && (
        <p className="text-red-500 text-xs mt-2 font-semibold">
          Not available in your plan
        </p>
      )}
    </button>
  );
}
//last workable code
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { toast } from 'react-toastify';
// import { checkEligibility } from '../../../redux/api/election/electionApi';
// import { 
//   setSubscriptionType,
//   setIsSubscribed,
//   setElectionCreationLimit,
//   setCurrentElectionsCount,
//   setIsContentCreator,
//   setIsOrganization
// } from '../../../redux/slices/authSlice';
// import { 
//   FaCheckCircle, 
//   FaTimesCircle, 
//   FaInfoCircle,
//   FaUser,
//   FaUsers,
//   FaVideo,
//   FaArrowRight,
//   FaRocket,
//   FaCrown,
//   FaStar,
//   FaSpinner
// } from 'react-icons/fa';

// export default function CreateElection() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
  
//   // ✅ READ FROM REDUX STORE
//   const { 
//     roles, 
//     subscriptionType: reduxSubscriptionType,
//     isSubscribed: reduxIsSubscribed,
//     /*eslint-disable*/
//     electionCreationLimit: reduxLimit
//   } = useSelector((state) => state.auth);
  
//   const [loading, setLoading] = useState(true);
//   const [selectedCreatorType, setSelectedCreatorType] = useState('individual');
//   const [eligibility, setEligibility] = useState(null);
  
//   // Fetch real eligibility data from backend
//   useEffect(() => {
//     fetchEligibility();
//   }, []);
  
//   const fetchEligibility = async () => {
//     setLoading(true);
//     try {
//       const response = await checkEligibility();
      
//       // Response structure: { success, message, data: { actual eligibility data } }
//       const eligibilityData = response.data;
      
//       console.log('✅ Eligibility data from API:', eligibilityData);
      
//       // 🆕 UPDATE REDUX STORE WITH REAL SUBSCRIPTION DATA
//       if (eligibilityData.subscriptionType && eligibilityData.subscriptionType.toLowerCase() !== 'free') {
//         dispatch(setSubscriptionType(eligibilityData.subscriptionType));
//         dispatch(setIsSubscribed(true));
//       } else {
//         dispatch(setSubscriptionType('Free'));
//         dispatch(setIsSubscribed(false));
//       }
      
//       // Update election creation limit
//       if (eligibilityData.maxElections) {
//         const limit = eligibilityData.maxElections === 'Unlimited' 
//           ? 999999 
//           : parseInt(eligibilityData.maxElections);
//         dispatch(setElectionCreationLimit(limit));
//       }
      
//       // Update current elections count
//       if (eligibilityData.currentElectionsCount !== undefined) {
//         dispatch(setCurrentElectionsCount(eligibilityData.currentElectionsCount));
//       }
      
//       // Update role flags based on actual subscription
//       if (eligibilityData.canCreatePaidElections) {
//         if (roles?.includes('ContentCreator') || roles?.includes('Content_Creator')) {
//           dispatch(setIsContentCreator(true));
//         }
//         if (roles?.includes('Manager') || roles?.includes('Admin')) {
//           dispatch(setIsOrganization(true));
//         }
//       }
      
//       // Store full eligibility data in local state
//       setEligibility(eligibilityData);
      
//       console.log('✅ Redux updated with subscription data');
//       console.log('✅ Redux subscriptionType:', eligibilityData.subscriptionType);
      
//     } catch (error) {
//       console.error('❌ Error fetching eligibility:', error);
//       toast.error('Failed to load eligibility data');
//       setEligibility(null);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const handleStartCreation = () => {
//     alert('Wizard will open here - ElectionWizard component needed');
//     // setShowWizard(true); // Uncomment when wizard is ready
//   };
  
//   const getSubscriptionIcon = (type) => {
//     const icons = {
//       'Free': '🆓',
//       'free': '🆓',
//       'Pay-as-You-Go': '💳',
//       'pay-as-you-go': '💳',
//       'Monthly': '📅',
//       'monthly': '📅',
//       '3-Month': '📆',
//       'quarterly': '📆',
//       '6-Month': '📆',
//       'semi-annual': '📆',
//       'Yearly': '🗓️',
//       'yearly': '🗓️',
//       'annual': '🗓️'
//     };
//     return icons[type] || '📋';
//   };
  
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <FaSpinner className="animate-spin text-5xl text-blue-600 mx-auto mb-4" />
//           <p className="text-gray-600 text-lg">Loading eligibility data...</p>
//         </div>
//       </div>
//     );
//   }
  
//   if (!eligibility) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <FaTimesCircle className="text-5xl text-red-600 mx-auto mb-4" />
//           <p className="text-gray-600 text-lg">Failed to load eligibility data</p>
//           <button
//             onClick={fetchEligibility}
//             className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }
  
//   // ✅ USE REDUX DATA AS PRIMARY SOURCE, FALLBACK TO API DATA
//   const displaySubscriptionType = reduxSubscriptionType || eligibility.subscriptionType || 'Free';
//   const displayIsSubscribed = reduxIsSubscribed ?? eligibility.canCreatePaidElections ?? false;
  
//   return (
//     <div className="max-w-7xl mx-auto">
//       {/* Header */}
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">
//           Create New Election
//         </h1>
//         <p className="text-gray-600">
//           Check your plan details and start creating your election
//         </p>
//       </div>
      
//       {/* Eligibility Status Card */}
//       <div className={`rounded-xl shadow-lg p-6 mb-6 ${
//         eligibility.canCreate 
//           ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200'
//           : 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200'
//       }`}>
//         <div className="flex items-start space-x-4">
//           {eligibility.canCreate ? (
//             <FaCheckCircle className="text-green-600 text-3xl mt-1 flex-shrink-0" />
//           ) : (
//             <FaTimesCircle className="text-red-600 text-3xl mt-1 flex-shrink-0" />
//           )}
          
//           <div className="flex-1">
//             <h2 className="text-2xl font-bold text-gray-900 mb-2">
//               {eligibility.canCreate ? 'You can create elections! 🎉' : 'Election creation limit reached 😔'}
//             </h2>
//             <p className="text-gray-700 text-lg">
//               {eligibility.message}
//             </p>
//           </div>
//         </div>
//       </div>
      
//       {/* Current Plan Details */}
//       <div className="grid md:grid-cols-2 gap-6 mb-6">
//         {/* Plan Card */}
//         <div className="bg-white rounded-xl shadow-md p-6 border-2 border-blue-100">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
//               <FaCrown className="text-yellow-500" />
//               Your Plan
//             </h3>
//             <span className="text-3xl">
//               {getSubscriptionIcon(displaySubscriptionType)}
//             </span>
//           </div>
          
//           <div className="space-y-3">
//             <div className="flex justify-between items-center py-3 border-b border-gray-100">
//               <span className="text-gray-600 font-medium">Subscription</span>
//               <span className="font-bold text-lg text-blue-600 capitalize">
//                 {eligibility.planName || displaySubscriptionType}
//               </span>
//             </div>
            
//             {eligibility.amount && parseFloat(eligibility.amount) > 0 && (
//               <div className="flex justify-between items-center py-3 border-b border-gray-100">
//                 <span className="text-gray-600 font-medium">Amount Paid</span>
//                 <span className="font-bold text-green-600">
//                   ${eligibility.amount} {eligibility.currency || 'USD'}
//                 </span>
//               </div>
//             )}
            
//             <div className="flex justify-between items-center py-3 border-b border-gray-100">
//               <span className="text-gray-600 font-medium">Elections Created</span>
//               <span className="font-bold text-gray-900">
//                 {eligibility.currentElectionsCount} / {eligibility.maxElections === 'Unlimited' ? '∞' : eligibility.maxElections}
//               </span>
//             </div>
            
//             <div className="flex justify-between items-center py-3 border-b border-gray-100">
//               <span className="text-gray-600 font-medium">Remaining</span>
//               <span className="font-bold text-2xl text-green-600">
//                 {eligibility.remainingElections === 'Unlimited' ? '∞' : eligibility.remainingElections}
//               </span>
//             </div>
            
//             <div className="flex justify-between items-center py-3">
//               <span className="text-gray-600 font-medium">Processing Fee</span>
//               <span className="font-bold text-gray-900 text-lg">
//                 {eligibility.processingFeePercentage}%
//               </span>
//             </div>
//           </div>
          
//           {!eligibility.canCreate && (
//             <button
//               onClick={() => navigate('/dashboard/subscription')}
//               className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-md transform hover:scale-105"
//             >
//               Upgrade Plan Now
//             </button>
//           )}
//         </div>
        
//         {/* Features Card */}
//         <div className="bg-white rounded-xl shadow-md p-6 border-2 border-purple-100">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
//               <FaStar className="text-purple-500" />
//               Plan Features
//             </h3>
//             <FaInfoCircle className="text-purple-500 text-xl" />
//           </div>
          
//           <div className="space-y-2.5">
//             <FeatureItem enabled={true} text="Create Elections" />
//             <FeatureItem enabled={displayIsSubscribed} text="Paid Elections (Regional Pricing)" />
//             <FeatureItem enabled={displaySubscriptionType !== 'Free' && displaySubscriptionType !== 'free'} text="Custom Branding & Logo" />
//             <FeatureItem enabled={displaySubscriptionType !== 'Free' && displaySubscriptionType !== 'free'} text="Unlimited Voters" />
//             <FeatureItem enabled={displaySubscriptionType !== 'Free' && displaySubscriptionType !== 'free'} text="Lottery Prizes" />
//             <FeatureItem enabled={displaySubscriptionType !== 'Free' && displaySubscriptionType !== 'free'} text="Advanced Analytics" />
//             <FeatureItem enabled={roles?.includes('ContentCreator') || roles?.includes('Content_Creator')} text="Content Creator Tools" />
//             <FeatureItem enabled={roles?.includes('Manager') || roles?.includes('Admin')} text="Organization Management" />
//           </div>
//         </div>
//       </div>
      
//       {/* Creator Type Selection */}
//       {eligibility.canCreate && (
//         <div className="bg-white rounded-xl shadow-md p-6 mb-6">
//           <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
//             <FaRocket className="text-orange-500" />
//             Who is creating this election?
//           </h3>
          
//           <div className="grid md:grid-cols-3 gap-4">
//             {/* Individual */}
//             <CreatorTypeCard
//               selected={selectedCreatorType === 'individual'}
//               onClick={() => setSelectedCreatorType('individual')}
//               icon={<FaUser className="text-4xl" />}
//               title="Individual"
//               description="Create as an individual creator"
//               available={true}
//             />
            
//             {/* Content Creator */}
//             <CreatorTypeCard
//               selected={selectedCreatorType === 'content_creator'}
//               onClick={() => setSelectedCreatorType('content_creator')}
//               icon={<FaVideo className="text-4xl" />}
//               title="Content Creator"
//               description="Create with content creator features"
//               available={
//                 roles?.includes('ContentCreator') || 
//                 roles?.includes('Content_Creator') ||
//                 roles?.includes('Admin')
//               }
//             />
            
//             {/* Organization */}
//             <CreatorTypeCard
//               selected={selectedCreatorType === 'organization'}
//               onClick={() => setSelectedCreatorType('organization')}
//               icon={<FaUsers className="text-4xl" />}
//               title="Organization"
//               description="Create as an organization"
//               available={
//                 roles?.includes('Manager') || 
//                 roles?.includes('Admin')
//               }
//             />
//           </div>
//         </div>
//       )}
      
//       {/* Action Buttons */}
//       {eligibility.canCreate && (
//         <div className="flex justify-center">
//           <button
//             onClick={handleStartCreation}
//             className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-xl font-bold text-lg flex items-center space-x-3"
//           >
//             <FaRocket className="text-xl" />
//             <span>Start Creating Election</span>
//             <FaArrowRight />
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// // Feature Item Component
// function FeatureItem({ enabled, text }) {
//   return (
//     <div className="flex items-center space-x-3 py-1">
//       {enabled ? (
//         <FaCheckCircle className="text-green-500 text-lg flex-shrink-0" />
//       ) : (
//         <FaTimesCircle className="text-gray-300 text-lg flex-shrink-0" />
//       )}
//       <span className={`text-sm ${enabled ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
//         {text}
//       </span>
//     </div>
//   );
// }

// // Creator Type Card Component
// function CreatorTypeCard({ selected, onClick, icon, title, description, available }) {
//   return (
//     <button
//       onClick={available ? onClick : null}
//       disabled={!available}
//       className={`p-6 rounded-xl border-2 transition-all transform ${
//         selected
//           ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
//           : available
//           ? 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:scale-102'
//           : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
//       }`}
//     >
//       <div className={`mb-3 ${selected ? 'text-blue-600' : available ? 'text-gray-600' : 'text-gray-400'}`}>
//         {icon}
//       </div>
//       <h4 className={`font-bold text-lg mb-2 ${selected ? 'text-blue-600' : 'text-gray-800'}`}>
//         {title}
//       </h4>
//       <p className="text-gray-600 text-sm">
//         {description}
//       </p>
//       {!available && (
//         <p className="text-red-500 text-xs mt-2 font-semibold">
//           Not available in your plan
//         </p>
//       )}
//     </button>
//   );
// }
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { toast } from 'react-toastify';
// import { checkEligibility } from '../../../redux/api/election/electionApi';
// import { 
//   setSubscriptionType,
//   setIsSubscribed,
//   setElectionCreationLimit,
//   setIsContentCreator,
//   setIsOrganization
// } from '../../../redux/slices/authSlice';
// import { 
//   FaCheckCircle, 
//   FaTimesCircle, 
//   FaInfoCircle,
//   FaUser,
//   FaUsers,
//   FaVideo,
//   FaArrowRight,
//   FaRocket,
//   FaCrown,
//   FaStar,
//   FaSpinner
// } from 'react-icons/fa';

// export default function CreateElection() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { roles } = useSelector((state) => state.auth);
  
//   const [loading, setLoading] = useState(true);
//   const [selectedCreatorType, setSelectedCreatorType] = useState('individual');
//   const [eligibility, setEligibility] = useState(null);
  
//   // Fetch real eligibility data from backend
//   useEffect(() => {
//     fetchEligibility();
//   }, []);
  
//   const fetchEligibility = async () => {
//     setLoading(true);
//     try {
//       const response = await checkEligibility();
      
//       // Extract data - handle both response.data and response.data.data
//       const eligibilityData = response.data || response;
      
//       console.log('✅ Eligibility loaded:', eligibilityData);
//       setEligibility(eligibilityData);
      
//       // 🆕 UPDATE REDUX STORE WITH REAL SUBSCRIPTION DATA
//       if (eligibilityData.subscriptionType && eligibilityData.subscriptionType !== 'Free') {
//         dispatch(setSubscriptionType(eligibilityData.subscriptionType));
//         dispatch(setIsSubscribed(true));
//       } else {
//         dispatch(setSubscriptionType('Free'));
//         dispatch(setIsSubscribed(false));
//       }
      
//       // Update election creation limit
//       if (eligibilityData.maxElections) {
//         const limit = eligibilityData.maxElections === 'Unlimited' 
//           ? 999999 
//           : parseInt(eligibilityData.maxElections);
//         dispatch(setElectionCreationLimit(limit));
//       }
      
//       // Update role flags based on actual subscription
//       if (eligibilityData.canCreatePaidElections) {
//         // User has paid subscription, update roles if needed
//         if (roles?.includes('ContentCreator') || roles?.includes('Content_Creator')) {
//           dispatch(setIsContentCreator(true));
//         }
//         if (roles?.includes('Manager') || roles?.includes('Admin')) {
//           dispatch(setIsOrganization(true));
//         }
//       }
      
//       console.log('✅ Redux updated with subscription data');
      
//     } catch (error) {
//       console.error('❌ Error fetching eligibility:', error);
//       toast.error('Failed to load eligibility data');
//       setEligibility(null);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const handleStartCreation = () => {
//     alert('Wizard will open here - ElectionWizard component needed');
//     // setShowWizard(true); // Uncomment when wizard is ready
//   };
  
//   const getSubscriptionIcon = (type) => {
//     const icons = {
//       'Free': '🆓',
//       'free': '🆓',
//       'Pay-as-You-Go': '💳',
//       'pay-as-you-go': '💳',
//       'Monthly': '📅',
//       'monthly': '📅',
//       '3-Month': '📆',
//       'quarterly': '📆',
//       '6-Month': '📆',
//       'semi-annual': '📆',
//       'Yearly': '🗓️',
//       'yearly': '🗓️',
//       'annual': '🗓️'
//     };
//     return icons[type] || '📋';
//   };
  
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <FaSpinner className="animate-spin text-5xl text-blue-600 mx-auto mb-4" />
//           <p className="text-gray-600 text-lg">Loading eligibility data...</p>
//         </div>
//       </div>
//     );
//   }
  
//   if (!eligibility) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <FaTimesCircle className="text-5xl text-red-600 mx-auto mb-4" />
//           <p className="text-gray-600 text-lg">Failed to load eligibility data</p>
//           <button
//             onClick={fetchEligibility}
//             className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }
  
//   return (
//     <div className="max-w-7xl mx-auto">
//       {/* Header */}
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">
//           Create New Election
//         </h1>
//         <p className="text-gray-600">
//           Check your plan details and start creating your election
//         </p>
//       </div>
      
//       {/* Eligibility Status Card */}
//       <div className={`rounded-xl shadow-lg p-6 mb-6 ${
//         eligibility.canCreate 
//           ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200'
//           : 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200'
//       }`}>
//         <div className="flex items-start space-x-4">
//           {eligibility.canCreate ? (
//             <FaCheckCircle className="text-green-600 text-3xl mt-1 flex-shrink-0" />
//           ) : (
//             <FaTimesCircle className="text-red-600 text-3xl mt-1 flex-shrink-0" />
//           )}
          
//           <div className="flex-1">
//             <h2 className="text-2xl font-bold text-gray-900 mb-2">
//               {eligibility.canCreate ? 'You can create elections! 🎉' : 'Election creation limit reached 😔'}
//             </h2>
//             <p className="text-gray-700 text-lg">
//               {eligibility.message}
//             </p>
//           </div>
//         </div>
//       </div>
      
//       {/* Current Plan Details */}
//       <div className="grid md:grid-cols-2 gap-6 mb-6">
//         {/* Plan Card */}
//         <div className="bg-white rounded-xl shadow-md p-6 border-2 border-blue-100">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
//               <FaCrown className="text-yellow-500" />
//               Your Plan
//             </h3>
//             <span className="text-3xl">
//               {getSubscriptionIcon(eligibility.subscriptionType)}
//             </span>
//           </div>
          
//           <div className="space-y-3">
//             <div className="flex justify-between items-center py-3 border-b border-gray-100">
//               <span className="text-gray-600 font-medium">Subscription</span>
//               <span className="font-bold text-lg text-blue-600 capitalize">
//                 {eligibility.planName || eligibility.subscriptionType || 'Free'}
//               </span>
//             </div>
            
//             {eligibility.amount && parseFloat(eligibility.amount) > 0 && (
//               <div className="flex justify-between items-center py-3 border-b border-gray-100">
//                 <span className="text-gray-600 font-medium">Amount Paid</span>
//                 <span className="font-bold text-green-600">
//                   ${eligibility.amount} {eligibility.currency || 'USD'}
//                 </span>
//               </div>
//             )}
            
//             <div className="flex justify-between items-center py-3 border-b border-gray-100">
//               <span className="text-gray-600 font-medium">Elections Created</span>
//               <span className="font-bold text-gray-900">
//                 {eligibility.currentElectionsCount} / {eligibility.maxElections === 'Unlimited' ? '∞' : eligibility.maxElections}
//               </span>
//             </div>
            
//             <div className="flex justify-between items-center py-3 border-b border-gray-100">
//               <span className="text-gray-600 font-medium">Remaining</span>
//               <span className="font-bold text-2xl text-green-600">
//                 {eligibility.remainingElections === 'Unlimited' ? '∞' : eligibility.remainingElections}
//               </span>
//             </div>
            
//             <div className="flex justify-between items-center py-3">
//               <span className="text-gray-600 font-medium">Processing Fee</span>
//               <span className="font-bold text-gray-900 text-lg">
//                 {eligibility.processingFeePercentage}%
//               </span>
//             </div>
//           </div>
          
//           {!eligibility.canCreate && (
//             <button
//               onClick={() => navigate('/dashboard/subscription')}
//               className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-md transform hover:scale-105"
//             >
//               Upgrade Plan Now
//             </button>
//           )}
//         </div>
        
//         {/* Features Card */}
//         <div className="bg-white rounded-xl shadow-md p-6 border-2 border-purple-100">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
//               <FaStar className="text-purple-500" />
//               Plan Features
//             </h3>
//             <FaInfoCircle className="text-purple-500 text-xl" />
//           </div>
          
//           <div className="space-y-2.5">
//             <FeatureItem enabled={true} text="Create Elections" />
//             <FeatureItem enabled={eligibility.canCreatePaidElections} text="Paid Elections (Regional Pricing)" />
//             <FeatureItem enabled={eligibility.subscriptionType !== 'Free' && eligibility.subscriptionType !== 'free'} text="Custom Branding & Logo" />
//             <FeatureItem enabled={eligibility.subscriptionType !== 'Free' && eligibility.subscriptionType !== 'free'} text="Unlimited Voters" />
//             <FeatureItem enabled={eligibility.subscriptionType !== 'Free' && eligibility.subscriptionType !== 'free'} text="Lottery Prizes" />
//             <FeatureItem enabled={eligibility.subscriptionType !== 'Free' && eligibility.subscriptionType !== 'free'} text="Advanced Analytics" />
//             <FeatureItem enabled={roles?.includes('ContentCreator') || roles?.includes('Content_Creator')} text="Content Creator Tools" />
//             <FeatureItem enabled={roles?.includes('Manager') || roles?.includes('Admin')} text="Organization Management" />
//           </div>
//         </div>
//       </div>
      
//       {/* Creator Type Selection */}
//       {eligibility.canCreate && (
//         <div className="bg-white rounded-xl shadow-md p-6 mb-6">
//           <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
//             <FaRocket className="text-orange-500" />
//             Who is creating this election?
//           </h3>
          
//           <div className="grid md:grid-cols-3 gap-4">
//             {/* Individual */}
//             <CreatorTypeCard
//               selected={selectedCreatorType === 'individual'}
//               onClick={() => setSelectedCreatorType('individual')}
//               icon={<FaUser className="text-4xl" />}
//               title="Individual"
//               description="Create as an individual creator"
//               available={true}
//             />
            
//             {/* Content Creator */}
//             <CreatorTypeCard
//               selected={selectedCreatorType === 'content_creator'}
//               onClick={() => setSelectedCreatorType('content_creator')}
//               icon={<FaVideo className="text-4xl" />}
//               title="Content Creator"
//               description="Create with content creator features"
//               available={
//                 roles?.includes('ContentCreator') || 
//                 roles?.includes('Content_Creator') ||
//                 roles?.includes('Admin')
//               }
//             />
            
//             {/* Organization */}
//             <CreatorTypeCard
//               selected={selectedCreatorType === 'organization'}
//               onClick={() => setSelectedCreatorType('organization')}
//               icon={<FaUsers className="text-4xl" />}
//               title="Organization"
//               description="Create as an organization"
//               available={
//                 roles?.includes('Manager') || 
//                 roles?.includes('Admin')
//               }
//             />
//           </div>
//         </div>
//       )}
      
//       {/* Action Buttons */}
//       {eligibility.canCreate && (
//         <div className="flex justify-center">
//           <button
//             onClick={handleStartCreation}
//             className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-xl font-bold text-lg flex items-center space-x-3"
//           >
//             <FaRocket className="text-xl" />
//             <span>Start Creating Election</span>
//             <FaArrowRight />
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// // Feature Item Component
// function FeatureItem({ enabled, text }) {
//   return (
//     <div className="flex items-center space-x-3 py-1">
//       {enabled ? (
//         <FaCheckCircle className="text-green-500 text-lg flex-shrink-0" />
//       ) : (
//         <FaTimesCircle className="text-gray-300 text-lg flex-shrink-0" />
//       )}
//       <span className={`text-sm ${enabled ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
//         {text}
//       </span>
//     </div>
//   );
// }

// // Creator Type Card Component
// function CreatorTypeCard({ selected, onClick, icon, title, description, available }) {
//   return (
//     <button
//       onClick={available ? onClick : null}
//       disabled={!available}
//       className={`p-6 rounded-xl border-2 transition-all transform ${
//         selected
//           ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
//           : available
//           ? 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:scale-102'
//           : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
//       }`}
//     >
//       <div className={`mb-3 ${selected ? 'text-blue-600' : available ? 'text-gray-600' : 'text-gray-400'}`}>
//         {icon}
//       </div>
//       <h4 className={`font-bold text-lg mb-2 ${selected ? 'text-blue-600' : 'text-gray-800'}`}>
//         {title}
//       </h4>
//       <p className="text-gray-600 text-sm">
//         {description}
//       </p>
//       {!available && (
//         <p className="text-red-500 text-xs mt-2 font-semibold">
//           Not available in your plan
//         </p>
//       )}
//     </button>
//   );
// }
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { 
//   FaCheckCircle, 
//   FaTimesCircle, 
//   FaInfoCircle,
//   FaUser,
//   FaUsers,
//   FaVideo,
//   FaArrowRight,
//   FaRocket,
//   FaCrown,
//   FaStar
// } from 'react-icons/fa';
// import ElectionWizard from './ElectionWizard/ElectionWizard';
// import { checkEligibility } from '../../../redux/api/election/electionApi';

// export default function CreateElection() {
//   const navigate = useNavigate();
//   const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  
//   const [loading, setLoading] = useState(true);
//   const [showWizard, setShowWizard] = useState(false);
//   const [selectedCreatorType, setSelectedCreatorType] = useState('individual');
//   const [eligibility, setEligibility] = useState({
//     canCreate: false,
//     subscriptionType: 'Free',
//     currentElectionsCount: 0,
//     maxElections: 5,
//     remainingElections: 5,
//     canCreatePaidElections: false,
//     processingFeePercentage: 0,
//     message: ''
//   });
  
//   useEffect(() => {
//     fetchEligibility();
//   }, []);
  
//   const fetchEligibility = async () => {
//     try {
//       setLoading(true);
//       const response = await checkEligibility();
      
//       if (response.success) {
//         setEligibility(response.data);
//       }
//     } catch (error) {
//       console.error('Eligibility check failed:', error);
//       toast.error(error.response?.data?.message || 'Failed to check eligibility');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const handleStartCreation = () => {
//     if (!eligibility.canCreate) {
//       toast.error('You cannot create elections with your current plan');
//       return;
//     }
    
//     setShowWizard(true);
//   };
  
//   const getSubscriptionIcon = (type) => {
//     const icons = {
//       'Free': '🆓',
//       'Pay-as-You-Go': '💳',
//       'Monthly': '📅',
//       '6-Month': '📆',
//       'Yearly': '🗓️'
//     };
//     return icons[type] || '📋';
//   };
  
//   // If wizard is active, show only wizard
//   if (showWizard) {
//     return (
//       <ElectionWizard 
//         creatorType={selectedCreatorType}
//         onClose={() => setShowWizard(false)}
//       />
//     );
//   }
  
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Checking your eligibility...</p>
//         </div>
//       </div>
//     );
//   }
  
//   return (
//     <div className="max-w-7xl mx-auto">
//       {/* Header */}
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">
//           Create New Election
//         </h1>
//         <p className="text-gray-600">
//           Check your plan details and start creating your election
//         </p>
//       </div>
      
//       {/* Eligibility Status Card */}
//       <div className={`rounded-xl shadow-lg p-6 mb-6 ${
//         eligibility.canCreate 
//           ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200'
//           : 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200'
//       }`}>
//         <div className="flex items-start space-x-4">
//           {eligibility.canCreate ? (
//             <FaCheckCircle className="text-green-600 text-3xl mt-1 flex-shrink-0" />
//           ) : (
//             <FaTimesCircle className="text-red-600 text-3xl mt-1 flex-shrink-0" />
//           )}
          
//           <div className="flex-1">
//             <h2 className="text-2xl font-bold text-gray-900 mb-2">
//               {eligibility.canCreate ? 'You can create elections! 🎉' : 'Election creation limit reached 😔'}
//             </h2>
//             <p className="text-gray-700 text-lg">
//               {eligibility.message}
//             </p>
//           </div>
//         </div>
//       </div>
      
//       {/* Current Plan Details */}
//       <div className="grid md:grid-cols-2 gap-6 mb-6">
//         {/* Plan Card */}
//         <div className="bg-white rounded-xl shadow-md p-6 border-2 border-blue-100">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
//               <FaCrown className="text-yellow-500" />
//               Your Plan
//             </h3>
//             <span className="text-3xl">
//               {getSubscriptionIcon(eligibility.subscriptionType)}
//             </span>
//           </div>
          
//           <div className="space-y-3">
//             <div className="flex justify-between items-center py-3 border-b border-gray-100">
//               <span className="text-gray-600 font-medium">Subscription</span>
//               <span className="font-bold text-lg text-blue-600">
//                 {eligibility.subscriptionType || 'Free'}
//               </span>
//             </div>
            
//             <div className="flex justify-between items-center py-3 border-b border-gray-100">
//               <span className="text-gray-600 font-medium">Elections Created</span>
//               <span className="font-bold text-gray-900">
//                 {eligibility.currentElectionsCount} / {eligibility.maxElections === 'Unlimited' ? '∞' : eligibility.maxElections}
//               </span>
//             </div>
            
//             <div className="flex justify-between items-center py-3 border-b border-gray-100">
//               <span className="text-gray-600 font-medium">Remaining</span>
//               <span className="font-bold text-2xl text-green-600">
//                 {eligibility.remainingElections === 'Unlimited' ? '∞' : eligibility.remainingElections}
//               </span>
//             </div>
            
//             <div className="flex justify-between items-center py-3">
//               <span className="text-gray-600 font-medium">Processing Fee</span>
//               <span className="font-bold text-gray-900 text-lg">
//                 {eligibility.processingFeePercentage}%
//               </span>
//             </div>
//           </div>
          
//           {!eligibility.canCreate && (
//             <button
//               onClick={() => navigate('/dashboard')} // Navigate to subscription tab
//               className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-md transform hover:scale-105"
//             >
//               Upgrade Plan Now
//             </button>
//           )}
//         </div>
        
//         {/* Features Card */}
//         <div className="bg-white rounded-xl shadow-md p-6 border-2 border-purple-100">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
//               <FaStar className="text-purple-500" />
//               Plan Features
//             </h3>
//             <FaInfoCircle className="text-purple-500 text-xl" />
//           </div>
          
//           <div className="space-y-2.5">
//             <FeatureItem 
//               enabled={true}
//               text="Create Elections"
//             />
//             <FeatureItem 
//               enabled={eligibility.canCreatePaidElections}
//               text="Paid Elections (Regional Pricing)"
//             />
//             <FeatureItem 
//               enabled={eligibility.subscriptionType !== 'Free'}
//               text="Custom Branding & Logo"
//             />
//             <FeatureItem 
//               enabled={eligibility.subscriptionType !== 'Free'}
//               text="Unlimited Voters"
//             />
//             <FeatureItem 
//               enabled={eligibility.subscriptionType !== 'Free'}
//               text="Lottery Prizes"
//             />
//             <FeatureItem 
//               enabled={eligibility.subscriptionType !== 'Free'}
//               text="Advanced Analytics"
//             />
//             <FeatureItem 
//               enabled={userData.roles?.includes('ContentCreator')}
//               text="Content Creator Tools"
//             />
//             <FeatureItem 
//               enabled={userData.roles?.includes('Manager') || userData.roles?.includes('Admin')}
//               text="Organization Management"
//             />
//           </div>
//         </div>
//       </div>
      
//       {/* Creator Type Selection */}
//       {eligibility.canCreate && (
//         <div className="bg-white rounded-xl shadow-md p-6 mb-6">
//           <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
//             <FaRocket className="text-orange-500" />
//             Who is creating this election?
//           </h3>
          
//           <div className="grid md:grid-cols-3 gap-4">
//             {/* Individual */}
//             <CreatorTypeCard
//               selected={selectedCreatorType === 'individual'}
//               onClick={() => setSelectedCreatorType('individual')}
//               icon={<FaUser className="text-4xl" />}
//               title="Individual"
//               description="Create as an individual creator"
//               available={true}
//             />
            
//             {/* Content Creator */}
//             <CreatorTypeCard
//               selected={selectedCreatorType === 'content_creator'}
//               onClick={() => setSelectedCreatorType('content_creator')}
//               icon={<FaVideo className="text-4xl" />}
//               title="Content Creator"
//               description="Create with content creator features"
//               available={
//                 userData.roles?.includes('ContentCreator') || 
//                 userData.roles?.includes('Content_Creator') ||
//                 userData.roles?.includes('Admin')
//               }
//             />
            
//             {/* Organization */}
//             <CreatorTypeCard
//               selected={selectedCreatorType === 'organization'}
//               onClick={() => setSelectedCreatorType('organization')}
//               icon={<FaUsers className="text-4xl" />}
//               title="Organization"
//               description="Create as an organization"
//               available={
//                 userData.roles?.includes('Manager') || 
//                 userData.roles?.includes('Admin')
//               }
//             />
//           </div>
//         </div>
//       )}
      
//       {/* Action Buttons */}
//       {eligibility.canCreate && (
//         <div className="flex justify-center">
//           <button
//             onClick={handleStartCreation}
//             className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-xl font-bold text-lg flex items-center space-x-3"
//           >
//             <FaRocket className="text-xl" />
//             <span>Start Creating Election</span>
//             <FaArrowRight />
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// // Feature Item Component
// function FeatureItem({ enabled, text }) {
//   return (
//     <div className="flex items-center space-x-3 py-1">
//       {enabled ? (
//         <FaCheckCircle className="text-green-500 text-lg flex-shrink-0" />
//       ) : (
//         <FaTimesCircle className="text-gray-300 text-lg flex-shrink-0" />
//       )}
//       <span className={`text-sm ${enabled ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
//         {text}
//       </span>
//     </div>
//   );
// }

// // Creator Type Card Component
// function CreatorTypeCard({ selected, onClick, icon, title, description, available }) {
//   return (
//     <button
//       onClick={available ? onClick : null}
//       disabled={!available}
//       className={`p-6 rounded-xl border-2 transition-all transform ${
//         selected
//           ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
//           : available
//           ? 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:scale-102'
//           : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
//       }`}
//     >
//       <div className={`mb-3 ${selected ? 'text-blue-600' : available ? 'text-gray-600' : 'text-gray-400'}`}>
//         {icon}
//       </div>
//       <h4 className={`font-bold text-lg mb-2 ${selected ? 'text-blue-600' : 'text-gray-800'}`}>
//         {title}
//       </h4>
//       <p className="text-gray-600 text-sm">
//         {description}
//       </p>
//       {!available && (
//         <p className="text-red-500 text-xs mt-2 font-semibold">
//           Not available in your plan
//         </p>
//       )}
//     </button>
//   );
// }