import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader, CreditCard, Lock } from 'lucide-react';

// Initialize Stripe with environment variable
const stripePromise = loadStripe(import.meta.env.VITE_REACT_APP_STRIPE_PUBLIC_KEY);
/*eslint-disable*/
const CheckoutForm = ({ clientSecret, planId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Confirm payment with card details
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/callback?gateway=stripe&plan_id=${planId}`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Redirect to success page
        navigate(`/payment/callback?gateway=stripe&payment_id=${paymentIntent.id}&plan_id=${planId}`);
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element (Card Input) */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
        <PaymentElement />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
      >
        {isProcessing ? (
          <>
            <Loader className="animate-spin" size={24} />
            Processing Payment...
          </>
        ) : (
          <>
            <Lock size={20} />
            Pay Now
          </>
        )}
      </button>

      {/* Security Notice */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <Lock size={16} />
        <span>Secured by Stripe</span>
      </div>
    </form>
  );
};

const StripePaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clientSecret = searchParams.get('client_secret');
  const planId = searchParams.get('plan_id');

  useEffect(() => {
    if (!clientSecret) {
      navigate('/dashboard?tab=subscription');
    }
  }, [clientSecret, navigate]);

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#4f46e5',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard size={32} />
              <h1 className="text-2xl font-bold">Complete Payment</h1>
            </div>
            <p className="text-indigo-100">Enter your card details to complete your subscription</p>
          </div>

          {/* Payment Form */}
          <div className="p-8">
            <Elements stripe={stripePromise} options={options}>
              <CheckoutForm clientSecret={clientSecret} planId={planId} />
            </Elements>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Your payment information is encrypted and secure
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <span>🔒 SSL Encrypted</span>
            <span>•</span>
            <span>💳 PCI Compliant</span>
            <span>•</span>
            <span>✓ Stripe Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripePaymentPage;
// import React, { useState, useEffect } from 'react';
// import { useSearchParams, useNavigate } from 'react-router-dom';
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
// import { Loader, CreditCard, Lock } from 'lucide-react';

// // Initialize Stripe
// //const stripePromise = loadStripe('pk_test_51InRYbB0sf6djoAXSVj2nQkioPdPzuziRfWeciIXPWe3nJW5eDBIQIzwgEovScGCt91pJVxe57LPtvF'); 
// const stripePromise = loadStripe(import.meta.env.VITE_REACT_APP_STRIPE_PUBLIC_KEY);
// // Your publishable key
// /*eslint-disable*/
// const CheckoutForm = ({ clientSecret, planId }) => {
//   const stripe = useStripe();
//   const elements = useElements();
//   const navigate = useNavigate();
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [errorMessage, setErrorMessage] = useState(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!stripe || !elements) {
//       return;
//     }

//     setIsProcessing(true);
//     setErrorMessage(null);

//     try {
//       // Confirm payment with card details
//       const { error, paymentIntent } = await stripe.confirmPayment({
//         elements,
//         confirmParams: {
//           return_url: `${window.location.origin}/payment/callback?gateway=stripe&plan_id=${planId}`,
//         },
//       });

//       if (error) {
//         setErrorMessage(error.message);
//         setIsProcessing(false);
//       } else if (paymentIntent && paymentIntent.status === 'succeeded') {
//         // Redirect to success page
//         navigate(`/payment/callback?gateway=stripe&payment_id=${paymentIntent.id}&plan_id=${planId}`);
//       }
//     } catch (err) {
//       setErrorMessage('An unexpected error occurred.');
//       setIsProcessing(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       {/* Payment Element (Card Input) */}
//       <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
//         <PaymentElement />
//       </div>

//       {/* Error Message */}
//       {errorMessage && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//           <p className="text-red-800 text-sm">{errorMessage}</p>
//         </div>
//       )}

//       {/* Submit Button */}
//       <button
//         type="submit"
//         disabled={!stripe || isProcessing}
//         className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
//       >
//         {isProcessing ? (
//           <>
//             <Loader className="animate-spin" size={24} />
//             Processing Payment...
//           </>
//         ) : (
//           <>
//             <Lock size={20} />
//             Pay Now
//           </>
//         )}
//       </button>

//       {/* Security Notice */}
//       <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
//         <Lock size={16} />
//         <span>Secured by Stripe</span>
//       </div>
//     </form>
//   );
// };

// const StripePaymentPage = () => {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const clientSecret = searchParams.get('client_secret');
//   const planId = searchParams.get('plan_id');

//   useEffect(() => {
//     if (!clientSecret) {
//       navigate('/dashboard?tab=subscription');
//     }
//   }, [clientSecret, navigate]);

//   if (!clientSecret) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Loader className="animate-spin text-indigo-600" size={48} />
//       </div>
//     );
//   }

//   const options = {
//     clientSecret,
//     appearance: {
//       theme: 'stripe',
//       variables: {
//         colorPrimary: '#4f46e5',
//         colorBackground: '#ffffff',
//         colorText: '#1f2937',
//         colorDanger: '#ef4444',
//         fontFamily: 'system-ui, sans-serif',
//         spacingUnit: '4px',
//         borderRadius: '8px',
//       },
//     },
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-12 px-4">
//       <div className="max-w-2xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
//           <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
//             <div className="flex items-center gap-3 mb-2">
//               <CreditCard size={32} />
//               <h1 className="text-2xl font-bold">Complete Payment</h1>
//             </div>
//             <p className="text-indigo-100">Enter your card details to complete your subscription</p>
//           </div>

//           {/* Payment Form */}
//           <div className="p-8">
//             <Elements stripe={stripePromise} options={options}>
//               <CheckoutForm clientSecret={clientSecret} planId={planId} />
//             </Elements>
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
//             <span>✓ Stripe Verified</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StripePaymentPage;