import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../redux/hooks';
import {
  useGetAllPlansQuery,
  useGetPlanRegionalPricesQuery,
  useSetRegionalPricesMutation,
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

const AdminRegionalPricing = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [prices, setPrices] = useState({});

  const { data: plansData, isLoading: plansLoading } = useGetAllPlansQuery();
  const { data: pricesData, isLoading: pricesLoading, refetch } = useGetPlanRegionalPricesQuery(
    selectedPlan,
    { skip: !selectedPlan }
  );
  const [setRegionalPrices, setPriceState] = useSetRegionalPricesMutation();

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

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    setPrices({});
  };

  const handlePriceChange = (region, price) => {
    setPrices((prev) => ({
      ...prev,
      [region]: parseFloat(price) || 0,
    }));
  };

  const handleSavePrices = async (e) => {
    e.preventDefault();
    try {
      await setRegionalPrices({
        planId: selectedPlan,
        prices,
      }).unwrap();
      setPrices({});
      refetch();
    } catch (error) {
      console.error('Error saving prices:', error);
    }
  };

  const selectedPlanData = plansData?.plans?.find((p) => p.id === selectedPlan);
  const existingPrices = pricesData?.prices || [];

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
            <h1 className="text-3xl font-bold text-gray-900">Regional Pricing</h1>
            <p className="text-gray-600 mt-1">Set different prices for different regions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Plan Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-bold text-gray-900">Select Plan</h2>
              </div>

              {plansLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="animate-spin text-blue-600" size={32} />
                </div>
              ) : plansData?.plans ? (
                <div className="space-y-2 p-4">
                  {plansData.plans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => handlePlanSelect(plan.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        selectedPlan === plan.id
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <p className="font-semibold">{plan.name}</p>
                      <p className="text-sm opacity-75">${plan.price}/{plan.duration}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-12 text-center text-gray-600">
                  No plans available
                </div>
              )}
            </div>
          </div>

          {/* Pricing Form */}
          <div className="lg:col-span-3">
            {selectedPlanData ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedPlanData.name} - Regional Pricing
                </h2>
                <p className="text-gray-600 mb-6">Base price: ${selectedPlanData.price}</p>

                <form onSubmit={handleSavePrices} className="space-y-6">
                  {pricesLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader className="animate-spin text-blue-600" size={40} />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(REGIONS).map(([regionKey, regionName]) => {
                        const existingPrice = existingPrices.find(
                          (p) => p.region === regionKey
                        )?.price;

                        return (
                          <div key={regionKey}>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              {regionName}
                            </label>
                            <div className="relative">
                              <span className="absolute left-4 top-2 text-gray-500 font-semibold">
                                $
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={
                                  prices[regionKey] !== undefined
                                    ? prices[regionKey]
                                    : existingPrice || selectedPlanData.price
                                }
                                onChange={(e) => handlePriceChange(regionKey, e.target.value)}
                                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            {existingPrice && (
                              <p className="text-xs text-gray-500 mt-1">
                                Current: ${existingPrice}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={setPriceState.isLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {setPriceState.isLoading ? (
                        <>
                          <Loader className="animate-spin" size={20} />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={20} />
                          Save Regional Prices
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlan(null);
                        setPrices({});
                      }}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 rounded-lg transition-colors"
                    >
                      Clear Selection
                    </button>
                  </div>
                </form>

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">💡 Tips</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✓ Set prices for each region independently</li>
                    <li>✓ Leave blank to use the base price</li>
                    <li>✓ Useful for competitive pricing strategies</li>
                    <li>✓ Users see prices in their regional currency</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <p className="text-gray-600 text-lg">Select a plan to manage regional pricing</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegionalPricing;