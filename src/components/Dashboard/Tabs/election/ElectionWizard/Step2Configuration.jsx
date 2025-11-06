import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  FaGlobe,
  FaDollarSign,
  FaFingerprint,
  FaGift,
  FaCheckCircle,
  FaInfoCircle,
  FaEye,
  FaEyeSlash,
  FaEdit,
  FaLock,
  FaTrophy,
  FaMapMarkedAlt,
  FaTags,
  FaPercent
} from 'react-icons/fa';

// Regional zones for pricing
const REGIONAL_ZONES = [
  { id: 'north_america', name: 'North America', countries: 'USA, Canada', default_fee: 5.00 },
  { id: 'western_europe', name: 'Western Europe', countries: 'UK, Germany, France, etc.', default_fee: 4.50 },
  { id: 'australia_nz', name: 'Australia & New Zealand', countries: 'Australia, New Zealand', default_fee: 4.00 },
  { id: 'middle_east', name: 'Middle East', countries: 'UAE, Saudi Arabia, Qatar, etc.', default_fee: 3.50 },
  { id: 'eastern_europe', name: 'Eastern Europe', countries: 'Poland, Russia, Ukraine, etc.', default_fee: 2.50 },
  { id: 'latin_america', name: 'Latin America', countries: 'Brazil, Argentina, Mexico, etc.', default_fee: 2.00 },
  { id: 'asia', name: 'Asia', countries: 'China, India, Thailand, etc.', default_fee: 1.50 },
  { id: 'africa', name: 'Africa', countries: 'Nigeria, Kenya, South Africa, etc.', default_fee: 1.00 }
];

// All countries organized by continent
const COUNTRIES_BY_CONTINENT = {
  'Africa': [
    'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 'Cape Verde',
    'Central African Republic', 'Chad', 'Comoros', 'Congo', 'Democratic Republic of Congo',
    'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana',
    'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar',
    'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger',
    'Nigeria', 'Rwanda', 'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia',
    'South Africa', 'South Sudan', 'Sudan', 'Swaziland', 'Tanzania', 'Togo', 'Tunisia', 'Uganda',
    'Zambia', 'Zimbabwe'
  ],
  'Asia': [
    'Afghanistan', 'Armenia', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Bhutan', 'Brunei', 'Cambodia',
    'China', 'Georgia', 'Hong Kong', 'India', 'Indonesia', 'Iran', 'Iraq', 'Israel', 'Japan',
    'Jordan', 'Kazakhstan', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Lebanon', 'Macau', 'Malaysia',
    'Maldives', 'Mongolia', 'Myanmar', 'Nepal', 'North Korea', 'Oman', 'Pakistan', 'Palestine',
    'Philippines', 'Qatar', 'Saudi Arabia', 'Singapore', 'South Korea', 'Sri Lanka', 'Syria',
    'Taiwan', 'Tajikistan', 'Thailand', 'Timor-Leste', 'Turkey', 'Turkmenistan', 'United Arab Emirates',
    'Uzbekistan', 'Vietnam', 'Yemen'
  ],
  'Europe': [
    'Albania', 'Andorra', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria',
    'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany',
    'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Kosovo', 'Latvia', 'Liechtenstein',
    'Lithuania', 'Luxembourg', 'Macedonia', 'Malta', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands',
    'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'San Marino', 'Serbia', 'Slovakia',
    'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom', 'Vatican City'
  ],
  'North America': [
    'Antigua and Barbuda', 'Bahamas', 'Barbados', 'Belize', 'Canada', 'Costa Rica', 'Cuba',
    'Dominica', 'Dominican Republic', 'El Salvador', 'Grenada', 'Guatemala', 'Haiti', 'Honduras',
    'Jamaica', 'Mexico', 'Nicaragua', 'Panama', 'Saint Kitts and Nevis', 'Saint Lucia',
    'Saint Vincent and the Grenadines', 'Trinidad and Tobago', 'United States'
  ],
  'South America': [
    'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Guyana', 'Paraguay',
    'Peru', 'Suriname', 'Uruguay', 'Venezuela'
  ],
  'Australia & Oceania': [
    'Australia', 'Fiji', 'Kiribati', 'Marshall Islands', 'Micronesia', 'Nauru', 'New Zealand',
    'Palau', 'Papua New Guinea', 'Samoa', 'Solomon Islands', 'Tonga', 'Tuvalu', 'Vanuatu'
  ]
};

// Election categories (will be fetched from API in real implementation)
const ELECTION_CATEGORIES = [
  { id: 1, category_name: 'Politics', description: 'Political elections and polls', icon: '🏛️' },
  { id: 2, category_name: 'Sports', description: 'Sports-related voting', icon: '⚽' },
  { id: 3, category_name: 'Entertainment', description: 'Movies, music, and entertainment', icon: '🎬' },
  { id: 4, category_name: 'Education', description: 'Academic and educational voting', icon: '📚' },
  { id: 5, category_name: 'Business', description: 'Corporate and business decisions', icon: '💼' },
  { id: 6, category_name: 'Community', description: 'Community decisions and polls', icon: '🏘️' },
  { id: 7, category_name: 'Technology', description: 'Tech-related polls and surveys', icon: '💻' },
  { id: 8, category_name: 'Health', description: 'Health and wellness voting', icon: '🏥' }
];

export default function Step2Configuration({ data, updateData, onNext, onBack, eligibility }) {
  const [errors, setErrors] = useState({});
  const [regionalFees, setRegionalFees] = useState(data.regional_fees || {});

  // Initialize regional fees with defaults if needed
  useEffect(() => {
    if (data.pricing_type === 'paid_regional' && Object.keys(regionalFees).length === 0) {
      const defaultFees = {};
      REGIONAL_ZONES.forEach(zone => {
        defaultFees[zone.id] = zone.default_fee;
      });
      setRegionalFees(defaultFees);
      updateData({ regional_fees: defaultFees });
    }
  }, [data.pricing_type]);

  const validateStep = () => {
    const newErrors = {};

    // Category validation
    if (!data.category_id) {
      newErrors.category_id = 'Please select an election category';
    }

    // Permission type validation
    if (!data.permission_type) {
      newErrors.permission_type = 'Please select who can participate';
    }

    if (data.permission_type === 'specific_countries' && (!data.allowed_countries || data.allowed_countries.length === 0)) {
      newErrors.allowed_countries = 'Please select at least one country';
    }

    // Pricing validation
    if (!data.pricing_type) {
      newErrors.pricing_type = 'Please select a pricing type';
    }

    if (data.pricing_type === 'paid_general' && (!data.general_participation_fee || data.general_participation_fee <= 0)) {
      newErrors.general_participation_fee = 'Please enter a valid participation fee';
    }

    if (data.pricing_type === 'paid_regional') {
      const invalidRegions = REGIONAL_ZONES.filter(zone => 
        !regionalFees[zone.id] || regionalFees[zone.id] <= 0
      );
      if (invalidRegions.length > 0) {
        newErrors.regional_fees = `Please enter valid fees for all regions`;
      }
    }

    // Lottery validation
    if (data.lottery_enabled) {
      if (!data.lottery_config?.prize_funding_source) {
        newErrors.prize_funding_source = 'Please select prize funding source';
      }

      if (data.lottery_config?.prize_funding_source === 'creator_funded') {
        if (!data.lottery_config?.reward_type) {
          newErrors.lottery_reward_type = 'Please select a reward type';
        }

        if (data.lottery_config?.reward_type === 'monetary') {
          if (!data.lottery_config?.total_prize_pool || data.lottery_config.total_prize_pool <= 0) {
            newErrors.lottery_prize_pool = 'Please enter a valid prize pool amount';
          }
        }

        if (data.lottery_config?.reward_type === 'non_monetary') {
          if (!data.lottery_config?.prize_description?.trim()) {
            newErrors.lottery_prize_description = 'Please describe the non-monetary prize';
          }
          if (!data.lottery_config?.estimated_value || data.lottery_config.estimated_value <= 0) {
            newErrors.lottery_estimated_value = 'Please enter estimated value';
          }
        }

        if (data.lottery_config?.reward_type === 'projected_revenue') {
          if (!data.lottery_config?.projected_revenue || data.lottery_config.projected_revenue <= 0) {
            newErrors.lottery_projected_revenue = 'Please enter projected revenue';
          }
          if (!data.lottery_config?.revenue_share_percentage || data.lottery_config.revenue_share_percentage <= 0 || data.lottery_config.revenue_share_percentage > 100) {
            newErrors.lottery_revenue_share = 'Revenue share must be between 0 and 100%';
          }
        }
      }

      if (!data.lottery_config?.winner_count || data.lottery_config.winner_count < 1 || data.lottery_config.winner_count > 100) {
        newErrors.lottery_winner_count = 'Winner count must be between 1 and 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePermissionTypeChange = (type) => {
    updateData({ 
      permission_type: type,
      allowed_countries: type === 'specific_countries' ? data.allowed_countries || [] : []
    });
  };

  const toggleCountry = (country) => {
    const currentCountries = data.allowed_countries || [];
    const newCountries = currentCountries.includes(country)
      ? currentCountries.filter(c => c !== country)
      : [...currentCountries, country];
    updateData({ allowed_countries: newCountries });
  };

  const selectAllFromContinent = (continent) => {
    const countries = COUNTRIES_BY_CONTINENT[continent];
    const currentCountries = data.allowed_countries || [];
    const allSelected = countries.every(c => currentCountries.includes(c));
    
    if (allSelected) {
      updateData({ 
        allowed_countries: currentCountries.filter(c => !countries.includes(c)) 
      });
    } else {
      const uniqueCountries = [...new Set([...currentCountries, ...countries])];
      updateData({ allowed_countries: uniqueCountries });
    }
  };

  const handleRegionalFeeChange = (zoneId, value) => {
    const newFees = { ...regionalFees, [zoneId]: parseFloat(value) || 0 };
    setRegionalFees(newFees);
    updateData({ regional_fees: newFees });
  };

  const handleContinue = () => {
    if (!validateStep()) {
      toast.error('Please fix all errors before continuing');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span className="text-3xl">⚙️</span>
          Election Configuration
        </h2>
        <p className="text-gray-600">
          Configure category, access control, pricing, and special features
        </p>
      </div>

      {/* Election Category Selection */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FaTags className="text-purple-600" />
            Election Category *
          </h3>
          <FaInfoCircle className="text-gray-400 text-xl cursor-help" title="Select the category that best describes your election" />
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {ELECTION_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => updateData({ category_id: category.id })}
              className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 text-center ${
                data.category_id === category.id
                  ? 'border-purple-500 bg-purple-50 shadow-lg ring-2 ring-purple-200'
                  : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
              }`}
            >
              <div className="text-4xl mb-2">{category.icon}</div>
              <h4 className={`font-bold text-sm mb-1 ${
                data.category_id === category.id ? 'text-purple-600' : 'text-gray-800'
              }`}>
                {category.category_name}
                {data.category_id === category.id && (
                  <FaCheckCircle className="inline ml-1 text-green-500 text-xs" />
                )}
              </h4>
              <p className="text-xs text-gray-500">{category.description}</p>
            </button>
          ))}
        </div>

        {errors.category_id && (
          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
            <FaInfoCircle /> {errors.category_id}
          </p>
        )}
      </div>

      {/* Access Control */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FaGlobe className="text-green-600" />
            Who can participate in this election? *
          </h3>
        </div>

        <div className="space-y-4">
          {/* World Citizens */}
          <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
            data.permission_type === 'public'
              ? 'border-green-500 bg-green-50 shadow-md'
              : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
          }`}>
            <input
              type="radio"
              name="permission_type"
              value="public"
              checked={data.permission_type === 'public'}
              onChange={(e) => handlePermissionTypeChange(e.target.value)}
              className="mt-1 w-5 h-5 text-green-600"
            />
            <div className="ml-4 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <FaGlobe className="text-green-600 text-xl" />
                <span className="font-bold text-lg text-gray-900">World Citizens</span>
                {data.permission_type === 'public' && (
                  <FaCheckCircle className="text-green-500 ml-auto" />
                )}
              </div>
              <p className="text-sm text-gray-600">
                Anyone from anywhere in the world can participate in this election. No geographic restrictions will be applied.
              </p>
            </div>
          </label>

          {/* Specific Countries */}
          <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
            data.permission_type === 'specific_countries'
              ? 'border-blue-500 bg-blue-50 shadow-md'
              : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
          }`}>
            <input
              type="radio"
              name="permission_type"
              value="specific_countries"
              checked={data.permission_type === 'specific_countries'}
              onChange={(e) => handlePermissionTypeChange(e.target.value)}
              className="mt-1 w-5 h-5 text-blue-600"
            />
            <div className="ml-4 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <FaMapMarkedAlt className="text-blue-600 text-xl" />
                <span className="font-bold text-lg text-gray-900">Specific Countries</span>
                {data.permission_type === 'specific_countries' && (
                  <FaCheckCircle className="text-green-500 ml-auto" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Only residents of selected countries can participate. You can choose one or multiple countries.
              </p>

              {data.permission_type === 'specific_countries' && (
                <div className="mt-4 p-4 bg-white rounded-lg border-2 border-blue-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-800">
                      Select Countries ({data.allowed_countries?.length || 0} selected)
                    </h4>
                    {data.allowed_countries?.length > 0 && (
                      <button
                        onClick={() => updateData({ allowed_countries: [] })}
                        className="text-sm text-red-600 hover:text-red-700 font-semibold"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Country Selection by Continent */}
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {Object.entries(COUNTRIES_BY_CONTINENT).map(([continent, countries]) => {
                      const allSelected = countries.every(c => data.allowed_countries?.includes(c));
                      
                      return (
                        <div key={continent} className="border-2 border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-bold text-gray-800">{continent}</h5>
                            <button
                              onClick={() => selectAllFromContinent(continent)}
                              className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${
                                allSelected
                                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                              }`}
                            >
                              {allSelected ? 'Deselect All' : 'Select All'}
                            </button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {countries.map((country) => (
                              <label
                                key={country}
                                className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                                  data.allowed_countries?.includes(country)
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'hover:bg-gray-100'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={data.allowed_countries?.includes(country) || false}
                                  onChange={() => toggleCountry(country)}
                                  className="w-4 h-4 text-blue-600 rounded"
                                />
                                <span className="ml-2 text-sm">{country}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </label>
        </div>

        {errors.permission_type && (
          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
            <FaInfoCircle /> {errors.permission_type}
          </p>
        )}
        {errors.allowed_countries && (
          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
            <FaInfoCircle /> {errors.allowed_countries}
          </p>
        )}
      </div>

      {/* Biometric Authentication */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FaFingerprint className="text-purple-600" />
            Biometric Authentication
          </h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={data.biometric_required || false}
              onChange={(e) => updateData({ biometric_required: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        <p className="text-gray-600 mb-4">
          {data.biometric_required
            ? '✅ Biometric authentication is REQUIRED. Voters must verify their identity using fingerprint (Android) or Face ID (iPhone).'
            : '❌ Biometric authentication is NOT required. Voters can participate without biometric verification.'}
        </p>

        {data.biometric_required && (
          <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800">
              <strong>Note:</strong> Desktop users will not be able to vote in this election as biometric authentication is enabled.
              Only mobile users with fingerprint or Face ID capabilities can participate.
            </p>
          </div>
        )}
      </div>

      {/* Pricing Configuration */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FaDollarSign className="text-green-600" />
            Participation Fee *
          </h3>
        </div>

        <div className="space-y-4">
          {/* Free */}
          <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
            data.pricing_type === 'free'
              ? 'border-green-500 bg-green-50 shadow-md'
              : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
          }`}>
            <input
              type="radio"
              name="pricing_type"
              value="free"
              checked={data.pricing_type === 'free'}
              onChange={(e) => updateData({ pricing_type: e.target.value, general_participation_fee: 0 })}
              className="mt-1 w-5 h-5 text-green-600"
            />
            <div className="ml-4 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🆓</span>
                <span className="font-bold text-lg text-gray-900">Free</span>
                {data.pricing_type === 'free' && (
                  <FaCheckCircle className="text-green-500 ml-auto" />
                )}
              </div>
              <p className="text-sm text-gray-600">
                No participation fee. Election is completely free for all voters.
              </p>
            </div>
          </label>

          {/* Paid General */}
          <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
            data.pricing_type === 'paid_general'
              ? 'border-blue-500 bg-blue-50 shadow-md'
              : eligibility?.canCreatePaidElections
              ? 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
              : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
          }`}>
            <input
              type="radio"
              name="pricing_type"
              value="paid_general"
              checked={data.pricing_type === 'paid_general'}
              onChange={(e) => eligibility?.canCreatePaidElections && updateData({ pricing_type: e.target.value })}
              disabled={!eligibility?.canCreatePaidElections}
              className="mt-1 w-5 h-5 text-blue-600"
            />
            <div className="ml-4 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">💳</span>
                <span className="font-bold text-lg text-gray-900">Paid (General Fee)</span>
                {data.pricing_type === 'paid_general' && (
                  <FaCheckCircle className="text-green-500 ml-auto" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Single participation fee for all participants worldwide
              </p>

              {!eligibility?.canCreatePaidElections && (
                <p className="text-xs text-red-600 font-semibold">
                  ⚠️ Upgrade your plan to create paid elections
                </p>
              )}

              {data.pricing_type === 'paid_general' && eligibility?.canCreatePaidElections && (
                <div className="mt-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Participation Fee (USD) *
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={data.general_participation_fee || ''}
                    onChange={(e) => updateData({ general_participation_fee: parseFloat(e.target.value) })}
                    placeholder="e.g., 1.00"
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.general_participation_fee ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.general_participation_fee && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.general_participation_fee}
                    </p>
                  )}
                  {eligibility?.processingFeePercentage && (
                    <p className="text-xs text-gray-600 mt-2">
                      Processing fee: {eligibility.processingFeePercentage}% will be deducted
                    </p>
                  )}
                </div>
              )}
            </div>
          </label>

          {/* Paid Regional */}
          <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
            data.pricing_type === 'paid_regional'
              ? 'border-indigo-500 bg-indigo-50 shadow-md'
              : eligibility?.canCreatePaidElections
              ? 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
              : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
          }`}>
            <input
              type="radio"
              name="pricing_type"
              value="paid_regional"
              checked={data.pricing_type === 'paid_regional'}
              onChange={(e) => eligibility?.canCreatePaidElections && updateData({ pricing_type: e.target.value })}
              disabled={!eligibility?.canCreatePaidElections}
              className="mt-1 w-5 h-5 text-indigo-600"
            />
            <div className="ml-4 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🌍</span>
                <span className="font-bold text-lg text-gray-900">Paid (Regional Fee)</span>
                {data.pricing_type === 'paid_regional' && (
                  <FaCheckCircle className="text-green-500 ml-auto" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Different fees for 8 regional zones based on purchasing power
              </p>

              {!eligibility?.canCreatePaidElections && (
                <p className="text-xs text-red-600 font-semibold">
                  ⚠️ Upgrade your plan to create paid elections
                </p>
              )}

              {data.pricing_type === 'paid_regional' && eligibility?.canCreatePaidElections && (
                <div className="mt-4 p-4 bg-white rounded-lg border-2 border-indigo-200">
                  <h4 className="font-semibold text-gray-800 mb-4">Set Fees by Region (USD)</h4>
                  <div className="space-y-4">
                    {REGIONAL_ZONES.map((zone) => (
                      <div key={zone.id} className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {zone.name}
                          </label>
                          <p className="text-xs text-gray-500 mb-2">{zone.countries}</p>
                        </div>
                        <div className="w-32">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={regionalFees[zone.id] || zone.default_fee}
                            onChange={(e) => handleRegionalFeeChange(zone.id, e.target.value)}
                            placeholder={zone.default_fee.toFixed(2)}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.regional_fees && (
                    <p className="text-red-500 text-sm mt-3">
                      {errors.regional_fees}
                    </p>
                  )}
                  {eligibility?.processingFeePercentage && (
                    <p className="text-xs text-gray-600 mt-3">
                      Processing fee: {eligibility.processingFeePercentage}% will be deducted from each transaction
                    </p>
                  )}
                </div>
              )}
            </div>
          </label>
        </div>

        {errors.pricing_type && (
          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
            <FaInfoCircle /> {errors.pricing_type}
          </p>
        )}
      </div>

      {/* Lottery Feature - IMPROVED DESIGN WITH DISABLED STATE FOR FREE USERS */}
      <div className={`bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-yellow-300 ${
        !eligibility?.canCreatePaidElections ? 'opacity-50' : ''
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FaGift className="text-yellow-600" />
            Gamification Feature
          </h3>
          <label className={`relative inline-flex items-center ${
            eligibility?.canCreatePaidElections ? 'cursor-pointer' : 'cursor-not-allowed'
          }`}>
            <input
              type="checkbox"
              checked={data.lottery_enabled || false}
              onChange={(e) => eligibility?.canCreatePaidElections && updateData({ lottery_enabled: e.target.checked })}
              disabled={!eligibility?.canCreatePaidElections}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"></div>
          </label>
        </div>

        {!eligibility?.canCreatePaidElections && (
          <div className="mb-4 p-3 bg-red-100 border-2 border-red-300 rounded-lg">
            <p className="text-sm text-red-700 font-semibold flex items-center gap-2">
              <FaInfoCircle />
              ⚠️ Upgrade your plan to enable Gamification Feature
            </p>
          </div>
        )}

        <p className="text-gray-700 mb-4 font-medium">
          {data.lottery_enabled
            ? '🎉 Gamify this election with prizes for voters'
            : 'Add excitement by making this election a gamify with prizes'}
        </p>

        {data.lottery_enabled && eligibility?.canCreatePaidElections && (
          <div className="space-y-6">
            {/* Prize Funding Source Selection */}
            <div className="bg-white rounded-lg p-5 border-2 border-yellow-200">
              <h4 className="font-bold text-gray-900 mb-4">Prize Funding Source *</h4>
              <div className="space-y-3">
                {/* Creator/Sponsor Funded */}
                <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  data.lottery_config?.prize_funding_source === 'creator_funded'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-green-300'
                }`}>
                  <input
                    type="radio"
                    name="prize_funding_source"
                    value="creator_funded"
                    checked={data.lottery_config?.prize_funding_source === 'creator_funded'}
                    onChange={(e) => updateData({
                      lottery_config: { ...data.lottery_config, prize_funding_source: e.target.value }
                    })}
                    className="w-5 h-5 text-green-600"
                  />
                  <div className="ml-3">
                    <span className="font-bold text-gray-900">Creator/Sponsor Funded Prizes</span>
                    <p className="text-sm text-gray-600">You or your sponsor will provide the prizes</p>
                  </div>
                </label>

                {/* Participation Fee Funded */}
                <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  data.lottery_config?.prize_funding_source === 'participation_fee_funded'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}>
                  <input
                    type="radio"
                    name="prize_funding_source"
                    value="participation_fee_funded"
                    checked={data.lottery_config?.prize_funding_source === 'participation_fee_funded'}
                    onChange={(e) => updateData({
                      lottery_config: { ...data.lottery_config, prize_funding_source: e.target.value }
                    })}
                    className="w-5 h-5 text-blue-600"
                  />
                  <div className="ml-3">
                    <span className="font-bold text-gray-900">Participation Fee Funded</span>
                    <p className="text-sm text-gray-600">Prize pool comes from voter participation fees</p>
                  </div>
                </label>
              </div>
              {errors.prize_funding_source && (
                <p className="text-red-500 text-sm mt-2">{errors.prize_funding_source}</p>
              )}
            </div>

            {/* Creator-Funded Prize Configuration */}
            {data.lottery_config?.prize_funding_source === 'creator_funded' && (
              <div className="bg-white rounded-lg p-5 border-2 border-green-200">
                <h4 className="font-bold text-gray-900 mb-4">Prize Type *</h4>
                <div className="space-y-4">
                  {/* Defined Monetary Prize */}
                  <div className={`p-4 rounded-lg border-2 transition-all ${
                    data.lottery_config?.reward_type === 'monetary'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300'
                  }`}>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="reward_type"
                        value="monetary"
                        checked={data.lottery_config?.reward_type === 'monetary'}
                        onChange={(e) => updateData({
                          lottery_config: { ...data.lottery_config, reward_type: e.target.value }
                        })}
                        className="w-5 h-5 text-green-600"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">💵</span>
                          <span className="font-bold text-gray-900">Defined Monetary Prize</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Fixed cash amount</p>
                        <p className="text-xs text-gray-500 italic">e.g., USD 100,000</p>
                      </div>
                    </label>

                    {data.lottery_config?.reward_type === 'monetary' && (
                      <div className="mt-4 space-y-3">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            💰 Total Prize Pool Amount (USD) *
                          </label>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={data.lottery_config?.total_prize_pool || ''}
                            onChange={(e) => updateData({
                              lottery_config: {
                                ...data.lottery_config,
                                total_prize_pool: parseFloat(e.target.value)
                              }
                            })}
                            placeholder="e.g., 100000"
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 ${
                              errors.lottery_prize_pool ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.lottery_prize_pool && (
                            <p className="text-red-500 text-sm mt-1">{errors.lottery_prize_pool}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Defined Non-monetary Prize */}
                  <div className={`p-4 rounded-lg border-2 transition-all ${
                    data.lottery_config?.reward_type === 'non_monetary'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-300'
                  }`}>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="reward_type"
                        value="non_monetary"
                        checked={data.lottery_config?.reward_type === 'non_monetary'}
                        onChange={(e) => updateData({
                          lottery_config: { ...data.lottery_config, reward_type: e.target.value }
                        })}
                        className="w-5 h-5 text-purple-600"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">🎁</span>
                          <span className="font-bold text-gray-900">Defined Non-monetary Prize</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Coupons, vouchers, experiences</p>
                        <p className="text-xs text-gray-500 italic">e.g., One week Dubai holiday with 5-star hotel stay</p>
                      </div>
                    </label>

                    {data.lottery_config?.reward_type === 'non_monetary' && (
                      <div className="mt-4 space-y-3">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            🏷️ Non-monetary Prize Description *
                          </label>
                          <textarea
                            value={data.lottery_config?.prize_description || ''}
                            onChange={(e) => updateData({
                              lottery_config: {
                                ...data.lottery_config,
                                prize_description: e.target.value
                              }
                            })}
                            placeholder="e.g., One week Dubai holiday with 5-star hotel stay, luxury spa package, tech gadgets bundle"
                            rows={3}
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none ${
                              errors.lottery_prize_description ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.lottery_prize_description && (
                            <p className="text-red-500 text-sm mt-1">{errors.lottery_prize_description}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            💵 Estimated Value (USD) *
                          </label>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={data.lottery_config?.estimated_value || ''}
                            onChange={(e) => updateData({
                              lottery_config: {
                                ...data.lottery_config,
                                estimated_value: parseFloat(e.target.value)
                              }
                            })}
                            placeholder="Estimated monetary value"
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
                              errors.lottery_estimated_value ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.lottery_estimated_value && (
                            <p className="text-red-500 text-sm mt-1">{errors.lottery_estimated_value}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Projected Revenue */}
                  <div className={`p-4 rounded-lg border-2 transition-all ${
                    data.lottery_config?.reward_type === 'projected_revenue'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300'
                  }`}>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="reward_type"
                        value="projected_revenue"
                        checked={data.lottery_config?.reward_type === 'projected_revenue'}
                        onChange={(e) => updateData({
                          lottery_config: { ...data.lottery_config, reward_type: e.target.value }
                        })}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">📈</span>
                          <span className="font-bold text-gray-900">Defined Projected Content Generated Revenue</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Share of projected content revenue</p>
                        <p className="text-xs text-gray-500 italic">e.g., USD 300,000 content generated revenue</p>
                      </div>
                    </label>

                    {data.lottery_config?.reward_type === 'projected_revenue' && (
                      <div className="mt-4 space-y-3">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            📊 Projected Content Generated Revenue (USD) *
                          </label>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={data.lottery_config?.projected_revenue || ''}
                            onChange={(e) => updateData({
                              lottery_config: {
                                ...data.lottery_config,
                                projected_revenue: parseFloat(e.target.value)
                              }
                            })}
                            placeholder="e.g., 300000"
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              errors.lottery_projected_revenue ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.lottery_projected_revenue && (
                            <p className="text-red-500 text-sm mt-1">{errors.lottery_projected_revenue}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <FaPercent className="inline mr-2" />
                            Revenue Share Percentage for Winners (%) *
                          </label>
                          <input
                            type="number"
                            min="0.1"
                            max="100"
                            step="0.1"
                            value={data.lottery_config?.revenue_share_percentage || ''}
                            onChange={(e) => updateData({
                              lottery_config: {
                                ...data.lottery_config,
                                revenue_share_percentage: parseFloat(e.target.value)
                              }
                            })}
                            placeholder="e.g., 10.5"
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              errors.lottery_revenue_share ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Winners will receive this percentage of the actual generated revenue
                          </p>
                          {errors.lottery_revenue_share && (
                            <p className="text-red-500 text-sm mt-1">{errors.lottery_revenue_share}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {errors.lottery_reward_type && (
                  <p className="text-red-500 text-sm mt-3">{errors.lottery_reward_type}</p>
                )}
              </div>
            )}

            {/* Number of Winners */}
            <div className="bg-white rounded-lg p-5 border-2 border-yellow-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <FaTrophy className="inline mr-2 text-yellow-600" />
                Number of Winners (1-100) *
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={data.lottery_config?.winner_count || 1}
                onChange={(e) => updateData({
                  lottery_config: {
                    ...data.lottery_config,
                    winner_count: parseInt(e.target.value) || 1
                  }
                })}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-yellow-500 ${
                  errors.lottery_winner_count ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter number between 1 and 100"
              />
              <p className="text-xs text-gray-500 mt-2">
                Specify how many winners will be selected for prizes (any number from 1 to 100)
              </p>
              {errors.lottery_winner_count && (
                <p className="text-red-500 text-sm mt-1">{errors.lottery_winner_count}</p>
              )}
            </div>

            {/* Prize Pool Summary for Monetary */}
            {data.lottery_config?.reward_type === 'monetary' && data.lottery_config?.total_prize_pool > 0 && (
              <div className="bg-white rounded-lg p-5 border-2 border-green-400">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FaTrophy className="text-yellow-600" />
                  Prize Distribution Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Prize Pool:</span>
                    <span className="font-bold text-green-600">
                      ${data.lottery_config.total_prize_pool.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Number of Winners:</span>
                    <span className="font-bold">{data.lottery_config.winner_count}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t-2 border-green-300">
                    <span className="font-bold">Prize per Winner:</span>
                    <span className="font-bold text-lg text-green-600">
                      ${(data.lottery_config.total_prize_pool / data.lottery_config.winner_count).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results & Features */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FaEye className="text-indigo-600" />
          Results & Features
        </h3>

        <div className="space-y-4">
          {/* Show Live Results */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="font-semibold text-gray-800 flex items-center gap-2">
                {data.show_live_results ? <FaEye className="text-green-600" /> : <FaEyeSlash className="text-gray-400" />}
                Show Live Results During Election
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Display vote counts in real-time while election is active
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.show_live_results || false}
                onChange={(e) => updateData({ show_live_results: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Vote Editing */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="font-semibold text-gray-800 flex items-center gap-2">
                {data.vote_editing_allowed ? <FaEdit className="text-green-600" /> : <FaLock className="text-gray-400" />}
                Allow Voters to Change Their Votes
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Voters can modify their choices before election ends
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.vote_editing_allowed || false}
                onChange={(e) => updateData({ vote_editing_allowed: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all transform hover:scale-105 shadow-md"
        >
          ← Back
        </button>

        <button
          onClick={handleContinue}
          className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-xl flex items-center gap-2"
        >
          Continue to Questions
          <FaCheckCircle />
        </button>
      </div>
    </div>
  );
}
//Last workable code
// import React, { useState, useEffect } from 'react';
// import { toast } from 'react-toastify';
// import {
//   FaGlobe,
//   FaDollarSign,
//   FaFingerprint,
//   FaGift,
//   FaCheckCircle,
//   FaInfoCircle,
//   FaEye,
//   FaEyeSlash,
//   FaEdit,
//   FaLock,
//   FaTrophy,
//   FaMapMarkedAlt,
//   FaTags,
//   FaPercent
// } from 'react-icons/fa';

// // Regional zones for pricing
// const REGIONAL_ZONES = [
//   { id: 'north_america', name: 'North America', countries: 'USA, Canada', default_fee: 5.00 },
//   { id: 'western_europe', name: 'Western Europe', countries: 'UK, Germany, France, etc.', default_fee: 4.50 },
//   { id: 'australia_nz', name: 'Australia & New Zealand', countries: 'Australia, New Zealand', default_fee: 4.00 },
//   { id: 'middle_east', name: 'Middle East', countries: 'UAE, Saudi Arabia, Qatar, etc.', default_fee: 3.50 },
//   { id: 'eastern_europe', name: 'Eastern Europe', countries: 'Poland, Russia, Ukraine, etc.', default_fee: 2.50 },
//   { id: 'latin_america', name: 'Latin America', countries: 'Brazil, Argentina, Mexico, etc.', default_fee: 2.00 },
//   { id: 'asia', name: 'Asia', countries: 'China, India, Thailand, etc.', default_fee: 1.50 },
//   { id: 'africa', name: 'Africa', countries: 'Nigeria, Kenya, South Africa, etc.', default_fee: 1.00 }
// ];

// // All countries organized by continent
// const COUNTRIES_BY_CONTINENT = {
//   'Africa': [
//     'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 'Cape Verde',
//     'Central African Republic', 'Chad', 'Comoros', 'Congo', 'Democratic Republic of Congo',
//     'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana',
//     'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar',
//     'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger',
//     'Nigeria', 'Rwanda', 'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia',
//     'South Africa', 'South Sudan', 'Sudan', 'Swaziland', 'Tanzania', 'Togo', 'Tunisia', 'Uganda',
//     'Zambia', 'Zimbabwe'
//   ],
//   'Asia': [
//     'Afghanistan', 'Armenia', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Bhutan', 'Brunei', 'Cambodia',
//     'China', 'Georgia', 'Hong Kong', 'India', 'Indonesia', 'Iran', 'Iraq', 'Israel', 'Japan',
//     'Jordan', 'Kazakhstan', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Lebanon', 'Macau', 'Malaysia',
//     'Maldives', 'Mongolia', 'Myanmar', 'Nepal', 'North Korea', 'Oman', 'Pakistan', 'Palestine',
//     'Philippines', 'Qatar', 'Saudi Arabia', 'Singapore', 'South Korea', 'Sri Lanka', 'Syria',
//     'Taiwan', 'Tajikistan', 'Thailand', 'Timor-Leste', 'Turkey', 'Turkmenistan', 'United Arab Emirates',
//     'Uzbekistan', 'Vietnam', 'Yemen'
//   ],
//   'Europe': [
//     'Albania', 'Andorra', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria',
//     'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany',
//     'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Kosovo', 'Latvia', 'Liechtenstein',
//     'Lithuania', 'Luxembourg', 'Macedonia', 'Malta', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands',
//     'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'San Marino', 'Serbia', 'Slovakia',
//     'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom', 'Vatican City'
//   ],
//   'North America': [
//     'Antigua and Barbuda', 'Bahamas', 'Barbados', 'Belize', 'Canada', 'Costa Rica', 'Cuba',
//     'Dominica', 'Dominican Republic', 'El Salvador', 'Grenada', 'Guatemala', 'Haiti', 'Honduras',
//     'Jamaica', 'Mexico', 'Nicaragua', 'Panama', 'Saint Kitts and Nevis', 'Saint Lucia',
//     'Saint Vincent and the Grenadines', 'Trinidad and Tobago', 'United States'
//   ],
//   'South America': [
//     'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Guyana', 'Paraguay',
//     'Peru', 'Suriname', 'Uruguay', 'Venezuela'
//   ],
//   'Australia & Oceania': [
//     'Australia', 'Fiji', 'Kiribati', 'Marshall Islands', 'Micronesia', 'Nauru', 'New Zealand',
//     'Palau', 'Papua New Guinea', 'Samoa', 'Solomon Islands', 'Tonga', 'Tuvalu', 'Vanuatu'
//   ]
// };

// // Election categories (will be fetched from API in real implementation)
// const ELECTION_CATEGORIES = [
//   { id: 1, category_name: 'Politics', description: 'Political elections and polls', icon: '🏛️' },
//   { id: 2, category_name: 'Sports', description: 'Sports-related voting', icon: '⚽' },
//   { id: 3, category_name: 'Entertainment', description: 'Movies, music, and entertainment', icon: '🎬' },
//   { id: 4, category_name: 'Education', description: 'Academic and educational voting', icon: '📚' },
//   { id: 5, category_name: 'Business', description: 'Corporate and business decisions', icon: '💼' },
//   { id: 6, category_name: 'Community', description: 'Community decisions and polls', icon: '🏘️' },
//   { id: 7, category_name: 'Technology', description: 'Tech-related polls and surveys', icon: '💻' },
//   { id: 8, category_name: 'Health', description: 'Health and wellness voting', icon: '🏥' }
// ];

// export default function Step2Configuration({ data, updateData, onNext, onBack, eligibility }) {
//   const [errors, setErrors] = useState({});
//   const [regionalFees, setRegionalFees] = useState(data.regional_fees || {});

//   // Initialize regional fees with defaults if needed
//   useEffect(() => {
//     if (data.pricing_type === 'paid_regional' && Object.keys(regionalFees).length === 0) {
//       const defaultFees = {};
//       REGIONAL_ZONES.forEach(zone => {
//         defaultFees[zone.id] = zone.default_fee;
//       });
//       setRegionalFees(defaultFees);
//       updateData({ regional_fees: defaultFees });
//     }
//   }, [data.pricing_type]);

//   const validateStep = () => {
//     const newErrors = {};

//     // Category validation
//     if (!data.category_id) {
//       newErrors.category_id = 'Please select an election category';
//     }

//     // Permission type validation
//     if (!data.permission_type) {
//       newErrors.permission_type = 'Please select who can participate';
//     }

//     if (data.permission_type === 'specific_countries' && (!data.allowed_countries || data.allowed_countries.length === 0)) {
//       newErrors.allowed_countries = 'Please select at least one country';
//     }

//     // Pricing validation
//     if (!data.pricing_type) {
//       newErrors.pricing_type = 'Please select a pricing type';
//     }

//     if (data.pricing_type === 'paid_general' && (!data.general_participation_fee || data.general_participation_fee <= 0)) {
//       newErrors.general_participation_fee = 'Please enter a valid participation fee';
//     }

//     if (data.pricing_type === 'paid_regional') {
//       const invalidRegions = REGIONAL_ZONES.filter(zone => 
//         !regionalFees[zone.id] || regionalFees[zone.id] <= 0
//       );
//       if (invalidRegions.length > 0) {
//         newErrors.regional_fees = `Please enter valid fees for all regions`;
//       }
//     }

//     // Lottery validation
//     if (data.lottery_enabled) {
//       if (!data.lottery_config?.prize_funding_source) {
//         newErrors.prize_funding_source = 'Please select prize funding source';
//       }

//       if (data.lottery_config?.prize_funding_source === 'creator_funded') {
//         if (!data.lottery_config?.reward_type) {
//           newErrors.lottery_reward_type = 'Please select a reward type';
//         }

//         if (data.lottery_config?.reward_type === 'monetary') {
//           if (!data.lottery_config?.total_prize_pool || data.lottery_config.total_prize_pool <= 0) {
//             newErrors.lottery_prize_pool = 'Please enter a valid prize pool amount';
//           }
//         }

//         if (data.lottery_config?.reward_type === 'non_monetary') {
//           if (!data.lottery_config?.prize_description?.trim()) {
//             newErrors.lottery_prize_description = 'Please describe the non-monetary prize';
//           }
//           if (!data.lottery_config?.estimated_value || data.lottery_config.estimated_value <= 0) {
//             newErrors.lottery_estimated_value = 'Please enter estimated value';
//           }
//         }

//         if (data.lottery_config?.reward_type === 'projected_revenue') {
//           if (!data.lottery_config?.projected_revenue || data.lottery_config.projected_revenue <= 0) {
//             newErrors.lottery_projected_revenue = 'Please enter projected revenue';
//           }
//           if (!data.lottery_config?.revenue_share_percentage || data.lottery_config.revenue_share_percentage <= 0 || data.lottery_config.revenue_share_percentage > 100) {
//             newErrors.lottery_revenue_share = 'Revenue share must be between 0 and 100%';
//           }
//         }
//       }

//       if (!data.lottery_config?.winner_count || data.lottery_config.winner_count < 1 || data.lottery_config.winner_count > 100) {
//         newErrors.lottery_winner_count = 'Winner count must be between 1 and 100';
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handlePermissionTypeChange = (type) => {
//     updateData({ 
//       permission_type: type,
//       allowed_countries: type === 'specific_countries' ? data.allowed_countries || [] : []
//     });
//   };

//   const toggleCountry = (country) => {
//     const currentCountries = data.allowed_countries || [];
//     const newCountries = currentCountries.includes(country)
//       ? currentCountries.filter(c => c !== country)
//       : [...currentCountries, country];
//     updateData({ allowed_countries: newCountries });
//   };

//   const selectAllFromContinent = (continent) => {
//     const countries = COUNTRIES_BY_CONTINENT[continent];
//     const currentCountries = data.allowed_countries || [];
//     const allSelected = countries.every(c => currentCountries.includes(c));
    
//     if (allSelected) {
//       updateData({ 
//         allowed_countries: currentCountries.filter(c => !countries.includes(c)) 
//       });
//     } else {
//       const uniqueCountries = [...new Set([...currentCountries, ...countries])];
//       updateData({ allowed_countries: uniqueCountries });
//     }
//   };

//   const handleRegionalFeeChange = (zoneId, value) => {
//     const newFees = { ...regionalFees, [zoneId]: parseFloat(value) || 0 };
//     setRegionalFees(newFees);
//     updateData({ regional_fees: newFees });
//   };

//   const handleContinue = () => {
//     if (!validateStep()) {
//       toast.error('Please fix all errors before continuing');
//       return;
//     }
//     onNext();
//   };

//   return (
//     <div className="space-y-8">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
//         <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
//           <span className="text-3xl">⚙️</span>
//           Election Configuration
//         </h2>
//         <p className="text-gray-600">
//           Configure category, access control, pricing, and special features
//         </p>
//       </div>

//       {/* Election Category Selection */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//             <FaTags className="text-purple-600" />
//             Election Category *
//           </h3>
//           <FaInfoCircle className="text-gray-400 text-xl cursor-help" title="Select the category that best describes your election" />
//         </div>

//         <div className="grid md:grid-cols-4 gap-4">
//           {ELECTION_CATEGORIES.map((category) => (
//             <button
//               key={category.id}
//               onClick={() => updateData({ category_id: category.id })}
//               className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 text-center ${
//                 data.category_id === category.id
//                   ? 'border-purple-500 bg-purple-50 shadow-lg ring-2 ring-purple-200'
//                   : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
//               }`}
//             >
//               <div className="text-4xl mb-2">{category.icon}</div>
//               <h4 className={`font-bold text-sm mb-1 ${
//                 data.category_id === category.id ? 'text-purple-600' : 'text-gray-800'
//               }`}>
//                 {category.category_name}
//                 {data.category_id === category.id && (
//                   <FaCheckCircle className="inline ml-1 text-green-500 text-xs" />
//                 )}
//               </h4>
//               <p className="text-xs text-gray-500">{category.description}</p>
//             </button>
//           ))}
//         </div>

//         {errors.category_id && (
//           <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
//             <FaInfoCircle /> {errors.category_id}
//           </p>
//         )}
//       </div>

//       {/* Access Control */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//             <FaGlobe className="text-green-600" />
//             Who can participate in this election? *
//           </h3>
//         </div>

//         <div className="space-y-4">
//           {/* World Citizens */}
//           <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//             data.permission_type === 'public'
//               ? 'border-green-500 bg-green-50 shadow-md'
//               : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
//           }`}>
//             <input
//               type="radio"
//               name="permission_type"
//               value="public"
//               checked={data.permission_type === 'public'}
//               onChange={(e) => handlePermissionTypeChange(e.target.value)}
//               className="mt-1 w-5 h-5 text-green-600"
//             />
//             <div className="ml-4 flex-1">
//               <div className="flex items-center gap-2 mb-1">
//                 <FaGlobe className="text-green-600 text-xl" />
//                 <span className="font-bold text-lg text-gray-900">World Citizens</span>
//                 {data.permission_type === 'public' && (
//                   <FaCheckCircle className="text-green-500 ml-auto" />
//                 )}
//               </div>
//               <p className="text-sm text-gray-600">
//                 Anyone from anywhere in the world can participate in this election. No geographic restrictions will be applied.
//               </p>
//             </div>
//           </label>

//           {/* Specific Countries */}
//           <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//             data.permission_type === 'specific_countries'
//               ? 'border-blue-500 bg-blue-50 shadow-md'
//               : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
//           }`}>
//             <input
//               type="radio"
//               name="permission_type"
//               value="specific_countries"
//               checked={data.permission_type === 'specific_countries'}
//               onChange={(e) => handlePermissionTypeChange(e.target.value)}
//               className="mt-1 w-5 h-5 text-blue-600"
//             />
//             <div className="ml-4 flex-1">
//               <div className="flex items-center gap-2 mb-1">
//                 <FaMapMarkedAlt className="text-blue-600 text-xl" />
//                 <span className="font-bold text-lg text-gray-900">Specific Countries</span>
//                 {data.permission_type === 'specific_countries' && (
//                   <FaCheckCircle className="text-green-500 ml-auto" />
//                 )}
//               </div>
//               <p className="text-sm text-gray-600 mb-3">
//                 Only residents of selected countries can participate. You can choose one or multiple countries.
//               </p>

//               {data.permission_type === 'specific_countries' && (
//                 <div className="mt-4 p-4 bg-white rounded-lg border-2 border-blue-200">
//                   <div className="flex justify-between items-center mb-4">
//                     <h4 className="font-semibold text-gray-800">
//                       Select Countries ({data.allowed_countries?.length || 0} selected)
//                     </h4>
//                     {data.allowed_countries?.length > 0 && (
//                       <button
//                         onClick={() => updateData({ allowed_countries: [] })}
//                         className="text-sm text-red-600 hover:text-red-700 font-semibold"
//                       >
//                         Clear All
//                       </button>
//                     )}
//                   </div>

//                   {/* Country Selection by Continent */}
//                   <div className="space-y-4 max-h-96 overflow-y-auto">
//                     {Object.entries(COUNTRIES_BY_CONTINENT).map(([continent, countries]) => {
//                       const allSelected = countries.every(c => data.allowed_countries?.includes(c));
                      
//                       return (
//                         <div key={continent} className="border-2 border-gray-200 rounded-lg p-4">
//                           <div className="flex items-center justify-between mb-3">
//                             <h5 className="font-bold text-gray-800">{continent}</h5>
//                             <button
//                               onClick={() => selectAllFromContinent(continent)}
//                               className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${
//                                 allSelected
//                                   ? 'bg-red-100 text-red-600 hover:bg-red-200'
//                                   : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
//                               }`}
//                             >
//                               {allSelected ? 'Deselect All' : 'Select All'}
//                             </button>
//                           </div>
//                           <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//                             {countries.map((country) => (
//                               <label
//                                 key={country}
//                                 className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
//                                   data.allowed_countries?.includes(country)
//                                     ? 'bg-blue-100 text-blue-800'
//                                     : 'hover:bg-gray-100'
//                                 }`}
//                               >
//                                 <input
//                                   type="checkbox"
//                                   checked={data.allowed_countries?.includes(country) || false}
//                                   onChange={() => toggleCountry(country)}
//                                   className="w-4 h-4 text-blue-600 rounded"
//                                 />
//                                 <span className="ml-2 text-sm">{country}</span>
//                               </label>
//                             ))}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </label>
//         </div>

//         {errors.permission_type && (
//           <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
//             <FaInfoCircle /> {errors.permission_type}
//           </p>
//         )}
//         {errors.allowed_countries && (
//           <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
//             <FaInfoCircle /> {errors.allowed_countries}
//           </p>
//         )}
//       </div>

//       {/* Biometric Authentication */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//             <FaFingerprint className="text-purple-600" />
//             Biometric Authentication
//           </h3>
//           <label className="relative inline-flex items-center cursor-pointer">
//             <input
//               type="checkbox"
//               checked={data.biometric_required || false}
//               onChange={(e) => updateData({ biometric_required: e.target.checked })}
//               className="sr-only peer"
//             />
//             <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
//           </label>
//         </div>

//         <p className="text-gray-600 mb-4">
//           {data.biometric_required
//             ? '✅ Biometric authentication is REQUIRED. Voters must verify their identity using fingerprint (Android) or Face ID (iPhone).'
//             : '❌ Biometric authentication is NOT required. Voters can participate without biometric verification.'}
//         </p>

//         {data.biometric_required && (
//           <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
//             <p className="text-sm text-purple-800">
//               <strong>Note:</strong> Desktop users will not be able to vote in this election as biometric authentication is enabled.
//               Only mobile users with fingerprint or Face ID capabilities can participate.
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Pricing Configuration */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//             <FaDollarSign className="text-green-600" />
//             Participation Fee *
//           </h3>
//         </div>

//         <div className="space-y-4">
//           {/* Free */}
//           <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//             data.pricing_type === 'free'
//               ? 'border-green-500 bg-green-50 shadow-md'
//               : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
//           }`}>
//             <input
//               type="radio"
//               name="pricing_type"
//               value="free"
//               checked={data.pricing_type === 'free'}
//               onChange={(e) => updateData({ pricing_type: e.target.value, general_participation_fee: 0 })}
//               className="mt-1 w-5 h-5 text-green-600"
//             />
//             <div className="ml-4 flex-1">
//               <div className="flex items-center gap-2 mb-1">
//                 <span className="text-2xl">🆓</span>
//                 <span className="font-bold text-lg text-gray-900">Free</span>
//                 {data.pricing_type === 'free' && (
//                   <FaCheckCircle className="text-green-500 ml-auto" />
//                 )}
//               </div>
//               <p className="text-sm text-gray-600">
//                 No participation fee. Election is completely free for all voters.
//               </p>
//             </div>
//           </label>

//           {/* Paid General */}
//           <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//             data.pricing_type === 'paid_general'
//               ? 'border-blue-500 bg-blue-50 shadow-md'
//               : eligibility?.canCreatePaidElections
//               ? 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
//               : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
//           }`}>
//             <input
//               type="radio"
//               name="pricing_type"
//               value="paid_general"
//               checked={data.pricing_type === 'paid_general'}
//               onChange={(e) => eligibility?.canCreatePaidElections && updateData({ pricing_type: e.target.value })}
//               disabled={!eligibility?.canCreatePaidElections}
//               className="mt-1 w-5 h-5 text-blue-600"
//             />
//             <div className="ml-4 flex-1">
//               <div className="flex items-center gap-2 mb-1">
//                 <span className="text-2xl">💳</span>
//                 <span className="font-bold text-lg text-gray-900">Paid (General Fee)</span>
//                 {data.pricing_type === 'paid_general' && (
//                   <FaCheckCircle className="text-green-500 ml-auto" />
//                 )}
//               </div>
//               <p className="text-sm text-gray-600 mb-3">
//                 Single participation fee for all participants worldwide
//               </p>

//               {!eligibility?.canCreatePaidElections && (
//                 <p className="text-xs text-red-600 font-semibold">
//                   ⚠️ Upgrade your plan to create paid elections
//                 </p>
//               )}

//               {data.pricing_type === 'paid_general' && eligibility?.canCreatePaidElections && (
//                 <div className="mt-3">
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Participation Fee (USD) *
//                   </label>
//                   <input
//                     type="number"
//                     min="0.01"
//                     step="0.01"
//                     value={data.general_participation_fee || ''}
//                     onChange={(e) => updateData({ general_participation_fee: parseFloat(e.target.value) })}
//                     placeholder="e.g., 1.00"
//                     className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                       errors.general_participation_fee ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                   />
//                   {errors.general_participation_fee && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {errors.general_participation_fee}
//                     </p>
//                   )}
//                   {eligibility?.processingFeePercentage && (
//                     <p className="text-xs text-gray-600 mt-2">
//                       Processing fee: {eligibility.processingFeePercentage}% will be deducted
//                     </p>
//                   )}
//                 </div>
//               )}
//             </div>
//           </label>

//           {/* Paid Regional */}
//           <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//             data.pricing_type === 'paid_regional'
//               ? 'border-indigo-500 bg-indigo-50 shadow-md'
//               : eligibility?.canCreatePaidElections
//               ? 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
//               : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
//           }`}>
//             <input
//               type="radio"
//               name="pricing_type"
//               value="paid_regional"
//               checked={data.pricing_type === 'paid_regional'}
//               onChange={(e) => eligibility?.canCreatePaidElections && updateData({ pricing_type: e.target.value })}
//               disabled={!eligibility?.canCreatePaidElections}
//               className="mt-1 w-5 h-5 text-indigo-600"
//             />
//             <div className="ml-4 flex-1">
//               <div className="flex items-center gap-2 mb-1">
//                 <span className="text-2xl">🌍</span>
//                 <span className="font-bold text-lg text-gray-900">Paid (Regional Fee)</span>
//                 {data.pricing_type === 'paid_regional' && (
//                   <FaCheckCircle className="text-green-500 ml-auto" />
//                 )}
//               </div>
//               <p className="text-sm text-gray-600 mb-3">
//                 Different fees for 8 regional zones based on purchasing power
//               </p>

//               {!eligibility?.canCreatePaidElections && (
//                 <p className="text-xs text-red-600 font-semibold">
//                   ⚠️ Upgrade your plan to create paid elections
//                 </p>
//               )}

//               {data.pricing_type === 'paid_regional' && eligibility?.canCreatePaidElections && (
//                 <div className="mt-4 p-4 bg-white rounded-lg border-2 border-indigo-200">
//                   <h4 className="font-semibold text-gray-800 mb-4">Set Fees by Region (USD)</h4>
//                   <div className="space-y-4">
//                     {REGIONAL_ZONES.map((zone) => (
//                       <div key={zone.id} className="flex items-center gap-4">
//                         <div className="flex-1">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             {zone.name}
//                           </label>
//                           <p className="text-xs text-gray-500 mb-2">{zone.countries}</p>
//                         </div>
//                         <div className="w-32">
//                           <input
//                             type="number"
//                             min="0.01"
//                             step="0.01"
//                             value={regionalFees[zone.id] || zone.default_fee}
//                             onChange={(e) => handleRegionalFeeChange(zone.id, e.target.value)}
//                             placeholder={zone.default_fee.toFixed(2)}
//                             className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                           />
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                   {errors.regional_fees && (
//                     <p className="text-red-500 text-sm mt-3">
//                       {errors.regional_fees}
//                     </p>
//                   )}
//                   {eligibility?.processingFeePercentage && (
//                     <p className="text-xs text-gray-600 mt-3">
//                       Processing fee: {eligibility.processingFeePercentage}% will be deducted from each transaction
//                     </p>
//                   )}
//                 </div>
//               )}
//             </div>
//           </label>
//         </div>

//         {errors.pricing_type && (
//           <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
//             <FaInfoCircle /> {errors.pricing_type}
//           </p>
//         )}
//       </div>

//       {/* Lottery Feature - IMPROVED DESIGN */}
//       <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-yellow-300">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//             <FaGift className="text-yellow-600" />
//             Gamification Feature
//           </h3>
//           <label className="relative inline-flex items-center cursor-pointer">
//             <input
//               type="checkbox"
//               checked={data.lottery_enabled || false}
//               onChange={(e) => updateData({ lottery_enabled: e.target.checked })}
//               className="sr-only peer"
//             />
//             <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-500"></div>
//           </label>
//         </div>

//         <p className="text-gray-700 mb-4 font-medium">
//           {data.lottery_enabled
//             ? '🎉 Gamify this election with prizes for voters'
//             : 'Add excitement by making this election a gamify with prizes'}
//         </p>

//         {data.lottery_enabled && (
//           <div className="space-y-6">
//             {/* Prize Funding Source Selection */}
//             <div className="bg-white rounded-lg p-5 border-2 border-yellow-200">
//               <h4 className="font-bold text-gray-900 mb-4">Prize Funding Source *</h4>
//               <div className="space-y-3">
//                 {/* Creator/Sponsor Funded */}
//                 <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
//                   data.lottery_config?.prize_funding_source === 'creator_funded'
//                     ? 'border-green-500 bg-green-50'
//                     : 'border-gray-300 hover:border-green-300'
//                 }`}>
//                   <input
//                     type="radio"
//                     name="prize_funding_source"
//                     value="creator_funded"
//                     checked={data.lottery_config?.prize_funding_source === 'creator_funded'}
//                     onChange={(e) => updateData({
//                       lottery_config: { ...data.lottery_config, prize_funding_source: e.target.value }
//                     })}
//                     className="w-5 h-5 text-green-600"
//                   />
//                   <div className="ml-3">
//                     <span className="font-bold text-gray-900">Creator/Sponsor Funded Prizes</span>
//                     <p className="text-sm text-gray-600">You or your sponsor will provide the prizes</p>
//                   </div>
//                 </label>

//                 {/* Participation Fee Funded */}
//                 <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
//                   data.lottery_config?.prize_funding_source === 'participation_fee_funded'
//                     ? 'border-blue-500 bg-blue-50'
//                     : 'border-gray-300 hover:border-blue-300'
//                 }`}>
//                   <input
//                     type="radio"
//                     name="prize_funding_source"
//                     value="participation_fee_funded"
//                     checked={data.lottery_config?.prize_funding_source === 'participation_fee_funded'}
//                     onChange={(e) => updateData({
//                       lottery_config: { ...data.lottery_config, prize_funding_source: e.target.value }
//                     })}
//                     className="w-5 h-5 text-blue-600"
//                   />
//                   <div className="ml-3">
//                     <span className="font-bold text-gray-900">Participation Fee Funded</span>
//                     <p className="text-sm text-gray-600">Prize pool comes from voter participation fees</p>
//                   </div>
//                 </label>
//               </div>
//               {errors.prize_funding_source && (
//                 <p className="text-red-500 text-sm mt-2">{errors.prize_funding_source}</p>
//               )}
//             </div>

//             {/* Creator-Funded Prize Configuration */}
//             {data.lottery_config?.prize_funding_source === 'creator_funded' && (
//               <div className="bg-white rounded-lg p-5 border-2 border-green-200">
//                 <h4 className="font-bold text-gray-900 mb-4">Prize Type *</h4>
//                 <div className="space-y-4">
//                   {/* Defined Monetary Prize */}
//                   <div className={`p-4 rounded-lg border-2 transition-all ${
//                     data.lottery_config?.reward_type === 'monetary'
//                       ? 'border-green-500 bg-green-50'
//                       : 'border-gray-300'
//                   }`}>
//                     <label className="flex items-center cursor-pointer">
//                       <input
//                         type="radio"
//                         name="reward_type"
//                         value="monetary"
//                         checked={data.lottery_config?.reward_type === 'monetary'}
//                         onChange={(e) => updateData({
//                           lottery_config: { ...data.lottery_config, reward_type: e.target.value }
//                         })}
//                         className="w-5 h-5 text-green-600"
//                       />
//                       <div className="ml-3 flex-1">
//                         <div className="flex items-center gap-2 mb-1">
//                           <span className="text-2xl">💵</span>
//                           <span className="font-bold text-gray-900">Defined Monetary Prize</span>
//                         </div>
//                         <p className="text-sm text-gray-600 mb-2">Fixed cash amount</p>
//                         <p className="text-xs text-gray-500 italic">e.g., USD 100,000</p>
//                       </div>
//                     </label>

//                     {data.lottery_config?.reward_type === 'monetary' && (
//                       <div className="mt-4 space-y-3">
//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             💰 Total Prize Pool Amount (USD) *
//                           </label>
//                           <input
//                             type="number"
//                             min="1"
//                             step="1"
//                             value={data.lottery_config?.total_prize_pool || ''}
//                             onChange={(e) => updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 total_prize_pool: parseFloat(e.target.value)
//                               }
//                             })}
//                             placeholder="e.g., 100000"
//                             className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 ${
//                               errors.lottery_prize_pool ? 'border-red-500' : 'border-gray-300'
//                             }`}
//                           />
//                           {errors.lottery_prize_pool && (
//                             <p className="text-red-500 text-sm mt-1">{errors.lottery_prize_pool}</p>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* Defined Non-monetary Prize */}
//                   <div className={`p-4 rounded-lg border-2 transition-all ${
//                     data.lottery_config?.reward_type === 'non_monetary'
//                       ? 'border-purple-500 bg-purple-50'
//                       : 'border-gray-300'
//                   }`}>
//                     <label className="flex items-center cursor-pointer">
//                       <input
//                         type="radio"
//                         name="reward_type"
//                         value="non_monetary"
//                         checked={data.lottery_config?.reward_type === 'non_monetary'}
//                         onChange={(e) => updateData({
//                           lottery_config: { ...data.lottery_config, reward_type: e.target.value }
//                         })}
//                         className="w-5 h-5 text-purple-600"
//                       />
//                       <div className="ml-3 flex-1">
//                         <div className="flex items-center gap-2 mb-1">
//                           <span className="text-2xl">🎁</span>
//                           <span className="font-bold text-gray-900">Defined Non-monetary Prize</span>
//                         </div>
//                         <p className="text-sm text-gray-600 mb-2">Coupons, vouchers, experiences</p>
//                         <p className="text-xs text-gray-500 italic">e.g., One week Dubai holiday with 5-star hotel stay</p>
//                       </div>
//                     </label>

//                     {data.lottery_config?.reward_type === 'non_monetary' && (
//                       <div className="mt-4 space-y-3">
//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             🏷️ Non-monetary Prize Description *
//                           </label>
//                           <textarea
//                             value={data.lottery_config?.prize_description || ''}
//                             onChange={(e) => updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 prize_description: e.target.value
//                               }
//                             })}
//                             placeholder="e.g., One week Dubai holiday with 5-star hotel stay, luxury spa package, tech gadgets bundle"
//                             rows={3}
//                             className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none ${
//                               errors.lottery_prize_description ? 'border-red-500' : 'border-gray-300'
//                             }`}
//                           />
//                           {errors.lottery_prize_description && (
//                             <p className="text-red-500 text-sm mt-1">{errors.lottery_prize_description}</p>
//                           )}
//                         </div>

//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             💵 Estimated Value (USD) *
//                           </label>
//                           <input
//                             type="number"
//                             min="1"
//                             step="1"
//                             value={data.lottery_config?.estimated_value || ''}
//                             onChange={(e) => updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 estimated_value: parseFloat(e.target.value)
//                               }
//                             })}
//                             placeholder="Estimated monetary value"
//                             className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
//                               errors.lottery_estimated_value ? 'border-red-500' : 'border-gray-300'
//                             }`}
//                           />
//                           {errors.lottery_estimated_value && (
//                             <p className="text-red-500 text-sm mt-1">{errors.lottery_estimated_value}</p>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* Projected Revenue */}
//                   <div className={`p-4 rounded-lg border-2 transition-all ${
//                     data.lottery_config?.reward_type === 'projected_revenue'
//                       ? 'border-blue-500 bg-blue-50'
//                       : 'border-gray-300'
//                   }`}>
//                     <label className="flex items-center cursor-pointer">
//                       <input
//                         type="radio"
//                         name="reward_type"
//                         value="projected_revenue"
//                         checked={data.lottery_config?.reward_type === 'projected_revenue'}
//                         onChange={(e) => updateData({
//                           lottery_config: { ...data.lottery_config, reward_type: e.target.value }
//                         })}
//                         className="w-5 h-5 text-blue-600"
//                       />
//                       <div className="ml-3 flex-1">
//                         <div className="flex items-center gap-2 mb-1">
//                           <span className="text-2xl">📈</span>
//                           <span className="font-bold text-gray-900">Defined Projected Content Generated Revenue</span>
//                         </div>
//                         <p className="text-sm text-gray-600 mb-2">Share of projected content revenue</p>
//                         <p className="text-xs text-gray-500 italic">e.g., USD 300,000 content generated revenue</p>
//                       </div>
//                     </label>

//                     {data.lottery_config?.reward_type === 'projected_revenue' && (
//                       <div className="mt-4 space-y-3">
//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             📊 Projected Content Generated Revenue (USD) *
//                           </label>
//                           <input
//                             type="number"
//                             min="1"
//                             step="1"
//                             value={data.lottery_config?.projected_revenue || ''}
//                             onChange={(e) => updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 projected_revenue: parseFloat(e.target.value)
//                               }
//                             })}
//                             placeholder="e.g., 300000"
//                             className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                               errors.lottery_projected_revenue ? 'border-red-500' : 'border-gray-300'
//                             }`}
//                           />
//                           {errors.lottery_projected_revenue && (
//                             <p className="text-red-500 text-sm mt-1">{errors.lottery_projected_revenue}</p>
//                           )}
//                         </div>

//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             <FaPercent className="inline mr-2" />
//                             Revenue Share Percentage for Winners (%) *
//                           </label>
//                           <input
//                             type="number"
//                             min="0.1"
//                             max="100"
//                             step="0.1"
//                             value={data.lottery_config?.revenue_share_percentage || ''}
//                             onChange={(e) => updateData({
//                               lottery_config: {
//                                 ...data.lottery_config,
//                                 revenue_share_percentage: parseFloat(e.target.value)
//                               }
//                             })}
//                             placeholder="e.g., 10.5"
//                             className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                               errors.lottery_revenue_share ? 'border-red-500' : 'border-gray-300'
//                             }`}
//                           />
//                           <p className="text-xs text-gray-500 mt-1">
//                             Winners will receive this percentage of the actual generated revenue
//                           </p>
//                           {errors.lottery_revenue_share && (
//                             <p className="text-red-500 text-sm mt-1">{errors.lottery_revenue_share}</p>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//                 {errors.lottery_reward_type && (
//                   <p className="text-red-500 text-sm mt-3">{errors.lottery_reward_type}</p>
//                 )}
//               </div>
//             )}

//             {/* Number of Winners */}
//             <div className="bg-white rounded-lg p-5 border-2 border-yellow-200">
//               <label className="block text-sm font-semibold text-gray-700 mb-3">
//                 <FaTrophy className="inline mr-2 text-yellow-600" />
//                 Number of Winners (1-100) *
//               </label>
//               <input
//                 type="number"
//                 min="1"
//                 max="100"
//                 value={data.lottery_config?.winner_count || 1}
//                 onChange={(e) => updateData({
//                   lottery_config: {
//                     ...data.lottery_config,
//                     winner_count: parseInt(e.target.value) || 1
//                   }
//                 })}
//                 className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-yellow-500 ${
//                   errors.lottery_winner_count ? 'border-red-500' : 'border-gray-300'
//                 }`}
//                 placeholder="Enter number between 1 and 100"
//               />
//               <p className="text-xs text-gray-500 mt-2">
//                 Specify how many winners will be selected for prizes (any number from 1 to 100)
//               </p>
//               {errors.lottery_winner_count && (
//                 <p className="text-red-500 text-sm mt-1">{errors.lottery_winner_count}</p>
//               )}
//             </div>

//             {/* Prize Pool Summary for Monetary */}
//             {data.lottery_config?.reward_type === 'monetary' && data.lottery_config?.total_prize_pool > 0 && (
//               <div className="bg-white rounded-lg p-5 border-2 border-green-400">
//                 <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
//                   <FaTrophy className="text-yellow-600" />
//                   Prize Distribution Summary
//                 </h4>
//                 <div className="space-y-2 text-sm">
//                   <div className="flex justify-between">
//                     <span>Total Prize Pool:</span>
//                     <span className="font-bold text-green-600">
//                       ${data.lottery_config.total_prize_pool.toLocaleString()}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Number of Winners:</span>
//                     <span className="font-bold">{data.lottery_config.winner_count}</span>
//                   </div>
//                   <div className="flex justify-between pt-2 border-t-2 border-green-300">
//                     <span className="font-bold">Prize per Winner:</span>
//                     <span className="font-bold text-lg text-green-600">
//                       ${(data.lottery_config.total_prize_pool / data.lottery_config.winner_count).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Results & Features */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
//           <FaEye className="text-indigo-600" />
//           Results & Features
//         </h3>

//         <div className="space-y-4">
//           {/* Show Live Results */}
//           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//             <div>
//               <label className="font-semibold text-gray-800 flex items-center gap-2">
//                 {data.show_live_results ? <FaEye className="text-green-600" /> : <FaEyeSlash className="text-gray-400" />}
//                 Show Live Results During Election
//               </label>
//               <p className="text-sm text-gray-600 mt-1">
//                 Display vote counts in real-time while election is active
//               </p>
//             </div>
//             <label className="relative inline-flex items-center cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={data.show_live_results || false}
//                 onChange={(e) => updateData({ show_live_results: e.target.checked })}
//                 className="sr-only peer"
//               />
//               <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
//             </label>
//           </div>

//           {/* Vote Editing */}
//           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//             <div>
//               <label className="font-semibold text-gray-800 flex items-center gap-2">
//                 {data.vote_editing_allowed ? <FaEdit className="text-green-600" /> : <FaLock className="text-gray-400" />}
//                 Allow Voters to Change Their Votes
//               </label>
//               <p className="text-sm text-gray-600 mt-1">
//                 Voters can modify their choices before election ends
//               </p>
//             </div>
//             <label className="relative inline-flex items-center cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={data.vote_editing_allowed || false}
//                 onChange={(e) => updateData({ vote_editing_allowed: e.target.checked })}
//                 className="sr-only peer"
//               />
//               <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
//             </label>
//           </div>
//         </div>
//       </div>

//       {/* Navigation Buttons */}
//       <div className="flex justify-between pt-6">
//         <button
//           onClick={onBack}
//           className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all transform hover:scale-105 shadow-md"
//         >
//           ← Back
//         </button>

//         <button
//           onClick={handleContinue}
//           className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-xl flex items-center gap-2"
//         >
//           Continue to Questions
//           <FaCheckCircle />
//         </button>
//       </div>
//     </div>
//   );
// }
