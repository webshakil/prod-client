// src/components/recommendations/TrendingElections.jsx
// ✅ "Trending Elections" Section - AI-Powered Trending Recommendations
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Flame,
  Loader,
  Activity,
  Eye,
} from 'lucide-react';
import { useTrendingElections } from '../../hooks/useRecommendations';
import RecommendationCard from './RecommendationCard';
import AIBadge from './AIBadge';

/**
 * 🔥 Trending Elections Section
 * 
 * AI-powered trending election recommendations
 * Shows elections gaining traction based on Shaped AI analysis
 */
const TrendingElections = ({ 
  limit = 10,
  showHeader = true,
  layout = 'horizontal', // 'horizontal' | 'grid' | 'featured'
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
  } = useTrendingElections(limit);

  // Check scroll position
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    if (layout === 'horizontal') {
      checkScrollPosition();
    }
  }, [elections, layout]);

  // Scroll handlers
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
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

  return (
    <div className={`relative ${className}`}>
      {/* Section Header */}
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* Fire Icon with animation */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Flame className="text-white" size={24} />
              </div>
              {/* Flame animation */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                <Activity size={16} className="text-orange-500 animate-bounce" />
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-800">
                  Trending Now
                </h2>
                <AIBadge variant="inline" source="Shaped AI" />
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1.5">
                <TrendingUp size={14} className="text-orange-500" />
                Hot elections gaining momentum • {elections.length} trending
              </p>
            </div>
          </div>

          {/* Refresh button */}
          <button
            onClick={refetch}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span className="text-sm font-medium hidden sm:inline">Refresh</span>
          </button>
        </div>
      )}

      {/* AI Trending Banner */}
      <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 border border-orange-100 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center animate-pulse">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-orange-800">
              🔥 AI-Detected Trending Elections
            </p>
            <p className="text-xs text-orange-600">
              <span className="font-bold">Shaped AI</span> analyzes voting patterns, engagement, and interest signals
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-orange-200">
            <Eye size={14} className="text-orange-500" />
            <span className="text-xs font-bold text-orange-700">Live Data</span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && elections.length === 0 && (
        <div className="flex items-center justify-center py-16 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <Loader className="w-16 h-16 text-orange-500 animate-spin" />
              <Flame className="absolute inset-0 m-auto w-6 h-6 text-red-500" />
            </div>
            <p className="text-orange-700 font-semibold">Analyzing trends...</p>
            <p className="text-orange-500 text-sm mt-1">Shaped AI is processing engagement data</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center py-12 bg-red-50 rounded-xl border border-red-100">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-700 font-semibold mb-2">Couldn't load trending elections</p>
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
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold mb-2">No trending elections right now</p>
            <p className="text-gray-500 text-sm">Check back later for hot elections</p>
          </div>
        </div>
      )}

      {/* Elections - Horizontal Layout */}
      {!error && elections.length > 0 && layout === 'horizontal' && (
        <div className="relative group">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-orange-50 transition-colors border border-gray-200 -ml-4 opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollPosition}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {elections.map((election, index) => (
              <div key={election.id || index} className="relative flex-shrink-0">
                {/* Trending rank badge */}
                {index < 3 && (
                  <div className={`
                    absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg
                    ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : ''}
                    ${index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' : ''}
                    ${index === 2 ? 'bg-gradient-to-br from-amber-600 to-orange-700' : ''}
                  `}>
                    #{index + 1}
                  </div>
                )}
                <RecommendationCard
                  election={election}
                  isAIPowered={true}
                  recommendationSource="shaped_ai"
                  variant="compact"
                  onClick={handleElectionClick}
                />
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-orange-50 transition-colors border border-gray-200 -mr-4 opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          )}
        </div>
      )}

      {/* Elections - Grid Layout */}
      {!error && elections.length > 0 && layout === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {elections.map((election, index) => (
            <div key={election.id || index} className="relative">
              {/* Trending rank badge */}
              {index < 3 && (
                <div className={`
                  absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg
                  ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : ''}
                  ${index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' : ''}
                  ${index === 2 ? 'bg-gradient-to-br from-amber-600 to-orange-700' : ''}
                `}>
                  #{index + 1}
                </div>
              )}
              <RecommendationCard
                election={election}
                isAIPowered={true}
                recommendationSource="shaped_ai"
                variant="default"
                onClick={handleElectionClick}
              />
            </div>
          ))}
        </div>
      )}

      {/* Elections - Featured Layout (first one large, rest in grid) */}
      {!error && elections.length > 0 && layout === 'featured' && (
        <div className="space-y-6">
          {/* Featured (first) election */}
          {elections[0] && (
            <div className="relative">
              <div className="absolute -top-3 -left-3 z-10 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-black rounded-full shadow-lg flex items-center gap-1">
                <Flame size={12} />
                #1 TRENDING
              </div>
              <RecommendationCard
                election={elections[0]}
                isAIPowered={true}
                recommendationSource="shaped_ai"
                variant="featured"
                onClick={handleElectionClick}
              />
            </div>
          )}
          
          {/* Rest in grid */}
          {elections.length > 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {elections.slice(1).map((election, index) => (
                <div key={election.id || index} className="relative">
                  {index < 2 && (
                    <div className={`
                      absolute -top-2 -left-2 z-10 w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md
                      ${index === 0 ? 'bg-gradient-to-br from-gray-300 to-gray-400' : ''}
                      ${index === 1 ? 'bg-gradient-to-br from-amber-600 to-orange-700' : ''}
                    `}>
                      #{index + 2}
                    </div>
                  )}
                  <RecommendationCard
                    election={election}
                    isAIPowered={true}
                    recommendationSource="shaped_ai"
                    variant="default"
                    onClick={handleElectionClick}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Metrics Footer */}
      {isAIPowered && elections.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Sparkles size={12} className="text-orange-500" />
              Trend Analysis: <span className="font-semibold text-orange-600">Shaped AI</span>
            </span>
            <span className="flex items-center gap-1">
              <Activity size={12} className="text-green-500" />
              <span className="text-green-600">Live</span>
            </span>
          </div>
          <span className="text-orange-500 font-medium flex items-center gap-1">
            <Flame size={12} />
            {elections.length} trending elections
          </span>
        </div>
      )}
    </div>
  );
};

export default TrendingElections;