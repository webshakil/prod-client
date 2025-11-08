import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL_SUBSCRIPTION || 'http://localhost:3003/api/v1';

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState, endpoint }) => {
    const state = getState();
    
    // List of public endpoints that don't require authentication
    const publicEndpoints = ['getAllPlans', 'getPlanById', 'getPlanRegionalPrices'];
    
    // Skip auth headers for public endpoints
    if (publicEndpoints.includes(endpoint)) {
      console.log('🌐 Public endpoint - skipping auth');
      return headers;
    }
    
    // ✅ Get auth data from Redux state
    let token = state.auth?.accessToken;
    let userId = state.auth?.userId;
    let email = state.auth?.email;
    const roles = state.auth?.roles;
    const primaryRole = state.auth?.primaryRole;
    
    // ✅ FALLBACK: If Redux is empty, try localStorage
    if (!token || !userId || !email) {
      console.log('⚠️ Redux empty, checking localStorage...');
      
      token = token || localStorage.getItem('accessToken');
      userId = userId || localStorage.getItem('userId');
      
      // Try to get email from userData JSON
      const userData = localStorage.getItem('userData');
      if (userData && !email) {
        try {
          const parsed = JSON.parse(userData);
          email = parsed.email;
          userId = userId || parsed.userId;
        } catch (e) {
          console.error('Failed to parse userData:', e);
        }
      }
      
      console.log('✅ Got from localStorage:', { hasToken: !!token, userId, email });
    }
    
    // Debug logging
    console.log('🔐 Auth Debug:', {
      hasToken: !!token,
      userId: userId,
      email: email,
      roles: roles,
      primaryRole: primaryRole
    });
    
    // ✅ FIXED: Determine the role to send to backend - CHECK FOR HIGHEST PRIVILEGE ROLE
   // Around line 58-80, replace this section:

// ✅ FIXED: Determine the role to send to backend - CHECK FOR HIGHEST PRIVILEGE ROLE
let userRole = 'voter'; // Default

// ALWAYS check roles array first, ignore primaryRole
if (roles && Array.isArray(roles) && roles.length > 0) {
  // Priority order: Admin > Manager > Moderator > ContentCreator > Voter
  const rolesPriority = ['manager', 'admin', 'moderator', 'auditor', 'editor', 'advertiser','analyst','voter'];
  
  console.log('🔍 Checking roles array:', roles);
  
  // Find the highest priority role the user has
  for (const priorityRole of rolesPriority) {
    const hasRole = roles.find(r => r.toLowerCase() === priorityRole);
    if (hasRole) {
      userRole = priorityRole;
      console.log('✅ Found highest priority role:', userRole);
      break;
    }
  }
}

console.log('👤 Final role being sent:', userRole);

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
      headers.set('x-user-id', String(userId || ''));
      headers.set('x-user-email', String(email || ''));
      headers.set('x-user-role', userRole); // This should now be 'admin' or 'manager'
      
      console.log('✅ Headers set successfully');
      console.log('   Token:', token ? `${token.substring(0, 20)}...` : 'none');
      console.log('   User ID:', userId);
      console.log('   Email:', email);
      console.log('   Role:', userRole);
    } else {
      console.warn('⚠️ No authentication token found for protected endpoint');
    }

    return headers;
  },
});

export const subscriptionApi = createApi({
  reducerPath: 'subscriptionApi',
  baseQuery,
  tagTypes: ['Plans', 'Subscriptions', 'Payments', 'GatewayConfig', 'CountryRegion'],
  endpoints: (builder) => ({
    // ==================== SUBSCRIPTION PLANS (PUBLIC) ====================
    getAllPlans: builder.query({
      query: () => '/subscriptions/plans',
      providesTags: ['Plans'],
    }),

    getPlanById: builder.query({
      query: (planId) => `/subscriptions/plans/${planId}`,
      providesTags: ['Plans'],
    }),

    getPlanRegionalPrices: builder.query({
      query: (planId) => `/subscriptions/plans/${planId}/regional-prices`,
      providesTags: ['Plans'],
    }),

    // ==================== USER SUBSCRIPTIONS ====================
    getUserCurrentSubscription: builder.query({
      query: () => '/subscriptions/user/current',
      providesTags: ['Subscriptions'],
    }),

    checkSubscriptionValid: builder.query({
      query: () => '/subscriptions/user/valid',
      providesTags: ['Subscriptions'],
    }),

    getSubscriptionHistory: builder.query({
      query: ({ limit = 10, offset = 0 } = {}) =>
        `/subscriptions/user/history?limit=${limit}&offset=${offset}`,
      providesTags: ['Subscriptions'],
    }),

    // ==================== PAYMENTS & GATEWAY ====================
    getGatewayRecommendation: builder.query({
      query: ({ country_code, plan_id }) =>
        `/payments/gateway-recommendation?country_code=${country_code}${plan_id ? `&plan_id=${plan_id}` : ''}`,
      providesTags: ['GatewayConfig'],
    }),

    createPayment: builder.mutation({
      query: (paymentData) => ({
        url: '/payments/create',
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: ['Payments'],
    }),

    verifyPayment: builder.mutation({
      query: (verificationData) => ({
        url: '/payments/verify',
        method: 'POST',
        body: verificationData,
      }),
    }),

    getUserPayments: builder.query({
      query: ({ limit = 20, offset = 0 } = {}) =>
        `/payments/user?limit=${limit}&offset=${offset}`,
      providesTags: ['Payments'],
    }),

    // ==================== COUNTRY & REGION ====================
    getRegionByCountry: builder.query({
      query: (country_code) => `/country-region/region/${country_code}`,
      providesTags: ['CountryRegion'],
    }),

    getCountriesByRegion: builder.query({
      query: (region) => `/country-region/countries/${region}`,
      providesTags: ['CountryRegion'],
    }),

    getAllCountryMappings: builder.query({
      query: () => '/country-region/all',
      providesTags: ['CountryRegion'],
    }),

    // ==================== ADMIN ENDPOINTS ====================
    createPlan: builder.mutation({
      query: (planData) => ({
        url: '/subscriptions/plans',
        method: 'POST',
        body: planData,
      }),
      invalidatesTags: ['Plans'],
    }),

    updatePlan: builder.mutation({
      query: ({ planId, ...planData }) => ({
        url: `/subscriptions/plans/${planId}`,
        method: 'PUT',
        body: planData,
      }),
      invalidatesTags: ['Plans'],
    }),

    updateEditableFields: builder.mutation({
      query: ({ planId, ...planData }) => ({
        url: `/subscriptions/plans/${planId}/editable-fields`,
        method: 'PUT',
        body: planData,
      }),
      invalidatesTags: ['Plans'],
    }),

    setRegionalPrices: builder.mutation({
      query: ({ planId, prices }) => ({
        url: `/subscriptions/plans/${planId}/regional-prices`,
        method: 'POST',
        body: { prices },
      }),
      invalidatesTags: ['Plans'],
    }),

    // ==================== ADMIN GATEWAY CONFIG ====================
    getAllGatewayConfigs: builder.query({
      query: () => '/admin/gateway-config',
      providesTags: ['GatewayConfig'],
    }),

    getGatewayConfigByRegion: builder.query({
      query: (regionId) => `/admin/gateway-config/${regionId}`,
      providesTags: ['GatewayConfig'],
    }),

    setGatewayConfig: builder.mutation({
      query: ({ region, ...config }) => ({
        url: `/admin/gateway-config/${region}`,
        method: 'POST',
        body: config,
      }),
      invalidatesTags: ['GatewayConfig'],
    }),

    updateProcessingFee: builder.mutation({
      query: (percentage) => ({
        url: '/admin/processing-fee',
        method: 'POST',
        body: { percentage },
      }),
      invalidatesTags: ['GatewayConfig'],
    }),

    getProcessingFee: builder.query({
      query: () => '/admin/processing-fee',
      providesTags: ['GatewayConfig'],
    }),

    addCountryMapping: builder.mutation({
      query: (mappingData) => ({
        url: '/country-region/add',
        method: 'POST',
        body: mappingData,
      }),
      invalidatesTags: ['CountryRegion'],
    }),
  }),
});

export const {
  useGetAllPlansQuery,
  useGetPlanByIdQuery,
  useGetPlanRegionalPricesQuery,
  useGetUserCurrentSubscriptionQuery,
  useCheckSubscriptionValidQuery,
  useGetSubscriptionHistoryQuery,
  useGetGatewayRecommendationQuery,
  useCreatePaymentMutation,
  useVerifyPaymentMutation,
  useGetUserPaymentsQuery,
  useGetRegionByCountryQuery,
  useGetCountriesByRegionQuery,
  useGetAllCountryMappingsQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useUpdateEditableFieldsMutation,
  useSetRegionalPricesMutation,
  useGetAllGatewayConfigsQuery,
  useGetGatewayConfigByRegionQuery,
  useSetGatewayConfigMutation,
  useUpdateProcessingFeeMutation,
  useGetProcessingFeeQuery,
  useAddCountryMappingMutation,
} = subscriptionApi;
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL_SUBSCRIPTION || 'http://localhost:3003/api/v1';

// const baseQuery = fetchBaseQuery({
//   baseUrl: API_BASE_URL,
//   prepareHeaders: (headers, { getState, endpoint }) => {
//     const state = getState();
    
//     // List of public endpoints that don't require authentication
//     const publicEndpoints = ['getAllPlans', 'getPlanById', 'getPlanRegionalPrices'];
    
//     // Skip auth headers for public endpoints
//     if (publicEndpoints.includes(endpoint)) {
//       console.log('🌐 Public endpoint - skipping auth');
//       return headers;
//     }
    
//     // ✅ Get auth data from Redux state
//     let token = state.auth?.accessToken;
//     let userId = state.auth?.userId;
//     let email = state.auth?.email;
//     const roles = state.auth?.roles;
//     const primaryRole = state.auth?.primaryRole;
    
//     // ✅ FALLBACK: If Redux is empty, try localStorage
//     if (!token || !userId || !email) {
//       console.log('⚠️ Redux empty, checking localStorage...');
      
//       token = token || localStorage.getItem('accessToken');
//       userId = userId || localStorage.getItem('userId');
      
//       // Try to get email from userData JSON
//       const userData = localStorage.getItem('userData');
//       if (userData && !email) {
//         try {
//           const parsed = JSON.parse(userData);
//           email = parsed.email;
//           userId = userId || parsed.userId;
//         } catch (e) {
//           console.error('Failed to parse userData:', e);
//         }
//       }
      
//       console.log('✅ Got from localStorage:', { hasToken: !!token, userId, email });
//     }
    
//     // Debug logging
//     console.log('🔐 Auth Debug:', {
//       hasToken: !!token,
//       userId: userId,
//       email: email,
//       roles: roles,
//       primaryRole: primaryRole
//     });
    
//     // Determine the role to send to backend
//     let userRole = 'voter'; // Default
    
//     // if (primaryRole) {
//     //   userRole = primaryRole.toLowerCase();
//     // } else if (roles && Array.isArray(roles) && roles.length > 0) {
//     //   userRole = roles[0].toLowerCase();
//     // }
//     if (primaryRole) {
//   userRole = primaryRole.toLowerCase();
// } else if (roles && Array.isArray(roles) && roles.length > 0) {
//   // Priority order: Admin > Manager > Moderator > others
//   const rolesPriority = ['admin', 'manager', 'moderator', 'contentcreator', 'voter'];
  
//   // Find the highest priority role the user has
//   for (const priorityRole of rolesPriority) {
//     const hasRole = roles.find(r => r.toLowerCase() === priorityRole);
//     if (hasRole) {
//       userRole = priorityRole;
//       break;
//     }
//   }
// }
    
//     console.log('👤 Sending role:', userRole);

//     if (token) {
//       headers.set('Authorization', `Bearer ${token}`);
//       headers.set('x-user-id', String(userId || ''));
//       headers.set('x-user-email', String(email || ''));
//       headers.set('x-user-role', userRole);
      
//       console.log('✅ Headers set successfully');
//       console.log('   Token:', token ? `${token.substring(0, 20)}...` : 'none');
//       console.log('   User ID:', userId);
//       console.log('   Email:', email);
//     } else {
//       console.warn('⚠️ No authentication token found for protected endpoint');
//     }

//     return headers;
//   },
// });

// export const subscriptionApi = createApi({
//   reducerPath: 'subscriptionApi',
//   baseQuery,
//   tagTypes: ['Plans', 'Subscriptions', 'Payments', 'GatewayConfig', 'CountryRegion'],
//   endpoints: (builder) => ({
//     // ==================== SUBSCRIPTION PLANS (PUBLIC) ====================
//     getAllPlans: builder.query({
//       query: () => '/subscriptions/plans',
//       providesTags: ['Plans'],
//     }),

//     getPlanById: builder.query({
//       query: (planId) => `/subscriptions/plans/${planId}`,
//       providesTags: ['Plans'],
//     }),

//     getPlanRegionalPrices: builder.query({
//       query: (planId) => `/subscriptions/plans/${planId}/regional-prices`,
//       providesTags: ['Plans'],
//     }),

//     // ==================== USER SUBSCRIPTIONS ====================
//     getUserCurrentSubscription: builder.query({
//       query: () => '/subscriptions/user/current',
//       providesTags: ['Subscriptions'],
//     }),

//     checkSubscriptionValid: builder.query({
//       query: () => '/subscriptions/user/valid',
//       providesTags: ['Subscriptions'],
//     }),

//     getSubscriptionHistory: builder.query({
//       query: ({ limit = 10, offset = 0 } = {}) =>
//         `/subscriptions/user/history?limit=${limit}&offset=${offset}`,
//       providesTags: ['Subscriptions'],
//     }),

//     // ==================== PAYMENTS & GATEWAY ====================
//     getGatewayRecommendation: builder.query({
//       query: ({ country_code, plan_id }) =>
//         `/payments/gateway-recommendation?country_code=${country_code}${plan_id ? `&plan_id=${plan_id}` : ''}`,
//       providesTags: ['GatewayConfig'],
//     }),

//     createPayment: builder.mutation({
//       query: (paymentData) => ({
//         url: '/payments/create',
//         method: 'POST',
//         body: paymentData,
//       }),
//       invalidatesTags: ['Payments'],
//     }),

//     verifyPayment: builder.mutation({
//       query: (verificationData) => ({
//         url: '/payments/verify',
//         method: 'POST',
//         body: verificationData,
//       }),
//     }),

//     getUserPayments: builder.query({
//       query: ({ limit = 20, offset = 0 } = {}) =>
//         `/payments/user?limit=${limit}&offset=${offset}`,
//       providesTags: ['Payments'],
//     }),

//     // ==================== COUNTRY & REGION ====================
//     getRegionByCountry: builder.query({
//       query: (country_code) => `/country-region/region/${country_code}`,
//       providesTags: ['CountryRegion'],
//     }),

//     getCountriesByRegion: builder.query({
//       query: (region) => `/country-region/countries/${region}`,
//       providesTags: ['CountryRegion'],
//     }),

//     getAllCountryMappings: builder.query({
//       query: () => '/country-region/all',
//       providesTags: ['CountryRegion'],
//     }),

//     // ==================== ADMIN ENDPOINTS ====================
//     createPlan: builder.mutation({
//       query: (planData) => ({
//         url: '/subscriptions/plans',
//         method: 'POST',
//         body: planData,
//       }),
//       invalidatesTags: ['Plans'],
//     }),

//     updatePlan: builder.mutation({
//       query: ({ planId, ...planData }) => ({
//         url: `/subscriptions/plans/${planId}`,
//         method: 'PUT',
//         body: planData,
//       }),
//       invalidatesTags: ['Plans'],
//     }),

//     updateEditableFields: builder.mutation({
//       query: ({ planId, ...planData }) => ({
//         url: `/subscriptions/plans/${planId}/editable-fields`,
//         method: 'PUT',
//         body: planData,
//       }),
//       invalidatesTags: ['Plans'],
//     }),

//     setRegionalPrices: builder.mutation({
//       query: ({ planId, prices }) => ({
//         url: `/subscriptions/plans/${planId}/regional-prices`,
//         method: 'POST',
//         body: { prices },
//       }),
//       invalidatesTags: ['Plans'],
//     }),

//     // ==================== ADMIN GATEWAY CONFIG ====================
//     getAllGatewayConfigs: builder.query({
//       query: () => '/admin/gateway-config',
//       providesTags: ['GatewayConfig'],
//     }),

//     getGatewayConfigByRegion: builder.query({
//       query: (regionId) => `/admin/gateway-config/${regionId}`,
//       providesTags: ['GatewayConfig'],
//     }),

//     setGatewayConfig: builder.mutation({
//       query: ({ region, ...config }) => ({
//         url: `/admin/gateway-config/${region}`,
//         method: 'POST',
//         body: config,
//       }),
//       invalidatesTags: ['GatewayConfig'],
//     }),

//     updateProcessingFee: builder.mutation({
//       query: (percentage) => ({
//         url: '/admin/processing-fee',
//         method: 'POST',
//         body: { percentage },
//       }),
//       invalidatesTags: ['GatewayConfig'],
//     }),

//     getProcessingFee: builder.query({
//       query: () => '/admin/processing-fee',
//       providesTags: ['GatewayConfig'],
//     }),

//     addCountryMapping: builder.mutation({
//       query: (mappingData) => ({
//         url: '/country-region/add',
//         method: 'POST',
//         body: mappingData,
//       }),
//       invalidatesTags: ['CountryRegion'],
//     }),
//   }),
// });

// export const {
//   useGetAllPlansQuery,
//   useGetPlanByIdQuery,
//   useGetPlanRegionalPricesQuery,
//   useGetUserCurrentSubscriptionQuery,
//   useCheckSubscriptionValidQuery,
//   useGetSubscriptionHistoryQuery,
//   useGetGatewayRecommendationQuery,
//   useCreatePaymentMutation,
//   useVerifyPaymentMutation,
//   useGetUserPaymentsQuery,
//   useGetRegionByCountryQuery,
//   useGetCountriesByRegionQuery,
//   useGetAllCountryMappingsQuery,
//   useCreatePlanMutation,
//   useUpdatePlanMutation,
//   useUpdateEditableFieldsMutation,
//   useSetRegionalPricesMutation,
//   useGetAllGatewayConfigsQuery,
//   useGetGatewayConfigByRegionQuery,
//   useSetGatewayConfigMutation,
//   useUpdateProcessingFeeMutation,
//   useGetProcessingFeeQuery,
//   useAddCountryMappingMutation,
// } = subscriptionApi;

//last workbale code where stripe is working well. for paddle we are using above code
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL_SUBSCRIPTION || 'http://localhost:3003/api/v1';

// const baseQuery = fetchBaseQuery({
//   baseUrl: API_BASE_URL,
//   prepareHeaders: (headers, { getState, endpoint }) => {
//     const state = getState();
    
//     // List of public endpoints that don't require authentication
//     const publicEndpoints = ['getAllPlans', 'getPlanById', 'getPlanRegionalPrices'];
    
//     // Skip auth headers for public endpoints
//     if (publicEndpoints.includes(endpoint)) {
//       console.log('🌐 Public endpoint - skipping auth');
//       return headers;
//     }
    
//     // Get auth data from Redux state
//     const token = state.auth?.accessToken;
//     const userId = state.auth?.userId;
//     const email = state.auth?.email;  // ✅ ADD: Get email from auth state
//     const roles = state.auth?.roles;
//     const primaryRole = state.auth?.primaryRole;
    
//     // Debug logging
//     console.log('🔐 Auth Debug:', {
//       hasToken: !!token,
//       userId: userId,
//       email: email,  // ✅ ADD: Log email
//       roles: roles,
//       primaryRole: primaryRole
//     });
    
//     // Determine the role to send to backend
//     // Priority: primaryRole > first role in array > default to 'admin'
//     let userRole = 'admin'; // Default
    
//     if (primaryRole) {
//       userRole = primaryRole.toLowerCase();
//     } else if (roles && Array.isArray(roles) && roles.length > 0) {
//       userRole = roles[0].toLowerCase();
//     }
    
//     console.log('👤 Sending role:', userRole);

//     if (token) {
//       headers.set('Authorization', `Bearer ${token}`);
//       headers.set('x-user-id', String(userId || ''));
//       headers.set('x-user-email', String(email || ''));  // ✅ ADD: Include email header
//       headers.set('x-user-role', userRole);
      
//       console.log('✅ Headers set successfully with email:', email);
//     } else {
//       console.warn('⚠️ No authentication token found for protected endpoint');
//     }

//     return headers;
//   },
// });

// export const subscriptionApi = createApi({
//   reducerPath: 'subscriptionApi',
//   baseQuery,
//   tagTypes: ['Plans', 'Subscriptions', 'Payments', 'GatewayConfig', 'CountryRegion'],
//   endpoints: (builder) => ({
//     // ==================== SUBSCRIPTION PLANS (PUBLIC) ====================
//     getAllPlans: builder.query({
//       query: () => '/subscriptions/plans',
//       providesTags: ['Plans'],
//     }),

//     getPlanById: builder.query({
//       query: (planId) => `/subscriptions/plans/${planId}`,
//       providesTags: ['Plans'],
//     }),

//     getPlanRegionalPrices: builder.query({
//       query: (planId) => `/subscriptions/plans/${planId}/regional-prices`,
//       providesTags: ['Plans'],
//     }),

//     // ==================== USER SUBSCRIPTIONS ====================
//     getUserCurrentSubscription: builder.query({
//       query: () => '/subscriptions/user/current',
//       providesTags: ['Subscriptions'],
//     }),

//     checkSubscriptionValid: builder.query({
//       query: () => '/subscriptions/user/valid',
//       providesTags: ['Subscriptions'],
//     }),

//     getSubscriptionHistory: builder.query({
//       query: ({ limit = 10, offset = 0 } = {}) =>
//         `/subscriptions/user/history?limit=${limit}&offset=${offset}`,
//       providesTags: ['Subscriptions'],
//     }),

//     // ==================== PAYMENTS & GATEWAY ====================
//     getGatewayRecommendation: builder.query({
//       query: ({ country_code, plan_id }) =>
//         `/payments/gateway-recommendation?country_code=${country_code}${plan_id ? `&plan_id=${plan_id}` : ''}`,
//       providesTags: ['GatewayConfig'],
//     }),

//     createPayment: builder.mutation({
//       query: (paymentData) => ({
//         url: '/payments/create',
//         method: 'POST',
//         body: paymentData,
//       }),
//       invalidatesTags: ['Payments'],
//     }),

//     verifyPayment: builder.mutation({
//       query: (verificationData) => ({
//         url: '/payments/verify',
//         method: 'POST',
//         body: verificationData,
//       }),
//     }),

//     getUserPayments: builder.query({
//       query: ({ limit = 20, offset = 0 } = {}) =>
//         `/payments/user?limit=${limit}&offset=${offset}`,
//       providesTags: ['Payments'],
//     }),

//     // ==================== COUNTRY & REGION ====================
//     getRegionByCountry: builder.query({
//       query: (country_code) => `/country-region/region/${country_code}`,
//       providesTags: ['CountryRegion'],
//     }),

//     getCountriesByRegion: builder.query({
//       query: (region) => `/country-region/countries/${region}`,
//       providesTags: ['CountryRegion'],
//     }),

//     getAllCountryMappings: builder.query({
//       query: () => '/country-region/all',
//       providesTags: ['CountryRegion'],
//     }),

//     // ==================== ADMIN ENDPOINTS ====================
//     createPlan: builder.mutation({
//       query: (planData) => ({
//         url: '/subscriptions/plans',
//         method: 'POST',
//         body: planData,
//       }),
//       invalidatesTags: ['Plans'],
//     }),

//     updatePlan: builder.mutation({
//       query: ({ planId, ...planData }) => ({
//         url: `/subscriptions/plans/${planId}`,
//         method: 'PUT',
//         body: planData,
//       }),
//       invalidatesTags: ['Plans'],
//     }),

//     updateEditableFields: builder.mutation({
//       query: ({ planId, ...planData }) => ({
//         url: `/subscriptions/plans/${planId}/editable-fields`,
//         method: 'PUT',
//         body: planData,
//       }),
//       invalidatesTags: ['Plans'],
//     }),

//     setRegionalPrices: builder.mutation({
//       query: ({ planId, prices }) => ({
//         url: `/subscriptions/plans/${planId}/regional-prices`,
//         method: 'POST',
//         body: { prices },
//       }),
//       invalidatesTags: ['Plans'],
//     }),

//     // ==================== ADMIN GATEWAY CONFIG ====================
//     getAllGatewayConfigs: builder.query({
//       query: () => '/admin/gateway-config',
//       providesTags: ['GatewayConfig'],
//     }),

//     getGatewayConfigByRegion: builder.query({
//       query: (regionId) => `/admin/gateway-config/${regionId}`,
//       providesTags: ['GatewayConfig'],
//     }),

//     setGatewayConfig: builder.mutation({
//       query: ({ region, ...config }) => ({
//         url: `/admin/gateway-config/${region}`,
//         method: 'POST',
//         body: config,
//       }),
//       invalidatesTags: ['GatewayConfig'],
//     }),

//     updateProcessingFee: builder.mutation({
//       query: (percentage) => ({
//         url: '/admin/processing-fee',
//         method: 'POST',
//         body: { percentage },
//       }),
//       invalidatesTags: ['GatewayConfig'],
//     }),

//     getProcessingFee: builder.query({
//       query: () => '/admin/processing-fee',
//       providesTags: ['GatewayConfig'],
//     }),

//     addCountryMapping: builder.mutation({
//       query: (mappingData) => ({
//         url: '/country-region/add',
//         method: 'POST',
//         body: mappingData,
//       }),
//       invalidatesTags: ['CountryRegion'],
//     }),
//   }),
// });

// export const {
//   useGetAllPlansQuery,
//   useGetPlanByIdQuery,
//   useGetPlanRegionalPricesQuery,
//   useGetUserCurrentSubscriptionQuery,
//   useCheckSubscriptionValidQuery,
//   useGetSubscriptionHistoryQuery,
//   useGetGatewayRecommendationQuery,
//   useCreatePaymentMutation,
//   useVerifyPaymentMutation,
//   useGetUserPaymentsQuery,
//   useGetRegionByCountryQuery,
//   useGetCountriesByRegionQuery,
//   useGetAllCountryMappingsQuery,
//   useCreatePlanMutation,
//   useUpdatePlanMutation,
//   useUpdateEditableFieldsMutation,
//   useSetRegionalPricesMutation,
//   useGetAllGatewayConfigsQuery,
//   useGetGatewayConfigByRegionQuery,
//   useSetGatewayConfigMutation,
//   useUpdateProcessingFeeMutation,
//   useGetProcessingFeeQuery,
//   useAddCountryMappingMutation,
// } = subscriptionApi;
//last working file
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL_SUBSCRIPTION || 'http://localhost:3003/api/v1';

// const baseQuery = fetchBaseQuery({
//   baseUrl: API_BASE_URL,
//   prepareHeaders: (headers, { getState, endpoint }) => {
//     const state = getState();
    
//     // List of public endpoints that don't require authentication
//     const publicEndpoints = ['getAllPlans', 'getPlanById', 'getPlanRegionalPrices'];
    
//     // Skip auth headers for public endpoints
//     if (publicEndpoints.includes(endpoint)) {
//       console.log('🌐 Public endpoint - skipping auth');
//       return headers;
//     }
    
//     // Get auth data from Redux state
//     const token = state.auth?.accessToken;
//     const userId = state.auth?.userId;
//     const roles = state.auth?.roles;
//     const primaryRole = state.auth?.primaryRole;
    
//     // Debug logging
//     console.log('🔐 Auth Debug:', {
//       hasToken: !!token,
//       userId: userId,
//       roles: roles,
//       primaryRole: primaryRole
//     });
    
//     // Determine the role to send to backend
//     // Priority: primaryRole > first role in array > default to 'admin'
//     let userRole = 'admin'; // Default
    
//     if (primaryRole) {
//       userRole = primaryRole.toLowerCase();
//     } else if (roles && Array.isArray(roles) && roles.length > 0) {
//       userRole = roles[0].toLowerCase();
//     }
    
//     console.log('👤 Sending role:', userRole);

//     if (token) {
//       headers.set('Authorization', `Bearer ${token}`);
//       headers.set('x-user-id', String(userId || ''));
//       headers.set('x-user-role', userRole);
      
//       console.log('✅ Headers set successfully');
//     } else {
//       console.warn('⚠️ No authentication token found for protected endpoint');
//     }

//     return headers;
//   },
// });

// export const subscriptionApi = createApi({
//   reducerPath: 'subscriptionApi',
//   baseQuery,
//   tagTypes: ['Plans', 'Subscriptions', 'Payments', 'GatewayConfig', 'CountryRegion'],
//   endpoints: (builder) => ({
//     // ==================== SUBSCRIPTION PLANS (PUBLIC) ====================
//     getAllPlans: builder.query({
//       query: () => '/subscriptions/plans',
//       providesTags: ['Plans'],
//     }),

//     getPlanById: builder.query({
//       query: (planId) => `/subscriptions/plans/${planId}`,
//       providesTags: ['Plans'],
//     }),

//     getPlanRegionalPrices: builder.query({
//       query: (planId) => `/subscriptions/plans/${planId}/regional-prices`,
//       providesTags: ['Plans'],
//     }),

//     // ==================== USER SUBSCRIPTIONS ====================
//     getUserCurrentSubscription: builder.query({
//       query: () => '/subscriptions/user/current',
//       providesTags: ['Subscriptions'],
//     }),

//     checkSubscriptionValid: builder.query({
//       query: () => '/subscriptions/user/valid',
//       providesTags: ['Subscriptions'],
//     }),

//     getSubscriptionHistory: builder.query({
//       query: ({ limit = 10, offset = 0 } = {}) =>
//         `/subscriptions/user/history?limit=${limit}&offset=${offset}`,
//       providesTags: ['Subscriptions'],
//     }),

//     // ==================== PAYMENTS & GATEWAY ====================
//     getGatewayRecommendation: builder.query({
//       query: ({ country_code, plan_id }) =>
//         `/payments/gateway-recommendation?country_code=${country_code}${plan_id ? `&plan_id=${plan_id}` : ''}`,
//       providesTags: ['GatewayConfig'],
//     }),

//     createPayment: builder.mutation({
//       query: (paymentData) => ({
//         url: '/payments/create',
//         method: 'POST',
//         body: paymentData,
//       }),
//       invalidatesTags: ['Payments'],
//     }),

//     verifyPayment: builder.mutation({
//       query: (verificationData) => ({
//         url: '/payments/verify',
//         method: 'POST',
//         body: verificationData,
//       }),
//     }),

//     getUserPayments: builder.query({
//       query: ({ limit = 20, offset = 0 } = {}) =>
//         `/payments/user?limit=${limit}&offset=${offset}`,
//       providesTags: ['Payments'],
//     }),

//     // ==================== COUNTRY & REGION ====================
//     getRegionByCountry: builder.query({
//       query: (country_code) => `/country-region/region/${country_code}`,
//       providesTags: ['CountryRegion'],
//     }),

//     getCountriesByRegion: builder.query({
//       query: (region) => `/country-region/countries/${region}`,
//       providesTags: ['CountryRegion'],
//     }),

//     getAllCountryMappings: builder.query({
//       query: () => '/country-region/all',
//       providesTags: ['CountryRegion'],
//     }),

//     // ==================== ADMIN ENDPOINTS ====================
//     createPlan: builder.mutation({
//       query: (planData) => ({
//         url: '/subscriptions/plans',
//         method: 'POST',
//         body: planData,
//       }),
//       invalidatesTags: ['Plans'],
//     }),

//     updatePlan: builder.mutation({
//       query: ({ planId, ...planData }) => ({
//         url: `/subscriptions/plans/${planId}`,
//         method: 'PUT',
//         body: planData,
//       }),
//       invalidatesTags: ['Plans'],
//     }),

//     updateEditableFields: builder.mutation({
//       query: ({ planId, ...planData }) => ({
//         url: `/subscriptions/plans/${planId}/editable-fields`,
//         method: 'PUT',
//         body: planData,
//       }),
//       invalidatesTags: ['Plans'],
//     }),

//     setRegionalPrices: builder.mutation({
//       query: ({ planId, prices }) => ({
//         url: `/subscriptions/plans/${planId}/regional-prices`,
//         method: 'POST',
//         body: { prices },
//       }),
//       invalidatesTags: ['Plans'],
//     }),

//     // ==================== ADMIN GATEWAY CONFIG ====================
//     getAllGatewayConfigs: builder.query({
//       query: () => '/admin/gateway-config',
//       providesTags: ['GatewayConfig'],
//     }),

//     getGatewayConfigByRegion: builder.query({
//       query: (regionId) => `/admin/gateway-config/${regionId}`,
//       providesTags: ['GatewayConfig'],
//     }),

//     setGatewayConfig: builder.mutation({
//       query: ({ region, ...config }) => ({
//         url: `/admin/gateway-config/${region}`,
//         method: 'POST',
//         body: config,
//       }),
//       invalidatesTags: ['GatewayConfig'],
//     }),

//     updateProcessingFee: builder.mutation({
//       query: (percentage) => ({
//         url: '/admin/processing-fee',
//         method: 'POST',
//         body: { percentage },
//       }),
//       invalidatesTags: ['GatewayConfig'],
//     }),

//     getProcessingFee: builder.query({
//       query: () => '/admin/processing-fee',
//       providesTags: ['GatewayConfig'],
//     }),

//     addCountryMapping: builder.mutation({
//       query: (mappingData) => ({
//         url: '/country-region/add',
//         method: 'POST',
//         body: mappingData,
//       }),
//       invalidatesTags: ['CountryRegion'],
//     }),
//   }),
// });

// export const {
//   useGetAllPlansQuery,
//   useGetPlanByIdQuery,
//   useGetPlanRegionalPricesQuery,
//   useGetUserCurrentSubscriptionQuery,
//   useCheckSubscriptionValidQuery,
//   useGetSubscriptionHistoryQuery,
//   useGetGatewayRecommendationQuery,
//   useCreatePaymentMutation,
//   useVerifyPaymentMutation,
//   useGetUserPaymentsQuery,
//   useGetRegionByCountryQuery,
//   useGetCountriesByRegionQuery,
//   useGetAllCountryMappingsQuery,
//   useCreatePlanMutation,
//   useUpdatePlanMutation,
//   useUpdateEditableFieldsMutation,
//   useSetRegionalPricesMutation,
//   useGetAllGatewayConfigsQuery,
//   useGetGatewayConfigByRegionQuery,
//   useSetGatewayConfigMutation,
//   useUpdateProcessingFeeMutation,
//   useGetProcessingFeeQuery,
//   useAddCountryMappingMutation,
// } = subscriptionApi;
//last working code
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL_SUBSCRIPTION || 'http://localhost:3003/api/v1';

// const baseQuery = fetchBaseQuery({
//   baseUrl: API_BASE_URL,
//   prepareHeaders: (headers, { getState }) => {
//     const state = getState();
    
//     // Get auth data from Redux state
//     const token = state.auth?.accessToken;
//     const userId = state.auth?.userId;
//     const roles = state.auth?.roles;
//     const primaryRole = state.auth?.primaryRole;
    
//     // Debug logging
//     console.log('🔐 Auth Debug:', {
//       hasToken: !!token,
//       userId: userId,
//       roles: roles,
//       primaryRole: primaryRole
//     });
    
//     // Determine the role to send to backend
//     // Priority: primaryRole > first role in array > default to 'admin'
//     let userRole = 'admin'; // Default
    
//     if (primaryRole) {
//       userRole = primaryRole.toLowerCase();
//     } else if (roles && Array.isArray(roles) && roles.length > 0) {
//       userRole = roles[0].toLowerCase();
//     }
    
//     console.log('👤 Sending role:', userRole);

//     if (token) {
//       headers.set('Authorization', `Bearer ${token}`);
//       headers.set('x-user-id', String(userId || ''));
//       headers.set('x-user-role', userRole);
      
//       console.log('✅ Headers set successfully');
//     } else {
//       console.error('❌ No authentication token found!');
//     }

//     return headers;
//   },
// });

// export const subscriptionApi = createApi({
//   reducerPath: 'subscriptionApi',
//   baseQuery,
//   tagTypes: ['Plans', 'Subscriptions', 'Payments', 'GatewayConfig', 'CountryRegion'],
//   endpoints: (builder) => ({
//     // ==================== SUBSCRIPTION PLANS ====================
//     getAllPlans: builder.query({
//       query: () => '/subscriptions/plans',
//       providesTags: ['Plans'],
//     }),

//     getPlanById: builder.query({
//       query: (planId) => `/subscriptions/plans/${planId}`,
//       providesTags: ['Plans'],
//     }),

//     getPlanRegionalPrices: builder.query({
//       query: (planId) => `/subscriptions/plans/${planId}/regional-prices`,
//       providesTags: ['Plans'],
//     }),

//     // ==================== USER SUBSCRIPTIONS ====================
//     getUserCurrentSubscription: builder.query({
//       query: () => '/subscriptions/user/current',
//       providesTags: ['Subscriptions'],
//     }),

//     checkSubscriptionValid: builder.query({
//       query: () => '/subscriptions/user/valid',
//       providesTags: ['Subscriptions'],
//     }),

//     getSubscriptionHistory: builder.query({
//       query: ({ limit = 10, offset = 0 } = {}) =>
//         `/subscriptions/user/history?limit=${limit}&offset=${offset}`,
//       providesTags: ['Subscriptions'],
//     }),

//     // ==================== PAYMENTS & GATEWAY ====================
//     getGatewayRecommendation: builder.query({
//       query: ({ country_code, plan_id }) =>
//         `/payments/gateway-recommendation?country_code=${country_code}${plan_id ? `&plan_id=${plan_id}` : ''}`,
//       providesTags: ['GatewayConfig'],
//     }),

//     createPayment: builder.mutation({
//       query: (paymentData) => ({
//         url: '/payments/create',
//         method: 'POST',
//         body: paymentData,
//       }),
//       invalidatesTags: ['Payments'],
//     }),

//     verifyPayment: builder.mutation({
//       query: (verificationData) => ({
//         url: '/payments/verify',
//         method: 'POST',
//         body: verificationData,
//       }),
//     }),

//     getUserPayments: builder.query({
//       query: ({ limit = 20, offset = 0 } = {}) =>
//         `/payments/user?limit=${limit}&offset=${offset}`,
//       providesTags: ['Payments'],
//     }),

//     // ==================== COUNTRY & REGION ====================
//     getRegionByCountry: builder.query({
//       query: (country_code) => `/country-region/region/${country_code}`,
//       providesTags: ['CountryRegion'],
//     }),

//     getCountriesByRegion: builder.query({
//       query: (region) => `/country-region/countries/${region}`,
//       providesTags: ['CountryRegion'],
//     }),

//     getAllCountryMappings: builder.query({
//       query: () => '/country-region/all',
//       providesTags: ['CountryRegion'],
//     }),

//     // ==================== ADMIN ENDPOINTS ====================
//     createPlan: builder.mutation({
//       query: (planData) => ({
//         url: '/subscriptions/plans',
//         method: 'POST',
//         body: planData,
//       }),
//       invalidatesTags: ['Plans'],
//     }),

//     updatePlan: builder.mutation({
//       query: ({ planId, ...planData }) => ({
//         url: `/subscriptions/plans/${planId}`,
//         method: 'PUT',
//         body: planData,
//       }),
//       invalidatesTags: ['Plans'],
//     }),

//     updateEditableFields: builder.mutation({
//       query: ({ planId, ...planData }) => ({
//         url: `/subscriptions/plans/${planId}/editable-fields`,
//         method: 'PUT',
//         body: planData,
//       }),
//       invalidatesTags: ['Plans'],
//     }),

//     setRegionalPrices: builder.mutation({
//       query: ({ planId, prices }) => ({
//         url: `/subscriptions/plans/${planId}/regional-prices`,
//         method: 'POST',
//         body: { prices },
//       }),
//       invalidatesTags: ['Plans'],
//     }),

//     // ==================== ADMIN GATEWAY CONFIG ====================
//     getAllGatewayConfigs: builder.query({
//       query: () => '/admin/gateway-config',
//       providesTags: ['GatewayConfig'],
//     }),

//     getGatewayConfigByRegion: builder.query({
//       query: (regionId) => `/admin/gateway-config/${regionId}`,
//       providesTags: ['GatewayConfig'],
//     }),

//     setGatewayConfig: builder.mutation({
//       query: ({ region, ...config }) => ({
//         url: `/admin/gateway-config/${region}`,
//         method: 'POST',
//         body: config,
//       }),
//       invalidatesTags: ['GatewayConfig'],
//     }),

//     updateProcessingFee: builder.mutation({
//       query: (percentage) => ({
//         url: '/admin/processing-fee',
//         method: 'POST',
//         body: { percentage },
//       }),
//       invalidatesTags: ['GatewayConfig'],
//     }),

//     getProcessingFee: builder.query({
//       query: () => '/admin/processing-fee',
//       providesTags: ['GatewayConfig'],
//     }),

//     addCountryMapping: builder.mutation({
//       query: (mappingData) => ({
//         url: '/country-region/add',
//         method: 'POST',
//         body: mappingData,
//       }),
//       invalidatesTags: ['CountryRegion'],
//     }),
//   }),
// });

// export const {
//   useGetAllPlansQuery,
//   useGetPlanByIdQuery,
//   useGetPlanRegionalPricesQuery,
//   useGetUserCurrentSubscriptionQuery,
//   useCheckSubscriptionValidQuery,
//   useGetSubscriptionHistoryQuery,
//   useGetGatewayRecommendationQuery,
//   useCreatePaymentMutation,
//   useVerifyPaymentMutation,
//   useGetUserPaymentsQuery,
//   useGetRegionByCountryQuery,
//   useGetCountriesByRegionQuery,
//   useGetAllCountryMappingsQuery,
//   useCreatePlanMutation,
//   useUpdatePlanMutation,
//   useUpdateEditableFieldsMutation,
//   useSetRegionalPricesMutation,
//   useGetAllGatewayConfigsQuery,
//   useGetGatewayConfigByRegionQuery,
//   useSetGatewayConfigMutation,
//   useUpdateProcessingFeeMutation,
//   useGetProcessingFeeQuery,
//   useAddCountryMappingMutation,
// } = subscriptionApi;






