import React, { useState } from 'react';
import { 
  Vote, 
  Calendar, 
  CheckCircle, 
  Edit3, 
  Eye, 
  Download,
  Loader,
  Search,
  Filter
} from 'lucide-react';
import { useGetVotingHistoryQuery } from '../../../redux/api/voting/votingApi';
import { useNavigate } from 'react-router-dom';

export default function VoteHistoryTab() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
  });

  const { data: historyData, isLoading } = useGetVotingHistoryQuery(filters);
  const votes = historyData?.data?.votes || [];
  const pagination = historyData?.data?.pagination || {};

  const filteredVotes = votes.filter(vote => 
    vote.election_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getVoteStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      edited: 'bg-blue-100 text-blue-800',
      flagged: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.pending}`}>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Vote History</h1>
          <p className="text-gray-600">Track all your voting activity</p>
        </div>
        <button
          onClick={() => {/* Export functionality */}}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Download size={20} />
          Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Votes</p>
              <p className="text-3xl font-bold text-gray-800">{votes.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Vote className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Edited Votes</p>
              <p className="text-3xl font-bold text-gray-800">
                {votes.filter(v => v.vote_status === 'edited').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Edit3 className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">This Month</p>
              <p className="text-3xl font-bold text-gray-800">
                {votes.filter(v => {
                  const voteDate = new Date(v.created_at);
                  const now = new Date();
                  return voteDate.getMonth() === now.getMonth() && 
                         voteDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Calendar className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by election name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition">
            <Filter size={20} />
            Filter
          </button>
        </div>
      </div>

      {/* Votes List */}
      <div className="space-y-4">
        {filteredVotes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Vote size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Votes Yet</h3>
            <p className="text-gray-600 mb-6">
              Start voting in elections to see your history here!
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Browse Elections
            </button>
          </div>
        ) : (
          filteredVotes.map((vote) => (
            <div key={vote.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {vote.election_title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        {new Date(vote.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle size={16} />
                        Vote ID: {vote.voting_id?.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getVoteStatusBadge(vote.vote_status)}
                  </div>
                </div>

                {/* Receipt Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Receipt ID</p>
                      <p className="font-mono text-xs text-gray-800 break-all">
                        {vote.receipt_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Vote Hash</p>
                      <p className="font-mono text-xs text-gray-800 break-all">
                        {vote.vote_hash?.slice(0, 32)}...
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lottery Info */}
                {vote.has_lottery_ticket && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {vote.lottery_ball_number}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-purple-900">Lottery Entry Created</p>
                        <p className="text-xs text-purple-600">
                          Ball #{vote.lottery_ball_number} • {vote.lottery_status || 'Pending Draw'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Edit History */}
                {vote.vote_status === 'edited' && vote.edit_count > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-800">
                      <Edit3 size={14} className="inline mr-1" />
                      This vote has been edited {vote.edit_count} time(s). 
                      Last edited: {new Date(vote.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/verify/${vote.receipt_id}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
                  >
                    <Eye size={20} />
                    Verify Vote
                  </button>
                  
                  {vote.can_edit && (
                    <button
                      onClick={() => navigate(`/vote/${vote.election_slug}`)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Edit3 size={20} />
                      Edit Vote
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">
            Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of {pagination.total} votes
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
    </div>
  );
}