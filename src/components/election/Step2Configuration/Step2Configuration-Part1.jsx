// src/components/election/Step2Configuration/Step2Configuration-Part1.jsx
// Contains: CategorySelection, AccessControl, BiometricAuth
// ✅ FIXED: Added "Specific Group Members" option
import React from 'react';
import {
  FaGlobe,
  FaFingerprint,
  FaCheckCircle,
  FaInfoCircle,
  FaMapMarkedAlt,
  FaTags,
  FaUsers
} from 'react-icons/fa';

// Election categories
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

// ============================================
// CATEGORY SELECTION COMPONENT
// ============================================
export function CategorySelection({ data, updateData, errors }) {
  return (
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
  );
}

// ============================================
// ACCESS CONTROL COMPONENT
// ✅ UPDATED: Added "Specific Group Members" option
// ============================================
export function AccessControl({ data, updateData, errors }) {
  const handlePermissionTypeChange = (type) => {
    updateData({ 
      permission_type: type,
      allowed_countries: type === 'specific_countries' ? data.allowed_countries || [] : [],
      allowed_group_members: type === 'specific_group' ? data.allowed_group_members || [] : []
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

  // ✅ NEW: Handle group member email input
  const handleGroupMemberInput = (value) => {
    updateData({ group_member_input: value });
  };

  const addGroupMember = () => {
    const email = (data.group_member_input || '').trim();
    if (!email) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    const currentMembers = data.allowed_group_members || [];
    if (currentMembers.includes(email)) {
      alert('This email is already added');
      return;
    }

    updateData({ 
      allowed_group_members: [...currentMembers, email],
      group_member_input: '' // Clear input
    });
  };

  const removeGroupMember = (email) => {
    const currentMembers = data.allowed_group_members || [];
    updateData({ 
      allowed_group_members: currentMembers.filter(e => e !== email)
    });
  };

  return (
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
          data.permission_type === 'country_specific'
            ? 'border-blue-500 bg-blue-50 shadow-md'
            : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
        }`}>
          <input
            type="radio"
            name="permission_type"
            value="country_specific"
            checked={data.permission_type === 'country_specific'}
            onChange={(e) => handlePermissionTypeChange(e.target.value)}
            className="mt-1 w-5 h-5 text-blue-600"
          />
          <div className="ml-4 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <FaMapMarkedAlt className="text-blue-600 text-xl" />
              <span className="font-bold text-lg text-gray-900">Specific Countries</span>
              {data.permission_type === 'country_specific' && (
                <FaCheckCircle className="text-green-500 ml-auto" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Only residents of selected countries can participate. You can choose one or multiple countries.
            </p>

            {data.permission_type === 'country_specific' && (
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

        {/* ✅ NEW: Specific Group Members */}
        <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
          data.permission_type === 'specific_group'
            ? 'border-purple-500 bg-purple-50 shadow-md'
            : 'border-gray-200 hover:border-purple-300 hover:shadow-sm'
        }`}>
          <input
            type="radio"
            name="permission_type"
            value="specific_group"
            checked={data.permission_type === 'specific_group'}
            onChange={(e) => handlePermissionTypeChange(e.target.value)}
            className="mt-1 w-5 h-5 text-purple-600"
          />
          <div className="ml-4 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <FaUsers className="text-purple-600 text-xl" />
              <span className="font-bold text-lg text-gray-900">Specific Group Members</span>
              {data.permission_type === 'specific_group' && (
                <FaCheckCircle className="text-green-500 ml-auto" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Only specific people you invite can participate. Add members by their email addresses.
            </p>

            {data.permission_type === 'specific_group' && (
              <div className="mt-4 p-4 bg-white rounded-lg border-2 border-purple-200">
                <h4 className="font-semibold text-gray-800 mb-4">
                  Add Group Members ({data.allowed_group_members?.length || 0} added)
                </h4>

                {/* Add Email Input */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="email"
                    value={data.group_member_input || ''}
                    onChange={(e) => handleGroupMemberInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addGroupMember();
                      }
                    }}
                    placeholder="Enter email address"
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <button
                    onClick={addGroupMember}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-colors"
                  >
                    Add
                  </button>
                </div>

                {/* Display Added Members */}
                {data.allowed_group_members && data.allowed_group_members.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-semibold text-sm text-gray-700">Invited Members:</h5>
                      <button
                        onClick={() => updateData({ allowed_group_members: [] })}
                        className="text-sm text-red-600 hover:text-red-700 font-semibold"
                      >
                        Clear All
                      </button>
                    </div>
                    {data.allowed_group_members.map((email, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200"
                      >
                        <span className="text-sm text-gray-700">{email}</span>
                        <button
                          onClick={() => removeGroupMember(email)}
                          className="text-red-600 hover:text-red-700 font-semibold text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {(!data.allowed_group_members || data.allowed_group_members.length === 0) && (
                  <div className="text-center py-8 text-gray-400">
                    <FaUsers className="text-4xl mx-auto mb-2" />
                    <p className="text-sm">No members added yet. Start by adding email addresses above.</p>
                  </div>
                )}
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
      {errors.allowed_group_members && (
        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
          <FaInfoCircle /> {errors.allowed_group_members}
        </p>
      )}
    </div>
  );
}

// ============================================
// BIOMETRIC AUTHENTICATION COMPONENT
// ============================================
export function BiometricAuth({ data, updateData }) {
  return (
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
  );
}

export default {
  CategorySelection,
  AccessControl,
  BiometricAuth
};
// // src/components/election/Step2Configuration/Step2Configuration-Part1.jsx
// // Contains: CategorySelection, AccessControl, BiometricAuth
// import React from 'react';
// import {
//   FaGlobe,
//   FaFingerprint,
//   FaCheckCircle,
//   FaInfoCircle,
//   FaMapMarkedAlt,
//   FaTags
// } from 'react-icons/fa';

// // Election categories
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

// // ============================================
// // CATEGORY SELECTION COMPONENT
// // ============================================
// export function CategorySelection({ data, updateData, errors }) {
//   return (
//     <div className="bg-white rounded-xl shadow-md p-6">
//       <div className="flex items-center justify-between mb-6">
//         <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//           <FaTags className="text-purple-600" />
//           Election Category *
//         </h3>
//         <FaInfoCircle className="text-gray-400 text-xl cursor-help" title="Select the category that best describes your election" />
//       </div>

//       <div className="grid md:grid-cols-4 gap-4">
//         {ELECTION_CATEGORIES.map((category) => (
//           <button
//             key={category.id}
//             onClick={() => updateData({ category_id: category.id })}
//             className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 text-center ${
//               data.category_id === category.id
//                 ? 'border-purple-500 bg-purple-50 shadow-lg ring-2 ring-purple-200'
//                 : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
//             }`}
//           >
//             <div className="text-4xl mb-2">{category.icon}</div>
//             <h4 className={`font-bold text-sm mb-1 ${
//               data.category_id === category.id ? 'text-purple-600' : 'text-gray-800'
//             }`}>
//               {category.category_name}
//               {data.category_id === category.id && (
//                 <FaCheckCircle className="inline ml-1 text-green-500 text-xs" />
//               )}
//             </h4>
//             <p className="text-xs text-gray-500">{category.description}</p>
//           </button>
//         ))}
//       </div>

//       {errors.category_id && (
//         <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
//           <FaInfoCircle /> {errors.category_id}
//         </p>
//       )}
//     </div>
//   );
// }

// // ============================================
// // ACCESS CONTROL COMPONENT
// // ============================================
// export function AccessControl({ data, updateData, errors }) {
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

//   return (
//     <div className="bg-white rounded-xl shadow-md p-6">
//       <div className="flex items-center justify-between mb-6">
//         <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//           <FaGlobe className="text-green-600" />
//           Who can participate in this election? *
//         </h3>
//       </div>

//       <div className="space-y-4">
//         {/* World Citizens */}
//         <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//           data.permission_type === 'public'
//             ? 'border-green-500 bg-green-50 shadow-md'
//             : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
//         }`}>
//           <input
//             type="radio"
//             name="permission_type"
//             value="public"
//             checked={data.permission_type === 'public'}
//             onChange={(e) => handlePermissionTypeChange(e.target.value)}
//             className="mt-1 w-5 h-5 text-green-600"
//           />
//           <div className="ml-4 flex-1">
//             <div className="flex items-center gap-2 mb-1">
//               <FaGlobe className="text-green-600 text-xl" />
//               <span className="font-bold text-lg text-gray-900">World Citizens</span>
//               {data.permission_type === 'public' && (
//                 <FaCheckCircle className="text-green-500 ml-auto" />
//               )}
//             </div>
//             <p className="text-sm text-gray-600">
//               Anyone from anywhere in the world can participate in this election. No geographic restrictions will be applied.
//             </p>
//           </div>
//         </label>

//         {/* Specific Countries */}
//         <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//           data.permission_type === 'specific_countries'
//             ? 'border-blue-500 bg-blue-50 shadow-md'
//             : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
//         }`}>
//           <input
//             type="radio"
//             name="permission_type"
//             value="specific_countries"
//             checked={data.permission_type === 'specific_countries'}
//             onChange={(e) => handlePermissionTypeChange(e.target.value)}
//             className="mt-1 w-5 h-5 text-blue-600"
//           />
//           <div className="ml-4 flex-1">
//             <div className="flex items-center gap-2 mb-1">
//               <FaMapMarkedAlt className="text-blue-600 text-xl" />
//               <span className="font-bold text-lg text-gray-900">Specific Countries</span>
//               {data.permission_type === 'specific_countries' && (
//                 <FaCheckCircle className="text-green-500 ml-auto" />
//               )}
//             </div>
//             <p className="text-sm text-gray-600 mb-3">
//               Only residents of selected countries can participate. You can choose one or multiple countries.
//             </p>

//             {data.permission_type === 'specific_countries' && (
//               <div className="mt-4 p-4 bg-white rounded-lg border-2 border-blue-200">
//                 <div className="flex justify-between items-center mb-4">
//                   <h4 className="font-semibold text-gray-800">
//                     Select Countries ({data.allowed_countries?.length || 0} selected)
//                   </h4>
//                   {data.allowed_countries?.length > 0 && (
//                     <button
//                       onClick={() => updateData({ allowed_countries: [] })}
//                       className="text-sm text-red-600 hover:text-red-700 font-semibold"
//                     >
//                       Clear All
//                     </button>
//                   )}
//                 </div>

//                 {/* Country Selection by Continent */}
//                 <div className="space-y-4 max-h-96 overflow-y-auto">
//                   {Object.entries(COUNTRIES_BY_CONTINENT).map(([continent, countries]) => {
//                     const allSelected = countries.every(c => data.allowed_countries?.includes(c));
                    
//                     return (
//                       <div key={continent} className="border-2 border-gray-200 rounded-lg p-4">
//                         <div className="flex items-center justify-between mb-3">
//                           <h5 className="font-bold text-gray-800">{continent}</h5>
//                           <button
//                             onClick={() => selectAllFromContinent(continent)}
//                             className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${
//                               allSelected
//                                 ? 'bg-red-100 text-red-600 hover:bg-red-200'
//                                 : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
//                             }`}
//                           >
//                             {allSelected ? 'Deselect All' : 'Select All'}
//                           </button>
//                         </div>
//                         <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//                           {countries.map((country) => (
//                             <label
//                               key={country}
//                               className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
//                                 data.allowed_countries?.includes(country)
//                                   ? 'bg-blue-100 text-blue-800'
//                                   : 'hover:bg-gray-100'
//                               }`}
//                             >
//                               <input
//                                 type="checkbox"
//                                 checked={data.allowed_countries?.includes(country) || false}
//                                 onChange={() => toggleCountry(country)}
//                                 className="w-4 h-4 text-blue-600 rounded"
//                               />
//                               <span className="ml-2 text-sm">{country}</span>
//                             </label>
//                           ))}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}
//           </div>
//         </label>
//       </div>

//       {errors.permission_type && (
//         <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
//           <FaInfoCircle /> {errors.permission_type}
//         </p>
//       )}
//       {errors.allowed_countries && (
//         <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
//           <FaInfoCircle /> {errors.allowed_countries}
//         </p>
//       )}
//     </div>
//   );
// }

// // ============================================
// // BIOMETRIC AUTHENTICATION COMPONENT
// // ============================================
// export function BiometricAuth({ data, updateData }) {
//   return (
//     <div className="bg-white rounded-xl shadow-md p-6">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//           <FaFingerprint className="text-purple-600" />
//           Biometric Authentication
//         </h3>
//         <label className="relative inline-flex items-center cursor-pointer">
//           <input
//             type="checkbox"
//             checked={data.biometric_required || false}
//             onChange={(e) => updateData({ biometric_required: e.target.checked })}
//             className="sr-only peer"
//           />
//           <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
//         </label>
//       </div>

//       <p className="text-gray-600 mb-4">
//         {data.biometric_required
//           ? '✅ Biometric authentication is REQUIRED. Voters must verify their identity using fingerprint (Android) or Face ID (iPhone).'
//           : '❌ Biometric authentication is NOT required. Voters can participate without biometric verification.'}
//       </p>

//       {data.biometric_required && (
//         <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
//           <p className="text-sm text-purple-800">
//             <strong>Note:</strong> Desktop users will not be able to vote in this election as biometric authentication is enabled.
//             Only mobile users with fingerprint or Face ID capabilities can participate.
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }

// export default {
//   CategorySelection,
//   AccessControl,
//   BiometricAuth
// };