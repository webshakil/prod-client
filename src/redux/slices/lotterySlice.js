import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  myTickets: [],
  lotteryStats: {},
  winners: [],
  hasTicket: false,
  isWinner: false,
  prizeAmount: 0,
  prizeClaimed: false,
};

const lotterySlice = createSlice({
  name: 'lottery',
  initialState,
  reducers: {
    setMyTickets: (state, action) => {
      state.myTickets = action.payload;
      state.hasTicket = action.payload.length > 0;
    },
    setLotteryStats: (state, action) => {
      state.lotteryStats[action.payload.electionId] = action.payload.stats;
    },
    setWinners: (state, action) => {
      state.winners = action.payload;
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const userId = userData.user_id;
      const myWin = action.payload.find(w => w.user_id === userId);
      state.isWinner = !!myWin;
      state.prizeAmount = myWin?.prize_amount || 0;
      state.prizeClaimed = myWin?.claimed || false;
    },
    addTicket: (state, action) => {
      state.myTickets.push(action.payload);
      state.hasTicket = true;
    },
    setPrizeClaimed: (state, action) => {
      state.prizeClaimed = action.payload;
    },
    /*eslint-disable*/
    resetLottery: (state) => {
      return initialState;
    },
  },
});

export const {
  setMyTickets,
  setLotteryStats,
  setWinners,
  addTicket,
  setPrizeClaimed,
  resetLottery,
} = lotterySlice.actions;

export default lotterySlice.reducer;