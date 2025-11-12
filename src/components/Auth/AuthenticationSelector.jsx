

import React, { useState } from 'react';
import { Key, Mail, Lock, Loader } from 'lucide-react';
import { FaGoogle, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';

export default function AuthenticationSelector({ methods, electionId, onAuthComplete }) {
  const [selectedMethod, setSelectedMethod] = useState(methods[0] || 'passkey');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);


  const methodIcons = {
    passkey: Key,
    oauth: FaGoogle,
    magic_link: Mail,
    email_password: Lock,
  };

  const methodTitles = {
    passkey: 'Passkey Authentication',
    oauth: 'Social Login',
    magic_link: 'Magic Link',
    email_password: 'Email & Password',
  };

  const methodDescriptions = {
    passkey: 'Use your device biometrics or security key',
    oauth: 'Sign in with Google, Facebook, Twitter, or LinkedIn',
    magic_link: 'Get a one-time login link via email',
    email_password: 'Traditional email and password with 2FA',
  };

  // ========================================
  // HANDLE PASSKEY AUTH
  // ========================================
  const handlePasskeyAuth = async () => {
    setProcessing(true);
    setError(null);

    try {
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error('Passkey authentication is not supported on this device');
      }

      // In production, you would call your backend to get challenge
      // For now, we'll simulate success
      console.log('🔐 Passkey authentication initiated');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      onAuthComplete('passkey');
    } catch (err) {
      setError(err.message || 'Passkey authentication failed');
    } finally {
      setProcessing(false);
    }
  };

  // ========================================
  // HANDLE OAUTH
  // ========================================
  const handleOAuthLogin = async (provider) => {
    setProcessing(true);
    setError(null);

    try {
      console.log(`🔐 OAuth login with ${provider}`);
      
      // Redirect to OAuth provider
      const redirectUrl = `${import.meta.env.VITE_AUTH_SERVICE_URL}/auth/oauth/${provider}?electionId=${electionId}`;
      window.location.href = redirectUrl;

    } catch (err) {
      setError(err.message || 'OAuth login failed');
      setProcessing(false);
    }
  };

  // ========================================
  // HANDLE MAGIC LINK
  // ========================================
  const [email, setEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      console.log('📧 Sending magic link to:', email);

      // Call your auth service
      const response = await fetch(`${import.meta.env.VITE_AUTH_SERVICE_URL}/auth/magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, electionId }),
      });

      if (!response.ok) throw new Error('Failed to send magic link');

      setMagicLinkSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send magic link');
    } finally {
      setProcessing(false);
    }
  };

  // ========================================
  // HANDLE EMAIL/PASSWORD AUTH
  // ========================================
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      console.log('🔐 Email/password login');

      // Call your auth service
      const response = await fetch(`${import.meta.env.VITE_AUTH_SERVICE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...credentials, electionId }),
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();

      if (data.requiresOtp) {
        setOtpSent(true);
      } else {
        onAuthComplete('email_password');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      console.log('🔐 Verifying OTP');

      const response = await fetch(`${import.meta.env.VITE_AUTH_SERVICE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: credentials.email, otp }),
      });

      if (!response.ok) throw new Error('OTP verification failed');

      onAuthComplete('email_password');
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setProcessing(false);
    }
  };

  // ========================================
  // RENDER METHOD SELECTOR
  // ========================================
  if (methods.length > 1) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {methods.map((method) => {
            const Icon = methodIcons[method];
            return (
              <button
                key={method}
                onClick={() => setSelectedMethod(method)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedMethod === method
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {Icon && <Icon className={selectedMethod === method ? 'text-blue-600' : 'text-gray-600'} size={24} />}
                  <div>
                    <p className="font-semibold">{methodTitles[method]}</p>
                    <p className="text-sm text-gray-600">{methodDescriptions[method]}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-4 border-t">
          {renderAuthForm()}
        </div>
      </div>
    );
  }

  // Single method - render directly
  return <div>{renderAuthForm()}</div>;

  // ========================================
  // RENDER AUTH FORM BASED ON SELECTED METHOD
  // ========================================
  function renderAuthForm() {
    // Error display
    const ErrorBanner = error && (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
        <p className="text-red-800 text-sm">{error}</p>
      </div>
    );

    // PASSKEY AUTH
    if (selectedMethod === 'passkey') {
      return (
        <div>
          {ErrorBanner}
          <button
            onClick={handlePasskeyAuth}
            disabled={processing}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="animate-spin" size={20} />
                Authenticating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Key size={20} />
                Authenticate with Passkey
              </span>
            )}
          </button>
        </div>
      );
    }

    // OAUTH
    if (selectedMethod === 'oauth') {
      return (
        <div className="space-y-3">
          {ErrorBanner}
          <button
            onClick={() => handleOAuthLogin('google')}
            disabled={processing}
            className="w-full bg-white border-2 border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <FaGoogle className="text-red-600" size={20} />
            Continue with Google
          </button>
          <button
            onClick={() => handleOAuthLogin('facebook')}
            disabled={processing}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <FaFacebook size={20} />
            Continue with Facebook
          </button>
          <button
            onClick={() => handleOAuthLogin('twitter')}
            disabled={processing}
            className="w-full bg-sky-500 text-white py-3 rounded-lg font-semibold hover:bg-sky-600 transition flex items-center justify-center gap-2"
          >
            <FaTwitter size={20} />
            Continue with Twitter
          </button>
          <button
            onClick={() => handleOAuthLogin('linkedin')}
            disabled={processing}
            className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition flex items-center justify-center gap-2"
          >
            <FaLinkedin size={20} />
            Continue with LinkedIn
          </button>
        </div>
      );
    }

    // MAGIC LINK
    if (selectedMethod === 'magic_link') {
      if (magicLinkSent) {
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <Mail className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-bold text-green-900 mb-2">Check Your Email</h3>
            <p className="text-green-700 text-sm">
              We've sent a magic link to <strong>{email}</strong>
            </p>
            <p className="text-green-600 text-xs mt-2">
              Click the link in your email to continue voting
            </p>
          </div>
        );
      }

      return (
        <form onSubmit={handleMagicLink} className="space-y-4">
          {ErrorBanner}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={processing || !email}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="animate-spin" size={20} />
                Sending...
              </span>
            ) : (
              'Send Magic Link'
            )}
          </button>
        </form>
      );
    }

    // EMAIL & PASSWORD
    if (selectedMethod === 'email_password') {
      if (otpSent) {
        return (
          <form onSubmit={handleOtpVerify} className="space-y-4">
            {ErrorBanner}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
              />
              <p className="text-xs text-gray-600 mt-2 text-center">
                OTP sent to {credentials.email}
              </p>
            </div>
            <button
              type="submit"
              disabled={processing || otp.length !== 6}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {processing ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        );
      }

      return (
        <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
          {ErrorBanner}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              required
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={processing || !credentials.email || !credentials.password}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="animate-spin" size={20} />
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>
      );
    }

    return null;
  }
}