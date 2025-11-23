// src/pages/voting/payment/ElectionPaymentPage.jsx
// ✅ Handles payment for election participation fees using WALLET SERVICE

import React, { useState } from 'react';
/*eslint-disable*/
import { useSelector } from 'react-redux';
// import { 
//   usePayForElectionMutation, 
//   useConfirmElectionPaymentMutation 
// } from '../../../redux/api/walllet/walletApi';
//import { useGetWalletQuery } from '../../../redux/api/walllet/walletApi';
import { CreditCard, Wallet, DollarSign, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useConfirmElectionPaymentMutation, useGetWalletQuery, usePayForElectionMutation } from '../../../redux/api/walllet/wallletApi';

// ✅ FIXED: Use correct environment variable
const stripePromise = loadStripe(import.meta.env.VITE_REACT_APP_STRIPE_PUBLIC_KEY);


function PaymentMethodSelector({ selectedMethod, onMethodChange, walletBalance }) {
  return (
    <div className="space-y-4 mb-6">
      <h3 className="font-semibold text-gray-700 mb-3">Select Payment Method</h3>

      {/* Stripe Card Payment */}
      <button
        onClick={() => onMethodChange('stripe')}
        className={`w-full p-4 rounded-lg border-2 transition-all ${
          selectedMethod === 'stripe'
            ? 'border-blue-600 bg-blue-50'
            : 'border-gray-200 hover:border-blue-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <CreditCard className={selectedMethod === 'stripe' ? 'text-blue-600' : 'text-gray-600'} />
          <div className="text-left">
            <p className="font-semibold">Credit/Debit Card</p>
            <p className="text-sm text-gray-600">Pay securely with Stripe</p>
          </div>
          {selectedMethod === 'stripe' && (
            <CheckCircle className="ml-auto text-blue-600" size={20} />
          )}
        </div>
      </button>

      {/* ❌ PADDLE - COMMENTED OUT FOR LATER
      <button
        onClick={() => onMethodChange('paddle')}
        className={`w-full p-4 rounded-lg border-2 transition-all ${
          selectedMethod === 'paddle'
            ? 'border-purple-600 bg-purple-50'
            : 'border-gray-200 hover:border-purple-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <DollarSign className={selectedMethod === 'paddle' ? 'text-purple-600' : 'text-gray-600'} />
          <div className="text-left">
            <p className="font-semibold">Paddle Payment</p>
            <p className="text-sm text-gray-600">Alternative payment method</p>
          </div>
          {selectedMethod === 'paddle' && (
            <CheckCircle className="ml-auto text-purple-600" size={20} />
          )}
        </div>
      </button>
      */}

      {/* Wallet Payment */}
      <button
        onClick={() => onMethodChange('wallet')}
        className={`w-full p-4 rounded-lg border-2 transition-all ${
          selectedMethod === 'wallet'
            ? 'border-green-600 bg-green-50'
            : 'border-gray-200 hover:border-green-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <Wallet className={selectedMethod === 'wallet' ? 'text-green-600' : 'text-gray-600'} />
          <div className="text-left flex-1">
            <p className="font-semibold">Vottery Wallet</p>
            <p className="text-sm text-gray-600">Balance: ${walletBalance?.toFixed(2) || '0.00'}</p>
          </div>
          {selectedMethod === 'wallet' && (
            <CheckCircle className="ml-auto text-green-600" size={20} />
          )}
        </div>
      </button>
    </div>
  );
}


function StripeCardForm({ amount, electionId, regionCode, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  
  // ✅ Use Redux mutations
  const [payForElection] = usePayForElectionMutation();
  const [confirmElectionPayment] = useConfirmElectionPaymentMutation();
  const { refetch: refetchWallet } = useGetWalletQuery();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      onError('Stripe not loaded. Please refresh the page.');
      return;
    }

    setProcessing(true);

    try {
      console.log('💳 Step 1: Creating payment intent...');
      
      // ✅ STEP 1: Create payment intent via Redux
      const result = await payForElection({
        electionId,
        regionCode: regionCode || 'region_1_us_canada',
        paymentGateway: 'stripe' // ✅ Explicitly set gateway
      }).unwrap();

      console.log('✅ Payment intent created:', result);

      // ✅ Check if already paid
      if (result.alreadyPaid || result.payment?.status === 'succeeded') {
        console.log('✅ Payment already completed');
        setProcessing(false);
        onSuccess(result.payment.payment_intent_id || result.paymentIntentId);
        return;
      }

      // ✅ Validate clientSecret
      if (!result.clientSecret) {
        console.error('❌ No client secret received:', result);
        throw new Error('Payment initialization failed. No client secret received.');
      }

      console.log('🔵 Step 2: Confirming payment with Stripe...');

      // ✅ STEP 2: Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(result.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (error) {
        console.error('❌ Stripe confirmation error:', error);
        onError(error.message);
        setProcessing(false);
        return;
      }

      console.log('✅ Stripe payment intent status:', paymentIntent.status);

      if (paymentIntent.status === 'succeeded') {
        console.log('✅ Payment succeeded! Payment Intent ID:', paymentIntent.id);
        
        // ✅ STEP 3: Confirm in backend via Redux mutation
        try {
          console.log('🔵 Step 3: Confirming payment in backend via Redux...');
          
          const confirmResult = await confirmElectionPayment({
            paymentIntentId: paymentIntent.id,
            electionId: electionId
          }).unwrap();
          
          console.log('✅ Backend confirmation successful:', confirmResult);
          
          // ✅ Refetch wallet to show updated balances
          await refetchWallet();
          console.log('✅ Wallet data refreshed');
          
          setProcessing(false);
          onSuccess(paymentIntent.id);
          
        } catch (confirmError) {
          console.error('❌ Backend confirmation error:', confirmError);
          
          // Even if backend confirmation fails, payment succeeded
          // Show success but with warning
          onError('Payment succeeded but wallet update delayed. Please refresh in a moment.');
          setProcessing(false);
        }
        
      } else if (paymentIntent.status === 'requires_action') {
        console.log('⚠️ Payment requires additional action (3D Secure)');
        onError('Payment requires additional verification. Please try again.');
        setProcessing(false);
      } else {
        console.error('❌ Unexpected payment status:', paymentIntent.status);
        onError(`Payment failed with status: ${paymentIntent.status}`);
        setProcessing(false);
      }
    } catch (err) {
      console.error('❌ Payment error:', err);
      onError(err.data?.error || err.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
                fontFamily: 'system-ui, sans-serif',
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className={`w-full py-3 rounded-lg font-semibold text-white transition ${
          processing || !stripe
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
        }`}
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <Loader className="animate-spin" size={20} />
            Processing Payment...
          </span>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </button>

      <p className="text-xs text-center text-gray-500">
        Your payment is secured by Stripe. We never store your card details.
      </p>
    </form>
  );
}

export default function ElectionPaymentPage({ electionId, amount, currency, onPaymentComplete, electionTitle }) {
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { data: walletData } = useGetWalletQuery();
  const walletBalance = walletData?.balance ? parseFloat(walletData.balance) : 0;

  const [payForElection] = usePayForElectionMutation();

  /* ❌ PADDLE - COMMENTED OUT FOR LATER
  const handlePaddlePayment = async () => {
    setProcessing(true);
    setError(null);

    try {
      const result = await payForElection({
        electionId,
        regionCode: 'region_1_us_canada',
        paymentGateway: 'paddle',
      }).unwrap();

      console.log('🟣 Paddle payment result:', result);

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        setError('Paddle payment URL not received');
      }
    } catch (err) {
      console.error('Paddle payment error:', err);
      setError(err.data?.error || 'Paddle payment failed');
      setProcessing(false);
    }
  };
  */

  const handleWalletPayment = async () => {
    if (walletBalance < amount) {
      setError('Insufficient wallet balance. Please deposit funds first or use card payment.');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // TODO: Implement wallet payment
      setError('Wallet payment coming soon! Please use card payment for now.');
      setProcessing(false);
    } catch (err) {
      setError(err.data?.error || 'Wallet payment failed');
      setProcessing(false);
    }
  };

  const handlePaymentSuccess = (paymentIntentId) => {
    console.log('✅ Payment successful! Payment Intent ID:', paymentIntentId);
    setSuccess(true);
    setTimeout(() => {
      onPaymentComplete(paymentIntentId);
    }, 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <CheckCircle className="w-20 h-20 text-green-600 mx-auto animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your payment of <span className="font-bold">${amount.toFixed(2)}</span> has been processed successfully.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to voting page...
          </p>
          <div className="mt-6">
            <div className="animate-pulse flex justify-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <div className="w-2 h-2 bg-green-600 rounded-full animation-delay-200"></div>
              <div className="w-2 h-2 bg-green-600 rounded-full animation-delay-400"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {electionTitle || 'Election Payment'}
          </h1>
          <p className="text-gray-600 mb-4">
            A participation fee is required to vote in this election
          </p>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Participation Fee</p>
            <p className="text-4xl font-bold text-blue-900">
              ${amount?.toFixed(2) || '0.00'}
              <span className="text-lg font-normal text-gray-600 ml-2">{currency || 'USD'}</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <PaymentMethodSelector
            selectedMethod={paymentMethod}
            onMethodChange={setPaymentMethod}
            walletBalance={walletBalance}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-red-800 text-sm font-semibold">Payment Error</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {paymentMethod === 'stripe' && (
            <Elements stripe={stripePromise}>
              <StripeCardForm
                amount={amount}
                electionId={electionId}
                regionCode="region_1_us_canada"
                onSuccess={handlePaymentSuccess}
                onError={setError}
              />
            </Elements>
          )}

          {/* ❌ PADDLE - COMMENTED OUT
          {paymentMethod === 'paddle' && (
            <button
              onClick={handlePaddlePayment}
              disabled={processing}
              className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                processing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="animate-spin" size={20} />
                  Redirecting to Paddle...
                </span>
              ) : (
                `Pay $${amount.toFixed(2)} with Paddle`
              )}
            </button>
          )}
          */}

          {paymentMethod === 'wallet' && (
            <button
              onClick={handleWalletPayment}
              disabled={processing || walletBalance < amount}
              className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                processing || walletBalance < amount
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
              }`}
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="animate-spin" size={20} />
                  Processing...
                </span>
              ) : walletBalance < amount ? (
                'Insufficient Balance'
              ) : (
                `Pay $${amount.toFixed(2)} from Wallet`
              )}
            </button>
          )}

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Secure payment powered by Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
}





//last workable code
// // src/pages/voting/payment/ElectionPaymentPage.jsx
// // ✅ Handles payment for election participation fees using WALLET SERVICE

// import React, { useState } from 'react';
// /*eslint-disable*/
// import { useSelector } from 'react-redux';
// import { usePayForElectionMutation } from '../../../redux/api/walllet/electionPaymentApi';
// import { useGetWalletQuery } from '../../../redux/api/walllet/wallletApi';
// import { CreditCard, Wallet, DollarSign, Loader, CheckCircle, AlertCircle } from 'lucide-react';
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// // ✅ FIXED: Use correct environment variable
// const stripePromise = loadStripe(import.meta.env.VITE_REACT_APP_STRIPE_PUBLIC_KEY);


// function PaymentMethodSelector({ selectedMethod, onMethodChange, walletBalance }) {
//   return (
//     <div className="space-y-4 mb-6">
//       <h3 className="font-semibold text-gray-700 mb-3">Select Payment Method</h3>

//       {/* Stripe Card Payment */}
//       <button
//         onClick={() => onMethodChange('stripe')}
//         className={`w-full p-4 rounded-lg border-2 transition-all ${
//           selectedMethod === 'stripe'
//             ? 'border-blue-600 bg-blue-50'
//             : 'border-gray-200 hover:border-blue-300'
//         }`}
//       >
//         <div className="flex items-center gap-3">
//           <CreditCard className={selectedMethod === 'stripe' ? 'text-blue-600' : 'text-gray-600'} />
//           <div className="text-left">
//             <p className="font-semibold">Credit/Debit Card</p>
//             <p className="text-sm text-gray-600">Pay securely with Stripe</p>
//           </div>
//           {selectedMethod === 'stripe' && (
//             <CheckCircle className="ml-auto text-blue-600" size={20} />
//           )}
//         </div>
//       </button>

//       {/* Paddle Payment */}
//       <button
//         onClick={() => onMethodChange('paddle')}
//         className={`w-full p-4 rounded-lg border-2 transition-all ${
//           selectedMethod === 'paddle'
//             ? 'border-purple-600 bg-purple-50'
//             : 'border-gray-200 hover:border-purple-300'
//         }`}
//       >
//         <div className="flex items-center gap-3">
//           <DollarSign className={selectedMethod === 'paddle' ? 'text-purple-600' : 'text-gray-600'} />
//           <div className="text-left">
//             <p className="font-semibold">Paddle Payment</p>
//             <p className="text-sm text-gray-600">Alternative payment method</p>
//           </div>
//           {selectedMethod === 'paddle' && (
//             <CheckCircle className="ml-auto text-purple-600" size={20} />
//           )}
//         </div>
//       </button>

//       {/* Wallet Payment */}
//       <button
//         onClick={() => onMethodChange('wallet')}
//         className={`w-full p-4 rounded-lg border-2 transition-all ${
//           selectedMethod === 'wallet'
//             ? 'border-green-600 bg-green-50'
//             : 'border-gray-200 hover:border-green-300'
//         }`}
//       >
//         <div className="flex items-center gap-3">
//           <Wallet className={selectedMethod === 'wallet' ? 'text-green-600' : 'text-gray-600'} />
//           <div className="text-left flex-1">
//             <p className="font-semibold">Vottery Wallet</p>
//             <p className="text-sm text-gray-600">Balance: ${walletBalance?.toFixed(2) || '0.00'}</p>
//           </div>
//           {selectedMethod === 'wallet' && (
//             <CheckCircle className="ml-auto text-green-600" size={20} />
//           )}
//         </div>
//       </button>
//     </div>
//   );
// }


// function StripeCardForm({ amount, electionId, regionCode, onSuccess, onError }) {
//   const stripe = useStripe();
//   const elements = useElements();
//   const [processing, setProcessing] = useState(false);
//   const [payForElection] = usePayForElectionMutation();
//   const { refetch: refetchWallet } = useGetWalletQuery();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!stripe || !elements) return;

//     setProcessing(true);

//     try {
//       const result = await payForElection({
//         electionId,
//         regionCode: regionCode || 'region_1_us_canada',
//       }).unwrap();

//       console.log('✅ Payment result:', result);

//       if (result.alreadyPaid || result.payment?.status === 'succeeded') {
//         console.log('✅ Payment already completed');
//         setProcessing(false);
//         onSuccess(result.payment.payment_intent_id || result.paymentIntentId);
//         return;
//       }

//       if (!result.clientSecret) {
//         console.error('❌ No client secret received:', result);
//         throw new Error('No client secret received.');
//       }

//       console.log('🔵 Confirming payment with Stripe...');

//       const { error, paymentIntent } = await stripe.confirmCardPayment(result.clientSecret, {
//         payment_method: {
//           card: elements.getElement(CardElement),
//         },
//       });

//       if (error) {
//         console.error('❌ Stripe error:', error);
//         onError(error.message);
//         setProcessing(false);
//         return;
//       }

//       if (paymentIntent.status === 'succeeded') {
//         console.log('✅ Stripe payment succeeded:', paymentIntent.id);
        
//         // ✅ CRITICAL: Confirm in backend
//         try {
//           const userData = JSON.parse(localStorage.getItem('userData') || '{}');
//           const token = localStorage.getItem('accessToken');
          
//           console.log('🔵 CONFIRMING IN BACKEND...');
          
//           const confirmResponse = await fetch(
//             `${import.meta.env.VITE_VOTING_SERVICE_URL}/wallet/election-payment/confirm`,
//             {
//               method: 'POST',
//               headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`,
//                 'x-user-data': JSON.stringify({
//                   userId: userData.userId,
//                   email: userData.email,
//                   roles: userData.roles || ['Voter']
//                 })
//               },
//               body: JSON.stringify({
//                 paymentIntentId: paymentIntent.id,
//                 electionId: electionId
//               })
//             }
//           );
          
//           if (confirmResponse.ok) {
//             console.log('✅ Backend confirmed - wallet updated!');
//             await refetchWallet();
//           } else {
//             const errorData = await confirmResponse.json();
//             console.error('❌ Backend confirmation failed:', errorData);
//           }
//         } catch (confirmError) {
//           console.error('❌ Confirmation error:', confirmError);
//         }
        
//         onSuccess(paymentIntent.id);
//       } else if (paymentIntent.status === 'requires_action') {
//         console.log('⚠️ Payment requires additional action');
//         onError('Payment requires additional verification.');
//         setProcessing(false);
//       } else {
//         console.error('❌ Unexpected payment status:', paymentIntent.status);
//         onError('Payment failed. Please try again.');
//         setProcessing(false);
//       }
//     } catch (err) {
//       console.error('❌ Payment error:', err);
//       onError(err.data?.error || err.message || 'Payment failed');
//       setProcessing(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div className="bg-gray-50 p-4 rounded-lg">
//         <CardElement
//           options={{
//             style: {
//               base: {
//                 fontSize: '16px',
//                 color: '#424770',
//                 '::placeholder': {
//                   color: '#aab7c4',
//                 },
//               },
//               invalid: {
//                 color: '#9e2146',
//               },
//             },
//           }}
//         />
//       </div>

//       <button
//         type="submit"
//         disabled={!stripe || processing}
//         className={`w-full py-3 rounded-lg font-semibold text-white transition ${
//           processing || !stripe
//             ? 'bg-gray-400 cursor-not-allowed'
//             : 'bg-blue-600 hover:bg-blue-700'
//         }`}
//       >
//         {processing ? (
//           <span className="flex items-center justify-center gap-2">
//             <Loader className="animate-spin" size={20} />
//             Processing...
//           </span>
//         ) : (
//           `Pay $${amount.toFixed(2)}`
//         )}
//       </button>
//     </form>
//   );
// }

// export default function ElectionPaymentPage({ electionId, amount, currency, onPaymentComplete, electionTitle }) {
//   const [paymentMethod, setPaymentMethod] = useState('stripe');
//   const [processing, setProcessing] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(false);

//   const { data: walletData } = useGetWalletQuery();
//   const walletBalance = walletData?.balance ? parseFloat(walletData.balance) : 0;

//   const [payForElection] = usePayForElectionMutation();

// const handlePaddlePayment = async () => {
//   setProcessing(true);
//   setError(null);

//   try {
//     const result = await payForElection({
//       electionId,
//       regionCode: 'region_1_us_canada',
//       paymentGateway: 'paddle',
//     }).unwrap();

//     console.log('🟣 Paddle payment result:', result);

//     if (result.checkoutUrl) {
//       window.location.href = result.checkoutUrl;
//     } else {
//       setError('Paddle payment URL not received');
//     }
//   } catch (err) {
//     console.error('Paddle payment error:', err);
//     setError(err.data?.error || 'Paddle payment failed');
//     setProcessing(false);
//   }
// };

//   const handleWalletPayment = async () => {
//     if (walletBalance < amount) {
//       setError('Insufficient wallet balance. Please deposit funds first.');
//       return;
//     }

//     setProcessing(true);
//     setError(null);

//     try {
//       setError('Wallet payment coming soon! Please use card payment.');
//       setProcessing(false);
//     } catch (err) {
//       setError(err.data?.error || 'Wallet payment failed');
//       setProcessing(false);
//     }
//   };

//   const handlePaymentSuccess = (paymentIntentId) => {
//     console.log('✅ Payment successful:', paymentIntentId);
//     setSuccess(true);
//     setTimeout(() => {
//       onPaymentComplete(paymentIntentId);
//     }, 2000);
//   };

//   if (success) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
//           <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
//           <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
//           <p className="text-gray-600 mb-4">
//             Your payment has been processed successfully.
//           </p>
//           <p className="text-sm text-gray-500">
//             Redirecting to next step...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-2xl mx-auto px-4 py-8">
//       <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
//         <h1 className="text-2xl font-bold text-gray-900 mb-2">
//           {electionTitle || 'Election Payment'}
//         </h1>
//         <p className="text-gray-600 mb-4">
//           A participation fee is required to vote in this election
//         </p>

//         <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-blue-200">
//           <p className="text-sm text-gray-600 mb-1">Participation Fee</p>
//           <p className="text-3xl font-bold text-blue-900">
//             ${amount?.toFixed(2) || '0.00'}
//             <span className="text-lg font-normal text-gray-600 ml-2">{currency || 'USD'}</span>
//           </p>
//         </div>
//       </div>

//       <div className="bg-white rounded-2xl shadow-lg p-6">
//         <PaymentMethodSelector
//           selectedMethod={paymentMethod}
//           onMethodChange={setPaymentMethod}
//           walletBalance={walletBalance}
//         />

//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
//             <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
//             <p className="text-red-800 text-sm">{error}</p>
//           </div>
//         )}

//         {paymentMethod === 'stripe' && (
//           <Elements stripe={stripePromise}>
//             <StripeCardForm
//               amount={amount}
//               electionId={electionId}
//               regionCode="region_1_us_canada"
//               onSuccess={handlePaymentSuccess}
//               onError={setError}
//             />
//           </Elements>
//         )}

//         {paymentMethod === 'paddle' && (
//           <button
//             onClick={handlePaddlePayment}
//             disabled={processing}
//             className={`w-full py-3 rounded-lg font-semibold text-white transition ${
//               processing
//                 ? 'bg-gray-400 cursor-not-allowed'
//                 : 'bg-purple-600 hover:bg-purple-700'
//             }`}
//           >
//             {processing ? (
//               <span className="flex items-center justify-center gap-2">
//                 <Loader className="animate-spin" size={20} />
//                 Redirecting to Paddle...
//               </span>
//             ) : (
//               `Pay $${amount.toFixed(2)} with Paddle`
//             )}
//           </button>
//         )}

//         {paymentMethod === 'wallet' && (
//           <button
//             onClick={handleWalletPayment}
//             disabled={processing || walletBalance < amount}
//             className={`w-full py-3 rounded-lg font-semibold text-white transition ${
//               processing || walletBalance < amount
//                 ? 'bg-gray-400 cursor-not-allowed'
//                 : 'bg-green-600 hover:bg-green-700'
//             }`}
//           >
//             {processing ? (
//               <span className="flex items-center justify-center gap-2">
//                 <Loader className="animate-spin" size={20} />
//                 Processing...
//               </span>
//             ) : walletBalance < amount ? (
//               'Insufficient Balance'
//             ) : (
//               `Pay $${amount.toFixed(2)} from Wallet`
//             )}
//           </button>
//         )}

//         <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600">
//           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//             <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
//           </svg>
//           <span>Secure payment powered by Stripe & Paddle</span>
//         </div>
//       </div>
//     </div>
//   );
// }