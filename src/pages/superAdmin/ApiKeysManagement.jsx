// src/pages/admin/ApiKeysManagement.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Key, Plus, Copy, Eye, EyeOff, Trash2, 
  Check, X, RefreshCw, BarChart3, Shield,
  AlertTriangle, CheckCircle, Database, PieChart
} from 'lucide-react';
import { toast } from 'react-toastify';

// ═══════════════════════════════════════════════════════════════════════════
// RTK Query hooks - ELECTION API KEYS (election-service 3005) - UNCHANGED
// ═══════════════════════════════════════════════════════════════════════════
import {
  useGetApiKeysQuery,
  useCreateApiKeyMutation,
  useToggleApiKeyStatusMutation,
  useRevokeApiKeyMutation,
  useLazyGetApiKeyUsageQuery,
} from '../../redux/api/election/apiKeyApi';

// ═══════════════════════════════════════════════════════════════════════════
// RTK Query hooks - ANALYTICS API KEYS (voting-service 3007) - NEW
// ═══════════════════════════════════════════════════════════════════════════
import {
  useGetAnalyticsApiKeysQuery,
  useCreateAnalyticsApiKeyMutation,
  useToggleAnalyticsApiKeyStatusMutation,
  useRevokeAnalyticsApiKeyMutation,
  useLazyGetAnalyticsApiKeyUsageQuery,
} from '../../redux/api/analytics/analyticsApiKeyApi';

export default function ApiKeysManagement() {
  /*eslint-disable*/
  const { t } = useTranslation();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('elections'); // 'elections' or 'analytics'

  // ═══════════════════════════════════════════════════════════════════════════
  // ELECTION API KEYS - RTK Query hooks (COMPLETELY UNCHANGED)
  // ═══════════════════════════════════════════════════════════════════════════
  const { data: apiKeys = [], isLoading: loading, refetch } = useGetApiKeysQuery();
  const [createApiKey, { isLoading: creating }] = useCreateApiKeyMutation();
  const [toggleApiKeyStatus] = useToggleApiKeyStatusMutation();
  const [revokeApiKey] = useRevokeApiKeyMutation();
  const [getApiKeyUsage] = useLazyGetApiKeyUsageQuery();

  // ═══════════════════════════════════════════════════════════════════════════
  // ANALYTICS API KEYS - RTK Query hooks (NEW - replaces fetch)
  // ═══════════════════════════════════════════════════════════════════════════
  const { data: analyticsKeys = [], isLoading: analyticsLoading, refetch: refetchAnalytics } = useGetAnalyticsApiKeysQuery();
  const [createAnalyticsApiKey, { isLoading: analyticsCreating }] = useCreateAnalyticsApiKeyMutation();
  const [toggleAnalyticsApiKeyStatus] = useToggleAnalyticsApiKeyStatusMutation();
  const [revokeAnalyticsApiKey] = useRevokeAnalyticsApiKeyMutation();
  const [getAnalyticsApiKeyUsage] = useLazyGetAnalyticsApiKeyUsageQuery();

  // ═══════════════════════════════════════════════════════════════════════════
  // LOCAL STATE - ELECTIONS (UNCHANGED)
  // ═══════════════════════════════════════════════════════════════════════════
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [usageData, setUsageData] = useState([]);
  const [newKeyData, setNewKeyData] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Form state for elections (UNCHANGED)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    expires_at: ''
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // LOCAL STATE - ANALYTICS
  // ═══════════════════════════════════════════════════════════════════════════
  const [showAnalyticsCreateModal, setShowAnalyticsCreateModal] = useState(false);
  const [showAnalyticsUsageModal, setShowAnalyticsUsageModal] = useState(false);
  const [selectedAnalyticsKey, setSelectedAnalyticsKey] = useState(null);
  const [analyticsUsageData, setAnalyticsUsageData] = useState([]);
  const [newAnalyticsKeyData, setNewAnalyticsKeyData] = useState(null);
  const [copiedAnalyticsKey, setCopiedAnalyticsKey] = useState(false);

  const [analyticsFormData, setAnalyticsFormData] = useState({
    name: '',
    description: '',
    expires_at: ''
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ELECTION API KEY HANDLERS (COMPLETELY UNCHANGED)
  // ═══════════════════════════════════════════════════════════════════════════

  // Close modal for elections
  const closeModal = () => {
    setShowCreateModal(false);
    setNewKeyData(null);
    setFormData({ name: '', description: '', expires_at: '' });
  };

  // Create API key - UNCHANGED
  const handleCreateKey = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a key name');
      return;
    }

    try {
      const result = await createApiKey({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        environment: 'live',
        expires_at: formData.expires_at || null
      }).unwrap();
      
      setNewKeyData(result);
      toast.success('API key created successfully!');
    } catch (error) {
      console.error('Create API Key Error:', error);
      toast.error(error.data?.message || 'Failed to create API key');
    }
  };

  // Toggle API key status - UNCHANGED
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await toggleApiKeyStatus({ id, is_active: !currentStatus }).unwrap();
      toast.success(`API key ${currentStatus ? 'disabled' : 'enabled'}`);
    } catch (error) {
      console.error('Toggle Status Error:', error);
      toast.error('Failed to update API key');
    }
  };

  // Delete API key - UNCHANGED
  const handleDeleteKey = async (id, name) => {
    if (!confirm(`Are you sure you want to revoke "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await revokeApiKey(id).unwrap();
      toast.success('API key revoked');
    } catch (error) {
      console.error('Delete API Key Error:', error);
      toast.error('Failed to revoke API key');
    }
  };

  // View usage stats - UNCHANGED
  const handleViewUsage = async (key) => {
    try {
      setSelectedKey(key);
      const result = await getApiKeyUsage({ id: key.id, days: 30 }).unwrap();
      setUsageData(result || []);
      setShowUsageModal(true);
    } catch (error) {
      console.error('Fetch Usage Error:', error);
      toast.error('Failed to load usage data');
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ANALYTICS API KEY HANDLERS (NEW - using RTK Query)
  // ═══════════════════════════════════════════════════════════════════════════

  // Close analytics modal
  const closeAnalyticsModal = () => {
    setShowAnalyticsCreateModal(false);
    setNewAnalyticsKeyData(null);
    setAnalyticsFormData({ name: '', description: '', expires_at: '' });
  };

  // Create analytics API key
  const handleCreateAnalyticsKey = async (e) => {
    e.preventDefault();
    
    if (!analyticsFormData.name.trim()) {
      toast.error('Please enter a key name');
      return;
    }

    try {
      const result = await createAnalyticsApiKey({
        name: analyticsFormData.name.trim(),
        description: analyticsFormData.description.trim() || null,
        environment: 'live',
        expires_at: analyticsFormData.expires_at || null
      }).unwrap();
      
      setNewAnalyticsKeyData(result);
      toast.success('Analytics API key created successfully!');
    } catch (error) {
      console.error('Create Analytics API Key Error:', error);
      toast.error(error.data?.message || 'Failed to create API key');
    }
  };

  // Toggle analytics API key status
  const handleToggleAnalyticsStatus = async (id, currentStatus) => {
    try {
      await toggleAnalyticsApiKeyStatus({ id, is_active: !currentStatus }).unwrap();
      toast.success(`API key ${currentStatus ? 'disabled' : 'enabled'}`);
    } catch (error) {
      console.error('Toggle Analytics Status Error:', error);
      toast.error('Failed to update API key');
    }
  };

  // Delete analytics API key
  const handleDeleteAnalyticsKey = async (id, name) => {
    if (!confirm(`Are you sure you want to revoke "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await revokeAnalyticsApiKey(id).unwrap();
      toast.success('API key revoked');
    } catch (error) {
      console.error('Delete Analytics API Key Error:', error);
      toast.error('Failed to revoke API key');
    }
  };

  // View analytics usage stats
  const handleViewAnalyticsUsage = async (key) => {
    try {
      setSelectedAnalyticsKey(key);
      const result = await getAnalyticsApiKeyUsage({ id: key.id, days: 30 }).unwrap();
      setAnalyticsUsageData(result || []);
      setShowAnalyticsUsageModal(true);
    } catch (error) {
      console.error('Fetch Analytics Usage Error:', error);
      toast.error('Failed to load usage data');
    }
  };

  // Copy analytics key to clipboard
  const copyAnalyticsToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedAnalyticsKey(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedAnalyticsKey(false), 2000);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Key className="w-7 h-7 text-purple-600" />
            API Keys Management
          </h1>
          <p className="text-gray-600 mt-1">
            Create and manage API keys for external integrations
          </p>
        </div>
        <button
          onClick={() => activeTab === 'elections' ? setShowCreateModal(true) : setShowAnalyticsCreateModal(true)}
          className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition ${
            activeTab === 'elections' 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          <Plus className="w-5 h-5" />
          {activeTab === 'elections' ? 'Create Election Key' : 'Create Analytics Key'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('elections')}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'elections'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Database className="w-4 h-4" />
            Election API Keys
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'elections' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}>
              {apiKeys.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <PieChart className="w-4 h-4" />
            Analytics API Keys
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'analytics' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
            }`}>
              {analyticsKeys.length}
            </span>
          </button>
        </nav>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* ELECTION API KEYS TAB - UNCHANGED */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'elections' && (
        <>
          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">Election API Key Security</h3>
                <p className="text-sm text-blue-700 mt-1">
                  API keys provide access to election data for external applications. 
                  Keys start with <code className="bg-blue-100 px-1 rounded">vt_live_</code>. 
                  Keep your keys secure and never share them publicly.
                </p>
              </div>
            </div>
          </div>

          {/* API Keys Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Your Election API Keys</h2>
              <button
                onClick={() => refetch()}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
                <p className="text-gray-500 mt-2">Loading API keys...</p>
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="p-8 text-center">
                <Key className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-gray-500 mt-2">No election API keys created yet</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create your first election API key
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Used</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {apiKeys.map((key) => (
                      <tr key={key.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{key.name}</p>
                            {key.description && (
                              <p className="text-sm text-gray-500">{key.description}</p>
                            )}
                            <p className="text-xs text-gray-400">By: {key.created_by}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">
                            {key.key_prefix}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1 ${
                            key.is_active ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {key.is_active ? (
                              <><CheckCircle className="w-4 h-4" /> Active</>
                            ) : (
                              <><X className="w-4 h-4" /> Disabled</>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(key.last_used_at)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(key.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewUsage(key)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                              title="View Usage"
                            >
                              <BarChart3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(key.id, key.is_active)}
                              className={`p-2 rounded ${
                                key.is_active 
                                  ? 'text-yellow-600 hover:bg-yellow-50' 
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                              title={key.is_active ? 'Disable' : 'Enable'}
                            >
                              {key.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteKey(key.id, key.name)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                              title="Revoke"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* ANALYTICS API KEYS TAB - NEW (using RTK Query) */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'analytics' && (
        <>
          {/* Info Card */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-purple-900">Analytics API Key Security</h3>
                <p className="text-sm text-purple-700 mt-1">
                  These keys provide access to platform analytics and reports.
                  Keys start with <code className="bg-purple-100 px-1 rounded">vta_live_</code>. 
                  Keep your keys secure and never share them publicly.
                </p>
              </div>
            </div>
          </div>

          {/* API Keys Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Your Analytics API Keys</h2>
              <button
                onClick={() => refetchAnalytics()}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {analyticsLoading ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
                <p className="text-gray-500 mt-2">Loading API keys...</p>
              </div>
            ) : analyticsKeys.length === 0 ? (
              <div className="p-8 text-center">
                <PieChart className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-gray-500 mt-2">No analytics API keys created yet</p>
                <button
                  onClick={() => setShowAnalyticsCreateModal(true)}
                  className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
                >
                  Create your first analytics API key
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Used</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analyticsKeys.map((key) => (
                      <tr key={key.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{key.name}</p>
                            {key.description && (
                              <p className="text-sm text-gray-500">{key.description}</p>
                            )}
                            <p className="text-xs text-gray-400">By: {key.created_by}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <code className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-mono">
                            {key.key_preview}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1 ${
                            key.is_active ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {key.is_active ? (
                              <><CheckCircle className="w-4 h-4" /> Active</>
                            ) : (
                              <><X className="w-4 h-4" /> Disabled</>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(key.last_used_at)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(key.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewAnalyticsUsage(key)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                              title="View Usage"
                            >
                              <BarChart3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleAnalyticsStatus(key.id, key.is_active)}
                              className={`p-2 rounded ${
                                key.is_active 
                                  ? 'text-yellow-600 hover:bg-yellow-50' 
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                              title={key.is_active ? 'Disable' : 'Enable'}
                            >
                              {key.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteAnalyticsKey(key.id, key.name)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                              title="Revoke"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* ELECTION CREATE MODAL - UNCHANGED */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                Create Election API Key
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {newKeyData ? (
              <div className="p-6 space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex gap-2 items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">API Key Created!</p>
                      <p className="text-sm text-green-700 mt-1">Copy your API key now. You won't be able to see it again.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your API Key</label>
                  <div className="flex gap-2">
                    <input type="text" value={newKeyData.api_key} readOnly className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 font-mono text-sm" />
                    <button
                      onClick={() => copyToClipboard(newKeyData.api_key)}
                      className={`px-3 py-2 rounded-lg transition ${copiedKey ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                      {copiedKey ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <p className="text-sm text-yellow-800">Store this key securely. It will not be shown again.</p>
                  </div>
                </div>

                <button onClick={closeModal} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateKey} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Key Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Mobile App Integration, Partner API Access"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">A friendly name to identify this key</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Used by XYZ company for their voting widget"
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date (Optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> A secure API key (format: vt_live_xxx...) will be automatically generated.
                  </p>
                </div>

                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-2">How to use your API key:</p>
                  <code className="text-xs text-green-400 block font-mono">curl -H "X-API-Key: vt_live_xxx..." \</code>
                  <code className="text-xs text-green-400 block font-mono ml-4">https://api.vottery.com/api/v1/elections</code>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
                  <button
                    type="submit"
                    disabled={creating || !formData.name.trim()}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    {creating ? 'Generating...' : 'Generate API Key'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* ANALYTICS CREATE MODAL - NEW */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {showAnalyticsCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-600" />
                Create Analytics API Key
              </h3>
              <button onClick={closeAnalyticsModal} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {newAnalyticsKeyData ? (
              <div className="p-6 space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex gap-2 items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">Analytics API Key Created!</p>
                      <p className="text-sm text-green-700 mt-1">Copy your API key now. You won't be able to see it again.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your API Key</label>
                  <div className="flex gap-2">
                    <input type="text" value={newAnalyticsKeyData.api_key} readOnly className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 font-mono text-sm" />
                    <button
                      onClick={() => copyAnalyticsToClipboard(newAnalyticsKeyData.api_key)}
                      className={`px-3 py-2 rounded-lg transition ${copiedAnalyticsKey ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                      {copiedAnalyticsKey ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <p className="text-sm text-yellow-800">Store this key securely. It will not be shown again.</p>
                  </div>
                </div>

                <button onClick={closeAnalyticsModal} className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateAnalyticsKey} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Key Name *</label>
                  <input
                    type="text"
                    value={analyticsFormData.name}
                    onChange={(e) => setAnalyticsFormData({ ...analyticsFormData, name: e.target.value })}
                    placeholder="e.g., External Dashboard, Partner Analytics"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">A friendly name to identify this key</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea
                    value={analyticsFormData.description}
                    onChange={(e) => setAnalyticsFormData({ ...analyticsFormData, description: e.target.value })}
                    placeholder="e.g., Used for external reporting dashboard"
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date (Optional)</label>
                  <input
                    type="datetime-local"
                    value={analyticsFormData.expires_at}
                    onChange={(e) => setAnalyticsFormData({ ...analyticsFormData, expires_at: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-xs text-purple-800">
                    <strong>Note:</strong> A secure API key (format: vta_live_xxx...) will be automatically generated.
                  </p>
                </div>

                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-2">How to use your analytics API key:</p>
                  <code className="text-xs text-green-400 block font-mono">curl -H "X-API-Key: vta_live_xxx..." \</code>
                  <code className="text-xs text-green-400 block font-mono ml-4">https://api.vottery.com/api/analytics/platform/report</code>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeAnalyticsModal} className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
                  <button
                    type="submit"
                    disabled={analyticsCreating || !analyticsFormData.name.trim()}
                    className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    {analyticsCreating ? 'Generating...' : 'Generate API Key'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* ELECTION USAGE MODAL - UNCHANGED */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {showUsageModal && selectedKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Election API Key Usage</h3>
                <p className="text-sm text-gray-500">{selectedKey.name}</p>
              </div>
              <button onClick={() => setShowUsageModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {usageData.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-gray-500 mt-2">No usage data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-600">Total Requests</p>
                      <p className="text-2xl font-bold text-blue-900">{usageData.reduce((sum, d) => sum + parseInt(d.total_requests || 0), 0)}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-600">Successful</p>
                      <p className="text-2xl font-bold text-green-900">{usageData.reduce((sum, d) => sum + parseInt(d.successful || 0), 0)}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-sm text-red-600">Errors</p>
                      <p className="text-2xl font-bold text-red-900">{usageData.reduce((sum, d) => sum + parseInt(d.errors || 0), 0)}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Daily Breakdown (Last 30 Days)</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-right">Requests</th>
                            <th className="px-4 py-2 text-right">Success</th>
                            <th className="px-4 py-2 text-right">Errors</th>
                            <th className="px-4 py-2 text-right">Avg Response</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {usageData.map((day, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-2">{day.date}</td>
                              <td className="px-4 py-2 text-right">{day.total_requests}</td>
                              <td className="px-4 py-2 text-right text-green-600">{day.successful}</td>
                              <td className="px-4 py-2 text-right text-red-600">{day.errors}</td>
                              <td className="px-4 py-2 text-right">{day.avg_response_time || 0}ms</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* ANALYTICS USAGE MODAL - NEW */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {showAnalyticsUsageModal && selectedAnalyticsKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Analytics API Key Usage</h3>
                <p className="text-sm text-gray-500">{selectedAnalyticsKey.name}</p>
              </div>
              <button onClick={() => setShowAnalyticsUsageModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {analyticsUsageData.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-gray-500 mt-2">No usage data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="text-sm text-purple-600">Total Requests</p>
                      <p className="text-2xl font-bold text-purple-900">{analyticsUsageData.reduce((sum, d) => sum + parseInt(d.total_requests || 0), 0)}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-600">Successful</p>
                      <p className="text-2xl font-bold text-green-900">{analyticsUsageData.reduce((sum, d) => sum + parseInt(d.successful || 0), 0)}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-sm text-red-600">Errors</p>
                      <p className="text-2xl font-bold text-red-900">{analyticsUsageData.reduce((sum, d) => sum + parseInt(d.errors || 0), 0)}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Daily Breakdown (Last 30 Days)</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-right">Requests</th>
                            <th className="px-4 py-2 text-right">Success</th>
                            <th className="px-4 py-2 text-right">Errors</th>
                            <th className="px-4 py-2 text-right">Avg Response</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {analyticsUsageData.map((day, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-2">{day.date}</td>
                              <td className="px-4 py-2 text-right">{day.total_requests}</td>
                              <td className="px-4 py-2 text-right text-green-600">{day.successful}</td>
                              <td className="px-4 py-2 text-right text-red-600">{day.errors}</td>
                              <td className="px-4 py-2 text-right">{day.avg_response_time || 0}ms</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// // src/pages/admin/ApiKeysManagement.jsx
// import React, { useState, useEffect } from 'react';
// import { useTranslation } from 'react-i18next';
// import { 
//   Key, Plus, Copy, Eye, EyeOff, Trash2, 
//   Check, X, RefreshCw, BarChart3, Shield,
//   AlertTriangle, CheckCircle, Database, PieChart
// } from 'lucide-react';
// import { toast } from 'react-toastify';

// // RTK Query hooks - UNCHANGED for election API keys
// import {
//   useGetApiKeysQuery,
//   useCreateApiKeyMutation,
//   useToggleApiKeyStatusMutation,
//   useRevokeApiKeyMutation,
//   useLazyGetApiKeyUsageQuery,
// } from '../../redux/api/election/apiKeyApi';

// // Voting service URL for analytics API keys
// const VOTING_SERVICE_URL = import.meta.env.VITE_VOTING_SERVICE_URL || 'http://localhost:3007';

// export default function ApiKeysManagement() {
//   /*eslint-disable*/
//   const { t } = useTranslation();
  
//   // Tab state
//   const [activeTab, setActiveTab] = useState('elections'); // 'elections' or 'analytics'

//   // ═══════════════════════════════════════════════════════════════════════════
//   // ELECTION API KEYS - COMPLETELY UNCHANGED
//   // ═══════════════════════════════════════════════════════════════════════════
  
//   // RTK Query hooks
//   const { data: apiKeys = [], isLoading: loading, refetch } = useGetApiKeysQuery();
//   const [createApiKey, { isLoading: creating }] = useCreateApiKeyMutation();
//   const [toggleApiKeyStatus] = useToggleApiKeyStatusMutation();
//   const [revokeApiKey] = useRevokeApiKeyMutation();
//   const [getApiKeyUsage] = useLazyGetApiKeyUsageQuery();

//   // Local state for elections
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showUsageModal, setShowUsageModal] = useState(false);
//   const [selectedKey, setSelectedKey] = useState(null);
//   const [usageData, setUsageData] = useState([]);
//   const [newKeyData, setNewKeyData] = useState(null);
//   const [copiedKey, setCopiedKey] = useState(false);

//   // Form state for elections
//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     expires_at: ''
//   });

//   // Close modal for elections
//   const closeModal = () => {
//     setShowCreateModal(false);
//     setNewKeyData(null);
//     setFormData({ name: '', description: '', expires_at: '' });
//   };

//   // Create API key - UNCHANGED
//   const handleCreateKey = async (e) => {
//     e.preventDefault();
    
//     if (!formData.name.trim()) {
//       toast.error('Please enter a key name');
//       return;
//     }

//     try {
//       const result = await createApiKey({
//         name: formData.name.trim(),
//         description: formData.description.trim() || null,
//         environment: 'live',
//         expires_at: formData.expires_at || null
//       }).unwrap();
      
//       setNewKeyData(result);
//       toast.success('API key created successfully!');
//     } catch (error) {
//       console.error('Create API Key Error:', error);
//       toast.error(error.data?.message || 'Failed to create API key');
//     }
//   };

//   // Toggle API key status - UNCHANGED
//   const handleToggleStatus = async (id, currentStatus) => {
//     try {
//       await toggleApiKeyStatus({ id, is_active: !currentStatus }).unwrap();
//       toast.success(`API key ${currentStatus ? 'disabled' : 'enabled'}`);
//     } catch (error) {
//       console.error('Toggle Status Error:', error);
//       toast.error('Failed to update API key');
//     }
//   };

//   // Delete API key - UNCHANGED
//   const handleDeleteKey = async (id, name) => {
//     if (!confirm(`Are you sure you want to revoke "${name}"? This action cannot be undone.`)) {
//       return;
//     }

//     try {
//       await revokeApiKey(id).unwrap();
//       toast.success('API key revoked');
//     } catch (error) {
//       console.error('Delete API Key Error:', error);
//       toast.error('Failed to revoke API key');
//     }
//   };

//   // View usage stats - UNCHANGED
//   const handleViewUsage = async (key) => {
//     try {
//       setSelectedKey(key);
//       const result = await getApiKeyUsage({ id: key.id, days: 30 }).unwrap();
//       setUsageData(result || []);
//       setShowUsageModal(true);
//     } catch (error) {
//       console.error('Fetch Usage Error:', error);
//       toast.error('Failed to load usage data');
//     }
//   };

//   // Copy to clipboard
//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text);
//     setCopiedKey(true);
//     toast.success('Copied to clipboard!');
//     setTimeout(() => setCopiedKey(false), 2000);
//   };

//   // Format date
//   const formatDate = (date) => {
//     if (!date) return 'Never';
//     return new Date(date).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   // ═══════════════════════════════════════════════════════════════════════════
//   // ANALYTICS API KEYS - NEW SEPARATE LOGIC
//   // ═══════════════════════════════════════════════════════════════════════════

//   const [analyticsKeys, setAnalyticsKeys] = useState([]);
//   const [analyticsLoading, setAnalyticsLoading] = useState(false);
//   const [analyticsCreating, setAnalyticsCreating] = useState(false);
//   const [showAnalyticsCreateModal, setShowAnalyticsCreateModal] = useState(false);
//   const [showAnalyticsUsageModal, setShowAnalyticsUsageModal] = useState(false);
//   const [selectedAnalyticsKey, setSelectedAnalyticsKey] = useState(null);
//   const [analyticsUsageData, setAnalyticsUsageData] = useState([]);
//   const [newAnalyticsKeyData, setNewAnalyticsKeyData] = useState(null);
//   const [copiedAnalyticsKey, setCopiedAnalyticsKey] = useState(false);

//   const [analyticsFormData, setAnalyticsFormData] = useState({
//     name: '',
//     description: '',
//     expires_at: ''
//   });

//   // Fetch analytics API keys
//   const fetchAnalyticsKeys = async () => {
//     try {
//       setAnalyticsLoading(true);
//       const response = await fetch(`${VOTING_SERVICE_URL}/api/admin/analytics-api-keys`, {
//         headers: {
//           'Content-Type': 'application/json',
//           'x-user-data': localStorage.getItem('userData') || '{}'
//         }
//       });
//       const data = await response.json();
//       if (data.success) {
//         setAnalyticsKeys(data.data || []);
//       }
//     } catch (error) {
//       console.error('Fetch analytics keys error:', error);
//     } finally {
//       setAnalyticsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (activeTab === 'analytics') {
//       fetchAnalyticsKeys();
//     }
//   }, [activeTab]);

//   // Close analytics modal
//   const closeAnalyticsModal = () => {
//     setShowAnalyticsCreateModal(false);
//     setNewAnalyticsKeyData(null);
//     setAnalyticsFormData({ name: '', description: '', expires_at: '' });
//   };

//   // Create analytics API key
//   const handleCreateAnalyticsKey = async (e) => {
//     e.preventDefault();
    
//     if (!analyticsFormData.name.trim()) {
//       toast.error('Please enter a key name');
//       return;
//     }

//     try {
//       setAnalyticsCreating(true);
//       const response = await fetch(`${VOTING_SERVICE_URL}/api/admin/analytics-api-keys`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-user-data': localStorage.getItem('userData') || '{}'
//         },
//         body: JSON.stringify({
//           name: analyticsFormData.name.trim(),
//           description: analyticsFormData.description.trim() || null,
//           environment: 'live',
//           expires_at: analyticsFormData.expires_at || null
//         })
//       });

//       const result = await response.json();
      
//       if (result.success) {
//         setNewAnalyticsKeyData(result.data);
//         fetchAnalyticsKeys();
//         toast.success('Analytics API key created successfully!');
//       } else {
//         toast.error(result.message || 'Failed to create API key');
//       }
//     } catch (error) {
//       console.error('Create analytics key error:', error);
//       toast.error('Failed to create API key');
//     } finally {
//       setAnalyticsCreating(false);
//     }
//   };

//   // Toggle analytics API key status
//   const handleToggleAnalyticsStatus = async (id, currentStatus) => {
//     try {
//       const response = await fetch(`${VOTING_SERVICE_URL}/api/admin/analytics-api-keys/${id}/status`, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-user-data': localStorage.getItem('userData') || '{}'
//         },
//         body: JSON.stringify({ is_active: !currentStatus })
//       });

//       const result = await response.json();
//       if (result.success) {
//         fetchAnalyticsKeys();
//         toast.success(`API key ${currentStatus ? 'disabled' : 'enabled'}`);
//       }
//     } catch (error) {
//       console.error('Toggle analytics key error:', error);
//       toast.error('Failed to update API key');
//     }
//   };

//   // Delete analytics API key
//   const handleDeleteAnalyticsKey = async (id, name) => {
//     if (!confirm(`Are you sure you want to revoke "${name}"? This action cannot be undone.`)) {
//       return;
//     }

//     try {
//       const response = await fetch(`${VOTING_SERVICE_URL}/api/admin/analytics-api-keys/${id}`, {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-user-data': localStorage.getItem('userData') || '{}'
//         }
//       });

//       const result = await response.json();
//       if (result.success) {
//         fetchAnalyticsKeys();
//         toast.success('API key revoked');
//       }
//     } catch (error) {
//       console.error('Delete analytics key error:', error);
//       toast.error('Failed to revoke API key');
//     }
//   };

//   // View analytics usage stats
//   const handleViewAnalyticsUsage = async (key) => {
//     try {
//       setSelectedAnalyticsKey(key);
//       const response = await fetch(`${VOTING_SERVICE_URL}/api/admin/analytics-api-keys/${key.id}/usage?days=30`, {
//         headers: {
//           'Content-Type': 'application/json',
//           'x-user-data': localStorage.getItem('userData') || '{}'
//         }
//       });
//       const result = await response.json();
//       setAnalyticsUsageData(result.data || []);
//       setShowAnalyticsUsageModal(true);
//     } catch (error) {
//       console.error('Fetch analytics usage error:', error);
//       toast.error('Failed to load usage data');
//     }
//   };

//   // Copy analytics key to clipboard
//   const copyAnalyticsToClipboard = (text) => {
//     navigator.clipboard.writeText(text);
//     setCopiedAnalyticsKey(true);
//     toast.success('Copied to clipboard!');
//     setTimeout(() => setCopiedAnalyticsKey(false), 2000);
//   };

//   // ═══════════════════════════════════════════════════════════════════════════
//   // RENDER
//   // ═══════════════════════════════════════════════════════════════════════════

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
//             <Key className="w-7 h-7 text-purple-600" />
//             API Keys Management
//           </h1>
//           <p className="text-gray-600 mt-1">
//             Create and manage API keys for external integrations
//           </p>
//         </div>
//         <button
//           onClick={() => activeTab === 'elections' ? setShowCreateModal(true) : setShowAnalyticsCreateModal(true)}
//           className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition ${
//             activeTab === 'elections' 
//               ? 'bg-blue-600 hover:bg-blue-700' 
//               : 'bg-purple-600 hover:bg-purple-700'
//           }`}
//         >
//           <Plus className="w-5 h-5" />
//           {activeTab === 'elections' ? 'Create Election Key' : 'Create Analytics Key'}
//         </button>
//       </div>

//       {/* Tabs */}
//       <div className="border-b border-gray-200">
//         <nav className="-mb-px flex space-x-8">
//           <button
//             onClick={() => setActiveTab('elections')}
//             className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
//               activeTab === 'elections'
//                 ? 'border-blue-500 text-blue-600'
//                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//             }`}
//           >
//             <Database className="w-4 h-4" />
//             Election API Keys
//             <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
//               activeTab === 'elections' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
//             }`}>
//               {apiKeys.length}
//             </span>
//           </button>
//           <button
//             onClick={() => setActiveTab('analytics')}
//             className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
//               activeTab === 'analytics'
//                 ? 'border-purple-500 text-purple-600'
//                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//             }`}
//           >
//             <PieChart className="w-4 h-4" />
//             Analytics API Keys
//             <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
//               activeTab === 'analytics' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
//             }`}>
//               {analyticsKeys.length}
//             </span>
//           </button>
//         </nav>
//       </div>

//       {/* ═══════════════════════════════════════════════════════════════════════════ */}
//       {/* ELECTION API KEYS TAB - UNCHANGED */}
//       {/* ═══════════════════════════════════════════════════════════════════════════ */}
//       {activeTab === 'elections' && (
//         <>
//           {/* Info Card */}
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//             <div className="flex gap-3">
//               <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
//               <div>
//                 <h3 className="font-medium text-blue-900">Election API Key Security</h3>
//                 <p className="text-sm text-blue-700 mt-1">
//                   API keys provide access to election data for external applications. 
//                   Keys start with <code className="bg-blue-100 px-1 rounded">vt_live_</code>. 
//                   Keep your keys secure and never share them publicly.
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* API Keys Table */}
//           <div className="bg-white rounded-lg shadow overflow-hidden">
//             <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//               <h2 className="text-lg font-semibold">Your Election API Keys</h2>
//               <button
//                 onClick={() => refetch()}
//                 className="p-2 text-gray-500 hover:bg-gray-100 rounded"
//                 title="Refresh"
//               >
//                 <RefreshCw className="w-4 h-4" />
//               </button>
//             </div>

//             {loading ? (
//               <div className="p-8 text-center">
//                 <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
//                 <p className="text-gray-500 mt-2">Loading API keys...</p>
//               </div>
//             ) : apiKeys.length === 0 ? (
//               <div className="p-8 text-center">
//                 <Key className="w-12 h-12 text-gray-300 mx-auto" />
//                 <p className="text-gray-500 mt-2">No election API keys created yet</p>
//                 <button
//                   onClick={() => setShowCreateModal(true)}
//                   className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
//                 >
//                   Create your first election API key
//                 </button>
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Used</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {apiKeys.map((key) => (
//                       <tr key={key.id} className="hover:bg-gray-50">
//                         <td className="px-6 py-4">
//                           <div>
//                             <p className="font-medium text-gray-900">{key.name}</p>
//                             {key.description && (
//                               <p className="text-sm text-gray-500">{key.description}</p>
//                             )}
//                             <p className="text-xs text-gray-400">By: {key.created_by}</p>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">
//                             {key.key_prefix}
//                           </code>
//                         </td>
//                         <td className="px-6 py-4">
//                           <span className={`flex items-center gap-1 ${
//                             key.is_active ? 'text-green-600' : 'text-red-600'
//                           }`}>
//                             {key.is_active ? (
//                               <><CheckCircle className="w-4 h-4" /> Active</>
//                             ) : (
//                               <><X className="w-4 h-4" /> Disabled</>
//                             )}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 text-sm text-gray-500">
//                           {formatDate(key.last_used_at)}
//                         </td>
//                         <td className="px-6 py-4 text-sm text-gray-500">
//                           {formatDate(key.created_at)}
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="flex items-center gap-2">
//                             <button
//                               onClick={() => handleViewUsage(key)}
//                               className="p-2 text-blue-600 hover:bg-blue-50 rounded"
//                               title="View Usage"
//                             >
//                               <BarChart3 className="w-4 h-4" />
//                             </button>
//                             <button
//                               onClick={() => handleToggleStatus(key.id, key.is_active)}
//                               className={`p-2 rounded ${
//                                 key.is_active 
//                                   ? 'text-yellow-600 hover:bg-yellow-50' 
//                                   : 'text-green-600 hover:bg-green-50'
//                               }`}
//                               title={key.is_active ? 'Disable' : 'Enable'}
//                             >
//                               {key.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                             </button>
//                             <button
//                               onClick={() => handleDeleteKey(key.id, key.name)}
//                               className="p-2 text-red-600 hover:bg-red-50 rounded"
//                               title="Revoke"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </>
//       )}

//       {/* ═══════════════════════════════════════════════════════════════════════════ */}
//       {/* ANALYTICS API KEYS TAB - NEW */}
//       {/* ═══════════════════════════════════════════════════════════════════════════ */}
//       {activeTab === 'analytics' && (
//         <>
//           {/* Info Card */}
//           <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
//             <div className="flex gap-3">
//               <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
//               <div>
//                 <h3 className="font-medium text-purple-900">Analytics API Key Security</h3>
//                 <p className="text-sm text-purple-700 mt-1">
//                   These keys provide access to platform analytics and reports.
//                   Keys start with <code className="bg-purple-100 px-1 rounded">vta_live_</code>. 
//                   Keep your keys secure and never share them publicly.
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* API Keys Table */}
//           <div className="bg-white rounded-lg shadow overflow-hidden">
//             <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//               <h2 className="text-lg font-semibold">Your Analytics API Keys</h2>
//               <button
//                 onClick={fetchAnalyticsKeys}
//                 className="p-2 text-gray-500 hover:bg-gray-100 rounded"
//                 title="Refresh"
//               >
//                 <RefreshCw className="w-4 h-4" />
//               </button>
//             </div>

//             {analyticsLoading ? (
//               <div className="p-8 text-center">
//                 <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
//                 <p className="text-gray-500 mt-2">Loading API keys...</p>
//               </div>
//             ) : analyticsKeys.length === 0 ? (
//               <div className="p-8 text-center">
//                 <PieChart className="w-12 h-12 text-gray-300 mx-auto" />
//                 <p className="text-gray-500 mt-2">No analytics API keys created yet</p>
//                 <button
//                   onClick={() => setShowAnalyticsCreateModal(true)}
//                   className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
//                 >
//                   Create your first analytics API key
//                 </button>
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Used</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {analyticsKeys.map((key) => (
//                       <tr key={key.id} className="hover:bg-gray-50">
//                         <td className="px-6 py-4">
//                           <div>
//                             <p className="font-medium text-gray-900">{key.name}</p>
//                             {key.description && (
//                               <p className="text-sm text-gray-500">{key.description}</p>
//                             )}
//                             <p className="text-xs text-gray-400">By: {key.created_by}</p>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <code className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-mono">
//                             {key.key_preview}
//                           </code>
//                         </td>
//                         <td className="px-6 py-4">
//                           <span className={`flex items-center gap-1 ${
//                             key.is_active ? 'text-green-600' : 'text-red-600'
//                           }`}>
//                             {key.is_active ? (
//                               <><CheckCircle className="w-4 h-4" /> Active</>
//                             ) : (
//                               <><X className="w-4 h-4" /> Disabled</>
//                             )}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 text-sm text-gray-500">
//                           {formatDate(key.last_used_at)}
//                         </td>
//                         <td className="px-6 py-4 text-sm text-gray-500">
//                           {formatDate(key.created_at)}
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="flex items-center gap-2">
//                             <button
//                               onClick={() => handleViewAnalyticsUsage(key)}
//                               className="p-2 text-purple-600 hover:bg-purple-50 rounded"
//                               title="View Usage"
//                             >
//                               <BarChart3 className="w-4 h-4" />
//                             </button>
//                             <button
//                               onClick={() => handleToggleAnalyticsStatus(key.id, key.is_active)}
//                               className={`p-2 rounded ${
//                                 key.is_active 
//                                   ? 'text-yellow-600 hover:bg-yellow-50' 
//                                   : 'text-green-600 hover:bg-green-50'
//                               }`}
//                               title={key.is_active ? 'Disable' : 'Enable'}
//                             >
//                               {key.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                             </button>
//                             <button
//                               onClick={() => handleDeleteAnalyticsKey(key.id, key.name)}
//                               className="p-2 text-red-600 hover:bg-red-50 rounded"
//                               title="Revoke"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </>
//       )}

//       {/* ═══════════════════════════════════════════════════════════════════════════ */}
//       {/* ELECTION CREATE MODAL - UNCHANGED */}
//       {/* ═══════════════════════════════════════════════════════════════════════════ */}
//       {showCreateModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
//             <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//               <h3 className="text-lg font-semibold flex items-center gap-2">
//                 <Database className="w-5 h-5 text-blue-600" />
//                 Create Election API Key
//               </h3>
//               <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition">
//                 <X className="w-5 h-5 text-gray-500" />
//               </button>
//             </div>
            
//             {newKeyData ? (
//               <div className="p-6 space-y-4">
//                 <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                   <div className="flex gap-2 items-start">
//                     <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
//                     <div>
//                       <p className="font-medium text-green-900">API Key Created!</p>
//                       <p className="text-sm text-green-700 mt-1">Copy your API key now. You won't be able to see it again.</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Your API Key</label>
//                   <div className="flex gap-2">
//                     <input type="text" value={newKeyData.api_key} readOnly className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 font-mono text-sm" />
//                     <button
//                       onClick={() => copyToClipboard(newKeyData.api_key)}
//                       className={`px-3 py-2 rounded-lg transition ${copiedKey ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
//                     >
//                       {copiedKey ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
//                     </button>
//                   </div>
//                 </div>

//                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
//                   <div className="flex gap-2">
//                     <AlertTriangle className="w-5 h-5 text-yellow-600" />
//                     <p className="text-sm text-yellow-800">Store this key securely. It will not be shown again.</p>
//                   </div>
//                 </div>

//                 <button onClick={closeModal} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
//                   Done
//                 </button>
//               </div>
//             ) : (
//               <form onSubmit={handleCreateKey} className="p-6 space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Key Name *</label>
//                   <input
//                     type="text"
//                     value={formData.name}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     placeholder="e.g., Mobile App Integration, Partner API Access"
//                     className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     required
//                   />
//                   <p className="text-xs text-gray-500 mt-1">A friendly name to identify this key</p>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
//                   <textarea
//                     value={formData.description}
//                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                     placeholder="e.g., Used by XYZ company for their voting widget"
//                     rows={2}
//                     className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date (Optional)</label>
//                   <input
//                     type="datetime-local"
//                     value={formData.expires_at}
//                     onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
//                     className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                   <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
//                 </div>

//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
//                   <p className="text-xs text-blue-800">
//                     <strong>Note:</strong> A secure API key (format: vt_live_xxx...) will be automatically generated.
//                   </p>
//                 </div>

//                 <div className="bg-gray-900 rounded-lg p-3">
//                   <p className="text-xs text-gray-400 mb-2">How to use your API key:</p>
//                   <code className="text-xs text-green-400 block font-mono">curl -H "X-API-Key: vt_live_xxx..." \</code>
//                   <code className="text-xs text-green-400 block font-mono ml-4">https://api.vottery.com/api/v1/elections</code>
//                 </div>

//                 <div className="flex gap-3 pt-2">
//                   <button type="button" onClick={closeModal} className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
//                   <button
//                     type="submit"
//                     disabled={creating || !formData.name.trim()}
//                     className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
//                   >
//                     <Key className="w-4 h-4" />
//                     {creating ? 'Generating...' : 'Generate API Key'}
//                   </button>
//                 </div>
//               </form>
//             )}
//           </div>
//         </div>
//       )}

//       {/* ═══════════════════════════════════════════════════════════════════════════ */}
//       {/* ANALYTICS CREATE MODAL - NEW */}
//       {/* ═══════════════════════════════════════════════════════════════════════════ */}
//       {showAnalyticsCreateModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
//             <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//               <h3 className="text-lg font-semibold flex items-center gap-2">
//                 <PieChart className="w-5 h-5 text-purple-600" />
//                 Create Analytics API Key
//               </h3>
//               <button onClick={closeAnalyticsModal} className="p-2 hover:bg-gray-100 rounded-full transition">
//                 <X className="w-5 h-5 text-gray-500" />
//               </button>
//             </div>
            
//             {newAnalyticsKeyData ? (
//               <div className="p-6 space-y-4">
//                 <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                   <div className="flex gap-2 items-start">
//                     <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
//                     <div>
//                       <p className="font-medium text-green-900">Analytics API Key Created!</p>
//                       <p className="text-sm text-green-700 mt-1">Copy your API key now. You won't be able to see it again.</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Your API Key</label>
//                   <div className="flex gap-2">
//                     <input type="text" value={newAnalyticsKeyData.api_key} readOnly className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 font-mono text-sm" />
//                     <button
//                       onClick={() => copyAnalyticsToClipboard(newAnalyticsKeyData.api_key)}
//                       className={`px-3 py-2 rounded-lg transition ${copiedAnalyticsKey ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
//                     >
//                       {copiedAnalyticsKey ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
//                     </button>
//                   </div>
//                 </div>

//                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
//                   <div className="flex gap-2">
//                     <AlertTriangle className="w-5 h-5 text-yellow-600" />
//                     <p className="text-sm text-yellow-800">Store this key securely. It will not be shown again.</p>
//                   </div>
//                 </div>

//                 <button onClick={closeAnalyticsModal} className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
//                   Done
//                 </button>
//               </div>
//             ) : (
//               <form onSubmit={handleCreateAnalyticsKey} className="p-6 space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Key Name *</label>
//                   <input
//                     type="text"
//                     value={analyticsFormData.name}
//                     onChange={(e) => setAnalyticsFormData({ ...analyticsFormData, name: e.target.value })}
//                     placeholder="e.g., External Dashboard, Partner Analytics"
//                     className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
//                     required
//                   />
//                   <p className="text-xs text-gray-500 mt-1">A friendly name to identify this key</p>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
//                   <textarea
//                     value={analyticsFormData.description}
//                     onChange={(e) => setAnalyticsFormData({ ...analyticsFormData, description: e.target.value })}
//                     placeholder="e.g., Used for external reporting dashboard"
//                     rows={2}
//                     className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date (Optional)</label>
//                   <input
//                     type="datetime-local"
//                     value={analyticsFormData.expires_at}
//                     onChange={(e) => setAnalyticsFormData({ ...analyticsFormData, expires_at: e.target.value })}
//                     className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
//                   />
//                   <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
//                 </div>

//                 <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
//                   <p className="text-xs text-purple-800">
//                     <strong>Note:</strong> A secure API key (format: vta_live_xxx...) will be automatically generated.
//                   </p>
//                 </div>

//                 <div className="bg-gray-900 rounded-lg p-3">
//                   <p className="text-xs text-gray-400 mb-2">How to use your analytics API key:</p>
//                   <code className="text-xs text-green-400 block font-mono">curl -H "X-API-Key: vta_live_xxx..." \</code>
//                   <code className="text-xs text-green-400 block font-mono ml-4">https://api.vottery.com/api/analytics/platform/report</code>
//                 </div>

//                 <div className="flex gap-3 pt-2">
//                   <button type="button" onClick={closeAnalyticsModal} className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
//                   <button
//                     type="submit"
//                     disabled={analyticsCreating || !analyticsFormData.name.trim()}
//                     className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
//                   >
//                     <Key className="w-4 h-4" />
//                     {analyticsCreating ? 'Generating...' : 'Generate API Key'}
//                   </button>
//                 </div>
//               </form>
//             )}
//           </div>
//         </div>
//       )}

//       {/* ═══════════════════════════════════════════════════════════════════════════ */}
//       {/* ELECTION USAGE MODAL - UNCHANGED */}
//       {/* ═══════════════════════════════════════════════════════════════════════════ */}
//       {showUsageModal && selectedKey && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
//             <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//               <div>
//                 <h3 className="text-lg font-semibold">Election API Key Usage</h3>
//                 <p className="text-sm text-gray-500">{selectedKey.name}</p>
//               </div>
//               <button onClick={() => setShowUsageModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
//                 <X className="w-5 h-5 text-gray-500" />
//               </button>
//             </div>
            
//             <div className="p-6 overflow-y-auto max-h-[60vh]">
//               {usageData.length === 0 ? (
//                 <div className="text-center py-8">
//                   <BarChart3 className="w-12 h-12 text-gray-300 mx-auto" />
//                   <p className="text-gray-500 mt-2">No usage data available</p>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   <div className="grid grid-cols-3 gap-4">
//                     <div className="bg-blue-50 rounded-lg p-4">
//                       <p className="text-sm text-blue-600">Total Requests</p>
//                       <p className="text-2xl font-bold text-blue-900">{usageData.reduce((sum, d) => sum + parseInt(d.total_requests || 0), 0)}</p>
//                     </div>
//                     <div className="bg-green-50 rounded-lg p-4">
//                       <p className="text-sm text-green-600">Successful</p>
//                       <p className="text-2xl font-bold text-green-900">{usageData.reduce((sum, d) => sum + parseInt(d.successful || 0), 0)}</p>
//                     </div>
//                     <div className="bg-red-50 rounded-lg p-4">
//                       <p className="text-sm text-red-600">Errors</p>
//                       <p className="text-2xl font-bold text-red-900">{usageData.reduce((sum, d) => sum + parseInt(d.errors || 0), 0)}</p>
//                     </div>
//                   </div>

//                   <div>
//                     <h4 className="font-medium mb-2">Daily Breakdown (Last 30 Days)</h4>
//                     <div className="border rounded-lg overflow-hidden">
//                       <table className="w-full text-sm">
//                         <thead className="bg-gray-50">
//                           <tr>
//                             <th className="px-4 py-2 text-left">Date</th>
//                             <th className="px-4 py-2 text-right">Requests</th>
//                             <th className="px-4 py-2 text-right">Success</th>
//                             <th className="px-4 py-2 text-right">Errors</th>
//                             <th className="px-4 py-2 text-right">Avg Response</th>
//                           </tr>
//                         </thead>
//                         <tbody className="divide-y">
//                           {usageData.map((day, index) => (
//                             <tr key={index} className="hover:bg-gray-50">
//                               <td className="px-4 py-2">{day.date}</td>
//                               <td className="px-4 py-2 text-right">{day.total_requests}</td>
//                               <td className="px-4 py-2 text-right text-green-600">{day.successful}</td>
//                               <td className="px-4 py-2 text-right text-red-600">{day.errors}</td>
//                               <td className="px-4 py-2 text-right">{day.avg_response_time || 0}ms</td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ═══════════════════════════════════════════════════════════════════════════ */}
//       {/* ANALYTICS USAGE MODAL - NEW */}
//       {/* ═══════════════════════════════════════════════════════════════════════════ */}
//       {showAnalyticsUsageModal && selectedAnalyticsKey && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
//             <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//               <div>
//                 <h3 className="text-lg font-semibold">Analytics API Key Usage</h3>
//                 <p className="text-sm text-gray-500">{selectedAnalyticsKey.name}</p>
//               </div>
//               <button onClick={() => setShowAnalyticsUsageModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
//                 <X className="w-5 h-5 text-gray-500" />
//               </button>
//             </div>
            
//             <div className="p-6 overflow-y-auto max-h-[60vh]">
//               {analyticsUsageData.length === 0 ? (
//                 <div className="text-center py-8">
//                   <BarChart3 className="w-12 h-12 text-gray-300 mx-auto" />
//                   <p className="text-gray-500 mt-2">No usage data available</p>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   <div className="grid grid-cols-3 gap-4">
//                     <div className="bg-purple-50 rounded-lg p-4">
//                       <p className="text-sm text-purple-600">Total Requests</p>
//                       <p className="text-2xl font-bold text-purple-900">{analyticsUsageData.reduce((sum, d) => sum + parseInt(d.total_requests || 0), 0)}</p>
//                     </div>
//                     <div className="bg-green-50 rounded-lg p-4">
//                       <p className="text-sm text-green-600">Successful</p>
//                       <p className="text-2xl font-bold text-green-900">{analyticsUsageData.reduce((sum, d) => sum + parseInt(d.successful || 0), 0)}</p>
//                     </div>
//                     <div className="bg-red-50 rounded-lg p-4">
//                       <p className="text-sm text-red-600">Errors</p>
//                       <p className="text-2xl font-bold text-red-900">{analyticsUsageData.reduce((sum, d) => sum + parseInt(d.errors || 0), 0)}</p>
//                     </div>
//                   </div>

//                   <div>
//                     <h4 className="font-medium mb-2">Daily Breakdown (Last 30 Days)</h4>
//                     <div className="border rounded-lg overflow-hidden">
//                       <table className="w-full text-sm">
//                         <thead className="bg-gray-50">
//                           <tr>
//                             <th className="px-4 py-2 text-left">Date</th>
//                             <th className="px-4 py-2 text-right">Requests</th>
//                             <th className="px-4 py-2 text-right">Success</th>
//                             <th className="px-4 py-2 text-right">Errors</th>
//                             <th className="px-4 py-2 text-right">Avg Response</th>
//                           </tr>
//                         </thead>
//                         <tbody className="divide-y">
//                           {analyticsUsageData.map((day, index) => (
//                             <tr key={index} className="hover:bg-gray-50">
//                               <td className="px-4 py-2">{day.date}</td>
//                               <td className="px-4 py-2 text-right">{day.total_requests}</td>
//                               <td className="px-4 py-2 text-right text-green-600">{day.successful}</td>
//                               <td className="px-4 py-2 text-right text-red-600">{day.errors}</td>
//                               <td className="px-4 py-2 text-right">{day.avg_response_time || 0}ms</td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
//last workable codes to add analytics api keys above code
// // src/pages/admin/ApiKeysManagement.jsx
// import React, { useState } from 'react';
// import { useTranslation } from 'react-i18next';
// import { 
//   Key, Plus, Copy, Eye, EyeOff, Trash2, 
//   Check, X, RefreshCw, BarChart3, Shield,
//   AlertTriangle, CheckCircle
// } from 'lucide-react';
// import { toast } from 'react-toastify';

// // RTK Query hooks
// import {
//   useGetApiKeysQuery,
//   useCreateApiKeyMutation,
//   useToggleApiKeyStatusMutation,
//   useRevokeApiKeyMutation,
//   useLazyGetApiKeyUsageQuery,
// } from '../../redux/api/election/apiKeyApi';

// export default function ApiKeysManagement() {
//   /*eslint-disable*/
//   const { t } = useTranslation();
  
//   // RTK Query hooks
//   const { data: apiKeys = [], isLoading: loading, refetch } = useGetApiKeysQuery();
//   const [createApiKey, { isLoading: creating }] = useCreateApiKeyMutation();
//   const [toggleApiKeyStatus] = useToggleApiKeyStatusMutation();
//   const [revokeApiKey] = useRevokeApiKeyMutation();
//   const [getApiKeyUsage] = useLazyGetApiKeyUsageQuery();

//   // Local state
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showUsageModal, setShowUsageModal] = useState(false);
//   const [selectedKey, setSelectedKey] = useState(null);
//   const [usageData, setUsageData] = useState([]);
//   const [newKeyData, setNewKeyData] = useState(null);
//   const [copiedKey, setCopiedKey] = useState(false);

//   // Form state
//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     expires_at: ''
//   });

//   // Close modal
//   const closeModal = () => {
//     setShowCreateModal(false);
//     setNewKeyData(null);
//     setFormData({ name: '', description: '', expires_at: '' });
//   };

//   // Create API key
//   const handleCreateKey = async (e) => {
//     e.preventDefault();
    
//     if (!formData.name.trim()) {
//       toast.error('Please enter a key name');
//       return;
//     }

//     try {
//       const result = await createApiKey({
//         name: formData.name.trim(),
//         description: formData.description.trim() || null,
//         environment: 'live',
//         expires_at: formData.expires_at || null
//       }).unwrap();
      
//       setNewKeyData(result);
//       toast.success('API key created successfully!');
//     } catch (error) {
//       console.error('Create API Key Error:', error);
//       toast.error(error.data?.message || 'Failed to create API key');
//     }
//   };

//   // Toggle API key status
//   const handleToggleStatus = async (id, currentStatus) => {
//     try {
//       await toggleApiKeyStatus({ id, is_active: !currentStatus }).unwrap();
//       toast.success(`API key ${currentStatus ? 'disabled' : 'enabled'}`);
//     } catch (error) {
//       console.error('Toggle Status Error:', error);
//       toast.error('Failed to update API key');
//     }
//   };

//   // Delete API key
//   const handleDeleteKey = async (id, name) => {
//     if (!confirm(`Are you sure you want to revoke "${name}"? This action cannot be undone.`)) {
//       return;
//     }

//     try {
//       await revokeApiKey(id).unwrap();
//       toast.success('API key revoked');
//     } catch (error) {
//       console.error('Delete API Key Error:', error);
//       toast.error('Failed to revoke API key');
//     }
//   };

//   // View usage stats
//   const handleViewUsage = async (key) => {
//     try {
//       setSelectedKey(key);
//       const result = await getApiKeyUsage({ id: key.id, days: 30 }).unwrap();
//       setUsageData(result || []);
//       setShowUsageModal(true);
//     } catch (error) {
//       console.error('Fetch Usage Error:', error);
//       toast.error('Failed to load usage data');
//     }
//   };

//   // Copy to clipboard
//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text);
//     setCopiedKey(true);
//     toast.success('Copied to clipboard!');
//     setTimeout(() => setCopiedKey(false), 2000);
//   };

//   // Format date
//   const formatDate = (date) => {
//     if (!date) return 'Never';
//     return new Date(date).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
//             <Key className="w-7 h-7 text-purple-600" />
//             API Keys Management
//           </h1>
//           <p className="text-gray-600 mt-1">
//             Create and manage API keys for external integrations
//           </p>
//         </div>
//         <button
//           onClick={() => setShowCreateModal(true)}
//           className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
//         >
//           <Plus className="w-5 h-5" />
//           Create API Key
//         </button>
//       </div>

//       {/* Info Card */}
//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//         <div className="flex gap-3">
//           <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
//           <div>
//             <h3 className="font-medium text-blue-900">API Key Security</h3>
//             <p className="text-sm text-blue-700 mt-1">
//               API keys provide access to election data for external applications. 
//               Keep your keys secure and never share them publicly. 
//               Keys are shown only once when created.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* API Keys Table */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//           <h2 className="text-lg font-semibold">Your API Keys</h2>
//           <button
//             onClick={() => refetch()}
//             className="p-2 text-gray-500 hover:bg-gray-100 rounded"
//             title="Refresh"
//           >
//             <RefreshCw className="w-4 h-4" />
//           </button>
//         </div>

//         {loading ? (
//           <div className="p-8 text-center">
//             <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
//             <p className="text-gray-500 mt-2">Loading API keys...</p>
//           </div>
//         ) : apiKeys.length === 0 ? (
//           <div className="p-8 text-center">
//             <Key className="w-12 h-12 text-gray-300 mx-auto" />
//             <p className="text-gray-500 mt-2">No API keys created yet</p>
//             <button
//               onClick={() => setShowCreateModal(true)}
//               className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
//             >
//               Create your first API key
//             </button>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Used</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {apiKeys.map((key) => (
//                   <tr key={key.id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4">
//                       <div>
//                         <p className="font-medium text-gray-900">{key.name}</p>
//                         {key.description && (
//                           <p className="text-sm text-gray-500">{key.description}</p>
//                         )}
//                         <p className="text-xs text-gray-400">By: {key.created_by}</p>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
//                         {key.key_prefix}
//                       </code>
//                     </td>
//                     <td className="px-6 py-4">
//                       <span className={`flex items-center gap-1 ${
//                         key.is_active ? 'text-green-600' : 'text-red-600'
//                       }`}>
//                         {key.is_active ? (
//                           <><CheckCircle className="w-4 h-4" /> Active</>
//                         ) : (
//                           <><X className="w-4 h-4" /> Disabled</>
//                         )}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-500">
//                       {formatDate(key.last_used_at)}
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-500">
//                       {formatDate(key.created_at)}
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-2">
//                         <button
//                           onClick={() => handleViewUsage(key)}
//                           className="p-2 text-blue-600 hover:bg-blue-50 rounded"
//                           title="View Usage"
//                         >
//                           <BarChart3 className="w-4 h-4" />
//                         </button>
//                         <button
//                           onClick={() => handleToggleStatus(key.id, key.is_active)}
//                           className={`p-2 rounded ${
//                             key.is_active 
//                               ? 'text-yellow-600 hover:bg-yellow-50' 
//                               : 'text-green-600 hover:bg-green-50'
//                           }`}
//                           title={key.is_active ? 'Disable' : 'Enable'}
//                         >
//                           {key.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                         </button>
//                         <button
//                           onClick={() => handleDeleteKey(key.id, key.name)}
//                           className="p-2 text-red-600 hover:bg-red-50 rounded"
//                           title="Revoke"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Create Modal */}
//       {showCreateModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
//             {/* Modal Header with Close Button */}
//             <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//               <h3 className="text-lg font-semibold">Create New API Key</h3>
//               <button
//                 onClick={closeModal}
//                 className="p-2 hover:bg-gray-100 rounded-full transition"
//               >
//                 <X className="w-5 h-5 text-gray-500" />
//               </button>
//             </div>
            
//             {newKeyData ? (
//               // Show new key after creation
//               <div className="p-6 space-y-4">
//                 <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                   <div className="flex gap-2 items-start">
//                     <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
//                     <div>
//                       <p className="font-medium text-green-900">API Key Created!</p>
//                       <p className="text-sm text-green-700 mt-1">
//                         Copy your API key now. You won't be able to see it again.
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Your API Key
//                   </label>
//                   <div className="flex gap-2">
//                     <input
//                       type="text"
//                       value={newKeyData.api_key}
//                       readOnly
//                       className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 font-mono text-sm"
//                     />
//                     <button
//                       onClick={() => copyToClipboard(newKeyData.api_key)}
//                       className={`px-3 py-2 rounded-lg transition ${
//                         copiedKey 
//                           ? 'bg-green-600 text-white' 
//                           : 'bg-gray-200 hover:bg-gray-300'
//                       }`}
//                     >
//                       {copiedKey ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
//                     </button>
//                   </div>
//                 </div>

//                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
//                   <div className="flex gap-2">
//                     <AlertTriangle className="w-5 h-5 text-yellow-600" />
//                     <p className="text-sm text-yellow-800">
//                       Store this key securely. It will not be shown again.
//                     </p>
//                   </div>
//                 </div>

//                 <button
//                   onClick={closeModal}
//                   className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
//                 >
//                   Done
//                 </button>
//               </div>
//             ) : (
//               // Create form
//               <form onSubmit={handleCreateKey} className="p-6 space-y-4">
//                 {/* Key Name Input - Normal name */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Key Name *
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.name}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     placeholder="e.g., Mobile App Integration, Partner API Access"
//                     className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
//                     required
//                   />
//                   <p className="text-xs text-gray-500 mt-1">A friendly name to identify this key (e.g., "Mobile App", "Widget Integration")</p>
//                 </div>

//                 {/* Description */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Description (Optional)
//                   </label>
//                   <textarea
//                     value={formData.description}
//                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                     placeholder="e.g., Used by XYZ company for their voting widget"
//                     rows={2}
//                     className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
//                   />
//                 </div>

//                 {/* Expiration */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Expiration Date (Optional)
//                   </label>
//                   <input
//                     type="datetime-local"
//                     value={formData.expires_at}
//                     onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
//                     className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
//                   />
//                   <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
//                 </div>

//                 {/* Info box */}
//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
//                   <p className="text-xs text-blue-800">
//                     <strong>Note:</strong> A secure API key (format: vt_live_xxx...) will be automatically generated for you.
//                   </p>
//                 </div>

//                 {/* Usage Example */}
//                 <div className="bg-gray-900 rounded-lg p-3">
//                   <p className="text-xs text-gray-400 mb-2">How to use your API key:</p>
//                   <code className="text-xs text-green-400 block font-mono">
//                     curl -H "X-API-Key: vt_live_xxx..." \
//                   </code>
//                   <code className="text-xs text-green-400 block font-mono ml-4">
//                     https://api.vottery.com/api/v1/elections
//                   </code>
//                 </div>

//                 {/* Buttons */}
//                 <div className="flex gap-3 pt-2">
//                   <button
//                     type="button"
//                     onClick={closeModal}
//                     className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={creating || !formData.name.trim()}
//                     className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
//                   >
//                     <Key className="w-4 h-4" />
//                     {creating ? 'Generating...' : 'Generate API Key'}
//                   </button>
//                 </div>
//               </form>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Usage Modal */}
//       {showUsageModal && selectedKey && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
//             <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//               <div>
//                 <h3 className="text-lg font-semibold">API Key Usage</h3>
//                 <p className="text-sm text-gray-500">{selectedKey.name}</p>
//               </div>
//               <button
//                 onClick={() => setShowUsageModal(false)}
//                 className="p-2 hover:bg-gray-100 rounded-full transition"
//               >
//                 <X className="w-5 h-5 text-gray-500" />
//               </button>
//             </div>
            
//             <div className="p-6 overflow-y-auto max-h-[60vh]">
//               {usageData.length === 0 ? (
//                 <div className="text-center py-8">
//                   <BarChart3 className="w-12 h-12 text-gray-300 mx-auto" />
//                   <p className="text-gray-500 mt-2">No usage data available</p>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {/* Summary */}
//                   <div className="grid grid-cols-3 gap-4">
//                     <div className="bg-blue-50 rounded-lg p-4">
//                       <p className="text-sm text-blue-600">Total Requests</p>
//                       <p className="text-2xl font-bold text-blue-900">
//                         {usageData.reduce((sum, d) => sum + parseInt(d.total_requests || 0), 0)}
//                       </p>
//                     </div>
//                     <div className="bg-green-50 rounded-lg p-4">
//                       <p className="text-sm text-green-600">Successful</p>
//                       <p className="text-2xl font-bold text-green-900">
//                         {usageData.reduce((sum, d) => sum + parseInt(d.successful || 0), 0)}
//                       </p>
//                     </div>
//                     <div className="bg-red-50 rounded-lg p-4">
//                       <p className="text-sm text-red-600">Errors</p>
//                       <p className="text-2xl font-bold text-red-900">
//                         {usageData.reduce((sum, d) => sum + parseInt(d.errors || 0), 0)}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Daily breakdown */}
//                   <div>
//                     <h4 className="font-medium mb-2">Daily Breakdown (Last 30 Days)</h4>
//                     <div className="border rounded-lg overflow-hidden">
//                       <table className="w-full text-sm">
//                         <thead className="bg-gray-50">
//                           <tr>
//                             <th className="px-4 py-2 text-left">Date</th>
//                             <th className="px-4 py-2 text-right">Requests</th>
//                             <th className="px-4 py-2 text-right">Success</th>
//                             <th className="px-4 py-2 text-right">Errors</th>
//                             <th className="px-4 py-2 text-right">Avg Response</th>
//                           </tr>
//                         </thead>
//                         <tbody className="divide-y">
//                           {usageData.map((day, index) => (
//                             <tr key={index} className="hover:bg-gray-50">
//                               <td className="px-4 py-2">{day.date}</td>
//                               <td className="px-4 py-2 text-right">{day.total_requests}</td>
//                               <td className="px-4 py-2 text-right text-green-600">{day.successful}</td>
//                               <td className="px-4 py-2 text-right text-red-600">{day.errors}</td>
//                               <td className="px-4 py-2 text-right">{day.avg_response_time || 0}ms</td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }