
// src/redux/slices/votingNewSlice.js
// ✨ Enhanced voting state management
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Current ballot data
  currentBallot: null,
  currentElectionId: null,
  
  // Vote state
  hasVoted: false,
  votingId: null,
  voteHash: null,
  receiptId: null,
  verificationCode: null,
  
  // Ballot answers (before submission)
  answers: {},
  
  // Video watch progress
  videoProgress: {
    watchPercentage: 0,
    lastPosition: 0,
    totalDuration: 0,
    completed: false,
  },
  
  // Vote editing
  voteEditingAllowed: false,
  isEditingVote: false,
  originalVoteId: null,
  
  // Anonymous voting
  anonymousVotingEnabled: false,
  votingAnonymously: false,
  
  // Payment status
  paymentRequired: false,
  paymentCompleted: false,
  participationFee: 0,
  
  // Voting type
  votingType: null, // plurality, ranked_choice, approval
  
  // Live results
  liveResultsVisible: false,
  liveResults: null,
  
  // UI state
  loading: false,
  submitting: false,
  error: null,
  
  // Vote validation
  validationErrors: [],
  
  // Abstentions
  abstentions: {},
};

const votingNewSlice = createSlice({
  name: 'votingNew',
  initialState,
  reducers: {
    // Set current ballot
    setBallot: (state, action) => {
      state.currentBallot = action.payload.ballot;
      state.currentElectionId = action.payload.electionId;
      state.votingType = action.payload.votingType;
      state.hasVoted = action.payload.hasVoted || false;
      state.voteEditingAllowed = action.payload.voteEditingAllowed || false;
      state.anonymousVotingEnabled = action.payload.anonymousVotingEnabled || false;
      state.liveResultsVisible = action.payload.liveResultsVisible || false;
      state.paymentRequired = action.payload.paymentRequired || false;
      state.participationFee = action.payload.participationFee || 0;
    },

    // Set answers for a question
    setAnswer: (state, action) => {
      const { questionId, answer } = action.payload;
      state.answers[questionId] = answer;
    },

    // Set all answers at once
    setAllAnswers: (state, action) => {
      state.answers = action.payload;
    },

    // Clear specific answer
    clearAnswer: (state, action) => {
      delete state.answers[action.payload];
    },

    // Clear all answers
    clearAllAnswers: (state) => {
      state.answers = {};
    },

    // Set vote submission result
    setVoteSubmitted: (state, action) => {
      state.hasVoted = true;
      state.votingId = action.payload.votingId;
      state.voteHash = action.payload.voteHash;
      state.receiptId = action.payload.receiptId;
      state.verificationCode = action.payload.verificationCode;
      state.submitting = false;
      state.error = null;
    },

    // Set submitting state
    setSubmitting: (state, action) => {
      state.submitting = action.payload;
    },

    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Set error
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
      state.submitting = false;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Set video progress
    setVideoProgress: (state, action) => {
      state.videoProgress = {
        ...state.videoProgress,
        ...action.payload,
      };
    },

    // Set video completed
    setVideoCompleted: (state, action) => {
      state.videoProgress.completed = action.payload;
    },

    // Set anonymous voting
    setAnonymousVoting: (state, action) => {
      state.votingAnonymously = action.payload;
    },

    // Set payment completed
    setPaymentCompleted: (state, action) => {
      state.paymentCompleted = action.payload;
    },

    // Set live results
    setLiveResults: (state, action) => {
      state.liveResults = action.payload;
    },

    // Set validation errors
    setValidationErrors: (state, action) => {
      state.validationErrors = action.payload;
    },

    // Clear validation errors
    clearValidationErrors: (state) => {
      state.validationErrors = [];
    },

    // Record abstention
    recordAbstention: (state, action) => {
      const { questionId, reason } = action.payload;
      state.abstentions[questionId] = reason;
    },

    // Start vote editing
    startVoteEditing: (state) => {
      state.isEditingVote = true;
    },

    // Cancel vote editing
    cancelVoteEditing: (state) => {
      state.isEditingVote = false;
      state.answers = {};
    },

    // Reset voting state
    /*eslint-disable*/
    resetVotingState: (state) => {
      return { ...initialState };
    },

    // Reset ballot (keep user state)
    resetBallot: (state) => {
      state.currentBallot = null;
      state.currentElectionId = null;
      state.answers = {};
      state.validationErrors = [];
      state.abstentions = {};
      state.error = null;
    },
  },
});

export const {
  setBallot,
  setAnswer,
  setAllAnswers,
  clearAnswer,
  clearAllAnswers,
  setVoteSubmitted,
  setSubmitting,
  setLoading,
  setError,
  clearError,
  setVideoProgress,
  setVideoCompleted,
  setAnonymousVoting,
  setPaymentCompleted,
  setLiveResults,
  setValidationErrors,
  clearValidationErrors,
  recordAbstention,
  startVoteEditing,
  cancelVoteEditing,
  resetVotingState,
  resetBallot,
} = votingNewSlice.actions;

export default votingNewSlice.reducer;