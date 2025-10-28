import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Election creation flow
  currentStep: 1,
  totalSteps: 4,
  
  // Draft election data
  draftElection: {
    title: '',
    description: '',
    creator_type: 'individual', // individual, organization, content_creator
    organization_id: null,
    
    // Media
    topic_image: null,
    topic_video: null,
    logo: null,
    
    // Scheduling
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    
    // Voting configuration
    voting_type: 'plurality', // plurality, ranked_choice, approval
    voting_body_content: '',
    
    // Access control
    permission_type: 'public', // public, country_specific, organization_only
    allowed_countries: [],
    
    // Pricing
    is_free: true,
    pricing_type: 'free', // free, general_fee, regional_fee
    general_participation_fee: 0,
    processing_fee_percentage: 0,
    regional_pricing: [],
    
    // Authentication
    biometric_required: false,
    authentication_methods: ['passkey'],
    
    // Branding
    custom_url: '',
    corporate_style: {},
    
    // Settings
    show_live_results: false,
    vote_editing_allowed: false,
    
    // Questions
    questions: []
  },
  
  // User's elections
  myElections: [],
  publicElections: [],
  currentElection: null,
  
  // Eligibility check
  eligibility: {
    canCreate: false,
    subscriptionType: 'Free',
    currentElectionsCount: 0,
    maxElections: 5,
    remainingElections: 5,
    canCreatePaidElections: false,
    processingFeePercentage: 0,
    message: ''
  },
  
  // UI state
  loading: false,
  error: null,
  success: null
};

const electionSlice = createSlice({
  name: 'election',
  initialState,
  reducers: {
    // Step navigation
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    nextStep: (state) => {
      if (state.currentStep < state.totalSteps) {
        state.currentStep += 1;
      }
    },
    previousStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },
    
    // Draft management
    updateDraftField: (state, action) => {
      const { field, value } = action.payload;
      state.draftElection[field] = value;
    },
    
    updateDraftElection: (state, action) => {
      state.draftElection = {
        ...state.draftElection,
        ...action.payload
      };
    },
    
    resetDraft: (state) => {
      state.draftElection = initialState.draftElection;
      state.currentStep = 1;
    },
    
    // Questions management
    addQuestion: (state, action) => {
      state.draftElection.questions.push({
        id: Date.now(),
        question_text: '',
        question_type: 'multiple_choice',
        question_order: state.draftElection.questions.length + 1,
        is_required: true,
        max_selections: 1,
        options: [],
        ...action.payload
      });
    },
    
    updateQuestion: (state, action) => {
      const { questionId, data } = action.payload;
      const questionIndex = state.draftElection.questions.findIndex(q => q.id === questionId);
      if (questionIndex !== -1) {
        state.draftElection.questions[questionIndex] = {
          ...state.draftElection.questions[questionIndex],
          ...data
        };
      }
    },
    
    removeQuestion: (state, action) => {
      state.draftElection.questions = state.draftElection.questions.filter(
        q => q.id !== action.payload
      );
    },
    
    addOption: (state, action) => {
      const { questionId, option } = action.payload;
      const questionIndex = state.draftElection.questions.findIndex(q => q.id === questionId);
      if (questionIndex !== -1) {
        state.draftElection.questions[questionIndex].options.push({
          id: Date.now(),
          option_text: '',
          option_order: state.draftElection.questions[questionIndex].options.length + 1,
          ...option
        });
      }
    },
    
    updateOption: (state, action) => {
      const { questionId, optionId, data } = action.payload;
      const questionIndex = state.draftElection.questions.findIndex(q => q.id === questionId);
      if (questionIndex !== -1) {
        const optionIndex = state.draftElection.questions[questionIndex].options.findIndex(
          o => o.id === optionId
        );
        if (optionIndex !== -1) {
          state.draftElection.questions[questionIndex].options[optionIndex] = {
            ...state.draftElection.questions[questionIndex].options[optionIndex],
            ...data
          };
        }
      }
    },
    
    removeOption: (state, action) => {
      const { questionId, optionId } = action.payload;
      const questionIndex = state.draftElection.questions.findIndex(q => q.id === questionId);
      if (questionIndex !== -1) {
        state.draftElection.questions[questionIndex].options = 
          state.draftElection.questions[questionIndex].options.filter(o => o.id !== optionId);
      }
    },
    
    // Regional pricing
    addRegionalPricing: (state, action) => {
      state.draftElection.regional_pricing.push(action.payload);
    },
    
    updateRegionalPricing: (state, action) => {
      const { region_code, data } = action.payload;
      const index = state.draftElection.regional_pricing.findIndex(
        r => r.region_code === region_code
      );
      if (index !== -1) {
        state.draftElection.regional_pricing[index] = {
          ...state.draftElection.regional_pricing[index],
          ...data
        };
      }
    },
    
    removeRegionalPricing: (state, action) => {
      state.draftElection.regional_pricing = state.draftElection.regional_pricing.filter(
        r => r.region_code !== action.payload
      );
    },
    
    // Eligibility
    setEligibility: (state, action) => {
      state.eligibility = action.payload;
    },
    
    // Elections lists
    setMyElections: (state, action) => {
      state.myElections = action.payload;
    },
    
    setPublicElections: (state, action) => {
      state.publicElections = action.payload;
    },
    
    setCurrentElection: (state, action) => {
      state.currentElection = action.payload;
    },
    
    // UI state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    setSuccess: (state, action) => {
      state.success = action.payload;
      state.loading = false;
    },
    
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    }
  }
});

export const {
  setCurrentStep,
  nextStep,
  previousStep,
  updateDraftField,
  updateDraftElection,
  resetDraft,
  addQuestion,
  updateQuestion,
  removeQuestion,
  addOption,
  updateOption,
  removeOption,
  addRegionalPricing,
  updateRegionalPricing,
  removeRegionalPricing,
  setEligibility,
  setMyElections,
  setPublicElections,
  setCurrentElection,
  setLoading,
  setError,
  setSuccess,
  clearMessages
} = electionSlice.actions;

export default electionSlice.reducer;