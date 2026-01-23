
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
import { CreditCard, Wallet, DollarSign, Loader, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements, PaymentRequestButtonElement, ExpressCheckoutElement } from '@stripe/react-stripe-js';
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

      {/* Google Pay - NEW ADDITION */}
      <button
        onClick={() => onMethodChange('google_pay')}
        className={`w-full p-4 rounded-lg border-2 transition-all ${
          selectedMethod === 'google_pay'
            ? 'border-green-600 bg-green-50'
            : 'border-gray-200 hover:border-green-300'
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Google Pay Icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <div className="text-left">
            <p className="font-semibold">Google Pay</p>
            <p className="text-sm text-gray-600">Fast & secure payment</p>
          </div>
          {selectedMethod === 'google_pay' && (
            <CheckCircle className="ml-auto text-green-600" size={20} />
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


// ✅ Google Pay Form Component - Updated with proper detection
// ✅ FIXED Google Pay Form Component
function GooglePayForm({ amount, electionId, regionCode, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [expressReady, setExpressReady] = useState(false);
  const [availableMethods, setAvailableMethods] = useState(null);

  const [payForElection] = usePayForElectionMutation();
  const [confirmElectionPayment] = useConfirmElectionPaymentMutation();
  const { refetch: refetchWallet } = useGetWalletQuery();

  const handleReady = ({ availablePaymentMethods }) => {
    console.log('✅ Express Checkout Ready');
    console.log('Available payment methods:', availablePaymentMethods);
    
    if (availablePaymentMethods) {
      setAvailableMethods(availablePaymentMethods);
      setExpressReady(true);
      
      console.log('Google Pay:', availablePaymentMethods.googlePay ? '✅' : '❌');
      console.log('Apple Pay:', availablePaymentMethods.applePay ? '✅' : '❌');
      console.log('Link:', availablePaymentMethods.link ? '✅' : '❌');
    } else {
      console.log('❌ No express payment methods');
      setExpressReady(false);
    }
  };

  const handleClick = async (event) => {
    console.log('🔵 Express payment clicked');
    setProcessing(true);

    try {
      console.log('💳 Creating payment intent...');
      
      const result = await payForElection({
        electionId,
        regionCode: regionCode || 'region_1_us_canada',
        paymentGateway: 'stripe',
      }).unwrap();

      console.log('✅ Payment intent created:', result);

      if (result.alreadyPaid || result.payment?.status === 'succeeded') {
        console.log('✅ Already paid');
        event.resolve({ status: 'success' });
        setProcessing(false);
        onSuccess(result.payment.payment_intent_id || result.paymentIntentId);
        return;
      }

      if (!result.clientSecret) {
        console.error('❌ No clientSecret');
        event.resolve({ status: 'fail' });
        onError('Payment initialization failed');
        setProcessing(false);
        return;
      }

      console.log('🔵 Confirming payment...');
      
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: result.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?electionId=${electionId}`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        console.error('❌ Confirmation error:', confirmError);
        event.resolve({ status: 'fail' });
        onError(confirmError.message);
        setProcessing(false);
        return;
      }

      console.log('✅ Payment status:', paymentIntent.status);

      if (paymentIntent.status === 'succeeded') {
        console.log('✅ Payment succeeded!');
        event.resolve({ status: 'success' });
        
        try {
          await confirmElectionPayment({
            paymentIntentId: paymentIntent.id,
            electionId: electionId,
          }).unwrap();
          
          console.log('✅ Backend confirmed');
          await refetchWallet();
          
          setProcessing(false);
          onSuccess(paymentIntent.id);
          
        } catch (confirmErr) {
          console.error('❌ Backend error:', confirmErr);
          onError('Payment succeeded but update delayed');
          setProcessing(false);
        }
      } else {
        event.resolve({ status: 'fail' });
        onError(`Payment failed: ${paymentIntent.status}`);
        setProcessing(false);
      }

    } catch (err) {
      console.error('❌ Error:', err);
      event.resolve({ status: 'fail' });
      onError(err.data?.error || err.message || 'Payment failed');
      setProcessing(false);
    }
  };

  if (!stripe || !amount) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="animate-spin text-blue-600 mr-3" size={32} />
        <p className="text-gray-600">Loading payment options...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <ExpressCheckoutElement
          onReady={handleReady}
          onClick={handleClick}
          options={{
            buttonType: {
              googlePay: 'pay',
              applePay: 'plain',
            },
            buttonTheme: {
              googlePay: 'black',
              applePay: 'black',
            },
            buttonHeight: 48,
            paymentMethods: {
              googlePay: 'always',
              applePay: 'always',
              link: 'auto',
            },
          }}
        />
        
        {processing && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
            <Loader className="animate-spin text-green-600 mr-2" size={24} />
            <p className="text-gray-700 font-medium">Processing...</p>
          </div>
        )}
      </div>

      {expressReady && availableMethods && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-600" size={20} />
            <p className="text-green-800 text-sm font-medium">
              Available:
              {availableMethods.googlePay && ' Google Pay'}
              {availableMethods.applePay && ' Apple Pay'}
              {availableMethods.link && ' Link'}
            </p>
          </div>
        </div>
      )}

      {!expressReady && !processing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
          <div className="flex items-start gap-3">
            <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={24} />
            <div>
              <p className="text-blue-800 font-semibold mb-2">Google Pay Setup Required</p>
              <p className="text-blue-700 text-sm mb-3">
                To use Google Pay:
              </p>
              <ul className="text-blue-700 text-sm space-y-2 ml-1">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>
                    Add card at{' '}
                    <a href="https://pay.google.com" target="_blank" rel="noopener noreferrer" className="underline">
                      pay.google.com
                    </a>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Use Chrome browser</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Test card: 5555 5555 5555 4444</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-center text-gray-500">
        Secured by Google Pay and Stripe
      </p>
    </div>
  );
}
// function GooglePayForm({ amount, electionId, regionCode, onSuccess, onError }) {
//   const stripe = useStripe();
//   const [paymentRequest, setPaymentRequest] = useState(null);
//   const [googlePayAvailable, setGooglePayAvailable] = useState(false);
//   const [checking, setChecking] = useState(true);
//   const [processing, setProcessing] = useState(false);

//   // ✅ Use Redux mutations
//   const [payForElection] = usePayForElectionMutation();
//   const [confirmElectionPayment] = useConfirmElectionPaymentMutation();
//   const { refetch: refetchWallet } = useGetWalletQuery();

//   useEffect(() => {
//     if (!stripe || !amount) return;

//     setChecking(true);

//     // Create PaymentRequest for Google Pay
//     const pr = stripe.paymentRequest({
//       country: 'US',
//       currency: 'usd',
//       total: {
//         label: 'Election Participation Fee',
//         amount: Math.round(amount * 100), // Convert to cents
//       },
//       requestPayerName: true,
//       requestPayerEmail: true,
//     });

//     // Check if Google Pay is available
//     pr.canMakePayment().then((result) => {
//       console.log('🔍 Payment Request canMakePayment result:', result);
      
//       // Check specifically for Google Pay (not just any wallet like Link)
//       if (result && result.googlePay) {
//         console.log('✅ Google Pay is specifically available');
//         setGooglePayAvailable(true);
//         setPaymentRequest(pr);
//       } else {
//         console.log('❌ Google Pay is not available. Result:', result);
//         setGooglePayAvailable(false);
//       }
//       setChecking(false);
//     }).catch((err) => {
//       console.error('❌ Error checking Google Pay availability:', err);
//       setGooglePayAvailable(false);
//       setChecking(false);
//     });

//     // Handle payment method event
//     pr.on('paymentmethod', async (event) => {
//       setProcessing(true);
//       console.log('🔵 Google Pay payment method received:', event.paymentMethod.id);

//       try {
//         // Step 1: Create payment intent
//         console.log('💳 Step 1: Creating payment intent for Google Pay...');
//         const result = await payForElection({
//           electionId,
//           regionCode: regionCode || 'region_1_us_canada',
//           paymentGateway: 'stripe',
//           paymentMethod: 'google_pay'
//         }).unwrap();

//         console.log('✅ Payment intent created:', result);

//         if (!result.clientSecret) {
//           event.complete('fail');
//           onError('Payment initialization failed. No client secret received.');
//           setProcessing(false);
//           return;
//         }

//         // Step 2: Confirm payment with the payment method from Google Pay
//         console.log('🔵 Step 2: Confirming payment with Stripe...');
//         const { error, paymentIntent } = await stripe.confirmCardPayment(
//           result.clientSecret,
//           { payment_method: event.paymentMethod.id },
//           { handleActions: false }
//         );

//         if (error) {
//           console.error('❌ Stripe confirmation error:', error);
//           event.complete('fail');
//           onError(error.message);
//           setProcessing(false);
//           return;
//         }

//         if (paymentIntent.status === 'requires_action') {
//           // Handle 3D Secure authentication
//           const { error: actionError, paymentIntent: confirmedIntent } = await stripe.confirmCardPayment(result.clientSecret);
          
//           if (actionError) {
//             event.complete('fail');
//             onError(actionError.message);
//             setProcessing(false);
//             return;
//           }

//           if (confirmedIntent.status === 'succeeded') {
//             event.complete('success');
//             await handlePaymentSuccess(confirmedIntent.id);
//           } else {
//             event.complete('fail');
//             onError('Payment failed after 3D Secure verification.');
//             setProcessing(false);
//           }
//         } else if (paymentIntent.status === 'succeeded') {
//           event.complete('success');
//           await handlePaymentSuccess(paymentIntent.id);
//         } else {
//           event.complete('fail');
//           onError(`Payment failed with status: ${paymentIntent.status}`);
//           setProcessing(false);
//         }
//       } catch (err) {
//         console.error('❌ Google Pay error:', err);
//         event.complete('fail');
//         onError(err.data?.error || err.message || 'Google Pay payment failed.');
//         setProcessing(false);
//       }
//     });

//     return () => {
//       // Cleanup
//     };
//   }, [stripe, amount, electionId, regionCode]);

//   const handlePaymentSuccess = async (paymentIntentId) => {
//     try {
//       console.log('🔵 Step 3: Confirming payment in backend...');
//       const confirmResult = await confirmElectionPayment({
//         paymentIntentId: paymentIntentId,
//         electionId: electionId
//       }).unwrap();
      
//       console.log('✅ Backend confirmation successful:', confirmResult);
//       await refetchWallet();
//       console.log('✅ Wallet data refreshed');
      
//       setProcessing(false);
//       onSuccess(paymentIntentId);
//     } catch (confirmError) {
//       console.error('❌ Backend confirmation error:', confirmError);
//       onError('Payment succeeded but wallet update delayed. Please refresh in a moment.');
//       setProcessing(false);
//     }
//   };

//   // Show loading while checking Google Pay availability
//   if (checking) {
//     return (
//       <div className="flex flex-col items-center justify-center py-8">
//         <Loader className="animate-spin text-blue-600 mb-4" size={32} />
//         <p className="text-gray-600">Checking Google Pay availability...</p>
//       </div>
//     );
//   }

//   // Show helpful message if Google Pay is not available
//   if (!googlePayAvailable) {
//     return (
//       <div className="space-y-4">
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
//           <div className="flex items-start gap-3">
//             <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={24} />
//             <div>
//               <p className="text-blue-800 font-semibold mb-2">Google Pay Setup Required</p>
//               <p className="text-blue-700 text-sm mb-3">
//                 Google Pay is not currently available on this device or browser. To use Google Pay, please ensure one of the following:
//               </p>
//               <ul className="text-blue-700 text-sm space-y-2 ml-1">
//                 <li className="flex items-start gap-2">
//                   <span className="text-blue-500 mt-1">•</span>
//                   <span><strong>On Android:</strong> Open this page in Chrome browser with Google Pay app installed and a card added to your Google account.</span>
//                 </li>
//                 <li className="flex items-start gap-2">
//                   <span className="text-blue-500 mt-1">•</span>
//                   <span><strong>On Desktop Chrome:</strong> Sign in to Chrome with your Google account and add a payment method to Google Pay at <a href="https://pay.google.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">pay.google.com</a></span>
//                 </li>
//                 <li className="flex items-start gap-2">
//                   <span className="text-blue-500 mt-1">•</span>
//                   <span><strong>Note:</strong> Google Pay is not supported on Firefox, Safari, or incognito/private browsing mode.</span>
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
//           <p className="text-gray-700 text-sm text-center">
//             <strong>Alternative:</strong> You can use <strong>Credit/Debit Card</strong> or <strong>Vottery Wallet</strong> to complete your payment now.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // Show processing state
//   if (processing) {
//     return (
//       <div className="flex flex-col items-center justify-center py-8">
//         <Loader className="animate-spin text-green-600 mb-4" size={40} />
//         <p className="text-gray-600">Processing Google Pay payment...</p>
//       </div>
//     );
//   }

//   // Show Google Pay button when available
//   return (
//     <div className="space-y-4">
//       {paymentRequest && (
//         <PaymentRequestButtonElement
//           options={{
//             paymentRequest,
//             style: {
//               paymentRequestButton: {
//                 type: 'default',
//                 theme: 'dark',
//                 height: '48px',
//               },
//             },
//           }}
//         />
//       )}
//       <p className="text-xs text-center text-gray-500">
//         Your payment is secured by Google Pay and Stripe.
//       </p>
//     </div>
//   );
// }


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

          {/* ✅ Google Pay Payment */}
          {paymentMethod === 'google_pay' && (
            <Elements stripe={stripePromise}>
              <GooglePayForm
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













//last workable code only to add googel pay above code
// // src/pages/voting/payment/ElectionPaymentPage.jsx
// // ✅ Handles payment for election participation fees using WALLET SERVICE

// import React, { useState } from 'react';
// /*eslint-disable*/
// import { useSelector } from 'react-redux';
// // import { 
// //   usePayForElectionMutation, 
// //   useConfirmElectionPaymentMutation 
// // } from '../../../redux/api/walllet/walletApi';
// //import { useGetWalletQuery } from '../../../redux/api/walllet/walletApi';
// import { CreditCard, Wallet, DollarSign, Loader, CheckCircle, AlertCircle } from 'lucide-react';
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
// import { useConfirmElectionPaymentMutation, useGetWalletQuery, usePayForElectionMutation } from '../../../redux/api/walllet/wallletApi';

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

//       {/* ❌ PADDLE - COMMENTED OUT FOR LATER
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
//       */}

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
  
//   // ✅ Use Redux mutations
//   const [payForElection] = usePayForElectionMutation();
//   const [confirmElectionPayment] = useConfirmElectionPaymentMutation();
//   const { refetch: refetchWallet } = useGetWalletQuery();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!stripe || !elements) {
//       onError('Stripe not loaded. Please refresh the page.');
//       return;
//     }

//     setProcessing(true);

//     try {
//       console.log('💳 Step 1: Creating payment intent...');
      
//       // ✅ STEP 1: Create payment intent via Redux
//       const result = await payForElection({
//         electionId,
//         regionCode: regionCode || 'region_1_us_canada',
//         paymentGateway: 'stripe' // ✅ Explicitly set gateway
//       }).unwrap();

//       console.log('✅ Payment intent created:', result);

//       // ✅ Check if already paid
//       if (result.alreadyPaid || result.payment?.status === 'succeeded') {
//         console.log('✅ Payment already completed');
//         setProcessing(false);
//         onSuccess(result.payment.payment_intent_id || result.paymentIntentId);
//         return;
//       }

//       // ✅ Validate clientSecret
//       if (!result.clientSecret) {
//         console.error('❌ No client secret received:', result);
//         throw new Error('Payment initialization failed. No client secret received.');
//       }

//       console.log('🔵 Step 2: Confirming payment with Stripe...');

//       // ✅ STEP 2: Confirm payment with Stripe
//       const { error, paymentIntent } = await stripe.confirmCardPayment(result.clientSecret, {
//         payment_method: {
//           card: elements.getElement(CardElement),
//         },
//       });

//       if (error) {
//         console.error('❌ Stripe confirmation error:', error);
//         onError(error.message);
//         setProcessing(false);
//         return;
//       }

//       console.log('✅ Stripe payment intent status:', paymentIntent.status);

//       if (paymentIntent.status === 'succeeded') {
//         console.log('✅ Payment succeeded! Payment Intent ID:', paymentIntent.id);
        
//         // ✅ STEP 3: Confirm in backend via Redux mutation
//         try {
//           console.log('🔵 Step 3: Confirming payment in backend via Redux...');
          
//           const confirmResult = await confirmElectionPayment({
//             paymentIntentId: paymentIntent.id,
//             electionId: electionId
//           }).unwrap();
          
//           console.log('✅ Backend confirmation successful:', confirmResult);
          
//           // ✅ Refetch wallet to show updated balances
//           await refetchWallet();
//           console.log('✅ Wallet data refreshed');
          
//           setProcessing(false);
//           onSuccess(paymentIntent.id);
          
//         } catch (confirmError) {
//           console.error('❌ Backend confirmation error:', confirmError);
          
//           // Even if backend confirmation fails, payment succeeded
//           // Show success but with warning
//           onError('Payment succeeded but wallet update delayed. Please refresh in a moment.');
//           setProcessing(false);
//         }
        
//       } else if (paymentIntent.status === 'requires_action') {
//         console.log('⚠️ Payment requires additional action (3D Secure)');
//         onError('Payment requires additional verification. Please try again.');
//         setProcessing(false);
//       } else {
//         console.error('❌ Unexpected payment status:', paymentIntent.status);
//         onError(`Payment failed with status: ${paymentIntent.status}`);
//         setProcessing(false);
//       }
//     } catch (err) {
//       console.error('❌ Payment error:', err);
//       onError(err.data?.error || err.message || 'Payment failed. Please try again.');
//       setProcessing(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
//         <CardElement
//           options={{
//             style: {
//               base: {
//                 fontSize: '16px',
//                 color: '#424770',
//                 '::placeholder': {
//                   color: '#aab7c4',
//                 },
//                 fontFamily: 'system-ui, sans-serif',
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
//             : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
//         }`}
//       >
//         {processing ? (
//           <span className="flex items-center justify-center gap-2">
//             <Loader className="animate-spin" size={20} />
//             Processing Payment...
//           </span>
//         ) : (
//           `Pay $${amount.toFixed(2)}`
//         )}
//       </button>

//       <p className="text-xs text-center text-gray-500">
//         Your payment is secured by Stripe. We never store your card details.
//       </p>
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

//   /* ❌ PADDLE - COMMENTED OUT FOR LATER
//   const handlePaddlePayment = async () => {
//     setProcessing(true);
//     setError(null);

//     try {
//       const result = await payForElection({
//         electionId,
//         regionCode: 'region_1_us_canada',
//         paymentGateway: 'paddle',
//       }).unwrap();

//       console.log('🟣 Paddle payment result:', result);

//       if (result.checkoutUrl) {
//         window.location.href = result.checkoutUrl;
//       } else {
//         setError('Paddle payment URL not received');
//       }
//     } catch (err) {
//       console.error('Paddle payment error:', err);
//       setError(err.data?.error || 'Paddle payment failed');
//       setProcessing(false);
//     }
//   };
//   */

//   const handleWalletPayment = async () => {
//     if (walletBalance < amount) {
//       setError('Insufficient wallet balance. Please deposit funds first or use card payment.');
//       return;
//     }

//     setProcessing(true);
//     setError(null);

//     try {
//       // TODO: Implement wallet payment
//       setError('Wallet payment coming soon! Please use card payment for now.');
//       setProcessing(false);
//     } catch (err) {
//       setError(err.data?.error || 'Wallet payment failed');
//       setProcessing(false);
//     }
//   };

//   const handlePaymentSuccess = (paymentIntentId) => {
//     console.log('✅ Payment successful! Payment Intent ID:', paymentIntentId);
//     setSuccess(true);
//     setTimeout(() => {
//       onPaymentComplete(paymentIntentId);
//     }, 2000);
//   };

//   if (success) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
//         <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
//           <div className="mb-4">
//             <CheckCircle className="w-20 h-20 text-green-600 mx-auto animate-bounce" />
//           </div>
//           <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
//           <p className="text-gray-600 mb-4">
//             Your payment of <span className="font-bold">${amount.toFixed(2)}</span> has been processed successfully.
//           </p>
//           <p className="text-sm text-gray-500">
//             Redirecting to voting page...
//           </p>
//           <div className="mt-6">
//             <div className="animate-pulse flex justify-center gap-2">
//               <div className="w-2 h-2 bg-green-600 rounded-full"></div>
//               <div className="w-2 h-2 bg-green-600 rounded-full animation-delay-200"></div>
//               <div className="w-2 h-2 bg-green-600 rounded-full animation-delay-400"></div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
//       <div className="max-w-2xl mx-auto px-4">
//         <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
//           <h1 className="text-2xl font-bold text-gray-900 mb-2">
//             {electionTitle || 'Election Payment'}
//           </h1>
//           <p className="text-gray-600 mb-4">
//             A participation fee is required to vote in this election
//           </p>

//           <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-200">
//             <p className="text-sm text-gray-600 mb-1">Participation Fee</p>
//             <p className="text-4xl font-bold text-blue-900">
//               ${amount?.toFixed(2) || '0.00'}
//               <span className="text-lg font-normal text-gray-600 ml-2">{currency || 'USD'}</span>
//             </p>
//           </div>
//         </div>

//         <div className="bg-white rounded-2xl shadow-lg p-6">
//           <PaymentMethodSelector
//             selectedMethod={paymentMethod}
//             onMethodChange={setPaymentMethod}
//             walletBalance={walletBalance}
//           />

//           {error && (
//             <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
//               <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
//               <div>
//                 <p className="text-red-800 text-sm font-semibold">Payment Error</p>
//                 <p className="text-red-700 text-sm mt-1">{error}</p>
//               </div>
//             </div>
//           )}

//           {paymentMethod === 'stripe' && (
//             <Elements stripe={stripePromise}>
//               <StripeCardForm
//                 amount={amount}
//                 electionId={electionId}
//                 regionCode="region_1_us_canada"
//                 onSuccess={handlePaymentSuccess}
//                 onError={setError}
//               />
//             </Elements>
//           )}

//           {/* ❌ PADDLE - COMMENTED OUT
//           {paymentMethod === 'paddle' && (
//             <button
//               onClick={handlePaddlePayment}
//               disabled={processing}
//               className={`w-full py-3 rounded-lg font-semibold text-white transition ${
//                 processing
//                   ? 'bg-gray-400 cursor-not-allowed'
//                   : 'bg-purple-600 hover:bg-purple-700'
//               }`}
//             >
//               {processing ? (
//                 <span className="flex items-center justify-center gap-2">
//                   <Loader className="animate-spin" size={20} />
//                   Redirecting to Paddle...
//                 </span>
//               ) : (
//                 `Pay $${amount.toFixed(2)} with Paddle`
//               )}
//             </button>
//           )}
//           */}

//           {paymentMethod === 'wallet' && (
//             <button
//               onClick={handleWalletPayment}
//               disabled={processing || walletBalance < amount}
//               className={`w-full py-3 rounded-lg font-semibold text-white transition ${
//                 processing || walletBalance < amount
//                   ? 'bg-gray-400 cursor-not-allowed'
//                   : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
//               }`}
//             >
//               {processing ? (
//                 <span className="flex items-center justify-center gap-2">
//                   <Loader className="animate-spin" size={20} />
//                   Processing...
//                 </span>
//               ) : walletBalance < amount ? (
//                 'Insufficient Balance'
//               ) : (
//                 `Pay $${amount.toFixed(2)} from Wallet`
//               )}
//             </button>
//           )}

//           <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600">
//             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//               <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
//             </svg>
//             <span>Secure payment powered by Stripe</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }





