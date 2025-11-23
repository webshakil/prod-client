// src/redux/api/payment/paymentConfigApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const VOTING_SERVICE_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api';

const getUserData = () => {
  const userDataStr = localStorage.getItem('userData');
  
  if (userDataStr) {
    try {
      const userData = JSON.parse(userDataStr);
      
      // Format user data exactly like axios interceptor
      return {
        userId: userData.userId,
        email: userData.email,
        phone: userData.phone || null,
        username: userData.username || null,
        roles: (userData.roles || ['Voter']).map(role => 
          role === 'ContentCreator' ? 'Content_Creator' : role
        ),
        subscriptionType: userData.subscriptionType || 'Free',
        isSubscribed: userData.isSubscribed || false
      };
    } catch (error) {
      console.error('❌ Error parsing userData:', error);
    }
  }
  return null;
};

export const paymentConfigApi = createApi({
  reducerPath: 'paymentConfigApi',
  baseQuery: fetchBaseQuery({
    baseUrl: VOTING_SERVICE_URL,
    prepareHeaders: (headers) => {
      console.log('🔧 paymentConfigApi prepareHeaders called');
      
      const userData = getUserData();
      
      if (userData) {
        console.log('📤 Setting x-user-data header:', userData);
        headers.set('x-user-data', JSON.stringify(userData));
        headers.set('x-user-id', userData.userId);
      } else {
        console.warn('⚠️ No userData found in localStorage');
      }
      
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
        console.log('🔑 Authorization header set');
      }
      
      console.log('📋 Final headers:', Object.fromEntries(headers.entries()));
      
      return headers;
    },
  }),
  tagTypes: ['PaymentConfig'],
  endpoints: (builder) => ({
    
    // Get all payment configs (Admin only)
    getPaymentConfigs: builder.query({
      query: () => {
        console.log('🔵 Fetching all payment configs (admin)');
        return `/payments/admin/configs`;
      },
      providesTags: ['PaymentConfig'],
      transformResponse: (response) => {
        console.log('✅ Received admin payment configs:', response);
        return response.data;
      },
    }),

    // Save payment configs (Admin only)
    savePaymentConfigs: builder.mutation({
      query: (configData) => {
        console.log('🔵 Saving payment configs:', configData);
        return {
          url: `/payments/admin/configs`,
          method: 'POST',
          body: configData,
        };
      },
      invalidatesTags: ['PaymentConfig'],
      transformResponse: (response) => {
        console.log('✅ Payment configs saved:', response);
        return response;
      },
    }),

    // Get public payment keys for frontend (No auth required)
    getPublicPaymentKeys: builder.query({
      query: () => {
        console.log('🔵 Fetching public payment keys from backend');
        return `/payments/public-keys`;
      },
      providesTags: ['PaymentConfig'],
      transformResponse: (response) => {
        console.log('✅ Received public payment keys:', response);
        return response.data;
      },
    }),

  }),
});

export const {
  useGetPaymentConfigsQuery,
  useSavePaymentConfigsMutation,
  useGetPublicPaymentKeysQuery,
} = paymentConfigApi;

export default paymentConfigApi;