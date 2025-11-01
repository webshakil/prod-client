import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentPayment: null,
  paymentStatus: 'idle', // 'idle' | 'processing' | 'success' | 'failed'
  paymentMethod: 'card', // 'card' | 'wallet'
  gateway: null, // 'stripe' | 'paddle'
  clientSecret: null,
  error: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    setGateway: (state, action) => {
      state.gateway = action.payload;
    },
    setClientSecret: (state, action) => {
      state.clientSecret = action.payload;
    },
    setPaymentStatus: (state, action) => {
      state.paymentStatus = action.payload;
    },
    setCurrentPayment: (state, action) => {
      state.currentPayment = action.payload;
    },
    setPaymentError: (state, action) => {
      state.error = action.payload;
      state.paymentStatus = 'failed';
    },
    /*eslint-disable*/
    resetPayment: (state) => {
      return initialState;
    },
  },
});

export const {
  setPaymentMethod,
  setGateway,
  setClientSecret,
  setPaymentStatus,
  setCurrentPayment,
  setPaymentError,
  resetPayment,
} = paymentSlice.actions;

export default paymentSlice.reducer;