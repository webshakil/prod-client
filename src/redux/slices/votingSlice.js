import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentVote: null,
  votingReceipt: null,
  videoProgress: {},
  paymentIntent: null,
  hasVoted: false,
  canVote: false,
  videoWatchComplete: false,
  paymentComplete: false,
};

const votingSlice = createSlice({
  name: 'voting',
  initialState,
  reducers: {
    setCurrentVote: (state, action) => {
      state.currentVote = action.payload;
      state.hasVoted = !!action.payload;
    },
    setVotingReceipt: (state, action) => {
      state.votingReceipt = action.payload;
    },
    setVideoProgress: (state, action) => {
      const { electionId, ...progress } = action.payload;
      state.videoProgress[electionId] = progress;
      state.videoWatchComplete = progress.completed || false;
    },
    setPaymentIntent: (state, action) => {
      state.paymentIntent = action.payload;
    },
    setPaymentComplete: (state, action) => {
      state.paymentComplete = action.payload;
    },
    setCanVote: (state, action) => {
      state.canVote = action.payload;
    },
    /*eslint-disable*/
    resetVotingState: (state) => {
      return initialState;
    },
    clearElectionVoteData: (state, action) => {
      const electionId = action.payload;
      delete state.videoProgress[electionId];
      state.currentVote = null;
      state.votingReceipt = null;
      state.paymentIntent = null;
      state.hasVoted = false;
      state.canVote = false;
      state.videoWatchComplete = false;
      state.paymentComplete = false;
    },
  },
});

export const {
  setCurrentVote,
  setVotingReceipt,
  setVideoProgress,
  setPaymentIntent,
  setPaymentComplete,
  setCanVote,
  resetVotingState,
  clearElectionVoteData,
} = votingSlice.actions;

export default votingSlice.reducer;