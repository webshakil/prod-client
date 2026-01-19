// src/hooks/useRecommendations.js
// ✅ Custom Hook for Shaped AI Recommendations
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPersonalizedRecommendations,
  fetchSimilarElections,
  fetchTrendingElections,
  fetchLotteryElections,
  checkServiceHealth,
  selectPersonalizedElections,
  selectSimilarElections,
  selectTrendingElections,
  selectLotteryElections,
  selectServiceHealth,
  selectAIMetrics,
} from '../redux/slices/recommendationSlice';

/**
 * 🤖 usePersonalizedRecommendations
 * Fetches AI-powered personalized election recommendations for the current user
 */
export const usePersonalizedRecommendations = (limit = 10) => {
  const dispatch = useDispatch();
  const userId = localStorage.getItem('userId');
  
  const elections = useSelector(selectPersonalizedElections);
  const loading = useSelector((state) => state.recommendations?.personalizedLoading);
  const error = useSelector((state) => state.recommendations?.personalizedError);
  const aiMetrics = useSelector(selectAIMetrics);

  const refetch = useCallback(() => {
    if (userId) {
      dispatch(fetchPersonalizedRecommendations({ userId, limit }));
    }
  }, [dispatch, userId, limit]);

  useEffect(() => {
    if (userId && elections.length === 0) {
      refetch();
    }
  }, [userId, elections.length, refetch]);

  return {
    elections,
    loading,
    error,
    refetch,
    isAIPowered: true,
    source: 'shaped_ai',
    aiMetrics,
  };
};

/**
 * 🤖 useSimilarElections
 * Fetches AI-powered similar election recommendations
 */
export const useSimilarElections = (electionId, limit = 5) => {
  const dispatch = useDispatch();
  
  const elections = useSelector(selectSimilarElections);
  const loading = useSelector((state) => state.recommendations?.similarLoading);
  const error = useSelector((state) => state.recommendations?.similarError);

  const refetch = useCallback(() => {
    if (electionId) {
      dispatch(fetchSimilarElections({ electionId, limit }));
    }
  }, [dispatch, electionId, limit]);

  useEffect(() => {
    if (electionId) {
      refetch();
    }
  }, [electionId, refetch]);

  return {
    elections,
    loading,
    error,
    refetch,
    isAIPowered: true,
    source: 'shaped_ai',
  };
};

/**
 * 🤖 useTrendingElections
 * Fetches AI-powered trending election recommendations
 */
export const useTrendingElections = (limit = 10) => {
  const dispatch = useDispatch();
  
  const elections = useSelector(selectTrendingElections);
  const loading = useSelector((state) => state.recommendations?.trendingLoading);
  const error = useSelector((state) => state.recommendations?.trendingError);

  const refetch = useCallback(() => {
    dispatch(fetchTrendingElections({ limit }));
  }, [dispatch, limit]);

  useEffect(() => {
    if (elections.length === 0) {
      refetch();
    }
  }, [elections.length, refetch]);

  return {
    elections,
    loading,
    error,
    refetch,
    isAIPowered: true,
    source: 'shaped_ai',
  };
};

/**
 * 🤖 useLotteryElections
 * Fetches AI-powered lottery election recommendations
 */
export const useLotteryElections = (limit = 10) => {
  const dispatch = useDispatch();
  
  const elections = useSelector(selectLotteryElections);
  const loading = useSelector((state) => state.recommendations?.lotteryLoading);
  const error = useSelector((state) => state.recommendations?.lotteryError);

  const refetch = useCallback(() => {
    dispatch(fetchLotteryElections({ limit }));
  }, [dispatch, limit]);

  useEffect(() => {
    if (elections.length === 0) {
      refetch();
    }
  }, [elections.length, refetch]);

  return {
    elections,
    loading,
    error,
    refetch,
    isAIPowered: true,
    source: 'shaped_ai',
  };
};

/**
 * 🔧 useRecommendationService
 * Checks health and status of the Shaped AI recommendation service
 */
export const useRecommendationService = () => {
  const dispatch = useDispatch();
  const serviceHealth = useSelector(selectServiceHealth);
  const aiMetrics = useSelector(selectAIMetrics);

  const checkHealth = useCallback(() => {
    dispatch(checkServiceHealth());
  }, [dispatch]);

  useEffect(() => {
    // Check health on mount
    checkHealth();
    
    // Recheck every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    isHealthy: serviceHealth.isHealthy,
    shapedAIActive: serviceHealth.shapedAIActive,
    engineName: serviceHealth.engineName,
    lastCheck: serviceHealth.lastCheck,
    aiMetrics,
    checkHealth,
  };
};

/**
 * 🎯 useAllRecommendations
 * Convenience hook to get all recommendation types at once
 */
export const useAllRecommendations = () => {
  const personalized = usePersonalizedRecommendations();
  const trending = useTrendingElections();
  const lottery = useLotteryElections();
  const service = useRecommendationService();

  return {
    personalized,
    trending,
    lottery,
    service,
    isAnyLoading: personalized.loading || trending.loading || lottery.loading,
    hasAnyError: personalized.error || trending.error || lottery.error,
  };
};

export default {
  usePersonalizedRecommendations,
  useSimilarElections,
  useTrendingElections,
  useLotteryElections,
  useRecommendationService,
  useAllRecommendations,
};