// src/redux/api/lotteryyy/lotteryTicketApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const VOTING_SERVICE_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api';

const getUserData = () => {
  const userDataStr = localStorage.getItem('userData');
  if (userDataStr) {
    try {
      return JSON.parse(userDataStr);
    } catch (error) {
      console.error('Error parsing userData:', error);
    }
  }
  return null;
};

export const lotteryTicketApi = createApi({
  reducerPath: 'lotteryTicketApi',
  baseQuery: fetchBaseQuery({
    baseUrl: VOTING_SERVICE_URL,
    prepareHeaders: (headers) => {
      const userData = getUserData();
      
      if (userData) {
        // ✅ Set x-user-data with full user object (matching electionApi)
        headers.set('x-user-data', JSON.stringify({
          userId: userData.userId,
          email: userData.email,
          phone: userData.phone || null,
          username: userData.username || null,
          roles: (userData.roles || ['Voter']).map(role => 
            role === 'ContentCreator' ? 'Content_Creator' : role
          ),
          subscriptionType: userData.subscriptionType || 'Free',
          isSubscribed: userData.isSubscribed || false
        }));
        
        // Also set x-user-id for backward compatibility
        headers.set('x-user-id', userData.userId);
      }
      
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  tagTypes: ['MyTickets', 'TicketDetails'],
  endpoints: (builder) => ({
    
    // Get my lottery ticket for specific election
    getMyTicket: builder.query({
      query: (electionId) => `/lottery/elections/${electionId}/lottery/my-ticket`,
      providesTags: ['MyTickets'],
    }),

    // Get all my lottery tickets
    getAllMyTickets: builder.query({
      query: () => `/lottery/my-tickets`,
      providesTags: ['MyTickets'],
    }),

  }),
});

export const {
  useGetMyTicketQuery,
  useGetAllMyTicketsQuery,
} = lotteryTicketApi;
// // src/redux/api/lotteryyy/lotteryTicketApi.js
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const VOTING_SERVICE_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api';

// const getUserData = () => {
//   const userDataStr = localStorage.getItem('userData');
//   if (userDataStr) {
//     try {
//       return JSON.parse(userDataStr);
//     } catch (error) {
//       console.error('Error parsing userData:', error);
//     }
//   }
//   return null;
// };

// export const lotteryTicketApi = createApi({
//   reducerPath: 'lotteryTicketApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: VOTING_SERVICE_URL,
//     prepareHeaders: (headers) => {
//       const userData = getUserData();
//       if (userData) {
//         headers.set('x-user-id', userData.userId);
//       }
//       const token = localStorage.getItem('accessToken');
//       if (token) {
//         headers.set('Authorization', `Bearer ${token}`);
//       }
//       return headers;
//     },
//   }),
//   tagTypes: ['MyTickets', 'TicketDetails'],
//   endpoints: (builder) => ({
    
//     // Get my lottery ticket for specific election
//     getMyTicket: builder.query({
//       query: (electionId) => `/lottery/elections/${electionId}/lottery/my-ticket`,
//       providesTags: ['MyTickets'],
//     }),

//     // Get all my lottery tickets
//     getAllMyTickets: builder.query({
//       query: () => `/lottery/my-tickets`,
//       providesTags: ['MyTickets'],
//     }),

//   }),
// });

// export const {
//   useGetMyTicketQuery,
//   useGetAllMyTicketsQuery,
// } = lotteryTicketApi;