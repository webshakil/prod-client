import React, { useState } from 'react';
import { 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Loader, 
  Clock,
  User,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  useGetWithdrawalRequestsQuery,
  useApproveWithdrawalMutation,
  useRejectWithdrawalMutation 
} from '../../../../redux/api/voting/votingApi';
import { toast } from 'react-toastify';

export default function WithdrawalApprovalAdmin() {
  const [filter, setFilter] = useState('pending');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectNotes, setRejectNotes] = useState('');

  const { data: withdrawalsData, isLoading } = useGetWithdrawalRequestsQuery({ status: filter });
  const [approveWithdrawal, { isLoading: approving }] = useApproveWithdrawalMutation();
  const [rejectWithdrawal, { isLoading: rejecting }] = useRejectWithdrawalMutation();

  const withdrawals = withdrawalsData?.data || [];

  const handleApprove = async (requestId) => {
    if (!confirm('Are you sure you want to approve this withdrawal?')) return;

    try {
      const result = await approveWithdrawal(requestId).unwrap();
      if (result.success) {
        toast.success('Withdrawal approved successfully!');
      }
    } catch (error) {
      console.error('Approval error:', error);
      toast.error(error?.data?.message || 'Failed to approve withdrawal');
    }
  };

  const handleReject = async (requestId) => {
    if (!rejectNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      const result = await rejectWithdrawal({ requestId, notes: rejectNotes }).unwrap();
      if (result.success) {
        toast.success('Withdrawal rejected');
        setRejectingId(null);
        setRejectNotes('');
      }
    } catch (error) {
      console.error('Rejection error:', error);
      toast.error(error?.data?.message || 'Failed to reject withdrawal');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {status}
      </span>
    );
  };

  if (isLoading) {
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Withdrawal Approvals</h2>
        <p className="text-gray-600">Review and approve withdrawal requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">
                {withdrawals.filter(w => w.status === 'pending').length}
              </p>
            </div>
            <Clock className="text-yellow-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Approved</p>
              <p className="text-3xl font-bold text-green-600">
                {withdrawals.filter(w => w.status === 'approved').length}
              </p>
            </div>
            <CheckCircle className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Rejected</p>
              <p className="text-3xl font-bold text-red-600">
                {withdrawals.filter(w => w.status === 'rejected').length}
              </p>
            </div>
            <XCircle className="text-red-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Amount</p>
              <p className="text-3xl font-bold text-blue-600">
                ${withdrawals.reduce((sum, w) => sum + parseFloat(w.amount || 0), 0).toFixed(2)}
              </p>
            </div>
            <DollarSign className="text-blue-600" size={32} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'rejected'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rejected
          </button>
          <button
            onClick={() => setFilter('')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === ''
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Withdrawals List */}
      <div className="space-y-4">
        {withdrawals.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <DollarSign size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Withdrawal Requests</h3>
            <p className="text-gray-600">There are no withdrawal requests matching your filter.</p>
          </div>
        ) : (
          withdrawals.map((withdrawal) => (
            <div key={withdrawal.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1">{withdrawal.user_name}</h3>
                      <p className="text-sm text-gray-600">{withdrawal.user_email}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <Calendar size={14} />
                        {new Date(withdrawal.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-800 mb-1">
                      ${parseFloat(withdrawal.amount).toFixed(2)}
                    </p>
                    {getStatusBadge(withdrawal.status)}
                  </div>
                </div>

                {/* Payment Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Payment Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Payment Method</p>
                      <p className="font-medium capitalize">{withdrawal.payment_method}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Account Email</p>
                      <p className="font-medium">{withdrawal.payment_details?.accountEmail}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Account Name</p>
                      <p className="font-medium">{withdrawal.payment_details?.accountName}</p>
                    </div>
                    {withdrawal.payment_details?.bankAccount && (
                      <div>
                        <p className="text-gray-600 mb-1">Bank Account</p>
                        <p className="font-medium font-mono">{withdrawal.payment_details.bankAccount}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rejection Notes */}
                {withdrawal.status === 'rejected' && withdrawal.rejection_notes && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="font-semibold text-red-900 mb-1">Rejection Reason</p>
                        <p className="text-sm text-red-800">{withdrawal.rejection_notes}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions for Pending */}
                {withdrawal.status === 'pending' && (
                  <div className="flex gap-3">
                    {rejectingId === withdrawal.id ? (
                      <div className="flex-1 space-y-3">
                        <textarea
                          value={rejectNotes}
                          onChange={(e) => setRejectNotes(e.target.value)}
                          placeholder="Enter reason for rejection..."
                          rows={3}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setRejectingId(null);
                              setRejectNotes('');
                            }}
                            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReject(withdrawal.id)}
                            disabled={rejecting}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                          >
                            {rejecting ? 'Rejecting...' : 'Confirm Reject'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setRejectingId(withdrawal.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition"
                        >
                          <XCircle size={20} />
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(withdrawal.id)}
                          disabled={approving}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                          {approving ? (
                            <>
                              <Loader className="animate-spin" size={20} />
                              Approving...
                            </>
                          ) : (
                            <>
                              <CheckCircle size={20} />
                              Approve
                            </>
                          )}
                        </button>
                      </>
                    )}
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