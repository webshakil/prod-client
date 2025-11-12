// src/hooks/lottery/useLottery.js
// ✨ Lottery hook
import { useDispatch, useSelector } from 'react-redux';
/*eslint-disable*/
import { 
  setLotteryInfo,
  setMyTicket,
  setWinners,
  setAnimationState,
  setPrizeClaimed,
} from '../../redux/slices/lotteryySlice';
import { 
  useGetLotteryInfoQuery,
  useGetMyLotteryTicketQuery,
  useClaimPrizeMutation,
} from '../../redux/api/lotteryyy/lotteryApi';

export const useLottery = (electionId) => {
  const dispatch = useDispatch();
  const lotteryState = useSelector(state => state.lotteryyy);

  const { 
    data: lotteryData, 
    isLoading: lotteryLoading,
    refetch: refetchLottery,
  } = useGetLotteryInfoQuery(electionId, {
    skip: !electionId,
    pollingInterval: 5000,
  });

  const {
    data: ticketData,
    isLoading: ticketLoading,
    refetch: refetchTicket,
  } = useGetMyLotteryTicketQuery(electionId, {
    skip: !electionId || !lotteryState.lotteryEnabled,
  });

  const [claimPrize, { isLoading: claiming }] = useClaimPrizeMutation();

  const handleClaimPrize = async (winnerId) => {
    try {
      await claimPrize(winnerId).unwrap();
      dispatch(setPrizeClaimed(true));
      refetchLottery();
      return { success: true };
    } catch (error) {
      console.error('Claim prize error:', error);
      return { success: false, error: error.data?.error };
    }
  };

  return {
    ...lotteryState,
    lotteryLoading,
    ticketLoading,
    claiming,
    refetchLottery,
    refetchTicket,
    claimPrize: handleClaimPrize,
  };
};