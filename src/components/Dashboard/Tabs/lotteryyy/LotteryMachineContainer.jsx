// src/components/Dashboard/Tabs/lotteryyy/LotteryMachineContainer.jsx
// ✨ MAIN LOTTERY CONTAINER - ENHANCED WITH ALL ANIMATIONS
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Loader, AlertCircle, Play, Trophy } from 'lucide-react';

// Import lottery components
import ThreeDLotteryMachine from './ThreeDLotteryMachine';
import WinnerAnnouncement from './WinnerAnnouncement';
import LotteryPrizeDisplay from './LotteryPrizeDisplay';
import MyLotteryTicket from './MyLotteryTicket';
import LotteryCountdown from './LotteryCountdown';
import ParticipantCounter from './ParticipantCounter';
import LotteryParticipantsList from './LotteryParticipantsList';

import { useGetLotteryInfoQuery, useGetMyLotteryTicketQuery, useGetLotteryParticipantsQuery, useClaimPrizeMutation } from '../../../../redux/api/lotteryyy/lotteryApi';
import { useDrawLotteryMutation } from '../../../../redux/api/lotteryyy/lotteryDrawApi';
import { setLotteryInfo, setMyTicket, setParticipants, setWinners, setShowWinnerAnnouncement, setAnimationState } from '../../../../redux/slices/lotteryySlice';

export default function LotteryMachineContainer({ 
  electionId,
  userRoles = [],
  /*eslint-disable*/
  showAdminControls = false,
  compact = false, 
}) {
  const dispatch = useDispatch();
  const { id: paramElectionId } = useParams();
  const finalElectionId = electionId || paramElectionId;

  // Redux state
  const {
    lotteryEnabled,
    hasBeenDrawn,
    rewardType,
    totalPrizePool,
    prizeDescription,
    estimatedValue,
    projectedRevenue,
    revenueSharePercentage,
    winnerCount,
    prizeDistribution,
    participantCount,
    myTicket,
    myBallNumber,
    hasTicket,
    winners,
    amIWinner,
    myWinnerRank,
    myPrize,
    prizeClaimed,
    showWinnerAnnouncement,
  } = useSelector(state => state.lotteryyy);

  const [showParticipantsList, setShowParticipantsList] = useState(false);

  // API queries
  const { 
    data: lotteryData, 
    isLoading: lotteryLoading,
    error: lotteryError,
    refetch: refetchLottery,
  } = useGetLotteryInfoQuery(finalElectionId, {
    skip: !finalElectionId,
    pollingInterval: 5000, // Poll every 5 seconds for real-time updates
  });

  const {
    data: myTicketData,
    isLoading: ticketLoading,
    refetch: refetchTicket,
  } = useGetMyLotteryTicketQuery(finalElectionId, {
    skip: !finalElectionId || !lotteryEnabled,
  });

  const {
    data: participantsData,
    isLoading: participantsLoading,
  } = useGetLotteryParticipantsQuery(finalElectionId, {
    skip: !finalElectionId,
    pollingInterval: 3000, // Poll participants every 3 seconds
  });

  // Mutations
  const [drawLottery, { isLoading: drawLoading }] = useDrawLotteryMutation();
  /*eslint-disable*/
  const [claimPrize, { isLoading: claimLoading }] = useClaimPrizeMutation();

  // Set lottery info when data loads
  useEffect(() => {
    if (lotteryData) {
      dispatch(setLotteryInfo(lotteryData));
      
      // Set winners if drawn
      if (lotteryData.winners && lotteryData.winners.length > 0) {
        dispatch(setWinners(lotteryData.winners));
      }
    }
  }, [lotteryData, dispatch]);

  // Set my ticket when data loads
  useEffect(() => {
    if (myTicketData && myTicketData.ticket) {
      dispatch(setMyTicket(myTicketData.ticket));
    }
  }, [myTicketData, dispatch]);

  // Set participants when data loads
  useEffect(() => {
    if (participantsData && participantsData.participants) {
      dispatch(setParticipants(participantsData.participants));
    }
  }, [participantsData, dispatch]);

  //  NEW: Listen for vote events
  useEffect(() => {
    const handleVoteCast = (event) => {
      if (event.detail.electionId === finalElectionId) {
        console.log('🎰 Vote cast detected in LotteryMachineContainer');
        
        // Refetch ticket and lottery data
        setTimeout(() => {
          refetchTicket();
          refetchLottery();
        }, 1000);
      }
    };

    window.addEventListener('vote-cast', handleVoteCast);
    return () => window.removeEventListener('vote-cast', handleVoteCast);
  }, [finalElectionId, refetchTicket, refetchLottery]);

  // ✨ NEW: Listen for election end
  useEffect(() => {
    const handleElectionEnd = async (event) => {
      if (event.detail.electionId === finalElectionId) {
        console.log(' Election ended! Auto-triggering draw...');
        
        // Wait a moment for dramatic effect
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Trigger draw
        handleDrawLottery();
      }
    };

    window.addEventListener('election-ended', handleElectionEnd);
    return () => window.removeEventListener('election-ended', handleElectionEnd);
  }, [finalElectionId]);

  // Handle manual lottery draw (admin only)
  const handleDrawLottery = async () => {
    try {
      const result = await drawLottery(finalElectionId).unwrap();
      
      toast.success('Gamify drawn successfully!');
      
      dispatch(setAnimationState('drawing'));
      dispatch(setWinners(result.winners));
      
      // Show winner announcement after 5 seconds
      setTimeout(() => {
        dispatch(setShowWinnerAnnouncement(true));
      }, 5000);
      
      refetchLottery();
    } catch (error) {
      console.error('Draw lottery error:', error);
      toast.error(error.data?.error || 'Failed to draw lottery');
    }
  };

  // Handle prize claim
  const handleClaimPrize = async () => {
    if (!myTicket || !amIWinner) return;

    const winner = winners.find(w => w.user_id === myTicket.user_id);
    if (!winner) return;

    try {
      await claimPrize(winner.id).unwrap();
      
      toast.success(' Prize claimed successfully! Funds added to your wallet.');
      
      refetchLottery();
      refetchTicket();
    } catch (error) {
      console.error('Claim prize error:', error);
      toast.error(error.data?.error || 'Failed to claim prize');
    }
  };

  // Handle ball extraction callback
  const handleBallExtracted = (winner) => {
    toast.info(` Winner: ${winner.winner_name || 'Anonymous'} - Ball #${winner.ball_number.toString().slice(-4)}`);
  };

  // Handle view in machine
  const handleViewInMachine = () => {
    // Scroll to machine (works for both compact and full view)
    document.getElementById('lottery-machine-3d')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center',
    });
  };

  // Handle share ticket
  const handleShareTicket = () => {
    if (!myTicket) return;

    const shareText = `🎰 I got lottery ticket #${myTicket.ticket_number} with ball number ${myBallNumber}! Wish me luck! 🍀`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Gamify Ticket',
        text: shareText,
      }).catch(err => console.log('Share failed:', err));
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Ticket info copied to clipboard!');
    }
  };

  // Check if user is admin/manager
  const isAdmin = userRoles.some(role => 
    ['admin', 'manager'].includes(role.toLowerCase())
  );

  // ✨ COMPACT MODE (for floating display) - FIXED
  if (compact) {
    if (lotteryLoading || ticketLoading) {
      return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      );
    }

    if (lotteryError || !lotteryEnabled) {
      return (
        <div className="flex items-center justify-center h-full min-h-[400px] p-4">
          <p className="text-white text-sm text-center">
            {lotteryError ? 'Error loading lottery' : 'Gamify not enabled'}
          </p>
        </div>
      );
    }

    return (
      <div className="h-full min-h-[400px] flex flex-col">
        {/* Compact Prize Display */}
        <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white flex-shrink-0">
          <p className="text-xs font-semibold opacity-90">Prize Pool</p>
          <p className="text-2xl font-black">
            ${totalPrizePool?.toLocaleString() || '0'}
          </p>
          <p className="text-xs opacity-75">{participantCount || 0} participants</p>
        </div>

        {/* 3D Machine - ✅ FIXED: Pass actual myBallNumber from Redux */}
        <div className="flex-1 relative min-h-[350px]">
          <ThreeDLotteryMachine
            electionId={finalElectionId}
            participants={participantsData?.participants || []}
            myBallNumber={myBallNumber}
            winners={winners}
            onBallExtracted={handleBallExtracted}
          />
        </div>
      </div>
    );
  }
 
  if (lotteryLoading || ticketLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading lottery...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (lotteryError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-800 font-semibold text-center mb-2">Failed to load lottery</p>
          <p className="text-red-600 text-sm text-center">{lotteryError.data?.error || 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  // Lottery not enabled
  if (!lotteryEnabled) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md text-center">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold mb-2">Gamify Not Enabled</p>
          <p className="text-gray-500 text-sm">
            This election does not have a lottery component.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            🎰 Gamify Machine
          </h1>
          <p className="text-blue-200 text-lg">
            Vote to win amazing prizes!
          </p>
        </div>

        {/* Prize Display */}
        <LotteryPrizeDisplay
          totalPrizePool={totalPrizePool}
          participantCount={participantCount}
          winnerCount={winnerCount}
          rewardType={rewardType}
          prizeDescription={prizeDescription}
          estimatedValue={estimatedValue}
          projectedRevenue={projectedRevenue}
          revenueSharePercentage={revenueSharePercentage}
          prizeDistribution={prizeDistribution}
        />

        {/* My Ticket */}
        {hasTicket && (
          <div className="max-w-md mx-auto">
            <MyLotteryTicket
              ticket={myTicket}
              ballNumber={myBallNumber}
              hasTicket={hasTicket}
              amIWinner={amIWinner}
              myPrize={myPrize}
              myRank={myWinnerRank}
              prizeClaimed={prizeClaimed}
              electionId={finalElectionId}
              onViewInMachine={handleViewInMachine}
              onShare={handleShareTicket}
              onClaimPrize={handleClaimPrize}
            />
          </div>
        )}

        {/* Countdown to Draw */}
        {!hasBeenDrawn && (
          <LotteryCountdown
            electionId={finalElectionId}
          />
        )}

        {/* Live Participant Counter */}
        <ParticipantCounter
          currentCount={participantCount}
          targetCount={participantCount}
          isLive={!hasBeenDrawn}
        />

        {/* 3D Lottery Machine - ✨ ALWAYS VISIBLE */}
        <div id="lottery-machine-3d" className="bg-black bg-opacity-50 rounded-3xl p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            3D Gamify Machine
          </h2>
          <ThreeDLotteryMachine
            electionId={finalElectionId}
            participants={participantsData?.participants || []}
            myBallNumber={myBallNumber}
            winners={winners}
            onBallExtracted={handleBallExtracted}
          />
        </div>

        {/* Admin Controls */}
        {isAdmin && !hasBeenDrawn && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-yellow-900 mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Admin Controls
            </h3>
            
            <div className="flex flex-col md:flex-row gap-4">
              <button
                onClick={handleDrawLottery}
                disabled={drawLoading || participantCount === 0}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {drawLoading ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    Drawing...
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6" />
                    Draw Gamify Now
                  </>
                )}
              </button>

              <button
                onClick={() => setShowParticipantsList(!showParticipantsList)}
                className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition"
              >
                {showParticipantsList ? 'Hide' : 'View'} All Participants ({participantCount})
              </button>
            </div>

            {participantCount === 0 && (
              <p className="text-yellow-700 text-sm mt-4 text-center">
                ⚠️ No participants yet. Draw will be available after users vote.
              </p>
            )}
          </div>
        )}

        {/* Participants List (Admin Only) */}
        {isAdmin && showParticipantsList && (
          <LotteryParticipantsList
            participants={participantsData?.participants || []}
            loading={participantsLoading}
            onClose={() => setShowParticipantsList(false)}
          />
        )}

        {/* Winner Announcement */}
        <WinnerAnnouncement
          isVisible={showWinnerAnnouncement}
          winners={winners}
          amIWinner={amIWinner}
          myPrize={myPrize}
          myRank={myWinnerRank}
          rewardType={rewardType}
          onClose={() => dispatch(setShowWinnerAnnouncement(false))}
          onClaimPrize={handleClaimPrize}
        />

        {/* Info Card */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 text-white">
          <h3 className="text-xl font-bold mb-4">📋 How It Works</h3>
          <ol className="space-y-2 text-sm">
            <li>✅ <strong>Vote in the election</strong> - You automatically receive a lottery ticket</li>
            <li>🎰 <strong>Get your ball number</strong> - Each ticket has a unique ball number</li>
            <li>👀 <strong>Watch the machine</strong> - See your vote transform into a spinning ball</li>
            <li>⏱️ <strong>Wait for draw</strong> - Gamefiy is drawn when the election ends</li>
            <li>🏆 <strong>Check if you won</strong> - Winners are announced with prize amounts</li>
            <li>💰 <strong>Claim your prize</strong> - Prize money is added to your wallet</li>
          </ol>
        </div>

      </div>
    </div>
  );
}
//last workable file
// // src/components/Dashboard/Tabs/lotteryyy/LotteryMachineContainer.jsx
// // ✨ MAIN LOTTERY CONTAINER - ENHANCED WITH ALL ANIMATIONS
// import React, { useEffect, useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { useParams } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { Loader, AlertCircle, Play, Trophy } from 'lucide-react';

// // Import lottery components
// import ThreeDLotteryMachine from './ThreeDLotteryMachine';
// import WinnerAnnouncement from './WinnerAnnouncement';
// import LotteryPrizeDisplay from './LotteryPrizeDisplay';
// import MyLotteryTicket from './MyLotteryTicket';
// import LotteryCountdown from './LotteryCountdown';
// import ParticipantCounter from './ParticipantCounter';
// import LotteryParticipantsList from './LotteryParticipantsList';

// import { useGetLotteryInfoQuery, useGetMyLotteryTicketQuery, useGetLotteryParticipantsQuery, useClaimPrizeMutation } from '../../../../redux/api/lotteryyy/lotteryApi';
// import { useDrawLotteryMutation } from '../../../../redux/api/lotteryyy/lotteryDrawApi';
// import { setLotteryInfo, setMyTicket, setParticipants, setWinners, setShowWinnerAnnouncement, setAnimationState } from '../../../../redux/slices/lotteryySlice';

// export default function LotteryMachineContainer({ 
//   electionId,
//   userRoles = [],
//   showAdminControls = false,
//   compact = false, 
// }) {
//   const dispatch = useDispatch();
//   const { id: paramElectionId } = useParams();
//   const finalElectionId = electionId || paramElectionId;

//   // Redux state
//   const {
//     lotteryEnabled,
//     hasBeenDrawn,
//     rewardType,
//     totalPrizePool,
//     prizeDescription,
//     estimatedValue,
//     projectedRevenue,
//     revenueSharePercentage,
//     winnerCount,
//     prizeDistribution,
//     participantCount,
//     myTicket,
//     myBallNumber,
//     hasTicket,
//     winners,
//     amIWinner,
//     myWinnerRank,
//     myPrize,
//     prizeClaimed,
//     showWinnerAnnouncement,
//   } = useSelector(state => state.lotteryyy);

//   const [showParticipantsList, setShowParticipantsList] = useState(false);

//   // API queries
//   const { 
//     data: lotteryData, 
//     isLoading: lotteryLoading,
//     error: lotteryError,
//     refetch: refetchLottery,
//   } = useGetLotteryInfoQuery(finalElectionId, {
//     skip: !finalElectionId,
//     pollingInterval: 5000, // Poll every 5 seconds for real-time updates
//   });

//   const {
//     data: myTicketData,
//     isLoading: ticketLoading,
//     refetch: refetchTicket,
//   } = useGetMyLotteryTicketQuery(finalElectionId, {
//     skip: !finalElectionId || !lotteryEnabled,
//   });

//   const {
//     data: participantsData,
//     isLoading: participantsLoading,
//   } = useGetLotteryParticipantsQuery(finalElectionId, {
//     skip: !finalElectionId || !showAdminControls,
//   });

//   // Mutations
//   const [drawLottery, { isLoading: drawLoading }] = useDrawLotteryMutation();
//   /*eslint-disable*/
//   const [claimPrize, { isLoading: claimLoading }] = useClaimPrizeMutation();

//   // Set lottery info when data loads
//   useEffect(() => {
//     if (lotteryData) {
//       dispatch(setLotteryInfo(lotteryData));
      
//       // Set winners if drawn
//       if (lotteryData.winners && lotteryData.winners.length > 0) {
//         dispatch(setWinners(lotteryData.winners));
//       }
//     }
//   }, [lotteryData, dispatch]);

//   // Set my ticket when data loads
//   useEffect(() => {
//     if (myTicketData && myTicketData.ticket) {
//       dispatch(setMyTicket(myTicketData.ticket));
//     }
//   }, [myTicketData, dispatch]);

//   // Set participants when data loads
//   useEffect(() => {
//     if (participantsData && participantsData.participants) {
//       dispatch(setParticipants(participantsData.participants));
//     }
//   }, [participantsData, dispatch]);

//   //  NEW: Listen for vote events
//   useEffect(() => {
//     const handleVoteCast = (event) => {
//       if (event.detail.electionId === finalElectionId) {
//         console.log('🎰 Vote cast detected in LotteryMachineContainer');
        
//         // Refetch ticket and lottery data
//         setTimeout(() => {
//           refetchTicket();
//           refetchLottery();
//         }, 1000);
//       }
//     };

//     window.addEventListener('vote-cast', handleVoteCast);
//     return () => window.removeEventListener('vote-cast', handleVoteCast);
//   }, [finalElectionId, refetchTicket, refetchLottery]);

//   // ✨ NEW: Listen for election end
//   useEffect(() => {
//     const handleElectionEnd = async (event) => {
//       if (event.detail.electionId === finalElectionId) {
//         console.log(' Election ended! Auto-triggering draw...');
        
//         // Wait a moment for dramatic effect
//         await new Promise(resolve => setTimeout(resolve, 2000));
        
//         // Trigger draw
//         handleDrawLottery();
//       }
//     };

//     window.addEventListener('election-ended', handleElectionEnd);
//     return () => window.removeEventListener('election-ended', handleElectionEnd);
//   }, [finalElectionId]);

//   // Handle manual lottery draw (admin only)
//   const handleDrawLottery = async () => {
//     try {
//       const result = await drawLottery(finalElectionId).unwrap();
      
//       toast.success('Gamify drawn successfully!');
      
//       dispatch(setAnimationState('drawing'));
//       dispatch(setWinners(result.winners));
      
//       // Show winner announcement after 5 seconds
//       setTimeout(() => {
//         dispatch(setShowWinnerAnnouncement(true));
//       }, 5000);
      
//       refetchLottery();
//     } catch (error) {
//       console.error('Draw lottery error:', error);
//       toast.error(error.data?.error || 'Failed to draw lottery');
//     }
//   };

//   // Handle prize claim
//   const handleClaimPrize = async () => {
//     if (!myTicket || !amIWinner) return;

//     const winner = winners.find(w => w.user_id === myTicket.user_id);
//     if (!winner) return;

//     try {
//       await claimPrize(winner.id).unwrap();
      
//       toast.success(' Prize claimed successfully! Funds added to your wallet.');
      
//       refetchLottery();
//       refetchTicket();
//     } catch (error) {
//       console.error('Claim prize error:', error);
//       toast.error(error.data?.error || 'Failed to claim prize');
//     }
//   };

//   // Handle ball extraction callback
//   const handleBallExtracted = (winner) => {
//     toast.info(` Winner: ${winner.winner_name || 'Anonymous'} - Ball #${winner.ball_number.toString().slice(-4)}`);
//   };

//   // Handle view in machine
//   const handleViewInMachine = () => {
//     // Scroll to machine (works for both compact and full view)
//     document.getElementById('lottery-machine-3d')?.scrollIntoView({ 
//       behavior: 'smooth',
//       block: 'center',
//     });
//   };

//   // Handle share ticket
//   const handleShareTicket = () => {
//     if (!myTicket) return;

//     const shareText = `🎰 I got lottery ticket #${myTicket.ticket_number} with ball number ${myBallNumber}! Wish me luck! 🍀`;
    
//     if (navigator.share) {
//       navigator.share({
//         title: 'My Gamify Ticket',
//         text: shareText,
//       }).catch(err => console.log('Share failed:', err));
//     } else {
//       navigator.clipboard.writeText(shareText);
//       toast.success('Ticket info copied to clipboard!');
//     }
//   };

//   // Check if user is admin/manager
//   const isAdmin = userRoles.some(role => 
//     ['admin', 'manager'].includes(role.toLowerCase())
//   );

//   // ✨ COMPACT MODE (for floating display)
//   // ✨ COMPACT MODE (for floating display) - FIXED
// if (compact) {
//   if (lotteryLoading || ticketLoading) {
//     return (
//       <div className="flex items-center justify-center h-full min-h-[400px]">
//         <Loader className="w-8 h-8 text-blue-600 animate-spin" />
//       </div>
//     );
//   }

//   if (lotteryError || !lotteryEnabled) {
//     return (
//       <div className="flex items-center justify-center h-full min-h-[400px] p-4">
//         <p className="text-white text-sm text-center">
//           {lotteryError ? 'Error loading lottery' : 'Gamify not enabled'}
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="h-full min-h-[400px] flex flex-col">
//       {/* Compact Prize Display */}
//       <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white flex-shrink-0">
//         <p className="text-xs font-semibold opacity-90">Prize Pool</p>
//         <p className="text-2xl font-black">
//           ${totalPrizePool.toLocaleString()}
//         </p>
//         <p className="text-xs opacity-75">{participantCount} participants</p>
//       </div>

//       {/* 3D Machine */}
//       <div className="flex-1 relative min-h-[350px]">
//         <ThreeDLotteryMachine
//           electionId={finalElectionId}
//           participants={participantsData?.participants || []}
//           myBallNumber={myBallNumber}
//           winners={winners}
//           onBallExtracted={handleBallExtracted}
//         />
//       </div>
//     </div>
//   );
// }
 
//   if (lotteryLoading || ticketLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
//           <p className="text-gray-600 font-semibold">Loading lottery...</p>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (lotteryError) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
//           <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
//           <p className="text-red-800 font-semibold text-center mb-2">Failed to load lottery</p>
//           <p className="text-red-600 text-sm text-center">{lotteryError.data?.error || 'Unknown error'}</p>
//         </div>
//       </div>
//     );
//   }

//   // Lottery not enabled
//   if (!lotteryEnabled) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md text-center">
//           <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//           <p className="text-gray-600 font-semibold mb-2">Gamify Not Enabled</p>
//           <p className="text-gray-500 text-sm">
//             This election does not have a lottery component.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 md:p-8">
//       <div className="max-w-7xl mx-auto space-y-8">
        
//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
//             🎰 Gamify Machine
//           </h1>
//           <p className="text-blue-200 text-lg">
//             Vote to win amazing prizes!
//           </p>
//         </div>

//         {/* Prize Display */}
//         <LotteryPrizeDisplay
//           totalPrizePool={totalPrizePool}
//           participantCount={participantCount}
//           winnerCount={winnerCount}
//           rewardType={rewardType}
//           prizeDescription={prizeDescription}
//           estimatedValue={estimatedValue}
//           projectedRevenue={projectedRevenue}
//           revenueSharePercentage={revenueSharePercentage}
//           prizeDistribution={prizeDistribution}
//         />

//         {/* My Ticket */}
//         {hasTicket && (
//           <div className="max-w-md mx-auto">
//             <MyLotteryTicket
//               ticket={myTicket}
//               ballNumber={myBallNumber}
//               hasTicket={hasTicket}
//               amIWinner={amIWinner}
//               myPrize={myPrize}
//               myRank={myWinnerRank}
//               prizeClaimed={prizeClaimed}
//               electionId={finalElectionId}
//               onViewInMachine={handleViewInMachine}
//               onShare={handleShareTicket}
//               onClaimPrize={handleClaimPrize}
//             />
//           </div>
//         )}

//         {/* Countdown to Draw */}
//         {!hasBeenDrawn && (
//           <LotteryCountdown
//             electionId={finalElectionId}
//           />
//         )}

//         {/* Live Participant Counter */}
//         <ParticipantCounter
//           currentCount={participantCount}
//           targetCount={participantCount}
//           isLive={!hasBeenDrawn}
//         />

//         {/* 3D Lottery Machine - ✨ ALWAYS VISIBLE */}
//         <div id="lottery-machine-3d" className="bg-black bg-opacity-50 rounded-3xl p-6 backdrop-blur-sm">
//           <h2 className="text-2xl font-bold text-white mb-4 text-center">
//             3D Gamify Machine
//           </h2>
//           <ThreeDLotteryMachine
//             electionId={finalElectionId}
//             participants={participantsData?.participants || []}
//             myBallNumber={myBallNumber}
//             winners={winners}
//             onBallExtracted={handleBallExtracted}
//           />
//         </div>

//         {/* Admin Controls */}
//         {isAdmin && !hasBeenDrawn && (
//           <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6">
//             <h3 className="text-xl font-bold text-yellow-900 mb-4 flex items-center gap-2">
//               <Trophy className="w-6 h-6" />
//               Admin Controls
//             </h3>
            
//             <div className="flex flex-col md:flex-row gap-4">
//               <button
//                 onClick={handleDrawLottery}
//                 disabled={drawLoading || participantCount === 0}
//                 className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//               >
//                 {drawLoading ? (
//                   <>
//                     <Loader className="w-6 h-6 animate-spin" />
//                     Drawing...
//                   </>
//                 ) : (
//                   <>
//                     <Play className="w-6 h-6" />
//                     Draw Gamify Now
//                   </>
//                 )}
//               </button>

//               <button
//                 onClick={() => setShowParticipantsList(!showParticipantsList)}
//                 className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition"
//               >
//                 {showParticipantsList ? 'Hide' : 'View'} All Participants ({participantCount})
//               </button>
//             </div>

//             {participantCount === 0 && (
//               <p className="text-yellow-700 text-sm mt-4 text-center">
//                 ⚠️ No participants yet. Draw will be available after users vote.
//               </p>
//             )}
//           </div>
//         )}

//         {/* Participants List (Admin Only) */}
//         {isAdmin && showParticipantsList && (
//           <LotteryParticipantsList
//             participants={participantsData?.participants || []}
//             loading={participantsLoading}
//             onClose={() => setShowParticipantsList(false)}
//           />
//         )}

//         {/* Winner Announcement */}
//         <WinnerAnnouncement
//           isVisible={showWinnerAnnouncement}
//           winners={winners}
//           amIWinner={amIWinner}
//           myPrize={myPrize}
//           myRank={myWinnerRank}
//           rewardType={rewardType}
//           onClose={() => dispatch(setShowWinnerAnnouncement(false))}
//           onClaimPrize={handleClaimPrize}
//         />

//         {/* Info Card */}
//         <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 text-white">
//           <h3 className="text-xl font-bold mb-4">📋 How It Works</h3>
//           <ol className="space-y-2 text-sm">
//             <li>✅ <strong>Vote in the election</strong> - You automatically receive a lottery ticket</li>
//             <li>🎰 <strong>Get your ball number</strong> - Each ticket has a unique ball number</li>
//             <li>👀 <strong>Watch the machine</strong> - See your vote transform into a spinning ball</li>
//             <li>⏱️ <strong>Wait for draw</strong> - Gamefiy is drawn when the election ends</li>
//             <li>🏆 <strong>Check if you won</strong> - Winners are announced with prize amounts</li>
//             <li>💰 <strong>Claim your prize</strong> - Prize money is added to your wallet</li>
//           </ol>
//         </div>

//       </div>
//     </div>
//   );
// }