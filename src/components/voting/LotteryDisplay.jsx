import React, { useEffect, useState } from 'react';
import { Trophy, Gift, Users, Sparkles, Ticket } from 'lucide-react';

export default function LotteryDisplay({ election, lotteryStats, hasVoted }) {
  const [animating, setAnimating] = useState(false);
  const lotteryConfig = election.lottery_config;

  if (!lotteryConfig?.is_lotterized) {
    return null;
  }
/*eslint-disable*/
  useEffect(() => {
    // Start animation when component mounts
    setAnimating(true);
    const timer = setTimeout(() => setAnimating(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const formatPrize = () => {
    if (lotteryConfig.reward_type === 'monetary') {
      return `$${lotteryConfig.reward_amount?.toLocaleString() || 0}`;
    }
    return lotteryConfig.prize_description || 'Special Prize';
  };

  const getPrizeIcon = () => {
    switch (lotteryConfig.reward_type) {
      case 'monetary':
        return '💰';
      case 'coupon':
        return '🎫';
      case 'voucher':
        return '🎟️';
      case 'experience':
        return '🌟';
      default:
        return '🎁';
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 rounded-lg shadow-2xl overflow-hidden">
      {/* Animated Header */}
      <div className="relative p-6 text-white overflow-hidden">
        {/* Floating particles animation */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-white rounded-full ${animating ? 'animate-ping' : ''}`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="animate-pulse" size={24} />
            <h3 className="text-2xl font-bold">Lottery Draw</h3>
          </div>
          <p className="text-purple-100 text-sm">
            Vote to automatically enter the lottery!
          </p>
        </div>
      </div>

      {/* 3D Lottery Machine Visual */}
      <div className="relative bg-white/10 backdrop-blur-sm p-6">
        <div className="relative h-48 flex items-center justify-center">
          {/* Oval lottery machine container */}
          <div className="relative w-40 h-40">
            {/* Outer glass effect */}
            <div className="absolute inset-0 border-4 border-white/30 rounded-full" 
                 style={{ 
                   transform: 'perspective(500px) rotateX(10deg)',
                   boxShadow: 'inset 0 0 50px rgba(255,255,255,0.3)'
                 }}>
              {/* Inner container with balls */}
              <div className="absolute inset-2 flex items-center justify-center">
                {hasVoted ? (
                  // Show ticket if user has voted
                  <div className="animate-bounce">
                    <Ticket className="text-white" size={48} />
                  </div>
                ) : (
                  // Show floating balls
                  <div className="relative w-full h-full">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className={`absolute w-8 h-8 bg-gradient-to-br from-white to-blue-200 rounded-full shadow-lg ${
                          animating ? 'animate-bounce' : ''
                        }`}
                        style={{
                          left: `${20 + Math.random() * 60}%`,
                          top: `${20 + Math.random() * 60}%`,
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: `${1 + Math.random()}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Base */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-8 bg-white/20 rounded-full blur-sm" />
          </div>
        </div>

        {hasVoted && (
          <div className="text-center mt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white text-sm font-semibold">
              <CheckCircle size={16} />
              You're Entered!
            </div>
          </div>
        )}
      </div>

      {/* Prize Information */}
      <div className="bg-white p-6 space-y-4">
        {/* Prize Pool */}
        <div className="text-center pb-4 border-b">
          <div className="text-4xl mb-2">{getPrizeIcon()}</div>
          <p className="text-sm text-gray-600 mb-1">Prize Pool</p>
          <p className="text-3xl font-bold text-purple-600">{formatPrize()}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <Trophy className="text-purple-600 mx-auto mb-2" size={24} />
            <p className="text-2xl font-bold text-purple-600">
              {lotteryConfig.winner_count}
            </p>
            <p className="text-xs text-gray-600">Winners</p>
          </div>

          <div className="bg-pink-50 rounded-lg p-4 text-center">
            <Users className="text-pink-600 mx-auto mb-2" size={24} />
            <p className="text-2xl font-bold text-pink-600">
              {lotteryStats?.total_tickets || 0}
            </p>
            <p className="text-xs text-gray-600">Total Entries</p>
          </div>
        </div>

        {/* Funding Source */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Prize Funded By</p>
          <p className="text-sm font-semibold text-gray-800 capitalize">
            {lotteryConfig.prize_funding_source?.replace('_', ' ')}
          </p>
        </div>

        {/* Draw Time */}
        <div className="bg-orange-50 rounded-lg p-3 text-center">
          <p className="text-xs text-orange-800 mb-1">🕐 Draw Time</p>
          <p className="text-sm font-bold text-orange-600">
            {lotteryConfig.draw_time === 'at_election_end' 
              ? 'When Election Ends'
              : new Date(lotteryConfig.draw_time).toLocaleString()}
          </p>
        </div>

        {/* Call to Action */}
        {!hasVoted && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 text-center text-white">
            <Gift className="mx-auto mb-2" size={32} />
            <p className="font-bold mb-1">Vote to Win!</p>
            <p className="text-xs text-purple-100">
              Cast your vote to automatically enter the lottery
            </p>
          </div>
        )}

        {/* Your Odds */}
        {hasVoted && lotteryStats?.total_tickets > 0 && (
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs text-green-700 mb-1">Your Winning Odds</p>
            <p className="text-lg font-bold text-green-600">
              {((lotteryConfig.winner_count / lotteryStats.total_tickets) * 100).toFixed(2)}%
            </p>
            <p className="text-xs text-green-600 mt-1">
              {lotteryConfig.winner_count} winners from {lotteryStats.total_tickets} entries
            </p>
          </div>
        )}
      </div>
    </div>
  );
}