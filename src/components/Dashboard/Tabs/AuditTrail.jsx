import React, { useState, useEffect } from 'react';
import { Search, Filter, Shield, Lock, CheckCircle, AlertCircle, Hash, Database, Link2, Eye, Download } from 'lucide-react';

export default function AuditTrail() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [hashChain, setHashChain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    actionType: '',
    electionId: '',
  });
  const [showHashChain, setShowHashChain] = useState(false);
  const [selectedElectionForHash, setSelectedElectionForHash] = useState('');

  // Get API URL
  const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3006/api';

  // Get user data from localStorage
  const getUserData = () => {
    try {
      const persistRoot = localStorage.getItem('persist:vottery-root');
      if (persistRoot) {
        const parsed = JSON.parse(persistRoot);
        const authData = parsed.auth ? JSON.parse(parsed.auth) : {};
        return {
          userId: authData.userData?.userId,
          email: authData.userData?.email,
          token: authData.token,
        };
      }
    } catch (error) {
      console.error('Error reading user data:', error);
    }
    return null;
  };

  // Get vote data from localStorage
  const getVoteData = () => {
    try {
      const persistRoot = localStorage.getItem('persist:vottery-root');
      if (persistRoot) {
        const parsed = JSON.parse(persistRoot);
        const voteData = parsed.vote ? JSON.parse(parsed.vote) : {};
        return voteData;
      }
    } catch (error) {
      console.error('Error reading vote data:', error);
    }
    return null;
  };

  useEffect(() => {
    fetchAuditData();
  }, [page, filters]);

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      const userData = getUserData();
      
      // Build query params
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.actionType && { actionType: filters.actionType }),
        ...(filters.electionId && { electionId: filters.electionId }),
      });

      // Fetch audit logs
      const logsResponse = await fetch(
        `${API_URL}/votes/audit-trail?${queryParams}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(userData?.token && { 'Authorization': `Bearer ${userData.token}` }),
          },
        }
      );
      const logsData = await logsResponse.json();

      // Fetch stats
      const statsResponse = await fetch(`${API_URL}/votes/audit-stats`, {
        headers: {
          'Content-Type': 'application/json',
          ...(userData?.token && { 'Authorization': `Bearer ${userData.token}` }),
        },
      });
      const statsData = await statsResponse.json();

      if (logsData.success) {
        setAuditLogs(logsData.data.auditLogs);
        setPagination(logsData.data.pagination);
      }

      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('❌ Error fetching audit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHashChain = async (electionId) => {
    try {
      const userData = getUserData();
      
      const response = await fetch(`${API_URL}/votes/hash-chain/${electionId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(userData?.token && { 'Authorization': `Bearer ${userData.token}` }),
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setHashChain(data.data);
        setShowHashChain(true);
      }
    } catch (error) {
      console.error('❌ Error fetching hash chain:', error);
    }
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'vote_cast':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'vote_edited':
        return <AlertCircle className="text-yellow-600" size={20} />;
      case 'vote_verified':
        return <Shield className="text-blue-600" size={20} />;
      case 'video_completed':
        return <Eye className="text-purple-600" size={20} />;
      default:
        return <Lock className="text-gray-600" size={20} />;
    }
  };

  const getActionColor = (actionType) => {
    switch (actionType) {
      case 'vote_cast':
        return 'bg-green-100 text-green-800';
      case 'vote_edited':
        return 'bg-yellow-100 text-yellow-800';
      case 'vote_verified':
        return 'bg-blue-100 text-blue-800';
      case 'video_completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const voteData = getVoteData();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔒 Audit Trail & Blockchain Verification
          </h1>
          <p className="text-gray-600">
            Immutable log system with cryptographic proof for all voting actions
          </p>
          
          {/* Show current user's vote info if available */}
          {voteData && voteData.hasVoted && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Your Last Vote:</strong> Election #{voteData.electionId} - {voteData.electionTitle}
              </p>
              <p className="text-xs text-blue-700 mt-1 font-mono">
                Vote ID: {voteData.voteId?.substring(0, 16)}...
              </p>
              <p className="text-xs text-blue-700 font-mono">
                Receipt: {voteData.receiptId?.substring(0, 16)}...
              </p>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Actions</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.overall.total_actions}
                  </p>
                </div>
                <Shield className="text-blue-600" size={40} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unique Users</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.overall.unique_users}
                  </p>
                </div>
                <CheckCircle className="text-green-600" size={40} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Votes</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.votes.total_votes}
                  </p>
                </div>
                <Lock className="text-purple-600" size={40} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Actions (24h)</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.recentActivity.actions_24h}
                  </p>
                </div>
                <AlertCircle className="text-orange-600" size={40} />
              </div>
            </div>
          </div>
        )}

        {/* Action Type Breakdown */}
        {stats && stats.actionTypes && stats.actionTypes.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              📊 Action Type Distribution
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.actionTypes.map((action) => (
                <div
                  key={action.action_type}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
                >
                  {getActionIcon(action.action_type)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {action.action_type.replace(/_/g, ' ').toUpperCase()}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{action.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vote Statistics */}
        {stats && stats.votes && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              🗳️ Voting Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-600">Total Votes</p>
                <p className="text-2xl font-bold text-purple-900">{stats.votes.total_votes}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-600">Unique Voters</p>
                <p className="text-2xl font-bold text-blue-900">{stats.votes.unique_voters}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-600">Elections</p>
                <p className="text-2xl font-bold text-green-900">{stats.votes.elections_voted}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-600">Valid Votes</p>
                <p className="text-2xl font-bold text-teal-900">{stats.votes.valid_votes}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-600">Edited Votes</p>
                <p className="text-2xl font-bold text-orange-900">{stats.votes.edited_votes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Blockchain Hash Chain Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Hash className="text-indigo-600" />
            Blockchain-Style Hash Chain Verification
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            View the cryptographic hash chain for any election to verify vote integrity
          </p>
          <div className="flex gap-4">
            <input
              type="number"
              value={selectedElectionForHash}
              onChange={(e) => setSelectedElectionForHash(e.target.value)}
              placeholder="Enter Election ID"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
            />
            <button
              onClick={() => selectedElectionForHash && fetchHashChain(selectedElectionForHash)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              disabled={!selectedElectionForHash}
            >
              <Link2 size={16} />
              Generate Hash Chain
            </button>
          </div>

          {/* Hash Chain Display */}
          {showHashChain && hashChain && (
            <div className="mt-6 border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Hash Chain for Election #{hashChain.electionId}
                </h3>
                <button
                  onClick={() => setShowHashChain(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm"><strong>Total Blocks:</strong> {hashChain.totalBlocks}</p>
                <p className="text-sm font-mono text-xs mt-2">
                  <strong>Latest Block Hash:</strong><br />
                  {hashChain.latestBlockHash}
                </p>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {hashChain.hashChain.map((block) => (
                  <div
                    key={block.blockNumber}
                    className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-indigo-900">
                        Block #{block.blockNumber}
                      </span>
                      <span className="text-xs text-gray-600">
                        {new Date(block.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs font-mono">
                      <p className="text-gray-700">
                        <strong>Vote Hash:</strong> {block.voteHash.substring(0, 32)}...
                      </p>
                      <p className="text-gray-700">
                        <strong>Previous Hash:</strong> {block.previousHash.substring(0, 32)}...
                      </p>
                      <p className="text-indigo-700">
                        <strong>Block Hash:</strong> {block.blockHash.substring(0, 32)}...
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Filter size={20} />
            Filter Audit Logs
          </h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action Type
              </label>
              <select
                value={filters.actionType}
                onChange={(e) => {
                  setFilters({ ...filters, actionType: e.target.value });
                  setPage(1);
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Actions</option>
                <option value="vote_cast">Vote Cast</option>
                <option value="vote_edited">Vote Edited</option>
                <option value="vote_verified">Vote Verified</option>
                <option value="video_completed">Video Completed</option>
                <option value="video_started">Video Started</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Election ID
              </label>
              <input
                type="number"
                value={filters.electionId}
                onChange={(e) => {
                  setFilters({ ...filters, electionId: e.target.value });
                  setPage(1);
                }}
                placeholder="Enter Election ID"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({ actionType: '', electionId: '' });
                  setPage(1);
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Database size={20} />
              Audit Log Entries
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading audit logs...</p>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Database size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No audit logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Election
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vote Hash
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Receipt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getActionColor(
                            log.action_type
                          )}`}
                        >
                          {getActionIcon(log.action_type)}
                          {log.action_type.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                        #{log.election_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                        {log.user_id ? `${log.user_id.substring(0, 8)}...` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                        {log.vote_hash ? (
                          <span title={log.vote_hash}>
                            {log.vote_hash.substring(0, 12)}...
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                        {log.receipt_id ? (
                          <span title={log.receipt_id}>
                            {log.receipt_id.substring(0, 8)}...
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs px-2 py-1 rounded font-semibold ${
                          log.vote_status === 'valid' ? 'bg-green-100 text-green-800' :
                          log.vote_status === 'edited' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.vote_status || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination && auditLogs.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="text-sm text-gray-700">
                Showing page {pagination.page} of {pagination.totalPages} 
                <span className="text-gray-500 ml-2">
                  ({pagination.total} total entries)
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-bold text-gray-900 mb-2">🔐 About This Audit Trail</h3>
          <p className="text-sm text-gray-700 mb-2">
            This audit trail provides a complete, immutable record of all voting activities. Every action is cryptographically hashed and linked in a blockchain-style chain, ensuring tamper-evident logging.
          </p>
          <p className="text-xs text-gray-600">
            <strong>Features:</strong> SHA-256 hashing, Hash chain verification, Timestamp proof, IP tracking, User agent logging, Vote integrity checking
          </p>
        </div>
      </div>
    </div>
  );
}
// import React from 'react';

// export default function AuditTrail() {
//   const auditLogs = [
//     { id: 1, user: 'Admin', action: 'Created Election', target: 'Feature Request', timestamp: '2 hours ago', status: 'success' },
//     { id: 2, user: 'jane@example.com', action: 'Voted', target: 'Design Theme', timestamp: '3 hours ago', status: 'success' },
//     { id: 3, user: 'bob@example.com', action: 'Flagged Vote', target: 'API Updates', timestamp: '5 hours ago', status: 'warning' },
//     { id: 4, user: 'Admin', action: 'Deleted User', target: 'spam_user@example.com', timestamp: '1 day ago', status: 'danger' },
//     { id: 5, user: 'Admin', action: 'Promoted User', target: 'jane@example.com', timestamp: '2 days ago', status: 'success' },
//   ];

//   return (
//     <div>
//       <h1 className="text-3xl font-bold mb-6">Audit Trail shakil</h1>

//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b">
//               <tr>
//                 <th className="px-6 py-3 text-left text-sm font-semibold">User</th>
//                 <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
//                 <th className="px-6 py-3 text-left text-sm font-semibold">Target</th>
//                 <th className="px-6 py-3 text-left text-sm font-semibold">Timestamp</th>
//                 <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {auditLogs.map((log) => (
//                 <tr key={log.id} className="border-b hover:bg-gray-50">
//                   <td className="px-6 py-4 text-sm font-semibold">{log.user}</td>
//                   <td className="px-6 py-4 text-sm">{log.action}</td>
//                   <td className="px-6 py-4 text-sm text-gray-600">{log.target}</td>
//                   <td className="px-6 py-4 text-sm text-gray-500">{log.timestamp}</td>
//                   <td className="px-6 py-4 text-sm">
//                     <span className={`text-xs px-2 py-1 rounded font-semibold ${
//                       log.status === 'success' ? 'bg-green-100 text-green-800' :
//                       log.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
//                       'bg-red-100 text-red-800'
//                     }`}>
//                       {log.status}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }