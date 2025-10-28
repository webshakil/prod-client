import React, { useState } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import Step1BasicInfo from './Step1BasicInfo';
import Step2Configuration from './Step2Configuration';
import Step3Questions from './Step3Questions';
import Step4Review from './Step4Review';

export default function ElectionWizard({ creatorType, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [electionData, setElectionData] = useState({
    // Step 1: Basic Info
    title: '',
    description: '',
    creator_type: creatorType,
    organization_id: null,
    topic_image: null,
    topic_video: null,
    logo: null,
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    custom_url: '',
    
    // Step 2: Configuration
    voting_type: 'plurality',
    voting_body_content: '',
    permission_type: 'public',
    allowed_countries: [],
    is_free: true,
    pricing_type: 'free',
    general_participation_fee: 0,
    processing_fee_percentage: 0,
    regional_pricing: [],
    biometric_required: false,
    authentication_methods: ['passkey'],
    corporate_style: {},
    show_live_results: false,
    vote_editing_allowed: false,
    
    // Step 3: Questions
    questions: []
  });
  
  const totalSteps = 4;
  const steps = [
    { number: 1, title: 'Basic Info', icon: '📋' },
    { number: 2, title: 'Configuration', icon: '⚙️' },
    { number: 3, title: 'Questions', icon: '❓' },
    { number: 4, title: 'Review', icon: '✅' }
  ];
  
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleStepClick = (stepNumber) => {
    setCurrentStep(stepNumber);
  };
  
  const updateElectionData = (updates) => {
    setElectionData(prev => ({ ...prev, ...updates }));
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create New Election
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Creator Type: <span className="font-semibold capitalize">{creatorType}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-red-600 transition p-2"
              title="Close Wizard"
            >
              <FaTimes className="text-2xl" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress Steps */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                {/* Step */}
                <div 
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() => handleStepClick(step.number)}
                >
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all
                    ${currentStep === step.number 
                      ? 'bg-blue-600 text-white shadow-lg scale-110' 
                      : currentStep > step.number
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600 group-hover:bg-gray-300'
                    }
                  `}>
                    {currentStep > step.number ? (
                      <FaCheck />
                    ) : (
                      <span>{step.icon}</span>
                    )}
                  </div>
                  <span className={`
                    text-xs mt-2 font-medium
                    ${currentStep === step.number 
                      ? 'text-blue-600' 
                      : currentStep > step.number
                      ? 'text-green-600'
                      : 'text-gray-500'
                    }
                  `}>
                    Step {step.number}
                  </span>
                  <span className={`
                    text-sm font-semibold
                    ${currentStep === step.number 
                      ? 'text-blue-600' 
                      : 'text-gray-700'
                    }
                  `}>
                    {step.title}
                  </span>
                </div>
                
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-4">
                    <div className={`
                      h-1 rounded transition-all
                      ${currentStep > step.number 
                        ? 'bg-green-500' 
                        : 'bg-gray-200'
                      }
                    `} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      
      {/* Step Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {currentStep === 1 && (
            <Step1BasicInfo 
              data={electionData}
              updateData={updateElectionData}
              onNext={handleNext}
              onClose={onClose}
            />
          )}
          
          {currentStep === 2 && (
            <Step2Configuration 
              data={electionData}
              updateData={updateElectionData}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}
          
          {currentStep === 3 && (
            <Step3Questions 
              data={electionData}
              updateData={updateElectionData}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}
          
          {currentStep === 4 && (
            <Step4Review 
              data={electionData}
              onPrevious={handlePrevious}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}