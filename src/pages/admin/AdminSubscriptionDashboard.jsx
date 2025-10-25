import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../redux/hooks';
import { useGetAllPlansQuery, useGetAllGatewayConfigsQuery, useGetProcessingFeeQuery } from '../../redux/api/subscription/subscriptionApi';
import { Loader, BarChart3, Settings, DollarSign, Globe } from 'lucide-react';

const AdminSubscriptionDashboard = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const { data: plansData, isLoading: plansLoading } = useGetAllPlansQuery();
  const { data: configData, isLoading: configLoading } = useGetAllGatewayConfigsQuery();
  const { data: feeData, isLoading: feeLoading } = useGetProcessingFeeQuery();

  // Check authorization
  if (auth.user?.role !== 'manager' && !auth.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h1>
          <p className="text-red-800 mb-6">
            You don't have permission to access the admin subscription dashboard.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const loading = plansLoading || configLoading || feeLoading;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Subscription Management</h1>
          <p className="text-gray-600">Manage plans, pricing, and payment gateways</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Plans */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Plans</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {plansLoading ? '-' : plansData?.plans?.length || 0}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <BarChart3 className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          {/* Active Regions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Regions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {configLoading ? '-' : configData?.configs?.length || 0}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <Globe className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          {/* Processing Fee */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Processing Fee</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {feeLoading ? '-' : `${feeData?.processingFee || 0}%`}
                </p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <DollarSign className="text-orange-600" size={24} />
              </div>
            </div>
          </div>

          {/* Gateway Config */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Stripe & Paddle</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">Active</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <Settings className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plans Management */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/admin/subscription/plans')}>
            <div className="h-2 bg-blue-600"></div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Plans</h3>
              <p className="text-gray-600 text-sm mb-4">Create, edit, and delete subscription plans</p>
              
              {loading ? (
                <Loader className="animate-spin text-blue-600" size={20} />
              ) : (
                <div className="space-y-2">
                  {plansData?.plans?.slice(0, 3).map((plan) => (
                    <div key={plan.id} className="text-sm text-gray-600 flex justify-between">
                      <span>{plan.name}</span>
                      <span className="font-semibold">${plan.price}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors">
                Manage Plans →
              </button>
            </div>
          </div>

          {/* Gateway Configuration */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/admin/subscription/gateway-config')}>
            <div className="h-2 bg-green-600"></div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Gateway Configuration</h3>
              <p className="text-gray-600 text-sm mb-4">Configure Stripe & Paddle by region</p>
              
              {loading ? (
                <Loader className="animate-spin text-green-600" size={20} />
              ) : (
                <div className="space-y-2">
                  {configData?.configs?.slice(0, 3).map((config) => (
                    <div key={config.id} className="text-sm text-gray-600 flex justify-between items-center">
                      <span>{config.region}</span>
                      <div className="flex gap-1">
                        {config.stripe_enabled && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Stripe</span>
                        )}
                        {config.paddle_enabled && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Paddle</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors">
                Configure Gateways →
              </button>
            </div>
          </div>

          {/* Regional Pricing */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/admin/subscription/regional-pricing')}>
            <div className="h-2 bg-purple-600"></div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Regional Pricing</h3>
              <p className="text-gray-600 text-sm mb-4">Set different prices for different regions</p>
              <p className="text-sm text-gray-600">Manage pricing strategy across 8 global regions</p>
              
              <button className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-colors">
                Manage Pricing →
              </button>
            </div>
          </div>

          {/* Processing Fee */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/admin/subscription/processing-fee')}>
            <div className="h-2 bg-orange-600"></div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Fee</h3>
              <p className="text-gray-600 text-sm mb-4">Update global processing fee percentage</p>
              <p className="text-lg font-bold text-orange-600 mt-4">
                Current: {feeLoading ? '-' : `${feeData?.processingFee || 0}%`}
              </p>
              
              <button className="mt-4 w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg transition-colors">
                Update Fee →
              </button>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Quick Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Plans are public and visible to all users</li>
            <li>✓ Gateway configuration is region-based</li>
            <li>✓ Regional pricing allows competitive pricing per region</li>
            <li>✓ Processing fee applies to all payments globally</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptionDashboard;
