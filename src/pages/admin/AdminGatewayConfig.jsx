import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../redux/hooks';
import {
  useGetAllGatewayConfigsQuery,
  useSetGatewayConfigMutation,
  useUpdateProcessingFeeMutation,
  useGetProcessingFeeQuery,
} from '../../redux/api/subscription/subscriptionApi';
import { Loader, ChevronLeft, Save } from 'lucide-react';

const REGIONS = {
  region_1: 'US & Canada',
  region_2: 'Western Europe',
  region_3: 'Eastern Europe & Russia',
  region_4: 'Africa',
  region_5: 'Latin America & Caribbeans',
  region_6: 'Middle East, Asia, Eurasia',
  region_7: 'Australasia',
  region_8: 'China, Macau, Hong Kong',
};

const AdminGatewayConfig = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [editingRegion, setEditingRegion] = useState(null);
  const [processingFee, setProcessingFee] = useState('');

  const { data: configData, isLoading, refetch } = useGetAllGatewayConfigsQuery();
  const { data: feeData, isLoading: feeLoading } = useGetProcessingFeeQuery();
  const [setGatewayConfig, configState] = useSetGatewayConfigMutation();
  const [updateFee, feeState] = useUpdateProcessingFeeMutation();

  // Check authorization
  if (auth.user?.role !== 'manager') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h1>
          <p className="text-red-800 mb-6">Only managers can access this page.</p>
          <button
            onClick={() => navigate('/admin/subscription')}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleSaveConfig = async (region, config) => {
    try {
      await setGatewayConfig({
        region,
        ...config,
        }).unwrap();
      setEditingRegion(null);
      refetch();
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  const handleSaveFee = async (e) => {
    e.preventDefault();
    try {
      await updateFee(parseFloat(processingFee)).unwrap();
      setProcessingFee('');
    } catch (error) {
      console.error('Error saving fee:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/admin/subscription')}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gateway Configuration</h1>
            <p className="text-gray-600 mt-1">Configure Stripe & Paddle by region</p>
          </div>
        </div>

        {/* Processing Fee */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Global Processing Fee</h2>
          
          <form onSubmit={handleSaveFee} className="max-w-md">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Processing Fee (%)
                </label>
                <input
                  type="number"
                  value={processingFee || feeData?.processingFee || 0}
                  onChange={(e) => setProcessingFee(e.target.value)}
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={feeState.isLoading}
                className="self-end flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                {feeState.isLoading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Fee
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Current fee: {feeLoading ? '-' : `${feeData?.processingFee || 0}%`}
            </p>
          </form>
        </div>

        {/* Regional Gateway Config */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Regional Gateway Configuration</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin text-blue-600" size={40} />
            </div>
          ) : configData?.configs ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Region</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Gateway Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Stripe</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Paddle</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Split %</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {configData.configs.map((config) => (
                    <tr key={config.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {REGIONS[config.region] || config.region}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                          {config.gateway_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {config.stripe_enabled ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                            ✓ Enabled
                          </span>
                        ) : (
                          <span className="text-gray-500">Disabled</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {config.paddle_enabled ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                            ✓ Enabled
                          </span>
                        ) : (
                          <span className="text-gray-500">Disabled</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {config.split_percentage}%
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {config.recommendation_reason}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => setEditingRegion(config.region)}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-600">No gateway configurations found</p>
            </div>
          )}
        </div>

        {/* Edit Form */}
        {editingRegion && (
          <RegionEditForm
            region={editingRegion}
            config={configData?.configs?.find((c) => c.region === editingRegion)}
            onSave={handleSaveConfig}
            onClose={() => setEditingRegion(null)}
            isSaving={configState.isLoading}
          />
        )}
      </div>
    </div>
  );
};

// Region Edit Form Component
const RegionEditForm = ({ region, config, onSave, onClose, isSaving }) => {
  const [formData, setFormData] = useState({
    gateway_type: config?.gateway_type || 'stripe_only',
    stripe_enabled: config?.stripe_enabled || false,
    paddle_enabled: config?.paddle_enabled || false,
    split_percentage: config?.split_percentage || 50,
    recommendation_reason: config?.recommendation_reason || '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(region, formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">
            Configure {REGIONS[region] || region}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Gateway Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Gateway Type
            </label>
            <select
              name="gateway_type"
              value={formData.gateway_type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="stripe_only">Stripe Only</option>
              <option value="paddle_only">Paddle Only</option>
              <option value="split_50_50">50-50 Split</option>
            </select>
          </div>

          {/* Stripe Toggle */}
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="stripe_enabled"
              checked={formData.stripe_enabled}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="font-semibold text-gray-700">Enable Stripe</span>
          </label>

          {/* Paddle Toggle */}
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="paddle_enabled"
              checked={formData.paddle_enabled}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="font-semibold text-gray-700">Enable Paddle</span>
          </label>

          {/* Split Percentage */}
          {formData.gateway_type === 'split_50_50' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Split Percentage (%)
              </label>
              <input
                type="number"
                name="split_percentage"
                value={formData.split_percentage}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Recommendation Reason */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Recommendation Reason
            </label>
            <textarea
              name="recommendation_reason"
              value={formData.recommendation_reason}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Why is this gateway recommended for this region?"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Configuration
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminGatewayConfig;