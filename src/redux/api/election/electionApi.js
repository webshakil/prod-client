// src/redux/api/election/electionApi.js
// ✅ COMPLETE FILE WITH BOTH AXIOS AND RTK QUERY

import axios from 'axios';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_ELECTION_SERVICE_URL || 'http://localhost:3005/api';



// Create axios instance
const electionAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add user data
electionAPI.interceptors.request.use(
  (config) => {
    // Get user data from localStorage
    const userDataStr = localStorage.getItem('userData');
    
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        
        // Add x-user-data header
        config.headers['x-user-data'] = JSON.stringify({
          userId: userData.userId,
          email: userData.email,
          phone: userData.phone || null,
          username: userData.username || null,
          roles: (userData.roles || ['Voter']).map(role => 
            role === 'ContentCreator' ? 'Content_Creator' : role
          ),
          subscriptionType: userData.subscriptionType || 'Free',
          isSubscribed: userData.isSubscribed || false
        });
      } catch (error) {
        console.error('Error parsing userData:', error);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
electionAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.clear();
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// ============================================
// ELIGIBILITY & SUBSCRIPTION (YOUR EXISTING CODE - UNCHANGED)
// ============================================

export const checkEligibility = async () => {
  const response = await electionAPI.get('/elections/check-eligibility');
  return response.data;
};

// ============================================
// DRAFT OPERATIONS (YOUR EXISTING CODE - UNCHANGED)
// ============================================

export const createDraft = async (draftData) => {
  const response = await electionAPI.post('/elections/drafts', draftData);
  return response.data;
};

export const getMyDrafts = async () => {
  const response = await electionAPI.get('/elections/drafts');
  return response.data;
};

export const getDraft = async (draftId) => {
  const response = await electionAPI.get(`/elections/drafts/${draftId}`);
  return response.data;
};

export const updateDraft = async (draftId, updateData, files = {}) => {
  const formData = new FormData();
  
  // Add files if present
  if (files.topic_image) {
    formData.append('topic_image', files.topic_image);
  }
  if (files.topic_video) {
    formData.append('topic_video', files.topic_video);
  }
  if (files.logo) {
    formData.append('logo', files.logo);
  }
  
  // Add other data
  Object.keys(updateData).forEach(key => {
    if (typeof updateData[key] === 'object' && updateData[key] !== null) {
      formData.append(key, JSON.stringify(updateData[key]));
    } else {
      formData.append(key, updateData[key]);
    }
  });
  
  const response = await electionAPI.patch(`/elections/drafts/${draftId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteDraft = async (draftId) => {
  const response = await electionAPI.delete(`/elections/drafts/${draftId}`);
  return response.data;
};

export const publishElection = async (draftId, publishData) => {
  // Check if publishData is FormData (with files)
  if (publishData instanceof FormData) {
    const response = await electionAPI.post(`/elections/drafts/${draftId}/publish`, publishData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
  
  // Otherwise send as JSON (backward compatibility)
  const response = await electionAPI.post(`/elections/drafts/${draftId}/publish`, publishData);
  return response.data;
};

// ============================================
// ELECTION OPERATIONS (YOUR EXISTING CODE - UNCHANGED)
// ============================================

export const createElection = async (electionData, files = {}) => {
  const formData = new FormData();
  
  // Add files
  if (files.topic_image) {
    formData.append('topic_image', files.topic_image);
  }
  if (files.topic_video) {
    formData.append('topic_video', files.topic_video);
  }
  if (files.logo) {
    formData.append('logo', files.logo);
  }
  
  // Add election data
  Object.keys(electionData).forEach(key => {
    if (typeof electionData[key] === 'object' && electionData[key] !== null) {
      formData.append(key, JSON.stringify(electionData[key]));
    } else if (electionData[key] !== null && electionData[key] !== undefined) {
      formData.append(key, electionData[key]);
    }
  });
  
  const response = await electionAPI.post('/elections', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getMyElections = async (page = 1, limit = 10, status = null) => {
  const params = { page, limit };
  
  // Add status filter if provided and not 'all'
  if (status && status !== 'all') {
    params.status = status;
  }
  
  const response = await electionAPI.get('/elections/my-elections', { params });
  return response.data;
};

export const getPublicElections = async (page = 1, limit = 10) => {
  const response = await electionAPI.get('/elections/public', {
    params: { page, limit }
  });
  return response.data;
};

// ✅ NEW FUNCTION: Get ALL elections (for any authenticated user)
export const getAllElections = async (page = 1, limit = 50, status = 'all') => {
  const params = { page, limit };
  if (status && status !== 'all') {
    params.status = status;
  }
  
  const response = await electionAPI.get('/elections/all-elections', { params });
  return response.data;
};

export const getElection = async (electionId) => {
  const response = await electionAPI.get(`/elections/${electionId}`);
  return response.data;
};

export const getElectionBySlug = async (slug) => {
  const response = await electionAPI.get(`/elections/slug/${slug}`);
  return response.data;
};

export const updateElection = async (electionId, updateData, files = {}) => {
  const formData = new FormData();
  
  // Add files
  if (files.topic_image) {
    formData.append('topic_image', files.topic_image);
  }
  if (files.topic_video) {
    formData.append('topic_video', files.topic_video);
  }
  if (files.logo) {
    formData.append('logo', files.logo);
  }
  
  // Add update data
  Object.keys(updateData).forEach(key => {
    if (typeof updateData[key] === 'object' && updateData[key] !== null) {
      formData.append(key, JSON.stringify(updateData[key]));
    } else if (updateData[key] !== null) {
      formData.append(key, updateData[key]);
    }
  });
  
  const response = await electionAPI.put(`/elections/${electionId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteElection = async (electionId) => {
  const response = await electionAPI.delete(`/elections/${electionId}`);
  return response.data;
};

export const cloneElection = async (electionId, newTitle) => {
  const response = await electionAPI.post(`/elections/${electionId}/clone`, {
    new_title: newTitle
  });
  return response.data;
};

export const exportElection = async (electionId, format = 'json') => {
  const endpoint = format === 'csv' 
    ? `/elections/${electionId}/export/csv`
    : `/elections/${electionId}/export`;
    
  const response = await electionAPI.get(endpoint);
  return response.data;
};

// ============================================
// QUESTIONS & OPTIONS (YOUR EXISTING CODE - UNCHANGED)
// ============================================

export const addQuestion = async (electionId, questionData, questionImage = null) => {
  const formData = new FormData();
  
  if (questionImage) {
    formData.append('question_image', questionImage);
  }
  
  Object.keys(questionData).forEach(key => {
    if (typeof questionData[key] === 'object' && questionData[key] !== null) {
      formData.append(key, JSON.stringify(questionData[key]));
    } else {
      formData.append(key, questionData[key]);
    }
  });
  
  const response = await electionAPI.post(`/elections/${electionId}/questions`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getElectionQuestions = async (electionId) => {
  const response = await electionAPI.get(`/elections/${electionId}/questions`);
  return response.data;
};

export const updateQuestion = async (questionId, updateData, questionImage = null) => {
  const formData = new FormData();
  
  if (questionImage) {
    formData.append('question_image', questionImage);
  }
  
  Object.keys(updateData).forEach(key => {
    if (typeof updateData[key] === 'object' && updateData[key] !== null) {
      formData.append(key, JSON.stringify(updateData[key]));
    } else {
      formData.append(key, updateData[key]);
    }
  });
  
  const response = await electionAPI.put(`/elections/questions/${questionId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteQuestion = async (questionId) => {
  const response = await electionAPI.delete(`/elections/questions/${questionId}`);
  return response.data;
};

export const addOption = async (questionId, optionData, optionImage = null) => {
  const formData = new FormData();
  
  if (optionImage) {
    formData.append('option_image', optionImage);
  }
  
  Object.keys(optionData).forEach(key => {
    formData.append(key, optionData[key]);
  });
  
  const response = await electionAPI.post(`/elections/questions/${questionId}/options`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const updateOption = async (optionId, updateData, optionImage = null) => {
  const formData = new FormData();
  
  if (optionImage) {
    formData.append('option_image', optionImage);
  }
  
  Object.keys(updateData).forEach(key => {
    formData.append(key, updateData[key]);
  });
  
  const response = await electionAPI.put(`/elections/options/${optionId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteOption = async (optionId) => {
  const response = await electionAPI.delete(`/elections/options/${optionId}`);
  return response.data;
};

// ============================================
// 🆕 RTK QUERY API (NEW ADDITION FOR VOTING FEATURES)
// ============================================

export const electionApiRTK = createApi({
  reducerPath: 'electionApiRTK',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      // Add user data header
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
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
        } catch (error) {
          console.error('Error parsing userData:', error);
        }
      }
      
      return headers;
    },
  }),
  tagTypes: ['Election', 'Elections', 'MyElections'], // ✅ CHANGED: Added 'MyElections' tag
  endpoints: (builder) => ({
    
    // 🆕 Get election by ID (RTK Query version)
    getElectionById: builder.query({
      query: (id) => `/elections/${id}`,
      providesTags: (result, error, id) => [{ type: 'Election', id }],
    }),

    // 🆕 Get election by slug (RTK Query version - for VotingMainPage)
    getElectionBySlug: builder.query({
      query: (slug) => `/elections/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Election', id: slug }],
    }),

    // 🆕 Get public elections (RTK Query version)
    getPublicElections: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => 
        `/elections/public?page=${page}&limit=${limit}`,
      providesTags: ['Elections'],
    }),

    // 🆕 Get my elections (RTK Query version)
    // ✅ CHANGED: Added caching controls and better tag management
    getMyElections: builder.query({
      query: ({ page = 1, limit = 10, status = null } = {}) => {
        let url = `/elections/my-elections?page=${page}&limit=${limit}`;
        if (status && status !== 'all') {
          url += `&status=${status}`;
        }
        return url;
      },
      transformResponse: (response) => {
        console.log('🔍 RTK Query - Raw API Response:', response);
        
        // ✅ Backend returns data in response.data.elections
        if (response.success && response.data && response.data.elections) {
          console.log('✅ Elections found:', response.data.elections.length);
          console.log('📦 First election:', response.data.elections[0]);
          
          return {
            elections: response.data.elections,
            total: response.data.total || response.data.elections.length
          };
        }
        
        // Fallback for different response structure
        if (response.elections) {
          return {
            elections: response.elections,
            total: response.total || response.elections.length
          };
        }
        
        console.warn('⚠️ Unexpected API response structure:', response);
        return { elections: [], total: 0 };
      },
      providesTags: ['Elections', 'MyElections'], // ✅ CHANGED: Added 'MyElections' tag
      keepUnusedDataFor: 5, // ✅ ADDED: Only cache for 5 seconds to prevent stale data
    }),
  }),
});

// 🆕 Export RTK Query hooks
export const {
  useGetElectionByIdQuery,
  useGetElectionBySlugQuery,
  useGetPublicElectionsQuery,
  useGetMyElectionsQuery,
} = electionApiRTK;

// ✅ Export the axios instance as default (for existing code)
export default electionAPI;
//last workable code only to remove stale data above code
// // src/redux/api/election/electionApi.js
// // ✅ COMPLETE FILE WITH BOTH AXIOS AND RTK QUERY

// import axios from 'axios';
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const API_BASE_URL = import.meta.env.VITE_REACT_APP_ELECTION_SERVICE_URL || 'http://localhost:3005/api';



// // Create axios instance
// const electionAPI = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json'
//   }
// });

// // Request interceptor to add user data
// electionAPI.interceptors.request.use(
//   (config) => {
//     // Get user data from localStorage
//     const userDataStr = localStorage.getItem('userData');
    
//     if (userDataStr) {
//       try {
//         const userData = JSON.parse(userDataStr);
        
//         // Add x-user-data header
//         config.headers['x-user-data'] = JSON.stringify({
//           userId: userData.userId,
//           email: userData.email,
//           phone: userData.phone || null,
//           username: userData.username || null,
//           roles: (userData.roles || ['Voter']).map(role => 
//             role === 'ContentCreator' ? 'Content_Creator' : role
//           ),
//           subscriptionType: userData.subscriptionType || 'Free',
//           isSubscribed: userData.isSubscribed || false
//         });
//       } catch (error) {
//         console.error('Error parsing userData:', error);
//       }
//     }
    
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor
// electionAPI.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Handle unauthorized
//       localStorage.clear();
//       window.location.href = '/auth';
//     }
//     return Promise.reject(error);
//   }
// );

// // ============================================
// // ELIGIBILITY & SUBSCRIPTION (YOUR EXISTING CODE - UNCHANGED)
// // ============================================

// export const checkEligibility = async () => {
//   const response = await electionAPI.get('/elections/check-eligibility');
//   return response.data;
// };

// // ============================================
// // DRAFT OPERATIONS (YOUR EXISTING CODE - UNCHANGED)
// // ============================================

// export const createDraft = async (draftData) => {
//   const response = await electionAPI.post('/elections/drafts', draftData);
//   return response.data;
// };

// export const getMyDrafts = async () => {
//   const response = await electionAPI.get('/elections/drafts');
//   return response.data;
// };

// export const getDraft = async (draftId) => {
//   const response = await electionAPI.get(`/elections/drafts/${draftId}`);
//   return response.data;
// };

// export const updateDraft = async (draftId, updateData, files = {}) => {
//   const formData = new FormData();
  
//   // Add files if present
//   if (files.topic_image) {
//     formData.append('topic_image', files.topic_image);
//   }
//   if (files.topic_video) {
//     formData.append('topic_video', files.topic_video);
//   }
//   if (files.logo) {
//     formData.append('logo', files.logo);
//   }
  
//   // Add other data
//   Object.keys(updateData).forEach(key => {
//     if (typeof updateData[key] === 'object' && updateData[key] !== null) {
//       formData.append(key, JSON.stringify(updateData[key]));
//     } else {
//       formData.append(key, updateData[key]);
//     }
//   });
  
//   const response = await electionAPI.patch(`/elections/drafts/${draftId}`, formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data'
//     }
//   });
//   return response.data;
// };

// export const deleteDraft = async (draftId) => {
//   const response = await electionAPI.delete(`/elections/drafts/${draftId}`);
//   return response.data;
// };

// export const publishElection = async (draftId, publishData) => {
//   // Check if publishData is FormData (with files)
//   if (publishData instanceof FormData) {
//     const response = await electionAPI.post(`/elections/drafts/${draftId}/publish`, publishData, {
//       headers: {
//         'Content-Type': 'multipart/form-data'
//       }
//     });
//     return response.data;
//   }
  
//   // Otherwise send as JSON (backward compatibility)
//   const response = await electionAPI.post(`/elections/drafts/${draftId}/publish`, publishData);
//   return response.data;
// };

// // ============================================
// // ELECTION OPERATIONS (YOUR EXISTING CODE - UNCHANGED)
// // ============================================

// export const createElection = async (electionData, files = {}) => {
//   const formData = new FormData();
  
//   // Add files
//   if (files.topic_image) {
//     formData.append('topic_image', files.topic_image);
//   }
//   if (files.topic_video) {
//     formData.append('topic_video', files.topic_video);
//   }
//   if (files.logo) {
//     formData.append('logo', files.logo);
//   }
  
//   // Add election data
//   Object.keys(electionData).forEach(key => {
//     if (typeof electionData[key] === 'object' && electionData[key] !== null) {
//       formData.append(key, JSON.stringify(electionData[key]));
//     } else if (electionData[key] !== null && electionData[key] !== undefined) {
//       formData.append(key, electionData[key]);
//     }
//   });
  
//   const response = await electionAPI.post('/elections', formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data'
//     }
//   });
//   return response.data;
// };

// export const getMyElections = async (page = 1, limit = 10, status = null) => {
//   const params = { page, limit };
  
//   // Add status filter if provided and not 'all'
//   if (status && status !== 'all') {
//     params.status = status;
//   }
  
//   const response = await electionAPI.get('/elections/my-elections', { params });
//   return response.data;
// };

// export const getPublicElections = async (page = 1, limit = 10) => {
//   const response = await electionAPI.get('/elections/public', {
//     params: { page, limit }
//   });
//   return response.data;
// };

// // ✅ NEW FUNCTION: Get ALL elections (for any authenticated user)
// export const getAllElections = async (page = 1, limit = 50, status = 'all') => {
//   const params = { page, limit };
//   if (status && status !== 'all') {
//     params.status = status;
//   }
  
//   const response = await electionAPI.get('/elections/all-elections', { params });
//   return response.data;
// };

// export const getElection = async (electionId) => {
//   const response = await electionAPI.get(`/elections/${electionId}`);
//   return response.data;
// };

// export const getElectionBySlug = async (slug) => {
//   const response = await electionAPI.get(`/elections/slug/${slug}`);
//   return response.data;
// };

// export const updateElection = async (electionId, updateData, files = {}) => {
//   const formData = new FormData();
  
//   // Add files
//   if (files.topic_image) {
//     formData.append('topic_image', files.topic_image);
//   }
//   if (files.topic_video) {
//     formData.append('topic_video', files.topic_video);
//   }
//   if (files.logo) {
//     formData.append('logo', files.logo);
//   }
  
//   // Add update data
//   Object.keys(updateData).forEach(key => {
//     if (typeof updateData[key] === 'object' && updateData[key] !== null) {
//       formData.append(key, JSON.stringify(updateData[key]));
//     } else if (updateData[key] !== null) {
//       formData.append(key, updateData[key]);
//     }
//   });
  
//   const response = await electionAPI.put(`/elections/${electionId}`, formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data'
//     }
//   });
//   return response.data;
// };

// export const deleteElection = async (electionId) => {
//   const response = await electionAPI.delete(`/elections/${electionId}`);
//   return response.data;
// };

// export const cloneElection = async (electionId, newTitle) => {
//   const response = await electionAPI.post(`/elections/${electionId}/clone`, {
//     new_title: newTitle
//   });
//   return response.data;
// };

// export const exportElection = async (electionId, format = 'json') => {
//   const endpoint = format === 'csv' 
//     ? `/elections/${electionId}/export/csv`
//     : `/elections/${electionId}/export`;
    
//   const response = await electionAPI.get(endpoint);
//   return response.data;
// };

// // ============================================
// // QUESTIONS & OPTIONS (YOUR EXISTING CODE - UNCHANGED)
// // ============================================

// export const addQuestion = async (electionId, questionData, questionImage = null) => {
//   const formData = new FormData();
  
//   if (questionImage) {
//     formData.append('question_image', questionImage);
//   }
  
//   Object.keys(questionData).forEach(key => {
//     if (typeof questionData[key] === 'object' && questionData[key] !== null) {
//       formData.append(key, JSON.stringify(questionData[key]));
//     } else {
//       formData.append(key, questionData[key]);
//     }
//   });
  
//   const response = await electionAPI.post(`/elections/${electionId}/questions`, formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data'
//     }
//   });
//   return response.data;
// };

// export const getElectionQuestions = async (electionId) => {
//   const response = await electionAPI.get(`/elections/${electionId}/questions`);
//   return response.data;
// };

// export const updateQuestion = async (questionId, updateData, questionImage = null) => {
//   const formData = new FormData();
  
//   if (questionImage) {
//     formData.append('question_image', questionImage);
//   }
  
//   Object.keys(updateData).forEach(key => {
//     if (typeof updateData[key] === 'object' && updateData[key] !== null) {
//       formData.append(key, JSON.stringify(updateData[key]));
//     } else {
//       formData.append(key, updateData[key]);
//     }
//   });
  
//   const response = await electionAPI.put(`/elections/questions/${questionId}`, formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data'
//     }
//   });
//   return response.data;
// };

// export const deleteQuestion = async (questionId) => {
//   const response = await electionAPI.delete(`/elections/questions/${questionId}`);
//   return response.data;
// };

// export const addOption = async (questionId, optionData, optionImage = null) => {
//   const formData = new FormData();
  
//   if (optionImage) {
//     formData.append('option_image', optionImage);
//   }
  
//   Object.keys(optionData).forEach(key => {
//     formData.append(key, optionData[key]);
//   });
  
//   const response = await electionAPI.post(`/elections/questions/${questionId}/options`, formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data'
//     }
//   });
//   return response.data;
// };

// export const updateOption = async (optionId, updateData, optionImage = null) => {
//   const formData = new FormData();
  
//   if (optionImage) {
//     formData.append('option_image', optionImage);
//   }
  
//   Object.keys(updateData).forEach(key => {
//     formData.append(key, updateData[key]);
//   });
  
//   const response = await electionAPI.put(`/elections/options/${optionId}`, formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data'
//     }
//   });
//   return response.data;
// };

// export const deleteOption = async (optionId) => {
//   const response = await electionAPI.delete(`/elections/options/${optionId}`);
//   return response.data;
// };

// // ============================================
// // 🆕 RTK QUERY API (NEW ADDITION FOR VOTING FEATURES)
// // ============================================

// export const electionApiRTK = createApi({
//   reducerPath: 'electionApiRTK',
//   baseQuery: fetchBaseQuery({
//     baseUrl: API_BASE_URL,
//     prepareHeaders: (headers) => {
//       const token = localStorage.getItem('accessToken');
//       if (token) {
//         headers.set('Authorization', `Bearer ${token}`);
//       }
      
//       // Add user data header
//       const userDataStr = localStorage.getItem('userData');
//       if (userDataStr) {
//         try {
//           const userData = JSON.parse(userDataStr);
//           headers.set('x-user-data', JSON.stringify({
//             userId: userData.userId,
//             email: userData.email,
//             phone: userData.phone || null,
//             username: userData.username || null,
//             roles: (userData.roles || ['Voter']).map(role => 
//               role === 'ContentCreator' ? 'Content_Creator' : role
//             ),
//             subscriptionType: userData.subscriptionType || 'Free',
//             isSubscribed: userData.isSubscribed || false
//           }));
//         } catch (error) {
//           console.error('Error parsing userData:', error);
//         }
//       }
      
//       return headers;
//     },
//   }),
//   tagTypes: ['Election', 'Elections'],
//   endpoints: (builder) => ({
    
//     // 🆕 Get election by ID (RTK Query version)
//     getElectionById: builder.query({
//       query: (id) => `/elections/${id}`,
//       providesTags: (result, error, id) => [{ type: 'Election', id }],
//     }),

//     // 🆕 Get election by slug (RTK Query version - for VotingMainPage)
//     getElectionBySlug: builder.query({
//       query: (slug) => `/elections/slug/${slug}`,
//       providesTags: (result, error, slug) => [{ type: 'Election', id: slug }],
//     }),

//     // 🆕 Get public elections (RTK Query version)
//     getPublicElections: builder.query({
//       query: ({ page = 1, limit = 10 } = {}) => 
//         `/elections/public?page=${page}&limit=${limit}`,
//       providesTags: ['Elections'],
//     }),

//     // 🆕 Get my elections (RTK Query version)
//     // 🆕 Get my elections (RTK Query version)
//     // src/redux/api/election/electionApi.js

// getMyElections: builder.query({
//   query: ({ page = 1, limit = 10, status = null } = {}) => {
//     let url = `/elections/my-elections?page=${page}&limit=${limit}`;
//     if (status && status !== 'all') {
//       url += `&status=${status}`;
//     }
//     return url;
//   },
//   transformResponse: (response) => {
//     console.log('🔍 RTK Query - Raw API Response:', response);
    
//     // ✅ Backend returns data in response.data.elections
//     if (response.success && response.data && response.data.elections) {
//       console.log('✅ Elections found:', response.data.elections.length);
//       console.log('📦 First election:', response.data.elections[0]);
      
//       return {
//         elections: response.data.elections,
//         total: response.data.total || response.data.elections.length
//       };
//     }
    
//     // Fallback for different response structure
//     if (response.elections) {
//       return {
//         elections: response.elections,
//         total: response.total || response.elections.length
//       };
//     }
    
//     console.warn('⚠️ Unexpected API response structure:', response);
//     return { elections: [], total: 0 };
//   },
//   providesTags: ['Elections'],
// }),


//   }),
// });

// // 🆕 Export RTK Query hooks
// export const {
//   useGetElectionByIdQuery,
//   useGetElectionBySlugQuery,
//   useGetPublicElectionsQuery,
//   useGetMyElectionsQuery,
// } = electionApiRTK;

// // ✅ Export the axios instance as default (for existing code)
// export default electionAPI;
