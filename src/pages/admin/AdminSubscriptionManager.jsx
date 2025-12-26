import React, { useState } from 'react';
import { Loader, Save, X, Edit2, ArrowLeft, DollarSign, Users, Vote, Percent, Hash, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  useGetAllPlansQuery, 
  useUpdatePlanMutation,
  useUpdateEditableFieldsMutation,
  useGetAllGatewayConfigsQuery,
  useSetGatewayConfigMutation
} from '../../redux/api/subscription/subscriptionApi';
import GatewayConfigTab from '../../components/Subscription/GatewayConfigTab';

// Edit Modal/Slide Panel Component
function EditPlanModal({ plan, editValues, saving, onSave, onCancel, onChangeValue }) {
  if (!plan) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      
      {/* Slide Panel */}
      <div className="absolute inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl transform transition-transform duration-300 ease-out">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Edit Plan Settings</h3>
              <p className="text-blue-100 text-sm mt-1">{plan.plan_name} • {plan.plan_type}</p>
            </div>
            <button
              onClick={onCancel}
              disabled={saving}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-[calc(100vh-180px)]">
          {/* Plan Info Card */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-lg font-semibold text-gray-900">{plan.duration_days} Days</p>
              </div>
            </div>
          </div>

          {/* Price Section */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <DollarSign size={16} className="text-green-600" />
              Plan Price
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={editValues.price || ''}
                onChange={(e) => onChangeValue('price', e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-lg font-medium"
              />
            </div>
          </div>

          {/* Limits Section */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 mb-6 border border-purple-100">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Hash size={18} className="text-purple-600" />
              Plan Limits
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                  <Vote size={14} className="text-purple-500" />
                  Max Elections
                </label>
                <input
                  type="number"
                  min="0"
                  value={editValues.max_elections || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || parseInt(val) >= 0) {
                      onChangeValue('max_elections', val);
                    }
                  }}
                  placeholder="Leave blank for unlimited"
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all bg-white"
                />
                <p className="text-xs text-purple-600 mt-1">Leave empty for unlimited (∞)</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                  <Users size={14} className="text-purple-500" />
                  Max Voters per Election
                </label>
                <input
                  type="number"
                  min="0"
                  value={editValues.max_voters_per_election || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || parseInt(val) >= 0) {
                      onChangeValue('max_voters_per_election', val);
                    }
                  }}
                  placeholder="Leave blank for unlimited"
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all bg-white"
                />
                <p className="text-xs text-purple-600 mt-1">Leave empty for unlimited (∞)</p>
              </div>
            </div>
          </div>

          {/* Processing Fee Section */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Percent size={18} className="text-amber-600" />
              Processing Fee Settings
            </h4>

            <div className="space-y-4">
              {/* Fee Type */}
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">Fee Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onChangeValue('processing_fee_type', 'fixed')}
                    className={`py-3 px-4 rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-2 ${
                      editValues.processing_fee_type === 'fixed'
                        ? 'border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-amber-300'
                    }`}
                  >
                    <DollarSign size={18} />
                    Fixed Amount
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeValue('processing_fee_type', 'percentage')}
                    className={`py-3 px-4 rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-2 ${
                      editValues.processing_fee_type === 'percentage'
                        ? 'border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-amber-300'
                    }`}
                  >
                    <Percent size={18} />
                    Percentage
                  </button>
                </div>
              </div>

              {/* Fee Amount */}
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Fee {editValues.processing_fee_type === 'fixed' ? 'Amount ($)' : 'Percentage (%)'}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    {editValues.processing_fee_type === 'fixed' ? '$' : '%'}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editValues.processing_fee_amount}
                    onChange={(e) => onChangeValue('processing_fee_amount', e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all bg-white text-lg font-medium"
                  />
                </div>
              </div>

              {/* Mandatory Toggle */}
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">Fee Requirement</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onChangeValue('processing_fee_mandatory', true)}
                    className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                      editValues.processing_fee_mandatory === true
                        ? 'border-red-500 bg-red-500 text-white shadow-lg shadow-red-500/30'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-red-300'
                    }`}
                  >
                    Mandatory
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeValue('processing_fee_mandatory', false)}
                    className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                      editValues.processing_fee_mandatory === false
                        ? 'border-green-500 bg-green-500 text-white shadow-lg shadow-green-500/30'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
                    }`}
                  >
                    Optional
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={saving}
              className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(plan.id)}
              disabled={saving}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
            >
              {saving ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Plan Card Component for better visual display
function PlanCard({ plan, onEdit }) {
  const getFeeDisplay = () => {
    if (plan.processing_fee_type === 'fixed') {
      return `$${parseFloat(plan.processing_fee_fixed_amount || 0).toFixed(2)}`;
    }
    return `${plan.processing_fee_percentage || 0}%`;
  };

  const getGradient = () => {
    const gradients = {
      'Pay_as_you_go': 'from-slate-500 to-slate-600',
      'Weekly': 'from-cyan-500 to-cyan-600',
      'Bi_weekly': 'from-teal-500 to-teal-600',
      'Monthly': 'from-blue-500 to-blue-600',
      'Two_monthly': 'from-indigo-500 to-indigo-600',
      'Quarterly': 'from-violet-500 to-violet-600',
      'Four_monthly': 'from-purple-500 to-purple-600',
      'Semi_annual': 'from-fuchsia-500 to-fuchsia-600',
      'Nine_monthly': 'from-pink-500 to-pink-600',
      'Annual': 'from-rose-500 to-rose-600',
      'Eighteen_monthly': 'from-orange-500 to-orange-600',
      'Two_year': 'from-amber-500 to-amber-600',
    };
    return gradients[plan.plan_type] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${getGradient()} px-5 py-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-lg">{plan.plan_name}</h3>
            <p className="text-white/80 text-sm capitalize">{plan.plan_type.replace(/_/g, ' ')}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">${parseFloat(plan.price).toFixed(2)}</p>
            <p className="text-white/80 text-xs">{plan.duration_days} days</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <Vote size={12} />
              Max Elections
            </div>
            <p className="font-bold text-gray-900">
              {plan.max_elections === 0 || plan.max_elections === -1 || plan.max_elections === null 
                ? <span className="text-purple-600">Unlimited</span> 
                : plan.max_elections.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <Users size={12} />
              Max Voters
            </div>
            <p className="font-bold text-gray-900">
              {plan.max_voters_per_election === 0 || plan.max_voters_per_election === -1 || plan.max_voters_per_election === null 
                ? <span className="text-purple-600">Unlimited</span> 
                : plan.max_voters_per_election.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Processing Fee Info */}
        <div className="flex items-center justify-between py-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
              plan.processing_fee_type === 'fixed' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-amber-100 text-amber-700'
            }`}>
              {getFeeDisplay()}
            </div>
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
              plan.processing_fee_mandatory
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {plan.processing_fee_mandatory ? 'Mandatory' : 'Optional'}
            </span>
          </div>
          <button
            onClick={() => onEdit(plan)}
            className="flex items-center gap-1 px-4 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors group-hover:scale-105 transform duration-200"
          >
            <Edit2 size={16} />
            Edit
            <ChevronRight size={16} className="opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Table View Component (improved version)
function TableView({ plans, onEdit }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Limits</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Processing Fee</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {plans.map((plan, index) => (
              <tr 
                key={plan.id} 
                className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-gray-900">{plan.plan_name}</p>
                    <p className="text-sm text-gray-500 capitalize">{plan.plan_type.replace(/_/g, ' ')}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-lg font-bold text-gray-900">${parseFloat(plan.price).toFixed(2)}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                    <Clock size={14} />
                    {plan.duration_days} days
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1 text-sm">
                    <span className="text-gray-600">
                      <span className="font-medium">Elections:</span>{' '}
                      {plan.max_elections === 0 || plan.max_elections === -1 || plan.max_elections === null 
                        ? <span className="text-purple-600 font-semibold">∞</span> 
                        : <span className="font-semibold">{plan.max_elections.toLocaleString()}</span>}
                    </span>
                    <span className="text-gray-600">
                      <span className="font-medium">Voters:</span>{' '}
                      {plan.max_voters_per_election === 0 || plan.max_voters_per_election === -1 || plan.max_voters_per_election === null 
                        ? <span className="text-purple-600 font-semibold">∞</span> 
                        : <span className="font-semibold">{plan.max_voters_per_election.toLocaleString()}</span>}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold ${
                      plan.processing_fee_type === 'fixed' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {plan.processing_fee_type === 'fixed' ? <DollarSign size={14} /> : <Percent size={14} />}
                      {plan.processing_fee_type === 'fixed' 
                        ? `${parseFloat(plan.processing_fee_fixed_amount || 0).toFixed(2)}`
                        : `${plan.processing_fee_percentage || 0}%`
                      }
                    </span>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      plan.processing_fee_mandatory
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {plan.processing_fee_mandatory ? 'Required' : 'Optional'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onEdit(plan)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ParticipationFeeTab({ plans, editingPlan, editValues, saving, onEdit, onSave, onCancel, onChangeValue }) {
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  return (
    <div className="mt-6">
      {/* Header with View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Set Processing Fees for Each Plan</h2>
          <p className="text-gray-600 mt-1">Configure election and vote processing fees, max elections, and max voters per plan</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              viewMode === 'cards' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              viewMode === 'table' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Table
          </button>
        </div>
      </div>

      {/* Plans Display */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onEdit={onEdit} />
          ))}
        </div>
      ) : (
        <TableView plans={plans} onEdit={onEdit} />
      )}

      {/* Note */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
        <p className="text-sm text-blue-800">
          <strong className="font-semibold">💡 Tip:</strong> Click "Edit" on any plan to modify its settings. 
          Leave Max Elections or Max Voters blank for unlimited. 
          Processing fees can be a fixed amount ($) or percentage (%) and can be set as mandatory or optional.
        </p>
      </div>

      {/* Edit Modal */}
      {editingPlan && (
        <EditPlanModal
          plan={editingPlan}
          editValues={editValues}
          saving={saving}
          onSave={onSave}
          onCancel={onCancel}
          onChangeValue={onChangeValue}
        />
      )}
    </div>
  );
}

export default function AdminSubscriptionManager() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('participation-fee');
  const [editingPlan, setEditingPlan] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [saving, setSaving] = useState(false);

  const { data: plansData, isLoading: plansLoading } = useGetAllPlansQuery();
  const { data: gatewaysData, isLoading: gatewaysLoading, refetch: refetchGateways } = useGetAllGatewayConfigsQuery();
  const [updatePlan] = useUpdatePlanMutation();
  const [updateEditableFields] = useUpdateEditableFieldsMutation();
  const [setGatewayConfig] = useSetGatewayConfigMutation();

  const plans = plansData?.plans || [];
  const gateways = gatewaysData?.configs || [];
  const loading = plansLoading || gatewaysLoading;

  const updateProcessingFee = async (planId) => {
    setSaving(true);
    try {
      // Update price using RTK mutation
      await updatePlan({
        planId,
        price: editValues.price === '' ? 0 : parseFloat(editValues.price),
      }).unwrap();

      // Prepare editable fields data
      const requestBody = {
        max_elections: editValues.max_elections === '' ? null : parseInt(editValues.max_elections),
        max_voters_per_election: editValues.max_voters_per_election === '' ? null : parseInt(editValues.max_voters_per_election),
        processing_fee_mandatory: editValues.processing_fee_mandatory,
        processing_fee_type: editValues.processing_fee_type,
      };

      if (editValues.processing_fee_type === 'fixed') {
        requestBody.processing_fee_fixed_amount = editValues.processing_fee_amount === '' ? 0 : parseFloat(editValues.processing_fee_amount);
        requestBody.processing_fee_percentage = null;
      } else {
        requestBody.processing_fee_percentage = editValues.processing_fee_amount === '' ? 0 : parseFloat(editValues.processing_fee_amount);
        requestBody.processing_fee_fixed_amount = null;
      }

      // Update editable fields using RTK mutation
      await updateEditableFields({
        planId,
        ...requestBody,
      }).unwrap();
      
      setEditingPlan(null);
      setEditValues({});
      toast.success('Plan updated successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error updating plan: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const updateGatewayConfig = async (regionId, gatewayType) => {
    setSaving(true);
    try {
      const config = {
        gateway_type: gatewayType,
        stripe_enabled: gatewayType === 'stripe_only' || gatewayType === 'split_50_50',
        paddle_enabled: gatewayType === 'paddle_only' || gatewayType === 'split_50_50',
        recommendation_reason: `Gateway set to ${gatewayType.replace(/_/g, ' ')} for region ${regionId}`,
      };

      await setGatewayConfig({
        region: regionId,
        ...config,
      }).unwrap();

      refetchGateways();
      
      toast.success('Gateway configuration updated successfully!');
    } catch (error) {
      console.error('Error updating gateway:', error);
      toast.error('Error updating gateway: ' + (error.data?.error || error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    
    const processingFeeAmount = plan.processing_fee_type === 'percentage' 
      ? plan.processing_fee_percentage 
      : plan.processing_fee_fixed_amount;
    
    setEditValues({
      price: String(plan.price || 0),
      max_elections: plan.max_elections === -1 || plan.max_elections === null ? '' : String(plan.max_elections),
      max_voters_per_election: plan.max_voters_per_election === -1 || plan.max_voters_per_election === null ? '' : String(plan.max_voters_per_election),
      processing_fee_amount: String(processingFeeAmount || 0),
      processing_fee_type: plan.processing_fee_type || 'fixed',
      processing_fee_mandatory: Boolean(plan.processing_fee_mandatory),
    });
  };

  const handleChangeValue = (field, value) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCancel = () => {
    setEditingPlan(null);
    setEditValues({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Subscription Management</h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage processing fees and payment gateways by region</p>
            </div>
            <button
              onClick={() => navigate('/dashboard', { replace: true })}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 inline-flex gap-1">
          <button
            onClick={() => setActiveTab('participation-fee')}
            className={`px-5 sm:px-6 py-3 font-medium rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'participation-fee'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            💰 Processing Fee Settings
          </button>
          <button
            onClick={() => setActiveTab('gateway-config')}
            className={`px-5 sm:px-6 py-3 font-medium rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'gateway-config'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            🔗 Gateway Configuration
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="text-gray-500 font-medium">Loading plans...</p>
          </div>
        ) : activeTab === 'participation-fee' ? (
          <ParticipationFeeTab
            plans={plans}
            editingPlan={editingPlan}
            editValues={editValues}
            saving={saving}
            onEdit={handleEdit}
            onSave={updateProcessingFee}
            onCancel={handleCancel}
            onChangeValue={handleChangeValue}
          />
        ) : (
          <GatewayConfigTab
            gateways={gateways}
            saving={saving}
            onUpdate={updateGatewayConfig}
          />
        )}
      </div>
    </div>
  );
}

//last workable code with ugly design
// import React, { useState } from 'react';
// import { Loader, Save, X, Edit2, ArrowLeft } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { 
//   useGetAllPlansQuery, 
//   useUpdatePlanMutation,
//   useUpdateEditableFieldsMutation,
//   useGetAllGatewayConfigsQuery,
//   useSetGatewayConfigMutation
// } from '../../redux/api/subscription/subscriptionApi';
// import GatewayConfigTab from '../../components/Subscription/GatewayConfigTab';

// function ParticipationFeeTab({ plans, editingId, editValues, saving, onEdit, onSave, onCancel, onChangeValue }) {
//   return (
//     <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
//       <div className="px-6 py-4 bg-gray-50 border-b">
//         <h2 className="text-lg font-semibold text-gray-900">Set Processing Fees for Each Plan</h2>
//         <p className="text-sm text-gray-600 mt-1">Configure election and vote processing fees, max elections, and max voters per plan</p>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead className="bg-gray-50 border-b">
//             <tr>
//               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Plan Name</th>
//               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
//               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
//               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Duration</th>
//               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Max Elections</th>
//               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Max Voters</th>
//               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Processing Fee</th>
//               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fee Type</th>
//               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Mandatory</th>
//               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y">
//             {plans.map((plan) => (
//               <tr key={plan.id} className="hover:bg-gray-50 transition">
//                 <td className="px-6 py-4 text-sm font-medium text-gray-900">{plan.plan_name}</td>
//                 <td className="px-6 py-4 text-sm text-gray-600 capitalize">{plan.plan_type}</td>
                
//                 {editingId === plan.id ? (
//                   <td className="px-6 py-4 text-sm">
//                     <div className="flex items-center gap-1">
//                       <span className="text-gray-500">$</span>
//                       <input
//                         type="number"
//                         step="0.01"
//                         min="0"
//                         value={editValues.price || ''}
//                         onChange={(e) => onChangeValue('price', e.target.value)}
//                         placeholder="0.00"
//                         className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       />
//                     </div>
//                   </td>
//                 ) : (
//                   <td className="px-6 py-4 text-sm text-gray-600">${parseFloat(plan.price).toFixed(2)}</td>
//                 )}
                
//                 <td className="px-6 py-4 text-sm text-gray-600 capitalize">{plan.duration_days} days</td>

//                 {editingId === plan.id ? (
//                   <>
//                     <td className="px-6 py-4 text-sm">
//                       <div className="flex flex-col gap-1">
//                         <input
//                           type="number"
//                           min="0"
//                           value={editValues.max_elections || ''}
//                           onChange={(e) => {
//                             const val = e.target.value;
//                             if (val === '' || parseInt(val) >= 0) {
//                               onChangeValue('max_elections', val);
//                             }
//                           }}
//                           placeholder="Leave blank for unlimited"
//                           className="w-28 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                         />
//                         <span className="text-xs text-gray-500">(blank = ∞)</span>
//                       </div>
//                     </td>

//                     <td className="px-6 py-4 text-sm">
//                       <div className="flex flex-col gap-1">
//                         <input
//                           type="number"
//                           min="0"
//                           value={editValues.max_voters_per_election || ''}
//                           onChange={(e) => {
//                             const val = e.target.value;
//                             if (val === '' || parseInt(val) >= 0) {
//                               onChangeValue('max_voters_per_election', val);
//                             }
//                           }}
//                           placeholder="Leave blank for unlimited"
//                           className="w-28 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                         />
//                         <span className="text-xs text-gray-500">(blank = ∞)</span>
//                       </div>
//                     </td>

//                     <td className="px-6 py-4 text-sm">
//                       <input
//                         type="number"
//                         step="0.01"
//                         min="0"
//                         value={editValues.processing_fee_amount}
//                         onChange={(e) => onChangeValue('processing_fee_amount', e.target.value)}
//                         placeholder="0.00"
//                         className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       />
//                     </td>

//                     <td className="px-6 py-4 text-sm">
//                       <select
//                         value={editValues.processing_fee_type}
//                         onChange={(e) => onChangeValue('processing_fee_type', e.target.value)}
//                         className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                       >
//                         <option value="fixed">Fixed $</option>
//                         <option value="percentage">Percentage %</option>
//                       </select>
//                     </td>

//                     <td className="px-6 py-4 text-sm">
//                       <select
//                         value={editValues.processing_fee_mandatory}
//                         onChange={(e) => onChangeValue('processing_fee_mandatory', e.target.value === 'true')}
//                         className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                       >
//                         <option value="true">Mandatory</option>
//                         <option value="false">Optional</option>
//                       </select>
//                     </td>
//                   </>
//                 ) : (
//                   <>
//                     <td className="px-6 py-4 text-sm text-gray-600">
//                       {plan.max_elections === 0 || plan.max_elections === -1 || plan.max_elections === null ? '∞' : plan.max_elections}
//                     </td>

//                     <td className="px-6 py-4 text-sm text-gray-600">
//                       {plan.max_voters_per_election === 0 || plan.max_voters_per_election === -1 || plan.max_voters_per_election === null ? '∞' : plan.max_voters_per_election}
//                     </td>

//                     <td className="px-6 py-4 text-sm">
//                       <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
//                         {plan.processing_fee_type === 'fixed' 
//                           ? `$${parseFloat(plan.processing_fee_fixed_amount || 0).toFixed(2)}`
//                           : `${plan.processing_fee_percentage || 0}%`
//                         }
//                       </span>
//                     </td>

//                     <td className="px-6 py-4 text-sm text-gray-600 capitalize">
//                       {plan.processing_fee_type}
//                     </td>

//                     <td className="px-6 py-4 text-sm">
//                       <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
//                         plan.processing_fee_mandatory
//                           ? 'bg-red-100 text-red-800'
//                           : 'bg-green-100 text-green-800'
//                       }`}>
//                         {plan.processing_fee_mandatory ? 'Yes' : 'No'}
//                       </span>
//                     </td>
//                   </>
//                 )}

//                 <td className="px-6 py-4 text-sm">
//                   {editingId === plan.id ? (
//                     <div className="flex gap-2">
//                       <button
//                         onClick={() => onSave(plan.id)}
//                         disabled={saving}
//                         className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
//                       >
//                         {saving ? (
//                           <Loader size={16} className="animate-spin" />
//                         ) : (
//                           <Save size={16} />
//                         )}
//                         Save
//                       </button>
//                       <button
//                         onClick={onCancel}
//                         disabled={saving}
//                         className="flex items-center gap-1 px-3 py-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 transition"
//                       >
//                         <X size={16} />
//                         Cancel
//                       </button>
//                     </div>
//                   ) : (
//                     <button
//                       onClick={() => onEdit(plan)}
//                       className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition"
//                     >
//                       <Edit2 size={16} />
//                       Edit
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <div className="px-6 py-4 bg-blue-50 border-t">
//         <p className="text-xs text-blue-700">
//           <strong>Note:</strong> Everything will be editable/changeable later.
//           Max Elections and Max Voters: Leave blank for unlimited. 
//           Processing fees can be fixed amount ($) or percentage (%) based on plan type and can be mandatory or optional.
//         </p>
//       </div>
//     </div>
//   );
// }

// export default function AdminSubscriptionManager() {
//   //const auth = useAuth();
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState('participation-fee');
//   const [editingId, setEditingId] = useState(null);
//   const [editValues, setEditValues] = useState({});
//   const [saving, setSaving] = useState(false);

//   const { data: plansData, isLoading: plansLoading } = useGetAllPlansQuery();
//   const { data: gatewaysData, isLoading: gatewaysLoading, refetch: refetchGateways } = useGetAllGatewayConfigsQuery();
//   const [updatePlan] = useUpdatePlanMutation();
//   const [updateEditableFields] = useUpdateEditableFieldsMutation();
//   const [setGatewayConfig] = useSetGatewayConfigMutation();

//   const plans = plansData?.plans || [];
//   const gateways = gatewaysData?.configs || [];
//   const loading = plansLoading || gatewaysLoading;

//   const updateProcessingFee = async (planId) => {
//     setSaving(true);
//     try {
//       // Update price using RTK mutation
//       await updatePlan({
//         planId,
//         price: editValues.price === '' ? 0 : parseFloat(editValues.price),
//       }).unwrap();

//       // Prepare editable fields data
//       const requestBody = {
//         max_elections: editValues.max_elections === '' ? null : parseInt(editValues.max_elections),
//         max_voters_per_election: editValues.max_voters_per_election === '' ? null : parseInt(editValues.max_voters_per_election),
//         processing_fee_mandatory: editValues.processing_fee_mandatory,
//         processing_fee_type: editValues.processing_fee_type,
//       };

//       if (editValues.processing_fee_type === 'fixed') {
//         requestBody.processing_fee_fixed_amount = editValues.processing_fee_amount === '' ? 0 : parseFloat(editValues.processing_fee_amount);
//         requestBody.processing_fee_percentage = null;
//       } else {
//         requestBody.processing_fee_percentage = editValues.processing_fee_amount === '' ? 0 : parseFloat(editValues.processing_fee_amount);
//         requestBody.processing_fee_fixed_amount = null;
//       }

//       // Update editable fields using RTK mutation
//       await updateEditableFields({
//         planId,
//         ...requestBody,
//       }).unwrap();
      
//       setEditingId(null);
//       setEditValues({});
//       toast.success('Plan updated successfully!');
//     } catch (error) {
//       console.error('Error:', error);
//       toast.error('Error updating plan: ' + (error.message || 'Unknown error'));
//     } finally {
//       setSaving(false);
//     }
//   };

//   const updateGatewayConfig = async (regionId, gatewayType) => {
//     setSaving(true);
//     try {
//       const config = {
//         gateway_type: gatewayType,
//         stripe_enabled: gatewayType === 'stripe_only' || gatewayType === 'split_50_50',
//         paddle_enabled: gatewayType === 'paddle_only' || gatewayType === 'split_50_50',
//         recommendation_reason: `Gateway set to ${gatewayType.replace(/_/g, ' ')} for region ${regionId}`,
//       };

//       await setGatewayConfig({
//         region: regionId,
//         ...config,
//       }).unwrap();

//       refetchGateways();
      
//       toast.success('Gateway configuration updated successfully!');
//     } catch (error) {
//       console.error('Error updating gateway:', error);
//       toast.error('Error updating gateway: ' + (error.data?.error || error.message || 'Unknown error'));
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleEdit = (plan) => {
//     setEditingId(plan.id);
    
//     const processingFeeAmount = plan.processing_fee_type === 'percentage' 
//       ? plan.processing_fee_percentage 
//       : plan.processing_fee_fixed_amount;
    
//     setEditValues({
//       price: String(plan.price || 0),
//       max_elections: plan.max_elections === -1 || plan.max_elections === null ? '' : String(plan.max_elections),
//       max_voters_per_election: plan.max_voters_per_election === -1 || plan.max_voters_per_election === null ? '' : String(plan.max_voters_per_election),
//       processing_fee_amount: String(processingFeeAmount || 0),
//       processing_fee_type: plan.processing_fee_type || 'fixed',
//       processing_fee_mandatory: Boolean(plan.processing_fee_mandatory),
//     });
//   };

//   const handleChangeValue = (field, value) => {
//     setEditValues(prev => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handleCancel = () => {
//     setEditingId(null);
//     setEditValues({});
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="bg-white shadow">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Subscription Management</h1>
//               <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage processing fees and payment gateways by region</p>
//             </div>
//             <button
//               onClick={() => navigate('/dashboard', { replace: true })}
//               className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
//             >
//               <ArrowLeft size={20} />
//               <span className="hidden sm:inline">Back to Dashboard</span>
//               <span className="sm:hidden">Back</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
//         <div className="flex flex-col sm:flex-row border-b border-gray-200 overflow-x-auto">
//           <button
//             onClick={() => setActiveTab('participation-fee')}
//             className={`px-4 sm:px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${
//               activeTab === 'participation-fee'
//                 ? 'border-blue-600 text-blue-600'
//                 : 'border-transparent text-gray-600 hover:text-gray-900'
//             }`}
//           >
//             💰 Processing Fee Settings
//           </button>
//           <button
//             onClick={() => setActiveTab('gateway-config')}
//             className={`px-4 sm:px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${
//               activeTab === 'gateway-config'
//                 ? 'border-blue-600 text-blue-600'
//                 : 'border-transparent text-gray-600 hover:text-gray-900'
//             }`}
//           >
//             🔗 Gateway Configuration
//           </button>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
//         {loading ? (
//           <div className="flex justify-center py-12">
//             <Loader className="animate-spin text-blue-600" size={48} />
//           </div>
//         ) : activeTab === 'participation-fee' ? (
//           <ParticipationFeeTab
//             plans={plans}
//             editingId={editingId}
//             editValues={editValues}
//             saving={saving}
//             onEdit={handleEdit}
//             onSave={updateProcessingFee}
//             onCancel={handleCancel}
//             onChangeValue={handleChangeValue}
//           />
//         ) : (
//           <GatewayConfigTab
//             gateways={gateways}
//             saving={saving}
//             onUpdate={updateGatewayConfig}
//           />
//         )}
//       </div>
//     </div>
//   );
// }
// // //last workable codes
// // import React, { useState } from 'react';
// // import { Loader, Save, X, Edit2, ArrowLeft } from 'lucide-react';
// // import { useAuth } from '../../redux/hooks';
// // import { useNavigate } from 'react-router-dom';
// // import { toast } from 'react-toastify';
// // import { 
// //   useGetAllPlansQuery, 
// //   useUpdatePlanMutation,
// //   useGetAllGatewayConfigsQuery,
// //   useSetGatewayConfigMutation
// // } from '../../redux/api/subscription/subscriptionApi';
// // import GatewayConfigTab from '../../components/Subscription/GatewayConfigTab';

// // function ParticipationFeeTab({ plans, editingId, editValues, saving, onEdit, onSave, onCancel, onChangeValue }) {
// //   return (
// //     <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
// //       <div className="px-6 py-4 bg-gray-50 border-b">
// //         <h2 className="text-lg font-semibold text-gray-900">Set Processing Fees for Each Plan</h2>
// //         <p className="text-sm text-gray-600 mt-1">Configure election and vote processing fees, max elections, and max voters per plan</p>
// //       </div>

// //       <div className="overflow-x-auto">
// //         <table className="w-full">
// //           <thead className="bg-gray-50 border-b">
// //             <tr>
// //               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Plan Name</th>
// //               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
// //               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
// //               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Duration</th>
// //               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Max Elections</th>
// //               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Max Voters</th>
// //               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Processing Fee</th>
// //               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fee Type</th>
// //               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Mandatory</th>
// //               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
// //             </tr>
// //           </thead>
// //           <tbody className="divide-y">
// //             {plans.map((plan) => (
// //               <tr key={plan.id} className="hover:bg-gray-50 transition">
// //                 <td className="px-6 py-4 text-sm font-medium text-gray-900">{plan.plan_name}</td>
// //                 <td className="px-6 py-4 text-sm text-gray-600 capitalize">{plan.plan_type}</td>
                
// //                 {editingId === plan.id ? (
// //                   <td className="px-6 py-4 text-sm">
// //                     <div className="flex items-center gap-1">
// //                       <span className="text-gray-500">$</span>
// //                       <input
// //                         type="number"
// //                         step="0.01"
// //                         min="0"
// //                         value={editValues.price || ''}
// //                         onChange={(e) => onChangeValue('price', e.target.value)}
// //                         placeholder="0.00"
// //                         className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
// //                       />
// //                     </div>
// //                   </td>
// //                 ) : (
// //                   <td className="px-6 py-4 text-sm text-gray-600">${parseFloat(plan.price).toFixed(2)}</td>
// //                 )}
                
// //                 <td className="px-6 py-4 text-sm text-gray-600 capitalize">{plan.duration_days} days</td>

// //                 {editingId === plan.id ? (
// //                   <>
// //                     <td className="px-6 py-4 text-sm">
// //                       <div className="flex flex-col gap-1">
// //                         <input
// //                           type="number"
// //                           min="0"
// //                           value={editValues.max_elections || ''}
// //                           onChange={(e) => {
// //                             const val = e.target.value;
// //                             if (val === '' || parseInt(val) >= 0) {
// //                               onChangeValue('max_elections', val);
// //                             }
// //                           }}
// //                           placeholder="Leave blank for unlimited"
// //                           className="w-28 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
// //                         />
// //                         <span className="text-xs text-gray-500">(blank = ∞)</span>
// //                       </div>
// //                     </td>

// //                     <td className="px-6 py-4 text-sm">
// //                       <div className="flex flex-col gap-1">
// //                         <input
// //                           type="number"
// //                           min="0"
// //                           value={editValues.max_voters_per_election || ''}
// //                           onChange={(e) => {
// //                             const val = e.target.value;
// //                             if (val === '' || parseInt(val) >= 0) {
// //                               onChangeValue('max_voters_per_election', val);
// //                             }
// //                           }}
// //                           placeholder="Leave blank for unlimited"
// //                           className="w-28 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
// //                         />
// //                         <span className="text-xs text-gray-500">(blank = ∞)</span>
// //                       </div>
// //                     </td>

// //                     <td className="px-6 py-4 text-sm">
// //                       <input
// //                         type="number"
// //                         step="0.01"
// //                         min="0"
// //                         value={editValues.processing_fee_amount}
// //                         onChange={(e) => onChangeValue('processing_fee_amount', e.target.value)}
// //                         placeholder="0.00"
// //                         className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
// //                       />
// //                     </td>

// //                     <td className="px-6 py-4 text-sm">
// //                       <select
// //                         value={editValues.processing_fee_type}
// //                         onChange={(e) => onChangeValue('processing_fee_type', e.target.value)}
// //                         className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
// //                       >
// //                         <option value="fixed">Fixed $</option>
// //                         <option value="percentage">Percentage %</option>
// //                       </select>
// //                     </td>

// //                     <td className="px-6 py-4 text-sm">
// //                       <select
// //                         value={editValues.processing_fee_mandatory}
// //                         onChange={(e) => onChangeValue('processing_fee_mandatory', e.target.value === 'true')}
// //                         className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
// //                       >
// //                         <option value="true">Mandatory</option>
// //                         <option value="false">Optional</option>
// //                       </select>
// //                     </td>
// //                   </>
// //                 ) : (
// //                   <>
// //                     <td className="px-6 py-4 text-sm text-gray-600">
// //                       {plan.max_elections === 0 || plan.max_elections === -1 || plan.max_elections === null ? '∞' : plan.max_elections}
// //                     </td>

// //                     <td className="px-6 py-4 text-sm text-gray-600">
// //                       {plan.max_voters_per_election === 0 || plan.max_voters_per_election === -1 || plan.max_voters_per_election === null ? '∞' : plan.max_voters_per_election}
// //                     </td>

// //                     <td className="px-6 py-4 text-sm">
// //                       <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
// //                         {plan.processing_fee_type === 'fixed' 
// //                           ? `$${parseFloat(plan.processing_fee_fixed_amount || 0).toFixed(2)}`
// //                           : `${plan.processing_fee_percentage || 0}%`
// //                         }
// //                       </span>
// //                     </td>

// //                     <td className="px-6 py-4 text-sm text-gray-600 capitalize">
// //                       {plan.processing_fee_type}
// //                     </td>

// //                     <td className="px-6 py-4 text-sm">
// //                       <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
// //                         plan.processing_fee_mandatory
// //                           ? 'bg-red-100 text-red-800'
// //                           : 'bg-green-100 text-green-800'
// //                       }`}>
// //                         {plan.processing_fee_mandatory ? 'Yes' : 'No'}
// //                       </span>
// //                     </td>
// //                   </>
// //                 )}

// //                 <td className="px-6 py-4 text-sm">
// //                   {editingId === plan.id ? (
// //                     <div className="flex gap-2">
// //                       <button
// //                         onClick={() => onSave(plan.id)}
// //                         disabled={saving}
// //                         className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
// //                       >
// //                         {saving ? (
// //                           <Loader size={16} className="animate-spin" />
// //                         ) : (
// //                           <Save size={16} />
// //                         )}
// //                         Save
// //                       </button>
// //                       <button
// //                         onClick={onCancel}
// //                         disabled={saving}
// //                         className="flex items-center gap-1 px-3 py-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 transition"
// //                       >
// //                         <X size={16} />
// //                         Cancel
// //                       </button>
// //                     </div>
// //                   ) : (
// //                     <button
// //                       onClick={() => onEdit(plan)}
// //                       className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition"
// //                     >
// //                       <Edit2 size={16} />
// //                       Edit
// //                     </button>
// //                   )}
// //                 </td>
// //               </tr>
// //             ))}
// //           </tbody>
// //         </table>
// //       </div>

// //       <div className="px-6 py-4 bg-blue-50 border-t">
// //         <p className="text-xs text-blue-700">
// //           <strong>Note:</strong> Everything is editable/changeable. 
// //           Max Elections and Max Voters: Leave blank for unlimited. 
// //           Processing fees can be fixed amount ($) or percentage (%) based on plan type and can be mandatory or optional.
// //         </p>
// //       </div>
// //     </div>
// //   );
// // }

// // export default function AdminSubscriptionManager() {
// //   const auth = useAuth();
// //   const navigate = useNavigate();
// //   const [activeTab, setActiveTab] = useState('participation-fee');
// //   const [editingId, setEditingId] = useState(null);
// //   const [editValues, setEditValues] = useState({});
// //   const [saving, setSaving] = useState(false);

// //   const { data: plansData, isLoading: plansLoading } = useGetAllPlansQuery();
// //   const { data: gatewaysData, isLoading: gatewaysLoading, refetch: refetchGateways } = useGetAllGatewayConfigsQuery();
// //   const [updatePlan] = useUpdatePlanMutation();
// //   const [setGatewayConfig] = useSetGatewayConfigMutation();

// //   const API_URL = import.meta.env.VITE_REACT_APP_API_URL_SUBSCRIPTION || 'http://localhost:3003/api/v1';

// //   const getUserRole = () => {
// //     if (auth.roles && Array.isArray(auth.roles) && auth.roles.length > 0) {
// //       return auth.roles[0].toLowerCase();
// //     }
// //     return 'manager';
// //   };

// //   const userRole = getUserRole();
// //   const plans = plansData?.plans || [];
// //   const gateways = gatewaysData?.configs || [];
// //   const loading = plansLoading || gatewaysLoading;

// //   const updateProcessingFee = async (planId) => {
// //     setSaving(true);
// //     try {
// //       await updatePlan({
// //         planId,
// //         price: editValues.price === '' ? 0 : parseFloat(editValues.price),
// //       }).unwrap();

// //       const requestBody = {
// //         max_elections: editValues.max_elections === '' ? null : parseInt(editValues.max_elections),
// //         max_voters_per_election: editValues.max_voters_per_election === '' ? null : parseInt(editValues.max_voters_per_election),
// //         processing_fee_mandatory: editValues.processing_fee_mandatory,
// //         processing_fee_type: editValues.processing_fee_type,
// //       };

// //       if (editValues.processing_fee_type === 'fixed') {
// //         requestBody.processing_fee_fixed_amount = editValues.processing_fee_amount === '' ? 0 : parseFloat(editValues.processing_fee_amount);
// //         requestBody.processing_fee_percentage = null;
// //       } else {
// //         requestBody.processing_fee_percentage = editValues.processing_fee_amount === '' ? 0 : parseFloat(editValues.processing_fee_amount);
// //         requestBody.processing_fee_fixed_amount = null;
// //       }

// //       const editableFieldsResponse = await fetch(`${API_URL}/subscriptions/plans/${planId}/editable-fields`, {
// //         method: 'PUT',
// //         headers: {
// //           'Content-Type': 'application/json',
// //           'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
// //           'x-user-role': userRole,
// //         },
// //         body: JSON.stringify(requestBody),
// //       });

// //       if (!editableFieldsResponse.ok) {
// //         throw new Error('Failed to update editable fields');
// //       }
      
// //       setEditingId(null);
// //       setEditValues({});
// //       toast.success('Plan updated successfully!');
// //     } catch (error) {
// //       console.error('Error:', error);
// //       toast.error('Error updating plan: ' + (error.message || 'Unknown error'));
// //     } finally {
// //       setSaving(false);
// //     }
// //   };

// //   const updateGatewayConfig = async (regionId, gatewayType) => {
// //     setSaving(true);
// //     try {
// //       const config = {
// //         gateway_type: gatewayType,
// //         stripe_enabled: gatewayType === 'stripe_only' || gatewayType === 'split_50_50',
// //         paddle_enabled: gatewayType === 'paddle_only' || gatewayType === 'split_50_50',
// //         recommendation_reason: `Gateway set to ${gatewayType.replace(/_/g, ' ')} for region ${regionId}`,
// //       };

// //       await setGatewayConfig({
// //         region: regionId,
// //         ...config,
// //       }).unwrap();

// //       refetchGateways();
      
// //       toast.success('Gateway configuration updated successfully!');
// //     } catch (error) {
// //       console.error('Error updating gateway:', error);
// //       toast.error('Error updating gateway: ' + (error.data?.error || error.message || 'Unknown error'));
// //     } finally {
// //       setSaving(false);
// //     }
// //   };

// //   const handleEdit = (plan) => {
// //     setEditingId(plan.id);
    
// //     const processingFeeAmount = plan.processing_fee_type === 'percentage' 
// //       ? plan.processing_fee_percentage 
// //       : plan.processing_fee_fixed_amount;
    
// //     setEditValues({
// //       price: String(plan.price || 0),
// //       max_elections: plan.max_elections === -1 || plan.max_elections === null ? '' : String(plan.max_elections),
// //       max_voters_per_election: plan.max_voters_per_election === -1 || plan.max_voters_per_election === null ? '' : String(plan.max_voters_per_election),
// //       processing_fee_amount: String(processingFeeAmount || 0),
// //       processing_fee_type: plan.processing_fee_type || 'fixed',
// //       processing_fee_mandatory: Boolean(plan.processing_fee_mandatory),
// //     });
// //   };

// //   const handleChangeValue = (field, value) => {
// //     setEditValues(prev => ({
// //       ...prev,
// //       [field]: value,
// //     }));
// //   };

// //   const handleCancel = () => {
// //     setEditingId(null);
// //     setEditValues({});
// //   };

// //   // ✅ fixed: removed extra brace here before return
// //   return (
// //     <div className="min-h-screen bg-gray-50">
// //       <div className="bg-white shadow">
// //         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Subscription Management</h1>
// //               <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage processing fees and payment gateways by region</p>
// //             </div>
// //             <button
// //               //nClick={() => navigate('/dashboard')}
// //               onClick={() => navigate('/dashboard', { replace: true })}
// //               className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
// //             >
// //               <ArrowLeft size={20} />
// //               <span className="hidden sm:inline">Back to Dashboard</span>
// //               <span className="sm:hidden">Back</span>
// //             </button>
// //           </div>
// //         </div>
// //       </div>

// //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
// //         <div className="flex flex-col sm:flex-row border-b border-gray-200 overflow-x-auto">
// //           <button
// //             onClick={() => setActiveTab('participation-fee')}
// //             className={`px-4 sm:px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${
// //               activeTab === 'participation-fee'
// //                 ? 'border-blue-600 text-blue-600'
// //                 : 'border-transparent text-gray-600 hover:text-gray-900'
// //             }`}
// //           >
// //             💰 Processing Fee Settings
// //           </button>
// //           <button
// //             onClick={() => setActiveTab('gateway-config')}
// //             className={`px-4 sm:px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${
// //               activeTab === 'gateway-config'
// //                 ? 'border-blue-600 text-blue-600'
// //                 : 'border-transparent text-gray-600 hover:text-gray-900'
// //             }`}
// //           >
// //             🔗 Gateway Configuration
// //           </button>
// //         </div>
// //       </div>

// //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
// //         {loading ? (
// //           <div className="flex justify-center py-12">
// //             <Loader className="animate-spin text-blue-600" size={48} />
// //           </div>
// //         ) : activeTab === 'participation-fee' ? (
// //           <ParticipationFeeTab
// //             plans={plans}
// //             editingId={editingId}
// //             editValues={editValues}
// //             saving={saving}
// //             onEdit={handleEdit}
// //             onSave={updateProcessingFee}
// //             onCancel={handleCancel}
// //             onChangeValue={handleChangeValue}
// //           />
// //         ) : (
// //           <GatewayConfigTab
// //             gateways={gateways}
// //             saving={saving}
// //             onUpdate={updateGatewayConfig}
// //           />
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

