import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../redux/hooks';
import {
  useGetAllPlansQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
} from '../../redux/api/subscription/subscriptionApi';
import { Loader, Plus, Edit2, Trash2, ChevronLeft } from 'lucide-react';

const AdminPlanManager = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: 'monthly',
    type: 'individual',
    max_elections: '',
    max_voters_per_election: '',
    participation_fee_required: false,
    participation_fee_percentage: '',
    description: '',
  });

  const { data: plansData, isLoading, refetch } = useGetAllPlansQuery();
  const [createPlan, createState] = useCreatePlanMutation();
  const [updatePlan, updateState] = useUpdatePlanMutation();

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      max_elections: parseInt(formData.max_elections) || -1,
      max_voters_per_election: parseInt(formData.max_voters_per_election) || -1,
      participation_fee_percentage: parseFloat(formData.participation_fee_percentage) || 0,
    };

    try {
      if (editingPlan) {
        await updatePlan({ planId: editingPlan.id, ...payload }).unwrap();
      } else {
        await createPlan(payload).unwrap();
      }

      setFormData({
        name: '',
        price: '',
        duration: 'monthly',
        type: 'individual',
        max_elections: '',
        max_voters_per_election: '',
        participation_fee_required: false,
        participation_fee_percentage: '',
        description: '',
      });
      setShowForm(false);
      setEditingPlan(null);
      refetch();
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      duration: plan.duration,
      type: plan.type,
      max_elections: plan.max_elections === -1 ? '' : plan.max_elections,
      max_voters_per_election: plan.max_voters_per_election === -1 ? '' : plan.max_voters_per_election,
      participation_fee_required: plan.participation_fee_required,
      participation_fee_percentage: plan.participation_fee_percentage || '',
      description: plan.description,
    });
    setShowForm(true);
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
            <h1 className="text-3xl font-bold text-gray-900">Manage Subscription Plans</h1>
            <p className="text-gray-600 mt-1">Create and edit subscription plans</p>
          </div>
        </div>

        {/* Add Plan Button */}
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingPlan(null);
              setFormData({
                name: '',
                price: '',
                duration: 'monthly',
                type: 'individual',
                max_elections: '',
                max_voters_per_election: '',
                participation_fee_required: false,
                participation_fee_percentage: '',
                description: '',
              });
            }}
            className="mb-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Add New Plan
          </button>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingPlan ? 'Edit Plan' : 'Create New Plan'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Basic, Pro, Enterprise"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration *
                  </label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="paygo">Pay-as-You-Go</option>
                    <option value="monthly">Monthly</option>
                    <option value="3months">3 Months</option>
                    <option value="6months">6 Months</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="individual">Individual</option>
                    <option value="organization">Organization</option>
                  </select>
                </div>

                {/* Max Elections */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Elections (blank for unlimited)
                  </label>
                  <input
                    type="number"
                    name="max_elections"
                    value={formData.max_elections}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Leave blank for unlimited"
                  />
                </div>

                {/* Max Voters */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Voters per Election (blank for unlimited)
                  </label>
                  <input
                    type="number"
                    name="max_voters_per_election"
                    value={formData.max_voters_per_election}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Leave blank for unlimited"
                  />
                </div>
              </div>

              {/* Participation Fee */}
              <div className="border-t pt-6">
                <label className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    name="participation_fee_required"
                    checked={formData.participation_fee_required}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="font-semibold text-gray-700">Enable Participation Fee</span>
                </label>

                {formData.participation_fee_required && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Participation Fee Percentage (%)
                    </label>
                    <input
                      type="number"
                      name="participation_fee_percentage"
                      value={formData.participation_fee_percentage}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 10"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Plan description"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={createState.isLoading || updateState.isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {createState.isLoading || updateState.isLoading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Saving...
                    </>
                  ) : (
                    'Save Plan'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPlan(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Plans List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Subscription Plans</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin text-blue-600" size={40} />
            </div>
          ) : plansData?.plans && plansData.plans.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Elections</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Fee</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {plansData.plans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{plan.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">${plan.price}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{plan.duration}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {plan.max_elections === -1 ? 'Unlimited' : plan.max_elections}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {plan.participation_fee_required ? (
                          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-semibold">
                            {plan.participation_fee_percentage}%
                          </span>
                        ) : (
                          <span className="text-gray-500">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(plan)}
                            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                          >
                            <Edit2 size={16} />
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-600">No plans created yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPlanManager;