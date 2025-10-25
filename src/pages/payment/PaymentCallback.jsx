// src/pages/payment/PaymentCallback.jsx
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader, CheckCircle, XCircle } from 'lucide-react';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const gateway = searchParams.get('gateway');
  const planId = searchParams.get('plan_id');
  
  // Paddle params
  const transactionId = searchParams.get('_ptxn');
  
  // Stripe params
  const paymentIntent = searchParams.get('payment_intent');
  const redirectStatus = searchParams.get('redirect_status');
  
  useEffect(() => {
    console.log('Payment callback received:', {
      gateway,
      planId,
      transactionId,
      paymentIntent,
      redirectStatus
    });
    
    // Handle Paddle payment
    if (gateway === 'paddle' && transactionId) {
      console.log('✅ Paddle payment completed:', transactionId);
      
      setTimeout(() => {
        navigate('/dashboard?payment=success&plan=' + planId, { replace: true });
      }, 2000);
    }
    
    // Handle Stripe payment
    else if (gateway === 'stripe' && paymentIntent && redirectStatus === 'succeeded') {
      console.log('✅ Stripe payment completed:', paymentIntent);
      
      setTimeout(() => {
        navigate('/dashboard?payment=success&plan=' + planId, { replace: true });
      }, 2000);
    }
    
    // Handle failed payment
    else if (redirectStatus === 'failed') {
      console.log('❌ Payment failed');
      
      setTimeout(() => {
        navigate('/pricing?payment=failed', { replace: true });
      }, 3000);
    }
  }, [gateway, transactionId, planId, paymentIntent, redirectStatus, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-4">
          Your subscription has been activated.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Loader className="animate-spin" size={16} />
          <span>Redirecting to dashboard...</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;
//last workable codes
// // src/pages/PaymentCallback.jsx
// import { useEffect } from 'react';
// import { useSearchParams, useNavigate } from 'react-router-dom';
// import { Loader, CheckCircle, XCircle } from 'lucide-react';

// const PaymentCallback = () => {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
  
//   const gateway = searchParams.get('gateway');
//   const transactionId = searchParams.get('_ptxn'); // Paddle adds this
//   const planId = searchParams.get('plan_id');
  
//   useEffect(() => {
//     if (gateway === 'paddle' && transactionId) {
//       console.log('✅ Paddle payment completed:', transactionId);
      
//       // Redirect to success page after 2 seconds
//       setTimeout(() => {
//         navigate('/dashboard?payment=success&plan=' + planId);
//       }, 2000);
//     }
//   }, [gateway, transactionId, planId, navigate]);
  
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
//         <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
//         <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
//         <p className="text-gray-600 mb-4">
//           Your subscription has been activated.
//         </p>
//         <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
//           <Loader className="animate-spin" size={16} />
//           <span>Redirecting to dashboard...</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentCallback;