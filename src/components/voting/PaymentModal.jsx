import React, { useState } from 'react';
import { X, CreditCard, Loader } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCreatePaymentIntentMutation } from '../../redux/api/voting/votingApi';
import { toast } from 'react-toastify';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function PaymentForm({ election, onSuccess, onClose }) {
  const stripe = useStripe();
  const elements = useElements();
  const [createPaymentIntent, { isLoading }] = useCreatePaymentIntentMutation();
  const [processing, setProcessing] = useState(false);

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const regionalZone = userData.regional_zone || 'us_canada';

  // Get fee for user's region
  const getFee = () => {
    if (election.pricing_type === 'regional_fee') {
      const regionalPrice = election.regional_pricing?.find(
        (r) => r.region_code === `region_${regionalZone}`
      );
      return regionalPrice?.participation_fee || election.general_participation_fee || 5;
    }
    return election.general_participation_fee || 5;
  };

  const fee = getFee();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      // Create payment intent
      const result = await createPaymentIntent({
        electionId: election.id,
        regionalZone,
        paymentMethod: 'stripe',
      }).unwrap();

      if (!result.success || !result.data.clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        result.data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              email: userData.user_email,
              name: `${userData.user_firstname} ${userData.user_lastname}`,
            },
          },
        }
      );

      if (error) {
        toast.error(error.message);
        setProcessing(false);
      } else if (paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!');
        onSuccess();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error?.data?.message || 'Payment failed');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Fee Display */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-700">Election Fee</span>
          <span className="text-xl font-bold text-gray-900">${fee}</span>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Processing Fee</span>
          <span>${(fee * (election.processing_fee_percentage / 100 || 0)).toFixed(2)}</span>
        </div>
        <div className="border-t border-blue-200 mt-2 pt-2 flex justify-between items-center">
          <span className="font-semibold text-gray-800">Total</span>
          <span className="text-2xl font-bold text-blue-600">
            ${(parseFloat(fee) + parseFloat(fee * (election.processing_fee_percentage / 100 || 0))).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Card Element */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="border-2 border-gray-200 rounded-lg p-4 focus-within:border-blue-500 transition">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded">
        <CreditCard size={16} className="mt-0.5 flex-shrink-0" />
        <p>Your payment is secure and encrypted. We use Stripe for payment processing.</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={processing}
          className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || processing || isLoading}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {processing || isLoading ? (
            <>
              <Loader className="animate-spin" size={20} />
              Processing...
            </>
          ) : (
            `Pay $${(parseFloat(fee) + parseFloat(fee * (election.processing_fee_percentage / 100 || 0))).toFixed(2)}`
          )}
        </button>
      </div>
    </form>
  );
}

export default function PaymentModal({ election, onClose, onSuccess }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Complete Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <Elements stripe={stripePromise}>
            <PaymentForm election={election} onSuccess={onSuccess} onClose={onClose} />
          </Elements>
        </div>
      </div>
    </div>
  );
}