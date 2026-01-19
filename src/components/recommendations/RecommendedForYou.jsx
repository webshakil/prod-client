// src/components/recommendations/RecommendedForYou.jsx
// ✅ "Recommended For You" Section - AI-Powered Personalized Recommendations
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  AlertCircle,
  Brain,
  Loader,
  Zap,
} from 'lucide-react';
import { usePersonalizedRecommendations } from '../../hooks/useRecommendations';
import RecommendationCard from './RecommendationCard';
import AIBadge from './AIBadge';

/**
 * 🤖 Recommended For You Section
 * 
 * AI-powered personalized election recommendations using Shaped AI
 * Features:
 * - Horizontal scroll with navigation arrows
 * - Clear AI/Shaped AI branding
 * - Loading and error states
 * - Refresh capability
 */
const RecommendedForYou = ({ 
  limit = 10,
  showHeader = true,
  className = '',
}) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  const { 
    elections, 
    loading, 
    error, 
    refetch,
    isAIPowered,
    aiMetrics,
  } = usePersonalizedRecommendations(limit);

  // Check scroll position for arrow visibility
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener('resize', checkScrollPosition);
    return () => window.removeEventListener('resize', checkScrollPosition);
  }, [elections]);

  // Scroll handlers
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScrollPosition, 300);
    }
  };

  // Handle election click
  const handleElectionClick = (election) => {
    navigate(`/elections/${election.id}/vote`);
  };

  // Don't render if no user is logged in
  const userId = localStorage.getItem('userId');
  if (!userId) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Section Header */}
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* AI Icon with animation */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Sparkles className="text-white" size={24} />
              </div>
              {/* Pulse effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 rounded-xl animate-ping opacity-30" />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-800">
                  Recommended For You
                </h2>
                <AIBadge variant="inline" source="Shaped AI" />
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1.5">
                <Brain size={14} className="text-purple-500" />
                Personalized by Shaped AI • {elections.length} elections
              </p>
            </div>
          </div>

          {/* Refresh button */}
          <button
            onClick={refetch}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span className="text-sm font-medium hidden sm:inline">Refresh</span>
          </button>
        </div>
      )}

      {/* AI Powered Banner */}
      <div className="mb-4 p-3 bg-gradient-to-r from-violet-50 via-purple-50 to-pink-50 border border-purple-100 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-purple-800">
              🤖 AI-Powered Recommendations
            </p>
            <p className="text-xs text-purple-600">
              Elections selected by <span className="font-bold">Shaped AI</span> based on your interests and voting history
            </p>
          </div>
          <div className="hidden sm:block px-3 py-1 bg-white rounded-lg border border-purple-200">
            <p className="text-[10px] text-purple-500 font-medium">Engine</p>
            <p className="text-xs font-bold text-purple-700">vottery_elections_for_you</p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && elections.length === 0 && (
        <div className="flex items-center justify-center py-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <Loader className="w-16 h-16 text-purple-500 animate-spin" />
              <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-purple-600" />
            </div>
            <p className="text-purple-700 font-semibold">Loading AI recommendations...</p>
            <p className="text-purple-500 text-sm mt-1">Shaped AI is analyzing your preferences</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center py-12 bg-red-50 rounded-xl border border-red-100">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-700 font-semibold mb-2">Failed to load recommendations</p>
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && elections.length === 0 && (
        <div className="flex items-center justify-center py-16 bg-gray-50 rounded-xl border border-gray-200">
          <div className="text-center">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold mb-2">No recommendations yet</p>
            <p className="text-gray-500 text-sm">
              Vote on some elections to help our AI learn your preferences
            </p>
          </div>
        </div>
      )}

      {/* Elections Carousel */}
      {!error && elections.length > 0 && (
        <div className="relative group">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-purple-50 transition-colors border border-gray-200 -ml-4 opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollPosition}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {elections.map((election, index) => (
              <RecommendationCard
                key={election.id || index}
                election={election}
                isAIPowered={true}
                recommendationSource="shaped_ai"
                variant="compact"
                onClick={handleElectionClick}
              />
            ))}
          </div>

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-purple-50 transition-colors border border-gray-200 -mr-4 opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          )}
        </div>
      )}

      {/* AI Metrics Footer */}
      {isAIPowered && elections.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Sparkles size={12} className="text-purple-500" />
              Source: <span className="font-semibold text-purple-600">Shaped AI</span>
            </span>
            {aiMetrics?.lastFetchTime && (
              <span>
                Updated: {new Date(aiMetrics.lastFetchTime).toLocaleTimeString()}
              </span>
            )}
          </div>
          <span className="text-purple-500 font-medium">
            {elections.length} AI recommendations
          </span>
        </div>
      )}
    </div>
  );
};

export default RecommendedForYou;