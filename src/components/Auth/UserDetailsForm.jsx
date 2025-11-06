import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSaveUserDetailsMutation } from '../../redux/api/auth/userDetailsApi';
import { setUserDetails, setSuccess, setError, setSessionFlags } from '../../redux/slices/authSlice';
import ErrorAlert from '../Common/ErrorAlert';
import SuccessAlert from '../Common/SuccessAlert';
import Loading from '../Common/Loading';
import { useAuth } from '../../redux/hooks';

const COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'India',
  'United Arab Emirates',
  'Germany',
  'France',
  'Japan',
  'Brazil',
  'Mexico',
  'Italy',
  'Spain',
  'Netherlands',
  'Sweden',
  'Switzerland',
  'China',
  'South Korea',
  'Singapore',
  'Malaysia',
  'Indonesia',
  'Thailand',
  'Philippines',
  'Vietnam',
  'Saudi Arabia',
  'Qatar',
  'Kuwait',
  'Oman',
  'Egypt',
  'South Africa',
  'Nigeria',
  'Kenya',
  'Turkey',
  'Pakistan',
  'Bangladesh',
  'Sri Lanka',
  'Nepal',
  'New Zealand',
  'Russia',
  'Poland',
  'Portugal',
  'Norway',
  'Denmark',
  'Finland',
  'Ireland',
  'Argentina',
  'Chile',
  'Colombia',
  'Peru',
  'Venezuela',
  'Greece',
  'Israel',
  'Czech Republic',
  'Austria',
  'Belgium',
  'Hungary',
  'Romania',
  'Other'
];


export default function UserDetailsForm({ sessionId, onNext }) {
  const dispatch = useDispatch();
  const auth = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: 'prefer_not_to_say',
    country: '',
    city: '',
    timezone: 'UTC',
    language: 'en_us',
  });

  const [saveUserDetails, { isLoading }] = useSaveUserDetailsMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.age || !formData.country) {
      dispatch(setError('Please fill all required fields'));
      return;
    }

    try {
      console.log('📤 Saving user details:', formData);
      
      const result = await saveUserDetails({
        sessionId,
        ...formData,
      }).unwrap();

      console.log('✅ User details saved, result:', result);

      // Update Redux with returned session flags
      if (result.sessionFlags) {
        dispatch(setSessionFlags(result.sessionFlags));
        console.log('✅ Session flags updated:', result.sessionFlags);
      }

      dispatch(setUserDetails(formData));
      dispatch(setSuccess('User details saved successfully'));
      
      console.log('✅ Calling onNext() to move to Biometric step');
      onNext();
    } catch (error) {
      const errorMessage = error.data?.message || error.message || 'Failed to save user details';
      console.error('❌ Error saving user details:', errorMessage);
      dispatch(setError(errorMessage));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2 text-center">Complete Your Profile</h2>
      <p className="text-center text-gray-600 mb-6">
        Help us know you better. This information is required for first-time setup.
      </p>

      {auth.error && <ErrorAlert message={auth.error} />}
      {auth.successMessage && <SuccessAlert message={auth.successMessage} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age *
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="13"
              max="150"
              placeholder="25"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country *
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a country</option>
              {COUNTRIES.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="New York"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="UTC">UTC</option>
              <option value="EST">EST (UTC-5)</option>
              <option value="CST">CST (UTC-6)</option>
              <option value="MST">MST (UTC-7)</option>
              <option value="PST">PST (UTC-8)</option>
              <option value="IST">IST (UTC+5:30)</option>
              <option value="GST">GST (UTC+4)</option>
              <option value="CET">CET (UTC+1)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en_us">English (US)</option>
              <option value="en_gb">English (GB)</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="hi">Hindi</option>
              <option value="ar">Arabic</option>
              <option value="zh">Chinese</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? <Loading /> : 'Continue to Biometric'}
        </button>
      </form>
    </div>
  );
}
