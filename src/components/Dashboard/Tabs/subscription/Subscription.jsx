import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { useGetAllPlansQuery, useGetUserCurrentSubscriptionQuery } from '../../../redux/api/subscription/subscriptionApi';
import { setPlans, setUserSubscription } from '../../../redux/slices/subscriptionSlice';
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

  // Step 1: Show Plans
  if (checkoutStep === 'plan-selection') {
    return (
      <SubscriptionPlans 
        loading={loading}
        subscription={subscription}
        subscriptionStatus={subscriptionStatus}
      />
    );
  }

  // Step 2: Show Gateway Selection & Payment
  if (checkoutStep === 'gateway-selection' || checkoutStep === 'payment') {
    return <SubscriptionCheckout />;
  }

  // Step 3: Show Success
  if (checkoutStep === 'confirmation') {
    return <SubscriptionSuccess />;
  }

  // Default: Show Plans + History
  return (
    <div className="space-y-8">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin text-blue-600" size={40} />
        </div>
      ) : (
        <>
          <SubscriptionPlans 
            loading={false}
            subscription={subscription}
            subscriptionStatus={subscriptionStatus}
          />
          <SubscriptionHistory />
        </>
      )}
    </div>
  );
}
// import React, { useEffect } from 'react';
// //import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
// import { useGetAllPlansQuery, useGetUserCurrentSubscriptionQuery } from '../../../redux/api/subscription/subscriptionApi';
// import { setPlans, setUserSubscription } from '../../../redux/slices/subscriptionSlice';
// import SubscriptionPlans from './subscription/SubscriptionPlans';
// import SubscriptionCheckout from './subscription/SubscriptionCheckout';
// import SubscriptionSuccess from './subscription/SubscriptionSuccess';
// import SubscriptionHistory from './subscription/SubscriptionHistory';
// import { Loader } from 'lucide-react';
// import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';

// export default function Subscription() {
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
//       dispatch(setPlans(plansData.plans));
//     }
//   }, [plansData, dispatch]);

//   useEffect(() => {
//     if (subData?.subscription) {
//       dispatch(setUserSubscription(subData.subscription));
//     }
//   }, [subData, dispatch]);

//   const loading = plansLoading || subLoading;

//   // Step 1: Show Plans
//   if (checkoutStep === 'plan-selection') {
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
//     return <SubscriptionCheckout />;
//   }

//   // Step 3: Show Success
//   if (checkoutStep === 'confirmation') {
//     return <SubscriptionSuccess />;
//   }

//   // Default: Show Plans + History
//   return (
//     <div className="space-y-8">
//       {loading ? (
//         <div className="flex items-center justify-center py-12">
//           <Loader className="animate-spin text-blue-600" size={40} />
//         </div>
//       ) : (
//         <>
//           <SubscriptionPlans 
//             loading={false}
//             subscription={subscription}
//             subscriptionStatus={subscriptionStatus}
//           />
//           <SubscriptionHistory />
//         </>
//       )}
//     </div>
//   );
// }