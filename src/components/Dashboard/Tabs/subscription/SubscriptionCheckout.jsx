import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { setCheckoutStep, setSelectedGateway } from '../../../../redux/slices/subscriptionSlice';
import { useGetGatewayRecommendationQuery, useCreatePaymentMutation } from '../../../../redux/api/subscription/subscriptionApi';
import { Loader, ArrowLeft, CheckCircle, CreditCard, AlertCircle } from 'lucide-react';

// Country name to country code mapping
const COUNTRY_CODE_MAP = {
  'United States': 'US',
  'United Kingdom': 'GB',
  'Canada': 'CA',
  'Australia': 'AU',
  'India': 'IN',
  'Bangladesh': 'BD',
  'Pakistan': 'PK',
  'Germany': 'DE',
  'France': 'FR',
  'Spain': 'ES',
  'Italy': 'IT',
  'Brazil': 'BR',
  'Mexico': 'MX',
  'Japan': 'JP',
  'China': 'CN',
  'Netherlands': 'NL',
  'Sweden': 'SE',
  'Norway': 'NO',
  'Denmark': 'DK',
  'Singapore': 'SG',
};

const SubscriptionCheckout = () => {
  const dispatch = useAppDispatch();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  const userCountry = useAppSelector((state) => state.auth.country);
  const selectedPlan = useAppSelector((state) => state.subscription.selectedPlan);
  const selectedGateway = useAppSelector((state) => state.subscription.selectedGateway);
  
  // Convert country name to code
  const countryCode = COUNTRY_CODE_MAP[userCountry] || 'US';

  // Get gateway recommendation from backend
  const { 
    data: gatewayData, 
    isLoading: isLoadingGateway,
    isError: isGatewayError,
    error: gatewayError
  } = useGetGatewayRecommendationQuery(
    { country_code: countryCode, plan_id: selectedPlan?.id },
    { skip: !selectedPlan }
  );

  const [createPayment, { isLoading: isCreatingPayment }] = useCreatePaymentMutation();

  const recommendation = gatewayData?.recommendation;
  const recommendedGateway = recommendation?.available_gateways?.[0]?.gateway;

  // Auto-select recommended gateway
  useEffect(() => {
    if (recommendedGateway && !selectedGateway) {
      dispatch(setSelectedGateway(recommendedGateway));
    }
  }, [recommendedGateway, selectedGateway, dispatch]);

  const handleBack = () => {
    dispatch(setCheckoutStep('plan-selection'));
  };
  // Add this debugging code to see what Paddle returns

const handleProceedToPayment = async () => {
  if (!selectedGateway || !selectedPlan) return;
  
  setIsProcessing(true);
  setError(null);

  try {
    const paymentData = {
      plan_id: selectedPlan.id,
      country_code: countryCode,
      payment_method: paymentMethod,
      amount: totalAmount,
      currency: 'USD'
    };

    console.log('🚀 Creating payment with:', paymentData);
    const result = await createPayment(paymentData).unwrap();
    console.log('✅ Payment API response:', result);

    if (result.success) {
      console.log('Gateway:', result.gateway);
      console.log('Payment Data:', result.paymentData);
      
      // Redirect based on gateway
      if (result.gateway === 'stripe') {
        console.log('📍 Stripe redirect');
        if (result.paymentData.clientSecret) {
          // Pass payment_method to Stripe page for Google Pay handling
          const redirectUrl = `/payment/stripe?client_secret=${result.paymentData.clientSecret}&plan_id=${selectedPlan.id}&payment_method=${paymentMethod}`;
          console.log('Redirecting to:', redirectUrl);
          window.location.href = redirectUrl;
        } else if (result.paymentData.checkoutUrl) {
          console.log('Redirecting to:', result.paymentData.checkoutUrl);
          window.location.href = result.paymentData.checkoutUrl;
        }
      } else if (result.gateway === 'paddle') {
        console.log('📍 Paddle redirect');
        console.log('Paddle paymentData:', result.paymentData);
        
        // ✅ FIX: Check all possible Paddle response fields
        const checkoutUrl = result.paymentData?.checkoutUrl || 
                           result.paymentData?.checkout_url ||
                           result.payment?.checkout_url ||
                           result.checkoutUrl;
        
        const transactionId = result.paymentData?.transactionId ||
                             result.paymentData?.transaction_id ||
                             result.payment?.transaction_id;
        
        console.log('Checkout URL:', checkoutUrl);
        console.log('Transaction ID:', transactionId);
        
        if (checkoutUrl) {
          console.log('✅ Redirecting to Paddle checkout:', checkoutUrl);
          window.location.href = checkoutUrl;
        } else if (transactionId) {
          const paddleUrl = `/payment/paddle?transaction_id=${transactionId}&plan_id=${selectedPlan.id}`;
          console.log('✅ Redirecting to Paddle payment page:', paddleUrl);
          window.location.href = paddleUrl;
        } else {
          console.error('❌ No Paddle checkout URL or transaction ID found');
          setError('Paddle checkout URL not found. Please try again.');
          setIsProcessing(false);
        }
      }
    } else {
      console.error('❌ Payment creation failed:', result);
      setError(result.error || 'Payment creation failed');
      setIsProcessing(false);
    }
  } catch (err) {
    console.error('❌ Payment creation error:', err);
    setError(err?.data?.error || 'Failed to initiate payment. Please try again.');
    setIsProcessing(false);
  }
};

//   const handleProceedToPayment = async () => {
//     if (!selectedGateway || !selectedPlan) return;
    
//     setIsProcessing(true);
//     setError(null);

//     try {
//       // const paymentData = {
//       //   planId: selectedPlan.id,
//       //   country_code: countryCode,
//       //   payment_method: paymentMethod,
//       // };
//       const paymentData = {
//   planId: selectedPlan.id,
//   country_code: countryCode,
//   payment_method: paymentMethod,
//   amount: totalAmount,      // ← ADD THIS
//   currency: 'USD'            // ← ADD THIS
// };

//       const result = await createPayment(paymentData).unwrap();

//       if (result.success) {
//         // Redirect based on gateway
//         if (result.gateway === 'stripe') {
//           if (result.paymentData.clientSecret) {
//             // Redirect to Stripe checkout page
//             window.location.href = `/payment/stripe?client_secret=${result.paymentData.clientSecret}&plan_id=${selectedPlan.id}`;
//           } else if (result.paymentData.checkoutUrl) {
//             window.location.href = result.paymentData.checkoutUrl;
//           }
//         } else if (result.gateway === 'paddle') {
//           if (result.paymentData.checkoutUrl) {
//             // Redirect to Paddle checkout page
//             window.location.href = result.paymentData.checkoutUrl;
//           } else if (result.paymentData.checkoutId) {
//             window.location.href = `/payment/paddle?checkout_id=${result.paymentData.checkoutId}&plan_id=${selectedPlan.id}`;
//           }
//         }
//       }
//     } catch (err) {
//       console.error('Payment creation failed:', err);
//       setError(err?.data?.error || 'Failed to initiate payment. Please try again.');
//       setIsProcessing(false);
//     }
//   };

  if (!selectedPlan) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <p className="text-gray-600 mb-4">No plan selected</p>
        <button
          onClick={handleBack}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Back to Plans
        </button>
      </div>
    );
  }

  // Calculate fees dynamically from database
  const basePrice = parseFloat(selectedPlan.price || 0);
  let processingFee = 0;
  let totalAmount = basePrice;

  if (selectedPlan.processing_fee_enabled) {
    if (selectedPlan.processing_fee_type === 'fixed') {
      processingFee = parseFloat(selectedPlan.processing_fee_fixed_amount || 0);
    } else if (selectedPlan.processing_fee_type === 'percentage') {
      processingFee = (basePrice * parseFloat(selectedPlan.processing_fee_percentage || 0)) / 100;
    }
    totalAmount = basePrice + processingFee;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={handleBack} className="hover:opacity-80 transition-opacity">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold">Complete Your Subscription </h1>
          </div>
          <p className="text-indigo-100 capitalize">{selectedPlan.plan_name} Plan</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-red-800 font-medium">Payment Error</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Plan Summary */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Plan:</span>
                <span className="font-semibold text-gray-900 capitalize">{selectedPlan.plan_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Base Price:</span>
                <span className="font-semibold text-gray-900">${basePrice.toFixed(2)}</span>
              </div>
              
              {/* Processing Fee Display */}
              {selectedPlan.processing_fee_enabled && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      Processing Fee 
                      {selectedPlan.processing_fee_type === 'percentage' && 
                        ` (${selectedPlan.processing_fee_percentage}%)`
                      }
                      :
                    </span>
                    <span className="font-semibold text-gray-900">${processingFee.toFixed(2)}</span>
                  </div>
                  {selectedPlan.processing_fee_mandatory && (
                    <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={16} />
                      <p className="text-xs text-orange-800">
                        This is a mandatory processing fee
                      </p>
                    </div>
                  )}
                </>
              )}
              
              {/* Total */}
              <div className="border-t border-indigo-200 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-indigo-600">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Billing Cycle */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Billing Cycle:</span>
                <span className="text-gray-900">
                  {selectedPlan.duration_days === 30 ? 'Monthly' : 
                   selectedPlan.duration_days === 365 ? 'Yearly' : 
                   selectedPlan.duration_days === 0 ? 'Lifetime' : 
                   `${selectedPlan.duration_days} days`}
                </span>
              </div>
            </div>
          </div>

          {/* Country & Region Info */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Billing Location</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Country:</span>
                <span className="font-medium text-gray-900">{userCountry || 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Country Code:</span>
                <span className="font-medium text-gray-900">{countryCode}</span>
              </div>
              {recommendation?.region && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Region:</span>
                  <span className="font-medium text-gray-900 uppercase">{recommendation.region}</span>
                </div>
              )}
            </div>
          </div>

          {/* Gateway Recommendation */}
          {isLoadingGateway ? (
            <div className="flex justify-center items-center py-8">
              <Loader className="animate-spin text-indigo-600" size={40} />
            </div>
          ) : isGatewayError ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <p className="text-red-800">
                Failed to load payment options: {gatewayError?.data?.error || 'Unknown error'}
              </p>
            </div>
          ) : recommendation ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Payment Gateway</h3>
              
              {/* Recommended Gateway Info */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-indigo-600 mt-1 flex-shrink-0" size={24} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Recommended for {recommendation.country_name}
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">
                      {recommendation.recommendation_reason || 'Best payment experience for your region'}
                    </p>
                    
                    {/* Gateway Options */}
                    <div className="space-y-2">
                      {recommendation.available_gateways?.map((gateway, index) => (
                        <label
                          key={index}
                          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedGateway === gateway.gateway
                              ? 'border-indigo-500 bg-white shadow-md'
                              : 'border-gray-200 hover:border-indigo-300 bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="gateway"
                            value={gateway.gateway}
                            checked={selectedGateway === gateway.gateway}
                            onChange={(e) => dispatch(setSelectedGateway(e.target.value))}
                            className="mr-3"
                          />
                          <CreditCard className="mr-3 text-gray-600" size={20} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 capitalize">
                                {gateway.gateway}
                              </span>
                              {gateway.recommended && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                                  Recommended
                                </span>
                              )}
                            </div>
                            {gateway.split && (
                              <span className="text-xs text-gray-500">
                                {gateway.split_percentage}% routing
                              </span>
                            )}
                            <p className="text-xs text-gray-600 mt-1">{gateway.reason}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection - ENHANCED WITH GOOGLE PAY */}
              {selectedGateway && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Payment Method</h4>
                  <div className="space-y-2">
                    {/* Credit/Debit Card - UNCHANGED */}
                    <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors">
                      <input
                        type="radio"
                        name="payment-method"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <CreditCard className="mr-2 text-gray-600" size={18} />
                      <span className="text-gray-900">Credit/Debit Card</span>
                    </label>
                    
                    {/* Google Pay - NEW ADDITION (Stripe only) */}
                    {selectedGateway === 'stripe' && (
                      <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors">
                        <input
                          type="radio"
                          name="payment-method"
                          value="google_pay"
                          checked={paymentMethod === 'google_pay'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-3"
                        />
                        {/* Google Pay Icon */}
                        <svg className="mr-2" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span className="text-gray-900">Google Pay</span>
                      </label>
                    )}
                    
                    {/* PayPal - UNCHANGED (Stripe only) */}
                    {selectedGateway === 'stripe' && (
                      <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors">
                        <input
                          type="radio"
                          name="payment-method"
                          value="paypal"
                          checked={paymentMethod === 'paypal'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-3"
                        />
                        {/* PayPal Icon */}
                        <svg className="mr-2" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .757-.629h6.622c2.198 0 3.97.63 5.27 1.87 1.352 1.29 1.866 3.078 1.531 5.316-.022.147-.048.296-.078.446-.59 2.967-2.154 5.013-4.644 6.09-1.32.57-2.788.855-4.368.855H7.844a.77.77 0 0 0-.758.629l-.01.067z" fill="#003087"/>
                          <path d="M20.063 7.03c-.024.147-.05.296-.08.446-.593 2.967-2.157 5.013-4.647 6.09-1.32.57-2.788.855-4.368.855H8.844a.77.77 0 0 0-.758.629l-1.074 6.803a.641.641 0 0 0 .633.74h3.323a.77.77 0 0 0 .758-.629l.643-4.07a.77.77 0 0 1 .758-.63h1.472c3.94 0 7.021-1.597 7.924-6.218.377-1.927.153-3.49-.71-4.555a4.5 4.5 0 0 0-.75-.66z" fill="#0070E0"/>
                        </svg>
                        <span className="text-gray-900">PayPal</span>
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleBack}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isProcessing}
            >
              Back
            </button>
            <button
              onClick={handleProceedToPayment}
              disabled={!selectedGateway || isProcessing || isLoadingGateway || isCreatingPayment}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing || isCreatingPayment ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                // `Proceed to ${selectedGateway === 'stripe' ? 'Stripe' : selectedGateway === 'paddle' ? 'Paddle' : 'Payment'}`
                `Proceed to ${
  selectedGateway === 'stripe' 
    ? (paymentMethod === 'google_pay' ? 'Google Pay' : paymentMethod === 'paypal' ? 'PayPal' : 'Stripe')
    : selectedGateway === 'paddle' 
      ? 'Paddle' 
      : 'Payment'
}`
              )}
            </button>
          </div>

          {/* Security Notice */}
          <div className="text-center text-sm text-gray-500">
            <p>🔒 Secure checkout powered by {selectedGateway === 'stripe' ? 'Stripe' : 'Paddle'}</p>
            <p className="mt-1">Your payment information is encrypted and secure </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCheckout;
//previous successful code only to add google pay above code
// import React, { useState, useEffect } from 'react';
// import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
// import { setCheckoutStep, setSelectedGateway } from '../../../../redux/slices/subscriptionSlice';
// import { useGetGatewayRecommendationQuery, useCreatePaymentMutation } from '../../../../redux/api/subscription/subscriptionApi';
// import { Loader, ArrowLeft, CheckCircle, CreditCard, AlertCircle } from 'lucide-react';

// // Country name to country code mapping
// const COUNTRY_CODE_MAP = {
//   'United States': 'US',
//   'United Kingdom': 'GB',
//   'Canada': 'CA',
//   'Australia': 'AU',
//   'India': 'IN',
//   'Bangladesh': 'BD',
//   'Pakistan': 'PK',
//   'Germany': 'DE',
//   'France': 'FR',
//   'Spain': 'ES',
//   'Italy': 'IT',
//   'Brazil': 'BR',
//   'Mexico': 'MX',
//   'Japan': 'JP',
//   'China': 'CN',
//   'Netherlands': 'NL',
//   'Sweden': 'SE',
//   'Norway': 'NO',
//   'Denmark': 'DK',
//   'Singapore': 'SG',
// };

// const SubscriptionCheckout = () => {
//   const dispatch = useAppDispatch();
//   const [paymentMethod, setPaymentMethod] = useState('card');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState(null);
  
//   const userCountry = useAppSelector((state) => state.auth.country);
//   const selectedPlan = useAppSelector((state) => state.subscription.selectedPlan);
//   const selectedGateway = useAppSelector((state) => state.subscription.selectedGateway);
  
//   // Convert country name to code
//   const countryCode = COUNTRY_CODE_MAP[userCountry] || 'US';

//   // Get gateway recommendation from backend
//   const { 
//     data: gatewayData, 
//     isLoading: isLoadingGateway,
//     isError: isGatewayError,
//     error: gatewayError
//   } = useGetGatewayRecommendationQuery(
//     { country_code: countryCode, plan_id: selectedPlan?.id },
//     { skip: !selectedPlan }
//   );

//   const [createPayment, { isLoading: isCreatingPayment }] = useCreatePaymentMutation();

//   const recommendation = gatewayData?.recommendation;
//   const recommendedGateway = recommendation?.available_gateways?.[0]?.gateway;

//   // Auto-select recommended gateway
//   useEffect(() => {
//     if (recommendedGateway && !selectedGateway) {
//       dispatch(setSelectedGateway(recommendedGateway));
//     }
//   }, [recommendedGateway, selectedGateway, dispatch]);

//   const handleBack = () => {
//     dispatch(setCheckoutStep('plan-selection'));
//   };
//   // Add this debugging code to see what Paddle returns

// const handleProceedToPayment = async () => {
//   if (!selectedGateway || !selectedPlan) return;
  
//   setIsProcessing(true);
//   setError(null);

//   try {
//     const paymentData = {
//       plan_id: selectedPlan.id,
//       country_code: countryCode,
//       payment_method: paymentMethod,
//       amount: totalAmount,
//       currency: 'USD'
//     };

//     console.log('🚀 Creating payment with:', paymentData);
//     const result = await createPayment(paymentData).unwrap();
//     console.log('✅ Payment API response:', result);

//     if (result.success) {
//       console.log('Gateway:', result.gateway);
//       console.log('Payment Data:', result.paymentData);
      
//       // Redirect based on gateway
//       if (result.gateway === 'stripe') {
//         console.log('📍 Stripe redirect');
//         if (result.paymentData.clientSecret) {
//           const redirectUrl = `/payment/stripe?client_secret=${result.paymentData.clientSecret}&plan_id=${selectedPlan.id}`;
//           console.log('Redirecting to:', redirectUrl);
//           window.location.href = redirectUrl;
//         } else if (result.paymentData.checkoutUrl) {
//           console.log('Redirecting to:', result.paymentData.checkoutUrl);
//           window.location.href = result.paymentData.checkoutUrl;
//         }
//       } else if (result.gateway === 'paddle') {
//         console.log('📍 Paddle redirect');
//         console.log('Paddle paymentData:', result.paymentData);
        
//         // ✅ FIX: Check all possible Paddle response fields
//         const checkoutUrl = result.paymentData?.checkoutUrl || 
//                            result.paymentData?.checkout_url ||
//                            result.payment?.checkout_url ||
//                            result.checkoutUrl;
        
//         const transactionId = result.paymentData?.transactionId ||
//                              result.paymentData?.transaction_id ||
//                              result.payment?.transaction_id;
        
//         console.log('Checkout URL:', checkoutUrl);
//         console.log('Transaction ID:', transactionId);
        
//         if (checkoutUrl) {
//           console.log('✅ Redirecting to Paddle checkout:', checkoutUrl);
//           window.location.href = checkoutUrl;
//         } else if (transactionId) {
//           const paddleUrl = `/payment/paddle?transaction_id=${transactionId}&plan_id=${selectedPlan.id}`;
//           console.log('✅ Redirecting to Paddle payment page:', paddleUrl);
//           window.location.href = paddleUrl;
//         } else {
//           console.error('❌ No Paddle checkout URL or transaction ID found');
//           setError('Paddle checkout URL not found. Please try again.');
//           setIsProcessing(false);
//         }
//       }
//     } else {
//       console.error('❌ Payment creation failed:', result);
//       setError(result.error || 'Payment creation failed');
//       setIsProcessing(false);
//     }
//   } catch (err) {
//     console.error('❌ Payment creation error:', err);
//     setError(err?.data?.error || 'Failed to initiate payment. Please try again.');
//     setIsProcessing(false);
//   }
// };

// //   const handleProceedToPayment = async () => {
// //     if (!selectedGateway || !selectedPlan) return;
    
// //     setIsProcessing(true);
// //     setError(null);

// //     try {
// //       // const paymentData = {
// //       //   planId: selectedPlan.id,
// //       //   country_code: countryCode,
// //       //   payment_method: paymentMethod,
// //       // };
// //       const paymentData = {
// //   planId: selectedPlan.id,
// //   country_code: countryCode,
// //   payment_method: paymentMethod,
// //   amount: totalAmount,      // ← ADD THIS
// //   currency: 'USD'            // ← ADD THIS
// // };

// //       const result = await createPayment(paymentData).unwrap();

// //       if (result.success) {
// //         // Redirect based on gateway
// //         if (result.gateway === 'stripe') {
// //           if (result.paymentData.clientSecret) {
// //             // Redirect to Stripe checkout page
// //             window.location.href = `/payment/stripe?client_secret=${result.paymentData.clientSecret}&plan_id=${selectedPlan.id}`;
// //           } else if (result.paymentData.checkoutUrl) {
// //             window.location.href = result.paymentData.checkoutUrl;
// //           }
// //         } else if (result.gateway === 'paddle') {
// //           if (result.paymentData.checkoutUrl) {
// //             // Redirect to Paddle checkout page
// //             window.location.href = result.paymentData.checkoutUrl;
// //           } else if (result.paymentData.checkoutId) {
// //             window.location.href = `/payment/paddle?checkout_id=${result.paymentData.checkoutId}&plan_id=${selectedPlan.id}`;
// //           }
// //         }
// //       }
// //     } catch (err) {
// //       console.error('Payment creation failed:', err);
// //       setError(err?.data?.error || 'Failed to initiate payment. Please try again.');
// //       setIsProcessing(false);
// //     }
// //   };

//   if (!selectedPlan) {
//     return (
//       <div className="bg-white rounded-lg shadow-lg p-8 text-center">
//         <p className="text-gray-600 mb-4">No plan selected</p>
//         <button
//           onClick={handleBack}
//           className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
//         >
//           Back to Plans
//         </button>
//       </div>
//     );
//   }

//   // Calculate fees dynamically from database
//   const basePrice = parseFloat(selectedPlan.price || 0);
//   let processingFee = 0;
//   let totalAmount = basePrice;

//   if (selectedPlan.processing_fee_enabled) {
//     if (selectedPlan.processing_fee_type === 'fixed') {
//       processingFee = parseFloat(selectedPlan.processing_fee_fixed_amount || 0);
//     } else if (selectedPlan.processing_fee_type === 'percentage') {
//       processingFee = (basePrice * parseFloat(selectedPlan.processing_fee_percentage || 0)) / 100;
//     }
//     totalAmount = basePrice + processingFee;
//   }

//   return (
//     <div className="max-w-3xl mx-auto">
//       <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
//           <div className="flex items-center gap-3 mb-2">
//             <button onClick={handleBack} className="hover:opacity-80 transition-opacity">
//               <ArrowLeft size={24} />
//             </button>
//             <h1 className="text-2xl font-bold">Complete Your Subscription </h1>
//           </div>
//           <p className="text-indigo-100 capitalize">{selectedPlan.plan_name} Plan</p>
//         </div>

//         {/* Content */}
//         <div className="p-8 space-y-8">
//           {/* Error Display */}
//           {error && (
//             <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
//               <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
//               <div>
//                 <p className="text-red-800 font-medium">Payment Error</p>
//                 <p className="text-red-700 text-sm mt-1">{error}</p>
//               </div>
//             </div>
//           )}

//           {/* Plan Summary */}
//           <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
//             <div className="space-y-3">
//               <div className="flex justify-between items-center">
//                 <span className="text-gray-600">Plan:</span>
//                 <span className="font-semibold text-gray-900 capitalize">{selectedPlan.plan_name}</span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-gray-600">Base Price:</span>
//                 <span className="font-semibold text-gray-900">${basePrice.toFixed(2)}</span>
//               </div>
              
//               {/* Processing Fee Display */}
//               {selectedPlan.processing_fee_enabled && (
//                 <>
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600">
//                       Processing Fee 
//                       {selectedPlan.processing_fee_type === 'percentage' && 
//                         ` (${selectedPlan.processing_fee_percentage}%)`
//                       }
//                       :
//                     </span>
//                     <span className="font-semibold text-gray-900">${processingFee.toFixed(2)}</span>
//                   </div>
//                   {selectedPlan.processing_fee_mandatory && (
//                     <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg p-3">
//                       <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={16} />
//                       <p className="text-xs text-orange-800">
//                         This is a mandatory processing fee
//                       </p>
//                     </div>
//                   )}
//                 </>
//               )}
              
//               {/* Total */}
//               <div className="border-t border-indigo-200 pt-3 mt-3">
//                 <div className="flex justify-between items-center">
//                   <span className="text-lg font-semibold text-gray-900">Total:</span>
//                   <span className="text-2xl font-bold text-indigo-600">${totalAmount.toFixed(2)}</span>
//                 </div>
//               </div>
              
//               {/* Billing Cycle */}
//               <div className="flex justify-between items-center text-sm">
//                 <span className="text-gray-600">Billing Cycle:</span>
//                 <span className="text-gray-900">
//                   {selectedPlan.duration_days === 30 ? 'Monthly' : 
//                    selectedPlan.duration_days === 365 ? 'Yearly' : 
//                    selectedPlan.duration_days === 0 ? 'Lifetime' : 
//                    `${selectedPlan.duration_days} days`}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Country & Region Info */}
//           <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
//             <h3 className="font-semibold text-gray-900 mb-3">Billing Location</h3>
//             <div className="space-y-2">
//               <div className="flex justify-between items-center">
//                 <span className="text-gray-600">Country:</span>
//                 <span className="font-medium text-gray-900">{userCountry || 'Not set'}</span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-gray-600">Country Code:</span>
//                 <span className="font-medium text-gray-900">{countryCode}</span>
//               </div>
//               {recommendation?.region && (
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600">Region:</span>
//                   <span className="font-medium text-gray-900 uppercase">{recommendation.region}</span>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Gateway Recommendation */}
//           {isLoadingGateway ? (
//             <div className="flex justify-center items-center py-8">
//               <Loader className="animate-spin text-indigo-600" size={40} />
//             </div>
//           ) : isGatewayError ? (
//             <div className="bg-red-50 border border-red-200 rounded-xl p-6">
//               <p className="text-red-800">
//                 Failed to load payment options: {gatewayError?.data?.error || 'Unknown error'}
//               </p>
//             </div>
//           ) : recommendation ? (
//             <div className="space-y-4">
//               <h3 className="font-semibold text-gray-900">Payment Gateway</h3>
              
//               {/* Recommended Gateway Info */}
//               <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
//                 <div className="flex items-start gap-3">
//                   <CheckCircle className="text-indigo-600 mt-1 flex-shrink-0" size={24} />
//                   <div className="flex-1">
//                     <h4 className="font-semibold text-gray-900 mb-1">
//                       Recommended for {recommendation.country_name}
//                     </h4>
//                     <p className="text-sm text-gray-700 mb-3">
//                       {recommendation.recommendation_reason || 'Best payment experience for your region'}
//                     </p>
                    
//                     {/* Gateway Options */}
//                     <div className="space-y-2">
//                       {recommendation.available_gateways?.map((gateway, index) => (
//                         <label
//                           key={index}
//                           className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
//                             selectedGateway === gateway.gateway
//                               ? 'border-indigo-500 bg-white shadow-md'
//                               : 'border-gray-200 hover:border-indigo-300 bg-white'
//                           }`}
//                         >
//                           <input
//                             type="radio"
//                             name="gateway"
//                             value={gateway.gateway}
//                             checked={selectedGateway === gateway.gateway}
//                             onChange={(e) => dispatch(setSelectedGateway(e.target.value))}
//                             className="mr-3"
//                           />
//                           <CreditCard className="mr-3 text-gray-600" size={20} />
//                           <div className="flex-1">
//                             <div className="flex items-center gap-2">
//                               <span className="font-medium text-gray-900 capitalize">
//                                 {gateway.gateway}
//                               </span>
//                               {gateway.recommended && (
//                                 <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
//                                   Recommended
//                                 </span>
//                               )}
//                             </div>
//                             {gateway.split && (
//                               <span className="text-xs text-gray-500">
//                                 {gateway.split_percentage}% routing
//                               </span>
//                             )}
//                             <p className="text-xs text-gray-600 mt-1">{gateway.reason}</p>
//                           </div>
//                         </label>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Payment Method Selection */}
//               {selectedGateway && (
//                 <div className="space-y-3">
//                   <h4 className="font-medium text-gray-900">Payment Method</h4>
//                   <div className="space-y-2">
//                     <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors">
//                       <input
//                         type="radio"
//                         name="payment-method"
//                         value="card"
//                         checked={paymentMethod === 'card'}
//                         onChange={(e) => setPaymentMethod(e.target.value)}
//                         className="mr-3"
//                       />
//                       <CreditCard className="mr-2 text-gray-600" size={18} />
//                       <span className="text-gray-900">Credit/Debit Card</span>
//                     </label>
//                     {selectedGateway === 'stripe' && (
//                       <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors">
//                         <input
//                           type="radio"
//                           name="payment-method"
//                           value="paypal"
//                           checked={paymentMethod === 'paypal'}
//                           onChange={(e) => setPaymentMethod(e.target.value)}
//                           className="mr-3"
//                         />
//                         <span className="text-gray-900">PayPal</span>
//                       </label>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           ) : null}

//           {/* Action Buttons */}
//           <div className="flex gap-4 pt-4">
//             <button
//               onClick={handleBack}
//               className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
//               disabled={isProcessing}
//             >
//               Back
//             </button>
//             <button
//               onClick={handleProceedToPayment}
//               disabled={!selectedGateway || isProcessing || isLoadingGateway || isCreatingPayment}
//               className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//             >
//               {isProcessing || isCreatingPayment ? (
//                 <>
//                   <Loader className="animate-spin" size={20} />
//                   Processing...
//                 </>
//               ) : (
//                 `Proceed to ${selectedGateway === 'stripe' ? 'Stripe' : selectedGateway === 'paddle' ? 'Paddle' : 'Payment'}`
//               )}
//             </button>
//           </div>

//           {/* Security Notice */}
//           <div className="text-center text-sm text-gray-500">
//             <p>🔒 Secure checkout powered by {selectedGateway === 'stripe' ? 'Stripe' : 'Paddle'}</p>
//             <p className="mt-1">Your payment information is encrypted and secure </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SubscriptionCheckout;
//last working code
// import React, { useState, useEffect } from 'react';
// import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
// import { setCheckoutStep, setSelectedGateway } from '../../../../redux/slices/subscriptionSlice';
// import { useGetGatewayRecommendationQuery, useCreatePaymentMutation } from '../../../../redux/api/subscription/subscriptionApi';
// import { Loader, ArrowLeft, CheckCircle, CreditCard, AlertCircle } from 'lucide-react';

// // Country name to country code mapping
// const COUNTRY_CODE_MAP = {
//   'United States': 'US',
//   'United Kingdom': 'GB',
//   'Canada': 'CA',
//   'Australia': 'AU',
//   'India': 'IN',
//   'Bangladesh': 'BD',
//   'Pakistan': 'PK',
//   'Germany': 'DE',
//   'France': 'FR',
//   'Spain': 'ES',
//   'Italy': 'IT',
//   'Brazil': 'BR',
//   'Mexico': 'MX',
//   'Japan': 'JP',
//   'China': 'CN',
//   'Netherlands': 'NL',
//   'Sweden': 'SE',
//   'Norway': 'NO',
//   'Denmark': 'DK',
//   'Singapore': 'SG',
// };

// const SubscriptionCheckout = () => {
//   const dispatch = useAppDispatch();
//   const [paymentMethod, setPaymentMethod] = useState('card');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState(null);
  
//   const userCountry = useAppSelector((state) => state.auth.country);
//   const selectedPlan = useAppSelector((state) => state.subscription.selectedPlan);
//   const selectedGateway = useAppSelector((state) => state.subscription.selectedGateway);
  
//   // Convert country name to code
//   const countryCode = COUNTRY_CODE_MAP[userCountry] || 'US';

//   // Get gateway recommendation from backend
//   const { 
//     data: gatewayData, 
//     isLoading: isLoadingGateway,
//     isError: isGatewayError,
//     error: gatewayError
//   } = useGetGatewayRecommendationQuery(
//     { country_code: countryCode, plan_id: selectedPlan?.id },
//     { skip: !selectedPlan }
//   );

//   const [createPayment, { isLoading: isCreatingPayment }] = useCreatePaymentMutation();

//   const recommendation = gatewayData?.recommendation;
//   const recommendedGateway = recommendation?.available_gateways?.[0]?.gateway;

//   // Auto-select recommended gateway
//   useEffect(() => {
//     if (recommendedGateway && !selectedGateway) {
//       dispatch(setSelectedGateway(recommendedGateway));
//     }
//   }, [recommendedGateway, selectedGateway, dispatch]);

//   const handleBack = () => {
//     dispatch(setCheckoutStep('plan-selection'));
//   };

//   const handleProceedToPayment = async () => {
//     if (!selectedGateway || !selectedPlan) return;
    
//     setIsProcessing(true);
//     setError(null);

//     try {
//       // const paymentData = {
//       //   planId: selectedPlan.id,
//       //   country_code: countryCode,
//       //   payment_method: paymentMethod,
//       // };
//       const paymentData = {
//   planId: selectedPlan.id,
//   country_code: countryCode,
//   payment_method: paymentMethod,
//   amount: totalAmount,      // ← ADD THIS
//   currency: 'USD'            // ← ADD THIS
// };

//       const result = await createPayment(paymentData).unwrap();

//       if (result.success) {
//         // Redirect based on gateway
//         if (result.gateway === 'stripe') {
//           if (result.paymentData.clientSecret) {
//             // Redirect to Stripe checkout page
//             window.location.href = `/payment/stripe?client_secret=${result.paymentData.clientSecret}&plan_id=${selectedPlan.id}`;
//           } else if (result.paymentData.checkoutUrl) {
//             window.location.href = result.paymentData.checkoutUrl;
//           }
//         } else if (result.gateway === 'paddle') {
//           if (result.paymentData.checkoutUrl) {
//             // Redirect to Paddle checkout page
//             window.location.href = result.paymentData.checkoutUrl;
//           } else if (result.paymentData.checkoutId) {
//             window.location.href = `/payment/paddle?checkout_id=${result.paymentData.checkoutId}&plan_id=${selectedPlan.id}`;
//           }
//         }
//       }
//     } catch (err) {
//       console.error('Payment creation failed:', err);
//       setError(err?.data?.error || 'Failed to initiate payment. Please try again.');
//       setIsProcessing(false);
//     }
//   };

//   if (!selectedPlan) {
//     return (
//       <div className="bg-white rounded-lg shadow-lg p-8 text-center">
//         <p className="text-gray-600 mb-4">No plan selected</p>
//         <button
//           onClick={handleBack}
//           className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
//         >
//           Back to Plans
//         </button>
//       </div>
//     );
//   }

//   // Calculate fees dynamically from database
//   const basePrice = parseFloat(selectedPlan.price || 0);
//   let processingFee = 0;
//   let totalAmount = basePrice;

//   if (selectedPlan.processing_fee_enabled) {
//     if (selectedPlan.processing_fee_type === 'fixed') {
//       processingFee = parseFloat(selectedPlan.processing_fee_fixed_amount || 0);
//     } else if (selectedPlan.processing_fee_type === 'percentage') {
//       processingFee = (basePrice * parseFloat(selectedPlan.processing_fee_percentage || 0)) / 100;
//     }
//     totalAmount = basePrice + processingFee;
//   }

//   return (
//     <div className="max-w-3xl mx-auto">
//       <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
//           <div className="flex items-center gap-3 mb-2">
//             <button onClick={handleBack} className="hover:opacity-80 transition-opacity">
//               <ArrowLeft size={24} />
//             </button>
//             <h1 className="text-2xl font-bold">Complete Your Subscription</h1>
//           </div>
//           <p className="text-indigo-100 capitalize">{selectedPlan.plan_name} Plan</p>
//         </div>

//         {/* Content */}
//         <div className="p-8 space-y-8">
//           {/* Error Display */}
//           {error && (
//             <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
//               <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
//               <div>
//                 <p className="text-red-800 font-medium">Payment Error</p>
//                 <p className="text-red-700 text-sm mt-1">{error}</p>
//               </div>
//             </div>
//           )}

//           {/* Plan Summary */}
//           <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
//             <div className="space-y-3">
//               <div className="flex justify-between items-center">
//                 <span className="text-gray-600">Plan:</span>
//                 <span className="font-semibold text-gray-900 capitalize">{selectedPlan.plan_name}</span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-gray-600">Base Price:</span>
//                 <span className="font-semibold text-gray-900">${basePrice.toFixed(2)}</span>
//               </div>
              
//               {/* Processing Fee Display */}
//               {selectedPlan.processing_fee_enabled && (
//                 <>
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600">
//                       Processing Fee 
//                       {selectedPlan.processing_fee_type === 'percentage' && 
//                         ` (${selectedPlan.processing_fee_percentage}%)`
//                       }
//                       :
//                     </span>
//                     <span className="font-semibold text-gray-900">${processingFee.toFixed(2)}</span>
//                   </div>
//                   {selectedPlan.processing_fee_mandatory && (
//                     <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg p-3">
//                       <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={16} />
//                       <p className="text-xs text-orange-800">
//                         This is a mandatory processing fee
//                       </p>
//                     </div>
//                   )}
//                 </>
//               )}
              
//               {/* Total */}
//               <div className="border-t border-indigo-200 pt-3 mt-3">
//                 <div className="flex justify-between items-center">
//                   <span className="text-lg font-semibold text-gray-900">Total:</span>
//                   <span className="text-2xl font-bold text-indigo-600">${totalAmount.toFixed(2)}</span>
//                 </div>
//               </div>
              
//               {/* Billing Cycle */}
//               <div className="flex justify-between items-center text-sm">
//                 <span className="text-gray-600">Billing Cycle:</span>
//                 <span className="text-gray-900">
//                   {selectedPlan.duration_days === 30 ? 'Monthly' : 
//                    selectedPlan.duration_days === 365 ? 'Yearly' : 
//                    selectedPlan.duration_days === 0 ? 'Lifetime' : 
//                    `${selectedPlan.duration_days} days`}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Country & Region Info */}
//           <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
//             <h3 className="font-semibold text-gray-900 mb-3">Billing Location</h3>
//             <div className="space-y-2">
//               <div className="flex justify-between items-center">
//                 <span className="text-gray-600">Country:</span>
//                 <span className="font-medium text-gray-900">{userCountry || 'Not set'}</span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-gray-600">Country Code:</span>
//                 <span className="font-medium text-gray-900">{countryCode}</span>
//               </div>
//               {recommendation?.region && (
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600">Region:</span>
//                   <span className="font-medium text-gray-900 uppercase">{recommendation.region}</span>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Gateway Recommendation */}
//           {isLoadingGateway ? (
//             <div className="flex justify-center items-center py-8">
//               <Loader className="animate-spin text-indigo-600" size={40} />
//             </div>
//           ) : isGatewayError ? (
//             <div className="bg-red-50 border border-red-200 rounded-xl p-6">
//               <p className="text-red-800">
//                 Failed to load payment options: {gatewayError?.data?.error || 'Unknown error'}
//               </p>
//             </div>
//           ) : recommendation ? (
//             <div className="space-y-4">
//               <h3 className="font-semibold text-gray-900">Payment Gateway</h3>
              
//               {/* Recommended Gateway Info */}
//               <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
//                 <div className="flex items-start gap-3">
//                   <CheckCircle className="text-indigo-600 mt-1 flex-shrink-0" size={24} />
//                   <div className="flex-1">
//                     <h4 className="font-semibold text-gray-900 mb-1">
//                       Recommended for {recommendation.country_name}
//                     </h4>
//                     <p className="text-sm text-gray-700 mb-3">
//                       {recommendation.recommendation_reason || 'Best payment experience for your region'}
//                     </p>
                    
//                     {/* Gateway Options */}
//                     <div className="space-y-2">
//                       {recommendation.available_gateways?.map((gateway, index) => (
//                         <label
//                           key={index}
//                           className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
//                             selectedGateway === gateway.gateway
//                               ? 'border-indigo-500 bg-white shadow-md'
//                               : 'border-gray-200 hover:border-indigo-300 bg-white'
//                           }`}
//                         >
//                           <input
//                             type="radio"
//                             name="gateway"
//                             value={gateway.gateway}
//                             checked={selectedGateway === gateway.gateway}
//                             onChange={(e) => dispatch(setSelectedGateway(e.target.value))}
//                             className="mr-3"
//                           />
//                           <CreditCard className="mr-3 text-gray-600" size={20} />
//                           <div className="flex-1">
//                             <div className="flex items-center gap-2">
//                               <span className="font-medium text-gray-900 capitalize">
//                                 {gateway.gateway}
//                               </span>
//                               {gateway.recommended && (
//                                 <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
//                                   Recommended
//                                 </span>
//                               )}
//                             </div>
//                             {gateway.split && (
//                               <span className="text-xs text-gray-500">
//                                 {gateway.split_percentage}% routing
//                               </span>
//                             )}
//                             <p className="text-xs text-gray-600 mt-1">{gateway.reason}</p>
//                           </div>
//                         </label>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Payment Method Selection */}
//               {selectedGateway && (
//                 <div className="space-y-3">
//                   <h4 className="font-medium text-gray-900">Payment Method</h4>
//                   <div className="space-y-2">
//                     <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors">
//                       <input
//                         type="radio"
//                         name="payment-method"
//                         value="card"
//                         checked={paymentMethod === 'card'}
//                         onChange={(e) => setPaymentMethod(e.target.value)}
//                         className="mr-3"
//                       />
//                       <CreditCard className="mr-2 text-gray-600" size={18} />
//                       <span className="text-gray-900">Credit/Debit Card</span>
//                     </label>
//                     {selectedGateway === 'stripe' && (
//                       <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors">
//                         <input
//                           type="radio"
//                           name="payment-method"
//                           value="paypal"
//                           checked={paymentMethod === 'paypal'}
//                           onChange={(e) => setPaymentMethod(e.target.value)}
//                           className="mr-3"
//                         />
//                         <span className="text-gray-900">PayPal</span>
//                       </label>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           ) : null}

//           {/* Action Buttons */}
//           <div className="flex gap-4 pt-4">
//             <button
//               onClick={handleBack}
//               className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
//               disabled={isProcessing}
//             >
//               Back
//             </button>
//             <button
//               onClick={handleProceedToPayment}
//               disabled={!selectedGateway || isProcessing || isLoadingGateway || isCreatingPayment}
//               className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//             >
//               {isProcessing || isCreatingPayment ? (
//                 <>
//                   <Loader className="animate-spin" size={20} />
//                   Processing...
//                 </>
//               ) : (
//                 `Proceed to ${selectedGateway === 'stripe' ? 'Stripe' : selectedGateway === 'paddle' ? 'Paddle' : 'Payment'}`
//               )}
//             </button>
//           </div>

//           {/* Security Notice */}
//           <div className="text-center text-sm text-gray-500">
//             <p>🔒 Secure checkout powered by {selectedGateway === 'stripe' ? 'Stripe' : 'Paddle'}</p>
//             <p className="mt-1">Your payment information is encrypted and secure</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SubscriptionCheckout;
// import React, { useState, useEffect } from 'react';
// import { useAppDispatch, useAppSelector } from '../../../../redux/hooks'; // ✅ Changed
// import { setCheckoutStep, updateCheckoutData } from '../../../../redux/slices/subscriptionSlice';
// import GatewayRecommendation from './GatewayRecommendation';
// import StripePaymentForm from './StripePaymentForm';
// import PaddlePaymentForm from './PaddlePaymentForm';
// import ParticipationFeeDisplay from './ParticipationFeeDisplay';
// import { usePayment } from './usePayment';
// import { Loader, ArrowLeft } from 'lucide-react';

// const SubscriptionCheckout = () => {
//   const dispatch = useAppDispatch(); // ✅ Changed
//   const [countryCode, setCountryCode] = useState('');
  
//   const userCountry = useAppSelector((state) => state.auth.country);
//   const checkoutStep = useAppSelector((state) => state.subscription.checkoutStep);
//   const selectedPlan = useAppSelector((state) => state.subscription.selectedPlan);
//   const selectedGateway = useAppSelector((state) => state.subscription.selectedGateway);
  
//   const { initiatePayment, loading: paymentLoading } = usePayment();

//   useEffect(() => {
//     if (userCountry) {
//       setCountryCode(userCountry);
//     }
//   }, [userCountry]);

//   const handleGatewaySelected = () => {
//     dispatch(setCheckoutStep('payment'));
//   };

//   const handlePaymentSubmit = async (paymentData) => {
//     try {
//       await initiatePayment(paymentData);
//     } catch (error) {
//       console.error('Payment error:', error);
//     }
//   };

//   const handleBack = () => {
//     dispatch(setCheckoutStep('plan-selection'));
//   };

//   if (!selectedPlan) {
//     return (
//       <div className="bg-white rounded-lg shadow-lg p-8 text-center">
//         <p className="text-gray-600 mb-4">No plan selected</p>
//         <button
//           onClick={handleBack}
//           className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
//         >
//           Back to Plans
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-2xl mx-auto">
//       <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
//           <div className="flex items-center gap-2 mb-2">
//             <button onClick={handleBack} className="hover:opacity-80">
//               <ArrowLeft size={20} />
//             </button>
//             <h1 className="text-2xl font-bold">Complete Your Purchase</h1>
//           </div>
//           <p className="text-blue-100">{selectedPlan.name}</p>
//         </div>

//         {/* Content */}
//         <div className="p-6 space-y-8">
//           {/* Plan Summary */}
//           <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <p className="text-sm text-gray-600">Plan</p>
//                 <p className="font-semibold text-gray-900">{selectedPlan.name}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600">Price</p>
//                 <p className="font-semibold text-gray-900">${selectedPlan.price}</p>
//               </div>
//             </div>
//           </div>

//           {/* Country Code */}
//           <div className="space-y-4">
//             <h3 className="font-semibold text-gray-900">Billing Information</h3>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Country Code
//               </label>
//               <input
//                 type="text"
//                 value={countryCode}
//                 onChange={(e) => {
//                   setCountryCode(e.target.value.toUpperCase());
//                   dispatch(updateCheckoutData({ country_code: e.target.value.toUpperCase() }));
//                 }}
//                 maxLength="2"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="US"
//               />
//             </div>
//           </div>

//           {/* Participation Fee Info */}
//           <ParticipationFeeDisplay plan={selectedPlan} amount={selectedPlan.price} />

//           {/* Gateway Selection */}
//           {checkoutStep === 'gateway-selection' || !selectedGateway ? (
//             <div>
//               <h3 className="font-semibold text-gray-900 mb-4">Select Payment Method</h3>
//               {countryCode ? (
//                 <GatewayRecommendation
//                   countryCode={countryCode}
//                   planId={selectedPlan.id}
//                   onGatewaySelected={handleGatewaySelected}
//                 />
//               ) : (
//                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//                   <p className="text-yellow-800 text-sm">
//                     Please enter your country code to see available payment options
//                   </p>
//                 </div>
//               )}
//             </div>
//           ) : null}

//           {/* Payment Forms */}
//           {checkoutStep === 'payment' && selectedGateway && countryCode && (
//             <div>
//               <h3 className="font-semibold text-gray-900 mb-4">
//                 {selectedGateway === 'stripe' ? 'Pay with Stripe' : 'Pay with Paddle'}
//               </h3>

//               {selectedGateway === 'stripe' && (
//                 <StripePaymentForm
//                   onSubmit={handlePaymentSubmit}
//                   loading={paymentLoading}
//                   plan={selectedPlan}
//                   amount={selectedPlan.price}
//                   countryCode={countryCode}
//                 />
//               )}

//               {selectedGateway === 'paddle' && (
//                 <PaddlePaymentForm
//                   onSubmit={handlePaymentSubmit}
//                   loading={paymentLoading}
//                   plan={selectedPlan}
//                   amount={selectedPlan.price}
//                   countryCode={countryCode}
//                 />
//               )}
//             </div>
//           )}

//           {/* Back Button */}
//           <button
//             onClick={handleBack}
//             className="w-full text-gray-600 hover:text-gray-900 font-semibold py-2 border border-gray-300 rounded-lg transition-colors duration-200"
//           >
//             Back to Plans
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SubscriptionCheckout;
