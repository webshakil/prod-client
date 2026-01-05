// src/components/Dashboard/Tabs/lotteryyy/LotterySlotMachine.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Clock, Users, Sparkles } from 'lucide-react';

export default function LotterySlotMachine({ 
    /*eslint-disable*/
  electionId,
  electionEndDate,
  luckyVotersCount = 1,
  totalVoters = 0,
  isElectionEnded = false,
  winners = [],
  isActive = true,
}) {
  const [displayDigits, setDisplayDigits] = useState(['0', '7', '8', '3', '1', '4']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [revealedWinners, setRevealedWinners] = useState([]);
  const spinRef = useRef(null);

  // Countdown timer
  useEffect(() => {
    if (!electionEndDate) return;
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(electionEndDate).getTime();
      const diff = Math.max(0, end - now);
      
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [electionEndDate]);

  // Start spinning when active and has voters
  useEffect(() => {
    if (isActive && totalVoters >= 2 && !isElectionEnded) {
      startSpinning();
    } else if (isElectionEnded) {
      stopSpinning();
    }
    
    return () => {
      if (spinRef.current) clearInterval(spinRef.current);
    };
  }, [isActive, totalVoters, isElectionEnded]);

  // Reveal winners when election ends
  useEffect(() => {
    if (isElectionEnded && winners.length > 0 && revealedWinners.length === 0) {
      revealWinnersSequentially();
    }
  }, [isElectionEnded, winners]);

  const startSpinning = () => {
    if (spinRef.current) return;
    setIsSpinning(true);
    
    spinRef.current = setInterval(() => {
      setDisplayDigits([
        String(Math.floor(Math.random() * 10)),
        String(Math.floor(Math.random() * 10)),
        String(Math.floor(Math.random() * 10)),
        String(Math.floor(Math.random() * 10)),
        String(Math.floor(Math.random() * 10)),
        String(Math.floor(Math.random() * 10)),
      ]);
    }, 100);
  };

  const stopSpinning = () => {
    if (spinRef.current) {
      clearInterval(spinRef.current);
      spinRef.current = null;
    }
    setIsSpinning(false);
  };

  const revealWinnersSequentially = async () => {
    stopSpinning();
    
    for (let i = 0; i < winners.length; i++) {
      // Slow down spinning
      for (let j = 0; j < 15; j++) {
        await new Promise(resolve => setTimeout(resolve, 100 + j * 30));
        setDisplayDigits([
          String(Math.floor(Math.random() * 10)),
          String(Math.floor(Math.random() * 10)),
          String(Math.floor(Math.random() * 10)),
          String(Math.floor(Math.random() * 10)),
          String(Math.floor(Math.random() * 10)),
          String(Math.floor(Math.random() * 10)),
        ]);
      }
      
      // Show winner ID
      const winnerId = String(winners[i].oddjobVoterId || winners[i].id || '000000');
      setDisplayDigits(winnerId.padStart(6, '0').slice(-6).split(''));
      setRevealedWinners(prev => [...prev, winners[i]]);
      
      // Wait before next winner
      if (i < winners.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  };

  const pad = (n) => String(n).padStart(2, '0');

  const formatCountdown = () => {
    const { days, hours, minutes, seconds } = countdown;
    if (days > 0) {
      return `${days}d ${pad(hours)}:${pad(minutes)}`;
    }
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden border-4 border-yellow-500 shadow-2xl">
      {/* Header with countdown and winners count */}
      <div className="bg-black/50 px-6 py-4 flex justify-between items-center border-b-2 border-yellow-500/50">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-red-500" />
          <span className="text-gray-400 text-sm">Date & Time:</span>
          <div className="bg-black px-4 py-2 rounded border border-red-900">
            <span 
              className="font-mono text-red-500 text-xl font-bold tracking-wider"
              style={{ fontFamily: 'monospace' }}
            >
              {formatCountdown()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">Lucky Voters No:</span>
          <div className="bg-black px-4 py-2 rounded border border-red-900">
            <span 
              className="font-mono text-red-500 text-xl font-bold"
              style={{ fontFamily: 'monospace' }}
            >
              {String(luckyVotersCount).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Slot Machine Display */}
      <div className="p-8 relative">
        {/* Glow effect */}
        {isSpinning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-80 h-32 bg-yellow-500/20 blur-3xl rounded-full animate-pulse" />
          </div>
        )}

        {/* Digit Display */}
        <div className="flex justify-center gap-2 relative z-10 mb-6">
          {displayDigits.map((digit, index) => (
            <div 
              key={index}
              className="relative"
            >
              <div 
                className={`
                  w-14 h-20 md:w-16 md:h-24 bg-gradient-to-b from-white via-gray-100 to-gray-200 
                  rounded-lg shadow-lg flex items-center justify-center
                  border-4 border-gray-400 relative overflow-hidden
                  ${isSpinning ? 'animate-pulse' : ''}
                `}
              >
                {/* Top shine effect */}
                <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/80 to-transparent" />
                
                {/* Middle divider line */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 transform -translate-y-1/2" />
                
                {/* Digit */}
                <span 
                  className={`
                    font-mono text-4xl md:text-5xl font-black text-gray-900 relative z-10
                    ${isSpinning ? 'animate-bounce' : ''}
                  `}
                  style={{ 
                    fontFamily: 'Impact, Arial Black, sans-serif',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  {digit}
                </span>

                {/* Bottom shadow */}
                <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-gray-300/50 to-transparent" />
              </div>

              {/* 3D side effects */}
              <div className="absolute -left-1 top-2 bottom-2 w-1 bg-gray-600 rounded-l" />
              <div className="absolute -right-1 top-2 bottom-2 w-1 bg-gray-600 rounded-r" />
            </div>
          ))}
        </div>

        {/* Status Message */}
        <div className="text-center">
          {!isElectionEnded && totalVoters < 2 && (
            <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500 rounded-full px-4 py-2">
              <Clock className="w-5 h-5 text-yellow-400 animate-pulse" />
              <span className="text-yellow-400 font-medium">
                Waiting for voters... ({totalVoters}/2 minimum)
              </span>
            </div>
          )}

          {!isElectionEnded && totalVoters >= 2 && isSpinning && (
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500 rounded-full px-4 py-2">
              <Sparkles className="w-5 h-5 text-green-400 animate-spin" />
              <span className="text-green-400 font-medium">
                🎰 Machine is SPINNING! Drawing at election end...
              </span>
            </div>
          )}

          {isElectionEnded && revealedWinners.length === 0 && (
            <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500 rounded-full px-4 py-2">
              <span className="text-purple-400 font-medium">
                🎊 Election ended! Drawing winners...
              </span>
            </div>
          )}

          {isElectionEnded && revealedWinners.length > 0 && revealedWinners.length === winners.length && (
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500 rounded-full px-4 py-2">
              <Trophy className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">
                ✅ All {winners.length} winner(s) revealed!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Winners Section */}
      {revealedWinners.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 px-6 py-5 border-t-4 border-yellow-400">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-7 h-7 text-yellow-900" />
            <h3 className="text-yellow-900 font-black text-xl">🎉 LUCKY WINNERS!</h3>
          </div>
          
          <div className="space-y-2">
            {revealedWinners.map((winner, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl px-5 py-4 flex items-center justify-between shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 font-black w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-md">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">
                      {winner.displayName || winner.username || `Lucky Voter`}
                    </p>
                    <p className="text-gray-500 text-sm font-mono">
                      Voter ID: {winner.oddjobVoterId || winner.id}
                    </p>
                  </div>
                </div>
                <div className="text-4xl">🏆</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Stats */}
      <div className="bg-black/60 px-6 py-3 border-t border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-2 text-gray-400">
          <Users className="w-4 h-4" />
          <span className="text-sm">Total Entries: <strong className="text-white">{totalVoters}</strong></span>
        </div>
        <div className={`flex items-center gap-2 text-sm ${
          isSpinning ? 'text-green-400' : isElectionEnded ? 'text-blue-400' : 'text-yellow-400'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            isSpinning ? 'bg-green-400 animate-pulse' : isElectionEnded ? 'bg-blue-400' : 'bg-yellow-400'
          }`} />
          {isSpinning ? 'LIVE SPINNING' : isElectionEnded ? 'DRAW COMPLETE' : 'WAITING'}
        </div>
      </div>
    </div>
  );
}
// // src/components/Dashboard/Tabs/lotteryyy/LotterySlotMachine.jsx
// import React, { useState, useEffect, useRef } from 'react';
// import { Trophy, Clock, Users, Sparkles } from 'lucide-react';

// export default function LotterySlotMachine({ 
//     /*eslint-disable*/
//   electionId,
//   electionEndDate,
//   luckyVotersCount = 1,
//   totalVoters = 0,
//   isElectionEnded = false,
//   winners = [],
//   isActive = false,
// }) {
//   const [displayDigits, setDisplayDigits] = useState(['0', '7', '8', '3', '1']);
//   const [isSpinning, setIsSpinning] = useState(false);
//   const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
//   const spinRef = useRef(null);

//   // Countdown timer
//   useEffect(() => {
//     if (!electionEndDate) return;
    
//     const timer = setInterval(() => {
//       const now = new Date().getTime();
//       const end = new Date(electionEndDate).getTime();
//       const diff = Math.max(0, end - now);
      
//       setCountdown({
//         hours: Math.floor(diff / (1000 * 60 * 60)),
//         minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
//         seconds: Math.floor((diff % (1000 * 60)) / 1000),
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [electionEndDate]);

//   // Start spinning when active and has voters
//   useEffect(() => {
//     if (isActive && totalVoters >= 2 && !isElectionEnded) {
//       startSpinning();
//     }
//     return () => {
//       if (spinRef.current) clearInterval(spinRef.current);
//     };
//   }, [isActive, totalVoters, isElectionEnded]);

//   const startSpinning = () => {
//     if (spinRef.current) return;
//     setIsSpinning(true);
    
//     spinRef.current = setInterval(() => {
//       setDisplayDigits([
//         String(Math.floor(Math.random() * 10)),
//         String(Math.floor(Math.random() * 10)),
//         String(Math.floor(Math.random() * 10)),
//         String(Math.floor(Math.random() * 10)),
//         String(Math.floor(Math.random() * 10)),
//       ]);
//     }, 100);
//   };

//   const pad = (n) => String(n).padStart(2, '0');

//   return (
//     <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl overflow-hidden border-4 border-yellow-500 shadow-2xl">
//       {/* Header */}
//       <div className="bg-black/50 px-4 py-3 flex justify-between items-center border-b-2 border-yellow-500/50">
//         <div className="flex items-center gap-2">
//           <Clock className="w-4 h-4 text-red-500" />
//           <span className="text-gray-400 text-xs">Time Left:</span>
//           <span className="font-mono text-red-500 text-lg font-bold">
//             {pad(countdown.hours)}:{pad(countdown.minutes)}:{pad(countdown.seconds)}
//           </span>
//         </div>
//         <div className="flex items-center gap-2">
//           <span className="text-gray-400 text-xs">Winners:</span>
//           <span className="font-mono text-red-500 text-lg font-bold">{luckyVotersCount}</span>
//         </div>
//       </div>

//       {/* Slot Machine Display */}
//       <div className="p-6">
//         <div className="flex justify-center gap-2 mb-4">
//           {displayDigits.map((digit, i) => (
//             <div
//               key={i}
//               className={`
//                 w-14 h-20 bg-white rounded-lg flex items-center justify-center
//                 border-4 border-gray-300 shadow-inner
//                 ${isSpinning ? 'animate-pulse' : ''}
//               `}
//             >
//               <span 
//                 className="text-5xl font-black text-gray-900"
//                 style={{ fontFamily: 'Impact, sans-serif' }}
//               >
//                 {digit}
//               </span>
//             </div>
//           ))}
//         </div>

//         {/* Status */}
//         <div className="text-center">
//           {totalVoters < 2 ? (
//             <p className="text-yellow-400 text-sm">
//               ⏳ Waiting for voters... ({totalVoters}/2 minimum)
//             </p>
//           ) : isSpinning ? (
//             <p className="text-green-400 text-sm flex items-center justify-center gap-2">
//               <Sparkles className="w-4 h-4 animate-spin" />
//               🎰 Machine is SPINNING!
//             </p>
//           ) : (
//             <p className="text-gray-400 text-sm">Ready to draw</p>
//           )}
//         </div>
//       </div>

//       {/* Winners */}
//       {winners.length > 0 && (
//         <div className="bg-yellow-500 p-4">
//           <div className="flex items-center gap-2 mb-2">
//             <Trophy className="w-5 h-5 text-yellow-900" />
//             <span className="font-bold text-yellow-900">WINNERS!</span>
//           </div>
//           {winners.map((w, i) => (
//             <div key={i} className="bg-white rounded p-2 mb-1 flex items-center justify-between">
//               <span className="font-bold">#{i + 1} - {w.displayName || `Voter ${w.id}`}</span>
//               <span>🏆</span>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Footer */}
//       <div className="bg-black/60 px-4 py-2 flex justify-between items-center text-xs">
//         <div className="flex items-center gap-1 text-gray-400">
//           <Users className="w-3 h-3" />
//           <span>Entries: {totalVoters}</span>
//         </div>
//         <span className={isSpinning ? 'text-green-400' : 'text-gray-400'}>
//           {isSpinning ? '🔴 LIVE' : '⏸ WAITING'}
//         </span>
//       </div>
//     </div>
//   );
// }