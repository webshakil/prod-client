//after step-2 modification - FIXED WITH CORRECT VIDEO WATCH FIELDS
import React, { useState } from 'react';
import { FaTimes, FaCheck, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import Step1BasicInfo from './Step1BasicInfo';
import Step2Configuration from './Step2Configuration';
import Step3Questions from './Step3Questions';
import Step4Preview from './Step4Preview';

export default function ElectionWizard({ creatorType, onClose, eligibility }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [electionId, setElectionId] = useState(null);
  
  // ✅ FIX: Map creatorType to match database values
  const mapCreatorType = (type) => {
    if (type === 'ContentCreator' || type === 'contentCreator' || type === 'content_creator') return 'content_creator';
    if (type === 'Organization' || type === 'organization') return 'organization';
    return 'individual';
  };
  
  const [electionData, setElectionData] = useState({
    // Step 1: Basic Info
    title: '',
    description: '',
    topic_image: null,
    topic_video: null,
    topic_video_url: '',
    logo: null,
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    creator_type: mapCreatorType(creatorType) || 'individual',
    
    // ✅ FIXED: Video Watch Fields - Correct field names matching backend
    video_watch_required: false,
    minimum_watch_time: 0,        // in seconds
    minimum_watch_percentage: 0,  // percentage 0-100
    
    // Step 2: Configuration
    category_id: null,
    voting_type: 'plurality',
    permission_type: 'public',
    allowed_countries: [],
    allowed_group_members: [],
    group_member_input: '',
    is_free: true,
    pricing_type: 'free',
    general_participation_fee: 0,
    processing_fee_percentage: 0,  // ✅ Added this
    regional_fees: {},
    biometric_required: false,
    authentication_methods: ['passkey'],
    show_live_results: false,
    vote_editing_allowed: false,
    anonymous_voting_enabled: false,  // ⭐ NEW: ADDED LINE 47 ⭐
    
    // Step 2: Lottery
    lottery_enabled: false,
    lottery_config: {
      prize_funding_source: 'creator_funded',
      reward_type: 'monetary',
      total_prize_pool: 0,
      winner_count: 1,
      prize_description: '',
      estimated_value: 0,
      projected_revenue: 0,
      revenue_share_percentage: 0,
      prize_distribution: [], // ✅ Array of {rank, percentage}
      non_monetary_prizes: [] // ✅ Array of {rank, prize_description, prize_value}
    },
    
    // Step 2: Preview toggles
    show_participation_fee_in_preview: true,
    show_lottery_prizes_in_preview: true,
    
    // Step 3: Questions & Auth & Slug
    questions: [],
    election_slug: '',
    auth_method: 'passkey' // ✅ Added this for Step3
  });

  const steps = [
    { number: 1, title: 'Basic Info', icon: '📋' },
    { number: 2, title: 'Configuration', icon: '⚙️' },
    { number: 3, title: 'Questions', icon: '❓' },
    { number: 4, title: 'Review & Publish', icon: '🚀' }
  ];

  const updateElectionData = (updates) => {
    setElectionData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleClose = () => {
    if (window.confirm('Are you sure you want to close? All unsaved changes will be lost.')) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold">Create New Election</h1>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center justify-between mt-6">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all ${
                        currentStep >= step.number
                          ? 'bg-white text-blue-600 shadow-lg scale-110'
                          : 'bg-blue-500 bg-opacity-50 text-white'
                      }`}
                    >
                      {currentStep > step.number ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium ${
                        currentStep >= step.number ? 'text-white' : 'text-blue-200'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded transition-all ${
                        currentStep > step.number
                          ? 'bg-white shadow-md'
                          : 'bg-blue-500 bg-opacity-30'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="p-8">
            {currentStep === 1 && (
              <Step1BasicInfo
                data={electionData}
                updateData={updateElectionData}
                onNext={handleNext}
                creatorType={creatorType}
                setElectionId={setElectionId}
              />
            )}
            
            {currentStep === 2 && (
              <Step2Configuration
                data={electionData}
                updateData={updateElectionData}
                onNext={handleNext}
                onBack={handleBack}
                eligibility={eligibility}
              />
            )}
            
            {currentStep === 3 && (
              <Step3Questions
                data={electionData}
                updateData={updateElectionData}
                onNext={handleNext}
                onBack={handleBack}
                electionTitle={electionData.title}
              />
            )}
            
            {currentStep === 4 && (
              <Step4Preview
                data={electionData}
                onBack={handleBack}
                onPublish={onClose}
                electionId={electionId}
                eligibility={eligibility}
              />
            )}
          </div>

          {/* Footer with Navigation - Only show for steps 1-3, Step 4 has its own buttons */}
          {currentStep < 4 && (
            <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl flex justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  currentStep === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
                }`}
              >
                <FaArrowLeft />
                Back
              </button>

              {/* Note: Each step has its own Continue button with validation */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
//last workable codes. just to add anonymous voting above code
// //after step-2 modification - FIXED WITH CORRECT VIDEO WATCH FIELDS
// import React, { useState } from 'react';
// import { FaTimes, FaCheck, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
// import Step1BasicInfo from './Step1BasicInfo';
// import Step2Configuration from './Step2Configuration';
// import Step3Questions from './Step3Questions';
// import Step4Preview from './Step4Preview';

// export default function ElectionWizard({ creatorType, onClose, eligibility }) {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [electionId, setElectionId] = useState(null);
  
//   // ✅ FIX: Map creatorType to match database values
//   const mapCreatorType = (type) => {
//     if (type === 'ContentCreator' || type === 'contentCreator' || type === 'content_creator') return 'content_creator';
//     if (type === 'Organization' || type === 'organization') return 'organization';
//     return 'individual';
//   };
  
//   const [electionData, setElectionData] = useState({
//     // Step 1: Basic Info
//     title: '',
//     description: '',
//     topic_image: null,
//     topic_video: null,
//     topic_video_url: '',
//     logo: null,
//     start_date: '',
//     start_time: '',
//     end_date: '',
//     end_time: '',
//     timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//     creator_type: mapCreatorType(creatorType) || 'individual',
    
//     // ✅ FIXED: Video Watch Fields - Correct field names matching backend
//     video_watch_required: false,
//     minimum_watch_time: 0,        // in seconds
//     minimum_watch_percentage: 0,  // percentage 0-100
    
//     // Step 2: Configuration
//     category_id: null,
//     voting_type: 'plurality',
//     permission_type: 'public',
//     allowed_countries: [],
//     allowed_group_members: [],
//     group_member_input: '',
//     is_free: true,
//     pricing_type: 'free',
//     general_participation_fee: 0,
//     processing_fee_percentage: 0,  // ✅ Added this
//     regional_fees: {},
//     biometric_required: false,
//     authentication_methods: ['passkey'],
//     show_live_results: false,
//     vote_editing_allowed: false,
    
//     // Step 2: Lottery
//     lottery_enabled: false,
//     lottery_config: {
//       prize_funding_source: 'creator_funded',
//       reward_type: 'monetary',
//       total_prize_pool: 0,
//       winner_count: 1,
//       prize_description: '',
//       estimated_value: 0,
//       projected_revenue: 0,
//       revenue_share_percentage: 0,
//       prize_distribution: [], // ✅ Array of {rank, percentage}
//       non_monetary_prizes: [] // ✅ Array of {rank, prize_description, prize_value}
//     },
    
//     // Step 2: Preview toggles
//     show_participation_fee_in_preview: true,
//     show_lottery_prizes_in_preview: true,
    
//     // Step 3: Questions & Auth & Slug
//     questions: [],
//     election_slug: '',
//     auth_method: 'passkey' // ✅ Added this for Step3
//   });

//   const steps = [
//     { number: 1, title: 'Basic Info', icon: '📋' },
//     { number: 2, title: 'Configuration', icon: '⚙️' },
//     { number: 3, title: 'Questions', icon: '❓' },
//     { number: 4, title: 'Review & Publish', icon: '🚀' }
//   ];

//   const updateElectionData = (updates) => {
//     setElectionData(prev => ({ ...prev, ...updates }));
//   };

//   const handleNext = () => {
//     if (currentStep < 4) {
//       setCurrentStep(currentStep + 1);
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//   };

//   const handleBack = () => {
//     if (currentStep > 1) {
//       setCurrentStep(currentStep - 1);
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//   };

//   const handleClose = () => {
//     if (window.confirm('Are you sure you want to close? All unsaved changes will be lost.')) {
//       onClose();
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 overflow-y-auto">
//       <div className="min-h-screen py-8 px-4">
//         <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl">
//           {/* Header */}
//           <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl p-6">
//             <div className="flex justify-between items-center mb-4">
//               <h1 className="text-3xl font-bold">Create New Election</h1>
//               <button
//                 onClick={handleClose}
//                 className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
//               >
//                 <FaTimes className="text-2xl" />
//               </button>
//             </div>
            
//             {/* Progress Steps */}
//             <div className="flex items-center justify-between mt-6">
//               {steps.map((step, index) => (
//                 <React.Fragment key={step.number}>
//                   <div className="flex flex-col items-center flex-1">
//                     <div
//                       className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all ${
//                         currentStep >= step.number
//                           ? 'bg-white text-blue-600 shadow-lg scale-110'
//                           : 'bg-blue-500 bg-opacity-50 text-white'
//                       }`}
//                     >
//                       {currentStep > step.number ? (
//                         <FaCheck className="text-green-500" />
//                       ) : (
//                         step.icon
//                       )}
//                     </div>
//                     <span
//                       className={`mt-2 text-sm font-medium ${
//                         currentStep >= step.number ? 'text-white' : 'text-blue-200'
//                       }`}
//                     >
//                       {step.title}
//                     </span>
//                   </div>
//                   {index < steps.length - 1 && (
//                     <div
//                       className={`flex-1 h-1 mx-2 rounded transition-all ${
//                         currentStep > step.number
//                           ? 'bg-white shadow-md'
//                           : 'bg-blue-500 bg-opacity-30'
//                       }`}
//                     />
//                   )}
//                 </React.Fragment>
//               ))}
//             </div>
//           </div>

//           {/* Step Content */}
//           <div className="p-8">
//             {currentStep === 1 && (
//               <Step1BasicInfo
//                 data={electionData}
//                 updateData={updateElectionData}
//                 onNext={handleNext}
//                 creatorType={creatorType}
//                 setElectionId={setElectionId}
//               />
//             )}
            
//             {currentStep === 2 && (
//               <Step2Configuration
//                 data={electionData}
//                 updateData={updateElectionData}
//                 onNext={handleNext}
//                 onBack={handleBack}
//                 eligibility={eligibility}
//               />
//             )}
            
//             {currentStep === 3 && (
//               <Step3Questions
//                 data={electionData}
//                 updateData={updateElectionData}
//                 onNext={handleNext}
//                 onBack={handleBack}
//                 electionTitle={electionData.title}
//               />
//             )}
            
//             {currentStep === 4 && (
//               <Step4Preview
//                 data={electionData}
//                 onBack={handleBack}
//                 onPublish={onClose}
//                 electionId={electionId}
//                 eligibility={eligibility}
//               />
//             )}
//           </div>

//           {/* Footer with Navigation - Only show for steps 1-3, Step 4 has its own buttons */}
//           {currentStep < 4 && (
//             <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl flex justify-between">
//               <button
//                 onClick={handleBack}
//                 disabled={currentStep === 1}
//                 className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
//                   currentStep === 1
//                     ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
//                     : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
//                 }`}
//               >
//                 <FaArrowLeft />
//                 Back
//               </button>

//               {/* Note: Each step has its own Continue button with validation */}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }




