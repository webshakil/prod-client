import React, { useState } from 'react';
import { Loader } from 'lucide-react';

const PaddlePaymentForm = ({ onSubmit, loading, plan, amount, countryCode }) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreedToTerms) {
      return;
    }

    onSubmit({
      gateway: 'paddle',
      paymentMethod: 'card',
      planId: plan.id,
      countryCode,
      amount,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-900 text-sm">
          <span className="font-semibold">Paddle Checkout</span>
          <br />
          You will be redirected to Paddle's secure checkout page to complete your payment.
        </p>
      </div>

      {/* Payment Summary */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-3">
        <h4 className="font-semibold text-gray-900">Order Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-700">
            <span>{plan.name}</span>
            <span>${amount.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between text-gray-900 font-bold">
            <span>Total</span>
            <span>${amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Terms Agreement */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300"
        />
        <span className="text-sm text-gray-700">
          I agree to the terms and conditions and understand this is a {plan.duration} subscription
        </span>
      </label>

      <button
        type="submit"
        disabled={loading || !agreedToTerms}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray
        -400 text-white font-semibold py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        {loading && <Loader className="animate-spin" size={20} />}
        <span>
          {loading ? 'Processing...' : `Proceed to Paddle ($${amount.toFixed(2)})`}
        </span>
      </button>
    </form>
  );
};

export default PaddlePaymentForm;