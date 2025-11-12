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