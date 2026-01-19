// src/components/recommendations/SimilarElections.jsx
// ✅ "Similar Elections" Section - AI-Powered Related Recommendations
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  AlertCircle,
  GitBranch,
  Loader,
  Link2,
} from 'lucide-react';
import { useSimilarElections } from '../../hooks/useRecommendations';
import RecommendationCard from './RecommendationCard';
import AIBadge from './AIBadge';

/**
 * 🤖 Similar Elections Section
 * 
 * AI-powered similar election recommendations based on current election
 * For use on Election Detail pages
 */
const SimilarElections = ({ 
  electionId,
  currentElectionTitle = '',
  limit = 5,
  showHeader = true,
  layout = 'horizontal', // 'horizontal' | 'grid' | 'vertical'
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
  } = useSimilarElections(electionId, limit);

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

  // Don't render if no election ID
  if (!electionId) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Section Header */}
      {showHeader && (
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            {/* AI Icon */}
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/30">
              <Link2 className="text-white" size={20} />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-800">
                  Similar Elections
                </h3>
                <AIBadge variant="inline" source="Shaped AI" />
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <GitBranch size={12} className="text-indigo-500" />
                Related to {currentElectionTitle ? `"${currentElectionTitle.slice(0, 30)}..."` : 'this election'}
              </p>
            </div>
          </div>

          {/* Refresh button */}
          <button
            onClick={refetch}
            disabled={loading}
            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
            title="Refresh similar elections"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      )}

      {/* AI Banner */}
      <div className="mb-4 p-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg">
        <div className="flex items-center gap-2 text-xs">
          <Sparkles size={14} className="text-indigo-500" />
          <span className="text-indigo-700">
            <span className="font-semibold">Shaped AI</span> found these elections similar to your current view
          </span>
        </div>
      </div>

      {/* Loading State */}
      {loading && elections.length === 0 && (
        <div className="flex items-center justify-center py-12 bg-indigo-50/50 rounded-xl">
          <div className="text-center">
            <Loader className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-3" />
            <p className="text-indigo-700 font-medium text-sm">Finding similar elections...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center py-8 bg-red-50 rounded-lg border border-red-100">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-600 text-sm font-medium">Could not load similar elections</p>
            <button
              onClick={refetch}
              className="mt-2 px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && elections.length === 0 && (
        <div className="flex items-center justify-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center">
            <Link2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No similar elections found</p>
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
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-indigo-50 transition-colors border border-gray-200 -ml-3 opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={16} className="text-gray-600" />
            </button>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollPosition}
            className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide"
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
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-indigo-50 transition-colors border border-gray-200 -mr-3 opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={16} className="text-gray-600" />
            </button>
          )}
        </div>
      )}

      {/* Elections - Grid Layout */}
      {!error && elections.length > 0 && layout === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {elections.map((election, index) => (
            <RecommendationCard
              key={election.id || index}
              election={election}
              isAIPowered={true}
              recommendationSource="shaped_ai"
              variant="default"
              onClick={handleElectionClick}
            />
          ))}
        </div>
      )}

      {/* Elections - Vertical Layout */}
      {!error && elections.length > 0 && layout === 'vertical' && (
        <div className="space-y-3">
          {elections.map((election, index) => (
            <RecommendationCard
              key={election.id || index}
              election={election}
              isAIPowered={true}
              recommendationSource="shaped_ai"
              variant="default"
              onClick={handleElectionClick}
            />
          ))}
        </div>
      )}

      {/* AI Footer */}
      {isAIPowered && elections.length > 0 && (
        <div className="mt-3 flex items-center justify-end text-[10px] text-indigo-500">
          <Sparkles size={10} className="mr-1" />
          <span>Powered by Shaped AI • {elections.length} similar elections</span>
        </div>
      )}
    </div>
  );
};

export default SimilarElections;