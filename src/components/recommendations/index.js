// src/components/recommendations/index.js
// ✅ Export all recommendation components

// Main section components
export { default as RecommendedForYou } from './RecommendedForYou';
export { default as SimilarElections } from './SimilarElections';
export { default as TrendingElections } from './TrendingElections';
export { default as TopLotteryPrizes } from './TopLotteryPrizes';

// UI components
export { default as RecommendationCard } from './RecommendationCard';
export { default as AIBadge, NonAIBadge, SourceBadge } from './AIBadge';

// Re-export hooks for convenience
export {
  usePersonalizedRecommendations,
  useSimilarElections,
  useTrendingElections,
  useLotteryElections,
  useRecommendationService,
  useAllRecommendations,
} from '../../hooks/useRecommendations';