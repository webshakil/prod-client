//import { indexApi } from './indexApi';

import indexApi from "../indexApi";

export const userDetailsApi = indexApi.injectEndpoints({
  endpoints: (builder) => ({
    // Save user details (first-time)
    saveUserDetails: builder.mutation({
      query: ({
        sessionId,
        firstName,
        lastName,
        age,
        gender,
        country,
        city,
        timezone,
        language,
      }) => ({
        url: '/user-details/save',
        method: 'POST',
        body: {
          sessionId,
          firstName,
          lastName,
          age,
          gender,
          country,
          city,
          timezone,
          language,
        },
      }),
      invalidatesTags: ['User'],
    }),

    // Get user details by session
    getUserDetails: builder.query({
      query: (sessionId) => ({
        url: `/user-details/${sessionId}`,
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useSaveUserDetailsMutation,
  useGetUserDetailsQuery,
} = userDetailsApi;
// import { indexApi } from './indexApi';

// export const userDetailsApi = indexApi.injectEndpoints({
//   endpoints: (builder) => ({
//     // Save user details (first-time)
//     saveUserDetails: builder.mutation({
//       query: ({
//         sessionId,
//         firstName,
//         lastName,
//         age,
//         gender,
//         country,
//         city,
//         timezone,
//         language,
//       }) => ({
//         url: '/user-details/save',
//         method: 'POST',
//         body: {
//           sessionId,
//           firstName,
//           lastName,
//           age,
//           gender,
//           country,
//           city,
//           timezone,
//           language,
//         },
//       }),
//       invalidatesTags: ['User'],
//     }),

//     // Get user details by session
//     getUserDetails: builder.query({
//       query: (sessionId) => ({
//         url: `/user-details/${sessionId}`,
//         method: 'GET',
//       }),
//       providesTags: ['User'],
//     }),
//   }),
//   overrideExisting: false,
// });

// export const {
//   useSaveUserDetailsMutation,
//   useGetUserDetailsQuery,
// } = userDetailsApi;