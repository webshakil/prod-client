import React, { useState, useEffect } from 'react';
import { CreditCard, Wallet, Loader } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { initializePaddle } from '@paddle/paddle-js';
import StripePaymentForm from './StripePaymentForm';

// Validate and initialize Stripe
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_REACT_APP_STRIPE_PUBLIC_KEY;

if (!STRIPE_PUBLIC_KEY || !STRIPE_PUBLIC_KEY.startsWith('pk_')) {
  console.error('❌ Invalid or missing Stripe public key!');
  console.error('❌ Current key:', STRIPE_PUBLIC_KEY);
  console.error('❌ Please set VITE_REACT_APP_STRIPE_PUBLIC_KEY in your .env file');
}

const stripePromise = STRIPE_PUBLIC_KEY ? loadStripe(STRIPE_PUBLIC_KEY) : null;

export default function PaymentModal({
  isOpen,
  onClose,
  electionId,
  applicableFee,
  onPaymentSuccess,
}) {
  // Local state
  const [paymentMethod, setPaymentMethod] = useState('card');
  /*eslint-disable*/
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [clientSecret, setClientSecret] = useState(null);
  const [paddle, setPaddle] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Get user data from localStorage
  const getUserData = () => {
    try {
      const persistRoot = localStorage.getItem('persist:vottery-root');
      if (persistRoot) {
        const parsed = JSON.parse(persistRoot);
        const authData = parsed.auth ? JSON.parse(parsed.auth) : {};
        const walletData = parsed.wallet ? JSON.parse(parsed.wallet) : {};
        
        return {
          region: authData.userData?.region || authData.userData?.country || 'Unknown',
          token: authData.token || localStorage.getItem('token'),
          walletBalance: walletData.balance || 0,
        };
      }
    } catch (err) {
      console.error('Error reading user data:', err);
    }
    
    return {
      region: 'Unknown',
      token: localStorage.getItem('token'),
      walletBalance: 0,
    };
  };

  const userData = getUserData();

  // Get x-user-data header value
  const getXUserDataHeader = () => {
    try {
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        return JSON.stringify({
          userId: userData.userId,
          email: userData.email,
          phone: userData.phone || null,
          username: userData.username || null,
          roles: (userData.roles || ['Voter']).map(role => 
            role === 'ContentCreator' ? 'Content_Creator' : role
          ),
          subscriptionType: userData.subscriptionType || 'Free',
          isSubscribed: userData.isSubscribed || false
        });
      }
    } catch (error) {
      console.error('Error creating x-user-data header:', error);
    }
    return null;
  };

  // Initialize Paddle
  useEffect(() => {
    let isMounted = true;
    
    const initPaddle = async () => {
      try {
        const paddleToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;
        if (!paddleToken) {
          console.warn('Paddle token not configured');
          return;
        }

        const paddleInstance = await initializePaddle({
          environment: import.meta.env.VITE_REACT_APP_PADDLE_ENVIRONMENT || 'sandbox',
          token: paddleToken,
        });
        
        if (isMounted) {
          setPaddle(paddleInstance);
        }
      } catch (err) {
        console.error('Paddle initialization failed:', err);
      }
    };

    initPaddle();

    return () => {
      isMounted = false;
    };
  }, []);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setClientSecret(null);
      setError(null);
      setPaymentStatus('idle');
      setIsProcessing(false);
    }
  }, [isOpen]);

  // Create payment intent when modal opens with card payment
  useEffect(() => {
    if (isOpen && paymentMethod === 'card' && !clientSecret && applicableFee && electionId && !isProcessing) {
      createPaymentIntent();
    }
  }, [isOpen, paymentMethod]);

  const createPaymentIntent = async () => {
    console.log('🔵 createPaymentIntent called with:', {
      applicableFee,
      electionId,
      paymentMethod
    });

    if (!applicableFee || !electionId) {
      setError('Missing payment information');
      console.error('❌ Missing data:', { applicableFee, electionId });
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      
      const apiUrl = import.meta.env.VITE_REACT_APP_PAYMENT_SERVICE_URL || 'http://localhost:5006/api';
      const xUserData = getXUserDataHeader();
      
      console.log('📤 Making payment request to:', `${apiUrl}/payments/election/${electionId}/create-intent`);
      console.log('📤 Request body:', {
        amount: applicableFee.total,
        currency: applicableFee.currency?.toLowerCase() || 'usd',
        region: userData.region,
        processingFee: applicableFee.processingFee,
        frozenAmount: applicableFee.frozenAmount,
      });
      
      const response = await fetch(`${apiUrl}/payments/election/${electionId}/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userData.token && { 'Authorization': `Bearer ${userData.token}` }),
          ...(xUserData && { 'x-user-data': xUserData }),
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: applicableFee.total,
          currency: applicableFee.currency?.toLowerCase() || 'usd',
          region: userData.region,
          processingFee: applicableFee.processingFee,
          frozenAmount: applicableFee.frozenAmount,
        }),
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.message || `Payment failed: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('📥 RAW SERVER RESPONSE:', responseData);
      console.log('📥 Response keys:', Object.keys(responseData));

      // Handle different response formats
      let clientSecret = null;
      let paddleTransactionId = null;

      // Check for successResponse format: { success: true, data: { clientSecret: "..." } }
      if (responseData.success && responseData.data) {
        console.log('✅ Found data wrapper (successResponse format)');
        clientSecret = responseData.data.clientSecret;
        paddleTransactionId = responseData.data.paddleTransactionId;
      }
      // Direct format: { clientSecret: "..." }
      else if (responseData.clientSecret) {
        console.log('✅ Found direct clientSecret');
        clientSecret = responseData.clientSecret;
      }
      // Paddle format: { paddleTransactionId: "..." }
      else if (responseData.paddleTransactionId) {
        console.log('✅ Found direct paddleTransactionId');
        paddleTransactionId = responseData.paddleTransactionId;
      }

      if (clientSecret) {
        console.log('✅ Stripe client secret received:', clientSecret.substring(0, 30) + '...');
        setClientSecret(clientSecret);
      } else if (paddleTransactionId) {
        console.log('✅ Paddle transaction ID received:', paddleTransactionId);
        handlePaddlePayment(paddleTransactionId);
      } else {
        console.error('❌ Invalid payment response - no clientSecret or paddleTransactionId');
        console.error('❌ Full response:', responseData);
        throw new Error('Invalid payment response from server');
      }
    } catch (err) {
      console.error('❌ Payment intent creation failed:', err);
      setError(err.message || 'Failed to initialize payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaddlePayment = (transactionId) => {
    if (!paddle) {
      setError('Paddle payment system not available');
      return;
    }

    try {
      paddle.Checkout.open({
        transactionId,
        successCallback: (data) => {
          setPaymentStatus('success');
          onPaymentSuccess?.(data.transaction_id);
          onClose();
        },
        closeCallback: () => {
          setPaymentStatus('idle');
        },
      });
    } catch (err) {
      setError('Failed to open Paddle checkout');
      console.error('Paddle error:', err);
    }
  };

  const handleWalletPayment = async () => {
    if (userData.walletBalance < applicableFee.total) {
      setError(`Insufficient wallet balance. Available: ${applicableFee.currency} ${userData.walletBalance.toFixed(2)}`);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_REACT_APP_PAYMENT_SERVICE_URL || 'http://localhost:5006/api';
      const xUserData = getXUserDataHeader();

      const response = await fetch(`${apiUrl}/payments/wallet/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userData.token && { 'Authorization': `Bearer ${userData.token}` }),
          ...(xUserData && { 'x-user-data': xUserData }),
        },
        credentials: 'include',
        body: JSON.stringify({
          electionId,
          amount: applicableFee.total,
          currency: applicableFee.currency,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Wallet payment failed');
      }

      const data = await response.json();
      
      if (data.success) {
        setPaymentStatus('success');
        onPaymentSuccess?.(data.paymentId);
        onClose();
      } else {
        setError(data.message || 'Wallet payment failed');
      }
    } catch (err) {
      console.error('Wallet payment failed:', err);
      setError(err.message || 'Failed to process wallet payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPayment = () => {
    if (paymentMethod === 'wallet') {
      handleWalletPayment();
    } else if (paymentMethod === 'card' && !clientSecret) {
      createPaymentIntent();
    }
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setClientSecret(null);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Payment</h2>
        
        {/* Payment Method Selection */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => handlePaymentMethodChange(e.target.value)}
                disabled={isProcessing}
              />
              <CreditCard size={20} className="text-blue-600" />
              <div className="flex-1">
                <span className="font-medium">Credit/Debit Card</span>
                <span className="text-xs text-gray-500 block">Stripe or Paddle</span>
              </div>
            </label>
            
            <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
              <input
                type="radio"
                name="payment"
                value="wallet"
                checked={paymentMethod === 'wallet'}
                onChange={(e) => handlePaymentMethodChange(e.target.value)}
                disabled={isProcessing}
              />
              <Wallet size={20} className="text-green-600" />
              <div className="flex-1">
                <span className="font-medium">Wallet Balance</span>
                <div className="text-xs text-gray-500">
                  Available: {applicableFee?.currency || 'USD'} {userData.walletBalance.toFixed(2)}
                  {userData.walletBalance < (applicableFee?.total || 0) && (
                    <span className="text-red-600 ml-2">• Insufficient</span>
                  )}
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Fee Breakdown */}
        {applicableFee && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                <span className="text-sm font-medium text-gray-700">Total Payment</span>
                <span className="text-2xl font-bold text-blue-900">
                  {applicableFee.currency} {applicableFee.total.toFixed(2)}
                </span>
              </div>
              {/* <div className="text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>• Processing Fee ({applicableFee.processingPercentage || 0}%)</span>
                  <span className="font-medium">{applicableFee.currency} {applicableFee.processingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>• Frozen Amount (held)</span>
                  <span className="font-medium">{applicableFee.currency} {applicableFee.frozenAmount.toFixed(2)}</span>
                </div>
              </div> */}



              <div className="text-xs text-gray-600">
  <div className="flex justify-between py-1">
    <span>• Participation Fee</span>
    <span className="font-medium">{applicableFee.currency} {applicableFee.participationFee.toFixed(2)}</span>
  </div>
  <div className="flex justify-between py-1">
    <span>• Processing Fee ({applicableFee.processingPercentage || 0}%)</span>
    <span className="font-medium">{applicableFee.currency} {applicableFee.processingFee.toFixed(2)}</span>
  </div>
</div>
            </div>
          </div>
        )}

        {/* Stripe Payment Form */}
        {paymentMethod === 'card' && clientSecret && (
          <div className="mb-4">
            {!STRIPE_PUBLIC_KEY ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                ⚠️ Stripe payment is not configured. Please add VITE_REACT_APP_STRIPE_PUBLIC_KEY to your .env file.
              </div>
            ) : (
              <Elements 
                stripe={stripePromise} 
                options={{ 
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#2563eb',
                    },
                  },
                }}
              >
                <StripePaymentForm
                  clientSecret={clientSecret}
                  onSuccess={(paymentId) => {
                    console.log('✅ Payment successful:', paymentId);
                    setPaymentStatus('success');
                    onPaymentSuccess?.(paymentId);
                    onClose();
                  }}
                  onError={(errorMsg) => setError(errorMsg)}
                />
              </Elements>
            )}
          </div>
        )}

        {/* Loading State */}
        {paymentMethod === 'card' && !clientSecret && isProcessing && (
          <div className="flex items-center justify-center py-8 mb-4">
            <Loader size={24} className="animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Initializing payment...</span>
          </div>
        )}

        {/* Action Buttons */}
        {(paymentMethod === 'wallet' || (paymentMethod === 'card' && !clientSecret && !isProcessing)) && (
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            
            <button
              onClick={handleConfirmPayment}
              disabled={isProcessing || (paymentMethod === 'wallet' && userData.walletBalance < (applicableFee?.total || 0))}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm & Pay'
              )}
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Info Note */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>🔒 Secure payment powered by Stripe & Paddle</p>
          <p className="mt-1">Processing fee is deducted immediately. Voting fee is frozen until election ends.</p>
        </div>
      </div>
    </div>
  );
}
// import React, { useState, useEffect } from 'react';
// import { CreditCard, Wallet, Loader } from 'lucide-react';
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements } from '@stripe/react-stripe-js';
// import { initializePaddle } from '@paddle/paddle-js';
// import StripePaymentForm from './StripePaymentForm';

// // Initialize Stripe
// //const stripePromise = loadStripe(import.meta.env.VITE_REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_your_key');
// const stripePromise = loadStripe(import.meta.env.VITE_REACT_APP_STRIPE_PUBLIC_KEY);

// export default function PaymentModal({
//   isOpen,
//   onClose,
//   electionId,
//   applicableFee,
//   onPaymentSuccess,
// }) {
//   // Local state instead of Redux selectors
//   const [paymentMethod, setPaymentMethod] = useState('card');
//   /*eslint-disable*/
//   const [paymentStatus, setPaymentStatus] = useState('idle');
//   const [clientSecret, setClientSecret] = useState(null);
//   const [paddle, setPaddle] = useState(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState(null);

//   // Get user data from localStorage instead of Redux
//   const getUserData = () => {
//     try {
//       const persistRoot = localStorage.getItem('persist:vottery-root');
//       if (persistRoot) {
//         const parsed = JSON.parse(persistRoot);
//         const authData = parsed.auth ? JSON.parse(parsed.auth) : {};
//         const walletData = parsed.wallet ? JSON.parse(parsed.wallet) : {};
        
//         return {
//           region: authData.userData?.region || authData.userData?.country || 'Unknown',
//           token: authData.token || localStorage.getItem('token'),
//           walletBalance: walletData.balance || 0,
//         };
//       }
//     } catch (err) {
//       console.error('Error reading user data:', err);
//     }
    
//     return {
//       region: 'Unknown',
//       token: localStorage.getItem('token'),
//       walletBalance: 0,
//     };
//   };

//   const userData = getUserData();

//   // Get x-user-data header value
//   const getXUserDataHeader = () => {
//     try {
//       const userDataStr = localStorage.getItem('userData');
//       if (userDataStr) {
//         const userData = JSON.parse(userDataStr);
//         return JSON.stringify({
//           userId: userData.userId,
//           email: userData.email,
//           phone: userData.phone || null,
//           username: userData.username || null,
//           roles: (userData.roles || ['Voter']).map(role => 
//             role === 'ContentCreator' ? 'Content_Creator' : role
//           ),
//           subscriptionType: userData.subscriptionType || 'Free',
//           isSubscribed: userData.isSubscribed || false
//         });
//       }
//     } catch (error) {
//       console.error('Error creating x-user-data header:', error);
//     }
//     return null;
//   };

//   // Initialize Paddle
//   useEffect(() => {
//     let isMounted = true;
    
//     const initPaddle = async () => {
//       try {
//         const paddleToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;
//         if (!paddleToken) {
//           console.warn('Paddle token not configured');
//           return;
//         }

//         const paddleInstance = await initializePaddle({
//           environment: import.meta.env.VITE_REACT_APP_PADDLE_ENVIRONMENT || 'sandbox',
//           token: paddleToken,
//         });
        
//         if (isMounted) {
//           setPaddle(paddleInstance);
//         }
//       } catch (err) {
//         console.error('Paddle initialization failed:', err);
//       }
//     };

//     initPaddle();

//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   // Reset state when modal closes
//   useEffect(() => {
//     if (!isOpen) {
//       setClientSecret(null);
//       setError(null);
//       setPaymentStatus('idle');
//       setIsProcessing(false);
//     }
//   }, [isOpen]);

//   // Create payment intent when modal opens with card payment
//   useEffect(() => {
//     if (isOpen && paymentMethod === 'card' && !clientSecret && applicableFee && electionId && !isProcessing) {
//       createPaymentIntent();
//     }
//   }, [isOpen, paymentMethod]);

//   const createPaymentIntent = async () => {
//     console.log('🔵 createPaymentIntent called with:', {
//       applicableFee,
//       electionId,
//       paymentMethod
//     });

//     if (!applicableFee || !electionId) {
//       setError('Missing payment information');
//       console.error('❌ Missing data:', { applicableFee, electionId });
//       return;
//     }

//     try {
//       setIsProcessing(true);
//       setError(null);
      
//       const apiUrl = import.meta.env.VITE_REACT_APP_PAYMENT_SERVICE_URL || 'http://localhost:5006/api';
//       const xUserData = getXUserDataHeader();
      
//       console.log('📤 Making payment request to:', `${apiUrl}/payments/election/${electionId}/create-intent`);
//       console.log('📤 Request body:', {
//         amount: applicableFee.total,
//         currency: applicableFee.currency?.toLowerCase() || 'usd',
//         region: userData.region,
//         processingFee: applicableFee.processingFee,
//         frozenAmount: applicableFee.frozenAmount,
//       });
      
//       const response = await fetch(`${apiUrl}/payments/election/${electionId}/create-intent`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           ...(userData.token && { 'Authorization': `Bearer ${userData.token}` }),
//           ...(xUserData && { 'x-user-data': xUserData }),
//         },
//         credentials: 'include',
//         body: JSON.stringify({
//           amount: applicableFee.total,
//           currency: applicableFee.currency?.toLowerCase() || 'usd',
//           region: userData.region,
//           processingFee: applicableFee.processingFee,
//           frozenAmount: applicableFee.frozenAmount,
//         }),
//       });

//       console.log('📥 Response status:', response.status);

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('❌ Error response:', errorData);
//         throw new Error(errorData.message || `Payment failed: ${response.statusText}`);
//       }

//       const responseData = await response.json();
//       console.log('📥 RAW SERVER RESPONSE:', responseData);
//       console.log('📥 Response keys:', Object.keys(responseData));

//       // Handle different response formats
//       let clientSecret = null;
//       let paddleTransactionId = null;

//       // Check for successResponse format: { success: true, data: { clientSecret: "..." } }
//       if (responseData.success && responseData.data) {
//         console.log('✅ Found data wrapper (successResponse format)');
//         clientSecret = responseData.data.clientSecret;
//         paddleTransactionId = responseData.data.paddleTransactionId;
//       }
//       // Direct format: { clientSecret: "..." }
//       else if (responseData.clientSecret) {
//         console.log('✅ Found direct clientSecret');
//         clientSecret = responseData.clientSecret;
//       }
//       // Paddle format: { paddleTransactionId: "..." }
//       else if (responseData.paddleTransactionId) {
//         console.log('✅ Found direct paddleTransactionId');
//         paddleTransactionId = responseData.paddleTransactionId;
//       }

//       if (clientSecret) {
//         console.log('✅ Stripe client secret received:', clientSecret.substring(0, 30) + '...');
//         setClientSecret(clientSecret);
//       } else if (paddleTransactionId) {
//         console.log('✅ Paddle transaction ID received:', paddleTransactionId);
//         handlePaddlePayment(paddleTransactionId);
//       } else {
//         console.error('❌ Invalid payment response - no clientSecret or paddleTransactionId');
//         console.error('❌ Full response:', responseData);
//         throw new Error('Invalid payment response from server');
//       }
//     } catch (err) {
//       console.error('❌ Payment intent creation failed:', err);
//       setError(err.message || 'Failed to initialize payment');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handlePaddlePayment = (transactionId) => {
//     if (!paddle) {
//       setError('Paddle payment system not available');
//       return;
//     }

//     try {
//       paddle.Checkout.open({
//         transactionId,
//         successCallback: (data) => {
//           setPaymentStatus('success');
//           onPaymentSuccess?.(data.transaction_id);
//           onClose();
//         },
//         closeCallback: () => {
//           setPaymentStatus('idle');
//         },
//       });
//     } catch (err) {
//       setError('Failed to open Paddle checkout');
//       console.error('Paddle error:', err);
//     }
//   };

//   const handleWalletPayment = async () => {
//     if (userData.walletBalance < applicableFee.total) {
//       setError(`Insufficient wallet balance. Available: ${applicableFee.currency} ${userData.walletBalance.toFixed(2)}`);
//       return;
//     }

//     setIsProcessing(true);
//     setError(null);

//     try {
//       const apiUrl = import.meta.env.VITE_REACT_APP_PAYMENT_SERVICE_URL || 'http://localhost:5006/api';
//       const xUserData = getXUserDataHeader();

//       const response = await fetch(`${apiUrl}/payments/wallet/pay`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           ...(userData.token && { 'Authorization': `Bearer ${userData.token}` }),
//           ...(xUserData && { 'x-user-data': xUserData }),
//         },
//         credentials: 'include',
//         body: JSON.stringify({
//           electionId,
//           amount: applicableFee.total,
//           currency: applicableFee.currency,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || 'Wallet payment failed');
//       }

//       const data = await response.json();
      
//       if (data.success) {
//         setPaymentStatus('success');
//         onPaymentSuccess?.(data.paymentId);
//         onClose();
//       } else {
//         setError(data.message || 'Wallet payment failed');
//       }
//     } catch (err) {
//       console.error('Wallet payment failed:', err);
//       setError(err.message || 'Failed to process wallet payment');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleConfirmPayment = () => {
//     if (paymentMethod === 'wallet') {
//       handleWalletPayment();
//     } else if (paymentMethod === 'card' && !clientSecret) {
//       createPaymentIntent();
//     }
//   };

//   const handlePaymentMethodChange = (method) => {
//     setPaymentMethod(method);
//     setClientSecret(null);
//     setError(null);
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
//         <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Payment</h2>
        
//         {/* Payment Method Selection */}
//         <div className="mb-6">
//           <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
//           <div className="space-y-2">
//             <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
//               <input
//                 type="radio"
//                 name="payment"
//                 value="card"
//                 checked={paymentMethod === 'card'}
//                 onChange={(e) => handlePaymentMethodChange(e.target.value)}
//                 disabled={isProcessing}
//               />
//               <CreditCard size={20} className="text-blue-600" />
//               <div className="flex-1">
//                 <span className="font-medium">Credit/Debit Card</span>
//                 <span className="text-xs text-gray-500 block">Stripe or Paddle</span>
//               </div>
//             </label>
            
//             <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
//               <input
//                 type="radio"
//                 name="payment"
//                 value="wallet"
//                 checked={paymentMethod === 'wallet'}
//                 onChange={(e) => handlePaymentMethodChange(e.target.value)}
//                 disabled={isProcessing}
//               />
//               <Wallet size={20} className="text-green-600" />
//               <div className="flex-1">
//                 <span className="font-medium">Wallet Balance</span>
//                 <div className="text-xs text-gray-500">
//                   Available: {applicableFee?.currency || 'USD'} {userData.walletBalance.toFixed(2)}
//                   {userData.walletBalance < (applicableFee?.total || 0) && (
//                     <span className="text-red-600 ml-2">• Insufficient</span>
//                   )}
//                 </div>
//               </div>
//             </label>
//           </div>
//         </div>

//         {/* Fee Breakdown */}
//         {applicableFee && (
//           <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
//             <div className="space-y-2">
//               <div className="flex justify-between items-center pb-2 border-b border-blue-200">
//                 <span className="text-sm font-medium text-gray-700">Total Payment</span>
//                 <span className="text-2xl font-bold text-blue-900">
//                   {applicableFee.currency} {applicableFee.total.toFixed(2)}
//                 </span>
//               </div>
//               <div className="text-xs text-gray-600 space-y-1">
//                 <div className="flex justify-between">
//                   <span>• Processing Fee ({applicableFee.processingPercentage || 0}%)</span>
//                   <span className="font-medium">{applicableFee.currency} {applicableFee.processingFee.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>• Frozen Amount (held)</span>
//                   <span className="font-medium">{applicableFee.currency} {applicableFee.frozenAmount.toFixed(2)}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Stripe Payment Form */}
//         {paymentMethod === 'card' && clientSecret && (
//           <div className="mb-4">
//             <Elements 
//               stripe={stripePromise} 
//               options={{ 
//                 clientSecret,
//                 appearance: {
//                   theme: 'stripe',
//                   variables: {
//                     colorPrimary: '#2563eb',
//                   },
//                 },
//               }}
//             >
//               <StripePaymentForm
//                 clientSecret={clientSecret}
//                 onSuccess={(paymentId) => {
//                   setPaymentStatus('success');
//                   onPaymentSuccess?.(paymentId);
//                   onClose();
//                 }}
//                 onError={(errorMsg) => setError(errorMsg)}
//               />
//             </Elements>
//           </div>
//         )}

//         {/* Loading State */}
//         {paymentMethod === 'card' && !clientSecret && isProcessing && (
//           <div className="flex items-center justify-center py-8 mb-4">
//             <Loader size={24} className="animate-spin text-blue-600" />
//             <span className="ml-2 text-gray-600">Initializing payment...</span>
//           </div>
//         )}

//         {/* Action Buttons */}
//         {(paymentMethod === 'wallet' || (paymentMethod === 'card' && !clientSecret && !isProcessing)) && (
//           <div className="flex gap-3">
//             <button
//               onClick={onClose}
//               disabled={isProcessing}
//               className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-colors disabled:opacity-50"
//             >
//               Cancel
//             </button>
            
//             <button
//               onClick={handleConfirmPayment}
//               disabled={isProcessing || (paymentMethod === 'wallet' && userData.walletBalance < (applicableFee?.total || 0))}
//               className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
//             >
//               {isProcessing ? (
//                 <>
//                   <Loader size={16} className="animate-spin" />
//                   Processing...
//                 </>
//               ) : (
//                 'Confirm & Pay'
//               )}
//             </button>
//           </div>
//         )}

//         {/* Error Display */}
//         {error && (
//           <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
//             ⚠️ {error}
//           </div>
//         )}

//         {/* Info Note */}
//         <div className="mt-4 text-xs text-gray-500 text-center">
//           <p>🔒 Secure payment powered by Stripe & Paddle</p>
//           <p className="mt-1">Processing fee is deducted immediately. Voting fee is frozen until election ends.</p>
//         </div>
//       </div>
//     </div>
//   );
// }
// import React, { useState, useEffect } from 'react';
// import { CreditCard, Wallet, Loader } from 'lucide-react';
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements } from '@stripe/react-stripe-js';
// import { initializePaddle } from '@paddle/paddle-js';
// import StripePaymentForm from './StripePaymentForm';

// // Initialize Stripe
// const stripePromise = loadStripe(import.meta.env.VITE_REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_your_key');

// export default function PaymentModal({
//   isOpen,
//   onClose,
//   electionId,
//   applicableFee,
//   onPaymentSuccess,
// }) {
//   // Local state instead of Redux selectors
//   const [paymentMethod, setPaymentMethod] = useState('card');
//   /*eslint-disable*/
//   const [paymentStatus, setPaymentStatus] = useState('idle');
//   const [clientSecret, setClientSecret] = useState(null);
//   const [paddle, setPaddle] = useState(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState(null);

//   // Get user data from localStorage instead of Redux
//   const getUserData = () => {
//     try {
//       const persistRoot = localStorage.getItem('persist:vottery-root');
//       if (persistRoot) {
//         const parsed = JSON.parse(persistRoot);
//         const authData = parsed.auth ? JSON.parse(parsed.auth) : {};
//         const walletData = parsed.wallet ? JSON.parse(parsed.wallet) : {};
        
//         return {
//           region: authData.userData?.region || authData.userData?.country || 'Unknown',
//           token: authData.token || localStorage.getItem('token'),
//           walletBalance: walletData.balance || 0,
//         };
//       }
//     } catch (err) {
//       console.error('Error reading user data:', err);
//     }
    
//     return {
//       region: 'Unknown',
//       token: localStorage.getItem('token'),
//       walletBalance: 0,
//     };
//   };

//   const userData = getUserData();

//   // Get x-user-data header value
//   const getXUserDataHeader = () => {
//     try {
//       const userDataStr = localStorage.getItem('userData');
//       if (userDataStr) {
//         const userData = JSON.parse(userDataStr);
//         return JSON.stringify({
//           userId: userData.userId,
//           email: userData.email,
//           phone: userData.phone || null,
//           username: userData.username || null,
//           roles: (userData.roles || ['Voter']).map(role => 
//             role === 'ContentCreator' ? 'Content_Creator' : role
//           ),
//           subscriptionType: userData.subscriptionType || 'Free',
//           isSubscribed: userData.isSubscribed || false
//         });
//       }
//     } catch (error) {
//       console.error('Error creating x-user-data header:', error);
//     }
//     return null;
//   };

//   // Initialize Paddle
//   useEffect(() => {
//     let isMounted = true;
    
//     const initPaddle = async () => {
//       try {
//         const paddleToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;
//         if (!paddleToken) {
//           console.warn('Paddle token not configured');
//           return;
//         }

//         const paddleInstance = await initializePaddle({
//           environment: import.meta.env.VITE_REACT_APP_PADDLE_ENVIRONMENT || 'sandbox',
//           token: paddleToken,
//         });
        
//         if (isMounted) {
//           setPaddle(paddleInstance);
//         }
//       } catch (err) {
//         console.error('Paddle initialization failed:', err);
//       }
//     };

//     initPaddle();

//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   // Reset state when modal closes
//   useEffect(() => {
//     if (!isOpen) {
//       setClientSecret(null);
//       setError(null);
//       setPaymentStatus('idle');
//       setIsProcessing(false);
//     }
//   }, [isOpen]);

//   // Create payment intent when modal opens with card payment
//   useEffect(() => {
//     if (isOpen && paymentMethod === 'card' && !clientSecret && applicableFee && electionId && !isProcessing) {
//       createPaymentIntent();
//     }
//   }, [isOpen, paymentMethod]);

//   const createPaymentIntent = async () => {
//     if (!applicableFee || !electionId) {
//       setError('Missing payment information');
//       return;
//     }

//     try {
//       setIsProcessing(true);
//       setError(null);
      
//       const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:4003/api';
//       const xUserData = getXUserDataHeader();
      
//       const response = await fetch(`${apiUrl}/payments/election/${electionId}/create-intent`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           ...(userData.token && { 'Authorization': `Bearer ${userData.token}` }),
//           ...(xUserData && { 'x-user-data': xUserData }),
//         },
//         credentials: 'include',
//         body: JSON.stringify({
//           amount: applicableFee.total,
//           currency: applicableFee.currency?.toLowerCase() || 'usd',
//           region: userData.region,
//           processingFee: applicableFee.processingFee,
//           frozenAmount: applicableFee.frozenAmount,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || `Payment failed: ${response.statusText}`);
//       }

//       const data = await response.json();
      
//       if (data.clientSecret) {
//         setClientSecret(data.clientSecret);
//       } else if (data.paddleTransactionId) {
//         handlePaddlePayment(data.paddleTransactionId);
//       } else {
//         throw new Error('Invalid payment response from server');
//       }
//     } catch (err) {
//       console.error('Payment intent creation failed:', err);
//       setError(err.message || 'Failed to initialize payment');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handlePaddlePayment = (transactionId) => {
//     if (!paddle) {
//       setError('Paddle payment system not available');
//       return;
//     }

//     try {
//       paddle.Checkout.open({
//         transactionId,
//         successCallback: (data) => {
//           setPaymentStatus('success');
//           onPaymentSuccess?.(data.transaction_id);
//           onClose();
//         },
//         closeCallback: () => {
//           setPaymentStatus('idle');
//         },
//       });
//     } catch (err) {
//       setError('Failed to open Paddle checkout');
//       console.error('Paddle error:', err);
//     }
//   };

//   const handleWalletPayment = async () => {
//     if (userData.walletBalance < applicableFee.total) {
//       setError(`Insufficient wallet balance. Available: ${applicableFee.currency} ${userData.walletBalance.toFixed(2)}`);
//       return;
//     }

//     setIsProcessing(true);
//     setError(null);

//     try {
//       const apiUrl = import.meta.VITE_REACT_APP_API_URL || 'http://localhost:5006/api';
//       const xUserData = getXUserDataHeader();

//       const response = await fetch(`${apiUrl}/payments/wallet/pay`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           ...(userData.token && { 'Authorization': `Bearer ${userData.token}` }),
//           ...(xUserData && { 'x-user-data': xUserData }),
//         },
//         credentials: 'include',
//         body: JSON.stringify({
//           electionId,
//           amount: applicableFee.total,
//           currency: applicableFee.currency,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || 'Wallet payment failed');
//       }

//       const data = await response.json();
      
//       if (data.success) {
//         setPaymentStatus('success');
//         onPaymentSuccess?.(data.paymentId);
//         onClose();
//       } else {
//         setError(data.message || 'Wallet payment failed');
//       }
//     } catch (err) {
//       console.error('Wallet payment failed:', err);
//       setError(err.message || 'Failed to process wallet payment');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleConfirmPayment = () => {
//     if (paymentMethod === 'wallet') {
//       handleWalletPayment();
//     } else if (paymentMethod === 'card' && !clientSecret) {
//       createPaymentIntent();
//     }
//   };

//   const handlePaymentMethodChange = (method) => {
//     setPaymentMethod(method);
//     setClientSecret(null);
//     setError(null);
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
//         <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Payment</h2>
        
//         {/* Payment Method Selection */}
//         <div className="mb-6">
//           <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
//           <div className="space-y-2">
//             <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
//               <input
//                 type="radio"
//                 name="payment"
//                 value="card"
//                 checked={paymentMethod === 'card'}
//                 onChange={(e) => handlePaymentMethodChange(e.target.value)}
//                 disabled={isProcessing}
//               />
//               <CreditCard size={20} className="text-blue-600" />
//               <div className="flex-1">
//                 <span className="font-medium">Credit/Debit Card</span>
//                 <span className="text-xs text-gray-500 block">Stripe or Paddle</span>
//               </div>
//             </label>
            
//             <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
//               <input
//                 type="radio"
//                 name="payment"
//                 value="wallet"
//                 checked={paymentMethod === 'wallet'}
//                 onChange={(e) => handlePaymentMethodChange(e.target.value)}
//                 disabled={isProcessing}
//               />
//               <Wallet size={20} className="text-green-600" />
//               <div className="flex-1">
//                 <span className="font-medium">Wallet Balance</span>
//                 <div className="text-xs text-gray-500">
//                   Available: {applicableFee?.currency || 'USD'} {userData.walletBalance.toFixed(2)}
//                   {userData.walletBalance < (applicableFee?.total || 0) && (
//                     <span className="text-red-600 ml-2">• Insufficient</span>
//                   )}
//                 </div>
//               </div>
//             </label>
//           </div>
//         </div>

//         {/* Fee Breakdown */}
//         {applicableFee && (
//           <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
//             <div className="space-y-2">
//               <div className="flex justify-between items-center pb-2 border-b border-blue-200">
//                 <span className="text-sm font-medium text-gray-700">Total Payment</span>
//                 <span className="text-2xl font-bold text-blue-900">
//                   {applicableFee.currency} {applicableFee.total.toFixed(2)}
//                 </span>
//               </div>
//               <div className="text-xs text-gray-600 space-y-1">
//                 <div className="flex justify-between">
//                   <span>• Processing Fee ({applicableFee.processingPercentage || 0}%)</span>
//                   <span className="font-medium">{applicableFee.currency} {applicableFee.processingFee.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>• Frozen Amount (held)</span>
//                   <span className="font-medium">{applicableFee.currency} {applicableFee.frozenAmount.toFixed(2)}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Stripe Payment Form */}
//         {paymentMethod === 'card' && clientSecret && (
//           <div className="mb-4">
//             <Elements 
//               stripe={stripePromise} 
//               options={{ 
//                 clientSecret,
//                 appearance: {
//                   theme: 'stripe',
//                   variables: {
//                     colorPrimary: '#2563eb',
//                   },
//                 },
//               }}
//             >
//               <StripePaymentForm
//                 clientSecret={clientSecret}
//                 onSuccess={(paymentId) => {
//                   setPaymentStatus('success');
//                   onPaymentSuccess?.(paymentId);
//                   onClose();
//                 }}
//                 onError={(errorMsg) => setError(errorMsg)}
//               />
//             </Elements>
//           </div>
//         )}

//         {/* Loading State */}
//         {paymentMethod === 'card' && !clientSecret && isProcessing && (
//           <div className="flex items-center justify-center py-8 mb-4">
//             <Loader size={24} className="animate-spin text-blue-600" />
//             <span className="ml-2 text-gray-600">Initializing payment...</span>
//           </div>
//         )}

//         {/* Action Buttons */}
//         {(paymentMethod === 'wallet' || (paymentMethod === 'card' && !clientSecret && !isProcessing)) && (
//           <div className="flex gap-3">
//             <button
//               onClick={onClose}
//               disabled={isProcessing}
//               className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-colors disabled:opacity-50"
//             >
//               Cancel
//             </button>
            
//             <button
//               onClick={handleConfirmPayment}
//               disabled={isProcessing || (paymentMethod === 'wallet' && userData.walletBalance < (applicableFee?.total || 0))}
//               className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
//             >
//               {isProcessing ? (
//                 <>
//                   <Loader size={16} className="animate-spin" />
//                   Processing...
//                 </>
//               ) : (
//                 'Confirm & Pay'
//               )}
//             </button>
//           </div>
//         )}

//         {/* Error Display */}
//         {error && (
//           <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
//             ⚠️ {error}
//           </div>
//         )}

//         {/* Info Note */}
//         <div className="mt-4 text-xs text-gray-500 text-center">
//           <p>🔒 Secure payment powered by Stripe & Paddle</p>
//           <p className="mt-1">Processing fee is deducted immediately. Voting fee is frozen until election ends.</p>
//         </div>
//       </div>
//     </div>
//   );
// }
// import React, { useState, useEffect } from 'react';
// import { CreditCard, Wallet, Loader } from 'lucide-react';
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements } from '@stripe/react-stripe-js';
// import { initializePaddle } from '@paddle/paddle-js';
// import StripePaymentForm from './StripePaymentForm';

// // Initialize Stripe
// const stripePromise = loadStripe(import.meta.env.VITE_REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_your_key');

// export default function PaymentModal({
//   isOpen,
//   onClose,
//   electionId,
//   applicableFee,
//   onPaymentSuccess,
// }) {
//   // Local state instead of Redux selectors
//   const [paymentMethod, setPaymentMethod] = useState('card');
//   /*eslint-disable*/
//   const [paymentStatus, setPaymentStatus] = useState('idle');
//   const [clientSecret, setClientSecret] = useState(null);
//   const [paddle, setPaddle] = useState(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState(null);

//   // Get user data from localStorage instead of Redux
//   const getUserData = () => {
//     try {
//       const persistRoot = localStorage.getItem('persist:vottery-root');
//       if (persistRoot) {
//         const parsed = JSON.parse(persistRoot);
//         const authData = parsed.auth ? JSON.parse(parsed.auth) : {};
//         const walletData = parsed.wallet ? JSON.parse(parsed.wallet) : {};
        
//         return {
//           region: authData.userData?.region || authData.userData?.country || 'Unknown',
//           token: authData.token || localStorage.getItem('token'),
//           walletBalance: walletData.balance || 0,
//         };
//       }
//     } catch (err) {
//       console.error('Error reading user data:', err);
//     }
    
//     return {
//       region: 'Unknown',
//       token: localStorage.getItem('token'),
//       walletBalance: 0,
//     };
//   };

//   const userData = getUserData();

//   // Initialize Paddle
//   useEffect(() => {
//     let isMounted = true;
    
//     const initPaddle = async () => {
//       try {
//         const paddleToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;
//         if (!paddleToken) {
//           console.warn('Paddle token not configured');
//           return;
//         }

//         const paddleInstance = await initializePaddle({
//           environment: import.meta.env.VITE_REACT_APP_PADDLE_ENVIRONMENT || 'sandbox',
//           token: paddleToken,
//         });
        
//         if (isMounted) {
//           setPaddle(paddleInstance);
//         }
//       } catch (err) {
//         console.error('Paddle initialization failed:', err);
//       }
//     };

//     initPaddle();

//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   // Reset state when modal closes
//   useEffect(() => {
//     if (!isOpen) {
//       setClientSecret(null);
//       setError(null);
//       setPaymentStatus('idle');
//       setIsProcessing(false);
//     }
//   }, [isOpen]);

//   // Create payment intent when modal opens with card payment
//   useEffect(() => {
//     if (isOpen && paymentMethod === 'card' && !clientSecret && applicableFee && electionId && !isProcessing) {
//       createPaymentIntent();
//     }
//   }, [isOpen, paymentMethod]);

//   const createPaymentIntent = async () => {
//     if (!applicableFee || !electionId) {
//       setError('Missing payment information');
//       return;
//     }

//     try {
//       setIsProcessing(true);
//       setError(null);
      
//       const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4003/api';
      
//       const response = await fetch(`${apiUrl}/payment/election/${electionId}/create-intent`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           ...(userData.token && { 'Authorization': `Bearer ${userData.token}` }),
//         },
//         credentials: 'include',
//         body: JSON.stringify({
//           amount: applicableFee.total,
//           currency: applicableFee.currency?.toLowerCase() || 'usd',
//           region: userData.region,
//           processingFee: applicableFee.processingFee,
//           frozenAmount: applicableFee.frozenAmount,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || `Payment failed: ${response.statusText}`);
//       }

//       const data = await response.json();
      
//       if (data.clientSecret) {
//         setClientSecret(data.clientSecret);
//       } else if (data.paddleTransactionId) {
//         handlePaddlePayment(data.paddleTransactionId);
//       } else {
//         throw new Error('Invalid payment response from server');
//       }
//     } catch (err) {
//       console.error('Payment intent creation failed:', err);
//       setError(err.message || 'Failed to initialize payment');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handlePaddlePayment = (transactionId) => {
//     if (!paddle) {
//       setError('Paddle payment system not available');
//       return;
//     }

//     try {
//       paddle.Checkout.open({
//         transactionId,
//         successCallback: (data) => {
//           setPaymentStatus('success');
//           onPaymentSuccess?.(data.transaction_id);
//           onClose();
//         },
//         closeCallback: () => {
//           setPaymentStatus('idle');
//         },
//       });
//     } catch (err) {
//       setError('Failed to open Paddle checkout');
//       console.error('Paddle error:', err);
//     }
//   };

//   const handleWalletPayment = async () => {
//     if (userData.walletBalance < applicableFee.total) {
//       setError(`Insufficient wallet balance. Available: ${applicableFee.currency} ${userData.walletBalance.toFixed(2)}`);
//       return;
//     }

//     setIsProcessing(true);
//     setError(null);

//     try {
//       const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4003/api';

//       const response = await fetch(`${apiUrl}/wallet/pay`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           ...(userData.token && { 'Authorization': `Bearer ${userData.token}` }),
//         },
//         credentials: 'include',
//         body: JSON.stringify({
//           electionId,
//           amount: applicableFee.total,
//           currency: applicableFee.currency,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || 'Wallet payment failed');
//       }

//       const data = await response.json();
      
//       if (data.success) {
//         setPaymentStatus('success');
//         onPaymentSuccess?.(data.paymentId);
//         onClose();
//       } else {
//         setError(data.message || 'Wallet payment failed');
//       }
//     } catch (err) {
//       console.error('Wallet payment failed:', err);
//       setError(err.message || 'Failed to process wallet payment');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleConfirmPayment = () => {
//     if (paymentMethod === 'wallet') {
//       handleWalletPayment();
//     } else if (paymentMethod === 'card' && !clientSecret) {
//       createPaymentIntent();
//     }
//   };

//   const handlePaymentMethodChange = (method) => {
//     setPaymentMethod(method);
//     setClientSecret(null);
//     setError(null);
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
//         <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Payment</h2>
        
//         {/* Payment Method Selection */}
//         <div className="mb-6">
//           <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
//           <div className="space-y-2">
//             <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
//               <input
//                 type="radio"
//                 name="payment"
//                 value="card"
//                 checked={paymentMethod === 'card'}
//                 onChange={(e) => handlePaymentMethodChange(e.target.value)}
//                 disabled={isProcessing}
//               />
//               <CreditCard size={20} className="text-blue-600" />
//               <div className="flex-1">
//                 <span className="font-medium">Credit/Debit Card</span>
//                 <span className="text-xs text-gray-500 block">Stripe or Paddle</span>
//               </div>
//             </label>
            
//             <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
//               <input
//                 type="radio"
//                 name="payment"
//                 value="wallet"
//                 checked={paymentMethod === 'wallet'}
//                 onChange={(e) => handlePaymentMethodChange(e.target.value)}
//                 disabled={isProcessing}
//               />
//               <Wallet size={20} className="text-green-600" />
//               <div className="flex-1">
//                 <span className="font-medium">Wallet Balance</span>
//                 <div className="text-xs text-gray-500">
//                   Available: {applicableFee?.currency || 'USD'} {userData.walletBalance.toFixed(2)}
//                   {userData.walletBalance < (applicableFee?.total || 0) && (
//                     <span className="text-red-600 ml-2">• Insufficient</span>
//                   )}
//                 </div>
//               </div>
//             </label>
//           </div>
//         </div>

//         {/* Fee Breakdown */}
//         {applicableFee && (
//           <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
//             <div className="space-y-2">
//               <div className="flex justify-between items-center pb-2 border-b border-blue-200">
//                 <span className="text-sm font-medium text-gray-700">Total Payment</span>
//                 <span className="text-2xl font-bold text-blue-900">
//                   {applicableFee.currency} {applicableFee.total.toFixed(2)}
//                 </span>
//               </div>
//               <div className="text-xs text-gray-600 space-y-1">
//                 <div className="flex justify-between">
//                   <span>• Processing Fee ({applicableFee.processingPercentage || 0}%)</span>
//                   <span className="font-medium">{applicableFee.currency} {applicableFee.processingFee.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>• Frozen Amount (held)</span>
//                   <span className="font-medium">{applicableFee.currency} {applicableFee.frozenAmount.toFixed(2)}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Stripe Payment Form */}
//         {paymentMethod === 'card' && clientSecret && (
//           <div className="mb-4">
//             <Elements 
//               stripe={stripePromise} 
//               options={{ 
//                 clientSecret,
//                 appearance: {
//                   theme: 'stripe',
//                   variables: {
//                     colorPrimary: '#2563eb',
//                   },
//                 },
//               }}
//             >
//               <StripePaymentForm
//                 clientSecret={clientSecret}
//                 onSuccess={(paymentId) => {
//                   setPaymentStatus('success');
//                   onPaymentSuccess?.(paymentId);
//                   onClose();
//                 }}
//                 onError={(errorMsg) => setError(errorMsg)}
//               />
//             </Elements>
//           </div>
//         )}

//         {/* Loading State */}
//         {paymentMethod === 'card' && !clientSecret && isProcessing && (
//           <div className="flex items-center justify-center py-8 mb-4">
//             <Loader size={24} className="animate-spin text-blue-600" />
//             <span className="ml-2 text-gray-600">Initializing payment...</span>
//           </div>
//         )}

//         {/* Action Buttons */}
//         {(paymentMethod === 'wallet' || (paymentMethod === 'card' && !clientSecret && !isProcessing)) && (
//           <div className="flex gap-3">
//             <button
//               onClick={onClose}
//               disabled={isProcessing}
//               className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-colors disabled:opacity-50"
//             >
//               Cancel
//             </button>
            
//             <button
//               onClick={handleConfirmPayment}
//               disabled={isProcessing || (paymentMethod === 'wallet' && userData.walletBalance < (applicableFee?.total || 0))}
//               className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
//             >
//               {isProcessing ? (
//                 <>
//                   <Loader size={16} className="animate-spin" />
//                   Processing...
//                 </>
//               ) : (
//                 'Confirm & Pay'
//               )}
//             </button>
//           </div>
//         )}

//         {/* Error Display */}
//         {error && (
//           <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
//             ⚠️ {error}
//           </div>
//         )}

//         {/* Info Note */}
//         <div className="mt-4 text-xs text-gray-500 text-center">
//           <p>🔒 Secure payment powered by Stripe & Paddle</p>
//           <p className="mt-1">Processing fee is deducted immediately. Voting fee is frozen until election ends.</p>
//         </div>
//       </div>
//     </div>
//   );
// }
// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { CreditCard, Wallet, Loader } from 'lucide-react';
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements } from '@stripe/react-stripe-js';
// import { initializePaddle } from '@paddle/paddle-js';
// import StripePaymentForm from './StripePaymentForm';
// import PaddlePaymentButton from './PaddlePaymentButton';
// // import {
// //   useCreateStripeIntentMutation,
// //   useCreatePaddlePaymentMutation,
// //   useProcessWalletPaymentMutation,
// // // } from '../../redux/api/payment/paymentApi';
// // import {
// //   setPaymentMethod,
// //   setGateway,
// //   setPaymentStatus,
// //   setPaymentError,
// // } from '../../redux/slices/paymentSlice';
// import { useCreatePaddlePaymentMutation, useCreateStripeIntentMutation, useProcessWalletPaymentMutation } from '../../../redux/api/payment/paymentApi';
// import { setGateway, setPaymentError, setPaymentMethod } from '../../../redux/slices/paymentSlice';
// import { setPaymentStatus } from '../../../redux/slices/subscriptionSlice';

// // Initialize Stripe
// const stripePromise = loadStripe(import.meta.env.VITE_REACT_APP_STRIPE_PUBLIC_KEY);

// export default function PaymentModal({
//   isOpen,
//   onClose,
//   electionId,
//   applicableFee,
//   onPaymentSuccess,
// }) {
//   const dispatch = useDispatch();
//   const { paymentMethod, paymentStatus } = useSelector((state) => state.payment);
//   const userRegion = useSelector((state) => state.auth?.userData?.region);
//   const walletBalance = useSelector((state) => state.wallet?.balance || 0);

//   const [createStripeIntent, { data: stripeData, isLoading: stripeLoading }] = useCreateStripeIntentMutation();
//   const [createPaddlePayment, { isLoading: paddleLoading }] = useCreatePaddlePaymentMutation();
//   const [processWallet, { isLoading: walletLoading }] = useProcessWalletPaymentMutation();
  
//   const [paddle, setPaddle] = useState(null);
//   const [activeGateway, setActiveGateway] = useState(null); // Determined by backend/region

//   // Initialize Paddle
//   useEffect(() => {
//     initializePaddle({
//       environment: import.meta.env.REACT_APP_PADDLE_ENVIRONMENT || 'sandbox',
//       token: import.meta.env.VITE_REACT_APP_PADDLE_CLIENT_TOKEN,
//     }).then((paddleInstance) => {
//       setPaddle(paddleInstance);
//     });
//   }, []);

//   // Determine gateway based on region (you can fetch this from backend)
//   useEffect(() => {
//     if (isOpen && applicableFee) {
//       // This should come from your backend based on region
//       // For now, using simple logic
//       const gateway = determineGatewayForRegion(userRegion);
//       setActiveGateway(gateway);
//       dispatch(setGateway(gateway));
//     }
//   }, [isOpen, userRegion, applicableFee]);

//   const determineGatewayForRegion = (region) => {
//     // This should match your backend logic
//     // Example: Region 1-4 uses Stripe, Region 5-8 uses Paddle
//     const regionNumber = parseInt(region?.replace('Region ', ''));
//     return regionNumber <= 4 ? 'stripe' : 'paddle';
//   };

//   const handlePaymentMethodChange = (method) => {
//     dispatch(setPaymentMethod(method));
//   };

//   const handleConfirmPayment = async () => {
//     if (!applicableFee || !electionId) return;

//     dispatch(setPaymentStatus('processing'));

//     try {
//       if (paymentMethod === 'wallet') {
//         await handleWalletPayment();
//       } else if (activeGateway === 'stripe') {
//         await handleStripePayment();
//       } else if (activeGateway === 'paddle') {
//         await handlePaddlePayment();
//       }
//     } catch (error) {
//       console.error('Payment error:', error);
//       dispatch(setPaymentError(error.message || 'Payment failed'));
//     }
//   };

//   const handleWalletPayment = async () => {
//     if (walletBalance < applicableFee.total) {
//       dispatch(setPaymentError('Insufficient wallet balance'));
//       return;
//     }

//     const result = await processWallet({
//       electionId,
//       amount: applicableFee.total,
//       currency: applicableFee.currency,
//     }).unwrap();

//     if (result.success) {
//       dispatch(setPaymentStatus('success'));
//       onPaymentSuccess?.(result.paymentId);
//       onClose();
//     }
//   };

//   const handleStripePayment = async () => {
//     // Create payment intent
//     /*eslint-disable*/
//     const intent = await createStripeIntent({
//       electionId,
//       amount: applicableFee.total,
//       currency: applicableFee.currency.toLowerCase(),
//       region: userRegion,
//     }).unwrap();

//     // Stripe form will handle the actual payment
//     // This is just to create the intent
//   };

//   const handlePaddlePayment = async () => {
//     if (!paddle) {
//       dispatch(setPaymentError('Paddle not initialized'));
//       return;
//     }

//     const paymentData = await createPaddlePayment({
//       electionId,
//       amount: applicableFee.total,
//       currency: applicableFee.currency,
//       region: userRegion,
//     }).unwrap();

//     // Open Paddle checkout
//     paddle.Checkout.open({
//       transactionId: paymentData.transactionId,
//       successCallback: (data) => {
//         dispatch(setPaymentStatus('success'));
//         onPaymentSuccess?.(data.payment_id);
//         onClose();
//       },
//       closeCallback: () => {
//         dispatch(setPaymentStatus('idle'));
//       },
//     });
//   };

//   if (!isOpen) return null;

//   const isProcessing = stripeLoading || paddleLoading || walletLoading || paymentStatus === 'processing';

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg max-w-md w-full p-6">
//         <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Payment</h2>
        
//         {/* Payment Method Selection */}
//         <div className="mb-6">
//           <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
//           <div className="space-y-2">
//             <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400">
//               <input
//                 type="radio"
//                 name="payment"
//                 value="card"
//                 checked={paymentMethod === 'card'}
//                 onChange={(e) => handlePaymentMethodChange(e.target.value)}
//                 disabled={isProcessing}
//               />
//               <CreditCard size={20} />
//               <div className="flex-1">
//                 <span>Credit/Debit Card</span>
//                 <span className="text-xs text-gray-500 ml-2">
//                   ({activeGateway === 'stripe' ? 'Stripe' : 'Paddle'})
//                 </span>
//               </div>
//             </label>
            
//             <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400">
//               <input
//                 type="radio"
//                 name="payment"
//                 value="wallet"
//                 checked={paymentMethod === 'wallet'}
//                 onChange={(e) => handlePaymentMethodChange(e.target.value)}
//                 disabled={isProcessing}
//               />
//               <Wallet size={20} />
//               <div className="flex-1">
//                 <span>Wallet Balance</span>
//                 <span className="text-xs text-gray-500 ml-2">
//                   (Available: {applicableFee?.currency} {walletBalance.toFixed(2)})
//                 </span>
//               </div>
//               {walletBalance < applicableFee?.total && (
//                 <span className="text-xs text-red-600">Insufficient</span>
//               )}
//             </label>
//           </div>
//         </div>

//         {/* Fee Breakdown */}
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
//           <div className="space-y-2">
//             <div className="flex justify-between items-center">
//               <span className="text-sm text-gray-700">Total Payment:</span>
//               <span className="text-xl font-bold text-blue-900">
//                 {applicableFee?.currency} {applicableFee?.total.toFixed(2)}
//               </span>
//             </div>
//             <div className="text-xs text-gray-600 border-t pt-2">
//               <p>• Processing Fee: {applicableFee?.currency} {applicableFee?.processingFee.toFixed(2)}</p>
//               <p>• Frozen Amount: {applicableFee?.currency} {applicableFee?.frozenAmount.toFixed(2)}</p>
//             </div>
//           </div>
//         </div>

//         {/* Stripe Payment Form */}
//         {paymentMethod === 'card' && activeGateway === 'stripe' && stripeData?.clientSecret && (
//           <Elements stripe={stripePromise} options={{ clientSecret: stripeData.clientSecret }}>
//             <StripePaymentForm
//               clientSecret={stripeData.clientSecret}
//               onSuccess={(paymentId) => {
//                 dispatch(setPaymentStatus('success'));
//                 onPaymentSuccess?.(paymentId);
//                 onClose();
//               }}
//               onError={(error) => dispatch(setPaymentError(error))}
//             />
//           </Elements>
//         )}

//         {/* Action Buttons */}
//         <div className="flex gap-3">
//           <button
//             onClick={onClose}
//             disabled={isProcessing}
//             className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-semibold transition-colors disabled:opacity-50"
//           >
//             Cancel
//           </button>
          
//           {paymentMethod === 'wallet' || (paymentMethod === 'card' && activeGateway === 'paddle') ? (
//             <button
//               onClick={handleConfirmPayment}
//               disabled={isProcessing || (paymentMethod === 'wallet' && walletBalance < applicableFee?.total)}
//               className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
//             >
//               {isProcessing ? (
//                 <>
//                   <Loader size={16} className="animate-spin" />
//                   Processing...
//                 </>
//               ) : (
//                 'Confirm & Pay'
//               )}
//             </button>
//           ) : null}
//         </div>

//         {/* Error Display */}
//         {paymentStatus === 'failed' && (
//           <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
//             Payment failed. Please try again.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
// import React from 'react';
// import { CreditCard, Wallet } from 'lucide-react';

// export default function PaymentModal({
//   isOpen,
//   onClose,
//   applicableFee,
//   paymentMethod,
//   setPaymentMethod,
//   onConfirm,
//   votingInProgress
// }) {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg max-w-md w-full p-6">
//         <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Payment</h2>
        
//         <div className="mb-6">
//           <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
//           <div className="space-y-2">
//             <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400">
//               <input
//                 type="radio"
//                 name="payment"
//                 value="card"
//                 checked={paymentMethod === 'card'}
//                 onChange={(e) => setPaymentMethod(e.target.value)}
//               />
//               <CreditCard size={20} />
//               <span>Credit/Debit Card</span>
//             </label>
//             <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400">
//               <input
//                 type="radio"
//                 name="payment"
//                 value="wallet"
//                 checked={paymentMethod === 'wallet'}
//                 onChange={(e) => setPaymentMethod(e.target.value)}
//               />
//               <Wallet size={20} />
//               <span>Wallet Balance</span>
//             </label>
//           </div>
//         </div>

//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
//           <div className="space-y-2">
//             <div className="flex justify-between items-center">
//               <span className="text-sm text-gray-700">Total Payment:</span>
//               <span className="text-xl font-bold text-blue-900">
//                 {applicableFee?.currency} {applicableFee?.total.toFixed(2)}
//               </span>
//             </div>
//             <div className="text-xs text-gray-600 border-t pt-2">
//               <p>• Processing: {applicableFee?.currency} {applicableFee?.processingFee.toFixed(2)}</p>
//               <p>• Frozen: {applicableFee?.currency} {applicableFee?.frozenAmount.toFixed(2)}</p>
//             </div>
//           </div>
//         </div>

//         <div className="flex gap-3">
//           <button
//             onClick={onClose}
//             className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-semibold transition-colors"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={onConfirm}
//             disabled={votingInProgress}
//             className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:bg-gray-400"
//           >
//             {votingInProgress ? 'Processing...' : 'Confirm & Pay'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }