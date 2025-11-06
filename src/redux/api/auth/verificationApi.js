//import { indexApi } from './indexApi';

import indexApi from "../indexApi";

export const verificationApi = indexApi.injectEndpoints({
  endpoints: (builder) => ({
    // Send email OTP
    sendEmailOTP: builder.mutation({
      query: ({ sessionId, email }) => ({
        url: '/verification/send-email-otp',
        method: 'POST',
        body: { sessionId, email },
      }),
      invalidatesTags: ['Verification'],
    }),

    // Send SMS OTP
    sendSMSOTP: builder.mutation({
      query: ({ sessionId, phone }) => ({
        url: '/verification/send-sms-otp',
        method: 'POST',
        body: { sessionId, phone },
      }),
      invalidatesTags: ['Verification'],
    }),

    // Verify OTP (email or SMS)
    verifyOTP: builder.mutation({
      query: ({ sessionId, otp, otpType, skipVerification }) => ({
        url: '/verification/verify-otp',
        method: 'POST',
        body: { sessionId, otp, otpType, skipVerification },
      }),
      invalidatesTags: ['Verification'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useSendEmailOTPMutation,
  useSendSMSOTPMutation,
  useVerifyOTPMutation,
} = verificationApi;
