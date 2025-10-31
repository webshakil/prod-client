import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  balance: 0,
  currency: 'USD',
  transactions: [],
  pendingWithdrawals: [],
  totalEarnings: 0,
  totalSpent: 0,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setBalance: (state, action) => {
      state.balance = action.payload.balance;
      state.currency = action.payload.currency || 'USD';
    },
    setTransactions: (state, action) => {
      state.transactions = action.payload;
    },
    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload);
    },
    setPendingWithdrawals: (state, action) => {
      state.pendingWithdrawals = action.payload;
    },
    updateBalance: (state, action) => {
      state.balance += action.payload;
    },
    setWalletStats: (state, action) => {
      state.totalEarnings = action.payload.totalEarnings || 0;
      state.totalSpent = action.payload.totalSpent || 0;
    },
    /*eslint-disable*/
    resetWallet: (state) => {
      return initialState;
    },
  },
});

export const {
  setBalance,
  setTransactions,
  addTransaction,
  setPendingWithdrawals,
  updateBalance,
  setWalletStats,
  resetWallet,
} = walletSlice.actions;

export default walletSlice.reducer;