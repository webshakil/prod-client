import React from 'react';
import { useAppDispatch } from '../../../../redux/hooks'; // ✅ Changed
import { setSelectedPlan, setCheckoutStep } from '../../../../redux/slices/subscriptionSlice';
import { Check } from 'lucide-react';

const PlanCard = ({ plan }) => {
  const dispatch = useAppDispatch(); // ✅ Changed

  const handleSelectPlan = () => {
    dispatch(setSelectedPlan(plan));
    dispatch(setCheckoutStep('gateway-selection'));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
        <h3 className="text-2xl font-bold">{plan.name}</h3>
        <p className="text-blue-100 mt-2 capitalize">{plan.type} Plan</p>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
            <span className="text-gray-600 ml-2">/{plan.duration}</span>
          </div>
          <p className="text-gray-500 text-sm mt-2">Billed {plan.duration}</p>
        </div>

        {/* Description */}
        {plan.description && (
          <p className="text-gray-700 mb-6 text-sm">{plan.description}</p>
        )}

        {/* Features */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-gray-700">
            <span className="text-green-500 mr-3">
              <Check size={20} />
            </span>
            <span>
              {plan.max_elections === -1 || plan.max_elections === null
                ? 'Unlimited'
                : plan.max_elections}{' '}
              Elections
            </span>
          </div>
          <div className="flex items-center text-gray-700">
            <span className="text-green-500 mr-3">
              <Check size={20} />
            </span>
            <span>
              {plan.max_voters_per_election === -1 || plan.max_voters_per_election === null
                ? 'Unlimited'
                : plan.max_voters_per_election}{' '}
              Voters per Election
            </span>
          </div>
          <div className="flex items-center text-gray-700">
            <span className={plan.participation_fee_required ? 'text-orange-500 mr-3' : 'text-green-500 mr-3'}>
              {plan.participation_fee_required ? '⚠️' : <Check size={20} />}
            </span>
            <span>
              Participation Fee:{' '}
              {plan.participation_fee_required
                ? `${plan.participation_fee_percentage}% (Optional)`
                : 'Not Required'}
            </span>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={handleSelectPlan}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
        >
          Choose Plan
        </button>
      </div>
    </div>
  );
};

export default PlanCard;
// import React from 'react';
// import { useAppDispatch } from '../../../../redux/hooks';
// import { setSelectedPlan, setCheckoutStep } from '../../../../redux/slices/subscriptionSlice';
// import { Check } from 'lucide-react';

// const PlanCard = ({ plan }) => {
//   const dispatch = useAppDispatch();

//   const handleSelectPlan = () => {
//     dispatch(setSelectedPlan(plan));
//     dispatch(setCheckoutStep('gateway-selection'));
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
//         <h3 className="text-2xl font-bold">{plan.name}</h3>
//         <p className="text-blue-100 mt-2 capitalize">{plan.type} Plan</p>
//       </div>

//       {/* Content */}
//       <div className="p-6">
//         {/* Price */}
//         <div className="mb-6">
//           <div className="flex items-baseline">
//             <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
//             <span className="text-gray-600 ml-2">/{plan.duration}</span>
//           </div>
//           <p className="text-gray-500 text-sm mt-2">Billed {plan.duration}</p>
//         </div>

//         {/* Description */}
//         {plan.description && (
//           <p className="text-gray-700 mb-6 text-sm">{plan.description}</p>
//         )}

//         {/* Features */}
//         <div className="space-y-3 mb-6">
//           <div className="flex items-center text-gray-700">
//             <span className="text-green-500 mr-3">
//               <Check size={20} />
//             </span>
//             <span>
//               {plan.max_elections === -1 || plan.max_elections === null
//                 ? 'Unlimited'
//                 : plan.max_elections}{' '}
//               Elections
//             </span>
//           </div>
//           <div className="flex items-center text-gray-700">
//             <span className="text-green-500 mr-3">
//               <Check size={20} />
//             </span>
//             <span>
//               {plan.max_voters_per_election === -1 || plan.max_voters_per_election === null
//                 ? 'Unlimited'
//                 : plan.max_voters_per_election}{' '}
//               Voters per Election
//             </span>
//           </div>
//           <div className="flex items-center text-gray-700">
//             <span className={plan.participation_fee_required ? 'text-orange-500 mr-3' : 'text-green-500 mr-3'}>
//               {plan.participation_fee_required ? '⚠️' : <Check size={20} />}
//             </span>
//             <span>
//               Participation Fee:{' '}
//               {plan.participation_fee_required
//                 ? `${plan.participation_fee_percentage}% (Optional)`
//                 : 'Not Required'}
//             </span>
//           </div>
//         </div>

//         {/* Button */}
//         <button
//           onClick={handleSelectPlan}
//           className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
//         >
//           Choose Plan
//         </button>
//       </div>
//     </div>
//   );
// };

// export default PlanCard;