import React, { useEffect, useState } from 'react';

/**
 * 🎬 VOTE-TO-BALL ANIMATION - ZERO DEPENDENCIES VERSION
 * Copy the CSS from VoteToBallAnimation_STYLES.css to your App.css
 */

export default function VoteToBallAnimation({
  isActive = false,
  ballNumber = null,
  startElementId = 'submit-vote-button',
  targetElementId = 'lottery-machine-container',
  onAnimationComplete = null,
}) {
  const [stage, setStage] = useState('idle'); // idle, receipt, transform, fly, complete
  const [positions, setPositions] = useState({ startX: 0, startY: 0, endX: 0, endY: 0 });

  useEffect(() => {
    if (!isActive || !ballNumber) {
      setStage('idle');
      return;
    }

    console.log('🎬 Starting animation for ball #', ballNumber);

    // Get element positions
    const startEl = document.getElementById(startElementId);
    const endEl = document.getElementById(targetElementId);

    if (!startEl || !endEl) {
      console.error('Elements not found:', { startElementId, targetElementId });
      return;
    }

    const startRect = startEl.getBoundingClientRect();
    const endRect = endEl.getBoundingClientRect();

    setPositions({
      startX: startRect.left + startRect.width / 2,
      startY: startRect.top + startRect.height / 2,
      endX: endRect.left + endRect.width / 2,
      endY: endRect.top + endRect.height / 2,
    });

    // Animation sequence - SLOWER (total 5 seconds)
    setStage('receipt');
    setTimeout(() => setStage('transform'), 1000);  // Receipt shows for 1s
    setTimeout(() => setStage('fly'), 3000);        // Transform for 2s
    setTimeout(() => {
      setStage('complete');
      if (onAnimationComplete) onAnimationComplete();
    }, 5500);  // Fly for 2.5s

  }, [isActive, ballNumber, startElementId, targetElementId, onAnimationComplete]);

  if (!isActive || stage === 'idle' || stage === 'complete') {
    return null;
  }

  const { startX, startY, endX, endY } = positions;

  return (
    <div className="vote-animation-overlay">
      
      {/* STAGE 1: RECEIPT */}
      {stage === 'receipt' && (
        <div 
          className="vote-receipt-anim"
          style={{ left: `${startX}px`, top: `${startY}px` }}
        >
          <div className="receipt-box">
            <div className="receipt-check">✓</div>
            <p className="receipt-title">Vote Recorded!</p>
            <p className="receipt-num">Ticket #{ballNumber}</p>
          </div>
        </div>
      )}

      {/* STAGE 2: TRANSFORM */}
      {stage === 'transform' && (
        <div 
          className="vote-ball-anim transform-stage"
          style={{ left: `${startX}px`, top: `${startY}px` }}
        >
          <div className="ball-shape">
            <span className="ball-num">{ballNumber}</span>
          </div>
          {/* 8 Particles */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <div 
              key={i}
              className="particle-anim"
              style={{ transform: `rotate(${angle}deg)` }}
            />
          ))}
        </div>
      )}

      {/* STAGE 3: FLY */}
      {stage === 'fly' && (
        <>
          <div 
            className="vote-ball-anim fly-stage"
            style={{
              left: `${startX}px`,
              top: `${startY}px`,
              '--end-x': `${endX}px`,
              '--end-y': `${endY}px`,
            }}
          >
            <div className="ball-shape">
              <span className="ball-num">{ballNumber}</span>
              <div className="ball-glow"></div>
            </div>
            {/* 12 Sparkles */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="sparkle-anim" />
            ))}
          </div>

          {/* Success Message */}
          <div className="vote-success-msg">
            <p>
              <span>🎰</span>
              Your lottery ball is entering the machine!
              <span>✨</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
// import React, { useEffect, useState } from 'react';

// /**
//  * 🎬 VOTE-TO-BALL ANIMATION - ZERO DEPENDENCIES VERSION
//  * Copy the CSS from VoteToBallAnimation_STYLES.css to your App.css
//  */

// export default function VoteToBallAnimation({
//   isActive = false,
//   ballNumber = null,
//   startElementId = 'submit-vote-button',
//   targetElementId = 'lottery-machine-container',
//   onAnimationComplete = null,
// }) {
//   const [stage, setStage] = useState('idle'); // idle, receipt, transform, fly, complete
//   const [positions, setPositions] = useState({ startX: 0, startY: 0, endX: 0, endY: 0 });

//   useEffect(() => {
//     if (!isActive || !ballNumber) {
//       setStage('idle');
//       return;
//     }

//     console.log('🎬 Starting animation for ball #', ballNumber);

//     // Get element positions
//     const startEl = document.getElementById(startElementId);
//     const endEl = document.getElementById(targetElementId);

//     if (!startEl || !endEl) {
//       console.error('Elements not found:', { startElementId, targetElementId });
//       return;
//     }

//     const startRect = startEl.getBoundingClientRect();
//     const endRect = endEl.getBoundingClientRect();

//     setPositions({
//       startX: startRect.left + startRect.width / 2,
//       startY: startRect.top + startRect.height / 2,
//       endX: endRect.left + endRect.width / 2,
//       endY: endRect.top + endRect.height / 2,
//     });

//     // Animation sequence
//     setStage('receipt');
//     setTimeout(() => setStage('transform'), 500);
//     setTimeout(() => setStage('fly'), 2000);
//     setTimeout(() => {
//       setStage('complete');
//       if (onAnimationComplete) onAnimationComplete();
//     }, 3000);

//   }, [isActive, ballNumber, startElementId, targetElementId, onAnimationComplete]);

//   if (!isActive || stage === 'idle' || stage === 'complete') {
//     return null;
//   }

//   const { startX, startY, endX, endY } = positions;

//   return (
//     <div className="vote-animation-overlay">
      
//       {/* STAGE 1: RECEIPT */}
//       {stage === 'receipt' && (
//         <div 
//           className="vote-receipt-anim"
//           style={{ left: `${startX}px`, top: `${startY}px` }}
//         >
//           <div className="receipt-box">
//             <div className="receipt-check">✓</div>
//             <p className="receipt-title">Vote Recorded!</p>
//             <p className="receipt-num">Ticket #{ballNumber}</p>
//           </div>
//         </div>
//       )}

//       {/* STAGE 2: TRANSFORM */}
//       {stage === 'transform' && (
//         <div 
//           className="vote-ball-anim transform-stage"
//           style={{ left: `${startX}px`, top: `${startY}px` }}
//         >
//           <div className="ball-shape">
//             <span className="ball-num">{ballNumber}</span>
//           </div>
//           {/* 8 Particles */}
//           {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
//             <div 
//               key={i}
//               className="particle-anim"
//               style={{ transform: `rotate(${angle}deg)` }}
//             />
//           ))}
//         </div>
//       )}

//       {/* STAGE 3: FLY */}
//       {stage === 'fly' && (
//         <>
//           <div 
//             className="vote-ball-anim fly-stage"
//             style={{
//               left: `${startX}px`,
//               top: `${startY}px`,
//               '--end-x': `${endX}px`,
//               '--end-y': `${endY}px`,
//             }}
//           >
//             <div className="ball-shape">
//               <span className="ball-num">{ballNumber}</span>
//               <div className="ball-glow"></div>
//             </div>
//             {/* 12 Sparkles */}
//             {Array.from({ length: 12 }).map((_, i) => (
//               <div key={i} className="sparkle-anim" />
//             ))}
//           </div>

//           {/* Success Message */}
//           <div className="vote-success-msg">
//             <p>
//               <span>🎰</span>
//               Your lottery ball is entering the machine!
//               <span>✨</span>
//             </p>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
//last workable code
// // src/components/Dashboard/Tabs/lotteryyy/VoteToBallAnimation.jsx
// // ✨ VOTE TO BALL TRANSFORMATION ANIMATION - FIXED VERSION
// import React, { useEffect, useState } from 'react';
// import {  AnimatePresence } from 'framer-motion';
// import { useDispatch } from 'react-redux';
// import { setAnimationProgress, setAnimationState } from '../../../../redux/slices/lotteryySlice';

// export default function VoteToBallAnimation({ 
//   isActive = false,
//   ballNumber = null,
//   onAnimationComplete = null,
//   startElementId = 'submit-vote-button',
//   targetElementId = 'lottery-machine-3d',
// }) {
//   const dispatch = useDispatch();
//   const [phase, setPhase] = useState('idle'); // 'idle' | 'vote-appear' | 'vote-fly' | 'ball-morph' | 'ball-enter' | 'complete'
//   const [positions, setPositions] = useState({
//     start: { x: 0, y: 0 },
//     end: { x: 0, y: 0 },
//   });

//   useEffect(() => {
//     if (!isActive || !ballNumber) {
//       setPhase('idle');
//       return;
//     }

//     console.log('🎬 Starting vote animation for ball:', ballNumber);
//     runAnimation();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isActive, ballNumber]);

//   const calculatePositions = () => {
//     const startElement = document.getElementById(startElementId);
//     const targetElement = document.getElementById(targetElementId);

//     let startPos, endPos;

//     if (startElement) {
//       const rect = startElement.getBoundingClientRect();
//       startPos = {
//         x: rect.left + rect.width / 2,
//         y: rect.top + rect.height / 2,
//       };
//       console.log('📍 Start position:', startPos);
//     } else {
//       startPos = {
//         x: window.innerWidth / 2,
//         y: window.innerHeight - 100,
//       };
//       console.warn('⚠️ Start element not found, using fallback');
//     }

//     if (targetElement) {
//       const rect = targetElement.getBoundingClientRect();
//       endPos = {
//         x: rect.left + rect.width / 2,
//         y: rect.top + rect.height / 2,
//       };
//       console.log('📍 End position:', endPos);
//     } else {
//       endPos = {
//         x: window.innerWidth - 200,
//         y: 300,
//       };
//       console.warn('⚠️ Target element not found, using fallback');
//     }

//     return { start: startPos, end: endPos };
//   };

//   const runAnimation = async () => {
//     const pos = calculatePositions();
//     setPositions(pos);

//     try {
//       // PHASE 1: Vote appears and grows (0.5s)
//       console.log('✅ Phase 1: Vote appears');
//       setPhase('vote-appear');
//       dispatch(setAnimationState('vote_flying'));
//       dispatch(setAnimationProgress(10));
//       await wait(500);

//       // PHASE 2: Vote flies to machine (2s)
//       console.log('✅ Phase 2: Vote flying');
//       setPhase('vote-fly');
//       dispatch(setAnimationProgress(40));
//       await wait(2000);

//       // PHASE 3: Vote morphs into ball (1s)
//       console.log('✅ Phase 3: Morphing to ball');
//       setPhase('ball-morph');
//       dispatch(setAnimationState('ball_morphing'));
//       dispatch(setAnimationProgress(70));
//       await wait(1000);

//       // PHASE 4: Ball enters machine (0.5s)
//       console.log('✅ Phase 4: Ball entering');
//       setPhase('ball-enter');
//       dispatch(setAnimationProgress(90));
//       await wait(500);

//       // PHASE 5: Complete
//       console.log('✅ Phase 5: Complete');
//       setPhase('complete');
//       dispatch(setAnimationProgress(100));
//       dispatch(setAnimationState('ball_spinning'));
      
//       if (onAnimationComplete) {
//         onAnimationComplete();
//       }

//       await wait(500);
//       setPhase('idle');
//       dispatch(setAnimationProgress(0));

//     } catch (error) {
//       console.error('❌ Animation error:', error);
//       setPhase('idle');
//     }
//   };

//   const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

//   if (phase === 'idle') return null;

//   return (
//     <div className="fixed inset-0 pointer-events-none z-[9999]">
//       <AnimatePresence mode="wait">
        
//         {/* PHASE 1 & 2: VOTE PAPER FLYING */}
//         {(phase === 'vote-appear' || phase === 'vote-fly') && (
//           <motion.div
//             key="vote-paper"
//             initial={{ 
//               x: positions.start.x - 75,
//               y: positions.start.y - 100,
//               scale: 0,
//               rotate: 0,
//               opacity: 0,
//             }}
//             animate={{ 
//               x: phase === 'vote-fly' ? positions.end.x - 75 : positions.start.x - 75,
//               y: phase === 'vote-fly' ? positions.end.y - 100 : positions.start.y - 100,
//               scale: phase === 'vote-fly' ? [1, 1.2, 1] : 1,
//               rotate: phase === 'vote-fly' ? [0, 180, 360, 540] : 0,
//               opacity: 1,
//             }}
//             exit={{ 
//               scale: 0,
//               opacity: 0,
//             }}
//             transition={{ 
//               duration: phase === 'vote-fly' ? 2 : 0.5,
//               ease: phase === 'vote-fly' ? [0.43, 0.13, 0.23, 0.96] : 'easeOut',
//             }}
//             className="absolute"
//           >
//             {/* Vote Paper Card */}
//             <div className="relative">
//               {/* Outer Glow */}
//               <motion.div
//                 animate={{ 
//                   scale: [1, 1.3, 1],
//                   opacity: [0.6, 0.3, 0.6],
//                 }}
//                 transition={{ 
//                   duration: 1.5,
//                   repeat: Infinity,
//                 }}
//                 className="absolute inset-0 bg-blue-500 rounded-xl blur-2xl"
//                 style={{ 
//                   width: '200px', 
//                   height: '250px',
//                   marginLeft: '-25px',
//                   marginTop: '-25px',
//                 }}
//               />

//               {/* Vote Paper */}
//               <div className="relative bg-white rounded-xl shadow-2xl border-4 border-blue-500 w-[150px] h-[200px] flex flex-col items-center justify-center p-4">
//                 {/* Checkmark */}
//                 <motion.div
//                   animate={{ 
//                     scale: [1, 1.2, 1],
//                   }}
//                   transition={{ 
//                     duration: 0.5,
//                     repeat: Infinity,
//                   }}
//                   className="text-6xl mb-2"
//                 >
//                   ✅
//                 </motion.div>

//                 {/* Text */}
//                 <div className="text-center">
//                   <p className="text-xl font-black text-gray-800 mb-1">VOTE</p>
//                   <p className="text-sm font-bold text-blue-600">CAST</p>
//                   <div className="mt-2 px-3 py-1 bg-blue-100 rounded-full">
//                     <p className="text-xs font-mono font-bold text-blue-800">
//                       #{ballNumber?.toString().slice(-4)}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Shine Effect */}
//                 <motion.div
//                   animate={{ 
//                     x: [-200, 200],
//                   }}
//                   transition={{ 
//                     duration: 1.5,
//                     repeat: Infinity,
//                   }}
//                   className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40"
//                   style={{ width: '50px' }}
//                 />
//               </div>

//               {/* Sparkles around paper */}
//               {[...Array(8)].map((_, i) => (
//                 <motion.div
//                   key={i}
//                   initial={{ scale: 0 }}
//                   animate={{ 
//                     scale: [0, 1, 0],
//                     x: Math.cos(i * Math.PI / 4) * 80,
//                     y: Math.sin(i * Math.PI / 4) * 80,
//                   }}
//                   transition={{ 
//                     duration: 1,
//                     repeat: Infinity,
//                     delay: i * 0.1,
//                   }}
//                   className="absolute top-1/2 left-1/2 w-4 h-4 bg-yellow-400 rounded-full"
//                   style={{
//                     boxShadow: '0 0 10px rgba(250, 204, 21, 0.8)',
//                   }}
//                 />
//               ))}
//             </div>
//           </motion.div>
//         )}

//         {/* Trail Particles */}
//         {phase === 'vote-fly' && [...Array(20)].map((_, i) => (
//           <motion.div
//             key={`trail-${i}`}
//             initial={{ 
//               x: positions.start.x,
//               y: positions.start.y,
//               scale: 1,
//               opacity: 0.8,
//             }}
//             animate={{ 
//               x: positions.end.x + (Math.random() - 0.5) * 100,
//               y: positions.end.y + (Math.random() - 0.5) * 100,
//               scale: 0,
//               opacity: 0,
//             }}
//             transition={{ 
//               duration: 2,
//               delay: i * 0.1,
//             }}
//             className="absolute w-3 h-3 bg-blue-400 rounded-full blur-sm"
//           />
//         ))}

//         {/* PHASE 3 & 4: BALL MORPHING & ENTERING */}
//         {(phase === 'ball-morph' || phase === 'ball-enter') && (
//           <motion.div
//             key="lottery-ball"
//             initial={{ 
//               x: positions.end.x - 60,
//               y: positions.end.y - 60,
//               scale: phase === 'ball-morph' ? 0 : 1,
//               rotate: 0,
//             }}
//             animate={{ 
//               scale: phase === 'ball-enter' ? [1, 1.5, 0] : [0, 1.3, 1],
//               rotate: [0, 360, 720, 1080],
//             }}
//             exit={{
//               scale: 0,
//               opacity: 0,
//             }}
//             transition={{ 
//               duration: phase === 'ball-enter' ? 0.5 : 1,
//               ease: "easeOut",
//             }}
//             className="absolute"
//           >
//             <div className="relative">
//               {/* Outer Glow Rings */}
//               {[1, 2, 3].map((ring) => (
//                 <motion.div
//                   key={`ring-${ring}`}
//                   animate={{ 
//                     scale: [1, 2, 3],
//                     opacity: [0.8, 0.4, 0],
//                   }}
//                   transition={{ 
//                     duration: 1.5,
//                     repeat: Infinity,
//                     delay: ring * 0.2,
//                   }}
//                   className="absolute inset-0 border-4 border-yellow-400 rounded-full"
//                   style={{ 
//                     width: '120px', 
//                     height: '120px',
//                     marginLeft: '-30px',
//                     marginTop: '-30px',
//                   }}
//                 />
//               ))}

//               {/* Main Ball */}
//               <motion.div
//                 animate={{ 
//                   rotateY: [0, 360],
//                 }}
//                 transition={{ 
//                   duration: 2,
//                   repeat: Infinity,
//                   ease: "linear",
//                 }}
//                 className="relative w-[120px] h-[120px] rounded-full shadow-2xl flex items-center justify-center"
//                 style={{
//                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
//                   boxShadow: '0 20px 60px rgba(102, 126, 234, 0.6), inset 0 0 30px rgba(255, 255, 255, 0.3)',
//                 }}
//               >
//                 {/* Highlight */}
//                 <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-full opacity-50 blur-md"></div>

//                 {/* Number */}
//                 <div className="relative z-10 text-white text-4xl font-black drop-shadow-lg">
//                   {ballNumber?.toString().slice(-4)}
//                 </div>

//                 {/* Shine */}
//                 <motion.div
//                   animate={{ 
//                     rotate: 360,
//                   }}
//                   transition={{ 
//                     duration: 3,
//                     repeat: Infinity,
//                     ease: "linear",
//                   }}
//                   className="absolute inset-0 rounded-full"
//                   style={{
//                     background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
//                   }}
//                 />
//               </motion.div>

//               {/* Sparkles Explosion */}
//               {[...Array(12)].map((_, i) => (
//                 <motion.div
//                   key={`spark-${i}`}
//                   initial={{ scale: 0 }}
//                   animate={{ 
//                     scale: [0, 1.5, 0],
//                     x: Math.cos(i * Math.PI / 6) * 80,
//                     y: Math.sin(i * Math.PI / 6) * 80,
//                     rotate: i * 30,
//                   }}
//                   transition={{ 
//                     duration: 1,
//                     repeat: Infinity,
//                     delay: i * 0.05,
//                   }}
//                   className="absolute top-1/2 left-1/2 w-4 h-4 bg-yellow-300 rounded-full"
//                   style={{
//                     boxShadow: '0 0 15px rgba(253, 224, 71, 0.8)',
//                   }}
//                 />
//               ))}
//             </div>
//           </motion.div>
//         )}

//         {/* Success Flash Overlay */}
//         {phase === 'ball-enter' && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: [0, 0.4, 0] }}
//             transition={{ duration: 0.5 }}
//             className="fixed inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500"
//           />
//         )}

//         {/* Confetti burst on completion */}
//         {phase === 'complete' && (
//           <>
//             {[...Array(30)].map((_, i) => (
//               <motion.div
//                 key={`confetti-${i}`}
//                 initial={{ 
//                   x: positions.end.x,
//                   y: positions.end.y,
//                   scale: 1,
//                   rotate: 0,
//                 }}
//                 animate={{ 
//                   x: positions.end.x + (Math.random() - 0.5) * 300,
//                   y: positions.end.y + (Math.random() - 0.5) * 300,
//                   scale: 0,
//                   rotate: Math.random() * 720,
//                   opacity: 0,
//                 }}
//                 transition={{ 
//                   duration: 1,
//                   delay: i * 0.02,
//                 }}
//                 className="absolute w-3 h-3 rounded-full"
//                 style={{
//                   backgroundColor: ['#FFD700', '#FF6347', '#4169E1', '#9370DB', '#FF1493'][i % 5],
//                 }}
//               />
//             ))}
//           </>
//         )}

//       </AnimatePresence>
//     </div>
//   );
// }
// // // src/components/Dashboard/Tabs/lotteryyy/VoteToBallAnimation.jsx
// // // ✨ VOTE TO BALL TRANSFORMATION ANIMATION - FIXED VERSION
// // import React, { useEffect, useState } from 'react';
// // import {  AnimatePresence } from 'framer-motion';
// // import { useDispatch } from 'react-redux';
// // import { setAnimationProgress, setAnimationState } from '../../../../redux/slices/lotteryySlice';

// // export default function VoteToBallAnimation({ 
// //   isActive = false,
// //   ballNumber = null,
// //   onAnimationComplete = null,
// //   startElementId = 'submit-vote-button',
// //   targetElementId = 'lottery-machine-3d',
// // }) {
// //   const dispatch = useDispatch();
// //   const [phase, setPhase] = useState('idle'); // 'idle' | 'vote-appear' | 'vote-fly' | 'ball-morph' | 'ball-enter' | 'complete'
// //   const [positions, setPositions] = useState({
// //     start: { x: 0, y: 0 },
// //     end: { x: 0, y: 0 },
// //   });

// //   useEffect(() => {
// //     if (!isActive || !ballNumber) {
// //       setPhase('idle');
// //       return;
// //     }

// //     console.log('🎬 Starting vote animation for ball:', ballNumber);
// //     runAnimation();
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [isActive, ballNumber]);

// //   const calculatePositions = () => {
// //     const startElement = document.getElementById(startElementId);
// //     const targetElement = document.getElementById(targetElementId);

// //     let startPos, endPos;

// //     if (startElement) {
// //       const rect = startElement.getBoundingClientRect();
// //       startPos = {
// //         x: rect.left + rect.width / 2,
// //         y: rect.top + rect.height / 2,
// //       };
// //       console.log('📍 Start position:', startPos);
// //     } else {
// //       startPos = {
// //         x: window.innerWidth / 2,
// //         y: window.innerHeight - 100,
// //       };
// //       console.warn('⚠️ Start element not found, using fallback');
// //     }

// //     if (targetElement) {
// //       const rect = targetElement.getBoundingClientRect();
// //       endPos = {
// //         x: rect.left + rect.width / 2,
// //         y: rect.top + rect.height / 2,
// //       };
// //       console.log('📍 End position:', endPos);
// //     } else {
// //       endPos = {
// //         x: window.innerWidth - 200,
// //         y: 300,
// //       };
// //       console.warn('⚠️ Target element not found, using fallback');
// //     }

// //     return { start: startPos, end: endPos };
// //   };

// //   const runAnimation = async () => {
// //     const pos = calculatePositions();
// //     setPositions(pos);

// //     try {
// //       // PHASE 1: Vote appears and grows (0.5s)
// //       console.log('✅ Phase 1: Vote appears');
// //       setPhase('vote-appear');
// //       dispatch(setAnimationState('vote_flying'));
// //       dispatch(setAnimationProgress(10));
// //       await wait(500);

// //       // PHASE 2: Vote flies to machine (2s)
// //       console.log('✅ Phase 2: Vote flying');
// //       setPhase('vote-fly');
// //       dispatch(setAnimationProgress(40));
// //       await wait(2000);

// //       // PHASE 3: Vote morphs into ball (1s)
// //       console.log('✅ Phase 3: Morphing to ball');
// //       setPhase('ball-morph');
// //       dispatch(setAnimationState('ball_morphing'));
// //       dispatch(setAnimationProgress(70));
// //       await wait(1000);

// //       // PHASE 4: Ball enters machine (0.5s)
// //       console.log('✅ Phase 4: Ball entering');
// //       setPhase('ball-enter');
// //       dispatch(setAnimationProgress(90));
// //       await wait(500);

// //       // PHASE 5: Complete
// //       console.log('✅ Phase 5: Complete');
// //       setPhase('complete');
// //       dispatch(setAnimationProgress(100));
// //       dispatch(setAnimationState('ball_spinning'));
      
// //       if (onAnimationComplete) {
// //         onAnimationComplete();
// //       }

// //       await wait(500);
// //       setPhase('idle');
// //       dispatch(setAnimationProgress(0));

// //     } catch (error) {
// //       console.error('❌ Animation error:', error);
// //       setPhase('idle');
// //     }
// //   };

// //   const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// //   if (phase === 'idle') return null;

// //   return (
// //     <div className="fixed inset-0 pointer-events-none z-[9999]">
// //       <AnimatePresence mode="wait">
        
// //         {/* PHASE 1 & 2: VOTE PAPER FLYING */}
// //         {(phase === 'vote-appear' || phase === 'vote-fly') && (
// //           <motion.div
// //             key="vote-paper"
// //             initial={{ 
// //               x: positions.start.x - 75,
// //               y: positions.start.y - 100,
// //               scale: 0,
// //               rotate: 0,
// //               opacity: 0,
// //             }}
// //             animate={{ 
// //               x: phase === 'vote-fly' ? positions.end.x - 75 : positions.start.x - 75,
// //               y: phase === 'vote-fly' ? positions.end.y - 100 : positions.start.y - 100,
// //               scale: phase === 'vote-fly' ? [1, 1.2, 1] : 1,
// //               rotate: phase === 'vote-fly' ? [0, 180, 360, 540] : 0,
// //               opacity: 1,
// //             }}
// //             exit={{ 
// //               scale: 0,
// //               opacity: 0,
// //             }}
// //             transition={{ 
// //               duration: phase === 'vote-fly' ? 2 : 0.5,
// //               ease: phase === 'vote-fly' ? [0.43, 0.13, 0.23, 0.96] : 'easeOut',
// //             }}
// //             className="absolute"
// //           >
// //             {/* Vote Paper Card */}
// //             <div className="relative">
// //               {/* Outer Glow */}
// //               <motion.div
// //                 animate={{ 
// //                   scale: [1, 1.3, 1],
// //                   opacity: [0.6, 0.3, 0.6],
// //                 }}
// //                 transition={{ 
// //                   duration: 1.5,
// //                   repeat: Infinity,
// //                 }}
// //                 className="absolute inset-0 bg-blue-500 rounded-xl blur-2xl"
// //                 style={{ 
// //                   width: '200px', 
// //                   height: '250px',
// //                   marginLeft: '-25px',
// //                   marginTop: '-25px',
// //                 }}
// //               />

// //               {/* Vote Paper */}
// //               <div className="relative bg-white rounded-xl shadow-2xl border-4 border-blue-500 w-[150px] h-[200px] flex flex-col items-center justify-center p-4">
// //                 {/* Checkmark */}
// //                 <motion.div
// //                   animate={{ 
// //                     scale: [1, 1.2, 1],
// //                   }}
// //                   transition={{ 
// //                     duration: 0.5,
// //                     repeat: Infinity,
// //                   }}
// //                   className="text-6xl mb-2"
// //                 >
// //                   ✅
// //                 </motion.div>

// //                 {/* Text */}
// //                 <div className="text-center">
// //                   <p className="text-xl font-black text-gray-800 mb-1">VOTE</p>
// //                   <p className="text-sm font-bold text-blue-600">CAST</p>
// //                   <div className="mt-2 px-3 py-1 bg-blue-100 rounded-full">
// //                     <p className="text-xs font-mono font-bold text-blue-800">
// //                       #{ballNumber?.toString().slice(-4)}
// //                     </p>
// //                   </div>
// //                 </div>

// //                 {/* Shine Effect */}
// //                 <motion.div
// //                   animate={{ 
// //                     x: [-200, 200],
// //                   }}
// //                   transition={{ 
// //                     duration: 1.5,
// //                     repeat: Infinity,
// //                   }}
// //                   className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40"
// //                   style={{ width: '50px' }}
// //                 />
// //               </div>

// //               {/* Sparkles around paper */}
// //               {[...Array(8)].map((_, i) => (
// //                 <motion.div
// //                   key={i}
// //                   initial={{ scale: 0 }}
// //                   animate={{ 
// //                     scale: [0, 1, 0],
// //                     x: Math.cos(i * Math.PI / 4) * 80,
// //                     y: Math.sin(i * Math.PI / 4) * 80,
// //                   }}
// //                   transition={{ 
// //                     duration: 1,
// //                     repeat: Infinity,
// //                     delay: i * 0.1,
// //                   }}
// //                   className="absolute top-1/2 left-1/2 w-4 h-4 bg-yellow-400 rounded-full"
// //                   style={{
// //                     boxShadow: '0 0 10px rgba(250, 204, 21, 0.8)',
// //                   }}
// //                 />
// //               ))}
// //             </div>
// //           </motion.div>
// //         )}

// //         {/* Trail Particles */}
// //         {phase === 'vote-fly' && [...Array(20)].map((_, i) => (
// //           <motion.div
// //             key={`trail-${i}`}
// //             initial={{ 
// //               x: positions.start.x,
// //               y: positions.start.y,
// //               scale: 1,
// //               opacity: 0.8,
// //             }}
// //             animate={{ 
// //               x: positions.end.x + (Math.random() - 0.5) * 100,
// //               y: positions.end.y + (Math.random() - 0.5) * 100,
// //               scale: 0,
// //               opacity: 0,
// //             }}
// //             transition={{ 
// //               duration: 2,
// //               delay: i * 0.1,
// //             }}
// //             className="absolute w-3 h-3 bg-blue-400 rounded-full blur-sm"
// //           />
// //         ))}

// //         {/* PHASE 3 & 4: BALL MORPHING & ENTERING */}
// //         {(phase === 'ball-morph' || phase === 'ball-enter') && (
// //           <motion.div
// //             key="lottery-ball"
// //             initial={{ 
// //               x: positions.end.x - 60,
// //               y: positions.end.y - 60,
// //               scale: phase === 'ball-morph' ? 0 : 1,
// //               rotate: 0,
// //             }}
// //             animate={{ 
// //               scale: phase === 'ball-enter' ? [1, 1.5, 0] : [0, 1.3, 1],
// //               rotate: [0, 360, 720, 1080],
// //             }}
// //             exit={{
// //               scale: 0,
// //               opacity: 0,
// //             }}
// //             transition={{ 
// //               duration: phase === 'ball-enter' ? 0.5 : 1,
// //               ease: "easeOut",
// //             }}
// //             className="absolute"
// //           >
// //             <div className="relative">
// //               {/* Outer Glow Rings */}
// //               {[1, 2, 3].map((ring) => (
// //                 <motion.div
// //                   key={`ring-${ring}`}
// //                   animate={{ 
// //                     scale: [1, 2, 3],
// //                     opacity: [0.8, 0.4, 0],
// //                   }}
// //                   transition={{ 
// //                     duration: 1.5,
// //                     repeat: Infinity,
// //                     delay: ring * 0.2,
// //                   }}
// //                   className="absolute inset-0 border-4 border-yellow-400 rounded-full"
// //                   style={{ 
// //                     width: '120px', 
// //                     height: '120px',
// //                     marginLeft: '-30px',
// //                     marginTop: '-30px',
// //                   }}
// //                 />
// //               ))}

// //               {/* Main Ball */}
// //               <motion.div
// //                 animate={{ 
// //                   rotateY: [0, 360],
// //                 }}
// //                 transition={{ 
// //                   duration: 2,
// //                   repeat: Infinity,
// //                   ease: "linear",
// //                 }}
// //                 className="relative w-[120px] h-[120px] rounded-full shadow-2xl flex items-center justify-center"
// //                 style={{
// //                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
// //                   boxShadow: '0 20px 60px rgba(102, 126, 234, 0.6), inset 0 0 30px rgba(255, 255, 255, 0.3)',
// //                 }}
// //               >
// //                 {/* Highlight */}
// //                 <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-full opacity-50 blur-md"></div>

// //                 {/* Number */}
// //                 <div className="relative z-10 text-white text-4xl font-black drop-shadow-lg">
// //                   {ballNumber?.toString().slice(-4)}
// //                 </div>

// //                 {/* Shine */}
// //                 <motion.div
// //                   animate={{ 
// //                     rotate: 360,
// //                   }}
// //                   transition={{ 
// //                     duration: 3,
// //                     repeat: Infinity,
// //                     ease: "linear",
// //                   }}
// //                   className="absolute inset-0 rounded-full"
// //                   style={{
// //                     background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
// //                   }}
// //                 />
// //               </motion.div>

// //               {/* Sparkles Explosion */}
// //               {[...Array(12)].map((_, i) => (
// //                 <motion.div
// //                   key={`spark-${i}`}
// //                   initial={{ scale: 0 }}
// //                   animate={{ 
// //                     scale: [0, 1.5, 0],
// //                     x: Math.cos(i * Math.PI / 6) * 80,
// //                     y: Math.sin(i * Math.PI / 6) * 80,
// //                     rotate: i * 30,
// //                   }}
// //                   transition={{ 
// //                     duration: 1,
// //                     repeat: Infinity,
// //                     delay: i * 0.05,
// //                   }}
// //                   className="absolute top-1/2 left-1/2 w-4 h-4 bg-yellow-300 rounded-full"
// //                   style={{
// //                     boxShadow: '0 0 15px rgba(253, 224, 71, 0.8)',
// //                   }}
// //                 />
// //               ))}
// //             </div>
// //           </motion.div>
// //         )}

// //         {/* Success Flash Overlay */}
// //         {phase === 'ball-enter' && (
// //           <motion.div
// //             initial={{ opacity: 0 }}
// //             animate={{ opacity: [0, 0.4, 0] }}
// //             transition={{ duration: 0.5 }}
// //             className="fixed inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500"
// //           />
// //         )}

// //         {/* Confetti burst on completion */}
// //         {phase === 'complete' && (
// //           <>
// //             {[...Array(30)].map((_, i) => (
// //               <motion.div
// //                 key={`confetti-${i}`}
// //                 initial={{ 
// //                   x: positions.end.x,
// //                   y: positions.end.y,
// //                   scale: 1,
// //                   rotate: 0,
// //                 }}
// //                 animate={{ 
// //                   x: positions.end.x + (Math.random() - 0.5) * 300,
// //                   y: positions.end.y + (Math.random() - 0.5) * 300,
// //                   scale: 0,
// //                   rotate: Math.random() * 720,
// //                   opacity: 0,
// //                 }}
// //                 transition={{ 
// //                   duration: 1,
// //                   delay: i * 0.02,
// //                 }}
// //                 className="absolute w-3 h-3 rounded-full"
// //                 style={{
// //                   backgroundColor: ['#FFD700', '#FF6347', '#4169E1', '#9370DB', '#FF1493'][i % 5],
// //                 }}
// //               />
// //             ))}
// //           </>
// //         )}

// //       </AnimatePresence>
// //     </div>
// //   );
// // }
// // // import React, { useEffect, useState } from 'react';
// // // import {  AnimatePresence } from 'framer-motion';
// // // import { useDispatch } from 'react-redux';
// // // import { setAnimationProgress, setAnimationState } from '../../../../redux/slices/lotteryySlice';

// // // export default function VoteToBallAnimation({ 
// // //   isActive = false,
// // //   ballNumber = null,
// // //   onAnimationComplete = null,
// // //   startElementId = 'submit-vote-button',
// // //   targetElementId = 'lottery-machine-3d',
// // // }) {
// // //   const dispatch = useDispatch();
// // //   const [phase, setPhase] = useState('idle'); // 'idle' | 'vote-appear' | 'vote-fly' | 'ball-morph' | 'ball-enter' | 'complete'
// // //   const [positions, setPositions] = useState({
// // //     start: { x: 0, y: 0 },
// // //     end: { x: 0, y: 0 },
// // //   });

// // //   useEffect(() => {
// // //     if (!isActive || !ballNumber) {
// // //       setPhase('idle');
// // //       return;
// // //     }

// // //     console.log('🎬 Starting vote animation for ball:', ballNumber);
// // //     runAnimation();
// // //   }, [isActive, ballNumber]);

// // //   const calculatePositions = () => {
// // //     const startElement = document.getElementById(startElementId);
// // //     const targetElement = document.getElementById(targetElementId);

// // //     let startPos, endPos;

// // //     if (startElement) {
// // //       const rect = startElement.getBoundingClientRect();
// // //       startPos = {
// // //         x: rect.left + rect.width / 2,
// // //         y: rect.top + rect.height / 2,
// // //       };
// // //       console.log('📍 Start position:', startPos);
// // //     } else {
// // //       startPos = {
// // //         x: window.innerWidth / 2,
// // //         y: window.innerHeight - 100,
// // //       };
// // //       console.warn('⚠️ Start element not found, using fallback');
// // //     }

// // //     if (targetElement) {
// // //       const rect = targetElement.getBoundingClientRect();
// // //       endPos = {
// // //         x: rect.left + rect.width / 2,
// // //         y: rect.top + rect.height / 2,
// // //       };
// // //       console.log('📍 End position:', endPos);
// // //     } else {
// // //       endPos = {
// // //         x: window.innerWidth - 200,
// // //         y: 300,
// // //       };
// // //       console.warn('⚠️ Target element not found, using fallback');
// // //     }

// // //     return { start: startPos, end: endPos };
// // //   };

// // //   const runAnimation = async () => {
// // //     const pos = calculatePositions();
// // //     setPositions(pos);

// // //     try {
// // //       // PHASE 1: Vote appears and grows (0.5s)
// // //       console.log('✅ Phase 1: Vote appears');
// // //       setPhase('vote-appear');
// // //       dispatch(setAnimationState('vote_flying'));
// // //       dispatch(setAnimationProgress(10));
// // //       await wait(500);

// // //       // PHASE 2: Vote flies to machine (2s)
// // //       console.log('✅ Phase 2: Vote flying');
// // //       setPhase('vote-fly');
// // //       dispatch(setAnimationProgress(40));
// // //       await wait(2000);

// // //       // PHASE 3: Vote morphs into ball (1s)
// // //       console.log('✅ Phase 3: Morphing to ball');
// // //       setPhase('ball-morph');
// // //       dispatch(setAnimationState('ball_morphing'));
// // //       dispatch(setAnimationProgress(70));
// // //       await wait(1000);

// // //       // PHASE 4: Ball enters machine (0.5s)
// // //       console.log('✅ Phase 4: Ball entering');
// // //       setPhase('ball-enter');
// // //       dispatch(setAnimationProgress(90));
// // //       await wait(500);

// // //       // PHASE 5: Complete
// // //       console.log('✅ Phase 5: Complete');
// // //       setPhase('complete');
// // //       dispatch(setAnimationProgress(100));
// // //       dispatch(setAnimationState('ball_spinning'));
      
// // //       if (onAnimationComplete) {
// // //         onAnimationComplete();
// // //       }

// // //       await wait(500);
// // //       setPhase('idle');
// // //       dispatch(setAnimationProgress(0));

// // //     } catch (error) {
// // //       console.error('❌ Animation error:', error);
// // //       setPhase('idle');
// // //     }
// // //   };

// // //   const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// // //   if (phase === 'idle') return null;

// // //   return (
// // //     <div className="fixed inset-0 pointer-events-none z-[9999]">
// // //       <AnimatePresence mode="wait">
        
// // //         {/* PHASE 1 & 2: VOTE PAPER FLYING */}
// // //         {(phase === 'vote-appear' || phase === 'vote-fly') && (
// // //           <motion.div
// // //             key="vote-paper"
// // //             initial={{ 
// // //               x: positions.start.x - 75,
// // //               y: positions.start.y - 100,
// // //               scale: 0,
// // //               rotate: 0,
// // //               opacity: 0,
// // //             }}
// // //             animate={{ 
// // //               x: phase === 'vote-fly' ? positions.end.x - 75 : positions.start.x - 75,
// // //               y: phase === 'vote-fly' ? positions.end.y - 100 : positions.start.y - 100,
// // //               scale: phase === 'vote-fly' ? [1, 1.2, 1] : 1,
// // //               rotate: phase === 'vote-fly' ? [0, 180, 360, 540] : 0,
// // //               opacity: 1,
// // //             }}
// // //             exit={{ 
// // //               scale: 0,
// // //               opacity: 0,
// // //             }}
// // //             transition={{ 
// // //               duration: phase === 'vote-fly' ? 2 : 0.5,
// // //               ease: phase === 'vote-fly' ? [0.43, 0.13, 0.23, 0.96] : 'easeOut',
// // //             }}
// // //             className="absolute"
// // //           >
// // //             {/* Vote Paper Card */}
// // //             <div className="relative">
// // //               {/* Outer Glow */}
// // //               <motion.div
// // //                 animate={{ 
// // //                   scale: [1, 1.3, 1],
// // //                   opacity: [0.6, 0.3, 0.6],
// // //                 }}
// // //                 transition={{ 
// // //                   duration: 1.5,
// // //                   repeat: Infinity,
// // //                 }}
// // //                 className="absolute inset-0 bg-blue-500 rounded-xl blur-2xl"
// // //                 style={{ 
// // //                   width: '200px', 
// // //                   height: '250px',
// // //                   marginLeft: '-25px',
// // //                   marginTop: '-25px',
// // //                 }}
// // //               />

// // //               {/* Vote Paper */}
// // //               <div className="relative bg-white rounded-xl shadow-2xl border-4 border-blue-500 w-[150px] h-[200px] flex flex-col items-center justify-center p-4">
// // //                 {/* Checkmark */}
// // //                 <motion.div
// // //                   animate={{ 
// // //                     scale: [1, 1.2, 1],
// // //                   }}
// // //                   transition={{ 
// // //                     duration: 0.5,
// // //                     repeat: Infinity,
// // //                   }}
// // //                   className="text-6xl mb-2"
// // //                 >
// // //                   ✅
// // //                 </motion.div>

// // //                 {/* Text */}
// // //                 <div className="text-center">
// // //                   <p className="text-xl font-black text-gray-800 mb-1">VOTE</p>
// // //                   <p className="text-sm font-bold text-blue-600">CAST</p>
// // //                   <div className="mt-2 px-3 py-1 bg-blue-100 rounded-full">
// // //                     <p className="text-xs font-mono font-bold text-blue-800">
// // //                       #{ballNumber?.toString().slice(-4)}
// // //                     </p>
// // //                   </div>
// // //                 </div>

// // //                 {/* Shine Effect */}
// // //                 <motion.div
// // //                   animate={{ 
// // //                     x: [-200, 200],
// // //                   }}
// // //                   transition={{ 
// // //                     duration: 1.5,
// // //                     repeat: Infinity,
// // //                   }}
// // //                   className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40"
// // //                   style={{ width: '50px' }}
// // //                 />
// // //               </div>

// // //               {/* Sparkles around paper */}
// // //               {[...Array(8)].map((_, i) => (
// // //                 <motion.div
// // //                   key={i}
// // //                   initial={{ scale: 0 }}
// // //                   animate={{ 
// // //                     scale: [0, 1, 0],
// // //                     x: Math.cos(i * Math.PI / 4) * 80,
// // //                     y: Math.sin(i * Math.PI / 4) * 80,
// // //                   }}
// // //                   transition={{ 
// // //                     duration: 1,
// // //                     repeat: Infinity,
// // //                     delay: i * 0.1,
// // //                   }}
// // //                   className="absolute top-1/2 left-1/2 w-4 h-4 bg-yellow-400 rounded-full"
// // //                   style={{
// // //                     boxShadow: '0 0 10px rgba(250, 204, 21, 0.8)',
// // //                   }}
// // //                 />
// // //               ))}
// // //             </div>
// // //           </motion.div>
// // //         )}

// // //         {/* Trail Particles */}
// // //         {phase === 'vote-fly' && [...Array(20)].map((_, i) => (
// // //           <motion.div
// // //             key={`trail-${i}`}
// // //             initial={{ 
// // //               x: positions.start.x,
// // //               y: positions.start.y,
// // //               scale: 1,
// // //               opacity: 0.8,
// // //             }}
// // //             animate={{ 
// // //               x: positions.end.x + (Math.random() - 0.5) * 100,
// // //               y: positions.end.y + (Math.random() - 0.5) * 100,
// // //               scale: 0,
// // //               opacity: 0,
// // //             }}
// // //             transition={{ 
// // //               duration: 2,
// // //               delay: i * 0.1,
// // //             }}
// // //             className="absolute w-3 h-3 bg-blue-400 rounded-full blur-sm"
// // //           />
// // //         ))}

// // //         {/* PHASE 3 & 4: BALL MORPHING & ENTERING */}
// // //         {(phase === 'ball-morph' || phase === 'ball-enter') && (
// // //           <motion.div
// // //             key="lottery-ball"
// // //             initial={{ 
// // //               x: positions.end.x - 60,
// // //               y: positions.end.y - 60,
// // //               scale: phase === 'ball-morph' ? 0 : 1,
// // //               rotate: 0,
// // //             }}
// // //             animate={{ 
// // //               scale: phase === 'ball-enter' ? [1, 1.5, 0] : [0, 1.3, 1],
// // //               rotate: [0, 360, 720, 1080],
// // //             }}
// // //             exit={{
// // //               scale: 0,
// // //               opacity: 0,
// // //             }}
// // //             transition={{ 
// // //               duration: phase === 'ball-enter' ? 0.5 : 1,
// // //               ease: "easeOut",
// // //             }}
// // //             className="absolute"
// // //           >
// // //             <div className="relative">
// // //               {/* Outer Glow Rings */}
// // //               {[1, 2, 3].map((ring) => (
// // //                 <motion.div
// // //                   key={`ring-${ring}`}
// // //                   animate={{ 
// // //                     scale: [1, 2, 3],
// // //                     opacity: [0.8, 0.4, 0],
// // //                   }}
// // //                   transition={{ 
// // //                     duration: 1.5,
// // //                     repeat: Infinity,
// // //                     delay: ring * 0.2,
// // //                   }}
// // //                   className="absolute inset-0 border-4 border-yellow-400 rounded-full"
// // //                   style={{ 
// // //                     width: '120px', 
// // //                     height: '120px',
// // //                     marginLeft: '-30px',
// // //                     marginTop: '-30px',
// // //                   }}
// // //                 />
// // //               ))}

// // //               {/* Main Ball */}
// // //               <motion.div
// // //                 animate={{ 
// // //                   rotateY: [0, 360],
// // //                 }}
// // //                 transition={{ 
// // //                   duration: 2,
// // //                   repeat: Infinity,
// // //                   ease: "linear",
// // //                 }}
// // //                 className="relative w-[120px] h-[120px] rounded-full shadow-2xl flex items-center justify-center"
// // //                 style={{
// // //                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
// // //                   boxShadow: '0 20px 60px rgba(102, 126, 234, 0.6), inset 0 0 30px rgba(255, 255, 255, 0.3)',
// // //                 }}
// // //               >
// // //                 {/* Highlight */}
// // //                 <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-full opacity-50 blur-md"></div>

// // //                 {/* Number */}
// // //                 <div className="relative z-10 text-white text-4xl font-black drop-shadow-lg">
// // //                   {ballNumber?.toString().slice(-4)}
// // //                 </div>

// // //                 {/* Shine */}
// // //                 <motion.div
// // //                   animate={{ 
// // //                     rotate: 360,
// // //                   }}
// // //                   transition={{ 
// // //                     duration: 3,
// // //                     repeat: Infinity,
// // //                     ease: "linear",
// // //                   }}
// // //                   className="absolute inset-0 rounded-full"
// // //                   style={{
// // //                     background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
// // //                   }}
// // //                 />
// // //               </motion.div>

// // //               {/* Sparkles Explosion */}
// // //               {[...Array(12)].map((_, i) => (
// // //                 <motion.div
// // //                   key={`spark-${i}`}
// // //                   initial={{ scale: 0 }}
// // //                   animate={{ 
// // //                     scale: [0, 1.5, 0],
// // //                     x: Math.cos(i * Math.PI / 6) * 80,
// // //                     y: Math.sin(i * Math.PI / 6) * 80,
// // //                     rotate: i * 30,
// // //                   }}
// // //                   transition={{ 
// // //                     duration: 1,
// // //                     repeat: Infinity,
// // //                     delay: i * 0.05,
// // //                   }}
// // //                   className="absolute top-1/2 left-1/2 w-4 h-4 bg-yellow-300 rounded-full"
// // //                   style={{
// // //                     boxShadow: '0 0 15px rgba(253, 224, 71, 0.8)',
// // //                   }}
// // //                 />
// // //               ))}
// // //             </div>
// // //           </motion.div>
// // //         )}

// // //         {/* Success Flash Overlay */}
// // //         {phase === 'ball-enter' && (
// // //           <motion.div
// // //             initial={{ opacity: 0 }}
// // //             animate={{ opacity: [0, 0.4, 0] }}
// // //             transition={{ duration: 0.5 }}
// // //             className="fixed inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500"
// // //           />
// // //         )}

// // //         {/* Confetti burst on completion */}
// // //         {phase === 'complete' && (
// // //           <>
// // //             {[...Array(30)].map((_, i) => (
// // //               <motion.div
// // //                 key={`confetti-${i}`}
// // //                 initial={{ 
// // //                   x: positions.end.x,
// // //                   y: positions.end.y,
// // //                   scale: 1,
// // //                   rotate: 0,
// // //                 }}
// // //                 animate={{ 
// // //                   x: positions.end.x + (Math.random() - 0.5) * 300,
// // //                   y: positions.end.y + (Math.random() - 0.5) * 300,
// // //                   scale: 0,
// // //                   rotate: Math.random() * 720,
// // //                   opacity: 0,
// // //                 }}
// // //                 transition={{ 
// // //                   duration: 1,
// // //                   delay: i * 0.02,
// // //                 }}
// // //                 className="absolute w-3 h-3 rounded-full"
// // //                 style={{
// // //                   backgroundColor: ['#FFD700', '#FF6347', '#4169E1', '#9370DB', '#FF1493'][i % 5],
// // //                 }}
// // //               />
// // //             ))}
// // //           </>
// // //         )}

// // //       </AnimatePresence>
// // //     </div>
// // //   );
// // // }