import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:3002/api/v1',
  credentials: 'include',
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    
    // ✅ Add user data to headers for admin endpoints
    const userDataStr = localStorage.getItem('userData');
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        headers.set('x-user-data', JSON.stringify({
          userId: userData.userId,
          email: userData.email,
          phone: userData.phone || null,
          username: userData.username || null,
          roles: userData.roles || ['Voter'],
          subscriptionType: userData.subscriptionType || 'Free',
          isSubscribed: userData.isSubscribed || false
        }));
      } catch (error) {
        console.error('Error parsing userData:', error);
      }
    }
    
    return headers;
  },
});

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery,
  tagTypes: ['User', 'Profile', 'Preferences', 'AllUsers', 'Analytics'],
  endpoints: (builder) => ({
    // Get user by ID (public, no userId needed)
    getUserById: builder.query({
      query: (userId) => `/users/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),

    // Get current user complete data (send userId in body)
    getCompleteUserData: builder.mutation({
      query: (userId) => ({
        url: '/users/me/data',
        method: 'POST',
        body: { userId },
      }),
      invalidatesTags: ['User'],
    }),

    // Search users (public, no userId needed)
    searchUsers: builder.query({
      query: ({ q, limit = 20, offset = 0 }) =>
        `/users/search?q=${q}&limit=${limit}&offset=${offset}`,
      providesTags: ['User'],
    }),

    // Get user profile (send userId in body)
    getProfile: builder.mutation({
      query: (userId) => {
        console.log('🔄 RTK Query: GET profile for userId:', userId);
        return {
          url: '/profiles/me',
          method: 'POST',
          body: { userId },
        };
      },
      /*eslint-disable*/
      async onQueryStarted(userId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('✅ RTK Query: Profile response received:', data);
        } catch (error) {
          console.error('❌ RTK Query: Profile error:', error);
        }
      },
      providesTags: ['Profile'],
    }),

    // Update user profile (send userId + data in body)
    updateProfile: builder.mutation({
      query: ({ userId, ...profileData }) => {
        console.log('🔄 RTK Query: UPDATE profile for userId:', userId);
        return {
          url: '/profiles/me/update',
          method: 'POST',
          body: { userId, ...profileData },
        };
      },
      invalidatesTags: ['Profile', 'User'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('✅ RTK Query: Profile updated:', data);
        } catch (error) {
          console.error('❌ RTK Query: Update error:', error);
        }
      },
    }),

    // Get user preferences (send userId in body)
    getPreferences: builder.mutation({
      query: (userId) => {
        console.log('🔄 RTK Query: GET preferences for userId:', userId);
        return {
          url: '/profiles/me/preferences',
          method: 'POST',
          body: { userId },
        };
      },
      async onQueryStarted(userId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('✅ RTK Query: Preferences response received:', data);
        } catch (error) {
          console.error('❌ RTK Query: Preferences error:', error);
        }
      },
      providesTags: ['Preferences'],
    }),

    // Update user preferences (send userId + data in body)
    updatePreferences: builder.mutation({
      query: ({ userId, ...preferences }) => {
        console.log('🔄 RTK Query: UPDATE preferences for userId:', userId);
        return {
          url: '/profiles/me/preferences/update',
          method: 'POST',
          body: { userId, ...preferences },
        };
      },
      invalidatesTags: ['Preferences', 'User'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('✅ RTK Query: Preferences updated:', data);
        } catch (error) {
          console.error('❌ RTK Query: Update error:', error);
        }
      },
    }),

    // ✅ FIXED: Get all users (Admin only) - Use mutation to send userId in body
    getAllUsers: builder.mutation({
      query: ({ userId, page = 1, limit = 20, search = '', gender = '', country = '', ageMin = 0, ageMax = 150, sortBy = 'collected_at', sortOrder = 'DESC' }) => {
        console.log('🔄 RTK Query: GET all users for admin userId:', userId);
        return {
          url: '/users/admin/all',
          method: 'POST',
          body: {
            userId,
            page,
            limit,
            search,
            gender,
            country,
            ageMin,
            ageMax,
            sortBy,
            sortOrder,
          },
        };
      },
      invalidatesTags: ['AllUsers'],
    }),

    // ✅ FIXED: Get user analytics (Admin only) - Use mutation to send userId in body
    getUserAnalytics: builder.mutation({
      query: (userId) => {
        console.log('🔄 RTK Query: GET analytics for admin userId:', userId);
        return {
          url: '/users/admin/analytics',
          method: 'POST',
          body: { userId },
        };
      },
      invalidatesTags: ['Analytics'],
    }),
  }),
});

export const {
  useGetUserByIdQuery,
  useGetCompleteUserDataMutation,
  useSearchUsersQuery,
  useGetProfileMutation,
  useUpdateProfileMutation,
  useGetPreferencesMutation,
  useUpdatePreferencesMutation,
  useGetAllUsersMutation, // ← Changed from Query to Mutation
  useGetUserAnalyticsMutation, // ← Changed from Query to Mutation
} = userApi;
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const baseQuery = fetchBaseQuery({
//   baseUrl: import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:3002/api/v1',
//   credentials: 'include',
//   prepareHeaders: (headers) => {
//     headers.set('Content-Type', 'application/json');
    
//     // ✅ Add user data to headers for admin endpoints
//     const userDataStr = localStorage.getItem('userData');
//     if (userDataStr) {
//       try {
//         const userData = JSON.parse(userDataStr);
//         headers.set('x-user-data', JSON.stringify({
//           userId: userData.userId,
//           email: userData.email,
//           phone: userData.phone || null,
//           username: userData.username || null,
//           roles: userData.roles || ['Voter'],
//           subscriptionType: userData.subscriptionType || 'Free',
//           isSubscribed: userData.isSubscribed || false
//         }));
//       } catch (error) {
//         console.error('Error parsing userData:', error);
//       }
//     }
    
//     return headers;
//   },
// });

// export const userApi = createApi({
//   reducerPath: 'userApi',
//   baseQuery,
//   tagTypes: ['User', 'Profile', 'Preferences', 'AllUsers', 'Analytics'],
//   endpoints: (builder) => ({
//     // Get user by ID (public, no userId needed)
//     getUserById: builder.query({
//       query: (userId) => `/users/${userId}`,
//       providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
//     }),

//     // Get current user complete data (send userId in body)
//     getCompleteUserData: builder.mutation({
//       query: (userId) => ({
//         url: '/users/me/data',
//         method: 'POST',
//         body: { userId },
//       }),
//       invalidatesTags: ['User'],
//     }),

//     // Search users (public, no userId needed)
//     searchUsers: builder.query({
//       query: ({ q, limit = 20, offset = 0 }) =>
//         `/users/search?q=${q}&limit=${limit}&offset=${offset}`,
//       providesTags: ['User'],
//     }),

//     // Get user profile (send userId in body)
//     getProfile: builder.mutation({
//       query: (userId) => {
//         console.log('🔄 RTK Query: GET profile for userId:', userId);
//         return {
//           url: '/profiles/me',
//           method: 'POST',
//           body: { userId },
//         };
//       },
//       /*eslint-disable*/
//       async onQueryStarted(userId, { dispatch, queryFulfilled }) {
//         try {
//           const { data } = await queryFulfilled;
//           console.log('✅ RTK Query: Profile response received:', data);
//         } catch (error) {
//           console.error('❌ RTK Query: Profile error:', error);
//         }
//       },
//       providesTags: ['Profile'],
//     }),

//     // Update user profile (send userId + data in body)
//     updateProfile: builder.mutation({
//       query: ({ userId, ...profileData }) => {
//         console.log('🔄 RTK Query: UPDATE profile for userId:', userId);
//         return {
//           url: '/profiles/me/update',
//           method: 'POST',
//           body: { userId, ...profileData },
//         };
//       },
//       invalidatesTags: ['Profile', 'User'],
//       async onQueryStarted(arg, { dispatch, queryFulfilled }) {
//         try {
//           const { data } = await queryFulfilled;
//           console.log('✅ RTK Query: Profile updated:', data);
//         } catch (error) {
//           console.error('❌ RTK Query: Update error:', error);
//         }
//       },
//     }),

//     // Get user preferences (send userId in body)
//     getPreferences: builder.mutation({
//       query: (userId) => {
//         console.log('🔄 RTK Query: GET preferences for userId:', userId);
//         return {
//           url: '/profiles/me/preferences',
//           method: 'POST',
//           body: { userId },
//         };
//       },
//       async onQueryStarted(userId, { dispatch, queryFulfilled }) {
//         try {
//           const { data } = await queryFulfilled;
//           console.log('✅ RTK Query: Preferences response received:', data);
//         } catch (error) {
//           console.error('❌ RTK Query: Preferences error:', error);
//         }
//       },
//       providesTags: ['Preferences'],
//     }),

//     // Update user preferences (send userId + data in body)
//     updatePreferences: builder.mutation({
//       query: ({ userId, ...preferences }) => {
//         console.log('🔄 RTK Query: UPDATE preferences for userId:', userId);
//         return {
//           url: '/profiles/me/preferences/update',
//           method: 'POST',
//           body: { userId, ...preferences },
//         };
//       },
//       invalidatesTags: ['Preferences', 'User'],
//       async onQueryStarted(arg, { dispatch, queryFulfilled }) {
//         try {
//           const { data } = await queryFulfilled;
//           console.log('✅ RTK Query: Preferences updated:', data);
//         } catch (error) {
//           console.error('❌ RTK Query: Update error:', error);
//         }
//       },
//     }),

//     // ✅ NEW: Get all users (Admin only)
//     getAllUsers: builder.query({
//       query: ({ page = 1, limit = 20, search = '', gender = '', country = '', ageMin = 0, ageMax = 150, sortBy = 'collected_at', sortOrder = 'DESC' }) => {
//         const params = new URLSearchParams({
//           page: page.toString(),
//           limit: limit.toString(),
//           ...(search && { search }),
//           ...(gender && { gender }),
//           ...(country && { country }),
//           ageMin: ageMin.toString(),
//           ageMax: ageMax.toString(),
//           sortBy,
//           sortOrder,
//         });
//         return `/users/admin/all?${params.toString()}`;
//       },
//       providesTags: ['AllUsers'],
//     }),

//     // ✅ NEW: Get user analytics (Admin only)
//     getUserAnalytics: builder.query({
//       query: () => '/users/admin/analytics',
//       providesTags: ['Analytics'],
//     }),
//   }),
// });

// export const {
//   useGetUserByIdQuery,
//   useGetCompleteUserDataMutation,
//   useSearchUsersQuery,
//   useGetProfileMutation,
//   useUpdateProfileMutation,
//   useGetPreferencesMutation,
//   useUpdatePreferencesMutation,
//   useGetAllUsersQuery,
//   useGetUserAnalyticsQuery,
// } = userApi;
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const baseQuery = fetchBaseQuery({
//   baseUrl: import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:3002/api/v1',
//   credentials: 'include',
//   prepareHeaders: (headers) => {
//     headers.set('Content-Type', 'application/json');
//     return headers;
//   },
// });

// export const userApi = createApi({
//   reducerPath: 'userApi',
//   baseQuery,
//   tagTypes: ['User', 'Profile', 'Preferences'],
//   endpoints: (builder) => ({
//     // Get user by ID (public, no userId needed)
//     getUserById: builder.query({
//       query: (userId) => `/users/${userId}`,
//       providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
//     }),

//     // Get current user complete data (send userId in body)
//     getCompleteUserData: builder.mutation({
//       query: (userId) => ({
//         url: '/users/me/data',
//         method: 'POST',
//         body: { userId },
//       }),
//       invalidatesTags: ['User'],
//     }),

//     // Search users (public, no userId needed)
//     searchUsers: builder.query({
//       query: ({ q, limit = 20, offset = 0 }) =>
//         `/users/search?q=${q}&limit=${limit}&offset=${offset}`,
//       providesTags: ['User'],
//     }),

//     // ✅ Get user profile (send userId in body) - FIXED
//     getProfile: builder.mutation({
//       query: (userId) => {
//         console.log('🔄 RTK Query: GET profile for userId:', userId);
//         return {
//           url: '/profiles/me',
//           method: 'POST',
//           body: { userId },
//         };
//       },
//       /*eslint-disable*/
//       async onQueryStarted(userId, { dispatch, queryFulfilled }) {
//         try {
//           const { data } = await queryFulfilled;
//           console.log('✅ RTK Query: Profile response received:', data);
//         } catch (error) {
//           console.error('❌ RTK Query: Profile error:', error);
//         }
//       },
//       providesTags: ['Profile'],
//     }),

//     // ✅ Update user profile (send userId + data in body) - FIXED
//     updateProfile: builder.mutation({
//       query: ({ userId, ...profileData }) => {
//         console.log('🔄 RTK Query: UPDATE profile for userId:', userId);
//         return {
//           url: '/profiles/me/update',
//           method: 'POST',
//           body: { userId, ...profileData },
//         };
//       },
//       invalidatesTags: ['Profile', 'User'],
//       async onQueryStarted(arg, { dispatch, queryFulfilled }) {
//         try {
//           const { data } = await queryFulfilled;
//           console.log('✅ RTK Query: Profile updated:', data);
//         } catch (error) {
//           console.error('❌ RTK Query: Update error:', error);
//         }
//       },
//     }),

//     // ✅ Get user preferences (send userId in body) - FIXED
//     getPreferences: builder.mutation({
//       query: (userId) => {
//         console.log('🔄 RTK Query: GET preferences for userId:', userId);
//         return {
//           url: '/profiles/me/preferences',
//           method: 'POST',
//           body: { userId },
//         };
//       },
//       async onQueryStarted(userId, { dispatch, queryFulfilled }) {
//         try {
//           const { data } = await queryFulfilled;
//           console.log('✅ RTK Query: Preferences response received:', data);
//         } catch (error) {
//           console.error('❌ RTK Query: Preferences error:', error);
//         }
//       },
//       providesTags: ['Preferences'],
//     }),

//     // ✅ Update user preferences (send userId + data in body) - FIXED
//     updatePreferences: builder.mutation({
//       query: ({ userId, ...preferences }) => {
//         console.log('🔄 RTK Query: UPDATE preferences for userId:', userId);
//         return {
//           url: '/profiles/me/preferences/update',
//           method: 'POST',
//           body: { userId, ...preferences },
//         };
//       },
//       invalidatesTags: ['Preferences', 'User'],
//       async onQueryStarted(arg, { dispatch, queryFulfilled }) {
//         try {
//           const { data } = await queryFulfilled;
//           console.log('✅ RTK Query: Preferences updated:', data);
//         } catch (error) {
//           console.error('❌ RTK Query: Update error:', error);
//         }
//       },
//     }),
//   }),
// });

// export const {
//   useGetUserByIdQuery,
//   useGetCompleteUserDataMutation,
//   useSearchUsersQuery,
//   useGetProfileMutation,
//   useUpdateProfileMutation,
//   useGetPreferencesMutation,
//   useUpdatePreferencesMutation,
// } = userApi;
