// src/components/Dashboard/Tabs/lotteryyy/LotterySlotMachine.jsx
// 4D Slot Machine - Fetches REAL participant data from lottery API
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, Users, RefreshCw } from 'lucide-react';

// API base URL for lottery service
const LOTTERY_API_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api';

export default function LotterySlotMachine({ 
  electionId,
  electionEndDate,
  luckyVotersCount = 1,      // Number of winners to be drawn
  isElectionEnded = false,
  winners = [],              // Winners array from backend (when election ends)
  isActive = true,
}) {
  // State
  const [displayDigits, setDisplayDigits] = useState(['0', '0', '0', '0', '0', '0']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [revealedWinners, setRevealedWinners] = useState([]);
  const [currentRevealIndex, setCurrentRevealIndex] = useState(-1);
  const [revealingWinner, setRevealingWinner] = useState(false);
  
  // ✅ State for fetched participant data
  const [participants, setParticipants] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [actualLuckyVotersCount, setActualLuckyVotersCount] = useState(luckyVotersCount);
  
  // Refs
  const spinIntervalRef = useRef(null);
  const fetchIntervalRef = useRef(null);

  // ✅ Fetch ball numbers from PUBLIC lottery API endpoint
  const fetchBallNumbers = useCallback(async () => {
    if (!electionId) return;
    
    try {
      setIsLoadingParticipants(true);
      setFetchError(null);
      
      // ✅✅✅ CRITICAL FIX: Use the PUBLIC /ball-numbers endpoint (NO AUTH REQUIRED)
      // This endpoint does NOT require admin/manager role
      const response = await fetch(
        `${LOTTERY_API_URL}/lottery/elections/${electionId}/ball-numbers`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ball numbers: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('🎰 Lottery ball numbers fetched:', data);
      
      // ✅ Extract ball numbers from response
      const ballNumbers = [];
      if (data.ballNumbers && Array.isArray(data.ballNumbers)) {
        data.ballNumbers.forEach(ballNum => {
          if (ballNum) {
            ballNumbers.push(String(ballNum).padStart(6, '0'));
          }
        });
      } else if (data.ball_numbers && Array.isArray(data.ball_numbers)) {
        data.ball_numbers.forEach(ballNum => {
          if (ballNum) {
            ballNumbers.push(String(ballNum).padStart(6, '0'));
          }
        });
      }
      
      setParticipants(ballNumbers);
      setTotalEntries(data.totalParticipants || data.total_participants || ballNumbers.length);
      
      // ✅ Use luckyVotersCount from API if available
      if (data.luckyVotersCount || data.lucky_voters_count) {
        setActualLuckyVotersCount(data.luckyVotersCount || data.lucky_voters_count);
      }
      
    } catch (error) {
      console.error('❌ Error fetching lottery ball numbers:', error);
      setFetchError(error.message);
    } finally {
      setIsLoadingParticipants(false);
    }
  }, [electionId]);

  // ✅ Fetch ball numbers on mount and poll every 10 seconds
  useEffect(() => {
    if (electionId && isActive) {
      // Initial fetch
      fetchBallNumbers();
      
      // Poll every 10 seconds for new participants
      fetchIntervalRef.current = setInterval(fetchBallNumbers, 10000);
      
      return () => {
        if (fetchIntervalRef.current) {
          clearInterval(fetchIntervalRef.current);
        }
      };
    }
  }, [electionId, isActive, fetchBallNumbers]);

  // Generate a random 6-digit number (fallback when no real IDs)
  const generateRandomVoterId = useCallback(() => {
    return String(Math.floor(100000 + Math.random() * 900000));
  }, []);

  // Get a random voter ID from the pool or generate one
  const getRandomDisplayId = useCallback(() => {
    if (participants.length > 0) {
      const randomIndex = Math.floor(Math.random() * participants.length);
      return participants[randomIndex];
    }
    return generateRandomVoterId();
  }, [participants, generateRandomVoterId]);

  // Countdown timer to election end
  useEffect(() => {
    if (!electionEndDate) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(electionEndDate).getTime();
      const diff = Math.max(0, end - now);

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [electionEndDate]);

  // Start spinning - displays random voter IDs
  const startSpinning = useCallback(() => {
    if (spinIntervalRef.current) return;
    
    setIsSpinning(true);
    spinIntervalRef.current = setInterval(() => {
      const voterId = getRandomDisplayId();
      setDisplayDigits(voterId.split(''));
    }, 80); // Fast spinning
  }, [getRandomDisplayId]);

  // Stop spinning
  const stopSpinning = useCallback(() => {
    if (spinIntervalRef.current) {
      clearInterval(spinIntervalRef.current);
      spinIntervalRef.current = null;
    }
    setIsSpinning(false);
  }, []);

  // ✅ Auto-start spinning when 2+ participants exist (per documentation)
  useEffect(() => {
    if (isActive && totalEntries >= 2 && !isElectionEnded && !revealingWinner) {
      startSpinning();
    } else if (isElectionEnded || revealingWinner) {
      stopSpinning();
    } else if (totalEntries < 2) {
      stopSpinning();
    }

    return () => stopSpinning();
  }, [isActive, totalEntries, isElectionEnded, revealingWinner, startSpinning, stopSpinning]);

  // Reveal winners sequentially when election ends
  useEffect(() => {
    if (isElectionEnded && winners.length > 0 && revealedWinners.length === 0 && !revealingWinner) {
      revealWinnersSequentially();
    }
  }, [isElectionEnded, winners, revealedWinners.length, revealingWinner]);

  // Sequential winner reveal - one after another
  const revealWinnersSequentially = async () => {
    setRevealingWinner(true);
    stopSpinning();
    
    for (let i = 0; i < winners.length; i++) {
      setCurrentRevealIndex(i);
      
      // Slow down spinning effect before revealing each winner
      for (let j = 0; j < 20; j++) {
        await new Promise(resolve => setTimeout(resolve, 80 + j * 20));
        const voterId = getRandomDisplayId();
        setDisplayDigits(voterId.split(''));
      }
      
      // Final slowdown
      for (let k = 0; k < 10; k++) {
        await new Promise(resolve => setTimeout(resolve, 150 + k * 50));
        const voterId = getRandomDisplayId();
        setDisplayDigits(voterId.split(''));
      }
      
      // Reveal the actual winner's voter ID (ball number)
      const winnerBallNumber = String(
        winners[i].ball_number ||
        winners[i].ballNumber ||
        winners[i].oddjob_voter_id || 
        winners[i].oddjobVoterId || 
        winners[i].voterId ||
        winners[i].voter_id ||
        winners[i].id || 
        '000000'
      ).padStart(6, '0');
      
      setDisplayDigits(winnerBallNumber.split(''));
      
      // Add to revealed winners list
      setRevealedWinners(prev => [...prev, {
        ...winners[i],
        ballNumber: winnerBallNumber,
        rank: i + 1
      }]);
      
      // Wait before revealing next winner (if there are more)
      if (i < winners.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    setCurrentRevealIndex(-1);
    setRevealingWinner(false);
  };

  // Format countdown display - ALWAYS show seconds for real-time feel
  const formatCountdown = () => {
    const { days, hours, minutes, seconds } = countdown;
    const pad = (n) => String(n).padStart(2, '0');
    
    if (days > 0) {
      // Show: 23d 17:56:42 (days + hours:minutes:seconds)
      return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    // Show: 17:56:42 (hours:minutes:seconds)
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  // Get ordinal suffix (1st, 2nd, 3rd, etc.)
  const getOrdinal = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-black rounded-xl overflow-hidden border-4 border-yellow-500 shadow-2xl">
      {/* Header - Date/Time and Lucky Voters Count */}
      <div className="bg-black px-4 py-3 flex justify-between items-center border-b-2 border-yellow-600">
        {/* Date & Time Countdown */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400 text-sm">Date & Time:</span>
          <div className="bg-red-900 px-3 py-1 rounded border border-red-700">
            <span 
              className="font-mono text-red-400 text-lg font-bold tracking-wider"
              style={{ 
                fontFamily: 'Courier New, monospace',
                textShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
              }}
            >
              {formatCountdown()}
            </span>
          </div>
        </div>

        {/* Lucky Voters Number (Winners Count) */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Lucky Voters No:</span>
          <div className="bg-red-900 px-3 py-1 rounded border border-red-700">
            <span 
              className="font-mono text-red-400 text-lg font-bold"
              style={{ 
                fontFamily: 'Courier New, monospace',
                textShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
              }}
            >
              {String(actualLuckyVotersCount).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Slot Machine Display - Large Numbers */}
      <div className="p-6 bg-gradient-to-b from-gray-800 to-gray-900">
        {/* Digit Display */}
        <div className="flex justify-center gap-1 mb-4">
          {displayDigits.map((digit, index) => (
            <div 
              key={index}
              className="relative"
            >
              {/* Single Digit Container */}
              <div 
                className={`
                  w-12 h-20 sm:w-16 sm:h-24 md:w-20 md:h-28
                  bg-gradient-to-b from-gray-100 via-white to-gray-200
                  rounded-lg flex items-center justify-center
                  border-2 border-gray-400 shadow-lg
                  relative overflow-hidden
                `}
              >
                {/* Top reflection */}
                <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/60 to-transparent" />
                
                {/* Middle line */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 transform -translate-y-1/2 z-10" />
                
                {/* The Digit */}
                <span 
                  className={`
                    text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 relative z-20
                    ${isSpinning ? 'animate-pulse' : ''}
                  `}
                  style={{ 
                    fontFamily: 'Impact, Arial Black, sans-serif',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                  }}
                >
                  {digit}
                </span>

                {/* Bottom shadow */}
                <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-gray-300/40 to-transparent" />
              </div>
            </div>
          ))}
        </div>

        {/* Status Message */}
        <div className="text-center">
          {!isElectionEnded && totalEntries < 2 && (
            <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500 rounded-full px-4 py-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">
                Waiting for voters... ({totalEntries}/2 minimum)
              </span>
            </div>
          )}

          {!isElectionEnded && totalEntries >= 2 && isSpinning && (
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 text-sm font-medium">
                Machine is spinning... Drawing at election end
              </span>
            </div>
          )}

          {isElectionEnded && revealingWinner && currentRevealIndex >= 0 && (
            <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500 rounded-full px-4 py-2">
              <span className="text-purple-400 text-sm font-medium animate-pulse">
                🎊 Revealing {getOrdinal(currentRevealIndex + 1)} Lucky Voter Winner...
              </span>
            </div>
          )}

          {isElectionEnded && !revealingWinner && revealedWinners.length > 0 && (
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500 rounded-full px-4 py-2">
              <span className="text-green-400 text-sm font-medium">
                ✅ All {revealedWinners.length} Lucky Voter(s) Revealed!
              </span>
            </div>
          )}

          {/* Loading/Error state */}
          {isLoadingParticipants && totalEntries === 0 && (
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500 rounded-full px-4 py-2 mt-2">
              <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
              <span className="text-blue-400 text-sm font-medium">
                Loading participants...
              </span>
            </div>
          )}

          {fetchError && (
            <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500 rounded-full px-4 py-2 mt-2">
              <span className="text-red-400 text-sm font-medium">
                ⚠️ {fetchError}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Winners Display Section - Shows after winners are revealed */}
      {revealedWinners.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 px-4 py-4 border-t-2 border-yellow-400">
          <h3 className="text-yellow-900 font-bold text-lg mb-3 text-center">
            🏆 LUCKY VOTERS WINNERS 🏆
          </h3>
          
          <div className="space-y-2">
            {revealedWinners.map((winner, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg px-4 py-3 flex items-center justify-between shadow-md"
              >
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 font-black w-10 h-10 rounded-full flex items-center justify-center text-sm shadow">
                    {getOrdinal(index + 1)}
                  </div>
                  
                  {/* Winner Info */}
                  <div>
                    <p className="font-bold text-gray-900">
                      {winner.displayName || winner.username || winner.name || `Lucky Voter`}
                    </p>
                    <p className="text-gray-500 text-sm font-mono">
                      Ball #: {winner.ballNumber}
                    </p>
                  </div>
                </div>
                
                {/* Trophy */}
                <span className="text-3xl">🏆</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer - Total Entries and Status */}
      <div className="bg-black/80 px-4 py-2 border-t border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-2 text-gray-400">
          <Users className="w-4 h-4" />
          <span className="text-sm">
            Total Entries: <strong className="text-white">{totalEntries}</strong>
          </span>
        </div>
        
        <div className={`flex items-center gap-2 text-sm ${
          isSpinning ? 'text-green-400' : 
          isElectionEnded ? 'text-blue-400' : 
          'text-yellow-400'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            isSpinning ? 'bg-green-400 animate-pulse' : 
            isElectionEnded ? 'bg-blue-400' : 
            'bg-yellow-400'
          }`} />
          <span>
            {isSpinning ? 'SPINNING' : 
             isElectionEnded ? 'COMPLETED' : 
             'WAITING'}
          </span>
        </div>
      </div>
    </div>
  );
}
//last working code only to add election real countdown above code
// // src/components/Dashboard/Tabs/lotteryyy/LotterySlotMachine.jsx
// // 4D Slot Machine - Fetches REAL participant data from lottery API
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { Clock, Users, RefreshCw } from 'lucide-react';

// // API base URL for lottery service
// const LOTTERY_API_URL = import.meta.env.VITE_LOTTERY_SERVICE_URL || 'http://localhost:3007/api';

// export default function LotterySlotMachine({ 
//   electionId,
//   electionEndDate,
//   luckyVotersCount = 1,      // Number of winners to be drawn
//   isElectionEnded = false,
//   winners = [],              // Winners array from backend (when election ends)
//   isActive = true,
// }) {
//   // State
//   const [displayDigits, setDisplayDigits] = useState(['0', '0', '0', '0', '0', '0']);
//   const [isSpinning, setIsSpinning] = useState(false);
//   const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
//   const [revealedWinners, setRevealedWinners] = useState([]);
//   const [currentRevealIndex, setCurrentRevealIndex] = useState(-1);
//   const [revealingWinner, setRevealingWinner] = useState(false);
  
//   // ✅ State for fetched participant data
//   const [participants, setParticipants] = useState([]);
//   const [totalEntries, setTotalEntries] = useState(0);
//   const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
//   const [fetchError, setFetchError] = useState(null);
//   const [actualLuckyVotersCount, setActualLuckyVotersCount] = useState(luckyVotersCount);
  
//   // Refs
//   const spinIntervalRef = useRef(null);
//   const fetchIntervalRef = useRef(null);

//   // ✅ Fetch ball numbers from PUBLIC lottery API endpoint
//   const fetchBallNumbers = useCallback(async () => {
//     if (!electionId) return;
    
//     try {
//       setIsLoadingParticipants(true);
//       setFetchError(null);
      
//       // ✅✅✅ CRITICAL FIX: Use the PUBLIC /ball-numbers endpoint (NO AUTH REQUIRED)
//       // This endpoint does NOT require admin/manager role
//       const response = await fetch(
//         `${LOTTERY_API_URL}/lottery/elections/${electionId}/ball-numbers`
//       );
      
//       if (!response.ok) {
//         throw new Error(`Failed to fetch ball numbers: ${response.status}`);
//       }
      
//       const data = await response.json();
      
//       console.log('🎰 Lottery ball numbers fetched:', data);
      
//       // ✅ Extract ball numbers from response
//       const ballNumbers = [];
//       if (data.ballNumbers && Array.isArray(data.ballNumbers)) {
//         data.ballNumbers.forEach(ballNum => {
//           if (ballNum) {
//             ballNumbers.push(String(ballNum).padStart(6, '0'));
//           }
//         });
//       } else if (data.ball_numbers && Array.isArray(data.ball_numbers)) {
//         data.ball_numbers.forEach(ballNum => {
//           if (ballNum) {
//             ballNumbers.push(String(ballNum).padStart(6, '0'));
//           }
//         });
//       }
      
//       setParticipants(ballNumbers);
//       setTotalEntries(data.totalParticipants || data.total_participants || ballNumbers.length);
      
//       // ✅ Use luckyVotersCount from API if available
//       if (data.luckyVotersCount || data.lucky_voters_count) {
//         setActualLuckyVotersCount(data.luckyVotersCount || data.lucky_voters_count);
//       }
      
//     } catch (error) {
//       console.error('❌ Error fetching lottery ball numbers:', error);
//       setFetchError(error.message);
//     } finally {
//       setIsLoadingParticipants(false);
//     }
//   }, [electionId]);

//   // ✅ Fetch ball numbers on mount and poll every 10 seconds
//   useEffect(() => {
//     if (electionId && isActive) {
//       // Initial fetch
//       fetchBallNumbers();
      
//       // Poll every 10 seconds for new participants
//       fetchIntervalRef.current = setInterval(fetchBallNumbers, 10000);
      
//       return () => {
//         if (fetchIntervalRef.current) {
//           clearInterval(fetchIntervalRef.current);
//         }
//       };
//     }
//   }, [electionId, isActive, fetchBallNumbers]);

//   // Generate a random 6-digit number (fallback when no real IDs)
//   const generateRandomVoterId = useCallback(() => {
//     return String(Math.floor(100000 + Math.random() * 900000));
//   }, []);

//   // Get a random voter ID from the pool or generate one
//   const getRandomDisplayId = useCallback(() => {
//     if (participants.length > 0) {
//       const randomIndex = Math.floor(Math.random() * participants.length);
//       return participants[randomIndex];
//     }
//     return generateRandomVoterId();
//   }, [participants, generateRandomVoterId]);

//   // Countdown timer to election end
//   useEffect(() => {
//     if (!electionEndDate) return;

//     const updateCountdown = () => {
//       const now = new Date().getTime();
//       const end = new Date(electionEndDate).getTime();
//       const diff = Math.max(0, end - now);

//       if (diff <= 0) {
//         setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
//         return;
//       }

//       setCountdown({
//         days: Math.floor(diff / (1000 * 60 * 60 * 24)),
//         hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
//         minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
//         seconds: Math.floor((diff % (1000 * 60)) / 1000),
//       });
//     };

//     updateCountdown();
//     const interval = setInterval(updateCountdown, 1000);
//     return () => clearInterval(interval);
//   }, [electionEndDate]);

//   // Start spinning - displays random voter IDs
//   const startSpinning = useCallback(() => {
//     if (spinIntervalRef.current) return;
    
//     setIsSpinning(true);
//     spinIntervalRef.current = setInterval(() => {
//       const voterId = getRandomDisplayId();
//       setDisplayDigits(voterId.split(''));
//     }, 80); // Fast spinning
//   }, [getRandomDisplayId]);

//   // Stop spinning
//   const stopSpinning = useCallback(() => {
//     if (spinIntervalRef.current) {
//       clearInterval(spinIntervalRef.current);
//       spinIntervalRef.current = null;
//     }
//     setIsSpinning(false);
//   }, []);

//   // ✅ Auto-start spinning when 2+ participants exist (per documentation)
//   useEffect(() => {
//     if (isActive && totalEntries >= 2 && !isElectionEnded && !revealingWinner) {
//       startSpinning();
//     } else if (isElectionEnded || revealingWinner) {
//       stopSpinning();
//     } else if (totalEntries < 2) {
//       stopSpinning();
//     }

//     return () => stopSpinning();
//   }, [isActive, totalEntries, isElectionEnded, revealingWinner, startSpinning, stopSpinning]);

//   // Reveal winners sequentially when election ends
//   useEffect(() => {
//     if (isElectionEnded && winners.length > 0 && revealedWinners.length === 0 && !revealingWinner) {
//       revealWinnersSequentially();
//     }
//   }, [isElectionEnded, winners, revealedWinners.length, revealingWinner]);

//   // Sequential winner reveal - one after another
//   const revealWinnersSequentially = async () => {
//     setRevealingWinner(true);
//     stopSpinning();
    
//     for (let i = 0; i < winners.length; i++) {
//       setCurrentRevealIndex(i);
      
//       // Slow down spinning effect before revealing each winner
//       for (let j = 0; j < 20; j++) {
//         await new Promise(resolve => setTimeout(resolve, 80 + j * 20));
//         const voterId = getRandomDisplayId();
//         setDisplayDigits(voterId.split(''));
//       }
      
//       // Final slowdown
//       for (let k = 0; k < 10; k++) {
//         await new Promise(resolve => setTimeout(resolve, 150 + k * 50));
//         const voterId = getRandomDisplayId();
//         setDisplayDigits(voterId.split(''));
//       }
      
//       // Reveal the actual winner's voter ID (ball number)
//       const winnerBallNumber = String(
//         winners[i].ball_number ||
//         winners[i].ballNumber ||
//         winners[i].oddjob_voter_id || 
//         winners[i].oddjobVoterId || 
//         winners[i].voterId ||
//         winners[i].voter_id ||
//         winners[i].id || 
//         '000000'
//       ).padStart(6, '0');
      
//       setDisplayDigits(winnerBallNumber.split(''));
      
//       // Add to revealed winners list
//       setRevealedWinners(prev => [...prev, {
//         ...winners[i],
//         ballNumber: winnerBallNumber,
//         rank: i + 1
//       }]);
      
//       // Wait before revealing next winner (if there are more)
//       if (i < winners.length - 1) {
//         await new Promise(resolve => setTimeout(resolve, 3000));
//       }
//     }
    
//     setCurrentRevealIndex(-1);
//     setRevealingWinner(false);
//   };

//   // Format countdown display - matching documentation format (DD:HH:MM or HH:MM:SS)
//   const formatCountdown = () => {
//     const { days, hours, minutes, seconds } = countdown;
//     const pad = (n) => String(n).padStart(2, '0');
    
//     if (days > 0) {
//       return `${days}d ${pad(hours)}:${pad(minutes)}`;
//     }
//     return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
//   };

//   // Get ordinal suffix (1st, 2nd, 3rd, etc.)
//   const getOrdinal = (n) => {
//     const s = ['th', 'st', 'nd', 'rd'];
//     const v = n % 100;
//     return n + (s[(v - 20) % 10] || s[v] || s[0]);
//   };

//   return (
//     <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-black rounded-xl overflow-hidden border-4 border-yellow-500 shadow-2xl">
//       {/* Header - Date/Time and Lucky Voters Count */}
//       <div className="bg-black px-4 py-3 flex justify-between items-center border-b-2 border-yellow-600">
//         {/* Date & Time Countdown */}
//         <div className="flex items-center gap-2">
//           <Clock className="w-4 h-4 text-gray-400" />
//           <span className="text-gray-400 text-sm">Date & Time:</span>
//           <div className="bg-red-900 px-3 py-1 rounded border border-red-700">
//             <span 
//               className="font-mono text-red-400 text-lg font-bold tracking-wider"
//               style={{ 
//                 fontFamily: 'Courier New, monospace',
//                 textShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
//               }}
//             >
//               {formatCountdown()}
//             </span>
//           </div>
//         </div>

//         {/* Lucky Voters Number (Winners Count) */}
//         <div className="flex items-center gap-2">
//           <span className="text-gray-400 text-sm">Lucky Voters No:</span>
//           <div className="bg-red-900 px-3 py-1 rounded border border-red-700">
//             <span 
//               className="font-mono text-red-400 text-lg font-bold"
//               style={{ 
//                 fontFamily: 'Courier New, monospace',
//                 textShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
//               }}
//             >
//               {String(actualLuckyVotersCount).padStart(2, '0')}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Main Slot Machine Display - Large Numbers */}
//       <div className="p-6 bg-gradient-to-b from-gray-800 to-gray-900">
//         {/* Digit Display */}
//         <div className="flex justify-center gap-1 mb-4">
//           {displayDigits.map((digit, index) => (
//             <div 
//               key={index}
//               className="relative"
//             >
//               {/* Single Digit Container */}
//               <div 
//                 className={`
//                   w-12 h-20 sm:w-16 sm:h-24 md:w-20 md:h-28
//                   bg-gradient-to-b from-gray-100 via-white to-gray-200
//                   rounded-lg flex items-center justify-center
//                   border-2 border-gray-400 shadow-lg
//                   relative overflow-hidden
//                 `}
//               >
//                 {/* Top reflection */}
//                 <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/60 to-transparent" />
                
//                 {/* Middle line */}
//                 <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 transform -translate-y-1/2 z-10" />
                
//                 {/* The Digit */}
//                 <span 
//                   className={`
//                     text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 relative z-20
//                     ${isSpinning ? 'animate-pulse' : ''}
//                   `}
//                   style={{ 
//                     fontFamily: 'Impact, Arial Black, sans-serif',
//                     textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
//                   }}
//                 >
//                   {digit}
//                 </span>

//                 {/* Bottom shadow */}
//                 <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-gray-300/40 to-transparent" />
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Status Message */}
//         <div className="text-center">
//           {!isElectionEnded && totalEntries < 2 && (
//             <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500 rounded-full px-4 py-2">
//               <Clock className="w-4 h-4 text-yellow-400" />
//               <span className="text-yellow-400 text-sm font-medium">
//                 Waiting for voters... ({totalEntries}/2 minimum)
//               </span>
//             </div>
//           )}

//           {!isElectionEnded && totalEntries >= 2 && isSpinning && (
//             <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500 rounded-full px-4 py-2">
//               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
//               <span className="text-green-400 text-sm font-medium">
//                 Machine is spinning... Drawing at election end
//               </span>
//             </div>
//           )}

//           {isElectionEnded && revealingWinner && currentRevealIndex >= 0 && (
//             <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500 rounded-full px-4 py-2">
//               <span className="text-purple-400 text-sm font-medium animate-pulse">
//                 🎊 Revealing {getOrdinal(currentRevealIndex + 1)} Lucky Voter Winner...
//               </span>
//             </div>
//           )}

//           {isElectionEnded && !revealingWinner && revealedWinners.length > 0 && (
//             <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500 rounded-full px-4 py-2">
//               <span className="text-green-400 text-sm font-medium">
//                 ✅ All {revealedWinners.length} Lucky Voter(s) Revealed!
//               </span>
//             </div>
//           )}

//           {/* Loading/Error state */}
//           {isLoadingParticipants && totalEntries === 0 && (
//             <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500 rounded-full px-4 py-2 mt-2">
//               <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
//               <span className="text-blue-400 text-sm font-medium">
//                 Loading participants...
//               </span>
//             </div>
//           )}

//           {fetchError && (
//             <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500 rounded-full px-4 py-2 mt-2">
//               <span className="text-red-400 text-sm font-medium">
//                 ⚠️ {fetchError}
//               </span>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Winners Display Section - Shows after winners are revealed */}
//       {revealedWinners.length > 0 && (
//         <div className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 px-4 py-4 border-t-2 border-yellow-400">
//           <h3 className="text-yellow-900 font-bold text-lg mb-3 text-center">
//             🏆 LUCKY VOTERS WINNERS 🏆
//           </h3>
          
//           <div className="space-y-2">
//             {revealedWinners.map((winner, index) => (
//               <div 
//                 key={index}
//                 className="bg-white rounded-lg px-4 py-3 flex items-center justify-between shadow-md"
//               >
//                 <div className="flex items-center gap-3">
//                   {/* Rank Badge */}
//                   <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 font-black w-10 h-10 rounded-full flex items-center justify-center text-sm shadow">
//                     {getOrdinal(index + 1)}
//                   </div>
                  
//                   {/* Winner Info */}
//                   <div>
//                     <p className="font-bold text-gray-900">
//                       {winner.displayName || winner.username || winner.name || `Lucky Voter`}
//                     </p>
//                     <p className="text-gray-500 text-sm font-mono">
//                       Ball #: {winner.ballNumber}
//                     </p>
//                   </div>
//                 </div>
                
//                 {/* Trophy */}
//                 <span className="text-3xl">🏆</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Footer - Total Entries and Status */}
//       <div className="bg-black/80 px-4 py-2 border-t border-gray-700 flex justify-between items-center">
//         <div className="flex items-center gap-2 text-gray-400">
//           <Users className="w-4 h-4" />
//           <span className="text-sm">
//             Total Entries: <strong className="text-white">{totalEntries}</strong>
//           </span>
//         </div>
        
//         <div className={`flex items-center gap-2 text-sm ${
//           isSpinning ? 'text-green-400' : 
//           isElectionEnded ? 'text-blue-400' : 
//           'text-yellow-400'
//         }`}>
//           <span className={`w-2 h-2 rounded-full ${
//             isSpinning ? 'bg-green-400 animate-pulse' : 
//             isElectionEnded ? 'bg-blue-400' : 
//             'bg-yellow-400'
//           }`} />
//           <span>
//             {isSpinning ? 'SPINNING' : 
//              isElectionEnded ? 'COMPLETED' : 
//              'WAITING'}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }
// // src/components/Dashboard/Tabs/lotteryyy/LotterySlotMachine.jsx
// // 4D Slot Machine - Fetches REAL participant data from lottery API
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { Clock, Users, RefreshCw } from 'lucide-react';

// // API base URL for lottery service
// const LOTTERY_API_URL = import.meta.env.VITE_LOTTERY_SERVICE_URL || 'http://localhost:3007/api';

// export default function LotterySlotMachine({ 
//   electionId,
//   electionEndDate,
//   luckyVotersCount = 1,      // Number of winners to be drawn
//   isElectionEnded = false,
//   winners = [],              // Winners array from backend (when election ends)
//   isActive = true,
// }) {
//   // State
//   const [displayDigits, setDisplayDigits] = useState(['0', '0', '0', '0', '0', '0']);
//   const [isSpinning, setIsSpinning] = useState(false);
//   const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
//   const [revealedWinners, setRevealedWinners] = useState([]);
//   const [currentRevealIndex, setCurrentRevealIndex] = useState(-1);
//   const [revealingWinner, setRevealingWinner] = useState(false);
  
//   // ✅ State for fetched participant data
//   const [participants, setParticipants] = useState([]);
//   const [totalEntries, setTotalEntries] = useState(0);
//   const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
//   const [fetchError, setFetchError] = useState(null);
  
//   // Refs
//   const spinIntervalRef = useRef(null);
//   const fetchIntervalRef = useRef(null);

//   // ✅ Fetch ball numbers from PUBLIC lottery API endpoint
//   const fetchBallNumbers = useCallback(async () => {
//     if (!electionId) return;
    
//     try {
//       setIsLoadingParticipants(true);
//       setFetchError(null);
      
//       // ✅✅✅ CRITICAL FIX: Use the PUBLIC /ball-numbers endpoint (NO AUTH REQUIRED)
//       // This endpoint does NOT require admin/manager role
//       const response = await fetch(
//         `${LOTTERY_API_URL}/lottery/elections/${electionId}/ball-numbers`
//       );
      
//       if (!response.ok) {
//         throw new Error(`Failed to fetch ball numbers: ${response.status}`);
//       }
      
//       const data = await response.json();
      
//       console.log('🎰 Lottery ball numbers fetched:', data);
      
//       // ✅ Extract ball numbers from response
//       const ballNumbers = [];
//       if (data.ballNumbers && Array.isArray(data.ballNumbers)) {
//         data.ballNumbers.forEach(ballNum => {
//           if (ballNum) {
//             ballNumbers.push(String(ballNum).padStart(6, '0'));
//           }
//         });
//       } else if (data.ball_numbers && Array.isArray(data.ball_numbers)) {
//         data.ball_numbers.forEach(ballNum => {
//           if (ballNum) {
//             ballNumbers.push(String(ballNum).padStart(6, '0'));
//           }
//         });
//       }
      
//       setParticipants(ballNumbers);
//       setTotalEntries(data.totalParticipants || data.total_participants || ballNumbers.length);
      
//     } catch (error) {
//       console.error('❌ Error fetching lottery ball numbers:', error);
//       setFetchError(error.message);
//     } finally {
//       setIsLoadingParticipants(false);
//     }
//   }, [electionId]);

//   // ✅ Fetch ball numbers on mount and poll every 10 seconds
//   useEffect(() => {
//     if (electionId && isActive) {
//       // Initial fetch
//       fetchBallNumbers();
      
//       // Poll every 10 seconds for new participants
//       fetchIntervalRef.current = setInterval(fetchBallNumbers, 10000);
      
//       return () => {
//         if (fetchIntervalRef.current) {
//           clearInterval(fetchIntervalRef.current);
//         }
//       };
//     }
//   }, [electionId, isActive, fetchBallNumbers]);

//   // Generate a random 6-digit number (fallback when no real IDs)
//   const generateRandomVoterId = useCallback(() => {
//     return String(Math.floor(100000 + Math.random() * 900000));
//   }, []);

//   // Get a random voter ID from the pool or generate one
//   const getRandomDisplayId = useCallback(() => {
//     if (participants.length > 0) {
//       const randomIndex = Math.floor(Math.random() * participants.length);
//       return participants[randomIndex];
//     }
//     return generateRandomVoterId();
//   }, [participants, generateRandomVoterId]);

//   // Countdown timer to election end
//   useEffect(() => {
//     if (!electionEndDate) return;

//     const updateCountdown = () => {
//       const now = new Date().getTime();
//       const end = new Date(electionEndDate).getTime();
//       const diff = Math.max(0, end - now);

//       if (diff <= 0) {
//         setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
//         return;
//       }

//       setCountdown({
//         days: Math.floor(diff / (1000 * 60 * 60 * 24)),
//         hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
//         minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
//         seconds: Math.floor((diff % (1000 * 60)) / 1000),
//       });
//     };

//     updateCountdown();
//     const interval = setInterval(updateCountdown, 1000);
//     return () => clearInterval(interval);
//   }, [electionEndDate]);

//   // Start spinning - displays random voter IDs
//   const startSpinning = useCallback(() => {
//     if (spinIntervalRef.current) return;
    
//     setIsSpinning(true);
//     spinIntervalRef.current = setInterval(() => {
//       const voterId = getRandomDisplayId();
//       setDisplayDigits(voterId.split(''));
//     }, 80); // Fast spinning
//   }, [getRandomDisplayId]);

//   // Stop spinning
//   const stopSpinning = useCallback(() => {
//     if (spinIntervalRef.current) {
//       clearInterval(spinIntervalRef.current);
//       spinIntervalRef.current = null;
//     }
//     setIsSpinning(false);
//   }, []);

//   // ✅ Auto-start spinning when 2+ participants exist (per documentation)
//   useEffect(() => {
//     if (isActive && totalEntries >= 2 && !isElectionEnded && !revealingWinner) {
//       startSpinning();
//     } else if (isElectionEnded || revealingWinner) {
//       stopSpinning();
//     } else if (totalEntries < 2) {
//       stopSpinning();
//     }

//     return () => stopSpinning();
//   }, [isActive, totalEntries, isElectionEnded, revealingWinner, startSpinning, stopSpinning]);

//   // Reveal winners sequentially when election ends
//   useEffect(() => {
//     if (isElectionEnded && winners.length > 0 && revealedWinners.length === 0 && !revealingWinner) {
//       revealWinnersSequentially();
//     }
//   }, [isElectionEnded, winners, revealedWinners.length, revealingWinner]);

//   // Sequential winner reveal - one after another
//   const revealWinnersSequentially = async () => {
//     setRevealingWinner(true);
//     stopSpinning();
    
//     for (let i = 0; i < winners.length; i++) {
//       setCurrentRevealIndex(i);
      
//       // Slow down spinning effect before revealing each winner
//       for (let j = 0; j < 20; j++) {
//         await new Promise(resolve => setTimeout(resolve, 80 + j * 20));
//         const voterId = getRandomDisplayId();
//         setDisplayDigits(voterId.split(''));
//       }
      
//       // Final slowdown
//       for (let k = 0; k < 10; k++) {
//         await new Promise(resolve => setTimeout(resolve, 150 + k * 50));
//         const voterId = getRandomDisplayId();
//         setDisplayDigits(voterId.split(''));
//       }
      
//       // Reveal the actual winner's voter ID (ball number)
//       const winnerBallNumber = String(
//         winners[i].ball_number ||
//         winners[i].ballNumber ||
//         winners[i].oddjob_voter_id || 
//         winners[i].oddjobVoterId || 
//         winners[i].voterId ||
//         winners[i].voter_id ||
//         winners[i].id || 
//         '000000'
//       ).padStart(6, '0');
      
//       setDisplayDigits(winnerBallNumber.split(''));
      
//       // Add to revealed winners list
//       setRevealedWinners(prev => [...prev, {
//         ...winners[i],
//         ballNumber: winnerBallNumber,
//         rank: i + 1
//       }]);
      
//       // Wait before revealing next winner (if there are more)
//       if (i < winners.length - 1) {
//         await new Promise(resolve => setTimeout(resolve, 3000));
//       }
//     }
    
//     setCurrentRevealIndex(-1);
//     setRevealingWinner(false);
//   };

//   // Format countdown display - matching documentation format (DD:HH:MM or HH:MM:SS)
//   const formatCountdown = () => {
//     const { days, hours, minutes, seconds } = countdown;
//     const pad = (n) => String(n).padStart(2, '0');
    
//     if (days > 0) {
//       return `${days}d ${pad(hours)}:${pad(minutes)}`;
//     }
//     return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
//   };

//   // Get ordinal suffix (1st, 2nd, 3rd, etc.)
//   const getOrdinal = (n) => {
//     const s = ['th', 'st', 'nd', 'rd'];
//     const v = n % 100;
//     return n + (s[(v - 20) % 10] || s[v] || s[0]);
//   };

//   return (
//     <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-black rounded-xl overflow-hidden border-4 border-yellow-500 shadow-2xl">
//       {/* Header - Date/Time and Lucky Voters Count */}
//       <div className="bg-black px-4 py-3 flex justify-between items-center border-b-2 border-yellow-600">
//         {/* Date & Time Countdown */}
//         <div className="flex items-center gap-2">
//           <Clock className="w-4 h-4 text-gray-400" />
//           <span className="text-gray-400 text-sm">Date & Time:</span>
//           <div className="bg-red-900 px-3 py-1 rounded border border-red-700">
//             <span 
//               className="font-mono text-red-400 text-lg font-bold tracking-wider"
//               style={{ 
//                 fontFamily: 'Courier New, monospace',
//                 textShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
//               }}
//             >
//               {formatCountdown()}
//             </span>
//           </div>
//         </div>

//         {/* Lucky Voters Number (Winners Count) */}
//         <div className="flex items-center gap-2">
//           <span className="text-gray-400 text-sm">Lucky Voters No:</span>
//           <div className="bg-red-900 px-3 py-1 rounded border border-red-700">
//             <span 
//               className="font-mono text-red-400 text-lg font-bold"
//               style={{ 
//                 fontFamily: 'Courier New, monospace',
//                 textShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
//               }}
//             >
//               {String(luckyVotersCount).padStart(2, '0')}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Main Slot Machine Display - Large Numbers */}
//       <div className="p-6 bg-gradient-to-b from-gray-800 to-gray-900">
//         {/* Digit Display */}
//         <div className="flex justify-center gap-1 mb-4">
//           {displayDigits.map((digit, index) => (
//             <div 
//               key={index}
//               className="relative"
//             >
//               {/* Single Digit Container */}
//               <div 
//                 className={`
//                   w-12 h-20 sm:w-16 sm:h-24 md:w-20 md:h-28
//                   bg-gradient-to-b from-gray-100 via-white to-gray-200
//                   rounded-lg flex items-center justify-center
//                   border-2 border-gray-400 shadow-lg
//                   relative overflow-hidden
//                 `}
//               >
//                 {/* Top reflection */}
//                 <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/60 to-transparent" />
                
//                 {/* Middle line */}
//                 <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 transform -translate-y-1/2 z-10" />
                
//                 {/* The Digit */}
//                 <span 
//                   className={`
//                     text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 relative z-20
//                     ${isSpinning ? 'animate-pulse' : ''}
//                   `}
//                   style={{ 
//                     fontFamily: 'Impact, Arial Black, sans-serif',
//                     textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
//                   }}
//                 >
//                   {digit}
//                 </span>

//                 {/* Bottom shadow */}
//                 <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-gray-300/40 to-transparent" />
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Status Message */}
//         <div className="text-center">
//           {!isElectionEnded && totalEntries < 2 && (
//             <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500 rounded-full px-4 py-2">
//               <Clock className="w-4 h-4 text-yellow-400" />
//               <span className="text-yellow-400 text-sm font-medium">
//                 Waiting for voters... ({totalEntries}/2 minimum)
//               </span>
//             </div>
//           )}

//           {!isElectionEnded && totalEntries >= 2 && isSpinning && (
//             <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500 rounded-full px-4 py-2">
//               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
//               <span className="text-green-400 text-sm font-medium">
//                 Machine is spinning... Drawing at election end
//               </span>
//             </div>
//           )}

//           {isElectionEnded && revealingWinner && currentRevealIndex >= 0 && (
//             <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500 rounded-full px-4 py-2">
//               <span className="text-purple-400 text-sm font-medium animate-pulse">
//                 🎊 Revealing {getOrdinal(currentRevealIndex + 1)} Lucky Voter Winner...
//               </span>
//             </div>
//           )}

//           {isElectionEnded && !revealingWinner && revealedWinners.length > 0 && (
//             <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500 rounded-full px-4 py-2">
//               <span className="text-green-400 text-sm font-medium">
//                 ✅ All {revealedWinners.length} Lucky Voter(s) Revealed!
//               </span>
//             </div>
//           )}

//           {/* Loading/Error state */}
//           {isLoadingParticipants && totalEntries === 0 && (
//             <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500 rounded-full px-4 py-2 mt-2">
//               <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
//               <span className="text-blue-400 text-sm font-medium">
//                 Loading participants...
//               </span>
//             </div>
//           )}

//           {fetchError && (
//             <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500 rounded-full px-4 py-2 mt-2">
//               <span className="text-red-400 text-sm font-medium">
//                 ⚠️ {fetchError}
//               </span>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Winners Display Section - Shows after winners are revealed */}
//       {revealedWinners.length > 0 && (
//         <div className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 px-4 py-4 border-t-2 border-yellow-400">
//           <h3 className="text-yellow-900 font-bold text-lg mb-3 text-center">
//             🏆 LUCKY VOTERS WINNERS 🏆
//           </h3>
          
//           <div className="space-y-2">
//             {revealedWinners.map((winner, index) => (
//               <div 
//                 key={index}
//                 className="bg-white rounded-lg px-4 py-3 flex items-center justify-between shadow-md"
//               >
//                 <div className="flex items-center gap-3">
//                   {/* Rank Badge */}
//                   <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 font-black w-10 h-10 rounded-full flex items-center justify-center text-sm shadow">
//                     {getOrdinal(index + 1)}
//                   </div>
                  
//                   {/* Winner Info */}
//                   <div>
//                     <p className="font-bold text-gray-900">
//                       {winner.displayName || winner.username || winner.name || `Lucky Voter`}
//                     </p>
//                     <p className="text-gray-500 text-sm font-mono">
//                       Ball #: {winner.ballNumber}
//                     </p>
//                   </div>
//                 </div>
                
//                 {/* Trophy */}
//                 <span className="text-3xl">🏆</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Footer - Total Entries and Status */}
//       <div className="bg-black/80 px-4 py-2 border-t border-gray-700 flex justify-between items-center">
//         <div className="flex items-center gap-2 text-gray-400">
//           <Users className="w-4 h-4" />
//           <span className="text-sm">
//             Total Entries: <strong className="text-white">{totalEntries}</strong>
//           </span>
//         </div>
        
//         <div className={`flex items-center gap-2 text-sm ${
//           isSpinning ? 'text-green-400' : 
//           isElectionEnded ? 'text-blue-400' : 
//           'text-yellow-400'
//         }`}>
//           <span className={`w-2 h-2 rounded-full ${
//             isSpinning ? 'bg-green-400 animate-pulse' : 
//             isElectionEnded ? 'bg-blue-400' : 
//             'bg-yellow-400'
//           }`} />
//           <span>
//             {isSpinning ? 'SPINNING' : 
//              isElectionEnded ? 'COMPLETED' : 
//              'WAITING'}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }