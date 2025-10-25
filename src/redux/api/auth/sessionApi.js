//import { indexApi } from './indexApi';

import indexApi from "../indexApi";

export const sessionApi = indexApi.injectEndpoints({
  endpoints: (builder) => ({
    // Complete authentication and generate tokens
    completeAuthentication: builder.mutation({
      query: ({ sessionId }) => ({
        url: '/session/complete',
        method: 'POST',
        body: { sessionId },
      }),
      invalidatesTags: ['Session', 'Auth'],
    }),

    // Logout user
    logout: builder.mutation({
      query: ({ userId, sessionId }) => ({
        url: '/session/logout',
        method: 'POST',
        body: { userId, sessionId },
      }),
      invalidatesTags: ['Session', 'Auth'],
    }),

    // Refresh access token
    refreshAccessToken: builder.mutation({
      query: ({ refreshToken }) => ({
        url: '/token/refresh',
        method: 'POST',
        body: { refreshToken },
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useCompleteAuthenticationMutation,
  useLogoutMutation,
  useRefreshAccessTokenMutation,
} = sessionApi;