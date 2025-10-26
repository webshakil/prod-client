// frontend/src/pages/payment/PaddlePaymentPage.jsx
// Separate Paddle payment page - Stripe code untouched!

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader, CreditCard, Lock } from 'lucide-react';
import { usePaddleCheckout } from '../../hooks/usePaddleCheckout';

const PaddlePaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userId, email } = useSelector((state) => state.auth);
  
  const planId = searchParams.get('plan_id');
  const priceId = searchParams.get('price_id');
  const planName = searchParams.get('plan_name');
  const price = searchParams.get('price');
  const billingCycle = searchParams.get('billing_cycle');

  const { openCheckout, isLoading: paddleLoading } = usePaddleCheckout();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!planId || !priceId) {
      console.error('❌ Missing required parameters');
      navigate('/pricing');
    }
  }, [planId, priceId, navigate]);

  const handlePaddleCheckout = () => {
    setIsProcessing(true);
    
    console.log('🏓 Opening Paddle checkout...');
    console.log('   Plan ID:', planId);
    console.log('   Price ID:', priceId);
    console.log('   User Email:', email);
    
    openCheckout({
      priceId: priceId,
      userId: userId,
      planId: planId,
      userEmail: email,
      onSuccess: (data) => {
        console.log('✅ Paddle payment successful!', data);
        setIsProcessing(false);
        navigate(`/payment/callback?gateway=paddle&transaction_id=${data.transaction_id}&plan_id=${planId}`);
      },
      onError: (error) => {
        console.error('❌ Paddle payment failed:', error);
        setIsProcessing(false);
        alert('Payment failed. Please try again.');
      },
    });
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
            <p className="text-green-100">Click below to open secure Paddle checkout</p>
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
            <button
              onClick={handlePaddleCheckout}
              disabled={paddleLoading || isProcessing}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
            >
              {paddleLoading || isProcessing ? (
                <>
                  <Loader className="animate-spin" size={24} />
                  Loading Paddle...
                </>
              ) : (
                <>
                  <Lock size={20} />
                  Pay with Paddle
                </>
              )}
            </button>

            {/* Security Notice */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-4">
              <Lock size={16} />
              <span>Secured by Paddle</span>
            </div>
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
            <span>✓ Paddle Verified</span>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Note:</strong> When you click "Pay with Paddle", a secure checkout window will open. 
            Complete your payment details there and you'll be redirected back automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaddlePaymentPage;