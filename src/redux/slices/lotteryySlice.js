import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Existing lottery data
  lotteryEnabled: false,
  hasBeenDrawn: false,
  rewardType: 'monetary',
  totalPrizePool: 0,
  prizeDescription: '',
  estimatedValue: 0,
  projectedRevenue: 0,
  revenueSharePercentage: 0,
  winnerCount: 0,
  prizeDistribution: [],
  participantCount: 0,
  
  // User ticket data
  myTicket: null,
  myBallNumber: null,
  hasTicket: false,
  
  // Winner data
  winners: [],
  amIWinner: false,
  myWinnerRank: null,
  myPrize: null,
  prizeClaimed: false,
  
  // UI state
  showMachine: true, // NOW ALWAYS TRUE for lotterized
  showWinnerAnnouncement: false,
  
  //  ENHANCED ANIMATION STATE
  animationState: 'idle', // 'idle' | 'vote_flying' | 'ball_morphing' | 'ball_spinning' | 'drawing' | 'winner_reveal'
  animationProgress: 0,
  voteAnimationActive: false,
  ballsInMachine: [],
  
  //  NEW: Real-time updates
  lastVoteTime: null,
  machineRotationSpeed: 0.3,
  ballSpinSpeed: 0.5,
};

const lotteryySlice = createSlice({
  name: 'lotteryyy',
  initialState,
  reducers: {
    setLotteryInfo: (state, action) => {
      const data = action.payload;
      state.lotteryEnabled = data.lotteryEnabled || data.lottery_enabled || false;
      state.hasBeenDrawn = data.hasBeenDrawn || data.has_been_drawn || false;
      state.rewardType = data.rewardType || data.reward_type || 'monetary';
      state.totalPrizePool = data.totalPrizePool || data.total_prize_pool || 0;
      state.prizeDescription = data.prizeDescription || data.prize_description || '';
      state.estimatedValue = data.estimatedValue || data.estimated_value || 0;
      state.projectedRevenue = data.projectedRevenue || data.projected_revenue || 0;
      state.revenueSharePercentage = data.revenueSharePercentage || data.revenue_share_percentage || 0;
      state.winnerCount = data.winnerCount || data.winner_count || 0;
      state.prizeDistribution = data.prizeDistribution || data.prize_distribution || [];
      state.participantCount = data.participantCount || data.participant_count || 0;
      
      // ✅ Always show machine if lottery enabled
      if (state.lotteryEnabled) {
        state.showMachine = true;
      }
    },
    
    setMyTicket: (state, action) => {
      const ticket = action.payload;
      state.myTicket = ticket;
      state.myBallNumber = ticket?.ball_number || ticket?.ballNumber || null;
      state.hasTicket = !!ticket;
      state.lastVoteTime = Date.now();
    },
    
    setParticipants: (state, action) => {
      state.participantCount = action.payload.length;
    },
    
    setWinners: (state, action) => {
      state.winners = action.payload;
      
      if (state.myTicket && action.payload.length > 0) {
        const myWinner = action.payload.find(
          w => w.user_id === state.myTicket.user_id
        );
        
        if (myWinner) {
          state.amIWinner = true;
          state.myWinnerRank = myWinner.rank;
          state.myPrize = myWinner.prize_amount;
          state.prizeClaimed = myWinner.claimed || false;
        }
      }
    },
    
    setShowMachine: (state, action) => {
      state.showMachine = action.payload;
    },
    
    setShowWinnerAnnouncement: (state, action) => {
      state.showWinnerAnnouncement = action.payload;
    },
    
    // ✨ ENHANCED ANIMATION ACTIONS
    setAnimationState: (state, action) => {
      state.animationState = action.payload;
    },
    
    setAnimationProgress: (state, action) => {
      state.animationProgress = action.payload;
    },
    
    setVoteAnimationActive: (state, action) => {
      state.voteAnimationActive = action.payload;
    },
    
    addBallToMachine: (state, action) => {
      const { ballNumber, userId } = action.payload;
      if (!state.ballsInMachine.find(b => b.ballNumber === ballNumber)) {
        state.ballsInMachine.push({ ballNumber, userId, timestamp: Date.now() });
      }
    },
    
    setMachineRotationSpeed: (state, action) => {
      state.machineRotationSpeed = action.payload;
    },
    
    setBallSpinSpeed: (state, action) => {
      state.ballSpinSpeed = action.payload;
    },
    
    resetAnimation: (state) => {
      state.animationState = 'idle';
      state.animationProgress = 0;
      state.voteAnimationActive = false;
    },
  },
});

export const {
  setLotteryInfo,
  setMyTicket,
  setParticipants,
  setWinners,
  setShowMachine,
  setShowWinnerAnnouncement,
  setAnimationState,
  setAnimationProgress,
  setVoteAnimationActive,
  addBallToMachine,
  setMachineRotationSpeed,
  setBallSpinSpeed,
  resetAnimation,
} = lotteryySlice.actions;

export default lotteryySlice.reducer;
// // src/redux/slices/lotteryySlice.js
// // ✨ Enhanced lottery state management (3 y's to avoid conflict)
// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   // Current lottery data
//   currentLottery: null,
//   currentElectionId: null,
  
//   // Lottery status
//   lotteryEnabled: false,
//   hasBeenDrawn: false,
  
//   // Prize info
//   rewardType: null, // monetary, non_monetary, projected_revenue
//   totalPrizePool: 0,
//   prizeDescription: '',
//   estimatedValue: 0,
//   projectedRevenue: 0,
//   revenueSharePercentage: 0,
//   winnerCount: 0,
//   prizeDistribution: [],
  
//   // Participant data
//   participantCount: 0,
//   participants: [],
  
//   // User's ticket
//   myTicket: null,
//   myBallNumber: null,
//   hasTicket: false,
  
//   // Winners
//   winners: [],
//   amIWinner: false,
//   myWinnerRank: null,
//   myPrize: null,
//   prizeClaimed: false,
  
//   // Animation state
//   animationState: 'idle', // idle, vote_flying, ball_spinning, drawing, winner_reveal
//   animationProgress: 0,
  
//   // 3D Machine state
//   machineRotation: 0,
//   ballsVisible: [],
//   selectedBallNumber: null,
  
//   // Draw countdown
//   drawScheduled: false,
//   drawTime: null,
//   timeUntilDraw: null,
  
//   // UI state
//   loading: false,
//   error: null,
//   showMachine: false,
//   showWinnerAnnouncement: false,
  
//   // Real-time updates
//   lastUpdate: null,
// };

// const lotteryySlice = createSlice({
//   name: 'lotteryyy',
//   initialState,
//   reducers: {
//     // Set lottery info
//     setLotteryInfo: (state, action) => {
//       const lottery = action.payload;
//       state.currentLottery = lottery;
//       state.lotteryEnabled = lottery.lotteryEnabled;
//       state.hasBeenDrawn = lottery.hasBeenDrawn;
//       state.rewardType = lottery.rewardType;
//       state.totalPrizePool = lottery.totalPrizePool;
//       state.prizeDescription = lottery.prizeDescription;
//       state.estimatedValue = lottery.estimatedValue;
//       state.projectedRevenue = lottery.projectedRevenue;
//       state.revenueSharePercentage = lottery.revenueSharePercentage;
//       state.winnerCount = lottery.winnerCount;
//       state.prizeDistribution = lottery.prizeDistribution;
//       state.participantCount = lottery.participantCount;
//       state.winners = lottery.winners || [];
//       state.lastUpdate = new Date().toISOString();
//     },

//     // Set current election
//     setCurrentElection: (state, action) => {
//       state.currentElectionId = action.payload;
//     },

//     // Set my ticket
//     setMyTicket: (state, action) => {
//       state.myTicket = action.payload;
//       state.myBallNumber = action.payload.ballNumber;
//       state.hasTicket = true;
//     },

//     // Set participants
//     setParticipants: (state, action) => {
//       state.participants = action.payload;
//       state.participantCount = action.payload.length;
//     },

//     // Increment participant count (real-time)
//     incrementParticipantCount: (state) => {
//       state.participantCount += 1;
//     },

//     // Update prize pool (real-time)
//     updatePrizePool: (state, action) => {
//       state.totalPrizePool = action.payload;
//     },

//     // Set winners
//     setWinners: (state, action) => {
//       state.winners = action.payload;
//       state.hasBeenDrawn = action.payload.length > 0;
      
//       // Check if current user is a winner
//       if (state.myTicket) {
//         const myWinner = action.payload.find(w => w.user_id === state.myTicket.user_id);
//         if (myWinner) {
//           state.amIWinner = true;
//           state.myWinnerRank = myWinner.rank;
//           state.myPrize = myWinner.prize_amount || myWinner.prize_description;
//           state.prizeClaimed = myWinner.claimed;
//         }
//       }
//     },

//     // Set animation state
//     setAnimationState: (state, action) => {
//       state.animationState = action.payload;
//     },

//     // Set animation progress
//     setAnimationProgress: (state, action) => {
//       state.animationProgress = action.payload;
//     },

//     // Set machine rotation
//     setMachineRotation: (state, action) => {
//       state.machineRotation = action.payload;
//     },

//     // Add ball to machine
//     addBallToMachine: (state, action) => {
//       state.ballsVisible.push(action.payload);
//     },

//     // Set selected ball (winner)
//     setSelectedBall: (state, action) => {
//       state.selectedBallNumber = action.payload;
//     },

//     // Show/hide machine
//     setShowMachine: (state, action) => {
//       state.showMachine = action.payload;
//     },

//     // Show/hide winner announcement
//     setShowWinnerAnnouncement: (state, action) => {
//       state.showWinnerAnnouncement = action.payload;
//     },

//     // Set prize claimed
//     setPrizeClaimed: (state, action) => {
//       state.prizeClaimed = action.payload;
//     },

//     // Set draw countdown
//     setDrawCountdown: (state, action) => {
//       state.drawScheduled = true;
//       state.drawTime = action.payload.drawTime;
//       state.timeUntilDraw = action.payload.timeUntilDraw;
//     },

//     // Update countdown
//     updateCountdown: (state, action) => {
//       state.timeUntilDraw = action.payload;
//     },

//     // Set loading
//     setLoading: (state, action) => {
//       state.loading = action.payload;
//     },

//     // Set error
//     setError: (state, action) => {
//       state.error = action.payload;
//       state.loading = false;
//     },

//     // Clear error
//     clearError: (state) => {
//       state.error = null;
//     },

//     // Reset lottery state
//     /*eslint-disable*/
//     resetLotteryState: (state) => {
//       return { ...initialState };
//     },

//     // Reset animation
//     resetAnimation: (state) => {
//       state.animationState = 'idle';
//       state.animationProgress = 0;
//       state.selectedBallNumber = null;
//     },
//   },
// });

// export const {
//   setLotteryInfo,
//   setCurrentElection,
//   setMyTicket,
//   setParticipants,
//   incrementParticipantCount,
//   updatePrizePool,
//   setWinners,
//   setAnimationState,
//   setAnimationProgress,
//   setMachineRotation,
//   addBallToMachine,
//   setSelectedBall,
//   setShowMachine,
//   setShowWinnerAnnouncement,
//   setPrizeClaimed,
//   setDrawCountdown,
//   updateCountdown,
//   setLoading,
//   setError,
//   clearError,
//   resetLotteryState,
//   resetAnimation,
// } = lotteryySlice.actions;

// export default lotteryySlice.reducer;