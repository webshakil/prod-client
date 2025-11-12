// src/redux/slices/wallletSlice.js
// ✨ Enhanced wallet state management (3 l's to avoid conflict)
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Wallet balance
  balance: 0,
  blockedBalance: 0,
  currency: 'USD',
  
  // Transactions
  transactions: [],
  transactionsPagination: {
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
  },
  
  // Transaction filters
  filters: {
    type: null, // deposit, withdraw, election_payment, prize_won, refund
    status: null, // pending, success, failed, cancelled
    filterType: null, // today, yesterday, last_week, last_30_days, custom
    dateFrom: null,
    dateTo: null,
  },
  
  // Blocked accounts
  blockedAccounts: [],
  totalBlocked: 0,
  
  // Withdrawal requests
  withdrawalRequests: [],
  pendingWithdrawals: [],
  
  // Deposit state
  depositInProgress: false,
  depositClientSecret: null,
  depositPaymentIntentId: null,
  
  // Withdrawal state
  withdrawalInProgress: false,
  withdrawalRequestId: null,
  
  // Payment gateway
  selectedGateway: 'stripe', // stripe or paddle
  gatewayConfig: null,
  
  // Analytics
  analytics: {
    currentBalance: 0,
    blockedBalance: 0,
    totalDeposits: 0,
    depositCount: 0,
    totalWithdrawals: 0,
    withdrawalCount: 0,
    totalPrizesWon: 0,
    prizeCount: 0,
    totalElectionFees: 0,
    electionCount: 0,
  },
  
  // UI state
  loading: false,
  transactionsLoading: false,
  depositLoading: false,
  withdrawalLoading: false,
  error: null,
  
  // Modal state
  showDepositModal: false,
  showWithdrawalModal: false,
  
  // Last update
  lastUpdate: null,
};

const wallletSlice = createSlice({
  name: 'walllet',
  initialState,
  reducers: {
    // Set wallet balance
    setWallet: (state, action) => {
      state.balance = action.payload.balance;
      state.blockedBalance = action.payload.blocked_balance;
      state.currency = action.payload.currency || 'USD';
      state.lastUpdate = new Date().toISOString();
    },

    // Update balance (real-time)
    updateBalance: (state, action) => {
      state.balance = action.payload;
      state.lastUpdate = new Date().toISOString();
    },

    // Update blocked balance
    updateBlockedBalance: (state, action) => {
      state.blockedBalance = action.payload;
    },

    // Set transactions
    setTransactions: (state, action) => {
      state.transactions = action.payload.transactions;
      state.transactionsPagination = action.payload.pagination;
    },

    // Add transaction (real-time)
    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload);
    },

    // Set transaction filters
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },

    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        type: null,
        status: null,
        filterType: null,
        dateFrom: null,
        dateTo: null,
      };
    },

    // Set blocked accounts
    setBlockedAccounts: (state, action) => {
      state.blockedAccounts = action.payload.blockedAccounts;
      state.totalBlocked = action.payload.totalBlocked;
    },

    // Set withdrawal requests
    setWithdrawalRequests: (state, action) => {
      state.withdrawalRequests = action.payload;
    },

    // Set pending withdrawals (admin)
    setPendingWithdrawals: (state, action) => {
      state.pendingWithdrawals = action.payload;
    },

    // Start deposit
    startDeposit: (state, action) => {
      state.depositInProgress = true;
      state.depositClientSecret = action.payload.clientSecret;
      state.depositPaymentIntentId = action.payload.paymentIntentId;
    },

    // Complete deposit
    completeDeposit: (state) => {
      state.depositInProgress = false;
      state.depositClientSecret = null;
      state.depositPaymentIntentId = null;
    },

    // Start withdrawal
    startWithdrawal: (state, action) => {
      state.withdrawalInProgress = true;
      state.withdrawalRequestId = action.payload.requestId;
    },

    // Complete withdrawal
    completeWithdrawal: (state) => {
      state.withdrawalInProgress = false;
      state.withdrawalRequestId = null;
    },

    // Set selected gateway
    setSelectedGateway: (state, action) => {
      state.selectedGateway = action.payload;
    },

    // Set analytics
    setAnalytics: (state, action) => {
      state.analytics = action.payload;
    },

    // Set loading states
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setTransactionsLoading: (state, action) => {
      state.transactionsLoading = action.payload;
    },

    setDepositLoading: (state, action) => {
      state.depositLoading = action.payload;
    },

    setWithdrawalLoading: (state, action) => {
      state.withdrawalLoading = action.payload;
    },

    // Set error
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Modal controls
    setShowDepositModal: (state, action) => {
      state.showDepositModal = action.payload;
    },

    setShowWithdrawalModal: (state, action) => {
      state.showWithdrawalModal = action.payload;
    },

    // Reset wallet state
    /*eslint-disable*/
    resetWalletState: (state) => {
      return { ...initialState };
    },
  },
});

export const {
  setWallet,
  updateBalance,
  updateBlockedBalance,
  setTransactions,
  addTransaction,
  setFilters,
  clearFilters,
  setBlockedAccounts,
  setWithdrawalRequests,
  setPendingWithdrawals,
  startDeposit,
  completeDeposit,
  startWithdrawal,
  completeWithdrawal,
  setSelectedGateway,
  setAnalytics,
  setLoading,
  setTransactionsLoading,
  setDepositLoading,
  setWithdrawalLoading,
  setError,
  clearError,
  setShowDepositModal,
  setShowWithdrawalModal,
  resetWalletState,
} = wallletSlice.actions;

export default wallletSlice.reducer;