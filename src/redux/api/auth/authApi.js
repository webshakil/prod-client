import indexApi from "../indexApi";

export const authApi = indexApi.injectEndpoints({
  endpoints: (builder) => ({
    // Check user in Sngine database (existing - database check)
    checkUser: builder.mutation({
      query: ({ email, phone }) => ({
        url: '/auth/check-user',
        method: 'POST',
        body: { email, phone },
      }),
      invalidatesTags: ['Auth'],
    }),

    // ✅ NEW: Verify Sngine token (for manual API calls if needed)
    verifySngineToken: builder.mutation({
      query: ({ token }) => ({
        url: '/sngine/callback',
        method: 'POST',
        body: { token },
      }),
      invalidatesTags: ['Auth'],
    }),

    // ✅ NEW: Verify Sngine token validity only (no session creation)
    checkSngineToken: builder.mutation({
      query: ({ token }) => ({
        url: '/sngine/verify',
        method: 'POST',
        body: { token },
      }),
    }),

    // Get health status
    healthCheck: builder.query({
      query: () => ({
        url: '/health',
        method: 'GET',
      }),
    }),

    // ✅ NEW: Sngine health check
    sngineHealthCheck: builder.query({
      query: () => ({
        url: '/sngine/health',
        method: 'GET',
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useCheckUserMutation,
  useVerifySngineTokenMutation,
  useCheckSngineTokenMutation,
  useHealthCheckQuery,
  useSngineHealthCheckQuery,
} = authApi;





//last workable code only to add api abvoe code
// //import { indexApi } from './indexApi';

// import indexApi from "../indexApi";

// export const authApi = indexApi.injectEndpoints({
//   endpoints: (builder) => ({
//     // Check user in Sngine database
//     checkUser: builder.mutation({
//       query: ({ email, phone }) => ({
//         url: '/auth/check-user',
//         method: 'POST',
//         body: { email, phone },
//       }),
//       invalidatesTags: ['Auth'],
//     }),

//     // Get health status
//     healthCheck: builder.query({
//       query: () => ({
//         url: '/health',
//         method: 'GET',
//       }),
//     }),
//   }),
//   overrideExisting: false,
// });

// export const {
//   useCheckUserMutation,
//   useHealthCheckQuery,
// } = authApi;
