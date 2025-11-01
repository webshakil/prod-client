import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_REACT_APP_PAYMENT_SERVICE_URL || 'http://localhost:5006/api',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      // Get user data from localStorage
      const userDataStr = localStorage.getItem('userData');
      
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          
          // Add x-user-data header
          headers.set('x-user-data', JSON.stringify({
            userId: userData.userId,
            email: userData.email,
            phone: userData.phone || null,
            username: userData.username || null,
            roles: (userData.roles || ['Voter']).map(role => 
              role === 'ContentCreator' ? 'Content_Creator' : role
            ),
            subscriptionType: userData.subscriptionType || 'Free',
            isSubscribed: userData.isSubscribed || false
          }));
        } catch (error) {
          console.error('Error parsing userData:', error);
        }
      }
      
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Create Stripe Payment Intent
    createStripeIntent: builder.mutation({
      query: ({ electionId, amount, currency, region }) => ({
        url: `/payment/stripe/create-intent`,
        method: 'POST',
        body: { electionId, amount, currency, region },
      }),
    }),
    
    // Create Paddle Payment
    createPaddlePayment: builder.mutation({
      query: ({ electionId, amount, currency, region }) => ({
        url: `/payment/paddle/create-payment`,
        method: 'POST',
        body: { electionId, amount, currency, region },
      }),
    }),
    
    // Verify Payment Status
    verifyPayment: builder.query({
      query: (paymentId) => `/payment/verify/${paymentId}`,
    }),
    
    // Process Wallet Payment
    processWalletPayment: builder.mutation({
      query: ({ electionId, amount, currency }) => ({
        url: `/payment/wallet/process`,
        method: 'POST',
        body: { electionId, amount, currency },
      }),
    }),
  }),
});

export const {
  useCreateStripeIntentMutation,
  useCreatePaddlePaymentMutation,
  useVerifyPaymentQuery,
  useProcessWalletPaymentMutation,
} = paymentApi;
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// export const paymentApi = createApi({
//   reducerPath: 'paymentApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: import.meta.env.VITE_REACT_APP_PAYMENT_SERVICE_URL || 'http://localhost:5006/api',
//     credentials: 'include',
//     prepareHeaders: (headers, { getState }) => {
//       const token = getState().auth?.token;
//       if (token) {
//         headers.set('Authorization', `Bearer ${token}`);
//       }
//       return headers;
//     },
//   }),
//   endpoints: (builder) => ({
//     // Create Stripe Payment Intent
//     createStripeIntent: builder.mutation({
//       query: ({ electionId, amount, currency, region }) => ({
//         url: `/payment/stripe/create-intent`,
//         method: 'POST',
//         body: { electionId, amount, currency, region },
//       }),
//     }),
    
//     // Create Paddle Payment
//     createPaddlePayment: builder.mutation({
//       query: ({ electionId, amount, currency, region }) => ({
//         url: `/payment/paddle/create-payment`,
//         method: 'POST',
//         body: { electionId, amount, currency, region },
//       }),
//     }),
    
//     // Verify Payment Status
//     verifyPayment: builder.query({
//       query: (paymentId) => `/payment/verify/${paymentId}`,
//     }),
    
//     // Process Wallet Payment
//     processWalletPayment: builder.mutation({
//       query: ({ electionId, amount, currency }) => ({
//         url: `/payment/wallet/process`,
//         method: 'POST',
//         body: { electionId, amount, currency },
//       }),
//     }),
//   }),
// });

// export const {
//   useCreateStripeIntentMutation,
//   useCreatePaddlePaymentMutation,
//   useVerifyPaymentQuery,
//   useProcessWalletPaymentMutation,
// } = paymentApi;