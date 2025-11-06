//import { indexApi } from './indexApi';

import indexApi from "../indexApi";

export const biometricApi = indexApi.injectEndpoints({
  endpoints: (builder) => ({
    // Collect biometric data
    collectBiometric: builder.mutation({
      query: ({ sessionId, biometricType, biometricData, deviceInfo }) => ({
        url: '/biometric/collect',
        method: 'POST',
        body: {
          sessionId,
          biometricType,
          biometricData,
          deviceInfo,
        },
      }),
      invalidatesTags: ['Biometric'],
    }),

    // Verify biometric on login
    verifyBiometric: builder.mutation({
      query: ({ sessionId, biometricData }) => ({
        url: '/biometric/verify',
        method: 'POST',
        body: { sessionId, biometricData },
      }),
      invalidatesTags: ['Biometric'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCollectBiometricMutation,
  useVerifyBiometricMutation,
} = biometricApi;
