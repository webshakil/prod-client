// src/pages/superAdmin/settings/PaymentSettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Save, RefreshCw, AlertCircle, CheckCircle, CreditCard, Zap } from 'lucide-react';
import { useGetPaymentConfigsQuery, useSavePaymentConfigsMutation } from '../../redux/api/walllet/paymentConfigApi';
// import { 
//   useGetPaymentConfigsQuery, 
//   useSavePaymentConfigsMutation 
// } from '../../../redux/api/payment/paymentConfigApi';

export default function PaymentSettingsPage() {
  /*eslint-disable*/
  const { t } = useTranslation();
  
  // ✅ RTK Query hooks
  const { 
    data: configsFromDB, 
    isLoading: configsLoading,
    refetch: refetchConfigs 
  } = useGetPaymentConfigsQuery();

  const [saveConfigs, { isLoading: saving }] = useSavePaymentConfigsMutation();
  
  // State for form data
  const [formData, setFormData] = useState({
    // Stripe
    stripe_enabled: true,
    stripe_mode: 'test',
    stripe_test_secret_key: '',
    stripe_test_publishable_key: '',
    stripe_live_secret_key: '',
    stripe_live_publishable_key: '',
    stripe_webhook_secret: '',
    stripe_client_secret: '',
    
    // Paddle
    paddle_enabled: false,
    paddle_mode: 'sandbox',
    paddle_vendor_id: '',
    paddle_sandbox_api_key: '',
    paddle_live_api_key: '',
    paddle_sandbox_client_token: '',
    paddle_live_client_token: '',
    paddle_webhook_secret: '',
  });

  // State for show/hide password fields
  const [showFields, setShowFields] = useState({
    stripe_test_secret_key: false,
    stripe_live_secret_key: false,
    stripe_webhook_secret: false,
    stripe_client_secret: false,
    paddle_sandbox_api_key: false,
    paddle_live_api_key: false,
    paddle_sandbox_client_token: false,
    paddle_live_client_token: false,
    paddle_webhook_secret: false,
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  // ✅ Load settings from API response
  useEffect(() => {
    if (configsFromDB) {
      console.log('✅ Loaded configs from database:', configsFromDB);
      setFormData(prev => ({
        ...prev,
        ...configsFromDB
      }));
    }
  }, [configsFromDB]);

  // ✅ Load settings function
  const loadSettings = () => {
    console.log('🔄 Reloading settings from database...');
    refetchConfigs();
  };

  const handleToggle = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleShowField = (field) => {
    setShowFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    // Stripe validations
    if (formData.stripe_enabled) {
      if (formData.stripe_mode === 'test') {
        if (formData.stripe_test_secret_key && !formData.stripe_test_secret_key.startsWith('sk_test_')) {
          setMessage({ type: 'error', text: 'Stripe Test Secret Key must start with sk_test_' });
          return false;
        }
        if (formData.stripe_test_publishable_key && !formData.stripe_test_publishable_key.startsWith('pk_test_')) {
          setMessage({ type: 'error', text: 'Stripe Test Publishable Key must start with pk_test_' });
          return false;
        }
      } else {
        if (formData.stripe_live_secret_key && !formData.stripe_live_secret_key.startsWith('sk_live_')) {
          setMessage({ type: 'error', text: 'Stripe Live Secret Key must start with sk_live_' });
          return false;
        }
        if (formData.stripe_live_publishable_key && !formData.stripe_live_publishable_key.startsWith('pk_live_')) {
          setMessage({ type: 'error', text: 'Stripe Live Publishable Key must start with pk_live_' });
          return false;
        }
      }
      if (formData.stripe_webhook_secret && !formData.stripe_webhook_secret.startsWith('whsec_')) {
        setMessage({ type: 'error', text: 'Stripe Webhook Secret must start with whsec_' });
        return false;
      }
    }

    return true;
  };

  // ✅ Save function using RTK Query mutation
  const handleSave = async () => {
    if (!validateForm()) return;

    setMessage({ type: '', text: '' });

    try {
      console.log('💾 Saving payment settings:', formData);
      
      // ✅ Use RTK Query mutation
      await saveConfigs(formData).unwrap();
      
      setMessage({ type: 'success', text: 'Payment settings saved successfully!' });
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      setMessage({ type: 'error', text: error.data?.message || 'Failed to save settings' });
    }
  };

  const renderToggle = (field, label) => (
    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-blue-300 transition">
      <div>
        <span className="font-semibold text-gray-800 text-base">{label}</span>
        <p className="text-sm text-gray-600 mt-1">
          {field === 'stripe_enabled' ? 'Accept payments via Stripe' : 'Accept payments via Paddle'}
        </p>
      </div>
      <button
        onClick={() => handleToggle(field)}
        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 shadow-sm ${
          formData[field] ? 'bg-blue-600 shadow-blue-200' : 'bg-gray-400'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-md ${
            formData[field] ? 'translate-x-8' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const renderRadioGroup = (name, options) => (
    <div className="flex gap-3">
      {options.map(option => (
        <label 
          key={option.value} 
          className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 border-2 rounded-xl cursor-pointer transition-all ${
            formData[name] === option.value
              ? 'border-blue-600 bg-blue-50 shadow-sm'
              : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={formData[name] === option.value}
            onChange={(e) => handleInputChange(name, e.target.value)}
            className="w-5 h-5 text-blue-600 focus:ring-blue-500"
          />
          <span className={`text-base font-medium ${
            formData[name] === option.value ? 'text-blue-700' : 'text-gray-700'
          }`}>
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );

  const renderPasswordField = (field, label, placeholder, helperText, isSecret = true) => (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="block text-base font-semibold text-gray-800">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {isSecret ? (
            <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full border border-red-200">
              🔒 Backend Secret
            </span>
          ) : (
            <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full border border-green-200">
              🌐 Frontend Public
            </span>
          )}
        </div>
      </div>
      <div className="relative">
        <input
          type={showFields[field] ? 'text' : 'password'}
          value={formData[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3.5 pr-12 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
        <button
          type="button"
          onClick={() => toggleShowField(field)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
        >
          {showFields[field] ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {helperText && (
        <p className="text-sm text-gray-600 flex items-start gap-2">
          <span className="text-blue-500 mt-0.5">ℹ️</span>
          {helperText}
        </p>
      )}
    </div>
  );

  const renderTextField = (field, label, placeholder, helperText, isPublic = false) => (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="block text-base font-semibold text-gray-800">
          {label}
        </label>
        {isPublic && (
          <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full border border-green-200">
            🌐 Frontend Public
          </span>
        )}
      </div>
      <input
        type="text"
        value={formData[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      />
      {helperText && (
        <p className="text-sm text-gray-600 flex items-start gap-2">
          <span className="text-blue-500 mt-0.5">ℹ️</span>
          {helperText}
        </p>
      )}
    </div>
  );

  // ✅ Loading state from RTK Query
  if (configsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <RefreshCw className="animate-spin text-blue-600 mb-4" size={64} />
        <p className="text-lg text-gray-600">Loading payment settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <CreditCard size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Payment Gateway Settings</h1>
            <p className="text-blue-100 text-base mt-1">
              Configure Stripe and Paddle payment gateways for your platform
            </p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
            <p className="text-blue-100 text-sm mb-1">Encryption Status</p>
            <p className="text-xl font-bold">🔐 AES-256 Enabled</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
            <p className="text-blue-100 text-sm mb-1">Transmission</p>
            <p className="text-xl font-bold">🔒 HTTPS Only</p>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {message.text && (
        <div className={`p-5 rounded-xl flex items-start gap-4 border-2 shadow-sm ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-300' 
            : 'bg-red-50 border-red-300'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={24} />
          ) : (
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
          )}
          <p className={`text-base font-medium ${
            message.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      {/* Stripe Configuration */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
        {/* Stripe Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <CreditCard className="text-white" size={32} />
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">Stripe Payment Gateway</h2>
              <p className="text-blue-100 text-base mt-1">
                Accept credit cards, Apple Pay, Google Pay and more
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Enable Toggle */}
          {renderToggle('stripe_enabled', 'Enable Stripe Payment Gateway')}

          {formData.stripe_enabled && (
            <>
              {/* Mode Selection */}
              <div className="space-y-3">
                <label className="block text-lg font-bold text-gray-800">
                  Select Stripe Environment
                </label>
                {renderRadioGroup('stripe_mode', [
                  { value: 'test', label: '🧪 Test Mode' },
                  { value: 'live', label: '🔴 Live Mode' }
                ])}
              </div>

              {/* Test Keys */}
              {formData.stripe_mode === 'test' && (
                <div className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-2xl space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-yellow-300">
                    <span className="text-3xl">🧪</span>
                    <div>
                      <h3 className="text-xl font-bold text-yellow-900">Test Environment Keys</h3>
                      <p className="text-sm text-yellow-700">Use these keys for development and testing</p>
                    </div>
                  </div>
                  
                  {renderPasswordField(
                    'stripe_test_secret_key',
                    'Test Secret Key',
                    'sk_test_51ABC123...',
                    'Secret key for backend API calls (starts with sk_test_)',
                    true
                  )}
                  
                  {renderTextField(
                    'stripe_test_publishable_key',
                    'Test Publishable Key',
                    'pk_test_51ABC123...',
                    'Publishable key for frontend React app (starts with pk_test_)',
                    true
                  )}
                </div>
              )}

              {/* Live Keys */}
              {formData.stripe_mode === 'live' && (
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-green-300">
                    <span className="text-3xl">🔴</span>
                    <div>
                      <h3 className="text-xl font-bold text-green-900">Production Environment Keys</h3>
                      <p className="text-sm text-green-700">Live keys for real transactions</p>
                    </div>
                  </div>
                  
                  {renderPasswordField(
                    'stripe_live_secret_key',
                    'Live Secret Key',
                    'sk_live_51ABC123...',
                    'Secret key for backend API calls (starts with sk_live_)',
                    true
                  )}
                  
                  {renderTextField(
                    'stripe_live_publishable_key',
                    'Live Publishable Key',
                    'pk_live_51ABC123...',
                    'Publishable key for frontend React app (starts with pk_live_)',
                    true
                  )}
                </div>
              )}

              {/* Common Stripe Fields */}
              <div className="space-y-6 pt-4">
                <div className="border-t-2 border-gray-200 pt-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-6">Additional Stripe Configuration</h3>
                  
                  {renderPasswordField(
                    'stripe_webhook_secret',
                    'Webhook Signing Secret',
                    'whsec_ABC123...',
                    'Webhook secret for verifying Stripe events (starts with whsec_)',
                    true
                  )}
                </div>
                
                <div className="border-t-2 border-gray-200 pt-6">
                  {renderPasswordField(
                    'stripe_client_secret',
                    'Payment Element Client Secret',
                    'pi_ABC123_secret_XYZ789...',
                    'Client secret for Stripe Payment Element integration (frontend)',
                    false
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Paddle Configuration */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
        {/* Paddle Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Zap className="text-white" size={32} />
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">Paddle Payment Gateway</h2>
              <p className="text-purple-100 text-base mt-1">
                Subscription billing and payments platform
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Enable Toggle */}
          {renderToggle('paddle_enabled', 'Enable Paddle Payment Gateway')}

          {formData.paddle_enabled && (
            <>
              {/* Mode Selection */}
              <div className="space-y-3">
                <label className="block text-lg font-bold text-gray-800">
                  Select Paddle Environment
                </label>
                {renderRadioGroup('paddle_mode', [
                  { value: 'sandbox', label: '🧪 Sandbox Mode' },
                  { value: 'live', label: '🔴 Live Mode' }
                ])}
              </div>

              {/* Vendor ID */}
              <div className="border-2 border-gray-200 rounded-xl p-6">
                {renderTextField(
                  'paddle_vendor_id',
                  'Vendor/Seller ID',
                  '12345',
                  'Your Paddle Vendor or Seller ID number',
                  false
                )}
              </div>

              {/* Sandbox Keys */}
              {formData.paddle_mode === 'sandbox' && (
                <div className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-2xl space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-yellow-300">
                    <span className="text-3xl">🧪</span>
                    <div>
                      <h3 className="text-xl font-bold text-yellow-900">Sandbox Environment Keys</h3>
                      <p className="text-sm text-yellow-700">Use these keys for development and testing</p>
                    </div>
                  </div>
                  
                  {renderPasswordField(
                    'paddle_sandbox_api_key',
                    'Sandbox API Key',
                    'sandbox_api_ABC123...',
                    'API key for backend Paddle API calls',
                    true
                  )}
                  
                  {renderTextField(
                    'paddle_sandbox_client_token',
                    'Sandbox Client Token',
                    'sandbox_ABC123...',
                    'Client token for frontend Paddle.js integration',
                    true
                  )}
                </div>
              )}

              {/* Live Keys */}
              {formData.paddle_mode === 'live' && (
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-green-300">
                    <span className="text-3xl">🔴</span>
                    <div>
                      <h3 className="text-xl font-bold text-green-900">Production Environment Keys</h3>
                      <p className="text-sm text-green-700">Live keys for real transactions</p>
                    </div>
                  </div>
                  
                  {renderPasswordField(
                    'paddle_live_api_key',
                    'Live API Key',
                    'live_api_ABC123...',
                    'API key for backend Paddle API calls',
                    true
                  )}
                  
                  {renderTextField(
                    'paddle_live_client_token',
                    'Live Client Token',
                    'live_ABC123...',
                    'Client token for frontend Paddle.js integration',
                    true
                  )}
                </div>
              )}

              {/* Webhook Secret */}
              <div className="border-t-2 border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Webhook Configuration</h3>
                {renderPasswordField(
                  'paddle_webhook_secret',
                  'Webhook Secret',
                  'pdl_ntfset_ABC123...',
                  'Webhook secret for verifying Paddle webhook events',
                  true
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-blue-900 mb-3">🔐 Security & Best Practices</h3>
            <ul className="space-y-2.5 text-base text-blue-800">
              <li className="flex items-start gap-3">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>All secret keys are encrypted with AES-256 encryption before database storage</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Keys are transmitted securely over HTTPS with TLS 1.3</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Never share secret keys publicly or commit them to version control</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span><strong>Backend Secret</strong> keys are only accessible by server-side microservices</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span><strong>Frontend Public</strong> keys are safe to use in React components and client-side code</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end sticky bottom-6 bg-white/80 backdrop-blur p-4 rounded-2xl border-2 border-gray-200 shadow-lg">
        <button
          onClick={loadSettings}
          disabled={saving}
          className="px-8 py-3.5 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center gap-2 text-base"
        >
          <RefreshCw size={18} />
          Reset Changes
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-200 text-base"
        >
          {saving ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              Saving Settings...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
//last workable code without api
// // src/pages/superAdmin/settings/PaymentSettingsPage.jsx
// import React, { useState, useEffect } from 'react';
// import { useTranslation } from 'react-i18next';
// import { Eye, EyeOff, Save, RefreshCw, AlertCircle, CheckCircle, CreditCard, Zap } from 'lucide-react';

// export default function PaymentSettingsPage() {
//   /*eslint-disable*/
//   const { t } = useTranslation();
  
//   // State for form data
//   const [formData, setFormData] = useState({
//     // Stripe
//     stripe_enabled: true,
//     stripe_mode: 'test',
//     stripe_test_secret_key: '',
//     stripe_test_publishable_key: '',
//     stripe_live_secret_key: '',
//     stripe_live_publishable_key: '',
//     stripe_webhook_secret: '',
//     stripe_client_secret: '',
    
//     // Paddle
//     paddle_enabled: false,
//     paddle_mode: 'sandbox',
//     paddle_vendor_id: '',
//     paddle_sandbox_api_key: '',
//     paddle_live_api_key: '',
//     paddle_sandbox_client_token: '',
//     paddle_live_client_token: '',
//     paddle_webhook_secret: '',
//   });

//   // State for show/hide password fields
//   const [showFields, setShowFields] = useState({
//     stripe_test_secret_key: false,
//     stripe_live_secret_key: false,
//     stripe_webhook_secret: false,
//     stripe_client_secret: false,
//     paddle_sandbox_api_key: false,
//     paddle_live_api_key: false,
//     paddle_sandbox_client_token: false,
//     paddle_live_client_token: false,
//     paddle_webhook_secret: false,
//   });

//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [message, setMessage] = useState({ type: '', text: '' });

//   // Load existing settings
//   useEffect(() => {
//     loadSettings();
//   }, []);

//   const loadSettings = async () => {
//     setLoading(true);
//     try {
//       // TODO: API call to fetch settings
//       // const response = await fetch('/api/admin/payment-settings');
//       // const data = await response.json();
//       // setFormData(data);
      
//       console.log('📥 Loading payment settings...');
//       setLoading(false);
//     } catch (error) {
//       console.error('❌ Error loading settings:', error);
//       setMessage({ type: 'error', text: 'Failed to load settings' });
//       setLoading(false);
//     }
//   };

//   const handleToggle = (field) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: !prev[field]
//     }));
//   };

//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const toggleShowField = (field) => {
//     setShowFields(prev => ({
//       ...prev,
//       [field]: !prev[field]
//     }));
//   };

//   const validateForm = () => {
//     // Stripe validations
//     if (formData.stripe_enabled) {
//       if (formData.stripe_mode === 'test') {
//         if (formData.stripe_test_secret_key && !formData.stripe_test_secret_key.startsWith('sk_test_')) {
//           setMessage({ type: 'error', text: 'Stripe Test Secret Key must start with sk_test_' });
//           return false;
//         }
//         if (formData.stripe_test_publishable_key && !formData.stripe_test_publishable_key.startsWith('pk_test_')) {
//           setMessage({ type: 'error', text: 'Stripe Test Publishable Key must start with pk_test_' });
//           return false;
//         }
//       } else {
//         if (formData.stripe_live_secret_key && !formData.stripe_live_secret_key.startsWith('sk_live_')) {
//           setMessage({ type: 'error', text: 'Stripe Live Secret Key must start with sk_live_' });
//           return false;
//         }
//         if (formData.stripe_live_publishable_key && !formData.stripe_live_publishable_key.startsWith('pk_live_')) {
//           setMessage({ type: 'error', text: 'Stripe Live Publishable Key must start with pk_live_' });
//           return false;
//         }
//       }
//       if (formData.stripe_webhook_secret && !formData.stripe_webhook_secret.startsWith('whsec_')) {
//         setMessage({ type: 'error', text: 'Stripe Webhook Secret must start with whsec_' });
//         return false;
//       }
//     }

//     return true;
//   };

//   const handleSave = async () => {
//     if (!validateForm()) return;

//     setSaving(true);
//     setMessage({ type: '', text: '' });

//     try {
//       // TODO: API call to save settings
//       // const response = await fetch('/api/admin/payment-settings', {
//       //   method: 'POST',
//       //   headers: { 'Content-Type': 'application/json' },
//       //   body: JSON.stringify(formData)
//       // });
      
//       console.log('💾 Saving payment settings:', formData);
      
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       setMessage({ type: 'success', text: 'Payment settings saved successfully!' });
//       setSaving(false);
//     } catch (error) {
//       console.error('❌ Error saving settings:', error);
//       setMessage({ type: 'error', text: 'Failed to save settings' });
//       setSaving(false);
//     }
//   };

//   const renderToggle = (field, label) => (
//     <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-blue-300 transition">
//       <div>
//         <span className="font-semibold text-gray-800 text-base">{label}</span>
//         <p className="text-sm text-gray-600 mt-1">
//           {field === 'stripe_enabled' ? 'Accept payments via Stripe' : 'Accept payments via Paddle'}
//         </p>
//       </div>
//       <button
//         onClick={() => handleToggle(field)}
//         className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 shadow-sm ${
//           formData[field] ? 'bg-blue-600 shadow-blue-200' : 'bg-gray-400'
//         }`}
//       >
//         <span
//           className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-md ${
//             formData[field] ? 'translate-x-8' : 'translate-x-1'
//           }`}
//         />
//       </button>
//     </div>
//   );

//   const renderRadioGroup = (name, options) => (
//     <div className="flex gap-3">
//       {options.map(option => (
//         <label 
//           key={option.value} 
//           className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 border-2 rounded-xl cursor-pointer transition-all ${
//             formData[name] === option.value
//               ? 'border-blue-600 bg-blue-50 shadow-sm'
//               : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
//           }`}
//         >
//           <input
//             type="radio"
//             name={name}
//             value={option.value}
//             checked={formData[name] === option.value}
//             onChange={(e) => handleInputChange(name, e.target.value)}
//             className="w-5 h-5 text-blue-600 focus:ring-blue-500"
//           />
//           <span className={`text-base font-medium ${
//             formData[name] === option.value ? 'text-blue-700' : 'text-gray-700'
//           }`}>
//             {option.label}
//           </span>
//         </label>
//       ))}
//     </div>
//   );

//   const renderPasswordField = (field, label, placeholder, helperText, isSecret = true) => (
//     <div className="space-y-2.5">
//       <div className="flex items-center justify-between">
//         <label className="block text-base font-semibold text-gray-800">
//           {label}
//         </label>
//         <div className="flex items-center gap-2">
//           {isSecret ? (
//             <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full border border-red-200">
//               🔒 Backend Secret
//             </span>
//           ) : (
//             <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full border border-green-200">
//               🌐 Frontend Public
//             </span>
//           )}
//         </div>
//       </div>
//       <div className="relative">
//         <input
//           type={showFields[field] ? 'text' : 'password'}
//           value={formData[field]}
//           onChange={(e) => handleInputChange(field, e.target.value)}
//           placeholder={placeholder}
//           className="w-full px-4 py-3.5 pr-12 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
//         />
//         <button
//           type="button"
//           onClick={() => toggleShowField(field)}
//           className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
//         >
//           {showFields[field] ? <EyeOff size={20} /> : <Eye size={20} />}
//         </button>
//       </div>
//       {helperText && (
//         <p className="text-sm text-gray-600 flex items-start gap-2">
//           <span className="text-blue-500 mt-0.5">ℹ️</span>
//           {helperText}
//         </p>
//       )}
//     </div>
//   );

//   const renderTextField = (field, label, placeholder, helperText, isPublic = false) => (
//     <div className="space-y-2.5">
//       <div className="flex items-center justify-between">
//         <label className="block text-base font-semibold text-gray-800">
//           {label}
//         </label>
//         {isPublic && (
//           <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full border border-green-200">
//             🌐 Frontend Public
//           </span>
//         )}
//       </div>
//       <input
//         type="text"
//         value={formData[field]}
//         onChange={(e) => handleInputChange(field, e.target.value)}
//         placeholder={placeholder}
//         className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
//       />
//       {helperText && (
//         <p className="text-sm text-gray-600 flex items-start gap-2">
//           <span className="text-blue-500 mt-0.5">ℹ️</span>
//           {helperText}
//         </p>
//       )}
//     </div>
//   );

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen">
//         <RefreshCw className="animate-spin text-blue-600 mb-4" size={64} />
//         <p className="text-lg text-gray-600">Loading payment settings...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto p-6 space-y-8">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 text-white">
//         <div className="flex items-center gap-4 mb-3">
//           <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
//             <CreditCard size={28} />
//           </div>
//           <div>
//             <h1 className="text-3xl font-bold">Payment Gateway Settings</h1>
//             <p className="text-blue-100 text-base mt-1">
//               Configure Stripe and Paddle payment gateways for your platform
//             </p>
//           </div>
//         </div>
//         <div className="mt-6 grid grid-cols-2 gap-4">
//           <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
//             <p className="text-blue-100 text-sm mb-1">Encryption Status</p>
//             <p className="text-xl font-bold">🔐 AES-256 Enabled</p>
//           </div>
//           <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
//             <p className="text-blue-100 text-sm mb-1">Transmission</p>
//             <p className="text-xl font-bold">🔒 HTTPS Only</p>
//           </div>
//         </div>
//       </div>

//       {/* Alert Messages */}
//       {message.text && (
//         <div className={`p-5 rounded-xl flex items-start gap-4 border-2 shadow-sm ${
//           message.type === 'success' 
//             ? 'bg-green-50 border-green-300' 
//             : 'bg-red-50 border-red-300'
//         }`}>
//           {message.type === 'success' ? (
//             <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={24} />
//           ) : (
//             <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
//           )}
//           <p className={`text-base font-medium ${
//             message.type === 'success' ? 'text-green-800' : 'text-red-800'
//           }`}>
//             {message.text}
//           </p>
//         </div>
//       )}

//       {/* Stripe Configuration */}
//       <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
//         {/* Stripe Header */}
//         <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6">
//           <div className="flex items-center gap-4">
//             <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
//               <CreditCard className="text-white" size={32} />
//             </div>
//             <div className="text-white">
//               <h2 className="text-2xl font-bold">Stripe Payment Gateway</h2>
//               <p className="text-blue-100 text-base mt-1">
//                 Accept credit cards, Apple Pay, Google Pay and more
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="p-8 space-y-8">
//           {/* Enable Toggle */}
//           {renderToggle('stripe_enabled', 'Enable Stripe Payment Gateway')}

//           {formData.stripe_enabled && (
//             <>
//               {/* Mode Selection */}
//               <div className="space-y-3">
//                 <label className="block text-lg font-bold text-gray-800">
//                   Select Stripe Environment
//                 </label>
//                 {renderRadioGroup('stripe_mode', [
//                   { value: 'test', label: '🧪 Test Mode' },
//                   { value: 'live', label: '🔴 Live Mode' }
//                 ])}
//               </div>

//               {/* Test Keys */}
//               {formData.stripe_mode === 'test' && (
//                 <div className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-2xl space-y-6">
//                   <div className="flex items-center gap-3 pb-4 border-b border-yellow-300">
//                     <span className="text-3xl">🧪</span>
//                     <div>
//                       <h3 className="text-xl font-bold text-yellow-900">Test Environment Keys</h3>
//                       <p className="text-sm text-yellow-700">Use these keys for development and testing</p>
//                     </div>
//                   </div>
                  
//                   {renderPasswordField(
//                     'stripe_test_secret_key',
//                     'Test Secret Key',
//                     'sk_test_51ABC123...',
//                     'Secret key for backend API calls (starts with sk_test_)',
//                     true
//                   )}
                  
//                   {renderTextField(
//                     'stripe_test_publishable_key',
//                     'Test Publishable Key',
//                     'pk_test_51ABC123...',
//                     'Publishable key for frontend React app (starts with pk_test_)',
//                     true
//                   )}
//                 </div>
//               )}

//               {/* Live Keys */}
//               {formData.stripe_mode === 'live' && (
//                 <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl space-y-6">
//                   <div className="flex items-center gap-3 pb-4 border-b border-green-300">
//                     <span className="text-3xl">🔴</span>
//                     <div>
//                       <h3 className="text-xl font-bold text-green-900">Production Environment Keys</h3>
//                       <p className="text-sm text-green-700">Live keys for real transactions</p>
//                     </div>
//                   </div>
                  
//                   {renderPasswordField(
//                     'stripe_live_secret_key',
//                     'Live Secret Key',
//                     'sk_live_51ABC123...',
//                     'Secret key for backend API calls (starts with sk_live_)',
//                     true
//                   )}
                  
//                   {renderTextField(
//                     'stripe_live_publishable_key',
//                     'Live Publishable Key',
//                     'pk_live_51ABC123...',
//                     'Publishable key for frontend React app (starts with pk_live_)',
//                     true
//                   )}
//                 </div>
//               )}

//               {/* Common Stripe Fields */}
//               <div className="space-y-6 pt-4">
//                 <div className="border-t-2 border-gray-200 pt-6">
//                   <h3 className="text-lg font-bold text-gray-800 mb-6">Additional Stripe Configuration</h3>
                  
//                   {renderPasswordField(
//                     'stripe_webhook_secret',
//                     'Webhook Signing Secret',
//                     'whsec_ABC123...',
//                     'Webhook secret for verifying Stripe events (starts with whsec_)',
//                     true
//                   )}
//                 </div>
                
//                 <div className="border-t-2 border-gray-200 pt-6">
//                   {renderPasswordField(
//                     'stripe_client_secret',
//                     'Payment Element Client Secret',
//                     'pi_ABC123_secret_XYZ789...',
//                     'Client secret for Stripe Payment Element integration (frontend)',
//                     false
//                   )}
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Paddle Configuration */}
//       <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
//         {/* Paddle Header */}
//         <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
//           <div className="flex items-center gap-4">
//             <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
//               <Zap className="text-white" size={32} />
//             </div>
//             <div className="text-white">
//               <h2 className="text-2xl font-bold">Paddle Payment Gateway</h2>
//               <p className="text-purple-100 text-base mt-1">
//                 Subscription billing and payments platform
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="p-8 space-y-8">
//           {/* Enable Toggle */}
//           {renderToggle('paddle_enabled', 'Enable Paddle Payment Gateway')}

//           {formData.paddle_enabled && (
//             <>
//               {/* Mode Selection */}
//               <div className="space-y-3">
//                 <label className="block text-lg font-bold text-gray-800">
//                   Select Paddle Environment
//                 </label>
//                 {renderRadioGroup('paddle_mode', [
//                   { value: 'sandbox', label: '🧪 Sandbox Mode' },
//                   { value: 'live', label: '🔴 Live Mode' }
//                 ])}
//               </div>

//               {/* Vendor ID */}
//               <div className="border-2 border-gray-200 rounded-xl p-6">
//                 {renderTextField(
//                   'paddle_vendor_id',
//                   'Vendor/Seller ID',
//                   '12345',
//                   'Your Paddle Vendor or Seller ID number',
//                   false
//                 )}
//               </div>

//               {/* Sandbox Keys */}
//               {formData.paddle_mode === 'sandbox' && (
//                 <div className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-2xl space-y-6">
//                   <div className="flex items-center gap-3 pb-4 border-b border-yellow-300">
//                     <span className="text-3xl">🧪</span>
//                     <div>
//                       <h3 className="text-xl font-bold text-yellow-900">Sandbox Environment Keys</h3>
//                       <p className="text-sm text-yellow-700">Use these keys for development and testing</p>
//                     </div>
//                   </div>
                  
//                   {renderPasswordField(
//                     'paddle_sandbox_api_key',
//                     'Sandbox API Key',
//                     'sandbox_api_ABC123...',
//                     'API key for backend Paddle API calls',
//                     true
//                   )}
                  
//                   {renderTextField(
//                     'paddle_sandbox_client_token',
//                     'Sandbox Client Token',
//                     'sandbox_ABC123...',
//                     'Client token for frontend Paddle.js integration',
//                     true
//                   )}
//                 </div>
//               )}

//               {/* Live Keys */}
//               {formData.paddle_mode === 'live' && (
//                 <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl space-y-6">
//                   <div className="flex items-center gap-3 pb-4 border-b border-green-300">
//                     <span className="text-3xl">🔴</span>
//                     <div>
//                       <h3 className="text-xl font-bold text-green-900">Production Environment Keys</h3>
//                       <p className="text-sm text-green-700">Live keys for real transactions</p>
//                     </div>
//                   </div>
                  
//                   {renderPasswordField(
//                     'paddle_live_api_key',
//                     'Live API Key',
//                     'live_api_ABC123...',
//                     'API key for backend Paddle API calls',
//                     true
//                   )}
                  
//                   {renderTextField(
//                     'paddle_live_client_token',
//                     'Live Client Token',
//                     'live_ABC123...',
//                     'Client token for frontend Paddle.js integration',
//                     true
//                   )}
//                 </div>
//               )}

//               {/* Webhook Secret */}
//               <div className="border-t-2 border-gray-200 pt-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-6">Webhook Configuration</h3>
//                 {renderPasswordField(
//                   'paddle_webhook_secret',
//                   'Webhook Secret',
//                   'pdl_ntfset_ABC123...',
//                   'Webhook secret for verifying Paddle webhook events',
//                   true
//                 )}
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Security Notice */}
//       <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-6">
//         <div className="flex items-start gap-4">
//           <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
//             <AlertCircle className="text-white" size={24} />
//           </div>
//           <div>
//             <h3 className="text-xl font-bold text-blue-900 mb-3">🔐 Security & Best Practices</h3>
//             <ul className="space-y-2.5 text-base text-blue-800">
//               <li className="flex items-start gap-3">
//                 <span className="text-blue-600 mt-0.5">✓</span>
//                 <span>All secret keys are encrypted with AES-256 encryption before database storage</span>
//               </li>
//               <li className="flex items-start gap-3">
//                 <span className="text-blue-600 mt-0.5">✓</span>
//                 <span>Keys are transmitted securely over HTTPS with TLS 1.3</span>
//               </li>
//               <li className="flex items-start gap-3">
//                 <span className="text-blue-600 mt-0.5">✓</span>
//                 <span>Never share secret keys publicly or commit them to version control</span>
//               </li>
//               <li className="flex items-start gap-3">
//                 <span className="text-blue-600 mt-0.5">✓</span>
//                 <span><strong>Backend Secret</strong> keys are only accessible by server-side microservices</span>
//               </li>
//               <li className="flex items-start gap-3">
//                 <span className="text-blue-600 mt-0.5">✓</span>
//                 <span><strong>Frontend Public</strong> keys are safe to use in React components and client-side code</span>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </div>

//       {/* Action Buttons */}
//       <div className="flex gap-4 justify-end sticky bottom-6 bg-white/80 backdrop-blur p-4 rounded-2xl border-2 border-gray-200 shadow-lg">
//         <button
//           onClick={loadSettings}
//           disabled={saving}
//           className="px-8 py-3.5 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center gap-2 text-base"
//         >
//           <RefreshCw size={18} />
//           Reset Changes
//         </button>
//         <button
//           onClick={handleSave}
//           disabled={saving}
//           className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-200 text-base"
//         >
//           {saving ? (
//             <>
//               <RefreshCw size={18} className="animate-spin" />
//               Saving Settings...
//             </>
//           ) : (
//             <>
//               <Save size={18} />
//               Save Settings
//             </>
//           )}
//         </button>
//       </div>
//     </div>
//   );
// }