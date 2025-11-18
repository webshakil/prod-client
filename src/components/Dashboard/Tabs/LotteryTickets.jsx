// src/components/Dashboard/Tabs/LotteryTickets.jsx - BEAUTIFUL MOCK VERSION
import React, { useState } from 'react';
import { 
  Ticket, 
  Trophy, 
  Calendar, 
  DollarSign, 
  Sparkles,
  CheckCircle,
  Clock,
  Gift,
  Star,
  Zap,
  TrendingUp
} from 'lucide-react';
import { toast } from 'react-toastify';

// Mock data for demonstration
const MOCK_TICKETS = [
  {
    id: 1,
    ticket_number: 'TKT-2024-001',
    election_title: '🏛️ Presidential Election 2024',
    ball_number: 42,
    voting_id: 'vote_abc123def456',
    lottery_status: 'drawn',
    is_winner: true,
    prize_amount: 150.00,
    prize_claimed: false,
    winner_id: 1,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 2,
    ticket_number: 'TKT-2024-002',
    election_title: '🎓 School Board Election',
    ball_number: 15,
    voting_id: 'vote_xyz789ghi012',
    lottery_status: 'drawn',
    is_winner: true,
    prize_amount: 75.00,
    prize_claimed: true,
    prize_claimed_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 3,
    ticket_number: 'TKT-2024-003',
    election_title: '🏙️ Mayor Election 2024',
    ball_number: 88,
    voting_id: 'vote_mno345pqr678',
    lottery_status: 'pending',
    is_winner: false,
    prize_amount: null,
    prize_claimed: false,
    created_at: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 4,
    ticket_number: 'TKT-2024-004',
    election_title: '⚖️ Justice of the Peace Election',
    ball_number: 23,
    voting_id: 'vote_stu901vwx234',
    lottery_status: 'drawn',
    is_winner: false,
    prize_amount: null,
    prize_claimed: false,
    created_at: new Date(Date.now() - 518400000).toISOString(),
  },
  {
    id: 5,
    ticket_number: 'TKT-2024-005',
    election_title: '🌳 Environmental Council Vote',
    ball_number: 67,
    voting_id: 'vote_yza567bcd890',
    lottery_status: 'pending',
    is_winner: false,
    prize_amount: null,
    prize_claimed: false,
    created_at: new Date(Date.now() - 21600000).toISOString(),
  },
];

export default function LotteryTicketsTab() {
  const [filter, setFilter] = useState('all');
  const [claiming, setClaiming] = useState(false);

  // Filter tickets
  const filteredTickets = MOCK_TICKETS.filter(ticket => {
    if (filter === 'all') return true;
    if (filter === 'active') return ticket.lottery_status === 'pending';
    if (filter === 'won') return ticket.is_winner;
    if (filter === 'completed') return ticket.lottery_status === 'drawn';
    return true;
  });

  const stats = {
    totalTickets: MOCK_TICKETS.length,
    timesWon: MOCK_TICKETS.filter(t => t.is_winner).length,
    totalWinnings: MOCK_TICKETS.filter(t => t.is_winner).reduce((sum, t) => sum + (t.prize_amount || 0), 0),
    pendingDraws: MOCK_TICKETS.filter(t => t.lottery_status === 'pending').length,
    unclaimedPrizes: MOCK_TICKETS.filter(t => t.is_winner && !t.prize_claimed),
  };
/*eslint-disable*/
  const handleClaimPrize = async (winnerId) => {
    setClaiming(true);
    // Simulate API delay
    setTimeout(() => {
      toast.success('🎉 Prize claimed successfully! Funds will be deposited to your wallet within 24 hours.');
      setClaiming(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Development Mode Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-4 text-white">
        <div className="flex items-center gap-3">
          <Sparkles className="animate-pulse" size={24} />
          <div>
            <p className="font-semibold">✨ Preview Mode - Demo Data</p>
            <p className="text-sm text-blue-100">
              This page displays sample lottery tickets. Real-time data will be available once the backend API is connected.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center md:justify-start gap-3">
          <Ticket className="text-purple-600" size={40} />
          Gamified Election Tickets
        </h1>
        <p className="text-gray-600 text-lg">
          Track your lottery entries and winnings from gamified elections
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tickets */}
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <Ticket size={36} className="opacity-80" />
            <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-blue-100 text-sm font-medium mb-1">Total Tickets</p>
          <p className="text-4xl font-bold">{stats.totalTickets}</p>
        </div>

        {/* Times Won */}
        <div className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 rounded-xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <Trophy size={36} className="opacity-80" />
            <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
              <Star size={16} />
            </div>
          </div>
          <p className="text-green-100 text-sm font-medium mb-1">Times Won</p>
          <p className="text-4xl font-bold">{stats.timesWon}</p>
        </div>

        {/* Total Winnings */}
        <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <DollarSign size={36} className="opacity-80" />
            <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
              <Zap size={16} />
            </div>
          </div>
          <p className="text-purple-100 text-sm font-medium mb-1">Total Winnings</p>
          <p className="text-4xl font-bold">${stats.totalWinnings.toFixed(2)}</p>
        </div>

        {/* Pending Draws */}
        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <Clock size={36} className="opacity-80" />
            <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
              <Sparkles size={16} />
            </div>
          </div>
          <p className="text-orange-100 text-sm font-medium mb-1">Pending Draws</p>
          <p className="text-4xl font-bold">{stats.pendingDraws}</p>
        </div>
      </div>

      {/* Unclaimed Prizes Alert */}
      {stats.unclaimedPrizes.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-xl shadow-2xl p-6 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-20">
            <Gift size={120} />
          </div>
          <div className="relative z-10 flex items-center gap-6">
            <div className="bg-white bg-opacity-30 rounded-full p-4">
              <Gift size={48} className="animate-bounce" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
                🎉 Congratulations! You Have Unclaimed Prizes!
              </h3>
              <p className="text-yellow-100 text-lg">
                You have <strong>{stats.unclaimedPrizes.length}</strong> prize(s) worth{' '}
                <strong className="text-2xl">${stats.unclaimedPrizes.reduce((sum, t) => sum + (t.prize_amount || 0), 0).toFixed(2)}</strong>{' '}
                waiting to be claimed.
              </p>
            </div>
            <Sparkles size={40} className="animate-pulse hidden md:block" />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-5">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
              filter === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Tickets ({MOCK_TICKETS.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
              filter === 'active'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active ({stats.pendingDraws})
          </button>
          <button
            onClick={() => setFilter('won')}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
              filter === 'won'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Won ({stats.timesWon})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
              filter === 'completed'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-5">
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-16 text-center">
            <div className="bg-gradient-to-br from-purple-100 to-blue-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ticket size={64} className="text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Tickets in This Category</h3>
            <p className="text-gray-600 mb-8 text-lg">
              Try changing the filter or participate in more gamified elections!
            </p>
            <button
              onClick={() => setFilter('all')}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-semibold shadow-lg"
            >
              View All Tickets
            </button>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className={`bg-white rounded-xl shadow-xl overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1 ${
                ticket.is_winner ? 'ring-4 ring-yellow-400 ring-offset-2' : ''
              }`}
            >
              {/* Winner Banner */}
              {ticket.is_winner && (
                <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 px-6 py-3 flex items-center justify-center gap-3 text-white font-bold text-lg">
                  <Trophy size={24} className="animate-bounce" />
                  🏆 WINNER! YOU WON THIS LOTTERY! 🏆
                  <Trophy size={24} className="animate-bounce" />
                </div>
              )}

              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
                  {/* Election Info */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {ticket.election_title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                        <Ticket size={16} />
                        <strong>Ticket:</strong> {ticket.ticket_number}
                      </span>
                      <span className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                        <Calendar size={16} />
                        {new Date(ticket.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Prize Amount */}
                  {ticket.is_winner && (
                    <div className="text-center md:text-right bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                      <p className="text-sm text-green-700 font-medium mb-1">💰 Prize Amount</p>
                      <p className="text-4xl font-bold text-green-600">
                        ${ticket.prize_amount?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Lottery Ball Display */}
                <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 rounded-xl p-6 mb-6 border-2 border-purple-200">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                      <p className="text-sm text-purple-700 font-semibold mb-3">🎱 Your Lucky Ball</p>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-2xl border-4 border-white animate-pulse">
                          {ticket.ball_number}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-800 text-lg">Ball #{ticket.ball_number}</p>
                          <p className="text-xs text-gray-600 font-mono">
                            Vote ID: {ticket.voting_id?.slice(0, 12)}...
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600 font-semibold mb-2">Draw Status</p>
                      {ticket.lottery_status === 'pending' && (
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold shadow-md">
                          <Clock size={18} />
                          Pending Draw
                        </span>
                      )}
                      {ticket.lottery_status === 'drawn' && !ticket.is_winner && (
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-bold shadow-md">
                          <CheckCircle size={18} />
                          Draw Complete
                        </span>
                      )}
                      {ticket.lottery_status === 'drawn' && ticket.is_winner && (
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-bold shadow-md">
                          <Trophy size={18} />
                          Winner! 🎉
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {ticket.is_winner && !ticket.prize_claimed && (
                  <button
                    onClick={() => handleClaimPrize(ticket.winner_id)}
                    disabled={claiming}
                    className="w-full px-8 py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {claiming ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Gift size={24} />
                        Claim Your Prize (${ticket.prize_amount?.toFixed(2)})
                        <Sparkles size={24} />
                      </>
                    )}
                  </button>
                )}

                {ticket.is_winner && ticket.prize_claimed && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 text-center">
                    <CheckCircle className="text-green-600 mx-auto mb-3" size={48} />
                    <p className="text-green-800 font-bold text-xl mb-2">✅ Prize Successfully Claimed!</p>
                    <p className="text-sm text-green-700">
                      Claimed on{' '}
                      {new Date(ticket.prize_claimed_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-green-600 mt-2">
                      Funds have been deposited to your wallet 💰
                    </p>
                  </div>
                )}

                {!ticket.is_winner && ticket.lottery_status === 'drawn' && (
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center">
                    <p className="text-gray-600 font-medium">
                      Better luck next time! Keep voting to earn more tickets 🎫
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Call to Action */}
      {filteredTickets.length === 0 && filter === 'all' && (
        <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-2xl p-12 text-white text-center">
          <Ticket size={80} className="mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Start Your Lottery Journey!</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Vote in gamified elections to automatically receive lottery tickets and win amazing prizes!
          </p>
          <button
            onClick={() => (window.location.href = '/dashboard')}
            className="px-8 py-4 bg-white text-purple-600 rounded-xl hover:bg-gray-100 transition font-bold text-lg shadow-xl inline-flex items-center gap-3"
          >
            <Sparkles size={24} />
            Browse Gamified Elections
            <Sparkles size={24} />
          </button>
        </div>
      )}
    </div>
  );
}