// frontend/src/pages/payment/PaddlePaymentPage.jsx
// SIMPLEST VERSION - No SDK, just redirect to Paddle checkout

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader, CreditCard, Lock, ExternalLink } from 'lucide-react';
import { useCreatePaymentMutation } from '../../redux/api/subscription/subscriptionApi';
//import { useCreatePaymentMutation } from '../../services/subscriptionApi';

const PaddlePaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // ✅ Get user from Redux or localStorage
  const authState = useSelector((state) => state.auth);
  let userId = authState?.userId;
  let email = authState?.email;
  
  if (!userId || !email) {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        userId = parsed.userId || localStorage.getItem('userId');
        email = parsed.email;
      } catch (e) {
        userId = localStorage.getItem('userId');
      }
    }
  }
  
  const planId = searchParams.get('plan_id');
  const priceId = searchParams.get('price_id');
  const planName = searchParams.get('plan_name');
  const price = searchParams.get('price');
  const billingCycle = searchParams.get('billing_cycle');

  const [createPayment, { isLoading }] = useCreatePaymentMutation();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!planId || !priceId) {
      navigate('/pricing');
      return;
    }
  }, [planId, priceId, navigate]);

  const handlePaddleCheckout = async () => {
    try {
      setError(null);
      
      console.log('🏓 Creating Paddle payment...');
      
      // Call backend to create payment
      const response = await createPayment({
        planId: parseInt(planId),
        country_code: 'US',
        payment_method: 'card',
        amount: parseFloat(price),
        currency: 'USD',
      }).unwrap();

      console.log('✅ Payment response:', response);

      // ✅ Get checkout URL from backend
      const checkoutUrl = response.paymentData?.checkout_url;
      
      if (!checkoutUrl) {
        throw new Error('No checkout URL received');
      }

      console.log('🚀 Redirecting to Paddle:', checkoutUrl);
      
      // ✅ SIMPLE: Just redirect to Paddle checkout
      window.location.href = checkoutUrl;
      
    } catch (err) {
      console.error('❌ Payment error:', err);
      setError(err.message || 'Payment failed');
    }
  };

  if (!planId || !priceId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard size={32} />
              <h1 className="text-2xl font-bold">Complete Payment</h1>
            </div>
            <p className="text-green-100">Secure checkout powered by Paddle</p>
          </div>

          {/* Plan Summary */}
          <div className="p-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Plan Summary</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-medium">{planName || 'Subscription Plan'}</span>
                <span className="text-2xl font-bold text-indigo-600">${price}</span>
              </div>
              <p className="text-sm text-gray-500">Billed {billingCycle}</p>
            </div>
          </div>

          {/* Payment Button */}
          <div className="p-8">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handlePaddleCheckout}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin" size={24} />
                  Creating Payment...
                </>
              ) : (
                <>
                  <ExternalLink size={20} />
                  Proceed to Paddle Checkout
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-4">
              <Lock size={16} />
              <span>Secured by Paddle</span>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            You'll be redirected to Paddle's secure checkout page
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <span>🔒 SSL Encrypted</span>
            <span>•</span>
            <span>💳 PCI Compliant</span>
            <span>•</span>
            <span>✓ Paddle Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaddlePaymentPage;

// // frontend/src/pages/payment/PaddlePaymentPage.jsx
// // Separate Paddle payment page - Stripe code untouched!

// import React, { useState, useEffect } from 'react';
// import { useSearchParams, useNavigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import { Loader, CreditCard, Lock } from 'lucide-react';
// import { usePaddleCheckout } from '../../hooks/usePaddleCheckout';

// const PaddlePaymentPage = () => {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
  
//   // ✅ Try Redux first, then localStorage
//   const authState = useSelector((state) => state.auth);
//   let userId = authState?.userId;
//   let email = authState?.email;
  
//   // ✅ Fallback to localStorage if Redux is empty
//   if (!userId || !email) {
//     console.log('⚠️ Redux empty, trying localStorage...');
//     const userData = localStorage.getItem('userData');
//     if (userData) {
//       try {
//         const parsed = JSON.parse(userData);
//         userId = parsed.userId || localStorage.getItem('userId');
//         email = parsed.email;
//         console.log('✅ Got user from localStorage:', { userId, email });
//       } catch (e) {
//         userId = localStorage.getItem('userId');
//         console.log('✅ Got userId from localStorage:', userId);
//       }
//     }
//   }
  
//   const planId = searchParams.get('plan_id');
//   const priceId = searchParams.get('price_id');
//   const planName = searchParams.get('plan_name');
//   const price = searchParams.get('price');
//   const billingCycle = searchParams.get('billing_cycle');

//   const { openCheckout, isLoading: paddleLoading, error: paddleError } = usePaddleCheckout();
//   const [isProcessing, setIsProcessing] = useState(false);

//   useEffect(() => {
//     // ✅ Debug: Log all state
//     console.log('🔍 Full auth state:', authState);
//     console.log('🔍 User ID:', userId, 'Type:', typeof userId);
//     console.log('🔍 Email:', email, 'Type:', typeof email);
//     console.log('🔍 Plan ID:', planId);
//     console.log('🔍 Price ID:', priceId);
    
//     // ✅ Only check if we have required params
//     if (!planId || !priceId) {
//       console.error('❌ Missing required parameters');
//       navigate('/pricing');
//       return;
//     }
    
//     // ✅ Don't redirect if no auth - we can still try checkout
//     if (!userId || !email) {
//       console.warn('⚠️ No user credentials - checkout may fail');
//     }
//   }, [planId, priceId, userId, email, navigate, authState]);

//   const handlePaddleCheckout = () => {
//     setIsProcessing(true);
    
//     console.log('🏓 Opening Paddle checkout...');
//     console.log('   Plan ID:', planId);
//     console.log('   Price ID:', priceId);
//     console.log('   User ID:', userId);
//     console.log('   User Email:', email);
    
//     // ✅ Extra validation
//     if (!userId || !email) {
//       console.error('❌ Missing user credentials');
//       alert('User not authenticated. Please log in again.');
//       navigate('/login');
//       return;
//     }
    
//     openCheckout({
//       priceId: priceId,
//       userId: userId,
//       planId: planId,
//       userEmail: email,
//       onSuccess: (data) => {
//         console.log('✅ Paddle payment successful!', data);
//         setIsProcessing(false);
//         navigate(`/payment/callback?gateway=paddle&transaction_id=${data.transaction_id}&plan_id=${planId}`);
//       },
//       onError: (error) => {
//         console.error('❌ Paddle payment failed:', error);
//         setIsProcessing(false);
//         alert('Payment failed. Please try again.');
//       },
//     });
//   };

//   if (!planId || !priceId) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Loader className="animate-spin text-indigo-600" size={48} />
//       </div>
//     );
//   }

//   // ✅ Show error if Paddle fails to load
//   if (paddleError) {
//     return (
//       <div className="min-h-screen bg-gray-50 py-12 px-4">
//         <div className="max-w-2xl mx-auto">
//           <div className="bg-red-50 border border-red-200 rounded-lg p-6">
//             <h2 className="text-xl font-bold text-red-800 mb-2">Paddle Failed to Load</h2>
//             <p className="text-red-700">{paddleError}</p>
//             <button 
//               onClick={() => window.location.reload()} 
//               className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
//             >
//               Retry
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-12 px-4">
//       <div className="max-w-2xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
//           <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white">
//             <div className="flex items-center gap-3 mb-2">
//               <CreditCard size={32} />
//               <h1 className="text-2xl font-bold">Complete Payment</h1>
//             </div>
//             <p className="text-green-100">Click below to open secure Paddle checkout</p>
//           </div>

//           {/* Plan Summary */}
//           <div className="p-8 border-b border-gray-200">
//             <h2 className="text-xl font-semibold mb-4">Plan Summary</h2>
//             <div className="bg-gray-50 rounded-lg p-4">
//               <div className="flex justify-between items-center mb-2">
//                 <span className="text-gray-700 font-medium">{planName || 'Subscription Plan'}</span>
//                 <span className="text-2xl font-bold text-indigo-600">${price}</span>
//               </div>
//               <p className="text-sm text-gray-500">Billed {billingCycle}</p>
//             </div>
//           </div>

//           {/* Payment Button */}
//           <div className="p-8">
//             <button
//               onClick={handlePaddleCheckout}
//               disabled={paddleLoading || isProcessing}
//               className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
//             >
//               {paddleLoading || isProcessing ? (
//                 <>
//                   <Loader className="animate-spin" size={24} />
//                   Loading Paddle...
//                 </>
//               ) : (
//                 <>
//                   <Lock size={20} />
//                   Pay with Paddle
//                 </>
//               )}
//             </button>

//             {/* Security Notice */}
//             <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-4">
//               <Lock size={16} />
//               <span>Secured by Paddle</span>
//             </div>
//           </div>
//         </div>

//         {/* Trust Badges */}
//         <div className="text-center space-y-2">
//           <p className="text-sm text-gray-600">
//             Your payment information is encrypted and secure
//           </p>
//           <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
//             <span>🔒 SSL Encrypted</span>
//             <span>•</span>
//             <span>💳 PCI Compliant</span>
//             <span>•</span>
//             <span>✓ Paddle Verified</span>
//           </div>
//         </div>

//         {/* Info Box */}
//         <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <p className="text-sm text-blue-800">
//             💡 <strong>Note:</strong> When you click "Pay with Paddle", a secure checkout window will open. 
//             Complete your payment details there and you'll be redirected back automatically.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaddlePaymentPage;
// //// frontend/src/pages/payment/PaddlePaymentPage.jsx
// // Separate Paddle payment page - Stripe code untouched!

// import React, { useState, useEffect } from 'react';
// import { useSearchParams, useNavigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import { Loader, CreditCard, Lock } from 'lucide-react';
// import { usePaddleCheckout } from '../../hooks/usePaddleCheckout';

// const PaddlePaymentPage = () => {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
  
//   // ✅ Get entire auth state for debugging
//   const authState = useSelector((state) => state.auth);
//   const { userId, email } = authState || {};
  
//   const planId = searchParams.get('plan_id');
//   const priceId = searchParams.get('price_id');
//   const planName = searchParams.get('plan_name');
//   const price = searchParams.get('price');
//   const billingCycle = searchParams.get('billing_cycle');

//   const { openCheckout, isLoading: paddleLoading, error: paddleError } = usePaddleCheckout();
//   const [isProcessing, setIsProcessing] = useState(false);

//   useEffect(() => {
//     // ✅ Debug: Log all state
//     console.log('🔍 Full auth state:', authState);
//     console.log('🔍 User ID:', userId, 'Type:', typeof userId);
//     console.log('🔍 Email:', email, 'Type:', typeof email);
//     console.log('🔍 Plan ID:', planId);
//     console.log('🔍 Price ID:', priceId);
    
//     // ✅ Check authentication
//     if (!userId || !email) {
//       console.error('❌ User not authenticated');
//       console.error('   Auth state:', authState);
//       alert('Please log in to continue');
//       navigate('/login');
//       return;
//     }

//     if (!planId || !priceId) {
//       console.error('❌ Missing required parameters');
//       navigate('/pricing');
//     }
//   }, [planId, priceId, userId, email, navigate, authState]);

//   const handlePaddleCheckout = () => {
//     setIsProcessing(true);
    
//     console.log('🏓 Opening Paddle checkout...');
//     console.log('   Plan ID:', planId);
//     console.log('   Price ID:', priceId);
//     console.log('   User ID:', userId);
//     console.log('   User Email:', email);
    
//     // ✅ Extra validation
//     if (!userId || !email) {
//       console.error('❌ Missing user credentials');
//       alert('User not authenticated. Please log in again.');
//       navigate('/login');
//       return;
//     }
    
//     openCheckout({
//       priceId: priceId,
//       userId: userId,
//       planId: planId,
//       userEmail: email,
//       onSuccess: (data) => {
//         console.log('✅ Paddle payment successful!', data);
//         setIsProcessing(false);
//         navigate(`/payment/callback?gateway=paddle&transaction_id=${data.transaction_id}&plan_id=${planId}`);
//       },
//       onError: (error) => {
//         console.error('❌ Paddle payment failed:', error);
//         setIsProcessing(false);
//         alert('Payment failed. Please try again.');
//       },
//     });
//   };

//   if (!planId || !priceId) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Loader className="animate-spin text-indigo-600" size={48} />
//       </div>
//     );
//   }

//   // ✅ Show error if Paddle fails to load
//   if (paddleError) {
//     return (
//       <div className="min-h-screen bg-gray-50 py-12 px-4">
//         <div className="max-w-2xl mx-auto">
//           <div className="bg-red-50 border border-red-200 rounded-lg p-6">
//             <h2 className="text-xl font-bold text-red-800 mb-2">Paddle Failed to Load</h2>
//             <p className="text-red-700">{paddleError}</p>
//             <button 
//               onClick={() => window.location.reload()} 
//               className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
//             >
//               Retry
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-12 px-4">
//       <div className="max-w-2xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
//           <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white">
//             <div className="flex items-center gap-3 mb-2">
//               <CreditCard size={32} />
//               <h1 className="text-2xl font-bold">Complete Payment</h1>
//             </div>
//             <p className="text-green-100">Click below to open secure Paddle checkout</p>
//           </div>

//           {/* Plan Summary */}
//           <div className="p-8 border-b border-gray-200">
//             <h2 className="text-xl font-semibold mb-4">Plan Summary</h2>
//             <div className="bg-gray-50 rounded-lg p-4">
//               <div className="flex justify-between items-center mb-2">
//                 <span className="text-gray-700 font-medium">{planName || 'Subscription Plan'}</span>
//                 <span className="text-2xl font-bold text-indigo-600">${price}</span>
//               </div>
//               <p className="text-sm text-gray-500">Billed {billingCycle}</p>
//             </div>
//           </div>

//           {/* Payment Button */}
//           <div className="p-8">
//             <button
//               onClick={handlePaddleCheckout}
//               disabled={paddleLoading || isProcessing}
//               className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
//             >
//               {paddleLoading || isProcessing ? (
//                 <>
//                   <Loader className="animate-spin" size={24} />
//                   Loading Paddle...
//                 </>
//               ) : (
//                 <>
//                   <Lock size={20} />
//                   Pay with Paddle
//                 </>
//               )}
//             </button>

//             {/* Security Notice */}
//             <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-4">
//               <Lock size={16} />
//               <span>Secured by Paddle</span>
//             </div>
//           </div>
//         </div>

//         {/* Trust Badges */}
//         <div className="text-center space-y-2">
//           <p className="text-sm text-gray-600">
//             Your payment information is encrypted and secure
//           </p>
//           <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
//             <span>🔒 SSL Encrypted</span>
//             <span>•</span>
//             <span>💳 PCI Compliant</span>
//             <span>•</span>
//             <span>✓ Paddle Verified</span>
//           </div>
//         </div>

//         {/* Info Box */}
//         <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <p className="text-sm text-blue-800">
//             💡 <strong>Note:</strong> When you click "Pay with Paddle", a secure checkout window will open. 
//             Complete your payment details there and you'll be redirected back automatically.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaddlePaymentPage;

// // frontend/src/pages/payment/PaddlePaymentPage.jsx
// // Separate Paddle payment page - Stripe code untouched!

// import React, { useState, useEffect } from 'react';
// import { useSearchParams, useNavigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import { Loader, CreditCard, Lock } from 'lucide-react';
// import { usePaddleCheckout } from '../../hooks/usePaddleCheckout';

// const PaddlePaymentPage = () => {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const { userId, email } = useSelector((state) => state.auth);
  
//   const planId = searchParams.get('plan_id');
//   const priceId = searchParams.get('price_id');
//   const planName = searchParams.get('plan_name');
//   const price = searchParams.get('price');
//   const billingCycle = searchParams.get('billing_cycle');

//   const { openCheckout, isLoading: paddleLoading } = usePaddleCheckout();
//   const [isProcessing, setIsProcessing] = useState(false);

//   useEffect(() => {
//     if (!planId || !priceId) {
//       console.error('❌ Missing required parameters');
//       navigate('/pricing');
//     }
//   }, [planId, priceId, navigate]);

//   const handlePaddleCheckout = () => {
//     setIsProcessing(true);
    
//     console.log('🏓 Opening Paddle checkout...');
//     console.log('   Plan ID:', planId);
//     console.log('   Price ID:', priceId);
//     console.log('   User Email:', email);
    
//     openCheckout({
//       priceId: priceId,
//       userId: userId,
//       planId: planId,
//       userEmail: email,
//       onSuccess: (data) => {
//         console.log('✅ Paddle payment successful!', data);
//         setIsProcessing(false);
//         navigate(`/payment/callback?gateway=paddle&transaction_id=${data.transaction_id}&plan_id=${planId}`);
//       },
//       onError: (error) => {
//         console.error('❌ Paddle payment failed:', error);
//         setIsProcessing(false);
//         alert('Payment failed. Please try again.');
//       },
//     });
//   };

//   if (!planId || !priceId) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Loader className="animate-spin text-indigo-600" size={48} />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-12 px-4">
//       <div className="max-w-2xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
//           <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white">
//             <div className="flex items-center gap-3 mb-2">
//               <CreditCard size={32} />
//               <h1 className="text-2xl font-bold">Complete Payment</h1>
//             </div>
//             <p className="text-green-100">Click below to open secure Paddle checkout</p>
//           </div>

//           {/* Plan Summary */}
//           <div className="p-8 border-b border-gray-200">
//             <h2 className="text-xl font-semibold mb-4">Plan Summary</h2>
//             <div className="bg-gray-50 rounded-lg p-4">
//               <div className="flex justify-between items-center mb-2">
//                 <span className="text-gray-700 font-medium">{planName || 'Subscription Plan'}</span>
//                 <span className="text-2xl font-bold text-indigo-600">${price}</span>
//               </div>
//               <p className="text-sm text-gray-500">Billed {billingCycle}</p>
//             </div>
//           </div>

//           {/* Payment Button */}
//           <div className="p-8">
//             <button
//               onClick={handlePaddleCheckout}
//               disabled={paddleLoading || isProcessing}
//               className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
//             >
//               {paddleLoading || isProcessing ? (
//                 <>
//                   <Loader className="animate-spin" size={24} />
//                   Loading Paddle...
//                 </>
//               ) : (
//                 <>
//                   <Lock size={20} />
//                   Pay with Paddle
//                 </>
//               )}
//             </button>

//             {/* Security Notice */}
//             <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-4">
//               <Lock size={16} />
//               <span>Secured by Paddle</span>
//             </div>
//           </div>
//         </div>

//         {/* Trust Badges */}
//         <div className="text-center space-y-2">
//           <p className="text-sm text-gray-600">
//             Your payment information is encrypted and secure
//           </p>
//           <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
//             <span>🔒 SSL Encrypted</span>
//             <span>•</span>
//             <span>💳 PCI Compliant</span>
//             <span>•</span>
//             <span>✓ Paddle Verified</span>
//           </div>
//         </div>

//         {/* Info Box */}
//         <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <p className="text-sm text-blue-800">
//             💡 <strong>Note:</strong> When you click "Pay with Paddle", a secure checkout window will open. 
//             Complete your payment details there and you'll be redirected back automatically.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaddlePaymentPage;