// src/components/Dashboard/Tabs/wallet/CreatorWallet.jsx
import React, { useState } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  DollarSign, 
  Lock, 
  ArrowUpRight, 
  Calendar,
  AlertCircle,
  Gift,
  Users
} from 'lucide-react';
// import { 
//   useGetCreatorWalletQuery,
//   useGetCreatorTransactionsQuery,
//   useGetWalletAnalyticsQuery,
//   useRequestWithdrawalMutation
// } from '../../../../redux/api/walllet/walletApi';
import { useGetMyElectionsQuery } from '../../../../redux/api/election/electionApi';
import WithdrawalModal from './WithdrawalModal';
import TransactionDetailsModal from './TransactionDetailsModal';
import { useGetCreatorTransactionsQuery, useGetCreatorWalletQuery, useGetWalletAnalyticsQuery } from '../../../../redux/api/walllet/wallletApi';


export default function CreatorWallet() {
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedElection, setSelectedElection] = useState(null);

  // Fetch creator wallet data
  const { data: walletData, isLoading: walletLoading } = useGetCreatorWalletQuery();
  const { data: analyticsData } = useGetWalletAnalyticsQuery();
  const { data: electionsData } = useGetMyElectionsQuery();
  
  const { data: transactionsData, isLoading: transactionsLoading } = useGetCreatorTransactionsQuery({
    page: 1,
    limit: 20,
    electionId: selectedElection,
  });
/*eslint-disable*/
  //const [requestWithdrawal] = useRequestWithdrawalMutation();

  const balance = parseFloat(walletData?.balance || 0);
  const blockedBalance = parseFloat(walletData?.blocked_balance || 0);
  const totalBalance = balance + blockedBalance;

  // Calculate earnings statistics
  const totalRevenue = analyticsData?.totalElectionFees || 0;
  const totalPrizesDistributed = analyticsData?.totalPrizesWon || 0;
  const totalWithdrawals = analyticsData?.totalWithdrawals || 0;
  const electionCount = analyticsData?.electionCount || 0;

  const myElections = electionsData?.elections || [];

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'election_revenue':
        return <DollarSign className="text-green-600" size={20} />;
      case 'prize_won':
      case 'election_funds_released':
        return <Gift className="text-purple-600" size={20} />;
      case 'withdraw':
        return <ArrowUpRight className="text-blue-600" size={20} />;
      default:
        return <Wallet className="text-gray-600" size={20} />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'election_revenue':
      case 'election_funds_released':
        return 'text-green-600';
      case 'prize_won':
        return 'text-purple-600';
      case 'withdraw':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (walletLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading creator wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Creator Earnings</h1>
          <p className="text-gray-600 mt-1">Manage your election revenue and withdrawals</p>
        </div>
        <button
          onClick={() => setShowWithdrawalModal(true)}
          disabled={balance === 0}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <ArrowUpRight size={20} />
          Withdraw
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Available Balance */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Wallet size={32} />
            <span className="text-blue-100 text-sm">Available</span>
          </div>
          <div className="space-y-1">
            <p className="text-4xl font-bold">${balance.toFixed(2)}</p>
            <p className="text-blue-100 text-sm">Ready to withdraw</p>
          </div>
        </div>

        {/* Locked Balance */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Lock size={32} />
            <span className="text-orange-100 text-sm">Locked</span>
          </div>
          <div className="space-y-1">
            <p className="text-4xl font-bold">${blockedBalance.toFixed(2)}</p>
            <p className="text-orange-100 text-sm">Until elections end</p>
          </div>
        </div>

        {/* Total Balance */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp size={32} />
            <span className="text-green-100 text-sm">Total</span>
          </div>
          <div className="space-y-1">
            <p className="text-4xl font-bold">${totalBalance.toFixed(2)}</p>
            <p className="text-green-100 text-sm">All earnings</p>
          </div>
        </div>
      </div>

      {/* Revenue Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign className="text-green-600" size={28} />
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">{electionCount} elections</p>
          </div>

          {/* Prizes Distributed */}
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Gift className="text-purple-600" size={28} />
            </div>
            <p className="text-sm text-gray-600 mb-1">Prizes Distributed</p>
            <p className="text-2xl font-bold text-purple-600">${totalPrizesDistributed.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">To winners</p>
          </div>

          {/* Total Withdrawn */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ArrowUpRight className="text-blue-600" size={28} />
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Withdrawn</p>
            <p className="text-2xl font-bold text-blue-600">${totalWithdrawals.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">To bank account</p>
          </div>

          {/* Active Elections */}
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock className="text-orange-600" size={28} />
            </div>
            <p className="text-sm text-gray-600 mb-1">Locked Funds</p>
            <p className="text-2xl font-bold text-orange-600">${blockedBalance.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">From active elections</p>
          </div>
        </div>
      </div>

      {/* Elections with Revenue */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Your Elections</h2>
          <select
            value={selectedElection || ''}
            onChange={(e) => setSelectedElection(e.target.value || null)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Elections</option>
            {myElections.map((election) => (
              <option key={election.id} value={election.id}>
                {election.title}
              </option>
            ))}
          </select>
        </div>

        {myElections.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">You haven't created any elections yet</p>
            <button
              onClick={() => window.location.href = '/dashboard?tab=create-election'}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create Your First Election
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {myElections.map((election) => (
              <div
                key={election.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{election.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{election.totalVotes || 0} participants</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{new Date(election.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        election.status === 'published' 
                          ? 'bg-green-100 text-green-700'
                          : election.status === 'completed'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {election.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${((election.totalVotes || 0) * (election.general_participation_fee || 0)).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Transaction History</h2>

        {transactionsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading transactions...</p>
          </div>
        ) : transactionsData?.transactions?.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactionsData?.transactions?.map((transaction) => (
              <button
                key={transaction.id}
                onClick={() => setSelectedTransaction(transaction)}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    {getTransactionIcon(transaction.transaction_type)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {transaction.description || transaction.transaction_type}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${getTransactionColor(transaction.transaction_type)}`}>
                    {transaction.transaction_type === 'withdraw' ? '-' : '+'}${parseFloat(transaction.amount).toFixed(2)}
                  </p>
                  {transaction.net_amount && (
                    <p className="text-xs text-gray-500">
                      Net: ${parseFloat(transaction.net_amount).toFixed(2)}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showWithdrawalModal && (
        <WithdrawalModal
          balance={balance}
          currency="USD"
          onClose={() => setShowWithdrawalModal(false)}
        />
      )}

      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
}