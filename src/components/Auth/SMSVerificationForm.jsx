import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  useSendSMSOTPMutation,
  useVerifyOTPMutation,
} from '../../redux/api/auth/verificationApi';
import { setSMSOTPVerified, setSessionFlags, setSuccess, setError } from '../../redux/slices/authSlice';
import ErrorAlert from '../Common/ErrorAlert';
import SuccessAlert from '../Common/SuccessAlert';
import Loading from '../Common/Loading';
import { useAuth } from '../../redux/hooks';

export default function SMSVerificationForm({ sessionId, phone, onNext }) {
  const dispatch = useDispatch();
  const auth = useAuth();
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);

  const [sendSMSOTP, { isLoading: isSending }] = useSendSMSOTPMutation();
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
      const result = await sendSMSOTP({ sessionId, phone }).unwrap();
      setOtpSent(true);
      setTimer(60);
      dispatch(setSuccess('OTP sent to phone'));
    } catch (error) {
      const errorMessage = error.data?.message || 'Failed to send SMS OTP';
      dispatch(setError(errorMessage));
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      await verifyOTP({ sessionId, otp, otpType: 'sms', skipVerification: false }).unwrap();

      // ✅ Get fresh session data to check first-time user status
      try {
        const accessToken = localStorage.getItem('accessToken');
        const sessionResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/session/${sessionId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
            },
            credentials: 'include',
          }
        );

        if (sessionResponse.ok) {
          const sessionInfo = await sessionResponse.json();
          console.log('📊 Fresh session data after SMS OTP:', sessionInfo.data);

          // Update Redux with fresh session flags
          dispatch(setSessionFlags({
            user_details_collected: sessionInfo.data.user_details_collected,
            biometric_collected: sessionInfo.data.biometric_collected,
            security_questions_answered: sessionInfo.data.security_questions_answered,
            step_number: sessionInfo.data.step_number,
          }));
        }
      } catch (err) {
        console.warn('Could not fetch fresh session data:', err.message);
      }

      dispatch(setSMSOTPVerified());
      dispatch(setSuccess('Phone verified successfully'));
      console.log('✅ SMS OTP verified, isFirstTimeUser:', auth.isFirstTimeUser);
      onNext();
    } catch (error) {
      const errorMessage = error.data?.message || 'OTP verification failed';
      dispatch(setError(errorMessage));
    }
  };

  const handleSkipOTP = async () => {
    try {
      await verifyOTP({ sessionId, otp: '', otpType: 'sms', skipVerification: true }).unwrap();
      dispatch(setSMSOTPVerified());
      dispatch(setSuccess('SMS verification skipped'));
      console.log('✅ SMS OTP skipped, calling onNext()');
      onNext();
    } catch (error) {
      const errorMessage = error.data?.message || 'Failed to skip SMS OTP';
      dispatch(setError(errorMessage));
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Verify Phone</h2>
      <p className="text-center text-gray-600 mb-6">
        We'll send a verification code to {phone}
      </p>

      {auth.error && <ErrorAlert message={auth.error} />}
      {auth.successMessage && <SuccessAlert message={auth.successMessage} />}

      {!otpSent && (
        <button
          onClick={handleSendOTP}
          disabled={isSending}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 mb-4"
        >
          {isSending ? <Loading /> : 'Send SMS OTP'}
        </button>
      )}

      {otpSent && (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter 6-digit OTP
            </label>
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl"
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
          Skip SMS verification (Demo mode)
        </button>
      </div>
    </div>
  );
}
// import React, { useState, useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import {
//   useSendSMSOTPMutation,
//   useVerifyOTPMutation,
//   useGetSessionDetailsQuery,
// } from '../../redux/api/auth/verificationApi';
// import { setSMSOTPVerified, setSessionFlags, setSuccess, setError } from '../../redux/slices/authSlice';
// import ErrorAlert from '../Common/ErrorAlert';
// import SuccessAlert from '../Common/SuccessAlert';
// import Loading from '../Common/Loading';
// import { useAuth } from '../../redux/hooks';

// export default function SMSVerificationForm({ sessionId, phone, onNext }) {
//   const dispatch = useDispatch();
//   const auth = useAuth();
//   const [otp, setOtp] = useState('');
//   const [otpSent, setOtpSent] = useState(false);
//   const [timer, setTimer] = useState(0);

//   const [sendSMSOTP, { isLoading: isSending }] = useSendSMSOTPMutation();
//   const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation();
  
//   // Query session details to check if first-time user
//   /*eslint-disable*/
//   const { data: sessionData } = useGetSessionDetailsQuery(sessionId, {
//     skip: !sessionId,
//     refetchOnMountOrArgChange: true,
//   });

//   useEffect(() => {
//     if (timer > 0) {
//       const interval = setTimeout(() => setTimer(timer - 1), 1000);
//       return () => clearTimeout(interval);
//     }
//   }, [timer]);

//   const handleSendOTP = async () => {
//     try {
//       /*eslint-disable*/
//       const result = await sendSMSOTP({ sessionId, phone }).unwrap();
//       setOtpSent(true);
//       setTimer(60);
//       dispatch(setSuccess('OTP sent to phone'));
//     } catch (error) {
//       const errorMessage = error.data?.message || 'Failed to send SMS OTP';
//       dispatch(setError(errorMessage));
//     }
//   };

//   const handleVerifyOTP = async (e) => {
//     e.preventDefault();
//     try {
//       await verifyOTP({ sessionId, otp, otpType: 'sms', skipVerification: false }).unwrap();
      
//       // Get fresh session data to check if first-time
//       const freshSessionResult = await fetch(
//         `${import.meta.env.VITE_API_URL}/session/${sessionId}`,
//         {
//           method: 'GET',
//           headers: {
//             'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       if (freshSessionResult.ok) {
//         const sessionInfo = await freshSessionResult.json();
//         console.log('📊 Fresh session data:', sessionInfo.data);
        
//         // Update Redux with fresh session flags
//         dispatch(setSessionFlags({
//           user_details_collected: sessionInfo.data.user_details_collected,
//           biometric_collected: sessionInfo.data.biometric_collected,
//           security_questions_answered: sessionInfo.data.security_questions_answered,
//           step_number: sessionInfo.data.step_number,
//         }));
//       }

//       dispatch(setSMSOTPVerified());
//       dispatch(setSuccess('Phone verified successfully'));
//       console.log('✅ SMS OTP verified, calling onNext()');
//       onNext();
//     } catch (error) {
//       const errorMessage = error.data?.message || 'OTP verification failed';
//       dispatch(setError(errorMessage));
//     }
//   };

//   const handleSkipOTP = async () => {
//     try {
//       await verifyOTP({ sessionId, otp: '', otpType: 'sms', skipVerification: true }).unwrap();
//       dispatch(setSMSOTPVerified());
//       dispatch(setSuccess('SMS verification skipped'));
//       console.log('✅ SMS OTP skipped, calling onNext()');
//       onNext();
//     } catch (error) {
//       const errorMessage = error.data?.message || 'Failed to skip SMS OTP';
//       dispatch(setError(errorMessage));
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
//       <h2 className="text-2xl font-bold mb-4 text-center">Verify Phone</h2>
//       <p className="text-center text-gray-600 mb-6">
//         We'll send a verification code to {phone}
//       </p>

//       {auth.error && <ErrorAlert message={auth.error} />}
//       {auth.successMessage && <SuccessAlert message={auth.successMessage} />}

//       {!otpSent && (
//         <button
//           onClick={handleSendOTP}
//           disabled={isSending}
//           className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 mb-4"
//         >
//           {isSending ? <Loading /> : 'Send SMS OTP'}
//         </button>
//       )}

//       {otpSent && (
//         <form onSubmit={handleVerifyOTP} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Enter 6-digit OTP
//             </label>
//             <input
//               type="text"
//               maxLength="6"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
//               placeholder="000000"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl"
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
//           Skip SMS verification (Demo mode)
//         </button>
//       </div>
//     </div>
//   );
// }
// import React, { useState, useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import {
//   useSendSMSOTPMutation,
//   useVerifyOTPMutation,
// } from '../../redux/api/auth/verificationApi';
// import { setSMSOTPVerified, setSuccess, setError } from '../../redux/slices/authSlice';
// import ErrorAlert from '../Common/ErrorAlert';
// import SuccessAlert from '../Common/SuccessAlert';
// import Loading from '../Common/Loading';
// import { useAuth } from '../../redux/hooks';

// export default function SMSVerificationForm({ sessionId, phone, onNext }) {
//   const dispatch = useDispatch();
//   const auth = useAuth();
//   const [otp, setOtp] = useState('');
//   const [otpSent, setOtpSent] = useState(false);
//   const [timer, setTimer] = useState(0);

//   const [sendSMSOTP, { isLoading: isSending }] = useSendSMSOTPMutation();
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
//       const result = await sendSMSOTP({ sessionId, phone }).unwrap();
//       setOtpSent(true);
//       setTimer(60);
//       dispatch(setSuccess('OTP sent to phone'));
//     } catch (error) {
//       const errorMessage = error.data?.message || 'Failed to send SMS OTP';
//       dispatch(setError(errorMessage));
//     }
//   };

// const handleVerifyOTP = async (e) => {
//   e.preventDefault();
//   try {
//     await verifyOTP({ sessionId, otp, otpType: 'sms', skipVerification: false }).unwrap();
//     dispatch(setSMSOTPVerified()); // ✅ Update Redux
//     dispatch(setSuccess('Phone verified successfully'));
//     console.log('✅ SMS OTP verified, calling onNext()');
//     onNext(); // ✅ Call onNext to move to next step
//   } catch (error) {
//     const errorMessage = error.data?.message || 'OTP verification failed';
//     dispatch(setError(errorMessage));
//   }
// };

// const handleSkipOTP = async () => {
//   try {
//     await verifyOTP({ sessionId, otp: '', otpType: 'sms', skipVerification: true }).unwrap();
//     dispatch(setSMSOTPVerified()); // ✅ Update Redux
//     dispatch(setSuccess('SMS verification skipped'));
//     console.log('✅ SMS OTP skipped, calling onNext()');
//     onNext(); // ✅ Call onNext to move to next step
//   } catch (error) {
//     const errorMessage = error.data?.message || 'Failed to skip SMS OTP';
//     dispatch(setError(errorMessage));
//   }
// };

//   return (
//     <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
//       <h2 className="text-2xl font-bold mb-4 text-center">Verify Phone</h2>
//       <p className="text-center text-gray-600 mb-6">
//         We'll send a verification code to {phone}
//       </p>

//       {auth.error && <ErrorAlert message={auth.error} />}
//       {auth.successMessage && <SuccessAlert message={auth.successMessage} />}

//       {!otpSent && (
//         <button
//           onClick={handleSendOTP}
//           disabled={isSending}
//           className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 mb-4"
//         >
//           {isSending ? <Loading /> : 'Send SMS OTP'}
//         </button>
//       )}

//       {otpSent && (
//         <form onSubmit={handleVerifyOTP} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Enter 6-digit OTP
//             </label>
//             <input
//               type="text"
//               maxLength="6"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
//               placeholder="000000"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl"
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
//           Skip SMS verification (Demo mode)
//         </button>
//       </div>
//     </div>
//   );
// }
