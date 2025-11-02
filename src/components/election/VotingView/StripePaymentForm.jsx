import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Loader } from 'lucide-react';
/*eslint-disable*/
export default function StripePaymentForm({ clientSecret, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (stripe && elements) {
      setIsReady(true);
    }
  }, [stripe, elements]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.log('⚠️ Stripe or Elements not ready');
      return;
    }

    setIsProcessing(true);
    console.log('💳 Confirming payment...');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('❌ Payment error:', error);
        onError(error.message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('✅ Payment succeeded:', paymentIntent.id);
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      console.error('❌ Payment exception:', err);
      onError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white rounded-lg">
        <PaymentElement 
          onReady={() => setIsReady(true)}
          onLoadError={(error) => console.error('PaymentElement error:', error)}
        />
      </div>
      
      <button
        type="submit"
        disabled={!stripe || !isReady || isProcessing}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader size={16} className="animate-spin" />
            Processing Payment...
          </>
        ) : !isReady ? (
          <>
            <Loader size={16} className="animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <span>💳</span>
            Pay Now
          </>
        )}
      </button>
    </form>
  );
}