import React, { useEffect } from 'react';
import { useAppDispatch } from '../../../../redux/hooks'; // ✅ Changed
import { useGetUserCurrentSubscriptionQuery } from '../../../../redux/api/subscription/subscriptionApi';
/*eslint-disable*/
import { setCurrentSubscription } from '../../../../redux/slices/authSlice';
import { clearCheckout } from '../../../../redux/slices/subscriptionSlice';
import { CheckCircle } from 'lucide-react';

const SubscriptionSuccess = () => {
  const dispatch = useAppDispatch(); // ✅ Changed
  const { refetch: refetchSubscription } = useGetUserCurrentSubscriptionQuery();

  useEffect(() => {
    // Refetch subscription to confirm purchase
    const timer = setTimeout(() => {
      refetchSubscription();
      dispatch(clearCheckout());
    }, 2000);

    return () => clearTimeout(timer);
  }, [refetchSubscription, dispatch]);

  return (
    <div className="flex items-center justify-center py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 rounded-full p-3">
            <CheckCircle className="text-green-600" size={48} />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>

        <p className="text-gray-600 mb-6">
          Your subscription has been activated. Thank you for your purchase.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
          >
            Go to Dashboard
          </button>

          <button
            onClick={() => window.location.href = '/dashboard?tab=subscription'}
            className="w-full text-blue-600 hover:text-blue-700 font-semibold py-3 border border-blue-200 rounded-lg transition-colors duration-200"
          >
            View Subscription Details
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Redirecting in a few seconds...
        </p>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
// import React, { useEffect } from 'react';
// import { useAppDispatch } from '../../../../redux/hooks';
// import { useGetUserCurrentSubscriptionQuery } from '../../../../redux/api/subscription/subscriptionApi';
// /*eslint-disable*/
// import { setCurrentSubscription } from '../../../../redux/slices/authSlice';
// import { clearCheckout } from '../../../../redux/slices/subscriptionSlice';
// import { CheckCircle } from 'lucide-react';

// const SubscriptionSuccess = () => {
//   const dispatch = useAppDispatch();
//   const { refetch: refetchSubscription } = useGetUserCurrentSubscriptionQuery();

//   useEffect(() => {
//     // Refetch subscription to confirm purchase
//     const timer = setTimeout(() => {
//       refetchSubscription();
//       dispatch(clearCheckout());
//     }, 2000);

//     return () => clearTimeout(timer);
//   }, [refetchSubscription, dispatch]);

//   return (
//     <div className="flex items-center justify-center py-12">
//       <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
//         <div className="flex justify-center mb-4">
//           <div className="bg-green-100 rounded-full p-3">
//             <CheckCircle className="text-green-600" size={48} />
//           </div>
//         </div>

//         <h1 className="text-2xl font-bold text-gray-900 mb-2">
//           Payment Successful!
//         </h1>

//         <p className="text-gray-600 mb-6">
//           Your subscription has been activated. Thank you for your purchase.
//         </p>

//         <div className="space-y-3">
//           <button
//             onClick={() => window.location.href = '/dashboard'}
//             className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
//           >
//             Go to Dashboard
//           </button>

//           <button
//             onClick={() => window.location.href = '/dashboard?tab=subscription'}
//             className="w-full text-blue-600 hover:text-blue-700 font-semibold py-3 border border-blue-200 rounded-lg transition-colors duration-200"
//           >
//             View Subscription Details
//           </button>
//         </div>

//         <p className="text-xs text-gray-500 mt-6">
//           Redirecting in a few seconds...
//         </p>
//       </div>
//     </div>
//   );
// };

// export default SubscriptionSuccess;