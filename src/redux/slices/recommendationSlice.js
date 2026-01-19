// src/redux/slices/recommendationSlice.js
// ✅ Redux Slice for Shaped AI Recommendations - FIXED with axios

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getPersonalizedElections, 
  getSimilarElectionsApi, 
  getTrendingElectionsApi, 
  getLotteryElectionsApi,
  checkHealthApi 
} from '../api/recommendations/recommendationApi';

// Initial state
const initialState = {
  // Personalized recommendations (AI-powered)
  personalizedElections: [],
  personalizedLoading: false,
  personalizedError: null,
  isNewUser: false,
  
  // Similar elections (AI-powered)
  similarElections: [],
  similarLoading: false,
  similarError: null,
  
  // Trending elections (AI-powered)
  trendingElections: [],
  trendingLoading: false,
  trendingError: null,
  
  // Lottery elections (AI-powered)
  lotteryElections: [],
  lotteryLoading: false,
  lotteryError: null,
  
  // Service status
  serviceHealth: {
    isHealthy: false,
    lastCheck: null,
    shapedAIActive: false,
    engineName: null,
  },
  
  // Track AI vs Non-AI sources
  aiMetrics: {
    totalAIRecommendations: 0,
    lastFetchTime: null,
    source: 'shaped_ai',
    engineVersion: 'vottery_elections_for_you',
  },
};

// ✅ Async thunk for fetching personalized recommendations
export const fetchPersonalizedRecommendations = createAsyncThunk(
  'recommendations/fetchPersonalized',
  async ({ userId, limit = 10 }, { rejectWithValue }) => {
    try {
      const data = await getPersonalizedElections(userId, limit);
      return {
        elections: data.data || [],
        isAIPowered: true,
        source: 'shaped_ai',
        timestamp: new Date().toISOString(),
        isNewUser: data.is_new_user || false,
        message: data.message || null,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ✅ Async thunk for fetching similar elections
export const fetchSimilarElections = createAsyncThunk(
  'recommendations/fetchSimilar',
  async ({ electionId, limit = 5 }, { rejectWithValue }) => {
    try {
      const data = await getSimilarElectionsApi(electionId, limit);
      return {
        elections: data.data || [],
        isAIPowered: true,
        source: 'shaped_ai',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ✅ Async thunk for fetching trending elections
export const fetchTrendingElections = createAsyncThunk(
  'recommendations/fetchTrending',
  async ({ limit = 10 }, { rejectWithValue }) => {
    try {
      const data = await getTrendingElectionsApi(limit);
      return {
        elections: data.data || [],
        isAIPowered: true,
        source: 'shaped_ai',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ✅ Async thunk for fetching lottery elections
export const fetchLotteryElections = createAsyncThunk(
  'recommendations/fetchLottery',
  async ({ limit = 10 }, { rejectWithValue }) => {
    try {
      const data = await getLotteryElectionsApi(limit);
      return {
        elections: data.data || [],
        isAIPowered: true,
        source: 'shaped_ai',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ✅ Check service health
export const checkServiceHealth = createAsyncThunk(
  'recommendations/checkHealth',
  async (_, { rejectWithValue }) => {
    try {
      const data = await checkHealthApi();
      return {
        isHealthy: true,
        shapedAIActive: data.shaped_ai_active || true,
        engineName: data.engine || 'vottery_elections_for_you',
        lastCheck: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const recommendationSlice = createSlice({
  name: 'recommendations',
  initialState,
  reducers: {
    // Clear all recommendations
    clearRecommendations: (state) => {
      state.personalizedElections = [];
      state.similarElections = [];
      state.trendingElections = [];
      state.lotteryElections = [];
      state.isNewUser = false;
    },
    
    // Reset errors
    resetErrors: (state) => {
      state.personalizedError = null;
      state.similarError = null;
      state.trendingError = null;
      state.lotteryError = null;
    },
    
    // Update AI metrics
    updateAIMetrics: (state, action) => {
      state.aiMetrics = {
        ...state.aiMetrics,
        ...action.payload,
      };
    },
  },
  extraReducers: (builder) => {
    // Personalized recommendations
    builder
      .addCase(fetchPersonalizedRecommendations.pending, (state) => {
        state.personalizedLoading = true;
        state.personalizedError = null;
      })
      .addCase(fetchPersonalizedRecommendations.fulfilled, (state, action) => {
        state.personalizedLoading = false;
        state.personalizedElections = action.payload.elections;
        state.isNewUser = action.payload.isNewUser || false;
        state.aiMetrics.totalAIRecommendations += action.payload.elections.length;
        state.aiMetrics.lastFetchTime = action.payload.timestamp;
      })
      .addCase(fetchPersonalizedRecommendations.rejected, (state, action) => {
        state.personalizedLoading = false;
        state.personalizedError = action.payload;
      })
    
    // Similar elections
      .addCase(fetchSimilarElections.pending, (state) => {
        state.similarLoading = true;
        state.similarError = null;
      })
      .addCase(fetchSimilarElections.fulfilled, (state, action) => {
        state.similarLoading = false;
        state.similarElections = action.payload.elections;
      })
      .addCase(fetchSimilarElections.rejected, (state, action) => {
        state.similarLoading = false;
        state.similarError = action.payload;
      })
    
    // Trending elections
      .addCase(fetchTrendingElections.pending, (state) => {
        state.trendingLoading = true;
        state.trendingError = null;
      })
      .addCase(fetchTrendingElections.fulfilled, (state, action) => {
        state.trendingLoading = false;
        state.trendingElections = action.payload.elections;
      })
      .addCase(fetchTrendingElections.rejected, (state, action) => {
        state.trendingLoading = false;
        state.trendingError = action.payload;
      })
    
    // Lottery elections
      .addCase(fetchLotteryElections.pending, (state) => {
        state.lotteryLoading = true;
        state.lotteryError = null;
      })
      .addCase(fetchLotteryElections.fulfilled, (state, action) => {
        state.lotteryLoading = false;
        state.lotteryElections = action.payload.elections;
      })
      .addCase(fetchLotteryElections.rejected, (state, action) => {
        state.lotteryLoading = false;
        state.lotteryError = action.payload;
      })
    
    // Health check
      .addCase(checkServiceHealth.fulfilled, (state, action) => {
        state.serviceHealth = action.payload;
      })
      .addCase(checkServiceHealth.rejected, (state) => {
        state.serviceHealth.isHealthy = false;
        state.serviceHealth.lastCheck = new Date().toISOString();
      });
  },
});

export const { clearRecommendations, resetErrors, updateAIMetrics } = recommendationSlice.actions;

// Selectors
export const selectPersonalizedElections = (state) => state.recommendations?.personalizedElections || [];
export const selectSimilarElections = (state) => state.recommendations?.similarElections || [];
export const selectTrendingElections = (state) => state.recommendations?.trendingElections || [];
export const selectLotteryElections = (state) => state.recommendations?.lotteryElections || [];
export const selectServiceHealth = (state) => state.recommendations?.serviceHealth || {};
export const selectAIMetrics = (state) => state.recommendations?.aiMetrics || {};
export const selectIsNewUser = (state) => state.recommendations?.isNewUser || false;

export default recommendationSlice.reducer;
// // src/redux/slices/recommendationSlice.js
// // ✅ Redux Slice for Shaped AI Recommendations
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// // Initial state with clear AI tracking
// const initialState = {
//   // Personalized recommendations (AI-powered)
//   personalizedElections: [],
//   personalizedLoading: false,
//   personalizedError: null,
  
//   // Similar elections (AI-powered)
//   similarElections: [],
//   similarLoading: false,
//   similarError: null,
  
//   // Trending elections (AI-powered)
//   trendingElections: [],
//   trendingLoading: false,
//   trendingError: null,
  
//   // Lottery elections (AI-powered)
//   lotteryElections: [],
//   lotteryLoading: false,
//   lotteryError: null,
  
//   // Service status
//   serviceHealth: {
//     isHealthy: false,
//     lastCheck: null,
//     shapedAIActive: false,
//     engineName: null,
//   },
  
//   // Track AI vs Non-AI sources
//   aiMetrics: {
//     totalAIRecommendations: 0,
//     lastFetchTime: null,
//     source: 'shaped_ai',
//     engineVersion: 'vottery_elections_for_you',
//   },
// };

// // ✅ Async thunk for fetching personalized recommendations
// export const fetchPersonalizedRecommendations = createAsyncThunk(
//   'recommendations/fetchPersonalized',
//   async ({ userId, limit = 10 }, { rejectWithValue }) => {
//     try {
//       const baseUrl = import.meta.env.VITE_REACT_APP_RECOMMENDATION_API_URL || 'http://localhost:3008';
//       const response = await fetch(
//         `${baseUrl}/api/recommendations/elections?userId=${userId}&limit=${limit}`
//       );
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch personalized recommendations');
//       }
      
//       const data = await response.json();
//       return {
//         elections: data.data || [],
//         isAIPowered: true,
//         source: 'shaped_ai',
//         timestamp: new Date().toISOString(),
//       };
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// // ✅ Async thunk for fetching similar elections
// export const fetchSimilarElections = createAsyncThunk(
//   'recommendations/fetchSimilar',
//   async ({ electionId, limit = 5 }, { rejectWithValue }) => {
//     try {
//       const baseUrl = import.meta.env.VITE_REACT_APP_RECOMMENDATION_API_URL || 'http://localhost:3008';
//       const response = await fetch(
//         `${baseUrl}/api/recommendations/similar/${electionId}?limit=${limit}`
//       );
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch similar elections');
//       }
      
//       const data = await response.json();
//       return {
//         elections: data.data || [],
//         isAIPowered: true,
//         source: 'shaped_ai',
//         timestamp: new Date().toISOString(),
//       };
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// // ✅ Async thunk for fetching trending elections
// export const fetchTrendingElections = createAsyncThunk(
//   'recommendations/fetchTrending',
//   async ({ limit = 10 }, { rejectWithValue }) => {
//     try {
//       const baseUrl = import.meta.env.VITE_REACT_APP_RECOMMENDATION_API_URL || 'http://localhost:3008';
//       const response = await fetch(
//         `${baseUrl}/api/recommendations/trending?limit=${limit}`
//       );
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch trending elections');
//       }
      
//       const data = await response.json();
//       return {
//         elections: data.data || [],
//         isAIPowered: true,
//         source: 'shaped_ai',
//         timestamp: new Date().toISOString(),
//       };
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// // ✅ Async thunk for fetching lottery elections
// export const fetchLotteryElections = createAsyncThunk(
//   'recommendations/fetchLottery',
//   async ({ limit = 10 }, { rejectWithValue }) => {
//     try {
//       const baseUrl = import.meta.env.VITE_REACT_APP_RECOMMENDATION_API_URL || 'http://localhost:3008';
//       const response = await fetch(
//         `${baseUrl}/api/recommendations/lotterized?limit=${limit}`
//       );
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch lottery elections');
//       }
      
//       const data = await response.json();
//       return {
//         elections: data.data || [],
//         isAIPowered: true,
//         source: 'shaped_ai',
//         timestamp: new Date().toISOString(),
//       };
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// // ✅ Check service health
// export const checkServiceHealth = createAsyncThunk(
//   'recommendations/checkHealth',
//   async (_, { rejectWithValue }) => {
//     try {
//       const baseUrl = import.meta.env.VITE_REACT_APP_RECOMMENDATION_API_URL || 'http://localhost:3008';
//       const response = await fetch(`${baseUrl}/api/recommendations/health`);
      
//       if (!response.ok) {
//         throw new Error('Recommendation service unhealthy');
//       }
      
//       const data = await response.json();
//       return {
//         isHealthy: true,
//         shapedAIActive: data.shaped_ai_active || true,
//         engineName: data.engine || 'vottery_elections_for_you',
//         lastCheck: new Date().toISOString(),
//       };
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// const recommendationSlice = createSlice({
//   name: 'recommendations',
//   initialState,
//   reducers: {
//     // Clear all recommendations
//     clearRecommendations: (state) => {
//       state.personalizedElections = [];
//       state.similarElections = [];
//       state.trendingElections = [];
//       state.lotteryElections = [];
//     },
    
//     // Reset errors
//     resetErrors: (state) => {
//       state.personalizedError = null;
//       state.similarError = null;
//       state.trendingError = null;
//       state.lotteryError = null;
//     },
    
//     // Update AI metrics
//     updateAIMetrics: (state, action) => {
//       state.aiMetrics = {
//         ...state.aiMetrics,
//         ...action.payload,
//       };
//     },
//   },
//   extraReducers: (builder) => {
//     // Personalized recommendations
//     builder
//       .addCase(fetchPersonalizedRecommendations.pending, (state) => {
//         state.personalizedLoading = true;
//         state.personalizedError = null;
//       })
//       .addCase(fetchPersonalizedRecommendations.fulfilled, (state, action) => {
//         state.personalizedLoading = false;
//         state.personalizedElections = action.payload.elections;
//         state.aiMetrics.totalAIRecommendations += action.payload.elections.length;
//         state.aiMetrics.lastFetchTime = action.payload.timestamp;
//       })
//       .addCase(fetchPersonalizedRecommendations.rejected, (state, action) => {
//         state.personalizedLoading = false;
//         state.personalizedError = action.payload;
//       })
    
//     // Similar elections
//       .addCase(fetchSimilarElections.pending, (state) => {
//         state.similarLoading = true;
//         state.similarError = null;
//       })
//       .addCase(fetchSimilarElections.fulfilled, (state, action) => {
//         state.similarLoading = false;
//         state.similarElections = action.payload.elections;
//       })
//       .addCase(fetchSimilarElections.rejected, (state, action) => {
//         state.similarLoading = false;
//         state.similarError = action.payload;
//       })
    
//     // Trending elections
//       .addCase(fetchTrendingElections.pending, (state) => {
//         state.trendingLoading = true;
//         state.trendingError = null;
//       })
//       .addCase(fetchTrendingElections.fulfilled, (state, action) => {
//         state.trendingLoading = false;
//         state.trendingElections = action.payload.elections;
//       })
//       .addCase(fetchTrendingElections.rejected, (state, action) => {
//         state.trendingLoading = false;
//         state.trendingError = action.payload;
//       })
    
//     // Lottery elections
//       .addCase(fetchLotteryElections.pending, (state) => {
//         state.lotteryLoading = true;
//         state.lotteryError = null;
//       })
//       .addCase(fetchLotteryElections.fulfilled, (state, action) => {
//         state.lotteryLoading = false;
//         state.lotteryElections = action.payload.elections;
//       })
//       .addCase(fetchLotteryElections.rejected, (state, action) => {
//         state.lotteryLoading = false;
//         state.lotteryError = action.payload;
//       })
    
//     // Health check
//       .addCase(checkServiceHealth.fulfilled, (state, action) => {
//         state.serviceHealth = action.payload;
//       })
//       .addCase(checkServiceHealth.rejected, (state) => {
//         state.serviceHealth.isHealthy = false;
//         state.serviceHealth.lastCheck = new Date().toISOString();
//       });
//   },
// });

// export const { clearRecommendations, resetErrors, updateAIMetrics } = recommendationSlice.actions;

// // Selectors
// export const selectPersonalizedElections = (state) => state.recommendations?.personalizedElections || [];
// export const selectSimilarElections = (state) => state.recommendations?.similarElections || [];
// export const selectTrendingElections = (state) => state.recommendations?.trendingElections || [];
// export const selectLotteryElections = (state) => state.recommendations?.lotteryElections || [];
// export const selectServiceHealth = (state) => state.recommendations?.serviceHealth || {};
// export const selectAIMetrics = (state) => state.recommendations?.aiMetrics || {};

// export default recommendationSlice.reducer;