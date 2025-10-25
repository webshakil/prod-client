// hooks/usePayment.js
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { useCreatePaymentMutation, useVerifyPaymentMutation } from '../../../../redux/api/subscription/subscriptionApi';
import {
  setPaymentStatus,
  setPaymentData,
  setPaymentError,
  setCheckoutStep,
} from '../../../../redux/slices/subscriptionSlice';

export const usePayment = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [createPayment, createPaymentState] = useCreatePaymentMutation();
  const [verifyPayment, verifyPaymentState] = useVerifyPaymentMutation();
  
  const paymentStatus = useAppSelector((state) => state.subscription.paymentStatus);
  const paymentData = useAppSelector((state) => state.subscription.paymentData);

  const initiatePayment = useCallback(
    async (paymentDetails) => {
      try {
        dispatch(setPaymentStatus('pending'));
        
        console.log('🚀 Creating payment...', paymentDetails);
        
        const result = await createPayment(paymentDetails).unwrap();
        
        console.log('✅ Payment created:', result);
        
        // Extract payment data
        const payment = result.payment || result.paymentData || {};
        const gateway = (result.gateway || '').toLowerCase();
        
        dispatch(setPaymentData(payment));
        
        console.log('🔍 Gateway:', gateway);
        console.log('💳 Payment data:', payment);
        
        // ✅ Handle different gateways
        if (gateway === 'stripe') {
          // ✅ Stripe: Navigate to Stripe payment page with client_secret
          console.log('💳 Stripe detected - navigating to Stripe payment page');
          
          const clientSecret = payment.client_secret;
          
          if (clientSecret) {
            dispatch(setPaymentStatus('redirecting'));
            
            // Navigate to Stripe payment page
            navigate(`/payment/stripe?client_secret=${clientSecret}&plan_id=${paymentDetails.planId}`);
          } else {
            throw new Error('No client_secret received from Stripe');
          }
          
        } else if (gateway === 'paddle') {
          // ✅ Paddle: Redirect directly to Paddle checkout URL
          console.log('🏓 Paddle detected - redirecting to Paddle checkout');
          
          const checkoutUrl = 
            payment.checkout_url || 
            result.checkout_url;
          
          if (checkoutUrl) {
            console.log('🔗 Checkout URL:', checkoutUrl);
            
            dispatch(setPaymentStatus('redirecting'));
            
            // ✅ Direct redirect to Paddle (external)
            window.location.href = checkoutUrl;
          } else {
            throw new Error('No checkout_url received from Paddle');
          }
          
        } else {
          // Unknown gateway or no gateway specified
          console.warn('⚠️ Unknown gateway:', gateway);
          
          // Check if there's a checkout URL anyway
          const checkoutUrl = 
            payment.checkout_url || 
            result.checkout_url;
          
          if (checkoutUrl) {
            console.log('🔗 Found checkout URL, redirecting...');
            window.location.href = checkoutUrl;
          } else {
            // Fallback to success
            dispatch(setPaymentStatus('success'));
            dispatch(setCheckoutStep('confirmation'));
          }
        }
        
        return result;
      } catch (error) {
        console.error('❌ Payment error:', error);
        dispatch(setPaymentError(error?.data?.error || error?.message || 'Payment failed'));
        dispatch(setPaymentStatus('failed'));
        throw error;
      }
    },
    [createPayment, dispatch, navigate]
  );

  const confirmPayment = useCallback(
    async (paymentId, gateway) => {
      try {
        const result = await verifyPayment({
          paymentId,
          gateway,
        }).unwrap();
        
        if (result.verification.verified) {
          dispatch(setPaymentStatus('success'));
        }
        
        return result;
      } catch (error) {
        dispatch(setPaymentError(error?.data?.error || 'Verification failed'));
        throw error;
      }
    },
    [verifyPayment, dispatch]
  );

  return {
    initiatePayment,
    confirmPayment,
    paymentStatus,
    paymentData,
    loading: createPaymentState.isLoading || verifyPaymentState.isLoading,
    error: createPaymentState.error?.data?.error || verifyPaymentState.error?.data?.error,
  };
};
// import { useCallback } from 'react';
// import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
// import { useCreatePaymentMutation, useVerifyPaymentMutation } from '../../../../redux/api/subscription/subscriptionApi';
// import {
//   setPaymentStatus,
//   setPaymentData,
//   setPaymentError,
//   setCheckoutStep,
// } from '../../../../redux/slices/subscriptionSlice';

// export const usePayment = () => {
//   const dispatch = useAppDispatch();
//   const [createPayment, createPaymentState] = useCreatePaymentMutation();
//   const [verifyPayment, verifyPaymentState] = useVerifyPaymentMutation();
  
//   const paymentStatus = useAppSelector((state) => state.subscription.paymentStatus);
//   const paymentData = useAppSelector((state) => state.subscription.paymentData);

//   const initiatePayment = useCallback(
//     async (paymentDetails) => {
//       try {
//         dispatch(setPaymentStatus('pending'));
        
//         console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//         console.log('🚀 Initiating payment...');
//         console.log('Payment details:', paymentDetails);
        
//         const result = await createPayment(paymentDetails).unwrap();
        
//         console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//         console.log('✅ Payment response received:');
//         console.log('Full result:', JSON.stringify(result, null, 2));
//         console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
//         // Extract payment data from various possible locations
//         const paymentDataFromResult = result.paymentData || result.payment || {};
//         dispatch(setPaymentData(paymentDataFromResult));
        
//         // ✅ Check gateway from multiple possible locations
//         const gateway = (
//           result.gateway || 
//           paymentDataFromResult.gateway ||
//           result.recommendation?.primary_gateway
//         )?.toLowerCase();
        
//         console.log('🔍 Detected gateway:', gateway);
        
//         // ✅ Extract checkout URL from all possible locations
//         const checkoutUrl = 
//           result.checkout_url ||
//           result.payment?.checkout_url || 
//           result.paymentData?.checkout_url ||
//           paymentDataFromResult?.checkout_url;
        
//         console.log('🔗 Checkout URL:', checkoutUrl);
        
//         if (gateway === 'paddle') {
//           console.log('🏓 Paddle payment detected');
          
//           if (checkoutUrl) {
//             console.log('✅ Redirecting to Paddle checkout:', checkoutUrl);
            
//             dispatch(setPaymentStatus('redirecting'));
            
//             // Redirect after a brief delay for UI feedback
//             setTimeout(() => {
//               console.log('🌐 Opening checkout URL...');
//               window.location.href = checkoutUrl;
//             }, 1000);
            
//             // Return early - don't set to 'success' or change checkout step
//             return result;
//           } else {
//             console.error('❌ No checkout URL found for Paddle payment');
//             console.error('Result structure:', result);
//             throw new Error('Paddle checkout URL not found in response');
//           }
//         } else if (gateway === 'stripe') {
//           console.log('💳 Stripe payment detected - continuing to confirmation');
//           dispatch(setPaymentStatus('success'));
//           dispatch(setCheckoutStep('confirmation'));
//         } else {
//           console.warn('⚠️ Unknown or missing gateway:', gateway);
//           console.warn('Full result for debugging:', result);
          
//           // If we have a checkout URL regardless of gateway, redirect
//           if (checkoutUrl) {
//             console.log('🔗 Found checkout URL, redirecting anyway...');
//             dispatch(setPaymentStatus('redirecting'));
//             setTimeout(() => {
//               window.location.href = checkoutUrl;
//             }, 1000);
//             return result;
//           }
          
//           // Fallback to success
//           dispatch(setPaymentStatus('success'));
//           dispatch(setCheckoutStep('confirmation'));
//         }
        
//         return result;
//       } catch (error) {
//         console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//         console.error('❌ Payment error:', error);
//         console.error('Error details:', {
//           message: error?.message,
//           data: error?.data,
//           status: error?.status,
//         });
//         console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
//         dispatch(setPaymentError(error?.data?.error || error?.message || 'Payment failed'));
//         dispatch(setPaymentStatus('failed'));
//         throw error;
//       }
//     },
//     [createPayment, dispatch]
//   );

//   const confirmPayment = useCallback(
//     async (paymentId, gateway) => {
//       try {
//         const result = await verifyPayment({
//           paymentId,
//           gateway,
//         }).unwrap();
        
//         if (result.verification.verified) {
//           dispatch(setPaymentStatus('success'));
//         }
        
//         return result;
//       } catch (error) {
//         dispatch(setPaymentError(error?.data?.error || 'Verification failed'));
//         throw error;
//       }
//     },
//     [verifyPayment, dispatch]
//   );

//   return {
//     initiatePayment,
//     confirmPayment,
//     paymentStatus,
//     paymentData,
//     loading: createPaymentState.isLoading || verifyPaymentState.isLoading,
//     error: createPaymentState.error?.data?.error || verifyPaymentState.error?.data?.error,
//   };
// };
// import { useCallback } from 'react';
// import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
// import { useCreatePaymentMutation, useVerifyPaymentMutation } from '../../../../redux/api/subscription/subscriptionApi';
// import {
//   setPaymentStatus,
//   setPaymentData,
//   setPaymentError,
//   setCheckoutStep,
// } from '../../../../redux/slices/subscriptionSlice';

// export const usePayment = () => {
//   const dispatch = useAppDispatch();
//   const [createPayment, createPaymentState] = useCreatePaymentMutation();
//   const [verifyPayment, verifyPaymentState] = useVerifyPaymentMutation();
  
//   const paymentStatus = useAppSelector((state) => state.subscription.paymentStatus);
//   const paymentData = useAppSelector((state) => state.subscription.paymentData);

//   const initiatePayment = useCallback(
//     async (paymentDetails) => {
//       try {
//         dispatch(setPaymentStatus('pending'));
//         const result = await createPayment(paymentDetails).unwrap();
        
//         console.log('💳 Payment created:', result);
        
//         dispatch(setPaymentData(result.paymentData || result.payment));
        
//         // ✅ FIX: Handle different gateways
//         const gateway = result.gateway?.toLowerCase();
        
//         if (gateway === 'paddle') {
//           // ✅ Paddle: Redirect to checkout page
//           const checkoutUrl = 
//             result.payment?.checkout_url || 
//             result.paymentData?.checkout_url ||
//             result.checkout_url;

//           if (checkoutUrl) {
//             console.log('🏓 Redirecting to Paddle checkout:', checkoutUrl);
            
//             // Save payment data before redirect
//             dispatch(setPaymentStatus('redirecting'));
            
//             // Small delay for UI feedback
//             setTimeout(() => {
//               window.location.href = checkoutUrl;
//             }, 500);
//           } else {
//             throw new Error('Paddle checkout URL not found');
//           }
//         } else if (gateway === 'stripe') {
//           // ✅ Stripe: Continue with existing flow (client_secret, etc.)
//           console.log('💳 Stripe payment - continuing to confirmation');
//           dispatch(setPaymentStatus('success'));
//           dispatch(setCheckoutStep('confirmation'));
//         } else {
//           // Unknown gateway
//           console.warn('⚠️ Unknown gateway:', gateway);
//           dispatch(setPaymentStatus('success'));
//           dispatch(setCheckoutStep('confirmation'));
//         }
        
//         return result;
//       } catch (error) {
//         console.error('❌ Payment error:', error);
//         dispatch(setPaymentError(error?.data?.error || 'Payment failed'));
//         dispatch(setPaymentStatus('failed'));
//         throw error;
//       }
//     },
//     [createPayment, dispatch]
//   );

//   const confirmPayment = useCallback(
//     async (paymentId, gateway) => {
//       try {
//         const result = await verifyPayment({
//           paymentId,
//           gateway,
//         }).unwrap();
        
//         if (result.verification.verified) {
//           dispatch(setPaymentStatus('success'));
//         }
        
//         return result;
//       } catch (error) {
//         dispatch(setPaymentError(error?.data?.error || 'Verification failed'));
//         throw error;
//       }
//     },
//     [verifyPayment, dispatch]
//   );

//   return {
//     initiatePayment,
//     confirmPayment,
//     paymentStatus,
//     paymentData,
//     loading: createPaymentState.isLoading || verifyPaymentState.isLoading,
//     error: createPaymentState.error?.data?.error || verifyPaymentState.error?.data?.error,
//   };
// };
// import { useCallback } from 'react';
// import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
// import { useCreatePaymentMutation, useVerifyPaymentMutation } from '../../../../redux/api/subscription/subscriptionApi';
// import {
//   setPaymentStatus,
//   setPaymentData,
//   setPaymentError,
//   setCheckoutStep,
// } from '../../../../redux/slices/subscriptionSlice';

// export const usePayment = () => {
//   const dispatch = useAppDispatch();
//   const [createPayment, createPaymentState] = useCreatePaymentMutation();
//   const [verifyPayment, verifyPaymentState] = useVerifyPaymentMutation();
  
//   const paymentStatus = useAppSelector((state) => state.subscription.paymentStatus);
//   const paymentData = useAppSelector((state) => state.subscription.paymentData);

//   const initiatePayment = useCallback(
//     async (paymentDetails) => {
//       try {
//         dispatch(setPaymentStatus('pending'));
//         const result = await createPayment(paymentDetails).unwrap();
        
//         dispatch(setPaymentData(result.paymentData));
//         dispatch(setPaymentStatus('success'));
//         dispatch(setCheckoutStep('confirmation'));
        
//         return result;
//       } catch (error) {
//         dispatch(setPaymentError(error?.data?.error || 'Payment failed'));
//         dispatch(setPaymentStatus('failed'));
//         throw error;
//       }
//     },
//     [createPayment, dispatch]
//   );

//   const confirmPayment = useCallback(
//     async (paymentId, gateway) => {
//       try {
//         const result = await verifyPayment({
//           paymentId,
//           gateway,
//         }).unwrap();
        
//         if (result.verification.verified) {
//           dispatch(setPaymentStatus('success'));
//         }
        
//         return result;
//       } catch (error) {
//         dispatch(setPaymentError(error?.data?.error || 'Verification failed'));
//         throw error;
//       }
//     },
//     [verifyPayment, dispatch]
//   );

//   return {
//     initiatePayment,
//     confirmPayment,
//     paymentStatus,
//     paymentData,
//     loading: createPaymentState.isLoading || verifyPaymentState.isLoading,
//     error: createPaymentState.error?.data?.error || verifyPaymentState.error?.data?.error,
//   };
// };