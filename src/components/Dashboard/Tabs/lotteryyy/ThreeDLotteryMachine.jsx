// src/components/Dashboard/Tabs/lotteryyy/ThreeDLotteryMachine.jsx
//  FIXED VERSION - Shows balls correctly
import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AlertCircle } from 'lucide-react';
import { LotteryMachineScene } from '../../../../services/three/LotteryMachineScene';
import { setAnimationState, addBallToMachine } from '../../../../redux/slices/lotteryySlice';

export default function ThreeDLotteryMachine({ 
  participants = [],
  myBallNumber = null,
  winners = [],
  onBallExtracted = null,
}) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const initAttemptedRef = useRef(false);
  const dispatch = useDispatch();
  
  const { animationState, participantCount, winnerCount } = useSelector(state => state.lotteryyy);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [ballsLoaded, setBallsLoaded] = useState(0);
  const [initError, setInitError] = useState(null);



  useEffect(() => {
    if (initAttemptedRef.current) {
      console.log('Init already attempted, skipping');
      return;
    }

    if (!containerRef.current) {
      console.warn(' Container ref not ready');
      return;
    }

    initAttemptedRef.current = true;

    const initTimer = setTimeout(() => {
      const width = containerRef.current?.clientWidth || 0;
      const height = containerRef.current?.clientHeight || 0;


      if (width === 0 || height === 0) {
        console.warn(' Container has no size, retrying...');
        initAttemptedRef.current = false;
        return;
      }

      try {
        sceneRef.current = new LotteryMachineScene(containerRef.current);
        setIsInitialized(true);
        setInitError(null);
        console.log(' 3D Lottery Machine initialized');
      } catch (error) {
        console.error(' Failed to initialize 3D scene:', error);
        setInitError(error.message);
        initAttemptedRef.current = false;
      }
    }, 100);

    return () => {
      clearTimeout(initTimer);
      if (sceneRef.current) {
        console.log(' Cleaning up Three.js scene');
        sceneRef.current.dispose();
        sceneRef.current = null;
      }
      initAttemptedRef.current = false;
    };
  }, []);

  //  FIXED: Add balls when participants data arrives
  useEffect(() => {
    if (!sceneRef.current || !isInitialized) {
      console.log('Scene not ready');
      return;
    }

    if (!participants || participants.length === 0) {
      console.log('No participants data');
      return;
    }

    //  SAFETY: Don't add if we already have the right amount
    if (ballsLoaded >= participants.length) {
      console.log(' Already loaded all balls');
      return;
    }

    const scene = sceneRef.current;
    
   

    const addNewBalls = async () => {
      for (let i = ballsLoaded; i < participants.length; i++) {
        const participant = participants[i];
        
        //  USE ACTUAL BALL NUMBER from participant data
        const actualBallNumber = participant.ball_number || participant.ballNumber;
        
        console.log(`   ✨ Adding ball ${i + 1}/${participants.length}:`, {
          ballNumber: actualBallNumber,
          userId: participant.user_id || participant.userId,
        });
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // ✅ Add ball with ACTUAL ball number
        scene.addBall(actualBallNumber, true);
        
        setBallsLoaded(i + 1);
        
        dispatch(addBallToMachine({
          ballNumber: actualBallNumber,
          userId: participant.user_id || participant.userId,
        }));
      }
      
      console.log('✅ Finished adding balls. Total in scene:', scene.balls.length);
    };

    addNewBalls();
  }, [participants, isInitialized, ballsLoaded, dispatch]);

  // Highlight user's ball
  useEffect(() => {
    if (!sceneRef.current || !myBallNumber || !isInitialized) return;

    console.log('🌟 Highlighting ball:', myBallNumber);
    const scene = sceneRef.current;
    scene.highlightBall(myBallNumber);
  }, [myBallNumber, isInitialized]);

  // Handle winner extraction animation
  useEffect(() => {
    if (!sceneRef.current || animationState !== 'drawing' || winners.length === 0) return;

    const scene = sceneRef.current;
    
    const extractWinners = async () => {
      for (const winner of winners) {
        await new Promise(resolve => {
          /*eslint-disable*/
          scene.extractBall(winner.ball_number, (ball) => {
            if (onBallExtracted) {
              onBallExtracted(winner);
            }
            setTimeout(resolve, 2000);
          });
        });
      }
      
      dispatch(setAnimationState('winner_reveal'));
    };

    extractWinners();
  }, [animationState, winners, dispatch, onBallExtracted]);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      {/* 3D Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full rounded-lg overflow-hidden bg-gray-900"
        style={{ minHeight: '400px' }}
      />

      {/* Loading Overlay */}
      {!isInitialized && !initError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 rounded-lg">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-white text-lg font-semibold">Initializing 3D Lottery Machine...</p>
            <p className="text-gray-400 text-sm mt-2">Loading WebGL renderer...</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {initError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-75 rounded-lg">
          <div className="text-center text-white p-6">
            <AlertCircle className="w-16 h-16 mx-auto mb-4" />
            <p className="font-bold text-lg mb-2">3D Scene Error</p>
            <p className="text-sm mb-4">{initError}</p>
            <button
              onClick={() => {
                initAttemptedRef.current = false;
                setInitError(null);
                window.location.reload();
              }}
              className="bg-white text-red-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

      {/* Ball Counter */}
      {isInitialized && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
          <p className="text-sm font-semibold">Lottery Balls</p>
          <p className="text-3xl font-bold">{participantCount || 0}</p>
          <p className="text-xs text-gray-300">Total Balls</p>
          {winnerCount > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-600">
              <p className="text-xs text-yellow-400 font-semibold">🏆 {winnerCount} Winner{winnerCount !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>
      )}

      {/* My Ball Indicator */}
      {myBallNumber && isInitialized && (
        <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <p className="text-xs font-semibold uppercase">Your Ball Number</p>
          <p className="text-2xl font-bold">{myBallNumber}</p>
        </div>
      )}

      {/* Animation Status */}
      {animationState !== 'idle' && isInitialized && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg">
          {animationState === 'vote_flying' && (
            <p className="text-sm font-semibold">🎯 Vote entering lottery...</p>
          )}
          {animationState === 'ball_spinning' && (
            <p className="text-sm font-semibold">🎰 Balls spinning...</p>
          )}
          {animationState === 'drawing' && (
            <p className="text-sm font-semibold animate-pulse">🎉 Drawing winners...</p>
          )}
        </div>
      )}

      {/* Controls Hint */}
      {isInitialized && (
        <div className="absolute bottom-3 right-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-xs">
          <p>🖱️ Drag to rotate • Scroll to zoom </p>
        </div>
      )}
    </div>
  );
}
//last workable perfect code
// // src/components/Dashboard/Tabs/lotteryyy/ThreeDLotteryMachine.jsx
// //  STUNNING 3D Lottery Machine Component - STABLE VERSION
// import React, { useEffect, useRef, useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { AlertCircle } from 'lucide-react';
// import { LotteryMachineScene } from '../../../../services/three/LotteryMachineScene';
// import { setAnimationState, addBallToMachine } from '../../../../redux/slices/lotteryySlice';

// export default function ThreeDLotteryMachine({ 
//   participants = [],
//   myBallNumber = null,
//   winners = [],
//   onBallExtracted = null,
// }) {
//   const containerRef = useRef(null);
//   const sceneRef = useRef(null);
//   const initAttemptedRef = useRef(false); //  Prevent multiple init attempts
//   const dispatch = useDispatch();
  
//   const { animationState, participantCount, winnerCount } = useSelector(state => state.lotteryyy);
  
//   const [isInitialized, setIsInitialized] = useState(false);
//   const [ballsLoaded, setBallsLoaded] = useState(0);
//   const [initError, setInitError] = useState(null);

//   //  CRITICAL FIX: Stable initialization with proper dependency management
//   useEffect(() => {
//     // Prevent re-initialization if already attempted
//     if (initAttemptedRef.current) {
//       console.log('⏭️ Init already attempted, skipping');
//       return;
//     }

//     if (!containerRef.current) {
//       console.warn('⚠️ Container ref not ready');
//       return;
//     }

//     // Mark as attempted
//     initAttemptedRef.current = true;

//     // Wait for container to have size
//     const initTimer = setTimeout(() => {
//       const width = containerRef.current?.clientWidth || 0;
//       const height = containerRef.current?.clientHeight || 0;

//       console.log('🎨 Initializing Three.js scene...');
//       console.log('📏 Container size:', width, 'x', height);

//       if (width === 0 || height === 0) {
//         console.warn('⚠️ Container has no size, retrying...');
//         initAttemptedRef.current = false; // Allow retry
//         return;
//       }

//       try {
//         sceneRef.current = new LotteryMachineScene(containerRef.current);
//         setIsInitialized(true);
//         setInitError(null);
//         console.log('✅ 3D Lottery Machine initialized');
//       } catch (error) {
//         console.error('❌ Failed to initialize 3D scene:', error);
//         setInitError(error.message);
//         initAttemptedRef.current = false; // Allow retry on error
//       }
//     }, 100);

//     // ✅ CRITICAL: Only cleanup when component actually unmounts
//     return () => {
//       clearTimeout(initTimer);
//       if (sceneRef.current) {
//         console.log('🧹 Cleaning up Three.js scene');
//         sceneRef.current.dispose();
//         sceneRef.current = null;
//       }
//       initAttemptedRef.current = false;
//     };
//   }, []); // ✅ Empty deps - only run once on mount

//   // Add balls for participants
//   useEffect(() => {
//     if (!sceneRef.current || !isInitialized || participants.length === 0) return;

//     const scene = sceneRef.current;
    
//     // Add balls gradually for smooth animation
//     const addBallsGradually = async () => {
//       for (let i = ballsLoaded; i < participants.length; i++) {
//         const participant = participants[i];
        
//         // Wait a bit between each ball for smooth effect
//         await new Promise(resolve => setTimeout(resolve, 100));
        
//         scene.addBall(participant.ball_number, true);
//         setBallsLoaded(i + 1);
        
//         dispatch(addBallToMachine({
//           ballNumber: participant.ball_number,
//           userId: participant.user_id,
//         }));
//       }
//     };

//     addBallsGradually();
//   }, [participants, isInitialized, ballsLoaded, dispatch]);

//   // Highlight user's ball
//   useEffect(() => {
//     if (!sceneRef.current || !myBallNumber || !isInitialized) return;

//     const scene = sceneRef.current;
//     scene.highlightBall(myBallNumber);
//   }, [myBallNumber, isInitialized]);

//   // Handle winner extraction animation
//   useEffect(() => {
//     if (!sceneRef.current || animationState !== 'drawing' || winners.length === 0) return;

//     const scene = sceneRef.current;
    
//     const extractWinners = async () => {
//       for (const winner of winners) {
//         await new Promise(resolve => {
//           /*eslint-disable*/
//           scene.extractBall(winner.ball_number, (ball) => {
//             if (onBallExtracted) {
//               onBallExtracted(winner);
//             }
//             setTimeout(resolve, 2000);
//           });
//         });
//       }
      
//       dispatch(setAnimationState('winner_reveal'));
//     };

//     extractWinners();
//   }, [animationState, winners, dispatch, onBallExtracted]);

//   return (
//     <div className="relative w-full h-full min-h-[400px]">
//       {/* 3D Container */}
//       <div 
//         ref={containerRef} 
//         className="w-full h-full rounded-lg overflow-hidden bg-gray-900"
//         style={{ minHeight: '400px' }}
//       />

//       {/* Loading Overlay */}
//       {!isInitialized && !initError && (
//         <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 rounded-lg">
//           <div className="text-center">
//             <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
//             <p className="text-white text-lg font-semibold">Initializing 3D Lottery Machine...</p>
//             <p className="text-gray-400 text-sm mt-2">Loading WebGL renderer...</p>
//           </div>
//         </div>
//       )}

//       {/* Error Overlay */}
//       {initError && (
//         <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-75 rounded-lg">
//           <div className="text-center text-white p-6">
//             <AlertCircle className="w-16 h-16 mx-auto mb-4" />
//             <p className="font-bold text-lg mb-2">3D Scene Error</p>
//             <p className="text-sm mb-4">{initError}</p>
//             <button
//               onClick={() => {
//                 initAttemptedRef.current = false;
//                 setInitError(null);
//                 window.location.reload();
//               }}
//               className="bg-white text-red-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
//             >
//               Reload Page
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Ball Counter */}
//       {isInitialized && (
//         <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
//           <p className="text-sm font-semibold">Lottery Balls </p>
//           <p className="text-3xl font-bold">{ballsLoaded}</p>
//           <p className="text-xs text-gray-300">of {participantCount}</p>
//           {winnerCount > 0 && (
//             <div className="mt-2 pt-2 border-t border-gray-600">
//               <p className="text-xs text-yellow-400 font-semibold">🏆 {winnerCount} Winner{winnerCount !== 1 ? 's' : ''}</p>
//             </div>
//           )}
//         </div>
//       )}

//       {/* My Ball Indicator */}
//       {myBallNumber && isInitialized && (
//         <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg shadow-lg">
//           <p className="text-xs font-semibold uppercase">Your Ball Number</p>
//           <p className="text-2xl font-bold">{myBallNumber.toString().slice(-4)}</p>
//         </div>
//       )}

//       {/* Animation Status */}
//       {animationState !== 'idle' && isInitialized && (
//         <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg">
//           {animationState === 'vote_flying' && (
//             <p className="text-sm font-semibold">🎯 Vote entering lottery...</p>
//           )}
//           {animationState === 'ball_spinning' && (
//             <p className="text-sm font-semibold">🎰 Balls spinning...</p>
//           )}
//           {animationState === 'drawing' && (
//             <p className="text-sm font-semibold animate-pulse">🎉 Drawing winners...</p>
//           )}
//         </div>
//       )}

//       {/* Controls Hint */}
//       {isInitialized && (
//         <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-xs">
//           <p>🖱️ Drag to rotate • Scroll to zoom</p>
//         </div>
//       )}
//     </div>
//   );
// }
// // src/components/Dashboard/Tabs/lotteryyy/ThreeDLotteryMachine.jsx
// //  STUNNING 3D Lottery Machine Component - STABLE VERSION
// import React, { useEffect, useRef, useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { AlertCircle } from 'lucide-react';
// import { LotteryMachineScene } from '../../../../services/three/LotteryMachineScene';
// import { setAnimationState, addBallToMachine } from '../../../../redux/slices/lotteryySlice';

// export default function ThreeDLotteryMachine({ 
//   participants = [],
//   myBallNumber = null,
//   winners = [],
//   onBallExtracted = null,
// }) {
//   const containerRef = useRef(null);
//   const sceneRef = useRef(null);
//   const initAttemptedRef = useRef(false); //  Prevent multiple init attempts
//   const dispatch = useDispatch();
  
//   const { animationState, participantCount } = useSelector(state => state.lotteryyy);
  
//   const [isInitialized, setIsInitialized] = useState(false);
//   const [ballsLoaded, setBallsLoaded] = useState(0);
//   const [initError, setInitError] = useState(null);

//   //  CRITICAL FIX: Stable initialization with proper dependency management
//   useEffect(() => {
//     // Prevent re-initialization if already attempted
//     if (initAttemptedRef.current) {
//       console.log('⏭️ Init already attempted, skipping');
//       return;
//     }

//     if (!containerRef.current) {
//       console.warn('⚠️ Container ref not ready');
//       return;
//     }

//     // Mark as attempted
//     initAttemptedRef.current = true;

//     // Wait for container to have size
//     const initTimer = setTimeout(() => {
//       const width = containerRef.current?.clientWidth || 0;
//       const height = containerRef.current?.clientHeight || 0;

//       console.log('🎨 Initializing Three.js scene...');
//       console.log('📏 Container size:', width, 'x', height);

//       if (width === 0 || height === 0) {
//         console.warn('⚠️ Container has no size, retrying...');
//         initAttemptedRef.current = false; // Allow retry
//         return;
//       }

//       try {
//         sceneRef.current = new LotteryMachineScene(containerRef.current);
//         setIsInitialized(true);
//         setInitError(null);
//         console.log('✅ 3D Lottery Machine initialized');
//       } catch (error) {
//         console.error('❌ Failed to initialize 3D scene:', error);
//         setInitError(error.message);
//         initAttemptedRef.current = false; // Allow retry on error
//       }
//     }, 100);

//     // ✅ CRITICAL: Only cleanup when component actually unmounts
//     return () => {
//       clearTimeout(initTimer);
//       if (sceneRef.current) {
//         console.log('🧹 Cleaning up Three.js scene');
//         sceneRef.current.dispose();
//         sceneRef.current = null;
//       }
//       initAttemptedRef.current = false;
//     };
//   }, []); // ✅ Empty deps - only run once on mount

//   // Add balls for participants
//   useEffect(() => {
//     if (!sceneRef.current || !isInitialized || participants.length === 0) return;

//     const scene = sceneRef.current;
    
//     // Add balls gradually for smooth animation
//     const addBallsGradually = async () => {
//       for (let i = ballsLoaded; i < participants.length; i++) {
//         const participant = participants[i];
        
//         // Wait a bit between each ball for smooth effect
//         await new Promise(resolve => setTimeout(resolve, 100));
        
//         scene.addBall(participant.ball_number, true);
//         setBallsLoaded(i + 1);
        
//         dispatch(addBallToMachine({
//           ballNumber: participant.ball_number,
//           userId: participant.user_id,
//         }));
//       }
//     };

//     addBallsGradually();
//   }, [participants, isInitialized, ballsLoaded, dispatch]);

//   // Highlight user's ball
//   useEffect(() => {
//     if (!sceneRef.current || !myBallNumber || !isInitialized) return;

//     const scene = sceneRef.current;
//     scene.highlightBall(myBallNumber);
//   }, [myBallNumber, isInitialized]);

//   // Handle winner extraction animation
//   useEffect(() => {
//     if (!sceneRef.current || animationState !== 'drawing' || winners.length === 0) return;

//     const scene = sceneRef.current;
    
//     const extractWinners = async () => {
//       for (const winner of winners) {
//         await new Promise(resolve => {
//           /*eslint-disable*/
//           scene.extractBall(winner.ball_number, (ball) => {
//             if (onBallExtracted) {
//               onBallExtracted(winner);
//             }
//             setTimeout(resolve, 2000);
//           });
//         });
//       }
      
//       dispatch(setAnimationState('winner_reveal'));
//     };

//     extractWinners();
//   }, [animationState, winners, dispatch, onBallExtracted]);

//   return (
//     <div className="relative w-full h-full min-h-[400px]">
//       {/* 3D Container */}
//       <div 
//         ref={containerRef} 
//         className="w-full h-full rounded-lg overflow-hidden bg-gray-900"
//         style={{ minHeight: '400px' }}
//       />

//       {/* Loading Overlay */}
//       {!isInitialized && !initError && (
//         <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 rounded-lg">
//           <div className="text-center">
//             <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
//             <p className="text-white text-lg font-semibold">Initializing 3D Lottery Machine...</p>
//             <p className="text-gray-400 text-sm mt-2">Loading WebGL renderer...</p>
//           </div>
//         </div>
//       )}

//       {/* Error Overlay */}
//       {initError && (
//         <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-75 rounded-lg">
//           <div className="text-center text-white p-6">
//             <AlertCircle className="w-16 h-16 mx-auto mb-4" />
//             <p className="font-bold text-lg mb-2">3D Scene Error</p>
//             <p className="text-sm mb-4">{initError}</p>
//             <button
//               onClick={() => {
//                 initAttemptedRef.current = false;
//                 setInitError(null);
//                 window.location.reload();
//               }}
//               className="bg-white text-red-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
//             >
//               Reload Page
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Ball Counter */}
//       {isInitialized && (
//         <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
//           <p className="text-sm font-semibold">Lottery Balls </p>
//           <p className="text-3xl font-bold">{ballsLoaded}</p>
//           <p className="text-xs text-gray-300">of {participantCount}</p>
//         </div>
//       )}

//       {/* My Ball Indicator */}
//       {myBallNumber && isInitialized && (
//         <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg shadow-lg">
//           <p className="text-xs font-semibold uppercase">Your Ball Number</p>
//           <p className="text-2xl font-bold">{myBallNumber.toString().slice(-4)}</p>
//         </div>
//       )}

//       {/* Animation Status */}
//       {animationState !== 'idle' && isInitialized && (
//         <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg">
//           {animationState === 'vote_flying' && (
//             <p className="text-sm font-semibold">🎯 Vote entering lottery...</p>
//           )}
//           {animationState === 'ball_spinning' && (
//             <p className="text-sm font-semibold">🎰 Balls spinning...</p>
//           )}
//           {animationState === 'drawing' && (
//             <p className="text-sm font-semibold animate-pulse">🎉 Drawing winners...</p>
//           )}
//         </div>
//       )}

//       {/* Controls Hint */}
//       {isInitialized && (
//         <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-xs">
//           <p>🖱️ Drag to rotate • Scroll to zoom</p>
//         </div>
//       )}
//     </div>
//   );
// }
// // src/components/Dashboard/Tabs/lotteryyy/ThreeDLotteryMachine.jsx
// // ✨ STUNNING 3D Lottery Machine Component - FIXED VERSION
// import React, { useEffect, useRef, useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { AlertCircle } from 'lucide-react';
// import { LotteryMachineScene } from '../../../../services/three/LotteryMachineScene';
// import { setAnimationState, addBallToMachine } from '../../../../redux/slices/lotteryySlice';

// export default function ThreeDLotteryMachine({ 
//   participants = [],
//   myBallNumber = null,
//   winners = [],
//   onBallExtracted = null,
// }) {
//   const containerRef = useRef(null);
//   const sceneRef = useRef(null);
//   const dispatch = useDispatch();
  
//   const { animationState, participantCount } = useSelector(state => state.lotteryyy);
  
//   const [isInitialized, setIsInitialized] = useState(false);
//   const [ballsLoaded, setBallsLoaded] = useState(0);
//   const [initError, setInitError] = useState(null);

//   // Initialize Three.js scene
//   useEffect(() => {
//     if (!containerRef.current || isInitialized) return;

//     // ✅ FIX: Wait for container to have size
//     if (!containerRef.current.clientWidth || !containerRef.current.clientHeight) {
//       console.warn('⚠️ Container has no size yet, waiting...');
//       const checkSize = setInterval(() => {
//         if (containerRef.current && containerRef.current.clientWidth > 0) {
//           clearInterval(checkSize);
//           initializeScene();
//         }
//       }, 100);
      
//       setTimeout(() => clearInterval(checkSize), 5000); // Timeout after 5s
//       return;
//     }

//     initializeScene();

//     function initializeScene() {
//       try {
//         console.log('🎨 Initializing Three.js scene...');
//         console.log('📏 Container size:', containerRef.current.clientWidth, 'x', containerRef.current.clientHeight);
        
//         sceneRef.current = new LotteryMachineScene(containerRef.current);
//         setIsInitialized(true);
//         setInitError(null);
//         console.log('✅ 3D Lottery Machine initialized');
//       } catch (error) {
//         console.error('❌ Failed to initialize 3D scene:', error);
//         setInitError(error.message);
//       }
//     }

//     return () => {
//       if (sceneRef.current) {
//         console.log('🧹 Cleaning up Three.js scene');
//         sceneRef.current.dispose();
//       }
//     };
//   }, [isInitialized]);

//   // Add balls for participants
//   useEffect(() => {
//     if (!sceneRef.current || !isInitialized || participants.length === 0) return;

//     const scene = sceneRef.current;
    
//     // Add balls gradually for smooth animation
//     const addBallsGradually = async () => {
//       for (let i = ballsLoaded; i < participants.length; i++) {
//         const participant = participants[i];
        
//         // Wait a bit between each ball for smooth effect
//         await new Promise(resolve => setTimeout(resolve, 100));
        
//         scene.addBall(participant.ball_number, true);
//         setBallsLoaded(i + 1);
        
//         dispatch(addBallToMachine({
//           ballNumber: participant.ball_number,
//           userId: participant.user_id,
//         }));
//       }
//     };

//     addBallsGradually();
//   }, [participants, isInitialized, ballsLoaded, dispatch]);

//   // Highlight user's ball
//   useEffect(() => {
//     if (!sceneRef.current || !myBallNumber) return;

//     const scene = sceneRef.current;
//     scene.highlightBall(myBallNumber);
//   }, [myBallNumber, isInitialized]);

//   // Handle winner extraction animation
//   useEffect(() => {
//     if (!sceneRef.current || animationState !== 'drawing' || winners.length === 0) return;

//     const scene = sceneRef.current;
    
//     const extractWinners = async () => {
//       for (const winner of winners) {
//         await new Promise(resolve => {
//           /*eslint-disable*/
//           scene.extractBall(winner.ball_number, (ball) => {
//             if (onBallExtracted) {
//               onBallExtracted(winner);
//             }
//             setTimeout(resolve, 2000);
//           });
//         });
//       }
      
//       dispatch(setAnimationState('winner_reveal'));
//     };

//     extractWinners();
//   }, [animationState, winners, dispatch, onBallExtracted]);

//   return (
//     <div className="relative w-full h-full min-h-[400px]">
//       {/* 3D Container */}
//       <div 
//         ref={containerRef} 
//         className="w-full h-full rounded-lg overflow-hidden bg-gray-900"
//         style={{ minHeight: '400px' }}
//       />

//       {/* Loading Overlay */}
//       {!isInitialized && !initError && (
//         <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 rounded-lg">
//           <div className="text-center">
//             <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
//             <p className="text-white text-lg font-semibold">Initializing 3D Lottery Machine...</p>
//             <p className="text-gray-400 text-sm mt-2">Loading WebGL renderer...</p>
//           </div>
//         </div>
//       )}

//       {/* Error Overlay */}
//       {initError && (
//         <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-75 rounded-lg">
//           <div className="text-center text-white p-6">
//             <AlertCircle className="w-16 h-16 mx-auto mb-4" />
//             <p className="font-bold text-lg mb-2">3D Scene Error</p>
//             <p className="text-sm">{initError}</p>
//             <button
//               onClick={() => window.location.reload()}
//               className="mt-4 bg-white text-red-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
//             >
//               Reload Page
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Ball Counter */}
//       {isInitialized && (
//         <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
//           <p className="text-sm font-semibold">Lottery Balls</p>
//           <p className="text-3xl font-bold">{ballsLoaded}</p>
//           <p className="text-xs text-gray-300">of {participantCount}</p>
//         </div>
//       )}

//       {/* My Ball Indicator */}
//       {myBallNumber && isInitialized && (
//         <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg shadow-lg">
//           <p className="text-xs font-semibold uppercase">Your Ball Number</p>
//           <p className="text-2xl font-bold">{myBallNumber.toString().slice(-4)}</p>
//         </div>
//       )}

//       {/* Animation Status */}
//       {animationState !== 'idle' && (
//         <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg">
//           {animationState === 'vote_flying' && (
//             <p className="text-sm font-semibold">🎯 Vote entering lottery...</p>
//           )}
//           {animationState === 'ball_spinning' && (
//             <p className="text-sm font-semibold">🎰 Balls spinning...</p>
//           )}
//           {animationState === 'drawing' && (
//             <p className="text-sm font-semibold animate-pulse">🎉 Drawing winners...</p>
//           )}
//         </div>
//       )}

//       {/* Controls Hint */}
//       {isInitialized && (
//         <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-xs">
//           <p>🖱️ Drag to rotate • Scroll to zoom</p>
//         </div>
//       )}
//     </div>
//   );
// }
// // src/components/Dashboard/Tabs/lotteryyy/ThreeDLotteryMachine.jsx
// // ✨ STUNNING 3D Lottery Machine Component - FIXED VERSION
// import React, { useEffect, useRef, useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { AlertCircle } from 'lucide-react';
// import { LotteryMachineScene } from '../../../../services/three/LotteryMachineScene';
// import { setAnimationState, addBallToMachine } from '../../../../redux/slices/lotteryySlice';

// export default function ThreeDLotteryMachine({ 
//   participants = [],
//   myBallNumber = null,
//   winners = [],
//   onBallExtracted = null,
// }) {
//   const containerRef = useRef(null);
//   const sceneRef = useRef(null);
//   const dispatch = useDispatch();
  
//   const { animationState, participantCount } = useSelector(state => state.lotteryyy);
  
//   const [isInitialized, setIsInitialized] = useState(false);
//   const [ballsLoaded, setBallsLoaded] = useState(0);
//   const [initError, setInitError] = useState(null);

//   // Initialize Three.js scene
//   useEffect(() => {
//     if (!containerRef.current || isInitialized) return;

//     // ✅ FIX: Wait for container to have size
//     if (!containerRef.current.clientWidth || !containerRef.current.clientHeight) {
//       console.warn('⚠️ Container has no size yet, waiting...');
//       const checkSize = setInterval(() => {
//         if (containerRef.current && containerRef.current.clientWidth > 0) {
//           clearInterval(checkSize);
//           initializeScene();
//         }
//       }, 100);
      
//       setTimeout(() => clearInterval(checkSize), 5000); // Timeout after 5s
//       return;
//     }

//     initializeScene();

//     function initializeScene() {
//       try {
//         console.log('🎨 Initializing Three.js scene...');
//         console.log('📏 Container size:', containerRef.current.clientWidth, 'x', containerRef.current.clientHeight);
        
//         sceneRef.current = new LotteryMachineScene(containerRef.current);
//         setIsInitialized(true);
//         setInitError(null);
//         console.log('✅ 3D Lottery Machine initialized');
//       } catch (error) {
//         console.error('❌ Failed to initialize 3D scene:', error);
//         setInitError(error.message);
//       }
//     }

//     return () => {
//       if (sceneRef.current) {
//         console.log('🧹 Cleaning up Three.js scene');
//         sceneRef.current.dispose();
//       }
//     };
//   }, [isInitialized]);

//   // Add balls for participants
//   useEffect(() => {
//     if (!sceneRef.current || !isInitialized || participants.length === 0) return;

//     const scene = sceneRef.current;
    
//     // Add balls gradually for smooth animation
//     const addBallsGradually = async () => {
//       for (let i = ballsLoaded; i < participants.length; i++) {
//         const participant = participants[i];
        
//         // Wait a bit between each ball for smooth effect
//         await new Promise(resolve => setTimeout(resolve, 100));
        
//         scene.addBall(participant.ball_number, true);
//         setBallsLoaded(i + 1);
        
//         dispatch(addBallToMachine({
//           ballNumber: participant.ball_number,
//           userId: participant.user_id,
//         }));
//       }
//     };

//     addBallsGradually();
//   }, [participants, isInitialized, ballsLoaded, dispatch]);

//   // Highlight user's ball
//   useEffect(() => {
//     if (!sceneRef.current || !myBallNumber) return;

//     const scene = sceneRef.current;
//     scene.highlightBall(myBallNumber);
//   }, [myBallNumber, isInitialized]);

//   // Handle winner extraction animation
//   useEffect(() => {
//     if (!sceneRef.current || animationState !== 'drawing' || winners.length === 0) return;

//     const scene = sceneRef.current;
    
//     const extractWinners = async () => {
//       for (const winner of winners) {
//         await new Promise(resolve => {
//           /*eslint-disable*/
//           scene.extractBall(winner.ball_number, (ball) => {
//             if (onBallExtracted) {
//               onBallExtracted(winner);
//             }
//             setTimeout(resolve, 2000);
//           });
//         });
//       }
      
//       dispatch(setAnimationState('winner_reveal'));
//     };

//     extractWinners();
//   }, [animationState, winners, dispatch, onBallExtracted]);

//   return (
//     <div className="relative w-full h-full min-h-[400px]">
//       {/* 3D Container */}
//       <div 
//         ref={containerRef} 
//         className="w-full h-full rounded-lg overflow-hidden bg-gray-900"
//         style={{ minHeight: '400px' }}
//       />

//       {/* Loading Overlay */}
//       {!isInitialized && !initError && (
//         <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 rounded-lg">
//           <div className="text-center">
//             <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
//             <p className="text-white text-lg font-semibold">Initializing 3D Lottery Machine...</p>
//             <p className="text-gray-400 text-sm mt-2">Loading WebGL renderer...</p>
//           </div>
//         </div>
//       )}

//       {/* Error Overlay */}
//       {initError && (
//         <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-75 rounded-lg">
//           <div className="text-center text-white p-6">
//             <AlertCircle className="w-16 h-16 mx-auto mb-4" />
//             <p className="font-bold text-lg mb-2">3D Scene Error</p>
//             <p className="text-sm">{initError}</p>
//             <button
//               onClick={() => window.location.reload()}
//               className="mt-4 bg-white text-red-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
//             >
//               Reload Page
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Ball Counter */}
//       {isInitialized && (
//         <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
//           <p className="text-sm font-semibold">Lottery Balls</p>
//           <p className="text-3xl font-bold">{ballsLoaded}</p>
//           <p className="text-xs text-gray-300">of {participantCount}</p>
//         </div>
//       )}

//       {/* My Ball Indicator */}
//       {myBallNumber && isInitialized && (
//         <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg shadow-lg">
//           <p className="text-xs font-semibold uppercase">Your Ball Number</p>
//           <p className="text-2xl font-bold">{myBallNumber.toString().slice(-4)}</p>
//         </div>
//       )}

//       {/* Animation Status */}
//       {animationState !== 'idle' && (
//         <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg">
//           {animationState === 'vote_flying' && (
//             <p className="text-sm font-semibold">🎯 Vote entering lottery...</p>
//           )}
//           {animationState === 'ball_spinning' && (
//             <p className="text-sm font-semibold">🎰 Balls spinning...</p>
//           )}
//           {animationState === 'drawing' && (
//             <p className="text-sm font-semibold animate-pulse">🎉 Drawing winners...</p>
//           )}
//         </div>
//       )}

//       {/* Controls Hint */}
//       {isInitialized && (
//         <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-xs">
//           <p>🖱️ Drag to rotate • Scroll to zoom</p>
//         </div>
//       )}
//     </div>
//   );
// }
// // src/components/Dashboard/Tabs/lotteryyy/ThreeDLotteryMachine.jsx
// // ✨ STUNNING 3D Lottery Machine Component - FIXED VERSION
// import React, { useEffect, useRef, useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { LotteryMachineScene } from '../../../../services/three/LotteryMachineScene';
// import { setAnimationState, addBallToMachine } from '../../../../redux/slices/lotteryySlice';

// export default function ThreeDLotteryMachine({ 
//   participants = [],
//   myBallNumber = null,
//   winners = [],
//   onBallExtracted = null,
// }) {
//   const containerRef = useRef(null);
//   const sceneRef = useRef(null);
//   const dispatch = useDispatch();
  
//   const { animationState, participantCount } = useSelector(state => state.lotteryyy);
  
//   const [isInitialized, setIsInitialized] = useState(false);
//   const [ballsLoaded, setBallsLoaded] = useState(0);
//   const [initError, setInitError] = useState(null);

//   // Initialize Three.js scene
//   useEffect(() => {
//     if (!containerRef.current || isInitialized) return;

//     // ✅ FIX: Wait for container to have size
//     if (!containerRef.current.clientWidth || !containerRef.current.clientHeight) {
//       console.warn('⚠️ Container has no size yet, waiting...');
//       const checkSize = setInterval(() => {
//         if (containerRef.current && containerRef.current.clientWidth > 0) {
//           clearInterval(checkSize);
//           initializeScene();
//         }
//       }, 100);
      
//       setTimeout(() => clearInterval(checkSize), 5000); // Timeout after 5s
//       return;
//     }

//     initializeScene();

//     function initializeScene() {
//       try {
//         console.log('🎨 Initializing Three.js scene...');
//         console.log('📏 Container size:', containerRef.current.clientWidth, 'x', containerRef.current.clientHeight);
        
//         sceneRef.current = new LotteryMachineScene(containerRef.current);
//         setIsInitialized(true);
//         setInitError(null);
//         console.log('✅ 3D Lottery Machine initialized');
//       } catch (error) {
//         console.error('❌ Failed to initialize 3D scene:', error);
//         setInitError(error.message);
//       }
//     }

//     return () => {
//       if (sceneRef.current) {
//         console.log('🧹 Cleaning up Three.js scene');
//         sceneRef.current.dispose();
//       }
//     };
//   }, [isInitialized]);

//   // Add balls for participants
//   useEffect(() => {
//     if (!sceneRef.current || !isInitialized || participants.length === 0) return;

//     const scene = sceneRef.current;
    
//     // Add balls gradually for smooth animation
//     const addBallsGradually = async () => {
//       for (let i = ballsLoaded; i < participants.length; i++) {
//         const participant = participants[i];
        
//         // Wait a bit between each ball for smooth effect
//         await new Promise(resolve => setTimeout(resolve, 100));
        
//         scene.addBall(participant.ball_number, true);
//         setBallsLoaded(i + 1);
        
//         dispatch(addBallToMachine({
//           ballNumber: participant.ball_number,
//           userId: participant.user_id,
//         }));
//       }
//     };

//     addBallsGradually();
//   }, [participants, isInitialized, ballsLoaded, dispatch]);

//   // Highlight user's ball
//   useEffect(() => {
//     if (!sceneRef.current || !myBallNumber) return;

//     const scene = sceneRef.current;
//     scene.highlightBall(myBallNumber);
//   }, [myBallNumber, isInitialized]);

//   // Handle winner extraction animation
//   useEffect(() => {
//     if (!sceneRef.current || animationState !== 'drawing' || winners.length === 0) return;

//     const scene = sceneRef.current;
    
//     const extractWinners = async () => {
//       for (const winner of winners) {
//         await new Promise(resolve => {
//           /*eslint-disable*/
//           scene.extractBall(winner.ball_number, (ball) => {
//             if (onBallExtracted) {
//               onBallExtracted(winner);
//             }
//             setTimeout(resolve, 2000);
//           });
//         });
//       }
      
//       dispatch(setAnimationState('winner_reveal'));
//     };

//     extractWinners();
//   }, [animationState, winners, dispatch, onBallExtracted]);

//   return (
//     <div className="relative w-full h-full min-h-[400px]">
//       {/* 3D Container */}
//       <div 
//         ref={containerRef} 
//         className="w-full h-full rounded-lg overflow-hidden"
//         style={{ minHeight: '400px' }}
//       />

//       {/* Loading Overlay */}
//       {!isInitialized && !initError && (
//         <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 rounded-lg">
//           <div className="text-center">
//             <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
//             <p className="text-white text-lg font-semibold">Initializing 3D Lottery Machine...</p>
//             <p className="text-gray-400 text-sm mt-2">Loading WebGL renderer...</p>
//           </div>
//         </div>
//       )}

//       {/* Error Overlay */}
//       {initError && (
//         <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-75 rounded-lg">
//           <div className="text-center text-white p-6">
//             <AlertCircle className="w-16 h-16 mx-auto mb-4" />
//             <p className="font-bold text-lg mb-2">3D Scene Error</p>
//             <p className="text-sm">{initError}</p>
//             <button
//               onClick={() => window.location.reload()}
//               className="mt-4 bg-white text-red-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
//             >
//               Reload Page
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Ball Counter */}
//       {isInitialized && (
//         <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
//           <p className="text-sm font-semibold">Lottery Balls</p>
//           <p className="text-3xl font-bold">{ballsLoaded}</p>
//           <p className="text-xs text-gray-300">of {participantCount}</p>
//         </div>
//       )}

//       {/* My Ball Indicator */}
//       {myBallNumber && isInitialized && (
//         <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg shadow-lg">
//           <p className="text-xs font-semibold uppercase">Your Ball Number</p>
//           <p className="text-2xl font-bold">{myBallNumber.toString().slice(-4)}</p>
//         </div>
//       )}

//       {/* Animation Status */}
//       {animationState !== 'idle' && (
//         <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg">
//           {animationState === 'vote_flying' && (
//             <p className="text-sm font-semibold">🎯 Vote entering lottery...</p>
//           )}
//           {animationState === 'ball_spinning' && (
//             <p className="text-sm font-semibold">🎰 Balls spinning...</p>
//           )}
//           {animationState === 'drawing' && (
//             <p className="text-sm font-semibold animate-pulse">🎉 Drawing winners...</p>
//           )}
//         </div>
//       )}

//       {/* Controls Hint */}
//       {isInitialized && (
//         <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-xs">
//           <p>🖱️ Drag to rotate • Scroll to zoom</p>
//         </div>
//       )}
//     </div>
//   );
// }