import React, { useState } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Download,
  Filter,
  Calendar,
  Loader,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { 
  useGetWalletBalanceQuery, 
  useGetWalletTransactionsQuery,
  /*eslint-disable*/
  useRequestWithdrawalMutation 
} from '../../../redux/api/voting-2/votingApi';
import { toast } from 'react-toastify';
import WithdrawalModal from './wallet/Wallet';

export default function WalletTab() {
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 20,
  });

  // Fetch wallet data
  const { data: balanceData, isLoading: balanceLoading } = useGetWalletBalanceQuery();
  const { data: transactionsData, isLoading: transactionsLoading } = useGetWalletTransactionsQuery(filters);
  
  const balance = balanceData?.data || { balance: 0, currency: 'USD' };
  const transactions = transactionsData?.data?.transactions || [];
  const pagination = transactionsData?.data?.pagination || {};

  // Quick date filters
  const setQuickFilter = (days) => {
    const dateTo = new Date().toISOString().split('T')[0];
    const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setFilters({ ...filters, dateFrom, dateTo, page: 1 });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <TrendingUp className="text-green-600" size={20} />;
      case 'withdraw':
        return <TrendingDown className="text-red-600" size={20} />;
      case 'election_payment':
        return <DollarSign className="text-blue-600" size={20} />;
      case 'prize_won':
        return <CheckCircle className="text-purple-600" size={20} />;
      case 'refund':
        return <TrendingUp className="text-yellow-600" size={20} />;
      default:
        return <DollarSign className="text-gray-600" size={20} />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      success: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      refunded: 'bg-blue-100 text-blue-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  if (balanceLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">My Wallet </h1>
        <button
          onClick={() => setShowWithdrawalModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          Withdraw Funds
        </button>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-blue-100 text-sm">Available Balance</p>
              <h2 className="text-4xl font-bold">
                {balance.currency} {balance.balance.toFixed(2)}
              </h2>
            </div>
          </div>
          <Download size={32} className="text-white/50" />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
          <div>
            <p className="text-blue-100 text-xs mb-1">Total Earned</p>
            <p className="text-xl font-bold">${balance.total_earnings || 0}</p>
          </div>
          <div>
            <p className="text-blue-100 text-xs mb-1">Total Spent</p>
            <p className="text-xl font-bold">${balance.total_spent || 0}</p>
          </div>
          <div>
            <p className="text-blue-100 text-xs mb-1">Pending</p>
            <p className="text-xl font-bold">${balance.pending || 0}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h3 className="font-bold text-gray-800">Filter Transactions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Type Filter */}
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="deposit">Deposit</option>
            <option value="withdraw">Withdraw</option>
            <option value="election_payment">Election Payment</option>
            <option value="prize_won">Prize Won</option>
            <option value="refund">Refund</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Date From */}
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="From Date"
          />

          {/* Date To */}
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value, page: 1 })}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="To Date"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setQuickFilter(1)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition"
          >
            Today
          </button>
          <button
            onClick={() => setQuickFilter(7)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition"
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setQuickFilter(30)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition"
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setFilters({ type: '', status: '', dateFrom: '', dateTo: '', page: 1, limit: 20 })}
            className="px-3 py-1 text-sm bg-red-100 text-red-600 hover:bg-red-200 rounded-full transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="font-bold text-gray-800 text-lg">Transaction History</h3>
        </div>

        {transactionsLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader className="animate-spin text-blue-600" size={32} />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center p-12 text-gray-500">
            <Wallet size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No transactions found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(transaction.transaction_type)}
                          <span className="text-sm font-medium capitalize">
                            {transaction.transaction_type.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-800">{transaction.description}</p>
                        {transaction.election_name && (
                          <p className="text-xs text-gray-500">{transaction.election_name}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold ${
                          ['deposit', 'prize_won', 'refund'].includes(transaction.transaction_type)
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {['deposit', 'prize_won', 'refund'].includes(transaction.transaction_type) ? '+' : '-'}
                          ${Math.abs(transaction.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-6 border-t">
                <p className="text-sm text-gray-600">
                  Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of {pagination.total} transactions
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    disabled={pagination.currentPage === 1}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <WithdrawalModal
          balance={balance.balance}
          currency={balance.currency}
          onClose={() => setShowWithdrawalModal(false)}
        />
      )}
    </div>
  );
}