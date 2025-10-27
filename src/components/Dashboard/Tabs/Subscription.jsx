import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { useGetAllPlansQuery, useGetUserCurrentSubscriptionQuery } from '../../../redux/api/subscription/subscriptionApi';
import { setPlans, setUserSubscription, setCheckoutStep } from '../../../redux/slices/subscriptionSlice';
import SubscriptionInfo from './subscription/SubscriptionInfo';
import SubscriptionPlans from './subscription/SubscriptionPlans';
import SubscriptionCheckout from './subscription/SubscriptionCheckout';
import SubscriptionSuccess from './subscription/SubscriptionSuccess';
import SubscriptionHistory from './subscription/SubscriptionHistory';
import { Loader } from 'lucide-react';

export default function Subscription() {
  const dispatch = useAppDispatch();
  const checkoutStep = useAppSelector((state) => state.subscription.checkoutStep);
  const subscription = useAppSelector((state) => state.auth.currentSubscription);
  const subscriptionStatus = useAppSelector((state) => state.auth.subscriptionStatus);

  // Fetch plans
  const { data: plansData, isLoading: plansLoading } = useGetAllPlansQuery();
  
  // Fetch user's current subscription
  const { data: subData, isLoading: subLoading } = useGetUserCurrentSubscriptionQuery();

  // ✅ FIX: Reset checkoutStep when component mounts
  useEffect(() => {
    console.log('🔄 Resetting checkoutStep to show all components');
    dispatch(setCheckoutStep(null));
  }, [dispatch]);

  useEffect(() => {
    if (plansData?.plans) {
      dispatch(setPlans(plansData.plans));
    }
  }, [plansData, dispatch]);

  useEffect(() => {
    if (subData?.subscription) {
      dispatch(setUserSubscription(subData.subscription));
    }
  }, [subData, dispatch]);

  const loading = plansLoading || subLoading;

  // Step 2: Show Gateway Selection & Payment
  if (checkoutStep === 'gateway-selection' || checkoutStep === 'payment') {
    return <SubscriptionCheckout />;
  }

  // Step 3: Show Success
  if (checkoutStep === 'confirmation') {
    return <SubscriptionSuccess />;
  }

  // Default: Show Subscription Info + Plans + History
  // (Removed the 'plan-selection' check so it always shows all components)
  return (
    <div className="space-y-8">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin text-blue-600" size={40} />
        </div>
      ) : (
        <>
          {/* Current Subscription Info */}
          <SubscriptionInfo />
          
          {/* Available Plans */}
          <SubscriptionPlans 
            loading={false}
            subscription={subscription}
            subscriptionStatus={subscriptionStatus}
          />
          
          {/* Payment History */}
          <SubscriptionHistory />
        </>
      )}
    </div>
  );
}
// import React, { useEffect } from 'react';
// import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
// import { useGetAllPlansQuery, useGetUserCurrentSubscriptionQuery } from '../../../redux/api/subscription/subscriptionApi';
// import { setPlans, setUserSubscription } from '../../../redux/slices/subscriptionSlice';
// import SubscriptionInfo from './subscription/SubscriptionInfo';
// import SubscriptionPlans from './subscription/SubscriptionPlans';
// import SubscriptionCheckout from './subscription/SubscriptionCheckout';
// import SubscriptionSuccess from './subscription/SubscriptionSuccess';
// import SubscriptionHistory from './subscription/SubscriptionHistory';
// import { Loader } from 'lucide-react';

// export default function Subscription() {
//   console.log('🚀 Subscription component mounted/rendered');
  
//   const dispatch = useAppDispatch();
//   const checkoutStep = useAppSelector((state) => state.subscription.checkoutStep);
//   const subscription = useAppSelector((state) => state.auth.currentSubscription);
//   const subscriptionStatus = useAppSelector((state) => state.auth.subscriptionStatus);

//   // Fetch plans
//   const { data: plansData, isLoading: plansLoading } = useGetAllPlansQuery();
  
//   // Fetch user's current subscription
//   const { data: subData, isLoading: subLoading } = useGetUserCurrentSubscriptionQuery();

//   useEffect(() => {
//     if (plansData?.plans) {
//       console.log('✅ Plans data received, dispatching to Redux:', plansData.plans.length, 'plans');
//       dispatch(setPlans(plansData.plans));
//     }
//   }, [plansData, dispatch]);

//   useEffect(() => {
//     if (subData?.subscription) {
//       console.log('✅ Subscription data received, dispatching to Redux:', subData.subscription);
//       dispatch(setUserSubscription(subData.subscription));
//     }
//   }, [subData, dispatch]);

//   const loading = plansLoading || subLoading;

//   // ✅ COMPREHENSIVE DEBUG LOGGING
//   console.log('🔍 SUBSCRIPTION COMPONENT STATE:', {
//     checkoutStep,
//     loading,
//     plansLoading,
//     subLoading,
//     hasPlansData: !!plansData,
//     hasSubData: !!subData,
//     subscription,
//     subscriptionStatus
//   });

//   // Step 1: Show Plans
//   if (checkoutStep === 'plan-selection') {
//     console.log('📍 ROUTE: Showing plan-selection view (SubscriptionPlans only)');
//     return (
//       <SubscriptionPlans 
//         loading={loading}
//         subscription={subscription}
//         subscriptionStatus={subscriptionStatus}
//       />
//     );
//   }

//   // Step 2: Show Gateway Selection & Payment
//   if (checkoutStep === 'gateway-selection' || checkoutStep === 'payment') {
//     console.log('📍 ROUTE: Showing checkout view (SubscriptionCheckout)');
//     return <SubscriptionCheckout />;
//   }

//   // Step 3: Show Success
//   if (checkoutStep === 'confirmation') {
//     console.log('📍 ROUTE: Showing confirmation view (SubscriptionSuccess)');
//     return <SubscriptionSuccess />;
//   }

//   // Default: Show Subscription Info + Plans + History
//   console.log('📍 ROUTE: Showing DEFAULT view (Info + Plans + History)');
  
//   return (
//     <div className="space-y-8">
//       {loading ? (
//         <>
//           {console.log('⏳ LOADING STATE: Showing loader...')}
//           <div className="flex items-center justify-center py-12">
//             <Loader className="animate-spin text-blue-600" size={40} />
//             <span className="ml-3 text-gray-600">Loading subscription details...</span>
//           </div>
//         </>
//       ) : (
//         <>
//           {console.log('✅ RENDERING: All three components (Info + Plans + History)')}
          
//           {/* Debug: Visible marker */}
//           <div className="bg-yellow-100 border-2 border-yellow-500 p-4 rounded">
//             <p className="text-yellow-900 font-bold">🔍 DEBUG: If you see this, the component is rendering!</p>
//             <p className="text-sm text-yellow-800 mt-2">
//               checkoutStep: <strong>{checkoutStep || 'null'}</strong> | 
//               loading: <strong>{loading ? 'true' : 'false'}</strong>
//             </p>
//           </div>
          
//           {/* Current Subscription Info */}
//           {console.log('1️⃣ Rendering SubscriptionInfo component')}
//           <SubscriptionInfo />
          
//           {/* Available Plans */}
//           {console.log('2️⃣ Rendering SubscriptionPlans component')}
//           <SubscriptionPlans 
//             loading={false}
//             subscription={subscription}
//             subscriptionStatus={subscriptionStatus}
//           />
          
//           {/* Payment History */}
//           {console.log('3️⃣ Rendering SubscriptionHistory component')}
//           <SubscriptionHistory />
//         </>
//       )}
//     </div>
//   );
// }

// // import React, { useEffect } from 'react';
// // import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
// // import { useGetAllPlansQuery, useGetUserCurrentSubscriptionQuery } from '../../../redux/api/subscription/subscriptionApi';
// // import { setPlans, setUserSubscription } from '../../../redux/slices/subscriptionSlice';
// // import SubscriptionInfo from './subscription/SubscriptionInfo';
// // import SubscriptionPlans from './subscription/SubscriptionPlans';
// // import SubscriptionCheckout from './subscription/SubscriptionCheckout';
// // import SubscriptionSuccess from './subscription/SubscriptionSuccess';
// // import SubscriptionHistory from './subscription/SubscriptionHistory';
// // import { Loader } from 'lucide-react';

// // export default function Subscription() {
// //   const dispatch = useAppDispatch();
// //   const checkoutStep = useAppSelector((state) => state.subscription.checkoutStep);
// //   const subscription = useAppSelector((state) => state.auth.currentSubscription);
// //   const subscriptionStatus = useAppSelector((state) => state.auth.subscriptionStatus);

// //   // Fetch plans
// //   const { data: plansData, isLoading: plansLoading } = useGetAllPlansQuery();
  
// //   // Fetch user's current subscription
// //   const { data: subData, isLoading: subLoading } = useGetUserCurrentSubscriptionQuery();

// //   useEffect(() => {
// //     if (plansData?.plans) {
// //       dispatch(setPlans(plansData.plans));
// //     }
// //   }, [plansData, dispatch]);

// //   useEffect(() => {
// //     if (subData?.subscription) {
// //       dispatch(setUserSubscription(subData.subscription));
// //     }
// //   }, [subData, dispatch]);

// //   const loading = plansLoading || subLoading;

// //   // Step 1: Show Plans
// //   if (checkoutStep === 'plan-selection') {
// //     return (
// //       <SubscriptionPlans 
// //         loading={loading}
// //         subscription={subscription}
// //         subscriptionStatus={subscriptionStatus}
// //       />
// //     );
// //   }

// //   // Step 2: Show Gateway Selection & Payment
// //   if (checkoutStep === 'gateway-selection' || checkoutStep === 'payment') {
// //     return <SubscriptionCheckout />;
// //   }

// //   // Step 3: Show Success
// //   if (checkoutStep === 'confirmation') {
// //     return <SubscriptionSuccess />;
// //   }

// //   // Default: Show Subscription Info + Plans + History
// //   return (
// //     <div className="space-y-8">
// //       {loading ? (
// //         <div className="flex items-center justify-center py-12">
// //           <Loader className="animate-spin text-blue-600" size={40} />
// //         </div>
// //       ) : (
// //         <>
// //           {/* Current Subscription Info */}
// //           <SubscriptionInfo />
          
// //           {/* Available Plans */}
// //           <SubscriptionPlans 
// //             loading={false}
// //             subscription={subscription}
// //             subscriptionStatus={subscriptionStatus}
// //           />
          
// //           {/* Payment History */}
// //           <SubscriptionHistory />
// //         </>
// //       )}
// //     </div>
// //   );
// // }

// // import React, { useEffect } from 'react';
// // import { useDispatch } from '../../../redux/hooks';
// // import { useAuth } from '../../../redux/hooks';
// // import { useSubscription } from '../../../redux/hooks';
// // import { useGetAllPlansQuery, useGetUserCurrentSubscriptionQuery } from '../../../redux/api/subscription/subscriptionApi';
// // import { setPlans, setUserSubscription } from '../../../redux/slices/subscriptionSlice';
// // import SubscriptionPlans from './subscription/SubscriptionPlans';
// // import SubscriptionCheckout from './subscription/SubscriptionCheckout';
// // import SubscriptionSuccess from './subscription/SubscriptionSuccess';
// // import SubscriptionHistory from './subscription/SubscriptionHistory';
// // import { Loader } from 'lucide-react';

// // export default function Subscription() {
// //   const dispatch = useDispatch();
// //   /*eslint-disable*/
// //   const auth = useAuth();
// //   const subscription = useSubscription();
// //   const checkoutStep = subscription.checkoutStep;

// //   // Fetch plans
// //   const { data: plansData, isLoading: plansLoading } = useGetAllPlansQuery();
  
// //   // Fetch user's current subscription
// //   const { data: subData, isLoading: subLoading } = useGetUserCurrentSubscriptionQuery();

// //   useEffect(() => {
// //     if (plansData?.plans) {
// //       dispatch(setPlans(plansData.plans));
// //     }
// //   }, [plansData, dispatch]);

// //   useEffect(() => {
// //     if (subData?.subscription) {
// //       dispatch(setUserSubscription(subData.subscription));
// //     }
// //   }, [subData, dispatch]);

// //   const loading = plansLoading || subLoading;

// //   // Step 1: Show Plans
// //   if (checkoutStep === 'plan-selection') {
// //     return <SubscriptionPlans loading={loading} />;
// //   }

// //   // Step 2: Show Gateway Selection & Payment
// //   if (checkoutStep === 'gateway-selection' || checkoutStep === 'payment') {
// //     return <SubscriptionCheckout />;
// //   }

// //   // Step 3: Show Success
// //   if (checkoutStep === 'confirmation') {
// //     return <SubscriptionSuccess />;
// //   }

// //   // Default: Show Plans + History
// //   return (
// //     <div className="space-y-8">
// //       {loading ? (
// //         <div className="flex items-center justify-center py-12">
// //           <Loader className="animate-spin text-blue-600" size={40} />
// //         </div>
// //       ) : (
// //         <>
// //           <SubscriptionPlans loading={false} />
// //           <SubscriptionHistory />
          
// //         </>
// //       )}
// //     </div>
// //   );
// // }