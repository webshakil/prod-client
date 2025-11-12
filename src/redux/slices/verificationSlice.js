// src/redux/slices/verificationSlice.js
// ✨ Verification state for Issues #1, #2, #3
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Verification results
  receiptVerification: null,
  hashVerification: null,
  encryptionVerification: null,
  
  // User's verification data
  myVerificationData: null,
  myVerifications: [],
  
  // Public bulletin board
  bulletinBoard: [],
  bulletinBoardPagination: {
    page: 1,
    limit: 50,
    totalCount: 0,
    totalPages: 0,
  },
  
  // Audit trail (Issue #3)
  auditTrail: [],
  auditTrailPagination: {
    page: 1,
    limit: 50,
    totalCount: 0,
    totalPages: 0,
  },
  auditTrailIntegrity: null,
  
  // Encryption details (Issue #1)
  publicKey: null,
  encryptionDetails: null,
  
  // UI state
  loading: false,
  verifying: false,
  error: null,
  
  // Active verification
  activeVerificationType: null, // receipt, hash, encryption, audit_trail
  activeElectionId: null,
};

const verificationSlice = createSlice({
  name: 'verification',
  initialState,
  reducers: {
    // Set receipt verification result
    setReceiptVerification: (state, action) => {
      state.receiptVerification = action.payload;
    },

    // Set hash verification result
    setHashVerification: (state, action) => {
      state.hashVerification = action.payload;
    },

    // Set encryption verification result
    setEncryptionVerification: (state, action) => {
      state.encryptionVerification = action.payload;
    },

    // Set my verification data
    setMyVerificationData: (state, action) => {
      state.myVerificationData = action.payload;
    },

    // Set my verifications list
    setMyVerifications: (state, action) => {
      state.myVerifications = action.payload;
    },

    // Set public bulletin board
    setBulletinBoard: (state, action) => {
      state.bulletinBoard = action.payload.votes;
      state.bulletinBoardPagination = action.payload.pagination;
    },

    // Set audit trail
    setAuditTrail: (state, action) => {
      state.auditTrail = action.payload.events;
      state.auditTrailPagination = action.payload.pagination;
    },

    // Set audit trail integrity
    setAuditTrailIntegrity: (state, action) => {
      state.auditTrailIntegrity = action.payload;
    },

    // Set public key
    setPublicKey: (state, action) => {
      state.publicKey = action.payload;
    },

    // Set encryption details
    setEncryptionDetails: (state, action) => {
      state.encryptionDetails = action.payload;
    },

    // Set active verification
    setActiveVerification: (state, action) => {
      state.activeVerificationType = action.payload.type;
      state.activeElectionId = action.payload.electionId;
    },

    // Clear active verification
    clearActiveVerification: (state) => {
      state.activeVerificationType = null;
      state.activeElectionId = null;
    },

    // Set loading
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Set verifying
    setVerifying: (state, action) => {
      state.verifying = action.payload;
    },

    // Set error
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
      state.verifying = false;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset verification state
    /*eslint-disable*/
    resetVerificationState: (state) => {
      return { ...initialState };
    },

    // Clear verification results
    clearVerificationResults: (state) => {
      state.receiptVerification = null;
      state.hashVerification = null;
      state.encryptionVerification = null;
    },
  },
});

export const {
  setReceiptVerification,
  setHashVerification,
  setEncryptionVerification,
  setMyVerificationData,
  setMyVerifications,
  setBulletinBoard,
  setAuditTrail,
  setAuditTrailIntegrity,
  setPublicKey,
  setEncryptionDetails,
  setActiveVerification,
  clearActiveVerification,
  setLoading,
  setVerifying,
  setError,
  clearError,
  resetVerificationState,
  clearVerificationResults,
} = verificationSlice.actions;

export default verificationSlice.reducer;