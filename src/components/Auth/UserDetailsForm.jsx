import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useSaveUserDetailsMutation } from '../../redux/api/auth/userDetailsApi';
import { setUserDetails, setSessionFlags, setError, setSuccess } from '../../redux/slices/authSlice';
import ErrorAlert from '../Common/ErrorAlert';
import SuccessAlert from '../Common/SuccessAlert';
import Loading from '../Common/Loading';
import { useAuth } from '../../redux/hooks';

// Country list for dropdown
const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria',
  'Bangladesh', 'Belgium', 'Brazil', 'Canada', 'China', 'Colombia',
  'Denmark', 'Egypt', 'Finland', 'France', 'Germany', 'Greece',
  'Hong Kong', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
  'Japan', 'Jordan', 'Kenya', 'Kuwait', 'Lebanon', 'Malaysia', 'Mexico',
  'Morocco', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Pakistan',
  'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia',
  'Saudi Arabia', 'Singapore', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka',
  'Sweden', 'Switzerland', 'Taiwan', 'Thailand', 'Turkey', 'UAE', 'UK', 'Ukraine',
  'USA', 'Vietnam', 'Other'
];

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

const TIMEZONES = [
  'UTC-12:00', 'UTC-11:00', 'UTC-10:00', 'UTC-09:00', 'UTC-08:00', 'UTC-07:00',
  'UTC-06:00', 'UTC-05:00', 'UTC-04:00', 'UTC-03:00', 'UTC-02:00', 'UTC-01:00',
  'UTC+00:00', 'UTC+01:00', 'UTC+02:00', 'UTC+03:00', 'UTC+04:00', 'UTC+05:00',
  'UTC+05:30', 'UTC+06:00', 'UTC+07:00', 'UTC+08:00', 'UTC+09:00', 'UTC+10:00',
  'UTC+11:00', 'UTC+12:00'
];

const LANGUAGES = [
  { code: 'en_us', label: 'English (US)' },
  { code: 'en_gb', label: 'English (UK)' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ar', label: 'Arabic' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'hi', label: 'Hindi' },
  { code: 'bn', label: 'Bengali' },
];

export default function UserDetailsForm({ sessionId, onNext }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const auth = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    country: '',
    city: '',
    timezone: 'UTC+00:00',
    language: 'en_us',
  });

  const [saveUserDetails, { isLoading }] = useSaveUserDetailsMutation();

  // ✅ NEW: Check for Sngine prefill data on mount
  useEffect(() => {
    const loadPrefillData = () => {
      // First, try to get prefill data from sessionStorage (from Sngine callback)
      const sngineData = sessionStorage.getItem('sngine_prefill_data');
      
      if (sngineData) {
        try {
          const prefillData = JSON.parse(sngineData);
          console.log('[USER-DETAILS] Loading prefill data from Sngine:', prefillData);
          
          setFormData(prev => ({
            ...prev,
            firstName: prefillData.firstName || prev.firstName,
            lastName: prefillData.lastName || prev.lastName,
            age: prefillData.age ? String(prefillData.age) : prev.age,
            gender: prefillData.gender || prev.gender,
            country: prefillData.country || prev.country,
            city: prefillData.city || prev.city,
            timezone: prefillData.timezone || prev.timezone,
            language: prefillData.language || prev.language,
          }));

          // Show success message that data was pre-filled
          dispatch(setSuccess(t('userDetails.prefilled', 'Your information has been pre-filled from Sngine. Please review and confirm.')));
          
          // Clear the prefill data after loading
          sessionStorage.removeItem('sngine_prefill_data');
        } catch (e) {
          console.error('[USER-DETAILS] Failed to parse prefill data:', e);
        }
      }

      // Also check Redux state for any existing data
      if (auth.firstName || auth.lastName) {
        setFormData(prev => ({
          ...prev,
          firstName: prev.firstName || auth.firstName || '',
          lastName: prev.lastName || auth.lastName || '',
        }));
      }
    };

    loadPrefillData();
  }, [auth.firstName, auth.lastName, dispatch, t]);

  // Auto-detect timezone
  useEffect(() => {
    try {
      /*eslint-disable*/
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const offset = new Date().getTimezoneOffset();
      const hours = Math.abs(Math.floor(offset / 60));
      const sign = offset <= 0 ? '+' : '-';
      const tzString = `UTC${sign}${hours.toString().padStart(2, '0')}:00`;
      
      if (TIMEZONES.includes(tzString) && !formData.timezone) {
        setFormData(prev => ({ ...prev, timezone: tzString }));
      }
    } catch (e) {
      console.log('Could not auto-detect timezone');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.age || !formData.gender || !formData.country) {
      dispatch(setError(t('userDetails.errors.required', 'Please fill in all required fields')));
      return;
    }

    const age = parseInt(formData.age);
    if (isNaN(age) || age < 13 || age > 150) {
      dispatch(setError(t('userDetails.errors.invalidAge', 'Age must be between 13 and 150')));
      return;
    }

    try {
      console.log('[USER-DETAILS] Saving user details:', { sessionId, ...formData });
      
      const result = await saveUserDetails({
        sessionId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: parseInt(formData.age),
        gender: formData.gender,
        country: formData.country,
        city: formData.city,
        timezone: formData.timezone,
        language: formData.language,
      }).unwrap();

      console.log('[USER-DETAILS] Save result:', result);

      // Update Redux
      dispatch(setUserDetails({
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: parseInt(formData.age),
        gender: formData.gender,
        country: formData.country,
        city: formData.city,
        timezone: formData.timezone,
        language: formData.language,
      }));

      // Update session flags if returned
      if (result.data?.sessionFlags) {
        dispatch(setSessionFlags(result.data.sessionFlags));
      }

      dispatch(setSuccess(t('userDetails.success', 'Details saved successfully')));
      
      // Clear auth method from session storage
      sessionStorage.removeItem('auth_method');
      
      onNext();
    } catch (error) {
      const errorMessage = error.data?.message || t('userDetails.errors.saveFailed', 'Failed to save details');
      dispatch(setError(errorMessage));
    }
  };

  // Check if data came from Sngine
  const isFromSngine = sessionStorage.getItem('auth_method') === 'sngine_token';

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2 text-center text-blue-600">
        {t('userDetails.title', 'Complete Your Profile')}
      </h2>
      <p className="text-center text-gray-600 mb-6">
        {isFromSngine 
          ? t('userDetails.subtitleSngine', 'Please review and confirm your information from Sngine')
          : t('userDetails.subtitle', 'Tell us a bit about yourself')
        }
      </p>

      {auth.error && <ErrorAlert message={auth.error} />}
      {auth.successMessage && <SuccessAlert message={auth.successMessage} />}

      {/* Show badge if data is pre-filled from Sngine */}
      {isFromSngine && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-green-700 text-sm">
            {t('userDetails.prefilledBadge', 'Information pre-filled from your Sngine account')}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('userDetails.firstName', 'First Name')} *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder={t('userDetails.firstNamePlaceholder', 'Enter first name')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('userDetails.lastName', 'Last Name')} *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder={t('userDetails.lastNamePlaceholder', 'Enter last name')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Age and Gender Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('userDetails.age', 'Age')} *
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder={t('userDetails.agePlaceholder', 'Enter age')}
              min="13"
              max="150"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('userDetails.gender', 'Gender')} *
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">{t('userDetails.selectGender', 'Select gender')}</option>
              {GENDERS.map(g => (
                <option key={g} value={g.toLowerCase()}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Country and City Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('userDetails.country', 'Country')} *
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">{t('userDetails.selectCountry', 'Select country')}</option>
              {COUNTRIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('userDetails.city', 'City')}
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder={t('userDetails.cityPlaceholder', 'Enter city')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Timezone and Language Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('userDetails.timezone', 'Timezone')}
            </label>
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TIMEZONES.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('userDetails.language', 'Language')}
            </label>
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 mt-6"
        >
          {isLoading ? <Loading /> : t('userDetails.saveButton', 'Save & Continue')}
        </button>
      </form>
    </div>
  );
}
//last working code only to add api above code
// import React, { useState } from 'react';
// import { useDispatch } from 'react-redux';
// import { useSaveUserDetailsMutation } from '../../redux/api/auth/userDetailsApi';
// import { setUserDetails, setSuccess, setError, setSessionFlags } from '../../redux/slices/authSlice';
// import ErrorAlert from '../Common/ErrorAlert';
// import SuccessAlert from '../Common/SuccessAlert';
// import Loading from '../Common/Loading';
// import { useAuth } from '../../redux/hooks';

// const COUNTRIES = [
//   'United States',
//   'Canada',
//   'United Kingdom',
//   'Australia',
//   'India',
//   'United Arab Emirates',
//   'Germany',
//   'France',
//   'Japan',
//   'Brazil',
//   'Mexico',
//   'Italy',
//   'Spain',
//   'Netherlands',
//   'Sweden',
//   'Switzerland',
//   'China',
//   'South Korea',
//   'Singapore',
//   'Malaysia',
//   'Indonesia',
//   'Thailand',
//   'Philippines',
//   'Vietnam',
//   'Saudi Arabia',
//   'Qatar',
//   'Kuwait',
//   'Oman',
//   'Egypt',
//   'South Africa',
//   'Nigeria',
//   'Kenya',
//   'Turkey',
//   'Pakistan',
//   'Bangladesh',
//   'Sri Lanka',
//   'Nepal',
//   'New Zealand',
//   'Russia',
//   'Poland',
//   'Portugal',
//   'Norway',
//   'Denmark',
//   'Finland',
//   'Ireland',
//   'Argentina',
//   'Chile',
//   'Colombia',
//   'Peru',
//   'Venezuela',
//   'Greece',
//   'Israel',
//   'Czech Republic',
//   'Austria',
//   'Belgium',
//   'Hungary',
//   'Romania',
//   'Other'
// ];


// export default function UserDetailsForm({ sessionId, onNext }) {
//   const dispatch = useDispatch();
//   const auth = useAuth();
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     age: '',
//     gender: 'prefer_not_to_say',
//     country: '',
//     city: '',
//     timezone: 'UTC',
//     language: 'en_us',
//   });

//   const [saveUserDetails, { isLoading }] = useSaveUserDetailsMutation();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.firstName || !formData.lastName || !formData.age || !formData.country) {
//       dispatch(setError('Please fill all required fields'));
//       return;
//     }

//     try {
//       console.log('📤 Saving user details:', formData);
      
//       const result = await saveUserDetails({
//         sessionId,
//         ...formData,
//       }).unwrap();

//       console.log('✅ User details saved, result:', result);

//       // Update Redux with returned session flags
//       if (result.sessionFlags) {
//         dispatch(setSessionFlags(result.sessionFlags));
//         console.log('✅ Session flags updated:', result.sessionFlags);
//       }

//       dispatch(setUserDetails(formData));
//       dispatch(setSuccess('User details saved successfully'));
      
//       console.log('✅ Calling onNext() to move to Biometric step');
//       onNext();
//     } catch (error) {
//       const errorMessage = error.data?.message || error.message || 'Failed to save user details';
//       console.error('❌ Error saving user details:', errorMessage);
//       dispatch(setError(errorMessage));
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
//       <h2 className="text-2xl font-bold mb-2 text-center">Complete Your Profile</h2>
//       <p className="text-center text-gray-600 mb-6">
//         Help us know you better. This information is required for first-time setup.
//       </p>

//       {auth.error && <ErrorAlert message={auth.error} />}
//       {auth.successMessage && <SuccessAlert message={auth.successMessage} />}

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               First Name *
//             </label>
//             <input
//               type="text"
//               name="firstName"
//               value={formData.firstName}
//               onChange={handleChange}
//               placeholder="John"
//               required
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Last Name *
//             </label>
//             <input
//               type="text"
//               name="lastName"
//               value={formData.lastName}
//               onChange={handleChange}
//               placeholder="Doe"
//               required
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Age *
//             </label>
//             <input
//               type="number"
//               name="age"
//               value={formData.age}
//               onChange={handleChange}
//               min="13"
//               max="150"
//               placeholder="25"
//               required
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Gender
//             </label>
//             <select
//               name="gender"
//               value={formData.gender}
//               onChange={handleChange}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="male">Male</option>
//               <option value="female">Female</option>
//               <option value="other">Other</option>
//               <option value="prefer_not_to_say">Prefer not to say</option>
//             </select>
//           </div>
//         </div>

//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Country *
//             </label>
//             <select
//               name="country"
//               value={formData.country}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">Select a country</option>
//               {COUNTRIES.map(country => (
//                 <option key={country} value={country}>{country}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               City
//             </label>
//             <input
//               type="text"
//               name="city"
//               value={formData.city}
//               onChange={handleChange}
//               placeholder="New York"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Timezone
//             </label>
//             <select
//               name="timezone"
//               value={formData.timezone}
//               onChange={handleChange}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="UTC">UTC</option>
//               <option value="EST">EST (UTC-5)</option>
//               <option value="CST">CST (UTC-6)</option>
//               <option value="MST">MST (UTC-7)</option>
//               <option value="PST">PST (UTC-8)</option>
//               <option value="IST">IST (UTC+5:30)</option>
//               <option value="GST">GST (UTC+4)</option>
//               <option value="CET">CET (UTC+1)</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Language
//             </label>
//             <select
//               name="language"
//               value={formData.language}
//               onChange={handleChange}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="en_us">English (US)</option>
//               <option value="en_gb">English (GB)</option>
//               <option value="es">Spanish</option>
//               <option value="fr">French</option>
//               <option value="de">German</option>
//               <option value="hi">Hindi</option>
//               <option value="ar">Arabic</option>
//               <option value="zh">Chinese</option>
//             </select>
//           </div>
//         </div>

//         <button
//           type="submit"
//           disabled={isLoading}
//           className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
//         >
//           {isLoading ? <Loading /> : 'Continue to Biometric'}
//         </button>
//       </form>
//     </div>
//   );
// }
