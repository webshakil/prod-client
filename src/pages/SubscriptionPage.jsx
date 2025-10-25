// pages/SubscriptionPage.js

import React from 'react';
import { useSelector } from 'react-redux';
import { useGetSubscriptionPlansQuery, useGetUserSubscriptionQuery } from '../redux/api/subscription/subscriptionApi';
import { useAuth } from '../redux/hooks';
import SubscriptionPlans from '../components/subscription/SubscriptionPlans';
import CurrentSubscription from '../components/subscription/CurrentSubscription';
import PaymentHistory from '../components/subscription/PaymentHistory';

export default function SubscriptionPage() {
  const auth = useAuth();
  const subscription = useSelector((state) => state.subscription);

  // Fetch subscription plans
  const { 
    data: plansData, 
    isLoading: plansLoading, 
    error: plansError,
    refetch: refetchPlans 
  } = useGetSubscriptionPlansQuery();

  // Fetch user subscription (only if authenticated)
  const { 
    data: userSubData, 
    isLoading: userSubLoading, 
    /*eslint-disable*/
    error: userSubError,
    refetch: refetchUserSub 
  } = useGetUserSubscriptionQuery(
    undefined,
    { skip: !auth.isAuthenticated }
  );

  const plans = plansData?.data || [];
  const userSubscription = userSubData?.data || null;

  return (
    <div className="subscription-page bg-gray-50 min-h-screen">
      <div className="subscription-container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="subscription-header mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Subscription Plans</h1>
          <p className="text-lg text-gray-600">Choose the perfect plan for your needs</p>
        </header>

        {/* Current Subscription Section */}
        {userSubscription && !userSubLoading && (
          <section className="current-subscription-section mb-12">
            <CurrentSubscription subscription={userSubscription} />
          </section>
        )}

        {/* Subscription Plans Section */}
        <section className="plans-section mb-12">
          <h2 className="text-2xl font-bold mb-6">Available Plans</h2>
          
          {plansLoading ? (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
              <p className="mt-4 text-gray-600">Loading subscription plans...</p>
            </div>
          ) : plansError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-red-800 font-semibold mb-2">Error Loading Plans</h3>
              <p className="text-red-700">
                {plansError?.data?.message || plansError?.message || 'Failed to load subscription plans'}
              </p>
              <button
                onClick={() => refetchPlans()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          ) : plans.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800">No subscription plans available.</p>
            </div>
          ) : (
            <SubscriptionPlans plans={plans} currentSubscription={userSubscription} />
          )}
        </section>

        {/* Payment History Section */}
        {auth.isAuthenticated && (
          <section className="payment-history-section mb-12">
            <h2 className="text-2xl font-bold mb-6">Payment History</h2>
            <PaymentHistory />
          </section>
        )}

        {/* Success Message */}
        {subscription?.successMessage && (
          <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm">
            <p className="text-green-800 font-medium">{subscription.successMessage}</p>
            <button
              onClick={() => {
                // Dispatch action to clear message
                /*eslint-disable*/
                const { clearSuccessMessage } = require('../redux/slices/subscriptionSlice');
                // Or just let it auto-clear after 5 seconds
              }}
              className="text-green-600 text-sm mt-2 hover:text-green-700"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error Message */}
        {subscription?.error && (
          <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-sm">
            <p className="text-red-800 font-medium">{subscription.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
// // pages/SubscriptionPage.js

// import React from 'react';
// import { useSelector } from 'react-redux';
// import { useGetSubscriptionPlansQuery, useGetUserSubscriptionQuery } from '../redux/api/subscription/subscriptionApi';
// import { useAuth } from '../redux/hooks';
// import SubscriptionPlans from '../components/subscription/SubscriptionPlans';
// import CurrentSubscription from '../components/subscription/CurrentSubscription';
// import PaymentHistory from '../components/subscription/PaymentHistory';

// export default function SubscriptionPage() {
//   const auth = useAuth();
//   const subscription = useSelector((state) => state.subscription);

//   // Fetch subscription plans
//   const { data: plansData, isLoading: plansLoading, error: plansError } = useGetSubscriptionPlansQuery();
  
//   // Fetch user subscription (only if authenticated)
//   /*eslint-disable*/
//   const { data: userSubData, isLoading: userSubLoading, error: userSubError } = useGetUserSubscriptionQuery(
//     undefined,
//     { skip: !auth.isAuthenticated } // Skip query if not authenticated
//   );

//   const plans = plansData?.data || [];
//   const userSubscription = userSubData?.data || null;

//   return (
//     <div className="subscription-page">
//       <div className="subscription-container">
//         <header className="subscription-header">
//           <h1>Subscription Plans</h1>
//           <p>Choose the perfect plan for your needs</p>
//         </header>

//         {/* Current Subscription Section */}
//         {userSubscription && (
//           <section className="current-subscription-section">
//             <CurrentSubscription subscription={userSubscription} />
//           </section>
//         )}

//         {/* Subscription Plans Section */}
//         <section className="plans-section">
//           {plansLoading ? (
//             <div className="loading">Loading plans...</div>
//           ) : plansError ? (
//             <div className="error">Error loading plans: {plansError.message}</div>
//           ) : (
//             <SubscriptionPlans plans={plans} currentSubscription={userSubscription} />
//           )}
//         </section>

//         {/* Payment History Section */}
//         {auth.isAuthenticated && (
//           <section className="payment-history-section">
//             <PaymentHistory />
//           </section>
//         )}

//         {/* Success Message */}
//         {subscription.successMessage && (
//           <div className="success-notification">
//             {subscription.successMessage}
//           </div>
//         )}

//         {/* Error Message */}
//         {subscription.error && (
//           <div className="error-notification">
//             {subscription.error}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
// // pages/SubscriptionPage.js

// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchSubscriptionPlans, fetchUserSubscription } from '../redux/api/subscription/subscriptionApi';
// import { useAuth } from '../redux/hooks';
// import SubscriptionPlans from '../components/subscription/SubscriptionPlans';
// import CurrentSubscription from '../components/subscription/CurrentSubscription';
// import PaymentHistory from '../components/subscription/PaymentHistory';


// export default function SubscriptionPage() {
//   const dispatch = useDispatch();
//   const auth = useAuth();
//   const subscription = useSelector((state) => state.subscription);

//   useEffect(() => {
//     // Fetch subscription plans and user subscription on mount
//     dispatch(fetchSubscriptionPlans());
//     if (auth.userId) {
//       dispatch(fetchUserSubscription(auth.userId));
//     }
//   }, [dispatch, auth.userId]);

//   return (
//     <div className="subscription-page">
//       <div className="subscription-container">
//         <header className="subscription-header">
//           <h1>Subscription Plans</h1>
//           <p>Choose the perfect plan for your needs</p>
//         </header>

//         {/* Current Subscription Section */}
//         {subscription.userSubscription && (
//           <section className="current-subscription-section">
//             <CurrentSubscription subscription={subscription.userSubscription} />
//           </section>
//         )}

//         {/* Subscription Plans Section */}
//         <section className="plans-section">
//           {subscription.plansLoading ? (
//             <div className="loading">Loading plans...</div>
//           ) : subscription.plansError ? (
//             <div className="error">Error loading plans: {subscription.plansError}</div>
//           ) : (
//             <SubscriptionPlans plans={subscription.plans} currentSubscription={subscription.userSubscription} />
//           )}
//         </section>

//         {/* Payment History Section */}
//         {auth.isAuthenticated && (
//           <section className="payment-history-section">
//             <PaymentHistory />
//           </section>
//         )}

//         {/* Success Message */}
//         {subscription.successMessage && (
//           <div className="success-notification">
//             {subscription.successMessage}
//           </div>
//         )}

//         {/* Error Message */}
//         {subscription.error && (
//           <div className="error-notification">
//             {subscription.error}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }