// src/components/Dashboard/Tabs/lotteryyy/DemoWinnerReveal.jsx
// ============================================================================
// 🎰 DEMO WINNER REVEAL - Shows what happens at election end
// ============================================================================
// This component demonstrates the winner reveal animation using REAL data
// from the parent LotterySlotMachine component.
// 
// It does NOT change any original data - it uses:
// - Real ball numbers from API
// - Real lucky voters count from API
// - Real total entries from API
// ============================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, RotateCcw } from 'lucide-react';

export default function DemoWinnerReveal({
  isOpen,
  onClose,
  // REAL DATA from parent (LotterySlotMachine)
  realBallNumbers = [],        // Real ball numbers from API
  realLuckyVotersCount = 2,    // Real lucky voters count from API
  realTotalEntries = 0,        // Real total entries from API
  /*eslint-disable*/
  compact = false,
}) {
  // ============================================================================
  // STATE
  // ============================================================================
  const [demoPhase, setDemoPhase] = useState('ready'); // ready, revealing, completed
  const [displayDigits, setDisplayDigits] = useState(['0', '0', '0', '0', '0', '0']);
  const [revealedWinners, setRevealedWinners] = useState([]);
  const [currentRevealIndex, setCurrentRevealIndex] = useState(-1);
  const [statusMessage, setStatusMessage] = useState('Click "Start Demo" to see winner reveal');

  const spinIntervalRef = useRef(null);
  const isRevealingRef = useRef(false);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  // Get random ball number from REAL voter pool
  const getRandomBallNumber = useCallback(() => {
    if (realBallNumbers.length > 0) {
      const randomIndex = Math.floor(Math.random() * realBallNumbers.length);
      return realBallNumbers[randomIndex];
    }
    // Fallback if no real data
    return String(Math.floor(100000 + Math.random() * 900000));
  }, [realBallNumbers]);

  // Get ordinal suffix (1st, 2nd, 3rd, etc.)
  const getOrdinal = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  // Generate simulated winners from REAL ball numbers
  const generateWinnersFromRealData = useCallback(() => {
    const winners = [];
    const availableBallNumbers = [...realBallNumbers];
    
    for (let i = 0; i < realLuckyVotersCount && availableBallNumbers.length > 0; i++) {
      // Pick a random ball number from available pool
      const randomIndex = Math.floor(Math.random() * availableBallNumbers.length);
      const ballNumber = availableBallNumbers.splice(randomIndex, 1)[0];
      
      winners.push({
        id: i + 1,
        displayName: `Lucky Voter`,
        ballNumber: ballNumber,
        rank: i + 1,
      });
    }
    
    return winners;
  }, [realBallNumbers, realLuckyVotersCount]);

  // ============================================================================
  // DEMO FUNCTIONS
  // ============================================================================

  // Reset demo to initial state
  const resetDemo = useCallback(() => {
    isRevealingRef.current = false;
    if (spinIntervalRef.current) {
      clearInterval(spinIntervalRef.current);
      spinIntervalRef.current = null;
    }
    setDemoPhase('ready');
    setDisplayDigits(['0', '0', '0', '0', '0', '0']);
    setRevealedWinners([]);
    setCurrentRevealIndex(-1);
    setStatusMessage('Click "Start Demo" to see winner reveal');
  }, []);

  // Start the winner reveal demo
  const startWinnerRevealDemo = async () => {
    if (isRevealingRef.current) return;
    
    isRevealingRef.current = true;
    setDemoPhase('revealing');
    setRevealedWinners([]);

    // Generate winners from REAL ball numbers
    const winners = generateWinnersFromRealData();

    if (winners.length === 0) {
      setStatusMessage('⚠️ No ball numbers available for demo');
      setDemoPhase('ready');
      isRevealingRef.current = false;
      return;
    }

    // Reveal each winner one by one (as per PDF requirement)
    for (let i = 0; i < winners.length; i++) {
      if (!isRevealingRef.current) break; // Stop if demo was reset
      
      setCurrentRevealIndex(i);
      setStatusMessage(`🎊 Revealing ${getOrdinal(i + 1)} Lucky Voter Winner...`);

      // Dramatic slowdown effect (like real slot machine)
      // Fast spinning that gradually slows down
      for (let j = 0; j < 15; j++) {
        if (!isRevealingRef.current) break;
        await new Promise(resolve => setTimeout(resolve, 80 + j * 15));
        const ballNumber = getRandomBallNumber();
        setDisplayDigits(ballNumber.split(''));
      }

      // Final slowdown - very slow
      for (let k = 0; k < 8; k++) {
        if (!isRevealingRef.current) break;
        await new Promise(resolve => setTimeout(resolve, 200 + k * 100));
        const ballNumber = getRandomBallNumber();
        setDisplayDigits(ballNumber.split(''));
      }

      if (!isRevealingRef.current) break;

      // STOP and reveal the winner's ball number
      setDisplayDigits(winners[i].ballNumber.split(''));

      // Flash effect pause
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!isRevealingRef.current) break;

      // Add to revealed winners list
      setRevealedWinners(prev => [...prev, winners[i]]);

      // Wait before revealing next winner
      if (i < winners.length - 1) {
        setStatusMessage(`✅ ${getOrdinal(i + 1)} Winner Revealed! Preparing ${getOrdinal(i + 2)}...`);
        await new Promise(resolve => setTimeout(resolve, 2500));
      }
    }

    if (isRevealingRef.current) {
      // All winners revealed
      setCurrentRevealIndex(-1);
      setDemoPhase('completed');
      setStatusMessage(`✅ All ${winners.length} Lucky Voter(s) Revealed!`);
      isRevealingRef.current = false;
    }
  };

  // Cleanup on unmount or close
  useEffect(() => {
    if (!isOpen) {
      resetDemo();
    }
    return () => {
      isRevealingRef.current = false;
      if (spinIntervalRef.current) {
        clearInterval(spinIntervalRef.current);
      }
    };
  }, [isOpen, resetDemo]);

  // ============================================================================
  // RENDER
  // ============================================================================
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-black rounded-xl overflow-hidden border-4 border-yellow-500 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-purple-900 px-4 py-3 flex justify-between items-center border-b-2 border-purple-500">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎰</span>
            <div>
              <h3 className="text-white font-bold">Demo: Winner Reveal</h3>
              <p className="text-purple-300 text-xs">See what happens at election end</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-red-400 transition p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Demo Controls */}
        <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
          <div className="text-gray-400 text-sm">
            <span>Using real data: </span>
            <span className="text-white font-semibold">{realTotalEntries} entries</span>
            <span className="mx-2">•</span>
            <span className="text-white font-semibold">{realLuckyVotersCount} winners</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetDemo}
              className="flex items-center gap-1 bg-gray-600 hover:bg-gray-500 text-white px-3 py-1.5 rounded text-sm font-medium transition"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={startWinnerRevealDemo}
              disabled={demoPhase === 'revealing'}
              className="flex items-center gap-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded text-sm font-medium transition"
            >
              <Play className="w-4 h-4" />
              {demoPhase === 'ready' ? 'Start Demo' : demoPhase === 'revealing' ? 'Revealing...' : 'Run Again'}
            </button>
          </div>
        </div>

        {/* Slot Machine Display */}
        <div className="p-4 bg-gradient-to-b from-gray-800 to-gray-900">
          {/* Digit Display */}
          <div className="flex justify-center gap-1 mb-3">
            {displayDigits.map((digit, index) => (
              <div key={index} className="relative">
                <div 
                  className={`
                    w-12 h-16 sm:w-14 sm:h-20
                    bg-gradient-to-b from-gray-100 via-white to-gray-200
                    rounded-lg flex items-center justify-center
                    border-2 border-gray-400 shadow-lg
                    relative overflow-hidden
                    ${demoPhase === 'revealing' ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''}
                  `}
                >
                  <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/60 to-transparent" />
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 transform -translate-y-1/2 z-10" />
                  <span 
                    className={`
                      text-3xl sm:text-4xl font-black text-gray-900 relative z-20
                      ${demoPhase === 'revealing' ? 'animate-pulse' : ''}
                    `}
                    style={{ 
                      fontFamily: 'Impact, Arial Black, sans-serif',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                    }}
                  >
                    {digit}
                  </span>
                  <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-gray-300/40 to-transparent" />
                </div>
              </div>
            ))}
          </div>

          {/* Status Message */}
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${
              demoPhase === 'ready' 
                ? 'bg-gray-500/20 border border-gray-500' 
                : demoPhase === 'revealing'
                ? 'bg-purple-500/20 border border-purple-500'
                : 'bg-green-500/20 border border-green-500'
            }`}>
              <span className={`text-sm font-medium ${
                demoPhase === 'ready' 
                  ? 'text-gray-400' 
                  : demoPhase === 'revealing'
                  ? 'text-purple-400 animate-pulse'
                  : 'text-green-400'
              }`}>
                {statusMessage}
              </span>
            </div>
          </div>
        </div>

        {/* Winners Display Section */}
        {revealedWinners.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 px-4 py-3 border-t-2 border-yellow-400">
            <h3 className="text-yellow-900 font-bold text-sm mb-2 text-center">
              🏆 LUCKY VOTERS WINNERS 🏆
            </h3>
            
            <div className="space-y-1.5">
              {revealedWinners.map((winner, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-lg px-3 py-2 flex items-center justify-between shadow-md"
                  style={{ animation: 'fadeIn 0.5s ease-out' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 font-black w-8 h-8 rounded-full flex items-center justify-center text-xs shadow">
                      {getOrdinal(winner.rank)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        {winner.displayName}
                      </p>
                      <p className="text-gray-500 text-xs font-mono">
                        Ball #: {winner.ballNumber}
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl">🏆</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Footer */}
        <div className="bg-gray-900 px-4 py-2 border-t border-gray-700">
          <p className="text-gray-500 text-xs text-center">
            💡 This demo uses your real ball numbers ({realBallNumbers.length} available) to simulate the winner reveal
          </p>
        </div>
      </div>

      {/* CSS for fade-in animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}