import React, { useState } from 'react';
import { Loader } from 'lucide-react';

const StripePaymentForm = ({ onSubmit, loading, plan, amount, countryCode }) => {
  const [cardComplete, setCardComplete] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!cardComplete) {
      setError('Please fill in all card details');
      return;
    }

    // In a real implementation, you would use Stripe.js here
    // For now, we'll just call the onSubmit with mock data
    onSubmit({
      gateway: 'stripe',
      paymentMethod: 'card',
      planId: plan.id,
      countryCode,
      amount,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Card Details
        </label>
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
          <p>Stripe payment form would be integrated here</p>
          <p className="text-sm mt-2">For demo, click Pay to proceed</p>
        </div>
        <div className="mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={cardComplete}
              onChange={(e) => setCardComplete(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">I confirm payment details</span>
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !cardComplete}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        {loading && <Loader className="animate-spin" size={20} />}
        <span>
          {loading ? 'Processing...' : `Pay $${amount.toFixed(2)} with Stripe`}
        </span>
      </button>
    </form>
  );
};

export default StripePaymentForm;