// src/pages/admin/ApiKeysManagement.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Key, Plus, Copy, Eye, EyeOff, Trash2, 
  Check, X, RefreshCw, BarChart3, Shield,
  AlertTriangle, CheckCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

// RTK Query hooks
import {
  useGetApiKeysQuery,
  useCreateApiKeyMutation,
  useToggleApiKeyStatusMutation,
  useRevokeApiKeyMutation,
  useLazyGetApiKeyUsageQuery,
} from '../../redux/api/election/apiKeyApi';

export default function ApiKeysManagement() {
  /*eslint-disable*/
  const { t } = useTranslation();
  
  // RTK Query hooks
  const { data: apiKeys = [], isLoading: loading, refetch } = useGetApiKeysQuery();
  const [createApiKey, { isLoading: creating }] = useCreateApiKeyMutation();
  const [toggleApiKeyStatus] = useToggleApiKeyStatusMutation();
  const [revokeApiKey] = useRevokeApiKeyMutation();
  const [getApiKeyUsage] = useLazyGetApiKeyUsageQuery();

  // Local state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [usageData, setUsageData] = useState([]);
  const [newKeyData, setNewKeyData] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    expires_at: ''
  });

  // Close modal
  const closeModal = () => {
    setShowCreateModal(false);
    setNewKeyData(null);
    setFormData({ name: '', description: '', expires_at: '' });
  };

  // Create API key
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

  // Toggle API key status
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await toggleApiKeyStatus({ id, is_active: !currentStatus }).unwrap();
      toast.success(`API key ${currentStatus ? 'disabled' : 'enabled'}`);
    } catch (error) {
      console.error('Toggle Status Error:', error);
      toast.error('Failed to update API key');
    }
  };

  // Delete API key
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

  // View usage stats
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
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <Plus className="w-5 h-5" />
          Create API Key
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">API Key Security</h3>
            <p className="text-sm text-blue-700 mt-1">
              API keys provide access to election data for external applications. 
              Keep your keys secure and never share them publicly. 
              Keys are shown only once when created.
            </p>
          </div>
        </div>
      </div>

      {/* API Keys Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Your API Keys</h2>
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
            <p className="text-gray-500 mt-2">No API keys created yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
            >
              Create your first API key
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
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            {/* Modal Header with Close Button */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Create New API Key</h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {newKeyData ? (
              // Show new key after creation
              <div className="p-6 space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex gap-2 items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">API Key Created!</p>
                      <p className="text-sm text-green-700 mt-1">
                        Copy your API key now. You won't be able to see it again.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your API Key
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newKeyData.api_key}
                      readOnly
                      className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 font-mono text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(newKeyData.api_key)}
                      className={`px-3 py-2 rounded-lg transition ${
                        copiedKey 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {copiedKey ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      Store this key securely. It will not be shown again.
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeModal}
                  className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Done
                </button>
              </div>
            ) : (
              // Create form
              <form onSubmit={handleCreateKey} className="p-6 space-y-4">
                {/* Key Name Input - Normal name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Mobile App Integration, Partner API Access"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">A friendly name to identify this key (e.g., "Mobile App", "Widget Integration")</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Used by XYZ company for their voting widget"
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                {/* Expiration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
                </div>

                {/* Info box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> A secure API key (format: vt_live_xxx...) will be automatically generated for you.
                  </p>
                </div>

                {/* Usage Example */}
                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-2">How to use your API key:</p>
                  <code className="text-xs text-green-400 block font-mono">
                    curl -H "X-API-Key: vt_live_xxx..." \
                  </code>
                  <code className="text-xs text-green-400 block font-mono ml-4">
                    https://api.vottery.com/api/v1/elections
                  </code>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !formData.name.trim()}
                    className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
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

      {/* Usage Modal */}
      {showUsageModal && selectedKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">API Key Usage</h3>
                <p className="text-sm text-gray-500">{selectedKey.name}</p>
              </div>
              <button
                onClick={() => setShowUsageModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
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
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-600">Total Requests</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {usageData.reduce((sum, d) => sum + parseInt(d.total_requests || 0), 0)}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-600">Successful</p>
                      <p className="text-2xl font-bold text-green-900">
                        {usageData.reduce((sum, d) => sum + parseInt(d.successful || 0), 0)}
                      </p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-sm text-red-600">Errors</p>
                      <p className="text-2xl font-bold text-red-900">
                        {usageData.reduce((sum, d) => sum + parseInt(d.errors || 0), 0)}
                      </p>
                    </div>
                  </div>

                  {/* Daily breakdown */}
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
    </div>
  );
}