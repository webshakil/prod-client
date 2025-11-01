import React from 'react';
import { DollarSign, MapPin, Info } from 'lucide-react';

export default function PricingTab({ 
  election, 
  userRegion, 
  applicableFee, 
  processingFeePercent 
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        <DollarSign className="inline mr-2" size={28} />
        Pricing
      </h2>

      {/* Pricing Type */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600 mb-1">Type</p>
        <p className="text-lg font-bold text-gray-900">
          {election.pricing_type === 'regional_fee' 
            ? 'Regional Fee' 
            : election.pricing_type === 'general_fee'
            ? 'General Fee'
            : 'Free'}
        </p>
      </div>

      {/* Regional Pricing Table */}
      {election.pricing_type === 'regional_fee' && election.regional_pricing?.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Regional Pricing</h3>
          <div className="space-y-3">
            {election.regional_pricing.map((region, index) => (
              <div 
                key={index}
                className={`flex justify-between items-center p-4 rounded-lg border-2 ${
                  userRegion?.region_code === region.region_code
                    ? 'bg-green-50 border-green-400'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {userRegion?.region_code === region.region_code && (
                    <MapPin className="text-green-600" size={20} />
                  )}
                  <span className="font-medium text-gray-900">{region.region_name}</span>
                  {userRegion?.region_code === region.region_code && (
                    <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                      Your Region
                    </span>
                  )}
                </div>
                <span className="text-lg font-bold text-green-600">
                  ${parseFloat(region.participation_fee || 0).toFixed(2)} {region.currency}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General Fee Display */}
      {election.pricing_type === 'general_fee' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">General Participation Fee</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-blue-900">
              ${parseFloat(election.general_participation_fee || 0).toFixed(2)}
            </span>
            <span className="text-gray-600 pb-1">USD</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Same fee for all participants worldwide
          </p>
        </div>
      )}

      {/* Your Fee Breakdown */}
      {applicableFee && applicableFee.total > 0 && (
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-4">Your Fee Breakdown</h3>
          <div className="space-y-3">
            {applicableFee.region && (
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={16} className="text-purple-700" />
                <span className="text-sm text-purple-700">Region: {applicableFee.region}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Participation Fee:</span>
              <span className="text-xl font-bold text-gray-900">
                {applicableFee.currency} {applicableFee.participationFee.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-gray-700">Processing Fee:</span>
                <span className="text-xs text-gray-500">({processingFeePercent}%)</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {applicableFee.currency} {applicableFee.processingFee.toFixed(2)}
              </span>
            </div>
            
            <div className="border-t-2 border-purple-300 pt-3 flex justify-between items-center">
              <span className="text-lg font-bold text-purple-900">Total Payment:</span>
              <span className="text-2xl font-bold text-purple-900">
                {applicableFee.currency} {applicableFee.total.toFixed(2)}
              </span>
            </div>

            {/* Frozen Amount Info */}
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm">
                  <p className="font-semibold text-blue-900 mb-1">Payment Details:</p>
                  <ul className="text-blue-800 space-y-1 list-disc list-inside">
                    <li>Processing fee ({applicableFee.currency} {applicableFee.processingFee.toFixed(2)}) will be deducted immediately</li>
                    <li>Participation fee ({applicableFee.currency} {applicableFee.frozenAmount.toFixed(2)}) will be frozen in your wallet</li>
                    <li>Frozen amount will be held until election ends</li>
                    <li>After election, frozen amount will be used for prize distribution</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {election.is_free && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-green-900 mb-2">This Election is Free!</h3>
          <p className="text-green-700">No participation fee required. Vote for free!</p>
        </div>
      )}
    </div>
  );
}