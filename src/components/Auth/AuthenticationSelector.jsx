import React, { useState, useEffect } from 'react';
import { Key, Mail, Lock, Loader, CheckCircle, AlertCircle, Bug, ArrowRight, Fingerprint } from 'lucide-react';
import { FaGoogle, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { useVerifyBiometricMutation } from '../../redux/api/auth/biometricApi';
//import { useVerifyBiometricMutation } from '../../redux/api/biometric/biometricApi';

const SHOW_BYPASS_BUTTON = true; // Set to false in production

export default function AuthenticationSelector({  electionId, onAuthComplete, sessionId }) {
  /*eslint-disable*/
  const [selectedMethod] = useState('passkey'); // Force passkey for demo
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [passkeySupported, setPasskeySupported] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [checkingSupport, setCheckingSupport] = useState(true);

  // RTK Query mutation
  const [verifyBiometric, { isLoading: verifyLoading }] = useVerifyBiometricMutation();

  // Check passkey support on mount
  useEffect(() => {
    checkPasskeySupport();
  }, []);

  const checkPasskeySupport = async () => {
    setCheckingSupport(true);
    try {
      if (window.PublicKeyCredential) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setPasskeySupported(available);
        console.log('🔐 Passkey Platform Authenticator:', available ? 'Available ✓' : 'Not available');
        console.log('🔐 But external security keys can still be used');
      } else {
        setPasskeySupported(false);
        console.log('🔐 WebAuthn not supported in this browser');
      }
    } catch (err) {
      console.error('Error checking passkey support:', err);
      setPasskeySupported(false);
    } finally {
      setCheckingSupport(false);
    }
  };

  // ========================================
  // HANDLE PASSKEY AUTH - With Proper Hardware Detection
  // ========================================
  const handlePasskeyAuth = async () => {
    setProcessing(true);
    setError(null);

    try {
      // Step 1: Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error('Your browser does not support biometric authentication.');
      }

      // Step 2: Check if platform authenticator (biometric/PIN) is available
      const platformAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      
      console.log('🔐 Platform authenticator available:', platformAvailable);

      if (!platformAvailable) {
        // No biometric hardware detected - show clear message
        const errorMsg = `❌ No Biometric Hardware Detected

Your device does not have:
• Fingerprint reader
• Face recognition camera
• Windows Hello PIN
• Touch ID

Passkey authentication requires biometric hardware.

For this demo, please use the orange "Bypass" button below.

In production, voters will use their phones or laptops with biometric capability.`;
        
        throw new Error(errorMsg);
      }

      console.log('🔐 Starting biometric authentication...');

      // Generate random values
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      
      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);

      // Create credential request
      const options = {
        challenge: challenge,
        rp: {
          name: "Vottery",
          id: window.location.hostname,
        },
        user: {
          id: userId,
          name: `vote-${electionId}-${Date.now()}`,
          displayName: "Voter",
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" },
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "discouraged",
        },
        timeout: 60000,
        attestation: "none",
      };

      console.log('🔐 Please verify with fingerprint, face, or PIN...');

      const credential = await navigator.credentials.create({
        publicKey: options
      });

      console.log('✅ Verification successful!');

      // Send to backend
      const result = await verifyBiometric({
        sessionId: sessionId || `election-${electionId}`,
        biometricData: {
          type: 'passkey',
          template: {
            id: credential.id,
            verified: true,
            timestamp: Date.now(),
          },
          qualityScore: 100,
        },
      }).unwrap();

      console.log('✅ Backend confirmed:', result);

      setAuthSuccess(true);
      setTimeout(() => onAuthComplete('passkey'), 1000);

    } catch (err) {
      console.error('❌ Authentication error:', err);
      
      let errorMessage = '';
      
      if (err.name === 'NotAllowedError') {
        // User cancelled OR no real biometric hardware (Chrome showed Google Password Manager)
        errorMessage = `❌ No Biometric Hardware Detected

Your device does not have:
• Fingerprint reader
• Face recognition camera  
• Windows Hello PIN
• Touch ID

Passkey authentication requires biometric hardware.

👉 Please use the orange "Bypass" button below to continue.

ℹ️ In production, voters will use phones or laptops with biometric capability.`;
      } else {
        errorMessage = err.message || 'Authentication failed. Please use bypass button.';
      }
      
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  // Helper function
  const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // ========================================
  // HANDLE BYPASS (Demo Mode)
  // ========================================
  const handleBypass = () => {
    console.log('🐛 Bypassing authentication (Demo Mode)');
    setAuthSuccess(true);
    setTimeout(() => {
      onAuthComplete('bypass');
    }, 500);
  };

  // ========================================
  // RENDER PASSKEY AUTH INTERFACE
  // ========================================
  if (authSuccess) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 rounded-xl p-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-3 animate-bounce" />
        <h3 className="text-2xl font-bold text-green-900 mb-2">Authentication Successful! ✓</h3>
        <p className="text-green-700">Proceeding to next step...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Demo Mode Banner */}
      {SHOW_BYPASS_BUTTON && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-400 p-4 rounded-r-lg shadow-sm">
          <div className="flex items-start gap-3">
            <Bug className="text-orange-600 flex-shrink-0 mt-0.5" size={22} />
            <div>
              <h3 className="text-sm font-bold text-orange-900 mb-1">🎭 Demo Mode Active</h3>
              <p className="text-xs text-orange-700">
                You can test the real passkey authentication or use the bypass button below for quick demo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Passkey Support Status */}
      {!checkingSupport && (
        <div className={`border-l-4 p-4 rounded-r-lg ${
          passkeySupported 
            ? 'bg-yellow-50 border-yellow-400' 
            : 'bg-red-50 border-red-400'
        }`}>
          <div className="flex items-start gap-3">
            {passkeySupported ? (
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            ) : (
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            )}
            <div>
              <h4 className="text-sm font-bold mb-1">
                {passkeySupported ? (
                  <span className="text-yellow-900">⚠️ Biometric May Not Be Available</span>
                ) : (
                  <span className="text-red-900">✗ No Biometric Hardware Detected</span>
                )}
              </h4>
              <p className="text-xs">
                {passkeySupported ? (
                  <span className="text-yellow-800">
                    If you don't have fingerprint/face recognition, authentication may fail.
                    <br />
                    <strong>Use the orange bypass button for demo if needed.</strong>
                  </span>
                ) : (
                  <span className="text-red-800">
                    This device has no fingerprint reader, face camera, or security key.
                    <br />
                    <strong>Use the orange bypass button below for demo.</strong>
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-sm font-bold text-red-900 mb-2">Authentication Not Available</h4>
              <p className="text-sm text-red-800 whitespace-pre-line">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Passkey Button */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8">
        <div className="text-center mb-6">
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Fingerprint className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Passkey Authentication</h2>
          <p className="text-gray-600 text-sm">
            {passkeySupported 
              ? 'Authenticate using your device biometrics' 
              : 'Authenticate using a security key or PIN'}
          </p>
        </div>

        <div className="space-y-3">
          {/* Primary Auth Button */}
          <button
            onClick={handlePasskeyAuth}
            disabled={processing || checkingSupport}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {processing ? (
              <span className="flex items-center justify-center gap-3">
                <Loader className="animate-spin" size={24} />
                <span>Authenticating...</span>
              </span>
            ) : checkingSupport ? (
              <span className="flex items-center justify-center gap-3">
                <Loader className="animate-spin" size={24} />
                <span>Checking device...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <Key size={24} />
                <span>Authenticate with Passkey</span>
              </span>
            )}
          </button>

          {/* Info Text */}
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>🔒 Your biometric data never leaves your device</p>
            <p className="text-gray-400">Uses WebAuthn standard for secure authentication</p>
          </div>
        </div>
      </div>

      {/* Bypass Button (Demo Only) */}
      {SHOW_BYPASS_BUTTON && (
        <div className="border-t-2 border-gray-200 pt-4">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-300">
            <div className="text-center mb-3">
              <Bug className="w-12 h-12 text-orange-600 mx-auto mb-2" />
              <h3 className="font-bold text-orange-900 text-sm">Demo Bypass Available</h3>
              <p className="text-xs text-orange-700 mt-1">
                Skip authentication for quick demo presentation
              </p>
            </div>
            <button
              onClick={handleBypass}
              disabled={processing}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Bug size={20} />
              <span>Skip Authentication (Demo Mode)</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600 space-y-2">
        <h4 className="font-semibold text-gray-900 mb-2">ℹ️ About Passkey Authentication:</h4>
        <ul className="space-y-1 ml-4 list-disc">
          <li><strong>Biometric:</strong> Use fingerprint, face ID, or device PIN</li>
          <li><strong>Security Keys:</strong> YubiKey, Google Titan, or other FIDO2 devices</li>
          <li><strong>No Passwords:</strong> More secure than traditional passwords</li>
          <li><strong>Privacy:</strong> Your biometric data never leaves your device</li>
        </ul>
        <div className="pt-2 border-t border-gray-200 mt-3">
          <p className="text-center italic">
            💡 For production, other methods (OAuth, Magic Link, Email/Password) will also be available
          </p>
        </div>
      </div>
    </div>
  );

  // ========================================
  // BELOW CODE IS FOR FUTURE IMPLEMENTATION
  // Currently showing only passkey for demo
  // ========================================

  // OAUTH
  /*eslint-disable*/
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

  // MAGIC LINK
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

  // EMAIL/PASSWORD AUTH
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
}
// import React, { useState, useEffect } from 'react';
// import { Key, Mail, Lock, Loader, CheckCircle, AlertCircle, Bug, ArrowRight, Fingerprint } from 'lucide-react';
// import { FaGoogle, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';

// const SHOW_BYPASS_BUTTON = true; // Set to false in production

// export default function AuthenticationSelector({ electionId, onAuthComplete }) {
//   /*eslint-disable*/
//   const [selectedMethod] = useState('passkey'); // Force passkey for demo
//   const [processing, setProcessing] = useState(false);
//   const [error, setError] = useState(null);
//   const [passkeySupported, setPasskeySupported] = useState(false);
//   const [authSuccess, setAuthSuccess] = useState(false);
//   const [checkingSupport, setCheckingSupport] = useState(true);

//   // Check passkey support on mount
//   useEffect(() => {
//     checkPasskeySupport();
//   }, []);

//   const checkPasskeySupport = async () => {
//     setCheckingSupport(true);
//     try {
//       if (window.PublicKeyCredential) {
//         const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
//         setPasskeySupported(available);
//         console.log('🔐 Passkey Platform Authenticator:', available ? 'Available ✓' : 'Not available');
//         console.log('🔐 But external security keys can still be used');
//       } else {
//         setPasskeySupported(false);
//         console.log('🔐 WebAuthn not supported in this browser');
//       }
//     } catch (err) {
//       console.error('Error checking passkey support:', err);
//       setPasskeySupported(false);
//     } finally {
//       setCheckingSupport(false);
//     }
//   };

//   // ========================================
//   // HANDLE PASSKEY AUTH - Real WebAuthn Implementation
//   // ========================================
//   const handlePasskeyAuth = async () => {
//     setProcessing(true);
//     setError(null);

//     try {
//       // Check if WebAuthn is supported
//       if (!window.PublicKeyCredential) {
//         throw new Error('Passkey authentication is not supported on this browser. Please use Chrome, Edge, or Safari.');
//       }

//       console.log('🔐 Starting passkey authentication...');

//       // Step 1: Get challenge from backend (simulated for demo)
//       const challenge = new Uint8Array(32);
//       window.crypto.getRandomValues(challenge);

//       // Step 2: Create credential options
//       const publicKeyCredentialCreationOptions = {
//         challenge: challenge,
//         rp: {
//           name: "Vottery Platform",
//           id: window.location.hostname,
//         },
//         user: {
//           id: new Uint8Array(16),
//           name: `user-${electionId}@vottery.com`,
//           displayName: "Vottery User",
//         },
//         pubKeyCredParams: [
//           { alg: -7, type: "public-key" },  // ES256
//           { alg: -257, type: "public-key" } // RS256
//         ],
//         authenticatorSelection: {
//           authenticatorAttachment: passkeySupported ? "platform" : "cross-platform",
//           userVerification: "preferred",
//           requireResidentKey: false,
//         },
//         timeout: 60000,
//         attestation: "none"
//       };

//       console.log('🔐 Requesting credential creation...');
//       console.log('🔐 Please authenticate using your device biometric or security key');

//       // Step 3: Create credential
//       const credential = await navigator.credentials.create({
//         publicKey: publicKeyCredentialCreationOptions
//       });

//       console.log('✅ Passkey authentication successful!', credential);

//       // Show success state
//       setAuthSuccess(true);

//       // Simulate backend verification
//       await new Promise(resolve => setTimeout(resolve, 1000));

//       // Call completion callback
//       onAuthComplete('passkey');

//     } catch (err) {
//       console.error('❌ Passkey authentication error:', err);
      
//       let errorMessage = 'Passkey authentication failed';
      
//       if (err.name === 'NotAllowedError') {
//         errorMessage = 'Authentication was cancelled. Please try again.';
//       } else if (err.name === 'InvalidStateError') {
//         errorMessage = 'This passkey is already registered. Please use a different device or the bypass button.';
//       } else if (err.name === 'NotSupportedError') {
//         errorMessage = 'Passkey not supported on this device. Please use the bypass button or try a different browser.';
//       } else if (err.message) {
//         errorMessage = err.message;
//       }
      
//       setError(errorMessage);
//     } finally {
//       setProcessing(false);
//     }
//   };

//   // ========================================
//   // HANDLE BYPASS (Demo Mode)
//   // ========================================
//   const handleBypass = () => {
//     console.log('🐛 Bypassing authentication (Demo Mode)');
//     setAuthSuccess(true);
//     setTimeout(() => {
//       onAuthComplete('bypass');
//     }, 500);
//   };

//   // ========================================
//   // RENDER PASSKEY AUTH INTERFACE
//   // ========================================
//   if (authSuccess) {
//     return (
//       <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 rounded-xl p-6 text-center">
//         <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-3 animate-bounce" />
//         <h3 className="text-2xl font-bold text-green-900 mb-2">Authentication Successful! ✓</h3>
//         <p className="text-green-700">Proceeding to next step...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {/* Demo Mode Banner */}
//       {SHOW_BYPASS_BUTTON && (
//         <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-400 p-4 rounded-r-lg shadow-sm">
//           <div className="flex items-start gap-3">
//             <Bug className="text-orange-600 flex-shrink-0 mt-0.5" size={22} />
//             <div>
//               <h3 className="text-sm font-bold text-orange-900 mb-1">🎭 Demo Mode Active</h3>
//               <p className="text-xs text-orange-700">
//                 You can test the real passkey authentication or use the bypass button below for quick demo.
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Passkey Support Status */}
//       {!checkingSupport && (
//         <div className={`border-l-4 p-4 rounded-r-lg ${
//           passkeySupported 
//             ? 'bg-blue-50 border-blue-400' 
//             : 'bg-yellow-50 border-yellow-400'
//         }`}>
//           <div className="flex items-start gap-3">
//             {passkeySupported ? (
//               <CheckCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
//             ) : (
//               <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
//             )}
//             <div>
//               <h4 className="text-sm font-bold mb-1">
//                 {passkeySupported ? (
//                   <span className="text-blue-900">✓ Biometric Available</span>
//                 ) : (
//                   <span className="text-yellow-900">⚠ Platform Biometric Not Available</span>
//                 )}
//               </h4>
//               <p className="text-xs">
//                 {passkeySupported ? (
//                   <span className="text-blue-800">
//                     You can use your device's fingerprint, face recognition, or PIN
//                   </span>
//                 ) : (
//                   <span className="text-yellow-800">
//                     Built-in biometric not detected, but you can use external security keys (YubiKey, etc.)
//                   </span>
//                 )}
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Error Display */}
//       {error && (
//         <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
//           <div className="flex items-start gap-3">
//             <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
//             <div>
//               <h4 className="text-sm font-bold text-red-900 mb-1">Authentication Failed</h4>
//               <p className="text-sm text-red-800">{error}</p>
//               <p className="text-xs text-red-700 mt-2">
//                 💡 Tip: Use the bypass button below to continue with demo
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Main Passkey Button */}
//       <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8">
//         <div className="text-center mb-6">
//           <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
//             <Fingerprint className="w-10 h-10 text-blue-600" />
//           </div>
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">Passkey Authentication</h2>
//           <p className="text-gray-600 text-sm">
//             {passkeySupported 
//               ? 'Authenticate using your device biometrics' 
//               : 'Authenticate using a security key or PIN'}
//           </p>
//         </div>

//         <div className="space-y-3">
//           {/* Primary Auth Button */}
//           <button
//             onClick={handlePasskeyAuth}
//             disabled={processing || checkingSupport}
//             className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//           >
//             {processing ? (
//               <span className="flex items-center justify-center gap-3">
//                 <Loader className="animate-spin" size={24} />
//                 <span>Authenticating...</span>
//               </span>
//             ) : checkingSupport ? (
//               <span className="flex items-center justify-center gap-3">
//                 <Loader className="animate-spin" size={24} />
//                 <span>Checking device...</span>
//               </span>
//             ) : (
//               <span className="flex items-center justify-center gap-3">
//                 <Key size={24} />
//                 <span>Authenticate with Passkey</span>
//               </span>
//             )}
//           </button>

//           {/* Info Text */}
//           <div className="text-center text-xs text-gray-500 space-y-1">
//             <p>🔒 Your biometric data never leaves your device</p>
//             <p className="text-gray-400">Uses WebAuthn standard for secure authentication</p>
//           </div>
//         </div>
//       </div>

//       {/* Bypass Button (Demo Only) */}
//       {SHOW_BYPASS_BUTTON && (
//         <div className="border-t-2 border-gray-200 pt-4">
//           <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-300">
//             <div className="text-center mb-3">
//               <Bug className="w-12 h-12 text-orange-600 mx-auto mb-2" />
//               <h3 className="font-bold text-orange-900 text-sm">Demo Bypass Available</h3>
//               <p className="text-xs text-orange-700 mt-1">
//                 Skip authentication for quick demo presentation
//               </p>
//             </div>
//             <button
//               onClick={handleBypass}
//               disabled={processing}
//               className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center gap-2"
//             >
//               <Bug size={20} />
//               <span>Skip Authentication (Demo Mode)</span>
//               <ArrowRight size={20} />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Additional Info */}
//       <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600 space-y-2">
//         <h4 className="font-semibold text-gray-900 mb-2">ℹ️ About Passkey Authentication:</h4>
//         <ul className="space-y-1 ml-4 list-disc">
//           <li><strong>Biometric:</strong> Use fingerprint, face ID, or device PIN</li>
//           <li><strong>Security Keys:</strong> YubiKey, Google Titan, or other FIDO2 devices</li>
//           <li><strong>No Passwords:</strong> More secure than traditional passwords</li>
//           <li><strong>Privacy:</strong> Your biometric data never leaves your device</li>
//         </ul>
//         <div className="pt-2 border-t border-gray-200 mt-3">
//           <p className="text-center italic">
//             💡 For production, other methods (OAuth, Magic Link, Email/Password) will also be available
//           </p>
//         </div>
//       </div>
//     </div>
//   );

//   // ========================================
//   // BELOW CODE IS FOR FUTURE IMPLEMENTATION
//   // Currently showing only passkey for demo
//   // ========================================

//   // OAUTH
//   /*eslint-disable*/
//   const handleOAuthLogin = async (provider) => {
//     setProcessing(true);
//     setError(null);

//     try {
//       console.log(`🔐 OAuth login with ${provider}`);
      
//       // Redirect to OAuth provider
//       const redirectUrl = `${import.meta.env.VITE_AUTH_SERVICE_URL}/auth/oauth/${provider}?electionId=${electionId}`;
//       window.location.href = redirectUrl;

//     } catch (err) {
//       setError(err.message || 'OAuth login failed');
//       setProcessing(false);
//     }
//   };

//   // MAGIC LINK
//   const [email, setEmail] = useState('');
//   const [magicLinkSent, setMagicLinkSent] = useState(false);

//   const handleMagicLink = async (e) => {
//     e.preventDefault();
//     setProcessing(true);
//     setError(null);

//     try {
//       console.log('📧 Sending magic link to:', email);

//       // Call your auth service
//       const response = await fetch(`${import.meta.env.VITE_AUTH_SERVICE_URL}/auth/magic-link`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, electionId }),
//       });

//       if (!response.ok) throw new Error('Failed to send magic link');

//       setMagicLinkSent(true);
//     } catch (err) {
//       setError(err.message || 'Failed to send magic link');
//     } finally {
//       setProcessing(false);
//     }
//   };

//   // EMAIL/PASSWORD AUTH
//   const [credentials, setCredentials] = useState({ email: '', password: '' });
//   const [otpSent, setOtpSent] = useState(false);
//   const [otp, setOtp] = useState('');

//   const handleEmailPasswordLogin = async (e) => {
//     e.preventDefault();
//     setProcessing(true);
//     setError(null);

//     try {
//       console.log('🔐 Email/password login');

//       // Call your auth service
//       const response = await fetch(`${import.meta.env.VITE_AUTH_SERVICE_URL}/auth/login`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ ...credentials, electionId }),
//       });

//       if (!response.ok) throw new Error('Login failed');

//       const data = await response.json();

//       if (data.requiresOtp) {
//         setOtpSent(true);
//       } else {
//         onAuthComplete('email_password');
//       }
//     } catch (err) {
//       setError(err.message || 'Login failed');
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleOtpVerify = async (e) => {
//     e.preventDefault();
//     setProcessing(true);
//     setError(null);

//     try {
//       console.log('🔐 Verifying OTP');

//       const response = await fetch(`${import.meta.env.VITE_AUTH_SERVICE_URL}/auth/verify-otp`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email: credentials.email, otp }),
//       });

//       if (!response.ok) throw new Error('OTP verification failed');

//       onAuthComplete('email_password');
//     } catch (err) {
//       setError(err.message || 'OTP verification failed');
//     } finally {
//       setProcessing(false);
//     }
//   };
// }

// import React, { useState } from 'react';
// import { Key, Mail, Lock, Loader } from 'lucide-react';
// import { FaGoogle, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';

// export default function AuthenticationSelector({ methods, electionId, onAuthComplete }) {
//   const [selectedMethod, setSelectedMethod] = useState(methods[0] || 'passkey');
//   const [processing, setProcessing] = useState(false);
//   const [error, setError] = useState(null);


//   const methodIcons = {
//     passkey: Key,
//     oauth: FaGoogle,
//     magic_link: Mail,
//     email_password: Lock,
//   };

//   const methodTitles = {
//     passkey: 'Passkey Authentication',
//     oauth: 'Social Login',
//     magic_link: 'Magic Link',
//     email_password: 'Email & Password',
//   };

//   const methodDescriptions = {
//     passkey: 'Use your device biometrics or security key',
//     oauth: 'Sign in with Google, Facebook, Twitter, or LinkedIn',
//     magic_link: 'Get a one-time login link via email',
//     email_password: 'Traditional email and password with 2FA',
//   };

//   // ========================================
//   // HANDLE PASSKEY AUTH
//   // ========================================
//   const handlePasskeyAuth = async () => {
//     setProcessing(true);
//     setError(null);

//     try {
//       // Check if WebAuthn is supported
//       if (!window.PublicKeyCredential) {
//         throw new Error('Passkey authentication is not supported on this device');
//       }

//       // In production, you would call your backend to get challenge
//       // For now, we'll simulate success
//       console.log('🔐 Passkey authentication initiated');
      
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 1500));

//       onAuthComplete('passkey');
//     } catch (err) {
//       setError(err.message || 'Passkey authentication failed');
//     } finally {
//       setProcessing(false);
//     }
//   };

//   // ========================================
//   // HANDLE OAUTH
//   // ========================================
//   const handleOAuthLogin = async (provider) => {
//     setProcessing(true);
//     setError(null);

//     try {
//       console.log(`🔐 OAuth login with ${provider}`);
      
//       // Redirect to OAuth provider
//       const redirectUrl = `${import.meta.env.VITE_AUTH_SERVICE_URL}/auth/oauth/${provider}?electionId=${electionId}`;
//       window.location.href = redirectUrl;

//     } catch (err) {
//       setError(err.message || 'OAuth login failed');
//       setProcessing(false);
//     }
//   };

//   // ========================================
//   // HANDLE MAGIC LINK
//   // ========================================
//   const [email, setEmail] = useState('');
//   const [magicLinkSent, setMagicLinkSent] = useState(false);

//   const handleMagicLink = async (e) => {
//     e.preventDefault();
//     setProcessing(true);
//     setError(null);

//     try {
//       console.log('📧 Sending magic link to:', email);

//       // Call your auth service
//       const response = await fetch(`${import.meta.env.VITE_AUTH_SERVICE_URL}/auth/magic-link`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, electionId }),
//       });

//       if (!response.ok) throw new Error('Failed to send magic link');

//       setMagicLinkSent(true);
//     } catch (err) {
//       setError(err.message || 'Failed to send magic link');
//     } finally {
//       setProcessing(false);
//     }
//   };

//   // ========================================
//   // HANDLE EMAIL/PASSWORD AUTH
//   // ========================================
//   const [credentials, setCredentials] = useState({ email: '', password: '' });
//   const [otpSent, setOtpSent] = useState(false);
//   const [otp, setOtp] = useState('');

//   const handleEmailPasswordLogin = async (e) => {
//     e.preventDefault();
//     setProcessing(true);
//     setError(null);

//     try {
//       console.log('🔐 Email/password login');

//       // Call your auth service
//       const response = await fetch(`${import.meta.env.VITE_AUTH_SERVICE_URL}/auth/login`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ ...credentials, electionId }),
//       });

//       if (!response.ok) throw new Error('Login failed');

//       const data = await response.json();

//       if (data.requiresOtp) {
//         setOtpSent(true);
//       } else {
//         onAuthComplete('email_password');
//       }
//     } catch (err) {
//       setError(err.message || 'Login failed');
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleOtpVerify = async (e) => {
//     e.preventDefault();
//     setProcessing(true);
//     setError(null);

//     try {
//       console.log('🔐 Verifying OTP');

//       const response = await fetch(`${import.meta.env.VITE_AUTH_SERVICE_URL}/auth/verify-otp`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email: credentials.email, otp }),
//       });

//       if (!response.ok) throw new Error('OTP verification failed');

//       onAuthComplete('email_password');
//     } catch (err) {
//       setError(err.message || 'OTP verification failed');
//     } finally {
//       setProcessing(false);
//     }
//   };

//   // ========================================
//   // RENDER METHOD SELECTOR
//   // ========================================
//   if (methods.length > 1) {
//     return (
//       <div className="space-y-4">
//         <div className="grid grid-cols-1 gap-3">
//           {methods.map((method) => {
//             const Icon = methodIcons[method];
//             return (
//               <button
//                 key={method}
//                 onClick={() => setSelectedMethod(method)}
//                 className={`p-4 rounded-lg border-2 transition-all text-left ${
//                   selectedMethod === method
//                     ? 'border-blue-600 bg-blue-50'
//                     : 'border-gray-200 hover:border-blue-300'
//                 }`}
//               >
//                 <div className="flex items-center gap-3">
//                   {Icon && <Icon className={selectedMethod === method ? 'text-blue-600' : 'text-gray-600'} size={24} />}
//                   <div>
//                     <p className="font-semibold">{methodTitles[method]}</p>
//                     <p className="text-sm text-gray-600">{methodDescriptions[method]}</p>
//                   </div>
//                 </div>
//               </button>
//             );
//           })}
//         </div>

//         <div className="pt-4 border-t">
//           {renderAuthForm()}
//         </div>
//       </div>
//     );
//   }

//   // Single method - render directly
//   return <div>{renderAuthForm()}</div>;

//   // ========================================
//   // RENDER AUTH FORM BASED ON SELECTED METHOD
//   // ========================================
//   function renderAuthForm() {
//     // Error display
//     const ErrorBanner = error && (
//       <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
//         <p className="text-red-800 text-sm">{error}</p>
//       </div>
//     );

//     // PASSKEY AUTH
//     if (selectedMethod === 'passkey') {
//       return (
//         <div>
//           {ErrorBanner}
//           <button
//             onClick={handlePasskeyAuth}
//             disabled={processing}
//             className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
//           >
//             {processing ? (
//               <span className="flex items-center justify-center gap-2">
//                 <Loader className="animate-spin" size={20} />
//                 Authenticating...
//               </span>
//             ) : (
//               <span className="flex items-center justify-center gap-2">
//                 <Key size={20} />
//                 Authenticate with Passkey
//               </span>
//             )}
//           </button>
//         </div>
//       );
//     }

//     // OAUTH
//     if (selectedMethod === 'oauth') {
//       return (
//         <div className="space-y-3">
//           {ErrorBanner}
//           <button
//             onClick={() => handleOAuthLogin('google')}
//             disabled={processing}
//             className="w-full bg-white border-2 border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
//           >
//             <FaGoogle className="text-red-600" size={20} />
//             Continue with Google
//           </button>
//           <button
//             onClick={() => handleOAuthLogin('facebook')}
//             disabled={processing}
//             className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
//           >
//             <FaFacebook size={20} />
//             Continue with Facebook
//           </button>
//           <button
//             onClick={() => handleOAuthLogin('twitter')}
//             disabled={processing}
//             className="w-full bg-sky-500 text-white py-3 rounded-lg font-semibold hover:bg-sky-600 transition flex items-center justify-center gap-2"
//           >
//             <FaTwitter size={20} />
//             Continue with Twitter
//           </button>
//           <button
//             onClick={() => handleOAuthLogin('linkedin')}
//             disabled={processing}
//             className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition flex items-center justify-center gap-2"
//           >
//             <FaLinkedin size={20} />
//             Continue with LinkedIn
//           </button>
//         </div>
//       );
//     }

//     // MAGIC LINK
//     if (selectedMethod === 'magic_link') {
//       if (magicLinkSent) {
//         return (
//           <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
//             <Mail className="w-12 h-12 text-green-600 mx-auto mb-3" />
//             <h3 className="font-bold text-green-900 mb-2">Check Your Email</h3>
//             <p className="text-green-700 text-sm">
//               We've sent a magic link to <strong>{email}</strong>
//             </p>
//             <p className="text-green-600 text-xs mt-2">
//               Click the link in your email to continue voting
//             </p>
//           </div>
//         );
//       }

//       return (
//         <form onSubmit={handleMagicLink} className="space-y-4">
//           {ErrorBanner}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               placeholder="your.email@example.com"
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
//           <button
//             type="submit"
//             disabled={processing || !email}
//             className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
//           >
//             {processing ? (
//               <span className="flex items-center justify-center gap-2">
//                 <Loader className="animate-spin" size={20} />
//                 Sending...
//               </span>
//             ) : (
//               'Send Magic Link'
//             )}
//           </button>
//         </form>
//       );
//     }

//     // EMAIL & PASSWORD
//     if (selectedMethod === 'email_password') {
//       if (otpSent) {
//         return (
//           <form onSubmit={handleOtpVerify} className="space-y-4">
//             {ErrorBanner}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
//               <input
//                 type="text"
//                 value={otp}
//                 onChange={(e) => setOtp(e.target.value)}
//                 required
//                 placeholder="000000"
//                 maxLength={6}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
//               />
//               <p className="text-xs text-gray-600 mt-2 text-center">
//                 OTP sent to {credentials.email}
//               </p>
//             </div>
//             <button
//               type="submit"
//               disabled={processing || otp.length !== 6}
//               className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
//             >
//               {processing ? 'Verifying...' : 'Verify OTP'}
//             </button>
//           </form>
//         );
//       }

//       return (
//         <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
//           {ErrorBanner}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
//             <input
//               type="email"
//               value={credentials.email}
//               onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
//               required
//               placeholder="your.email@example.com"
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
//             <input
//               type="password"
//               value={credentials.password}
//               onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
//               required
//               placeholder="••••••••"
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
//           <button
//             type="submit"
//             disabled={processing || !credentials.email || !credentials.password}
//             className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
//           >
//             {processing ? (
//               <span className="flex items-center justify-center gap-2">
//                 <Loader className="animate-spin" size={20} />
//                 Logging in...
//               </span>
//             ) : (
//               'Login'
//             )}
//           </button>
//         </form>
//       );
//     }

//     return null;
//   }
// }