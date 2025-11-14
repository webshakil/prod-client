// src/components/Dashboard/Tabs/wallet/Wallet.jsx
import React, { useState } from 'react';
import { AlertCircle, Calendar } from 'lucide-react';
//import { useGetTransactionsQuery } from '../../../../redux/api/walllet/walletApi';
import TransactionDetailsModal from './TransactionDetailsModal';
import { useGetTransactionsQuery } from '../../../../redux/api/walllet/wallletApi';

export default function Wallet() {
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filterType, setFilterType] = useState('last_30_days');
  const [transactionType, setTransactionType] = useState('');
  const [transactionStatus, setTransactionStatus] = useState('');

  const { data: transactionsData, isLoading } = useGetTransactionsQuery({
    page: 1,
    limit: 50,
    type: transactionType || undefined,
    status: transactionStatus || undefined,
    filterType: filterType,
  });

  const transactions = transactionsData?.transactions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
        <p className="text-gray-600 mt-1">Track your voting participation payments</p>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Payment History</h2>
          
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_week">Last Week</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
            </select>

            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="election_participation_fee">Election Fees</option>
              <option value="prize_won">Prizes Won</option>
            </select>

            <select
              value={transactionStatus}
              onChange={(e) => setTransactionStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No transactions yet</p>
            <p className="text-sm text-gray-500 mt-2">Your voting payments will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <button
                key={transaction.id}
                onClick={() => setSelectedTransaction(transaction)}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🗳️</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {transaction.description || 'Election Payment'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} />
                      <span>{new Date(transaction.created_at).toLocaleString()}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.status === 'success' 
                          ? 'bg-green-100 text-green-700'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-red-600">
                    -${parseFloat(transaction.amount).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Payment
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This shows your voting participation payments. 
          Money goes directly to election creators. 
          If you're a creator, check "Creator Earnings" for your revenue.
        </p>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
}
// // src/components/Dashboard/Tabs/wallet/Wallet.jsx
// import React, { useState } from 'react';
// // import { 
// //   useGetWalletQuery, 
// //   useGetTransactionsQuery, 
// //   useGetWalletAnalyticsQuery,
// //   useGetBlockedAccountsQuery 
// // } from '../../../../redux/api/walllet/walletApi';
// import { 
//   Wallet as WalletIcon, 
//   ArrowUpRight, 
//   ArrowDownLeft, 
//   DollarSign, 
//   TrendingUp, 
//   Loader, 
//   AlertCircle,
//   Lock,
//   Clock,
//   ChevronRight
// } from 'lucide-react';
// import WithdrawalModal from './WithdrawalModal';
// import DepositModal from './DepositModal';
// import TransactionDetailsModal from './TransactionDetailsModal';
// import { useGetBlockedAccountsQuery, useGetTransactionsQuery, useGetWalletAnalyticsQuery, useGetWalletQuery } from '../../../../redux/api/walllet/wallletApi';

// export default function Wallet() {
//   const [showWithdrawModal, setShowWithdrawModal] = useState(false);
//   const [showDepositModal, setShowDepositModal] = useState(false);
//   const [selectedTransaction, setSelectedTransaction] = useState(null);
//   const [transactionFilter, setTransactionFilter] = useState({
//     page: 1,
//     limit: 20,
//     type: '',
//     status: '',
//     filterType: 'last_30_days'
//   });

//   // Fetch wallet data
//   const { data: walletData, isLoading: walletLoading, error: walletError, refetch: refetchWallet } = useGetWalletQuery();
//   const { data: analyticsData, isLoading: analyticsLoading } = useGetWalletAnalyticsQuery();
//   const { data: transactionsData, isLoading: transactionsLoading } = useGetTransactionsQuery(transactionFilter);
//   const { data: blockedAccountsData, isLoading: blockedLoading } = useGetBlockedAccountsQuery();

//   // Handle loading
//   if (walletLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
//           <p className="text-gray-600">Loading wallet...</p>
//         </div>
//       </div>
//     );
//   }

//   // Handle error
//   if (walletError) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
//           <p className="text-red-600 mb-2">Failed to load wallet</p>
//           <p className="text-gray-600 text-sm">{walletError?.data?.error || 'Please try again later'}</p>
//           <button 
//             onClick={() => refetchWallet()}
//             className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const balance = parseFloat(walletData?.balance || 0);
//   const blockedBalance = parseFloat(walletData?.blocked_balance || 0);
//   const currency = walletData?.currency || 'USD';

//   const getTransactionIcon = (type) => {
//     switch (type) {
//       case 'deposit': return <ArrowDownLeft className="text-green-600" size={20} />;
//       case 'withdraw': return <ArrowUpRight className="text-blue-600" size={20} />;
//       case 'prize_won': return <DollarSign className="text-purple-600" size={20} />;
//       case 'election_payment': return <Lock className="text-orange-600" size={20} />;
//       case 'refund': return <ArrowDownLeft className="text-green-600" size={20} />;
//       default: return <DollarSign className="text-gray-600" size={20} />;
//     }
//   };

//   const getTransactionColor = (type) => {
//     switch (type) {
//       case 'deposit': return 'bg-green-100 text-green-600';
//       case 'withdraw': return 'bg-blue-100 text-blue-600';
//       case 'prize_won': return 'bg-purple-100 text-purple-600';
//       case 'election_payment': return 'bg-orange-100 text-orange-600';
//       case 'refund': return 'bg-green-100 text-green-600';
//       default: return 'bg-gray-100 text-gray-600';
//     }
//   };

//   const formatTransactionType = (type) => {
//     const types = {
//       'deposit': 'Deposit',
//       'withdraw': 'Withdrawal',
//       'prize_won': 'Prize Won',
//       'election_payment': 'Election Fee',
//       'election_refund': 'Refund',
//       'refund': 'Refund'
//     };
//     return types[type] || type;
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-800">My Wallet</h2>
//           <p className="text-gray-600">Manage your funds and transactions</p>
//         </div>
//         <div className="flex gap-3">
//           <button
//             onClick={() => setShowDepositModal(true)}
//             className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
//           >
//             <ArrowDownLeft size={20} />
//             Deposit
//           </button>
//           <button
//             onClick={() => setShowWithdrawModal(true)}
//             disabled={balance <= 0}
//             className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
//               balance <= 0 
//                 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
//                 : 'bg-blue-600 text-white hover:bg-blue-700'
//             }`}
//           >
//             <ArrowUpRight size={20} />
//             Withdraw
//           </button>
//         </div>
//       </div>

//       {/* Balance Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* Available Balance */}
//         <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
//           <div className="flex items-center justify-between mb-4">
//             <WalletIcon size={32} />
//             <span className="text-sm opacity-80">Available</span>
//           </div>
//           <p className="text-4xl font-bold mb-2">
//             ${balance.toFixed(2)}
//           </p>
//           <p className="text-sm opacity-80">Ready to withdraw</p>
//         </div>

//         {/* Blocked Balance */}
//         <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl shadow-lg p-6 text-white">
//           <div className="flex items-center justify-between mb-4">
//             <Lock size={32} />
//             <span className="text-sm opacity-80">Locked</span>
//           </div>
//           <p className="text-4xl font-bold mb-2">
//             ${blockedBalance.toFixed(2)}
//           </p>
//           <p className="text-sm opacity-80">Until election ends</p>
//         </div>

//         {/* Total Balance */}
//         <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl shadow-lg p-6 text-white">
//           <div className="flex items-center justify-between mb-4">
//             <TrendingUp size={32} />
//             <span className="text-sm opacity-80">Total</span>
//           </div>
//           <p className="text-4xl font-bold mb-2">
//             ${(balance + blockedBalance).toFixed(2)}
//           </p>
//           <p className="text-sm opacity-80">All funds</p>
//         </div>
//       </div>

//       {/* Blocked Accounts Details */}
//       {!blockedLoading && blockedAccountsData?.blockedAccounts?.length > 0 && (
//         <div className="bg-white rounded-xl shadow">
//           <div className="p-6 border-b">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <Lock className="text-orange-600" size={24} />
//                 <h3 className="text-xl font-bold">Locked Funds</h3>
//               </div>
//               <span className="text-sm text-gray-600">
//                 {blockedAccountsData.blockedAccounts.length} {blockedAccountsData.blockedAccounts.length === 1 ? 'election' : 'elections'}
//               </span>
//             </div>
//           </div>
//           <div className="divide-y">
//             {blockedAccountsData.blockedAccounts.map((blocked) => (
//               <div key={blocked.id} className="p-4 hover:bg-gray-50">
//                 <div className="flex items-center justify-between">
//                   <div className="flex-1">
//                     <p className="font-semibold text-gray-900">{blocked.election_title || 'Election'}</p>
//                     <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
//                       <span className="flex items-center gap-1">
//                         <Clock size={14} />
//                         Unlocks: {new Date(blocked.end_date).toLocaleDateString()}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-xl font-bold text-orange-600">
//                       ${parseFloat(blocked.amount).toFixed(2)}
//                     </p>
//                     <p className="text-xs text-gray-500 mt-1">Locked</p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Analytics */}
//       {!analyticsLoading && analyticsData && (
//         <div className="bg-white rounded-xl shadow p-6">
//           <h3 className="text-xl font-bold mb-4">Wallet Statistics</h3>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//             <div className="text-center">
//               <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
//                 <ArrowDownLeft className="text-green-600" size={24} />
//               </div>
//               <p className="text-sm text-gray-600 mb-1">Total Deposits</p>
//               <p className="text-2xl font-bold text-green-600">
//                 ${analyticsData.totalDeposits?.toFixed(2) || '0.00'}
//               </p>
//               <p className="text-xs text-gray-500">{analyticsData.depositCount || 0} transactions</p>
//             </div>

//             <div className="text-center">
//               <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
//                 <ArrowUpRight className="text-blue-600" size={24} />
//               </div>
//               <p className="text-sm text-gray-600 mb-1">Total Withdrawals</p>
//               <p className="text-2xl font-bold text-blue-600">
//                 ${analyticsData.totalWithdrawals?.toFixed(2) || '0.00'}
//               </p>
//               <p className="text-xs text-gray-500">{analyticsData.withdrawalCount || 0} transactions</p>
//             </div>

//             <div className="text-center">
//               <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
//                 <DollarSign className="text-purple-600" size={24} />
//               </div>
//               <p className="text-sm text-gray-600 mb-1">Prizes Won</p>
//               <p className="text-2xl font-bold text-purple-600">
//                 ${analyticsData.totalPrizesWon?.toFixed(2) || '0.00'}
//               </p>
//               <p className="text-xs text-gray-500">{analyticsData.prizeCount || 0} prizes</p>
//             </div>

//             <div className="text-center">
//               <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
//                 <Lock className="text-orange-600" size={24} />
//               </div>
//               <p className="text-sm text-gray-600 mb-1">Elections Paid</p>
//               <p className="text-2xl font-bold text-orange-600">
//                 ${analyticsData.totalElectionFees?.toFixed(2) || '0.00'}
//               </p>
//               <p className="text-xs text-gray-500">{analyticsData.electionCount || 0} elections</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Transaction History */}
//       <div className="bg-white rounded-xl shadow">
//         <div className="p-6 border-b">
//           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//             <h3 className="text-xl font-bold">Transaction History</h3>
//             <div className="flex gap-2 flex-wrap">
//               <select
//                 value={transactionFilter.filterType}
//                 onChange={(e) => setTransactionFilter({ ...transactionFilter, filterType: e.target.value, page: 1 })}
//                 className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
//               >
//                 <option value="">All Time</option>
//                 <option value="today">Today</option>
//                 <option value="yesterday">Yesterday</option>
//                 <option value="last_week">Last Week</option>
//                 <option value="last_30_days">Last 30 Days</option>
//               </select>

//               <select
//                 value={transactionFilter.type}
//                 onChange={(e) => setTransactionFilter({ ...transactionFilter, type: e.target.value, page: 1 })}
//                 className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
//               >
//                 <option value="">All Types</option>
//                 <option value="deposit">Deposits</option>
//                 <option value="withdraw">Withdrawals</option>
//                 <option value="prize_won">Prizes</option>
//                 <option value="election_payment">Election Fees</option>
//               </select>

//               <select
//                 value={transactionFilter.status}
//                 onChange={(e) => setTransactionFilter({ ...transactionFilter, status: e.target.value, page: 1 })}
//                 className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
//               >
//                 <option value="">All Status</option>
//                 <option value="success">Success</option>
//                 <option value="pending">Pending</option>
//                 <option value="failed">Failed</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         <div className="p-6">
//           {transactionsLoading ? (
//             <div className="text-center py-12">
//               <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
//               <p className="text-gray-600">Loading transactions...</p>
//             </div>
//           ) : transactionsData?.transactions?.length > 0 ? (
//             <>
//               <div className="space-y-2">
//                 {transactionsData.transactions.map((tx) => (
//                   <div 
//                     key={tx.transaction_id} 
//                     className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition"
//                     onClick={() => setSelectedTransaction(tx)}
//                   >
//                     <div className="flex items-center gap-4 flex-1">
//                       <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getTransactionColor(tx.transaction_type)}`}>
//                         {getTransactionIcon(tx.transaction_type)}
//                       </div>
//                       <div className="flex-1">
//                         <div className="flex items-center gap-2">
//                           <p className="font-semibold">{formatTransactionType(tx.transaction_type)}</p>
//                           <span className={`text-xs px-2 py-1 rounded ${
//                             tx.status === 'success' ? 'bg-green-100 text-green-700' :
//                             tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
//                             'bg-red-100 text-red-700'
//                           }`}>
//                             {tx.status}
//                           </span>
//                         </div>
//                         <p className="text-sm text-gray-600 mt-1">{tx.description || 'No description'}</p>
//                         <div className="flex gap-4 mt-1 text-xs text-gray-500">
//                           <span>{new Date(tx.created_at).toLocaleString()}</span>
//                           {tx.stripe_fee && (
//                             <span>Stripe: ${parseFloat(tx.stripe_fee).toFixed(2)}</span>
//                           )}
//                           {tx.platform_fee && (
//                             <span>Platform: ${parseFloat(tx.platform_fee).toFixed(2)}</span>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <div className="text-right">
//                         <p className={`text-xl font-bold ${
//                           tx.transaction_type === 'deposit' || tx.transaction_type === 'prize_won' || tx.transaction_type === 'refund'
//                             ? 'text-green-600' 
//                             : 'text-red-600'
//                         }`}>
//                           {tx.transaction_type === 'deposit' || tx.transaction_type === 'prize_won' || tx.transaction_type === 'refund' ? '+' : '-'}
//                           ${parseFloat(tx.amount).toFixed(2)}
//                         </p>
//                         {tx.net_amount && (
//                           <p className="text-sm text-gray-500">
//                             Net: ${parseFloat(tx.net_amount).toFixed(2)}
//                           </p>
//                         )}
//                       </div>
//                       <ChevronRight className="text-gray-400" size={20} />
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Pagination */}
//               {transactionsData.pagination && transactionsData.pagination.totalPages > 1 && (
//                 <div className="flex justify-center items-center gap-2 mt-6">
//                   <button
//                     disabled={transactionFilter.page === 1}
//                     onClick={() => setTransactionFilter({ ...transactionFilter, page: transactionFilter.page - 1 })}
//                     className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     Previous
//                   </button>
//                   <span className="text-sm text-gray-600">
//                     Page {transactionFilter.page} of {transactionsData.pagination.totalPages}
//                   </span>
//                   <button
//                     disabled={transactionFilter.page === transactionsData.pagination.totalPages}
//                     onClick={() => setTransactionFilter({ ...transactionFilter, page: transactionFilter.page + 1 })}
//                     className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     Next
//                   </button>
//                 </div>
//               )}
//             </>
//           ) : (
//             <div className="text-center py-12">
//               <WalletIcon className="text-gray-300 mx-auto mb-4" size={48} />
//               <p className="text-gray-500">No transactions yet</p>
//               <p className="text-sm text-gray-400 mt-2">Your transactions will appear here</p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Modals */}
//       {showWithdrawModal && (
//         <WithdrawalModal
//           balance={balance}
//           currency={currency}
//           onClose={() => {
//             setShowWithdrawModal(false);
//             refetchWallet();
//           }}
//         />
//       )}

//       {showDepositModal && (
//         <DepositModal
//           onClose={() => {
//             setShowDepositModal(false);
//             refetchWallet();
//           }}
//         />
//       )}

//       {selectedTransaction && (
//         <TransactionDetailsModal
//           transaction={selectedTransaction}
//           onClose={() => setSelectedTransaction(null)}
//         />
//       )}
//     </div>
//   );
// }
// // src/components/Dashboard/Tabs/wallet/Wallet.jsx
// import React from 'react';
// //import { useGetWalletQuery } from '../../../../redux/api/walllet/wallletApi';
// import { Wallet as WalletIcon, Loader, AlertCircle } from 'lucide-react';
// import { useGetWalletQuery } from '../../../../redux/api/walllet/wallletApi';

// export default function Wallet() {
//   console.log('🔵 Wallet component mounted');
  
//   const { data: walletData, isLoading, error, isError } = useGetWalletQuery();

//   console.log('💰 Wallet Query State:', {
//     data: walletData,
//     isLoading,
//     isError,
//     error: error?.data || error?.message || error,
//   });

//   if (isLoading) {
//     console.log('⏳ Wallet is loading...');
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
//           <p className="text-gray-600">Loading wallet...</p>
//         </div>
//       </div>
//     );
//   }

//   if (isError) {
//     console.error('❌ Wallet error:', error);
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
//           <p className="text-red-600 mb-2">Failed to load wallet</p>
//           <p className="text-gray-600 text-sm">
//             {error?.data?.error || error?.message || 'Unknown error'}
//           </p>
//           <p className="text-xs text-gray-500 mt-2">
//             Check console for details
//           </p>
//         </div>
//       </div>
//     );
//   }

//   console.log('✅ Wallet loaded successfully:', walletData);

//   const balance = parseFloat(walletData?.balance || 0);
//   const blockedBalance = parseFloat(walletData?.blocked_balance || 0);
//   /*eslint-disable*/
//   const currency = walletData?.currency || 'USD';

//   return (
//     <div className="space-y-6">
//       <h2 className="text-3xl font-bold text-gray-800">My Wallet</h2>

//       {/* Balance Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* Available Balance */}
//         <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
//           <div className="flex items-center justify-between mb-4">
//             <WalletIcon size={32} />
//             <span className="text-sm opacity-80">Available</span>
//           </div>
//           <p className="text-4xl font-bold mb-2">
//             ${balance.toFixed(2)}
//           </p>
//           <p className="text-sm opacity-80">Ready to withdraw</p>
//         </div>

//         {/* Blocked Balance */}
//         <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl shadow-lg p-6 text-white">
//           <div className="flex items-center justify-between mb-4">
//             <WalletIcon size={32} />
//             <span className="text-sm opacity-80">Locked</span>
//           </div>
//           <p className="text-4xl font-bold mb-2">
//             ${blockedBalance.toFixed(2)}
//           </p>
//           <p className="text-sm opacity-80">Until election ends</p>
//         </div>

//         {/* Total Balance */}
//         <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl shadow-lg p-6 text-white">
//           <div className="flex items-center justify-between mb-4">
//             <WalletIcon size={32} />
//             <span className="text-sm opacity-80">Total</span>
//           </div>
//           <p className="text-4xl font-bold mb-2">
//             ${(balance + blockedBalance).toFixed(2)}
//           </p>
//           <p className="text-sm opacity-80">All funds</p>
//         </div>
//       </div>

//       <div className="bg-white rounded-xl shadow p-6">
//         <p className="text-gray-600">Wallet loaded successfully!</p>
//         <pre className="mt-4 p-4 bg-gray-100 rounded text-xs overflow-auto">
//           {JSON.stringify(walletData, null, 2)}
//         </pre>
//       </div>
//     </div>
//   );
// }
// // // src/components/Dashboard/Tabs/wallet/Wallet.jsx
// // import React from 'react';
// // import { useGetWalletQuery } from '../../../../redux/api/walllet/walletApi';
// // import { Wallet as WalletIcon, Loader, AlertCircle } from 'lucide-react';

// // export default function Wallet() {
// //   console.log('🔵 Wallet component rendering...');
  
// //   const { data: walletData, isLoading, error } = useGetWalletQuery();

// //   console.log('💰 Wallet data:', { walletData, isLoading, error });

// //   if (isLoading) {
// //     return (
// //       <div className="flex items-center justify-center min-h-[400px]">
// //         <div className="text-center">
// //           <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
// //           <p className="text-gray-600">Loading wallet...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   if (error) {
// //     console.error('❌ Wallet error:', error);
// //     return (
// //       <div className="flex items-center justify-center min-h-[400px]">
// //         <div className="text-center">
// //           <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
// //           <p className="text-red-600 mb-2">Failed to load wallet</p>
// //           <p className="text-gray-600 text-sm">{error?.data?.error || error?.message || 'Please try again later'}</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   const balance = parseFloat(walletData?.balance || 0);
// //   const blockedBalance = parseFloat(walletData?.blocked_balance || 0);
// //   /*eslint-disable*/
// //   const currency = walletData?.currency || 'USD';

// //   return (
// //     <div className="space-y-6">
// //       <h2 className="text-3xl font-bold text-gray-800">My Wallet</h2>

// //       {/* Balance Cards */}
// //       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// //         {/* Available Balance */}
// //         <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
// //           <div className="flex items-center justify-between mb-4">
// //             <WalletIcon size={32} />
// //             <span className="text-sm opacity-80">Available</span>
// //           </div>
// //           <p className="text-4xl font-bold mb-2">
// //             ${balance.toFixed(2)}
// //           </p>
// //           <p className="text-sm opacity-80">Ready to withdraw</p>
// //         </div>

// //         {/* Blocked Balance */}
// //         <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl shadow-lg p-6 text-white">
// //           <div className="flex items-center justify-between mb-4">
// //             <WalletIcon size={32} />
// //             <span className="text-sm opacity-80">Locked</span>
// //           </div>
// //           <p className="text-4xl font-bold mb-2">
// //             ${blockedBalance.toFixed(2)}
// //           </p>
// //           <p className="text-sm opacity-80">Until election ends</p>
// //         </div>

// //         {/* Total Balance */}
// //         <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl shadow-lg p-6 text-white">
// //           <div className="flex items-center justify-between mb-4">
// //             <WalletIcon size={32} />
// //             <span className="text-sm opacity-80">Total</span>
// //           </div>
// //           <p className="text-4xl font-bold mb-2">
// //             ${(balance + blockedBalance).toFixed(2)}
// //           </p>
// //           <p className="text-sm opacity-80">All funds</p>
// //         </div>
// //       </div>

// //       <div className="bg-white rounded-xl shadow p-6">
// //         <p className="text-gray-600">Full wallet features coming soon...</p>
// //       </div>
// //     </div>
// //   );
// // }
// // // // src/components/Dashboard/Tabs/wallet/Wallet.jsx
// // // import React, { useState } from 'react';
// // // import { 
// // //   useGetWalletQuery, 
// // //   useGetTransactionsQuery, 
// // //   useGetWalletAnalyticsQuery,
// // //   useGetBlockedAccountsQuery 
// // // } from '../../../../redux/api/walllet/walletApi';
// // // import { 
// // //   Wallet as WalletIcon, 
// // //   ArrowUpRight, 
// // //   ArrowDownLeft, 
// // //   DollarSign, 
// // //   TrendingUp, 
// // //   Loader, 
// // //   AlertCircle,
// // //   Lock,
// // //   Clock,
// // //   Filter,
// // //   Download,
// // //   Eye,
// // //   ChevronRight
// // // } from 'lucide-react';
// // // //import WithdrawalModal from './WithdrawalModal';
// // // import DepositModal from './DepositModal';
// // // import TransactionDetailsModal from './TransactionDetailsModal';

// // // export default function Wallet() {
// // //   const [showWithdrawModal, setShowWithdrawModal] = useState(false);
// // //   const [showDepositModal, setShowDepositModal] = useState(false);
// // //   const [selectedTransaction, setSelectedTransaction] = useState(null);
// // //   const [transactionFilter, setTransactionFilter] = useState({
// // //     page: 1,
// // //     limit: 20,
// // //     type: '',
// // //     status: '',
// // //     filterType: 'last_30_days'
// // //   });

// // //   // ✅ Fetch wallet data
// // //   const { data: walletData, isLoading: walletLoading, error: walletError, refetch: refetchWallet } = useGetWalletQuery();
// // //   const { data: analyticsData, isLoading: analyticsLoading } = useGetWalletAnalyticsQuery();
// // //   const { data: transactionsData, isLoading: transactionsLoading } = useGetTransactionsQuery(transactionFilter);
// // //   const { data: blockedAccountsData, isLoading: blockedLoading } = useGetBlockedAccountsQuery();

// // //   // ✅ Handle loading
// // //   if (walletLoading) {
// // //     return (
// // //       <div className="flex items-center justify-center min-h-[400px]">
// // //         <div className="text-center">
// // //           <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
// // //           <p className="text-gray-600">Loading wallet...</p>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   // ✅ Handle error
// // //   if (walletError) {
// // //     return (
// // //       <div className="flex items-center justify-center min-h-[400px]">
// // //         <div className="text-center">
// // //           <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
// // //           <p className="text-red-600 mb-2">Failed to load wallet</p>
// // //           <p className="text-gray-600 text-sm">{walletError?.data?.error || 'Please try again later'}</p>
// // //           <button 
// // //             onClick={() => refetchWallet()}
// // //             className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
// // //           >
// // //             Retry
// // //           </button>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   const balance = parseFloat(walletData?.balance || 0);
// // //   const blockedBalance = parseFloat(walletData?.blocked_balance || 0);
// // //   const currency = walletData?.currency || 'USD';
// // //   /*eslint-disable*/
// // //   const totalBlocked = blockedAccountsData?.totalBlocked || 0;

// // //   const getTransactionIcon = (type) => {
// // //     switch (type) {
// // //       case 'deposit': return <ArrowDownLeft className="text-green-600" size={20} />;
// // //       case 'withdraw': return <ArrowUpRight className="text-blue-600" size={20} />;
// // //       case 'prize_won': return <DollarSign className="text-purple-600" size={20} />;
// // //       case 'election_payment': return <Lock className="text-orange-600" size={20} />;
// // //       case 'refund': return <ArrowDownLeft className="text-green-600" size={20} />;
// // //       default: return <DollarSign className="text-gray-600" size={20} />;
// // //     }
// // //   };

// // //   const getTransactionColor = (type) => {
// // //     switch (type) {
// // //       case 'deposit': return 'bg-green-100 text-green-600';
// // //       case 'withdraw': return 'bg-blue-100 text-blue-600';
// // //       case 'prize_won': return 'bg-purple-100 text-purple-600';
// // //       case 'election_payment': return 'bg-orange-100 text-orange-600';
// // //       case 'refund': return 'bg-green-100 text-green-600';
// // //       default: return 'bg-gray-100 text-gray-600';
// // //     }
// // //   };

// // //   const formatTransactionType = (type) => {
// // //     const types = {
// // //       'deposit': 'Deposit',
// // //       'withdraw': 'Withdrawal',
// // //       'prize_won': 'Prize Won',
// // //       'election_payment': 'Election Fee',
// // //       'election_refund': 'Refund',
// // //       'refund': 'Refund'
// // //     };
// // //     return types[type] || type;
// // //   };

// // //   return (
// // //     <div className="space-y-6">
// // //       {/* Header */}
// // //       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
// // //         <div>
// // //           <h2 className="text-3xl font-bold text-gray-800">My Wallet</h2>
// // //           <p className="text-gray-600">Manage your funds and transactions</p>
// // //         </div>
// // //         <div className="flex gap-3">
// // //           <button
// // //             onClick={() => setShowDepositModal(true)}
// // //             className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
// // //           >
// // //             <ArrowDownLeft size={20} />
// // //             Deposit
// // //           </button>
// // //           <button
// // //             onClick={() => setShowWithdrawModal(true)}
// // //             disabled={balance <= 0}
// // //             className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
// // //               balance <= 0 
// // //                 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
// // //                 : 'bg-blue-600 text-white hover:bg-blue-700'
// // //             }`}
// // //           >
// // //             <ArrowUpRight size={20} />
// // //             Withdraw
// // //           </button>
// // //         </div>
// // //       </div>

// // //       {/* Balance Cards */}
// // //       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// // //         {/* Available Balance */}
// // //         <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
// // //           <div className="flex items-center justify-between mb-4">
// // //             <WalletIcon size={32} />
// // //             <span className="text-sm opacity-80">Available</span>
// // //           </div>
// // //           <p className="text-4xl font-bold mb-2">
// // //             ${balance.toFixed(2)}
// // //           </p>
// // //           <p className="text-sm opacity-80">Ready to withdraw</p>
// // //         </div>

// // //         {/* Blocked Balance */}
// // //         <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl shadow-lg p-6 text-white">
// // //           <div className="flex items-center justify-between mb-4">
// // //             <Lock size={32} />
// // //             <span className="text-sm opacity-80">Locked</span>
// // //           </div>
// // //           <p className="text-4xl font-bold mb-2">
// // //             ${blockedBalance.toFixed(2)}
// // //           </p>
// // //           <p className="text-sm opacity-80">Until election ends</p>
// // //         </div>

// // //         {/* Total Balance */}
// // //         <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl shadow-lg p-6 text-white">
// // //           <div className="flex items-center justify-between mb-4">
// // //             <TrendingUp size={32} />
// // //             <span className="text-sm opacity-80">Total</span>
// // //           </div>
// // //           <p className="text-4xl font-bold mb-2">
// // //             ${(balance + blockedBalance).toFixed(2)}
// // //           </p>
// // //           <p className="text-sm opacity-80">All funds</p>
// // //         </div>
// // //       </div>

// // //       {/* Blocked Accounts Details */}
// // //       {!blockedLoading && blockedAccountsData?.blockedAccounts?.length > 0 && (
// // //         <div className="bg-white rounded-xl shadow">
// // //           <div className="p-6 border-b">
// // //             <div className="flex items-center justify-between">
// // //               <div className="flex items-center gap-2">
// // //                 <Lock className="text-orange-600" size={24} />
// // //                 <h3 className="text-xl font-bold">Locked Funds</h3>
// // //               </div>
// // //               <span className="text-sm text-gray-600">
// // //                 {blockedAccountsData.blockedAccounts.length} {blockedAccountsData.blockedAccounts.length === 1 ? 'election' : 'elections'}
// // //               </span>
// // //             </div>
// // //           </div>
// // //           <div className="divide-y">
// // //             {blockedAccountsData.blockedAccounts.map((blocked) => (
// // //               <div key={blocked.id} className="p-4 hover:bg-gray-50">
// // //                 <div className="flex items-center justify-between">
// // //                   <div className="flex-1">
// // //                     <p className="font-semibold text-gray-900">{blocked.election_title || 'Election'}</p>
// // //                     <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
// // //                       <span className="flex items-center gap-1">
// // //                         <Clock size={14} />
// // //                         Unlocks: {new Date(blocked.locked_until).toLocaleDateString()}
// // //                       </span>
// // //                     </div>
// // //                     <div className="mt-2 text-xs text-gray-500">
// // //                       <p>Participation Fee: ${parseFloat(blocked.amount).toFixed(2)}</p>
// // //                     </div>
// // //                   </div>
// // //                   <div className="text-right">
// // //                     <p className="text-xl font-bold text-orange-600">
// // //                       ${parseFloat(blocked.amount).toFixed(2)}
// // //                     </p>
// // //                     <p className="text-xs text-gray-500 mt-1">Locked</p>
// // //                   </div>
// // //                 </div>
// // //               </div>
// // //             ))}
// // //           </div>
// // //         </div>
// // //       )}

// // //       {/* Analytics */}
// // //       {!analyticsLoading && analyticsData && (
// // //         <div className="bg-white rounded-xl shadow p-6">
// // //           <h3 className="text-xl font-bold mb-4">Wallet Statistics</h3>
// // //           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
// // //             <div className="text-center">
// // //               <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
// // //                 <ArrowDownLeft className="text-green-600" size={24} />
// // //               </div>
// // //               <p className="text-sm text-gray-600 mb-1">Total Deposits</p>
// // //               <p className="text-2xl font-bold text-green-600">
// // //                 ${analyticsData.totalDeposits?.toFixed(2) || '0.00'}
// // //               </p>
// // //               <p className="text-xs text-gray-500">{analyticsData.depositCount || 0} transactions</p>
// // //             </div>

// // //             <div className="text-center">
// // //               <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
// // //                 <ArrowUpRight className="text-blue-600" size={24} />
// // //               </div>
// // //               <p className="text-sm text-gray-600 mb-1">Total Withdrawals</p>
// // //               <p className="text-2xl font-bold text-blue-600">
// // //                 ${analyticsData.totalWithdrawals?.toFixed(2) || '0.00'}
// // //               </p>
// // //               <p className="text-xs text-gray-500">{analyticsData.withdrawalCount || 0} transactions</p>
// // //             </div>

// // //             <div className="text-center">
// // //               <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
// // //                 <DollarSign className="text-purple-600" size={24} />
// // //               </div>
// // //               <p className="text-sm text-gray-600 mb-1">Prizes Won</p>
// // //               <p className="text-2xl font-bold text-purple-600">
// // //                 ${analyticsData.totalPrizesWon?.toFixed(2) || '0.00'}
// // //               </p>
// // //               <p className="text-xs text-gray-500">{analyticsData.prizeCount || 0} prizes</p>
// // //             </div>

// // //             <div className="text-center">
// // //               <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
// // //                 <Lock className="text-orange-600" size={24} />
// // //               </div>
// // //               <p className="text-sm text-gray-600 mb-1">Elections Paid</p>
// // //               <p className="text-2xl font-bold text-orange-600">
// // //                 ${analyticsData.totalElectionFees?.toFixed(2) || '0.00'}
// // //               </p>
// // //               <p className="text-xs text-gray-500">{analyticsData.electionCount || 0} elections</p>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       )}

// // //       {/* Transaction History */}
// // //       <div className="bg-white rounded-xl shadow">
// // //         <div className="p-6 border-b">
// // //           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
// // //             <h3 className="text-xl font-bold">Transaction History</h3>
// // //             <div className="flex gap-2 flex-wrap">
// // //               <select
// // //                 value={transactionFilter.filterType}
// // //                 onChange={(e) => setTransactionFilter({ ...transactionFilter, filterType: e.target.value, page: 1 })}
// // //                 className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
// // //               >
// // //                 <option value="">All Time</option>
// // //                 <option value="today">Today</option>
// // //                 <option value="yesterday">Yesterday</option>
// // //                 <option value="last_week">Last Week</option>
// // //                 <option value="last_30_days">Last 30 Days</option>
// // //               </select>

// // //               <select
// // //                 value={transactionFilter.type}
// // //                 onChange={(e) => setTransactionFilter({ ...transactionFilter, type: e.target.value, page: 1 })}
// // //                 className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
// // //               >
// // //                 <option value="">All Types</option>
// // //                 <option value="deposit">Deposits</option>
// // //                 <option value="withdraw">Withdrawals</option>
// // //                 <option value="prize_won">Prizes</option>
// // //                 <option value="election_payment">Election Fees</option>
// // //               </select>

// // //               <select
// // //                 value={transactionFilter.status}
// // //                 onChange={(e) => setTransactionFilter({ ...transactionFilter, status: e.target.value, page: 1 })}
// // //                 className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
// // //               >
// // //                 <option value="">All Status</option>
// // //                 <option value="success">Success</option>
// // //                 <option value="pending">Pending</option>
// // //                 <option value="failed">Failed</option>
// // //               </select>
// // //             </div>
// // //           </div>
// // //         </div>

// // //         <div className="p-6">
// // //           {transactionsLoading ? (
// // //             <div className="text-center py-12">
// // //               <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
// // //               <p className="text-gray-600">Loading transactions...</p>
// // //             </div>
// // //           ) : transactionsData?.transactions?.length > 0 ? (
// // //             <>
// // //               <div className="space-y-2">
// // //                 {transactionsData.transactions.map((tx) => (
// // //                   <div 
// // //                     key={tx.transaction_id} 
// // //                     className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition"
// // //                     onClick={() => setSelectedTransaction(tx)}
// // //                   >
// // //                     <div className="flex items-center gap-4 flex-1">
// // //                       <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getTransactionColor(tx.transaction_type)}`}>
// // //                         {getTransactionIcon(tx.transaction_type)}
// // //                       </div>
// // //                       <div className="flex-1">
// // //                         <div className="flex items-center gap-2">
// // //                           <p className="font-semibold">{formatTransactionType(tx.transaction_type)}</p>
// // //                           <span className={`text-xs px-2 py-1 rounded ${
// // //                             tx.status === 'success' ? 'bg-green-100 text-green-700' :
// // //                             tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
// // //                             'bg-red-100 text-red-700'
// // //                           }`}>
// // //                             {tx.status}
// // //                           </span>
// // //                         </div>
// // //                         <p className="text-sm text-gray-600 mt-1">{tx.description || 'No description'}</p>
// // //                         <div className="flex gap-4 mt-1 text-xs text-gray-500">
// // //                           <span>{new Date(tx.created_at).toLocaleString()}</span>
// // //                           {tx.stripe_fee && (
// // //                             <span>Stripe: ${parseFloat(tx.stripe_fee).toFixed(2)}</span>
// // //                           )}
// // //                           {tx.platform_fee && (
// // //                             <span>Platform: ${parseFloat(tx.platform_fee).toFixed(2)}</span>
// // //                           )}
// // //                         </div>
// // //                       </div>
// // //                     </div>
// // //                     <div className="flex items-center gap-3">
// // //                       <div className="text-right">
// // //                         <p className={`text-xl font-bold ${
// // //                           tx.transaction_type === 'deposit' || tx.transaction_type === 'prize_won' || tx.transaction_type === 'refund'
// // //                             ? 'text-green-600' 
// // //                             : 'text-red-600'
// // //                         }`}>
// // //                           {tx.transaction_type === 'deposit' || tx.transaction_type === 'prize_won' || tx.transaction_type === 'refund' ? '+' : '-'}
// // //                           ${parseFloat(tx.amount).toFixed(2)}
// // //                         </p>
// // //                         {tx.net_amount && (
// // //                           <p className="text-sm text-gray-500">
// // //                             Net: ${parseFloat(tx.net_amount).toFixed(2)}
// // //                           </p>
// // //                         )}
// // //                       </div>
// // //                       <ChevronRight className="text-gray-400" size={20} />
// // //                     </div>
// // //                   </div>
// // //                 ))}
// // //               </div>

// // //               {/* Pagination */}
// // //               {transactionsData.pagination && transactionsData.pagination.totalPages > 1 && (
// // //                 <div className="flex justify-center items-center gap-2 mt-6">
// // //                   <button
// // //                     disabled={transactionFilter.page === 1}
// // //                     onClick={() => setTransactionFilter({ ...transactionFilter, page: transactionFilter.page - 1 })}
// // //                     className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
// // //                   >
// // //                     Previous
// // //                   </button>
// // //                   <span className="text-sm text-gray-600">
// // //                     Page {transactionFilter.page} of {transactionsData.pagination.totalPages}
// // //                   </span>
// // //                   <button
// // //                     disabled={transactionFilter.page === transactionsData.pagination.totalPages}
// // //                     onClick={() => setTransactionFilter({ ...transactionFilter, page: transactionFilter.page + 1 })}
// // //                     className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
// // //                   >
// // //                     Next
// // //                   </button>
// // //                 </div>
// // //               )}
// // //             </>
// // //           ) : (
// // //             <div className="text-center py-12">
// // //               <WalletIcon className="text-gray-300 mx-auto mb-4" size={48} />
// // //               <p className="text-gray-500">No transactions yet</p>
// // //               <p className="text-sm text-gray-400 mt-2">Your transactions will appear here</p>
// // //             </div>
// // //           )}
// // //         </div>
// // //       </div>

// // //       {/* Modals */}
// // //       {showWithdrawModal && (
// // //         <WithdrawalModal
// // //           balance={balance}
// // //           currency={currency}
// // //           onClose={() => {
// // //             setShowWithdrawModal(false);
// // //             refetchWallet();
// // //           }}
// // //         />
// // //       )}

// // //       {showDepositModal && (
// // //         <DepositModal
// // //           onClose={() => {
// // //             setShowDepositModal(false);
// // //             refetchWallet();
// // //           }}
// // //         />
// // //       )}

// // //       {selectedTransaction && (
// // //         <TransactionDetailsModal
// // //           transaction={selectedTransaction}
// // //           onClose={() => setSelectedTransaction(null)}
// // //         />
// // //       )}
// // //     </div>
// // //   );
// // // }