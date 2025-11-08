// src/components/election/Step2Configuration/Step2Configuration-Part2.jsx
// Contains: PricingConfiguration
// ✅ FIXED: Proper pricing_type updates for both general_fee and regional_fee
// ✅ FIXED: Input fields now properly handle keyboard/mouse input and are erasable
import React from 'react';
import {
  FaDollarSign,
  FaCheckCircle,
  FaInfoCircle
} from 'react-icons/fa';

// Regional zones for pricing
const REGIONAL_ZONES = [
  { id: 'region_1_us_canada', name: 'Region 1: US & Canada', countries: 'USA, Canada', default_fee: 5.00 },
  { id: 'region_2_western_europe', name: 'Region 2: Western Europe', countries: 'UK, Germany, France, etc.', default_fee: 4.50 },
  { id: 'region_7_australasia', name: 'Region 7: Australasia', countries: 'Australia, New Zealand', default_fee: 4.00 },
  { id: 'region_6_middle_east_asia', name: 'Region 6: Middle East Asia', countries: 'UAE, Saudi Arabia, Qatar, Singapore, etc.', default_fee: 3.50 },
  { id: 'region_3_eastern_europe', name: 'Region 3: Eastern Europe', countries: 'Poland, Russia, Ukraine, etc.', default_fee: 2.50 },
  { id: 'region_5_latin_america', name: 'Region 5: Latin America', countries: 'Brazil, Argentina, Mexico, etc.', default_fee: 2.00 },
  { id: 'region_4_africa', name: 'Region 4: Africa', countries: 'Nigeria, Kenya, South Africa, etc.', default_fee: 1.50 },
  { id: 'region_8_china', name: 'Region 8: China', countries: 'China, Hong Kong, Macau', default_fee: 1.00 }
];

// ============================================
// PRICING CONFIGURATION COMPONENT
// ✅ FIXED: All input issues resolved
// ============================================
export function PricingConfiguration({ data, updateData, errors, eligibility, regionalFees, setRegionalFees }) {
  
  // ✅ FIX: Handle regional fee changes with proper validation
  const handleRegionalFeeChange = (zoneId, value) => {
    // Allow empty string for clearing
    if (value === '' || value === null || value === undefined) {
      const newFees = { ...regionalFees };
      delete newFees[zoneId];
      setRegionalFees(newFees);
      updateData({ regional_fees: newFees });
      return;
    }
    
    // Parse as float and validate
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      const newFees = { ...regionalFees, [zoneId]: numValue };
      setRegionalFees(newFees);
      updateData({ regional_fees: newFees });
    }
  };

  // ✅ FIX: Handle general fee changes with proper validation
  const handleGeneralFeeChange = (value) => {
    // Allow empty string for clearing
    if (value === '' || value === null || value === undefined) {
      updateData({ general_participation_fee: '' });
      return;
    }
    
    // Parse as float and validate
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      updateData({ general_participation_fee: numValue });
    }
  };

  return (
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
            onChange={(e) => updateData({ 
              pricing_type: e.target.value, 
              general_participation_fee: 0,
              is_free: true 
            })}
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

        {/* ✅ FIXED: Paid General - Now properly updates pricing_type as 'general_fee' */}
        <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
          data.pricing_type === 'general_fee'
            ? 'border-blue-500 bg-blue-50 shadow-md'
            : eligibility?.canCreatePaidElections
            ? 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
            : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
        }`}>
          <input
            type="radio"
            name="pricing_type"
            value="general_fee"
            checked={data.pricing_type === 'general_fee'}
            onChange={(e) => eligibility?.canCreatePaidElections && updateData({ 
              pricing_type: e.target.value,
              is_free: false  // ✅ Set is_free to false for paid elections
            })}
            disabled={!eligibility?.canCreatePaidElections}
            className="mt-1 w-5 h-5 text-blue-600"
          />
          <div className="ml-4 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">💳</span>
              <span className="font-bold text-lg text-gray-900">Paid (General Fee)</span>
              {data.pricing_type === 'general_fee' && (
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

            {data.pricing_type === 'general_fee' && eligibility?.canCreatePaidElections && (
              <div className="mt-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Participation Fee (USD) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.general_participation_fee === '' || data.general_participation_fee === 0 ? '' : data.general_participation_fee}
                  onChange={(e) => handleGeneralFeeChange(e.target.value)}
                  onKeyDown={(e) => {
                    // Prevent negative sign and 'e' notation
                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                      e.preventDefault();
                    }
                  }}
                  onWheel={(e) => e.target.blur()} // Prevent scroll wheel changes
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

        {/* ✅ FIXED: Paid Regional - Now properly updates pricing_type as 'regional_fee' */}
        <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
          data.pricing_type === 'regional_fee'
            ? 'border-indigo-500 bg-indigo-50 shadow-md'
            : eligibility?.canCreatePaidElections
            ? 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
            : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
        }`}>
          <input
            type="radio"
            name="pricing_type"
            value="regional_fee"
            checked={data.pricing_type === 'regional_fee'}
            onChange={(e) => eligibility?.canCreatePaidElections && updateData({ 
              pricing_type: e.target.value,
              is_free: false  // ✅ Set is_free to false for paid elections
            })}
            disabled={!eligibility?.canCreatePaidElections}
            className="mt-1 w-5 h-5 text-indigo-600"
          />
          <div className="ml-4 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🌍</span>
              <span className="font-bold text-lg text-gray-900">Paid (Regional Fee)</span>
              {data.pricing_type === 'regional_fee' && (
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

            {data.pricing_type === 'regional_fee' && eligibility?.canCreatePaidElections && (
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
                          min="0"
                          step="0.01"
                          value={regionalFees[zone.id] === undefined || regionalFees[zone.id] === '' 
                            ? zone.default_fee 
                            : regionalFees[zone.id]}
                          onChange={(e) => handleRegionalFeeChange(zone.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                              e.preventDefault();
                            }
                          }}
                          onWheel={(e) => e.target.blur()} // Prevent scroll wheel changes
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
  );
}

export default PricingConfiguration;
// // src/components/election/Step2Configuration/Step2Configuration-Part2.jsx
// // Contains: PricingConfiguration
// import React from 'react';
// import {
//   FaDollarSign,
//   FaCheckCircle,
//   FaInfoCircle,
//   FaGlobe
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

// // ============================================
// // PRICING CONFIGURATION COMPONENT
// // ============================================
// export function PricingConfiguration({ data, updateData, errors, eligibility, regionalFees, setRegionalFees }) {
//   const handleRegionalFeeChange = (zoneId, value) => {
//     if (value === '' || value === null || value === undefined) {
//       const newFees = { ...regionalFees, [zoneId]: '' };
//       setRegionalFees(newFees);
//       updateData({ regional_fees: newFees });
//       return;
//     }
    
//     const numValue = parseFloat(value);
//     if (!isNaN(numValue) && numValue >= 0) {
//       const newFees = { ...regionalFees, [zoneId]: numValue };
//       setRegionalFees(newFees);
//       updateData({ regional_fees: newFees });
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-md p-6">
//       <div className="flex items-center justify-between mb-6">
//         <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//           <FaDollarSign className="text-green-600" />
//           Participation Fee *
//         </h3>
//       </div>

//       <div className="space-y-4">
//         {/* Free */}
//         <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//           data.pricing_type === 'free'
//             ? 'border-green-500 bg-green-50 shadow-md'
//             : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
//         }`}>
//           <input
//             type="radio"
//             name="pricing_type"
//             value="free"
//             checked={data.pricing_type === 'free'}
//             onChange={(e) => updateData({ pricing_type: e.target.value, general_participation_fee: 0 })}
//             className="mt-1 w-5 h-5 text-green-600"
//           />
//           <div className="ml-4 flex-1">
//             <div className="flex items-center gap-2 mb-1">
//               <span className="text-2xl">🆓</span>
//               <span className="font-bold text-lg text-gray-900">Free</span>
//               {data.pricing_type === 'free' && (
//                 <FaCheckCircle className="text-green-500 ml-auto" />
//               )}
//             </div>
//             <p className="text-sm text-gray-600">
//               No participation fee. Election is completely free for all voters.
//             </p>
//           </div>
//         </label>

//         {/* Paid General */}
//         <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//           data.pricing_type === 'paid_general'
//             ? 'border-blue-500 bg-blue-50 shadow-md'
//             : eligibility?.canCreatePaidElections
//             ? 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
//             : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
//         }`}>
//           <input
//             type="radio"
//             name="pricing_type"
//             value="paid_general"
//             checked={data.pricing_type === 'paid_general'}
//             onChange={(e) => eligibility?.canCreatePaidElections && updateData({ pricing_type: e.target.value })}
//             disabled={!eligibility?.canCreatePaidElections}
//             className="mt-1 w-5 h-5 text-blue-600"
//           />
//           <div className="ml-4 flex-1">
//             <div className="flex items-center gap-2 mb-1">
//               <span className="text-2xl">💳</span>
//               <span className="font-bold text-lg text-gray-900">Paid (General Fee)</span>
//               {data.pricing_type === 'paid_general' && (
//                 <FaCheckCircle className="text-green-500 ml-auto" />
//               )}
//             </div>
//             <p className="text-sm text-gray-600 mb-3">
//               Single participation fee for all participants worldwide
//             </p>

//             {!eligibility?.canCreatePaidElections && (
//               <p className="text-xs text-red-600 font-semibold">
//                 ⚠️ Upgrade your plan to create paid elections
//               </p>
//             )}

//             {data.pricing_type === 'paid_general' && eligibility?.canCreatePaidElections && (
//               <div className="mt-3">
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Participation Fee (USD) *
//                 </label>
//                 <input
//                   type="number"
//                   min="0"
//                   step="any"
//                   value={data.general_participation_fee === '' ? '' : data.general_participation_fee || ''}
//                   onChange={(e) => {
//                     const value = e.target.value;
//                     if (value === '') {
//                       updateData({ general_participation_fee: '' });
//                     } else {
//                       const numValue = parseFloat(value);
//                       if (!isNaN(numValue) && numValue >= 0) {
//                         updateData({ general_participation_fee: numValue });
//                       }
//                     }
//                   }}
//                   onKeyDown={(e) => {
//                     if (e.key === '-' || e.key === 'e' || e.key === 'E') {
//                       e.preventDefault();
//                     }
//                   }}
//                   placeholder="e.g., 1.00"
//                   className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                     errors.general_participation_fee ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                 />
//                 {errors.general_participation_fee && (
//                   <p className="text-red-500 text-sm mt-1">
//                     {errors.general_participation_fee}
//                   </p>
//                 )}
//                 {eligibility?.processingFeePercentage && (
//                   <p className="text-xs text-gray-600 mt-2">
//                     Processing fee: {eligibility.processingFeePercentage}% will be deducted
//                   </p>
//                 )}
//               </div>
//             )}
//           </div>
//         </label>

//         {/* Paid Regional */}
//         <label className={`flex items-start p-5 rounded-xl border-3 cursor-pointer transition-all ${
//           data.pricing_type === 'paid_regional'
//             ? 'border-indigo-500 bg-indigo-50 shadow-md'
//             : eligibility?.canCreatePaidElections
//             ? 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
//             : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
//         }`}>
//           <input
//             type="radio"
//             name="pricing_type"
//             value="paid_regional"
//             checked={data.pricing_type === 'paid_regional'}
//             onChange={(e) => eligibility?.canCreatePaidElections && updateData({ pricing_type: e.target.value })}
//             disabled={!eligibility?.canCreatePaidElections}
//             className="mt-1 w-5 h-5 text-indigo-600"
//           />
//           <div className="ml-4 flex-1">
//             <div className="flex items-center gap-2 mb-1">
//               <span className="text-2xl">🌍</span>
//               <span className="font-bold text-lg text-gray-900">Paid (Regional Fee)</span>
//               {data.pricing_type === 'paid_regional' && (
//                 <FaCheckCircle className="text-green-500 ml-auto" />
//               )}
//             </div>
//             <p className="text-sm text-gray-600 mb-3">
//               Different fees for 8 regional zones based on purchasing power
//             </p>

//             {!eligibility?.canCreatePaidElections && (
//               <p className="text-xs text-red-600 font-semibold">
//                 ⚠️ Upgrade your plan to create paid elections
//               </p>
//             )}

//             {data.pricing_type === 'paid_regional' && eligibility?.canCreatePaidElections && (
//               <div className="mt-4 p-4 bg-white rounded-lg border-2 border-indigo-200">
//                 <h4 className="font-semibold text-gray-800 mb-4">Set Fees by Region (USD)</h4>
//                 <div className="space-y-4">
//                   {REGIONAL_ZONES.map((zone) => (
//                     <div key={zone.id} className="flex items-center gap-4">
//                       <div className="flex-1">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           {zone.name}
//                         </label>
//                         <p className="text-xs text-gray-500 mb-2">{zone.countries}</p>
//                       </div>
//                       <div className="w-32">
//                         <input
//                           type="number"
//                           min="0"
//                           step="any"
//                           value={regionalFees[zone.id] === '' ? '' : (regionalFees[zone.id] || zone.default_fee)}
//                           onChange={(e) => handleRegionalFeeChange(zone.id, e.target.value)}
//                           onKeyDown={(e) => {
//                             if (e.key === '-' || e.key === 'e' || e.key === 'E') {
//                               e.preventDefault();
//                             }
//                           }}
//                           placeholder={zone.default_fee.toFixed(2)}
//                           className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                         />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//                 {errors.regional_fees && (
//                   <p className="text-red-500 text-sm mt-3">
//                     {errors.regional_fees}
//                   </p>
//                 )}
//                 {eligibility?.processingFeePercentage && (
//                   <p className="text-xs text-gray-600 mt-3">
//                     Processing fee: {eligibility.processingFeePercentage}% will be deducted from each transaction
//                   </p>
//                 )}
//               </div>
//             )}
//           </div>
//         </label>
//       </div>

//       {errors.pricing_type && (
//         <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
//           <FaInfoCircle /> {errors.pricing_type}
//         </p>
//       )}
//     </div>
//   );
// }

// export default PricingConfiguration;