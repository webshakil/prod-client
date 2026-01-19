// src/components/recommendations/TopLotteryPrizes.jsx
// ✅ "Top Lottery Prizes" Section - AI-Powered Lottery Recommendations
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  AlertCircle,
  Trophy,
  Gift,
  Loader,
  DollarSign,
  Ticket,
  Crown,
  Star,
  Zap,
} from 'lucide-react';
import { useLotteryElections } from '../../hooks/useRecommendations';
import AIBadge from './AIBadge';

/**
 * 🎰 Top Lottery Prizes Section
 * 
 * AI-powered lottery election recommendations
 * Showcases elections with the best lottery prize opportunities
 */
const TopLotteryPrizes = ({ 
  limit = 10,
  showHeader = true,
  layout = 'horizontal', // 'horizontal' | 'grid' | 'showcase'
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
  } = useLotteryElections(limit);

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

  // Get prize amount from election
  const getPrizeAmount = (election) => {
    return election.lottery_prize_pool || 
           election.lottery_config?.reward_amount || 
           election.lottery_config?.prize_pool ||
           0;
  };

  // Format currency
  const formatCurrency = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Lottery Card Component
  const LotteryCard = ({ election, index }) => {
    const prizeAmount = getPrizeAmount(election);
    const isTopPrize = index === 0;
    const winnerCount = election.lottery_config?.winner_count || 1;
    
    return (
      <div 
        onClick={() => handleElectionClick(election)}
        className={`
          relative flex-shrink-0 w-72
          bg-white rounded-xl
          border-2 ${isTopPrize ? 'border-purple-300' : 'border-gray-100'}
          shadow-lg hover:shadow-xl
          transition-all duration-300
          cursor-pointer
          overflow-hidden
          group
          ${isTopPrize ? 'ring-2 ring-purple-200 ring-offset-2' : ''}
        `}
      >
        {/* Prize gradient header */}
        <div className={`
          p-4
          ${isTopPrize 
            ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400' 
            : 'bg-gradient-to-r from-purple-500 to-indigo-500'
          }
        `}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {isTopPrize && <Crown size={16} className="text-yellow-300" />}
              <span className="text-white/80 text-xs font-semibold uppercase tracking-wide">
                {isTopPrize ? '👑 Top Prize' : '🎰 Lottery'}
              </span>
            </div>
            <AIBadge variant="compact" />
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="text-white/70" size={24} />
            <span className="text-2xl font-black text-white">
              {formatCurrency(prizeAmount)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h4 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors">
            {election.title}
          </h4>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Ticket size={12} />
              <span>{election.vote_count || 0} entries</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy size={12} />
              <span>{winnerCount} winner{winnerCount > 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Fee info */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              Entry: {election.is_free ? 'Free' : `$${election.participation_fee || 0}`}
            </span>
            <span className="text-purple-600 font-semibold flex items-center gap-1">
              <Sparkles size={10} />
              AI Pick
            </span>
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    );
  };

  // Showcase Card (Featured, larger)
  const ShowcaseCard = ({ election }) => {
    const prizeAmount = getPrizeAmount(election);
    const winnerCount = election.lottery_config?.winner_count || 1;
    
    return (
      <div 
        onClick={() => handleElectionClick(election)}
        className="relative overflow-hidden rounded-2xl cursor-pointer group"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400" />
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative p-8">
          {/* Top badge */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Crown className="text-yellow-300" size={24} />
              <span className="text-white/80 font-semibold text-sm uppercase tracking-wider">
                🏆 Jackpot
              </span>
            </div>
            <AIBadge variant="glow" source="Shaped AI" />
          </div>

          {/* Prize amount */}
          <div className="mb-6">
            <p className="text-white/70 text-sm mb-1">Prize Pool</p>
            <p className="text-5xl font-black text-white drop-shadow-lg">
              {formatCurrency(prizeAmount)}
            </p>
          </div>

          {/* Election title */}
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
            {election.title}
          </h3>
          {election.description && (
            <p className="text-white/70 text-sm mb-6 line-clamp-2">
              {election.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-white/80">
              <Ticket size={16} />
              <span className="text-sm">{election.vote_count || 0} entries</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Trophy size={16} />
              <span className="text-sm">{winnerCount} winner{winnerCount > 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* CTA */}
          <button className="w-full py-4 bg-white text-purple-700 font-bold rounded-xl flex items-center justify-center gap-2 group-hover:bg-yellow-300 group-hover:text-purple-900 transition-all shadow-lg">
            <Gift size={20} />
            <span>Enter Lottery</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Section Header */}
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* Trophy Icon with animation */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Trophy className="text-white" size={24} />
              </div>
              {/* Sparkle effect */}
              <Star size={12} className="absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-800">
                  Top Lottery Prizes
                </h2>
                <AIBadge variant="inline" source="Shaped AI" />
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1.5">
                <Gift size={14} className="text-purple-500" />
                Win big with AI-curated lottery elections
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

      {/* AI Lottery Banner */}
      <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 border border-purple-100 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-purple-800">
              🎰 AI-Curated Lottery Elections
            </p>
            <p className="text-xs text-purple-600">
              <span className="font-bold">Shaped AI</span> selects the best lottery opportunities based on prize pools and win rates
            </p>
          </div>
          <div className="hidden sm:block px-3 py-1.5 bg-white rounded-lg border border-purple-200">
            <p className="text-xs font-bold text-purple-700">
              {elections.reduce((sum, e) => sum + getPrizeAmount(e), 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
            </p>
            <p className="text-[10px] text-purple-500">Total Prizes</p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && elections.length === 0 && (
        <div className="flex items-center justify-center py-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <Loader className="w-16 h-16 text-purple-500 animate-spin" />
              <Trophy className="absolute inset-0 m-auto w-6 h-6 text-purple-600" />
            </div>
            <p className="text-purple-700 font-semibold">Finding best prizes...</p>
            <p className="text-purple-500 text-sm mt-1">Shaped AI is analyzing lottery pools</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center py-12 bg-red-50 rounded-xl border border-red-100">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-700 font-semibold mb-2">Couldn't load lottery elections</p>
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
            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold mb-2">No lottery elections available</p>
            <p className="text-gray-500 text-sm">Check back later for exciting prizes</p>
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
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-purple-50 transition-colors border border-gray-200 -ml-4 opacity-0 group-hover:opacity-100"
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
              <LotteryCard 
                key={election.id || index} 
                election={election} 
                index={index}
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

      {/* Elections - Grid Layout */}
      {!error && elections.length > 0 && layout === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {elections.map((election, index) => (
            <LotteryCard 
              key={election.id || index} 
              election={election} 
              index={index}
            />
          ))}
        </div>
      )}

      {/* Elections - Showcase Layout (first one large, rest in scroll) */}
      {!error && elections.length > 0 && layout === 'showcase' && (
        <div className="space-y-6">
          {/* Featured (first) election */}
          {elections[0] && (
            <ShowcaseCard election={elections[0]} />
          )}
          
          {/* Rest in horizontal scroll */}
          {elections.length > 1 && (
            <div className="relative group">
              <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                <Gift size={14} />
                More Lottery Elections
              </h4>
              
              <div
                className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {elections.slice(1).map((election, index) => (
                  <LotteryCard 
                    key={election.id || index} 
                    election={election} 
                    index={index + 1}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Metrics Footer */}
      {isAIPowered && elections.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Sparkles size={12} className="text-purple-500" />
              Curated by: <span className="font-semibold text-purple-600">Shaped AI</span>
            </span>
          </div>
          <span className="text-purple-500 font-medium flex items-center gap-1">
            <Trophy size={12} />
            {elections.length} lottery elections
          </span>
        </div>
      )}
    </div>
  );
};

export default TopLotteryPrizes;