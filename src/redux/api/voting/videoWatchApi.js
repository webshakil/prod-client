// src/redux/api/voting/videoWatchApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const VOTING_SERVICE_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:5003/api';

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

export const videoWatchApi = createApi({
  reducerPath: 'videoWatchApi',
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
  tagTypes: ['VideoProgress'],
  endpoints: (builder) => ({
    
    // Get video watch progress
    getVideoProgress: builder.query({
      query: (electionId) => {
        console.log('📹 Fetching video progress for election:', electionId);
        return `/voting/elections/${electionId}/video-progress`;
      },
      providesTags: (result, error, electionId) => [
        { type: 'VideoProgress', id: electionId }
      ],
      transformResponse: (response) => {
        console.log('📹 Video progress fetched:', response);
        return response.data || response;
      },
      transformErrorResponse: (error) => {
        console.error('❌ Get video progress error:', error);
        return error;
      },
    }),

    // Update video watch progress
    updateWatchProgress: builder.mutation({
      query: ({ electionId, watchPercentage, lastPosition, totalDuration, completed }) => {
        console.log('📡 Updating video progress:', {
          electionId,
          watchPercentage,
          lastPosition,
          totalDuration,
          completed
        });
        
        return {
          url: `/voting/elections/${electionId}/video-progress`,
          method: 'POST',
          body: {
            watchPercentage,
            lastPosition,
            totalDuration,
            completed,
          },
        };
      },
      invalidatesTags: (result, error, { electionId }) => [
        { type: 'VideoProgress', id: electionId }
      ],
      transformResponse: (response) => {
        console.log('✅ Video progress updated:', response);
        return response;
      },
      transformErrorResponse: (error) => {
        console.error('❌ Update video progress error:', error);
        return error;
      },
    }),

  }),
});

export const {
  useGetVideoProgressQuery,
  useUpdateWatchProgressMutation,
} = videoWatchApi;