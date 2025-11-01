// src/redux/slices/electionSlice.js - COMPLETE VERSION
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Current election being created/edited
  currentElection: {
    draftId: null,
    step1Data: {},
    step2Data: {},
    step3Data: {},
    completedSteps: [],
    currentStep: 1,
  },

  // ✅ COMPLETE election data for viewing/editing
  selectedElectionDetails: null,
  selectedElectionQuestions: [],
  selectedElectionRegionalPricing: [],
  selectedElectionLotteryConfig: null,

  // Draft management
  drafts: [],
  selectedDraft: null,

  // ✅ ALL ELECTIONS WITH COMPLETE DATA (including regional_pricing, questions, lottery_config)
  myElections: [],
  publicElections: [],
  
  // Timestamp for cache management
  myElectionsLastUpdate: null,
  publicElectionsLastUpdate: null,

  // UI State
  currentStep: 1,
  isCreating: false,
  isPublishing: false,
  isSaving: false,
  
  // Loading & Errors
  loading: false,
  error: null,
  successMessage: null,
  validationErrors: {},
};

export const electionSlice = createSlice({
  name: 'election',
  initialState,
  reducers: {
    // ============================================
    // SELECTED ELECTION DETAILS (For viewing single election)
    // ============================================
    
    setSelectedElectionDetails: (state, action) => {
      const electionData = action.payload;
      
      // ✅ Store COMPLETE election data (everything from API)
      state.selectedElectionDetails = electionData;

      // ✅ Also extract into separate arrays for convenience
      if (electionData.questions && Array.isArray(electionData.questions)) {
        state.selectedElectionQuestions = electionData.questions;
      }

      if (electionData.regional_pricing && Array.isArray(electionData.regional_pricing)) {
        state.selectedElectionRegionalPricing = electionData.regional_pricing;
      }

      if (electionData.lottery_config) {
        state.selectedElectionLotteryConfig = electionData.lottery_config;
      }
      
      console.log('✅ [Redux] selectedElectionDetails updated:', {
        id: electionData.id,
        title: electionData.title,
        hasQuestions: !!electionData.questions,
        hasRegionalPricing: !!electionData.regional_pricing,
        hasLottery: !!electionData.lottery_config
      });
    },

    setSelectedElectionQuestions: (state, action) => {
      state.selectedElectionQuestions = action.payload;
    },

    clearSelectedElectionDetails: (state) => {
      state.selectedElectionDetails = null;
      state.selectedElectionQuestions = [];
      state.selectedElectionRegionalPricing = [];
      state.selectedElectionLotteryConfig = null;
    },

    updateSelectedElectionVoteCount: (state, action) => {
      if (state.selectedElectionDetails) {
        state.selectedElectionDetails.vote_count = action.payload;
      }
    },

    updateSelectedElectionViewCount: (state, action) => {
      if (state.selectedElectionDetails) {
        state.selectedElectionDetails.view_count = action.payload;
      }
    },

    // ============================================
    // ELECTIONS LIST (Store COMPLETE data, not just basic info)
    // ============================================

    setMyElections: (state, action) => {
      // ✅ Store COMPLETE election objects with ALL fields
      state.myElections = action.payload;
      state.myElectionsLastUpdate = Date.now();
      
      console.log('✅ [Redux] myElections updated:', {
        count: action.payload.length,
        firstElection: action.payload[0] ? {
          id: action.payload[0].id,
          title: action.payload[0].title,
          hasQuestions: !!action.payload[0].questions,
          hasRegionalPricing: !!action.payload[0].regional_pricing,
          hasLottery: !!action.payload[0].lottery_config,
          questionsCount: action.payload[0].questions?.length || 0,
          regionalPricingCount: action.payload[0].regional_pricing?.length || 0
        } : null
      });
    },

    setPublicElections: (state, action) => {
      // ✅ Store COMPLETE election objects
      state.publicElections = action.payload;
      state.publicElectionsLastUpdate = Date.now();
      
      console.log('✅ [Redux] publicElections updated:', action.payload.length);
    },

    addPublishedElection: (state, action) => {
      // ✅ Add COMPLETE election object
      state.myElections.unshift(action.payload);
      state.myElectionsLastUpdate = Date.now();
    },

    updateElectionInList: (state, action) => {
      const updatedElection = action.payload;
      const index = state.myElections.findIndex(e => e.id === updatedElection.id);
      if (index !== -1) {
        // ✅ Update with COMPLETE election data
        state.myElections[index] = updatedElection;
      }
      state.myElectionsLastUpdate = Date.now();
    },

    removeElectionFromList: (state, action) => {
      state.myElections = state.myElections.filter(e => e.id !== action.payload);
      state.myElectionsLastUpdate = Date.now();
    },

    // ============================================
    // WIZARD/CREATION STATE
    // ============================================

    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
      state.currentElection.currentStep = action.payload;
    },

    goToStep: (state, action) => {
      const step = action.payload;
      if (step >= 1 && step <= 4) {
        state.currentStep = step;
        state.currentElection.currentStep = step;
      }
    },

    setStep1Data: (state, action) => {
      state.currentElection.step1Data = {
        ...state.currentElection.step1Data,
        ...action.payload,
      };
      if (!state.currentElection.completedSteps.includes(1)) {
        state.currentElection.completedSteps.push(1);
      }
    },

    setStep2Data: (state, action) => {
      state.currentElection.step2Data = {
        ...state.currentElection.step2Data,
        ...action.payload,
      };
      if (!state.currentElection.completedSteps.includes(2)) {
        state.currentElection.completedSteps.push(2);
      }
    },

    setStep3Data: (state, action) => {
      state.currentElection.step3Data = {
        ...state.currentElection.step3Data,
        ...action.payload,
      };
      if (!state.currentElection.completedSteps.includes(3)) {
        state.currentElection.completedSteps.push(3);
      }
    },

    setDraftId: (state, action) => {
      state.currentElection.draftId = action.payload;
    },

    setCurrentElection: (state, action) => {
      // ✅ Store COMPLETE election data in currentElection
      state.currentElection = {
        ...state.currentElection,
        ...action.payload,
      };
      
      console.log('✅ [Redux] currentElection updated:', {
        id: action.payload.id,
        title: action.payload.title,
        hasData: !!action.payload
      });
    },

    // ============================================
    // DRAFTS
    // ============================================

    setDrafts: (state, action) => {
      state.drafts = action.payload;
    },

    addDraft: (state, action) => {
      state.drafts.unshift(action.payload);
    },

    updateDraftInList: (state, action) => {
      const index = state.drafts.findIndex(d => d.id === action.payload.id);
      if (index !== -1) {
        state.drafts[index] = action.payload;
      }
    },

    removeDraft: (state, action) => {
      state.drafts = state.drafts.filter(d => d.id !== action.payload);
    },

    setSelectedDraft: (state, action) => {
      state.selectedDraft = action.payload;
    },

    loadDraftIntoEditor: (state, action) => {
      const draft = action.payload;
      state.currentElection = {
        draftId: draft.id,
        step1Data: draft.draft_data?.step1 || {},
        step2Data: draft.draft_data?.step2 || {},
        step3Data: draft.draft_data?.step3 || {},
        completedSteps: draft.draft_data?.completed_steps || [],
        currentStep: draft.draft_data?.current_step || 1,
      };
      state.currentStep = draft.draft_data?.current_step || 1;
    },

    // ============================================
    // UI STATES
    // ============================================

    setIsCreating: (state, action) => {
      state.isCreating = action.payload;
    },

    setIsPublishing: (state, action) => {
      state.isPublishing = action.payload;
    },

    setIsSaving: (state, action) => {
      state.isSaving = action.payload;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
      console.log('🔄 [Redux] loading:', action.payload);
    },

    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
      state.isCreating = false;
      state.isPublishing = false;
      state.isSaving = false;
      console.error('❌ [Redux] error:', action.payload);
    },

    setSuccess: (state, action) => {
      state.successMessage = action.payload;
      state.error = null;
      state.loading = false;
    },

    setValidationErrors: (state, action) => {
      state.validationErrors = action.payload;
    },

    clearValidationErrors: (state) => {
      state.validationErrors = {};
    },

    clearError: (state) => {
      state.error = null;
    },

    clearSuccess: (state) => {
      state.successMessage = null;
    },

    // ============================================
    // RESET ACTIONS
    // ============================================

    resetElectionCreation: (state) => {
      state.currentElection = {
        draftId: null,
        step1Data: {},
        step2Data: {},
        step3Data: {},
        completedSteps: [],
        currentStep: 1,
      };
      state.currentStep = 1;
      state.validationErrors = {};
      state.error = null;
      state.successMessage = null;
    },

    resetElection: () => initialState,
  },
});

export const {
  // Selected election details
  setSelectedElectionDetails,
  setSelectedElectionQuestions,
  clearSelectedElectionDetails,
  updateSelectedElectionVoteCount,
  updateSelectedElectionViewCount,
  
  // Elections list
  setMyElections,
  setPublicElections,
  addPublishedElection,
  updateElectionInList,
  removeElectionFromList,
  
  // Wizard/Creation
  setCurrentStep,
  goToStep,
  setStep1Data,
  setStep2Data,
  setStep3Data,
  setDraftId,
  setCurrentElection,
  
  // Drafts
  setDrafts,
  addDraft,
  updateDraftInList,
  removeDraft,
  setSelectedDraft,
  loadDraftIntoEditor,
  
  // UI States
  setIsCreating,
  setIsPublishing,
  setIsSaving,
  setLoading,
  setError,
  setSuccess,
  setValidationErrors,
  clearValidationErrors,
  clearError,
  clearSuccess,
  
  // Reset
  resetElectionCreation,
  resetElection,
} = electionSlice.actions;

export default electionSlice.reducer;


// // src/redux/slices/electionSlice.js
// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   // Current election being created
//   currentElection: {
//     draftId: null,
//     step1Data: {},
//     step2Data: {},
//     step3Data: {},
//     completedSteps: [],
//     currentStep: 1,
//   },

//   // ✅ Detailed election data for viewing/editing (IN MEMORY ONLY - NO localStorage)
//   selectedElectionDetails: null,
//   selectedElectionQuestions: [],
//   selectedElectionRegionalPricing: [],
//   selectedElectionLotteryConfig: null,

//   // Draft management
//   drafts: [],
//   selectedDraft: null,

//   // Published elections (List view - lightweight)
//   myElections: [],
//   publicElections: [],
  
//   // ✅ Timestamp for cache invalidation
//   myElectionsLastUpdate: null,
//   publicElectionsLastUpdate: null,

//   // UI State
//   currentStep: 1,
//   isCreating: false,
//   isPublishing: false,
//   isSaving: false,
  
//   // Loading & Errors
//   loading: false,
//   error: null,
//   successMessage: null,
//   validationErrors: {},
// };

// export const electionSlice = createSlice({
//   name: 'election',
//   initialState,
//   reducers: {
//     // ============================================
//     // SELECTED ELECTION DETAILS (For viewing single election)
//     // ============================================
    
//     setSelectedElectionDetails: (state, action) => {
//       const electionData = action.payload;
      
//       // Store main election data
//       state.selectedElectionDetails = {
//         id: electionData.id,
//         title: electionData.title,
//         description: electionData.description,
//         slug: electionData.slug,
//         topic_image_url: electionData.topic_image_url,
//         topic_video_url: electionData.topic_video_url,
//         logo_url: electionData.logo_url,
//         start_date: electionData.start_date,
//         start_time: electionData.start_time,
//         end_date: electionData.end_date,
//         end_time: electionData.end_time,
//         timezone: electionData.timezone,
//         voting_type: electionData.voting_type,
//         voting_body_content: electionData.voting_body_content,
//         permission_type: electionData.permission_type,
//         allowed_countries: electionData.allowed_countries || [],
//         is_free: electionData.is_free,
//         pricing_type: electionData.pricing_type,
//         general_participation_fee: electionData.general_participation_fee,
//         processing_fee_percentage: electionData.processing_fee_percentage,
//         biometric_required: electionData.biometric_required,
//         authentication_methods: electionData.authentication_methods || [],
//         custom_url: electionData.custom_url,
//         corporate_style: electionData.corporate_style,
//         show_live_results: electionData.show_live_results,
//         vote_editing_allowed: electionData.vote_editing_allowed,
//         status: electionData.status,
//         subscription_plan_id: electionData.subscription_plan_id,
//         view_count: electionData.view_count || 0,
//         vote_count: electionData.vote_count || 0,
//         creator_id: electionData.creator_id,
//         creator_type: electionData.creator_type,
//         organization_id: electionData.organization_id,
//         created_at: electionData.created_at,
//         updated_at: electionData.updated_at,
//         published_at: electionData.published_at,
//         shareable_url: electionData.shareable_url,
//       };

//       // Store questions if available
//       if (electionData.questions && Array.isArray(electionData.questions)) {
//         state.selectedElectionQuestions = electionData.questions.map(q => ({
//           id: q.id,
//           election_id: q.election_id,
//           question_text: q.question_text,
//           question_type: q.question_type,
//           question_order: q.question_order,
//           question_image_url: q.question_image_url,
//           is_required: q.is_required,
//           max_selections: q.max_selections,
//           options: q.options || [],
//           created_at: q.created_at,
//           updated_at: q.updated_at,
//         }));
//       }

//       // Store regional pricing if available
//       if (electionData.regional_pricing && Array.isArray(electionData.regional_pricing)) {
//         state.selectedElectionRegionalPricing = electionData.regional_pricing.map(rp => ({
//           region_code: rp.region_code,
//           region_name: rp.region_name,
//           currency: rp.currency,
//           participation_fee: parseFloat(rp.participation_fee),
//         }));
//       }

//       // Store lottery config if available
//       if (electionData.lottery_config) {
//         state.selectedElectionLotteryConfig = {
//           is_lotterized: electionData.lottery_config.is_lotterized,
//           winner_count: electionData.lottery_config.winner_count,
//           prize_funding_source: electionData.lottery_config.prize_funding_source,
//           reward_type: electionData.lottery_config.reward_type,
//           reward_amount: electionData.lottery_config.reward_amount,
//           prize_description: electionData.lottery_config.prize_description,
//         };
//       }
//     },

//     setSelectedElectionQuestions: (state, action) => {
//       state.selectedElectionQuestions = action.payload.map(q => ({
//         id: q.id,
//         election_id: q.election_id,
//         question_text: q.question_text,
//         question_type: q.question_type,
//         question_order: q.question_order,
//         question_image_url: q.question_image_url,
//         is_required: q.is_required,
//         max_selections: q.max_selections,
//         options: q.options || [],
//         created_at: q.created_at,
//         updated_at: q.updated_at,
//       }));
//     },

//     clearSelectedElectionDetails: (state) => {
//       state.selectedElectionDetails = null;
//       state.selectedElectionQuestions = [];
//       state.selectedElectionRegionalPricing = [];
//       state.selectedElectionLotteryConfig = null;
//     },

//     updateSelectedElectionVoteCount: (state, action) => {
//       if (state.selectedElectionDetails) {
//         state.selectedElectionDetails.vote_count = action.payload;
//       }
//     },

//     updateSelectedElectionViewCount: (state, action) => {
//       if (state.selectedElectionDetails) {
//         state.selectedElectionDetails.view_count = action.payload;
//       }
//     },

//     // ============================================
//     // ELECTIONS LIST (Lightweight list data)
//     // ============================================

//     setMyElections: (state, action) => {
//       state.myElections = action.payload;
//       state.myElectionsLastUpdate = Date.now();
//     },

//     setPublicElections: (state, action) => {
//       state.publicElections = action.payload;
//       state.publicElectionsLastUpdate = Date.now();
//     },

//     addPublishedElection: (state, action) => {
//       state.myElections.unshift(action.payload);
//       state.myElectionsLastUpdate = Date.now();
//     },

//     updateElectionInList: (state, action) => {
//       const updatedElection = action.payload;
//       const index = state.myElections.findIndex(e => e.id === updatedElection.id);
//       if (index !== -1) {
//         state.myElections[index] = {
//           ...state.myElections[index],
//           ...updatedElection,
//         };
//       }
//       state.myElectionsLastUpdate = Date.now();
//     },

//     removeElectionFromList: (state, action) => {
//       state.myElections = state.myElections.filter(e => e.id !== action.payload);
//       state.myElectionsLastUpdate = Date.now();
//     },

//     // ============================================
//     // WIZARD/CREATION STATE
//     // ============================================

//     setCurrentStep: (state, action) => {
//       state.currentStep = action.payload;
//       state.currentElection.currentStep = action.payload;
//     },

//     goToStep: (state, action) => {
//       const step = action.payload;
//       if (step >= 1 && step <= 4) {
//         state.currentStep = step;
//         state.currentElection.currentStep = step;
//       }
//     },

//     setStep1Data: (state, action) => {
//       state.currentElection.step1Data = {
//         ...state.currentElection.step1Data,
//         ...action.payload,
//       };
//       if (!state.currentElection.completedSteps.includes(1)) {
//         state.currentElection.completedSteps.push(1);
//       }
//     },

//     setStep2Data: (state, action) => {
//       state.currentElection.step2Data = {
//         ...state.currentElection.step2Data,
//         ...action.payload,
//       };
//       if (!state.currentElection.completedSteps.includes(2)) {
//         state.currentElection.completedSteps.push(2);
//       }
//     },

//     setStep3Data: (state, action) => {
//       state.currentElection.step3Data = {
//         ...state.currentElection.step3Data,
//         ...action.payload,
//       };
//       if (!state.currentElection.completedSteps.includes(3)) {
//         state.currentElection.completedSteps.push(3);
//       }
//     },

//     setDraftId: (state, action) => {
//       state.currentElection.draftId = action.payload;
//     },

//     setCurrentElection: (state, action) => {
//       state.currentElection = {
//         ...state.currentElection,
//         ...action.payload,
//       };
//     },

//     // ============================================
//     // DRAFTS
//     // ============================================

//     setDrafts: (state, action) => {
//       state.drafts = action.payload;
//     },

//     addDraft: (state, action) => {
//       state.drafts.unshift(action.payload);
//     },

//     updateDraftInList: (state, action) => {
//       const index = state.drafts.findIndex(d => d.id === action.payload.id);
//       if (index !== -1) {
//         state.drafts[index] = action.payload;
//       }
//     },

//     removeDraft: (state, action) => {
//       state.drafts = state.drafts.filter(d => d.id !== action.payload);
//     },

//     setSelectedDraft: (state, action) => {
//       state.selectedDraft = action.payload;
//     },

//     loadDraftIntoEditor: (state, action) => {
//       const draft = action.payload;
//       state.currentElection = {
//         draftId: draft.id,
//         step1Data: draft.draft_data?.step1 || {},
//         step2Data: draft.draft_data?.step2 || {},
//         step3Data: draft.draft_data?.step3 || {},
//         completedSteps: draft.draft_data?.completed_steps || [],
//         currentStep: draft.draft_data?.current_step || 1,
//       };
//       state.currentStep = draft.draft_data?.current_step || 1;
//     },

//     // ============================================
//     // UI STATES
//     // ============================================

//     setIsCreating: (state, action) => {
//       state.isCreating = action.payload;
//     },

//     setIsPublishing: (state, action) => {
//       state.isPublishing = action.payload;
//     },

//     setIsSaving: (state, action) => {
//       state.isSaving = action.payload;
//     },

//     setLoading: (state, action) => {
//       state.loading = action.payload;
//     },

//     setError: (state, action) => {
//       state.error = action.payload;
//       state.loading = false;
//       state.isCreating = false;
//       state.isPublishing = false;
//       state.isSaving = false;
//     },

//     setSuccess: (state, action) => {
//       state.successMessage = action.payload;
//       state.error = null;
//       state.loading = false;
//     },

//     setValidationErrors: (state, action) => {
//       state.validationErrors = action.payload;
//     },

//     clearValidationErrors: (state) => {
//       state.validationErrors = {};
//     },

//     clearError: (state) => {
//       state.error = null;
//     },

//     clearSuccess: (state) => {
//       state.successMessage = null;
//     },

//     // ============================================
//     // RESET ACTIONS
//     // ============================================

//     resetElectionCreation: (state) => {
//       state.currentElection = {
//         draftId: null,
//         step1Data: {},
//         step2Data: {},
//         step3Data: {},
//         completedSteps: [],
//         currentStep: 1,
//       };
//       state.currentStep = 1;
//       state.validationErrors = {};
//       state.error = null;
//       state.successMessage = null;
//     },

//     resetElection: () => initialState,
//   },
// });

// export const {
//   // Selected election details
//   setSelectedElectionDetails,
//   setSelectedElectionQuestions,
//   clearSelectedElectionDetails,
//   updateSelectedElectionVoteCount,
//   updateSelectedElectionViewCount,
  
//   // Elections list
//   setMyElections,
//   setPublicElections,
//   addPublishedElection,
//   updateElectionInList,
//   removeElectionFromList,
  
//   // Wizard/Creation
//   setCurrentStep,
//   goToStep,
//   setStep1Data,
//   setStep2Data,
//   setStep3Data,
//   setDraftId,
//   setCurrentElection,
  
//   // Drafts
//   setDrafts,
//   addDraft,
//   updateDraftInList,
//   removeDraft,
//   setSelectedDraft,
//   loadDraftIntoEditor,
  
//   // UI States
//   setIsCreating,
//   setIsPublishing,
//   setIsSaving,
//   setLoading,
//   setError,
//   setSuccess,
//   setValidationErrors,
//   clearValidationErrors,
//   clearError,
//   clearSuccess,
  
//   // Reset
//   resetElectionCreation,
//   resetElection,
// } = electionSlice.actions;

// export default electionSlice.reducer;
// // src/redux/slices/electionSlice.js
// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   // Current election being created
//   currentElection: {
//     draftId: null,
//     step1Data: {},
//     step2Data: {},
//     step3Data: {},
//     completedSteps: [],
//     currentStep: 1,
//   },

//   // Draft management
//   drafts: [],
//   selectedDraft: null,

//   // Published elections
//   myElections: [],
//   publicElections: [],

//   // UI State
//   currentStep: 1,
//   isCreating: false,
//   isPublishing: false,
//   isSaving: false,
  
//   // Loading & Errors
//   loading: false,
//   error: null,
//   successMessage: null,
//   validationErrors: {},
// };

// export const electionSlice = createSlice({
//   name: 'election',
//   initialState,
//   reducers: {
//     // Step Navigation
//     setCurrentStep: (state, action) => {
//       state.currentStep = action.payload;
//       state.currentElection.currentStep = action.payload;
//     },

//     goToStep: (state, action) => {
//       const step = action.payload;
//       if (step >= 1 && step <= 4) {
//         state.currentStep = step;
//         state.currentElection.currentStep = step;
//       }
//     },

//     // Step Data Management
//     setStep1Data: (state, action) => {
//       state.currentElection.step1Data = {
//         ...state.currentElection.step1Data,
//         ...action.payload,
//       };
//       if (!state.currentElection.completedSteps.includes(1)) {
//         state.currentElection.completedSteps.push(1);
//       }
//     },

//     setStep2Data: (state, action) => {
//       state.currentElection.step2Data = {
//         ...state.currentElection.step2Data,
//         ...action.payload,
//       };
//       if (!state.currentElection.completedSteps.includes(2)) {
//         state.currentElection.completedSteps.push(2);
//       }
//     },

//     setStep3Data: (state, action) => {
//       state.currentElection.step3Data = {
//         ...state.currentElection.step3Data,
//         ...action.payload,
//       };
//       if (!state.currentElection.completedSteps.includes(3)) {
//         state.currentElection.completedSteps.push(3);
//       }
//     },

//     // Draft ID
//     setDraftId: (state, action) => {
//       state.currentElection.draftId = action.payload;
//     },

//     // Complete Election Data
//     setCurrentElection: (state, action) => {
//       state.currentElection = {
//         ...state.currentElection,
//         ...action.payload,
//       };
//     },

//     // Drafts Management
//     setDrafts: (state, action) => {
//       state.drafts = action.payload;
//     },

//     addDraft: (state, action) => {
//       state.drafts.unshift(action.payload);
//     },

//     updateDraftInList: (state, action) => {
//       const index = state.drafts.findIndex(d => d.id === action.payload.id);
//       if (index !== -1) {
//         state.drafts[index] = action.payload;
//       }
//     },

//     removeDraft: (state, action) => {
//       state.drafts = state.drafts.filter(d => d.id !== action.payload);
//     },

//     setSelectedDraft: (state, action) => {
//       state.selectedDraft = action.payload;
//     },

//     // Load draft into current election
//     loadDraftIntoEditor: (state, action) => {
//       const draft = action.payload;
//       state.currentElection = {
//         draftId: draft.id,
//         step1Data: draft.draft_data?.step1 || {},
//         step2Data: draft.draft_data?.step2 || {},
//         step3Data: draft.draft_data?.step3 || {},
//         completedSteps: draft.draft_data?.completed_steps || [],
//         currentStep: draft.draft_data?.current_step || 1,
//       };
//       state.currentStep = draft.draft_data?.current_step || 1;
//     },

//     // Published Elections
//     setMyElections: (state, action) => {
//       state.myElections = action.payload;
//     },

//     setPublicElections: (state, action) => {
//       state.publicElections = action.payload;
//     },

//     addPublishedElection: (state, action) => {
//       state.myElections.unshift(action.payload);
//     },

//     // UI States
//     setIsCreating: (state, action) => {
//       state.isCreating = action.payload;
//     },

//     setIsPublishing: (state, action) => {
//       state.isPublishing = action.payload;
//     },

//     setIsSaving: (state, action) => {
//       state.isSaving = action.payload;
//     },

//     setLoading: (state, action) => {
//       state.loading = action.payload;
//     },

//     setError: (state, action) => {
//       state.error = action.payload;
//       state.loading = false;
//       state.isCreating = false;
//       state.isPublishing = false;
//       state.isSaving = false;
//     },

//     setSuccess: (state, action) => {
//       state.successMessage = action.payload;
//       state.error = null;
//       state.loading = false;
//     },

//     setValidationErrors: (state, action) => {
//       state.validationErrors = action.payload;
//     },

//     clearValidationErrors: (state) => {
//       state.validationErrors = {};
//     },

//     clearError: (state) => {
//       state.error = null;
//     },

//     clearSuccess: (state) => {
//       state.successMessage = null;
//     },

//     // Reset election creation
//     resetElectionCreation: (state) => {
//       state.currentElection = {
//         draftId: null,
//         step1Data: {},
//         step2Data: {},
//         step3Data: {},
//         completedSteps: [],
//         currentStep: 1,
//       };
//       state.currentStep = 1;
//       state.validationErrors = {};
//       state.error = null;
//       state.successMessage = null;
//     },

//     // Complete reset
//     resetElection: () => initialState,
//   },
// });

// export const {
//   setCurrentStep,
//   goToStep,
//   setStep1Data,
//   setStep2Data,
//   setStep3Data,
//   setDraftId,
//   setCurrentElection,
//   setDrafts,
//   addDraft,
//   updateDraftInList,
//   removeDraft,
//   setSelectedDraft,
//   loadDraftIntoEditor,
//   setMyElections,
//   setPublicElections,
//   addPublishedElection,
//   setIsCreating,
//   setIsPublishing,
//   setIsSaving,
//   setLoading,
//   setError,
//   setSuccess,
//   setValidationErrors,
//   clearValidationErrors,
//   clearError,
//   clearSuccess,
//   resetElectionCreation,
//   resetElection,
// } = electionSlice.actions;

// export default electionSlice.reducer;
// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   // Election creation flow
//   currentStep: 1,
//   totalSteps: 4,
  
//   // Draft election data
//   draftElection: {
//     title: '',
//     description: '',
//     creator_type: 'individual', // individual, organization, content_creator
//     organization_id: null,
    
//     // Media
//     topic_image: null,
//     topic_video: null,
//     logo: null,
    
//     // Scheduling
//     start_date: '',
//     start_time: '',
//     end_date: '',
//     end_time: '',
//     timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    
//     // Voting configuration
//     voting_type: 'plurality', // plurality, ranked_choice, approval
//     voting_body_content: '',
    
//     // Access control
//     permission_type: 'public', // public, country_specific, organization_only
//     allowed_countries: [],
    
//     // Pricing
//     is_free: true,
//     pricing_type: 'free', // free, general_fee, regional_fee
//     general_participation_fee: 0,
//     processing_fee_percentage: 0,
//     regional_pricing: [],
    
//     // Authentication
//     biometric_required: false,
//     authentication_methods: ['passkey'],
    
//     // Branding
//     custom_url: '',
//     corporate_style: {},
    
//     // Settings
//     show_live_results: false,
//     vote_editing_allowed: false,
    
//     // Questions
//     questions: []
//   },
  
//   // User's elections
//   myElections: [],
//   publicElections: [],
//   currentElection: null,
  
//   // Eligibility check
//   eligibility: {
//     canCreate: false,
//     subscriptionType: 'Free',
//     currentElectionsCount: 0,
//     maxElections: 5,
//     remainingElections: 5,
//     canCreatePaidElections: false,
//     processingFeePercentage: 0,
//     message: ''
//   },
  
//   // UI state
//   loading: false,
//   error: null,
//   success: null
// };

// const electionSlice = createSlice({
//   name: 'election',
//   initialState,
//   reducers: {
//     // Step navigation
//     setCurrentStep: (state, action) => {
//       state.currentStep = action.payload;
//     },
//     nextStep: (state) => {
//       if (state.currentStep < state.totalSteps) {
//         state.currentStep += 1;
//       }
//     },
//     previousStep: (state) => {
//       if (state.currentStep > 1) {
//         state.currentStep -= 1;
//       }
//     },
    
//     // Draft management
//     updateDraftField: (state, action) => {
//       const { field, value } = action.payload;
//       state.draftElection[field] = value;
//     },
    
//     updateDraftElection: (state, action) => {
//       state.draftElection = {
//         ...state.draftElection,
//         ...action.payload
//       };
//     },
    
//     resetDraft: (state) => {
//       state.draftElection = initialState.draftElection;
//       state.currentStep = 1;
//     },
    
//     // Questions management
//     addQuestion: (state, action) => {
//       state.draftElection.questions.push({
//         id: Date.now(),
//         question_text: '',
//         question_type: 'multiple_choice',
//         question_order: state.draftElection.questions.length + 1,
//         is_required: true,
//         max_selections: 1,
//         options: [],
//         ...action.payload
//       });
//     },
    
//     updateQuestion: (state, action) => {
//       const { questionId, data } = action.payload;
//       const questionIndex = state.draftElection.questions.findIndex(q => q.id === questionId);
//       if (questionIndex !== -1) {
//         state.draftElection.questions[questionIndex] = {
//           ...state.draftElection.questions[questionIndex],
//           ...data
//         };
//       }
//     },
    
//     removeQuestion: (state, action) => {
//       state.draftElection.questions = state.draftElection.questions.filter(
//         q => q.id !== action.payload
//       );
//     },
    
//     addOption: (state, action) => {
//       const { questionId, option } = action.payload;
//       const questionIndex = state.draftElection.questions.findIndex(q => q.id === questionId);
//       if (questionIndex !== -1) {
//         state.draftElection.questions[questionIndex].options.push({
//           id: Date.now(),
//           option_text: '',
//           option_order: state.draftElection.questions[questionIndex].options.length + 1,
//           ...option
//         });
//       }
//     },
    
//     updateOption: (state, action) => {
//       const { questionId, optionId, data } = action.payload;
//       const questionIndex = state.draftElection.questions.findIndex(q => q.id === questionId);
//       if (questionIndex !== -1) {
//         const optionIndex = state.draftElection.questions[questionIndex].options.findIndex(
//           o => o.id === optionId
//         );
//         if (optionIndex !== -1) {
//           state.draftElection.questions[questionIndex].options[optionIndex] = {
//             ...state.draftElection.questions[questionIndex].options[optionIndex],
//             ...data
//           };
//         }
//       }
//     },
    
//     removeOption: (state, action) => {
//       const { questionId, optionId } = action.payload;
//       const questionIndex = state.draftElection.questions.findIndex(q => q.id === questionId);
//       if (questionIndex !== -1) {
//         state.draftElection.questions[questionIndex].options = 
//           state.draftElection.questions[questionIndex].options.filter(o => o.id !== optionId);
//       }
//     },
    
//     // Regional pricing
//     addRegionalPricing: (state, action) => {
//       state.draftElection.regional_pricing.push(action.payload);
//     },
    
//     updateRegionalPricing: (state, action) => {
//       const { region_code, data } = action.payload;
//       const index = state.draftElection.regional_pricing.findIndex(
//         r => r.region_code === region_code
//       );
//       if (index !== -1) {
//         state.draftElection.regional_pricing[index] = {
//           ...state.draftElection.regional_pricing[index],
//           ...data
//         };
//       }
//     },
    
//     removeRegionalPricing: (state, action) => {
//       state.draftElection.regional_pricing = state.draftElection.regional_pricing.filter(
//         r => r.region_code !== action.payload
//       );
//     },
    
//     // Eligibility
//     setEligibility: (state, action) => {
//       state.eligibility = action.payload;
//     },
    
//     // Elections lists
//     setMyElections: (state, action) => {
//       state.myElections = action.payload;
//     },
    
//     setPublicElections: (state, action) => {
//       state.publicElections = action.payload;
//     },
    
//     setCurrentElection: (state, action) => {
//       state.currentElection = action.payload;
//     },
    
//     // UI state
//     setLoading: (state, action) => {
//       state.loading = action.payload;
//     },
    
//     setError: (state, action) => {
//       state.error = action.payload;
//       state.loading = false;
//     },
    
//     setSuccess: (state, action) => {
//       state.success = action.payload;
//       state.loading = false;
//     },
    
//     clearMessages: (state) => {
//       state.error = null;
//       state.success = null;
//     }
//   }
// });

// export const {
//   setCurrentStep,
//   nextStep,
//   previousStep,
//   updateDraftField,
//   updateDraftElection,
//   resetDraft,
//   addQuestion,
//   updateQuestion,
//   removeQuestion,
//   addOption,
//   updateOption,
//   removeOption,
//   addRegionalPricing,
//   updateRegionalPricing,
//   removeRegionalPricing,
//   setEligibility,
//   setMyElections,
//   setPublicElections,
//   setCurrentElection,
//   setLoading,
//   setError,
//   setSuccess,
//   clearMessages
// } = electionSlice.actions;

// export default electionSlice.reducer;