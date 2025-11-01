import React, { useEffect, useState } from 'react';
import { Trophy, Sparkles } from 'lucide-react';

export default function LotteryMachine({ 
  isVisible, 
  isSpinning, 
  prizeAmount, 
  currency = 'USD',
  winnerCount,
  showVoteBall,
  ballNumber,
}) {
  const [balls, setBalls] = useState([]);

  useEffect(() => {
    if (isSpinning) {
      const newBalls = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        rotation: Math.random() * 360,
        delay: Math.random() * 2,
        number: Math.floor(Math.random() * 99) + 1,
      }));
      setBalls(newBalls);
    }
  }, [isSpinning]);

  if (!isVisible) return null;

  return (
    <div className="relative w-full max-w-md mx-auto my-8">
      {/* Prize Display */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg">
          <Trophy className="text-white" size={24} />
          <div className="text-white">
            <div className="text-sm font-medium">Prize Pool</div>
            <div className="text-2xl font-bold">{currency} {prizeAmount?.toFixed(2) || '0.00'}</div>
          </div>
          <Sparkles className="text-white" size={24} />
        </div>
        {winnerCount > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            {winnerCount} {winnerCount === 1 ? 'Winner' : 'Winners'}
          </div>
        )}
      </div>

      {/* 3D Lottery Machine */}
      <div className="relative" style={{ perspective: '1000px' }}>
        <div className={`
          relative w-80 h-96 mx-auto
          bg-gradient-to-br from-blue-100/40 to-purple-100/40
          rounded-[50%] 
          shadow-2xl
          border-4 border-blue-300/50
          overflow-hidden
          ${isSpinning ? 'animate-pulse-slow' : ''}
        `}>
          {/* Lottery Balls */}
          <div className="absolute inset-0 overflow-hidden rounded-[50%]">
            {balls.map((ball) => (
              <div
                key={ball.id}
                className="absolute w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                style={{
                  left: `${ball.x}%`,
                  top: `${ball.y}%`,
                  transform: `rotate(${ball.rotation}deg)`,
                  animation: isSpinning ? `lottery-spin-${ball.id % 3} 4s infinite ease-in-out` : 'none',
                  animationDelay: `${ball.delay}s`,
                }}
              >
                {ball.number}
              </div>
            ))}

            {/* Your Vote Ball */}
            {showVoteBall && ballNumber && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-2xl ring-4 ring-green-300 ring-opacity-50"
                  style={{
                    animation: 'bounce-in 1s ease-out forwards'
                  }}
                >
                  {ballNumber}
                </div>
              </div>
            )}
          </div>

          {/* Glass Shine */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-[50%] pointer-events-none" />
          
          {/* Top Opening */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-10 bg-gray-800 rounded-t-full border-4 border-gray-700" />
        </div>

        {/* Base */}
        <div className="w-72 h-8 mx-auto mt-4 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg shadow-xl" />
        
        {/* Status */}
        <div className="text-center mt-6">
          {isSpinning ? (
            <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping" />
              Lottery Active - Drawing at Election End
            </div>
          ) : (
            <div className="text-gray-500 text-sm">Lottery Ready</div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes lottery-spin-0 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(50px, -50px) rotate(90deg); }
          50% { transform: translate(0, -100px) rotate(180deg); }
          75% { transform: translate(-50px, -50px) rotate(270deg); }
        }
        @keyframes lottery-spin-1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-50px, 50px) rotate(-90deg); }
          50% { transform: translate(0, 100px) rotate(-180deg); }
          75% { transform: translate(50px, 50px) rotate(-270deg); }
        }
        @keyframes lottery-spin-2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(80px, 0) rotate(180deg); }
        }
        @keyframes bounce-in {
          0% { transform: scale(0) translateY(-200px); opacity: 0; }
          50% { transform: scale(1.2) translateY(0); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}