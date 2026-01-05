// src/components/Dashboard/Tabs/lotteryyy/LotteryMachineContainer.jsx
import React from 'react';
import LotterySlotMachine from './LotterySlotMachine';
import { useGetLotteryStatusQuery } from '../../../../redux/api/lotteryyy/lotteryApi';
/*eslint-disable*/
export default function SlotLotteryMachineContainer({ electionId, userRoles = [] }) {
  const { data: lotteryStatus, isLoading } = useGetLotteryStatusQuery(electionId, {
    pollingInterval: 5000, // Poll every 5 seconds
    skip: !electionId,
  });

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-2xl p-8 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-400">Loading lottery machine...</p>
      </div>
    );
  }

  return (
    <LotterySlotMachine
      electionId={electionId}
      electionEndDate={lotteryStatus?.electionEndDate || lotteryStatus?.endDate}
      luckyVotersCount={lotteryStatus?.numberOfWinners || lotteryStatus?.luckyVotersCount || 1}
      totalVoters={lotteryStatus?.totalEntries || lotteryStatus?.totalVoters || 0}
      isElectionEnded={lotteryStatus?.isEnded || lotteryStatus?.status === 'completed'}
      winners={lotteryStatus?.winners || []}
      isActive={lotteryStatus?.isActive !== false}
    />
  );
}