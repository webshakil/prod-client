import React from 'react';
import { Save, Globe, CreditCard, CheckCircle2 } from 'lucide-react';

// Region data with important countries
const REGION_DATA = {
  1: {
    name: 'North America',
    countries: ['United States', 'Canada'],
    icon: '🇺🇸',
  },
  2: {
    name: 'Western Europe',
    countries: ['UK', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands'],
    icon: '🇬🇧',
  },
  3: {
    name: 'Eastern Europe & Russia',
    countries: ['Russia', 'Poland', 'Ukraine', 'Czech Republic', 'Romania'],
    icon: '🇷🇺',
  },
  4: {
    name: 'Africa',
    countries: ['Nigeria', 'South Africa', 'Kenya', 'Egypt', 'Ghana'],
    icon: '🌍',
  },
  5: {
    name: 'Latin America & Caribbean',
    countries: ['Brazil', 'Mexico', 'Argentina', 'Colombia', 'Chile'],
    icon: '🇧🇷',
  },
  6: {
    name: 'Asia, Middle East & Pacific Islands',
    countries: ['India', 'UAE', 'Saudi Arabia', 'Pakistan', 'Indonesia', 'Philippines'],
    icon: '🇮🇳',
  },
  7: {
    name: 'Australasia & Advanced Asia',
    countries: ['Australia', 'New Zealand', 'Japan', 'South Korea', 'Taiwan', 'Singapore'],
    icon: '🇦🇺',
  },
  8: {
    name: 'Greater China',
    countries: ['China', 'Hong Kong', 'Macau'],
    icon: '🇨🇳',
  },
};

const GatewayConfigTab = ({ gateways, saving, onUpdate }) => {
  const getGatewayConfig = (regionId) => {
    return gateways.find(g => g.region_id === regionId) || {
      gateway_type: 'stripe_only',
      stripe_enabled: true,
      paddle_enabled: false,
    };
  };

  const getGatewayTypeDisplay = (type) => {
    const types = {
      'stripe_only': 'Stripe Only',
      'paddle_only': 'Paddle Only',
      'split_50_50': '50/50 Split',
    };
    return types[type] || type;
  };

  const getGatewayTypeColor = (type) => {
    const colors = {
      'stripe_only': 'bg-purple-100 text-purple-700 border-purple-200',
      'paddle_only': 'bg-blue-100 text-blue-700 border-blue-200',
      'split_50_50': 'bg-green-100 text-green-700 border-green-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600 rounded-lg">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">Payment Gateway Configuration</h2>
            <p className="text-gray-600 mt-2">
              Configure payment processing gateways for each regional zone. Select the optimal gateway distribution to maximize transaction success rates and minimize fees.
            </p>
          </div>
        </div>
      </div>

      {/* Gateway Options Legend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-gray-600" />
          Gateway Options
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-purple-50 border border-purple-200">
            <div className="w-2 h-2 rounded-full bg-purple-600 mt-2"></div>
            <div>
              <p className="font-semibold text-purple-900">Stripe Only</p>
              <p className="text-sm text-purple-700">All payments via Stripe gateway</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
            <div>
              <p className="font-semibold text-blue-900">Paddle Only</p>
              <p className="text-sm text-blue-700">All payments via Paddle gateway</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
            <div>
              <p className="font-semibold text-green-900">50/50 Split</p>
              <p className="text-sm text-green-700">Balanced distribution across both</p>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Gateway Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(REGION_DATA).map(([regionId, regionData]) => {
          const config = getGatewayConfig(parseInt(regionId));
          const currentType = config.gateway_type;

          return (
            <div
              key={regionId}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              {/* Region Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{regionData.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Region {regionId}: {regionData.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getGatewayTypeColor(currentType)}`}>
                          <CheckCircle2 className="w-3 h-3" />
                          {getGatewayTypeDisplay(currentType)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Countries */}
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Key Countries
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {regionData.countries.map((country, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {country}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gateway Selection */}
              <div className="p-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Select Payment Gateway</p>
                <div className="space-y-2">
                  {['stripe_only', 'paddle_only', 'split_50_50'].map((type) => (
                    <button
                      key={type}
                      onClick={() => onUpdate(parseInt(regionId), type)}
                      disabled={saving || currentType === type}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                        currentType === type
                          ? 'border-blue-600 bg-blue-50 cursor-default'
                          : 'border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                      } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            currentType === type
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {currentType === type && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span
                          className={`font-medium ${
                            currentType === type ? 'text-blue-900' : 'text-gray-700'
                          }`}
                        >
                          {getGatewayTypeDisplay(type)}
                        </span>
                      </div>
                      {currentType === type && (
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Gateway Status Indicators */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          config.stripe_enabled ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      ></div>
                      <span className={config.stripe_enabled ? 'text-gray-900' : 'text-gray-400'}>
                        Stripe {config.stripe_enabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          config.paddle_enabled ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      ></div>
                      <span className={config.paddle_enabled ? 'text-gray-900' : 'text-gray-400'}>
                        Paddle {config.paddle_enabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Footer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">ℹ</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Configuration Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Stripe Only:</strong> Best for regions with strong Stripe support and lower fees</li>
              <li>• <strong>Paddle Only:</strong> Ideal for regions where Paddle has better payment method coverage</li>
              <li>• <strong>50/50 Split:</strong> Provides redundancy and balances transaction costs across both gateways</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GatewayConfigTab;