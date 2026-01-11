// // src/components/Dashboard/Tabs/lotteryyy/DemoWinnerReveal.jsx
// // Demo modal - Winner reveal with FALLING + BOUNCE effect
// // Shows dynamic digit sizing: huge numbers, small numbers, real voter numbers
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { X, Play, RotateCcw } from 'lucide-react';

// // Demo spinning digit with falling bounce animation - DYNAMIC SIZE
// const DemoSpinningDigit = ({ 
//   digit,
//   isSpinning,
//   isFalling,
//   finalDigit,
//   digitCount // Total digits to calculate size
// }) => {
//   const [currentDigit, setCurrentDigit] = useState(digit || '0');
//   const [nextDigit, setNextDigit] = useState('0');
//   const [offsetY, setOffsetY] = useState(0);
//   const animationRef = useRef(null);
//   const isSpinningRef = useRef(isSpinning);
  
//   // Dynamic sizing based on digit count (3-8 digits range)
//   const getSize = () => {
//     if (digitCount <= 3) return { width: 85, height: 110, fontSize: 'text-7xl' };
//     if (digitCount <= 4) return { width: 75, height: 100, fontSize: 'text-6xl' };
//     if (digitCount <= 5) return { width: 68, height: 95, fontSize: 'text-6xl' };
//     if (digitCount <= 6) return { width: 62, height: 88, fontSize: 'text-5xl' };
//     if (digitCount <= 7) return { width: 55, height: 80, fontSize: 'text-5xl' };
//     return { width: 50, height: 75, fontSize: 'text-4xl' }; // 8 digits
//   };
  
//   const { width, height, fontSize } = getSize();
//   const digitHeight = height;
//   const spinSpeed = Math.max(20, 35 - digitCount); // Slower for more digits
  
//   useEffect(() => {
//     isSpinningRef.current = isSpinning;
//   }, [isSpinning]);

//   useEffect(() => {
//     if (isSpinning && !isFalling) {
//       let offset = -Math.floor(Math.random() * digitHeight * 0.7);
//       let currDigit = Math.floor(Math.random() * 10);
//       let nxtDigit = Math.floor(Math.random() * 10);
      
//       setCurrentDigit(String(currDigit));
//       setNextDigit(String(nxtDigit));
//       setOffsetY(offset);
      
//       const animate = () => {
//         if (!isSpinningRef.current) return;
        
//         offset -= spinSpeed;
        
//         if (offset <= -digitHeight) {
//           offset += digitHeight;
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
//     }
//   }, [isSpinning, isFalling, digitHeight, spinSpeed]);

//   useEffect(() => {
//     if (isFalling && finalDigit !== undefined) {
//       if (animationRef.current) {
//         cancelAnimationFrame(animationRef.current);
//         animationRef.current = null;
//       }
      
//       setCurrentDigit(String(finalDigit));
//       setNextDigit(String((parseInt(finalDigit) + 1) % 10));
      
//       const startOffset = offsetY;
//       const fallDuration = 400;
//       const bounceDuration = 200;
//       const bounceHeight = 15;
//       const startTime = Date.now();
      
//       const animateFall = () => {
//         const elapsed = Date.now() - startTime;
        
//         if (elapsed < fallDuration) {
//           const progress = elapsed / fallDuration;
//           const easeIn = progress * progress;
//           const newOffset = startOffset + (0 - startOffset) * easeIn;
//           setOffsetY(newOffset);
//           animationRef.current = requestAnimationFrame(animateFall);
//         } else if (elapsed < fallDuration + bounceDuration / 2) {
//           const bounceProgress = (elapsed - fallDuration) / (bounceDuration / 2);
//           const bounceOffset = -bounceHeight * (1 - bounceProgress * bounceProgress);
//           setOffsetY(bounceOffset);
//           animationRef.current = requestAnimationFrame(animateFall);
//         } else if (elapsed < fallDuration + bounceDuration) {
//           const settleProgress = (elapsed - fallDuration - bounceDuration / 2) / (bounceDuration / 2);
//           const bounceOffset = -bounceHeight * (1 - settleProgress) * (1 - settleProgress);
//           setOffsetY(bounceOffset);
//           animationRef.current = requestAnimationFrame(animateFall);
//         } else {
//           setOffsetY(0);
//         }
//       };
      
//       animationRef.current = requestAnimationFrame(animateFall);
      
//       return () => {
//         if (animationRef.current) cancelAnimationFrame(animationRef.current);
//       };
//     }
//   }, [isFalling, finalDigit, offsetY]);

//   useEffect(() => {
//     if (!isSpinning && !isFalling) {
//       setOffsetY(0);
//       setCurrentDigit(digit || '0');
//     }
//   }, [isSpinning, isFalling, digit]);

//   return (
//     <div 
//       className="relative overflow-hidden rounded-lg"
//       style={{
//         width: `${width}px`,
//         height: `${height}px`,
//         background: 'linear-gradient(180deg, #7f1d1d 0%, #991b1b 20%, #b91c1c 50%, #991b1b 80%, #7f1d1d 100%)',
//         boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.7), inset 0 -4px 20px rgba(0,0,0,0.5), 0 6px 15px rgba(0,0,0,0.5)',
//         border: '3px solid #1f2937',
//         transition: 'width 0.3s ease, height 0.3s ease'
//       }}
//     >
//       <div 
//         className="absolute w-full"
//         style={{ transform: `translateY(${offsetY}px)` }}
//       >
//         <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
//           <span 
//             className={`font-black text-white ${fontSize}`}
//             style={{ 
//               fontFamily: 'Impact, "Arial Black", sans-serif',
//               textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
//               fontWeight: 900,
//             }}
//           >
//             {currentDigit}
//           </span>
//         </div>
//         <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
//           <span 
//             className={`font-black text-white ${fontSize}`}
//             style={{ 
//               fontFamily: 'Impact, "Arial Black", sans-serif',
//               textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
//               fontWeight: 900,
//             }}
//           >
//             {nextDigit}
//           </span>
//         </div>
//       </div>
      
//       <div 
//         className="absolute top-0 left-0 right-0 pointer-events-none z-10"
//         style={{
//           height: '30%',
//           background: 'linear-gradient(to bottom, rgba(55,0,0,0.95) 0%, transparent 100%)'
//         }}
//       />
      
//       <div 
//         className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
//         style={{
//           height: '30%',
//           background: 'linear-gradient(to top, rgba(55,0,0,0.95) 0%, transparent 100%)'
//         }}
//       />
//     </div>
//   );
// };

// export default function DemoWinnerReveal({
//   isOpen,
//   onClose,
//   realBallNumbers = [],
//   realLuckyVotersCount = 3,
//   /*eslint-disable*/
//   realTotalEntries = 0,
//   compact = false
// }) {
//   const [isRunning, setIsRunning] = useState(false);
//   const [displayDigits, setDisplayDigits] = useState(['0', '0', '0', '0', '0', '0']);
//   const [digitSpinning, setDigitSpinning] = useState([]);
//   const [digitFalling, setDigitFalling] = useState([]);
//   const [finalDigits, setFinalDigits] = useState([]);
//   const [currentWinnerIndex, setCurrentWinnerIndex] = useState(-1);
//   const [revealedWinners, setRevealedWinners] = useState([]);
//   const [demoComplete, setDemoComplete] = useState(false);
//   const [statusText, setStatusText] = useState('Click "Start Demo" to see winner reveal');

//   // Generate sample winners with DYNAMIC digit counts
//   const generateSampleWinners = useCallback(() => {
//     const winners = [];
    
//     // 1st winner: 8 digits (max) - to show expansion
//     winners.push({
//       rank: 1,
//       ballNumber: '58454543',
//       name: 'Demo Voter 1 (8 digits)'
//     });
    
//     // 2nd winner: 3 digits (min) - to show shrinking
//     winners.push({
//       rank: 2,
//       ballNumber: '247',
//       name: 'Demo Voter 2 (3 digits)'
//     });
    
//     // 3rd winner onwards: Use real voter numbers if available
//     const remainingCount = Math.min(realLuckyVotersCount, 5) - 2;
    
//     if (remainingCount > 0) {
//       if (realBallNumbers.length > 0) {
//         // Use actual voter ball numbers
//         const shuffled = [...realBallNumbers].sort(() => Math.random() - 0.5);
//         for (let i = 0; i < Math.min(remainingCount, shuffled.length); i++) {
//           winners.push({
//             rank: winners.length + 1,
//             ballNumber: shuffled[i],
//             name: `Real Voter ${i + 1}`
//           });
//         }
//       } else {
//         // Generate random 6-digit numbers as fallback
//         for (let i = 0; i < remainingCount; i++) {
//           winners.push({
//             rank: winners.length + 1,
//             ballNumber: String(Math.floor(100000 + Math.random() * 900000)),
//             name: `Demo Voter ${winners.length + 1}`
//           });
//         }
//       }
//     }
    
//     return winners;
//   }, [realBallNumbers, realLuckyVotersCount]);

//   const getOrdinal = (n) => {
//     const s = ['th', 'st', 'nd', 'rd'];
//     const v = n % 100;
//     return n + (s[(v - 20) % 10] || s[v] || s[0]);
//   };

//   // Initialize arrays based on digit count
//   const initializeArrays = (digitCount) => {
//     setDisplayDigits(Array(digitCount).fill('0'));
//     setDigitSpinning(Array(digitCount).fill(false));
//     setDigitFalling(Array(digitCount).fill(false));
//     setFinalDigits(Array(digitCount).fill('0'));
//   };

//   // Reveal single winner with FALLING effect - DYNAMIC digit count
//   const revealSingleWinner = async (winner, winnerIndex) => {
//     const digitCount = winner.ballNumber.length;
//     const SPIN_DURATION = 1500;
//     const DIGIT_FALL_DELAY = Math.max(300, 500 - digitCount * 20); // Faster for more digits
    
//     setCurrentWinnerIndex(winnerIndex);
//     setStatusText(`🎰 Revealing ${getOrdinal(winnerIndex + 1)} Lucky Voter (${digitCount} digits)...`);
    
//     // Initialize arrays for this winner's digit count
//     initializeArrays(digitCount);
    
//     // Small delay for resize animation
//     await new Promise(resolve => setTimeout(resolve, 300));
    
//     // Start all digits spinning
//     setDigitSpinning(Array(digitCount).fill(true));
    
//     // Spin for a while
//     await new Promise(resolve => setTimeout(resolve, SPIN_DURATION));
    
//     setStatusText(`🎰 Dropping ${digitCount} digits...`);
    
//     // Get winner digits
//     const winnerDigits = winner.ballNumber.split('');
//     setFinalDigits(winnerDigits);
    
//     // SEQUENTIAL FALL: Each digit falls one by one with bounce
//     for (let i = 0; i < digitCount; i++) {
//       // Stop spinning for this digit and start falling
//       setDigitSpinning(prev => {
//         const updated = [...prev];
//         updated[i] = false;
//         return updated;
//       });
      
//       setDigitFalling(prev => {
//         const updated = [...prev];
//         updated[i] = true;
//         return updated;
//       });
      
//       // Wait for fall + bounce animation
//       await new Promise(resolve => setTimeout(resolve, DIGIT_FALL_DELAY));
      
//       // Update display digit
//       setDisplayDigits(prev => {
//         const updated = [...prev];
//         updated[i] = winnerDigits[i];
//         return updated;
//       });
//     }
    
//     // Wait for last digit to fully settle
//     await new Promise(resolve => setTimeout(resolve, 300));
    
//     // Mark all as not falling (settled)
//     setDigitFalling(Array(digitCount).fill(false));
    
//     setStatusText(`🏆 ${getOrdinal(winnerIndex + 1)} Lucky Voter: ${winner.ballNumber}`);
    
//     return winner;
//   };

//   // Run demo
//   const runDemo = async () => {
//     setIsRunning(true);
//     setDemoComplete(false);
//     setRevealedWinners([]);
//     setCurrentWinnerIndex(-1);
//     initializeArrays(6);
    
//     const sampleWinners = generateSampleWinners();
    
//     setStatusText(`🎲 Starting demo with ${sampleWinners.length} lucky voter(s)...`);
//     setStatusText(`🎲 Watch how digits EXPAND and SHRINK!`);
//     await new Promise(resolve => setTimeout(resolve, 1500));
    
//     for (let i = 0; i < sampleWinners.length; i++) {
//       const winner = await revealSingleWinner(sampleWinners[i], i);
//       setRevealedWinners(prev => [...prev, winner]);
      
//       if (i < sampleWinners.length - 1) {
//         setStatusText(`✅ ${getOrdinal(i + 1)} winner revealed! Next winner coming...`);
//         await new Promise(resolve => setTimeout(resolve, 2500));
//       }
//     }
    
//     setStatusText(`🎉 Demo complete! Notice how digits expanded & shrank!`);
//     setDemoComplete(true);
//     setIsRunning(false);
//     setCurrentWinnerIndex(-1);
//   };

//   // Reset
//   const resetDemo = () => {
//     setIsRunning(false);
//     initializeArrays(6);
//     setCurrentWinnerIndex(-1);
//     setRevealedWinners([]);
//     setDemoComplete(false);
//     setStatusText('Click "Start Demo" to see winner reveal');
//   };

//   useEffect(() => {
//     if (!isOpen) resetDemo();
//   }, [isOpen]);

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
//       <div 
//         className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl"
//         style={{
//           background: 'linear-gradient(180deg, #d4a418 0%, #c9972a 50%, #b8860b 100%)'
//         }}
//       >
//         {/* Header */}
//         <div 
//           className="flex justify-between items-center px-5 py-4"
//           style={{ background: 'linear-gradient(180deg, #d4a418 0%, #c9972a 100%)' }}
//         >
//           <h3 className="text-xl font-bold text-gray-900">
//             🎰 Demo: Dynamic Digit Sizing
//           </h3>
//           <button
//             onClick={onClose}
//             className="p-1.5 rounded-full hover:bg-black/20 transition"
//           >
//             <X className="w-6 h-6 text-gray-900" />
//           </button>
//         </div>

//         {/* Content */}
//         <div className="px-5 py-4">
//           <div className="mb-4 text-center">
//             <p className="text-gray-800 text-sm mb-1">
//               Watch how the machine handles different digit sizes!
//             </p>
//             <p className="text-gray-900 font-semibold">
//               1st: 8 digits → 2nd: 3 digits → Rest: Real voter numbers
//             </p>
//           </div>

//           {/* Slot Machine - Black box directly on yellow */}
//           <div 
//             className="rounded-xl p-4 mb-4 overflow-x-auto"
//             style={{ 
//               background: '#1a1a1a',
//               boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
//             }}
//           >
//             {/* Digits - Dynamic count */}
//             <div className="flex justify-center items-center gap-2 mb-4 min-w-fit mx-auto" style={{ transition: 'all 0.3s ease' }}>
//               {displayDigits.map((digit, index) => (
//                 <DemoSpinningDigit
//                   key={`demo-digit-${index}-${displayDigits.length}`}
//                   digit={digit}
//                   isSpinning={digitSpinning[index] || false}
//                   isFalling={digitFalling[index] || false}
//                   finalDigit={finalDigits[index]}
//                   digitCount={displayDigits.length}
//                 />
//               ))}
//             </div>
            
//             {/* Digit count indicator */}
//             <div className="text-center mb-2">
//               <span className="text-gray-500 text-sm">
//                 Current: {displayDigits.length} digits
//               </span>
//             </div>
            
//             {/* Status */}
//             <div className="text-center">
//               <p className={`text-base font-semibold ${
//                 demoComplete ? 'text-green-400' : 
//                 isRunning ? 'text-purple-400 animate-pulse' : 
//                 'text-gray-400'
//               }`}>
//                 {statusText}
//               </p>
//             </div>
//           </div>

//           {/* Revealed Winners */}
//           {revealedWinners.length > 0 && (
//             <div className="mb-4">
//               <h4 className="text-gray-900 font-bold text-base mb-3 text-center">
//                 🏆 Revealed Winners (Notice different digit counts!)
//               </h4>
//               <div className="space-y-2 max-h-48 overflow-y-auto">
//                 {revealedWinners.map((winner, index) => (
//                   <div 
//                     key={index}
//                     className="flex items-center justify-between bg-white/90 rounded-lg px-4 py-2"
//                   >
//                     <span className="text-yellow-700 font-bold text-lg">
//                       {getOrdinal(index + 1)}
//                     </span>
//                     <div className="flex flex-col items-center">
//                       <span className="text-gray-900 font-mono text-lg font-bold break-all">
//                         {winner.ballNumber}
//                       </span>
//                       <span className="text-gray-600 text-xs">
//                         ({winner.ballNumber.length} digits)
//                       </span>
//                     </div>
//                     <span className="text-gray-600 text-sm">
//                       {winner.name}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Controls */}
//           <div className="flex justify-center gap-4">
//             {!isRunning && !demoComplete && (
//               <button
//                 onClick={runDemo}
//                 className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-8 py-3 rounded-xl transition text-lg"
//               >
//                 <Play className="w-5 h-5" />
//                 Start Demo
//               </button>
//             )}
            
//             {(demoComplete || isRunning) && (
//               <button
//                 onClick={resetDemo}
//                 disabled={isRunning}
//                 className={`flex items-center gap-2 ${
//                   isRunning 
//                     ? 'bg-gray-600 cursor-not-allowed' 
//                     : 'bg-blue-600 hover:bg-blue-500'
//                 } text-white font-bold px-8 py-3 rounded-xl transition text-lg`}
//               >
//                 <RotateCcw className="w-5 h-5" />
//                 {isRunning ? 'Running...' : 'Run Again'}
//               </button>
//             )}
            
//             <button
//               onClick={onClose}
//               className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-8 py-3 rounded-xl transition text-lg"
//             >
//               Close
//             </button>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="px-5 py-3 text-center" style={{ background: 'linear-gradient(180deg, #b8860b 0%, #a67c00 100%)' }}>
//           <p className="text-gray-800 text-sm">
//             Demo shows: 8-digit → 3-digit → Real voter numbers (dynamic sizing)
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }









// // src/components/Dashboard/Tabs/lotteryyy/DemoWinnerReveal.jsx
//Demo modal - Winner reveal with FALLING + BOUNCE effect
//Numbers fall from their random position to center with slight bounce
// Sequential: 1st digit falls → 2nd digit falls → 3rd digit falls...
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, RotateCcw } from 'lucide-react';

// Demo spinning digit with falling bounce animation
const DemoSpinningDigit = ({ 
  digit,
  isSpinning,
  isFalling,
  finalDigit
}) => {
  const [currentDigit, setCurrentDigit] = useState(digit || '0');
  const [nextDigit, setNextDigit] = useState('0');
  const [offsetY, setOffsetY] = useState(0);
  /*eslint-disable*/
  const [displayState, setDisplayState] = useState('idle'); // 'idle' | 'spinning' | 'falling' | 'settled'
  const animationRef = useRef(null);
  const isSpinningRef = useRef(isSpinning);
  
  const digitHeight = 100;
  const spinSpeed = 35;
  
  useEffect(() => {
    isSpinningRef.current = isSpinning;
  }, [isSpinning]);

  // Handle spinning
  useEffect(() => {
    if (isSpinning && !isFalling) {
      setDisplayState('spinning');
      let offset = -Math.floor(Math.random() * digitHeight * 0.7); // Random start position
      let currDigit = Math.floor(Math.random() * 10);
      let nxtDigit = Math.floor(Math.random() * 10);
      
      setCurrentDigit(String(currDigit));
      setNextDigit(String(nxtDigit));
      setOffsetY(offset);
      
      const animate = () => {
        if (!isSpinningRef.current) return;
        
        offset -= spinSpeed;
        
        if (offset <= -digitHeight) {
          offset += digitHeight;
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
    }
  }, [isSpinning, isFalling]);

  // Handle falling with bounce
  useEffect(() => {
    if (isFalling && finalDigit !== undefined) {
      setDisplayState('falling');
      
      // Stop spinning animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      // Set the final digit
      setCurrentDigit(String(finalDigit));
      setNextDigit(String((parseInt(finalDigit) + 1) % 10));
      
      // Animate falling with bounce
      // Start from current offset, fall to 0, bounce up slightly, settle at 0
      const startOffset = offsetY;
      const fallDuration = 400; // ms to fall
      const bounceDuration = 200; // ms for bounce
      const bounceHeight = 15; // pixels to bounce up
      
      const startTime = Date.now();
      
      const animateFall = () => {
        const elapsed = Date.now() - startTime;
        
        if (elapsed < fallDuration) {
          // Falling phase - ease in (accelerate)
          const progress = elapsed / fallDuration;
          const easeIn = progress * progress; // Quadratic ease in
          const newOffset = startOffset + (0 - startOffset) * easeIn;
          setOffsetY(newOffset);
          animationRef.current = requestAnimationFrame(animateFall);
        } else if (elapsed < fallDuration + bounceDuration / 2) {
          // Bounce up phase
          const bounceProgress = (elapsed - fallDuration) / (bounceDuration / 2);
          const bounceOffset = -bounceHeight * (1 - bounceProgress * bounceProgress);
          setOffsetY(bounceOffset);
          animationRef.current = requestAnimationFrame(animateFall);
        } else if (elapsed < fallDuration + bounceDuration) {
          // Bounce down phase (settle)
          const settleProgress = (elapsed - fallDuration - bounceDuration / 2) / (bounceDuration / 2);
          const bounceOffset = -bounceHeight * (1 - settleProgress) * (1 - settleProgress);
          setOffsetY(bounceOffset);
          animationRef.current = requestAnimationFrame(animateFall);
        } else {
          // Settled
          setOffsetY(0);
          setDisplayState('settled');
        }
      };
      
      animationRef.current = requestAnimationFrame(animateFall);
      
      return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
    }
  }, [isFalling, finalDigit]);

  // Reset when not spinning and not falling
  useEffect(() => {
    if (!isSpinning && !isFalling) {
      setDisplayState('idle');
      setOffsetY(0);
      setCurrentDigit(digit || '0');
    }
  }, [isSpinning, isFalling, digit]);

  return (
    <div 
      className="relative overflow-hidden rounded-xl"
      style={{
        width: '75px',
        height: '100px',
        background: 'linear-gradient(180deg, #7f1d1d 0%, #991b1b 20%, #b91c1c 50%, #991b1b 80%, #7f1d1d 100%)',
        boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.7), inset 0 -4px 20px rgba(0,0,0,0.5), 0 6px 15px rgba(0,0,0,0.5)',
        border: '3px solid #1f2937',
      }}
    >
      <div 
        className="absolute w-full"
        style={{ 
          transform: `translateY(${offsetY}px)`,
        }}
      >
        <div className="flex items-center justify-center" style={{ height: '100px' }}>
          <span 
            className="font-black text-white text-7xl"
            style={{ 
              fontFamily: 'Impact, "Arial Black", sans-serif',
              textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
              fontWeight: 900,
            }}
          >
            {currentDigit}
          </span>
        </div>
        <div className="flex items-center justify-center" style={{ height: '100px' }}>
          <span 
            className="font-black text-white text-7xl"
            style={{ 
              fontFamily: 'Impact, "Arial Black", sans-serif',
              textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
              fontWeight: 900,
            }}
          >
            {nextDigit}
          </span>
        </div>
      </div>
      
      {/* Top shadow */}
      <div 
        className="absolute top-0 left-0 right-0 pointer-events-none z-10"
        style={{
          height: '30%',
          background: 'linear-gradient(to bottom, rgba(55,0,0,0.95) 0%, transparent 100%)'
        }}
      />
      
      {/* Bottom shadow */}
      <div 
        className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
        style={{
          height: '30%',
          background: 'linear-gradient(to top, rgba(55,0,0,0.95) 0%, transparent 100%)'
        }}
      />
    </div>
  );
};

export default function DemoWinnerReveal({
  isOpen,
  onClose,
  realBallNumbers = [],
  realLuckyVotersCount = 3,
  realTotalEntries = 0,
  /*eslint-disable*/
  compact = false
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [displayDigits, setDisplayDigits] = useState(['0', '0', '0', '0', '0', '0']);
  const [digitSpinning, setDigitSpinning] = useState([false, false, false, false, false, false]);
  const [digitFalling, setDigitFalling] = useState([false, false, false, false, false, false]);
  const [finalDigits, setFinalDigits] = useState(['0', '0', '0', '0', '0', '0']);
  const [currentWinnerIndex, setCurrentWinnerIndex] = useState(-1);
  const [revealedWinners, setRevealedWinners] = useState([]);
  const [demoComplete, setDemoComplete] = useState(false);
  const [statusText, setStatusText] = useState('Click "Start Demo" to see winner reveal');

  // Generate sample winners
  const generateSampleWinners = useCallback(() => {
    const winners = [];
    const count = Math.min(realLuckyVotersCount, 5);
    const usedNumbers = new Set();
    
    for (let i = 0; i < count; i++) {
      let ballNumber;
      
      if (realBallNumbers.length > 0) {
        let attempts = 0;
        do {
          const idx = Math.floor(Math.random() * realBallNumbers.length);
          ballNumber = realBallNumbers[idx];
          attempts++;
        } while (usedNumbers.has(ballNumber) && attempts < 20);
        usedNumbers.add(ballNumber);
      } else {
        ballNumber = String(Math.floor(100000 + Math.random() * 900000));
      }
      
      winners.push({
        rank: i + 1,
        ballNumber: ballNumber.padStart(6, '0'),
        name: `Demo Voter ${i + 1}`
      });
    }
    
    return winners;
  }, [realBallNumbers, realLuckyVotersCount]);

  const getOrdinal = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  // Reveal single winner with FALLING effect
  const revealSingleWinner = async (winner, winnerIndex) => {
    const SPIN_DURATION = 1500; // 1.5 seconds of spinning
    const DIGIT_FALL_DELAY = 500; // 500ms between each digit falling
    
    setCurrentWinnerIndex(winnerIndex);
    setStatusText(`🎰 Revealing ${getOrdinal(winnerIndex + 1)} Lucky Voter...`);
    
    // Reset states
    setDigitFalling([false, false, false, false, false, false]);
    setFinalDigits(['0', '0', '0', '0', '0', '0']);
    
    // Start all digits spinning
    setDigitSpinning([true, true, true, true, true, true]);
    
    // Spin for a while
    await new Promise(resolve => setTimeout(resolve, SPIN_DURATION));
    
    setStatusText(`🎰 Dropping digits...`);
    
    // Get winner digits
    const winnerDigits = winner.ballNumber.split('');
    setFinalDigits(winnerDigits);
    
    // SEQUENTIAL FALL: Each digit falls one by one with bounce
    for (let i = 0; i < 6; i++) {
      // Stop spinning for this digit and start falling
      setDigitSpinning(prev => {
        const updated = [...prev];
        updated[i] = false;
        return updated;
      });
      
      setDigitFalling(prev => {
        const updated = [...prev];
        updated[i] = true;
        return updated;
      });
      
      // Wait for fall + bounce animation (600ms) plus delay before next
      await new Promise(resolve => setTimeout(resolve, DIGIT_FALL_DELAY));
      
      // Update display digit
      setDisplayDigits(prev => {
        const updated = [...prev];
        updated[i] = winnerDigits[i];
        return updated;
      });
    }
    
    // Wait for last digit to fully settle
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mark all as not falling (settled)
    setDigitFalling([false, false, false, false, false, false]);
    
    setStatusText(`🏆 ${getOrdinal(winnerIndex + 1)} Lucky Voter: ${winner.ballNumber}`);
    
    return winner;
  };

  // Run demo
  const runDemo = async () => {
    setIsRunning(true);
    setDemoComplete(false);
    setRevealedWinners([]);
    setCurrentWinnerIndex(-1);
    setDisplayDigits(['0', '0', '0', '0', '0', '0']);
    setDigitSpinning([false, false, false, false, false, false]);
    setDigitFalling([false, false, false, false, false, false]);
    
    const sampleWinners = generateSampleWinners();
    
    setStatusText(`🎲 Starting demo with ${sampleWinners.length} lucky voter(s)...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    for (let i = 0; i < sampleWinners.length; i++) {
      const winner = await revealSingleWinner(sampleWinners[i], i);
      setRevealedWinners(prev => [...prev, winner]);
      
      if (i < sampleWinners.length - 1) {
        setStatusText(`✅ ${getOrdinal(i + 1)} winner revealed! Next in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    setStatusText(`🎉 Demo complete! All ${sampleWinners.length} winner(s) revealed!`);
    setDemoComplete(true);
    setIsRunning(false);
    setCurrentWinnerIndex(-1);
  };

  // Reset
  const resetDemo = () => {
    setIsRunning(false);
    setDigitSpinning([false, false, false, false, false, false]);
    setDigitFalling([false, false, false, false, false, false]);
    setFinalDigits(['0', '0', '0', '0', '0', '0']);
    setCurrentWinnerIndex(-1);
    setRevealedWinners([]);
    setDemoComplete(false);
    setDisplayDigits(['0', '0', '0', '0', '0', '0']);
    setStatusText('Click "Start Demo" to see winner reveal');
  };

  useEffect(() => {
    if (!isOpen) resetDemo();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div 
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(180deg, #1f1f1f 0%, #0a0a0a 100%)',
          border: '4px solid #d4a418'
        }}
      >
        {/* Header */}
        <div 
          className="flex justify-between items-center px-5 py-4"
          style={{ background: 'linear-gradient(180deg, #d4a418 0%, #b8860b 100%)' }}
        >
          <h3 className="text-xl font-bold text-gray-900">
            🎰 Demo: Winner Reveal Preview
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/20 transition"
          >
            <X className="w-6 h-6 text-gray-900" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="mb-5 text-center">
            <p className="text-gray-400 text-sm mb-1">
              This demo shows what happens at election end
            </p>
            <p className="text-yellow-400 font-semibold">
              Lucky Voters: {Math.min(realLuckyVotersCount, 5)} | Total Entries: {realTotalEntries}
            </p>
          </div>

          {/* Slot Machine */}
          <div 
            className="rounded-xl p-6 mb-5"
            style={{ 
              background: '#0a0a0a', 
              boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.8)',
              border: '3px solid #333'
            }}
          >
            {/* Digits */}
            <div className="flex justify-center items-center gap-3 mb-4">
              {displayDigits.map((digit, index) => (
                <DemoSpinningDigit
                  key={`demo-digit-${index}`}
                  digit={digit}
                  isSpinning={digitSpinning[index]}
                  isFalling={digitFalling[index]}
                  finalDigit={finalDigits[index]}
                />
              ))}
            </div>
            
            {/* Status */}
            <div className="text-center">
              <p className={`text-base font-semibold ${
                demoComplete ? 'text-green-400' : 
                isRunning ? 'text-purple-400 animate-pulse' : 
                'text-gray-400'
              }`}>
                {statusText}
              </p>
            </div>
          </div>

          {/* Revealed Winners */}
          {revealedWinners.length > 0 && (
            <div className="mb-5">
              <h4 className="text-yellow-400 font-bold text-base mb-3 text-center">
                🏆 Revealed Winners
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {revealedWinners.map((winner, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-2"
                  >
                    <span className="text-yellow-400 font-bold text-lg">
                      {getOrdinal(index + 1)}
                    </span>
                    <span className="text-white font-mono text-xl font-bold">
                      {winner.ballNumber}
                    </span>
                    <span className="text-gray-400">
                      {winner.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center gap-4">
            {!isRunning && !demoComplete && (
              <button
                onClick={runDemo}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-8 py-3 rounded-xl transition text-lg"
              >
                <Play className="w-5 h-5" />
                Start Demo
              </button>
            )}
            
            {(demoComplete || isRunning) && (
              <button
                onClick={resetDemo}
                disabled={isRunning}
                className={`flex items-center gap-2 ${
                  isRunning 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-500'
                } text-white font-bold px-8 py-3 rounded-xl transition text-lg`}
              >
                <RotateCcw className="w-5 h-5" />
                {isRunning ? 'Running...' : 'Run Again'}
              </button>
            )}
            
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-8 py-3 rounded-xl transition text-lg"
            >
              Close
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-900 text-center">
          <p className="text-gray-500 text-sm">
            This is a preview. Actual winners are determined at election end.
          </p>
        </div>
      </div>
    </div>
  );
}













// // src/components/Dashboard/Tabs/lotteryyy/DemoWinnerReveal.jsx
// // Demo modal showing what happens at election end
// // Demonstrates: Fast spin → Gradual slow → Stop → Show winner (for each lucky voter)
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { X, Play, RotateCcw } from 'lucide-react';

// // Demo spinning digit component
// const DemoSpinningDigit = ({ 
//   digit,
//   isSpinning,
//   spinPhase, // 'fast' | 'slowing' | 'stopped'
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
  
//   const digitHeight = compact ? 45 : 70;
//   const fastSpeed = compact ? 18 : 28;
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
        
//         if (phase === 'fast') {
//           speed = fastSpeed;
//           tiltAmount = maxTilt;
//         } else if (phase === 'slowing') {
//           const easeProgress = 1 - Math.pow(1 - progress, 3);
//           speed = fastSpeed - (fastSpeed - minSpeed) * easeProgress;
//           tiltAmount = maxTilt * (1 - easeProgress);
          
//           if (speed <= minSpeed && progress >= 0.98) {
//             return;
//           }
//         } else {
//           return;
//         }
        
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
//   }, [isSpinning, digit, digitHeight, fastSpeed, minSpeed, maxTilt]);

//   const fontSize = compact ? 'text-3xl' : 'text-5xl';
//   const containerWidth = compact ? 35 : 55;
//   const containerHeightVal = compact ? 45 : 70;

//   return (
//     <div 
//       className="relative overflow-hidden rounded-lg"
//       style={{
//         width: `${containerWidth}px`,
//         height: `${containerHeightVal}px`,
//         background: 'linear-gradient(180deg, #7f1d1d 0%, #991b1b 20%, #b91c1c 50%, #991b1b 80%, #7f1d1d 100%)',
//         boxShadow: 'inset 0 3px 15px rgba(0,0,0,0.7), inset 0 -3px 15px rgba(0,0,0,0.5)',
//         border: '2px solid #1f2937',
//         borderRadius: '6px'
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
//           height: '30%',
//           background: 'linear-gradient(to bottom, rgba(55,0,0,0.9) 0%, transparent 100%)'
//         }}
//       />
      
//       <div 
//         className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
//         style={{
//           height: '30%',
//           background: 'linear-gradient(to top, rgba(55,0,0,0.9) 0%, transparent 100%)'
//         }}
//       />
//     </div>
//   );
// };

// export default function DemoWinnerReveal({
//   isOpen,
//   onClose,
//   realBallNumbers = [],
//   realLuckyVotersCount = 3,
//   realTotalEntries = 0,
//   /*eslint-disable*/
//   compact = false
// }) {
//   const [isRunning, setIsRunning] = useState(false);
//   const [displayDigits, setDisplayDigits] = useState(['0', '0', '0', '0', '0', '0']);
//   const [isSpinning, setIsSpinning] = useState(false);
//   const [spinPhase, setSpinPhase] = useState('stopped');
//   const [slowdownProgress, setSlowdownProgress] = useState(0);
//   /*eslint-disable*/
//   const [currentWinnerIndex, setCurrentWinnerIndex] = useState(-1);
//   const [revealedWinners, setRevealedWinners] = useState([]);
//   const [demoComplete, setDemoComplete] = useState(false);
//   const [statusText, setStatusText] = useState('Click "Start Demo" to see winner reveal');
  
//   const slowdownIntervalRef = useRef(null);

//   // Generate sample winners from real ball numbers or random
//   const generateSampleWinners = useCallback(() => {
//     const winners = [];
//     const count = Math.min(realLuckyVotersCount, 5); // Max 5 for demo
//     const usedNumbers = new Set();
    
//     for (let i = 0; i < count; i++) {
//       let ballNumber;
      
//       if (realBallNumbers.length > 0) {
//         // Use real ball numbers if available
//         let attempts = 0;
//         do {
//           const idx = Math.floor(Math.random() * realBallNumbers.length);
//           ballNumber = realBallNumbers[idx];
//           attempts++;
//         } while (usedNumbers.has(ballNumber) && attempts < 20);
//         usedNumbers.add(ballNumber);
//       } else {
//         // Generate random 6-digit number
//         ballNumber = String(Math.floor(100000 + Math.random() * 900000));
//       }
      
//       winners.push({
//         rank: i + 1,
//         ballNumber: ballNumber.padStart(6, '0'),
//         name: `Demo Voter ${i + 1}`
//       });
//     }
    
//     return winners;
//   }, [realBallNumbers, realLuckyVotersCount]);

//   // Get random voter ID for spinning display
//   const getRandomVoterId = useCallback(() => {
//     if (realBallNumbers.length > 0) {
//       const idx = Math.floor(Math.random() * realBallNumbers.length);
//       return realBallNumbers[idx].padStart(displayDigits.length, '0');
//     }
//     const min = Math.pow(10, displayDigits.length - 1);
//     const max = Math.pow(10, displayDigits.length) - 1;
//     return String(Math.floor(min + Math.random() * (max - min)));
//   }, [realBallNumbers, displayDigits.length]);

//   // Reveal single winner with animation
//   const revealSingleWinner = async (winner, winnerIndex) => {
//     const FAST_PHASE_DURATION = 2000;
//     const SLOW_PHASE_DURATION = 2000;
    
//     setCurrentWinnerIndex(winnerIndex);
//     setStatusText(`🎰 Revealing ${getOrdinal(winnerIndex + 1)} Lucky Voter...`);
    
//     // Fast phase
//     setIsSpinning(true);
//     setSpinPhase('fast');
//     setSlowdownProgress(0);
    
//     const fastInterval = setInterval(() => {
//       const voterId = getRandomVoterId();
//       setDisplayDigits(voterId.split(''));
//     }, 80);
    
//     await new Promise(resolve => setTimeout(resolve, FAST_PHASE_DURATION));
    
//     clearInterval(fastInterval);
    
//     // Slowing phase
//     setSpinPhase('slowing');
//     setStatusText(`🎰 Slowing down...`);
    
//     const slowdownStartTime = Date.now();
    
//     await new Promise(resolve => {
//       let lastUpdate = 0;
//       slowdownIntervalRef.current = setInterval(() => {
//         const elapsed = Date.now() - slowdownStartTime;
//         const progress = Math.min(elapsed / SLOW_PHASE_DURATION, 1);
//         setSlowdownProgress(progress);
        
//         const updateInterval = 80 + progress * 300;
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
    
//     // Stop and show winner
//     setIsSpinning(false);
//     setSpinPhase('stopped');
//     setSlowdownProgress(0);
    
//     await new Promise(resolve => setTimeout(resolve, 200));
    
//     setDisplayDigits(winner.ballNumber.split(''));
//     setStatusText(`🏆 ${getOrdinal(winnerIndex + 1)} Lucky Voter: ${winner.ballNumber}`);
    
//     return winner;
//   };

//   // Run full demo
//   const runDemo = async () => {
//     setIsRunning(true);
//     setDemoComplete(false);
//     setRevealedWinners([]);
//     setCurrentWinnerIndex(-1);
//     setDisplayDigits(['0', '0', '0', '0', '0', '0']);
    
//     const sampleWinners = generateSampleWinners();
    
//     setStatusText(`🎲 Starting demo with ${sampleWinners.length} lucky voter(s)...`);
//     await new Promise(resolve => setTimeout(resolve, 1000));
    
//     for (let i = 0; i < sampleWinners.length; i++) {
//       const winner = await revealSingleWinner(sampleWinners[i], i);
//       setRevealedWinners(prev => [...prev, winner]);
      
//       // Wait before next winner
//       if (i < sampleWinners.length - 1) {
//         setStatusText(`✅ ${getOrdinal(i + 1)} winner revealed! Next in 2 seconds...`);
//         await new Promise(resolve => setTimeout(resolve, 2000));
//       }
//     }
    
//     setStatusText(`🎉 Demo complete! All ${sampleWinners.length} winner(s) revealed!`);
//     setDemoComplete(true);
//     setIsRunning(false);
//     setCurrentWinnerIndex(-1);
//   };

//   // Reset demo
//   const resetDemo = () => {
//     setIsRunning(false);
//     setIsSpinning(false);
//     setSpinPhase('stopped');
//     setSlowdownProgress(0);
//     setCurrentWinnerIndex(-1);
//     setRevealedWinners([]);
//     setDemoComplete(false);
//     setDisplayDigits(['0', '0', '0', '0', '0', '0']);
//     setStatusText('Click "Start Demo" to see winner reveal');
    
//     if (slowdownIntervalRef.current) {
//       clearInterval(slowdownIntervalRef.current);
//     }
//   };

//   // Cleanup on close
//   useEffect(() => {
//     if (!isOpen) {
//       resetDemo();
//     }
//   }, [isOpen]);

//   const getOrdinal = (n) => {
//     const s = ['th', 'st', 'nd', 'rd'];
//     const v = n % 100;
//     return n + (s[(v - 20) % 10] || s[v] || s[0]);
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
//       <div 
//         className="relative w-full max-w-lg rounded-xl overflow-hidden shadow-2xl"
//         style={{
//           background: 'linear-gradient(180deg, #1f1f1f 0%, #0a0a0a 100%)',
//           border: '3px solid #d4a418'
//         }}
//       >
//         {/* Header */}
//         <div 
//           className="flex justify-between items-center px-4 py-3"
//           style={{ background: 'linear-gradient(180deg, #d4a418 0%, #b8860b 100%)' }}
//         >
//           <h3 className="text-lg font-bold text-gray-900">
//             🎰 Demo: Winner Reveal Preview
//           </h3>
//           <button
//             onClick={onClose}
//             className="p-1 rounded-full hover:bg-black/20 transition"
//           >
//             <X className="w-5 h-5 text-gray-900" />
//           </button>
//         </div>

//         {/* Content */}
//         <div className="p-4">
//           {/* Info */}
//           <div className="mb-4 text-center">
//             <p className="text-gray-400 text-sm mb-1">
//               This demo shows what happens at election end
//             </p>
//             <p className="text-yellow-400 text-sm font-medium">
//               Lucky Voters to reveal: {Math.min(realLuckyVotersCount, 5)} | 
//               Total Entries: {realTotalEntries}
//             </p>
//           </div>

//           {/* Slot Machine Display */}
//           <div 
//             className="rounded-lg p-4 mb-4"
//             style={{ background: '#0a0a0a', boxShadow: 'inset 0 3px 15px rgba(0,0,0,0.8)' }}
//           >
//             <div className="flex justify-center items-center gap-1 mb-3">
//               {displayDigits.map((digit, index) => (
//                 <DemoSpinningDigit
//                   key={`demo-digit-${index}`}
//                   digit={digit}
//                   isSpinning={isSpinning}
//                   spinPhase={spinPhase}
//                   slowdownProgress={slowdownProgress}
//                   compact={true}
//                 />
//               ))}
//             </div>
            
//             {/* Status */}
//             <div className="text-center">
//               <p className={`text-sm font-medium ${
//                 demoComplete ? 'text-green-400' : 
//                 isRunning ? 'text-purple-400 animate-pulse' : 
//                 'text-gray-400'
//               }`}>
//                 {statusText}
//               </p>
//             </div>
//           </div>

//           {/* Revealed Winners */}
//           {revealedWinners.length > 0 && (
//             <div className="mb-4">
//               <h4 className="text-yellow-400 font-semibold text-sm mb-2 text-center">
//                 🏆 Revealed Winners
//               </h4>
//               <div className="space-y-1 max-h-32 overflow-y-auto">
//                 {revealedWinners.map((winner, index) => (
//                   <div 
//                     key={index}
//                     className="flex items-center justify-between bg-gray-800 rounded px-3 py-1.5 text-sm"
//                   >
//                     <span className="text-yellow-400 font-bold">
//                       {getOrdinal(index + 1)}
//                     </span>
//                     <span className="text-white font-mono">
//                       {winner.ballNumber}
//                     </span>
//                     <span className="text-gray-400">
//                       {winner.name}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Controls */}
//           <div className="flex justify-center gap-3">
//             {!isRunning && !demoComplete && (
//               <button
//                 onClick={runDemo}
//                 className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-6 py-2 rounded-lg transition"
//               >
//                 <Play className="w-4 h-4" />
//                 Start Demo
//               </button>
//             )}
            
//             {(demoComplete || isRunning) && (
//               <button
//                 onClick={resetDemo}
//                 disabled={isRunning}
//                 className={`flex items-center gap-2 ${
//                   isRunning 
//                     ? 'bg-gray-600 cursor-not-allowed' 
//                     : 'bg-blue-600 hover:bg-blue-500'
//                 } text-white font-semibold px-6 py-2 rounded-lg transition`}
//               >
//                 <RotateCcw className="w-4 h-4" />
//                 {isRunning ? 'Running...' : 'Run Again'}
//               </button>
//             )}
            
//             <button
//               onClick={onClose}
//               className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg transition"
//             >
//               Close
//             </button>
//           </div>
//         </div>

//         {/* Footer note */}
//         <div className="px-4 py-2 bg-gray-900 text-center">
//           <p className="text-gray-500 text-xs">
//             This is a preview. Actual winners are determined at election end.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
// // src/components/Dashboard/Tabs/lotteryyy/DemoWinnerReveal.jsx
// // ============================================================================
// // 🎰 DEMO WINNER REVEAL - Shows what happens at election end
// // ============================================================================
// // This component demonstrates the winner reveal animation using REAL data
// // from the parent LotterySlotMachine component.
// // 
// // It does NOT change any original data - it uses:
// // - Real ball numbers from API
// // - Real lucky voters count from API
// // - Real total entries from API
// // ============================================================================

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { X, Play, RotateCcw } from 'lucide-react';

// export default function DemoWinnerReveal({
//   isOpen,
//   onClose,
//   // REAL DATA from parent (LotterySlotMachine)
//   realBallNumbers = [],        // Real ball numbers from API
//   realLuckyVotersCount = 2,    // Real lucky voters count from API
//   realTotalEntries = 0,        // Real total entries from API
//   /*eslint-disable*/
//   compact = false,
// }) {
//   // ============================================================================
//   // STATE
//   // ============================================================================
//   const [demoPhase, setDemoPhase] = useState('ready'); // ready, revealing, completed
//   const [displayDigits, setDisplayDigits] = useState(['0', '0', '0', '0', '0', '0']);
//   const [revealedWinners, setRevealedWinners] = useState([]);
//   const [currentRevealIndex, setCurrentRevealIndex] = useState(-1);
//   const [statusMessage, setStatusMessage] = useState('Click "Start Demo" to see winner reveal');

//   const spinIntervalRef = useRef(null);
//   const isRevealingRef = useRef(false);

//   // ============================================================================
//   // HELPER FUNCTIONS
//   // ============================================================================

//   // Get random ball number from REAL voter pool
//   const getRandomBallNumber = useCallback(() => {
//     if (realBallNumbers.length > 0) {
//       const randomIndex = Math.floor(Math.random() * realBallNumbers.length);
//       return realBallNumbers[randomIndex];
//     }
//     // Fallback if no real data
//     return String(Math.floor(100000 + Math.random() * 900000));
//   }, [realBallNumbers]);

//   // Get ordinal suffix (1st, 2nd, 3rd, etc.)
//   const getOrdinal = (n) => {
//     const s = ['th', 'st', 'nd', 'rd'];
//     const v = n % 100;
//     return n + (s[(v - 20) % 10] || s[v] || s[0]);
//   };

//   // Generate simulated winners from REAL ball numbers
//   const generateWinnersFromRealData = useCallback(() => {
//     const winners = [];
//     const availableBallNumbers = [...realBallNumbers];
    
//     for (let i = 0; i < realLuckyVotersCount && availableBallNumbers.length > 0; i++) {
//       // Pick a random ball number from available pool
//       const randomIndex = Math.floor(Math.random() * availableBallNumbers.length);
//       const ballNumber = availableBallNumbers.splice(randomIndex, 1)[0];
      
//       winners.push({
//         id: i + 1,
//         displayName: `Lucky Voter`,
//         ballNumber: ballNumber,
//         rank: i + 1,
//       });
//     }
    
//     return winners;
//   }, [realBallNumbers, realLuckyVotersCount]);

//   // ============================================================================
//   // DEMO FUNCTIONS
//   // ============================================================================

//   // Reset demo to initial state
//   const resetDemo = useCallback(() => {
//     isRevealingRef.current = false;
//     if (spinIntervalRef.current) {
//       clearInterval(spinIntervalRef.current);
//       spinIntervalRef.current = null;
//     }
//     setDemoPhase('ready');
//     setDisplayDigits(['0', '0', '0', '0', '0', '0']);
//     setRevealedWinners([]);
//     setCurrentRevealIndex(-1);
//     setStatusMessage('Click "Start Demo" to see winner reveal');
//   }, []);

//   // Start the winner reveal demo
//   const startWinnerRevealDemo = async () => {
//     if (isRevealingRef.current) return;
    
//     isRevealingRef.current = true;
//     setDemoPhase('revealing');
//     setRevealedWinners([]);

//     // Generate winners from REAL ball numbers
//     const winners = generateWinnersFromRealData();

//     if (winners.length === 0) {
//       setStatusMessage('⚠️ No ball numbers available for demo');
//       setDemoPhase('ready');
//       isRevealingRef.current = false;
//       return;
//     }

//     // Reveal each winner one by one (as per PDF requirement)
//     for (let i = 0; i < winners.length; i++) {
//       if (!isRevealingRef.current) break; // Stop if demo was reset
      
//       setCurrentRevealIndex(i);
//       setStatusMessage(`🎊 Revealing ${getOrdinal(i + 1)} Lucky Voter Winner...`);

//       // Dramatic slowdown effect (like real slot machine)
//       // Fast spinning that gradually slows down
//       for (let j = 0; j < 15; j++) {
//         if (!isRevealingRef.current) break;
//         await new Promise(resolve => setTimeout(resolve, 80 + j * 15));
//         const ballNumber = getRandomBallNumber();
//         setDisplayDigits(ballNumber.split(''));
//       }

//       // Final slowdown - very slow
//       for (let k = 0; k < 8; k++) {
//         if (!isRevealingRef.current) break;
//         await new Promise(resolve => setTimeout(resolve, 200 + k * 100));
//         const ballNumber = getRandomBallNumber();
//         setDisplayDigits(ballNumber.split(''));
//       }

//       if (!isRevealingRef.current) break;

//       // STOP and reveal the winner's ball number
//       setDisplayDigits(winners[i].ballNumber.split(''));

//       // Flash effect pause
//       await new Promise(resolve => setTimeout(resolve, 500));

//       if (!isRevealingRef.current) break;

//       // Add to revealed winners list
//       setRevealedWinners(prev => [...prev, winners[i]]);

//       // Wait before revealing next winner
//       if (i < winners.length - 1) {
//         setStatusMessage(`✅ ${getOrdinal(i + 1)} Winner Revealed! Preparing ${getOrdinal(i + 2)}...`);
//         await new Promise(resolve => setTimeout(resolve, 2500));
//       }
//     }

//     if (isRevealingRef.current) {
//       // All winners revealed
//       setCurrentRevealIndex(-1);
//       setDemoPhase('completed');
//       setStatusMessage(`✅ All ${winners.length} Lucky Voter(s) Revealed!`);
//       isRevealingRef.current = false;
//     }
//   };

//   // Cleanup on unmount or close
//   useEffect(() => {
//     if (!isOpen) {
//       resetDemo();
//     }
//     return () => {
//       isRevealingRef.current = false;
//       if (spinIntervalRef.current) {
//         clearInterval(spinIntervalRef.current);
//       }
//     };
//   }, [isOpen, resetDemo]);

//   // ============================================================================
//   // RENDER
//   // ============================================================================
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
//       <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-black rounded-xl overflow-hidden border-4 border-yellow-500 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        
//         {/* Header */}
//         <div className="bg-purple-900 px-4 py-3 flex justify-between items-center border-b-2 border-purple-500">
//           <div className="flex items-center gap-2">
//             <span className="text-2xl">🎰</span>
//             <div>
//               <h3 className="text-white font-bold">Demo: Winner Reveal</h3>
//               <p className="text-purple-300 text-xs">See what happens at election end</p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="text-white hover:text-red-400 transition p-1"
//           >
//             <X className="w-6 h-6" />
//           </button>
//         </div>

//         {/* Demo Controls */}
//         <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
//           <div className="text-gray-400 text-sm">
//             <span>Using real data: </span>
//             <span className="text-white font-semibold">{realTotalEntries} entries</span>
//             <span className="mx-2">•</span>
//             <span className="text-white font-semibold">{realLuckyVotersCount} winners</span>
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={resetDemo}
//               className="flex items-center gap-1 bg-gray-600 hover:bg-gray-500 text-white px-3 py-1.5 rounded text-sm font-medium transition"
//             >
//               <RotateCcw className="w-4 h-4" />
//               Reset
//             </button>
//             <button
//               onClick={startWinnerRevealDemo}
//               disabled={demoPhase === 'revealing'}
//               className="flex items-center gap-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded text-sm font-medium transition"
//             >
//               <Play className="w-4 h-4" />
//               {demoPhase === 'ready' ? 'Start Demo' : demoPhase === 'revealing' ? 'Revealing...' : 'Run Again'}
//             </button>
//           </div>
//         </div>

//         {/* Slot Machine Display */}
//         <div className="p-4 bg-gradient-to-b from-gray-800 to-gray-900">
//           {/* Digit Display */}
//           <div className="flex justify-center gap-1 mb-3">
//             {displayDigits.map((digit, index) => (
//               <div key={index} className="relative">
//                 <div 
//                   className={`
//                     w-12 h-16 sm:w-14 sm:h-20
//                     bg-gradient-to-b from-gray-100 via-white to-gray-200
//                     rounded-lg flex items-center justify-center
//                     border-2 border-gray-400 shadow-lg
//                     relative overflow-hidden
//                     ${demoPhase === 'revealing' ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''}
//                   `}
//                 >
//                   <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/60 to-transparent" />
//                   <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 transform -translate-y-1/2 z-10" />
//                   <span 
//                     className={`
//                       text-3xl sm:text-4xl font-black text-gray-900 relative z-20
//                       ${demoPhase === 'revealing' ? 'animate-pulse' : ''}
//                     `}
//                     style={{ 
//                       fontFamily: 'Impact, Arial Black, sans-serif',
//                       textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
//                     }}
//                   >
//                     {digit}
//                   </span>
//                   <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-gray-300/40 to-transparent" />
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Status Message */}
//           <div className="text-center">
//             <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${
//               demoPhase === 'ready' 
//                 ? 'bg-gray-500/20 border border-gray-500' 
//                 : demoPhase === 'revealing'
//                 ? 'bg-purple-500/20 border border-purple-500'
//                 : 'bg-green-500/20 border border-green-500'
//             }`}>
//               <span className={`text-sm font-medium ${
//                 demoPhase === 'ready' 
//                   ? 'text-gray-400' 
//                   : demoPhase === 'revealing'
//                   ? 'text-purple-400 animate-pulse'
//                   : 'text-green-400'
//               }`}>
//                 {statusMessage}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Winners Display Section */}
//         {revealedWinners.length > 0 && (
//           <div className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 px-4 py-3 border-t-2 border-yellow-400">
//             <h3 className="text-yellow-900 font-bold text-sm mb-2 text-center">
//               🏆 LUCKY VOTERS WINNERS 🏆
//             </h3>
            
//             <div className="space-y-1.5">
//               {revealedWinners.map((winner, index) => (
//                 <div 
//                   key={index}
//                   className="bg-white rounded-lg px-3 py-2 flex items-center justify-between shadow-md"
//                   style={{ animation: 'fadeIn 0.5s ease-out' }}
//                 >
//                   <div className="flex items-center gap-2">
//                     <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 font-black w-8 h-8 rounded-full flex items-center justify-center text-xs shadow">
//                       {getOrdinal(winner.rank)}
//                     </div>
//                     <div>
//                       <p className="font-bold text-gray-900 text-sm">
//                         {winner.displayName}
//                       </p>
//                       <p className="text-gray-500 text-xs font-mono">
//                         Ball #: {winner.ballNumber}
//                       </p>
//                     </div>
//                   </div>
//                   <span className="text-2xl">🏆</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Info Footer */}
//         <div className="bg-gray-900 px-4 py-2 border-t border-gray-700">
//           <p className="text-gray-500 text-xs text-center">
//             💡 This demo uses your real ball numbers ({realBallNumbers.length} available) to simulate the winner reveal
//           </p>
//         </div>
//       </div>

//       {/* CSS for fade-in animation */}
//       <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(-10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//       `}</style>
//     </div>
//   );
// }