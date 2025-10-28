import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { 
  FaVoteYea, 
  FaGlobe, 
  FaLock, 
  FaMoneyBillWave, 
  FaShieldAlt,
  FaEye,
  FaEdit
} from 'react-icons/fa';
import RegionalPricingForm from '../../../election/RegionalPricingForm';

export default function Step2Configuration({ data, updateData, onNext, onPrevious }) {
  const [errors, setErrors] = useState({});
  const [showRegionalPricing, setShowRegionalPricing] = useState(false);
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  
  const votingTypes = [
    {
      value: 'plurality',
      label: 'Plurality (First Past the Post)',
      description: 'Winner is the option with the most votes',
      icon: '🗳️'
    },
    {
      value: 'ranked_choice',
      label: 'Ranked Choice Voting',
      description: 'Voters rank candidates in order of preference',
      icon: '📊'
    },
    {
      value: 'approval',
      label: 'Approval Voting',
      description: 'Voters can approve multiple options',
      icon: '✅'
    }
  ];
  
  const permissionTypes = [
    {
      value: 'public',
      label: 'Public',
      description: 'Anyone can vote',
      icon: <FaGlobe />
    },
    {
      value: 'country_specific',
      label: 'Country Specific',
      description: 'Only allowed countries can vote',
      icon: <FaLock />
    },
    {
      value: 'organization_only',
      label: 'Organization Only',
      description: 'Only organization members',
      icon: <FaShieldAlt />
    }
  ];
  
  const authMethods = [
    { value: 'passkey', label: 'Passkey' },
    { value: 'oauth', label: 'OAuth (Google, Facebook)' },
    { value: 'magic_link', label: 'Magic Link (Email)' },
    { value: 'email_password', label: 'Email & Password' }
  ];
  
  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
    'France', 'Japan', 'China', 'India', 'Brazil', 'Mexico', 'Spain',
    'Italy', 'South Korea', 'Netherlands', 'Sweden', 'Norway', 'Denmark'
  ];
  
  const validate = () => {
    const newErrors = {};
    
    if (data.permission_type === 'country_specific' && data.allowed_countries.length === 0) {
      newErrors.allowed_countries = 'Please select at least one country';
    }
    
    if (data.pricing_type === 'general_fee' && !data.general_participation_fee) {
      newErrors.general_participation_fee = 'Please enter participation fee';
    }
    
    if (data.pricing_type === 'regional_fee' && data.regional_pricing.length === 0) {
      newErrors.regional_pricing = 'Please add at least one regional pricing';
    }
    
    if (data.authentication_methods.length === 0) {
      newErrors.authentication_methods = 'Please select at least one authentication method';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (validate()) {
      onNext();
    } else {
      toast.error('Please fix the errors before continuing');
    }
  };
  
  const toggleCountry = (country) => {
    const currentCountries = data.allowed_countries || [];
    if (currentCountries.includes(country)) {
      updateData({
        allowed_countries: currentCountries.filter(c => c !== country)
      });
    } else {
      updateData({
        allowed_countries: [...currentCountries, country]
      });
    }
  };
  
  const toggleAuthMethod = (method) => {
    const currentMethods = data.authentication_methods || [];
    if (currentMethods.includes(method)) {
      if (currentMethods.length > 1) {
        updateData({
          authentication_methods: currentMethods.filter(m => m !== method)
        });
      } else {
        toast.error('At least one authentication method must be selected');
      }
    } else {
      updateData({
        authentication_methods: [...currentMethods, method]
      });
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Step 2: Voting Configuration
      </h2>
      
      {/* Voting Type */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FaVoteYea />
          Voting Type <span className="text-red-500">*</span>
        </label>
        <div className="grid md:grid-cols-3 gap-4">
          {votingTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => updateData({ voting_type: type.value })}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                data.voting_type === type.value
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              <div className="text-3xl mb-2">{type.icon}</div>
              <h4 className="font-semibold text-gray-900 mb-1">{type.label}</h4>
              <p className="text-sm text-gray-600">{type.description}</p>
            </button>
          ))}
        </div>
      </div>
      
      {/* Voting Body Content */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Additional Voting Instructions (Optional)
        </label>
        <textarea
          value={data.voting_body_content}
          onChange={(e) => updateData({ voting_body_content: e.target.value })}
          placeholder="Add any special instructions or rules for voters..."
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {/* Permission Type */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Who Can Vote? <span className="text-red-500">*</span>
        </label>
        <div className="grid md:grid-cols-3 gap-4">
          {permissionTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => updateData({ 
                permission_type: type.value,
                allowed_countries: type.value === 'country_specific' ? data.allowed_countries : []
              })}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                data.permission_type === type.value
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              <div className="text-2xl text-blue-600 mb-2">{type.icon}</div>
              <h4 className="font-semibold text-gray-900 mb-1">{type.label}</h4>
              <p className="text-sm text-gray-600">{type.description}</p>
            </button>
          ))}
        </div>
      </div>
      
      {/* Country Selection (if country_specific) */}
      {data.permission_type === 'country_specific' && (
        <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select Allowed Countries <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
            {countries.map((country) => (
              <label key={country} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(data.allowed_countries || []).includes(country)}
                  onChange={() => toggleCountry(country)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">{country}</span>
              </label>
            ))}
          </div>
          {errors.allowed_countries && (
            <p className="text-red-500 text-sm mt-2">{errors.allowed_countries}</p>
          )}
          <p className="text-sm text-gray-600 mt-2">
            Selected: {(data.allowed_countries || []).length} countries
          </p>
        </div>
      )}
      
      {/* Pricing Configuration */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FaMoneyBillWave />
          Pricing Configuration <span className="text-red-500">*</span>
        </label>
        
        <div className="space-y-4">
          {/* Free */}
          <label className="flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="pricing"
              checked={data.pricing_type === 'free'}
              onChange={() => updateData({ 
                pricing_type: 'free',
                is_free: true,
                general_participation_fee: 0
              })}
              className="mt-1"
            />
            <div>
              <h4 className="font-semibold text-gray-900">Free Election</h4>
              <p className="text-sm text-gray-600">No participation fee required</p>
            </div>
          </label>
          
          {/* General Fee */}
          <label className="flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="pricing"
              checked={data.pricing_type === 'general_fee'}
              onChange={() => updateData({ 
                pricing_type: 'general_fee',
                is_free: false
              })}
              className="mt-1"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">General Fee</h4>
              <p className="text-sm text-gray-600 mb-2">Same fee for all voters</p>
              {data.pricing_type === 'general_fee' && (
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.general_participation_fee}
                  onChange={(e) => updateData({ general_participation_fee: parseFloat(e.target.value) })}
                  placeholder="Enter fee amount (USD)"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
                />
              )}
              {errors.general_participation_fee && (
                <p className="text-red-500 text-sm mt-1">{errors.general_participation_fee}</p>
              )}
            </div>
          </label>
          
          {/* Regional Pricing */}
          <label className="flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="pricing"
              checked={data.pricing_type === 'regional_fee'}
              onChange={() => updateData({ 
                pricing_type: 'regional_fee',
                is_free: false
              })}
              className="mt-1"
              disabled={userData.subscriptionType === 'Free'}
            />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">
                Regional Pricing
                {userData.subscriptionType === 'Free' && (
                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Paid Plan Only
                  </span>
                )}
              </h4>
              <p className="text-sm text-gray-600 mb-2">Different fees for different regions</p>
              {data.pricing_type === 'regional_fee' && (
                <button
                  onClick={() => setShowRegionalPricing(!showRegionalPricing)}
                  className="text-blue-600 text-sm font-semibold hover:underline"
                >
                  {showRegionalPricing ? 'Hide' : 'Configure'} Regional Pricing
                </button>
              )}
            </div>
          </label>
          
          {/* Regional Pricing Form */}
          {data.pricing_type === 'regional_fee' && showRegionalPricing && (
            <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
              <RegionalPricingForm
                regionalPricing={data.regional_pricing || []}
                onChange={(pricing) => updateData({ regional_pricing: pricing })}
              />
              {errors.regional_pricing && (
                <p className="text-red-500 text-sm mt-2">{errors.regional_pricing}</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Authentication Methods */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Authentication Methods <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {authMethods.map((method) => (
            <label key={method.value} className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={(data.authentication_methods || []).includes(method.value)}
                onChange={() => toggleAuthMethod(method.value)}
                className="w-5 h-5 text-blue-600"
              />
              <span className="text-gray-700 font-medium">{method.label}</span>
            </label>
          ))}
        </div>
        {errors.authentication_methods && (
          <p className="text-red-500 text-sm mt-2">{errors.authentication_methods}</p>
        )}
      </div>
      
      {/* Biometric Authentication */}
      <div className="mb-6">
        <label className="flex items-center space-x-3 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg cursor-pointer">
          <input
            type="checkbox"
            checked={data.biometric_required}
            onChange={(e) => updateData({ biometric_required: e.target.checked })}
            className="w-5 h-5 text-purple-600"
          />
          <div>
            <h4 className="font-semibold text-gray-900">Require Biometric Authentication</h4>
            <p className="text-sm text-gray-600">Add fingerprint/face recognition for extra security</p>
          </div>
        </label>
      </div>
      
      {/* Additional Settings */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Additional Settings
        </label>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={data.show_live_results}
              onChange={(e) => updateData({ show_live_results: e.target.checked })}
              className="w-5 h-5 text-blue-600"
            />
            <div>
              <span className="font-medium text-gray-900 flex items-center gap-2">
                <FaEye />
                Show Live Results
              </span>
              <p className="text-sm text-gray-600">Voters can see results in real-time</p>
            </div>
          </label>
          
          <label className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={data.vote_editing_allowed}
              onChange={(e) => updateData({ vote_editing_allowed: e.target.checked })}
              className="w-5 h-5 text-blue-600"
            />
            <div>
              <span className="font-medium text-gray-900 flex items-center gap-2">
                <FaEdit />
                Allow Vote Editing
              </span>
              <p className="text-sm text-gray-600">Voters can change their vote before election ends</p>
            </div>
          </label>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={onPrevious}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
        >
          ← Previous
        </button>
        
        <button
          onClick={handleNext}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition shadow-md"
        >
          Next: Questions →
        </button>
      </div>
    </div>
  );
}