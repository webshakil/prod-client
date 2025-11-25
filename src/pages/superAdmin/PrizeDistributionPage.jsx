// src/pages/superAdmin/PrizeDistributionPage.jsx
// ✅ COMPLETE ADMIN PRIZE DISBURSEMENT DASHBOARD
import React, { useState, useMemo } from 'react';
import { 
  Gift, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckSquare,
  Square,
  Settings,
  History,
  Users,
  TrendingUp,
  Hourglass,
  Shield,
  Save,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  useGetPendingApprovalsQuery,
  useGetDisbursementHistoryQuery,
  useGetDisbursementConfigQuery,
  useApproveDisbursementMutation,
  useRejectDisbursementMutation,
  useBulkApproveDisbursementsMutation,
  useUpdateDisbursementConfigMutation,
} from '../../redux/api/lotteryyy/lotteryApi';

// Tab Button Component
/*eslint-disable*/
const TabButton = ({ active, onClick, icon: Icon, label, count }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
      active
        ? 'bg-purple-600 text-white shadow-lg'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    <Icon size={20} />
    {label}
    {count !== undefined && (
      <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
        active ? 'bg-white text-purple-600' : 'bg-gray-300 text-gray-700'
      }`}>
        {count}
      </span>
    )}
  </button>
);

// Status Badge Component
const StatusBadge = ({ status }) => {
  const config = {
    pending_approval: { label: 'Pending Admin', bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
    pending_senior_approval: { label: 'Pending Manager', bg: 'bg-orange-100', text: 'text-orange-800', icon: Shield },
    disbursed: { label: 'Disbursed', bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    rejected: { label: 'Rejected', bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    pending_claim: { label: 'Not Claimed', bg: 'bg-gray-100', text: 'text-gray-800', icon: Hourglass },
  };

  const { label, bg, text, icon: Icon } = config[status] || config.pending_claim;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${bg} ${text}`}>
      <Icon size={14} />
      {label}
    </span>
  );
};

// Rejection Modal Component
const RejectModal = ({ isOpen, onClose, onConfirm, isLoading, winner }) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="text-red-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Reject Disbursement</h3>
            <p className="text-sm text-gray-600">{winner?.winner_name} - ${winner?.prize_amount?.toFixed(2)}</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rejection Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for rejection..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            rows={3}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={isLoading || !reason.trim()}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

// Approval Detail Modal
const ApprovalDetailModal = ({ isOpen, onClose, winner, onApprove, onReject, isApproving }) => {
  const [notes, setNotes] = useState('');

  if (!isOpen || !winner) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <h2 className="text-xl font-bold">Review Disbursement</h2>
          <p className="text-purple-200 text-sm">Winner ID: {winner.winner_id}</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Winner Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Winner Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">Name:</span> {winner.winner_name}</div>
              <div><span className="text-gray-500">User ID:</span> {winner.user_id}</div>
              <div><span className="text-gray-500">Election:</span> {winner.election_title}</div>
              <div><span className="text-gray-500">Rank:</span> #{winner.rank}</div>
            </div>
          </div>

          {/* Prize Info */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Prize Amount</p>
                <p className="text-3xl font-bold text-green-600">${winner.prize_amount?.toFixed(2)}</p>
              </div>
              <StatusBadge status={winner.disbursement_status} />
            </div>
          </div>

          {/* Ticket Info */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {winner.ball_number}
              </div>
              <div>
                <p className="text-sm text-purple-700">Ball #{winner.ball_number}</p>
                <p className="font-mono text-xs text-purple-600">Ticket: {winner.ticket_number}</p>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes for this approval..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              rows={2}
            />
          </div>

          {/* Warning for large amounts */}
          {winner.requires_senior_approval && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="text-orange-600 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-orange-800">
                This disbursement requires <strong>Manager</strong> approval due to the large amount.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onReject(winner)}
            className="px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-semibold flex items-center gap-2"
          >
            <XCircle size={18} />
            Reject
          </button>
          <button
            onClick={() => onApprove(winner.winner_id, notes)}
            disabled={isApproving}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isApproving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CheckCircle size={18} />
            )}
            Approve & Disburse
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function PrizeDistributionPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [detailModal, setDetailModal] = useState({ isOpen: false, winner: null });
  const [rejectModal, setRejectModal] = useState({ isOpen: false, winner: null });

  // API Queries
  const { 
    data: pendingData, 
    isLoading: pendingLoading, 
    refetch: refetchPending 
  } = useGetPendingApprovalsQuery({});

  const { 
    data: historyData, 
    isLoading: historyLoading, 
    refetch: refetchHistory 
  } = useGetDisbursementHistoryQuery({ 
    page: historyPage, 
    limit: 20,
    status: statusFilter || undefined 
  });

  const { 
    data: configData, 
    isLoading: configLoading,
    refetch: refetchConfig 
  } = useGetDisbursementConfigQuery();

  // Mutations
  const [approveDisbursement, { isLoading: isApproving }] = useApproveDisbursementMutation();
  const [rejectDisbursement, { isLoading: isRejecting }] = useRejectDisbursementMutation();
  const [bulkApprove, { isLoading: isBulkApproving }] = useBulkApproveDisbursementsMutation();
  const [updateConfig, { isLoading: isUpdatingConfig }] = useUpdateDisbursementConfigMutation();

  // Extracted Data
  const pendingApprovals = pendingData?.pendingApprovals || [];
  const pendingStats = pendingData?.stats || {};
  const disbursements = historyData?.disbursements || [];
  const pagination = historyData?.pagination || { page: 1, totalPages: 1, total: 0 };
  const config = configData?.current || {};

  // Config state for editing
  const [editingConfig, setEditingConfig] = useState(null);

  // Filter pending approvals
  const filteredPending = useMemo(() => {
    return pendingApprovals.filter(item => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          item.winner_name?.toLowerCase().includes(search) ||
          item.election_title?.toLowerCase().includes(search) ||
          item.user_id?.toString().includes(search)
        );
      }
      return true;
    });
  }, [pendingApprovals, searchTerm]);

  // Handle selection
  const handleSelectItem = (winnerId) => {
    setSelectedItems(prev => 
      prev.includes(winnerId) 
        ? prev.filter(id => id !== winnerId)
        : [...prev, winnerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredPending.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredPending.map(item => item.winner_id));
    }
  };

  // Handle approve
  const handleApprove = async (winnerId, notes = '') => {
    try {
      await approveDisbursement({ winnerId, notes }).unwrap();
      toast.success('✅ Disbursement approved successfully!');
      setDetailModal({ isOpen: false, winner: null });
      refetchPending();
      refetchHistory();
    } catch (err) {
      toast.error(err?.data?.error || 'Failed to approve disbursement');
    }
  };

  // Handle reject
  const handleReject = async (reason) => {
    if (!rejectModal.winner) return;
    try {
      await rejectDisbursement({ 
        winnerId: rejectModal.winner.winner_id, 
        reason 
      }).unwrap();
      toast.success('Disbursement rejected');
      setRejectModal({ isOpen: false, winner: null });
      setDetailModal({ isOpen: false, winner: null });
      refetchPending();
      refetchHistory();
    } catch (err) {
      toast.error(err?.data?.error || 'Failed to reject disbursement');
    }
  };

  // Handle bulk approve
  const handleBulkApprove = async () => {
    if (selectedItems.length === 0) {
      toast.warning('Please select items to approve');
      return;
    }

    try {
      const result = await bulkApprove(selectedItems).unwrap();
      toast.success(`✅ Approved ${result.summary.approved} disbursements ($${result.summary.total_amount_disbursed.toFixed(2)})`);
      if (result.summary.skipped > 0) {
        toast.info(`ℹ️ ${result.summary.skipped} items skipped (require higher approval)`);
      }
      setSelectedItems([]);
      refetchPending();
      refetchHistory();
    } catch (err) {
      toast.error(err?.data?.error || 'Failed to process bulk approval');
    }
  };

  // Handle config update
  const handleUpdateConfig = async (key, value) => {
    try {
      await updateConfig({ config_key: key, config_value: parseFloat(value) }).unwrap();
      toast.success('Configuration updated successfully');
      setEditingConfig(null);
      refetchConfig();
    } catch (err) {
      toast.error(err?.data?.error || 'Failed to update configuration');
    }
  };

  // Refresh all
  const handleRefreshAll = () => {
    refetchPending();
    refetchHistory();
    refetchConfig();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Gift className="text-purple-600" size={32} />
            Prize Distribution
          </h1>
          <p className="text-gray-600 mt-1">Manage lottery prize disbursements and approvals</p>
        </div>
        <button
          onClick={handleRefreshAll}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition inline-flex items-center gap-2 self-start"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pending Approvals</p>
              <p className="text-3xl font-bold">{pendingStats.total_pending || 0}</p>
            </div>
            <Clock size={32} className="opacity-70" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Pending Amount</p>
              <p className="text-3xl font-bold">${(pendingStats.total_amount || 0).toFixed(0)}</p>
            </div>
            <DollarSign size={32} className="opacity-70" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Admin Queue</p>
              <p className="text-3xl font-bold">{pendingStats.pending_approval || 0}</p>
            </div>
            <Users size={32} className="opacity-70" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Manager Queue</p>
              <p className="text-3xl font-bold">{pendingStats.pending_senior_approval || 0}</p>
            </div>
            <Shield size={32} className="opacity-70" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3">
        <TabButton
          active={activeTab === 'pending'}
          onClick={() => setActiveTab('pending')}
          icon={Clock}
          label="Pending Approvals"
          count={pendingStats.total_pending}
        />
        <TabButton
          active={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
          icon={History}
          label="Disbursement History"
        />
        <TabButton
          active={activeTab === 'config'}
          onClick={() => setActiveTab('config')}
          icon={Settings}
          label="Configuration"
        />
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* PENDING APPROVALS TAB */}
        {activeTab === 'pending' && (
          <div>
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, election, or user ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              {selectedItems.length > 0 && (
                <button
                  onClick={handleBulkApprove}
                  disabled={isBulkApproving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isBulkApproving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CheckSquare size={18} />
                  )}
                  Approve Selected ({selectedItems.length})
                </button>
              )}
            </div>

            {/* Table */}
            {pendingLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
                <p className="text-gray-600">Loading pending approvals...</p>
              </div>
            ) : filteredPending.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-bold text-gray-800">All Caught Up!</h3>
                <p className="text-gray-600">No pending disbursements to approve.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <button onClick={handleSelectAll} className="text-gray-500 hover:text-gray-700">
                          {selectedItems.length === filteredPending.length ? (
                            <CheckSquare size={20} />
                          ) : (
                            <Square size={20} />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Winner</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Election</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Claimed</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredPending.map((item) => (
                      <tr key={item.winner_id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <button 
                            onClick={() => handleSelectItem(item.winner_id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {selectedItems.includes(item.winner_id) ? (
                              <CheckSquare size={20} className="text-purple-600" />
                            ) : (
                              <Square size={20} />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">{item.winner_name}</p>
                            <p className="text-xs text-gray-500">ID: {item.user_id}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-900">{item.election_title}</p>
                          <p className="text-xs text-gray-500">Rank #{item.rank}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-lg font-bold text-green-600">
                            ${item.prize_amount?.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={item.disbursement_status} />
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {item.claimed_at 
                            ? new Date(item.claimed_at).toLocaleDateString() 
                            : '-'}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setDetailModal({ isOpen: true, winner: item })}
                              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleApprove(item.winner_id)}
                              disabled={isApproving}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Approve"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => setRejectModal({ isOpen: true, winner: item })}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div>
            {/* Filters */}
            <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setHistoryPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Status</option>
                  <option value="disbursed">Disbursed</option>
                  <option value="pending_approval">Pending Admin</option>
                  <option value="pending_senior_approval">Pending Manager</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Table */}
            {historyLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
                <p className="text-gray-600">Loading disbursement history...</p>
              </div>
            ) : disbursements.length === 0 ? (
              <div className="p-12 text-center">
                <History className="text-gray-400 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-bold text-gray-800">No History Yet</h3>
                <p className="text-gray-600">Disbursement history will appear here.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Winner</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Election</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Processed By</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {disbursements.map((item) => (
                        <tr key={item.winner_id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <p className="font-semibold text-gray-900">{item.winner_name}</p>
                            <p className="text-xs text-gray-500">Rank #{item.rank}</p>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {item.election_title}
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-bold text-green-600">
                              ${item.prize_amount?.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge status={item.disbursement_status} />
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {item.admin_name || '-'}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {item.disbursed_at 
                              ? new Date(item.disbursed_at).toLocaleDateString()
                              : item.claimed_at 
                                ? new Date(item.claimed_at).toLocaleDateString()
                                : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {disbursements.length} of {pagination.total} records
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                      disabled={historyPage <= 1}
                      className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="px-4 py-2 text-sm">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setHistoryPage(p => Math.min(pagination.totalPages, p + 1))}
                      disabled={historyPage >= pagination.totalPages}
                      className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* CONFIG TAB */}
        {activeTab === 'config' && (
          <div className="p-6">
            {configLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
                <p className="text-gray-600">Loading configuration...</p>
              </div>
            ) : (
              <div className="max-w-2xl space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="font-semibold text-blue-800">Disbursement Thresholds</p>
                      <p className="text-sm text-blue-700">
                        These values determine automatic vs. manual approval workflows. Only Managers can modify these settings.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Auto Disburse Threshold */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">Auto Disburse Threshold</h4>
                      <p className="text-sm text-gray-600">
                        Amounts below this are automatically credited to user wallets
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingConfig === 'AUTO_DISBURSE_THRESHOLD' ? (
                        <>
                          <input
                            type="number"
                            defaultValue={config.AUTO_DISBURSE_THRESHOLD}
                            id="auto_threshold_input"
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          <button
                            onClick={() => handleUpdateConfig(
                              'AUTO_DISBURSE_THRESHOLD',
                              document.getElementById('auto_threshold_input').value
                            )}
                            disabled={isUpdatingConfig}
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            <Save size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl font-bold text-green-600">
                            ${config.AUTO_DISBURSE_THRESHOLD?.toLocaleString()}
                          </span>
                          <button
                            onClick={() => setEditingConfig('AUTO_DISBURSE_THRESHOLD')}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            <Settings size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Large Amount Threshold */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">Large Amount Threshold</h4>
                      <p className="text-sm text-gray-600">
                        Amounts above this require Manager approval
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingConfig === 'LARGE_AMOUNT_THRESHOLD' ? (
                        <>
                          <input
                            type="number"
                            defaultValue={config.LARGE_AMOUNT_THRESHOLD}
                            id="large_threshold_input"
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          <button
                            onClick={() => handleUpdateConfig(
                              'LARGE_AMOUNT_THRESHOLD',
                              document.getElementById('large_threshold_input').value
                            )}
                            disabled={isUpdatingConfig}
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            <Save size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl font-bold text-orange-600">
                            ${config.LARGE_AMOUNT_THRESHOLD?.toLocaleString()}
                          </span>
                          <button
                            onClick={() => setEditingConfig('LARGE_AMOUNT_THRESHOLD')}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            <Settings size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Max Daily Auto Disburse */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">Max Daily Auto Disburse</h4>
                      <p className="text-sm text-gray-600">
                        Maximum total amount for automatic daily disbursements
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingConfig === 'MAX_AUTO_DISBURSE_DAILY' ? (
                        <>
                          <input
                            type="number"
                            defaultValue={config.MAX_AUTO_DISBURSE_DAILY}
                            id="max_daily_input"
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          <button
                            onClick={() => handleUpdateConfig(
                              'MAX_AUTO_DISBURSE_DAILY',
                              document.getElementById('max_daily_input').value
                            )}
                            disabled={isUpdatingConfig}
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            <Save size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl font-bold text-purple-600">
                            ${config.MAX_AUTO_DISBURSE_DAILY?.toLocaleString()}
                          </span>
                          <button
                            onClick={() => setEditingConfig('MAX_AUTO_DISBURSE_DAILY')}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            <Settings size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Threshold Explanation */}
                <div className="bg-gray-50 rounded-lg p-5 mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">How It Works</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span><strong>&lt; ${config.AUTO_DISBURSE_THRESHOLD?.toLocaleString()}</strong> → Auto-disbursed to wallet</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span><strong>${config.AUTO_DISBURSE_THRESHOLD?.toLocaleString()} - ${config.LARGE_AMOUNT_THRESHOLD?.toLocaleString()}</strong> → Requires Admin approval</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span><strong>&gt; ${config.LARGE_AMOUNT_THRESHOLD?.toLocaleString()}</strong> → Requires Manager approval</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <ApprovalDetailModal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, winner: null })}
        winner={detailModal.winner}
        onApprove={handleApprove}
        onReject={(winner) => {
          setDetailModal({ isOpen: false, winner: null });
          setRejectModal({ isOpen: true, winner });
        }}
        isApproving={isApproving}
      />

      <RejectModal
        isOpen={rejectModal.isOpen}
        onClose={() => setRejectModal({ isOpen: false, winner: null })}
        onConfirm={handleReject}
        isLoading={isRejecting}
        winner={rejectModal.winner}
      />
    </div>
  );
}
