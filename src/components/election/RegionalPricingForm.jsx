import React, { useState } from 'react';
import { FaPlus, FaTrash, FaGlobe } from 'react-icons/fa';
import { toast } from 'react-toastify';

const REGIONS = [
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'EU', name: 'European Union', currency: 'EUR' },
  { code: 'UK', name: 'United Kingdom', currency: 'GBP' },
  { code: 'CA', name: 'Canada', currency: 'CAD' },
  { code: 'AU', name: 'Australia', currency: 'AUD' },
  { code: 'JP', name: 'Japan', currency: 'JPY' },
  { code: 'CN', name: 'China', currency: 'CNY' },
  { code: 'IN', name: 'India', currency: 'INR' }
];

export default function RegionalPricingForm({ regionalPricing = [], onChange }) {
  const [selectedRegion, setSelectedRegion] = useState('');
  const [fee, setFee] = useState('');
  const [processingFee, setProcessingFee] = useState('');
  
  const addRegion = () => {
    if (!selectedRegion) {
      toast.error('Please select a region');
      return;
    }
    
    if (!fee || parseFloat(fee) < 0) {
      toast.error('Please enter a valid fee amount');
      return;
    }
    
    // Check if region already exists
    if (regionalPricing.some(r => r.region_code === selectedRegion)) {
      toast.error('This region is already added');
      return;
    }
    
    const region = REGIONS.find(r => r.code === selectedRegion);
    
    const newPricing = {
      region_code: selectedRegion,
      region_name: region.name,
      participation_fee: parseFloat(fee),
      currency: region.currency,
      processing_fee_percentage: processingFee ? parseFloat(processingFee) : 0
    };
    
    onChange([...regionalPricing, newPricing]);
    
    // Reset form
    setSelectedRegion('');
    setFee('');
    setProcessingFee('');
    
    toast.success(`${region.name} pricing added`);
  };
  
  const removeRegion = (regionCode) => {
    onChange(regionalPricing.filter(r => r.region_code !== regionCode));
    toast.success('Region removed');
  };
  
  const updateRegion = (regionCode, field, value) => {
    onChange(
      regionalPricing.map(r =>
        r.region_code === regionCode
          ? { ...r, [field]: parseFloat(value) || 0 }
          : r
      )
    );
  };
  
  const availableRegions = REGIONS.filter(
    r => !regionalPricing.some(p => p.region_code === r.code)
  );
  
  return (
    <div>
      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FaGlobe className="text-blue-600" />
        Regional Pricing Configuration
      </h4>
      
      {/* Add New Region */}
      <div className="mb-4 p-4 bg-white border-2 border-gray-200 rounded-lg">
        <p className="text-sm font-semibold text-gray-700 mb-3">Add New Region</p>
        <div className="grid md:grid-cols-4 gap-3">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Region</option>
            {availableRegions.map(region => (
              <option key={region.code} value={region.code}>
                {region.name} ({region.currency})
              </option>
            ))}
          </select>
          
          <input
            type="number"
            min="0"
            step="0.01"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            placeholder="Fee Amount"
            className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={processingFee}
            onChange={(e) => setProcessingFee(e.target.value)}
            placeholder="Processing Fee %"
            className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          
          <button
            onClick={addRegion}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
          >
            <FaPlus />
            Add
          </button>
        </div>
      </div>
      
      {/* Current Regional Pricing */}
      {regionalPricing.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Configured Regions ({regionalPricing.length})
          </p>
          {regionalPricing.map((pricing) => (
            <div
              key={pricing.region_code}
              className="flex items-center justify-between p-3 bg-blue-50 border-2 border-blue-200 rounded-lg"
            >
              <div className="flex-1">
                <h5 className="font-semibold text-gray-900">
                  {pricing.region_name}
                  <span className="ml-2 text-sm text-gray-600">({pricing.currency})</span>
                </h5>
                <div className="flex gap-4 mt-2">
                  <div>
                    <label className="text-xs text-gray-600">Participation Fee</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={pricing.participation_fee}
                      onChange={(e) => updateRegion(pricing.region_code, 'participation_fee', e.target.value)}
                      className="w-32 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Processing Fee %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={pricing.processing_fee_percentage}
                      onChange={(e) => updateRegion(pricing.region_code, 'processing_fee_percentage', e.target.value)}
                      className="w-32 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => removeRegion(pricing.region_code)}
                className="ml-4 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition"
                title="Remove Region"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">No regions configured yet</p>
        </div>
      )}
      
      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> Set different participation fees for different regions. 
          The currency will be automatically determined based on the region.
        </p>
      </div>
    </div>
  );
}