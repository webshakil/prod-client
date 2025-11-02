import React, { useState, useEffect } from 'react';
import { CreditCard, Wallet, Loader } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { initializePaddle } from '@paddle/paddle-js';
import StripePaymentForm from './StripePaymentForm';

// Initialize Stripe OUTSIDE component
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_REACT_APP_STRIPE_PUBLIC_KEY;

if (!STRIPE_PUBLIC_KEY || !STRIPE_PUBLIC_KEY.startsWith('pk_')) {
  console.error('❌ Invalid or missing Stripe public key!');
}

const stripePromise = STRIPE_PUBLIC_KEY ? loadStripe(STRIPE_PUBLIC_KEY) : null;

export default function PaymentModal({
  isOpen,
  onClose,
  electionId,
  applicableFee,
  onPaymentSuccess,
}) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  /*eslint-disable*/
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [clientSecret, setClientSecret] = useState(null);
  const [paddle, setPaddle] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

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
      setPaymentMethod('card');
    }
  }, [isOpen]);

  const createPaymentIntent = async () => {
    console.log('🔵 createPaymentIntent called');

    if (!applicableFee || !electionId) {
      setError('Missing payment information');
      return false;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      const apiUrl = import.meta.env.VITE_REACT_APP_PAYMENT_SERVICE_URL || 'http://localhost:5006/api';
      const xUserData = getXUserDataHeader();
      
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Payment failed: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('📥 Payment response:', responseData);

      let secret = null;
      let paddleTransactionId = null;

      if (responseData.success && responseData.data) {
        secret = responseData.data.clientSecret;
        paddleTransactionId = responseData.data.paddleTransactionId;
      } else if (responseData.clientSecret) {
        secret = responseData.clientSecret;
      } else if (responseData.paddleTransactionId) {
        paddleTransactionId = responseData.paddleTransactionId;
      }

      if (secret) {
        console.log('✅ Setting Stripe client secret');
        setClientSecret(secret);
        setIsProcessing(false);
        return true;
      } else if (paddleTransactionId) {
        console.log('✅ Opening Paddle checkout');
        handlePaddlePayment(paddleTransactionId);
        setIsProcessing(false);
        return true;
      } else {
        throw new Error('Invalid payment response from server');
      }
    } catch (err) {
      console.error('❌ Payment failed:', err);
      setError(err.message || 'Failed to initialize payment');
      setIsProcessing(false);
      return false;
    }
  };

  const handlePaddlePayment = (transactionId) => {
    if (!paddle) {
      setError('Paddle payment system not available');
      setIsProcessing(false);
      return;
    }

    try {
      paddle.Checkout.open({
        transactionId,
        successCallback: (data) => {
          console.log('✅ Paddle payment successful');
          setPaymentStatus('success');
          if (onPaymentSuccess) {
            onPaymentSuccess(data.transaction_id);
          }
          onClose();
        },
        closeCallback: () => {
          setPaymentStatus('idle');
          setIsProcessing(false);
        },
      });
    } catch (err) {
      setError('Failed to open Paddle checkout');
      console.error('Paddle error:', err);
      setIsProcessing(false);
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
        console.log('✅ Wallet payment successful');
        setPaymentStatus('success');
        if (onPaymentSuccess) {
          onPaymentSuccess(data.paymentId || data.data?.paymentId);
        }
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

  const handleConfirmPayment = async () => {
    if (paymentMethod === 'wallet') {
      await handleWalletPayment();
    } else if (paymentMethod === 'card') {
      await createPaymentIntent();
    }
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setClientSecret(null);
    setError(null);
  };

  if (!isOpen) return null;

  // Determine what to show
  const showPaymentButtons = !isProcessing && !clientSecret;
  const showStripeForm = paymentMethod === 'card' && clientSecret && !isProcessing;
  const showLoadingSpinner = isProcessing;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-md w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            disabled={isProcessing}
          >
            ×
          </button>
        </div>
        
        {/* Payment Method Selection */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
          <div className="space-y-2">
            <label className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
              paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'
            }`}>
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => handlePaymentMethodChange(e.target.value)}
                disabled={isProcessing || !!clientSecret}
              />
              <CreditCard size={20} className="text-blue-600" />
              <div className="flex-1">
                <span className="font-medium">Credit/Debit Card</span>
                <span className="text-xs text-gray-500 block">Stripe or Paddle</span>
              </div>
            </label>
            
            <label className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
              paymentMethod === 'wallet' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-blue-400'
            }`}>
              <input
                type="radio"
                name="payment"
                value="wallet"
                checked={paymentMethod === 'wallet'}
                onChange={(e) => handlePaymentMethodChange(e.target.value)}
                disabled={isProcessing || !!clientSecret}
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
        {showStripeForm && STRIPE_PUBLIC_KEY && stripePromise && (
          <div className="mb-4">
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
                  console.log('✅ Stripe payment successful:', paymentId);
                  setPaymentStatus('success');
                  if (onPaymentSuccess) {
                    onPaymentSuccess(paymentId);
                  }
                  onClose();
                }}
                onError={(errorMsg) => {
                  console.error('❌ Payment error:', errorMsg);
                  setError(errorMsg);
                  setIsProcessing(false);
                }}
              />
            </Elements>
          </div>
        )}

        {/* Loading State */}
        {showLoadingSpinner && (
          <div className="flex items-center justify-center py-8 mb-4">
            <Loader size={24} className="animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Initializing payment...</span>
          </div>
        )}

        {/* Action Buttons */}
        {showPaymentButtons && (
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleConfirmPayment}
              disabled={paymentMethod === 'wallet' && userData.walletBalance < (applicableFee?.total || 0)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:bg-gray-400"
            >
              Confirm & Pay
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
          <p className="mt-1">Your vote will be cast immediately after successful payment</p>
        </div>
      </div>
    </div>
  );
}