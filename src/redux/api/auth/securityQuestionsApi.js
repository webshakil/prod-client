//import { indexApi } from './indexApi';

import indexApi from "../indexApi";

export const securityQuestionsApi = indexApi.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch security questions
    getSecurityQuestions: builder.query({
      query: () => ({
        url: '/security-questions/questions',
        method: 'GET',
      }),
      providesTags: ['SecurityQuestions'],
    }),

    // Set security questions answers (first-time)
    setSecurityQuestions: builder.mutation({
      query: ({ sessionId, answers }) => ({
        url: '/security-questions/set',
        method: 'POST',
        body: { sessionId, answers },
      }),
      invalidatesTags: ['SecurityQuestions'],
    }),

    // Verify security questions (returning user)
    verifySecurityQuestions: builder.mutation({
      query: ({ sessionId, answers }) => ({
        url: '/security-questions/verify',
        method: 'POST',
        body: { sessionId, answers },
      }),
      invalidatesTags: ['SecurityQuestions'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSecurityQuestionsQuery,
  useSetSecurityQuestionsMutation,
  useVerifySecurityQuestionsMutation,
} = securityQuestionsApi;
// import { indexApi } from './indexApi';

// export const securityQuestionsApi = indexApi.injectEndpoints({
//   endpoints: (builder) => ({
//     // Fetch security questions
//     getSecurityQuestions: builder.query({
//       query: () => ({
//         url: '/security-questions/questions',
//         method: 'GET',
//       }),
//       providesTags: ['SecurityQuestions'],
//     }),

//     // Set security questions answers (first-time)
//     setSecurityQuestions: builder.mutation({
//       query: ({ sessionId, answers }) => ({
//         url: '/security-questions/set',
//         method: 'POST',
//         body: { sessionId, answers },
//       }),
//       invalidatesTags: ['SecurityQuestions'],
//     }),

//     // Verify security questions (returning user)
//     verifySecurityQuestions: builder.mutation({
//       query: ({ sessionId, answers }) => ({
//         url: '/security-questions/verify',
//         method: 'POST',
//         body: { sessionId, answers },
//       }),
//       invalidatesTags: ['SecurityQuestions'],
//     }),
//   }),
//   overrideExisting: false,
// });

// export const {
//   useGetSecurityQuestionsQuery,
//   useSetSecurityQuestionsMutation,
//   useVerifySecurityQuestionsMutation,
// } = securityQuestionsApi;