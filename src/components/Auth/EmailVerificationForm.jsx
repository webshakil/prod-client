import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  useSendEmailOTPMutation,
  useVerifyOTPMutation,
} from '../../redux/api/auth/verificationApi';
import { setEmailOTPVerified, setSuccess, setError } from '../../redux/slices/authSlice';
import ErrorAlert from '../Common/ErrorAlert';
import SuccessAlert from '../Common/SuccessAlert';
import Loading from '../Common/Loading';
import { useAuth } from '../../redux/hooks';

export default function EmailVerificationForm({ sessionId, email, onNext }) {
  const dispatch = useDispatch();
  const auth = useAuth();
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);

  const [sendEmailOTP, { isLoading: isSending }] = useSendEmailOTPMutation();
  const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation();

  useEffect(() => {
    if (timer > 0) {
      const interval = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(interval);
    }
  }, [timer]);

  const handleSendOTP = async () => {
    try {
      /*eslint-disable*/
      const result = await sendEmailOTP({ sessionId, email }).unwrap();
      setOtpSent(true);
      setTimer(60);
      dispatch(setSuccess('OTP sent to email'));
    } catch (error) {
      const errorMessage = error.data?.message || 'Failed to send OTP';
      dispatch(setError(errorMessage));
    }
  };
  const handleVerifyOTP = async (e) => {
  e.preventDefault();
  try {
    await verifyOTP({ sessionId, otp, otpType: 'email', skipVerification: false }).unwrap();
    dispatch(setEmailOTPVerified()); // ✅ Update Redux
    dispatch(setSuccess('Email verified successfully'));
    console.log('✅ Email OTP verified, calling onNext()');
    onNext(); // ✅ Call onNext to move to next step
  } catch (error) {
    const errorMessage = error.data?.message || 'OTP verification failed';
    dispatch(setError(errorMessage));
  }
};

const handleSkipOTP = async () => {
  try {
    await verifyOTP({ sessionId, otp: '', otpType: 'email', skipVerification: true }).unwrap();
    dispatch(setEmailOTPVerified()); // ✅ Update Redux
    dispatch(setSuccess('OTP verification skipped'));
    console.log('✅ Email OTP skipped, calling onNext()');
    onNext(); // ✅ Call onNext to move to next step
  } catch (error) {
    const errorMessage = error.data?.message || 'Failed to skip OTP';
    dispatch(setError(errorMessage));
  }
};

  // const handleVerifyOTP = async (e) => {
  //   e.preventDefault();
  //   try {
  //     await verifyOTP({ sessionId, otp, otpType: 'email', skipVerification: false }).unwrap();
  //     dispatch(setEmailOTPVerified());
  //     dispatch(setSuccess('Email verified successfully'));
  //     onNext();
  //   } catch (error) {
  //     const errorMessage = error.data?.message || 'OTP verification failed';
  //     dispatch(setError(errorMessage));
  //   }
  // };

  // const handleSkipOTP = async () => {
  //   try {
  //     await verifyOTP({ sessionId, otp: '', otpType: 'email', skipVerification: true }).unwrap();
  //     dispatch(setEmailOTPVerified());
  //     dispatch(setSuccess('OTP verification skipped'));
  //     onNext();
  //   } catch (error) {
  //     const errorMessage = error.data?.message || 'Failed to skip OTP';
  //     dispatch(setError(errorMessage));
  //   }
  // };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Verify Email</h2>
      <p className="text-center text-gray-600 mb-6">
        We'll send a verification code to {email}
      </p>

      {auth.error && <ErrorAlert message={auth.error} />}
      {auth.successMessage && <SuccessAlert message={auth.successMessage} />}

      {!otpSent && (
        <button
          onClick={handleSendOTP}
          disabled={isSending}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 mb-4"
        >
          {isSending ? <Loading /> : 'Send OTP'}
        </button>
      )}

      {otpSent && (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <label className="block text-sm
            font-medium text-gray-700 mb-2">
              Enter 6-digit OTP
            </label>
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl letter-spacing-2"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isVerifying || otp.length !== 6}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isVerifying ? <Loading /> : 'Verify OTP'}
            </button>
            <button
              type="button"
              onClick={() => setTimer(0) || setOtpSent(false)}
              disabled={timer > 0}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 disabled:bg-gray-100"
            >
              {timer > 0 ? `Resend (${timer}s)` : 'Resend'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={handleSkipOTP}
          className="w-full text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Skip OTP verification (Demo mode)
        </button>
      </div>
    </div>
  );
}
// import React, { useState, useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import {
//   useSendEmailOTPMutation,
//   useVerifyOTPMutation,
// } from '../../redux/api/auth/verificationApi';
// import { setEmailOTPVerified, setSuccess, setError } from '../../redux/slices/authSlice';
// import ErrorAlert from '../Common/ErrorAlert';
// import SuccessAlert from '../Common/SuccessAlert';
// import Loading from '../Common/Loading';
// import { useAuth } from '../../redux/hooks';

// export default function EmailVerificationForm({ sessionId, email, onNext }) {
//   const dispatch = useDispatch();
//   const auth = useAuth();
//   const [otp, setOtp] = useState('');
//   const [otpSent, setOtpSent] = useState(false);
//   const [timer, setTimer] = useState(0);

//   const [sendEmailOTP, { isLoading: isSending }] = useSendEmailOTPMutation();
//   const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation();

//   useEffect(() => {
//     if (timer > 0) {
//       const interval = setTimeout(() => setTimer(timer - 1), 1000);
//       return () => clearTimeout(interval);
//     }
//   }, [timer]);

//   const handleSendOTP = async () => {
//     try {
//       /*eslint-disable*/
//       const result = await sendEmailOTP({ sessionId, email }).unwrap();
//       setOtpSent(true);
//       setTimer(60);
//       dispatch(setSuccess('OTP sent to email'));
//     } catch (error) {
//       const errorMessage = error.data?.message || 'Failed to send OTP';
//       dispatch(setError(errorMessage));
//     }
//   };

//   const handleVerifyOTP = async (e) => {
//     e.preventDefault();
//     try {
//       await verifyOTP({ sessionId, otp, otpType: 'email', skipVerification: false }).unwrap();
//       dispatch(setEmailOTPVerified());
//       dispatch(setSuccess('Email verified successfully'));
//       onNext();
//     } catch (error) {
//       const errorMessage = error.data?.message || 'OTP verification failed';
//       dispatch(setError(errorMessage));
//     }
//   };

//   const handleSkipOTP = async () => {
//     try {
//       await verifyOTP({ sessionId, otp: '', otpType: 'email', skipVerification: true }).unwrap();
//       dispatch(setEmailOTPVerified());
//       dispatch(setSuccess('OTP verification skipped'));
//       onNext();
//     } catch (error) {
//       const errorMessage = error.data?.message || 'Failed to skip OTP';
//       dispatch(setError(errorMessage));
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
//       <h2 className="text-2xl font-bold mb-4 text-center">Verify Email</h2>
//       <p className="text-center text-gray-600 mb-6">
//         We'll send a verification code to {email}
//       </p>

//       {auth.error && <ErrorAlert message={auth.error} />}
//       {auth.successMessage && <SuccessAlert message={auth.successMessage} />}

//       {!otpSent && (
//         <button
//           onClick={handleSendOTP}
//           disabled={isSending}
//           className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 mb-4"
//         >
//           {isSending ? <Loading /> : 'Send OTP'}
//         </button>
//       )}

//       {otpSent && (
//         <form onSubmit={handleVerifyOTP} className="space-y-4">
//           <div>
//             <label className="block text-sm
//             font-medium text-gray-700 mb-2">
//               Enter 6-digit OTP
//             </label>
//             <input
//               type="text"
//               maxLength="6"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
//               placeholder="000000"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl letter-spacing-2"
//             />
//           </div>

//           <div className="flex gap-2">
//             <button
//               type="submit"
//               disabled={isVerifying || otp.length !== 6}
//               className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
//             >
//               {isVerifying ? <Loading /> : 'Verify OTP'}
//             </button>
//             <button
//               type="button"
//               onClick={() => setTimer(0) || setOtpSent(false)}
//               disabled={timer > 0}
//               className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 disabled:bg-gray-100"
//             >
//               {timer > 0 ? `Resend (${timer}s)` : 'Resend'}
//             </button>
//           </div>
//         </form>
//       )}

//       <div className="mt-4 pt-4 border-t border-gray-200">
//         <button
//           onClick={handleSkipOTP}
//           className="w-full text-sm text-gray-600 hover:text-gray-800 underline"
//         >
//           Skip OTP verification (Demo mode)
//         </button>
//       </div>
//     </div>
//   );
// }
// import React, { useState, useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import {
//   useSendEmailOTPMutation,
//   useVerifyOTPMutation,
// } from '../../redux/api/verificationApi';
// import { setEmailOTPVerified, setSuccess, setError } from '../../redux/slices/authSlice';
// import ErrorAlert from '../Common/ErrorAlert';
// import SuccessAlert from '../Common/SuccessAlert';
// import Loading from '../Common/Loading';
// import { useAuth } from '../../redux/hooks';

// export default function EmailVerificationForm({ sessionId, email, onNext }) {
//   const dispatch = useDispatch();
//   const auth = useAuth();
//   const [otp, setOtp] = useState('');
//   const [otpSent, setOtpSent] = useState(false);
//   const [timer, setTimer] = useState(0);

//   const [sendEmailOTP, { isLoading: isSending }] = useSendEmailOTPMutation();
//   const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation();

//   useEffect(() => {
//     if (timer > 0) {
//       const interval = setTimeout(() => setTimer(timer - 1), 1000);
//       return () => clearTimeout(interval);
//     }
//   }, [timer]);

//   const handleSendOTP = async () => {
//     try {
//         /*eslint-disable*/
//       const result = await sendEmailOTP({ sessionId, email }).unwrap();
//       setOtpSent(true);
//       setTimer(60);
//       dispatch(setSuccess('OTP sent to email'));
//     } catch (error) {
//       const errorMessage = error.data?.message || 'Failed to send OTP';
//       dispatch(setError(errorMessage));
//     }
//   };

//   const handleVerifyOTP = async (e) => {
//     e.preventDefault();
//     try {
//       await verifyOTP({ sessionId, otp, otpType: 'email', skipVerification: false }).unwrap();
//       dispatch(setEmailOTPVerified());
//       dispatch(setSuccess('Email verified successfully'));
//       onNext();
//     } catch (error) {
//       const errorMessage = error.data?.message || 'OTP verification failed';
//       dispatch(setError(errorMessage));
//     }
//   };

//   const handleSkipOTP = async () => {
//     try {
//       await verifyOTP({ sessionId, otp: '', otpType: 'email', skipVerification: true }).unwrap();
//       dispatch(setEmailOTPVerified());
//       dispatch(setSuccess('OTP verification skipped'));
//       onNext();
//     } catch (error) {
//       const errorMessage = error.data?.message || 'Failed to skip OTP';
//       dispatch(setError(errorMessage));
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
//       <h2 className="text-2xl font-bold mb-4 text-center">Verify Email</h2>
//       <p className="text-center text-gray-600 mb-6">
//         We'll send a verification code to {email}
//       </p>

//       {auth.error && <ErrorAlert message={auth.error} />}
//       {auth.successMessage && <SuccessAlert message={auth.successMessage} />}

//       {!otpSent && (
//         <button
//           onClick={handleSendOTP}
//           disabled={isSending}
//           className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 mb-4"
//         >
//           {isSending ? <Loading /> : 'Send OTP'}
//         </button>
//       )}

//       {otpSent && (
//         <form onSubmit={handleVerifyOTP} className="space-y-4">
//           <div>
//             <label className="block text-sm
//             font-medium text-gray-700 mb-2">
//               Enter 6-digit OTP
//             </label>
//             <input
//               type="text"
//               maxLength="6"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
//               placeholder="000000"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl letter-spacing-2"
//             />
//           </div>

//           <div className="flex gap-2">
//             <button
//               type="submit"
//               disabled={isVerifying || otp.length !== 6}
//               className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
//             >
//               {isVerifying ? <Loading /> : 'Verify OTP'}
//             </button>
//             <button
//               type="button"
//               onClick={() => setTimer(0) || setOtpSent(false)}
//               disabled={timer > 0}
//               className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 disabled:bg-gray-100"
//             >
//               {timer > 0 ? `Resend (${timer}s)` : 'Resend'}
//             </button>
//           </div>
//         </form>
//       )}

//       <div className="mt-4 pt-4 border-t border-gray-200">
//         <button
//           onClick={handleSkipOTP}
//           className="w-full text-sm text-gray-600 hover:text-gray-800 underline"
//         >
//           Skip OTP verification (Demo mode)
//         </button>
//       </div>
//     </div>
//   );
// }