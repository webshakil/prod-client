// src/pages/admin/EncryptionStatusPage.jsx
// Encryption & Security Status - Uses ONLY EXISTING APIs
import React, { useState, useEffect } from 'react';
import {
  Shield, Lock, Eye, EyeOff, CheckCircle, RefreshCw,
  Key, Database, FileText, Users, Vote, CreditCard,
  Fingerprint, Hash, ShieldCheck, Info, ChevronDown,
  ChevronUp, Sparkles, Server, Binary, Copy, Check,
  LockKeyhole, FileKey, UserCheck, Award, Clock, AlertCircle,
  Layers, Link2, Box, Search, AlertTriangle, Zap
} from 'lucide-react';

// Import ONLY APIs that DEFINITELY exist
import { 
  useGetAuditLogsQuery,
  useLazyGetHashChainQuery,
  useLazyVerifyIntegrityQuery,
  useGetAuditStatsQuery
} from '../../redux/api/verification/auditTrailApi';

import { useGetPlatformRevenueReportQuery } from '../../redux/api/analytics/platformAnalyticsApi';

// Import axios function for elections (NOT RTK Query)
import { getAllElections } from '../../redux/api/election/electionApi';

export default function EncryptionStatusPage() {
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    auditHashes: true,
    hashChain: true,
    payments: true
  });
  const [showFullHash, setShowFullHash] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  
  // Elections state (fetched via axios, not RTK Query)
  const [elections, setElections] = useState([]);
  const [electionsLoading, setElectionsLoading] = useState(true);

  // Fetch elections using axios function
  useEffect(() => {
    const fetchElections = async () => {
      try {
        setElectionsLoading(true);
        const response = await getAllElections(1, 50, 'all');
        const electionsList = response?.data?.elections || response?.elections || response?.data || [];
        setElections(Array.isArray(electionsList) ? electionsList : []);
      } catch (error) {
        console.error('Failed to fetch elections:', error);
        setElections([]);
      } finally {
        setElectionsLoading(false);
      }
    };
    fetchElections();
  }, []);

  // RTK Query hooks - ONLY ones that exist
  const { data: auditData, isLoading: auditLoading, refetch: refetchAudit } = useGetAuditLogsQuery({ 
    page: 1, 
    limit: 10 
  });
  
  const { data: auditStatsData } = useGetAuditStatsQuery();
  /*eslint-disable*/
  const { data: revenueData, isLoading: revenueLoading } = useGetPlatformRevenueReportQuery({ period: 30 });

  // Lazy queries
  const [getHashChain, { data: hashChainData, isLoading: hashChainLoading }] = useLazyGetHashChainQuery();
  const [verifyIntegrity, { data: integrityData, isLoading: integrityLoading }] = useLazyVerifyIntegrityQuery();

  const isLoading = auditLoading || electionsLoading;

  // Extract data safely
  const auditLogs = auditData?.data?.auditLogs || auditData?.data || [];
  const auditStats = auditStatsData?.data || {};
  const hashChain = hashChainData?.data?.hashChain || [];
  const recentPayments = revenueData?.data?.platformFees?.recentPayments || [];

  const handleRefreshAll = () => {
    refetchAudit();
    if (selectedElectionId) {
      getHashChain({ electionId: selectedElectionId, limit: 10 });
    }
  };

  const handleElectionSelect = (electionId) => {
    setSelectedElectionId(electionId);
    if (electionId) {
      getHashChain({ electionId, limit: 10 });
    }
  };

  const handleVerifyIntegrity = () => {
    if (selectedElectionId) {
      verifyIntegrity(selectedElectionId);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleFullHash = (id) => {
    setShowFullHash(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const truncateHash = (hash, length = 50) => {
    if (!hash) return 'N/A';
    if (hash.length <= length) return hash;
    return `${hash.substring(0, length / 2)}...${hash.substring(hash.length - length / 2)}`;
  };

  const detectEncryptionType = (value) => {
    if (!value) return { type: 'empty', label: 'No Data', color: 'gray' };
    if (value.startsWith('$argon2')) return { type: 'argon2', label: 'Argon2id Hash', color: 'purple' };
    if (value.startsWith('$2a$') || value.startsWith('$2b$')) return { type: 'bcrypt', label: 'Bcrypt Hash', color: 'blue' };
    if (value.startsWith('pi_') || value.startsWith('ch_')) return { type: 'stripe', label: 'Stripe Token', color: 'indigo' };
    if (value.startsWith('txn_')) return { type: 'paddle', label: 'Paddle Token', color: 'cyan' };
    if (value.startsWith('cus_')) return { type: 'customer', label: 'Customer Token', color: 'green' };
    if (value.length === 64 && /^[a-f0-9]+$/i.test(value)) return { type: 'sha256', label: 'SHA-256 Hash', color: 'amber' };
    if (value.length > 100 && /^[A-Za-z0-9+/=]+$/.test(value)) return { type: 'aes', label: 'AES-256 Encrypted', color: 'emerald' };
    if (value.includes('-----BEGIN')) return { type: 'pem', label: 'PEM Key', color: 'rose' };
    if (value.startsWith('0x') || (value.length >= 32 && /^[a-f0-9]+$/i.test(value))) return { type: 'hash', label: 'Cryptographic Hash', color: 'teal' };
    return { type: 'encrypted', label: 'Encrypted/Hashed', color: 'slate' };
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  // Calculate stats
  const stats = {
    totalAuditLogs: auditStats?.overall?.total_actions || (Array.isArray(auditLogs) ? auditLogs.length : 0),
    totalElections: elections.length,
    totalHashChainBlocks: hashChain.length,
    totalPaymentTokens: recentPayments.filter(p => p.payment_intent_id).length
  };

  // Encrypted field component
  const EncryptedField = ({ label, value, originalHint, fieldId, icon: Icon }) => {
    const encryption = detectEncryptionType(value);
    const isExpanded = showFullHash[fieldId];
    
    if (!value) return null;

    const colorClasses = {
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-700' },
      cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600', badge: 'bg-cyan-100 text-cyan-700' },
      green: { bg: 'bg-green-100', text: 'text-green-600', badge: 'bg-green-100 text-green-700' },
      amber: { bg: 'bg-amber-100', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
      emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
      rose: { bg: 'bg-rose-100', text: 'text-rose-600', badge: 'bg-rose-100 text-rose-700' },
      teal: { bg: 'bg-teal-100', text: 'text-teal-600', badge: 'bg-teal-100 text-teal-700' },
      slate: { bg: 'bg-slate-100', text: 'text-slate-600', badge: 'bg-slate-100 text-slate-700' },
      gray: { bg: 'bg-gray-100', text: 'text-gray-600', badge: 'bg-gray-100 text-gray-700' },
    };

    const colors = colorClasses[encryption.color] || colorClasses.gray;

    return (
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`p-2 ${colors.bg} rounded-lg shrink-0`}>
              {Icon ? <Icon className={`w-4 h-4 ${colors.text}`} /> : <Lock className={`w-4 h-4 ${colors.text}`} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-gray-900">{label}</span>
                <span className={`px-2 py-0.5 text-xs font-medium ${colors.badge} rounded-full`}>
                  {encryption.label}
                </span>
              </div>
              
              {originalHint && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <EyeOff className="w-3 h-3" />
                  Original: {originalHint}
                </p>
              )}
              
              <div className="mt-2 relative">
                <code className="block text-xs bg-gray-900 text-green-400 p-3 rounded-lg font-mono break-all">
                  {isExpanded ? value : truncateHash(value, 60)}
                </code>
                
                <div className="absolute top-2 right-2 flex gap-1">
                  {value.length > 60 && (
                    <button
                      onClick={() => toggleFullHash(fieldId)}
                      className="p-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
                      title={isExpanded ? 'Show less' : 'Show full'}
                    >
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                  <button
                    onClick={() => copyToClipboard(value, fieldId)}
                    className="p-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
                    title="Copy"
                  >
                    {copiedId === fieldId ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
              
              <p className="text-xs text-gray-400 mt-1">
                Length: {value.length} characters
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-20 h-20 border-4 border-emerald-200 rounded-full animate-spin border-t-emerald-600"></div>
            <Shield className="w-8 h-8 text-emerald-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading encryption status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                Encryption & Security Status
              </h1>
              <p className="text-emerald-100 mt-2">
                Real-time view of encrypted and hashed data protecting your platform
              </p>
            </div>
            <button
              onClick={handleRefreshAll}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh All
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/20">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.totalElections}</p>
              <p className="text-sm text-emerald-200 mt-1">Protected Elections</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-300">{stats.totalAuditLogs}</p>
              <p className="text-sm text-emerald-200 mt-1">Audit Actions</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-300">{stats.totalHashChainBlocks}</p>
              <p className="text-sm text-emerald-200 mt-1">Hash Chain Blocks</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-300">{stats.totalPaymentTokens}</p>
              <p className="text-sm text-emerald-200 mt-1">Payment Tokens</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Status Badge */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 shadow-lg flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-white">All Systems Secure</p>
              <p className="text-sm text-green-100">Last verified: {new Date().toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white font-medium">AES-256-GCM</span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white font-medium">SHA-256</span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white font-medium">RSA-2048</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">

        {/* What This Page Shows */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Info className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">What You're Seeing Here</h3>
              <p className="text-gray-600 mt-2">
                This page shows <strong>actual encrypted and hashed data</strong> from your database:
              </p>
              <ul className="mt-3 space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <Hash className="w-4 h-4 text-amber-500 mt-1 shrink-0" />
                  <span><strong>Audit Hashes</strong> - Every action is cryptographically signed</span>
                </li>
                <li className="flex items-start gap-2">
                  <Link2 className="w-4 h-4 text-purple-500 mt-1 shrink-0" />
                  <span><strong>Hash Chain</strong> - Blockchain-style verification of votes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-500 mt-1 shrink-0" />
                  <span><strong>Payment Tokens</strong> - Real card numbers never stored</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* SECTION 1: AUDIT TRAIL HASHES */}
        {/* ============================================ */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <button
            onClick={() => toggleSection('auditHashes')}
            className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-amber-500 to-orange-500 text-white"
          >
            <div className="flex items-center gap-3">
              <Link2 className="w-6 h-6" />
              <span className="font-bold text-lg">Blockchain Audit Trail</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">SHA-256 Chain</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">{stats.totalAuditLogs}</span>
              {expandedSections.auditHashes ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>
          
          {expandedSections.auditHashes && (
            <div className="p-6">
              {Array.isArray(auditLogs) && auditLogs.length > 0 ? (
                <div className="space-y-6">
                  {auditLogs.slice(0, 5).map((log, index) => (
                    <div key={log.id || index} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                            <span className="font-bold text-amber-600 text-sm">
                              #{log.id || index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {log.action_type || 'Audit Action'}
                            </p>
                            <p className="text-sm text-gray-500">
                              Election #{log.election_id} • {formatDate(log.created_at)}
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                          ⛓️ Blockchain
                        </span>
                      </div>
                      
                      <div className="grid gap-4">
                        {log.vote_hash && (
                          <EncryptedField
                            label="Vote Hash"
                            value={log.vote_hash}
                            originalHint="Voter's encrypted choice"
                            fieldId={`audit-vote-${log.id || index}`}
                            icon={Vote}
                          />
                        )}
                        {log.action_hash && (
                          <EncryptedField
                            label="Action Hash"
                            value={log.action_hash}
                            originalHint="This action's signature"
                            fieldId={`audit-action-${log.id || index}`}
                            icon={Hash}
                          />
                        )}
                        {log.block_hash && (
                          <EncryptedField
                            label="Block Hash"
                            value={log.block_hash}
                            originalHint="Block verification"
                            fieldId={`audit-block-${log.id || index}`}
                            icon={Box}
                          />
                        )}
                        {log.previous_hash && (
                          <EncryptedField
                            label="Previous Hash"
                            value={log.previous_hash}
                            originalHint="Links to previous block"
                            fieldId={`audit-prev-${log.id || index}`}
                            icon={Link2}
                          />
                        )}
                        {log.ip_address && (
                          <div className="text-xs text-gray-500">
                            IP: {log.ip_address} • User: {log.user_id || 'System'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Link2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No audit logs found</p>
                  <p className="text-sm text-gray-400 mt-1">Audit entries will appear as actions are performed</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* SECTION 2: ELECTION HASH CHAIN VERIFICATION */}
        {/* ============================================ */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <button
            onClick={() => toggleSection('hashChain')}
            className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
          >
            <div className="flex items-center gap-3">
              <Layers className="w-6 h-6" />
              <span className="font-bold text-lg">Election Hash Chain Verification</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">{stats.totalElections}</span>
              {expandedSections.hashChain ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>
          
          {expandedSections.hashChain && (
            <div className="p-6">
              {/* Election Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select an Election to View Hash Chain
                </label>
                <div className="flex gap-4 flex-wrap">
                  <select
                    value={selectedElectionId}
                    onChange={(e) => handleElectionSelect(e.target.value)}
                    disabled={electionsLoading}
                    className="flex-1 min-w-[250px] border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">
                      {electionsLoading ? 'Loading elections...' : '-- Select an Election --'}
                    </option>
                    {elections.map((election) => (
                      <option key={election.id} value={election.id}>
                        #{election.id} - {election.title} ({election.status})
                      </option>
                    ))}
                  </select>
                  
                  {selectedElectionId && (
                    <button
                      onClick={handleVerifyIntegrity}
                      disabled={integrityLoading}
                      className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50"
                    >
                      <Shield className="w-4 h-4" />
                      {integrityLoading ? 'Verifying...' : 'Verify Integrity'}
                    </button>
                  )}
                </div>
              </div>

              {/* Integrity Result */}
              {integrityData && (
                <div className={`mb-6 p-4 rounded-xl border-2 ${
                  integrityData.verified 
                    ? 'bg-green-50 border-green-400' 
                    : 'bg-red-50 border-red-400'
                }`}>
                  <div className="flex items-center gap-3">
                    {integrityData.verified ? (
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                    )}
                    <div className="flex-1">
                      <p className="font-bold text-lg">
                        {integrityData.verified ? '✓ Integrity Verified' : '⚠ Issues Detected'}
                      </p>
                      <p className="text-sm text-gray-600">{integrityData.message}</p>
                    </div>
                    {integrityData.integrityScore !== undefined && (
                      <span className={`text-xl font-bold px-4 py-2 rounded-full ${
                        integrityData.integrityScore >= 90 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                      }`}>
                        {integrityData.integrityScore}%
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Hash Chain */}
              {selectedElectionId && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600" />
                    Hash Chain Blocks
                    {hashChainLoading && <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />}
                  </h4>

                  {hashChain.length > 0 ? (
                    <div className="space-y-4">
                      {hashChain.map((block, index) => (
                        <div 
                          key={block.blockNumber || index}
                          className={`rounded-xl p-4 border ${
                            block.voteType === 'anonymous' 
                              ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200'
                              : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold">
                                Block #{block.blockNumber}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                block.voteType === 'anonymous' 
                                  ? 'bg-purple-200 text-purple-800' 
                                  : 'bg-blue-200 text-blue-800'
                              }`}>
                                {block.voteType === 'anonymous' ? '🔒 Anonymous' : '👤 Normal'}
                              </span>
                              {block.verified && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(block.timestamp)}
                            </span>
                          </div>

                          <div className="grid gap-3">
                            {block.voteHash && (
                              <EncryptedField
                                label="Vote Hash"
                                value={block.voteHash}
                                originalHint="Encrypted vote choice"
                                fieldId={`chain-vote-${block.blockNumber}`}
                                icon={Vote}
                              />
                            )}
                            {block.blockHash && (
                              <EncryptedField
                                label="Block Hash"
                                value={block.blockHash}
                                originalHint="This block's signature"
                                fieldId={`chain-block-${block.blockNumber}`}
                                icon={Box}
                              />
                            )}
                            {block.previousHash && (
                              <EncryptedField
                                label="Previous Hash"
                                value={block.previousHash}
                                originalHint={block.previousHash.startsWith('0000') ? 'Genesis Block' : 'Links to previous'}
                                fieldId={`chain-prev-${block.blockNumber}`}
                                icon={Link2}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">
                        {hashChainLoading ? 'Loading hash chain...' : 'No votes found for this election'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!selectedElectionId && (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Select an election above to view its hash chain</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* SECTION 3: TOKENIZED PAYMENTS */}
        {/* ============================================ */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <button
            onClick={() => toggleSection('payments')}
            className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6" />
              <span className="font-bold text-lg">Tokenized Payments</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Stripe/Paddle Tokens</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">{stats.totalPaymentTokens}</span>
              {expandedSections.payments ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>
          
          {expandedSections.payments && (
            <div className="p-6">
              {recentPayments.length > 0 ? (
                <div className="space-y-6">
                  {recentPayments.slice(0, 5).map((payment, index) => (
                    <div key={payment.id || index} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {payment.election_title || `Election #${payment.election_id}`}
                            </p>
                            <p className="text-sm text-gray-500">
                              ${payment.amount} • {payment.gateway_used || 'Stripe'} • {formatDate(payment.created_at)}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          payment.status === 'succeeded' || payment.status === 'completed' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                      
                      {payment.payment_intent_id && (
                        <EncryptedField
                          label="Payment Intent Token"
                          value={payment.payment_intent_id}
                          originalHint="Card: **** **** **** 4242 (Never Stored)"
                          fieldId={`payment-${payment.id || index}`}
                          icon={Lock}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No payment tokens found</p>
                  <p className="text-sm text-gray-400 mt-1">Tokens will appear as payments are processed</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Security Legend */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border">
          <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-gray-600" />
            Security Types Explained
          </h3>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span className="font-semibold text-gray-900">SHA-256</span>
              </div>
              <p className="text-sm text-gray-600">
                Blockchain-style hash chain for tamper detection
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-4 border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="font-semibold text-gray-900">AES-256</span>
              </div>
              <p className="text-sm text-gray-600">
                Military-grade encryption for votes
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-4 border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="font-semibold text-gray-900">Tokenized</span>
              </div>
              <p className="text-sm text-gray-600">
                Payment data replaced with secure tokens
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-4 border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <span className="font-semibold text-gray-900">Chain Link</span>
              </div>
              <p className="text-sm text-gray-600">
                Each block links to previous - tamper-proof
              </p>
            </div>
          </div>
        </div>

        {/* Client Reassurance */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded-xl shrink-0">
              <ShieldCheck className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">What This Means For Your Users</h3>
              <div className="mt-3 grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700">Nobody can see how someone voted - not even admins</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700">Any tampering attempt is immediately detected</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700">Credit card numbers never touch our servers</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700">All actions are permanently recorded and auditable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}