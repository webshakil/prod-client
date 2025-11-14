import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks'; // ✅ Changed
import { useGetGatewayRecommendationQuery } from '../../../../redux/api/subscription/subscriptionApi';
import {  setSelectedGateway, updateCheckoutData } from '../../../../redux/slices/subscriptionSlice';
import { Loader, CheckCircle } from 'lucide-react';

const GatewayRecommendation = ({ countryCode, planId, onGatewaySelected }) => {
  const dispatch = useAppDispatch(); // ✅ Changed
  const selectedGateway = useAppSelector((state) => state.subscription.selectedGateway);
  
  const { data: recommendationData, isLoading, error } = useGetGatewayRecommendationQuery(
    { country_code: countryCode, plan_id: planId },
    { skip: !countryCode }
  );

  const recommendation = recommendationData?.recommendation;

  const handleGatewaySelect = (gateway) => {
    dispatch(setSelectedGateway(gateway));
    dispatch(updateCheckoutData({ gateway }));
    onGatewaySelected?.(gateway);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">Error loading gateway recommendation</p>
      </div>
    );
  }

  if (!recommendation) {
    return null;
  }

  const { available_gateways, recommendation_reason, region, country_name } = recommendation;

  return (
    <div className="space-y-6">
      {/* Location Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">Location:</span> {country_name} ({countryCode})
          <br />
          <span className="font-semibold">Region:</span> {region}
        </p>
      </div>

      {/* Recommendation */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-900">
          <span className="font-semibold">Recommended:</span> {recommendation_reason}
        </p>
      </div>

      {/* Gateway Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {available_gateways?.map((gateway_option) => (
          <button
            key={gateway_option.gateway}
            onClick={() => handleGatewaySelect(gateway_option.gateway)}
            className={`border-2 rounded-lg p-4 text-left transition-all duration-200 ${
              selectedGateway === gateway_option.gateway
                ? 'border-blue-600 bg-blue-50 shadow-lg'
                : 'border-gray-300 hover:border-blue-600 hover:shadow-lg'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-lg capitalize">{gateway_option.gateway}</h4>
                  {selectedGateway === gateway_option.gateway && (
                    <CheckCircle className="text-green-600" size={20} />
                  )}
                </div>
                <p className="text-gray-600 text-sm mt-1">{gateway_option.reason}</p>
                {gateway_option.split && (
                  <p className="text-blue-600 text-sm mt-2 font-medium">
                    {gateway_option.split_percentage}% routing
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Payment Methods Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Accepted Payment Methods:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          {selectedGateway === 'stripe' && (
            <>
              <li>✓ Credit/Debit Cards (Visa, Mastercard, Amex)</li>
              <li>✓ PayPal</li>
              <li>✓ Google Pay</li>
              <li>✓ Apple Pay</li>
            </>
          )}
          {selectedGateway === 'paddle' && (
            <>
              <li>✓ Credit/Debit Cards (Visa, Mastercard, Amex)</li>
              <li>✓ PayPal</li>
            </>
          )}
          {!selectedGateway && (
            <li className="text-gray-500">Select a gateway to see payment methods</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default GatewayRecommendation;
