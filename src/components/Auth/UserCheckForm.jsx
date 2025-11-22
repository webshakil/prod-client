import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useCheckUserMutation } from '../../redux/api/auth/authApi';
import { setUserCheckData, setError, setSuccess } from '../../redux/slices/authSlice';
import ErrorAlert from '../Common/ErrorAlert';
import SuccessAlert from '../Common/SuccessAlert';
import Loading from '../Common/Loading';
import { useAuth } from '../../redux/hooks';

export default function UserCheckForm({ onNext }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showPhone, setShowPhone] = useState(false);

  const [checkUser, { isLoading }] = useCheckUserMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email && !phone) {
      dispatch(setError(t('userCheck.errors.emailOrPhone')));
      return;
    }

    try {
      const result = await checkUser({ email, phone }).unwrap();
      dispatch(setUserCheckData(result.data));
      dispatch(setSuccess(t('userCheck.success.verified')));
      onNext(result.data);
    } catch (error) {
      const errorMessage = error.data?.message || t('userCheck.errors.checkFailed');
      dispatch(setError(errorMessage));
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
        {t('userCheck.title')}
      </h1>
      <p className="text-center text-gray-600 mb-6">
        {t('userCheck.subtitle')}
      </p>

      {auth.error && <ErrorAlert message={auth.error} />}
      {auth.successMessage && <SuccessAlert message={auth.successMessage} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('userCheck.emailLabel')}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('userCheck.emailPlaceholder')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="text-center text-gray-500">{t('common.or')}</div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('userCheck.phoneLabel')}
          </label>
          {!showPhone ? (
            <button
              type="button"
              onClick={() => setShowPhone(true)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              {t('userCheck.addPhoneButton')}
            </button>
          ) : (
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('userCheck.phonePlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? <Loading /> : t('userCheck.continueButton')}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        {t('userCheck.noAccount')}{' '}
        <a href="https://sngine.com" className="text-blue-600 hover:underline">
          {t('userCheck.registerLink')}
        </a>
      </p>
    </div>
  );
}
// import React, { useState } from 'react';
// import { useDispatch } from 'react-redux';
// import { useCheckUserMutation } from '../../redux/api/auth/authApi';
// import { setUserCheckData, setError, setSuccess } from '../../redux/slices/authSlice';
// import ErrorAlert from '../Common/ErrorAlert';
// import SuccessAlert from '../Common/SuccessAlert';
// import Loading from '../Common/Loading';
// import { useAuth } from '../../redux/hooks';

// export default function UserCheckForm({ onNext }) {
//   const dispatch = useDispatch();
//   const auth = useAuth();
//   const [email, setEmail] = useState('');
//   const [phone, setPhone] = useState('');
//   const [showPhone, setShowPhone] = useState(false);

//   const [checkUser, { isLoading }] = useCheckUserMutation();

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!email && !phone) {
//       dispatch(setError('Please enter email or phone number'));
//       return;
//     }

//     try {
//       const result = await checkUser({ email, phone }).unwrap();
//       dispatch(setUserCheckData(result.data));
//       dispatch(setSuccess('User verified successfully'));
//       onNext(result.data);
//     } catch (error) {
//       const errorMessage = error.data?.message || 'User check failed';
//       dispatch(setError(errorMessage));
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
//       <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Vottery</h1>
//       <p className="text-center text-gray-600 mb-6">
//         Welcome! Please verify that you're from Sngine
//       </p>

//       {auth.error && <ErrorAlert message={auth.error} />}
//       {auth.successMessage && <SuccessAlert message={auth.successMessage} />}

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Email Address
//           </label>
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             placeholder="Enter your email"
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         <div className="text-center text-gray-500">or</div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Phone Number (Optional)
//           </label>
//           {!showPhone ? (
//             <button
//               type="button"
//               onClick={() => setShowPhone(true)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
//             >
//               Add Phone Number
//             </button>
//           ) : (
//             <input
//               type="tel"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value)}
//               placeholder="+1234567890"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           )}
//         </div>

//         <button
//           type="submit"
//           disabled={isLoading}
//           className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
//         >
//           {isLoading ? <Loading /> : 'Continue'}
//         </button>
//       </form>

//       <p className="text-center text-sm text-gray-600 mt-6">
//         Don't have a Sngine account?{' '}
//         <a href="https://sngine.com" className="text-blue-600 hover:underline">
//           Register on Sngine first
//         </a>
//       </p>
//     </div>
//   );
// }
