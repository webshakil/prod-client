/**
 * AIRecommendationSection Component
 * Displays a horizontal scrollable section of AI-recommended elections
 * 
 * Location: src/components/ai/AIRecommendationSection.jsx
 * 
 * Usage:
 * <AIRecommendationSection
 *   title="🔥 Trending Now"
 *   subtitle="Hot elections this week"
 *   elections={trendingElections}
 *   loading={loading}
 *   icon={<FaFire />}
 *   accentColor="orange"
 *   onViewElection={(election) => navigate(`/election/${election.id}`)}
 *   onShareElection={(election) => handleShare(election)}
 * />
 */

import React, { useRef } from 'react';
import {
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaShare,
  FaCalendar,
  FaVoteYea,
  FaTrophy,
  FaImage,
  FaRobot,
} from 'react-icons/fa';

// Accent color configurations
const accentColors = {
  orange: {
    gradient: 'from-orange-500 to-red-500',
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
    hover: 'hover:bg-orange-100',
  },
  blue: {
    gradient: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    hover: 'hover:bg-blue-100',
  },
  purple: {
    gradient: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    hover: 'hover:bg-purple-100',
  },
  green: {
    gradient: 'from-green-500 to-emerald-500',
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
    hover: 'hover:bg-green-100',
  },
  gold: {
    gradient: 'from-yellow-500 to-amber-500',
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-700',
    hover: 'hover:bg-yellow-100',
  },
  pink: {
    gradient: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50',
    text: 'text-pink-600',
    border: 'border-pink-200',
    badge: 'bg-pink-100 text-pink-700',
    hover: 'hover:bg-pink-100',
  },
};

// Mini Election Card for horizontal scroll
const MiniElectionCard = ({ election, onView, onShare, accentColor = 'blue' }) => {
  const colors = accentColors[accentColor] || accentColors.blue;
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatPrize = (amount) => {
    if (!amount || amount === 0) return null;
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  // Handle different field names from API
  const prizePool = election.lottery_prize_pool || election.lottery_total_prize_pool;
  const lotteryEnabled = election.lottery_enabled === true || election.lottery_enabled === 'true';
  /*eslint-disable*/
  const electionId = election.id || election.election_id;
  const imageUrl = election.topic_image_url;

  return (
    <div className="flex-shrink-0 w-72 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100">
      {/* Image Section */}
      <div className="relative h-36 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={election.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextElementSibling) {
                e.target.nextElementSibling.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <div 
          className={`w-full h-full ${imageUrl ? 'hidden' : 'flex'} flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100`}
        >
          <FaImage className="text-4xl text-gray-300" />
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
            {election.status === 'published' ? 'Active' : election.status || 'Active'}
          </span>
        </div>

        {/* Lottery Badge */}
        {lotteryEnabled && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-400 to-orange-400 text-white flex items-center gap-1">
              <FaTrophy className="text-xs" /> Lottery
            </span>
          </div>
        )}

        {/* AI Badge */}
        <div className="absolute bottom-2 right-2">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-black/60 text-white flex items-center gap-1">
            <FaRobot className="text-xs" /> AI Pick
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h4 className="font-bold text-gray-800 text-sm line-clamp-2 mb-2 min-h-[2.5rem] group-hover:text-blue-600 transition-colors">
          {election.title || 'Untitled Election'}
        </h4>

        {/* Prize Pool */}
        {lotteryEnabled && prizePool > 0 && (
          <div className={`flex items-center gap-1 ${colors.text} font-bold text-sm mb-2`}>
            <FaTrophy />
            <span>{formatPrize(prizePool)} Prize</span>
          </div>
        )}

        {/* Date */}
        <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
          <FaCalendar />
          <span>{formatDate(election.end_date)}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <FaVoteYea /> {election.vote_count || 0} votes
          </span>
          <span className="flex items-center gap-1">
            <FaEye /> {election.view_count || 0} views
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onView(election)}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-xs font-medium transition-colors"
          >
            <FaEye /> View
          </button>
          <button
            onClick={() => onShare(election)}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-xs font-medium transition-colors"
          >
            <FaShare /> Share
          </button>
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton
const LoadingSkeleton = () => (
  <div className="flex gap-4 overflow-hidden">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="flex-shrink-0 w-72 bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
        <div className="h-36 bg-gray-200" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-8 bg-gray-200 rounded" />
            <div className="h-8 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Empty State
const EmptyState = ({ message }) => (
  <div className="flex items-center justify-center py-8 text-gray-500">
    <div className="text-center">
      <FaRobot className="text-4xl mx-auto mb-2 text-gray-300" />
      <p className="text-sm">{message || 'No recommendations available'}</p>
    </div>
  </div>
);

// Main Component
export default function AIRecommendationSection({
  title,
  subtitle,
  elections = [],
  loading = false,
  error = null,
  icon,
  accentColor = 'blue',
  onViewElection,
  onShareElection,
  showViewAll = false,
  onViewAll,
  emptyMessage = 'No elections found',
}) {
  const scrollRef = useRef(null);
  const colors = accentColors[accentColor] || accentColors.blue;

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Don't render if there's an error
  if (error) {
    return null;
  }

  return (
    <div className={`${colors.bg} rounded-2xl p-5 mb-6 border ${colors.border}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className={`p-2 rounded-lg bg-gradient-to-r ${colors.gradient} text-white`}>
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              {title}
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center gap-1">
                <FaRobot className="text-xs" /> AI
              </span>
            </h3>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Scroll Buttons */}
          {elections.length > 0 && (
            <>
              <button
                onClick={() => scroll('left')}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all text-gray-600 hover:text-gray-800"
                aria-label="Scroll left"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all text-gray-600 hover:text-gray-800"
                aria-label="Scroll right"
              >
                <FaChevronRight />
              </button>
            </>
          )}

          {/* View All Button */}
          {showViewAll && onViewAll && (
            <button
              onClick={onViewAll}
              className={`px-4 py-2 rounded-lg ${colors.text} ${colors.hover} font-medium text-sm transition-colors`}
            >
              View All →
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : elections.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {elections.map((election, index) => (
            <MiniElectionCard
              key={election.id || election.election_id || index}
              election={election}
              accentColor={accentColor}
              onView={onViewElection}
              onShare={onShareElection}
            />
          ))}
        </div>
      )}

      {/* Source Attribution */}
      {!loading && elections.length > 0 && (
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <FaRobot /> Powered by Shaped AI
          </span>
          <span>{elections.length} recommendations</span>
        </div>
      )}
    </div>
  );
}

// Also export the MiniElectionCard for potential reuse
export { MiniElectionCard, LoadingSkeleton, EmptyState };