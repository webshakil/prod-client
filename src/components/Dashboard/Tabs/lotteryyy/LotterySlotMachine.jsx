// src/components/Dashboard/Tabs/lotteryyy/LotterySlotMachine.jsx
// 4D Slot Machine
// DURING ELECTION: Continuous spinning showing actual voter IDs
// AT ELECTION END: For each winner - Fast spin (1 sec) → Gradual slow with haphazard (up/down) → Stop aligned
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Users, RefreshCw, Eye } from 'lucide-react';
import DemoWinnerReveal from './DemoWinnerReveal';

const LOTTERY_API_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api';

// Spinning digit - haphazard = different vertical positions, disciplined = aligned center
const SpinningDigit = ({ 
  digit,
  isSpinning,
  spinPhase, // 'continuous' | 'fast' | 'slowing' | 'stopped'
  slowdownProgress,
  randomOffset = 0, // Each digit gets different random offset for haphazard effect
  compact = false
}) => {
  const [currentDigit, setCurrentDigit] = useState(digit || '0');
  const [nextDigit, setNextDigit] = useState('0');
  const [offsetY, setOffsetY] = useState(0);
  const animationRef = useRef(null);
  const isSpinningRef = useRef(isSpinning);
  const phaseRef = useRef(spinPhase);
  const progressRef = useRef(slowdownProgress);
  
  const digitHeight = compact ? 65 : 110;
  const continuousSpeed = compact ? 12 : 18;
  const fastSpeed = compact ? 25 : 40;
  const minSpeed = compact ? 1 : 2;
  
  useEffect(() => {
    isSpinningRef.current = isSpinning;
    phaseRef.current = spinPhase;
    progressRef.current = slowdownProgress;
  }, [isSpinning, spinPhase, slowdownProgress]);

  useEffect(() => {
    if (!isSpinning) {
      setCurrentDigit(digit || '0');
      setOffsetY(0);
    }
  }, [digit, isSpinning]);

  useEffect(() => {
    if (isSpinning) {
      let offset = randomOffset; // Start at random position for haphazard
      let currDigit = Math.floor(Math.random() * 10);
      let nxtDigit = Math.floor(Math.random() * 10);
      
      setCurrentDigit(String(currDigit));
      setNextDigit(String(nxtDigit));
      
      const animate = () => {
        if (!isSpinningRef.current) return;
        
        const phase = phaseRef.current;
        const progress = progressRef.current;
        
        let speed;
        
        if (phase === 'continuous') {
          speed = continuousSpeed;
        } else if (phase === 'fast') {
          speed = fastSpeed;
        } else if (phase === 'slowing') {
          // Gradually slow down
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          speed = fastSpeed - (fastSpeed - minSpeed) * easeProgress;
          
          if (speed <= minSpeed && progress >= 0.98) {
            return;
          }
        } else {
          return;
        }
        
        offset -= speed;
        
        if (offset <= -digitHeight) {
          offset = 0;
          currDigit = nxtDigit;
          nxtDigit = Math.floor(Math.random() * 10);
          setCurrentDigit(String(currDigit));
          setNextDigit(String(nxtDigit));
        }
        
        setOffsetY(offset);
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
    } else {
      // When stopped, align to center (offset = 0)
      setOffsetY(0);
      setCurrentDigit(digit || '0');
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
  }, [isSpinning, digit, digitHeight, continuousSpeed, fastSpeed, minSpeed, randomOffset]);

  const fontSize = compact ? 'text-5xl' : 'text-7xl sm:text-8xl';
  const containerWidth = compact ? 50 : 85;
  const containerHeightVal = compact ? 65 : 110;

  return (
    <div 
      className="relative overflow-hidden rounded-lg"
      style={{
        width: `${containerWidth}px`,
        height: `${containerHeightVal}px`,
        background: 'linear-gradient(180deg, #7f1d1d 0%, #991b1b 20%, #b91c1c 50%, #991b1b 80%, #7f1d1d 100%)',
        boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.7), inset 0 -4px 20px rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.4)',
        border: '3px solid #1f2937',
        borderRadius: '8px'
      }}
    >
      <div 
        className="absolute w-full"
        style={{ 
          transform: `translateY(${offsetY}px)`,
          transition: isSpinning ? 'none' : 'transform 0.4s ease-out'
        }}
      >
        <div className="flex items-center justify-center" style={{ height: `${digitHeight}px` }}>
          <span 
            className={`font-black text-white ${fontSize}`}
            style={{ 
              fontFamily: 'Impact, "Arial Black", sans-serif',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            {currentDigit}
          </span>
        </div>
        <div className="flex items-center justify-center" style={{ height: `${digitHeight}px` }}>
          <span 
            className={`font-black text-white ${fontSize}`}
            style={{ 
              fontFamily: 'Impact, "Arial Black", sans-serif',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            {nextDigit}
          </span>
        </div>
      </div>
      
      <div 
        className="absolute top-0 left-0 right-0 pointer-events-none z-10"
        style={{
          height: '35%',
          background: 'linear-gradient(to bottom, rgba(55,0,0,0.95) 0%, rgba(55,0,0,0.5) 50%, transparent 100%)'
        }}
      />
      
      <div 
        className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
        style={{
          height: '35%',
          background: 'linear-gradient(to top, rgba(55,0,0,0.95) 0%, rgba(55,0,0,0.5) 50%, transparent 100%)'
        }}
      />
    </div>
  );
};

export default function LotterySlotMachine({ 
  electionId,
  electionEndDate,
  luckyVotersCount = 1,
  isElectionEnded = false,
  winners = [],
  isActive = true,
  compact = false,
}) {
  const [displayDigits, setDisplayDigits] = useState(['0', '0', '0', '0', '0', '0']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinPhase, setSpinPhase] = useState('stopped');
  const [slowdownProgress, setSlowdownProgress] = useState(0);
  const [randomOffsets, setRandomOffsets] = useState([0, 0, 0, 0, 0, 0]);
  /*eslint-disable*/
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [revealedWinners, setRevealedWinners] = useState([]);
  const [currentRevealIndex, setCurrentRevealIndex] = useState(-1);
  const [revealingWinner, setRevealingWinner] = useState(false);
  
  const [participants, setParticipants] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [actualLuckyVotersCount, setActualLuckyVotersCount] = useState(luckyVotersCount);
  
  const [showDemoModal, setShowDemoModal] = useState(false);
  
  const fetchIntervalRef = useRef(null);
  const displayIntervalRef = useRef(null);
  const slowdownIntervalRef = useRef(null);

  // Generate random offsets for haphazard effect (different Y position for each digit)
  const generateRandomOffsets = useCallback(() => {
    const digitHeight = compact ? 65 : 110;
    return displayDigits.map(() => -Math.floor(Math.random() * (digitHeight * 0.6)));
  }, [displayDigits.length, compact]);

  const fetchBallNumbers = useCallback(async () => {
    if (!electionId) return;
    
    try {
      setIsLoadingParticipants(true);
      setFetchError(null);
      
      const response = await fetch(
        `${LOTTERY_API_URL}/lottery/elections/${electionId}/ball-numbers`
      );
      
      if (!response.ok) throw new Error(`Failed: ${response.status}`);
      
      const data = await response.json();
      console.log('🎰 Ball numbers fetched:', data);
      
      const ballNumbers = [];
      const nums = data.ballNumbers || data.ball_numbers || [];
      nums.forEach(ballNum => {
        if (ballNum) ballNumbers.push(String(ballNum));
      });
      
      setParticipants(ballNumbers);
      setTotalEntries(data.totalParticipants || data.total_participants || ballNumbers.length);
      
      if (data.luckyVotersCount || data.lucky_voters_count) {
        setActualLuckyVotersCount(data.luckyVotersCount || data.lucky_voters_count);
      }
      
      if (ballNumbers.length > 0) {
        const maxDigits = Math.max(...ballNumbers.map(b => b.length));
        if (maxDigits !== displayDigits.length) {
          setDisplayDigits(Array(maxDigits).fill('0'));
          setRandomOffsets(Array(maxDigits).fill(0));
        }
      }
    } catch (error) {
      console.error('❌ Error:', error);
      setFetchError(error.message);
    } finally {
      setIsLoadingParticipants(false);
    }
  }, [electionId, displayDigits.length]);

  useEffect(() => {
    if (electionId && isActive) {
      fetchBallNumbers();
      fetchIntervalRef.current = setInterval(fetchBallNumbers, 10000);
      return () => {
        if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current);
      };
    }
  }, [electionId, isActive, fetchBallNumbers]);

  const getRandomVoterId = useCallback(() => {
    if (participants.length > 0) {
      const idx = Math.floor(Math.random() * participants.length);
      return participants[idx].padStart(displayDigits.length, '0');
    }
    const min = Math.pow(10, displayDigits.length - 1);
    const max = Math.pow(10, displayDigits.length) - 1;
    return String(Math.floor(min + Math.random() * (max - min)));
  }, [participants, displayDigits.length]);

  useEffect(() => {
    if (!electionEndDate) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(electionEndDate).getTime();
      const diff = Math.max(0, end - now);

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

  const startContinuousSpinning = useCallback(() => {
    setIsSpinning(true);
    setSpinPhase('continuous');
    setRandomOffsets(generateRandomOffsets());
    
    displayIntervalRef.current = setInterval(() => {
      const voterId = getRandomVoterId();
      setDisplayDigits(voterId.split(''));
    }, 150);
  }, [getRandomVoterId, generateRandomOffsets]);

  const stopContinuousSpinning = useCallback(() => {
    if (displayIntervalRef.current) {
      clearInterval(displayIntervalRef.current);
      displayIntervalRef.current = null;
    }
    setIsSpinning(false);
    setSpinPhase('stopped');
  }, []);

  useEffect(() => {
    if (isActive && totalEntries >= 1 && !isElectionEnded && !revealingWinner) {
      startContinuousSpinning();
    } else if (isElectionEnded || revealingWinner) {
      stopContinuousSpinning();
    } else if (totalEntries < 1) {
      stopContinuousSpinning();
    }
    
    return () => stopContinuousSpinning();
  }, [isActive, totalEntries, isElectionEnded, revealingWinner, startContinuousSpinning, stopContinuousSpinning]);

  useEffect(() => {
    if (isElectionEnded && winners.length > 0 && revealedWinners.length === 0 && !revealingWinner) {
      revealWinnersSequentially();
    }
  }, [isElectionEnded, winners, revealedWinners.length, revealingWinner]);

  const revealSingleWinner = async (winnerIndex) => {
    const FAST_PHASE_DURATION = 1000; // 1 second fast
    const SLOW_PHASE_DURATION = 2500; // 2.5 seconds to slow down
    
    // Generate random offsets for haphazard effect
    setRandomOffsets(generateRandomOffsets());
    
    // Fast phase - same speed, straight numbers
    setIsSpinning(true);
    setSpinPhase('fast');
    setSlowdownProgress(0);
    
    const fastInterval = setInterval(() => {
      const voterId = getRandomVoterId();
      setDisplayDigits(voterId.split(''));
      // Update random offsets periodically for haphazard movement
      setRandomOffsets(generateRandomOffsets());
    }, 60);
    
    await new Promise(resolve => setTimeout(resolve, FAST_PHASE_DURATION));
    
    clearInterval(fastInterval);
    
    // Slowing phase - digits at different vertical positions (haphazard)
    setSpinPhase('slowing');
    
    const slowdownStartTime = Date.now();
    
    await new Promise(resolve => {
      let lastUpdate = 0;
      slowdownIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - slowdownStartTime;
        const progress = Math.min(elapsed / SLOW_PHASE_DURATION, 1);
        setSlowdownProgress(progress);
        
        // Update display less frequently as we slow down
        const updateInterval = 60 + progress * 400;
        if (elapsed - lastUpdate > updateInterval) {
          const voterId = getRandomVoterId();
          setDisplayDigits(voterId.split(''));
          // Gradually reduce randomness of offsets as we slow down
          const offsetScale = 1 - progress;
          setRandomOffsets(prev => prev.map(() => 
            -Math.floor(Math.random() * ((compact ? 65 : 110) * 0.6 * offsetScale))
          ));
          lastUpdate = elapsed;
        }
        
        if (progress >= 1) {
          clearInterval(slowdownIntervalRef.current);
          resolve();
        }
      }, 16);
    });
    
    // Stop - all digits align to center
    setIsSpinning(false);
    setSpinPhase('stopped');
    setSlowdownProgress(0);
    setRandomOffsets(displayDigits.map(() => 0)); // All aligned
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Show winner's number
    const winner = winners[winnerIndex];
    const winnerBallNumber = String(
      winner.ball_number ||
      winner.ballNumber ||
      winner.oddjob_voter_id || 
      winner.oddjobVoterId || 
      winner.voterId ||
      winner.voter_id ||
      winner.id || 
      '000000'
    ).padStart(displayDigits.length, '0');
    
    setDisplayDigits(winnerBallNumber.split(''));
    
    return {
      ...winner,
      ballNumber: winnerBallNumber,
      rank: winnerIndex + 1
    };
  };

  const revealWinnersSequentially = async () => {
    setRevealingWinner(true);
    stopContinuousSpinning();
    
    for (let i = 0; i < winners.length; i++) {
      setCurrentRevealIndex(i);
      
      const revealedWinner = await revealSingleWinner(i);
      setRevealedWinners(prev => [...prev, revealedWinner]);
      
      if (i < winners.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2500));
      }
    }
    
    setCurrentRevealIndex(-1);
    setRevealingWinner(false);
  };

  const formatCountdown = () => {
    // Show the election end date in DD/MM/YYYY format
    if (!electionEndDate) return '--/--/----';
    const endDate = new Date(electionEndDate);
    const day = String(endDate.getDate()).padStart(2, '0');
    const month = String(endDate.getMonth() + 1).padStart(2, '0');
    const year = endDate.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getOrdinal = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <>
      <div 
        className={`rounded-xl overflow-hidden ${compact ? 'text-sm' : ''}`}
        style={{
          background: 'linear-gradient(180deg, #d4a418 0%, #c9972a 50%, #b8860b 100%)'
        }}
      >
        {/* Header */}
        <div 
          className={`flex justify-between items-center ${compact ? 'px-3 py-2' : 'px-5 py-4'}`}
          style={{ background: 'linear-gradient(180deg, #d4a418 0%, #c9972a 100%)' }}
        >
          <div className="flex items-center gap-2">
            <span className={`text-gray-900 font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>
              Date:
            </span>
            <div 
              className={`rounded ${compact ? 'px-2 py-0.5' : 'px-3 py-1'}`}
              style={{ background: '#1a1a1a', border: '2px solid #333' }}
            >
              <span 
                className={`font-bold ${compact ? 'text-sm' : 'text-lg'}`}
                style={{ 
                  fontFamily: '"Courier New", monospace',
                  color: '#00ff00',
                  textShadow: '0 0 8px #00ff00, 0 0 12px #00ff00',
                  letterSpacing: '1px'
                }}
              >
                {formatCountdown()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-gray-900 font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>
              Lucky Voters No:
            </span>
            <div 
              className={`rounded ${compact ? 'px-2 py-0.5' : 'px-3 py-1'}`}
              style={{ background: '#1a1a1a', border: '2px solid #333' }}
            >
              <span 
                className={`font-bold ${compact ? 'text-sm' : 'text-lg'}`}
                style={{ 
                  fontFamily: '"Courier New", monospace',
                  color: '#00ff00',
                  textShadow: '0 0 8px #00ff00, 0 0 12px #00ff00',
                  letterSpacing: '2px'
                }}
              >
                {String(actualLuckyVotersCount).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Main Display */}
        <div className={`${compact ? 'px-3 py-3' : 'px-5 py-4'}`}>
          <div 
            className={`flex justify-center items-center ${compact ? 'gap-1.5 p-3' : 'gap-2 p-4'}`}
            style={{ 
              borderRadius: '10px',
              background: '#1a1a1a',
              boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
            }}
          >
            {displayDigits.map((digit, index) => (
              <SpinningDigit
                key={`digit-${index}`}
                digit={digit}
                isSpinning={isSpinning}
                spinPhase={spinPhase}
                slowdownProgress={slowdownProgress}
                randomOffset={randomOffsets[index] || 0}
                compact={compact}
              />
            ))}
          </div>
        </div>

        {/* Winners */}
        {revealedWinners.length > 0 && (
          <div 
            className={`border-t-2 border-yellow-600 ${compact ? 'px-2 py-2' : 'px-4 py-4'}`}
            style={{ background: 'linear-gradient(180deg, #c9972a 0%, #b8860b 100%)' }}
          >
            <h3 className={`text-yellow-900 font-bold mb-2 text-center ${compact ? 'text-sm' : 'text-lg'}`}>
              🏆 LUCKY VOTERS WINNERS 🏆
            </h3>
            
            <div className="space-y-1.5">
              {revealedWinners.map((winner, index) => (
                <div 
                  key={index}
                  className={`bg-white rounded-lg flex items-center justify-between shadow-md ${compact ? 'px-2 py-1.5' : 'px-4 py-3'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 font-black rounded-full flex items-center justify-center shadow ${compact ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm'}`}>
                      {getOrdinal(index + 1)}
                    </div>
                    <div>
                      <p className={`font-bold text-gray-900 ${compact ? 'text-xs' : ''}`}>
                        {winner.displayName || winner.username || winner.name || 'Lucky Voter'}
                      </p>
                      <p className={`text-gray-500 font-mono ${compact ? 'text-xs' : 'text-sm'}`}>
                        Ball #: {winner.ballNumber}
                      </p>
                    </div>
                  </div>
                  <span className={compact ? 'text-xl' : 'text-3xl'}>🏆</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div 
          className={`border-t border-yellow-700 flex justify-between items-center ${compact ? 'px-2 py-1.5' : 'px-4 py-2'}`}
          style={{ background: 'linear-gradient(180deg, #c9972a 0%, #b8860b 100%)' }}
        >
          <div className={`flex items-center gap-1.5 text-gray-900 ${compact ? 'text-xs' : ''}`}>
            <Users className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
            <span className={compact ? 'text-xs' : 'text-sm'}>
              Total Entries: <strong>{totalEntries}</strong>
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {!isElectionEnded && totalEntries >= 1 && (
              <button
                onClick={() => setShowDemoModal(true)}
                className={`flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white rounded transition ${compact ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xs'}`}
              >
                <Eye className="w-3 h-3" />
                <span>Demo</span>
              </button>
            )}
            
            <div className={`flex items-center gap-1.5 ${compact ? 'text-xs' : 'text-sm'} ${
              isSpinning ? 'text-green-700' : isElectionEnded ? 'text-blue-700' : 'text-yellow-800'
            }`}>
              <span className={`rounded-full ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'} ${
                isSpinning ? 'bg-green-500 animate-pulse' : isElectionEnded ? 'bg-blue-500' : 'bg-yellow-600'
              }`} />
              <span className="font-semibold">
                {isSpinning ? 'SPINNING' : isElectionEnded ? 'COMPLETED' : 'WAITING'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <DemoWinnerReveal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        realBallNumbers={participants}
        realLuckyVotersCount={actualLuckyVotersCount}
        realTotalEntries={totalEntries}
        compact={compact}
      />
    </>
  );
}
// // src/components/Dashboard/Tabs/lotteryyy/LotterySlotMachine.jsx
// // 4D Slot Machine
// // DURING ELECTION: Continuous spinning showing actual voter IDs
// // AT ELECTION END: For each winner - Fast spin (1 sec) → Gradual slow with haphazard (up/down) → Stop aligned
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { Users, RefreshCw, Eye } from 'lucide-react';
// import DemoWinnerReveal from './DemoWinnerReveal';

// const LOTTERY_API_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api';

// // Spinning digit - haphazard = different vertical positions, disciplined = aligned center
// const SpinningDigit = ({ 
//   digit,
//   isSpinning,
//   spinPhase, // 'continuous' | 'fast' | 'slowing' | 'stopped'
//   slowdownProgress,
//   randomOffset = 0, // Each digit gets different random offset for haphazard effect
//   compact = false
// }) => {
//   const [currentDigit, setCurrentDigit] = useState(digit || '0');
//   const [nextDigit, setNextDigit] = useState('0');
//   const [offsetY, setOffsetY] = useState(0);
//   const animationRef = useRef(null);
//   const isSpinningRef = useRef(isSpinning);
//   const phaseRef = useRef(spinPhase);
//   const progressRef = useRef(slowdownProgress);
  
//   const digitHeight = compact ? 65 : 110;
//   const continuousSpeed = compact ? 12 : 18;
//   const fastSpeed = compact ? 25 : 40;
//   const minSpeed = compact ? 1 : 2;
  
//   useEffect(() => {
//     isSpinningRef.current = isSpinning;
//     phaseRef.current = spinPhase;
//     progressRef.current = slowdownProgress;
//   }, [isSpinning, spinPhase, slowdownProgress]);

//   useEffect(() => {
//     if (!isSpinning) {
//       setCurrentDigit(digit || '0');
//       setOffsetY(0);
//     }
//   }, [digit, isSpinning]);

//   useEffect(() => {
//     if (isSpinning) {
//       let offset = randomOffset; // Start at random position for haphazard
//       let currDigit = Math.floor(Math.random() * 10);
//       let nxtDigit = Math.floor(Math.random() * 10);
      
//       setCurrentDigit(String(currDigit));
//       setNextDigit(String(nxtDigit));
      
//       const animate = () => {
//         if (!isSpinningRef.current) return;
        
//         const phase = phaseRef.current;
//         const progress = progressRef.current;
        
//         let speed;
        
//         if (phase === 'continuous') {
//           speed = continuousSpeed;
//         } else if (phase === 'fast') {
//           speed = fastSpeed;
//         } else if (phase === 'slowing') {
//           // Gradually slow down
//           const easeProgress = 1 - Math.pow(1 - progress, 3);
//           speed = fastSpeed - (fastSpeed - minSpeed) * easeProgress;
          
//           if (speed <= minSpeed && progress >= 0.98) {
//             return;
//           }
//         } else {
//           return;
//         }
        
//         offset -= speed;
        
//         if (offset <= -digitHeight) {
//           offset = 0;
//           currDigit = nxtDigit;
//           nxtDigit = Math.floor(Math.random() * 10);
//           setCurrentDigit(String(currDigit));
//           setNextDigit(String(nxtDigit));
//         }
        
//         setOffsetY(offset);
//         animationRef.current = requestAnimationFrame(animate);
//       };
      
//       animationRef.current = requestAnimationFrame(animate);
      
//       return () => {
//         if (animationRef.current) cancelAnimationFrame(animationRef.current);
//       };
//     } else {
//       // When stopped, align to center (offset = 0)
//       setOffsetY(0);
//       setCurrentDigit(digit || '0');
//       if (animationRef.current) {
//         cancelAnimationFrame(animationRef.current);
//         animationRef.current = null;
//       }
//     }
//   }, [isSpinning, digit, digitHeight, continuousSpeed, fastSpeed, minSpeed, randomOffset]);

//   const fontSize = compact ? 'text-5xl' : 'text-7xl sm:text-8xl';
//   const containerWidth = compact ? 50 : 85;
//   const containerHeightVal = compact ? 65 : 110;

//   return (
//     <div 
//       className="relative overflow-hidden rounded-lg"
//       style={{
//         width: `${containerWidth}px`,
//         height: `${containerHeightVal}px`,
//         background: 'linear-gradient(180deg, #7f1d1d 0%, #991b1b 20%, #b91c1c 50%, #991b1b 80%, #7f1d1d 100%)',
//         boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.7), inset 0 -4px 20px rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.4)',
//         border: '3px solid #1f2937',
//         borderRadius: '8px'
//       }}
//     >
//       <div 
//         className="absolute w-full"
//         style={{ 
//           transform: `translateY(${offsetY}px)`,
//           transition: isSpinning ? 'none' : 'transform 0.4s ease-out'
//         }}
//       >
//         <div className="flex items-center justify-center" style={{ height: `${digitHeight}px` }}>
//           <span 
//             className={`font-black text-white ${fontSize}`}
//             style={{ 
//               fontFamily: 'Impact, "Arial Black", sans-serif',
//               textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
//             }}
//           >
//             {currentDigit}
//           </span>
//         </div>
//         <div className="flex items-center justify-center" style={{ height: `${digitHeight}px` }}>
//           <span 
//             className={`font-black text-white ${fontSize}`}
//             style={{ 
//               fontFamily: 'Impact, "Arial Black", sans-serif',
//               textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
//             }}
//           >
//             {nextDigit}
//           </span>
//         </div>
//       </div>
      
//       <div 
//         className="absolute top-0 left-0 right-0 pointer-events-none z-10"
//         style={{
//           height: '35%',
//           background: 'linear-gradient(to bottom, rgba(55,0,0,0.95) 0%, rgba(55,0,0,0.5) 50%, transparent 100%)'
//         }}
//       />
      
//       <div 
//         className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
//         style={{
//           height: '35%',
//           background: 'linear-gradient(to top, rgba(55,0,0,0.95) 0%, rgba(55,0,0,0.5) 50%, transparent 100%)'
//         }}
//       />
//     </div>
//   );
// };

// export default function LotterySlotMachine({ 
//   electionId,
//   electionEndDate,
//   luckyVotersCount = 1,
//   isElectionEnded = false,
//   winners = [],
//   isActive = true,
//   compact = false,
// }) {
//   const [displayDigits, setDisplayDigits] = useState(['0', '0', '0', '0', '0', '0']);
//   const [isSpinning, setIsSpinning] = useState(false);
//   const [spinPhase, setSpinPhase] = useState('stopped');
//   const [slowdownProgress, setSlowdownProgress] = useState(0);
//   const [randomOffsets, setRandomOffsets] = useState([0, 0, 0, 0, 0, 0]);
//   /*eslint-disable*/
//   const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
//   const [revealedWinners, setRevealedWinners] = useState([]);
//   const [currentRevealIndex, setCurrentRevealIndex] = useState(-1);
//   const [revealingWinner, setRevealingWinner] = useState(false);
  
//   const [participants, setParticipants] = useState([]);
//   const [totalEntries, setTotalEntries] = useState(0);
//   const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
//   const [fetchError, setFetchError] = useState(null);
//   const [actualLuckyVotersCount, setActualLuckyVotersCount] = useState(luckyVotersCount);
  
//   const [showDemoModal, setShowDemoModal] = useState(false);
  
//   const fetchIntervalRef = useRef(null);
//   const displayIntervalRef = useRef(null);
//   const slowdownIntervalRef = useRef(null);

//   // Generate random offsets for haphazard effect (different Y position for each digit)
//   const generateRandomOffsets = useCallback(() => {
//     const digitHeight = compact ? 65 : 110;
//     return displayDigits.map(() => -Math.floor(Math.random() * (digitHeight * 0.6)));
//   }, [displayDigits.length, compact]);

//   const fetchBallNumbers = useCallback(async () => {
//     if (!electionId) return;
    
//     try {
//       setIsLoadingParticipants(true);
//       setFetchError(null);
      
//       const response = await fetch(
//         `${LOTTERY_API_URL}/lottery/elections/${electionId}/ball-numbers`
//       );
      
//       if (!response.ok) throw new Error(`Failed: ${response.status}`);
      
//       const data = await response.json();
//       console.log('🎰 Ball numbers fetched:', data);
      
//       const ballNumbers = [];
//       const nums = data.ballNumbers || data.ball_numbers || [];
//       nums.forEach(ballNum => {
//         if (ballNum) ballNumbers.push(String(ballNum));
//       });
      
//       setParticipants(ballNumbers);
//       setTotalEntries(data.totalParticipants || data.total_participants || ballNumbers.length);
      
//       if (data.luckyVotersCount || data.lucky_voters_count) {
//         setActualLuckyVotersCount(data.luckyVotersCount || data.lucky_voters_count);
//       }
      
//       if (ballNumbers.length > 0) {
//         const maxDigits = Math.max(...ballNumbers.map(b => b.length));
//         if (maxDigits !== displayDigits.length) {
//           setDisplayDigits(Array(maxDigits).fill('0'));
//           setRandomOffsets(Array(maxDigits).fill(0));
//         }
//       }
//     } catch (error) {
//       console.error('❌ Error:', error);
//       setFetchError(error.message);
//     } finally {
//       setIsLoadingParticipants(false);
//     }
//   }, [electionId, displayDigits.length]);

//   useEffect(() => {
//     if (electionId && isActive) {
//       fetchBallNumbers();
//       fetchIntervalRef.current = setInterval(fetchBallNumbers, 10000);
//       return () => {
//         if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current);
//       };
//     }
//   }, [electionId, isActive, fetchBallNumbers]);

//   const getRandomVoterId = useCallback(() => {
//     if (participants.length > 0) {
//       const idx = Math.floor(Math.random() * participants.length);
//       return participants[idx].padStart(displayDigits.length, '0');
//     }
//     const min = Math.pow(10, displayDigits.length - 1);
//     const max = Math.pow(10, displayDigits.length) - 1;
//     return String(Math.floor(min + Math.random() * (max - min)));
//   }, [participants, displayDigits.length]);

//   useEffect(() => {
//     if (!electionEndDate) return;

//     const updateCountdown = () => {
//       const now = new Date().getTime();
//       const end = new Date(electionEndDate).getTime();
//       const diff = Math.max(0, end - now);

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

//   const startContinuousSpinning = useCallback(() => {
//     setIsSpinning(true);
//     setSpinPhase('continuous');
//     setRandomOffsets(generateRandomOffsets());
    
//     displayIntervalRef.current = setInterval(() => {
//       const voterId = getRandomVoterId();
//       setDisplayDigits(voterId.split(''));
//     }, 150);
//   }, [getRandomVoterId, generateRandomOffsets]);

//   const stopContinuousSpinning = useCallback(() => {
//     if (displayIntervalRef.current) {
//       clearInterval(displayIntervalRef.current);
//       displayIntervalRef.current = null;
//     }
//     setIsSpinning(false);
//     setSpinPhase('stopped');
//   }, []);

//   useEffect(() => {
//     if (isActive && totalEntries >= 1 && !isElectionEnded && !revealingWinner) {
//       startContinuousSpinning();
//     } else if (isElectionEnded || revealingWinner) {
//       stopContinuousSpinning();
//     } else if (totalEntries < 1) {
//       stopContinuousSpinning();
//     }
    
//     return () => stopContinuousSpinning();
//   }, [isActive, totalEntries, isElectionEnded, revealingWinner, startContinuousSpinning, stopContinuousSpinning]);

//   useEffect(() => {
//     if (isElectionEnded && winners.length > 0 && revealedWinners.length === 0 && !revealingWinner) {
//       revealWinnersSequentially();
//     }
//   }, [isElectionEnded, winners, revealedWinners.length, revealingWinner]);

//   const revealSingleWinner = async (winnerIndex) => {
//     const FAST_PHASE_DURATION = 1000; // 1 second fast
//     const SLOW_PHASE_DURATION = 2500; // 2.5 seconds to slow down
    
//     // Generate random offsets for haphazard effect
//     setRandomOffsets(generateRandomOffsets());
    
//     // Fast phase - same speed, straight numbers
//     setIsSpinning(true);
//     setSpinPhase('fast');
//     setSlowdownProgress(0);
    
//     const fastInterval = setInterval(() => {
//       const voterId = getRandomVoterId();
//       setDisplayDigits(voterId.split(''));
//       // Update random offsets periodically for haphazard movement
//       setRandomOffsets(generateRandomOffsets());
//     }, 60);
    
//     await new Promise(resolve => setTimeout(resolve, FAST_PHASE_DURATION));
    
//     clearInterval(fastInterval);
    
//     // Slowing phase - digits at different vertical positions (haphazard)
//     setSpinPhase('slowing');
    
//     const slowdownStartTime = Date.now();
    
//     await new Promise(resolve => {
//       let lastUpdate = 0;
//       slowdownIntervalRef.current = setInterval(() => {
//         const elapsed = Date.now() - slowdownStartTime;
//         const progress = Math.min(elapsed / SLOW_PHASE_DURATION, 1);
//         setSlowdownProgress(progress);
        
//         // Update display less frequently as we slow down
//         const updateInterval = 60 + progress * 400;
//         if (elapsed - lastUpdate > updateInterval) {
//           const voterId = getRandomVoterId();
//           setDisplayDigits(voterId.split(''));
//           // Gradually reduce randomness of offsets as we slow down
//           const offsetScale = 1 - progress;
//           setRandomOffsets(prev => prev.map(() => 
//             -Math.floor(Math.random() * ((compact ? 65 : 110) * 0.6 * offsetScale))
//           ));
//           lastUpdate = elapsed;
//         }
        
//         if (progress >= 1) {
//           clearInterval(slowdownIntervalRef.current);
//           resolve();
//         }
//       }, 16);
//     });
    
//     // Stop - all digits align to center
//     setIsSpinning(false);
//     setSpinPhase('stopped');
//     setSlowdownProgress(0);
//     setRandomOffsets(displayDigits.map(() => 0)); // All aligned
    
//     await new Promise(resolve => setTimeout(resolve, 300));
    
//     // Show winner's number
//     const winner = winners[winnerIndex];
//     const winnerBallNumber = String(
//       winner.ball_number ||
//       winner.ballNumber ||
//       winner.oddjob_voter_id || 
//       winner.oddjobVoterId || 
//       winner.voterId ||
//       winner.voter_id ||
//       winner.id || 
//       '000000'
//     ).padStart(displayDigits.length, '0');
    
//     setDisplayDigits(winnerBallNumber.split(''));
    
//     return {
//       ...winner,
//       ballNumber: winnerBallNumber,
//       rank: winnerIndex + 1
//     };
//   };

//   const revealWinnersSequentially = async () => {
//     setRevealingWinner(true);
//     stopContinuousSpinning();
    
//     for (let i = 0; i < winners.length; i++) {
//       setCurrentRevealIndex(i);
      
//       const revealedWinner = await revealSingleWinner(i);
//       setRevealedWinners(prev => [...prev, revealedWinner]);
      
//       if (i < winners.length - 1) {
//         await new Promise(resolve => setTimeout(resolve, 2500));
//       }
//     }
    
//     setCurrentRevealIndex(-1);
//     setRevealingWinner(false);
//   };

//   const formatCountdown = () => {
//     // Show the election end date in DD/MM/YYYY format
//     if (!electionEndDate) return '--/--/----';
//     const endDate = new Date(electionEndDate);
//     const day = String(endDate.getDate()).padStart(2, '0');
//     const month = String(endDate.getMonth() + 1).padStart(2, '0');
//     const year = endDate.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   const getOrdinal = (n) => {
//     const s = ['th', 'st', 'nd', 'rd'];
//     const v = n % 100;
//     return n + (s[(v - 20) % 10] || s[v] || s[0]);
//   };

//   return (
//     <>
//       <div 
//         className={`rounded-xl overflow-hidden ${compact ? 'text-sm' : ''}`}
//         style={{
//           background: 'linear-gradient(180deg, #d4a418 0%, #c9972a 50%, #b8860b 100%)'
//         }}
//       >
//         {/* Header */}
//         <div 
//           className={`flex justify-between items-center ${compact ? 'px-3 py-2' : 'px-5 py-4'}`}
//           style={{ background: 'linear-gradient(180deg, #d4a418 0%, #c9972a 100%)' }}
//         >
//           <div className="flex items-center gap-2">
//             <span className={`text-gray-900 font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>
//               Date:
//             </span>
//             <div 
//               className={`rounded ${compact ? 'px-2 py-0.5' : 'px-3 py-1'}`}
//               style={{ background: '#1a1a1a', border: '2px solid #333' }}
//             >
//               <span 
//                 className={`font-bold ${compact ? 'text-sm' : 'text-lg'}`}
//                 style={{ 
//                   fontFamily: '"Courier New", monospace',
//                   color: '#00ff00',
//                   textShadow: '0 0 8px #00ff00, 0 0 12px #00ff00',
//                   letterSpacing: '1px'
//                 }}
//               >
//                 {formatCountdown()}
//               </span>
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             <span className={`text-gray-900 font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>
//               Lucky Voters No:
//             </span>
//             <div 
//               className={`rounded ${compact ? 'px-2 py-0.5' : 'px-3 py-1'}`}
//               style={{ background: '#1a1a1a', border: '2px solid #333' }}
//             >
//               <span 
//                 className={`font-bold ${compact ? 'text-sm' : 'text-lg'}`}
//                 style={{ 
//                   fontFamily: '"Courier New", monospace',
//                   color: '#00ff00',
//                   textShadow: '0 0 8px #00ff00, 0 0 12px #00ff00',
//                   letterSpacing: '2px'
//                 }}
//               >
//                 {String(actualLuckyVotersCount).padStart(2, '0')}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Main Display */}
//         <div 
//           className={`${compact ? 'px-3 py-4' : 'px-5 py-6'}`}
//           style={{ background: '#1a1a1a' }}
//         >
//           <div 
//             className={`flex justify-center items-center ${compact ? 'gap-1.5 p-3' : 'gap-2 p-4'}`}
//             style={{ 
//               border: compact ? '4px solid #1a1a1a' : '6px solid #1a1a1a',
//               borderRadius: '12px',
//               background: '#000000',
//               boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.8)'
//             }}
//           >
//             {displayDigits.map((digit, index) => (
//               <SpinningDigit
//                 key={`digit-${index}`}
//                 digit={digit}
//                 isSpinning={isSpinning}
//                 spinPhase={spinPhase}
//                 slowdownProgress={slowdownProgress}
//                 randomOffset={randomOffsets[index] || 0}
//                 compact={compact}
//               />
//             ))}
//           </div>
//         </div>

//         {/* Winners */}
//         {revealedWinners.length > 0 && (
//           <div 
//             className={`border-t-2 border-yellow-600 ${compact ? 'px-2 py-2' : 'px-4 py-4'}`}
//             style={{ background: 'linear-gradient(180deg, #c9972a 0%, #b8860b 100%)' }}
//           >
//             <h3 className={`text-yellow-900 font-bold mb-2 text-center ${compact ? 'text-sm' : 'text-lg'}`}>
//               🏆 LUCKY VOTERS WINNERS 🏆
//             </h3>
            
//             <div className="space-y-1.5">
//               {revealedWinners.map((winner, index) => (
//                 <div 
//                   key={index}
//                   className={`bg-white rounded-lg flex items-center justify-between shadow-md ${compact ? 'px-2 py-1.5' : 'px-4 py-3'}`}
//                 >
//                   <div className="flex items-center gap-2">
//                     <div className={`bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 font-black rounded-full flex items-center justify-center shadow ${compact ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm'}`}>
//                       {getOrdinal(index + 1)}
//                     </div>
//                     <div>
//                       <p className={`font-bold text-gray-900 ${compact ? 'text-xs' : ''}`}>
//                         {winner.displayName || winner.username || winner.name || 'Lucky Voter'}
//                       </p>
//                       <p className={`text-gray-500 font-mono ${compact ? 'text-xs' : 'text-sm'}`}>
//                         Ball #: {winner.ballNumber}
//                       </p>
//                     </div>
//                   </div>
//                   <span className={compact ? 'text-xl' : 'text-3xl'}>🏆</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Footer */}
//         <div 
//           className={`border-t border-yellow-700 flex justify-between items-center ${compact ? 'px-2 py-1.5' : 'px-4 py-2'}`}
//           style={{ background: 'linear-gradient(180deg, #c9972a 0%, #b8860b 100%)' }}
//         >
//           <div className={`flex items-center gap-1.5 text-gray-900 ${compact ? 'text-xs' : ''}`}>
//             <Users className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
//             <span className={compact ? 'text-xs' : 'text-sm'}>
//               Total Entries: <strong>{totalEntries}</strong>
//             </span>
//           </div>
          
//           <div className="flex items-center gap-2">
//             {!isElectionEnded && totalEntries >= 1 && (
//               <button
//                 onClick={() => setShowDemoModal(true)}
//                 className={`flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white rounded transition ${compact ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xs'}`}
//               >
//                 <Eye className="w-3 h-3" />
//                 <span>Demo</span>
//               </button>
//             )}
            
//             <div className={`flex items-center gap-1.5 ${compact ? 'text-xs' : 'text-sm'} ${
//               isSpinning ? 'text-green-700' : isElectionEnded ? 'text-blue-700' : 'text-yellow-800'
//             }`}>
//               <span className={`rounded-full ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'} ${
//                 isSpinning ? 'bg-green-500 animate-pulse' : isElectionEnded ? 'bg-blue-500' : 'bg-yellow-600'
//               }`} />
//               <span className="font-semibold">
//                 {isSpinning ? 'SPINNING' : isElectionEnded ? 'COMPLETED' : 'WAITING'}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       <DemoWinnerReveal
//         isOpen={showDemoModal}
//         onClose={() => setShowDemoModal(false)}
//         realBallNumbers={participants}
//         realLuckyVotersCount={actualLuckyVotersCount}
//         realTotalEntries={totalEntries}
//         compact={compact}
//       />
//     </>
//   );
// }
// // src/components/Dashboard/Tabs/lotteryyy/LotterySlotMachine.jsx
// // 4D Slot Machine
// // DURING ELECTION: Continuous spinning showing actual voter IDs
// // AT ELECTION END: For each winner - Fast spin (1 sec) → Gradual slow with haphazard (up/down) → Stop aligned
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { Users, RefreshCw, Eye } from 'lucide-react';
// import DemoWinnerReveal from './DemoWinnerReveal';

// const LOTTERY_API_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api';

// // Spinning digit - haphazard = different vertical positions, disciplined = aligned center
// const SpinningDigit = ({ 
//   digit,
//   isSpinning,
//   spinPhase, // 'continuous' | 'fast' | 'slowing' | 'stopped'
//   slowdownProgress,
//   randomOffset = 0, // Each digit gets different random offset for haphazard effect
//   compact = false
// }) => {
//   const [currentDigit, setCurrentDigit] = useState(digit || '0');
//   const [nextDigit, setNextDigit] = useState('0');
//   const [offsetY, setOffsetY] = useState(0);
//   const animationRef = useRef(null);
//   const isSpinningRef = useRef(isSpinning);
//   const phaseRef = useRef(spinPhase);
//   const progressRef = useRef(slowdownProgress);
  
//   const digitHeight = compact ? 65 : 110;
//   const continuousSpeed = compact ? 12 : 18;
//   const fastSpeed = compact ? 25 : 40;
//   const minSpeed = compact ? 1 : 2;
  
//   useEffect(() => {
//     isSpinningRef.current = isSpinning;
//     phaseRef.current = spinPhase;
//     progressRef.current = slowdownProgress;
//   }, [isSpinning, spinPhase, slowdownProgress]);

//   useEffect(() => {
//     if (!isSpinning) {
//       setCurrentDigit(digit || '0');
//       setOffsetY(0);
//     }
//   }, [digit, isSpinning]);

//   useEffect(() => {
//     if (isSpinning) {
//       let offset = randomOffset; // Start at random position for haphazard
//       let currDigit = Math.floor(Math.random() * 10);
//       let nxtDigit = Math.floor(Math.random() * 10);
      
//       setCurrentDigit(String(currDigit));
//       setNextDigit(String(nxtDigit));
      
//       const animate = () => {
//         if (!isSpinningRef.current) return;
        
//         const phase = phaseRef.current;
//         const progress = progressRef.current;
        
//         let speed;
        
//         if (phase === 'continuous') {
//           speed = continuousSpeed;
//         } else if (phase === 'fast') {
//           speed = fastSpeed;
//         } else if (phase === 'slowing') {
//           // Gradually slow down
//           const easeProgress = 1 - Math.pow(1 - progress, 3);
//           speed = fastSpeed - (fastSpeed - minSpeed) * easeProgress;
          
//           if (speed <= minSpeed && progress >= 0.98) {
//             return;
//           }
//         } else {
//           return;
//         }
        
//         offset -= speed;
        
//         if (offset <= -digitHeight) {
//           offset = 0;
//           currDigit = nxtDigit;
//           nxtDigit = Math.floor(Math.random() * 10);
//           setCurrentDigit(String(currDigit));
//           setNextDigit(String(nxtDigit));
//         }
        
//         setOffsetY(offset);
//         animationRef.current = requestAnimationFrame(animate);
//       };
      
//       animationRef.current = requestAnimationFrame(animate);
      
//       return () => {
//         if (animationRef.current) cancelAnimationFrame(animationRef.current);
//       };
//     } else {
//       // When stopped, align to center (offset = 0)
//       setOffsetY(0);
//       setCurrentDigit(digit || '0');
//       if (animationRef.current) {
//         cancelAnimationFrame(animationRef.current);
//         animationRef.current = null;
//       }
//     }
//   }, [isSpinning, digit, digitHeight, continuousSpeed, fastSpeed, minSpeed, randomOffset]);

//   const fontSize = compact ? 'text-5xl' : 'text-7xl sm:text-8xl';
//   const containerWidth = compact ? 50 : 85;
//   const containerHeightVal = compact ? 65 : 110;

//   return (
//     <div 
//       className="relative overflow-hidden rounded-lg"
//       style={{
//         width: `${containerWidth}px`,
//         height: `${containerHeightVal}px`,
//         background: 'linear-gradient(180deg, #7f1d1d 0%, #991b1b 20%, #b91c1c 50%, #991b1b 80%, #7f1d1d 100%)',
//         boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.7), inset 0 -4px 20px rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.4)',
//         border: '3px solid #1f2937',
//         borderRadius: '8px'
//       }}
//     >
//       <div 
//         className="absolute w-full"
//         style={{ 
//           transform: `translateY(${offsetY}px)`,
//           transition: isSpinning ? 'none' : 'transform 0.4s ease-out'
//         }}
//       >
//         <div className="flex items-center justify-center" style={{ height: `${digitHeight}px` }}>
//           <span 
//             className={`font-black text-white ${fontSize}`}
//             style={{ 
//               fontFamily: 'Impact, "Arial Black", sans-serif',
//               textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
//             }}
//           >
//             {currentDigit}
//           </span>
//         </div>
//         <div className="flex items-center justify-center" style={{ height: `${digitHeight}px` }}>
//           <span 
//             className={`font-black text-white ${fontSize}`}
//             style={{ 
//               fontFamily: 'Impact, "Arial Black", sans-serif',
//               textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
//             }}
//           >
//             {nextDigit}
//           </span>
//         </div>
//       </div>
      
//       <div 
//         className="absolute top-0 left-0 right-0 pointer-events-none z-10"
//         style={{
//           height: '35%',
//           background: 'linear-gradient(to bottom, rgba(55,0,0,0.95) 0%, rgba(55,0,0,0.5) 50%, transparent 100%)'
//         }}
//       />
      
//       <div 
//         className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
//         style={{
//           height: '35%',
//           background: 'linear-gradient(to top, rgba(55,0,0,0.95) 0%, rgba(55,0,0,0.5) 50%, transparent 100%)'
//         }}
//       />
//     </div>
//   );
// };

// export default function LotterySlotMachine({ 
//   electionId,
//   electionEndDate,
//   luckyVotersCount = 1,
//   isElectionEnded = false,
//   winners = [],
//   isActive = true,
//   compact = false,
// }) {
//   const [displayDigits, setDisplayDigits] = useState(['0', '0', '0', '0', '0', '0']);
//   const [isSpinning, setIsSpinning] = useState(false);
//   const [spinPhase, setSpinPhase] = useState('stopped');
//   const [slowdownProgress, setSlowdownProgress] = useState(0);
//   const [randomOffsets, setRandomOffsets] = useState([0, 0, 0, 0, 0, 0]);
//   /*eslint-disable*/
//   const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
//   const [revealedWinners, setRevealedWinners] = useState([]);
//   const [currentRevealIndex, setCurrentRevealIndex] = useState(-1);
//   const [revealingWinner, setRevealingWinner] = useState(false);
  
//   const [participants, setParticipants] = useState([]);
//   const [totalEntries, setTotalEntries] = useState(0);
//   const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
//   const [fetchError, setFetchError] = useState(null);
//   const [actualLuckyVotersCount, setActualLuckyVotersCount] = useState(luckyVotersCount);
  
//   const [showDemoModal, setShowDemoModal] = useState(false);
  
//   const fetchIntervalRef = useRef(null);
//   const displayIntervalRef = useRef(null);
//   const slowdownIntervalRef = useRef(null);

//   // Generate random offsets for haphazard effect (different Y position for each digit)
//   const generateRandomOffsets = useCallback(() => {
//     const digitHeight = compact ? 65 : 110;
//     return displayDigits.map(() => -Math.floor(Math.random() * (digitHeight * 0.6)));
//   }, [displayDigits.length, compact]);

//   const fetchBallNumbers = useCallback(async () => {
//     if (!electionId) return;
    
//     try {
//       setIsLoadingParticipants(true);
//       setFetchError(null);
      
//       const response = await fetch(
//         `${LOTTERY_API_URL}/lottery/elections/${electionId}/ball-numbers`
//       );
      
//       if (!response.ok) throw new Error(`Failed: ${response.status}`);
      
//       const data = await response.json();
//       console.log('🎰 Ball numbers fetched:', data);
      
//       const ballNumbers = [];
//       const nums = data.ballNumbers || data.ball_numbers || [];
//       nums.forEach(ballNum => {
//         if (ballNum) ballNumbers.push(String(ballNum));
//       });
      
//       setParticipants(ballNumbers);
//       setTotalEntries(data.totalParticipants || data.total_participants || ballNumbers.length);
      
//       if (data.luckyVotersCount || data.lucky_voters_count) {
//         setActualLuckyVotersCount(data.luckyVotersCount || data.lucky_voters_count);
//       }
      
//       if (ballNumbers.length > 0) {
//         const maxDigits = Math.max(...ballNumbers.map(b => b.length));
//         if (maxDigits !== displayDigits.length) {
//           setDisplayDigits(Array(maxDigits).fill('0'));
//           setRandomOffsets(Array(maxDigits).fill(0));
//         }
//       }
//     } catch (error) {
//       console.error('❌ Error:', error);
//       setFetchError(error.message);
//     } finally {
//       setIsLoadingParticipants(false);
//     }
//   }, [electionId, displayDigits.length]);

//   useEffect(() => {
//     if (electionId && isActive) {
//       fetchBallNumbers();
//       fetchIntervalRef.current = setInterval(fetchBallNumbers, 10000);
//       return () => {
//         if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current);
//       };
//     }
//   }, [electionId, isActive, fetchBallNumbers]);

//   const getRandomVoterId = useCallback(() => {
//     if (participants.length > 0) {
//       const idx = Math.floor(Math.random() * participants.length);
//       return participants[idx].padStart(displayDigits.length, '0');
//     }
//     const min = Math.pow(10, displayDigits.length - 1);
//     const max = Math.pow(10, displayDigits.length) - 1;
//     return String(Math.floor(min + Math.random() * (max - min)));
//   }, [participants, displayDigits.length]);

//   useEffect(() => {
//     if (!electionEndDate) return;

//     const updateCountdown = () => {
//       const now = new Date().getTime();
//       const end = new Date(electionEndDate).getTime();
//       const diff = Math.max(0, end - now);

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

//   const startContinuousSpinning = useCallback(() => {
//     setIsSpinning(true);
//     setSpinPhase('continuous');
//     setRandomOffsets(generateRandomOffsets());
    
//     displayIntervalRef.current = setInterval(() => {
//       const voterId = getRandomVoterId();
//       setDisplayDigits(voterId.split(''));
//     }, 150);
//   }, [getRandomVoterId, generateRandomOffsets]);

//   const stopContinuousSpinning = useCallback(() => {
//     if (displayIntervalRef.current) {
//       clearInterval(displayIntervalRef.current);
//       displayIntervalRef.current = null;
//     }
//     setIsSpinning(false);
//     setSpinPhase('stopped');
//   }, []);

//   useEffect(() => {
//     if (isActive && totalEntries >= 1 && !isElectionEnded && !revealingWinner) {
//       startContinuousSpinning();
//     } else if (isElectionEnded || revealingWinner) {
//       stopContinuousSpinning();
//     } else if (totalEntries < 1) {
//       stopContinuousSpinning();
//     }
    
//     return () => stopContinuousSpinning();
//   }, [isActive, totalEntries, isElectionEnded, revealingWinner, startContinuousSpinning, stopContinuousSpinning]);

//   useEffect(() => {
//     if (isElectionEnded && winners.length > 0 && revealedWinners.length === 0 && !revealingWinner) {
//       revealWinnersSequentially();
//     }
//   }, [isElectionEnded, winners, revealedWinners.length, revealingWinner]);

//   const revealSingleWinner = async (winnerIndex) => {
//     const FAST_PHASE_DURATION = 1000; // 1 second fast
//     const SLOW_PHASE_DURATION = 2500; // 2.5 seconds to slow down
    
//     // Generate random offsets for haphazard effect
//     setRandomOffsets(generateRandomOffsets());
    
//     // Fast phase - same speed, straight numbers
//     setIsSpinning(true);
//     setSpinPhase('fast');
//     setSlowdownProgress(0);
    
//     const fastInterval = setInterval(() => {
//       const voterId = getRandomVoterId();
//       setDisplayDigits(voterId.split(''));
//       // Update random offsets periodically for haphazard movement
//       setRandomOffsets(generateRandomOffsets());
//     }, 60);
    
//     await new Promise(resolve => setTimeout(resolve, FAST_PHASE_DURATION));
    
//     clearInterval(fastInterval);
    
//     // Slowing phase - digits at different vertical positions (haphazard)
//     setSpinPhase('slowing');
    
//     const slowdownStartTime = Date.now();
    
//     await new Promise(resolve => {
//       let lastUpdate = 0;
//       slowdownIntervalRef.current = setInterval(() => {
//         const elapsed = Date.now() - slowdownStartTime;
//         const progress = Math.min(elapsed / SLOW_PHASE_DURATION, 1);
//         setSlowdownProgress(progress);
        
//         // Update display less frequently as we slow down
//         const updateInterval = 60 + progress * 400;
//         if (elapsed - lastUpdate > updateInterval) {
//           const voterId = getRandomVoterId();
//           setDisplayDigits(voterId.split(''));
//           // Gradually reduce randomness of offsets as we slow down
//           const offsetScale = 1 - progress;
//           setRandomOffsets(prev => prev.map(() => 
//             -Math.floor(Math.random() * ((compact ? 65 : 110) * 0.6 * offsetScale))
//           ));
//           lastUpdate = elapsed;
//         }
        
//         if (progress >= 1) {
//           clearInterval(slowdownIntervalRef.current);
//           resolve();
//         }
//       }, 16);
//     });
    
//     // Stop - all digits align to center
//     setIsSpinning(false);
//     setSpinPhase('stopped');
//     setSlowdownProgress(0);
//     setRandomOffsets(displayDigits.map(() => 0)); // All aligned
    
//     await new Promise(resolve => setTimeout(resolve, 300));
    
//     // Show winner's number
//     const winner = winners[winnerIndex];
//     const winnerBallNumber = String(
//       winner.ball_number ||
//       winner.ballNumber ||
//       winner.oddjob_voter_id || 
//       winner.oddjobVoterId || 
//       winner.voterId ||
//       winner.voter_id ||
//       winner.id || 
//       '000000'
//     ).padStart(displayDigits.length, '0');
    
//     setDisplayDigits(winnerBallNumber.split(''));
    
//     return {
//       ...winner,
//       ballNumber: winnerBallNumber,
//       rank: winnerIndex + 1
//     };
//   };

//   const revealWinnersSequentially = async () => {
//     setRevealingWinner(true);
//     stopContinuousSpinning();
    
//     for (let i = 0; i < winners.length; i++) {
//       setCurrentRevealIndex(i);
      
//       const revealedWinner = await revealSingleWinner(i);
//       setRevealedWinners(prev => [...prev, revealedWinner]);
      
//       if (i < winners.length - 1) {
//         await new Promise(resolve => setTimeout(resolve, 2500));
//       }
//     }
    
//     setCurrentRevealIndex(-1);
//     setRevealingWinner(false);
//   };

//   const formatCountdown = () => {
//     // Show the election end date in DD/MM/YYYY format
//     if (!electionEndDate) return '--/--/----';
//     const endDate = new Date(electionEndDate);
//     const day = String(endDate.getDate()).padStart(2, '0');
//     const month = String(endDate.getMonth() + 1).padStart(2, '0');
//     const year = endDate.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   const getOrdinal = (n) => {
//     const s = ['th', 'st', 'nd', 'rd'];
//     const v = n % 100;
//     return n + (s[(v - 20) % 10] || s[v] || s[0]);
//   };

//   return (
//     <>
//       <div 
//         className={`rounded-xl overflow-hidden ${compact ? 'text-sm' : ''}`}
//         style={{
//           background: 'linear-gradient(180deg, #d4a418 0%, #c9972a 50%, #b8860b 100%)'
//         }}
//       >
//         {/* Header */}
//         <div 
//           className={`flex justify-between items-center ${compact ? 'px-3 py-2' : 'px-5 py-4'}`}
//           style={{ background: 'linear-gradient(180deg, #d4a418 0%, #c9972a 100%)' }}
//         >
//           <div className="flex items-center gap-2">
//             <span className={`text-gray-900 font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>
//               Date:
//             </span>
//             <div 
//               className={`rounded ${compact ? 'px-2 py-0.5' : 'px-3 py-1'}`}
//               style={{ background: '#1a1a1a', border: '2px solid #333' }}
//             >
//               <span 
//                 className={`font-bold ${compact ? 'text-sm' : 'text-lg'}`}
//                 style={{ 
//                   fontFamily: '"Courier New", monospace',
//                   color: '#00ff00',
//                   textShadow: '0 0 8px #00ff00, 0 0 12px #00ff00',
//                   letterSpacing: '1px'
//                 }}
//               >
//                 {formatCountdown()}
//               </span>
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             <span className={`text-gray-900 font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>
//               Lucky Voters No:
//             </span>
//             <div 
//               className={`rounded ${compact ? 'px-2 py-0.5' : 'px-3 py-1'}`}
//               style={{ background: '#1a1a1a', border: '2px solid #333' }}
//             >
//               <span 
//                 className={`font-bold ${compact ? 'text-sm' : 'text-lg'}`}
//                 style={{ 
//                   fontFamily: '"Courier New", monospace',
//                   color: '#00ff00',
//                   textShadow: '0 0 8px #00ff00, 0 0 12px #00ff00',
//                   letterSpacing: '2px'
//                 }}
//               >
//                 {String(actualLuckyVotersCount).padStart(2, '0')}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Main Display */}
//         <div 
//           className={`${compact ? 'px-3 py-4' : 'px-5 py-6'}`}
//           style={{ background: '#1a1a1a' }}
//         >
//           <div 
//             className={`flex justify-center items-center ${compact ? 'gap-1.5 p-2' : 'gap-2 p-3'}`}
//             style={{ 
//               border: compact ? '3px solid #1f2937' : '4px solid #1f2937',
//               borderRadius: '8px',
//               background: '#0a0a0a'
//             }}
//           >
//             {displayDigits.map((digit, index) => (
//               <SpinningDigit
//                 key={`digit-${index}`}
//                 digit={digit}
//                 isSpinning={isSpinning}
//                 spinPhase={spinPhase}
//                 slowdownProgress={slowdownProgress}
//                 randomOffset={randomOffsets[index] || 0}
//                 compact={compact}
//               />
//             ))}
//           </div>
//         </div>

//         {/* Winners */}
//         {revealedWinners.length > 0 && (
//           <div 
//             className={`border-t-2 border-yellow-600 ${compact ? 'px-2 py-2' : 'px-4 py-4'}`}
//             style={{ background: 'linear-gradient(180deg, #c9972a 0%, #b8860b 100%)' }}
//           >
//             <h3 className={`text-yellow-900 font-bold mb-2 text-center ${compact ? 'text-sm' : 'text-lg'}`}>
//               🏆 LUCKY VOTERS WINNERS 🏆
//             </h3>
            
//             <div className="space-y-1.5">
//               {revealedWinners.map((winner, index) => (
//                 <div 
//                   key={index}
//                   className={`bg-white rounded-lg flex items-center justify-between shadow-md ${compact ? 'px-2 py-1.5' : 'px-4 py-3'}`}
//                 >
//                   <div className="flex items-center gap-2">
//                     <div className={`bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 font-black rounded-full flex items-center justify-center shadow ${compact ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm'}`}>
//                       {getOrdinal(index + 1)}
//                     </div>
//                     <div>
//                       <p className={`font-bold text-gray-900 ${compact ? 'text-xs' : ''}`}>
//                         {winner.displayName || winner.username || winner.name || 'Lucky Voter'}
//                       </p>
//                       <p className={`text-gray-500 font-mono ${compact ? 'text-xs' : 'text-sm'}`}>
//                         Ball #: {winner.ballNumber}
//                       </p>
//                     </div>
//                   </div>
//                   <span className={compact ? 'text-xl' : 'text-3xl'}>🏆</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Footer */}
//         <div 
//           className={`border-t border-yellow-700 flex justify-between items-center ${compact ? 'px-2 py-1.5' : 'px-4 py-2'}`}
//           style={{ background: 'linear-gradient(180deg, #c9972a 0%, #b8860b 100%)' }}
//         >
//           <div className={`flex items-center gap-1.5 text-gray-900 ${compact ? 'text-xs' : ''}`}>
//             <Users className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
//             <span className={compact ? 'text-xs' : 'text-sm'}>
//               Total Entries: <strong>{totalEntries}</strong>
//             </span>
//           </div>
          
//           <div className="flex items-center gap-2">
//             {!isElectionEnded && totalEntries >= 1 && (
//               <button
//                 onClick={() => setShowDemoModal(true)}
//                 className={`flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white rounded transition ${compact ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xs'}`}
//               >
//                 <Eye className="w-3 h-3" />
//                 <span>Demo</span>
//               </button>
//             )}
            
//             <div className={`flex items-center gap-1.5 ${compact ? 'text-xs' : 'text-sm'} ${
//               isSpinning ? 'text-green-700' : isElectionEnded ? 'text-blue-700' : 'text-yellow-800'
//             }`}>
//               <span className={`rounded-full ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'} ${
//                 isSpinning ? 'bg-green-500 animate-pulse' : isElectionEnded ? 'bg-blue-500' : 'bg-yellow-600'
//               }`} />
//               <span className="font-semibold">
//                 {isSpinning ? 'SPINNING' : isElectionEnded ? 'COMPLETED' : 'WAITING'}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       <DemoWinnerReveal
//         isOpen={showDemoModal}
//         onClose={() => setShowDemoModal(false)}
//         realBallNumbers={participants}
//         realLuckyVotersCount={actualLuckyVotersCount}
//         realTotalEntries={totalEntries}
//         compact={compact}
//       />
//     </>
//   );
// }
//last workable code only to add thick border above code
// // src/components/Dashboard/Tabs/lotteryyy/LotterySlotMachine.jsx
// // 4D Slot Machine
// // DURING ELECTION: Continuous spinning showing actual voter IDs
// // AT ELECTION END: For each winner - Fast spin (1 sec) → Gradual slow with haphazard (up/down) → Stop aligned
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { Users, RefreshCw, Eye } from 'lucide-react';
// import DemoWinnerReveal from './DemoWinnerReveal';

// const LOTTERY_API_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api';

// // Spinning digit - haphazard = different vertical positions, disciplined = aligned center
// const SpinningDigit = ({ 
//   digit,
//   isSpinning,
//   spinPhase, // 'continuous' | 'fast' | 'slowing' | 'stopped'
//   slowdownProgress,
//   randomOffset = 0, // Each digit gets different random offset for haphazard effect
//   compact = false
// }) => {
//   const [currentDigit, setCurrentDigit] = useState(digit || '0');
//   const [nextDigit, setNextDigit] = useState('0');
//   const [offsetY, setOffsetY] = useState(0);
//   const animationRef = useRef(null);
//   const isSpinningRef = useRef(isSpinning);
//   const phaseRef = useRef(spinPhase);
//   const progressRef = useRef(slowdownProgress);
  
//   const digitHeight = compact ? 65 : 110;
//   const continuousSpeed = compact ? 12 : 18;
//   const fastSpeed = compact ? 25 : 40;
//   const minSpeed = compact ? 1 : 2;
  
//   useEffect(() => {
//     isSpinningRef.current = isSpinning;
//     phaseRef.current = spinPhase;
//     progressRef.current = slowdownProgress;
//   }, [isSpinning, spinPhase, slowdownProgress]);

//   useEffect(() => {
//     if (!isSpinning) {
//       setCurrentDigit(digit || '0');
//       setOffsetY(0);
//     }
//   }, [digit, isSpinning]);

//   useEffect(() => {
//     if (isSpinning) {
//       let offset = randomOffset; // Start at random position for haphazard
//       let currDigit = Math.floor(Math.random() * 10);
//       let nxtDigit = Math.floor(Math.random() * 10);
      
//       setCurrentDigit(String(currDigit));
//       setNextDigit(String(nxtDigit));
      
//       const animate = () => {
//         if (!isSpinningRef.current) return;
        
//         const phase = phaseRef.current;
//         const progress = progressRef.current;
        
//         let speed;
        
//         if (phase === 'continuous') {
//           speed = continuousSpeed;
//         } else if (phase === 'fast') {
//           speed = fastSpeed;
//         } else if (phase === 'slowing') {
//           // Gradually slow down
//           const easeProgress = 1 - Math.pow(1 - progress, 3);
//           speed = fastSpeed - (fastSpeed - minSpeed) * easeProgress;
          
//           if (speed <= minSpeed && progress >= 0.98) {
//             return;
//           }
//         } else {
//           return;
//         }
        
//         offset -= speed;
        
//         if (offset <= -digitHeight) {
//           offset = 0;
//           currDigit = nxtDigit;
//           nxtDigit = Math.floor(Math.random() * 10);
//           setCurrentDigit(String(currDigit));
//           setNextDigit(String(nxtDigit));
//         }
        
//         setOffsetY(offset);
//         animationRef.current = requestAnimationFrame(animate);
//       };
      
//       animationRef.current = requestAnimationFrame(animate);
      
//       return () => {
//         if (animationRef.current) cancelAnimationFrame(animationRef.current);
//       };
//     } else {
//       // When stopped, align to center (offset = 0)
//       setOffsetY(0);
//       setCurrentDigit(digit || '0');
//       if (animationRef.current) {
//         cancelAnimationFrame(animationRef.current);
//         animationRef.current = null;
//       }
//     }
//   }, [isSpinning, digit, digitHeight, continuousSpeed, fastSpeed, minSpeed, randomOffset]);

//   const fontSize = compact ? 'text-5xl' : 'text-7xl sm:text-8xl';
//   const containerWidth = compact ? 50 : 85;
//   const containerHeightVal = compact ? 65 : 110;

//   return (
//     <div 
//       className="relative overflow-hidden rounded-lg"
//       style={{
//         width: `${containerWidth}px`,
//         height: `${containerHeightVal}px`,
//         background: 'linear-gradient(180deg, #7f1d1d 0%, #991b1b 20%, #b91c1c 50%, #991b1b 80%, #7f1d1d 100%)',
//         boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.7), inset 0 -4px 20px rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.4)',
//         border: '3px solid #1f2937',
//         borderRadius: '8px'
//       }}
//     >
//       <div 
//         className="absolute w-full"
//         style={{ 
//           transform: `translateY(${offsetY}px)`,
//           transition: isSpinning ? 'none' : 'transform 0.4s ease-out'
//         }}
//       >
//         <div className="flex items-center justify-center" style={{ height: `${digitHeight}px` }}>
//           <span 
//             className={`font-black text-white ${fontSize}`}
//             style={{ 
//               fontFamily: 'Impact, "Arial Black", sans-serif',
//               textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
//             }}
//           >
//             {currentDigit}
//           </span>
//         </div>
//         <div className="flex items-center justify-center" style={{ height: `${digitHeight}px` }}>
//           <span 
//             className={`font-black text-white ${fontSize}`}
//             style={{ 
//               fontFamily: 'Impact, "Arial Black", sans-serif',
//               textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
//             }}
//           >
//             {nextDigit}
//           </span>
//         </div>
//       </div>
      
//       <div 
//         className="absolute top-0 left-0 right-0 pointer-events-none z-10"
//         style={{
//           height: '35%',
//           background: 'linear-gradient(to bottom, rgba(55,0,0,0.95) 0%, rgba(55,0,0,0.5) 50%, transparent 100%)'
//         }}
//       />
      
//       <div 
//         className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
//         style={{
//           height: '35%',
//           background: 'linear-gradient(to top, rgba(55,0,0,0.95) 0%, rgba(55,0,0,0.5) 50%, transparent 100%)'
//         }}
//       />
//     </div>
//   );
// };

// export default function LotterySlotMachine({ 
//   electionId,
//   electionEndDate,
//   luckyVotersCount = 1,
//   isElectionEnded = false,
//   winners = [],
//   isActive = true,
//   compact = false,
// }) {
//   const [displayDigits, setDisplayDigits] = useState(['0', '0', '0', '0', '0', '0']);
//   const [isSpinning, setIsSpinning] = useState(false);
//   const [spinPhase, setSpinPhase] = useState('stopped');
//   const [slowdownProgress, setSlowdownProgress] = useState(0);
//   /*eslint-disable*/
//   const [randomOffsets, setRandomOffsets] = useState([0, 0, 0, 0, 0, 0]);
//   const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
//   const [revealedWinners, setRevealedWinners] = useState([]);
//   const [currentRevealIndex, setCurrentRevealIndex] = useState(-1);
//   const [revealingWinner, setRevealingWinner] = useState(false);
  
//   const [participants, setParticipants] = useState([]);
//   const [totalEntries, setTotalEntries] = useState(0);
//   const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
//   const [fetchError, setFetchError] = useState(null);
//   const [actualLuckyVotersCount, setActualLuckyVotersCount] = useState(luckyVotersCount);
  
//   const [showDemoModal, setShowDemoModal] = useState(false);
  
//   const fetchIntervalRef = useRef(null);
//   const displayIntervalRef = useRef(null);
//   const slowdownIntervalRef = useRef(null);

//   // Generate random offsets for haphazard effect (different Y position for each digit)
//   const generateRandomOffsets = useCallback(() => {
//     const digitHeight = compact ? 65 : 110;
//     return displayDigits.map(() => -Math.floor(Math.random() * (digitHeight * 0.6)));
//   }, [displayDigits.length, compact]);

//   const fetchBallNumbers = useCallback(async () => {
//     if (!electionId) return;
    
//     try {
//       setIsLoadingParticipants(true);
//       setFetchError(null);
      
//       const response = await fetch(
//         `${LOTTERY_API_URL}/lottery/elections/${electionId}/ball-numbers`
//       );
      
//       if (!response.ok) throw new Error(`Failed: ${response.status}`);
      
//       const data = await response.json();
//       console.log('🎰 Ball numbers fetched:', data);
      
//       const ballNumbers = [];
//       const nums = data.ballNumbers || data.ball_numbers || [];
//       nums.forEach(ballNum => {
//         if (ballNum) ballNumbers.push(String(ballNum));
//       });
      
//       setParticipants(ballNumbers);
//       setTotalEntries(data.totalParticipants || data.total_participants || ballNumbers.length);
      
//       if (data.luckyVotersCount || data.lucky_voters_count) {
//         setActualLuckyVotersCount(data.luckyVotersCount || data.lucky_voters_count);
//       }
      
//       if (ballNumbers.length > 0) {
//         const maxDigits = Math.max(...ballNumbers.map(b => b.length));
//         if (maxDigits !== displayDigits.length) {
//           setDisplayDigits(Array(maxDigits).fill('0'));
//           setRandomOffsets(Array(maxDigits).fill(0));
//         }
//       }
//     } catch (error) {
//       console.error('❌ Error:', error);
//       setFetchError(error.message);
//     } finally {
//       setIsLoadingParticipants(false);
//     }
//   }, [electionId, displayDigits.length]);

//   useEffect(() => {
//     if (electionId && isActive) {
//       fetchBallNumbers();
//       fetchIntervalRef.current = setInterval(fetchBallNumbers, 10000);
//       return () => {
//         if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current);
//       };
//     }
//   }, [electionId, isActive, fetchBallNumbers]);

//   const getRandomVoterId = useCallback(() => {
//     if (participants.length > 0) {
//       const idx = Math.floor(Math.random() * participants.length);
//       return participants[idx].padStart(displayDigits.length, '0');
//     }
//     const min = Math.pow(10, displayDigits.length - 1);
//     const max = Math.pow(10, displayDigits.length) - 1;
//     return String(Math.floor(min + Math.random() * (max - min)));
//   }, [participants, displayDigits.length]);

//   useEffect(() => {
//     if (!electionEndDate) return;

//     const updateCountdown = () => {
//       const now = new Date().getTime();
//       const end = new Date(electionEndDate).getTime();
//       const diff = Math.max(0, end - now);

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

//   const startContinuousSpinning = useCallback(() => {
//     setIsSpinning(true);
//     setSpinPhase('continuous');
//     setRandomOffsets(generateRandomOffsets());
    
//     displayIntervalRef.current = setInterval(() => {
//       const voterId = getRandomVoterId();
//       setDisplayDigits(voterId.split(''));
//     }, 150);
//   }, [getRandomVoterId, generateRandomOffsets]);

//   const stopContinuousSpinning = useCallback(() => {
//     if (displayIntervalRef.current) {
//       clearInterval(displayIntervalRef.current);
//       displayIntervalRef.current = null;
//     }
//     setIsSpinning(false);
//     setSpinPhase('stopped');
//   }, []);

//   useEffect(() => {
//     if (isActive && totalEntries >= 1 && !isElectionEnded && !revealingWinner) {
//       startContinuousSpinning();
//     } else if (isElectionEnded || revealingWinner) {
//       stopContinuousSpinning();
//     } else if (totalEntries < 1) {
//       stopContinuousSpinning();
//     }
    
//     return () => stopContinuousSpinning();
//   }, [isActive, totalEntries, isElectionEnded, revealingWinner, startContinuousSpinning, stopContinuousSpinning]);

//   useEffect(() => {
//     if (isElectionEnded && winners.length > 0 && revealedWinners.length === 0 && !revealingWinner) {
//       revealWinnersSequentially();
//     }
//   }, [isElectionEnded, winners, revealedWinners.length, revealingWinner]);

//   const revealSingleWinner = async (winnerIndex) => {
//     const FAST_PHASE_DURATION = 1000; // 1 second fast
//     const SLOW_PHASE_DURATION = 2500; // 2.5 seconds to slow down
    
//     // Generate random offsets for haphazard effect
//     setRandomOffsets(generateRandomOffsets());
    
//     // Fast phase - same speed, straight numbers
//     setIsSpinning(true);
//     setSpinPhase('fast');
//     setSlowdownProgress(0);
    
//     const fastInterval = setInterval(() => {
//       const voterId = getRandomVoterId();
//       setDisplayDigits(voterId.split(''));
//       // Update random offsets periodically for haphazard movement
//       setRandomOffsets(generateRandomOffsets());
//     }, 60);
    
//     await new Promise(resolve => setTimeout(resolve, FAST_PHASE_DURATION));
    
//     clearInterval(fastInterval);
    
//     // Slowing phase - digits at different vertical positions (haphazard)
//     setSpinPhase('slowing');
    
//     const slowdownStartTime = Date.now();
    
//     await new Promise(resolve => {
//       let lastUpdate = 0;
//       slowdownIntervalRef.current = setInterval(() => {
//         const elapsed = Date.now() - slowdownStartTime;
//         const progress = Math.min(elapsed / SLOW_PHASE_DURATION, 1);
//         setSlowdownProgress(progress);
        
//         // Update display less frequently as we slow down
//         const updateInterval = 60 + progress * 400;
//         if (elapsed - lastUpdate > updateInterval) {
//           const voterId = getRandomVoterId();
//           setDisplayDigits(voterId.split(''));
//           // Gradually reduce randomness of offsets as we slow down
//           const offsetScale = 1 - progress;
//           setRandomOffsets(prev => prev.map(() => 
//             -Math.floor(Math.random() * ((compact ? 65 : 110) * 0.6 * offsetScale))
//           ));
//           lastUpdate = elapsed;
//         }
        
//         if (progress >= 1) {
//           clearInterval(slowdownIntervalRef.current);
//           resolve();
//         }
//       }, 16);
//     });
    
//     // Stop - all digits align to center
//     setIsSpinning(false);
//     setSpinPhase('stopped');
//     setSlowdownProgress(0);
//     setRandomOffsets(displayDigits.map(() => 0)); // All aligned
    
//     await new Promise(resolve => setTimeout(resolve, 300));
    
//     // Show winner's number
//     const winner = winners[winnerIndex];
//     const winnerBallNumber = String(
//       winner.ball_number ||
//       winner.ballNumber ||
//       winner.oddjob_voter_id || 
//       winner.oddjobVoterId || 
//       winner.voterId ||
//       winner.voter_id ||
//       winner.id || 
//       '000000'
//     ).padStart(displayDigits.length, '0');
    
//     setDisplayDigits(winnerBallNumber.split(''));
    
//     return {
//       ...winner,
//       ballNumber: winnerBallNumber,
//       rank: winnerIndex + 1
//     };
//   };

//   const revealWinnersSequentially = async () => {
//     setRevealingWinner(true);
//     stopContinuousSpinning();
    
//     for (let i = 0; i < winners.length; i++) {
//       setCurrentRevealIndex(i);
      
//       const revealedWinner = await revealSingleWinner(i);
//       setRevealedWinners(prev => [...prev, revealedWinner]);
      
//       if (i < winners.length - 1) {
//         await new Promise(resolve => setTimeout(resolve, 2500));
//       }
//     }
    
//     setCurrentRevealIndex(-1);
//     setRevealingWinner(false);
//   };

//   const formatCountdown = () => {
//     // Show the election end date in DD/MM/YYYY format
//     if (!electionEndDate) return '--/--/----';
//     const endDate = new Date(electionEndDate);
//     const day = String(endDate.getDate()).padStart(2, '0');
//     const month = String(endDate.getMonth() + 1).padStart(2, '0');
//     const year = endDate.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   const getOrdinal = (n) => {
//     const s = ['th', 'st', 'nd', 'rd'];
//     const v = n % 100;
//     return n + (s[(v - 20) % 10] || s[v] || s[0]);
//   };

//   return (
//     <>
//       <div 
//         className={`rounded-xl shadow-2xl overflow-hidden ${compact ? 'text-sm' : ''}`}
//         style={{
//           background: 'linear-gradient(180deg, #d4a418 0%, #c9972a 50%, #b8860b 100%)',
//           boxShadow: '0 10px 40px rgba(0,0,0,0.4)'
//         }}
//       >
//         {/* Header */}
//         <div 
//           className={`flex justify-between items-center ${compact ? 'px-3 py-2' : 'px-5 py-4'}`}
//           style={{ background: 'linear-gradient(180deg, #d4a418 0%, #c9972a 100%)' }}
//         >
//           <div className="flex items-center gap-2">
//             <span className={`text-gray-900 font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>
//               Date:
//             </span>
//             <div 
//               className={`rounded ${compact ? 'px-2 py-0.5' : 'px-3 py-1'}`}
//               style={{ background: '#1a1a1a', border: '2px solid #333' }}
//             >
//               <span 
//                 className={`font-bold ${compact ? 'text-sm' : 'text-lg'}`}
//                 style={{ 
//                   fontFamily: '"Courier New", monospace',
//                   color: '#00ff00',
//                   textShadow: '0 0 8px #00ff00, 0 0 12px #00ff00',
//                   letterSpacing: '1px'
//                 }}
//               >
//                 {formatCountdown()}
//               </span>
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             <span className={`text-gray-900 font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>
//               Lucky Voters No:
//             </span>
//             <div 
//               className={`rounded ${compact ? 'px-2 py-0.5' : 'px-3 py-1'}`}
//               style={{ background: '#1a1a1a', border: '2px solid #333' }}
//             >
//               <span 
//                 className={`font-bold ${compact ? 'text-sm' : 'text-lg'}`}
//                 style={{ 
//                   fontFamily: '"Courier New", monospace',
//                   color: '#00ff00',
//                   textShadow: '0 0 8px #00ff00, 0 0 12px #00ff00',
//                   letterSpacing: '2px'
//                 }}
//               >
//                 {String(actualLuckyVotersCount).padStart(2, '0')}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Main Display */}
//         <div 
//           className={`${compact ? 'px-3 py-4' : 'px-5 py-6'}`}
//           style={{ background: '#1a1a1a' }}
//         >
//           <div className={`flex justify-center items-center ${compact ? 'gap-1.5 mb-3' : 'gap-2 mb-4'}`}>
//             {displayDigits.map((digit, index) => (
//               <SpinningDigit
//                 key={`digit-${index}`}
//                 digit={digit}
//                 isSpinning={isSpinning}
//                 spinPhase={spinPhase}
//                 slowdownProgress={slowdownProgress}
//                 randomOffset={randomOffsets[index] || 0}
//                 compact={compact}
//               />
//             ))}
//           </div>

//           {/* Status */}
//           <div className="text-center mt-3">
//             {!isElectionEnded && totalEntries < 1 && (
//               <div className={`inline-flex items-center gap-1.5 bg-yellow-500/20 border border-yellow-500 rounded-full ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <span className={`text-yellow-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
//                   ⏳ Waiting for voters... ({totalEntries}/1)
//                 </span>
//               </div>
//             )}

//             {!isElectionEnded && totalEntries >= 1 && isSpinning && spinPhase === 'continuous' && (
//               <div className={`inline-flex items-center gap-1.5 bg-green-500/20 border border-green-500 rounded-full ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <div className={`bg-green-500 rounded-full animate-pulse ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} />
//                 <span className={`text-green-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
//                   Spinning... Drawing at end
//                 </span>
//               </div>
//             )}

//             {revealingWinner && currentRevealIndex >= 0 && (
//               <div className={`inline-flex items-center gap-1.5 bg-purple-500/20 border border-purple-500 rounded-full ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <span className={`text-purple-400 font-medium animate-pulse ${compact ? 'text-xs' : 'text-sm'}`}>
//                   🎊 Revealing {getOrdinal(currentRevealIndex + 1)} Lucky Voter...
//                 </span>
//               </div>
//             )}

//             {isElectionEnded && !revealingWinner && revealedWinners.length > 0 && (
//               <div className={`inline-flex items-center gap-1.5 bg-green-500/20 border border-green-500 rounded-full ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <span className={`text-green-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
//                   ✅ All {revealedWinners.length} Lucky Voter(s) Revealed!
//                 </span>
//               </div>
//             )}

//             {isLoadingParticipants && totalEntries === 0 && (
//               <div className={`inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-500 rounded-full mt-2 ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <RefreshCw className={`text-blue-400 animate-spin ${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
//                 <span className={`text-blue-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>Loading...</span>
//               </div>
//             )}

//             {fetchError && (
//               <div className={`inline-flex items-center gap-1.5 bg-red-500/20 border border-red-500 rounded-full mt-2 ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <span className={`text-red-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>⚠️ {fetchError}</span>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Winners */}
//         {revealedWinners.length > 0 && (
//           <div 
//             className={`border-t-2 border-yellow-600 ${compact ? 'px-2 py-2' : 'px-4 py-4'}`}
//             style={{ background: 'linear-gradient(180deg, #c9972a 0%, #b8860b 100%)' }}
//           >
//             <h3 className={`text-yellow-900 font-bold mb-2 text-center ${compact ? 'text-sm' : 'text-lg'}`}>
//               🏆 LUCKY VOTERS WINNERS 🏆
//             </h3>
            
//             <div className="space-y-1.5">
//               {revealedWinners.map((winner, index) => (
//                 <div 
//                   key={index}
//                   className={`bg-white rounded-lg flex items-center justify-between shadow-md ${compact ? 'px-2 py-1.5' : 'px-4 py-3'}`}
//                 >
//                   <div className="flex items-center gap-2">
//                     <div className={`bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 font-black rounded-full flex items-center justify-center shadow ${compact ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm'}`}>
//                       {getOrdinal(index + 1)}
//                     </div>
//                     <div>
//                       <p className={`font-bold text-gray-900 ${compact ? 'text-xs' : ''}`}>
//                         {winner.displayName || winner.username || winner.name || 'Lucky Voter'}
//                       </p>
//                       <p className={`text-gray-500 font-mono ${compact ? 'text-xs' : 'text-sm'}`}>
//                         Ball #: {winner.ballNumber}
//                       </p>
//                     </div>
//                   </div>
//                   <span className={compact ? 'text-xl' : 'text-3xl'}>🏆</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Footer */}
//         <div 
//           className={`border-t border-yellow-700 flex justify-between items-center ${compact ? 'px-2 py-1.5' : 'px-4 py-2'}`}
//           style={{ background: 'linear-gradient(180deg, #c9972a 0%, #b8860b 100%)' }}
//         >
//           <div className={`flex items-center gap-1.5 text-gray-900 ${compact ? 'text-xs' : ''}`}>
//             <Users className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
//             <span className={compact ? 'text-xs' : 'text-sm'}>
//               Total Entries: <strong>{totalEntries}</strong>
//             </span>
//           </div>
          
//           <div className="flex items-center gap-2">
//             {!isElectionEnded && totalEntries >= 1 && (
//               <button
//                 onClick={() => setShowDemoModal(true)}
//                 className={`flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white rounded transition ${compact ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xs'}`}
//               >
//                 <Eye className="w-3 h-3" />
//                 <span>Demo</span>
//               </button>
//             )}
            
//             <div className={`flex items-center gap-1.5 ${compact ? 'text-xs' : 'text-sm'} ${
//               isSpinning ? 'text-green-700' : isElectionEnded ? 'text-blue-700' : 'text-yellow-800'
//             }`}>
//               <span className={`rounded-full ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'} ${
//                 isSpinning ? 'bg-green-500 animate-pulse' : isElectionEnded ? 'bg-blue-500' : 'bg-yellow-600'
//               }`} />
//               <span className="font-semibold">
//                 {isSpinning ? 'SPINNING' : isElectionEnded ? 'COMPLETED' : 'WAITING'}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       <DemoWinnerReveal
//         isOpen={showDemoModal}
//         onClose={() => setShowDemoModal(false)}
//         realBallNumbers={participants}
//         realLuckyVotersCount={actualLuckyVotersCount}
//         realTotalEntries={totalEntries}
//         compact={compact}
//       />
//     </>
//   );
// }
// // src/components/Dashboard/Tabs/lotteryyy/LotterySlotMachine.jsx
// // 4D Slot Machine
// // DURING ELECTION: Continuous spinning showing actual voter IDs
// // AT ELECTION END: For each winner - Fast spin (1 sec) → Gradual slow with haphazard (up/down) → Stop aligned
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { Users, RefreshCw, Eye } from 'lucide-react';
// import DemoWinnerReveal from './DemoWinnerReveal';

// const LOTTERY_API_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api';

// // Spinning digit - haphazard = different vertical positions, disciplined = aligned center
// const SpinningDigit = ({ 
//   digit,
//   isSpinning,
//   spinPhase, // 'continuous' | 'fast' | 'slowing' | 'stopped'
//   slowdownProgress,
//   randomOffset = 0, // Each digit gets different random offset for haphazard effect
//   compact = false
// }) => {
//   const [currentDigit, setCurrentDigit] = useState(digit || '0');
//   const [nextDigit, setNextDigit] = useState('0');
//   const [offsetY, setOffsetY] = useState(0);
//   const animationRef = useRef(null);
//   const isSpinningRef = useRef(isSpinning);
//   const phaseRef = useRef(spinPhase);
//   const progressRef = useRef(slowdownProgress);
  
//   const digitHeight = compact ? 65 : 110;
//   const continuousSpeed = compact ? 12 : 18;
//   const fastSpeed = compact ? 25 : 40;
//   const minSpeed = compact ? 1 : 2;
  
//   useEffect(() => {
//     isSpinningRef.current = isSpinning;
//     phaseRef.current = spinPhase;
//     progressRef.current = slowdownProgress;
//   }, [isSpinning, spinPhase, slowdownProgress]);

//   useEffect(() => {
//     if (!isSpinning) {
//       setCurrentDigit(digit || '0');
//       setOffsetY(0);
//     }
//   }, [digit, isSpinning]);

//   useEffect(() => {
//     if (isSpinning) {
//       let offset = randomOffset; // Start at random position for haphazard
//       let currDigit = Math.floor(Math.random() * 10);
//       let nxtDigit = Math.floor(Math.random() * 10);
      
//       setCurrentDigit(String(currDigit));
//       setNextDigit(String(nxtDigit));
      
//       const animate = () => {
//         if (!isSpinningRef.current) return;
        
//         const phase = phaseRef.current;
//         const progress = progressRef.current;
        
//         let speed;
        
//         if (phase === 'continuous') {
//           speed = continuousSpeed;
//         } else if (phase === 'fast') {
//           speed = fastSpeed;
//         } else if (phase === 'slowing') {
//           // Gradually slow down
//           const easeProgress = 1 - Math.pow(1 - progress, 3);
//           speed = fastSpeed - (fastSpeed - minSpeed) * easeProgress;
          
//           if (speed <= minSpeed && progress >= 0.98) {
//             return;
//           }
//         } else {
//           return;
//         }
        
//         offset -= speed;
        
//         if (offset <= -digitHeight) {
//           offset = 0;
//           currDigit = nxtDigit;
//           nxtDigit = Math.floor(Math.random() * 10);
//           setCurrentDigit(String(currDigit));
//           setNextDigit(String(nxtDigit));
//         }
        
//         setOffsetY(offset);
//         animationRef.current = requestAnimationFrame(animate);
//       };
      
//       animationRef.current = requestAnimationFrame(animate);
      
//       return () => {
//         if (animationRef.current) cancelAnimationFrame(animationRef.current);
//       };
//     } else {
//       // When stopped, align to center (offset = 0)
//       setOffsetY(0);
//       setCurrentDigit(digit || '0');
//       if (animationRef.current) {
//         cancelAnimationFrame(animationRef.current);
//         animationRef.current = null;
//       }
//     }
//   }, [isSpinning, digit, digitHeight, continuousSpeed, fastSpeed, minSpeed, randomOffset]);

//   const fontSize = compact ? 'text-5xl' : 'text-7xl sm:text-8xl';
//   const containerWidth = compact ? 50 : 85;
//   const containerHeightVal = compact ? 65 : 110;

//   return (
//     <div 
//       className="relative overflow-hidden rounded-lg"
//       style={{
//         width: `${containerWidth}px`,
//         height: `${containerHeightVal}px`,
//         background: 'linear-gradient(180deg, #7f1d1d 0%, #991b1b 20%, #b91c1c 50%, #991b1b 80%, #7f1d1d 100%)',
//         boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.7), inset 0 -4px 20px rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.4)',
//         border: '3px solid #1f2937',
//         borderRadius: '8px'
//       }}
//     >
//       <div 
//         className="absolute w-full"
//         style={{ 
//           transform: `translateY(${offsetY}px)`,
//           transition: isSpinning ? 'none' : 'transform 0.4s ease-out'
//         }}
//       >
//         <div className="flex items-center justify-center" style={{ height: `${digitHeight}px` }}>
//           <span 
//             className={`font-black text-white ${fontSize}`}
//             style={{ 
//               fontFamily: 'Impact, "Arial Black", sans-serif',
//               textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
//             }}
//           >
//             {currentDigit}
//           </span>
//         </div>
//         <div className="flex items-center justify-center" style={{ height: `${digitHeight}px` }}>
//           <span 
//             className={`font-black text-white ${fontSize}`}
//             style={{ 
//               fontFamily: 'Impact, "Arial Black", sans-serif',
//               textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
//             }}
//           >
//             {nextDigit}
//           </span>
//         </div>
//       </div>
      
//       <div 
//         className="absolute top-0 left-0 right-0 pointer-events-none z-10"
//         style={{
//           height: '35%',
//           background: 'linear-gradient(to bottom, rgba(55,0,0,0.95) 0%, rgba(55,0,0,0.5) 50%, transparent 100%)'
//         }}
//       />
      
//       <div 
//         className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
//         style={{
//           height: '35%',
//           background: 'linear-gradient(to top, rgba(55,0,0,0.95) 0%, rgba(55,0,0,0.5) 50%, transparent 100%)'
//         }}
//       />
//     </div>
//   );
// };

// export default function LotterySlotMachine({ 
//   electionId,
//   electionEndDate,
//   luckyVotersCount = 1,
//   isElectionEnded = false,
//   winners = [],
//   isActive = true,
//   compact = false,
// }) {
//   const [displayDigits, setDisplayDigits] = useState(['0', '0', '0', '0', '0', '0']);
//   const [isSpinning, setIsSpinning] = useState(false);
//   const [spinPhase, setSpinPhase] = useState('stopped');
//   const [slowdownProgress, setSlowdownProgress] = useState(0);
//   const [randomOffsets, setRandomOffsets] = useState([0, 0, 0, 0, 0, 0]);
//   /*eslint-disable*/
//   const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
//   const [revealedWinners, setRevealedWinners] = useState([]);
//   const [currentRevealIndex, setCurrentRevealIndex] = useState(-1);
//   const [revealingWinner, setRevealingWinner] = useState(false);
  
//   const [participants, setParticipants] = useState([]);
//   const [totalEntries, setTotalEntries] = useState(0);
//   const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
//   const [fetchError, setFetchError] = useState(null);
//   const [actualLuckyVotersCount, setActualLuckyVotersCount] = useState(luckyVotersCount);
  
//   const [showDemoModal, setShowDemoModal] = useState(false);
  
//   const fetchIntervalRef = useRef(null);
//   const displayIntervalRef = useRef(null);
//   const slowdownIntervalRef = useRef(null);

//   // Generate random offsets for haphazard effect (different Y position for each digit)
//   const generateRandomOffsets = useCallback(() => {
//     const digitHeight = compact ? 65 : 110;
//     return displayDigits.map(() => -Math.floor(Math.random() * (digitHeight * 0.6)));
//   }, [displayDigits.length, compact]);

//   const fetchBallNumbers = useCallback(async () => {
//     if (!electionId) return;
    
//     try {
//       setIsLoadingParticipants(true);
//       setFetchError(null);
      
//       const response = await fetch(
//         `${LOTTERY_API_URL}/lottery/elections/${electionId}/ball-numbers`
//       );
      
//       if (!response.ok) throw new Error(`Failed: ${response.status}`);
      
//       const data = await response.json();
//       console.log('🎰 Ball numbers fetched:', data);
      
//       const ballNumbers = [];
//       const nums = data.ballNumbers || data.ball_numbers || [];
//       nums.forEach(ballNum => {
//         if (ballNum) ballNumbers.push(String(ballNum));
//       });
      
//       setParticipants(ballNumbers);
//       setTotalEntries(data.totalParticipants || data.total_participants || ballNumbers.length);
      
//       if (data.luckyVotersCount || data.lucky_voters_count) {
//         setActualLuckyVotersCount(data.luckyVotersCount || data.lucky_voters_count);
//       }
      
//       if (ballNumbers.length > 0) {
//         const maxDigits = Math.max(...ballNumbers.map(b => b.length));
//         if (maxDigits !== displayDigits.length) {
//           setDisplayDigits(Array(maxDigits).fill('0'));
//           setRandomOffsets(Array(maxDigits).fill(0));
//         }
//       }
//     } catch (error) {
//       console.error('❌ Error:', error);
//       setFetchError(error.message);
//     } finally {
//       setIsLoadingParticipants(false);
//     }
//   }, [electionId, displayDigits.length]);

//   useEffect(() => {
//     if (electionId && isActive) {
//       fetchBallNumbers();
//       fetchIntervalRef.current = setInterval(fetchBallNumbers, 10000);
//       return () => {
//         if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current);
//       };
//     }
//   }, [electionId, isActive, fetchBallNumbers]);

//   const getRandomVoterId = useCallback(() => {
//     if (participants.length > 0) {
//       const idx = Math.floor(Math.random() * participants.length);
//       return participants[idx].padStart(displayDigits.length, '0');
//     }
//     const min = Math.pow(10, displayDigits.length - 1);
//     const max = Math.pow(10, displayDigits.length) - 1;
//     return String(Math.floor(min + Math.random() * (max - min)));
//   }, [participants, displayDigits.length]);

//   useEffect(() => {
//     if (!electionEndDate) return;

//     const updateCountdown = () => {
//       const now = new Date().getTime();
//       const end = new Date(electionEndDate).getTime();
//       const diff = Math.max(0, end - now);

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

//   const startContinuousSpinning = useCallback(() => {
//     setIsSpinning(true);
//     setSpinPhase('continuous');
//     setRandomOffsets(generateRandomOffsets());
    
//     displayIntervalRef.current = setInterval(() => {
//       const voterId = getRandomVoterId();
//       setDisplayDigits(voterId.split(''));
//     }, 150);
//   }, [getRandomVoterId, generateRandomOffsets]);

//   const stopContinuousSpinning = useCallback(() => {
//     if (displayIntervalRef.current) {
//       clearInterval(displayIntervalRef.current);
//       displayIntervalRef.current = null;
//     }
//     setIsSpinning(false);
//     setSpinPhase('stopped');
//   }, []);

//   useEffect(() => {
//     if (isActive && totalEntries >= 1 && !isElectionEnded && !revealingWinner) {
//       startContinuousSpinning();
//     } else if (isElectionEnded || revealingWinner) {
//       stopContinuousSpinning();
//     } else if (totalEntries < 1) {
//       stopContinuousSpinning();
//     }
    
//     return () => stopContinuousSpinning();
//   }, [isActive, totalEntries, isElectionEnded, revealingWinner, startContinuousSpinning, stopContinuousSpinning]);

//   useEffect(() => {
//     if (isElectionEnded && winners.length > 0 && revealedWinners.length === 0 && !revealingWinner) {
//       revealWinnersSequentially();
//     }
//   }, [isElectionEnded, winners, revealedWinners.length, revealingWinner]);

//   const revealSingleWinner = async (winnerIndex) => {
//     const FAST_PHASE_DURATION = 1000; // 1 second fast
//     const SLOW_PHASE_DURATION = 2500; // 2.5 seconds to slow down
    
//     // Generate random offsets for haphazard effect
//     setRandomOffsets(generateRandomOffsets());
    
//     // Fast phase - same speed, straight numbers
//     setIsSpinning(true);
//     setSpinPhase('fast');
//     setSlowdownProgress(0);
    
//     const fastInterval = setInterval(() => {
//       const voterId = getRandomVoterId();
//       setDisplayDigits(voterId.split(''));
//       // Update random offsets periodically for haphazard movement
//       setRandomOffsets(generateRandomOffsets());
//     }, 60);
    
//     await new Promise(resolve => setTimeout(resolve, FAST_PHASE_DURATION));
    
//     clearInterval(fastInterval);
    
//     // Slowing phase - digits at different vertical positions (haphazard)
//     setSpinPhase('slowing');
    
//     const slowdownStartTime = Date.now();
    
//     await new Promise(resolve => {
//       let lastUpdate = 0;
//       slowdownIntervalRef.current = setInterval(() => {
//         const elapsed = Date.now() - slowdownStartTime;
//         const progress = Math.min(elapsed / SLOW_PHASE_DURATION, 1);
//         setSlowdownProgress(progress);
        
//         // Update display less frequently as we slow down
//         const updateInterval = 60 + progress * 400;
//         if (elapsed - lastUpdate > updateInterval) {
//           const voterId = getRandomVoterId();
//           setDisplayDigits(voterId.split(''));
//           // Gradually reduce randomness of offsets as we slow down
//           const offsetScale = 1 - progress;
//           setRandomOffsets(prev => prev.map(() => 
//             -Math.floor(Math.random() * ((compact ? 65 : 110) * 0.6 * offsetScale))
//           ));
//           lastUpdate = elapsed;
//         }
        
//         if (progress >= 1) {
//           clearInterval(slowdownIntervalRef.current);
//           resolve();
//         }
//       }, 16);
//     });
    
//     // Stop - all digits align to center
//     setIsSpinning(false);
//     setSpinPhase('stopped');
//     setSlowdownProgress(0);
//     setRandomOffsets(displayDigits.map(() => 0)); // All aligned
    
//     await new Promise(resolve => setTimeout(resolve, 300));
    
//     // Show winner's number
//     const winner = winners[winnerIndex];
//     const winnerBallNumber = String(
//       winner.ball_number ||
//       winner.ballNumber ||
//       winner.oddjob_voter_id || 
//       winner.oddjobVoterId || 
//       winner.voterId ||
//       winner.voter_id ||
//       winner.id || 
//       '000000'
//     ).padStart(displayDigits.length, '0');
    
//     setDisplayDigits(winnerBallNumber.split(''));
    
//     return {
//       ...winner,
//       ballNumber: winnerBallNumber,
//       rank: winnerIndex + 1
//     };
//   };

//   const revealWinnersSequentially = async () => {
//     setRevealingWinner(true);
//     stopContinuousSpinning();
    
//     for (let i = 0; i < winners.length; i++) {
//       setCurrentRevealIndex(i);
      
//       const revealedWinner = await revealSingleWinner(i);
//       setRevealedWinners(prev => [...prev, revealedWinner]);
      
//       if (i < winners.length - 1) {
//         await new Promise(resolve => setTimeout(resolve, 2500));
//       }
//     }
    
//     setCurrentRevealIndex(-1);
//     setRevealingWinner(false);
//   };

//   const formatCountdown = () => {
//     // Show the election end date in DD/MM/YYYY format
//     if (!electionEndDate) return '--/--/----';
//     const endDate = new Date(electionEndDate);
//     const day = String(endDate.getDate()).padStart(2, '0');
//     const month = String(endDate.getMonth() + 1).padStart(2, '0');
//     const year = endDate.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   const getOrdinal = (n) => {
//     const s = ['th', 'st', 'nd', 'rd'];
//     const v = n % 100;
//     return n + (s[(v - 20) % 10] || s[v] || s[0]);
//   };

//   return (
//     <>
//       <div 
//         className={`rounded-xl shadow-2xl overflow-hidden ${compact ? 'text-sm' : ''}`}
//         style={{
//           background: 'linear-gradient(180deg, #d4a418 0%, #c9972a 50%, #b8860b 100%)',
//           boxShadow: '0 10px 40px rgba(0,0,0,0.4)'
//         }}
//       >
//         {/* Header */}
//         <div 
//           className={`flex justify-between items-center ${compact ? 'px-3 py-2' : 'px-5 py-4'}`}
//           style={{ background: 'linear-gradient(180deg, #d4a418 0%, #c9972a 100%)' }}
//         >
//           <div className="flex items-center gap-2">
//             <span className={`text-gray-900 font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>
//               Date:
//             </span>
//             <div 
//               className={`rounded ${compact ? 'px-2 py-0.5' : 'px-3 py-1'}`}
//               style={{ background: '#1a1a1a', border: '2px solid #333' }}
//             >
//               <span 
//                 className={`font-bold ${compact ? 'text-sm' : 'text-lg'}`}
//                 style={{ 
//                   fontFamily: '"Courier New", monospace',
//                   color: '#00ff00',
//                   textShadow: '0 0 8px #00ff00, 0 0 12px #00ff00',
//                   letterSpacing: '1px'
//                 }}
//               >
//                 {formatCountdown()}
//               </span>
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             <span className={`text-gray-900 font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>
//               Lucky Voters No:
//             </span>
//             <div 
//               className={`rounded ${compact ? 'px-2 py-0.5' : 'px-3 py-1'}`}
//               style={{ background: '#1a1a1a', border: '2px solid #333' }}
//             >
//               <span 
//                 className={`font-bold ${compact ? 'text-sm' : 'text-lg'}`}
//                 style={{ 
//                   fontFamily: '"Courier New", monospace',
//                   color: '#00ff00',
//                   textShadow: '0 0 8px #00ff00, 0 0 12px #00ff00',
//                   letterSpacing: '2px'
//                 }}
//               >
//                 {String(actualLuckyVotersCount).padStart(2, '0')}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Main Display */}
//         <div 
//           className={`${compact ? 'p-4' : 'p-6'} overflow-hidden`}
//         >
//           <div 
//             className="rounded-lg overflow-hidden"
//             style={{ background: '#1a1a1a', padding: compact ? '12px' : '20px' }}
//           >
//             <div className={`flex justify-center items-center ${compact ? 'gap-1.5 mb-3' : 'gap-2 mb-4'}`}>
//               {displayDigits.map((digit, index) => (
//                 <SpinningDigit
//                   key={`digit-${index}`}
//                   digit={digit}
//                   isSpinning={isSpinning}
//                   spinPhase={spinPhase}
//                   slowdownProgress={slowdownProgress}
//                   randomOffset={randomOffsets[index] || 0}
//                   compact={compact}
//                 />
//               ))}
//             </div>
//           </div>

//           {/* Status */}
//           <div className="text-center">
//             {!isElectionEnded && totalEntries < 1 && (
//               <div className={`inline-flex items-center gap-1.5 bg-yellow-500/20 border border-yellow-500 rounded-full ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <span className={`text-yellow-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
//                   ⏳ Waiting for voters... ({totalEntries}/1)
//                 </span>
//               </div>
//             )}

//             {!isElectionEnded && totalEntries >= 1 && isSpinning && spinPhase === 'continuous' && (
//               <div className={`inline-flex items-center gap-1.5 bg-green-500/20 border border-green-500 rounded-full ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <div className={`bg-green-500 rounded-full animate-pulse ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} />
//                 <span className={`text-green-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
//                   Spinning... Drawing at end
//                 </span>
//               </div>
//             )}

//             {revealingWinner && currentRevealIndex >= 0 && (
//               <div className={`inline-flex items-center gap-1.5 bg-purple-500/20 border border-purple-500 rounded-full ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <span className={`text-purple-400 font-medium animate-pulse ${compact ? 'text-xs' : 'text-sm'}`}>
//                   🎊 Revealing {getOrdinal(currentRevealIndex + 1)} Lucky Voter...
//                 </span>
//               </div>
//             )}

//             {isElectionEnded && !revealingWinner && revealedWinners.length > 0 && (
//               <div className={`inline-flex items-center gap-1.5 bg-green-500/20 border border-green-500 rounded-full ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <span className={`text-green-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
//                   ✅ All {revealedWinners.length} Lucky Voter(s) Revealed!
//                 </span>
//               </div>
//             )}

//             {isLoadingParticipants && totalEntries === 0 && (
//               <div className={`inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-500 rounded-full mt-2 ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <RefreshCw className={`text-blue-400 animate-spin ${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
//                 <span className={`text-blue-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>Loading...</span>
//               </div>
//             )}

//             {fetchError && (
//               <div className={`inline-flex items-center gap-1.5 bg-red-500/20 border border-red-500 rounded-full mt-2 ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <span className={`text-red-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>⚠️ {fetchError}</span>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Winners */}
//         {revealedWinners.length > 0 && (
//           <div 
//             className={`border-t-2 border-yellow-600 ${compact ? 'px-2 py-2' : 'px-4 py-4'}`}
//             style={{ background: 'linear-gradient(180deg, #c9972a 0%, #b8860b 100%)' }}
//           >
//             <h3 className={`text-yellow-900 font-bold mb-2 text-center ${compact ? 'text-sm' : 'text-lg'}`}>
//               🏆 LUCKY VOTERS WINNERS 🏆
//             </h3>
            
//             <div className="space-y-1.5">
//               {revealedWinners.map((winner, index) => (
//                 <div 
//                   key={index}
//                   className={`bg-white rounded-lg flex items-center justify-between shadow-md ${compact ? 'px-2 py-1.5' : 'px-4 py-3'}`}
//                 >
//                   <div className="flex items-center gap-2">
//                     <div className={`bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 font-black rounded-full flex items-center justify-center shadow ${compact ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm'}`}>
//                       {getOrdinal(index + 1)}
//                     </div>
//                     <div>
//                       <p className={`font-bold text-gray-900 ${compact ? 'text-xs' : ''}`}>
//                         {winner.displayName || winner.username || winner.name || 'Lucky Voter'}
//                       </p>
//                       <p className={`text-gray-500 font-mono ${compact ? 'text-xs' : 'text-sm'}`}>
//                         Ball #: {winner.ballNumber}
//                       </p>
//                     </div>
//                   </div>
//                   <span className={compact ? 'text-xl' : 'text-3xl'}>🏆</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Footer */}
//         <div 
//           className={`border-t border-yellow-700 flex justify-between items-center ${compact ? 'px-2 py-1.5' : 'px-4 py-2'}`}
//           style={{ background: 'linear-gradient(180deg, #c9972a 0%, #b8860b 100%)' }}
//         >
//           <div className={`flex items-center gap-1.5 text-gray-900 ${compact ? 'text-xs' : ''}`}>
//             <Users className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
//             <span className={compact ? 'text-xs' : 'text-sm'}>
//               Total Entries: <strong>{totalEntries}</strong>
//             </span>
//           </div>
          
//           <div className="flex items-center gap-2">
//             {!isElectionEnded && totalEntries >= 1 && (
//               <button
//                 onClick={() => setShowDemoModal(true)}
//                 className={`flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white rounded transition ${compact ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xs'}`}
//               >
//                 <Eye className="w-3 h-3" />
//                 <span>Demo</span>
//               </button>
//             )}
            
//             <div className={`flex items-center gap-1.5 ${compact ? 'text-xs' : 'text-sm'} ${
//               isSpinning ? 'text-green-700' : isElectionEnded ? 'text-blue-700' : 'text-yellow-800'
//             }`}>
//               <span className={`rounded-full ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'} ${
//                 isSpinning ? 'bg-green-500 animate-pulse' : isElectionEnded ? 'bg-blue-500' : 'bg-yellow-600'
//               }`} />
//               <span className="font-semibold">
//                 {isSpinning ? 'SPINNING' : isElectionEnded ? 'COMPLETED' : 'WAITING'}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       <DemoWinnerReveal
//         isOpen={showDemoModal}
//         onClose={() => setShowDemoModal(false)}
//         realBallNumbers={participants}
//         realLuckyVotersCount={actualLuckyVotersCount}
//         realTotalEntries={totalEntries}
//         compact={compact}
//       />
//     </>
//   );
// }
// // src/components/Dashboard/Tabs/lotteryyy/LotterySlotMachine.jsx
// // 4D Slot Machine
// // DURING ELECTION: Continuous spinning showing actual voter IDs
// // AT ELECTION END: For each winner - Fast spin (1 sec) → Gradual slow with haphazard (up/down) → Stop aligned
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { Users, RefreshCw, Eye } from 'lucide-react';
// import DemoWinnerReveal from './DemoWinnerReveal';

// const LOTTERY_API_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api';

// // Spinning digit - haphazard = different vertical positions, disciplined = aligned center
// const SpinningDigit = ({ 
//   digit,
//   isSpinning,
//   spinPhase, // 'continuous' | 'fast' | 'slowing' | 'stopped'
//   slowdownProgress,
//   randomOffset = 0, // Each digit gets different random offset for haphazard effect
//   compact = false
// }) => {
//   const [currentDigit, setCurrentDigit] = useState(digit || '0');
//   const [nextDigit, setNextDigit] = useState('0');
//   const [offsetY, setOffsetY] = useState(0);
//   const animationRef = useRef(null);
//   const isSpinningRef = useRef(isSpinning);
//   const phaseRef = useRef(spinPhase);
//   const progressRef = useRef(slowdownProgress);
  
//   const digitHeight = compact ? 50 : 90;
//   const continuousSpeed = compact ? 10 : 15;
//   const fastSpeed = compact ? 22 : 35;
//   const minSpeed = compact ? 1 : 2;
  
//   useEffect(() => {
//     isSpinningRef.current = isSpinning;
//     phaseRef.current = spinPhase;
//     progressRef.current = slowdownProgress;
//   }, [isSpinning, spinPhase, slowdownProgress]);

//   useEffect(() => {
//     if (!isSpinning) {
//       setCurrentDigit(digit || '0');
//       setOffsetY(0);
//     }
//   }, [digit, isSpinning]);

//   useEffect(() => {
//     if (isSpinning) {
//       let offset = randomOffset; // Start at random position for haphazard
//       let currDigit = Math.floor(Math.random() * 10);
//       let nxtDigit = Math.floor(Math.random() * 10);
      
//       setCurrentDigit(String(currDigit));
//       setNextDigit(String(nxtDigit));
      
//       const animate = () => {
//         if (!isSpinningRef.current) return;
        
//         const phase = phaseRef.current;
//         const progress = progressRef.current;
        
//         let speed;
        
//         if (phase === 'continuous') {
//           speed = continuousSpeed;
//         } else if (phase === 'fast') {
//           speed = fastSpeed;
//         } else if (phase === 'slowing') {
//           // Gradually slow down
//           const easeProgress = 1 - Math.pow(1 - progress, 3);
//           speed = fastSpeed - (fastSpeed - minSpeed) * easeProgress;
          
//           if (speed <= minSpeed && progress >= 0.98) {
//             return;
//           }
//         } else {
//           return;
//         }
        
//         offset -= speed;
        
//         if (offset <= -digitHeight) {
//           offset = 0;
//           currDigit = nxtDigit;
//           nxtDigit = Math.floor(Math.random() * 10);
//           setCurrentDigit(String(currDigit));
//           setNextDigit(String(nxtDigit));
//         }
        
//         setOffsetY(offset);
//         animationRef.current = requestAnimationFrame(animate);
//       };
      
//       animationRef.current = requestAnimationFrame(animate);
      
//       return () => {
//         if (animationRef.current) cancelAnimationFrame(animationRef.current);
//       };
//     } else {
//       // When stopped, align to center (offset = 0)
//       setOffsetY(0);
//       setCurrentDigit(digit || '0');
//       if (animationRef.current) {
//         cancelAnimationFrame(animationRef.current);
//         animationRef.current = null;
//       }
//     }
//   }, [isSpinning, digit, digitHeight, continuousSpeed, fastSpeed, minSpeed, randomOffset]);

//   const fontSize = compact ? 'text-4xl' : 'text-6xl sm:text-7xl';
//   const containerWidth = compact ? 40 : 70;
//   const containerHeightVal = compact ? 50 : 90;

//   return (
//     <div 
//       className="relative overflow-hidden rounded-lg"
//       style={{
//         width: `${containerWidth}px`,
//         height: `${containerHeightVal}px`,
//         background: 'linear-gradient(180deg, #7f1d1d 0%, #991b1b 20%, #b91c1c 50%, #991b1b 80%, #7f1d1d 100%)',
//         boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.7), inset 0 -4px 20px rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.4)',
//         border: '3px solid #1f2937',
//         borderRadius: '8px'
//       }}
//     >
//       <div 
//         className="absolute w-full"
//         style={{ 
//           transform: `translateY(${offsetY}px)`,
//           transition: isSpinning ? 'none' : 'transform 0.4s ease-out'
//         }}
//       >
//         <div className="flex items-center justify-center" style={{ height: `${digitHeight}px` }}>
//           <span 
//             className={`font-black text-white ${fontSize}`}
//             style={{ 
//               fontFamily: 'Impact, "Arial Black", sans-serif',
//               textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
//             }}
//           >
//             {currentDigit}
//           </span>
//         </div>
//         <div className="flex items-center justify-center" style={{ height: `${digitHeight}px` }}>
//           <span 
//             className={`font-black text-white ${fontSize}`}
//             style={{ 
//               fontFamily: 'Impact, "Arial Black", sans-serif',
//               textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
//             }}
//           >
//             {nextDigit}
//           </span>
//         </div>
//       </div>
      
//       <div 
//         className="absolute top-0 left-0 right-0 pointer-events-none z-10"
//         style={{
//           height: '35%',
//           background: 'linear-gradient(to bottom, rgba(55,0,0,0.95) 0%, rgba(55,0,0,0.5) 50%, transparent 100%)'
//         }}
//       />
      
//       <div 
//         className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
//         style={{
//           height: '35%',
//           background: 'linear-gradient(to top, rgba(55,0,0,0.95) 0%, rgba(55,0,0,0.5) 50%, transparent 100%)'
//         }}
//       />
//     </div>
//   );
// };

// export default function LotterySlotMachine({ 
//   electionId,
//   electionEndDate,
//   luckyVotersCount = 1,
//   isElectionEnded = false,
//   winners = [],
//   isActive = true,
//   compact = false,
// }) {
//   const [displayDigits, setDisplayDigits] = useState(['0', '0', '0', '0', '0', '0']);
//   const [isSpinning, setIsSpinning] = useState(false);
//   const [spinPhase, setSpinPhase] = useState('stopped');
//   const [slowdownProgress, setSlowdownProgress] = useState(0);
//   const [randomOffsets, setRandomOffsets] = useState([0, 0, 0, 0, 0, 0]);
//   const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
//   const [revealedWinners, setRevealedWinners] = useState([]);
//   const [currentRevealIndex, setCurrentRevealIndex] = useState(-1);
//   const [revealingWinner, setRevealingWinner] = useState(false);
  
//   const [participants, setParticipants] = useState([]);
//   const [totalEntries, setTotalEntries] = useState(0);
//   const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
//   const [fetchError, setFetchError] = useState(null);
//   const [actualLuckyVotersCount, setActualLuckyVotersCount] = useState(luckyVotersCount);
  
//   const [showDemoModal, setShowDemoModal] = useState(false);
  
//   const fetchIntervalRef = useRef(null);
//   const displayIntervalRef = useRef(null);
//   const slowdownIntervalRef = useRef(null);

//   // Generate random offsets for haphazard effect (different Y position for each digit)
//   const generateRandomOffsets = useCallback(() => {
//     const digitHeight = compact ? 50 : 90;
//     return displayDigits.map(() => -Math.floor(Math.random() * (digitHeight * 0.6)));
//   }, [displayDigits.length, compact]);

//   const fetchBallNumbers = useCallback(async () => {
//     if (!electionId) return;
    
//     try {
//       setIsLoadingParticipants(true);
//       setFetchError(null);
      
//       const response = await fetch(
//         `${LOTTERY_API_URL}/lottery/elections/${electionId}/ball-numbers`
//       );
      
//       if (!response.ok) throw new Error(`Failed: ${response.status}`);
      
//       const data = await response.json();
//       console.log('🎰 Ball numbers fetched:', data);
      
//       const ballNumbers = [];
//       const nums = data.ballNumbers || data.ball_numbers || [];
//       nums.forEach(ballNum => {
//         if (ballNum) ballNumbers.push(String(ballNum));
//       });
      
//       setParticipants(ballNumbers);
//       setTotalEntries(data.totalParticipants || data.total_participants || ballNumbers.length);
      
//       if (data.luckyVotersCount || data.lucky_voters_count) {
//         setActualLuckyVotersCount(data.luckyVotersCount || data.lucky_voters_count);
//       }
      
//       if (ballNumbers.length > 0) {
//         const maxDigits = Math.max(...ballNumbers.map(b => b.length));
//         if (maxDigits !== displayDigits.length) {
//           setDisplayDigits(Array(maxDigits).fill('0'));
//           setRandomOffsets(Array(maxDigits).fill(0));
//         }
//       }
//     } catch (error) {
//       console.error('❌ Error:', error);
//       setFetchError(error.message);
//     } finally {
//       setIsLoadingParticipants(false);
//     }
//   }, [electionId, displayDigits.length]);

//   useEffect(() => {
//     if (electionId && isActive) {
//       fetchBallNumbers();
//       fetchIntervalRef.current = setInterval(fetchBallNumbers, 10000);
//       return () => {
//         if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current);
//       };
//     }
//   }, [electionId, isActive, fetchBallNumbers]);

//   const getRandomVoterId = useCallback(() => {
//     if (participants.length > 0) {
//       const idx = Math.floor(Math.random() * participants.length);
//       return participants[idx].padStart(displayDigits.length, '0');
//     }
//     const min = Math.pow(10, displayDigits.length - 1);
//     const max = Math.pow(10, displayDigits.length) - 1;
//     return String(Math.floor(min + Math.random() * (max - min)));
//   }, [participants, displayDigits.length]);

//   useEffect(() => {
//     if (!electionEndDate) return;

//     const updateCountdown = () => {
//       const now = new Date().getTime();
//       const end = new Date(electionEndDate).getTime();
//       const diff = Math.max(0, end - now);

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

//   const startContinuousSpinning = useCallback(() => {
//     setIsSpinning(true);
//     setSpinPhase('continuous');
//     setRandomOffsets(generateRandomOffsets());
    
//     displayIntervalRef.current = setInterval(() => {
//       const voterId = getRandomVoterId();
//       setDisplayDigits(voterId.split(''));
//     }, 150);
//   }, [getRandomVoterId, generateRandomOffsets]);

//   const stopContinuousSpinning = useCallback(() => {
//     if (displayIntervalRef.current) {
//       clearInterval(displayIntervalRef.current);
//       displayIntervalRef.current = null;
//     }
//     setIsSpinning(false);
//     setSpinPhase('stopped');
//   }, []);

//   useEffect(() => {
//     if (isActive && totalEntries >= 1 && !isElectionEnded && !revealingWinner) {
//       startContinuousSpinning();
//     } else if (isElectionEnded || revealingWinner) {
//       stopContinuousSpinning();
//     } else if (totalEntries < 1) {
//       stopContinuousSpinning();
//     }
    
//     return () => stopContinuousSpinning();
//   }, [isActive, totalEntries, isElectionEnded, revealingWinner, startContinuousSpinning, stopContinuousSpinning]);

//   useEffect(() => {
//     if (isElectionEnded && winners.length > 0 && revealedWinners.length === 0 && !revealingWinner) {
//       revealWinnersSequentially();
//     }
//   }, [isElectionEnded, winners, revealedWinners.length, revealingWinner]);

//   const revealSingleWinner = async (winnerIndex) => {
//     const FAST_PHASE_DURATION = 1000; // 1 second fast
//     const SLOW_PHASE_DURATION = 2500; // 2.5 seconds to slow down
    
//     // Generate random offsets for haphazard effect
//     setRandomOffsets(generateRandomOffsets());
    
//     // Fast phase - same speed, straight numbers
//     setIsSpinning(true);
//     setSpinPhase('fast');
//     setSlowdownProgress(0);
    
//     const fastInterval = setInterval(() => {
//       const voterId = getRandomVoterId();
//       setDisplayDigits(voterId.split(''));
//       // Update random offsets periodically for haphazard movement
//       setRandomOffsets(generateRandomOffsets());
//     }, 60);
    
//     await new Promise(resolve => setTimeout(resolve, FAST_PHASE_DURATION));
    
//     clearInterval(fastInterval);
    
//     // Slowing phase - digits at different vertical positions (haphazard)
//     setSpinPhase('slowing');
    
//     const slowdownStartTime = Date.now();
    
//     await new Promise(resolve => {
//       let lastUpdate = 0;
//       slowdownIntervalRef.current = setInterval(() => {
//         const elapsed = Date.now() - slowdownStartTime;
//         const progress = Math.min(elapsed / SLOW_PHASE_DURATION, 1);
//         setSlowdownProgress(progress);
        
//         // Update display less frequently as we slow down
//         const updateInterval = 60 + progress * 400;
//         if (elapsed - lastUpdate > updateInterval) {
//           const voterId = getRandomVoterId();
//           setDisplayDigits(voterId.split(''));
//           // Gradually reduce randomness of offsets as we slow down
//           const offsetScale = 1 - progress;
//           setRandomOffsets(prev => prev.map(() => 
//             -Math.floor(Math.random() * ((compact ? 50 : 90) * 0.6 * offsetScale))
//           ));
//           lastUpdate = elapsed;
//         }
        
//         if (progress >= 1) {
//           clearInterval(slowdownIntervalRef.current);
//           resolve();
//         }
//       }, 16);
//     });
    
//     // Stop - all digits align to center
//     setIsSpinning(false);
//     setSpinPhase('stopped');
//     setSlowdownProgress(0);
//     setRandomOffsets(displayDigits.map(() => 0)); // All aligned
    
//     await new Promise(resolve => setTimeout(resolve, 300));
    
//     // Show winner's number
//     const winner = winners[winnerIndex];
//     const winnerBallNumber = String(
//       winner.ball_number ||
//       winner.ballNumber ||
//       winner.oddjob_voter_id || 
//       winner.oddjobVoterId || 
//       winner.voterId ||
//       winner.voter_id ||
//       winner.id || 
//       '000000'
//     ).padStart(displayDigits.length, '0');
    
//     setDisplayDigits(winnerBallNumber.split(''));
    
//     return {
//       ...winner,
//       ballNumber: winnerBallNumber,
//       rank: winnerIndex + 1
//     };
//   };

//   const revealWinnersSequentially = async () => {
//     setRevealingWinner(true);
//     stopContinuousSpinning();
    
//     for (let i = 0; i < winners.length; i++) {
//       setCurrentRevealIndex(i);
      
//       const revealedWinner = await revealSingleWinner(i);
//       setRevealedWinners(prev => [...prev, revealedWinner]);
      
//       if (i < winners.length - 1) {
//         await new Promise(resolve => setTimeout(resolve, 2500));
//       }
//     }
    
//     setCurrentRevealIndex(-1);
//     setRevealingWinner(false);
//   };

//   const formatCountdown = () => {
//     const { days, hours, minutes, seconds } = countdown;
//     const pad = (n) => String(n).padStart(2, '0');
    
//     if (days > 0) {
//       // Show days and hours: DD:HH
//       const totalHours = days * 24 + hours;
//       return `${pad(totalHours)}:${pad(minutes)}`;
//     }
//     // Show hours and minutes: HH:MM (or MM:SS if less than 1 hour)
//     if (hours > 0) {
//       return `${pad(hours)}:${pad(minutes)}`;
//     }
//     // Less than 1 hour - show MM:SS
//     return `${pad(minutes)}:${pad(seconds)}`;
//   };

//   const getOrdinal = (n) => {
//     const s = ['th', 'st', 'nd', 'rd'];
//     const v = n % 100;
//     return n + (s[(v - 20) % 10] || s[v] || s[0]);
//   };

//   return (
//     <>
//       <div 
//         className={`rounded-xl overflow-hidden shadow-2xl ${compact ? 'text-sm' : ''}`}
//         style={{
//           background: 'linear-gradient(180deg, #d4a418 0%, #c9972a 50%, #b8860b 100%)',
//           border: '4px solid #8B7500',
//           boxShadow: '0 10px 40px rgba(0,0,0,0.4)'
//         }}
//       >
//         {/* Header */}
//         <div 
//           className={`flex justify-between items-center ${compact ? 'px-2 py-1.5' : 'px-4 py-3'}`}
//           style={{ background: 'linear-gradient(180deg, #d4a418 0%, #c9972a 100%)' }}
//         >
//           <div className="flex items-center gap-2">
//             <span className={`text-gray-900 font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>
//               Date & Time:
//             </span>
//             <div 
//               className={`rounded ${compact ? 'px-2 py-0.5' : 'px-3 py-1'}`}
//               style={{ background: '#1a1a1a', border: '2px solid #333' }}
//             >
//               <span 
//                 className={`font-bold ${compact ? 'text-sm' : 'text-lg'}`}
//                 style={{ 
//                   fontFamily: '"Courier New", monospace',
//                   color: '#00ff00',
//                   textShadow: '0 0 8px #00ff00, 0 0 12px #00ff00',
//                   letterSpacing: '2px'
//                 }}
//               >
//                 {formatCountdown()}
//               </span>
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             <span className={`text-gray-900 font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>
//               Lucky Voters No:
//             </span>
//             <div 
//               className={`rounded ${compact ? 'px-2 py-0.5' : 'px-3 py-1'}`}
//               style={{ background: '#1a1a1a', border: '2px solid #333' }}
//             >
//               <span 
//                 className={`font-bold ${compact ? 'text-sm' : 'text-lg'}`}
//                 style={{ 
//                   fontFamily: '"Courier New", monospace',
//                   color: '#00ff00',
//                   textShadow: '0 0 8px #00ff00, 0 0 12px #00ff00',
//                   letterSpacing: '2px'
//                 }}
//               >
//                 {String(actualLuckyVotersCount).padStart(2, '0')}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Main Display */}
//         <div 
//           className={`${compact ? 'p-3' : 'p-6'}`}
//           style={{ background: '#1a1a1a', boxShadow: 'inset 0 5px 20px rgba(0,0,0,0.8)' }}
//         >
//           <div className={`flex justify-center items-center ${compact ? 'gap-1 mb-2' : 'gap-2 mb-4'}`}>
//             {displayDigits.map((digit, index) => (
//               <SpinningDigit
//                 key={`digit-${index}`}
//                 digit={digit}
//                 isSpinning={isSpinning}
//                 spinPhase={spinPhase}
//                 slowdownProgress={slowdownProgress}
//                 randomOffset={randomOffsets[index] || 0}
//                 compact={compact}
//               />
//             ))}
//           </div>

//           {/* Status */}
//           <div className="text-center">
//             {!isElectionEnded && totalEntries < 1 && (
//               <div className={`inline-flex items-center gap-1.5 bg-yellow-500/20 border border-yellow-500 rounded-full ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <span className={`text-yellow-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
//                   ⏳ Waiting for voters... ({totalEntries}/1)
//                 </span>
//               </div>
//             )}

//             {!isElectionEnded && totalEntries >= 1 && isSpinning && spinPhase === 'continuous' && (
//               <div className={`inline-flex items-center gap-1.5 bg-green-500/20 border border-green-500 rounded-full ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <div className={`bg-green-500 rounded-full animate-pulse ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} />
//                 <span className={`text-green-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
//                   Spinning... Drawing at end
//                 </span>
//               </div>
//             )}

//             {revealingWinner && currentRevealIndex >= 0 && (
//               <div className={`inline-flex items-center gap-1.5 bg-purple-500/20 border border-purple-500 rounded-full ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <span className={`text-purple-400 font-medium animate-pulse ${compact ? 'text-xs' : 'text-sm'}`}>
//                   🎊 Revealing {getOrdinal(currentRevealIndex + 1)} Lucky Voter...
//                 </span>
//               </div>
//             )}

//             {isElectionEnded && !revealingWinner && revealedWinners.length > 0 && (
//               <div className={`inline-flex items-center gap-1.5 bg-green-500/20 border border-green-500 rounded-full ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <span className={`text-green-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
//                   ✅ All {revealedWinners.length} Lucky Voter(s) Revealed!
//                 </span>
//               </div>
//             )}

//             {isLoadingParticipants && totalEntries === 0 && (
//               <div className={`inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-500 rounded-full mt-2 ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <RefreshCw className={`text-blue-400 animate-spin ${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
//                 <span className={`text-blue-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>Loading...</span>
//               </div>
//             )}

//             {fetchError && (
//               <div className={`inline-flex items-center gap-1.5 bg-red-500/20 border border-red-500 rounded-full mt-2 ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <span className={`text-red-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>⚠️ {fetchError}</span>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Winners */}
//         {revealedWinners.length > 0 && (
//           <div 
//             className={`border-t-2 border-yellow-600 ${compact ? 'px-2 py-2' : 'px-4 py-4'}`}
//             style={{ background: 'linear-gradient(180deg, #c9972a 0%, #b8860b 100%)' }}
//           >
//             <h3 className={`text-yellow-900 font-bold mb-2 text-center ${compact ? 'text-sm' : 'text-lg'}`}>
//               🏆 LUCKY VOTERS WINNERS 🏆
//             </h3>
            
//             <div className="space-y-1.5">
//               {revealedWinners.map((winner, index) => (
//                 <div 
//                   key={index}
//                   className={`bg-white rounded-lg flex items-center justify-between shadow-md ${compact ? 'px-2 py-1.5' : 'px-4 py-3'}`}
//                 >
//                   <div className="flex items-center gap-2">
//                     <div className={`bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 font-black rounded-full flex items-center justify-center shadow ${compact ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm'}`}>
//                       {getOrdinal(index + 1)}
//                     </div>
//                     <div>
//                       <p className={`font-bold text-gray-900 ${compact ? 'text-xs' : ''}`}>
//                         {winner.displayName || winner.username || winner.name || 'Lucky Voter'}
//                       </p>
//                       <p className={`text-gray-500 font-mono ${compact ? 'text-xs' : 'text-sm'}`}>
//                         Ball #: {winner.ballNumber}
//                       </p>
//                     </div>
//                   </div>
//                   <span className={compact ? 'text-xl' : 'text-3xl'}>🏆</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Footer */}
//         <div 
//           className={`border-t border-yellow-700 flex justify-between items-center ${compact ? 'px-2 py-1.5' : 'px-4 py-2'}`}
//           style={{ background: 'linear-gradient(180deg, #c9972a 0%, #b8860b 100%)' }}
//         >
//           <div className={`flex items-center gap-1.5 text-gray-900 ${compact ? 'text-xs' : ''}`}>
//             <Users className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
//             <span className={compact ? 'text-xs' : 'text-sm'}>
//               Total Entries: <strong>{totalEntries}</strong>
//             </span>
//           </div>
          
//           <div className="flex items-center gap-2">
//             {!isElectionEnded && totalEntries >= 1 && (
//               <button
//                 onClick={() => setShowDemoModal(true)}
//                 className={`flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white rounded transition ${compact ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xs'}`}
//               >
//                 <Eye className="w-3 h-3" />
//                 <span>Demo</span>
//               </button>
//             )}
            
//             <div className={`flex items-center gap-1.5 ${compact ? 'text-xs' : 'text-sm'} ${
//               isSpinning ? 'text-green-700' : isElectionEnded ? 'text-blue-700' : 'text-yellow-800'
//             }`}>
//               <span className={`rounded-full ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'} ${
//                 isSpinning ? 'bg-green-500 animate-pulse' : isElectionEnded ? 'bg-blue-500' : 'bg-yellow-600'
//               }`} />
//               <span className="font-semibold">
//                 {isSpinning ? 'SPINNING' : isElectionEnded ? 'COMPLETED' : 'WAITING'}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       <DemoWinnerReveal
//         isOpen={showDemoModal}
//         onClose={() => setShowDemoModal(false)}
//         realBallNumbers={participants}
//         realLuckyVotersCount={actualLuckyVotersCount}
//         realTotalEntries={totalEntries}
//         compact={compact}
//       />
//     </>
//   );
// }
// // src/components/Dashboard/Tabs/lotteryyy/LotterySlotMachine.jsx
// // 4D Slot Machine
// // DURING ELECTION: Continuous spinning showing actual voter IDs
// // AT ELECTION END: For each winner - Fast spin (1 sec) → Gradual slow with haphazard (up/down) → Stop aligned
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { Users, RefreshCw, Eye } from 'lucide-react';
// import DemoWinnerReveal from './DemoWinnerReveal';

// const LOTTERY_API_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api';

// // Spinning digit - haphazard = different vertical positions, disciplined = aligned center
// const SpinningDigit = ({ 
//   digit,
//   isSpinning,
//   spinPhase, // 'continuous' | 'fast' | 'slowing' | 'stopped'
//   slowdownProgress,
//   randomOffset = 0, // Each digit gets different random offset for haphazard effect
//   compact = false
// }) => {
//   const [currentDigit, setCurrentDigit] = useState(digit || '0');
//   const [nextDigit, setNextDigit] = useState('0');
//   const [offsetY, setOffsetY] = useState(0);
//   const animationRef = useRef(null);
//   const isSpinningRef = useRef(isSpinning);
//   const phaseRef = useRef(spinPhase);
//   const progressRef = useRef(slowdownProgress);
  
//   const digitHeight = compact ? 50 : 90;
//   const continuousSpeed = compact ? 10 : 15;
//   const fastSpeed = compact ? 22 : 35;
//   const minSpeed = compact ? 1 : 2;
  
//   useEffect(() => {
//     isSpinningRef.current = isSpinning;
//     phaseRef.current = spinPhase;
//     progressRef.current = slowdownProgress;
//   }, [isSpinning, spinPhase, slowdownProgress]);

//   useEffect(() => {
//     if (!isSpinning) {
//       setCurrentDigit(digit || '0');
//       setOffsetY(0);
//     }
//   }, [digit, isSpinning]);

//   useEffect(() => {
//     if (isSpinning) {
//       let offset = randomOffset; // Start at random position for haphazard
//       let currDigit = Math.floor(Math.random() * 10);
//       let nxtDigit = Math.floor(Math.random() * 10);
      
//       setCurrentDigit(String(currDigit));
//       setNextDigit(String(nxtDigit));
      
//       const animate = () => {
//         if (!isSpinningRef.current) return;
        
//         const phase = phaseRef.current;
//         const progress = progressRef.current;
        
//         let speed;
        
//         if (phase === 'continuous') {
//           speed = continuousSpeed;
//         } else if (phase === 'fast') {
//           speed = fastSpeed;
//         } else if (phase === 'slowing') {
//           // Gradually slow down
//           const easeProgress = 1 - Math.pow(1 - progress, 3);
//           speed = fastSpeed - (fastSpeed - minSpeed) * easeProgress;
          
//           if (speed <= minSpeed && progress >= 0.98) {
//             return;
//           }
//         } else {
//           return;
//         }
        
//         offset -= speed;
        
//         if (offset <= -digitHeight) {
//           offset = 0;
//           currDigit = nxtDigit;
//           nxtDigit = Math.floor(Math.random() * 10);
//           setCurrentDigit(String(currDigit));
//           setNextDigit(String(nxtDigit));
//         }
        
//         setOffsetY(offset);
//         animationRef.current = requestAnimationFrame(animate);
//       };
      
//       animationRef.current = requestAnimationFrame(animate);
      
//       return () => {
//         if (animationRef.current) cancelAnimationFrame(animationRef.current);
//       };
//     } else {
//       // When stopped, align to center (offset = 0)
//       setOffsetY(0);
//       setCurrentDigit(digit || '0');
//       if (animationRef.current) {
//         cancelAnimationFrame(animationRef.current);
//         animationRef.current = null;
//       }
//     }
//   }, [isSpinning, digit, digitHeight, continuousSpeed, fastSpeed, minSpeed, randomOffset]);

//   const fontSize = compact ? 'text-4xl' : 'text-6xl sm:text-7xl';
//   const containerWidth = compact ? 40 : 70;
//   const containerHeightVal = compact ? 50 : 90;

//   return (
//     <div 
//       className="relative overflow-hidden rounded-lg"
//       style={{
//         width: `${containerWidth}px`,
//         height: `${containerHeightVal}px`,
//         background: 'linear-gradient(180deg, #7f1d1d 0%, #991b1b 20%, #b91c1c 50%, #991b1b 80%, #7f1d1d 100%)',
//         boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.7), inset 0 -4px 20px rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.4)',
//         border: '3px solid #1f2937',
//         borderRadius: '8px'
//       }}
//     >
//       <div 
//         className="absolute w-full"
//         style={{ 
//           transform: `translateY(${offsetY}px)`,
//           transition: isSpinning ? 'none' : 'transform 0.4s ease-out'
//         }}
//       >
//         <div className="flex items-center justify-center" style={{ height: `${digitHeight}px` }}>
//           <span 
//             className={`font-black text-white ${fontSize}`}
//             style={{ 
//               fontFamily: 'Impact, "Arial Black", sans-serif',
//               textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
//             }}
//           >
//             {currentDigit}
//           </span>
//         </div>
//         <div className="flex items-center justify-center" style={{ height: `${digitHeight}px` }}>
//           <span 
//             className={`font-black text-white ${fontSize}`}
//             style={{ 
//               fontFamily: 'Impact, "Arial Black", sans-serif',
//               textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
//             }}
//           >
//             {nextDigit}
//           </span>
//         </div>
//       </div>
      
//       <div 
//         className="absolute top-0 left-0 right-0 pointer-events-none z-10"
//         style={{
//           height: '35%',
//           background: 'linear-gradient(to bottom, rgba(55,0,0,0.95) 0%, rgba(55,0,0,0.5) 50%, transparent 100%)'
//         }}
//       />
      
//       <div 
//         className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
//         style={{
//           height: '35%',
//           background: 'linear-gradient(to top, rgba(55,0,0,0.95) 0%, rgba(55,0,0,0.5) 50%, transparent 100%)'
//         }}
//       />
//     </div>
//   );
// };

// export default function LotterySlotMachine({ 
//   electionId,
//   electionEndDate,
//   luckyVotersCount = 1,
//   isElectionEnded = false,
//   winners = [],
//   isActive = true,
//   compact = false,
// }) {
//   const [displayDigits, setDisplayDigits] = useState(['0', '0', '0', '0', '0', '0']);
//   const [isSpinning, setIsSpinning] = useState(false);
//   const [spinPhase, setSpinPhase] = useState('stopped');
//   const [slowdownProgress, setSlowdownProgress] = useState(0);
//   const [randomOffsets, setRandomOffsets] = useState([0, 0, 0, 0, 0, 0]);
//   const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
//   const [revealedWinners, setRevealedWinners] = useState([]);
//   const [currentRevealIndex, setCurrentRevealIndex] = useState(-1);
//   const [revealingWinner, setRevealingWinner] = useState(false);
  
//   const [participants, setParticipants] = useState([]);
//   const [totalEntries, setTotalEntries] = useState(0);
//   const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
//   const [fetchError, setFetchError] = useState(null);
//   const [actualLuckyVotersCount, setActualLuckyVotersCount] = useState(luckyVotersCount);
  
//   const [showDemoModal, setShowDemoModal] = useState(false);
  
//   const fetchIntervalRef = useRef(null);
//   const displayIntervalRef = useRef(null);
//   const slowdownIntervalRef = useRef(null);

//   // Generate random offsets for haphazard effect (different Y position for each digit)
//   const generateRandomOffsets = useCallback(() => {
//     const digitHeight = compact ? 50 : 90;
//     return displayDigits.map(() => -Math.floor(Math.random() * (digitHeight * 0.6)));
//   }, [displayDigits.length, compact]);

//   const fetchBallNumbers = useCallback(async () => {
//     if (!electionId) return;
    
//     try {
//       setIsLoadingParticipants(true);
//       setFetchError(null);
      
//       const response = await fetch(
//         `${LOTTERY_API_URL}/lottery/elections/${electionId}/ball-numbers`
//       );
      
//       if (!response.ok) throw new Error(`Failed: ${response.status}`);
      
//       const data = await response.json();
//       console.log('🎰 Ball numbers fetched:', data);
      
//       const ballNumbers = [];
//       const nums = data.ballNumbers || data.ball_numbers || [];
//       nums.forEach(ballNum => {
//         if (ballNum) ballNumbers.push(String(ballNum));
//       });
      
//       setParticipants(ballNumbers);
//       setTotalEntries(data.totalParticipants || data.total_participants || ballNumbers.length);
      
//       if (data.luckyVotersCount || data.lucky_voters_count) {
//         setActualLuckyVotersCount(data.luckyVotersCount || data.lucky_voters_count);
//       }
      
//       if (ballNumbers.length > 0) {
//         const maxDigits = Math.max(...ballNumbers.map(b => b.length));
//         if (maxDigits !== displayDigits.length) {
//           setDisplayDigits(Array(maxDigits).fill('0'));
//           setRandomOffsets(Array(maxDigits).fill(0));
//         }
//       }
//     } catch (error) {
//       console.error('❌ Error:', error);
//       setFetchError(error.message);
//     } finally {
//       setIsLoadingParticipants(false);
//     }
//   }, [electionId, displayDigits.length]);

//   useEffect(() => {
//     if (electionId && isActive) {
//       fetchBallNumbers();
//       fetchIntervalRef.current = setInterval(fetchBallNumbers, 10000);
//       return () => {
//         if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current);
//       };
//     }
//   }, [electionId, isActive, fetchBallNumbers]);

//   const getRandomVoterId = useCallback(() => {
//     if (participants.length > 0) {
//       const idx = Math.floor(Math.random() * participants.length);
//       return participants[idx].padStart(displayDigits.length, '0');
//     }
//     const min = Math.pow(10, displayDigits.length - 1);
//     const max = Math.pow(10, displayDigits.length) - 1;
//     return String(Math.floor(min + Math.random() * (max - min)));
//   }, [participants, displayDigits.length]);

//   useEffect(() => {
//     if (!electionEndDate) return;

//     const updateCountdown = () => {
//       const now = new Date().getTime();
//       const end = new Date(electionEndDate).getTime();
//       const diff = Math.max(0, end - now);

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

//   const startContinuousSpinning = useCallback(() => {
//     setIsSpinning(true);
//     setSpinPhase('continuous');
//     setRandomOffsets(generateRandomOffsets());
    
//     displayIntervalRef.current = setInterval(() => {
//       const voterId = getRandomVoterId();
//       setDisplayDigits(voterId.split(''));
//     }, 150);
//   }, [getRandomVoterId, generateRandomOffsets]);

//   const stopContinuousSpinning = useCallback(() => {
//     if (displayIntervalRef.current) {
//       clearInterval(displayIntervalRef.current);
//       displayIntervalRef.current = null;
//     }
//     setIsSpinning(false);
//     setSpinPhase('stopped');
//   }, []);

//   useEffect(() => {
//     if (isActive && totalEntries >= 1 && !isElectionEnded && !revealingWinner) {
//       startContinuousSpinning();
//     } else if (isElectionEnded || revealingWinner) {
//       stopContinuousSpinning();
//     } else if (totalEntries < 1) {
//       stopContinuousSpinning();
//     }
    
//     return () => stopContinuousSpinning();
//   }, [isActive, totalEntries, isElectionEnded, revealingWinner, startContinuousSpinning, stopContinuousSpinning]);

//   useEffect(() => {
//     if (isElectionEnded && winners.length > 0 && revealedWinners.length === 0 && !revealingWinner) {
//       revealWinnersSequentially();
//     }
//   }, [isElectionEnded, winners, revealedWinners.length, revealingWinner]);

//   const revealSingleWinner = async (winnerIndex) => {
//     const FAST_PHASE_DURATION = 1000; // 1 second fast
//     const SLOW_PHASE_DURATION = 2500; // 2.5 seconds to slow down
    
//     // Generate random offsets for haphazard effect
//     setRandomOffsets(generateRandomOffsets());
    
//     // Fast phase - same speed, straight numbers
//     setIsSpinning(true);
//     setSpinPhase('fast');
//     setSlowdownProgress(0);
    
//     const fastInterval = setInterval(() => {
//       const voterId = getRandomVoterId();
//       setDisplayDigits(voterId.split(''));
//       // Update random offsets periodically for haphazard movement
//       setRandomOffsets(generateRandomOffsets());
//     }, 60);
    
//     await new Promise(resolve => setTimeout(resolve, FAST_PHASE_DURATION));
    
//     clearInterval(fastInterval);
    
//     // Slowing phase - digits at different vertical positions (haphazard)
//     setSpinPhase('slowing');
    
//     const slowdownStartTime = Date.now();
    
//     await new Promise(resolve => {
//       let lastUpdate = 0;
//       slowdownIntervalRef.current = setInterval(() => {
//         const elapsed = Date.now() - slowdownStartTime;
//         const progress = Math.min(elapsed / SLOW_PHASE_DURATION, 1);
//         setSlowdownProgress(progress);
        
//         // Update display less frequently as we slow down
//         const updateInterval = 60 + progress * 400;
//         if (elapsed - lastUpdate > updateInterval) {
//           const voterId = getRandomVoterId();
//           setDisplayDigits(voterId.split(''));
//           // Gradually reduce randomness of offsets as we slow down
//           const offsetScale = 1 - progress;
//           setRandomOffsets(prev => prev.map(() => 
//             -Math.floor(Math.random() * ((compact ? 50 : 90) * 0.6 * offsetScale))
//           ));
//           lastUpdate = elapsed;
//         }
        
//         if (progress >= 1) {
//           clearInterval(slowdownIntervalRef.current);
//           resolve();
//         }
//       }, 16);
//     });
    
//     // Stop - all digits align to center
//     setIsSpinning(false);
//     setSpinPhase('stopped');
//     setSlowdownProgress(0);
//     setRandomOffsets(displayDigits.map(() => 0)); // All aligned
    
//     await new Promise(resolve => setTimeout(resolve, 300));
    
//     // Show winner's number
//     const winner = winners[winnerIndex];
//     const winnerBallNumber = String(
//       winner.ball_number ||
//       winner.ballNumber ||
//       winner.oddjob_voter_id || 
//       winner.oddjobVoterId || 
//       winner.voterId ||
//       winner.voter_id ||
//       winner.id || 
//       '000000'
//     ).padStart(displayDigits.length, '0');
    
//     setDisplayDigits(winnerBallNumber.split(''));
    
//     return {
//       ...winner,
//       ballNumber: winnerBallNumber,
//       rank: winnerIndex + 1
//     };
//   };

//   const revealWinnersSequentially = async () => {
//     setRevealingWinner(true);
//     stopContinuousSpinning();
    
//     for (let i = 0; i < winners.length; i++) {
//       setCurrentRevealIndex(i);
      
//       const revealedWinner = await revealSingleWinner(i);
//       setRevealedWinners(prev => [...prev, revealedWinner]);
      
//       if (i < winners.length - 1) {
//         await new Promise(resolve => setTimeout(resolve, 2500));
//       }
//     }
    
//     setCurrentRevealIndex(-1);
//     setRevealingWinner(false);
//   };

//   const formatCountdown = () => {
//     const { days, hours, minutes, seconds } = countdown;
//     const pad = (n) => String(n).padStart(2, '0');
    
//     if (days > 0) {
//       return `${pad(days)}:${pad(hours)}:${pad(minutes)}`;
//     }
//     return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
//   };

//   const getOrdinal = (n) => {
//     const s = ['th', 'st', 'nd', 'rd'];
//     const v = n % 100;
//     return n + (s[(v - 20) % 10] || s[v] || s[0]);
//   };

//   return (
//     <>
//       <div 
//         className={`rounded-xl overflow-hidden shadow-2xl ${compact ? 'text-sm' : ''}`}
//         style={{
//           background: 'linear-gradient(180deg, #d4a418 0%, #c9972a 50%, #b8860b 100%)',
//           border: '4px solid #8B7500',
//           boxShadow: '0 10px 40px rgba(0,0,0,0.4)'
//         }}
//       >
//         {/* Header */}
//         <div 
//           className={`flex justify-between items-center ${compact ? 'px-2 py-1.5' : 'px-4 py-3'}`}
//           style={{ background: 'linear-gradient(180deg, #d4a418 0%, #c9972a 100%)' }}
//         >
//           <div className="flex items-center gap-2">
//             <span className={`text-gray-900 font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>
//               Date & Time:
//             </span>
//             <div 
//               className={`rounded ${compact ? 'px-2 py-0.5' : 'px-3 py-1'}`}
//               style={{ background: '#1a1a1a', border: '2px solid #333' }}
//             >
//               <span 
//                 className={`font-bold ${compact ? 'text-sm' : 'text-lg'}`}
//                 style={{ 
//                   fontFamily: '"Courier New", monospace',
//                   color: '#00ff00',
//                   textShadow: '0 0 8px #00ff00, 0 0 12px #00ff00',
//                   letterSpacing: '2px'
//                 }}
//               >
//                 {formatCountdown()}
//               </span>
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             <span className={`text-gray-900 font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>
//               Lucky Voters No:
//             </span>
//             <div 
//               className={`rounded ${compact ? 'px-2 py-0.5' : 'px-3 py-1'}`}
//               style={{ background: '#1a1a1a', border: '2px solid #333' }}
//             >
//               <span 
//                 className={`font-bold ${compact ? 'text-sm' : 'text-lg'}`}
//                 style={{ 
//                   fontFamily: '"Courier New", monospace',
//                   color: '#00ff00',
//                   textShadow: '0 0 8px #00ff00, 0 0 12px #00ff00',
//                   letterSpacing: '2px'
//                 }}
//               >
//                 {String(actualLuckyVotersCount).padStart(2, '0')}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Main Display */}
//         <div 
//           className={`${compact ? 'p-3' : 'p-6'}`}
//           style={{ background: '#1a1a1a', boxShadow: 'inset 0 5px 20px rgba(0,0,0,0.8)' }}
//         >
//           <div className={`flex justify-center items-center ${compact ? 'gap-1 mb-2' : 'gap-2 mb-4'}`}>
//             {displayDigits.map((digit, index) => (
//               <SpinningDigit
//                 key={`digit-${index}`}
//                 digit={digit}
//                 isSpinning={isSpinning}
//                 spinPhase={spinPhase}
//                 slowdownProgress={slowdownProgress}
//                 randomOffset={randomOffsets[index] || 0}
//                 compact={compact}
//               />
//             ))}
//           </div>

//           {/* Status */}
//           <div className="text-center">
//             {!isElectionEnded && totalEntries < 1 && (
//               <div className={`inline-flex items-center gap-1.5 bg-yellow-500/20 border border-yellow-500 rounded-full ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <span className={`text-yellow-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
//                   ⏳ Waiting for voters... ({totalEntries}/1)
//                 </span>
//               </div>
//             )}

//             {!isElectionEnded && totalEntries >= 1 && isSpinning && spinPhase === 'continuous' && (
//               <div className={`inline-flex items-center gap-1.5 bg-green-500/20 border border-green-500 rounded-full ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <div className={`bg-green-500 rounded-full animate-pulse ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} />
//                 <span className={`text-green-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
//                   Spinning... Drawing at end
//                 </span>
//               </div>
//             )}

//             {revealingWinner && currentRevealIndex >= 0 && (
//               <div className={`inline-flex items-center gap-1.5 bg-purple-500/20 border border-purple-500 rounded-full ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <span className={`text-purple-400 font-medium animate-pulse ${compact ? 'text-xs' : 'text-sm'}`}>
//                   🎊 Revealing {getOrdinal(currentRevealIndex + 1)} Lucky Voter...
//                 </span>
//               </div>
//             )}

//             {isElectionEnded && !revealingWinner && revealedWinners.length > 0 && (
//               <div className={`inline-flex items-center gap-1.5 bg-green-500/20 border border-green-500 rounded-full ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <span className={`text-green-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
//                   ✅ All {revealedWinners.length} Lucky Voter(s) Revealed!
//                 </span>
//               </div>
//             )}

//             {isLoadingParticipants && totalEntries === 0 && (
//               <div className={`inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-500 rounded-full mt-2 ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <RefreshCw className={`text-blue-400 animate-spin ${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
//                 <span className={`text-blue-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>Loading...</span>
//               </div>
//             )}

//             {fetchError && (
//               <div className={`inline-flex items-center gap-1.5 bg-red-500/20 border border-red-500 rounded-full mt-2 ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <span className={`text-red-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>⚠️ {fetchError}</span>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Winners */}
//         {revealedWinners.length > 0 && (
//           <div 
//             className={`border-t-2 border-yellow-600 ${compact ? 'px-2 py-2' : 'px-4 py-4'}`}
//             style={{ background: 'linear-gradient(180deg, #c9972a 0%, #b8860b 100%)' }}
//           >
//             <h3 className={`text-yellow-900 font-bold mb-2 text-center ${compact ? 'text-sm' : 'text-lg'}`}>
//               🏆 LUCKY VOTERS WINNERS 🏆
//             </h3>
            
//             <div className="space-y-1.5">
//               {revealedWinners.map((winner, index) => (
//                 <div 
//                   key={index}
//                   className={`bg-white rounded-lg flex items-center justify-between shadow-md ${compact ? 'px-2 py-1.5' : 'px-4 py-3'}`}
//                 >
//                   <div className="flex items-center gap-2">
//                     <div className={`bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 font-black rounded-full flex items-center justify-center shadow ${compact ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm'}`}>
//                       {getOrdinal(index + 1)}
//                     </div>
//                     <div>
//                       <p className={`font-bold text-gray-900 ${compact ? 'text-xs' : ''}`}>
//                         {winner.displayName || winner.username || winner.name || 'Lucky Voter'}
//                       </p>
//                       <p className={`text-gray-500 font-mono ${compact ? 'text-xs' : 'text-sm'}`}>
//                         Ball #: {winner.ballNumber}
//                       </p>
//                     </div>
//                   </div>
//                   <span className={compact ? 'text-xl' : 'text-3xl'}>🏆</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Footer */}
//         <div 
//           className={`border-t border-yellow-700 flex justify-between items-center ${compact ? 'px-2 py-1.5' : 'px-4 py-2'}`}
//           style={{ background: 'linear-gradient(180deg, #c9972a 0%, #b8860b 100%)' }}
//         >
//           <div className={`flex items-center gap-1.5 text-gray-900 ${compact ? 'text-xs' : ''}`}>
//             <Users className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
//             <span className={compact ? 'text-xs' : 'text-sm'}>
//               Total Entries: <strong>{totalEntries}</strong>
//             </span>
//           </div>
          
//           <div className="flex items-center gap-2">
//             {!isElectionEnded && totalEntries >= 1 && (
//               <button
//                 onClick={() => setShowDemoModal(true)}
//                 className={`flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white rounded transition ${compact ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xs'}`}
//               >
//                 <Eye className="w-3 h-3" />
//                 <span>Demo</span>
//               </button>
//             )}
            
//             <div className={`flex items-center gap-1.5 ${compact ? 'text-xs' : 'text-sm'} ${
//               isSpinning ? 'text-green-700' : isElectionEnded ? 'text-blue-700' : 'text-yellow-800'
//             }`}>
//               <span className={`rounded-full ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'} ${
//                 isSpinning ? 'bg-green-500 animate-pulse' : isElectionEnded ? 'bg-blue-500' : 'bg-yellow-600'
//               }`} />
//               <span className="font-semibold">
//                 {isSpinning ? 'SPINNING' : isElectionEnded ? 'COMPLETED' : 'WAITING'}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       <DemoWinnerReveal
//         isOpen={showDemoModal}
//         onClose={() => setShowDemoModal(false)}
//         realBallNumbers={participants}
//         realLuckyVotersCount={actualLuckyVotersCount}
//         realTotalEntries={totalEntries}
//         compact={compact}
//       />
//     </>
//   );
// }
// // src/components/Dashboard/Tabs/lotteryyy/LotterySlotMachine.jsx
// // 4D Slot Machine
// // DURING ELECTION: Continuous spinning showing actual voter IDs
// // AT ELECTION END: Reveal each winner (fast spin → gradual slow → stop → show winner)
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { Users, RefreshCw, Eye } from 'lucide-react';
// import DemoWinnerReveal from './DemoWinnerReveal';

// const LOTTERY_API_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api';

// // Spinning digit component
// const SpinningDigit = ({ 
//   digit,
//   isSpinning,
//   spinPhase, // 'continuous' | 'fast' | 'slowing' | 'stopped'
//   slowdownProgress,
//   compact = false
// }) => {
//   const [currentDigit, setCurrentDigit] = useState(digit || '0');
//   const [nextDigit, setNextDigit] = useState('0');
//   const [offsetY, setOffsetY] = useState(0);
//   const [tiltAngle, setTiltAngle] = useState(0);
//   const animationRef = useRef(null);
//   const isSpinningRef = useRef(isSpinning);
//   const phaseRef = useRef(spinPhase);
//   const progressRef = useRef(slowdownProgress);
  
//   const digitHeight = compact ? 50 : 90;
//   const continuousSpeed = compact ? 8 : 12; // Slower continuous speed during election
//   const fastSpeed = compact ? 20 : 32; // Fast speed during reveal
//   const minSpeed = compact ? 1 : 2;
//   const maxTilt = 15;
  
//   useEffect(() => {
//     isSpinningRef.current = isSpinning;
//     phaseRef.current = spinPhase;
//     progressRef.current = slowdownProgress;
//   }, [isSpinning, spinPhase, slowdownProgress]);

//   useEffect(() => {
//     if (!isSpinning) {
//       setCurrentDigit(digit || '0');
//       setTiltAngle(0);
//       setOffsetY(0);
//     }
//   }, [digit, isSpinning]);

//   useEffect(() => {
//     if (isSpinning) {
//       let offset = 0;
//       let currDigit = Math.floor(Math.random() * 10);
//       let nxtDigit = Math.floor(Math.random() * 10);
      
//       setCurrentDigit(String(currDigit));
//       setNextDigit(String(nxtDigit));
      
//       const animate = () => {
//         if (!isSpinningRef.current) return;
        
//         const phase = phaseRef.current;
//         const progress = progressRef.current;
        
//         let speed;
//         let tiltAmount;
        
//         if (phase === 'continuous') {
//           // During election: smooth continuous spinning, slight tilt
//           speed = continuousSpeed;
//           tiltAmount = 5; // Slight tilt during continuous
//         } else if (phase === 'fast') {
//           // Reveal phase 1: Fast spinning with full tilt
//           speed = fastSpeed;
//           tiltAmount = maxTilt;
//         } else if (phase === 'slowing') {
//           // Reveal phase 2: Gradually slow, reduce tilt
//           const easeProgress = 1 - Math.pow(1 - progress, 3);
//           speed = fastSpeed - (fastSpeed - minSpeed) * easeProgress;
//           tiltAmount = maxTilt * (1 - easeProgress);
          
//           if (speed <= minSpeed && progress >= 0.98) {
//             return;
//           }
//         } else {
//           return;
//         }
        
//         // Random tilt
//         const newTilt = (Math.random() - 0.5) * 2 * tiltAmount;
//         setTiltAngle(newTilt);
        
//         offset -= speed;
        
//         if (offset <= -digitHeight) {
//           offset = 0;
//           currDigit = nxtDigit;
//           nxtDigit = Math.floor(Math.random() * 10);
//           setCurrentDigit(String(currDigit));
//           setNextDigit(String(nxtDigit));
//         }
        
//         setOffsetY(offset);
//         animationRef.current = requestAnimationFrame(animate);
//       };
      
//       animationRef.current = requestAnimationFrame(animate);
      
//       return () => {
//         if (animationRef.current) cancelAnimationFrame(animationRef.current);
//       };
//     } else {
//       setOffsetY(0);
//       setTiltAngle(0);
//       setCurrentDigit(digit || '0');
//       if (animationRef.current) {
//         cancelAnimationFrame(animationRef.current);
//         animationRef.current = null;
//       }
//     }
//   }, [isSpinning, digit, digitHeight, continuousSpeed, fastSpeed, minSpeed, maxTilt]);

//   const fontSize = compact ? 'text-4xl' : 'text-6xl sm:text-7xl';
//   const containerWidth = compact ? 40 : 70;
//   const containerHeightVal = compact ? 50 : 90;

//   return (
//     <div 
//       className="relative overflow-hidden rounded-lg"
//       style={{
//         width: `${containerWidth}px`,
//         height: `${containerHeightVal}px`,
//         background: 'linear-gradient(180deg, #7f1d1d 0%, #991b1b 20%, #b91c1c 50%, #991b1b 80%, #7f1d1d 100%)',
//         boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.7), inset 0 -4px 20px rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.4)',
//         border: '3px solid #1f2937',
//         borderRadius: '8px'
//       }}
//     >
//       <div 
//         className="absolute w-full"
//         style={{ 
//           transform: `translateY(${offsetY}px) rotate(${tiltAngle}deg)`,
//           transition: isSpinning ? 'none' : 'transform 0.3s ease-out'
//         }}
//       >
//         <div className="flex items-center justify-center" style={{ height: `${digitHeight}px` }}>
//           <span 
//             className={`font-black text-white ${fontSize}`}
//             style={{ 
//               fontFamily: 'Impact, "Arial Black", sans-serif',
//               textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
//             }}
//           >
//             {currentDigit}
//           </span>
//         </div>
//         <div className="flex items-center justify-center" style={{ height: `${digitHeight}px` }}>
//           <span 
//             className={`font-black text-white ${fontSize}`}
//             style={{ 
//               fontFamily: 'Impact, "Arial Black", sans-serif',
//               textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
//             }}
//           >
//             {nextDigit}
//           </span>
//         </div>
//       </div>
      
//       <div 
//         className="absolute top-0 left-0 right-0 pointer-events-none z-10"
//         style={{
//           height: '35%',
//           background: 'linear-gradient(to bottom, rgba(55,0,0,0.95) 0%, rgba(55,0,0,0.5) 50%, transparent 100%)'
//         }}
//       />
      
//       <div 
//         className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
//         style={{
//           height: '35%',
//           background: 'linear-gradient(to top, rgba(55,0,0,0.95) 0%, rgba(55,0,0,0.5) 50%, transparent 100%)'
//         }}
//       />
//     </div>
//   );
// };

// export default function LotterySlotMachine({ 
//   electionId,
//   electionEndDate,
//   luckyVotersCount = 1,
//   isElectionEnded = false,
//   winners = [],
//   isActive = true,
//   compact = false,
// }) {
//   const [displayDigits, setDisplayDigits] = useState(['0', '0', '0', '0', '0', '0']);
//   const [isSpinning, setIsSpinning] = useState(false);
//   const [spinPhase, setSpinPhase] = useState('stopped'); // 'continuous' | 'fast' | 'slowing' | 'stopped'
//   const [slowdownProgress, setSlowdownProgress] = useState(0);
//   const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
//   const [revealedWinners, setRevealedWinners] = useState([]);
//   const [currentRevealIndex, setCurrentRevealIndex] = useState(-1);
//   const [revealingWinner, setRevealingWinner] = useState(false);
  
//   const [participants, setParticipants] = useState([]);
//   const [totalEntries, setTotalEntries] = useState(0);
//   const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
//   const [fetchError, setFetchError] = useState(null);
//   const [actualLuckyVotersCount, setActualLuckyVotersCount] = useState(luckyVotersCount);
  
//   const [showDemoModal, setShowDemoModal] = useState(false);
  
//   const fetchIntervalRef = useRef(null);
//   const displayIntervalRef = useRef(null);
//   const slowdownIntervalRef = useRef(null);

//   // Fetch ball numbers
//   const fetchBallNumbers = useCallback(async () => {
//     if (!electionId) return;
    
//     try {
//       setIsLoadingParticipants(true);
//       setFetchError(null);
      
//       const response = await fetch(
//         `${LOTTERY_API_URL}/lottery/elections/${electionId}/ball-numbers`
//       );
      
//       if (!response.ok) throw new Error(`Failed: ${response.status}`);
      
//       const data = await response.json();
//       console.log('🎰 Ball numbers fetched:', data);
      
//       const ballNumbers = [];
//       const nums = data.ballNumbers || data.ball_numbers || [];
//       nums.forEach(ballNum => {
//         if (ballNum) ballNumbers.push(String(ballNum));
//       });
      
//       setParticipants(ballNumbers);
//       setTotalEntries(data.totalParticipants || data.total_participants || ballNumbers.length);
      
//       if (data.luckyVotersCount || data.lucky_voters_count) {
//         setActualLuckyVotersCount(data.luckyVotersCount || data.lucky_voters_count);
//       }
      
//       if (ballNumbers.length > 0) {
//         const maxDigits = Math.max(...ballNumbers.map(b => b.length));
//         if (maxDigits !== displayDigits.length) {
//           setDisplayDigits(Array(maxDigits).fill('0'));
//         }
//       }
//     } catch (error) {
//       console.error('❌ Error:', error);
//       setFetchError(error.message);
//     } finally {
//       setIsLoadingParticipants(false);
//     }
//   }, [electionId, displayDigits.length]);

//   useEffect(() => {
//     if (electionId && isActive) {
//       fetchBallNumbers();
//       fetchIntervalRef.current = setInterval(fetchBallNumbers, 10000);
//       return () => {
//         if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current);
//       };
//     }
//   }, [electionId, isActive, fetchBallNumbers]);

//   // Get random voter ID from participants
//   const getRandomVoterId = useCallback(() => {
//     if (participants.length > 0) {
//       const idx = Math.floor(Math.random() * participants.length);
//       return participants[idx].padStart(displayDigits.length, '0');
//     }
//     // Fallback: generate random number
//     const digitCount = displayDigits.length;
//     const min = Math.pow(10, digitCount - 1);
//     const max = Math.pow(10, digitCount) - 1;
//     return String(Math.floor(min + Math.random() * (max - min)));
//   }, [participants, displayDigits.length]);

//   // Countdown timer
//   useEffect(() => {
//     if (!electionEndDate) return;

//     const updateCountdown = () => {
//       const now = new Date().getTime();
//       const end = new Date(electionEndDate).getTime();
//       const diff = Math.max(0, end - now);

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

//   // Start continuous spinning during election (after 1st vote)
//   const startContinuousSpinning = useCallback(() => {
//     setIsSpinning(true);
//     setSpinPhase('continuous');
    
//     // Update display with random voter IDs periodically
//     displayIntervalRef.current = setInterval(() => {
//       const voterId = getRandomVoterId();
//       setDisplayDigits(voterId.split(''));
//     }, 150); // Update display every 150ms
//   }, [getRandomVoterId]);

//   // Stop continuous spinning
//   const stopContinuousSpinning = useCallback(() => {
//     if (displayIntervalRef.current) {
//       clearInterval(displayIntervalRef.current);
//       displayIntervalRef.current = null;
//     }
//     setIsSpinning(false);
//     setSpinPhase('stopped');
//   }, []);

//   // During election: continuous spinning when voters >= 1
//   useEffect(() => {
//     if (isActive && totalEntries >= 1 && !isElectionEnded && !revealingWinner) {
//       startContinuousSpinning();
//     } else if (isElectionEnded || revealingWinner) {
//       stopContinuousSpinning();
//     } else if (totalEntries < 1) {
//       stopContinuousSpinning();
//     }
    
//     return () => stopContinuousSpinning();
//   }, [isActive, totalEntries, isElectionEnded, revealingWinner, startContinuousSpinning, stopContinuousSpinning]);

//   // When election ends, reveal winners
//   useEffect(() => {
//     if (isElectionEnded && winners.length > 0 && revealedWinners.length === 0 && !revealingWinner) {
//       revealWinnersSequentially();
//     }
//   }, [isElectionEnded, winners, revealedWinners.length, revealingWinner]);

//   // Reveal a single winner with the spin effect
//   const revealSingleWinner = async (winnerIndex) => {
//     const FAST_PHASE_DURATION = 2000; // 2 seconds fast
//     const SLOW_PHASE_DURATION = 2000; // 2 seconds to slow down
    
//     // Start fast spinning with voter IDs
//     setIsSpinning(true);
//     setSpinPhase('fast');
//     setSlowdownProgress(0);
    
//     // Display random voter IDs during fast phase
//     const fastInterval = setInterval(() => {
//       const voterId = getRandomVoterId();
//       setDisplayDigits(voterId.split(''));
//     }, 80);
    
//     await new Promise(resolve => setTimeout(resolve, FAST_PHASE_DURATION));
    
//     clearInterval(fastInterval);
    
//     // Slowing phase
//     setSpinPhase('slowing');
    
//     const slowdownStartTime = Date.now();
    
//     // Gradually slow down, still showing voter IDs but slower
//     await new Promise(resolve => {
//       let lastUpdate = 0;
//       slowdownIntervalRef.current = setInterval(() => {
//         const elapsed = Date.now() - slowdownStartTime;
//         const progress = Math.min(elapsed / SLOW_PHASE_DURATION, 1);
//         setSlowdownProgress(progress);
        
//         // Update display less frequently as we slow down
//         const updateInterval = 80 + progress * 300; // 80ms → 380ms
//         if (elapsed - lastUpdate > updateInterval) {
//           const voterId = getRandomVoterId();
//           setDisplayDigits(voterId.split(''));
//           lastUpdate = elapsed;
//         }
        
//         if (progress >= 1) {
//           clearInterval(slowdownIntervalRef.current);
//           resolve();
//         }
//       }, 16);
//     });
    
//     // Stop
//     setIsSpinning(false);
//     setSpinPhase('stopped');
//     setSlowdownProgress(0);
    
//     await new Promise(resolve => setTimeout(resolve, 200));
    
//     // Show winner's number
//     const winner = winners[winnerIndex];
//     const winnerBallNumber = String(
//       winner.ball_number ||
//       winner.ballNumber ||
//       winner.oddjob_voter_id || 
//       winner.oddjobVoterId || 
//       winner.voterId ||
//       winner.voter_id ||
//       winner.id || 
//       '000000'
//     ).padStart(displayDigits.length, '0');
    
//     setDisplayDigits(winnerBallNumber.split(''));
    
//     return {
//       ...winner,
//       ballNumber: winnerBallNumber,
//       rank: winnerIndex + 1
//     };
//   };

//   const revealWinnersSequentially = async () => {
//     setRevealingWinner(true);
//     stopContinuousSpinning();
    
//     for (let i = 0; i < winners.length; i++) {
//       setCurrentRevealIndex(i);
      
//       const revealedWinner = await revealSingleWinner(i);
//       setRevealedWinners(prev => [...prev, revealedWinner]);
      
//       // Wait before next winner
//       if (i < winners.length - 1) {
//         await new Promise(resolve => setTimeout(resolve, 2500));
//       }
//     }
    
//     setCurrentRevealIndex(-1);
//     setRevealingWinner(false);
//   };

//   const formatCountdown = () => {
//     const { days, hours, minutes, seconds } = countdown;
//     const pad = (n) => String(n).padStart(2, '0');
    
//     if (days > 0) {
//       return `${pad(days)}:${pad(hours)}:${pad(minutes)}`;
//     }
//     return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
//   };

//   const getOrdinal = (n) => {
//     const s = ['th', 'st', 'nd', 'rd'];
//     const v = n % 100;
//     return n + (s[(v - 20) % 10] || s[v] || s[0]);
//   };

//   return (
//     <>
//       <div 
//         className={`rounded-xl overflow-hidden shadow-2xl ${compact ? 'text-sm' : ''}`}
//         style={{
//           background: 'linear-gradient(180deg, #d4a418 0%, #c9972a 50%, #b8860b 100%)',
//           border: '4px solid #8B7500',
//           boxShadow: '0 10px 40px rgba(0,0,0,0.4)'
//         }}
//       >
//         {/* Header */}
//         <div 
//           className={`flex justify-between items-center ${compact ? 'px-2 py-1.5' : 'px-4 py-3'}`}
//           style={{ background: 'linear-gradient(180deg, #d4a418 0%, #c9972a 100%)' }}
//         >
//           <div className="flex items-center gap-2">
//             <span className={`text-gray-900 font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>
//               Date & Time:
//             </span>
//             <div 
//               className={`rounded ${compact ? 'px-2 py-0.5' : 'px-3 py-1'}`}
//               style={{ background: '#1a1a1a', border: '2px solid #333' }}
//             >
//               <span 
//                 className={`font-bold ${compact ? 'text-sm' : 'text-lg'}`}
//                 style={{ 
//                   fontFamily: '"Courier New", monospace',
//                   color: '#00ff00',
//                   textShadow: '0 0 8px #00ff00, 0 0 12px #00ff00',
//                   letterSpacing: '2px'
//                 }}
//               >
//                 {formatCountdown()}
//               </span>
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             <span className={`text-gray-900 font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>
//               Lucky Voters No:
//             </span>
//             <div 
//               className={`rounded ${compact ? 'px-2 py-0.5' : 'px-3 py-1'}`}
//               style={{ background: '#1a1a1a', border: '2px solid #333' }}
//             >
//               <span 
//                 className={`font-bold ${compact ? 'text-sm' : 'text-lg'}`}
//                 style={{ 
//                   fontFamily: '"Courier New", monospace',
//                   color: '#00ff00',
//                   textShadow: '0 0 8px #00ff00, 0 0 12px #00ff00',
//                   letterSpacing: '2px'
//                 }}
//               >
//                 {String(actualLuckyVotersCount).padStart(2, '0')}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Main Display */}
//         <div 
//           className={`${compact ? 'p-3' : 'p-6'}`}
//           style={{ background: '#1a1a1a', boxShadow: 'inset 0 5px 20px rgba(0,0,0,0.8)' }}
//         >
//           <div className={`flex justify-center items-center ${compact ? 'gap-1 mb-2' : 'gap-2 mb-4'}`}>
//             {displayDigits.map((digit, index) => (
//               <SpinningDigit
//                 key={`digit-${index}`}
//                 digit={digit}
//                 isSpinning={isSpinning}
//                 spinPhase={spinPhase}
//                 slowdownProgress={slowdownProgress}
//                 compact={compact}
//               />
//             ))}
//           </div>

//           {/* Status */}
//           <div className="text-center">
//             {!isElectionEnded && totalEntries < 1 && (
//               <div className={`inline-flex items-center gap-1.5 bg-yellow-500/20 border border-yellow-500 rounded-full ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <span className={`text-yellow-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
//                   ⏳ Waiting for voters... ({totalEntries}/1)
//                 </span>
//               </div>
//             )}

//             {!isElectionEnded && totalEntries >= 1 && isSpinning && spinPhase === 'continuous' && (
//               <div className={`inline-flex items-center gap-1.5 bg-green-500/20 border border-green-500 rounded-full ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <div className={`bg-green-500 rounded-full animate-pulse ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} />
//                 <span className={`text-green-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
//                   Spinning... Drawing at end
//                 </span>
//               </div>
//             )}

//             {revealingWinner && currentRevealIndex >= 0 && (
//               <div className={`inline-flex items-center gap-1.5 bg-purple-500/20 border border-purple-500 rounded-full ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <span className={`text-purple-400 font-medium animate-pulse ${compact ? 'text-xs' : 'text-sm'}`}>
//                   🎊 Revealing {getOrdinal(currentRevealIndex + 1)} Lucky Voter...
//                 </span>
//               </div>
//             )}

//             {isElectionEnded && !revealingWinner && revealedWinners.length > 0 && (
//               <div className={`inline-flex items-center gap-1.5 bg-green-500/20 border border-green-500 rounded-full ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <span className={`text-green-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
//                   ✅ All {revealedWinners.length} Lucky Voter(s) Revealed!
//                 </span>
//               </div>
//             )}

//             {isLoadingParticipants && totalEntries === 0 && (
//               <div className={`inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-500 rounded-full mt-2 ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <RefreshCw className={`text-blue-400 animate-spin ${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
//                 <span className={`text-blue-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>Loading...</span>
//               </div>
//             )}

//             {fetchError && (
//               <div className={`inline-flex items-center gap-1.5 bg-red-500/20 border border-red-500 rounded-full mt-2 ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <span className={`text-red-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>⚠️ {fetchError}</span>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Winners */}
//         {revealedWinners.length > 0 && (
//           <div 
//             className={`border-t-2 border-yellow-600 ${compact ? 'px-2 py-2' : 'px-4 py-4'}`}
//             style={{ background: 'linear-gradient(180deg, #c9972a 0%, #b8860b 100%)' }}
//           >
//             <h3 className={`text-yellow-900 font-bold mb-2 text-center ${compact ? 'text-sm' : 'text-lg'}`}>
//               🏆 LUCKY VOTERS WINNERS 🏆
//             </h3>
            
//             <div className="space-y-1.5">
//               {revealedWinners.map((winner, index) => (
//                 <div 
//                   key={index}
//                   className={`bg-white rounded-lg flex items-center justify-between shadow-md ${compact ? 'px-2 py-1.5' : 'px-4 py-3'}`}
//                 >
//                   <div className="flex items-center gap-2">
//                     <div className={`bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 font-black rounded-full flex items-center justify-center shadow ${compact ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm'}`}>
//                       {getOrdinal(index + 1)}
//                     </div>
//                     <div>
//                       <p className={`font-bold text-gray-900 ${compact ? 'text-xs' : ''}`}>
//                         {winner.displayName || winner.username || winner.name || 'Lucky Voter'}
//                       </p>
//                       <p className={`text-gray-500 font-mono ${compact ? 'text-xs' : 'text-sm'}`}>
//                         Ball #: {winner.ballNumber}
//                       </p>
//                     </div>
//                   </div>
//                   <span className={compact ? 'text-xl' : 'text-3xl'}>🏆</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Footer */}
//         <div 
//           className={`border-t border-yellow-700 flex justify-between items-center ${compact ? 'px-2 py-1.5' : 'px-4 py-2'}`}
//           style={{ background: 'linear-gradient(180deg, #c9972a 0%, #b8860b 100%)' }}
//         >
//           <div className={`flex items-center gap-1.5 text-gray-900 ${compact ? 'text-xs' : ''}`}>
//             <Users className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
//             <span className={compact ? 'text-xs' : 'text-sm'}>
//               Total Entries: <strong>{totalEntries}</strong>
//             </span>
//           </div>
          
//           <div className="flex items-center gap-2">
//             {!isElectionEnded && totalEntries >= 1 && (
//               <button
//                 onClick={() => setShowDemoModal(true)}
//                 className={`flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white rounded transition ${compact ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xs'}`}
//               >
//                 <Eye className="w-3 h-3" />
//                 <span>Demo</span>
//               </button>
//             )}
            
//             <div className={`flex items-center gap-1.5 ${compact ? 'text-xs' : 'text-sm'} ${
//               isSpinning ? 'text-green-700' : isElectionEnded ? 'text-blue-700' : 'text-yellow-800'
//             }`}>
//               <span className={`rounded-full ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'} ${
//                 isSpinning ? 'bg-green-500 animate-pulse' : isElectionEnded ? 'bg-blue-500' : 'bg-yellow-600'
//               }`} />
//               <span className="font-semibold">
//                 {isSpinning ? 'SPINNING' : isElectionEnded ? 'COMPLETED' : 'WAITING'}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       <DemoWinnerReveal
//         isOpen={showDemoModal}
//         onClose={() => setShowDemoModal(false)}
//         realBallNumbers={participants}
//         realLuckyVotersCount={actualLuckyVotersCount}
//         realTotalEntries={totalEntries}
//         compact={compact}
//       />
//     </>
//   );
// }
//last workable code only to improve the animation above code
// // src/components/Dashboard/Tabs/lotteryyy/LotterySlotMachine.jsx
// // 4D Slot Machine - Fetches REAL participant data from lottery API
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { Clock, Users, RefreshCw, Eye } from 'lucide-react';
// import DemoWinnerReveal from './DemoWinnerReveal';

// // API base URL for lottery service
// const LOTTERY_API_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007/api';

// export default function LotterySlotMachine({ 
//   electionId,
//   electionEndDate,
//   luckyVotersCount = 1,      // Number of winners to be drawn
//   isElectionEnded = false,
//   winners = [],              // Winners array from backend (when election ends)
//   isActive = true,
//   compact = false,           // Compact mode for corner display
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
  
//   // ✅ NEW: State for Demo modal
//   const [showDemoModal, setShowDemoModal] = useState(false);
  
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

//   // Format countdown display - ALWAYS show seconds for real-time feel
//   const formatCountdown = () => {
//     const { days, hours, minutes, seconds } = countdown;
//     const pad = (n) => String(n).padStart(2, '0');
    
//     if (days > 0) {
//       // Show: 23d 17:56:42 (days + hours:minutes:seconds)
//       return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
//     }
//     // Show: 17:56:42 (hours:minutes:seconds)
//     return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
//   };

//   // Get ordinal suffix (1st, 2nd, 3rd, etc.)
//   const getOrdinal = (n) => {
//     const s = ['th', 'st', 'nd', 'rd'];
//     const v = n % 100;
//     return n + (s[(v - 20) % 10] || s[v] || s[0]);
//   };

//   return (
//     <>
//       <div className={`bg-gradient-to-b from-gray-900 via-gray-800 to-black rounded-xl overflow-hidden border-4 border-yellow-500 shadow-2xl ${compact ? 'text-sm' : ''}`}>
//         {/* Header - Date/Time and Lucky Voters Count */}
//         <div className={`bg-black flex justify-between items-center border-b-2 border-yellow-600 ${compact ? 'px-2 py-1.5' : 'px-4 py-3'}`}>
//           {/* Date & Time Countdown */}
//           <div className="flex items-center gap-1.5">
//             <Clock className={`text-gray-400 ${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
//             <span className={`text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>Date & Time:</span>
//             <div className={`bg-red-900 rounded border border-red-700 ${compact ? 'px-1.5 py-0.5' : 'px-3 py-1'}`}>
//               <span 
//                 className={`font-mono text-red-400 font-bold tracking-wider ${compact ? 'text-sm' : 'text-lg'}`}
//                 style={{ 
//                   fontFamily: 'Courier New, monospace',
//                   textShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
//                 }}
//               >
//                 {formatCountdown()}
//               </span>
//             </div>
//           </div>

//           {/* Lucky Voters Number (Winners Count) */}
//           <div className="flex items-center gap-1.5">
//             <span className={`text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>Lucky Voters No:</span>
//             <div className={`bg-red-900 rounded border border-red-700 ${compact ? 'px-1.5 py-0.5' : 'px-3 py-1'}`}>
//               <span 
//                 className={`font-mono text-red-400 font-bold ${compact ? 'text-sm' : 'text-lg'}`}
//                 style={{ 
//                   fontFamily: 'Courier New, monospace',
//                   textShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
//                 }}
//               >
//                 {String(actualLuckyVotersCount).padStart(2, '0')}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Main Slot Machine Display - Large Numbers */}
//         <div className={`bg-gradient-to-b from-gray-800 to-gray-900 ${compact ? 'p-3' : 'p-6'}`}>
//           {/* Digit Display */}
//           <div className={`flex justify-center ${compact ? 'gap-0.5 mb-2' : 'gap-1 mb-4'}`}>
//             {displayDigits.map((digit, index) => (
//               <div 
//                 key={index}
//                 className="relative"
//               >
//                 {/* Single Digit Container */}
//                 <div 
//                   className={`
//                     bg-gradient-to-b from-gray-100 via-white to-gray-200
//                     rounded-lg flex items-center justify-center
//                     border-2 border-gray-400 shadow-lg
//                     relative overflow-hidden
//                     ${compact 
//                       ? 'w-10 h-14 sm:w-11 sm:h-16' 
//                       : 'w-12 h-20 sm:w-16 sm:h-24 md:w-20 md:h-28'
//                     }
//                   `}
//                 >
//                   {/* Top reflection */}
//                   <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/60 to-transparent" />
                  
//                   {/* Middle line */}
//                   <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 transform -translate-y-1/2 z-10" />
                  
//                   {/* The Digit */}
//                   <span 
//                     className={`
//                       font-black text-gray-900 relative z-20
//                       ${isSpinning ? 'animate-pulse' : ''}
//                       ${compact 
//                         ? 'text-2xl sm:text-3xl' 
//                         : 'text-4xl sm:text-5xl md:text-6xl'
//                       }
//                     `}
//                     style={{ 
//                       fontFamily: 'Impact, Arial Black, sans-serif',
//                       textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
//                     }}
//                   >
//                     {digit}
//                   </span>

//                   {/* Bottom shadow */}
//                   <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-gray-300/40 to-transparent" />
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Status Message */}
//           <div className="text-center">
//             {!isElectionEnded && totalEntries < 2 && (
//               <div className={`inline-flex items-center gap-1.5 bg-yellow-500/20 border border-yellow-500 rounded-full ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <Clock className={`text-yellow-400 ${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
//                 <span className={`text-yellow-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
//                   Waiting for voters... ({totalEntries}/2 minimum)
//                 </span>
//               </div>
//             )}

//             {!isElectionEnded && totalEntries >= 2 && isSpinning && (
//               <div className={`inline-flex items-center gap-1.5 bg-green-500/20 border border-green-500 rounded-full ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <div className={`bg-green-500 rounded-full animate-pulse ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} />
//                 <span className={`text-green-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
//                   {compact ? 'Spinning... Drawing at end' : 'Machine is spinning... Drawing at election end'}
//                 </span>
//               </div>
//             )}

//             {isElectionEnded && revealingWinner && currentRevealIndex >= 0 && (
//               <div className={`inline-flex items-center gap-1.5 bg-purple-500/20 border border-purple-500 rounded-full ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <span className={`text-purple-400 font-medium animate-pulse ${compact ? 'text-xs' : 'text-sm'}`}>
//                   🎊 Revealing {getOrdinal(currentRevealIndex + 1)} Lucky Voter Winner...
//                 </span>
//               </div>
//             )}

//             {isElectionEnded && !revealingWinner && revealedWinners.length > 0 && (
//               <div className={`inline-flex items-center gap-1.5 bg-green-500/20 border border-green-500 rounded-full ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <span className={`text-green-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
//                   ✅ All {revealedWinners.length} Lucky Voter(s) Revealed!
//                 </span>
//               </div>
//             )}

//             {/* Loading/Error state */}
//             {isLoadingParticipants && totalEntries === 0 && (
//               <div className={`inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-500 rounded-full mt-2 ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <RefreshCw className={`text-blue-400 animate-spin ${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
//                 <span className={`text-blue-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
//                   Loading participants...
//                 </span>
//               </div>
//             )}

//             {fetchError && (
//               <div className={`inline-flex items-center gap-1.5 bg-red-500/20 border border-red-500 rounded-full mt-2 ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
//                 <span className={`text-red-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
//                   ⚠️ {fetchError}
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Winners Display Section - Shows after winners are revealed */}
//         {revealedWinners.length > 0 && (
//           <div className={`bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 border-t-2 border-yellow-400 ${compact ? 'px-2 py-2' : 'px-4 py-4'}`}>
//             <h3 className={`text-yellow-900 font-bold mb-2 text-center ${compact ? 'text-sm' : 'text-lg mb-3'}`}>
//               🏆 LUCKY VOTERS WINNERS 🏆
//             </h3>
            
//             <div className={`space-y-1.5 ${compact ? '' : 'space-y-2'}`}>
//               {revealedWinners.map((winner, index) => (
//                 <div 
//                   key={index}
//                   className={`bg-white rounded-lg flex items-center justify-between shadow-md ${compact ? 'px-2 py-1.5' : 'px-4 py-3'}`}
//                 >
//                   <div className="flex items-center gap-2">
//                     {/* Rank Badge */}
//                     <div className={`bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 font-black rounded-full flex items-center justify-center shadow ${compact ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm'}`}>
//                       {getOrdinal(index + 1)}
//                     </div>
                    
//                     {/* Winner Info */}
//                     <div>
//                       <p className={`font-bold text-gray-900 ${compact ? 'text-xs' : ''}`}>
//                         {winner.displayName || winner.username || winner.name || `Lucky Voter`}
//                       </p>
//                       <p className={`text-gray-500 font-mono ${compact ? 'text-xs' : 'text-sm'}`}>
//                         Ball #: {winner.ballNumber}
//                       </p>
//                     </div>
//                   </div>
                  
//                   {/* Trophy */}
//                   <span className={compact ? 'text-xl' : 'text-3xl'}>🏆</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Footer - Total Entries, Status, and Demo Button */}
//         <div className={`bg-black/80 border-t border-gray-700 flex justify-between items-center ${compact ? 'px-2 py-1.5' : 'px-4 py-2'}`}>
//           <div className={`flex items-center gap-1.5 text-gray-400 ${compact ? 'text-xs' : ''}`}>
//             <Users className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
//             <span className={compact ? 'text-xs' : 'text-sm'}>
//               Total Entries: <strong className="text-white">{totalEntries}</strong>
//             </span>
//           </div>
          
//           <div className="flex items-center gap-2">
//             {/* ✅ NEW: Demo Button - Shows what happens at election end */}
//             {!isElectionEnded && totalEntries >= 2 && (
//               <button
//                 onClick={() => setShowDemoModal(true)}
//                 className={`flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white rounded transition ${
//                   compact ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xs'
//                 }`}
//                 title="Preview what happens at election end"
//               >
//                 <Eye className={compact ? 'w-3 h-3' : 'w-3 h-3'} />
//                 <span>Demo</span>
//               </button>
//             )}
            
//             {/* Status Indicator */}
//             <div className={`flex items-center gap-1.5 ${compact ? 'text-xs' : 'text-sm'} ${
//               isSpinning ? 'text-green-400' : 
//               isElectionEnded ? 'text-blue-400' : 
//               'text-yellow-400'
//             }`}>
//               <span className={`rounded-full ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'} ${
//                 isSpinning ? 'bg-green-400 animate-pulse' : 
//                 isElectionEnded ? 'bg-blue-400' : 
//                 'bg-yellow-400'
//               }`} />
//               <span>
//                 {isSpinning ? 'SPINNING' : 
//                  isElectionEnded ? 'COMPLETED' : 
//                  'WAITING'}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ✅ NEW: Demo Modal - Uses REAL data from API */}
//       <DemoWinnerReveal
//         isOpen={showDemoModal}
//         onClose={() => setShowDemoModal(false)}
//         realBallNumbers={participants}
//         realLuckyVotersCount={actualLuckyVotersCount}
//         realTotalEntries={totalEntries}
//         compact={compact}
//       />
//     </>
//   );
// }
