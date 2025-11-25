// src/components/Dashboard/Tabs/wallet/CreatorWallet.jsx
import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  DollarSign, 
  Lock, 
  ArrowUpRight, 
  Calendar,
  AlertCircle,
  Gift,
  Users,
  Info,
  CreditCard,
  CheckCircle,
  Clock,
  Award,
  TrendingDown,
  Eye,
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { useGetMyElectionsQuery } from '../../../../redux/api/election/electionApi';
import WithdrawalModal from './WithdrawalModal';
import TransactionDetailsModal from './TransactionDetailsModal';
import { 
  useGetCreatorTransactionsQuery, 
  useGetCreatorWalletQuery, 
  useGetWalletAnalyticsQuery,
  useGetEscrowDepositsQuery,
  useCreateLotteryDepositCheckoutMutation,
  useConfirmLotteryDepositMutation
} from '../../../../redux/api/walllet/wallletApi';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
/*eslint-disable*/
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function CreatorWallet() {
  const location = useLocation();
  const navigate = useNavigate();

  // State management
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedElection, setSelectedElection] = useState(null);
  const [depositingFor, setDepositingFor] = useState(null);
  const [highlightedElection, setHighlightedElection] = useState(null);
  const [showDepositBanner, setShowDepositBanner] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    escrow: true,
    locked: true,
    elections: true
  });

  // API queries
  const { data: walletData, isLoading: walletLoading, refetch: refetchWallet } = useGetCreatorWalletQuery();
  const { data: analyticsData } = useGetWalletAnalyticsQuery();
  const { data: electionsData } = useGetMyElectionsQuery({ page: 1, limit: 50, status: 'all' });
  const { data: escrowData, refetch: refetchEscrow } = useGetEscrowDepositsQuery();
  
  const { data: transactionsData, isLoading: transactionsLoading } = useGetCreatorTransactionsQuery({
    page: 1,
    limit: 20,
    electionId: selectedElection,
  });

  // Mutations
  const [createCheckout, { isLoading: checkoutLoading }] = useCreateLotteryDepositCheckoutMutation();
  const [confirmDeposit] = useConfirmLotteryDepositMutation();

  // Calculated values
  const balance = parseFloat(walletData?.balance || 0);
  const blockedBalance = parseFloat(walletData?.blocked_balance || 0);
  const totalEscrowed = parseFloat(escrowData?.totalEscrowed || 0);
  const totalBalance = balance + blockedBalance + totalEscrowed;

  const totalRevenue = analyticsData?.totalElectionFees || 0;
  const totalPrizesDistributed = analyticsData?.totalPrizesWon || 0;
  const totalWithdrawals = analyticsData?.totalWithdrawals || 0;
  const electionCount = analyticsData?.electionCount || 0;

  const myElections = electionsData?.elections || [];
  const escrowDeposits = escrowData?.deposits || [];

  // Group locked funds by election
  const getLockedFundsByElection = () => {
    const locked = [];
    myElections.forEach(election => {
      if (election.status === 'published' || election.status === 'active') {
        const lockedAmount = (election.totalVotes || 0) * (election.general_participation_fee || 0);
        if (lockedAmount > 0) {
          locked.push({
            electionId: election.id,
            electionTitle: election.title,
            amount: lockedAmount,
            endDate: election.end_date,
            participants: election.totalVotes || 0
          });
        }
      }
    });
    return locked;
  };

  const lockedFunds = getLockedFundsByElection();

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle redirect from Step4 for deposit
  useEffect(() => {
    const pendingElectionId = sessionStorage.getItem('pendingPublishElectionId');
    const pendingAmount = sessionStorage.getItem('pendingPublishAmount');
    
    if (location.state?.depositRequired && location.state?.highlightElection) {
      setHighlightedElection(location.state.highlightElection);
      setShowDepositBanner(true);
      
      setTimeout(() => {
        document.getElementById('elections-section')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 500);
      
      toast.info(`💰 Please deposit $${pendingAmount} to publish your election`, {
        autoClose: 7000
      });
    }
  }, [location]);

  // Handle Stripe return (payment success)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      confirmDeposit({ sessionId })
        .unwrap()
        .then((result) => {
          toast.success('✅ Prize deposit confirmed successfully!');
          
          refetchWallet();
          refetchEscrow();
          
          const pendingElectionId = sessionStorage.getItem('pendingPublishElectionId');
          
          if (pendingElectionId) {
            setTimeout(() => {
              toast.success('🎉 Deposit Complete! You can now publish your election.', {
                autoClose: 5000,
                onClick: () => {
                  sessionStorage.removeItem('pendingPublishElectionId');
                  sessionStorage.removeItem('pendingPublishAmount');
                  navigate('/dashboard/create-election', { 
                    state: { 
                      resumeDraft: pendingElectionId,
                      step: 4 
                    }
                  });
                }
              });
            }, 2000);
          }
          
          window.history.replaceState({}, '', window.location.pathname);
        })
        .catch((error) => {
          toast.error('Failed to confirm deposit');
          console.error(error);
        });
    }
  }, [confirmDeposit, navigate, refetchWallet, refetchEscrow]);

  // Handle lottery deposit
  const handleLotteryDeposit = async (election) => {
    try {
      setDepositingFor(election.id);
      
      const amount = parseFloat(
        election.lottery_total_prize_pool || 
        election.lottery_estimated_value || 
        0
      );
      
      if (amount <= 0) {
        toast.error('Invalid prize pool amount');
        return;
      }

      console.log('💰 Creating checkout for election:', election.id, 'Amount:', amount);

      const response = await createCheckout({
        electionId: election.id,
        amount: amount
      }).unwrap();

      console.log('✅ Checkout created:', response);

      if (response.success && response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        toast.error('Failed to create checkout session');
      }

    } catch (error) {
      console.error('❌ Deposit error:', error);
      toast.error(error.data?.error || 'Failed to create deposit');
    } finally {
      setDepositingFor(null);
    }
  };

  // Transaction helpers
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

  const parseFeeBreakdown = (description) => {
    if (!description) return null;
    
    const voterPaidMatch = description.match(/Voter paid \$([0-9.]+)/);
    const stripeFeeMatch = description.match(/Stripe fee: -?\$([0-9.]+)/);
    const paddleFeeMatch = description.match(/Paddle fee: -?\$([0-9.]+)/);
    const platformFeeMatch = description.match(/Platform fee: -?\$([0-9.]+)/);
    const netEarningsMatch = description.match(/Net earnings: \$([0-9.]+)/);
    const frozenUntilMatch = description.match(/FROZEN until ([0-9/]+)/);

    if (!voterPaidMatch) return null;

    return {
      voterPaid: parseFloat(voterPaidMatch[1]),
      gatewayFee: parseFloat(stripeFeeMatch?.[1] || paddleFeeMatch?.[1] || 0),
      gatewayType: stripeFeeMatch ? 'Stripe' : paddleFeeMatch ? 'Paddle' : 'Gateway',
      platformFee: parseFloat(platformFeeMatch?.[1] || 0),
      yourEarnings: parseFloat(netEarningsMatch?.[1] || 0),
      frozenUntil: frozenUntilMatch?.[1]
    };
  };

  if (walletLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-semibold">Loading creator wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-600">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Wallet className="text-blue-600" size={40} />
              Creator Earnings
            </h1>
            <p className="text-gray-600 text-lg">Manage your election revenue, prizes, and withdrawals</p>
          </div>
          
          <button
            onClick={() => setShowWithdrawalModal(true)}
            disabled={balance === 0}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold text-lg"
          >
            <ArrowUpRight size={24} />
            Withdraw Funds
          </button>
        </div>
      </div>

      {/* DEPOSIT REQUIRED BANNER */}
      {showDepositBanner && (
        <div className="bg-gradient-to-r from-yellow-100 via-yellow-50 to-orange-50 border-2 border-yellow-500 rounded-2xl p-6 shadow-2xl animate-pulse-slow">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <AlertCircle className="text-white" size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-yellow-900 mb-2 flex items-center gap-2">
                🎁 Prize Deposit Required to Publish
              </h3>
              <p className="text-yellow-800 text-lg mb-4 leading-relaxed">
                Your election has lottery prizes enabled with <strong>creator funding</strong>. 
                You must deposit the prize pool before publishing. Find your election below and click 
                <strong className="text-yellow-900"> "Deposit Prize Pool"</strong> to continue.
              </p>
              <button
                onClick={() => setShowDepositBanner(false)}
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-semibold shadow-md"
              >
                Got it!
              </button>
            </div>
            <button
              onClick={() => setShowDepositBanner(false)}
              className="text-yellow-700 hover:text-yellow-900 transition"
            >
              <XCircle size={24} />
            </button>
          </div>
        </div>
      )}

      {/* WALLET MECHANICS INFO */}
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-l-4 border-blue-600 rounded-2xl p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <Info className="text-blue-600 flex-shrink-0 mt-1" size={28} />
          <div className="flex-1">
            <h3 className="font-bold text-blue-900 mb-4 text-2xl">💰 How Your Wallet Works</h3>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white rounded-xl p-5 border-2 border-orange-200 shadow-md">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Lock className="text-orange-600" size={20} />
                  </div>
                  <span className="font-bold text-gray-900 text-lg">Voter Fees (Locked)</span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  When voters pay to participate, funds are <strong className="text-orange-600">locked</strong> until your election ends. 
                  After deducting payment gateway and platform fees, the remaining amount is automatically released to your available balance.
                </p>
              </div>

              <div className="bg-white rounded-xl p-5 border-2 border-purple-200 shadow-md">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Gift className="text-purple-600" size={20} />
                  </div>
                  <span className="font-bold text-gray-900 text-lg">Prize Deposits (Escrowed)</span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  If you enable lottery prizes with creator funding, you must deposit the prize pool <strong className="text-purple-600">upfront</strong>. 
                  This amount is held in escrow and automatically distributed to winners when your election ends.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BALANCE SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <Wallet size={28} />
            </div>
            <span className="text-blue-100 text-sm font-semibold bg-white/10 px-3 py-1 rounded-full">Available</span>
          </div>
          <p className="text-5xl font-bold drop-shadow-lg">${balance.toFixed(2)}</p>
          <p className="text-blue-100 text-sm font-medium mt-2">Ready to withdraw</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl shadow-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <Lock size={28} />
            </div>
            <span className="text-orange-100 text-sm font-semibold bg-white/10 px-3 py-1 rounded-full">Locked</span>
          </div>
          <p className="text-5xl font-bold drop-shadow-lg">${blockedBalance.toFixed(2)}</p>
          <p className="text-orange-100 text-sm font-medium mt-2">{lockedFunds.length} active election{lockedFunds.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <Gift size={28} />
            </div>
            <span className="text-purple-100 text-sm font-semibold bg-white/10 px-3 py-1 rounded-full">Escrowed</span>
          </div>
          <p className="text-5xl font-bold drop-shadow-lg">${totalEscrowed.toFixed(2)}</p>
          <p className="text-purple-100 text-sm font-medium mt-2">{escrowDeposits.length} prize deposit{escrowDeposits.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl shadow-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <TrendingUp size={28} />
            </div>
            <span className="text-green-100 text-sm font-semibold bg-white/10 px-3 py-1 rounded-full">Total</span>
          </div>
          <p className="text-5xl font-bold drop-shadow-lg">${totalBalance.toFixed(2)}</p>
          <p className="text-green-100 text-sm font-medium mt-2">All funds combined</p>
        </div>
      </div>

      {/* ESCROWED FUNDS DETAIL */}
      {escrowDeposits.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border-2 border-purple-300">
          <button
            onClick={() => toggleSection('escrow')}
            className="w-full flex items-center justify-between p-6 hover:bg-purple-50 transition rounded-t-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Gift className="text-purple-600" size={24} />
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-bold text-gray-900">Prize Pool Deposits (Escrowed)</h2>
                <p className="text-sm text-gray-600">{escrowDeposits.length} deposit{escrowDeposits.length !== 1 ? 's' : ''} • Total: ${totalEscrowed.toFixed(2)}</p>
              </div>
            </div>
            {expandedSections.escrow ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
          
          {expandedSections.escrow && (
            <div className="p-6 pt-0 space-y-4">
              {escrowDeposits.map((deposit) => (
                <div key={deposit.electionId} className="border-2 border-purple-200 rounded-xl p-5 bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-2">{deposit.electionTitle}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300 flex items-center gap-1">
                          <CheckCircle size={14} /> Deposited
                        </span>
                        {deposit.completedAt && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Calendar size={14} />
                            <span>{new Date(deposit.completedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                        {deposit.endDate && (
                          <div className="flex items-center gap-1 text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                            <Clock size={14} />
                            <span className="font-medium">Locked until: {new Date(deposit.endDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm text-gray-600 font-medium">Escrowed Amount</p>
                      <p className="text-3xl font-bold text-purple-600">${deposit.amount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-4 bg-purple-50 border-l-4 border-purple-500 rounded-lg">
                <p className="text-sm text-purple-900 flex items-start gap-2">
                  <Info className="flex-shrink-0 mt-0.5" size={16} />
                  <span>
                    These funds are held securely and will be automatically distributed to winners when elections end. 
                    Any unused balance returns to your available balance immediately.
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LOCKED FUNDS DETAIL */}
      {lockedFunds.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-300">
          <button
            onClick={() => toggleSection('locked')}
            className="w-full flex items-center justify-between p-6 hover:bg-orange-50 transition rounded-t-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Lock className="text-orange-600" size={24} />
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-bold text-gray-900">Locked Voter Fees</h2>
                <p className="text-sm text-gray-600">{lockedFunds.length} active election{lockedFunds.length !== 1 ? 's' : ''} • Total: ${blockedBalance.toFixed(2)}</p>
              </div>
            </div>
            {expandedSections.locked ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
          
          {expandedSections.locked && (
            <div className="p-6 pt-0 space-y-4">
              {lockedFunds.map((locked) => (
                <div key={locked.electionId} className="border-2 border-orange-200 rounded-xl p-5 bg-gradient-to-r from-orange-50 to-yellow-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-2">{locked.electionTitle}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <div className="flex items-center gap-1 text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          <Users size={14} />
                          <span className="font-medium">{locked.participants} participant{locked.participants !== 1 ? 's' : ''}</span>
                        </div>
                        {locked.endDate && (
                          <div className="flex items-center gap-1 text-orange-700 bg-orange-100 px-3 py-1 rounded-full">
                            <Clock size={14} />
                            <span className="font-medium">Releases: {new Date(locked.endDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm text-gray-600 font-medium">Locked Amount</p>
                      <p className="text-3xl font-bold text-orange-600">${locked.amount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg">
                <p className="text-sm text-orange-900 flex items-start gap-2">
                  <Info className="flex-shrink-0 mt-0.5" size={16} />
                  <span>
                    These funds are locked until elections end. After deducting payment gateway and platform fees, 
                    the remaining amount will be automatically released to your available balance.
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ALL ELECTIONS WITH DEPOSIT OPTIONS */}
      <div id="elections-section" className="bg-white rounded-2xl shadow-xl border-2 border-blue-300">
        <button
          onClick={() => toggleSection('elections')}
          className="w-full flex items-center justify-between p-6 hover:bg-blue-50 transition rounded-t-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Award className="text-blue-600" size={24} />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold text-gray-900">All Your Elections</h2>
              <p className="text-sm text-gray-600">{myElections.length} election{myElections.length !== 1 ? 's' : ''} • Manage deposits and view details</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {myElections.length > 0 && (
              <>
                <select
                  value={selectedElection || ''}
                  onChange={(e) => {
                    e.stopPropagation();
                    setSelectedElection(e.target.value || null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="">Filter: All</option>
                  {myElections.map((election) => (
                    <option key={election.id} value={election.id}>{election.title}</option>
                  ))}
                </select>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    refetchWallet();
                    refetchEscrow();
                    toast.success('Refreshed!');
                  }}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  <RefreshCw size={20} className="text-gray-600" />
                </button>
              </>
            )}
            {expandedSections.elections ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </div>
        </button>
        
        {expandedSections.elections && (
          <div className="p-6 pt-0">
            {myElections.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
                <AlertCircle className="mx-auto text-blue-400 mb-4" size={64} />
                <p className="text-xl text-gray-800 font-semibold mb-2">No elections found</p>
                <p className="text-gray-600 mb-6">Create an election to start earning revenue!</p>
                <button
                  onClick={() => navigate('/dashboard/create-election')}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-semibold inline-flex items-center gap-2"
                >
                  <Award size={20} />
                  Create Your First Election
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {myElections.map((election) => {
                  const needsDeposit = election.lottery_enabled && 
                                       election.lottery_prize_funding_source === 'creator_funded';
                  const hasDeposited = escrowDeposits.some(
                    d => d.electionId === election.id && d.status === 'completed'
                  );
                  const isHighlighted = highlightedElection === election.id;
                  
                  return (
                    <div
                      key={election.id}
                      className={`border-2 rounded-xl p-5 transition-all ${
                        isHighlighted 
                          ? 'border-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50 shadow-2xl ring-4 ring-yellow-300' 
                          : needsDeposit && !hasDeposited 
                          ? 'border-yellow-400 bg-yellow-50 shadow-lg' 
                          : 'border-gray-200 hover:shadow-lg'
                      }`}
                    >
                      {isHighlighted && needsDeposit && !hasDeposited && (
                        <div className="mb-4 p-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg shadow-lg">
                          <p className="text-white font-bold text-center text-lg">
                            👇 DEPOSIT REQUIRED FOR THIS ELECTION 👇
                          </p>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-bold text-gray-900 text-xl">{election.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
                              election.status === 'published' 
                                ? 'bg-green-100 text-green-700 border-green-300'
                                : election.status === 'completed'
                                ? 'bg-blue-100 text-blue-700 border-blue-300'
                                : 'bg-gray-100 text-gray-700 border-gray-300'
                            }`}>
                              {election.status?.toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 mb-3 text-sm">
                            <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                              <Users size={14} />
                              <span className="font-medium">{election.totalVotes || 0} participants</span>
                            </div>
                            <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                              <Calendar size={14} />
                              <span className="font-medium">{new Date(election.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {needsDeposit && (
                            <div className={`mt-4 p-4 rounded-xl border-2 ${
                              hasDeposited 
                                ? 'bg-green-50 border-green-300'
                                : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300'
                            }`}>
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <p className="text-sm font-bold text-purple-900 flex items-center gap-2">
                                    <Gift size={16} />
                                    Prize Pool {hasDeposited ? 'Deposited' : 'Required'}
                                  </p>
                                  <p className="text-xs text-purple-700">Creator-funded Gamification</p>
                                </div>
                                <p className="text-2xl font-bold text-purple-600">
                                  ${parseFloat(election.lottery_total_prize_pool || election.lottery_estimated_value || 0).toFixed(2)}
                                </p>
                              </div>
                              
                              {!hasDeposited && (
                                <button
                                  onClick={() => handleLotteryDeposit(election)}
                                  disabled={depositingFor === election.id || checkoutLoading}
                                  className={`w-full py-3 rounded-xl transition-all font-bold text-lg flex items-center justify-center gap-3 shadow-lg ${
                                    isHighlighted
                                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white animate-pulse'
                                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                  {depositingFor === election.id ? (
                                    <>
                                      <Clock className="animate-spin" size={24} />
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <CreditCard size={24} />
                                      Deposit Prize Pool
                                    </>
                                  )}
                                </button>
                              )}

                              {hasDeposited && (
                                <div className="text-center py-3 bg-green-100 rounded-lg">
                                  <p className="text-green-700 font-semibold flex items-center justify-center gap-2">
                                    <CheckCircle size={20} />
                                    Prize pool deposited successfully!
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-gray-600 font-medium mb-1">Revenue Earned</p>
                          <p className="text-4xl font-bold text-green-600 mb-1">
                            ${((election.totalVotes || 0) * (election.general_participation_fee || 0)).toFixed(2)}
                          </p>
                          <button
                            onClick={() => toast.info('Opening details...')}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                          >
                            <Eye size={14} />
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* TRANSACTION HISTORY */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-gray-600">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <TrendingDown className="text-gray-600" size={24} />
          </div>
          Transaction History
        </h2>

        {transactionsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading transactions...</p>
          </div>
        ) : transactionsData?.transactions?.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-xl text-gray-600">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactionsData?.transactions?.map((transaction) => {
              const breakdown = parseFeeBreakdown(transaction.description);
              
              return (
                <div key={transaction.id} className="border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all">
                  <button
                    onClick={() => setSelectedTransaction(transaction)}
                    className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center shadow-md">
                        {getTransactionIcon(transaction.transaction_type)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">
                          {transaction.transaction_type === 'election_revenue' 
                            ? 'Election Revenue' 
                            : transaction.transaction_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Calendar size={14} />
                          {new Date(transaction.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getTransactionColor(transaction.transaction_type)}`}>
                        {transaction.transaction_type === 'withdraw' ? '-' : '+'}${parseFloat(transaction.amount).toFixed(2)}
                      </p>
                      {transaction.net_amount && (
                        <p className="text-sm text-gray-500 font-medium">
                          Net: ${parseFloat(transaction.net_amount).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </button>

                  {breakdown && (
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-5 py-4 border-t-2 border-gray-200">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <span className="font-semibold text-gray-600">Voter Paid:</span>
                          <p className="text-lg font-bold text-gray-900">${breakdown.voterPaid.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-red-200">
                          <span className="font-semibold text-red-600">{breakdown.gatewayType} Fee:</span>
                          <p className="text-lg font-bold text-red-600">-${breakdown.gatewayFee.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-orange-200">
                          <span className="font-semibold text-orange-600">Platform Fee:</span>
                          <p className="text-lg font-bold text-orange-600">-${breakdown.platformFee.toFixed(2)}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg border-2 border-green-300">
                          <span className="font-semibold text-green-700">You Received:</span>
                          <p className="text-lg font-bold text-green-700">${breakdown.yourEarnings.toFixed(2)}</p>
                        </div>
                      </div>
                      {breakdown.frozenUntil && (
                        <p className="text-sm text-orange-700 mt-3 bg-orange-50 p-2 rounded-lg border border-orange-200 flex items-center gap-2">
                          <Lock size={14} />
                          <strong>Frozen until:</strong> {breakdown.frozenUntil}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODALS */}
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
//last working code but to improve design above code
// // src/components/Dashboard/Tabs/wallet/CreatorWallet.jsx
// import React, { useState, useEffect } from 'react';
// import { 
//   Wallet, 
//   TrendingUp, 
//   DollarSign, 
//   Lock, 
//   ArrowUpRight, 
//   Calendar,
//   AlertCircle,
//   Gift,
//   Users,
//   Info,
//   CreditCard,
//   CheckCircle,
//   Clock,
//   Award,
//   TrendingDown,
//   Eye,
//   XCircle,
//   RefreshCw
// } from 'lucide-react';
// import { loadStripe } from '@stripe/stripe-js';
// import { useGetMyElectionsQuery } from '../../../../redux/api/election/electionApi';
// import WithdrawalModal from './WithdrawalModal';
// import TransactionDetailsModal from './TransactionDetailsModal';
// import { 
//   useGetCreatorTransactionsQuery, 
//   useGetCreatorWalletQuery, 
//   useGetWalletAnalyticsQuery,
//   useGetEscrowDepositsQuery,
//   useCreateLotteryDepositCheckoutMutation,
//   useConfirmLotteryDepositMutation
// } from '../../../../redux/api/walllet/wallletApi';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { toast } from 'react-toastify';
// /*eslint-disable*/
// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// export default function CreatorWallet() {
//   const location = useLocation();
//   const navigate = useNavigate();

//   // State management
//   const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
//   const [selectedTransaction, setSelectedTransaction] = useState(null);
//   const [selectedElection, setSelectedElection] = useState(null);
//   const [depositingFor, setDepositingFor] = useState(null);
//   const [highlightedElection, setHighlightedElection] = useState(null);
//   const [showDepositBanner, setShowDepositBanner] = useState(false);

//   // API queries
//   const { data: walletData, isLoading: walletLoading, refetch: refetchWallet } = useGetCreatorWalletQuery();
//   const { data: analyticsData } = useGetWalletAnalyticsQuery();
//   const { data: electionsData } = useGetMyElectionsQuery({ page: 1, limit: 50, status: 'all' });
//   const { data: escrowData, refetch: refetchEscrow } = useGetEscrowDepositsQuery();
  
//   const { data: transactionsData, isLoading: transactionsLoading } = useGetCreatorTransactionsQuery({
//     page: 1,
//     limit: 20,
//     electionId: selectedElection,
//   });

//   // Mutations
//   const [createCheckout, { isLoading: checkoutLoading }] = useCreateLotteryDepositCheckoutMutation();
//   const [confirmDeposit] = useConfirmLotteryDepositMutation();

//   // Calculated values
//   const balance = parseFloat(walletData?.balance || 0);
//   const blockedBalance = parseFloat(walletData?.blocked_balance || 0);
//   const totalEscrowed = parseFloat(escrowData?.totalEscrowed || 0);
//   const totalBalance = balance + blockedBalance + totalEscrowed;

//   const totalRevenue = analyticsData?.totalElectionFees || 0;
//   const totalPrizesDistributed = analyticsData?.totalPrizesWon || 0;
//   const totalWithdrawals = analyticsData?.totalWithdrawals || 0;
//   const electionCount = analyticsData?.electionCount || 0;

//   const myElections = electionsData?.elections || [];
//   const escrowDeposits = escrowData?.deposits || [];

//   // ✅ DEBUG: Log elections data
//   useEffect(() => {
//     console.log('🔍 Elections Data:', electionsData);
//     console.log('🔍 My Elections:', myElections);
//     console.log('🔍 Elections Count:', myElections.length);
//     if (myElections.length > 0) {
//       console.log('📦 First Election Sample:', myElections[0]);
//     }
//   }, [electionsData, myElections]);

//   // ✅ Handle redirect from Step4 for deposit
//   useEffect(() => {
//     const pendingElectionId = sessionStorage.getItem('pendingPublishElectionId');
//     const pendingAmount = sessionStorage.getItem('pendingPublishAmount');
    
//     if (location.state?.depositRequired && location.state?.highlightElection) {
//       setHighlightedElection(location.state.highlightElection);
//       setShowDepositBanner(true);
      
//       setTimeout(() => {
//         document.getElementById('elections-section')?.scrollIntoView({ 
//           behavior: 'smooth',
//           block: 'start'
//         });
//       }, 500);
      
//       toast.info(`💰 Please deposit $${pendingAmount} to publish your election`, {
//         autoClose: 7000
//       });
//     }
//   }, [location]);

//   // ✅ Handle Stripe return (payment success)
//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const sessionId = urlParams.get('session_id');
    
//     if (sessionId) {
//       confirmDeposit({ sessionId })
//         .unwrap()
//         .then((result) => {
//           toast.success('✅ Prize deposit confirmed successfully!');
          
//           refetchWallet();
//           refetchEscrow();
          
//           const pendingElectionId = sessionStorage.getItem('pendingPublishElectionId');
          
//           if (pendingElectionId) {
//             setTimeout(() => {
//               toast.success('🎉 Deposit Complete! You can now publish your election.', {
//                 autoClose: 5000,
//                 onClick: () => {
//                   sessionStorage.removeItem('pendingPublishElectionId');
//                   sessionStorage.removeItem('pendingPublishAmount');
//                   navigate('/dashboard/create-election', { 
//                     state: { 
//                       resumeDraft: pendingElectionId,
//                       step: 4 
//                     }
//                   });
//                 }
//               });
//             }, 2000);
//           }
          
//           window.history.replaceState({}, '', window.location.pathname);
//         })
//         .catch((error) => {
//           toast.error('Failed to confirm deposit');
//           console.error(error);
//         });
//     }
//   }, [confirmDeposit, navigate, refetchWallet, refetchEscrow]);

//   // ✅ Handle lottery deposit
//   const handleLotteryDeposit = async (election) => {
//     try {
//       setDepositingFor(election.id);
      
//       // const amount = parseFloat(election.lottery_total_prize_pool || 0);
//       const amount = parseFloat(
//   election.lottery_total_prize_pool || 
//   election.lottery_estimated_value || 
//   0
// );
      
//       if (amount <= 0) {
//         toast.error('Invalid prize pool amount');
//         return;
//       }

//       console.log('💰 Creating checkout for election:', election.id, 'Amount:', amount);

//       const response = await createCheckout({
//         electionId: election.id,
//         amount: amount
//       }).unwrap();

//       console.log('✅ Checkout created:', response);

//       if (response.success && response.checkoutUrl) {
//         window.location.href = response.checkoutUrl;
//       } else {
//         toast.error('Failed to create checkout session');
//       }

//     } catch (error) {
//       console.error('❌ Deposit error:', error);
//       toast.error(error.data?.error || 'Failed to create deposit');
//     } finally {
//       setDepositingFor(null);
//     }
//   };

//   // ✅ Handle deposit button click from header
//   const handleDepositButtonClick = () => {
//     const section = document.getElementById('elections-section');
//     if (section && myElections.length > 0) {
//       section.scrollIntoView({ behavior: 'smooth', block: 'start' });
//       toast.info('📍 Scroll down to see your elections and deposit options');
//     } else {
//       toast.info('Create an election with lottery prizes to deposit funds', {
//         autoClose: 5000
//       });
//     }
//   };

//   // Transaction icon helper
//   const getTransactionIcon = (type) => {
//     switch (type) {
//       case 'election_revenue':
//         return <DollarSign className="text-green-600" size={20} />;
//       case 'prize_won':
//       case 'election_funds_released':
//         return <Gift className="text-purple-600" size={20} />;
//       case 'withdraw':
//         return <ArrowUpRight className="text-blue-600" size={20} />;
//       default:
//         return <Wallet className="text-gray-600" size={20} />;
//     }
//   };

//   // Transaction color helper
//   const getTransactionColor = (type) => {
//     switch (type) {
//       case 'election_revenue':
//       case 'election_funds_released':
//         return 'text-green-600';
//       case 'prize_won':
//         return 'text-purple-600';
//       case 'withdraw':
//         return 'text-red-600';
//       default:
//         return 'text-gray-600';
//     }
//   };

//   // Parse fee breakdown from description
//   const parseFeeBreakdown = (description) => {
//     if (!description) return null;
    
//     const voterPaidMatch = description.match(/Voter paid \$([0-9.]+)/);
//     const stripeFeeMatch = description.match(/Stripe fee: -?\$([0-9.]+)/);
//     const paddleFeeMatch = description.match(/Paddle fee: -?\$([0-9.]+)/);
//     const platformFeeMatch = description.match(/Platform fee: -?\$([0-9.]+)/);
//     const netEarningsMatch = description.match(/Net earnings: \$([0-9.]+)/);
//     const frozenUntilMatch = description.match(/FROZEN until ([0-9/]+)/);

//     if (!voterPaidMatch) return null;

//     return {
//       voterPaid: parseFloat(voterPaidMatch[1]),
//       gatewayFee: parseFloat(stripeFeeMatch?.[1] || paddleFeeMatch?.[1] || 0),
//       gatewayType: stripeFeeMatch ? 'Stripe' : paddleFeeMatch ? 'Paddle' : 'Gateway',
//       platformFee: parseFloat(platformFeeMatch?.[1] || 0),
//       yourEarnings: parseFloat(netEarningsMatch?.[1] || 0),
//       frozenUntil: frozenUntilMatch?.[1]
//     };
//   };

//   if (walletLoading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-xl text-gray-600 font-semibold">Loading creator wallet...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
//       {/* ✅ ENHANCED HEADER WITH DEPOSIT BUTTON */}
//       <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-600">
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
//               <Wallet className="text-blue-600" size={40} />
//               Creator Earnings
//             </h1>
//             <p className="text-gray-600 text-lg">Manage your election revenue, prizes, and withdrawals</p>
//           </div>
          
//           <div className="flex gap-3">
//             <button
//               onClick={handleDepositButtonClick}
//               className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg transform hover:scale-105 font-semibold text-lg"
//             >
//               <Gift size={24} />
//               Deposit Prize Pool
//             </button>

//             <button
//               onClick={() => setShowWithdrawalModal(true)}
//               disabled={balance === 0}
//               className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold text-lg"
//             >
//               <ArrowUpRight size={24} />
//               Withdraw Funds
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* ✅ DEPOSIT REQUIRED BANNER */}
//       {showDepositBanner && (
//         <div className="bg-gradient-to-r from-yellow-100 via-yellow-50 to-orange-50 border-2 border-yellow-500 rounded-2xl p-6 shadow-2xl animate-pulse-slow">
//           <div className="flex items-start gap-4">
//             <div className="w-14 h-14 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
//               <AlertCircle className="text-white" size={28} />
//             </div>
//             <div className="flex-1">
//               <h3 className="text-2xl font-bold text-yellow-900 mb-2 flex items-center gap-2">
//                 🎁 Prize Deposit Required to Publish
//               </h3>
//               <p className="text-yellow-800 text-lg mb-4 leading-relaxed">
//                 Your election has lottery prizes enabled with <strong>creator funding</strong>. 
//                 You must deposit the prize pool before publishing. Find your election below and click 
//                 <strong className="text-yellow-900"> "Deposit Prize Pool"</strong> to continue.
//               </p>
//               <button
//                 onClick={() => setShowDepositBanner(false)}
//                 className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-semibold shadow-md"
//               >
//                 Got it!
//               </button>
//             </div>
//             <button
//               onClick={() => setShowDepositBanner(false)}
//               className="text-yellow-700 hover:text-yellow-900 transition"
//             >
//               <XCircle size={24} />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ✅ WALLET MECHANICS INFO BANNER */}
//       <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-l-4 border-blue-600 rounded-2xl p-6 shadow-lg">
//         <div className="flex items-start gap-4">
//           <Info className="text-blue-600 flex-shrink-0 mt-1" size={28} />
//           <div className="flex-1">
//             <h3 className="font-bold text-blue-900 mb-4 text-2xl">💰 How Your Wallet Works</h3>
            
//             <div className="grid md:grid-cols-2 gap-4 text-sm">
//               {/* Voter Fees */}
//               <div className="bg-white rounded-xl p-5 border-2 border-orange-200 shadow-md hover:shadow-xl transition-all">
//                 <div className="flex items-center gap-3 mb-3">
//                   <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
//                     <Lock className="text-orange-600" size={20} />
//                   </div>
//                   <span className="font-bold text-gray-900 text-lg">Voter Fees (Locked)</span>
//                 </div>
//                 <p className="text-gray-700 leading-relaxed">
//                   When voters pay to participate, funds are <strong className="text-orange-600">locked</strong> until your election ends. 
//                   After deducting payment gateway fees (Stripe 2.9%+$0.30 or Paddle 5%+$0.50) and platform fees (default 5%), 
//                   the remaining amount is <strong>automatically released</strong> to your available balance.
//                 </p>
//               </div>

//               {/* Prize Deposits */}
//               <div className="bg-white rounded-xl p-5 border-2 border-purple-200 shadow-md hover:shadow-xl transition-all">
//                 <div className="flex items-center gap-3 mb-3">
//                   <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
//                     <Gift className="text-purple-600" size={20} />
//                   </div>
//                   <span className="font-bold text-gray-900 text-lg">Prize Deposits (Escrowed)</span>
//                 </div>
//                 <p className="text-gray-700 leading-relaxed">
//                   If you enable lottery prizes with creator funding, you must deposit the prize pool <strong className="text-purple-600">upfront</strong>. 
//                   This amount is held in <strong>escrow</strong> and automatically distributed to winners when 
//                   your election ends. Any unused funds are <strong>returned to you</strong>.
//                 </p>
//               </div>
//             </div>

//             <div className="mt-4 p-4 bg-gradient-to-r from-yellow-100 to-yellow-50 border-l-4 border-yellow-500 rounded-lg">
//               <p className="text-sm text-yellow-900 flex items-start gap-2">
//                 <Info className="flex-shrink-0 mt-0.5" size={16} />
//                 <span>
//                   <strong>Fee Breakdown:</strong> Platform fees vary by subscription (default 5%). Payment gateway fees: 
//                   Stripe (2.9% + $0.30) or Paddle (5% + $0.50). All fees are deducted automatically.
//                 </span>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ✅ BALANCE CARDS */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         {/* Available Balance */}
//         <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-all">
//           <div className="flex items-center justify-between mb-4">
//             <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
//               <Wallet size={28} />
//             </div>
//             <span className="text-blue-100 text-sm font-semibold bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">Available</span>
//           </div>
//           <div className="space-y-2">
//             <p className="text-5xl font-bold drop-shadow-lg">${balance.toFixed(2)}</p>
//             <p className="text-blue-100 text-sm font-medium">Ready to withdraw</p>
//           </div>
//         </div>

//         {/* Locked Balance */}
//         <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-all">
//           <div className="flex items-center justify-between mb-4">
//             <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
//               <Lock size={28} />
//             </div>
//             <span className="text-orange-100 text-sm font-semibold bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">Locked</span>
//           </div>
//           <div className="space-y-2">
//             <p className="text-5xl font-bold drop-shadow-lg">${blockedBalance.toFixed(2)}</p>
//             <p className="text-orange-100 text-sm font-medium">Voter fees (until election ends)</p>
//           </div>
//         </div>

//         {/* Prize Pool Escrow */}
//         <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-all">
//           <div className="flex items-center justify-between mb-4">
//             <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
//               <Gift size={28} />
//             </div>
//             <span className="text-purple-100 text-sm font-semibold bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">Escrowed</span>
//           </div>
//           <div className="space-y-2">
//             <p className="text-5xl font-bold drop-shadow-lg">${totalEscrowed.toFixed(2)}</p>
//             <p className="text-purple-100 text-sm font-medium">Prize deposits</p>
//           </div>
//         </div>

//         {/* Total Balance */}
//         <div className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-all">
//           <div className="flex items-center justify-between mb-4">
//             <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
//               <TrendingUp size={28} />
//             </div>
//             <span className="text-green-100 text-sm font-semibold bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">Total</span>
//           </div>
//           <div className="space-y-2">
//             <p className="text-5xl font-bold drop-shadow-lg">${totalBalance.toFixed(2)}</p>
//             <p className="text-green-100 text-sm font-medium">All funds combined</p>
//           </div>
//         </div>
//       </div>

//       {/* ✅ PRIZE DEPOSITS SECTION */}
//       {escrowDeposits.length > 0 && (
//         <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-purple-600">
//           <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
//             <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
//               <Gift className="text-purple-600" size={24} />
//             </div>
//             Prize Pool Deposits (Escrowed)
//           </h2>
          
//           <div className="space-y-4">
//             {escrowDeposits.map((deposit) => (
//               <div key={deposit.electionId} className="border-2 border-purple-200 rounded-xl p-5 bg-gradient-to-r from-purple-50 to-pink-50 hover:shadow-lg transition-all">
//                 <div className="flex items-center justify-between">
//                   <div className="flex-1">
//                     <h3 className="font-bold text-gray-900 text-lg mb-2">{deposit.electionTitle}</h3>
//                     <div className="flex items-center gap-4 text-sm text-gray-600">
//                       <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                         deposit.status === 'completed' 
//                           ? 'bg-green-100 text-green-700 border border-green-300'
//                           : deposit.status === 'pending'
//                           ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
//                           : 'bg-gray-100 text-gray-700 border border-gray-300'
//                       }`}>
//                         {deposit.status === 'completed' ? '✓ Deposited' : deposit.status}
//                       </span>
//                       {deposit.completedAt && (
//                         <div className="flex items-center gap-1">
//                           <Calendar size={14} />
//                           <span>{new Date(deposit.completedAt).toLocaleDateString()}</span>
//                         </div>
//                       )}
//                       {deposit.endDate && (
//                         <div className="flex items-center gap-1 text-purple-700">
//                           <Clock size={14} />
//                           <span>Locked until: {new Date(deposit.endDate).toLocaleDateString()}</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-sm text-gray-600 font-medium">Escrowed</p>
//                     <p className="text-3xl font-bold text-purple-600">
//                       ${deposit.amount.toFixed(2)}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-purple-50 border-l-4 border-purple-500 rounded-lg">
//             <p className="text-sm text-purple-900 flex items-start gap-2">
//               <Info className="flex-shrink-0 mt-0.5" size={16} />
//               <span>
//                 <strong>Escrow Protection:</strong> These funds are held securely and will be automatically distributed to winners 
//                 when the election ends. Any unused balance will be returned to your available balance immediately.
//               </span>
//             </p>
//           </div>
//         </div>
//       )}

//       {/* ✅ REVENUE STATISTICS */}
//       <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-green-600">
//         <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
//           <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
//             <TrendingUp className="text-green-600" size={24} />
//           </div>
//           Revenue Statistics
//         </h2>
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//           {/* Total Revenue */}
//           <div className="text-center group hover:transform hover:scale-105 transition-all">
//             <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all">
//               <DollarSign className="text-green-600" size={32} />
//             </div>
//             <p className="text-sm text-gray-600 mb-2 font-medium">Total Revenue</p>
//             <p className="text-3xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
//             <p className="text-xs text-gray-500 mt-2 bg-gray-100 px-3 py-1 rounded-full inline-block">
//               {electionCount} election{electionCount !== 1 ? 's' : ''}
//             </p>
//           </div>

//           {/* Prizes Distributed */}
//           <div className="text-center group hover:transform hover:scale-105 transition-all">
//             <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all">
//               <Gift className="text-purple-600" size={32} />
//             </div>
//             <p className="text-sm text-gray-600 mb-2 font-medium">Prizes Distributed</p>
//             <p className="text-3xl font-bold text-purple-600">${totalPrizesDistributed.toFixed(2)}</p>
//             <p className="text-xs text-gray-500 mt-2 bg-gray-100 px-3 py-1 rounded-full inline-block">To winners</p>
//           </div>

//           {/* Total Withdrawn */}
//           <div className="text-center group hover:transform hover:scale-105 transition-all">
//             <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all">
//               <ArrowUpRight className="text-blue-600" size={32} />
//             </div>
//             <p className="text-sm text-gray-600 mb-2 font-medium">Total Withdrawn</p>
//             <p className="text-3xl font-bold text-blue-600">${totalWithdrawals.toFixed(2)}</p>
//             <p className="text-xs text-gray-500 mt-2 bg-gray-100 px-3 py-1 rounded-full inline-block">To bank account</p>
//           </div>

//           {/* Locked Funds */}
//           <div className="text-center group hover:transform hover:scale-105 transition-all">
//             <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all">
//               <Lock className="text-orange-600" size={32} />
//             </div>
//             <p className="text-sm text-gray-600 mb-2 font-medium">Locked Funds</p>
//             <p className="text-3xl font-bold text-orange-600">${blockedBalance.toFixed(2)}</p>
//             <p className="text-xs text-gray-500 mt-2 bg-gray-100 px-3 py-1 rounded-full inline-block">Active elections</p>
//           </div>
//         </div>
//       </div>

//       {/* ✅✅✅ ELECTIONS WITH DEPOSIT ACTIONS - ALWAYS VISIBLE ✅✅✅ */}
//       <div id="elections-section" className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-blue-600">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
//             <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
//               <Award className="text-blue-600" size={24} />
//             </div>
//             Your Elections ({myElections.length})
//           </h2>
//           {myElections.length > 0 && (
//             <div className="flex items-center gap-3">
//               <select
//                 value={selectedElection || ''}
//                 onChange={(e) => setSelectedElection(e.target.value || null)}
//                 className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
//               >
//                 <option value="">All Elections</option>
//                 {myElections.map((election) => (
//                   <option key={election.id} value={election.id}>
//                     {election.title}
//                   </option>
//                 ))}
//               </select>
//               <button
//                 onClick={() => {
//                   refetchWallet();
//                   refetchEscrow();
//                   toast.success('Refreshed!');
//                 }}
//                 className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
//               >
//                 <RefreshCw size={20} className="text-gray-600" />
//               </button>
//             </div>
//           )}
//         </div>

//         {myElections.length === 0 ? (
//           <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
//             <AlertCircle className="mx-auto text-blue-400 mb-4" size={64} />
//             <p className="text-xl text-gray-800 font-semibold mb-2">No elections found</p>
//             <p className="text-gray-600 mb-6">Create an election to start earning revenue!</p>
//             <button
//               onClick={() => navigate('/dashboard/create-election')}
//               className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-semibold inline-flex items-center gap-2"
//             >
//               <Award size={20} />
//               Create Your First Election
//             </button>
//           </div>
//         ) : (
//           <div className="grid gap-5">
//             {myElections.map((election) => {
//               const needsDeposit = election.lottery_enabled && 
//                                    election.lottery_prize_funding_source === 'creator_funded';
//               const hasDeposited = escrowDeposits.some(
//                 d => d.electionId === election.id && d.status === 'completed'
//               );
//               const isHighlighted = highlightedElection === election.id;
              
//               return (
//                 <div
//                   key={election.id}
//                   className={`border-2 rounded-xl p-5 transition-all duration-300 ${
//                     isHighlighted 
//                       ? 'border-yellow-500 bg-gradient-to-r from-yellow-50 via-yellow-100 to-orange-50 shadow-2xl ring-4 ring-yellow-300' 
//                       : needsDeposit && !hasDeposited 
//                       ? 'border-yellow-400 bg-yellow-50 shadow-lg' 
//                       : 'border-gray-200 hover:shadow-xl hover:border-gray-300'
//                   }`}
//                 >
//                   {isHighlighted && needsDeposit && !hasDeposited && (
//                     <div className="mb-4 p-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg shadow-lg">
//                       <p className="text-white font-bold text-center text-lg">
//                         👇 DEPOSIT REQUIRED FOR THIS ELECTION 👇
//                       </p>
//                     </div>
//                   )}

//                   <div className="flex items-start justify-between gap-4">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-3 mb-3">
//                         <h3 className="font-bold text-gray-900 text-xl">{election.title}</h3>
//                         {needsDeposit && !hasDeposited && (
//                           <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-bold shadow-md animate-pulse">
//                             ⚠️ Deposit Required
//                           </span>
//                         )}
//                         {needsDeposit && hasDeposited && (
//                           <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold shadow-md flex items-center gap-1">
//                             <CheckCircle size={14} /> Deposited
//                           </span>
//                         )}
//                       </div>
                      
//                       <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
//                         <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
//                           <Users size={16} />
//                           <span className="font-medium">{election.totalVotes || 0} participants</span>
//                         </div>
//                         <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
//                           <Calendar size={16} />
//                           <span className="font-medium">{new Date(election.created_at).toLocaleDateString()}</span>
//                         </div>
//                         <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
//                           election.status === 'published' 
//                             ? 'bg-green-100 text-green-700 border-green-300'
//                             : election.status === 'completed'
//                             ? 'bg-blue-100 text-blue-700 border-blue-300'
//                             : 'bg-gray-100 text-gray-700 border-gray-300'
//                         }`}>
//                           {election.status?.toUpperCase()}
//                         </span>
//                       </div>

//                       {/* ✅✅✅ DEPOSIT SECTION - SHOWS REGARDLESS OF STATUS ✅✅✅ */}
//                       {needsDeposit && (
//                         <div className={`mt-4 p-4 rounded-xl border-2 ${
//                           hasDeposited 
//                             ? 'bg-green-50 border-green-300'
//                             : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300'
//                         }`}>
//                           <div className="flex items-center justify-between mb-3">
//                             <div>
//                               <p className="text-sm font-bold text-purple-900 flex items-center gap-2">
//                                 <Gift size={16} />
//                                 Prize Pool {hasDeposited ? 'Deposited' : 'Required'}
//                               </p>
//                               <p className="text-xs text-purple-700">
//                                 Creator-funded lottery enabled
//                               </p>
//                             </div>
//                            <p className="text-2xl font-bold text-purple-600">
//   ${parseFloat(
//     election.lottery_total_prize_pool || 
//     election.lottery_estimated_value || 
//     0
//   ).toFixed(2)}
// </p>
//                           </div>
                          
//                           {/* ✅ SHOW DEPOSIT BUTTON IF NOT DEPOSITED (REGARDLESS OF STATUS) */}
//                           {!hasDeposited && (
//                             <button
//                               onClick={() => handleLotteryDeposit(election)}
//                               disabled={depositingFor === election.id || checkoutLoading}
//                               className={`w-full py-3 rounded-xl transition-all font-bold text-lg flex items-center justify-center gap-3 shadow-lg ${
//                                 isHighlighted
//                                   ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white animate-pulse'
//                                   : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
//                               } disabled:opacity-50 disabled:cursor-not-allowed`}
//                             >
//                               {depositingFor === election.id ? (
//                                 <>
//                                   <Clock className="animate-spin" size={24} />
//                                   Processing Payment...
//                                 </>
//                               ) : (
//                                 <>
//                                   <CreditCard size={24} />
//                                   Deposit ${parseFloat(election.lottery_total_prize_pool || 0).toFixed(2)} Prize Pool
//                                 </>
//                               )}
//                             </button>
//                           )}

//                           {/* ✅ SHOW SUCCESS MESSAGE IF DEPOSITED */}
//                           {hasDeposited && (
//                             <div className="text-center py-3 bg-green-100 rounded-lg">
//                               <p className="text-green-700 font-semibold flex items-center justify-center gap-2">
//                                 <CheckCircle size={20} />
//                                 Prize pool successfully deposited!
//                               </p>
//                             </div>
//                           )}
//                         </div>
//                       )}
//                     </div>
                    
//                     <div className="text-right">
//                       <p className="text-sm text-gray-600 font-medium mb-1">Revenue Earned</p>
//                       <p className="text-4xl font-bold text-green-600 mb-1">
//                         ${((election.totalVotes || 0) * (election.general_participation_fee || 0)).toFixed(2)}
//                       </p>
//                       <button
//                         onClick={() => {
//                           toast.info('Opening election details...');
//                         }}
//                         className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
//                       >
//                         <Eye size={14} />
//                         View Details
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* ✅ TRANSACTION HISTORY */}
//       <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-gray-600">
//         <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
//           <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
//             <TrendingDown className="text-gray-600" size={24} />
//           </div>
//           Transaction History
//         </h2>

//         {transactionsLoading ? (
//           <div className="text-center py-12">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
//             <p className="text-gray-600 text-lg">Loading transactions...</p>
//           </div>
//         ) : transactionsData?.transactions?.length === 0 ? (
//           <div className="text-center py-16 bg-gray-50 rounded-xl">
//             <AlertCircle className="mx-auto text-gray-400 mb-4" size={64} />
//             <p className="text-xl text-gray-600">No transactions yet</p>
//             <p className="text-gray-500 mt-2">Your transactions will appear here</p>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {transactionsData?.transactions?.map((transaction) => {
//               const breakdown = parseFeeBreakdown(transaction.description);
              
//               return (
//                 <div key={transaction.id} className="border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all">
//                   <button
//                     onClick={() => setSelectedTransaction(transaction)}
//                     className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition text-left"
//                   >
//                     <div className="flex items-center gap-4">
//                       <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center shadow-md">
//                         {getTransactionIcon(transaction.transaction_type)}
//                       </div>
//                       <div>
//                         <p className="font-bold text-gray-900 text-lg">
//                           {transaction.transaction_type === 'election_revenue' 
//                             ? 'Election Revenue' 
//                             : transaction.transaction_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
//                         </p>
//                         <p className="text-sm text-gray-600 flex items-center gap-2">
//                           <Calendar size={14} />
//                           {new Date(transaction.created_at).toLocaleString()}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <p className={`text-2xl font-bold ${getTransactionColor(transaction.transaction_type)}`}>
//                         {transaction.transaction_type === 'withdraw' ? '-' : '+'}${parseFloat(transaction.amount).toFixed(2)}
//                       </p>
//                       {transaction.net_amount && (
//                         <p className="text-sm text-gray-500 font-medium">
//                           Net: ${parseFloat(transaction.net_amount).toFixed(2)}
//                         </p>
//                       )}
//                     </div>
//                   </button>

//                   {breakdown && (
//                     <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-5 py-4 border-t-2 border-gray-200">
//                       <div className="grid grid-cols-2 gap-3 text-sm">
//                         <div className="bg-white p-3 rounded-lg border border-gray-200">
//                           <span className="font-semibold text-gray-600">Voter Paid:</span>
//                           <p className="text-lg font-bold text-gray-900">${breakdown.voterPaid.toFixed(2)}</p>
//                         </div>
//                         <div className="bg-white p-3 rounded-lg border border-red-200">
//                           <span className="font-semibold text-red-600">{breakdown.gatewayType} Fee:</span>
//                           <p className="text-lg font-bold text-red-600">-${breakdown.gatewayFee.toFixed(2)}</p>
//                         </div>
//                         <div className="bg-white p-3 rounded-lg border border-orange-200">
//                           <span className="font-semibold text-orange-600">Platform Fee:</span>
//                           <p className="text-lg font-bold text-orange-600">-${breakdown.platformFee.toFixed(2)}</p>
//                         </div>
//                         <div className="bg-green-50 p-3 rounded-lg border-2 border-green-300">
//                           <span className="font-semibold text-green-700">You Received:</span>
//                           <p className="text-lg font-bold text-green-700">${breakdown.yourEarnings.toFixed(2)}</p>
//                         </div>
//                       </div>
//                       {breakdown.frozenUntil && (
//                         <p className="text-sm text-orange-700 mt-3 bg-orange-50 p-2 rounded-lg border border-orange-200 flex items-center gap-2">
//                           <Lock size={14} />
//                           <strong>Frozen until election ends:</strong> {breakdown.frozenUntil}
//                         </p>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* MODALS */}
//       {showWithdrawalModal && (
//         <WithdrawalModal
//           balance={balance}
//           currency="USD"
//           onClose={() => setShowWithdrawalModal(false)}
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