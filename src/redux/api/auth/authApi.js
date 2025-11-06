//import { indexApi } from './indexApi';

import indexApi from "../indexApi";

export const authApi = indexApi.injectEndpoints({
  endpoints: (builder) => ({
    // Check user in Sngine database
    checkUser: builder.mutation({
      query: ({ email, phone }) => ({
        url: '/auth/check-user',
        method: 'POST',
        body: { email, phone },
      }),
      invalidatesTags: ['Auth'],
    }),

    // Get health status
    healthCheck: builder.query({
      query: () => ({
        url: '/health',
        method: 'GET',
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useCheckUserMutation,
  useHealthCheckQuery,
} = authApi;
