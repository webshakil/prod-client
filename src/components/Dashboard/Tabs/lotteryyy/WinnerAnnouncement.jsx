// src/components/Dashboard/Tabs/lotteryyy/WinnerAnnouncement.jsx
// ✨ STUNNING Winner Announcement with Confetti
import React, { useState, useEffect } from 'react';
/*eslint-disable*/
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, DollarSign, Sparkles, Gift } from 'lucide-react';
import ConfettiExplosion from 'react-confetti-explosion';

export default function WinnerAnnouncement({
  isVisible = false,
  winners = [],
  amIWinner = false,
  myPrize = null,
  myRank = null,
  rewardType = 'monetary',
  onClose = null,
  onClaimPrize = null,
}) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentWinnerIndex, setCurrentWinnerIndex] = useState(0);

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      
      // Cycle through winners
      if (winners.length > 1) {
        const interval = setInterval(() => {
          setCurrentWinnerIndex(prev => (prev + 1) % winners.length);
        }, 5000);
        
        return () => clearInterval(interval);
      }
    } else {
      setShowConfetti(false);
      setCurrentWinnerIndex(0);
    }
  }, [isVisible, winners.length]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRankEmoji = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  const getRankLabel = (rank) => {
    switch (rank) {
      case 1: return '1st Place';
      case 2: return '2nd Place';
      case 3: return '3rd Place';
      default: return `${rank}th Place`;
    }
  };

  if (!isVisible || winners.length === 0) return null;

  const currentWinner = winners[currentWinnerIndex];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Confetti */}
          {showConfetti && (
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <ConfettiExplosion
                force={0.8}
                duration={5000}
                particleCount={200}
                width={2000}
                colors={['#FFD700', '#FFA500', '#FF6347', '#4169E1', '#9370DB']}
              />
            </div>
          )}

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.5, rotate: 10 }}
            transition={{ type: 'spring', damping: 15 }}
            className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-20">
              <motion.div
                animate={{ 
                  backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{ 
                  duration: 20,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
                className="w-full h-full"
                style={{
                  backgroundImage: 'linear-gradient(45deg, #FFD700 25%, transparent 25%, transparent 75%, #FFD700 75%, #FFD700), linear-gradient(45deg, #FFD700 25%, transparent 25%, transparent 75%, #FFD700 75%, #FFD700)',
                  backgroundSize: '60px 60px',
                  backgroundPosition: '0 0, 30px 30px',
                }}
              />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition backdrop-blur-sm"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Content */}
            <div className="relative z-10 p-8 text-center text-white">
              
              {/* Trophy Icon */}
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, -10, 10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
                className="mx-auto w-32 h-32 mb-6"
              >
                <div className="relative">
                  <Trophy className="w-full h-full text-yellow-300 drop-shadow-2xl" />
                  
                  {/* Glow Effect */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                    }}
                    className="absolute inset-0 bg-yellow-400 rounded-full blur-3xl"
                  />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h1
                animate={{ 
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                }}
                className="text-5xl md:text-6xl font-black mb-4 drop-shadow-lg"
              >
                🎉 WINNER! 🎉
              </motion.h1>

              {/* Winner Rank */}
              <div className="mb-6">
                <div className="inline-block bg-white bg-opacity-20 backdrop-blur-md rounded-full px-6 py-3">
                  <p className="text-3xl font-bold flex items-center gap-3">
                    {getRankEmoji(currentWinner.rank)}
                    {getRankLabel(currentWinner.rank)}
                  </p>
                </div>
              </div>

              {/* Winner Name/Ball Number */}
              <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-2xl p-6 mb-6">
                {currentWinner.winner_name && currentWinner.winner_name !== 'Anonymous' ? (
                  <>
                    <p className="text-sm font-semibold opacity-90 mb-2">Winner</p>
                    <p className="text-3xl font-black mb-2">{currentWinner.winner_name}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold opacity-90 mb-2">Anonymous Winner</p>
                  </>
                )}
                
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <p className="text-lg font-mono">
                    Ball #{currentWinner.ball_number?.toString().slice(-4)}
                  </p>
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                </div>
              </div>

              {/* Prize Amount */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                }}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 mb-6 shadow-2xl"
              >
                <p className="text-sm font-semibold text-gray-900 mb-2">Prize Won</p>
                
                {rewardType === 'monetary' || rewardType === 'projected_revenue' ? (
                  <p className="text-6xl font-black text-white drop-shadow-lg flex items-center justify-center gap-3">
                    <DollarSign className="w-12 h-12" />
                    {formatCurrency(currentWinner.prize_amount).replace('$', '')}
                  </p>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <Gift className="w-12 h-12 text-white" />
                    <p className="text-3xl font-bold text-white">Special Prize</p>
                  </div>
                )}
              </motion.div>

              {/* Multiple Winners Indicator */}
              {winners.length > 1 && (
                <div className="flex items-center justify-center gap-2 mb-6">
                  {winners.map((_, index) => (
                    <motion.div
                      key={index}
                      animate={{ 
                        scale: currentWinnerIndex === index ? 1.5 : 1,
                        opacity: currentWinnerIndex === index ? 1 : 0.4,
                      }}
                      className={`w-3 h-3 rounded-full ${
                        currentWinnerIndex === index 
                          ? 'bg-yellow-300' 
                          : 'bg-white'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Personal Winner Message */}
              {amIWinner && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="bg-green-500 bg-opacity-90 rounded-2xl p-6 mb-6"
                >
                  <p className="text-2xl font-black mb-3">
                    🎊 CONGRATULATIONS! YOU WON! 🎊
                  </p>
                  <p className="text-lg mb-4">
                    You finished in {getRankLabel(myRank)}!
                  </p>
                  <p className="text-3xl font-black mb-4">
                    Your Prize: {formatCurrency(myPrize)}
                  </p>
                  
                  {onClaimPrize && (
                    <button
                      onClick={onClaimPrize}
                      className="bg-white text-green-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition transform hover:scale-105 shadow-lg"
                    >
                      💰 Claim Your Prize Now!
                    </button>
                  )}
                </motion.div>
              )}

              {/* All Winners List */}
              {winners.length > 1 && (
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-4 max-h-48 overflow-y-auto">
                  <p className="text-sm font-semibold mb-3">All Winners</p>
                  <div className="space-y-2">
                    {winners.map((winner, index) => (
                      <div 
                        key={index}
                        className={`flex items-center justify-between p-2 rounded-lg ${
                          currentWinnerIndex === index 
                            ? 'bg-white bg-opacity-20' 
                            : 'bg-white bg-opacity-5'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getRankEmoji(winner.rank)}</span>
                          <span className="font-semibold text-sm">
                            {winner.winner_name || 'Anonymous'}
                          </span>
                        </div>
                        <span className="font-bold text-yellow-300">
                          {formatCurrency(winner.prize_amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="mt-6 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-8 py-3 rounded-xl font-bold transition backdrop-blur-sm"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}