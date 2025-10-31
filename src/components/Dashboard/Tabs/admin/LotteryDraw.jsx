import React, { useState } from 'react';
import { 
  Trophy, 
  Play, 
  Loader, 
  CheckCircle, 
  AlertCircle,
  Users,
  DollarSign,
  Sparkles
} from 'lucide-react';
import { 
  useGetLotteryStatsQuery,
  useGetLotteryWinnersQuery,
  useRunLotteryDrawMutation 
} from '../../../../redux/api/voting/votingApi';
import { toast } from 'react-toastify';

export default function LotteryDrawAdmin({ electionId }) {
  const [showConfirm, setShowConfirm] = useState(false);
  
  const { data: statsData, refetch: refetchStats } = useGetLotteryStatsQuery(electionId);
  const { data: winnersData, refetch: refetchWinners } = useGetLotteryWinnersQuery(electionId);
  const [runDraw, { isLoading: drawing }] = useRunLotteryDrawMutation();

  const stats = statsData?.data || {};
  const winners = winnersData?.data || [];
  const hasDrawn = winners.length > 0;

  const handleRunDraw = async () => {
    try {
      const result = await runDraw(electionId).unwrap();
      
      if (result.success) {
        toast.success('Lottery draw completed successfully!');
        setShowConfirm(false);
        refetchStats();
        refetchWinners();
      }
    } catch (error) {
      console.error('Draw error:', error);
      toast.error(error?.data?.message || 'Failed to run lottery draw');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Lottery Management</h2>
          <p className="text-gray-600">Run and manage lottery draws</p>
        </div>
        {!hasDrawn && (
          <button
            onClick={() => setShowConfirm(true)}
            disabled={drawing || stats.total_tickets === 0}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 font-bold"
          >
            <Play size={20} />
            Run Lottery Draw
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Entries</p>
              <p className="text-3xl font-bold text-gray-800">{stats.total_tickets || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Winner Count</p>
              <p className="text-3xl font-bold text-gray-800">{stats.winner_count || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Trophy className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Prize Pool</p>
              <p className="text-3xl font-bold text-gray-800">
                ${stats.prize_pool?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Status</p>
              <p className="text-lg font-bold text-gray-800">
                {hasDrawn ? 'Completed' : 'Pending'}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              hasDrawn ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              {hasDrawn ? (
                <CheckCircle className="text-green-600" size={24} />
              ) : (
                <AlertCircle className="text-yellow-600" size={24} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Winners List */}
      {hasDrawn && winners.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Trophy className="text-yellow-500" />
              Lottery Winners
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Winner</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ball Number</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Prize</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {winners.map((winner, index) => (
                  <tr key={winner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {index === 0 && <span className="text-2xl">🥇</span>}
                        {index === 1 && <span className="text-2xl">🥈</span>}
                        {index === 2 && <span className="text-2xl">🥉</span>}
                        <span className="font-bold text-gray-800">#{winner.rank}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{winner.user_name}</p>
                        <p className="text-sm text-gray-500">{winner.user_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {winner.ball_number}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-green-600">
                        ${winner.prize_amount?.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {winner.claimed ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          Claimed
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                          Unclaimed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(winner.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Entries Warning */}
      {!hasDrawn && stats.total_tickets === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-yellow-600" size={32} />
            <div>
              <h4 className="font-bold text-yellow-900 mb-1">No Lottery Entries</h4>
              <p className="text-yellow-800 text-sm">
                There are currently no lottery entries for this election. 
                The draw can only be run after voters participate.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-purple-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 text-center mb-2">
                Run Lottery Draw?
              </h3>
              <p className="text-gray-600 text-center mb-6">
                This will randomly select {stats.winner_count} winner(s) from {stats.total_tickets} entries 
                using cryptographically secure random number generation. This action cannot be undone.
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Entries:</span>
                  <span className="font-semibold">{stats.total_tickets}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Winners to Select:</span>
                  <span className="font-semibold">{stats.winner_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prize per Winner:</span>
                  <span className="font-semibold">
                    ${(stats.prize_pool / stats.winner_count).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={drawing}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRunDraw}
                  disabled={drawing}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {drawing ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Drawing...
                    </>
                  ) : (
                    <>
                      <Play size={20} />
                      Run Draw
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}