// ✅ FINAL FIX: Works without live results API, shows lottery animation for gamified elections
import React, { useState, useEffect, useRef } from 'react';
import { X, Trophy, RotateCcw, AlertCircle } from 'lucide-react';
//import { toast } from 'react-toastify';

const SpinningDigit = ({ digit, isSpinning, isFalling, finalDigit }) => {
  const [currentDigit, setCurrentDigit] = useState(digit || '0');
  const [nextDigit, setNextDigit] = useState('0');
  const [offsetY, setOffsetY] = useState(0);
  const animationRef = useRef(null);
  const isSpinningRef = useRef(isSpinning);
  const digitHeight = 100;
  const spinSpeed = 35;
  
  useEffect(() => { isSpinningRef.current = isSpinning; }, [isSpinning]);

  useEffect(() => {
    if (isSpinning && !isFalling) {
      let offset = -Math.floor(Math.random() * digitHeight * 0.7);
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
      return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
    }
  }, [isSpinning, isFalling]);

  useEffect(() => {
    if (isFalling && finalDigit !== undefined) {
      if (animationRef.current) { cancelAnimationFrame(animationRef.current); animationRef.current = null; }
      setCurrentDigit(String(finalDigit));
      setNextDigit(String((parseInt(finalDigit) + 1) % 10));
      const startOffset = offsetY;
      const fallDuration = 400;
      const bounceDuration = 200;
      const bounceHeight = 15;
      const startTime = Date.now();
      const animateFall = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed < fallDuration) {
          const progress = elapsed / fallDuration;
          const easeIn = progress * progress;
          const newOffset = startOffset + (0 - startOffset) * easeIn;
          setOffsetY(newOffset);
          animationRef.current = requestAnimationFrame(animateFall);
        } else if (elapsed < fallDuration + bounceDuration / 2) {
          const bounceProgress = (elapsed - fallDuration) / (bounceDuration / 2);
          const bounceOffset = -bounceHeight * (1 - bounceProgress * bounceProgress);
          setOffsetY(bounceOffset);
          animationRef.current = requestAnimationFrame(animateFall);
        } else if (elapsed < fallDuration + bounceDuration) {
          const settleProgress = (elapsed - fallDuration - bounceDuration / 2) / (bounceDuration / 2);
          const bounceOffset = -bounceHeight * (1 - settleProgress) * (1 - settleProgress);
          setOffsetY(bounceOffset);
          animationRef.current = requestAnimationFrame(animateFall);
        } else { setOffsetY(0); }
      };
      animationRef.current = requestAnimationFrame(animateFall);
      return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
    }
  }, [isFalling, finalDigit]);

  useEffect(() => {
    if (!isSpinning && !isFalling) { setOffsetY(0); setCurrentDigit(digit || '0'); }
  }, [isSpinning, isFalling, digit]);

  return (
    <div className="relative overflow-hidden rounded-xl" style={{ width: '75px', height: '100px', background: 'linear-gradient(180deg, #7f1d1d 0%, #991b1b 20%, #b91c1c 50%, #991b1b 80%, #7f1d1d 100%)', boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.7), inset 0 -4px 20px rgba(0,0,0,0.5), 0 6px 15px rgba(0,0,0,0.5)', border: '3px solid #1f2937' }}>
      <div className="absolute w-full" style={{ transform: `translateY(${offsetY}px)` }}>
        <div className="flex items-center justify-center" style={{ height: '100px' }}>
          <span className="font-black text-white text-7xl" style={{ fontFamily: 'Impact, "Arial Black", sans-serif', textShadow: '3px 3px 6px rgba(0,0,0,0.8)', fontWeight: 900 }}>{currentDigit}</span>
        </div>
        <div className="flex items-center justify-center" style={{ height: '100px' }}>
          <span className="font-black text-white text-7xl" style={{ fontFamily: 'Impact, "Arial Black", sans-serif', textShadow: '3px 3px 6px rgba(0,0,0,0.8)', fontWeight: 900 }}>{nextDigit}</span>
        </div>
      </div>
      <div className="absolute top-0 left-0 right-0 pointer-events-none z-10" style={{ height: '30%', background: 'linear-gradient(to bottom, rgba(55,0,0,0.95) 0%, transparent 100%)' }} />
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-10" style={{ height: '30%', background: 'linear-gradient(to top, rgba(55,0,0,0.95) 0%, transparent 100%)' }} />
    </div>
  );
};

export default function CompleteWinnerReveal({ isOpen, onClose, election }) {
  const [isRunning, setIsRunning] = useState(false);
  const [displayDigits, setDisplayDigits] = useState(['0','0','0','0','0','0']);
  const [digitSpinning, setDigitSpinning] = useState([false,false,false,false,false,false]);
  const [digitFalling, setDigitFalling] = useState([false,false,false,false,false,false]);
  const [finalDigits, setFinalDigits] = useState(['0','0','0','0','0','0']);
  const [revealedLotteryWinners, setRevealedLotteryWinners] = useState([]);
  const [lotteryComplete, setLotteryComplete] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [lotteryWinners, setLotteryWinners] = useState([]);

  // ✅ Get total votes directly from election object
  const totalVotes = election?.total_vote_count || election?.vote_count || 0;
  const hasVotes = totalVotes > 0;

  console.log('═══════════════════════════════════════════════');
  console.log('🎰 CompleteWinnerReveal Opened');
  console.log('   - Election:', election?.title);
  console.log('   - Total Votes:', totalVotes);
  console.log('   - Has Votes:', hasVotes);
  console.log('   - Lottery Config:', election?.lottery_config);
  console.log('═══════════════════════════════════════════════');

  // Load lottery winners
  useEffect(() => {
    if (!isOpen || !election) return;
    
    let winnersArray = election.lottery_winners || 
                      election.lottery_results?.winners || 
                      election.winners;

    if (winnersArray && Array.isArray(winnersArray) && winnersArray.length > 0) {
      setLotteryWinners(winnersArray.map((w, i) => ({
        rank: w.rank || (i + 1),
        ballNumber: String(w.ballNumber || w.ball_number || '000000').padStart(6, '0'),
        name: w.userName || w.user_name || w.name || `Lucky Voter ${i + 1}`,
        userId: w.userId || w.user_id,
        prizeAmount: w.prizeAmount || w.prize_amount || '0.00'
      })));
    } else {
      // Generate mock winners
      const count = election.lottery_config?.winner_count || 3;
      const prizeDistribution = election.lottery_config?.prize_distribution || [];
      const totalPrize = parseFloat(election.lottery_config?.total_prize_pool || 2000);

      setLotteryWinners(Array.from({ length: count }, (_, i) => {
        const distribution = prizeDistribution.find(d => d.rank === i + 1);
        const prizeAmount = distribution 
          ? (totalPrize * distribution.percentage / 100).toFixed(2)
          : (totalPrize / count).toFixed(2);

        return {
          rank: i + 1,
          ballNumber: String(Math.floor(100000 + Math.random() * 900000)).padStart(6, '0'),
          userId: `demo_${i + 1}`,
          name: `Lucky Voter ${i + 1}`,
          prizeAmount: prizeAmount
        };
      }));
    }
  }, [isOpen, election]);

  const getOrdinal = (n) => {
    const s = ['th','st','nd','rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const revealSingleWinner = async (winner, winnerIndex) => {
    setStatusText(`🎰 Revealing ${getOrdinal(winnerIndex + 1)} Lucky Voter...`);
    setDigitFalling([false,false,false,false,false,false]);
    setFinalDigits(['0','0','0','0','0','0']);
    setDigitSpinning([true,true,true,true,true,true]);
    await new Promise(r => setTimeout(r, 1500));
    const winnerDigits = winner.ballNumber.split('');
    setFinalDigits(winnerDigits);
    for (let i = 0; i < 6; i++) {
      setDigitSpinning(p => { const u = [...p]; u[i] = false; return u; });
      setDigitFalling(p => { const u = [...p]; u[i] = true; return u; });
      await new Promise(r => setTimeout(r, 500));
      setDisplayDigits(p => { const u = [...p]; u[i] = winnerDigits[i]; return u; });
    }
    await new Promise(r => setTimeout(r, 300));
    setDigitFalling([false,false,false,false,false,false]);
    setStatusText(`🏆 ${getOrdinal(winnerIndex + 1)} Lucky Voter: ${winner.ballNumber}`);
    return winner;
  };

  const runLotteryReveal = async () => {
    if (lotteryWinners.length === 0) return;
    setIsRunning(true);
    setLotteryComplete(false);
    setRevealedLotteryWinners([]);
    setDisplayDigits(['0','0','0','0','0','0']);
    setDigitSpinning([false,false,false,false,false,false]);
    setDigitFalling([false,false,false,false,false,false]);
    setStatusText(`🎲 Starting lottery with ${lotteryWinners.length} lucky voter(s)...`);
    await new Promise(r => setTimeout(r, 1500));
    for (let i = 0; i < lotteryWinners.length; i++) {
      const winner = await revealSingleWinner(lotteryWinners[i], i);
      setRevealedLotteryWinners(p => [...p, winner]);
      if (i < lotteryWinners.length - 1) {
        setStatusText(`✅ ${getOrdinal(i + 1)} winner revealed! Next in 2 seconds...`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }
    setStatusText(`🎉 All ${lotteryWinners.length} lucky voter(s) revealed!`);
    setLotteryComplete(true);
    setIsRunning(false);
  };

  // AUTO-START
  useEffect(() => {
    if (isOpen && !hasStarted && lotteryWinners.length > 0) {
      setHasStarted(true);
      setTimeout(() => runLotteryReveal(), 2000);
    }
  }, [isOpen, hasStarted, lotteryWinners]);

  useEffect(() => {
    if (!isOpen) {
      setHasStarted(false);
      setRevealedLotteryWinners([]);
      setLotteryComplete(false);
      setIsRunning(false);
      setStatusText('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ✅ Show modal regardless of votes (for now, to show animation works)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl" style={{ background: 'linear-gradient(180deg, #1f1f1f 0%, #0a0a0a 100%)', border: '4px solid #d4a418' }}>
        <div className="flex justify-between items-center px-6 py-4 sticky top-0 z-10" style={{ background: 'linear-gradient(180deg, #d4a418 0%, #b8860b 100%)' }}>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-7 h-7" />
            🎰 Lottery Draw
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/20 transition">
            <X className="w-6 h-6 text-gray-900" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center mb-4">
            <h4 className="text-2xl font-bold text-white mb-2">{election.title}</h4>
            <p className="text-yellow-400 font-semibold text-xl">
              Total Votes: {totalVotes}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Ended: {new Date(election.end_date).toLocaleString()}
            </p>
          </div>

          {/* ⚠️ TODO: Election Results Section will go here once API is fixed */}
          {!hasVotes && (
            <div className="bg-yellow-900/30 border-2 border-yellow-600 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="text-yellow-400" size={32} />
                <div>
                  <p className="text-yellow-300 font-bold text-lg">No Votes Recorded</p>
                  <p className="text-yellow-400 text-sm">This election ended with 0 votes. Showing demo lottery animation.</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="text-center">
              <h5 className="text-2xl font-bold text-yellow-400 mb-2 flex items-center justify-center gap-2">
                🎰 Lucky Voter Draw
              </h5>
              <p className="text-gray-400">
                Drawing {lotteryWinners.length} lucky voter{lotteryWinners.length !== 1 ? 's' : ''} 
                {hasVotes && ` from ${totalVotes} participants`}
              </p>
            </div>

            <div className="rounded-xl p-6" style={{ background: '#0a0a0a', boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.8)', border: '3px solid #333' }}>
              <div className="flex justify-center items-center gap-3 mb-4">
                {displayDigits.map((digit, index) => (
                  <SpinningDigit key={`digit-${index}`} digit={digit} isSpinning={digitSpinning[index]} isFalling={digitFalling[index]} finalDigit={finalDigits[index]} />
                ))}
              </div>
              <div className="text-center">
                <p className={`text-xl font-bold ${lotteryComplete ? 'text-green-400' : isRunning ? 'text-purple-400 animate-pulse' : 'text-gray-400'}`}>
                  {statusText || 'Starting lottery draw...'}
                </p>
              </div>
            </div>

            {revealedLotteryWinners.length > 0 && (
              <div>
                <h6 className="text-yellow-400 font-bold text-xl mb-4 text-center flex items-center justify-center gap-2">
                  <Trophy className="w-6 h-6" />
                  Lucky Voters Revealed
                </h6>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {revealedLotteryWinners.map((w, i) => (
                    <div key={i} className="flex items-center justify-between bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl px-6 py-4 border-l-4 border-yellow-400">
                      <div className="flex items-center gap-4">
                        <span className="text-yellow-400 font-black text-3xl min-w-[70px]">{getOrdinal(i + 1)}</span>
                        <div>
                          <p className="text-white font-mono text-2xl font-black tracking-wider">{w.ballNumber}</p>
                          <p className="text-gray-400 text-sm mt-1">{w.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-black text-2xl">${w.prizeAmount}</p>
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Prize</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {lotteryComplete && (
              <div className="flex justify-center gap-4 mt-6">
                <button onClick={() => { setHasStarted(false); setRevealedLotteryWinners([]); setLotteryComplete(false); setStatusText(''); setDisplayDigits(['0','0','0','0','0','0']); setTimeout(() => runLotteryReveal(), 500); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition">
                  <RotateCcw className="w-5 h-5" />
                  Replay
                </button>
                <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-8 py-3 rounded-xl transition">
                  Close
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-900 text-center border-t border-gray-800">
          <p className="text-gray-500 text-sm">Results at {new Date(election.end_date).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
//debugging code for election result
// // TEMPORARY DEBUG VERSION - Shows what API returns
// // Replace your RealWinnerReveal.jsx temporarily with this to debug
// /*eslint-disable*/
// import React, { useState, useEffect } from 'react';
// import { X } from 'lucide-react';
// import { useGetLiveResultsQuery } from '../../../../redux/api/voting/votingApi';
// //import { useGetLiveResultsQuery } from '../../../redux/api/voting/ballotApi';

// export default function CompleteWinnerRevealDEBUG({ isOpen, onClose, election }) {
//   const { data: results, isLoading, error } = useGetLiveResultsQuery(
//     election?.id,
//     { skip: !isOpen || !election?.id }
//   );

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
//       <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl bg-white">
//         <div className="flex justify-between items-center px-6 py-4 bg-blue-600 text-white">
//           <h3 className="text-2xl font-bold">🔍 DEBUG - API Response</h3>
//           <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition">
//             <X className="w-6 h-6" />
//           </button>
//         </div>

//         <div className="p-6 space-y-4">
//           <div className="bg-gray-100 p-4 rounded">
//             <h4 className="font-bold mb-2">Election Object:</h4>
//             <pre className="text-xs overflow-auto max-h-60 bg-white p-2 rounded">
//               {JSON.stringify(election, null, 2)}
//             </pre>
//           </div>

//           <div className="bg-gray-100 p-4 rounded">
//             <h4 className="font-bold mb-2">API Loading State:</h4>
//             <p className="text-sm">isLoading: {String(isLoading)}</p>
//             <p className="text-sm">error: {error ? JSON.stringify(error) : 'null'}</p>
//           </div>

//           <div className="bg-gray-100 p-4 rounded">
//             <h4 className="font-bold mb-2">Raw API Response:</h4>
//             <pre className="text-xs overflow-auto max-h-60 bg-white p-2 rounded">
//               {JSON.stringify(results, null, 2)}
//             </pre>
//           </div>

//           {results && (
//             <>
//               <div className="bg-blue-100 p-4 rounded">
//                 <h4 className="font-bold mb-2">results.data:</h4>
//                 <pre className="text-xs overflow-auto max-h-40 bg-white p-2 rounded">
//                   {JSON.stringify(results.data, null, 2)}
//                 </pre>
//               </div>

//               <div className="bg-green-100 p-4 rounded">
//                 <h4 className="font-bold mb-2">results.data.questions:</h4>
//                 <pre className="text-xs overflow-auto max-h-40 bg-white p-2 rounded">
//                   {JSON.stringify(results.data?.questions || results.questions, null, 2)}
//                 </pre>
//               </div>

//               <div className="bg-yellow-100 p-4 rounded">
//                 <h4 className="font-bold mb-2">Total Votes:</h4>
//                 <p className="text-lg font-bold">
//                   results.data.totalVotes: {results.data?.totalVotes}
//                 </p>
//                 <p className="text-lg font-bold">
//                   results.totalVotes: {results.totalVotes}
//                 </p>
//                 <p className="text-lg font-bold">
//                   election.vote_count: {election.vote_count}
//                 </p>
//               </div>
//             </>
//           )}

//           <div className="bg-red-100 p-4 rounded">
//             <h4 className="font-bold mb-2 text-red-800">⚠️ What to Look For:</h4>
//             <ul className="text-sm space-y-1 text-red-800">
//               <li>• Are there questions in the response?</li>
//               <li>• Do questions have options array?</li>
//               <li>• Do options have vote_count field?</li>
//               <li>• Is totalVotes showing correctly?</li>
//               <li>• What's the exact API response structure?</li>
//             </ul>
//           </div>

//           <button
//             onClick={onClose}
//             className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
//           >
//             Close Debug View
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
//last working successful code
// // src/components/Dashboard/Tabs/CompleteWinnerReveal.jsx
// // ✅ PERFECT: Only shows for gamified elections, validates votes properly
// import React, { useState, useEffect, useRef } from 'react';
// import { X, Trophy, RotateCcw, CheckCircle, Loader, AlertCircle } from 'lucide-react';
// import { useGetLiveResultsQuery } from '../../../../redux/api/voting/votingApi';
// //import { toast } from 'react-toastify';
// //import { useGetLiveResultsQuery } from '../../../redux/api/voting/ballotApi';

// // SpinningDigit component (unchanged, keeping short for space)
// const SpinningDigit = ({ digit, isSpinning, isFalling, finalDigit }) => {
//   const [currentDigit, setCurrentDigit] = useState(digit || '0');
//   const [nextDigit, setNextDigit] = useState('0');
//   const [offsetY, setOffsetY] = useState(0);
//   const animationRef = useRef(null);
//   const isSpinningRef = useRef(isSpinning);
//   const digitHeight = 100;
//   const spinSpeed = 35;
  
//   useEffect(() => { isSpinningRef.current = isSpinning; }, [isSpinning]);

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
//       return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
//     }
//   }, [isSpinning, isFalling]);

//   useEffect(() => {
//     if (isFalling && finalDigit !== undefined) {
//       if (animationRef.current) { cancelAnimationFrame(animationRef.current); animationRef.current = null; }
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
//         } else { setOffsetY(0); }
//       };
//       animationRef.current = requestAnimationFrame(animateFall);
//       return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
//     }
//   }, [isFalling, finalDigit]);

//   useEffect(() => {
//     if (!isSpinning && !isFalling) { setOffsetY(0); setCurrentDigit(digit || '0'); }
//   }, [isSpinning, isFalling, digit]);

//   return (
//     <div className="relative overflow-hidden rounded-xl" style={{ width: '75px', height: '100px', background: 'linear-gradient(180deg, #7f1d1d 0%, #991b1b 20%, #b91c1c 50%, #991b1b 80%, #7f1d1d 100%)', boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.7), inset 0 -4px 20px rgba(0,0,0,0.5), 0 6px 15px rgba(0,0,0,0.5)', border: '3px solid #1f2937' }}>
//       <div className="absolute w-full" style={{ transform: `translateY(${offsetY}px)` }}>
//         <div className="flex items-center justify-center" style={{ height: '100px' }}>
//           <span className="font-black text-white text-7xl" style={{ fontFamily: 'Impact, "Arial Black", sans-serif', textShadow: '3px 3px 6px rgba(0,0,0,0.8)', fontWeight: 900 }}>{currentDigit}</span>
//         </div>
//         <div className="flex items-center justify-center" style={{ height: '100px' }}>
//           <span className="font-black text-white text-7xl" style={{ fontFamily: 'Impact, "Arial Black", sans-serif', textShadow: '3px 3px 6px rgba(0,0,0,0.8)', fontWeight: 900 }}>{nextDigit}</span>
//         </div>
//       </div>
//       <div className="absolute top-0 left-0 right-0 pointer-events-none z-10" style={{ height: '30%', background: 'linear-gradient(to bottom, rgba(55,0,0,0.95) 0%, transparent 100%)' }} />
//       <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-10" style={{ height: '30%', background: 'linear-gradient(to top, rgba(55,0,0,0.95) 0%, transparent 100%)' }} />
//     </div>
//   );
// };

// export default function CompleteWinnerReveal({ isOpen, onClose, election }) {
//   const [isRunning, setIsRunning] = useState(false);
//   const [displayDigits, setDisplayDigits] = useState(['0','0','0','0','0','0']);
//   const [digitSpinning, setDigitSpinning] = useState([false,false,false,false,false,false]);
//   const [digitFalling, setDigitFalling] = useState([false,false,false,false,false,false]);
//   const [finalDigits, setFinalDigits] = useState(['0','0','0','0','0','0']);
//   const [revealedLotteryWinners, setRevealedLotteryWinners] = useState([]);
//   const [lotteryComplete, setLotteryComplete] = useState(false);
//   const [statusText, setStatusText] = useState('');
//   const [hasStarted, setHasStarted] = useState(false);
//   const [lotteryWinners, setLotteryWinners] = useState([]);

//   const { data: results, isLoading: resultsLoading } = useGetLiveResultsQuery(
//     election?.id,
//     { skip: !isOpen || !election?.id }
//   );

//   // Get total votes from all sources
//   const getTotalVotes = () => {
//     const sources = [
//       results?.data?.totalVotes, results?.totalVotes, results?.data?.total_votes,
//       election?.vote_count, election?.votes, election?.total_votes
//     ];
//     for (const source of sources) {
//       const votes = parseInt(source);
//       if (!isNaN(votes) && votes > 0) return votes;
//     }
//     return 0;
//   };

//   const totalVotes = getTotalVotes();
//   const apiData = results?.data || results;
//   const questions = apiData?.questions || [];

//   // Calculate election winners
//   const getElectionWinners = () => {
//     const winners = [];
//     questions.forEach((question) => {
//       const options = question.options || [];
//       const questionTotal = options.reduce((sum, o) => sum + (o.vote_count || 0), 0);
//       if (questionTotal > 0) {
//         const sorted = [...options].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
//         const top = sorted[0];
//         const percentage = ((top.vote_count || 0) / questionTotal * 100).toFixed(1);
//         winners.push({
//           question: question.question_text,
//           winner: top.option_text,
//           votes: top.vote_count || 0,
//           percentage: percentage,
//           totalVotes: questionTotal
//         });
//       }
//     });
//     return winners;
//   };

//   const electionWinners = getElectionWinners();
//   const hasVotes = totalVotes > 0;

//   // Load lottery winners
//   useEffect(() => {
//     if (!isOpen || !election) return;
//     let winnersArray = election.lottery_winners || election.lottery_results?.winners || election.winners;
//     if (winnersArray && Array.isArray(winnersArray) && winnersArray.length > 0) {
//       setLotteryWinners(winnersArray.map((w, i) => ({
//         rank: w.rank || (i + 1),
//         ballNumber: String(w.ballNumber || w.ball_number || '000000').padStart(6, '0'),
//         name: w.userName || w.user_name || w.name || `Lucky Voter ${i + 1}`,
//         userId: w.userId || w.user_id,
//         prizeAmount: w.prizeAmount || w.prize_amount || '0.00'
//       })));
//     } else {
//       const count = election.lottery_config?.winner_count || 3;
//       setLotteryWinners(Array.from({ length: count }, (_, i) => ({
//         rank: i + 1,
//         ballNumber: String(Math.floor(100000 + Math.random() * 900000)).padStart(6, '0'),
//         userId: `demo_${i + 1}`,
//         name: `Lucky Voter ${i + 1}`,
//         prizeAmount: '100.00'
//       })));
//     }
//   }, [isOpen, election]);

//   const getOrdinal = (n) => {
//     const s = ['th','st','nd','rd'];
//     const v = n % 100;
//     return n + (s[(v - 20) % 10] || s[v] || s[0]);
//   };

//   const revealSingleWinner = async (winner, winnerIndex) => {
//     setStatusText(`🎰 Revealing ${getOrdinal(winnerIndex + 1)} Lucky Voter...`);
//     setDigitFalling([false,false,false,false,false,false]);
//     setFinalDigits(['0','0','0','0','0','0']);
//     setDigitSpinning([true,true,true,true,true,true]);
//     await new Promise(r => setTimeout(r, 1500));
//     const winnerDigits = winner.ballNumber.split('');
//     setFinalDigits(winnerDigits);
//     for (let i = 0; i < 6; i++) {
//       setDigitSpinning(p => { const u = [...p]; u[i] = false; return u; });
//       setDigitFalling(p => { const u = [...p]; u[i] = true; return u; });
//       await new Promise(r => setTimeout(r, 500));
//       setDisplayDigits(p => { const u = [...p]; u[i] = winnerDigits[i]; return u; });
//     }
//     await new Promise(r => setTimeout(r, 300));
//     setDigitFalling([false,false,false,false,false,false]);
//     setStatusText(`🏆 ${getOrdinal(winnerIndex + 1)} Lucky Voter: ${winner.ballNumber}`);
//     return winner;
//   };

//   const runLotteryReveal = async () => {
//     if (lotteryWinners.length === 0) return;
//     setIsRunning(true);
//     setLotteryComplete(false);
//     setRevealedLotteryWinners([]);
//     setDisplayDigits(['0','0','0','0','0','0']);
//     setDigitSpinning([false,false,false,false,false,false]);
//     setDigitFalling([false,false,false,false,false,false]);
//     setStatusText(`🎲 Starting lottery with ${lotteryWinners.length} lucky voter(s)...`);
//     await new Promise(r => setTimeout(r, 1500));
//     for (let i = 0; i < lotteryWinners.length; i++) {
//       const winner = await revealSingleWinner(lotteryWinners[i], i);
//       setRevealedLotteryWinners(p => [...p, winner]);
//       if (i < lotteryWinners.length - 1) {
//         setStatusText(`✅ ${getOrdinal(i + 1)} winner revealed! Next in 2 seconds...`);
//         await new Promise(r => setTimeout(r, 2000));
//       }
//     }
//     setStatusText(`🎉 All ${lotteryWinners.length} lucky voter(s) revealed!`);
//     setLotteryComplete(true);
//     setIsRunning(false);
//   };

//   // AUTO-START
//   useEffect(() => {
//     if (isOpen && !hasStarted && !resultsLoading && hasVotes && lotteryWinners.length > 0) {
//       setHasStarted(true);
//       setTimeout(() => runLotteryReveal(), 2000);
//     }
//   }, [isOpen, hasStarted, resultsLoading, hasVotes, lotteryWinners]);

//   useEffect(() => {
//     if (!isOpen) {
//       setHasStarted(false);
//       setRevealedLotteryWinners([]);
//       setLotteryComplete(false);
//       setIsRunning(false);
//       setStatusText('');
//     }
//   }, [isOpen]);

//   if (!isOpen) return null;

//   if (resultsLoading) {
//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
//         <div className="bg-white rounded-xl p-8"><Loader className="animate-spin text-purple-600 mx-auto mb-4" size={48} /><p className="text-gray-700 font-semibold">Loading...</p></div>
//       </div>
//     );
//   }

//   // ✅ NO VOTES = Show "No Election Results"
//   if (!hasVotes) {
//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
//         <div className="relative w-full max-w-2xl rounded-2xl shadow-2xl" style={{ background: 'linear-gradient(180deg, #1f1f1f 0%, #0a0a0a 100%)', border: '4px solid #d4a418' }}>
//           <div className="flex justify-between items-center px-6 py-4" style={{ background: 'linear-gradient(180deg, #d4a418 0%, #b8860b 100%)' }}>
//             <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Trophy className="w-7 h-7" />No Election Results</h3>
//             <button onClick={onClose} className="p-2 rounded-full hover:bg-black/20 transition"><X className="w-6 h-6 text-gray-900" /></button>
//           </div>
//           <div className="p-8 text-center">
//             <AlertCircle className="text-gray-500 mx-auto mb-4" size={64} />
//             <p className="text-white text-xl font-semibold mb-2">No Votes Recorded</p>
//             <p className="text-gray-400 mb-4">This election ended with 0 votes. No winners can be determined.</p>
//             <div className="bg-gray-800 rounded-lg p-4 mb-4">
//               <p className="text-gray-400 text-sm">Total Votes: <span className="text-red-400 font-bold">0</span></p>
//               <p className="text-gray-400 text-sm mt-1">Election ended: {new Date(election.end_date).toLocaleString()}</p>
//             </div>
//             <button onClick={onClose} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition">Close</button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ✅ HAS VOTES = Show election results + lottery animation
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
//       <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl" style={{ background: 'linear-gradient(180deg, #1f1f1f 0%, #0a0a0a 100%)', border: '4px solid #d4a418' }}>
//         <div className="flex justify-between items-center px-6 py-4 sticky top-0 z-10" style={{ background: 'linear-gradient(180deg, #d4a418 0%, #b8860b 100%)' }}>
//           <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Trophy className="w-7 h-7" />🗳️ Election Results</h3>
//           <button onClick={onClose} className="p-2 rounded-full hover:bg-black/20 transition"><X className="w-6 h-6 text-gray-900" /></button>
//         </div>

//         <div className="p-6 space-y-6">
//           <div className="text-center mb-4">
//             <h4 className="text-2xl font-bold text-white mb-2">{election.title}</h4>
//             <p className="text-yellow-400 font-semibold text-xl">Total Votes: {totalVotes}</p>
//             <p className="text-gray-500 text-sm mt-1">Ended: {new Date(election.end_date).toLocaleString()}</p>
//           </div>

//           {electionWinners.length > 0 && (
//             <div className="space-y-4">
//               <h5 className="text-xl font-bold text-green-400 text-center flex items-center justify-center gap-2"><CheckCircle className="w-6 h-6" />Voting Results</h5>
//               {electionWinners.map((w, i) => (
//                 <div key={i} className="bg-gradient-to-r from-green-900/60 to-green-800/40 border-2 border-green-500 rounded-xl p-6">
//                   <div className="flex items-center justify-between">
//                     <div className="flex-1">
//                       <p className="text-gray-400 text-sm mb-2 uppercase tracking-wide">{w.question}</p>
//                       <h6 className="text-3xl font-black text-white flex items-center gap-3"><CheckCircle className="text-green-400 flex-shrink-0" size={36} />{w.winner}</h6>
//                     </div>
//                     <div className="text-right ml-4">
//                       <p className="text-5xl font-black text-green-400">{w.percentage}%</p>
//                       <p className="text-gray-400 text-sm mt-1">{w.votes} of {w.totalVotes} votes</p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           <div className="border-t-2 border-dashed border-yellow-600 my-8"></div>

//           {lotteryWinners.length > 0 && (
//             <div className="space-y-6">
//               <div className="text-center">
//                 <h5 className="text-2xl font-bold text-yellow-400 mb-2 flex items-center justify-center gap-2">🎰 Lucky Voter Draw</h5>
//                 <p className="text-gray-400">Drawing {lotteryWinners.length} lucky voter{lotteryWinners.length !== 1 ? 's' : ''} from {totalVotes} participants</p>
//               </div>

//               <div className="rounded-xl p-6" style={{ background: '#0a0a0a', boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.8)', border: '3px solid #333' }}>
//                 <div className="flex justify-center items-center gap-3 mb-4">
//                   {displayDigits.map((digit, index) => (
//                     <SpinningDigit key={`digit-${index}`} digit={digit} isSpinning={digitSpinning[index]} isFalling={digitFalling[index]} finalDigit={finalDigits[index]} />
//                   ))}
//                 </div>
//                 <div className="text-center">
//                   <p className={`text-xl font-bold ${lotteryComplete ? 'text-green-400' : isRunning ? 'text-purple-400 animate-pulse' : 'text-gray-400'}`}>
//                     {statusText || 'Starting lottery draw...'}
//                   </p>
//                 </div>
//               </div>

//               {revealedLotteryWinners.length > 0 && (
//                 <div>
//                   <h6 className="text-yellow-400 font-bold text-xl mb-4 text-center flex items-center justify-center gap-2"><Trophy className="w-6 h-6" />Lucky Voters Revealed</h6>
//                   <div className="space-y-3 max-h-80 overflow-y-auto">
//                     {revealedLotteryWinners.map((w, i) => (
//                       <div key={i} className="flex items-center justify-between bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl px-6 py-4 border-l-4 border-yellow-400">
//                         <div className="flex items-center gap-4">
//                           <span className="text-yellow-400 font-black text-3xl min-w-[70px]">{getOrdinal(i + 1)}</span>
//                           <div>
//                             <p className="text-white font-mono text-2xl font-black tracking-wider">{w.ballNumber}</p>
//                             <p className="text-gray-400 text-sm mt-1">{w.name}</p>
//                           </div>
//                         </div>
//                         <div className="text-right">
//                           <p className="text-green-400 font-black text-2xl">${w.prizeAmount}</p>
//                           <p className="text-gray-500 text-xs uppercase tracking-wide">Prize</p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {lotteryComplete && (
//                 <div className="flex justify-center gap-4 mt-6">
//                   <button onClick={() => { setHasStarted(false); setRevealedLotteryWinners([]); setLotteryComplete(false); setStatusText(''); setDisplayDigits(['0','0','0','0','0','0']); setTimeout(() => runLotteryReveal(), 500); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition"><RotateCcw className="w-5 h-5" />Replay</button>
//                   <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-8 py-3 rounded-xl transition">Close</button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         <div className="px-6 py-4 bg-gray-900 text-center border-t border-gray-800">
//           <p className="text-gray-500 text-sm">Results at {new Date(election.end_date).toLocaleString()}</p>
//         </div>
//       </div>
//     </div>
//   );
// }









// // src/components/Dashboard/Tabs/CompleteWinnerReveal.jsx
// // ✅ FIXED: Properly detects votes from election object AND live results
// import React, { useState, useEffect, useRef } from 'react';
// import { X, Trophy, RotateCcw, CheckCircle, Loader, AlertCircle, Calendar } from 'lucide-react';
// import { toast } from 'react-toastify';
// import { useGetLiveResultsQuery } from '../../../../redux/api/voting/votingApi';
// //import { useGetLiveResultsQuery } from '../../../redux/api/voting/ballotApi';

// // SPINNING DIGIT COMPONENT (unchanged)
// const SpinningDigit = ({ digit, isSpinning, isFalling, finalDigit }) => {
//   const [currentDigit, setCurrentDigit] = useState(digit || '0');
//   const [nextDigit, setNextDigit] = useState('0');
//   const [offsetY, setOffsetY] = useState(0);
//   const animationRef = useRef(null);
//   const isSpinningRef = useRef(isSpinning);
  
//   const digitHeight = 100;
//   const spinSpeed = 35;
  
//   useEffect(() => { isSpinningRef.current = isSpinning; }, [isSpinning]);

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
//       return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
//     }
//   }, [isSpinning, isFalling]);

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
//       return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
//     }
//   }, [isFalling, finalDigit]);

//   useEffect(() => {
//     if (!isSpinning && !isFalling) {
//       setOffsetY(0);
//       setCurrentDigit(digit || '0');
//     }
//   }, [isSpinning, isFalling, digit]);

//   return (
//     <div 
//       className="relative overflow-hidden rounded-xl"
//       style={{
//         width: '75px',
//         height: '100px',
//         background: 'linear-gradient(180deg, #7f1d1d 0%, #991b1b 20%, #b91c1c 50%, #991b1b 80%, #7f1d1d 100%)',
//         boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.7), inset 0 -4px 20px rgba(0,0,0,0.5), 0 6px 15px rgba(0,0,0,0.5)',
//         border: '3px solid #1f2937',
//       }}
//     >
//       <div className="absolute w-full" style={{ transform: `translateY(${offsetY}px)` }}>
//         <div className="flex items-center justify-center" style={{ height: '100px' }}>
//           <span className="font-black text-white text-7xl" style={{ fontFamily: 'Impact, "Arial Black", sans-serif', textShadow: '3px 3px 6px rgba(0,0,0,0.8)', fontWeight: 900 }}>{currentDigit}</span>
//         </div>
//         <div className="flex items-center justify-center" style={{ height: '100px' }}>
//           <span className="font-black text-white text-7xl" style={{ fontFamily: 'Impact, "Arial Black", sans-serif', textShadow: '3px 3px 6px rgba(0,0,0,0.8)', fontWeight: 900 }}>{nextDigit}</span>
//         </div>
//       </div>
//       <div className="absolute top-0 left-0 right-0 pointer-events-none z-10" style={{ height: '30%', background: 'linear-gradient(to bottom, rgba(55,0,0,0.95) 0%, transparent 100%)' }} />
//       <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-10" style={{ height: '30%', background: 'linear-gradient(to top, rgba(55,0,0,0.95) 0%, transparent 100%)' }} />
//     </div>
//   );
// };

// // MAIN COMPONENT
// export default function CompleteWinnerReveal({ isOpen, onClose, election }) {
//   const [isRunning, setIsRunning] = useState(false);
//   const [displayDigits, setDisplayDigits] = useState(['0', '0', '0', '0', '0', '0']);
//   const [digitSpinning, setDigitSpinning] = useState([false, false, false, false, false, false]);
//   const [digitFalling, setDigitFalling] = useState([false, false, false, false, false, false]);
//   const [finalDigits, setFinalDigits] = useState(['0', '0', '0', '0', '0', '0']);
//   const [revealedLotteryWinners, setRevealedLotteryWinners] = useState([]);
//   const [lotteryComplete, setLotteryComplete] = useState(false);
//   const [statusText, setStatusText] = useState('');
//   const [hasStarted, setHasStarted] = useState(false);
//   const [lotteryWinners, setLotteryWinners] = useState([]);

//   // Fetch live results
//   const { data: results, isLoading: resultsLoading } = useGetLiveResultsQuery(
//     election?.id,
//     { skip: !isOpen || !election?.id }
//   );

//   // 🔍 CRITICAL DEBUG: Log everything
//   useEffect(() => {
//     if (isOpen && election) {
//       console.log('═════════════════════════════════════════════════');
//       console.log('🔍 COMPLETE DEBUG');
//       console.log('═════════════════════════════════════════════════');
//       console.log('📋 Election object:', election);
//       console.log('📋 election.vote_count:', election.vote_count);
//       console.log('📋 election.votes:', election.votes);
//       console.log('📋 election.total_votes:', election.total_votes);
//       console.log('───────────────────────────────────────────────');
//       console.log('📊 Live Results (raw):', results);
//       console.log('📊 results?.data:', results?.data);
//       console.log('📊 results?.totalVotes:', results?.totalVotes);
//       console.log('📊 results?.data?.totalVotes:', results?.data?.totalVotes);
//       console.log('═════════════════════════════════════════════════');
//     }
//   }, [isOpen, election, results]);

//   // ✅ FIXED: Get total votes from MULTIPLE sources
//   const getTotalVotes = () => {
//     // Try all possible locations
//     const voteSources = [
//       results?.data?.totalVotes,
//       results?.totalVotes,
//       results?.data?.total_votes,
//       results?.total_votes,
//       election?.vote_count,
//       election?.votes,
//       election?.total_votes,
//       election?.votes_count,
//     ];

//     for (const source of voteSources) {
//       const votes = parseInt(source);
//       if (!isNaN(votes) && votes > 0) {
//         console.log('✅ Found votes:', votes, 'from source:', source);
//         return votes;
//       }
//     }

//     console.warn('⚠️ No votes found in any source!');
//     return 0;
//   };

//   const totalVotes = getTotalVotes();

//   const apiData = results?.data || results;
//   const questions = apiData?.questions || [];

//   const hasElectionEnded = () => {
//     if (!election?.end_date) return false;
//     const now = new Date();
//     const endDate = new Date(election.end_date);
//     return now >= endDate;
//   };

//   const isElectionEnded = hasElectionEnded();

//   // Calculate election winners from results
//   const getElectionWinners = () => {
//     const winners = [];
    
//     console.log('📊 Calculating winners from questions:', questions);
    
//     questions.forEach((question) => {
//       const options = question.options || [];
//       const questionTotal = options.reduce((sum, o) => sum + (o.vote_count || 0), 0);
      
//       console.log(`   Question: ${question.question_text}`);
//       console.log(`   Total votes for this question: ${questionTotal}`);
//       console.log(`   Options:`, options.map(o => `${o.option_text}: ${o.vote_count}`));
      
//       if (questionTotal > 0) {
//         const sortedOptions = [...options].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
//         const topOption = sortedOptions[0];
//         const percentage = ((topOption.vote_count || 0) / questionTotal * 100).toFixed(1);
        
//         winners.push({
//           question: question.question_text,
//           winner: topOption.option_text,
//           votes: topOption.vote_count || 0,
//           percentage: percentage,
//           totalVotes: questionTotal
//         });
//       }
//     });
    
//     console.log('🏆 Final winners:', winners);
//     return winners;
//   };

//   const electionWinners = getElectionWinners();
//   const hasVotes = totalVotes > 0;
//   const hasElectionWinners = electionWinners.length > 0;

//   console.log('═════════════════════════════════════════════════');
//   console.log('✅ FINAL CHECKS:');
//   console.log('   - totalVotes:', totalVotes);
//   console.log('   - hasVotes:', hasVotes);
//   console.log('   - hasElectionWinners:', hasElectionWinners);
//   console.log('   - electionWinners:', electionWinners);
//   console.log('═════════════════════════════════════════════════');

//   // Load lottery winners
//   useEffect(() => {
//     if (!isOpen || !election) return;

//     let winnersArray = election.lottery_winners || 
//                       election.lottery_results?.winners || 
//                       election.winners ||
//                       election.gamification_features?.lottery_winners;

//     if (winnersArray && Array.isArray(winnersArray) && winnersArray.length > 0) {
//       const formattedWinners = winnersArray.map((winner, index) => ({
//         rank: winner.rank || (index + 1),
//         ballNumber: String(winner.ballNumber || winner.ball_number || winner.ballot_number || '000000').padStart(6, '0'),
//         name: winner.userName || winner.user_name || winner.name || `Lucky Voter ${index + 1}`,
//         userId: winner.userId || winner.user_id || winner.id,
//         prizeAmount: winner.prizeAmount || winner.prize_amount || winner.amount || '0.00'
//       }));

//       console.log('✅ Lottery winners loaded:', formattedWinners);
//       setLotteryWinners(formattedWinners);
//     } else {
//       const winnerCount = election.lottery_config?.winner_count || 3;
//       const mockWinners = [];
      
//       for (let i = 0; i < winnerCount; i++) {
//         mockWinners.push({
//           rank: i + 1,
//           ballNumber: String(Math.floor(100000 + Math.random() * 900000)).padStart(6, '0'),
//           userId: `demo_${i + 1}`,
//           name: `Lucky Voter ${i + 1}`,
//           prizeAmount: '100.00'
//         });
//       }

//       console.log('🎲 Mock lottery winners:', mockWinners);
//       setLotteryWinners(mockWinners);
//     }
//   }, [isOpen, election]);

//   const getOrdinal = (n) => {
//     const s = ['th', 'st', 'nd', 'rd'];
//     const v = n % 100;
//     return n + (s[(v - 20) % 10] || s[v] || s[0]);
//   };

//   const revealSingleWinner = async (winner, winnerIndex) => {
//     const SPIN_DURATION = 1500;
//     const DIGIT_FALL_DELAY = 500;
    
//     setStatusText(`🎰 Revealing ${getOrdinal(winnerIndex + 1)} Lucky Voter...`);
    
//     setDigitFalling([false, false, false, false, false, false]);
//     setFinalDigits(['0', '0', '0', '0', '0', '0']);
//     setDigitSpinning([true, true, true, true, true, true]);
    
//     await new Promise(resolve => setTimeout(resolve, SPIN_DURATION));
    
//     const winnerDigits = winner.ballNumber.split('');
//     setFinalDigits(winnerDigits);
    
//     for (let i = 0; i < 6; i++) {
//       setDigitSpinning(prev => { const updated = [...prev]; updated[i] = false; return updated; });
//       setDigitFalling(prev => { const updated = [...prev]; updated[i] = true; return updated; });
//       await new Promise(resolve => setTimeout(resolve, DIGIT_FALL_DELAY));
//       setDisplayDigits(prev => { const updated = [...prev]; updated[i] = winnerDigits[i]; return updated; });
//     }
    
//     await new Promise(resolve => setTimeout(resolve, 300));
//     setDigitFalling([false, false, false, false, false, false]);
//     setStatusText(`🏆 ${getOrdinal(winnerIndex + 1)} Lucky Voter: ${winner.ballNumber}`);
    
//     return winner;
//   };

//   const runLotteryReveal = async () => {
//     if (lotteryWinners.length === 0) {
//       toast.error('No lottery winners available');
//       return;
//     }

//     console.log('🎬 Auto-starting lottery reveal');

//     setIsRunning(true);
//     setLotteryComplete(false);
//     setRevealedLotteryWinners([]);
//     setDisplayDigits(['0', '0', '0', '0', '0', '0']);
//     setDigitSpinning([false, false, false, false, false, false]);
//     setDigitFalling([false, false, false, false, false, false]);
    
//     setStatusText(`🎲 Starting lottery with ${lotteryWinners.length} lucky voter(s)...`);
//     await new Promise(resolve => setTimeout(resolve, 1500));
    
//     for (let i = 0; i < lotteryWinners.length; i++) {
//       const winner = await revealSingleWinner(lotteryWinners[i], i);
//       setRevealedLotteryWinners(prev => [...prev, winner]);
      
//       if (i < lotteryWinners.length - 1) {
//         setStatusText(`✅ ${getOrdinal(i + 1)} winner revealed! Next in 2 seconds...`);
//         await new Promise(resolve => setTimeout(resolve, 2000));
//       }
//     }
    
//     setStatusText(`🎉 All ${lotteryWinners.length} lucky voter(s) revealed!`);
//     setLotteryComplete(true);
//     setIsRunning(false);
//   };

//   // AUTO-START when ready
//   useEffect(() => {
//     if (isOpen && !hasStarted && !resultsLoading && isElectionEnded && hasVotes && lotteryWinners.length > 0) {
//       console.log('⏱️ Auto-starting reveal sequence');
//       setHasStarted(true);
//       setTimeout(() => runLotteryReveal(), 2000);
//     }
//   }, [isOpen, hasStarted, resultsLoading, isElectionEnded, hasVotes, lotteryWinners]);

//   useEffect(() => {
//     if (!isOpen) {
//       setHasStarted(false);
//       setRevealedLotteryWinners([]);
//       setLotteryComplete(false);
//       setIsRunning(false);
//       setStatusText('');
//     }
//   }, [isOpen]);

//   if (!isOpen) return null;

//   // Loading state
//   if (resultsLoading) {
//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
//         <div className="bg-white rounded-xl p-8">
//           <Loader className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
//           <p className="text-gray-700 font-semibold">Loading election results...</p>
//         </div>
//       </div>
//     );
//   }

//   // Election not ended
//   if (!isElectionEnded) {
//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
//         <div className="relative w-full max-w-2xl rounded-2xl shadow-2xl" style={{ background: 'linear-gradient(180deg, #1f1f1f 0%, #0a0a0a 100%)', border: '4px solid #d4a418' }}>
//           <div className="flex justify-between items-center px-6 py-4" style={{ background: 'linear-gradient(180deg, #d4a418 0%, #b8860b 100%)' }}>
//             <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
//               <Calendar className="w-7 h-7" />
//               Election Not Ended
//             </h3>
//             <button onClick={onClose} className="p-2 rounded-full hover:bg-black/20 transition">
//               <X className="w-6 h-6 text-gray-900" />
//             </button>
//           </div>
//           <div className="p-8 text-center">
//             <AlertCircle className="text-yellow-400 mx-auto mb-4" size={64} />
//             <p className="text-white text-xl font-semibold mb-2">Election Still in Progress</p>
//             <p className="text-gray-400 mb-4">Results will be available after election ends</p>
//             <p className="text-yellow-400 text-sm">End Date: {new Date(election.end_date).toLocaleString()}</p>
//             <button onClick={onClose} className="mt-6 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition">
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // No votes recorded
//   if (!hasVotes || !hasElectionWinners) {
//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
//         <div className="relative w-full max-w-2xl rounded-2xl shadow-2xl" style={{ background: 'linear-gradient(180deg, #1f1f1f 0%, #0a0a0a 100%)', border: '4px solid #d4a418' }}>
//           <div className="flex justify-between items-center px-6 py-4" style={{ background: 'linear-gradient(180deg, #d4a418 0%, #b8860b 100%)' }}>
//             <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
//               <Trophy className="w-7 h-7" />
//               No Election Results
//             </h3>
//             <button onClick={onClose} className="p-2 rounded-full hover:bg-black/20 transition">
//               <X className="w-6 h-6 text-gray-900" />
//             </button>
//           </div>
//           <div className="p-8 text-center">
//             <AlertCircle className="text-gray-500 mx-auto mb-4" size={64} />
//             <p className="text-white text-xl font-semibold mb-2">No Votes Recorded</p>
//             <p className="text-gray-400 mb-4">
//               This election ended with 0 votes. No winners can be determined.
//             </p>
//             <div className="bg-gray-800 rounded-lg p-4 mb-4">
//               <p className="text-gray-400 text-sm">
//                 Total Votes: <span className="text-red-400 font-bold">{totalVotes}</span>
//               </p>
//               <p className="text-gray-400 text-sm mt-1">
//                 Election ended: {new Date(election.end_date).toLocaleString()}
//               </p>
//             </div>
//             <button onClick={onClose} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition">
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // MAIN DISPLAY - Has votes and winners
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
//       <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl" style={{ background: 'linear-gradient(180deg, #1f1f1f 0%, #0a0a0a 100%)', border: '4px solid #d4a418' }}>
//         <div className="flex justify-between items-center px-6 py-4 sticky top-0 z-10" style={{ background: 'linear-gradient(180deg, #d4a418 0%, #b8860b 100%)' }}>
//           <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
//             <Trophy className="w-7 h-7" />
//             🗳️ Election Results
//           </h3>
//           <button onClick={onClose} className="p-2 rounded-full hover:bg-black/20 transition">
//             <X className="w-6 h-6 text-gray-900" />
//           </button>
//         </div>

//         <div className="p-6 space-y-6">
//           <div className="text-center mb-4">
//             <h4 className="text-2xl font-bold text-white mb-2">{election.title}</h4>
//             <p className="text-yellow-400 font-semibold text-xl">Total Votes: {totalVotes}</p>
//             <p className="text-gray-500 text-sm mt-1">Ended: {new Date(election.end_date).toLocaleString()}</p>
//           </div>

//           <div className="space-y-4">
//             <h5 className="text-xl font-bold text-green-400 text-center flex items-center justify-center gap-2">
//               <CheckCircle className="w-6 h-6" />
//               Voting Results
//             </h5>
//             {electionWinners.map((winner, index) => (
//               <div 
//                 key={index}
//                 className="bg-gradient-to-r from-green-900/60 to-green-800/40 border-2 border-green-500 rounded-xl p-6"
//               >
//                 <div className="flex items-center justify-between">
//                   <div className="flex-1">
//                     <p className="text-gray-400 text-sm mb-2 uppercase tracking-wide">{winner.question}</p>
//                     <h6 className="text-3xl font-black text-white flex items-center gap-3">
//                       <CheckCircle className="text-green-400 flex-shrink-0" size={36} />
//                       {winner.winner}
//                     </h6>
//                   </div>
//                   <div className="text-right ml-4">
//                     <p className="text-5xl font-black text-green-400">{winner.percentage}%</p>
//                     <p className="text-gray-400 text-sm mt-1">{winner.votes} of {winner.totalVotes} votes</p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="border-t-2 border-dashed border-yellow-600 my-8"></div>

//           {lotteryWinners.length > 0 && (
//             <div className="space-y-6">
//               <div className="text-center">
//                 <h5 className="text-2xl font-bold text-yellow-400 mb-2 flex items-center justify-center gap-2">
//                   🎰 Lucky Voter Draw
//                 </h5>
//                 <p className="text-gray-400">
//                   Drawing {lotteryWinners.length} lucky voter{lotteryWinners.length !== 1 ? 's' : ''} from {totalVotes} participants
//                 </p>
//               </div>

//               <div className="rounded-xl p-6" style={{ background: '#0a0a0a', boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.8)', border: '3px solid #333' }}>
//                 <div className="flex justify-center items-center gap-3 mb-4">
//                   {displayDigits.map((digit, index) => (
//                     <SpinningDigit
//                       key={`digit-${index}`}
//                       digit={digit}
//                       isSpinning={digitSpinning[index]}
//                       isFalling={digitFalling[index]}
//                       finalDigit={finalDigits[index]}
//                     />
//                   ))}
//                 </div>
                
//                 <div className="text-center">
//                   <p className={`text-xl font-bold ${
//                     lotteryComplete ? 'text-green-400' : 
//                     isRunning ? 'text-purple-400 animate-pulse' : 
//                     'text-gray-400'
//                   }`}>
//                     {statusText || 'Starting lottery draw...'}
//                   </p>
//                 </div>
//               </div>

//               {revealedLotteryWinners.length > 0 && (
//                 <div>
//                   <h6 className="text-yellow-400 font-bold text-xl mb-4 text-center flex items-center justify-center gap-2">
//                     <Trophy className="w-6 h-6" />
//                     Lucky Voters Revealed
//                   </h6>
//                   <div className="space-y-3 max-h-80 overflow-y-auto">
//                     {revealedLotteryWinners.map((winner, index) => (
//                       <div 
//                         key={index}
//                         className="flex items-center justify-between bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl px-6 py-4 border-l-4 border-yellow-400"
//                       >
//                         <div className="flex items-center gap-4">
//                           <span className="text-yellow-400 font-black text-3xl min-w-[70px]">{getOrdinal(index + 1)}</span>
//                           <div>
//                             <p className="text-white font-mono text-2xl font-black tracking-wider">{winner.ballNumber}</p>
//                             <p className="text-gray-400 text-sm mt-1">{winner.name}</p>
//                           </div>
//                         </div>
//                         <div className="text-right">
//                           <p className="text-green-400 font-black text-2xl">${winner.prizeAmount}</p>
//                           <p className="text-gray-500 text-xs uppercase tracking-wide">Prize</p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {lotteryComplete && (
//                 <div className="flex justify-center gap-4 mt-6">
//                   <button
//                     onClick={() => {
//                       setHasStarted(false);
//                       setRevealedLotteryWinners([]);
//                       setLotteryComplete(false);
//                       setStatusText('');
//                       setDisplayDigits(['0', '0', '0', '0', '0', '0']);
//                       setTimeout(() => runLotteryReveal(), 500);
//                     }}
//                     className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition"
//                   >
//                     <RotateCcw className="w-5 h-5" />
//                     Replay Animation
//                   </button>
//                   <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-8 py-3 rounded-xl transition">
//                     Close
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         <div className="px-6 py-4 bg-gray-900 text-center border-t border-gray-800">
//           <p className="text-gray-500 text-sm">Results determined at {new Date(election.end_date).toLocaleString()}</p>
//         </div>
//       </div>
//     </div>
//   );
// }
// // src/components/Dashboard/Tabs/CompleteWinnerReveal.jsx
// // COMPLETE WINNER REVEAL - Shows both Election Results + Lottery Winners
// import React, { useState, useEffect, useRef } from 'react';
// import { X, Trophy, RotateCcw, CheckCircle } from 'lucide-react';
// import { toast } from 'react-toastify';
// import { useGetLiveResultsQuery } from '../../../../redux/api/voting/votingApi';
// //import { useGetLiveResultsQuery } from '../../../redux/api/voting/votingApi';

// // ============================================================================
// // SPINNING DIGIT COMPONENT
// // ============================================================================
// const SpinningDigit = ({ 
//   digit,
//   isSpinning,
//   isFalling,
//   finalDigit
// }) => {
//   const [currentDigit, setCurrentDigit] = useState(digit || '0');
//   const [nextDigit, setNextDigit] = useState('0');
//   const [offsetY, setOffsetY] = useState(0);
//   const animationRef = useRef(null);
//   const isSpinningRef = useRef(isSpinning);
  
//   const digitHeight = 100;
//   const spinSpeed = 35;
  
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
//   }, [isSpinning, isFalling]);

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
//   }, [isFalling, finalDigit]);

//   useEffect(() => {
//     if (!isSpinning && !isFalling) {
//       setOffsetY(0);
//       setCurrentDigit(digit || '0');
//     }
//   }, [isSpinning, isFalling, digit]);

//   return (
//     <div 
//       className="relative overflow-hidden rounded-xl"
//       style={{
//         width: '75px',
//         height: '100px',
//         background: 'linear-gradient(180deg, #7f1d1d 0%, #991b1b 20%, #b91c1c 50%, #991b1b 80%, #7f1d1d 100%)',
//         boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.7), inset 0 -4px 20px rgba(0,0,0,0.5), 0 6px 15px rgba(0,0,0,0.5)',
//         border: '3px solid #1f2937',
//       }}
//     >
//       <div 
//         className="absolute w-full"
//         style={{ transform: `translateY(${offsetY}px)` }}
//       >
//         <div className="flex items-center justify-center" style={{ height: '100px' }}>
//           <span 
//             className="font-black text-white text-7xl"
//             style={{ 
//               fontFamily: 'Impact, "Arial Black", sans-serif',
//               textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
//               fontWeight: 900,
//             }}
//           >
//             {currentDigit}
//           </span>
//         </div>
//         <div className="flex items-center justify-center" style={{ height: '100px' }}>
//           <span 
//             className="font-black text-white text-7xl"
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

// // ============================================================================
// // MAIN COMPONENT - COMPLETE WINNER REVEAL
// // ============================================================================
// export default function CompleteWinnerReveal({
//   isOpen,
//   onClose,
//   election
// }) {
//   // Lottery states
//   const [isRunning, setIsRunning] = useState(false);
//   const [displayDigits, setDisplayDigits] = useState(['0', '0', '0', '0', '0', '0']);
//   const [digitSpinning, setDigitSpinning] = useState([false, false, false, false, false, false]);
//   const [digitFalling, setDigitFalling] = useState([false, false, false, false, false, false]);
//   const [finalDigits, setFinalDigits] = useState(['0', '0', '0', '0', '0', '0']);
//   /*eslint-disable*/
//   const [currentWinnerIndex, setCurrentWinnerIndex] = useState(-1);
//   const [revealedLotteryWinners, setRevealedLotteryWinners] = useState([]);
//   const [lotteryComplete, setLotteryComplete] = useState(false);
//   const [statusText, setStatusText] = useState('');
//   /*eslint-disable*/
//   const [autoStarted, setAutoStarted] = useState(false);
//   const [lotteryWinners, setLotteryWinners] = useState([]);
//   const [phase, setPhase] = useState('loading'); // 'loading' | 'election-results' | 'lottery-reveal' | 'complete'

//   // Fetch election results
//   const { data: results } = useGetLiveResultsQuery(
//     { electionId: election?.id },
//     { 
//       skip: !isOpen || !election?.id,
//     }
//   );

//   const apiData = results?.data?.questions ? results.data : (results?.data || results);
//   const questions = apiData?.questions || [];
//   const totalVotes = apiData?.totalVotes || 0;

//   // Debug logging
//   useEffect(() => {
//     if (isOpen && election) {
//       console.log('═══════════════════════════════════════════════');
//       console.log('🏆 COMPLETE WINNER REVEAL OPENED');
//       console.log('═══════════════════════════════════════════════');
//       console.log('📋 Election:', election);
//       console.log('🗳️  Total Votes:', totalVotes);
//       console.log('📊 Questions:', questions);
//       console.log('🎰 Lottery Winners:', election.lottery_winners);
//       console.log('═══════════════════════════════════════════════');
//     }
//   }, [isOpen, election, totalVotes, questions]);

//   // Load lottery winners
//   useEffect(() => {
//     if (!isOpen || !election) return;

//     let winnersArray = election.lottery_winners || 
//                       election.lottery_results?.winners || 
//                       election.winners || 
//                       election.gamification_features?.lottery_winners;

//     if (winnersArray && Array.isArray(winnersArray) && winnersArray.length > 0) {
//       const formattedWinners = winnersArray.map((winner, index) => ({
//         rank: winner.rank || (index + 1),
//         ballNumber: String(winner.ballNumber || winner.ball_number || winner.ballot_number || '000000').padStart(6, '0'),
//         name: winner.userName || winner.user_name || winner.name || `Lucky Voter ${index + 1}`,
//         userId: winner.userId || winner.user_id || winner.id,
//         prizeAmount: winner.prizeAmount || winner.prize_amount || winner.amount || '0.00'
//       }));

//       console.log('✅ Loaded', formattedWinners.length, 'lottery winners');
//       setLotteryWinners(formattedWinners);
//     } else {
//       // Generate mock lottery winners
//       const winnerCount = election.lottery_config?.winner_count || 3;
//       const mockWinners = [];
      
//       for (let i = 0; i < winnerCount; i++) {
//         mockWinners.push({
//           rank: i + 1,
//           ballNumber: String(Math.floor(100000 + Math.random() * 900000)).padStart(6, '0'),
//           userId: `demo_${i + 1}`,
//           name: `Lucky Voter ${i + 1}`,
//           prizeAmount: '100.00'
//         });
//       }

//       console.log('🎲 Using mock lottery winners:', mockWinners);
//       setLotteryWinners(mockWinners);
//     }

//     // Start with election results phase
//     setPhase('election-results');
//     setStatusText('Showing election results...');
//   }, [isOpen, election]);

//   const getOrdinal = (n) => {
//     const s = ['th', 'st', 'nd', 'rd'];
//     const v = n % 100;
//     return n + (s[(v - 20) % 10] || s[v] || s[0]);
//   };

//   // Calculate election winners from results
//   const getElectionWinners = () => {
//     const winners = [];
//     /*eslint-disable*/
//     questions.forEach((question, qIndex) => {
//       const options = question.options || [];
//       const questionTotal = options.reduce((sum, o) => sum + (o.vote_count || 0), 0);
      
//       if (questionTotal > 0) {
//         // Find option with most votes
//         const sortedOptions = [...options].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
//         const topOption = sortedOptions[0];
//         const percentage = ((topOption.vote_count || 0) / questionTotal * 100).toFixed(1);
        
//         winners.push({
//           question: question.question_text,
//           winner: topOption.option_text,
//           votes: topOption.vote_count || 0,
//           percentage: percentage
//         });
//       }
//     });
    
//     return winners;
//   };

//   const electionWinners = getElectionWinners();

//   // Lottery reveal animation
//   const revealSingleWinner = async (winner, winnerIndex) => {
//     const SPIN_DURATION = 1500;
//     const DIGIT_FALL_DELAY = 500;
    
//     setCurrentWinnerIndex(winnerIndex);
//     setStatusText(`🎰 Revealing ${getOrdinal(winnerIndex + 1)} Lucky Voter...`);
    
//     setDigitFalling([false, false, false, false, false, false]);
//     setFinalDigits(['0', '0', '0', '0', '0', '0']);
//     setDigitSpinning([true, true, true, true, true, true]);
    
//     await new Promise(resolve => setTimeout(resolve, SPIN_DURATION));
    
//     setStatusText(`🎰 Dropping digits...`);
    
//     const winnerDigits = winner.ballNumber.split('');
//     setFinalDigits(winnerDigits);
    
//     for (let i = 0; i < 6; i++) {
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
      
//       await new Promise(resolve => setTimeout(resolve, DIGIT_FALL_DELAY));
      
//       setDisplayDigits(prev => {
//         const updated = [...prev];
//         updated[i] = winnerDigits[i];
//         return updated;
//       });
//     }
    
//     await new Promise(resolve => setTimeout(resolve, 300));
//     setDigitFalling([false, false, false, false, false, false]);
//     setStatusText(`🏆 ${getOrdinal(winnerIndex + 1)} Lucky Voter: ${winner.ballNumber}`);
    
//     return winner;
//   };

//   const runLotteryReveal = async () => {
//     if (lotteryWinners.length === 0) {
//       toast.error('No lottery winners available');
//       return;
//     }

//     console.log('🎬 Starting lottery reveal with', lotteryWinners.length, 'winners');

//     setIsRunning(true);
//     setLotteryComplete(false);
//     setRevealedLotteryWinners([]);
//     setCurrentWinnerIndex(-1);
//     setDisplayDigits(['0', '0', '0', '0', '0', '0']);
//     setDigitSpinning([false, false, false, false, false, false]);
//     setDigitFalling([false, false, false, false, false, false]);
    
//     setStatusText(`🎲 Starting lottery with ${lotteryWinners.length} lucky voter(s)...`);
//     await new Promise(resolve => setTimeout(resolve, 1000));
    
//     // Reveal each winner sequentially
//     for (let i = 0; i < lotteryWinners.length; i++) {
//       const winner = await revealSingleWinner(lotteryWinners[i], i);
//       setRevealedLotteryWinners(prev => [...prev, winner]);
      
//       if (i < lotteryWinners.length - 1) {
//         setStatusText(`✅ ${getOrdinal(i + 1)} winner revealed! Next in 2 seconds...`);
//         await new Promise(resolve => setTimeout(resolve, 2000));
//       }
//     }
    
//     setStatusText(`🎉 All ${lotteryWinners.length} lucky voter(s) revealed!`);
//     setLotteryComplete(true);
//     setIsRunning(false);
//     setCurrentWinnerIndex(-1);
//     setPhase('complete');
//   };

//   // Auto-start lottery reveal after viewing election results
//   const handleStartLottery = () => {
//     setPhase('lottery-reveal');
//     setAutoStarted(true);
//     runLotteryReveal();
//   };

//   useEffect(() => {
//     if (!isOpen) {
//       setPhase('loading');
//       setAutoStarted(false);
//       setRevealedLotteryWinners([]);
//       setLotteryComplete(false);
//       setIsRunning(false);
//     }
//   }, [isOpen]);

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
//       <div 
//         className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
//         style={{
//           background: 'linear-gradient(180deg, #1f1f1f 0%, #0a0a0a 100%)',
//           border: '4px solid #d4a418'
//         }}
//       >
//         {/* Header */}
//         <div 
//           className="flex justify-between items-center px-6 py-4 sticky top-0 z-10"
//           style={{ background: 'linear-gradient(180deg, #d4a418 0%, #b8860b 100%)' }}
//         >
//           <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
//             <Trophy className="w-7 h-7" />
//             {phase === 'election-results' && '🗳️ Election Results'}
//             {phase === 'lottery-reveal' && '🎰 Lottery Drawing'}
//             {phase === 'complete' && '🎉 Complete Results'}
//           </h3>
//           <button
//             onClick={onClose}
//             className="p-2 rounded-full hover:bg-black/20 transition"
//           >
//             <X className="w-6 h-6 text-gray-900" />
//           </button>
//         </div>

//         {/* Content */}
//         <div className="p-6">
//           {/* Phase 1: Election Results */}
//           {phase === 'election-results' && (
//             <div className="space-y-6">
//               <div className="text-center mb-6">
//                 <h4 className="text-2xl font-bold text-white mb-2">🏆 Election Winners</h4>
//                 <p className="text-gray-400">Final voting results for {election.title}</p>
//                 <p className="text-yellow-400 font-semibold mt-2">
//                   Total Votes: {totalVotes}
//                 </p>
//               </div>

//               {/* Show Election Winners */}
//               {electionWinners.length > 0 ? (
//                 <div className="space-y-4 mb-8">
//                   {electionWinners.map((winner, index) => (
//                     <div 
//                       key={index}
//                       className="bg-gradient-to-r from-green-900/50 to-green-800/30 border-2 border-green-500 rounded-xl p-6"
//                     >
//                       <div className="flex items-center justify-between">
//                         <div className="flex-1">
//                           <p className="text-gray-400 text-sm mb-1">{winner.question}</p>
//                           <h5 className="text-2xl font-bold text-white flex items-center gap-3">
//                             <CheckCircle className="text-green-400" size={32} />
//                             {winner.winner}
//                           </h5>
//                         </div>
//                         <div className="text-right">
//                           <p className="text-4xl font-black text-green-400">{winner.percentage}%</p>
//                           <p className="text-gray-400 text-sm">{winner.votes} votes</p>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-12">
//                   <p className="text-gray-400">No votes recorded yet</p>
//                 </div>
//               )}

//               {/* Button to proceed to lottery */}
//               {lotteryWinners.length > 0 && (
//                 <div className="text-center">
//                   <button
//                     onClick={handleStartLottery}
//                     className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition shadow-lg"
//                   >
//                     🎰 Continue to Lottery Draw →
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Phase 2: Lottery Reveal */}
//           {(phase === 'lottery-reveal' || phase === 'complete') && (
//             <div className="space-y-6">
//               <div className="text-center mb-6">
//                 <h4 className="text-2xl font-bold text-yellow-400 mb-2">🎰 Lucky Voter Draw</h4>
//                 <p className="text-gray-400">Drawing {lotteryWinners.length} lucky voter(s)</p>
//               </div>

//               {/* Slot Machine */}
//               <div 
//                 className="rounded-xl p-6 mb-6"
//                 style={{ 
//                   background: '#0a0a0a', 
//                   boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.8)',
//                   border: '3px solid #333'
//                 }}
//               >
//                 <div className="flex justify-center items-center gap-3 mb-4">
//                   {displayDigits.map((digit, index) => (
//                     <SpinningDigit
//                       key={`digit-${index}`}
//                       digit={digit}
//                       isSpinning={digitSpinning[index]}
//                       isFalling={digitFalling[index]}
//                       finalDigit={finalDigits[index]}
//                     />
//                   ))}
//                 </div>
                
//                 <div className="text-center">
//                   <p className={`text-lg font-semibold ${
//                     lotteryComplete ? 'text-green-400' : 
//                     isRunning ? 'text-purple-400 animate-pulse' : 
//                     'text-gray-400'
//                   }`}>
//                     {statusText}
//                   </p>
//                 </div>
//               </div>

//               {/* Revealed Lottery Winners */}
//               {revealedLotteryWinners.length > 0 && (
//                 <div>
//                   <h4 className="text-yellow-400 font-bold text-lg mb-3 text-center">
//                     🏆 Lucky Voters Revealed
//                   </h4>
//                   <div className="space-y-2">
//                     {revealedLotteryWinners.map((winner, index) => (
//                       <div 
//                         key={index}
//                         className="flex items-center justify-between bg-gray-800 rounded-lg px-5 py-3 border-l-4 border-yellow-400"
//                       >
//                         <div className="flex items-center gap-4">
//                           <span className="text-yellow-400 font-bold text-2xl min-w-[60px]">
//                             {getOrdinal(index + 1)}
//                           </span>
//                           <div>
//                             <p className="text-white font-mono text-xl font-bold tracking-wider">
//                               {winner.ballNumber}
//                             </p>
//                             <p className="text-gray-400 text-sm">{winner.name}</p>
//                           </div>
//                         </div>
//                         <div className="text-right">
//                           <p className="text-green-400 font-bold text-lg">${winner.prizeAmount}</p>
//                           <p className="text-gray-500 text-xs">Prize</p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Replay button */}
//               {lotteryComplete && (
//                 <div className="flex justify-center gap-4">
//                   <button
//                     onClick={() => {
//                       setPhase('election-results');
//                       setAutoStarted(false);
//                       setRevealedLotteryWinners([]);
//                       setLotteryComplete(false);
//                       setStatusText('');
//                     }}
//                     className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition"
//                   >
//                     <RotateCcw className="w-5 h-5" />
//                     View Again
//                   </button>
//                   <button
//                     onClick={onClose}
//                     className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-8 py-3 rounded-xl transition"
//                   >
//                     Close
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="px-6 py-4 bg-gray-900 text-center border-t border-gray-800">
//           <p className="text-gray-500 text-sm">
//             Results determined at {new Date(election.end_date).toLocaleString()}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
