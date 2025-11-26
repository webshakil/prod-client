// Updated AuditTrail.jsx - Better hash chain display with explanation
import React, { useState} from 'react';
import { 
  Shield, Lock, CheckCircle, AlertCircle, Hash, Database, Link2, 
  Eye, Download, RefreshCw, TrendingUp, Users, Activity, 
  FileText, AlertTriangle, Filter, Search, Info, Blocks,
  GitBranch, Clock, Fingerprint
} from 'lucide-react';
import { useGetAuditLogsQuery,useGetAuditStatsQuery,useLazyGetHashChainQuery,useLazyVerifyIntegrityQuery, useLazyExportAuditTrailQuery,useGetVoteVerificationsQuery} from '../../../redux/api/verification/auditTrailApi';
// import {
//   useGetAuditLogsQuery,
//   useGetAuditStatsQuery,
//   useLazyGetHashChainQuery,
//   useLazyVerifyIntegrityQuery,
//   useLazyExportAuditTrailQuery,
//   useGetVoteVerificationsQuery,
// } from '../../redux/api/verification/auditTrailApi';

export default function AuditTrail() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    actionType: '',
    electionId: '',
    startDate: '',
    endDate: '',
  });
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [showHashChain, setShowHashChain] = useState(false);
  const [showIntegrityCheck, setShowIntegrityCheck] = useState(false);
  const [showBlockchainInfo, setShowBlockchainInfo] = useState(false);

  // RTK Query Hooks
  const { 
    data: logsData, 
    isLoading: logsLoading, 
    refetch: refetchLogs 
  } = useGetAuditLogsQuery({
    page,
    limit: 20,
    ...filters
  });

  const { 
    data: statsData, 
    isLoading: statsLoading,
    refetch: refetchStats
  } = useGetAuditStatsQuery(filters.electionId || undefined);

  const { 
    /*eslint-disable*/
    data: verificationsData 
  } = useGetVoteVerificationsQuery({
    electionId: filters.electionId || undefined,
    page: 1,
    limit: 10
  });

  const [getHashChain, { data: hashChainData, isLoading: hashChainLoading }] = useLazyGetHashChainQuery();
  const [verifyIntegrity, { data: integrityData, isLoading: integrityLoading }] = useLazyVerifyIntegrityQuery();
  const [exportAudit, { isLoading: exportLoading }] = useLazyExportAuditTrailQuery();

  const auditLogs = logsData?.data?.auditLogs || [];
  const pagination = logsData?.data?.pagination;
  const stats = statsData?.data;

  const handleRefresh = () => {
    refetchLogs();
    refetchStats();
  };

  const handleFetchHashChain = async () => {
    if (!selectedElectionId) {
      alert('Please enter an Election ID');
      return;
    }
    await getHashChain({ electionId: selectedElectionId, limit: 100 });
    setShowHashChain(true);
  };

  const handleVerifyIntegrity = async () => {
    if (!selectedElectionId) {
      alert('Please enter an Election ID');
      return;
    }
    await verifyIntegrity(selectedElectionId);
    setShowIntegrityCheck(true);
  };

  const handleExport = async (format) => {
    if (!selectedElectionId) {
      alert('Please enter an Election ID');
      return;
    }
    
    try {
      const result = await exportAudit({ 
        electionId: selectedElectionId, 
        format,
        startDate: filters.startDate,
        endDate: filters.endDate
      }).unwrap();

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-trail-${selectedElectionId}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export audit trail');
    }
  };

  const getActionIcon = (actionType) => {
    const icons = {
      'duplicate_vote': <AlertCircle className="text-yellow-600" size={18} />,
      'suspicious_activity': <AlertTriangle className="text-red-600" size={18} />,
      'vote_cast': <CheckCircle className="text-green-600" size={18} />,
      'vote_verified': <Shield className="text-blue-600" size={18} />,
    };
    return icons[actionType] || <Lock className="text-gray-600" size={18} />;
  };

  const getActionColor = (actionType) => {
    const colors = {
      'duplicate_vote': 'bg-yellow-100 text-yellow-800',
      'suspicious_activity': 'bg-red-100 text-red-800',
      'vote_cast': 'bg-green-100 text-green-800',
      'vote_verified': 'bg-blue-100 text-blue-800',
    };
    return colors[actionType] || 'bg-gray-100 text-gray-800';
  };

  const clearFilters = () => {
    setFilters({ actionType: '', electionId: '', startDate: '', endDate: '' });
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Shield className="text-blue-600" size={32} />
                Audit Trail & Blockchain Verification
              </h1>
              <p className="text-gray-600">
                Industry-standard immutable audit logging with cryptographic verification
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBlockchainInfo(!showBlockchainInfo)}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 flex items-center gap-2"
              >
                <Info size={16} />
                How It Works
              </button>
              <button
                onClick={handleRefresh}
                disabled={logsLoading || statsLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={16} className={logsLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Blockchain Info Panel */}
        {showBlockchainInfo && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6 mb-8 border border-indigo-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                <Blocks size={24} />
                Understanding Blockchain-Style Audit Trail
              </h2>
              <button onClick={() => setShowBlockchainInfo(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* How it works */}
              <div className="bg-white rounded-lg p-4 shadow">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <GitBranch size={18} className="text-indigo-600" />
                  How Hash Chain Works
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <p><strong>Each vote creates a block</strong> - When someone votes, a new block is added to the chain with the vote hash.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <p><strong>Blocks link together</strong> - Each block contains the hash of the previous block, creating an unbreakable chain.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <p><strong>Tampering is detectable</strong> - If anyone changes a vote, the hash changes, breaking the chain.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                    <p><strong>Merkle Root</strong> - A single hash representing ALL votes for quick verification.</p>
                  </div>
                </div>
              </div>

              {/* Visual representation */}
              <div className="bg-white rounded-lg p-4 shadow">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Link2 size={18} className="text-green-600" />
                  Chain Structure
                </h3>
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto">
                  <pre>{`
┌─────────┐    ┌─────────┐    ┌─────────┐
│ Block 1 │───▶│ Block 2 │───▶│ Block 3 │
│ Vote #1 │    │ Vote #2 │    │ Vote #3 │
└────┬────┘    └────┬────┘    └────┬────┘
     │              │              │
prev:000...   prev:abc...    prev:def...
hash:abc...   hash:def...    hash:ghi...
                  `}</pre>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  <strong>Genesis block</strong> starts with zeros. Each subsequent block links to the previous.
                </p>
              </div>

              {/* What each field means */}
              <div className="bg-white rounded-lg p-4 shadow md:col-span-2">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Fingerprint size={18} className="text-purple-600" />
                  Block Fields Explained
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold text-gray-900">Vote Hash</p>
                    <p className="text-gray-600 text-xs">SHA-256 hash of the vote data. Unique fingerprint of each vote.</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold text-gray-900">Previous Hash</p>
                    <p className="text-gray-600 text-xs">Hash of the previous block. Creates the chain linkage.</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold text-gray-900">Block Hash</p>
                    <p className="text-gray-600 text-xs">Hash of the entire block (vote + previous hash + timestamp).</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold text-gray-900">Merkle Root</p>
                    <p className="text-gray-600 text-xs">Single hash representing ALL votes. Used for quick verification.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>💡 Why only 1 block?</strong> The hash chain shows blocks <strong>per election</strong>. 
                If an election has 1 vote, you'll see 1 block. If it has 100 votes, you'll see 100 blocks. 
                The integrity check may show totals across ALL elections.
              </p>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Actions</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.overall?.total_actions || 0}
                  </p>
                </div>
                <Shield className="text-blue-600" size={40} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unique Users</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.overall?.unique_users || 0}
                  </p>
                </div>
                <Users className="text-green-600" size={40} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Normal Votes</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.votes?.total_votes || 0}
                  </p>
                </div>
                <CheckCircle className="text-purple-600" size={40} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Anonymous Votes</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.votes?.total_anonymous_votes || 0}
                  </p>
                </div>
                <Eye className="text-indigo-600" size={40} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Last 24 Hours</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.recentActivity?.actions_24h || 0}
                  </p>
                </div>
                <TrendingUp className="text-orange-600" size={40} />
              </div>
            </div>
          </div>
        )}

        {/* Action Type Breakdown */}
        {stats?.actionTypes && stats.actionTypes.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity size={20} />
              Action Type Distribution
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
                      {action.action_type?.replace(/_/g, ' ') || 'Unknown'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{action.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Blockchain Verification Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Hash className="text-indigo-600" />
            Blockchain-Style Verification
            <span className="text-xs font-normal bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full ml-2">
              SHA-256 + Merkle Tree
            </span>
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Verify election integrity using cryptographic hash chains. Each vote creates a block linked to the previous one.
          </p>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Election ID</label>
              <input
                type="number"
                value={selectedElectionId}
                onChange={(e) => setSelectedElectionId(e.target.value)}
                placeholder="Enter Election ID (e.g., 41, 60)"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleFetchHashChain}
                disabled={!selectedElectionId || hashChainLoading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Link2 size={16} />
                {hashChainLoading ? 'Loading...' : 'View Hash Chain'}
              </button>
              <button
                onClick={handleVerifyIntegrity}
                disabled={!selectedElectionId || integrityLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Shield size={16} />
                {integrityLoading ? 'Verifying...' : 'Verify Integrity'}
              </button>
              <button
                onClick={() => handleExport('json')}
                disabled={!selectedElectionId || exportLoading}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Download size={16} />
                {exportLoading ? 'Exporting...' : 'Export'}
              </button>
            </div>
          </div>

          {/* Integrity Check Result */}
          {showIntegrityCheck && integrityData && (
            <div className={`mb-6 p-4 rounded-lg border-2 ${
              integrityData.verified 
                ? 'bg-green-50 border-green-500' 
                : 'bg-red-50 border-red-500'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                {integrityData.verified ? (
                  <CheckCircle className="text-green-600" size={24} />
                ) : (
                  <AlertTriangle className="text-red-600" size={24} />
                )}
                <h3 className="text-lg font-bold">
                  {integrityData.verified ? 'Integrity Verified ✓' : 'Integrity Issues Detected'}
                </h3>
                {integrityData.integrityScore !== undefined && (
                  <span className={`ml-auto text-sm font-bold px-3 py-1 rounded-full ${
                    integrityData.integrityScore >= 90 ? 'bg-green-200 text-green-800' :
                    integrityData.integrityScore >= 70 ? 'bg-yellow-200 text-yellow-800' :
                    'bg-red-200 text-red-800'
                  }`}>
                    Score: {integrityData.integrityScore}%
                  </span>
                )}
                <button onClick={() => setShowIntegrityCheck(false)} className="ml-2 text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <p className="text-sm mb-3">{integrityData.message}</p>
              
              {/* Election Info */}
              {integrityData.election && (
                <div className="bg-white/50 rounded p-2 mb-3">
                  <p className="text-sm">
                    <strong>Election:</strong> {integrityData.election.title} (ID: {integrityData.election.id})
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                      integrityData.election.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {integrityData.election.status}
                    </span>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white/50 rounded p-2">
                  <p className="text-gray-600">Normal Votes</p>
                  <p className="text-xl font-bold text-blue-600">{integrityData.details?.totalNormalVotes || 0}</p>
                </div>
                <div className="bg-white/50 rounded p-2">
                  <p className="text-gray-600">Anonymous Votes</p>
                  <p className="text-xl font-bold text-purple-600">{integrityData.details?.totalAnonymousVotes || 0}</p>
                </div>
                <div className="bg-white/50 rounded p-2">
                  <p className="text-gray-600">Audit Logs</p>
                  <p className="text-xl font-bold text-orange-600">{integrityData.details?.totalAuditLogs || 0}</p>
                </div>
                <div className="bg-white/50 rounded p-2">
                  <p className="text-gray-600">Verifications</p>
                  <p className="text-xl font-bold text-green-600">{integrityData.details?.totalVerifications || 0}</p>
                </div>
              </div>

              {/* Checks */}
              {integrityData.checks && integrityData.checks.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold mb-2">Security Checks:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {integrityData.checks.map((check, idx) => (
                      <div 
                        key={idx}
                        className={`flex items-center gap-2 p-2 rounded text-xs ${
                          check.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {check.passed ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                        <span>{check.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Issues */}
              {integrityData.issues && integrityData.issues.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold mb-2 text-red-700">Issues Found:</p>
                  <div className="space-y-1">
                    {integrityData.issues.map((issue, idx) => (
                      <div key={idx} className={`text-xs p-2 rounded ${
                        issue.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        <strong>[{issue.severity?.toUpperCase()}]</strong> {issue.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hash Chain Display */}
          {showHashChain && hashChainData?.data && (
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Hash Chain - Election #{hashChainData.data.election?.id || hashChainData.data.electionId}
                  {hashChainData.data.election?.title && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({hashChainData.data.election.title})
                    </span>
                  )}
                </h3>
                <button onClick={() => setShowHashChain(false)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              
              {/* Chain Summary */}
              <div className="bg-gradient-to-r from-gray-50 to-indigo-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Total Blocks</p>
                    <p className="text-2xl font-bold text-gray-900">{hashChainData.data.totalBlocks}</p>
                    <p className="text-xs text-gray-500">1 block = 1 vote</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Normal Votes</p>
                    <p className="text-2xl font-bold text-blue-600">{hashChainData.data.normalVotes}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Anonymous Votes</p>
                    <p className="text-2xl font-bold text-purple-600">{hashChainData.data.anonymousVotes}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Chain Integrity</p>
                    <p className="text-lg font-bold text-green-600 flex items-center gap-1">
                      <CheckCircle size={18} /> Verified
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Merkle Root</p>
                    <p className="text-xs font-mono text-indigo-600 truncate" title={hashChainData.data.merkleRoot}>
                      {hashChainData.data.merkleRoot?.substring(0, 20)}...
                    </p>
                    <button 
                      onClick={() => navigator.clipboard.writeText(hashChainData.data.merkleRoot)}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              {/* Empty state */}
              {hashChainData.data.totalBlocks === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Database size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-600">No votes found for this election</p>
                  <p className="text-sm text-gray-500">Votes will appear here as they are cast</p>
                </div>
              ) : (
                <>
                  {/* Genesis Block Info */}
                  <div className="mb-4 p-3 bg-gray-100 rounded-lg border-l-4 border-gray-400">
                    <p className="text-xs font-mono text-gray-600">
                      <strong>Genesis Hash (Block 0):</strong> {hashChainData.data.genesisHash}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      This is the starting point of the chain. All zeros indicate the beginning.
                    </p>
                  </div>

                  {/* Blocks */}
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {hashChainData.data.hashChain?.map((block, index) => (
                      <div
                        key={block.blockNumber}
                        className={`border rounded-lg p-4 relative ${
                          block.voteType === 'anonymous' 
                            ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200' 
                            : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
                        }`}
                      >
                        {/* Chain connector */}
                        {index < hashChainData.data.hashChain.length - 1 && (
                          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-10">
                            <div className="bg-gray-300 rounded-full p-1">
                              <Link2 size={12} className="text-gray-600" />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">Block #{block.blockNumber}</span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              block.voteType === 'anonymous' 
                                ? 'bg-purple-200 text-purple-800' 
                                : 'bg-blue-200 text-blue-800'
                            }`}>
                              {block.voteType === 'anonymous' ? '🔒 Anonymous' : '👤 Normal'}
                            </span>
                            {block.verified && (
                              <span className="text-xs px-2 py-1 rounded-full bg-green-200 text-green-800">
                                ✓ Verified
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Clock size={14} />
                            {new Date(block.timestamp).toLocaleString()}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-3 text-xs font-mono">
                          <div className="bg-white/70 rounded p-2">
                            <p className="text-gray-500 mb-1 font-sans">Vote Hash</p>
                            <p className="text-gray-800 truncate" title={block.voteHash}>
                              {block.voteHash?.substring(0, 32)}...
                            </p>
                          </div>
                          <div className="bg-white/70 rounded p-2">
                            <p className="text-gray-500 mb-1 font-sans">Previous Hash</p>
                            <p className={`truncate ${
                              block.previousHash?.startsWith('0000') ? 'text-gray-400' : 'text-orange-600'
                            }`} title={block.previousHash}>
                              {block.previousHash?.substring(0, 32)}...
                            </p>
                            {block.previousHash?.startsWith('0000') && (
                              <p className="text-xs text-gray-400 font-sans">(Genesis)</p>
                            )}
                          </div>
                          <div className="bg-white/70 rounded p-2">
                            <p className="text-gray-500 mb-1 font-sans">Block Hash</p>
                            <p className="text-indigo-700 truncate" title={block.blockHash}>
                              {block.blockHash?.substring(0, 32)}...
                            </p>
                          </div>
                        </div>

                        {block.receiptId && (
                          <div className="mt-2 text-xs text-gray-500">
                            Receipt: <span className="font-mono">{block.receiptId}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Chain end */}
                  <div className="mt-4 p-3 bg-indigo-100 rounded-lg border-l-4 border-indigo-500">
                    <p className="text-xs font-mono text-indigo-800">
                      <strong>Latest Block Hash:</strong> {hashChainData.data.latestBlockHash}
                    </p>
                    <p className="text-xs text-indigo-600 mt-1">
                      Generated at: {new Date(hashChainData.data.generatedAt).toLocaleString()}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Filter size={20} />
            Filter Audit Logs
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
              <select
                value={filters.actionType}
                onChange={(e) => { setFilters({ ...filters, actionType: e.target.value }); setPage(1); }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Actions</option>
                <option value="duplicate_vote">Duplicate Vote</option>
                <option value="suspicious_activity">Suspicious Activity</option>
                <option value="vote_cast">Vote Cast</option>
                <option value="vote_verified">Vote Verified</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Election ID</label>
              <input
                type="number"
                value={filters.electionId}
                onChange={(e) => { setFilters({ ...filters, electionId: e.target.value }); setPage(1); }}
                placeholder="All elections"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => { setFilters({ ...filters, startDate: e.target.value }); setPage(1); }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => { setFilters({ ...filters, endDate: e.target.value }); setPage(1); }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Database size={20} />
              Audit Log Entries
            </h2>
            {pagination && (
              <span className="text-sm text-gray-600">
                {pagination.total} total entries
              </span>
            )}
          </div>

          {logsLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading audit logs...</p>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Database size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No audit logs found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Election</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Agent</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action_type)}`}>
                          {getActionIcon(log.action_type)}
                          {log.action_type?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm font-semibold text-blue-600">#{log.election_id}</span>
                        {log.election_title && (
                          <p className="text-xs text-gray-500 truncate max-w-[150px]">{log.election_title}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {log.user_name || `User #${log.user_id}`}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 font-mono">
                        {log.ip_address || '-'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate" title={log.user_agent}>
                        {log.user_agent?.substring(0, 40) || '-'}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!logsLoading && pagination && auditLogs.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="text-sm text-gray-700">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} entries)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Shield size={20} className="text-blue-600" />
            Industry-Standard Security Features
          </h3>
          <p className="text-sm text-gray-700 mb-3">
            This audit system implements the same cryptographic principles used in Bitcoin and Ethereum blockchains.
            Every vote creates a block, and blocks are linked together making any tampering immediately detectable.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
            <div className="flex items-center gap-2 bg-white/50 p-2 rounded">
              <Hash size={14} className="text-indigo-600" />
              <span>SHA-256 Hashing</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 p-2 rounded">
              <Link2 size={14} className="text-green-600" />
              <span>Chain Linking</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 p-2 rounded">
              <Shield size={14} className="text-blue-600" />
              <span>Tamper Detection</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 p-2 rounded">
              <GitBranch size={14} className="text-purple-600" />
              <span>Merkle Tree</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 p-2 rounded">
              <FileText size={14} className="text-orange-600" />
              <span>Export & Audit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// import React, { useState } from 'react';
// import { 
//   Shield, Lock, CheckCircle, AlertCircle, Hash, Database, Link2, 
//   Eye, Download, RefreshCw, TrendingUp, Users, Activity, 
//   FileText, AlertTriangle, Filter, Search
// } from 'lucide-react';
// import { useGetAuditLogsQuery,useGetAuditStatsQuery,useLazyGetHashChainQuery,useLazyVerifyIntegrityQuery, useLazyExportAuditTrailQuery,useGetVoteVerificationsQuery} from '../../../redux/api/verification/auditTrailApi';
// // import {
// //   useGetAuditLogsQuery,
// //   useGetAuditStatsQuery,
// //   useLazyGetHashChainQuery,
// //   useLazyVerifyIntegrityQuery,
// //   useLazyExportAuditTrailQuery,
// //   useGetVoteVerificationsQuery,
// // } from '../../redux/api/verification/auditTrailApi';

// export default function AuditTrail() {
//   const [page, setPage] = useState(1);
//   const [filters, setFilters] = useState({
//     actionType: '',
//     electionId: '',
//     startDate: '',
//     endDate: '',
//   });
//   const [selectedElectionId, setSelectedElectionId] = useState('');
//   const [showHashChain, setShowHashChain] = useState(false);
//   const [showIntegrityCheck, setShowIntegrityCheck] = useState(false);

//   // RTK Query Hooks
//   const { 
//     data: logsData, 
//     isLoading: logsLoading, 
//     refetch: refetchLogs 
//   } = useGetAuditLogsQuery({
//     page,
//     limit: 20,
//     ...filters
//   });

//   const { 
//     data: statsData, 
//     isLoading: statsLoading,
//     refetch: refetchStats
//   } = useGetAuditStatsQuery(filters.electionId || undefined);

//   const { 
//     data: verificationsData 
//   } = useGetVoteVerificationsQuery({
//     electionId: filters.electionId || undefined,
//     page: 1,
//     limit: 10
//   });

//   const [getHashChain, { data: hashChainData, isLoading: hashChainLoading }] = useLazyGetHashChainQuery();
//   const [verifyIntegrity, { data: integrityData, isLoading: integrityLoading }] = useLazyVerifyIntegrityQuery();
//   const [exportAudit, { isLoading: exportLoading }] = useLazyExportAuditTrailQuery();

//   const auditLogs = logsData?.data?.auditLogs || [];
//   const pagination = logsData?.data?.pagination;
//   const stats = statsData?.data;

//   const handleRefresh = () => {
//     refetchLogs();
//     refetchStats();
//   };

//   const handleFetchHashChain = async () => {
//     if (!selectedElectionId) {
//       alert('Please enter an Election ID');
//       return;
//     }
//     await getHashChain({ electionId: selectedElectionId, limit: 100 });
//     setShowHashChain(true);
//   };

//   const handleVerifyIntegrity = async () => {
//     if (!selectedElectionId) {
//       alert('Please enter an Election ID');
//       return;
//     }
//     await verifyIntegrity(selectedElectionId);
//     setShowIntegrityCheck(true);
//   };

//   const handleExport = async (format) => {
//     if (!selectedElectionId) {
//       alert('Please enter an Election ID');
//       return;
//     }
    
//     try {
//       const result = await exportAudit({ 
//         electionId: selectedElectionId, 
//         format,
//         startDate: filters.startDate,
//         endDate: filters.endDate
//       }).unwrap();

//       if (format === 'json') {
//         const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = `audit-trail-${selectedElectionId}-${Date.now()}.json`;
//         document.body.appendChild(a);
//         a.click();
//         a.remove();
//         window.URL.revokeObjectURL(url);
//       }
//     } catch (error) {
//       console.error('Export failed:', error);
//       alert('Failed to export audit trail');
//     }
//   };

//   const getActionIcon = (actionType) => {
//     const icons = {
//       'duplicate_vote': <AlertCircle className="text-yellow-600" size={18} />,
//       'suspicious_activity': <AlertTriangle className="text-red-600" size={18} />,
//       'vote_cast': <CheckCircle className="text-green-600" size={18} />,
//       'vote_verified': <Shield className="text-blue-600" size={18} />,
//     };
//     return icons[actionType] || <Lock className="text-gray-600" size={18} />;
//   };

//   const getActionColor = (actionType) => {
//     const colors = {
//       'duplicate_vote': 'bg-yellow-100 text-yellow-800',
//       'suspicious_activity': 'bg-red-100 text-red-800',
//       'vote_cast': 'bg-green-100 text-green-800',
//       'vote_verified': 'bg-blue-100 text-blue-800',
//     };
//     return colors[actionType] || 'bg-gray-100 text-gray-800';
//   };

//   const clearFilters = () => {
//     setFilters({ actionType: '', electionId: '', startDate: '', endDate: '' });
//     setPage(1);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
//                 <Shield className="text-blue-600" size={32} />
//                 Audit Trail & Blockchain Verification
//               </h1>
//               <p className="text-gray-600">
//                 Industry-standard immutable audit logging with cryptographic verification
//               </p>
//             </div>
//             <button
//               onClick={handleRefresh}
//               disabled={logsLoading || statsLoading}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
//             >
//               <RefreshCw size={16} className={logsLoading ? 'animate-spin' : ''} />
//               Refresh
//             </button>
//           </div>
//         </div>

//         {/* Statistics Cards */}
//         {stats && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//             <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Total Actions</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {stats.overall?.total_actions || 0}
//                   </p>
//                 </div>
//                 <Shield className="text-blue-600" size={40} />
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Unique Users</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {stats.overall?.unique_users || 0}
//                   </p>
//                 </div>
//                 <Users className="text-green-600" size={40} />
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Total Votes</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {(parseInt(stats.votes?.total_votes) || 0) + (parseInt(stats.votes?.total_anonymous_votes) || 0)}
//                   </p>
//                 </div>
//                 <CheckCircle className="text-purple-600" size={40} />
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Last 24 Hours</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {stats.recentActivity?.actions_24h || 0}
//                   </p>
//                 </div>
//                 <TrendingUp className="text-orange-600" size={40} />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Action Type Breakdown */}
//         {stats?.actionTypes && stats.actionTypes.length > 0 && (
//           <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
//             <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//               <Activity size={20} />
//               Action Type Distribution
//             </h2>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               {stats.actionTypes.map((action) => (
//                 <div
//                   key={action.action_type}
//                   className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
//                 >
//                   {getActionIcon(action.action_type)}
//                   <div>
//                     <p className="text-sm font-medium text-gray-900">
//                       {action.action_type?.replace(/_/g, ' ') || 'Unknown'}
//                     </p>
//                     <p className="text-2xl font-bold text-gray-900">{action.count}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Blockchain Verification Section */}
//         <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
//           <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//             <Hash className="text-indigo-600" />
//             Blockchain-Style Verification
//           </h2>
//           <p className="text-sm text-gray-600 mb-4">
//             Verify election integrity using cryptographic hash chains
//           </p>
          
//           <div className="flex flex-wrap gap-4 mb-6">
//             <input
//               type="number"
//               value={selectedElectionId}
//               onChange={(e) => setSelectedElectionId(e.target.value)}
//               placeholder="Enter Election ID"
//               className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
//             />
//             <button
//               onClick={handleFetchHashChain}
//               disabled={!selectedElectionId || hashChainLoading}
//               className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
//             >
//               <Link2 size={16} />
//               {hashChainLoading ? 'Loading...' : 'View Hash Chain'}
//             </button>
//             <button
//               onClick={handleVerifyIntegrity}
//               disabled={!selectedElectionId || integrityLoading}
//               className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
//             >
//               <Shield size={16} />
//               {integrityLoading ? 'Verifying...' : 'Verify Integrity'}
//             </button>
//             <button
//               onClick={() => handleExport('json')}
//               disabled={!selectedElectionId || exportLoading}
//               className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
//             >
//               <Download size={16} />
//               {exportLoading ? 'Exporting...' : 'Export JSON'}
//             </button>
//           </div>

//           {/* Integrity Check Result */}
//           {showIntegrityCheck && integrityData && (
//             <div className={`mb-6 p-4 rounded-lg border-2 ${
//               integrityData.verified 
//                 ? 'bg-green-50 border-green-500' 
//                 : 'bg-red-50 border-red-500'
//             }`}>
//               <div className="flex items-center gap-3 mb-2">
//                 {integrityData.verified ? (
//                   <CheckCircle className="text-green-600" size={24} />
//                 ) : (
//                   <AlertTriangle className="text-red-600" size={24} />
//                 )}
//                 <h3 className="text-lg font-bold">
//                   {integrityData.verified ? 'Integrity Verified ✓' : 'Integrity Issues Detected'}
//                 </h3>
//                 <button onClick={() => setShowIntegrityCheck(false)} className="ml-auto text-gray-500 hover:text-gray-700">✕</button>
//               </div>
//               <p className="text-sm mb-2">{integrityData.message}</p>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600 mt-3">
//                 <div><strong>Normal Votes:</strong> {integrityData.details?.totalNormalVotes}</div>
//                 <div><strong>Anonymous Votes:</strong> {integrityData.details?.totalAnonymousVotes}</div>
//                 <div><strong>Audit Logs:</strong> {integrityData.details?.totalAuditLogs}</div>
//                 <div><strong>Verifications:</strong> {integrityData.details?.totalVerifications}</div>
//               </div>
//             </div>
//           )}

//           {/* Hash Chain Display */}
//           {showHashChain && hashChainData?.data && (
//             <div className="border-t pt-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-bold text-gray-900">
//                   Hash Chain - Election #{hashChainData.data.electionId}
//                 </h3>
//                 <button onClick={() => setShowHashChain(false)} className="text-gray-500 hover:text-gray-700">✕</button>
//               </div>
              
//               <div className="bg-gray-50 rounded-lg p-4 mb-4 grid grid-cols-2 md:grid-cols-5 gap-4">
//                 <div>
//                   <p className="text-xs text-gray-600">Total Blocks</p>
//                   <p className="text-lg font-bold text-gray-900">{hashChainData.data.totalBlocks}</p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-600">Normal Votes</p>
//                   <p className="text-lg font-bold text-blue-600">{hashChainData.data.normalVotes}</p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-600">Anonymous Votes</p>
//                   <p className="text-lg font-bold text-purple-600">{hashChainData.data.anonymousVotes}</p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-600">Integrity</p>
//                   <p className="text-lg font-bold text-green-600">Verified ✓</p>
//                 </div>
//                 <div className="col-span-2 md:col-span-1">
//                   <p className="text-xs text-gray-600">Merkle Root</p>
//                   <p className="text-xs font-mono text-indigo-600 truncate" title={hashChainData.data.merkleRoot}>
//                     {hashChainData.data.merkleRoot?.substring(0, 16)}...
//                   </p>
//                 </div>
//               </div>

//               <div className="space-y-3 max-h-96 overflow-y-auto">
//                 {hashChainData.data.hashChain?.slice(0, 20).map((block) => (
//                   <div
//                     key={block.blockNumber}
//                     className={`border rounded-lg p-4 ${
//                       block.voteType === 'anonymous' 
//                         ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200' 
//                         : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
//                     }`}
//                   >
//                     <div className="flex items-center justify-between mb-2">
//                       <div className="flex items-center gap-2">
//                         <span className="text-sm font-bold">Block #{block.blockNumber}</span>
//                         <span className={`text-xs px-2 py-0.5 rounded ${
//                           block.voteType === 'anonymous' ? 'bg-purple-200 text-purple-800' : 'bg-blue-200 text-blue-800'
//                         }`}>
//                           {block.voteType}
//                         </span>
//                       </div>
//                       <span className="text-xs text-gray-600">
//                         {new Date(block.timestamp).toLocaleString()}
//                       </span>
//                     </div>
//                     <div className="space-y-1 text-xs font-mono">
//                       <p className="text-gray-700 truncate">
//                         <strong>Vote:</strong> {block.voteHash?.substring(0, 32)}...
//                       </p>
//                       <p className="text-gray-700 truncate">
//                         <strong>Prev:</strong> {block.previousHash?.substring(0, 32)}...
//                       </p>
//                       <p className="text-indigo-700 truncate">
//                         <strong>Block:</strong> {block.blockHash?.substring(0, 32)}...
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//                 {hashChainData.data.hashChain?.length > 20 && (
//                   <p className="text-center text-sm text-gray-500 py-2">
//                     Showing 20 of {hashChainData.data.hashChain.length} blocks
//                   </p>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
//           <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
//             <Filter size={20} />
//             Filter Audit Logs
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
//               <select
//                 value={filters.actionType}
//                 onChange={(e) => { setFilters({ ...filters, actionType: e.target.value }); setPage(1); }}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">All Actions</option>
//                 <option value="duplicate_vote">Duplicate Vote</option>
//                 <option value="suspicious_activity">Suspicious Activity</option>
//                 <option value="vote_cast">Vote Cast</option>
//                 <option value="vote_verified">Vote Verified</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Election ID</label>
//               <input
//                 type="number"
//                 value={filters.electionId}
//                 onChange={(e) => { setFilters({ ...filters, electionId: e.target.value }); setPage(1); }}
//                 placeholder="All elections"
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
//               <input
//                 type="date"
//                 value={filters.startDate}
//                 onChange={(e) => { setFilters({ ...filters, startDate: e.target.value }); setPage(1); }}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
//               <input
//                 type="date"
//                 value={filters.endDate}
//                 onChange={(e) => { setFilters({ ...filters, endDate: e.target.value }); setPage(1); }}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div className="flex items-end">
//               <button
//                 onClick={clearFilters}
//                 className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
//               >
//                 Clear Filters
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Audit Logs Table */}
//         <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//           <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
//             <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//               <Database size={20} />
//               Audit Log Entries
//             </h2>
//             {pagination && (
//               <span className="text-sm text-gray-600">
//                 {pagination.total} total entries
//               </span>
//             )}
//           </div>

//           {logsLoading ? (
//             <div className="p-12 text-center">
//               <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//               <p className="mt-4 text-gray-600">Loading audit logs...</p>
//             </div>
//           ) : auditLogs.length === 0 ? (
//             <div className="p-12 text-center text-gray-500">
//               <Database size={48} className="mx-auto mb-4 text-gray-300" />
//               <p>No audit logs found</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50 border-b-2 border-gray-200">
//                   <tr>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Election</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Agent</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {auditLogs.map((log) => (
//                     <tr key={log.id} className="hover:bg-gray-50">
//                       <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
//                         {new Date(log.created_at).toLocaleString()}
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap">
//                         <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action_type)}`}>
//                           {getActionIcon(log.action_type)}
//                           {log.action_type?.replace(/_/g, ' ')}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap">
//                         <span className="text-sm font-semibold text-blue-600">#{log.election_id}</span>
//                         {log.election_title && (
//                           <p className="text-xs text-gray-500 truncate max-w-[150px]">{log.election_title}</p>
//                         )}
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
//                         {log.user_name || `User #${log.user_id}`}
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 font-mono">
//                         {log.ip_address || '-'}
//                       </td>
//                       <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate" title={log.user_agent}>
//                         {log.user_agent?.substring(0, 40) || '-'}...
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}

//           {/* Pagination */}
//           {!logsLoading && pagination && auditLogs.length > 0 && (
//             <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
//               <div className="text-sm text-gray-700">
//                 Page {pagination.page} of {pagination.totalPages}
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setPage(page - 1)}
//                   disabled={!pagination.hasPrevPage}
//                   className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
//                 >
//                   ← Previous
//                 </button>
//                 <button
//                   onClick={() => setPage(page + 1)}
//                   disabled={!pagination.hasNextPage}
//                   className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
//                 >
//                   Next →
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Verifications Section */}
//         {verificationsData?.data?.verifications?.length > 0 && (
//           <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
//             <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//               <Eye size={20} />
//               Recent Vote Verifications
//             </h2>
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-2 text-left">Verified At</th>
//                     <th className="px-4 py-2 text-left">Type</th>
//                     <th className="px-4 py-2 text-left">Election</th>
//                     <th className="px-4 py-2 text-left">Vote Hash</th>
//                     <th className="px-4 py-2 text-left">Result</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y">
//                   {verificationsData.data.verifications.map((v) => (
//                     <tr key={v.id} className="hover:bg-gray-50">
//                       <td className="px-4 py-2">{new Date(v.verified_at).toLocaleString()}</td>
//                       <td className="px-4 py-2">
//                         <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
//                           {v.verification_type}
//                         </span>
//                       </td>
//                       <td className="px-4 py-2">#{v.election_id}</td>
//                       <td className="px-4 py-2 font-mono text-xs">{v.vote_hash?.substring(0, 16)}...</td>
//                       <td className="px-4 py-2">
//                         <span className={`px-2 py-1 rounded text-xs ${
//                           v.verification_result?.success ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
//                         }`}>
//                           {v.verification_result?.success ? 'Success' : 'Pending'}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* Info Footer */}
//         <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
//           <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
//             <Shield size={20} className="text-blue-600" />
//             About This Audit Trail
//           </h3>
//           <p className="text-sm text-gray-700 mb-3">
//             This audit system provides industry-standard, immutable logging with blockchain-style hash chain verification.
//             Every action is cryptographically linked, making tampering detectable.
//           </p>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
//             <div className="flex items-center gap-2">
//               <Hash size={14} className="text-indigo-600" />
//               SHA-256 Hashing
//             </div>
//             <div className="flex items-center gap-2">
//               <Link2 size={14} className="text-green-600" />
//               Hash Chain Linking
//             </div>
//             <div className="flex items-center gap-2">
//               <Shield size={14} className="text-blue-600" />
//               Tamper Detection
//             </div>
//             <div className="flex items-center gap-2">
//               <FileText size={14} className="text-purple-600" />
//               Export Capabilities
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// import React, { useState, useEffect } from 'react';
// import { Search, Filter, Shield, Lock, CheckCircle, AlertCircle, Hash, Database, Link2, Eye, Download } from 'lucide-react';

// export default function AuditTrail() {
//   const [auditLogs, setAuditLogs] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [hashChain, setHashChain] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [pagination, setPagination] = useState(null);
//   const [filters, setFilters] = useState({
//     actionType: '',
//     electionId: '',
//   });
//   const [showHashChain, setShowHashChain] = useState(false);
//   const [selectedElectionForHash, setSelectedElectionForHash] = useState('');

//   // Get API URL
//   const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3006/api';

//   // Get user data from localStorage
//   const getUserData = () => {
//     try {
//       const persistRoot = localStorage.getItem('persist:vottery-root');
//       if (persistRoot) {
//         const parsed = JSON.parse(persistRoot);
//         const authData = parsed.auth ? JSON.parse(parsed.auth) : {};
//         return {
//           userId: authData.userData?.userId,
//           email: authData.userData?.email,
//           token: authData.token,
//         };
//       }
//     } catch (error) {
//       console.error('Error reading user data:', error);
//     }
//     return null;
//   };

//   // Get vote data from localStorage
//   const getVoteData = () => {
//     try {
//       const persistRoot = localStorage.getItem('persist:vottery-root');
//       if (persistRoot) {
//         const parsed = JSON.parse(persistRoot);
//         const voteData = parsed.vote ? JSON.parse(parsed.vote) : {};
//         return voteData;
//       }
//     } catch (error) {
//       console.error('Error reading vote data:', error);
//     }
//     return null;
//   };

//   useEffect(() => {
//     fetchAuditData();
//   }, [page, filters]);

//   const fetchAuditData = async () => {
//     setLoading(true);
//     try {
//       const userData = getUserData();
      
//       // Build query params
//       const queryParams = new URLSearchParams({
//         page: page.toString(),
//         limit: '20',
//         ...(filters.actionType && { actionType: filters.actionType }),
//         ...(filters.electionId && { electionId: filters.electionId }),
//       });

//       // Fetch audit logs
//       const logsResponse = await fetch(
//         `${API_URL}/votes/audit-trail?${queryParams}`,
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             ...(userData?.token && { 'Authorization': `Bearer ${userData.token}` }),
//           },
//         }
//       );
//       const logsData = await logsResponse.json();

//       // Fetch stats
//       const statsResponse = await fetch(`${API_URL}/votes/audit-stats`, {
//         headers: {
//           'Content-Type': 'application/json',
//           ...(userData?.token && { 'Authorization': `Bearer ${userData.token}` }),
//         },
//       });
//       const statsData = await statsResponse.json();

//       if (logsData.success) {
//         setAuditLogs(logsData.data.auditLogs);
//         setPagination(logsData.data.pagination);
//       }

//       if (statsData.success) {
//         setStats(statsData.data);
//       }
//     } catch (error) {
//       console.error('❌ Error fetching audit data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchHashChain = async (electionId) => {
//     try {
//       const userData = getUserData();
      
//       const response = await fetch(`${API_URL}/votes/hash-chain/${electionId}`, {
//         headers: {
//           'Content-Type': 'application/json',
//           ...(userData?.token && { 'Authorization': `Bearer ${userData.token}` }),
//         },
//       });
      
//       const data = await response.json();
      
//       if (data.success) {
//         setHashChain(data.data);
//         setShowHashChain(true);
//       }
//     } catch (error) {
//       console.error('❌ Error fetching hash chain:', error);
//     }
//   };

//   const getActionIcon = (actionType) => {
//     switch (actionType) {
//       case 'vote_cast':
//         return <CheckCircle className="text-green-600" size={20} />;
//       case 'vote_edited':
//         return <AlertCircle className="text-yellow-600" size={20} />;
//       case 'vote_verified':
//         return <Shield className="text-blue-600" size={20} />;
//       case 'video_completed':
//         return <Eye className="text-purple-600" size={20} />;
//       default:
//         return <Lock className="text-gray-600" size={20} />;
//     }
//   };

//   const getActionColor = (actionType) => {
//     switch (actionType) {
//       case 'vote_cast':
//         return 'bg-green-100 text-green-800';
//       case 'vote_edited':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'vote_verified':
//         return 'bg-blue-100 text-blue-800';
//       case 'video_completed':
//         return 'bg-purple-100 text-purple-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const voteData = getVoteData();

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">
//             🔒 Audit Trail & Blockchain Verification
//           </h1>
//           <p className="text-gray-600">
//             Immutable log system with cryptographic proof for all voting actions
//           </p>
          
//           {/* Show current user's vote info if available */}
//           {voteData && voteData.hasVoted && (
//             <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
//               <p className="text-sm text-blue-900">
//                 <strong>Your Last Vote:</strong> Election #{voteData.electionId} - {voteData.electionTitle}
//               </p>
//               <p className="text-xs text-blue-700 mt-1 font-mono">
//                 Vote ID: {voteData.voteId?.substring(0, 16)}...
//               </p>
//               <p className="text-xs text-blue-700 font-mono">
//                 Receipt: {voteData.receiptId?.substring(0, 16)}...
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Statistics Cards */}
//         {stats && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//             <div className="bg-white rounded-lg shadow p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Total Actions</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {stats.overall.total_actions}
//                   </p>
//                 </div>
//                 <Shield className="text-blue-600" size={40} />
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Unique Users</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {stats.overall.unique_users}
//                   </p>
//                 </div>
//                 <CheckCircle className="text-green-600" size={40} />
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Total Votes</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {stats.votes.total_votes}
//                   </p>
//                 </div>
//                 <Lock className="text-purple-600" size={40} />
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Actions (24h)</p>
//                   <p className="text-3xl font-bold text-gray-900">
//                     {stats.recentActivity.actions_24h}
//                   </p>
//                 </div>
//                 <AlertCircle className="text-orange-600" size={40} />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Action Type Breakdown */}
//         {stats && stats.actionTypes && stats.actionTypes.length > 0 && (
//           <div className="bg-white rounded-lg shadow p-6 mb-8">
//             <h2 className="text-xl font-bold text-gray-900 mb-4">
//               📊 Action Type Distribution
//             </h2>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               {stats.actionTypes.map((action) => (
//                 <div
//                   key={action.action_type}
//                   className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
//                 >
//                   {getActionIcon(action.action_type)}
//                   <div>
//                     <p className="text-sm font-medium text-gray-900">
//                       {action.action_type.replace(/_/g, ' ').toUpperCase()}
//                     </p>
//                     <p className="text-2xl font-bold text-gray-900">{action.count}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Vote Statistics */}
//         {stats && stats.votes && (
//           <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow p-6 mb-8">
//             <h2 className="text-xl font-bold text-gray-900 mb-4">
//               🗳️ Voting Statistics
//             </h2>
//             <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//               <div className="bg-white rounded-lg p-4 shadow-sm">
//                 <p className="text-xs text-gray-600">Total Votes</p>
//                 <p className="text-2xl font-bold text-purple-900">{stats.votes.total_votes}</p>
//               </div>
//               <div className="bg-white rounded-lg p-4 shadow-sm">
//                 <p className="text-xs text-gray-600">Unique Voters</p>
//                 <p className="text-2xl font-bold text-blue-900">{stats.votes.unique_voters}</p>
//               </div>
//               <div className="bg-white rounded-lg p-4 shadow-sm">
//                 <p className="text-xs text-gray-600">Elections</p>
//                 <p className="text-2xl font-bold text-green-900">{stats.votes.elections_voted}</p>
//               </div>
//               <div className="bg-white rounded-lg p-4 shadow-sm">
//                 <p className="text-xs text-gray-600">Valid Votes</p>
//                 <p className="text-2xl font-bold text-teal-900">{stats.votes.valid_votes}</p>
//               </div>
//               <div className="bg-white rounded-lg p-4 shadow-sm">
//                 <p className="text-xs text-gray-600">Edited Votes</p>
//                 <p className="text-2xl font-bold text-orange-900">{stats.votes.edited_votes}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Blockchain Hash Chain Section */}
//         <div className="bg-white rounded-lg shadow p-6 mb-8">
//           <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//             <Hash className="text-indigo-600" />
//             Blockchain-Style Hash Chain Verification
//           </h2>
//           <p className="text-sm text-gray-600 mb-4">
//             View the cryptographic hash chain for any election to verify vote integrity
//           </p>
//           <div className="flex gap-4">
//             <input
//               type="number"
//               value={selectedElectionForHash}
//               onChange={(e) => setSelectedElectionForHash(e.target.value)}
//               placeholder="Enter Election ID"
//               className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
//             />
//             <button
//               onClick={() => selectedElectionForHash && fetchHashChain(selectedElectionForHash)}
//               className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
//               disabled={!selectedElectionForHash}
//             >
//               <Link2 size={16} />
//               Generate Hash Chain
//             </button>
//           </div>

//           {/* Hash Chain Display */}
//           {showHashChain && hashChain && (
//             <div className="mt-6 border-t pt-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-bold text-gray-900">
//                   Hash Chain for Election #{hashChain.electionId}
//                 </h3>
//                 <button
//                   onClick={() => setShowHashChain(false)}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   ✕
//                 </button>
//               </div>
              
//               <div className="bg-gray-50 rounded-lg p-4 mb-4">
//                 <p className="text-sm"><strong>Total Blocks:</strong> {hashChain.totalBlocks}</p>
//                 <p className="text-sm font-mono text-xs mt-2">
//                   <strong>Latest Block Hash:</strong><br />
//                   {hashChain.latestBlockHash}
//                 </p>
//               </div>

//               <div className="space-y-3 max-h-96 overflow-y-auto">
//                 {hashChain.hashChain.map((block) => (
//                   <div
//                     key={block.blockNumber}
//                     className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4"
//                   >
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="text-sm font-bold text-indigo-900">
//                         Block #{block.blockNumber}
//                       </span>
//                       <span className="text-xs text-gray-600">
//                         {new Date(block.timestamp).toLocaleString()}
//                       </span>
//                     </div>
//                     <div className="space-y-1 text-xs font-mono">
//                       <p className="text-gray-700">
//                         <strong>Vote Hash:</strong> {block.voteHash.substring(0, 32)}...
//                       </p>
//                       <p className="text-gray-700">
//                         <strong>Previous Hash:</strong> {block.previousHash.substring(0, 32)}...
//                       </p>
//                       <p className="text-indigo-700">
//                         <strong>Block Hash:</strong> {block.blockHash.substring(0, 32)}...
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-lg shadow p-6 mb-6">
//           <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
//             <Filter size={20} />
//             Filter Audit Logs
//           </h3>
//           <div className="flex flex-wrap gap-4">
//             <div className="flex-1 min-w-[200px]">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Action Type
//               </label>
//               <select
//                 value={filters.actionType}
//                 onChange={(e) => {
//                   setFilters({ ...filters, actionType: e.target.value });
//                   setPage(1);
//                 }}
//                 className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="">All Actions</option>
//                 <option value="vote_cast">Vote Cast</option>
//                 <option value="vote_edited">Vote Edited</option>
//                 <option value="vote_verified">Vote Verified</option>
//                 <option value="video_completed">Video Completed</option>
//                 <option value="video_started">Video Started</option>
//               </select>
//             </div>

//             <div className="flex-1 min-w-[200px]">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Election ID
//               </label>
//               <input
//                 type="number"
//                 value={filters.electionId}
//                 onChange={(e) => {
//                   setFilters({ ...filters, electionId: e.target.value });
//                   setPage(1);
//                 }}
//                 placeholder="Enter Election ID"
//                 className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             <div className="flex items-end">
//               <button
//                 onClick={() => {
//                   setFilters({ actionType: '', electionId: '' });
//                   setPage(1);
//                 }}
//                 className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
//               >
//                 Clear Filters
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Audit Logs Table */}
//         <div className="bg-white rounded-lg shadow overflow-hidden">
//           <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
//             <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//               <Database size={20} />
//               Audit Log Entries
//             </h2>
//           </div>

//           {loading ? (
//             <div className="p-12 text-center">
//               <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//               <p className="mt-4 text-gray-600">Loading audit logs...</p>
//             </div>
//           ) : auditLogs.length === 0 ? (
//             <div className="p-12 text-center text-gray-500">
//               <Database size={48} className="mx-auto mb-4 text-gray-300" />
//               <p>No audit logs found</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50 border-b-2 border-gray-200">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Timestamp
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Action
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Election
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       User
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Vote Hash
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Receipt
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Status
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {auditLogs.map((log) => (
//                     <tr key={log.id} className="hover:bg-gray-50 transition-colors">
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {new Date(log.created_at).toLocaleString()}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span
//                           className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getActionColor(
//                             log.action_type
//                           )}`}
//                         >
//                           {getActionIcon(log.action_type)}
//                           {log.action_type.replace(/_/g, ' ').toUpperCase()}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
//                         #{log.election_id}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
//                         {log.user_id ? `${log.user_id.substring(0, 8)}...` : '-'}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
//                         {log.vote_hash ? (
//                           <span title={log.vote_hash}>
//                             {log.vote_hash.substring(0, 12)}...
//                           </span>
//                         ) : '-'}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
//                         {log.receipt_id ? (
//                           <span title={log.receipt_id}>
//                             {log.receipt_id.substring(0, 8)}...
//                           </span>
//                         ) : '-'}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`text-xs px-2 py-1 rounded font-semibold ${
//                           log.vote_status === 'valid' ? 'bg-green-100 text-green-800' :
//                           log.vote_status === 'edited' ? 'bg-yellow-100 text-yellow-800' :
//                           'bg-gray-100 text-gray-800'
//                         }`}>
//                           {log.vote_status || 'N/A'}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}

//           {/* Pagination */}
//           {!loading && pagination && auditLogs.length > 0 && (
//             <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
//               <div className="text-sm text-gray-700">
//                 Showing page {pagination.page} of {pagination.totalPages} 
//                 <span className="text-gray-500 ml-2">
//                   ({pagination.total} total entries)
//                 </span>
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setPage(page - 1)}
//                   disabled={!pagination.hasPrevPage}
//                   className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
//                 >
//                   ← Previous
//                 </button>
//                 <button
//                   onClick={() => setPage(page + 1)}
//                   disabled={!pagination.hasNextPage}
//                   className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
//                 >
//                   Next →
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Footer Info */}
//         <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
//           <h3 className="font-bold text-gray-900 mb-2">🔐 About This Audit Trail</h3>
//           <p className="text-sm text-gray-700 mb-2">
//             This audit trail provides a complete, immutable record of all voting activities. Every action is cryptographically hashed and linked in a blockchain-style chain, ensuring tamper-evident logging.
//           </p>
//           <p className="text-xs text-gray-600">
//             <strong>Features:</strong> SHA-256 hashing, Hash chain verification, Timestamp proof, IP tracking, User agent logging, Vote integrity checking
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
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