// src/components/Dashboard/Tabs/LotteryTickets.jsx
// ✅ FULLY INTEGRATED WITH REAL API
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
  TrendingUp,
  AlertCircle,
  XCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  Hourglass
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { 
  useGetMyWinningsQuery, 
  useClaimPrizeMutation 
} from '../../../redux/api/lotteryyy/lotteryApi';

// Claim Prize Modal Component
const ClaimPrizeModal = ({ isOpen, onClose, winner, onConfirm, isLoading }) => {
  if (!isOpen || !winner) return null;

  const getThresholdInfo = () => {
    const amount = winner.prize_amount || 0;
    if (amount < 5000) {
      return {
        type: 'auto',
        title: '⚡ Instant Disbursement',
        description: 'This amount will be automatically credited to your wallet!',
        color: 'green'
      };
    } else if (amount < 10000) {
      return {
        type: 'admin',
        title: '👤 Admin Review Required',
        description: 'Amounts between $5,000 - $10,000 require admin approval. Usually processed within 24-48 hours.',
        color: 'yellow'
      };
    } else {
      return {
        type: 'manager',
        title: '👔 Manager Approval Required',
        description: 'Large amounts over $10,000 require manager approval. Usually processed within 2-3 business days.',
        color: 'orange'
      };
    }
  };

  const thresholdInfo = getThresholdInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white text-center">
          <Gift size={48} className="mx-auto mb-3 animate-bounce" />
          <h2 className="text-2xl font-bold">Claim Your Prize!</h2>
          <p className="text-green-100 mt-1">{winner.election_title}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Prize Amount */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center border-2 border-green-200">
            <p className="text-sm text-green-700 font-medium">Prize Amount</p>
            <p className="text-4xl font-bold text-green-600">
              ${(winner.prize_amount || 0).toFixed(2)}
            </p>
            <p className="text-xs text-green-600 mt-1">Rank #{winner.rank}</p>
          </div>

          {/* Threshold Info */}
          <div className={`rounded-xl p-4 border-2 ${
            thresholdInfo.color === 'green' ? 'bg-green-50 border-green-200' :
            thresholdInfo.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
            'bg-orange-50 border-orange-200'
          }`}>
            <p className={`font-semibold ${
              thresholdInfo.color === 'green' ? 'text-green-800' :
              thresholdInfo.color === 'yellow' ? 'text-yellow-800' :
              'text-orange-800'
            }`}>
              {thresholdInfo.title}
            </p>
            <p className={`text-sm mt-1 ${
              thresholdInfo.color === 'green' ? 'text-green-700' :
              thresholdInfo.color === 'yellow' ? 'text-yellow-700' :
              'text-orange-700'
            }`}>
              {thresholdInfo.description}
            </p>
          </div>

          {/* Ticket Info */}
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Ticket:</span>
              <span className="font-mono">{winner.ticket_number}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Ball Number:</span>
              <span className="font-bold text-purple-600">#{winner.ball_number}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Gift size={20} />
                Claim Prize
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Disbursement Status Badge Component
const DisbursementStatusBadge = ({ status }) => {
  const statusConfig = {
    pending_claim: { 
      label: 'Ready to Claim', 
      icon: Gift, 
      bg: 'bg-blue-100', 
      text: 'text-blue-800',
      animate: true 
    },
    pending_approval: { 
      label: 'Pending Admin Approval', 
      icon: Hourglass, 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-800' 
    },
    pending_senior_approval: { 
      label: 'Pending Manager Approval', 
      icon: Clock, 
      bg: 'bg-orange-100', 
      text: 'text-orange-800' 
    },
    disbursed: { 
      label: 'Disbursed ✓', 
      icon: CheckCircle, 
      bg: 'bg-green-100', 
      text: 'text-green-800' 
    },
    rejected: { 
      label: 'Rejected', 
      icon: XCircle, 
      bg: 'bg-red-100', 
      text: 'text-red-800' 
    },
  };

  const config = statusConfig[status] || statusConfig.pending_claim;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${config.bg} ${config.text} ${config.animate ? 'animate-pulse' : ''}`}>
      <Icon size={16} />
      {config.label}
    </span>
  );
};

export default function LotteryTicketsTab() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [claimModal, setClaimModal] = useState({ isOpen: false, winner: null });

  // ✅ Real API calls
  const { 
    data: winningsData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useGetMyWinningsQuery();

  const [claimPrize, { isLoading: isClaiming }] = useClaimPrizeMutation();

  // Extract data
  const winnings = winningsData?.winnings || [];
  const summary = winningsData?.summary || {
    total_wins: 0,
    total_won: 0,
    claimed: 0,
    disbursed: 0,
    pending: 0,
    unclaimed: 0,
    rejected: 0,
  };

  // Filter winnings
  const filteredWinnings = winnings.filter(win => {
    if (filter === 'all') return true;
    if (filter === 'unclaimed') return !win.claimed;
    if (filter === 'pending') return ['pending_approval', 'pending_senior_approval'].includes(win.disbursement_status);
    if (filter === 'disbursed') return win.disbursement_status === 'disbursed';
    if (filter === 'rejected') return win.disbursement_status === 'rejected';
    return true;
  });

  // Calculate stats
  const stats = {
    totalWins: summary.total_wins || winnings.length,
    totalWon: summary.total_won || winnings.reduce((sum, w) => sum + (w.prize_amount || 0), 0),
    disbursed: summary.disbursed || winnings.filter(w => w.disbursement_status === 'disbursed').length,
    pending: summary.pending || winnings.filter(w => ['pending_approval', 'pending_senior_approval'].includes(w.disbursement_status)).length,
    unclaimed: summary.unclaimed || winnings.filter(w => !w.claimed).length,
  };

  const unclaimedWinnings = winnings.filter(w => !w.claimed || w.disbursement_status === 'pending_claim');
  const unclaimedAmount = unclaimedWinnings.reduce((sum, w) => sum + (w.prize_amount || 0), 0);

  // Handle claim prize
  const handleClaimPrize = async () => {
    if (!claimModal.winner) return;

    try {
      const result = await claimPrize(claimModal.winner.winner_id).unwrap();
      
      if (result.auto_disbursed) {
        toast.success(`🎉 Prize claimed and $${result.prize_amount.toFixed(2)} added to your wallet!`);
      } else if (result.requires_approval) {
        toast.info(`✅ Prize claimed! Awaiting ${result.disbursement_status === 'pending_senior_approval' ? 'manager' : 'admin'} approval.`);
      } else {
        toast.success('🎉 Prize claimed successfully!');
      }

      setClaimModal({ isOpen: false, winner: null });
      refetch();
    } catch (err) {
      console.error('Claim error:', err);
      toast.error(err?.data?.error || 'Failed to claim prize. Please try again.');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading your Gamificaion winnings...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
        <h3 className="text-xl font-bold text-red-800 mb-2">Failed to Load Winnings</h3>
        <p className="text-red-600 mb-4">{error?.data?.error || 'Something went wrong'}</p>
        <button
          onClick={refetch}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition inline-flex items-center gap-2"
        >
          <RefreshCw size={18} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Ticket className="text-purple-600" size={36} />
            My Gamification Winnings
          </h1>
          <p className="text-gray-600 mt-1">
            Track your Gamification prizes and disbursement status
          </p>
        </div>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition inline-flex items-center gap-2 self-start"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Wins */}
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <Trophy size={36} className="opacity-80" />
            <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
              <Star size={16} />
            </div>
          </div>
          <p className="text-blue-100 text-sm font-medium mb-1">Times Won</p>
          <p className="text-4xl font-bold">{stats.totalWins}</p>
        </div>

        {/* Total Winnings */}
        <div className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 rounded-xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <DollarSign size={36} className="opacity-80" />
            <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
              <Zap size={16} />
            </div>
          </div>
          <p className="text-green-100 text-sm font-medium mb-1">Total Winnings</p>
          <p className="text-4xl font-bold">${stats.totalWon.toFixed(2)}</p>
        </div>

        {/* Disbursed */}
        <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle size={36} className="opacity-80" />
            <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-purple-100 text-sm font-medium mb-1">Disbursed</p>
          <p className="text-4xl font-bold">{stats.disbursed}</p>
        </div>

        {/* Pending */}
        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <Clock size={36} className="opacity-80" />
            <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
              <Sparkles size={16} />
            </div>
          </div>
          <p className="text-orange-100 text-sm font-medium mb-1">Pending Approval</p>
          <p className="text-4xl font-bold">{stats.pending}</p>
        </div>
      </div>

      {/* Unclaimed Prizes Alert */}
      {unclaimedWinnings.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-xl shadow-2xl p-6 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-20">
            <Gift size={120} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="bg-white bg-opacity-30 rounded-full p-4">
              <Gift size={48} className="animate-bounce" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                🎉 Congratulations! You Have Unclaimed Prizes!
              </h3>
              <p className="text-yellow-100 text-lg">
                You have <strong>{unclaimedWinnings.length}</strong> prize(s) worth{' '}
                <strong className="text-2xl">${unclaimedAmount.toFixed(2)}</strong>{' '}
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
          {[
            { key: 'all', label: `All (${winnings.length})` },
            { key: 'unclaimed', label: `Unclaimed (${stats.unclaimed})` },
            { key: 'pending', label: `Pending (${stats.pending})` },
            { key: 'disbursed', label: `Disbursed (${stats.disbursed})` },
            { key: 'rejected', label: `Rejected (${summary.rejected || 0})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
                filter === key
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Winnings List */}
      <div className="space-y-5">
        {filteredWinnings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-16 text-center">
            <div className="bg-gradient-to-br from-purple-100 to-blue-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy size={64} className="text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              {winnings.length === 0 ? 'No Winnings Yet' : 'No Matching Results'}
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              {winnings.length === 0 
                ? 'Vote in gamified elections to win Gamification prizes!' 
                : 'Try changing the filter to see other prizes.'}
            </p>
            {winnings.length === 0 ? (
              <button
                onClick={() => navigate('/dashboard/vote-now')}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-semibold shadow-lg inline-flex items-center gap-2"
              >
                <Sparkles size={20} />
                Browse Elections
              </button>
            ) : (
              <button
                onClick={() => setFilter('all')}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-semibold shadow-lg"
              >
                View All Prizes
              </button>
            )}
          </div>
        ) : (
          filteredWinnings.map((win) => (
            <div
              key={win.winner_id}
              className={`bg-white rounded-xl shadow-xl overflow-hidden transition-all hover:shadow-2xl ${
                win.can_claim ? 'ring-4 ring-yellow-400 ring-offset-2' : ''
              }`}
            >
              {/* Winner Banner */}
              {win.can_claim && (
                <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 px-6 py-3 flex items-center justify-center gap-3 text-white font-bold text-lg">
                  <Trophy size={24} className="animate-bounce" />
                  🏆 WINNER! CLAIM YOUR PRIZE! 🏆
                  <Trophy size={24} className="animate-bounce" />
                </div>
              )}

              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
                  {/* Election Info */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {win.election_title}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                        <Ticket size={16} />
                        <strong>Ticket:</strong> {win.ticket_number || `TKT-${win.winner_id}`}
                      </span>
                      <span className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                        <Trophy size={16} />
                        <strong>Rank:</strong> #{win.rank}
                      </span>
                      <span className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                        <Calendar size={16} />
                        {new Date(win.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Prize Amount */}
                  <div className="text-center md:text-right bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                    <p className="text-sm text-green-700 font-medium mb-1">💰 Prize Amount</p>
                    <p className="text-4xl font-bold text-green-600">
                      ${(win.prize_amount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Ball & Status Display */}
                <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 rounded-xl p-6 mb-6 border-2 border-purple-200">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-2xl border-4 border-white">
                        {win.ball_number || '?'}
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-purple-700 font-semibold">🎱 Lucky Ball</p>
                        <p className="font-bold text-gray-800 text-lg">Ball #{win.ball_number}</p>
                      </div>
                    </div>

                    {/* Disbursement Status */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600 font-semibold mb-2">Disbursement Status</p>
                      <DisbursementStatusBadge status={win.disbursement_status} />
                    </div>
                  </div>
                </div>

                {/* Rejection Reason */}
                {win.disbursement_status === 'rejected' && win.rejection_reason && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <XCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="font-semibold text-red-800">Rejection Reason:</p>
                        <p className="text-red-700">{win.rejection_reason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {win.can_claim && (
                  <button
                    onClick={() => setClaimModal({ isOpen: true, winner: win })}
                    className="w-full px-8 py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
                  >
                    <Gift size={24} />
                    Claim Your Prize (${(win.prize_amount || 0).toFixed(2)})
                    <Sparkles size={24} />
                  </button>
                )}

                {win.disbursement_status === 'disbursed' && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 text-center">
                    <CheckCircle className="text-green-600 mx-auto mb-3" size={48} />
                    <p className="text-green-800 font-bold text-xl mb-2">✅ Prize Disbursed!</p>
                    <p className="text-sm text-green-700">
                      Funds have been added to your wallet
                      {win.disbursed_at && ` on ${new Date(win.disbursed_at).toLocaleDateString()}`}
                    </p>
                    <button
                      onClick={() => navigate('/dashboard/wallet')}
                      className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition inline-flex items-center gap-2"
                    >
                      <ExternalLink size={16} />
                      View Wallet
                    </button>
                  </div>
                )}

                {['pending_approval', 'pending_senior_approval'].includes(win.disbursement_status) && (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
                    <Clock className="text-yellow-600 mx-auto mb-3" size={48} />
                    <p className="text-yellow-800 font-bold text-xl mb-2">
                      ⏳ Awaiting {win.disbursement_status === 'pending_senior_approval' ? 'Manager' : 'Admin'} Approval
                    </p>
                    <p className="text-sm text-yellow-700">
                      Your prize claim is being reviewed. This usually takes 1-3 business days.
                    </p>
                    {win.claimed_at && (
                      <p className="text-xs text-yellow-600 mt-2">
                        Claimed on {new Date(win.claimed_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Empty State CTA */}
      {winnings.length === 0 && (
        <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-2xl p-12 text-white text-center">
          <Ticket size={80} className="mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Start Winning Today!</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Vote in gamified elections to automatically enter lotteries and win amazing prizes!
          </p>
          <button
            onClick={() => navigate('/dashboard/vote-now')}
            className="px-8 py-4 bg-white text-purple-600 rounded-xl hover:bg-gray-100 transition font-bold text-lg shadow-xl inline-flex items-center gap-3"
          >
            <Sparkles size={24} />
            Browse Elections
            <Sparkles size={24} />
          </button>
        </div>
      )}

      {/* Claim Prize Modal */}
      <ClaimPrizeModal
        isOpen={claimModal.isOpen}
        onClose={() => setClaimModal({ isOpen: false, winner: null })}
        winner={claimModal.winner}
        onConfirm={handleClaimPrize}
        isLoading={isClaiming}
      />
    </div>
  );
}
// // src/components/Dashboard/Tabs/LotteryTickets.jsx - BEAUTIFUL MOCK VERSION
// import React, { useState } from 'react';
// import { 
//   Ticket, 
//   Trophy, 
//   Calendar, 
//   DollarSign, 
//   Sparkles,
//   CheckCircle,
//   Clock,
//   Gift,
//   Star,
//   Zap,
//   TrendingUp
// } from 'lucide-react';
// import { toast } from 'react-toastify';

// // Mock data for demonstration
// const MOCK_TICKETS = [
//   {
//     id: 1,
//     ticket_number: 'TKT-2024-001',
//     election_title: '🏛️ Presidential Election 2024',
//     ball_number: 42,
//     voting_id: 'vote_abc123def456',
//     lottery_status: 'drawn',
//     is_winner: true,
//     prize_amount: 150.00,
//     prize_claimed: false,
//     winner_id: 1,
//     created_at: new Date(Date.now() - 172800000).toISOString(),
//   },
//   {
//     id: 2,
//     ticket_number: 'TKT-2024-002',
//     election_title: '🎓 School Board Election',
//     ball_number: 15,
//     voting_id: 'vote_xyz789ghi012',
//     lottery_status: 'drawn',
//     is_winner: true,
//     prize_amount: 75.00,
//     prize_claimed: true,
//     prize_claimed_at: new Date(Date.now() - 86400000).toISOString(),
//     created_at: new Date(Date.now() - 259200000).toISOString(),
//   },
//   {
//     id: 3,
//     ticket_number: 'TKT-2024-003',
//     election_title: '🏙️ Mayor Election 2024',
//     ball_number: 88,
//     voting_id: 'vote_mno345pqr678',
//     lottery_status: 'pending',
//     is_winner: false,
//     prize_amount: null,
//     prize_claimed: false,
//     created_at: new Date(Date.now() - 43200000).toISOString(),
//   },
//   {
//     id: 4,
//     ticket_number: 'TKT-2024-004',
//     election_title: '⚖️ Justice of the Peace Election',
//     ball_number: 23,
//     voting_id: 'vote_stu901vwx234',
//     lottery_status: 'drawn',
//     is_winner: false,
//     prize_amount: null,
//     prize_claimed: false,
//     created_at: new Date(Date.now() - 518400000).toISOString(),
//   },
//   {
//     id: 5,
//     ticket_number: 'TKT-2024-005',
//     election_title: '🌳 Environmental Council Vote',
//     ball_number: 67,
//     voting_id: 'vote_yza567bcd890',
//     lottery_status: 'pending',
//     is_winner: false,
//     prize_amount: null,
//     prize_claimed: false,
//     created_at: new Date(Date.now() - 21600000).toISOString(),
//   },
// ];

// export default function LotteryTicketsTab() {
//   const [filter, setFilter] = useState('all');
//   const [claiming, setClaiming] = useState(false);

//   // Filter tickets
//   const filteredTickets = MOCK_TICKETS.filter(ticket => {
//     if (filter === 'all') return true;
//     if (filter === 'active') return ticket.lottery_status === 'pending';
//     if (filter === 'won') return ticket.is_winner;
//     if (filter === 'completed') return ticket.lottery_status === 'drawn';
//     return true;
//   });

//   const stats = {
//     totalTickets: MOCK_TICKETS.length,
//     timesWon: MOCK_TICKETS.filter(t => t.is_winner).length,
//     totalWinnings: MOCK_TICKETS.filter(t => t.is_winner).reduce((sum, t) => sum + (t.prize_amount || 0), 0),
//     pendingDraws: MOCK_TICKETS.filter(t => t.lottery_status === 'pending').length,
//     unclaimedPrizes: MOCK_TICKETS.filter(t => t.is_winner && !t.prize_claimed),
//   };
// /*eslint-disable*/
//   const handleClaimPrize = async (winnerId) => {
//     setClaiming(true);
//     // Simulate API delay
//     setTimeout(() => {
//       toast.success('🎉 Prize claimed successfully! Funds will be deposited to your wallet within 24 hours.');
//       setClaiming(false);
//     }, 1500);
//   };

//   return (
//     <div className="space-y-6">
//       {/* Development Mode Banner */}
//       <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-4 text-white">
//         <div className="flex items-center gap-3">
//           <Sparkles className="animate-pulse" size={24} />
//           <div>
//             <p className="font-semibold">✨ Preview Mode - Demo Data</p>
//             <p className="text-sm text-blue-100">
//               This page displays sample lottery tickets. Real-time data will be available once the backend API is connected.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Header */}
//       <div className="text-center md:text-left">
//         <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center md:justify-start gap-3">
//           <Ticket className="text-purple-600" size={40} />
//           Gamified Election Tickets
//         </h1>
//         <p className="text-gray-600 text-lg">
//           Track your lottery entries and winnings from gamified elections
//         </p>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         {/* Total Tickets */}
//         <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
//           <div className="flex items-center justify-between mb-3">
//             <Ticket size={36} className="opacity-80" />
//             <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
//               <TrendingUp size={16} />
//             </div>
//           </div>
//           <p className="text-blue-100 text-sm font-medium mb-1">Total Tickets</p>
//           <p className="text-4xl font-bold">{stats.totalTickets}</p>
//         </div>

//         {/* Times Won */}
//         <div className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 rounded-xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
//           <div className="flex items-center justify-between mb-3">
//             <Trophy size={36} className="opacity-80" />
//             <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
//               <Star size={16} />
//             </div>
//           </div>
//           <p className="text-green-100 text-sm font-medium mb-1">Times Won</p>
//           <p className="text-4xl font-bold">{stats.timesWon}</p>
//         </div>

//         {/* Total Winnings */}
//         <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
//           <div className="flex items-center justify-between mb-3">
//             <DollarSign size={36} className="opacity-80" />
//             <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
//               <Zap size={16} />
//             </div>
//           </div>
//           <p className="text-purple-100 text-sm font-medium mb-1">Total Winnings</p>
//           <p className="text-4xl font-bold">${stats.totalWinnings.toFixed(2)}</p>
//         </div>

//         {/* Pending Draws */}
//         <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
//           <div className="flex items-center justify-between mb-3">
//             <Clock size={36} className="opacity-80" />
//             <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
//               <Sparkles size={16} />
//             </div>
//           </div>
//           <p className="text-orange-100 text-sm font-medium mb-1">Pending Draws</p>
//           <p className="text-4xl font-bold">{stats.pendingDraws}</p>
//         </div>
//       </div>

//       {/* Unclaimed Prizes Alert */}
//       {stats.unclaimedPrizes.length > 0 && (
//         <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-xl shadow-2xl p-6 text-white overflow-hidden relative">
//           <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-20">
//             <Gift size={120} />
//           </div>
//           <div className="relative z-10 flex items-center gap-6">
//             <div className="bg-white bg-opacity-30 rounded-full p-4">
//               <Gift size={48} className="animate-bounce" />
//             </div>
//             <div className="flex-1">
//               <h3 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
//                 🎉 Congratulations! You Have Unclaimed Prizes!
//               </h3>
//               <p className="text-yellow-100 text-lg">
//                 You have <strong>{stats.unclaimedPrizes.length}</strong> prize(s) worth{' '}
//                 <strong className="text-2xl">${stats.unclaimedPrizes.reduce((sum, t) => sum + (t.prize_amount || 0), 0).toFixed(2)}</strong>{' '}
//                 waiting to be claimed.
//               </p>
//             </div>
//             <Sparkles size={40} className="animate-pulse hidden md:block" />
//           </div>
//         </div>
//       )}

//       {/* Filters */}
//       <div className="bg-white rounded-xl shadow-lg p-5">
//         <div className="flex flex-wrap gap-3">
//           <button
//             onClick={() => setFilter('all')}
//             className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
//               filter === 'all'
//                 ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
//                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             All Tickets ({MOCK_TICKETS.length})
//           </button>
//           <button
//             onClick={() => setFilter('active')}
//             className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
//               filter === 'active'
//                 ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
//                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             Active ({stats.pendingDraws})
//           </button>
//           <button
//             onClick={() => setFilter('won')}
//             className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
//               filter === 'won'
//                 ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
//                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             Won ({stats.timesWon})
//           </button>
//           <button
//             onClick={() => setFilter('completed')}
//             className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
//               filter === 'completed'
//                 ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
//                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             Completed
//           </button>
//         </div>
//       </div>

//       {/* Tickets List */}
//       <div className="space-y-5">
//         {filteredTickets.length === 0 ? (
//           <div className="bg-white rounded-xl shadow-lg p-16 text-center">
//             <div className="bg-gradient-to-br from-purple-100 to-blue-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
//               <Ticket size={64} className="text-purple-600" />
//             </div>
//             <h3 className="text-2xl font-bold text-gray-800 mb-3">No Tickets in This Category</h3>
//             <p className="text-gray-600 mb-8 text-lg">
//               Try changing the filter or participate in more gamified elections!
//             </p>
//             <button
//               onClick={() => setFilter('all')}
//               className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-semibold shadow-lg"
//             >
//               View All Tickets
//             </button>
//           </div>
//         ) : (
//           filteredTickets.map((ticket) => (
//             <div
//               key={ticket.id}
//               className={`bg-white rounded-xl shadow-xl overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1 ${
//                 ticket.is_winner ? 'ring-4 ring-yellow-400 ring-offset-2' : ''
//               }`}
//             >
//               {/* Winner Banner */}
//               {ticket.is_winner && (
//                 <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 px-6 py-3 flex items-center justify-center gap-3 text-white font-bold text-lg">
//                   <Trophy size={24} className="animate-bounce" />
//                   🏆 WINNER! YOU WON THIS LOTTERY! 🏆
//                   <Trophy size={24} className="animate-bounce" />
//                 </div>
//               )}

//               <div className="p-6 md:p-8">
//                 <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
//                   {/* Election Info */}
//                   <div className="flex-1">
//                     <h3 className="text-2xl font-bold text-gray-900 mb-3">
//                       {ticket.election_title}
//                     </h3>
//                     <div className="flex flex-wrap gap-4 text-sm text-gray-600">
//                       <span className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
//                         <Ticket size={16} />
//                         <strong>Ticket:</strong> {ticket.ticket_number}
//                       </span>
//                       <span className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
//                         <Calendar size={16} />
//                         {new Date(ticket.created_at).toLocaleDateString('en-US', {
//                           month: 'long',
//                           day: 'numeric',
//                           year: 'numeric',
//                         })}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Prize Amount */}
//                   {ticket.is_winner && (
//                     <div className="text-center md:text-right bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
//                       <p className="text-sm text-green-700 font-medium mb-1">💰 Prize Amount</p>
//                       <p className="text-4xl font-bold text-green-600">
//                         ${ticket.prize_amount?.toFixed(2) || '0.00'}
//                       </p>
//                     </div>
//                   )}
//                 </div>

//                 {/* Lottery Ball Display */}
//                 <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 rounded-xl p-6 mb-6 border-2 border-purple-200">
//                   <div className="flex flex-col md:flex-row items-center justify-between gap-6">
//                     <div className="text-center md:text-left">
//                       <p className="text-sm text-purple-700 font-semibold mb-3">🎱 Your Lucky Ball</p>
//                       <div className="flex items-center gap-4">
//                         <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-2xl border-4 border-white animate-pulse">
//                           {ticket.ball_number}
//                         </div>
//                         <div className="text-left">
//                           <p className="font-bold text-gray-800 text-lg">Ball #{ticket.ball_number}</p>
//                           <p className="text-xs text-gray-600 font-mono">
//                             Vote ID: {ticket.voting_id?.slice(0, 12)}...
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Status Badge */}
//                     <div className="text-center">
//                       <p className="text-sm text-gray-600 font-semibold mb-2">Draw Status</p>
//                       {ticket.lottery_status === 'pending' && (
//                         <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold shadow-md">
//                           <Clock size={18} />
//                           Pending Draw
//                         </span>
//                       )}
//                       {ticket.lottery_status === 'drawn' && !ticket.is_winner && (
//                         <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-bold shadow-md">
//                           <CheckCircle size={18} />
//                           Draw Complete
//                         </span>
//                       )}
//                       {ticket.lottery_status === 'drawn' && ticket.is_winner && (
//                         <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-bold shadow-md">
//                           <Trophy size={18} />
//                           Winner! 🎉
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Action Buttons */}
//                 {ticket.is_winner && !ticket.prize_claimed && (
//                   <button
//                     onClick={() => handleClaimPrize(ticket.winner_id)}
//                     disabled={claiming}
//                     className="w-full px-8 py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {claiming ? (
//                       <>
//                         <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
//                         Processing...
//                       </>
//                     ) : (
//                       <>
//                         <Gift size={24} />
//                         Claim Your Prize (${ticket.prize_amount?.toFixed(2)})
//                         <Sparkles size={24} />
//                       </>
//                     )}
//                   </button>
//                 )}

//                 {ticket.is_winner && ticket.prize_claimed && (
//                   <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 text-center">
//                     <CheckCircle className="text-green-600 mx-auto mb-3" size={48} />
//                     <p className="text-green-800 font-bold text-xl mb-2">✅ Prize Successfully Claimed!</p>
//                     <p className="text-sm text-green-700">
//                       Claimed on{' '}
//                       {new Date(ticket.prize_claimed_at).toLocaleDateString('en-US', {
//                         month: 'long',
//                         day: 'numeric',
//                         year: 'numeric',
//                       })}
//                     </p>
//                     <p className="text-xs text-green-600 mt-2">
//                       Funds have been deposited to your wallet 💰
//                     </p>
//                   </div>
//                 )}

//                 {!ticket.is_winner && ticket.lottery_status === 'drawn' && (
//                   <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center">
//                     <p className="text-gray-600 font-medium">
//                       Better luck next time! Keep voting to earn more tickets 🎫
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       {/* Call to Action */}
//       {filteredTickets.length === 0 && filter === 'all' && (
//         <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-2xl p-12 text-white text-center">
//           <Ticket size={80} className="mx-auto mb-6 opacity-80" />
//           <h2 className="text-3xl font-bold mb-4">Start Your Lottery Journey!</h2>
//           <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
//             Vote in gamified elections to automatically receive lottery tickets and win amazing prizes!
//           </p>
//           <button
//             onClick={() => (window.location.href = '/dashboard')}
//             className="px-8 py-4 bg-white text-purple-600 rounded-xl hover:bg-gray-100 transition font-bold text-lg shadow-xl inline-flex items-center gap-3"
//           >
//             <Sparkles size={24} />
//             Browse Gamified Elections
//             <Sparkles size={24} />
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }