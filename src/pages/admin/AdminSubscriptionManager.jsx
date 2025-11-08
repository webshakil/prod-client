import React, { useState } from 'react';
import { Loader, Save, X, Edit2, ArrowLeft } from 'lucide-react';
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

function ParticipationFeeTab({ plans, editingId, editValues, saving, onEdit, onSave, onCancel, onChangeValue }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Set Processing Fees for Each Plan</h2>
        <p className="text-sm text-gray-600 mt-1">Configure election and vote processing fees, max elections, and max voters per plan</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Plan Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Duration</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Max Elections</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Max Voters</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Processing Fee</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fee Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Mandatory</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {plans.map((plan) => (
              <tr key={plan.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{plan.plan_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600 capitalize">{plan.plan_type}</td>
                
                {editingId === plan.id ? (
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editValues.price || ''}
                        onChange={(e) => onChangeValue('price', e.target.value)}
                        placeholder="0.00"
                        className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </td>
                ) : (
                  <td className="px-6 py-4 text-sm text-gray-600">${parseFloat(plan.price).toFixed(2)}</td>
                )}
                
                <td className="px-6 py-4 text-sm text-gray-600 capitalize">{plan.duration_days} days</td>

                {editingId === plan.id ? (
                  <>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col gap-1">
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
                          className="w-28 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <span className="text-xs text-gray-500">(blank = ∞)</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col gap-1">
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
                          className="w-28 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <span className="text-xs text-gray-500">(blank = ∞)</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editValues.processing_fee_amount}
                        onChange={(e) => onChangeValue('processing_fee_amount', e.target.value)}
                        placeholder="0.00"
                        className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>

                    <td className="px-6 py-4 text-sm">
                      <select
                        value={editValues.processing_fee_type}
                        onChange={(e) => onChangeValue('processing_fee_type', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="fixed">Fixed $</option>
                        <option value="percentage">Percentage %</option>
                      </select>
                    </td>

                    <td className="px-6 py-4 text-sm">
                      <select
                        value={editValues.processing_fee_mandatory}
                        onChange={(e) => onChangeValue('processing_fee_mandatory', e.target.value === 'true')}
                        className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="true">Mandatory</option>
                        <option value="false">Optional</option>
                      </select>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {plan.max_elections === 0 || plan.max_elections === -1 || plan.max_elections === null ? '∞' : plan.max_elections}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {plan.max_voters_per_election === 0 || plan.max_voters_per_election === -1 || plan.max_voters_per_election === null ? '∞' : plan.max_voters_per_election}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {plan.processing_fee_type === 'fixed' 
                          ? `$${parseFloat(plan.processing_fee_fixed_amount || 0).toFixed(2)}`
                          : `${plan.processing_fee_percentage || 0}%`
                        }
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                      {plan.processing_fee_type}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        plan.processing_fee_mandatory
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {plan.processing_fee_mandatory ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </>
                )}

                <td className="px-6 py-4 text-sm">
                  {editingId === plan.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onSave(plan.id)}
                        disabled={saving}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {saving ? (
                          <Loader size={16} className="animate-spin" />
                        ) : (
                          <Save size={16} />
                        )}
                        Save
                      </button>
                      <button
                        onClick={onCancel}
                        disabled={saving}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 transition"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onEdit(plan)}
                      className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 bg-blue-50 border-t">
        <p className="text-xs text-blue-700">
          <strong>Note:</strong> Everything will be editable/changeable later.
          Max Elections and Max Voters: Leave blank for unlimited. 
          Processing fees can be fixed amount ($) or percentage (%) based on plan type and can be mandatory or optional.
        </p>
      </div>
    </div>
  );
}

export default function AdminSubscriptionManager() {
  //const auth = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('participation-fee');
  const [editingId, setEditingId] = useState(null);
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
      
      setEditingId(null);
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
    setEditingId(plan.id);
    
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
    setEditingId(null);
    setEditValues({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Subscription Management</h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage processing fees and payment gateways by region</p>
            </div>
            <button
              onClick={() => navigate('/dashboard', { replace: true })}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('participation-fee')}
            className={`px-4 sm:px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'participation-fee'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            💰 Processing Fee Settings
          </button>
          <button
            onClick={() => setActiveTab('gateway-config')}
            className={`px-4 sm:px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'gateway-config'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            🔗 Gateway Configuration
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="animate-spin text-blue-600" size={48} />
          </div>
        ) : activeTab === 'participation-fee' ? (
          <ParticipationFeeTab
            plans={plans}
            editingId={editingId}
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
// //last workable codes
// import React, { useState } from 'react';
// import { Loader, Save, X, Edit2, ArrowLeft } from 'lucide-react';
// import { useAuth } from '../../redux/hooks';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { 
//   useGetAllPlansQuery, 
//   useUpdatePlanMutation,
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
//           <strong>Note:</strong> Everything is editable/changeable. 
//           Max Elections and Max Voters: Leave blank for unlimited. 
//           Processing fees can be fixed amount ($) or percentage (%) based on plan type and can be mandatory or optional.
//         </p>
//       </div>
//     </div>
//   );
// }

// export default function AdminSubscriptionManager() {
//   const auth = useAuth();
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState('participation-fee');
//   const [editingId, setEditingId] = useState(null);
//   const [editValues, setEditValues] = useState({});
//   const [saving, setSaving] = useState(false);

//   const { data: plansData, isLoading: plansLoading } = useGetAllPlansQuery();
//   const { data: gatewaysData, isLoading: gatewaysLoading, refetch: refetchGateways } = useGetAllGatewayConfigsQuery();
//   const [updatePlan] = useUpdatePlanMutation();
//   const [setGatewayConfig] = useSetGatewayConfigMutation();

//   const API_URL = import.meta.env.VITE_REACT_APP_API_URL_SUBSCRIPTION || 'http://localhost:3003/api/v1';

//   const getUserRole = () => {
//     if (auth.roles && Array.isArray(auth.roles) && auth.roles.length > 0) {
//       return auth.roles[0].toLowerCase();
//     }
//     return 'manager';
//   };

//   const userRole = getUserRole();
//   const plans = plansData?.plans || [];
//   const gateways = gatewaysData?.configs || [];
//   const loading = plansLoading || gatewaysLoading;

//   const updateProcessingFee = async (planId) => {
//     setSaving(true);
//     try {
//       await updatePlan({
//         planId,
//         price: editValues.price === '' ? 0 : parseFloat(editValues.price),
//       }).unwrap();

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

//       const editableFieldsResponse = await fetch(`${API_URL}/subscriptions/plans/${planId}/editable-fields`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
//           'x-user-role': userRole,
//         },
//         body: JSON.stringify(requestBody),
//       });

//       if (!editableFieldsResponse.ok) {
//         throw new Error('Failed to update editable fields');
//       }
      
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

//   // ✅ fixed: removed extra brace here before return
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
//               //nClick={() => navigate('/dashboard')}
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

