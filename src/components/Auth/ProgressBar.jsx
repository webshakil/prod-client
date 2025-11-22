import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ProgressBar({ currentStep, totalSteps }) {
  const { t } = useTranslation();
  
  const steps = [
    t('progressBar.userCheck'),
    t('progressBar.email'),
    t('progressBar.phone'),
    t('progressBar.details'),
    t('progressBar.biometric'),
    t('progressBar.security'),
    t('progressBar.complete'),
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 mb-8">
      <div className="flex justify-between items-center">
        {steps.slice(0, totalSteps).map((step, index) => (
          <div key={index} className="flex items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                index + 1 <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {index + 1 <= currentStep ? '✓' : index + 1}
            </div>
            <div
              className={`flex-1 h-1 mx-2 ${
                index + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          </div>
        ))}
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold bg-gray-300 text-gray-600">
          {totalSteps}
        </div>
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-600">
        {steps.slice(0, totalSteps).map((step, index) => (
          <span key={index} className="text-center flex-1">
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}
// import React from 'react';

// export default function ProgressBar({ currentStep, totalSteps }) {
//   const steps = [
//     'User Check',
//     'Email',
//     'Phone',
//     'Details',
//     'Biometric',
//     'Security',
//     'Complete',
//   ];

//   return (
//     <div className="max-w-4xl mx-auto px-6 mb-8">
//       <div className="flex justify-between items-center">
//         {steps.slice(0, totalSteps).map((step, index) => (
//           <div key={index} className="flex items-center flex-1">
//             <div
//               className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
//                 index + 1 <= currentStep
//                   ? 'bg-blue-600 text-white'
//                   : 'bg-gray-300 text-gray-600'
//               }`}
//             >
//               {index + 1 <= currentStep ? '✓' : index + 1}
//             </div>
//             <div
//               className={`flex-1 h-1 mx-2 ${
//                 index + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-300'
//               }`}
//             />
//           </div>
//         ))}
//         <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold bg-gray-300 text-gray-600">
//           {totalSteps}
//         </div>
//       </div>
//       <div className="flex justify-between mt-2 text-xs text-gray-600">
//         {steps.slice(0, totalSteps).map((step, index) => (
//           <span key={index} className="text-center flex-1">
//             {step}
//           </span>
//         ))}
//       </div>
//     </div>
//   );
// }