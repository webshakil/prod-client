import React, { useState } from 'react';
import { 
  Ticket, 
  Trophy, 
  Calendar, 
  DollarSign, 
  Loader,
  Sparkles,
  CheckCircle,
  Clock,
  Gift
} from 'lucide-react';
import { 
  useGetMyTicketsQuery, 
  /*eslint-disable*/
  useGetLotteryWinnersQuery,
  useClaimPrizeMutation 
} from '../../../redux/api/voting/votingApi';
import { toast } from 'react-toastify';

export default function LotteryTicketsTab() {
  const [filter, setFilter] = useState('all'); // all, active, won, completed
  const { data: ticketsData, isLoading: ticketsLoading } = useGetMyTicketsQuery({ status: filter !== 'all' ? filter : undefined });
  const [claimPrize, { isLoading: claiming }] = useClaimPrizeMutation();

  const tickets = ticketsData?.data || [];
  const myWins = tickets.filter(t => t.is_winner && !t.prize_claimed);
  const totalWinnings = myWins.reduce((sum, t) => sum + (t.prize_amount || 0), 0);

  const handleClaimPrize = async (winnerId) => {
    try {
      const result = await claimPrize(winnerId).unwrap();
      if (result.success) {
        toast.success('Prize claimed successfully!');
      }
    } catch (error) {
      console.error('Claim error:', error);
      toast.error(error?.data?.message || 'Failed to claim prize');
    }
  };

  if (ticketsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Gamified Election Tickets</h1>
        <p className="text-gray-600">Track your gamified entries and winnings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <Ticket className="mb-3" size={32} />
          <p className="text-blue-100 text-sm mb-1">Total Tickets</p>
          <p className="text-3xl font-bold">{tickets.length}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <Trophy className="mb-3" size={32} />
          <p className="text-green-100 text-sm mb-1">Times Won</p>
          <p className="text-3xl font-bold">{tickets.filter(t => t.is_winner).length}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <DollarSign className="mb-3" size={32} />
          <p className="text-purple-100 text-sm mb-1">Total Winnings</p>
          <p className="text-3xl font-bold">${totalWinnings.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <Clock className="mb-3" size={32} />
          <p className="text-orange-100 text-sm mb-1">Pending Draws</p>
          <p className="text-3xl font-bold">
            {tickets.filter(t => t.lottery_status === 'pending').length}
          </p>
        </div>
      </div>

      {/* Unclaimed Prizes Alert */}
      {myWins.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center gap-4">
            <Gift size={48} className="animate-bounce" />
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-1">🎉 You Have Unclaimed Prizes!</h3>
              <p className="text-yellow-100">
                You have {myWins.length} prize(s) worth ${totalWinnings.toFixed(2)} waiting to be claimed.
              </p>
            </div>
            <Sparkles size={32} className="animate-pulse" />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Tickets ({tickets.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('won')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'won'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Won
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Ticket size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Lottery Tickets Yet</h3>
            <p className="text-gray-600 mb-6">
              Vote in lotterized elections to automatically receive lottery tickets!
            </p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Browse Elections
            </button>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              className={`bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-[1.02] ${
                ticket.is_winner ? 'ring-4 ring-yellow-400' : ''
              }`}
            >
              {ticket.is_winner && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-6 py-2 flex items-center gap-2 text-white font-bold">
                  <Trophy size={20} />
                  WINNER!
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {ticket.election_title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Ticket size={16} />
                        Ticket #{ticket.ticket_number}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {ticket.is_winner && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Prize Amount</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${ticket.prize_amount?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Lottery Ball Display */}
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-700 mb-1">Your Lucky Ball</p>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                          {ticket.ball_number}
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Ball #{ticket.ball_number}</p>
                          <p className="text-xs">Voting ID: {ticket.voting_id?.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Draw Status</p>
                      {ticket.lottery_status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                          <Clock size={16} />
                          Pending
                        </span>
                      )}
                      {ticket.lottery_status === 'drawn' && !ticket.is_winner && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
                          <CheckCircle size={16} />
                          Not Won
                        </span>
                      )}
                      {ticket.lottery_status === 'drawn' && ticket.is_winner && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                          <Trophy size={16} />
                          Winner!
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Winner Actions */}
                {ticket.is_winner && !ticket.prize_claimed && (
                  <button
                    onClick={() => handleClaimPrize(ticket.winner_id)}
                    disabled={claiming}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {claiming ? (
                      <>
                        <Loader className="animate-spin" size={20} />
                        Claiming...
                      </>
                    ) : (
                      <>
                        <Gift size={20} />
                        Claim Prize (${ticket.prize_amount?.toFixed(2)})
                      </>
                    )}
                  </button>
                )}

                {ticket.is_winner && ticket.prize_claimed && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle className="text-green-600 mx-auto mb-2" size={32} />
                    <p className="text-green-800 font-semibold">Prize Claimed!</p>
                    <p className="text-sm text-green-600">
                      Claimed on {new Date(ticket.prize_claimed_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}