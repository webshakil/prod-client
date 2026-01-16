// src/components/voting/ElectionAccessGuard.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
/*eslint-disable*/
import { useSelector } from 'react-redux';
import { useGetBallotQuery } from '../../redux/api/voting/votingApi';
import { useCheckElectionPaymentStatusQuery } from '../../redux/api/walllet/electionPaymentApi';
import { Loader, Shield, Video, AlertCircle, Gift, CheckCircle, ArrowLeft, Smartphone, Monitor, Fingerprint, X } from 'lucide-react';

import ElectionVotingView from '../../pages/election/ElectionVotingView';
import ElectionPaymentPage from '../../pages/voting/payment/ElectionPaymentPage';
import AuthenticationSelector from '../Auth/AuthenticationSelector';
import VideoWatchProgress from '../Dashboard/Tabs/voting/VideoWatchProgress';

// ============================================
// NEW: UTILITY - Check if device supports biometrics
// ============================================
const checkBiometricSupport = async () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  let hasBiometricCapability = false;
  if (window.PublicKeyCredential) {
    try {
      hasBiometricCapability = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch (e) {
      console.log('Biometric check error:', e);
      hasBiometricCapability = false;
    }
  }
  return { isMobile, hasBiometricCapability, canUseBiometrics: isMobile && hasBiometricCapability };
};

export default function ElectionAccessGuard() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  
  // CHANGED: Start at step 0 for biometric check (was 1 before)
  const [currentStep, setCurrentStep] = useState(0);
  
  // NEW: Device check state
  const [deviceCheck, setDeviceCheck] = useState({
    isChecking: true,
    isMobile: false,
    hasBiometricCapability: false,
    canUseBiometrics: false
  });

  // NEW: Check device biometric capability on mount
  useEffect(() => {
    const checkDevice = async () => {
      const result = await checkBiometricSupport();
      setDeviceCheck({ isChecking: false, ...result });
    };
    checkDevice();
  }, []);

  // ✅ FIXED: Added refetchOnMountOrArgChange to prevent caching issues
  const { data: ballotData, isLoading: ballotLoading, error: ballotError } = useGetBallotQuery(electionId, {
    refetchOnMountOrArgChange: true,
  });
  
  const { data: paymentStatus } = useCheckElectionPaymentStatusQuery(electionId, {
    skip: !ballotData?.paymentRequired,
    refetchOnMountOrArgChange: true,
  });

  // ✅ DEBUG: Log ballot data to help troubleshoot
  console.log('🗳️ ElectionAccessGuard - ballotData:', {
    electionId,
    hasVoted: ballotData?.hasVoted,
    // Check all possible biometric field names
    'election.biometricRequired': ballotData?.election?.biometricRequired,
    'election.biometric_required': ballotData?.election?.biometric_required,
    'election.is_biometric_required': ballotData?.election?.is_biometric_required,
    'ballotData.biometricRequired': ballotData?.biometricRequired,
    'ballotData.biometric_required': ballotData?.biometric_required,
    isLoading: ballotLoading,
    error: ballotError,
    deviceCheck,
  });

  // CHANGED: Added deviceCheck.isChecking to loading condition
  if (ballotLoading || deviceCheck.isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600 font-medium">
            {deviceCheck.isChecking ? 'Checking device capabilities...' : 'Loading election...'}
          </p>
        </div>
      </div>
    );
  }

  if (ballotError || !ballotData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-800 font-bold text-center mb-2">Error Loading Election</p>
          <button
            onClick={() => navigate('/elections')}
            className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
          >
            Back to Elections
          </button>
        </div>
      </div>
    );
  }

  // ✅ CHECK hasVoted FIRST - before any steps (ONLY place this check should happen)
  if (ballotData?.hasVoted === true) {
    console.log('🚫 User has already voted - showing already voted screen');
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
        <div className="max-w-4xl mx-auto pb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
          >
            <ArrowLeft size={20} />
            Go to Dashboard
          </button>
        </div>

        <div className="max-w-2xl mx-auto py-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">You Have Already Voted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for participating in this election. Your vote has been recorded.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">{ballotData.election?.title}</h3>
              <p className="text-sm text-gray-600">{ballotData.election?.description}</p>
            </div>

            {ballotData?.lotteryEnabled && (
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-lg p-4 mb-6">
                <p className="text-purple-800 font-semibold mb-2">🎰 Lottery Entry Confirmed!</p>
                <p className="text-purple-700 text-sm">
                  You're entered in the lottery draw. Winners will be notified after the election ends.
                </p>
              </div>
            )}
            
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // NEW: Check if biometric is required - the field is biometric_required (snake_case) inside election
  const isBiometricRequired = 
    ballotData?.election?.biometric_required === true || 
    ballotData?.election?.biometricRequired === true ||
    ballotData?.biometric_required === true ||
    ballotData?.biometricRequired === true;
  
  // DEBUG: Log biometric check result
  console.log('🔐 Biometric Check:', {
    'ballotData.election.biometric_required': ballotData?.election?.biometric_required,
    'ballotData.election (full object)': ballotData?.election,
    'isBiometricRequired result': isBiometricRequired,
    'deviceCheck.canUseBiometrics': deviceCheck.canUseBiometrics,
  });

  const isFree = !ballotData.paymentRequired;
  const hasPaid = paymentStatus?.paid;
  const videoCompleted = ballotData.videoProgress?.completed;

  // CHANGED: Progress indicator - added Step 0 for biometric check
  const StepIndicator = () => (
    <div className="bg-white shadow-sm py-4 mb-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-center gap-4">
          {/* NEW: Step 0 - Device Check */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              currentStep === 0 ? 'bg-blue-600 text-white' : 
              currentStep > 0 ? 'bg-green-600 text-white' : 'bg-gray-300'
            }`}>
              {currentStep > 0 ? '✓' : '0'}
            </div>
            <span className={currentStep === 0 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Device</span>
          </div>

          <div className="w-16 h-1 bg-gray-200"></div>

          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              currentStep === 1 ? 'bg-blue-600 text-white' : 
              currentStep > 1 ? 'bg-green-600 text-white' : 'bg-gray-300'
            }`}>
              {currentStep > 1 ? '✓' : '1'}
            </div>
            <span className={currentStep === 1 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Payment</span>
          </div>

          <div className="w-16 h-1 bg-gray-200"></div>

          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              currentStep === 2 ? 'bg-blue-600 text-white' : 
              currentStep > 2 ? 'bg-green-600 text-white' : 'bg-gray-300'
            }`}>
              {currentStep > 2 ? '✓' : '2'}
            </div>
            <span className={currentStep === 2 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Authentication</span>
          </div>

          <div className="w-16 h-1 bg-gray-200"></div>

          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              currentStep === 3 ? 'bg-blue-600 text-white' : 
              currentStep > 3 ? 'bg-green-600 text-white' : 'bg-gray-300'
            }`}>
              {currentStep > 3 ? '✓' : '3'}
            </div>
            <span className={currentStep === 3 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Video</span>
          </div>

          <div className="w-16 h-1 bg-gray-200"></div>

          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              currentStep === 4 ? 'bg-blue-600 text-white' : 'bg-gray-300'
            }`}>
              4
            </div>
            <span className={currentStep === 4 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Vote</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================
  // NEW: STEP 0: BIOMETRIC DEVICE CHECK - FIRST STEP
  // ============================================
  if (currentStep === 0) {
    // Case 1: Biometric IS required but device doesn't support it - BLOCK USER
    if (isBiometricRequired && !deviceCheck.canUseBiometrics) {
      return (
        <div className="min-h-screen bg-gray-50">
          <StepIndicator />
          <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-400 rounded-2xl p-8 text-center shadow-xl">
              <div className="relative inline-block mb-4">
                <Monitor className="w-20 h-20 text-red-400 mx-auto" />
                <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1">
                  <X className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-red-900 mb-3">
                🚫 Biometric Verification Required
              </h2>
              
              <p className="text-lg text-red-700 mb-4">
                This election requires biometric verification (fingerprint or face recognition).
              </p>
              
              <div className="bg-white rounded-lg p-4 my-6 text-left">
                <div className="flex items-start gap-3 mb-3">
                  <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Your device cannot be used</p>
                    <p className="text-sm text-gray-600">
                      {!deviceCheck.isMobile 
                        ? "Desktop and laptop computers typically don't have biometric sensors."
                        : "Your mobile device doesn't support biometric authentication."}
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-3 mt-3">
                  <p className="text-sm text-gray-700 font-medium mb-2">To vote in this election, please:</p>
                  <ol className="text-sm text-gray-600 space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                      <span>Download the <strong>Vottery Mobile App</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                      <span>Use a smartphone with fingerprint or face recognition</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                      <span>Complete the voting process on your mobile device</span>
                    </li>
                  </ol>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <a
                  href="https://play.google.com/store/apps/details?id=com.vottery"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2"
                >
                  <Smartphone size={20} />
                  Get Android App
                </a>
                <a
                  href="https://apps.apple.com/app/vottery"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2"
                >
                  <Smartphone size={20} />
                  Get iOS App
                </a>
              </div>

              <button
                onClick={() => navigate('/elections')}
                className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold transition"
              >
                ← Back to Elections
              </button>
            </div>

            {/* Election Info */}
            <div className="mt-6 bg-white rounded-lg p-4 shadow">
              <h3 className="font-semibold text-gray-900 mb-2">{ballotData.election?.title}</h3>
              <p className="text-sm text-gray-600">{ballotData.election?.description}</p>
              <div className="mt-3 flex items-center gap-2 text-sm text-orange-600">
                <Fingerprint size={16} />
                <span>Biometric verification enabled</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Case 2: Biometric NOT required - Allow any device
    if (!isBiometricRequired) {
      return (
        <div className="min-h-screen bg-gray-50">
          <StepIndicator />
          <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-500 rounded-2xl p-8 text-center shadow-xl">
              <div className="relative inline-block mb-4">
                <Monitor className="w-20 h-20 text-green-600 mx-auto" />
                <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-green-900 mb-3">
                ✓ Device Compatible
              </h2>
              
              <p className="text-lg text-green-700 mb-2">
                This election does <strong>not</strong> require biometric verification.
              </p>
              
              <p className="text-green-600 mb-6">
                You can vote from any device - desktop, laptop, tablet, or mobile.
              </p>

              <div className="bg-white rounded-lg p-4 my-6 inline-block">
                <div className="flex items-center gap-3 text-gray-700">
                  {deviceCheck.isMobile ? (
                    <>
                      <Smartphone className="w-8 h-8 text-green-600" />
                      <span>Voting from: <strong>Mobile Device</strong></span>
                    </>
                  ) : (
                    <>
                      <Monitor className="w-8 h-8 text-green-600" />
                      <span>Voting from: <strong>Desktop/Laptop</strong></span>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={() => setCurrentStep(1)}
                className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Continue to Payment →
              </button>
            </div>

            {/* Election Info */}
            <div className="mt-6 bg-white rounded-lg p-4 shadow">
              <h3 className="font-semibold text-gray-900 mb-2">{ballotData.election?.title}</h3>
              <p className="text-sm text-gray-600">{ballotData.election?.description}</p>
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <Shield size={16} />
                <span>Standard authentication required</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Case 3: Biometric IS required AND device supports it - Allow to proceed
    if (isBiometricRequired && deviceCheck.canUseBiometrics) {
      return (
        <div className="min-h-screen bg-gray-50">
          <StepIndicator />
          <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-500 rounded-2xl p-8 text-center shadow-xl">
              <div className="relative inline-block mb-4">
                <Fingerprint className="w-20 h-20 text-blue-600 mx-auto animate-pulse" />
                <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-blue-900 mb-3">
                ✓ Biometric Device Detected
              </h2>
              
              <p className="text-lg text-blue-700 mb-2">
                This election requires biometric verification.
              </p>
              
              <p className="text-blue-600 mb-6">
                Your device supports biometric authentication. You're all set to continue!
              </p>

              <div className="bg-white rounded-lg p-4 my-6 inline-block">
                <div className="flex items-center gap-3 text-gray-700">
                  <Smartphone className="w-8 h-8 text-blue-600" />
                  <div className="text-left">
                    <p className="font-semibold">Mobile Device Ready</p>
                    <p className="text-sm text-gray-500">Fingerprint/Face ID available</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCurrentStep(1)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Continue to Payment →
              </button>
            </div>

            {/* Election Info */}
            <div className="mt-6 bg-white rounded-lg p-4 shadow">
              <h3 className="font-semibold text-gray-900 mb-2">{ballotData.election?.title}</h3>
              <p className="text-sm text-gray-600">{ballotData.election?.description}</p>
              <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                <Fingerprint size={16} />
                <span>Biometric verification enabled</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // ============================================
  // STEP 1: PAYMENT - UNCHANGED FROM ORIGINAL
  // ============================================
  if (currentStep === 1) {
    // Case 1: Election is FREE
    if (isFree) {
      return (
        <div className="min-h-screen bg-gray-50">
          <StepIndicator />
          <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-8 text-center shadow-xl">
              <Gift className="w-20 h-20 text-green-600 mx-auto mb-4 animate-bounce" />
              <h2 className="text-3xl font-bold text-green-900 mb-3">
                🎉 This Election is FREE!
              </h2>
              <p className="text-lg text-green-700 mb-2">
                No payment required to participate in this election.
              </p>
              <p className="text-green-600 mb-8">
                You can proceed directly to the next step.
              </p>
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Continue to Authentication →
              </button>
            </div>

            {/* Election Info */}
            <div className="mt-6 bg-white rounded-lg p-4 shadow">
              <h3 className="font-semibold text-gray-900 mb-2">{ballotData.election.title}</h3>
              <p className="text-sm text-gray-600">{ballotData.election.description}</p>
            </div>
          </div>
        </div>
      );
    }

    // Case 2: Already Paid
    if (hasPaid) {
      return (
        <div className="min-h-screen bg-gray-50">
          <StepIndicator />
          <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-500 rounded-2xl p-8 text-center shadow-xl">
              <CheckCircle className="w-20 h-20 text-blue-600 mx-auto mb-4 animate-pulse" />
              <h2 className="text-3xl font-bold text-blue-900 mb-3">
                ✓ Payment Completed!
              </h2>
              <p className="text-lg text-blue-700 mb-2">
                You have already paid the participation fee for this election.
              </p>
              <div className="bg-white rounded-lg p-4 my-6 inline-block">
                <p className="text-sm text-gray-600">Amount Paid</p>
                <p className="text-3xl font-bold text-blue-600">
                  ${ballotData.participationFee.toFixed(2)}
                </p>
              </div>
              <p className="text-blue-600 mb-8">
                You can proceed to the next step.
              </p>
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Continue to Authentication →
              </button>
            </div>

            {/* Election Info */}
            <div className="mt-6 bg-white rounded-lg p-4 shadow">
              <h3 className="font-semibold text-gray-900 mb-2">{ballotData.election.title}</h3>
              <p className="text-sm text-gray-600">{ballotData.election.description}</p>
            </div>
          </div>
        </div>
      );
    }

    // Case 3: Need to Pay
    return (
      <div className="min-h-screen bg-gray-50">
        <StepIndicator />
        <ElectionPaymentPage
          electionId={electionId}
          amount={ballotData.participationFee}
          currency="USD"
          onPaymentComplete={() => setCurrentStep(2)}
          electionTitle={ballotData.election?.title}
        />
      </div>
    );
  }

  // ============================================
  // STEP 2: AUTHENTICATION - UNCHANGED FROM ORIGINAL
  // ============================================
  if (currentStep === 2) {
    const authMethods = ballotData.election?.authentication_methods || ['passkey'];

    return (
      <div className="min-h-screen bg-gray-50">
        <StepIndicator />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <AuthenticationSelector 
            methods={authMethods} 
            electionId={electionId}
            sessionId={`election-${electionId}`}
            onAuthComplete={() => setCurrentStep(3)} 
          />
        </div>
      </div>
    );
  }

  // ============================================
  // STEP 3: VIDEO - UNCHANGED FROM ORIGINAL
  // ============================================
  if (currentStep === 3) {
    // Case 1: Video Already Completed
    if (videoCompleted) {
      return (
        <div className="min-h-screen bg-gray-50">
          <StepIndicator />
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-500 rounded-2xl p-8 text-center shadow-xl">
              <CheckCircle className="w-20 h-20 text-purple-600 mx-auto mb-4 animate-bounce" />
              <h2 className="text-3xl font-bold text-purple-900 mb-3">
                ✓ Video Already Watched!
              </h2>
              <p className="text-lg text-purple-700 mb-2">
                You have already completed the video requirement for this election.
              </p>
              <div className="bg-white rounded-lg p-4 my-6 inline-block">
                <p className="text-sm text-gray-600">Watch Progress</p>
                <p className="text-3xl font-bold text-purple-600">
                  {ballotData.videoProgress.watch_percentage}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Required: {ballotData.minimumWatchPercentage}%
                </p>
              </div>
              <p className="text-purple-600 mb-8">
                You can proceed directly to voting.
              </p>
              <button
                onClick={() => setCurrentStep(4)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Continue to Voting →
              </button>
            </div>

            {/* Video Info */}
            <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <h4 className="text-blue-900 font-bold mb-2 text-sm">ℹ️ About the Video</h4>
              <p className="text-blue-800 text-xs">
                You previously watched {ballotData.videoProgress.watch_percentage}% of the required video. 
                Since you met the minimum requirement of {ballotData.minimumWatchPercentage}%, you can proceed directly to voting.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Case 2: Need to Watch Video
    return (
      <div className="min-h-screen bg-gray-50">
        <StepIndicator />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <VideoWatchProgress
            electionId={electionId}
            videoUrl={ballotData.election?.videoUrl || ballotData.election?.topic_video_url}
            minimumWatchPercentage={ballotData.minimumWatchPercentage}
            required={ballotData.videoWatchRequired}
            onComplete={() => setCurrentStep(4)}
          />
        </div>
      </div>
    );
  }

  // ============================================
  // STEP 4: VOTING - UNCHANGED FROM ORIGINAL
  // ============================================
  if (currentStep === 4) {
    return <ElectionVotingView />;
  }

  return null;
}

//last workable code only to active biometirc above code
// // src/components/voting/ElectionAccessGuard.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// /*eslint-disable*/
// import { useSelector } from 'react-redux';
// import { useGetBallotQuery } from '../../redux/api/voting/votingApi';
// import { useCheckElectionPaymentStatusQuery } from '../../redux/api/walllet/electionPaymentApi';
// import { Loader, Shield, Video, AlertCircle, Gift, CheckCircle, ArrowLeft, Smartphone, Monitor, Fingerprint, X } from 'lucide-react';

// import ElectionVotingView from '../../pages/election/ElectionVotingView';
// import ElectionPaymentPage from '../../pages/voting/payment/ElectionPaymentPage';
// import AuthenticationSelector from '../Auth/AuthenticationSelector';
// import VideoWatchProgress from '../Dashboard/Tabs/voting/VideoWatchProgress';

// // ============================================
// // NEW: UTILITY - Check if device supports biometrics
// // ============================================
// const checkBiometricSupport = async () => {
//   const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
//   let hasBiometricCapability = false;
//   if (window.PublicKeyCredential) {
//     try {
//       hasBiometricCapability = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
//     } catch (e) {
//       console.log('Biometric check error:', e);
//       hasBiometricCapability = false;
//     }
//   }
//   return { isMobile, hasBiometricCapability, canUseBiometrics: isMobile && hasBiometricCapability };
// };

// export default function ElectionAccessGuard() {
//   const { electionId } = useParams();
//   const navigate = useNavigate();
  
//   // CHANGED: Start at step 0 for biometric check (was 1 before)
//   const [currentStep, setCurrentStep] = useState(0);
  
//   // NEW: Device check state
//   const [deviceCheck, setDeviceCheck] = useState({
//     isChecking: true,
//     isMobile: false,
//     hasBiometricCapability: false,
//     canUseBiometrics: false
//   });

//   // NEW: Check device biometric capability on mount
//   useEffect(() => {
//     const checkDevice = async () => {
//       const result = await checkBiometricSupport();
//       setDeviceCheck({ isChecking: false, ...result });
//     };
//     checkDevice();
//   }, []);

//   // ✅ FIXED: Added refetchOnMountOrArgChange to prevent caching issues
//   const { data: ballotData, isLoading: ballotLoading, error: ballotError } = useGetBallotQuery(electionId, {
//     refetchOnMountOrArgChange: true,
//   });
  
//   const { data: paymentStatus } = useCheckElectionPaymentStatusQuery(electionId, {
//     skip: !ballotData?.paymentRequired,
//     refetchOnMountOrArgChange: true,
//   });

//   // ✅ DEBUG: Log ballot data to help troubleshoot
//   console.log('🗳️ ElectionAccessGuard - ballotData:', {
//     electionId,
//     hasVoted: ballotData?.hasVoted,
//     // Check all possible biometric field names
//     'election.biometricRequired': ballotData?.election?.biometricRequired,
//     'election.biometric_required': ballotData?.election?.biometric_required,
//     'election.is_biometric_required': ballotData?.election?.is_biometric_required,
//     'ballotData.biometricRequired': ballotData?.biometricRequired,
//     'ballotData.biometric_required': ballotData?.biometric_required,
//     isLoading: ballotLoading,
//     error: ballotError,
//     deviceCheck,
//   });

//   // CHANGED: Added deviceCheck.isChecking to loading condition
//   if (ballotLoading || deviceCheck.isChecking) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
//           <p className="text-gray-600 font-medium">
//             {deviceCheck.isChecking ? 'Checking device capabilities...' : 'Loading election...'}
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (ballotError || !ballotData) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
//           <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
//           <p className="text-red-800 font-bold text-center mb-2">Error Loading Election</p>
//           <button
//             onClick={() => navigate('/elections')}
//             className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
//           >
//             Back to Elections
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // ✅ CHECK hasVoted FIRST - before any steps (ONLY place this check should happen)
//   if (ballotData?.hasVoted === true) {
//     console.log('🚫 User has already voted - showing already voted screen');
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
//         <div className="max-w-4xl mx-auto pb-4">
//           <button
//             onClick={() => navigate('/dashboard')}
//             className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
//           >
//             <ArrowLeft size={20} />
//             Go to Dashboard
//           </button>
//         </div>

//         <div className="max-w-2xl mx-auto py-8">
//           <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
//             <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
//             <h2 className="text-3xl font-bold text-gray-900 mb-4">You Have Already Voted!</h2>
//             <p className="text-gray-600 mb-6">
//               Thank you for participating in this election. Your vote has been recorded.
//             </p>
            
//             <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
//               <h3 className="font-semibold text-gray-900 mb-2">{ballotData.election?.title}</h3>
//               <p className="text-sm text-gray-600">{ballotData.election?.description}</p>
//             </div>

//             {ballotData?.lotteryEnabled && (
//               <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-lg p-4 mb-6">
//                 <p className="text-purple-800 font-semibold mb-2">🎰 Lottery Entry Confirmed!</p>
//                 <p className="text-purple-700 text-sm">
//                   You're entered in the lottery draw. Winners will be notified after the election ends.
//                 </p>
//               </div>
//             )}
            
//             <button
//               onClick={() => navigate('/dashboard')}
//               className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-lg"
//             >
//               Back to Dashboard
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // NEW: Check if biometric is required - the field is biometric_required (snake_case) inside election
//   const isBiometricRequired = 
//     ballotData?.election?.biometric_required === true || 
//     ballotData?.election?.biometricRequired === true ||
//     ballotData?.biometric_required === true ||
//     ballotData?.biometricRequired === true;
  
//   // DEBUG: Log biometric check result
//   console.log('🔐 Biometric Check:', {
//     'ballotData.election.biometric_required': ballotData?.election?.biometric_required,
//     'ballotData.election (full object)': ballotData?.election,
//     'isBiometricRequired result': isBiometricRequired,
//     'deviceCheck.canUseBiometrics': deviceCheck.canUseBiometrics,
//   });

//   const isFree = !ballotData.paymentRequired;
//   const hasPaid = paymentStatus?.paid;
//   const videoCompleted = ballotData.videoProgress?.completed;

//   // CHANGED: Progress indicator - added Step 0 for biometric check
//   const StepIndicator = () => (
//     <div className="bg-white shadow-sm py-4 mb-6">
//       <div className="max-w-4xl mx-auto px-4">
//         <div className="flex items-center justify-center gap-4">
//           {/* NEW: Step 0 - Device Check */}
//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//               currentStep === 0 ? 'bg-blue-600 text-white' : 
//               currentStep > 0 ? 'bg-green-600 text-white' : 'bg-gray-300'
//             }`}>
//               {currentStep > 0 ? '✓' : '0'}
//             </div>
//             <span className={currentStep === 0 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Device</span>
//           </div>

//           <div className="w-16 h-1 bg-gray-200"></div>

//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//               currentStep === 1 ? 'bg-blue-600 text-white' : 
//               currentStep > 1 ? 'bg-green-600 text-white' : 'bg-gray-300'
//             }`}>
//               {currentStep > 1 ? '✓' : '1'}
//             </div>
//             <span className={currentStep === 1 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Payment</span>
//           </div>

//           <div className="w-16 h-1 bg-gray-200"></div>

//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//               currentStep === 2 ? 'bg-blue-600 text-white' : 
//               currentStep > 2 ? 'bg-green-600 text-white' : 'bg-gray-300'
//             }`}>
//               {currentStep > 2 ? '✓' : '2'}
//             </div>
//             <span className={currentStep === 2 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Authentication</span>
//           </div>

//           <div className="w-16 h-1 bg-gray-200"></div>

//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//               currentStep === 3 ? 'bg-blue-600 text-white' : 
//               currentStep > 3 ? 'bg-green-600 text-white' : 'bg-gray-300'
//             }`}>
//               {currentStep > 3 ? '✓' : '3'}
//             </div>
//             <span className={currentStep === 3 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Video</span>
//           </div>

//           <div className="w-16 h-1 bg-gray-200"></div>

//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//               currentStep === 4 ? 'bg-blue-600 text-white' : 'bg-gray-300'
//             }`}>
//               4
//             </div>
//             <span className={currentStep === 4 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Vote</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   // ============================================
//   // NEW: STEP 0: BIOMETRIC DEVICE CHECK - FIRST STEP
//   // ============================================
//   if (currentStep === 0) {
//     // Case 1: Biometric IS required but device doesn't support it - BLOCK USER
//     if (isBiometricRequired && !deviceCheck.canUseBiometrics) {
//       return (
//         <div className="min-h-screen bg-gray-50">
//           <StepIndicator />
//           <div className="max-w-2xl mx-auto px-4 py-8">
//             <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-400 rounded-2xl p-8 text-center shadow-xl">
//               <div className="relative inline-block mb-4">
//                 <Monitor className="w-20 h-20 text-red-400 mx-auto" />
//                 <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1">
//                   <X className="w-6 h-6 text-white" />
//                 </div>
//               </div>
              
//               <h2 className="text-3xl font-bold text-red-900 mb-3">
//                 🚫 Biometric Verification Required
//               </h2>
              
//               <p className="text-lg text-red-700 mb-4">
//                 This election requires biometric verification (fingerprint or face recognition).
//               </p>
              
//               <div className="bg-white rounded-lg p-4 my-6 text-left">
//                 <div className="flex items-start gap-3 mb-3">
//                   <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
//                   <div>
//                     <p className="font-semibold text-gray-900">Your device cannot be used</p>
//                     <p className="text-sm text-gray-600">
//                       {!deviceCheck.isMobile 
//                         ? "Desktop and laptop computers typically don't have biometric sensors."
//                         : "Your mobile device doesn't support biometric authentication."}
//                     </p>
//                   </div>
//                 </div>
                
//                 <div className="border-t pt-3 mt-3">
//                   <p className="text-sm text-gray-700 font-medium mb-2">To vote in this election, please:</p>
//                   <ol className="text-sm text-gray-600 space-y-2 ml-4">
//                     <li className="flex items-start gap-2">
//                       <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
//                       <span>Download the <strong>Vottery Mobile App</strong></span>
//                     </li>
//                     <li className="flex items-start gap-2">
//                       <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
//                       <span>Use a smartphone with fingerprint or face recognition</span>
//                     </li>
//                     <li className="flex items-start gap-2">
//                       <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
//                       <span>Complete the voting process on your mobile device</span>
//                     </li>
//                   </ol>
//                 </div>
//               </div>

//               <div className="flex flex-col sm:flex-row gap-3 mt-6">
//                 <a
//                   href="https://play.google.com/store/apps/details?id=com.vottery"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2"
//                 >
//                   <Smartphone size={20} />
//                   Get Android App
//                 </a>
//                 <a
//                   href="https://apps.apple.com/app/vottery"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="flex-1 bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2"
//                 >
//                   <Smartphone size={20} />
//                   Get iOS App
//                 </a>
//               </div>

//               <button
//                 onClick={() => navigate('/elections')}
//                 className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold transition"
//               >
//                 ← Back to Elections
//               </button>
//             </div>

//             {/* Election Info */}
//             <div className="mt-6 bg-white rounded-lg p-4 shadow">
//               <h3 className="font-semibold text-gray-900 mb-2">{ballotData.election?.title}</h3>
//               <p className="text-sm text-gray-600">{ballotData.election?.description}</p>
//               <div className="mt-3 flex items-center gap-2 text-sm text-orange-600">
//                 <Fingerprint size={16} />
//                 <span>Biometric verification enabled</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     // Case 2: Biometric NOT required - Allow any device
//     if (!isBiometricRequired) {
//       return (
//         <div className="min-h-screen bg-gray-50">
//           <StepIndicator />
//           <div className="max-w-2xl mx-auto px-4 py-8">
//             <div className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-500 rounded-2xl p-8 text-center shadow-xl">
//               <div className="relative inline-block mb-4">
//                 <Monitor className="w-20 h-20 text-green-600 mx-auto" />
//                 <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
//                   <CheckCircle className="w-6 h-6 text-white" />
//                 </div>
//               </div>
              
//               <h2 className="text-3xl font-bold text-green-900 mb-3">
//                 ✓ Device Compatible
//               </h2>
              
//               <p className="text-lg text-green-700 mb-2">
//                 This election does <strong>not</strong> require biometric verification.
//               </p>
              
//               <p className="text-green-600 mb-6">
//                 You can vote from any device - desktop, laptop, tablet, or mobile.
//               </p>

//               <div className="bg-white rounded-lg p-4 my-6 inline-block">
//                 <div className="flex items-center gap-3 text-gray-700">
//                   {deviceCheck.isMobile ? (
//                     <>
//                       <Smartphone className="w-8 h-8 text-green-600" />
//                       <span>Voting from: <strong>Mobile Device</strong></span>
//                     </>
//                   ) : (
//                     <>
//                       <Monitor className="w-8 h-8 text-green-600" />
//                       <span>Voting from: <strong>Desktop/Laptop</strong></span>
//                     </>
//                   )}
//                 </div>
//               </div>

//               <button
//                 onClick={() => setCurrentStep(1)}
//                 className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
//               >
//                 Continue to Payment →
//               </button>
//             </div>

//             {/* Election Info */}
//             <div className="mt-6 bg-white rounded-lg p-4 shadow">
//               <h3 className="font-semibold text-gray-900 mb-2">{ballotData.election?.title}</h3>
//               <p className="text-sm text-gray-600">{ballotData.election?.description}</p>
//               <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
//                 <Shield size={16} />
//                 <span>Standard authentication required</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     // Case 3: Biometric IS required AND device supports it - Allow to proceed
//     if (isBiometricRequired && deviceCheck.canUseBiometrics) {
//       return (
//         <div className="min-h-screen bg-gray-50">
//           <StepIndicator />
//           <div className="max-w-2xl mx-auto px-4 py-8">
//             <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-500 rounded-2xl p-8 text-center shadow-xl">
//               <div className="relative inline-block mb-4">
//                 <Fingerprint className="w-20 h-20 text-blue-600 mx-auto animate-pulse" />
//                 <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
//                   <CheckCircle className="w-6 h-6 text-white" />
//                 </div>
//               </div>
              
//               <h2 className="text-3xl font-bold text-blue-900 mb-3">
//                 ✓ Biometric Device Detected
//               </h2>
              
//               <p className="text-lg text-blue-700 mb-2">
//                 This election requires biometric verification.
//               </p>
              
//               <p className="text-blue-600 mb-6">
//                 Your device supports biometric authentication. You're all set to continue!
//               </p>

//               <div className="bg-white rounded-lg p-4 my-6 inline-block">
//                 <div className="flex items-center gap-3 text-gray-700">
//                   <Smartphone className="w-8 h-8 text-blue-600" />
//                   <div className="text-left">
//                     <p className="font-semibold">Mobile Device Ready</p>
//                     <p className="text-sm text-gray-500">Fingerprint/Face ID available</p>
//                   </div>
//                 </div>
//               </div>

//               <button
//                 onClick={() => setCurrentStep(1)}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
//               >
//                 Continue to Payment →
//               </button>
//             </div>

//             {/* Election Info */}
//             <div className="mt-6 bg-white rounded-lg p-4 shadow">
//               <h3 className="font-semibold text-gray-900 mb-2">{ballotData.election?.title}</h3>
//               <p className="text-sm text-gray-600">{ballotData.election?.description}</p>
//               <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
//                 <Fingerprint size={16} />
//                 <span>Biometric verification enabled</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       );
//     }
//   }

//   // ============================================
//   // STEP 1: PAYMENT - UNCHANGED FROM ORIGINAL
//   // ============================================
//   if (currentStep === 1) {
//     // Case 1: Election is FREE
//     if (isFree) {
//       return (
//         <div className="min-h-screen bg-gray-50">
//           <StepIndicator />
//           <div className="max-w-2xl mx-auto px-4 py-8">
//             <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-8 text-center shadow-xl">
//               <Gift className="w-20 h-20 text-green-600 mx-auto mb-4 animate-bounce" />
//               <h2 className="text-3xl font-bold text-green-900 mb-3">
//                 🎉 This Election is FREE!
//               </h2>
//               <p className="text-lg text-green-700 mb-2">
//                 No payment required to participate in this election.
//               </p>
//               <p className="text-green-600 mb-8">
//                 You can proceed directly to the next step.
//               </p>
//               <button
//                 onClick={() => setCurrentStep(2)}
//                 className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
//               >
//                 Continue to Authentication →
//               </button>
//             </div>

//             {/* Election Info */}
//             <div className="mt-6 bg-white rounded-lg p-4 shadow">
//               <h3 className="font-semibold text-gray-900 mb-2">{ballotData.election.title}</h3>
//               <p className="text-sm text-gray-600">{ballotData.election.description}</p>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     // Case 2: Already Paid
//     if (hasPaid) {
//       return (
//         <div className="min-h-screen bg-gray-50">
//           <StepIndicator />
//           <div className="max-w-2xl mx-auto px-4 py-8">
//             <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-500 rounded-2xl p-8 text-center shadow-xl">
//               <CheckCircle className="w-20 h-20 text-blue-600 mx-auto mb-4 animate-pulse" />
//               <h2 className="text-3xl font-bold text-blue-900 mb-3">
//                 ✓ Payment Completed!
//               </h2>
//               <p className="text-lg text-blue-700 mb-2">
//                 You have already paid the participation fee for this election.
//               </p>
//               <div className="bg-white rounded-lg p-4 my-6 inline-block">
//                 <p className="text-sm text-gray-600">Amount Paid</p>
//                 <p className="text-3xl font-bold text-blue-600">
//                   ${ballotData.participationFee.toFixed(2)}
//                 </p>
//               </div>
//               <p className="text-blue-600 mb-8">
//                 You can proceed to the next step.
//               </p>
//               <button
//                 onClick={() => setCurrentStep(2)}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
//               >
//                 Continue to Authentication →
//               </button>
//             </div>

//             {/* Election Info */}
//             <div className="mt-6 bg-white rounded-lg p-4 shadow">
//               <h3 className="font-semibold text-gray-900 mb-2">{ballotData.election.title}</h3>
//               <p className="text-sm text-gray-600">{ballotData.election.description}</p>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     // Case 3: Need to Pay
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <StepIndicator />
//         <ElectionPaymentPage
//           electionId={electionId}
//           amount={ballotData.participationFee}
//           currency="USD"
//           onPaymentComplete={() => setCurrentStep(2)}
//           electionTitle={ballotData.election?.title}
//         />
//       </div>
//     );
//   }

//   // ============================================
//   // STEP 2: AUTHENTICATION - UNCHANGED FROM ORIGINAL
//   // ============================================
//   if (currentStep === 2) {
//     const authMethods = ballotData.election?.authentication_methods || ['passkey'];

//     return (
//       <div className="min-h-screen bg-gray-50">
//         <StepIndicator />
//         <div className="max-w-2xl mx-auto px-4 py-8">
//           <AuthenticationSelector 
//             methods={authMethods} 
//             electionId={electionId}
//             sessionId={`election-${electionId}`}
//             onAuthComplete={() => setCurrentStep(3)} 
//           />
//         </div>
//       </div>
//     );
//   }

//   // ============================================
//   // STEP 3: VIDEO - UNCHANGED FROM ORIGINAL
//   // ============================================
//   if (currentStep === 3) {
//     // Case 1: Video Already Completed
//     if (videoCompleted) {
//       return (
//         <div className="min-h-screen bg-gray-50">
//           <StepIndicator />
//           <div className="max-w-4xl mx-auto px-4 py-8">
//             <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-500 rounded-2xl p-8 text-center shadow-xl">
//               <CheckCircle className="w-20 h-20 text-purple-600 mx-auto mb-4 animate-bounce" />
//               <h2 className="text-3xl font-bold text-purple-900 mb-3">
//                 ✓ Video Already Watched!
//               </h2>
//               <p className="text-lg text-purple-700 mb-2">
//                 You have already completed the video requirement for this election.
//               </p>
//               <div className="bg-white rounded-lg p-4 my-6 inline-block">
//                 <p className="text-sm text-gray-600">Watch Progress</p>
//                 <p className="text-3xl font-bold text-purple-600">
//                   {ballotData.videoProgress.watch_percentage}%
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Required: {ballotData.minimumWatchPercentage}%
//                 </p>
//               </div>
//               <p className="text-purple-600 mb-8">
//                 You can proceed directly to voting.
//               </p>
//               <button
//                 onClick={() => setCurrentStep(4)}
//                 className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
//               >
//                 Continue to Voting →
//               </button>
//             </div>

//             {/* Video Info */}
//             <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
//               <h4 className="text-blue-900 font-bold mb-2 text-sm">ℹ️ About the Video</h4>
//               <p className="text-blue-800 text-xs">
//                 You previously watched {ballotData.videoProgress.watch_percentage}% of the required video. 
//                 Since you met the minimum requirement of {ballotData.minimumWatchPercentage}%, you can proceed directly to voting.
//               </p>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     // Case 2: Need to Watch Video
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <StepIndicator />
//         <div className="max-w-4xl mx-auto px-4 py-8">
//           <VideoWatchProgress
//             electionId={electionId}
//             videoUrl={ballotData.election?.videoUrl || ballotData.election?.topic_video_url}
//             minimumWatchPercentage={ballotData.minimumWatchPercentage}
//             required={ballotData.videoWatchRequired}
//             onComplete={() => setCurrentStep(4)}
//           />
//         </div>
//       </div>
//     );
//   }

//   // ============================================
//   // STEP 4: VOTING - UNCHANGED FROM ORIGINAL
//   // ============================================
//   if (currentStep === 4) {
//     return <ElectionVotingView />;
//   }

//   return null;
// }


//last working code only to add biometric  code
// // src/components/voting/ElectionAccessGuard.jsx
// import React, { useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// /*eslint-disable*/
// import { useSelector } from 'react-redux';
// import { useGetBallotQuery } from '../../redux/api/voting/votingApi';
// import { useCheckElectionPaymentStatusQuery } from '../../redux/api/walllet/electionPaymentApi';
// import { Loader, Shield, Video, AlertCircle, Gift, CheckCircle, ArrowLeft } from 'lucide-react';

// import ElectionVotingView from '../../pages/election/ElectionVotingView';
// import ElectionPaymentPage from '../../pages/voting/payment/ElectionPaymentPage';
// import AuthenticationSelector from '../Auth/AuthenticationSelector';
// import VideoWatchProgress from '../Dashboard/Tabs/voting/VideoWatchProgress';

// export default function ElectionAccessGuard() {
//   const { electionId } = useParams();
//   const navigate = useNavigate();
  
//   const [currentStep, setCurrentStep] = useState(1);

//   // ✅ FIXED: Added refetchOnMountOrArgChange to prevent caching issues
//   const { data: ballotData, isLoading: ballotLoading, error: ballotError } = useGetBallotQuery(electionId, {
//     refetchOnMountOrArgChange: true,
//   });
  
//   const { data: paymentStatus } = useCheckElectionPaymentStatusQuery(electionId, {
//     skip: !ballotData?.paymentRequired,
//     refetchOnMountOrArgChange: true,
//   });

//   // ✅ DEBUG: Log ballot data to help troubleshoot
//   console.log('🗳️ ElectionAccessGuard - ballotData:', {
//     electionId,
//     hasVoted: ballotData?.hasVoted,
//     isLoading: ballotLoading,
//     error: ballotError,
//   });

//   if (ballotLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
//           <p className="text-gray-600 font-medium">Loading election...</p>
//         </div>
//       </div>
//     );
//   }

//   if (ballotError || !ballotData) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
//           <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
//           <p className="text-red-800 font-bold text-center mb-2">Error Loading Election</p>
//           <button
//             onClick={() => navigate('/elections')}
//             className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
//           >
//             Back to Elections
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // ✅ CHECK hasVoted FIRST - before any steps
//   if (ballotData?.hasVoted === true) {
//     console.log('🚫 User has already voted - showing already voted screen');
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
//         <div className="max-w-4xl mx-auto pb-4">
//           <button
//             onClick={() => navigate('/dashboard')}
//             className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
//           >
//             <ArrowLeft size={20} />
//             Go to Dashboard
//           </button>
//         </div>

//         <div className="max-w-2xl mx-auto py-8">
//           <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
//             <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
//             <h2 className="text-3xl font-bold text-gray-900 mb-4">You Have Already Voted!</h2>
//             <p className="text-gray-600 mb-6">
//               Thank you for participating in this election. Your vote has been recorded.
//             </p>
            
//             <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
//               <h3 className="font-semibold text-gray-900 mb-2">{ballotData.election?.title}</h3>
//               <p className="text-sm text-gray-600">{ballotData.election?.description}</p>
//             </div>

//             {ballotData?.lotteryEnabled && (
//               <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-lg p-4 mb-6">
//                 <p className="text-purple-800 font-semibold mb-2">🎰 Lottery Entry Confirmed!</p>
//                 <p className="text-purple-700 text-sm">
//                   You're entered in the lottery draw. Winners will be notified after the election ends.
//                 </p>
//               </div>
//             )}
            
//             <button
//               onClick={() => navigate('/dashboard')}
//               className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-lg"
//             >
//               Back to Dashboard
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const isFree = !ballotData.paymentRequired;
//   const hasPaid = paymentStatus?.paid;
//   const videoCompleted = ballotData.videoProgress?.completed;

//   // Progress indicator
//   const StepIndicator = () => (
//     <div className="bg-white shadow-sm py-4 mb-6">
//       <div className="max-w-4xl mx-auto px-4">
//         <div className="flex items-center justify-center gap-4">
//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//               currentStep === 1 ? 'bg-blue-600 text-white' : 
//               currentStep > 1 ? 'bg-green-600 text-white' : 'bg-gray-300'
//             }`}>
//               {currentStep > 1 ? '✓' : '1'}
//             </div>
//             <span className={currentStep === 1 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Payment</span>
//           </div>

//           <div className="w-16 h-1 bg-gray-200"></div>

//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//               currentStep === 2 ? 'bg-blue-600 text-white' : 
//               currentStep > 2 ? 'bg-green-600 text-white' : 'bg-gray-300'
//             }`}>
//               {currentStep > 2 ? '✓' : '2'}
//             </div>
//             <span className={currentStep === 2 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Authentication</span>
//           </div>

//           <div className="w-16 h-1 bg-gray-200"></div>

//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//               currentStep === 3 ? 'bg-blue-600 text-white' : 
//               currentStep > 3 ? 'bg-green-600 text-white' : 'bg-gray-300'
//             }`}>
//               {currentStep > 3 ? '✓' : '3'}
//             </div>
//             <span className={currentStep === 3 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Video</span>
//           </div>

//           <div className="w-16 h-1 bg-gray-200"></div>

//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//               currentStep === 4 ? 'bg-blue-600 text-white' : 'bg-gray-300'
//             }`}>
//               4
//             </div>
//             <span className={currentStep === 4 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Vote</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   // ============================================
//   // STEP 1: PAYMENT - ALWAYS SHOW THIS STEP
//   // ============================================
//   if (currentStep === 1) {
//     // Case 1: Election is FREE
//     if (isFree) {
//       return (
//         <div className="min-h-screen bg-gray-50">
//           <StepIndicator />
//           <div className="max-w-2xl mx-auto px-4 py-8">
//             <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-8 text-center shadow-xl">
//               <Gift className="w-20 h-20 text-green-600 mx-auto mb-4 animate-bounce" />
//               <h2 className="text-3xl font-bold text-green-900 mb-3">
//                 🎉 This Election is FREE!
//               </h2>
//               <p className="text-lg text-green-700 mb-2">
//                 No payment required to participate in this election.
//               </p>
//               <p className="text-green-600 mb-8">
//                 You can proceed directly to the next step.
//               </p>
//               <button
//                 onClick={() => setCurrentStep(2)}
//                 className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
//               >
//                 Continue to Authentication →
//               </button>
//             </div>

//             {/* Election Info */}
//             <div className="mt-6 bg-white rounded-lg p-4 shadow">
//               <h3 className="font-semibold text-gray-900 mb-2">{ballotData.election.title}</h3>
//               <p className="text-sm text-gray-600">{ballotData.election.description}</p>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     // Case 2: Already Paid
//     if (hasPaid) {
//       return (
//         <div className="min-h-screen bg-gray-50">
//           <StepIndicator />
//           <div className="max-w-2xl mx-auto px-4 py-8">
//             <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-500 rounded-2xl p-8 text-center shadow-xl">
//               <CheckCircle className="w-20 h-20 text-blue-600 mx-auto mb-4 animate-pulse" />
//               <h2 className="text-3xl font-bold text-blue-900 mb-3">
//                 ✓ Payment Completed!
//               </h2>
//               <p className="text-lg text-blue-700 mb-2">
//                 You have already paid the participation fee for this election.
//               </p>
//               <div className="bg-white rounded-lg p-4 my-6 inline-block">
//                 <p className="text-sm text-gray-600">Amount Paid</p>
//                 <p className="text-3xl font-bold text-blue-600">
//                   ${ballotData.participationFee.toFixed(2)}
//                 </p>
//               </div>
//               <p className="text-blue-600 mb-8">
//                 You can proceed to the next step.
//               </p>
//               <button
//                 onClick={() => setCurrentStep(2)}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
//               >
//                 Continue to Authentication →
//               </button>
//             </div>

//             {/* Election Info */}
//             <div className="mt-6 bg-white rounded-lg p-4 shadow">
//               <h3 className="font-semibold text-gray-900 mb-2">{ballotData.election.title}</h3>
//               <p className="text-sm text-gray-600">{ballotData.election.description}</p>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     // Case 3: Need to Pay
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <StepIndicator />
//         <ElectionPaymentPage
//           electionId={electionId}
//           amount={ballotData.participationFee}
//           currency="USD"
//           onPaymentComplete={() => setCurrentStep(2)}
//           electionTitle={ballotData.election?.title}
//         />
//       </div>
//     );
//   }

//   // ============================================
//   // STEP 2: AUTHENTICATION - ALWAYS SHOW THIS STEP
//   // ============================================
//   if (currentStep === 2) {
//     const authMethods = ballotData.election?.authentication_methods || ['passkey'];

//     return (
//       <div className="min-h-screen bg-gray-50">
//         <StepIndicator />
//         <div className="max-w-2xl mx-auto px-4 py-8">
//           <AuthenticationSelector 
//             methods={authMethods} 
//             electionId={electionId}
//             sessionId={`election-${electionId}`}
//             onAuthComplete={() => setCurrentStep(3)} 
//           />
//         </div>
//       </div>
//     );
//   }

//   // ============================================
//   // STEP 3: VIDEO - ALWAYS SHOW THIS STEP
//   // ============================================
//   if (currentStep === 3) {
//     // Case 1: Video Already Completed
//     if (videoCompleted) {
//       return (
//         <div className="min-h-screen bg-gray-50">
//           <StepIndicator />
//           <div className="max-w-4xl mx-auto px-4 py-8">
//             <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-500 rounded-2xl p-8 text-center shadow-xl">
//               <CheckCircle className="w-20 h-20 text-purple-600 mx-auto mb-4 animate-bounce" />
//               <h2 className="text-3xl font-bold text-purple-900 mb-3">
//                 ✓ Video Already Watched!
//               </h2>
//               <p className="text-lg text-purple-700 mb-2">
//                 You have already completed the video requirement for this election.
//               </p>
//               <div className="bg-white rounded-lg p-4 my-6 inline-block">
//                 <p className="text-sm text-gray-600">Watch Progress</p>
//                 <p className="text-3xl font-bold text-purple-600">
//                   {ballotData.videoProgress.watch_percentage}%
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Required: {ballotData.minimumWatchPercentage}%
//                 </p>
//               </div>
//               <p className="text-purple-600 mb-8">
//                 You can proceed directly to voting.
//               </p>
//               <button
//                 onClick={() => setCurrentStep(4)}
//                 className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
//               >
//                 Continue to Voting →
//               </button>
//             </div>

//             {/* Video Info */}
//             <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
//               <h4 className="text-blue-900 font-bold mb-2 text-sm">ℹ️ About the Video</h4>
//               <p className="text-blue-800 text-xs">
//                 You previously watched {ballotData.videoProgress.watch_percentage}% of the required video. 
//                 Since you met the minimum requirement of {ballotData.minimumWatchPercentage}%, you can proceed directly to voting.
//               </p>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     // Case 2: Need to Watch Video
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <StepIndicator />
//         <div className="max-w-4xl mx-auto px-4 py-8">
//           <VideoWatchProgress
//             electionId={electionId}
//             videoUrl={ballotData.election?.videoUrl || ballotData.election?.topic_video_url}
//             minimumWatchPercentage={ballotData.minimumWatchPercentage}
//             required={ballotData.videoWatchRequired}
//             onComplete={() => setCurrentStep(4)}
//           />
//         </div>
//       </div>
//     );
//   }

//   // ============================================
//   // STEP 4: VOTING
//   // ============================================
//   if (currentStep === 4) {
//     return <ElectionVotingView />;
//   }

//   return null;
// }
// // src/components/voting/ElectionAccessGuard.jsx
// import React, { useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// /*eslint-disable*/
// import { useSelector } from 'react-redux';
// import { useGetBallotQuery } from '../../redux/api/voting/votingApi';
// import { useCheckElectionPaymentStatusQuery } from '../../redux/api/walllet/electionPaymentApi';
// import { Loader, Shield, Video, AlertCircle, Gift, CheckCircle, ArrowLeft } from 'lucide-react';

// import ElectionVotingView from '../../pages/election/ElectionVotingView';
// import ElectionPaymentPage from '../../pages/voting/payment/ElectionPaymentPage';
// import AuthenticationSelector from '../Auth/AuthenticationSelector';
// import VideoWatchProgress from '../Dashboard/Tabs/voting/VideoWatchProgress';

// export default function ElectionAccessGuard() {
//   const { electionId } = useParams();
//   const navigate = useNavigate();
  
//   const [currentStep, setCurrentStep] = useState(1);

//   const { data: ballotData, isLoading: ballotLoading, error: ballotError } = useGetBallotQuery(electionId);
//   const { data: paymentStatus } = useCheckElectionPaymentStatusQuery(electionId, {
//     skip: !ballotData?.paymentRequired,
//   });

//   if (ballotLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
//           <p className="text-gray-600 font-medium">Loading election...</p>
//         </div>
//       </div>
//     );
//   }

//   if (ballotError || !ballotData) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
//           <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
//           <p className="text-red-800 font-bold text-center mb-2">Error Loading Election</p>
//           <button
//             onClick={() => navigate('/elections')}
//             className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
//           >
//             Back to Elections
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // ✅ ADDED: Check hasVoted FIRST - before any steps
//   // ✅ CHECK hasVoted FIRST - before any steps
// if (ballotData?.hasVoted) {
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
//       <div className="max-w-4xl mx-auto pb-4">
//         <button
//           onClick={() => navigate('/dashboard')}
//           className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
//         >
//           <ArrowLeft size={20} />
//           Go to Dashboard
//         </button>
//       </div>

//       <div className="max-w-2xl mx-auto py-8">
//         <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
//           <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
//           <h2 className="text-3xl font-bold text-gray-900 mb-4">You Have Already Voted!</h2>
//           <p className="text-gray-600 mb-6">
//             Thank you for participating in this election. Your vote has been recorded.
//           </p>
          
//           <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
//             <h3 className="font-semibold text-gray-900 mb-2">{ballotData.election?.title}</h3>
//             <p className="text-sm text-gray-600">{ballotData.election?.description}</p>
//           </div>

//           {ballotData?.lotteryEnabled && (
//             <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-lg p-4 mb-6">
//               <p className="text-purple-800 font-semibold mb-2">🎰 Lottery Entry Confirmed!</p>
//               <p className="text-purple-700 text-sm">
//                 You're entered in the lottery draw. Winners will be notified after the election ends.
//               </p>
//             </div>
//           )}
          
//           <button
//             onClick={() => navigate('/dashboard')}
//             className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-lg"
//           >
//             Back to Dashboard
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


//   const isFree = !ballotData.paymentRequired;
//   const hasPaid = paymentStatus?.paid;
//   const videoCompleted = ballotData.videoProgress?.completed;

//   // Progress indicator
//   const StepIndicator = () => (
//     <div className="bg-white shadow-sm py-4 mb-6">
//       <div className="max-w-4xl mx-auto px-4">
//         <div className="flex items-center justify-center gap-4">
//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//               currentStep === 1 ? 'bg-blue-600 text-white' : 
//               currentStep > 1 ? 'bg-green-600 text-white' : 'bg-gray-300'
//             }`}>
//               {currentStep > 1 ? '✓' : '1'}
//             </div>
//             <span className={currentStep === 1 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Payment</span>
//           </div>

//           <div className="w-16 h-1 bg-gray-200"></div>

//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//               currentStep === 2 ? 'bg-blue-600 text-white' : 
//               currentStep > 2 ? 'bg-green-600 text-white' : 'bg-gray-300'
//             }`}>
//               {currentStep > 2 ? '✓' : '2'}
//             </div>
//             <span className={currentStep === 2 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Authentication</span>
//           </div>

//           <div className="w-16 h-1 bg-gray-200"></div>

//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//               currentStep === 3 ? 'bg-blue-600 text-white' : 
//               currentStep > 3 ? 'bg-green-600 text-white' : 'bg-gray-300'
//             }`}>
//               {currentStep > 3 ? '✓' : '3'}
//             </div>
//             <span className={currentStep === 3 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Video</span>
//           </div>

//           <div className="w-16 h-1 bg-gray-200"></div>

//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//               currentStep === 4 ? 'bg-blue-600 text-white' : 'bg-gray-300'
//             }`}>
//               4
//             </div>
//             <span className={currentStep === 4 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Vote</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   // ============================================
//   // STEP 1: PAYMENT - ALWAYS SHOW THIS STEP
//   // ============================================
//   if (currentStep === 1) {
//     // Case 1: Election is FREE
//     if (isFree) {
//       return (
//         <div className="min-h-screen bg-gray-50">
//           <StepIndicator />
//           <div className="max-w-2xl mx-auto px-4 py-8">
//             <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-8 text-center shadow-xl">
//               <Gift className="w-20 h-20 text-green-600 mx-auto mb-4 animate-bounce" />
//               <h2 className="text-3xl font-bold text-green-900 mb-3">
//                 🎉 This Election is FREE!
//               </h2>
//               <p className="text-lg text-green-700 mb-2">
//                 No payment required to participate in this election.
//               </p>
//               <p className="text-green-600 mb-8">
//                 You can proceed directly to the next step.
//               </p>
//               <button
//                 onClick={() => setCurrentStep(2)}
//                 className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
//               >
//                 Continue to Authentication →
//               </button>
//             </div>

//             {/* Election Info */}
//             <div className="mt-6 bg-white rounded-lg p-4 shadow">
//               <h3 className="font-semibold text-gray-900 mb-2">{ballotData.election.title}</h3>
//               <p className="text-sm text-gray-600">{ballotData.election.description}</p>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     // Case 2: Already Paid
//     if (hasPaid) {
//       return (
//         <div className="min-h-screen bg-gray-50">
//           <StepIndicator />
//           <div className="max-w-2xl mx-auto px-4 py-8">
//             <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-500 rounded-2xl p-8 text-center shadow-xl">
//               <CheckCircle className="w-20 h-20 text-blue-600 mx-auto mb-4 animate-pulse" />
//               <h2 className="text-3xl font-bold text-blue-900 mb-3">
//                 ✓ Payment Completed!
//               </h2>
//               <p className="text-lg text-blue-700 mb-2">
//                 You have already paid the participation fee for this election.
//               </p>
//               <div className="bg-white rounded-lg p-4 my-6 inline-block">
//                 <p className="text-sm text-gray-600">Amount Paid</p>
//                 <p className="text-3xl font-bold text-blue-600">
//                   ${ballotData.participationFee.toFixed(2)}
//                 </p>
//               </div>
//               <p className="text-blue-600 mb-8">
//                 You can proceed to the next step.
//               </p>
//               <button
//                 onClick={() => setCurrentStep(2)}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
//               >
//                 Continue to Authentication →
//               </button>
//             </div>

//             {/* Election Info */}
//             <div className="mt-6 bg-white rounded-lg p-4 shadow">
//               <h3 className="font-semibold text-gray-900 mb-2">{ballotData.election.title}</h3>
//               <p className="text-sm text-gray-600">{ballotData.election.description}</p>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     // Case 3: Need to Pay
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <StepIndicator />
//         <ElectionPaymentPage
//           electionId={electionId}
//           amount={ballotData.participationFee}
//           currency="USD"
//           onPaymentComplete={() => setCurrentStep(2)}
//           electionTitle={ballotData.election?.title}
//         />
//       </div>
//     );
//   }

//   // ============================================
//   // STEP 2: AUTHENTICATION - ALWAYS SHOW THIS STEP
//   // ============================================
//   if (currentStep === 2) {
//     const authMethods = ballotData.election?.authentication_methods || ['passkey'];

//     return (
//       <div className="min-h-screen bg-gray-50">
//         <StepIndicator />
//         <div className="max-w-2xl mx-auto px-4 py-8">
//           <AuthenticationSelector 
//             methods={authMethods} 
//             electionId={electionId}
//             sessionId={`election-${electionId}`}
//             onAuthComplete={() => setCurrentStep(3)} 
//           />
//         </div>
//       </div>
//     );
//   }

//   // ============================================
//   // STEP 3: VIDEO - ALWAYS SHOW THIS STEP
//   // ============================================
//   if (currentStep === 3) {
//     // Case 1: Video Already Completed
//     if (videoCompleted) {
//       return (
//         <div className="min-h-screen bg-gray-50">
//           <StepIndicator />
//           <div className="max-w-4xl mx-auto px-4 py-8">
//             <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-500 rounded-2xl p-8 text-center shadow-xl">
//               <CheckCircle className="w-20 h-20 text-purple-600 mx-auto mb-4 animate-bounce" />
//               <h2 className="text-3xl font-bold text-purple-900 mb-3">
//                 ✓ Video Already Watched!
//               </h2>
//               <p className="text-lg text-purple-700 mb-2">
//                 You have already completed the video requirement for this election.
//               </p>
//               <div className="bg-white rounded-lg p-4 my-6 inline-block">
//                 <p className="text-sm text-gray-600">Watch Progress</p>
//                 <p className="text-3xl font-bold text-purple-600">
//                   {ballotData.videoProgress.watch_percentage}%
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Required: {ballotData.minimumWatchPercentage}%
//                 </p>
//               </div>
//               <p className="text-purple-600 mb-8">
//                 You can proceed directly to voting.
//               </p>
//               <button
//                 onClick={() => setCurrentStep(4)}
//                 className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
//               >
//                 Continue to Voting →
//               </button>
//             </div>

//             {/* Video Info */}
//             <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
//               <h4 className="text-blue-900 font-bold mb-2 text-sm">ℹ️ About the Video</h4>
//               <p className="text-blue-800 text-xs">
//                 You previously watched {ballotData.videoProgress.watch_percentage}% of the required video. 
//                 Since you met the minimum requirement of {ballotData.minimumWatchPercentage}%, you can proceed directly to voting.
//               </p>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     // Case 2: Need to Watch Video
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <StepIndicator />
//         <div className="max-w-4xl mx-auto px-4 py-8">
//           <VideoWatchProgress
//             electionId={electionId}
//             videoUrl={ballotData.election?.videoUrl || ballotData.election?.topic_video_url}
//             minimumWatchPercentage={ballotData.minimumWatchPercentage}
//             required={ballotData.videoWatchRequired}
//             onComplete={() => setCurrentStep(4)}
//           />
//         </div>
//       </div>
//     );
//   }

//   // ============================================
//   // STEP 4: VOTING
//   // ============================================
//   if (currentStep === 4) {
//     return <ElectionVotingView />;
//   }

//   return null;
// }


//last working code only to add ballot route above code
// // src/components/voting/ElectionAccessGuard.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// /*eslint-disable*/
// import { useSelector } from 'react-redux';
// import { useGetBallotQuery } from '../../redux/api/voting/votingApi';
// import { useCheckElectionPaymentStatusQuery } from '../../redux/api/walllet/electionPaymentApi';
// import { Loader, Shield, Video, AlertCircle, Gift, CheckCircle } from 'lucide-react';

// import ElectionVotingView from '../../pages/election/ElectionVotingView';
// import ElectionPaymentPage from '../../pages/voting/payment/ElectionPaymentPage';
// import AuthenticationSelector from '../Auth/AuthenticationSelector';
// import VideoWatchProgress from '../Dashboard/Tabs/voting/VideoWatchProgress';

// export default function ElectionAccessGuard() {
//   const { electionId } = useParams();
//   const navigate = useNavigate();
  
//   const [currentStep, setCurrentStep] = useState(1);

//   const { data: ballotData, isLoading: ballotLoading, error: ballotError } = useGetBallotQuery(electionId);
//   const { data: paymentStatus } = useCheckElectionPaymentStatusQuery(electionId, {
//     skip: !ballotData?.paymentRequired,
//   });

//   // Check if user already voted - if yes, show receipt
//   useEffect(() => {
//     if (ballotData?.hasVoted && !ballotData?.voteEditingAllowed) {
//       setCurrentStep(4);
//     }
//   }, [ballotData]);

//   if (ballotLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
//           <p className="text-gray-600 font-medium">Loading election...</p>
//         </div>
//       </div>
//     );
//   }

//   if (ballotError || !ballotData) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
//           <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
//           <p className="text-red-800 font-bold text-center mb-2">Error Loading Election</p>
//           <button
//             onClick={() => navigate('/elections')}
//             className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
//           >
//             Back to Elections
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const isFree = !ballotData.paymentRequired;
//   const hasPaid = paymentStatus?.paid;
//   const videoCompleted = ballotData.videoProgress?.completed;

//   // Progress indicator
//   const StepIndicator = () => (
//     <div className="bg-white shadow-sm py-4 mb-6">
//       <div className="max-w-4xl mx-auto px-4">
//         <div className="flex items-center justify-center gap-4">
//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//               currentStep === 1 ? 'bg-blue-600 text-white' : 
//               currentStep > 1 ? 'bg-green-600 text-white' : 'bg-gray-300'
//             }`}>
//               {currentStep > 1 ? '✓' : '1'}
//             </div>
//             <span className={currentStep === 1 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Payment</span>
//           </div>

//           <div className="w-16 h-1 bg-gray-200"></div>

//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//               currentStep === 2 ? 'bg-blue-600 text-white' : 
//               currentStep > 2 ? 'bg-green-600 text-white' : 'bg-gray-300'
//             }`}>
//               {currentStep > 2 ? '✓' : '2'}
//             </div>
//             <span className={currentStep === 2 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Authentication</span>
//           </div>

//           <div className="w-16 h-1 bg-gray-200"></div>

//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//               currentStep === 3 ? 'bg-blue-600 text-white' : 
//               currentStep > 3 ? 'bg-green-600 text-white' : 'bg-gray-300'
//             }`}>
//               {currentStep > 3 ? '✓' : '3'}
//             </div>
//             <span className={currentStep === 3 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Video</span>
//           </div>

//           <div className="w-16 h-1 bg-gray-200"></div>

//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//               currentStep === 4 ? 'bg-blue-600 text-white' : 'bg-gray-300'
//             }`}>
//               4
//             </div>
//             <span className={currentStep === 4 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Vote</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   // ============================================
//   // STEP 1: PAYMENT - ALWAYS SHOW THIS STEP
//   // ============================================
//   if (currentStep === 1) {
//     // Case 1: Election is FREE
//     if (isFree) {
//       return (
//         <div className="min-h-screen bg-gray-50">
//           <StepIndicator />
//           <div className="max-w-2xl mx-auto px-4 py-8">
//             <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-8 text-center shadow-xl">
//               <Gift className="w-20 h-20 text-green-600 mx-auto mb-4 animate-bounce" />
//               <h2 className="text-3xl font-bold text-green-900 mb-3">
//                 🎉 This Election is FREE!
//               </h2>
//               <p className="text-lg text-green-700 mb-2">
//                 No payment required to participate in this election.
//               </p>
//               <p className="text-green-600 mb-8">
//                 You can proceed directly to the next step.
//               </p>
//               <button
//                 onClick={() => setCurrentStep(2)}
//                 className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
//               >
//                 Continue to Authentication →
//               </button>
//             </div>

//             {/* Election Info */}
//             <div className="mt-6 bg-white rounded-lg p-4 shadow">
//               <h3 className="font-semibold text-gray-900 mb-2">{ballotData.election.title}</h3>
//               <p className="text-sm text-gray-600">{ballotData.election.description}</p>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     // Case 2: Already Paid
//     if (hasPaid) {
//       return (
//         <div className="min-h-screen bg-gray-50">
//           <StepIndicator />
//           <div className="max-w-2xl mx-auto px-4 py-8">
//             <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-500 rounded-2xl p-8 text-center shadow-xl">
//               <CheckCircle className="w-20 h-20 text-blue-600 mx-auto mb-4 animate-pulse" />
//               <h2 className="text-3xl font-bold text-blue-900 mb-3">
//                 ✓ Payment Completed!
//               </h2>
//               <p className="text-lg text-blue-700 mb-2">
//                 You have already paid the participation fee for this election.
//               </p>
//               <div className="bg-white rounded-lg p-4 my-6 inline-block">
//                 <p className="text-sm text-gray-600">Amount Paid</p>
//                 <p className="text-3xl font-bold text-blue-600">
//                   ${ballotData.participationFee.toFixed(2)}
//                 </p>
//               </div>
//               <p className="text-blue-600 mb-8">
//                 You can proceed to the next step.
//               </p>
//               <button
//                 onClick={() => setCurrentStep(2)}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
//               >
//                 Continue to Authentication →
//               </button>
//             </div>

//             {/* Election Info */}
//             <div className="mt-6 bg-white rounded-lg p-4 shadow">
//               <h3 className="font-semibold text-gray-900 mb-2">{ballotData.election.title}</h3>
//               <p className="text-sm text-gray-600">{ballotData.election.description}</p>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     // Case 3: Need to Pay
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <StepIndicator />
//         <ElectionPaymentPage
//           electionId={electionId}
//           amount={ballotData.participationFee}
//           currency="USD"
//           onPaymentComplete={() => setCurrentStep(2)}
//           electionTitle={ballotData.election?.title}
//         />
//       </div>
//     );
//   }

//   // ============================================
//   // STEP 2: AUTHENTICATION - ALWAYS SHOW THIS STEP
//   // ============================================
//   if (currentStep === 2) {
//     const authMethods = ballotData.election?.authentication_methods || ['passkey'];

//     return (
//       <div className="min-h-screen bg-gray-50">
//         <StepIndicator />
//         <div className="max-w-2xl mx-auto px-4 py-8">
//           <AuthenticationSelector 
//             methods={authMethods} 
//             electionId={electionId}
//             sessionId={`election-${electionId}`}
//             onAuthComplete={() => setCurrentStep(3)} 
//           />
//         </div>
//       </div>
//     );
//   }

//   // ============================================
//   // STEP 3: VIDEO - ALWAYS SHOW THIS STEP
//   // ============================================
//   if (currentStep === 3) {
//     // Case 1: Video Already Completed
//     if (videoCompleted) {
//       return (
//         <div className="min-h-screen bg-gray-50">
//           <StepIndicator />
//           <div className="max-w-4xl mx-auto px-4 py-8">
//             <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-500 rounded-2xl p-8 text-center shadow-xl">
//               <CheckCircle className="w-20 h-20 text-purple-600 mx-auto mb-4 animate-bounce" />
//               <h2 className="text-3xl font-bold text-purple-900 mb-3">
//                 ✓ Video Already Watched!
//               </h2>
//               <p className="text-lg text-purple-700 mb-2">
//                 You have already completed the video requirement for this election.
//               </p>
//               <div className="bg-white rounded-lg p-4 my-6 inline-block">
//                 <p className="text-sm text-gray-600">Watch Progress</p>
//                 <p className="text-3xl font-bold text-purple-600">
//                   {ballotData.videoProgress.watch_percentage}%
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Required: {ballotData.minimumWatchPercentage}%
//                 </p>
//               </div>
//               <p className="text-purple-600 mb-8">
//                 You can proceed directly to voting.
//               </p>
//               <button
//                 onClick={() => setCurrentStep(4)}
//                 className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
//               >
//                 Continue to Voting →
//               </button>
//             </div>

//             {/* Video Info */}
//             <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
//               <h4 className="text-blue-900 font-bold mb-2 text-sm">ℹ️ About the Video</h4>
//               <p className="text-blue-800 text-xs">
//                 You previously watched {ballotData.videoProgress.watch_percentage}% of the required video. 
//                 Since you met the minimum requirement of {ballotData.minimumWatchPercentage}%, you can proceed directly to voting.
//               </p>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     // Case 2: Need to Watch Video
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <StepIndicator />
//         <div className="max-w-4xl mx-auto px-4 py-8">
//           <VideoWatchProgress
//             electionId={electionId}
//             videoUrl={ballotData.election?.videoUrl || ballotData.election?.topic_video_url}
//             minimumWatchPercentage={ballotData.minimumWatchPercentage}
//             required={ballotData.videoWatchRequired}
//             onComplete={() => setCurrentStep(4)}
//           />
//         </div>
//       </div>
//     );
//   }

//   // ============================================
//   // STEP 4: VOTING
//   // ============================================
//   if (currentStep === 4) {
//     return <ElectionVotingView />;
//   }

//   return null;
// }
//last workable code but to enhance biometirc above code
// // src/components/voting/ElectionAccessGuard.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// /*eslint-disable*/
// import { useSelector } from 'react-redux';
// import { useGetBallotQuery } from '../../redux/api/voting/votingApi';
// import { useCheckElectionPaymentStatusQuery } from '../../redux/api/walllet/electionPaymentApi';
// import { Loader, Shield, Video, AlertCircle, Gift, CheckCircle } from 'lucide-react';

// import ElectionVotingView from '../../pages/election/ElectionVotingView';
// import ElectionPaymentPage from '../../pages/voting/payment/ElectionPaymentPage';
// import AuthenticationSelector from '../Auth/AuthenticationSelector';
// import VideoWatchProgress from '../Dashboard/Tabs/voting/VideoWatchProgress';

// export default function ElectionAccessGuard() {
//   const { electionId } = useParams();
//   const navigate = useNavigate();
  
//   const [currentStep, setCurrentStep] = useState(1);

//   const { data: ballotData, isLoading: ballotLoading, error: ballotError } = useGetBallotQuery(electionId);
//   const { data: paymentStatus } = useCheckElectionPaymentStatusQuery(electionId, {
//     skip: !ballotData?.paymentRequired,
//   });

//   // Check if user already voted - if yes, show receipt
//   useEffect(() => {
//     if (ballotData?.hasVoted) {
//       setCurrentStep(4);
//     }
//   }, [ballotData]);

//   if (ballotLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
//           <p className="text-gray-600 font-medium">Loading election...</p>
//         </div>
//       </div>
//     );
//   }

//   if (ballotError || !ballotData) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
//           <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
//           <p className="text-red-800 font-bold text-center mb-2">Error Loading Election</p>
//           <button
//             onClick={() => navigate('/elections')}
//             className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
//           >
//             Back to Elections
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const isFree = !ballotData.paymentRequired;
//   const hasPaid = paymentStatus?.paid;
//   const videoCompleted = ballotData.videoProgress?.completed;

//   // Progress indicator
//   const StepIndicator = () => (
//     <div className="bg-white shadow-sm py-4 mb-6">
//       <div className="max-w-4xl mx-auto px-4">
//         <div className="flex items-center justify-center gap-4">
//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//               currentStep === 1 ? 'bg-blue-600 text-white' : 
//               currentStep > 1 ? 'bg-green-600 text-white' : 'bg-gray-300'
//             }`}>
//               {currentStep > 1 ? '✓' : '1'}
//             </div>
//             <span className={currentStep === 1 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Payment</span>
//           </div>

//           <div className="w-16 h-1 bg-gray-200"></div>

//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//               currentStep === 2 ? 'bg-blue-600 text-white' : 
//               currentStep > 2 ? 'bg-green-600 text-white' : 'bg-gray-300'
//             }`}>
//               {currentStep > 2 ? '✓' : '2'}
//             </div>
//             <span className={currentStep === 2 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Authentication</span>
//           </div>

//           <div className="w-16 h-1 bg-gray-200"></div>

//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//               currentStep === 3 ? 'bg-blue-600 text-white' : 
//               currentStep > 3 ? 'bg-green-600 text-white' : 'bg-gray-300'
//             }`}>
//               {currentStep > 3 ? '✓' : '3'}
//             </div>
//             <span className={currentStep === 3 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Video</span>
//           </div>

//           <div className="w-16 h-1 bg-gray-200"></div>

//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//               currentStep === 4 ? 'bg-blue-600 text-white' : 'bg-gray-300'
//             }`}>
//               4
//             </div>
//             <span className={currentStep === 4 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Vote</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   // ============================================
//   // STEP 1: PAYMENT - ALWAYS SHOW THIS STEP
//   // ============================================
//   if (currentStep === 1) {
//     // Case 1: Election is FREE
//     if (isFree) {
//       return (
//         <div className="min-h-screen bg-gray-50">
//           <StepIndicator />
//           <div className="max-w-2xl mx-auto px-4 py-8">
//             <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-8 text-center shadow-xl">
//               <Gift className="w-20 h-20 text-green-600 mx-auto mb-4 animate-bounce" />
//               <h2 className="text-3xl font-bold text-green-900 mb-3">
//                 🎉 This Election is FREE!
//               </h2>
//               <p className="text-lg text-green-700 mb-2">
//                 No payment required to participate in this election.
//               </p>
//               <p className="text-green-600 mb-8">
//                 You can proceed directly to the next step.
//               </p>
//               <button
//                 onClick={() => setCurrentStep(2)}
//                 className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
//               >
//                 Continue to Authentication →
//               </button>
//             </div>

//             {/* Election Info */}
//             <div className="mt-6 bg-white rounded-lg p-4 shadow">
//               <h3 className="font-semibold text-gray-900 mb-2">{ballotData.election.title}</h3>
//               <p className="text-sm text-gray-600">{ballotData.election.description}</p>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     // Case 2: Already Paid
//     if (hasPaid) {
//       return (
//         <div className="min-h-screen bg-gray-50">
//           <StepIndicator />
//           <div className="max-w-2xl mx-auto px-4 py-8">
//             <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-500 rounded-2xl p-8 text-center shadow-xl">
//               <CheckCircle className="w-20 h-20 text-blue-600 mx-auto mb-4 animate-pulse" />
//               <h2 className="text-3xl font-bold text-blue-900 mb-3">
//                 ✓ Payment Completed!
//               </h2>
//               <p className="text-lg text-blue-700 mb-2">
//                 You have already paid the participation fee for this election.
//               </p>
//               <div className="bg-white rounded-lg p-4 my-6 inline-block">
//                 <p className="text-sm text-gray-600">Amount Paid</p>
//                 <p className="text-3xl font-bold text-blue-600">
//                   ${ballotData.participationFee.toFixed(2)}
//                 </p>
//               </div>
//               <p className="text-blue-600 mb-8">
//                 You can proceed to the next step.
//               </p>
//               <button
//                 onClick={() => setCurrentStep(2)}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
//               >
//                 Continue to Authentication →
//               </button>
//             </div>

//             {/* Election Info */}
//             <div className="mt-6 bg-white rounded-lg p-4 shadow">
//               <h3 className="font-semibold text-gray-900 mb-2">{ballotData.election.title}</h3>
//               <p className="text-sm text-gray-600">{ballotData.election.description}</p>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     // Case 3: Need to Pay
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <StepIndicator />
//         <ElectionPaymentPage
//           electionId={electionId}
//           amount={ballotData.participationFee}
//           currency="USD"
//           onPaymentComplete={() => setCurrentStep(2)}
//           electionTitle={ballotData.election?.title}
//         />
//       </div>
//     );
//   }

//   // ============================================
//   // STEP 2: AUTHENTICATION - ALWAYS SHOW THIS STEP
//   // ============================================
//   if (currentStep === 2) {
//     const authMethods = ballotData.election?.authentication_methods || ['passkey'];

//     return (
//       <div className="min-h-screen bg-gray-50">
//         <StepIndicator />
//         <div className="max-w-2xl mx-auto px-4 py-8">
//           <AuthenticationSelector 
//             methods={authMethods} 
//             electionId={electionId} 
//             onAuthComplete={() => setCurrentStep(3)} 
//           />
//         </div>
//       </div>
//     );
//   }

//   // ============================================
//   // STEP 3: VIDEO - ALWAYS SHOW THIS STEP
//   // ============================================
//   if (currentStep === 3) {
//     // Case 1: Video Already Completed
//     if (videoCompleted) {
//       return (
//         <div className="min-h-screen bg-gray-50">
//           <StepIndicator />
//           <div className="max-w-4xl mx-auto px-4 py-8">
//             <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-500 rounded-2xl p-8 text-center shadow-xl">
//               <CheckCircle className="w-20 h-20 text-purple-600 mx-auto mb-4 animate-bounce" />
//               <h2 className="text-3xl font-bold text-purple-900 mb-3">
//                 ✓ Video Already Watched!
//               </h2>
//               <p className="text-lg text-purple-700 mb-2">
//                 You have already completed the video requirement for this election.
//               </p>
//               <div className="bg-white rounded-lg p-4 my-6 inline-block">
//                 <p className="text-sm text-gray-600">Watch Progress</p>
//                 <p className="text-3xl font-bold text-purple-600">
//                   {ballotData.videoProgress.watch_percentage}%
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Required: {ballotData.minimumWatchPercentage}%
//                 </p>
//               </div>
//               <p className="text-purple-600 mb-8">
//                 You can proceed directly to voting.
//               </p>
//               <button
//                 onClick={() => setCurrentStep(4)}
//                 className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
//               >
//                 Continue to Voting →
//               </button>
//             </div>

//             {/* Video Info */}
//             <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
//               <h4 className="text-blue-900 font-bold mb-2 text-sm">ℹ️ About the Video</h4>
//               <p className="text-blue-800 text-xs">
//                 You previously watched {ballotData.videoProgress.watch_percentage}% of the required video. 
//                 Since you met the minimum requirement of {ballotData.minimumWatchPercentage}%, you can proceed directly to voting.
//               </p>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     // Case 2: Need to Watch Video
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <StepIndicator />
//         <div className="max-w-4xl mx-auto px-4 py-8">
//           <VideoWatchProgress
//             electionId={electionId}
//             videoUrl={ballotData.election?.videoUrl || ballotData.election?.topic_video_url}
//             minimumWatchPercentage={ballotData.minimumWatchPercentage}
//             required={ballotData.videoWatchRequired}
//             onComplete={() => setCurrentStep(4)}
//           />
//         </div>
//       </div>
//     );
//   }

//   // ============================================
//   // STEP 4: VOTING
//   // ============================================
//   if (currentStep === 4) {
//     return <ElectionVotingView />;
//   }

//   return null;
// }
//last workable perfect code only to implement workable passkey above code
// // src/components/voting/ElectionAccessGuard.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// /*eslint-disable*/
// import { useSelector } from 'react-redux';
// import { useGetBallotQuery } from '../../redux/api/voting/votingApi';
// import { useCheckElectionPaymentStatusQuery } from '../../redux/api/walllet/electionPaymentApi';
// import { Loader, Shield, Video, AlertCircle, Bug, ArrowRight, CheckCircle, Gift } from 'lucide-react';

// import ElectionVotingView from '../../pages/election/ElectionVotingView';
// import ElectionPaymentPage from '../../pages/voting/payment/ElectionPaymentPage';
// import AuthenticationSelector from '../Auth/AuthenticationSelector';
// import VideoWatchProgress from '../Dashboard/Tabs/voting/VideoWatchProgress';

// const SHOW_BYPASS_BUTTON = true; // Set to false in production

// export default function ElectionAccessGuard() {
//   const { electionId } = useParams();
//   const navigate = useNavigate();
  
//   const [currentStep, setCurrentStep] = useState(1);

//   const { data: ballotData, isLoading: ballotLoading, error: ballotError } = useGetBallotQuery(electionId);
//   const { data: paymentStatus } = useCheckElectionPaymentStatusQuery(electionId, {
//     skip: !ballotData?.paymentRequired,
//   });

//   // Check if user already voted - if yes, show receipt
//   useEffect(() => {
//     if (ballotData?.hasVoted) {
//       setCurrentStep(4);
//     }
//   }, [ballotData]);

//   if (ballotLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
//           <p className="text-gray-600 font-medium">Loading election...</p>
//         </div>
//       </div>
//     );
//   }

//   if (ballotError || !ballotData) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
//           <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
//           <p className="text-red-800 font-bold text-center mb-2">Error Loading Election</p>
//           <button
//             onClick={() => navigate('/elections')}
//             className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
//           >
//             Back to Elections
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const isFree = !ballotData.paymentRequired;
//   const hasPaid = paymentStatus?.paid;
//   const videoCompleted = ballotData.videoProgress?.completed;

//   // Progress indicator
//   const StepIndicator = () => (
//     <div className="bg-white shadow-sm py-4 mb-6">
//       <div className="max-w-4xl mx-auto px-4">
//         <div className="flex items-center justify-center gap-4">
//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//               currentStep === 1 ? 'bg-blue-600 text-white' : 
//               currentStep > 1 ? 'bg-green-600 text-white' : 'bg-gray-300'
//             }`}>
//               {currentStep > 1 ? '✓' : '1'}
//             </div>
//             <span className={currentStep === 1 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Payment</span>
//           </div>

//           <div className="w-16 h-1 bg-gray-200"></div>

//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//               currentStep === 2 ? 'bg-blue-600 text-white' : 
//               currentStep > 2 ? 'bg-green-600 text-white' : 'bg-gray-300'
//             }`}>
//               {currentStep > 2 ? '✓' : '2'}
//             </div>
//             <span className={currentStep === 2 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Authentication</span>
//           </div>

//           <div className="w-16 h-1 bg-gray-200"></div>

//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//               currentStep === 3 ? 'bg-blue-600 text-white' : 
//               currentStep > 3 ? 'bg-green-600 text-white' : 'bg-gray-300'
//             }`}>
//               {currentStep > 3 ? '✓' : '3'}
//             </div>
//             <span className={currentStep === 3 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Video</span>
//           </div>

//           <div className="w-16 h-1 bg-gray-200"></div>

//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//               currentStep === 4 ? 'bg-blue-600 text-white' : 'bg-gray-300'
//             }`}>
//               4
//             </div>
//             <span className={currentStep === 4 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Vote</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   // ============================================
//   // STEP 1: PAYMENT - ALWAYS SHOW THIS STEP
//   // ============================================
//   if (currentStep === 1) {
//     // Case 1: Election is FREE
//     if (isFree) {
//       return (
//         <div className="min-h-screen bg-gray-50">
//           <StepIndicator />
//           <div className="max-w-2xl mx-auto px-4 py-8">
//             <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-8 text-center shadow-xl">
//               <Gift className="w-20 h-20 text-green-600 mx-auto mb-4 animate-bounce" />
//               <h2 className="text-3xl font-bold text-green-900 mb-3">
//                 🎉 This Election is FREE!
//               </h2>
//               <p className="text-lg text-green-700 mb-2">
//                 No payment required to participate in this election.
//               </p>
//               <p className="text-green-600 mb-8">
//                 You can proceed directly to the next step.
//               </p>
//               <button
//                 onClick={() => setCurrentStep(2)}
//                 className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
//               >
//                 Continue to Authentication →
//               </button>
//             </div>

//             {/* Election Info */}
//             <div className="mt-6 bg-white rounded-lg p-4 shadow">
//               <h3 className="font-semibold text-gray-900 mb-2">{ballotData.election.title}</h3>
//               <p className="text-sm text-gray-600">{ballotData.election.description}</p>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     // Case 2: Already Paid
//     if (hasPaid) {
//       return (
//         <div className="min-h-screen bg-gray-50">
//           <StepIndicator />
//           <div className="max-w-2xl mx-auto px-4 py-8">
//             <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-500 rounded-2xl p-8 text-center shadow-xl">
//               <CheckCircle className="w-20 h-20 text-blue-600 mx-auto mb-4 animate-pulse" />
//               <h2 className="text-3xl font-bold text-blue-900 mb-3">
//                 ✓ Payment Completed!
//               </h2>
//               <p className="text-lg text-blue-700 mb-2">
//                 You have already paid the participation fee for this election.
//               </p>
//               <div className="bg-white rounded-lg p-4 my-6 inline-block">
//                 <p className="text-sm text-gray-600">Amount Paid</p>
//                 <p className="text-3xl font-bold text-blue-600">
//                   ${ballotData.participationFee.toFixed(2)}
//                 </p>
//               </div>
//               <p className="text-blue-600 mb-8">
//                 You can proceed to the next step.
//               </p>
//               <button
//                 onClick={() => setCurrentStep(2)}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
//               >
//                 Continue to Authentication →
//               </button>
//             </div>

//             {/* Election Info */}
//             <div className="mt-6 bg-white rounded-lg p-4 shadow">
//               <h3 className="font-semibold text-gray-900 mb-2">{ballotData.election.title}</h3>
//               <p className="text-sm text-gray-600">{ballotData.election.description}</p>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     // Case 3: Need to Pay
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <StepIndicator />
//         <ElectionPaymentPage
//           electionId={electionId}
//           amount={ballotData.participationFee}
//           currency="USD"
//           onPaymentComplete={() => setCurrentStep(2)}
//           electionTitle={ballotData.election?.title}
//         />
//       </div>
//     );
//   }

//   // ============================================
//   // STEP 2: AUTHENTICATION - ALWAYS SHOW THIS STEP
//   // ============================================
//   if (currentStep === 2) {
//     const authMethods = ballotData.election?.authentication_methods || ['passkey'];

//     return (
//       <div className="min-h-screen bg-gray-50">
//         <StepIndicator />
//         <div className="max-w-md mx-auto px-4 py-8">
//           {SHOW_BYPASS_BUTTON && (
//             <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6 rounded-r-lg">
//               <div className="flex items-start">
//                 <Bug className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
//                 <div className="ml-3">
//                   <h3 className="text-sm font-bold text-orange-800">Demo Mode</h3>
//                   <p className="text-sm text-orange-700 mt-1">Authentication can be bypassed for demo.</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           <div className="bg-white rounded-2xl shadow-lg p-8">
//             <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
//             <h2 className="text-2xl font-bold text-center mb-2">Authentication Required</h2>
//             <p className="text-gray-600 text-center mb-6">Please authenticate to proceed Shakil</p>

//             <AuthenticationSelector 
//               methods={authMethods} 
//               electionId={electionId} 
//               onAuthComplete={() => setCurrentStep(3)} 
//             />

//             {SHOW_BYPASS_BUTTON && (
//               <div className="mt-6 pt-6 border-t">
//                 <button
//                   onClick={() => setCurrentStep(3)}
//                   className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
//                 >
//                   <Bug size={20} />
//                   Skip Authentication (Demo)
//                   <ArrowRight size={20} />
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ============================================
//   // STEP 3: VIDEO - ALWAYS SHOW THIS STEP
//   // ============================================
//   if (currentStep === 3) {
//     // Case 1: Video Already Completed
//     if (videoCompleted) {
//       return (
//         <div className="min-h-screen bg-gray-50">
//           <StepIndicator />
//           <div className="max-w-4xl mx-auto px-4 py-8">
//             <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-500 rounded-2xl p-8 text-center shadow-xl">
//               <CheckCircle className="w-20 h-20 text-purple-600 mx-auto mb-4 animate-bounce" />
//               <h2 className="text-3xl font-bold text-purple-900 mb-3">
//                 ✓ Video Already Watched!
//               </h2>
//               <p className="text-lg text-purple-700 mb-2">
//                 You have already completed the video requirement for this election.
//               </p>
//               <div className="bg-white rounded-lg p-4 my-6 inline-block">
//                 <p className="text-sm text-gray-600">Watch Progress</p>
//                 <p className="text-3xl font-bold text-purple-600">
//                   {ballotData.videoProgress.watch_percentage}%
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Required: {ballotData.minimumWatchPercentage}%
//                 </p>
//               </div>
//               <p className="text-purple-600 mb-8">
//                 You can proceed directly to voting.
//               </p>
//               <button
//                 onClick={() => setCurrentStep(4)}
//                 className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
//               >
//                 Continue to Voting →
//               </button>
//             </div>

//             {/* Video Info */}
//             <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
//               <h4 className="text-blue-900 font-bold mb-2 text-sm">ℹ️ About the Video</h4>
//               <p className="text-blue-800 text-xs">
//                 You previously watched {ballotData.videoProgress.watch_percentage}% of the required video. 
//                 Since you met the minimum requirement of {ballotData.minimumWatchPercentage}%, you can proceed directly to voting.
//               </p>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     // Case 2: Need to Watch Video
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <StepIndicator />
//         <div className="max-w-4xl mx-auto px-4 py-8">
//           <VideoWatchProgress
//             electionId={electionId}
//             videoUrl={ballotData.election?.videoUrl || ballotData.election?.topic_video_url}
//             minimumWatchPercentage={ballotData.minimumWatchPercentage}
//             required={ballotData.videoWatchRequired}
//             onComplete={() => setCurrentStep(4)}
//           />
//         </div>
//       </div>
//     );
//   }

//   // ============================================
//   // STEP 4: VOTING
//   // ============================================
//   if (currentStep === 4) {
//     return <ElectionVotingView />;
//   }

//   return null;
// }






//last workable code
// // src/components/voting/ElectionAccessGuard.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// /*eslint-disable*/
// import { useSelector } from 'react-redux';
// import { useGetBallotQuery } from '../../redux/api/voting/votingApi';
// import { useCheckElectionPaymentStatusQuery } from '../../redux/api/walllet/electionPaymentApi';
// import { Loader, Shield, Video, AlertCircle, Bug, ArrowRight, CheckCircle } from 'lucide-react';

// import ElectionVotingView from '../../pages/election/ElectionVotingView';
// import ElectionPaymentPage from '../../pages/voting/payment/ElectionPaymentPage';
// import AuthenticationSelector from '../Auth/AuthenticationSelector';
// import VideoWatchProgress from '../Dashboard/Tabs/voting/VideoWatchProgress';

// const SHOW_BYPASS_BUTTON = true; // Set to false in production

// export default function ElectionAccessGuard() {
//   const { electionId } = useParams();
//   const navigate = useNavigate();
  
//   const [currentStep, setCurrentStep] = useState(1);
//   const [paymentCompleted, setPaymentCompleted] = useState(false);
//   const [authCompleted, setAuthCompleted] = useState(false);
//   const [videoCompleted, setVideoCompleted] = useState(false);

//   const { data: ballotData, isLoading: ballotLoading, error: ballotError } = useGetBallotQuery(electionId);
//   const { data: paymentStatus } = useCheckElectionPaymentStatusQuery(electionId, {
//     skip: !ballotData?.paymentRequired,
//   });

//   // Check completed statuses from database
//   useEffect(() => {
//     if (!ballotData) return;

//     // Check payment
//     if (ballotData.paymentRequired && paymentStatus?.paid) {
//       setPaymentCompleted(true);
//     } else if (!ballotData.paymentRequired) {
//       setPaymentCompleted(true);
//     }

//     // Check video (one-time from database)
//     if (ballotData.videoProgress?.completed) {
//       setVideoCompleted(true);
//       console.log('✅ Video already completed');
//     }
//   }, [ballotData, paymentStatus]);

//   if (ballotLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//   <div className="text-center">
//     <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
//     <p className="text-gray-600 font-medium">Loading election...</p>
//   </div>
// </div>
//       // <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       //   <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
//       //   <p className="text-gray-600 font-medium">Loading election...</p>
//       // </div>
//     );
//   }

//   if (ballotError || !ballotData) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
//           <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
//           <p className="text-red-800 font-bold text-center mb-2">Error Loading Election</p>
//           <button
//             onClick={() => navigate('/elections')}
//             className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
//           >
//             Back to Elections
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const handlePaymentComplete = () => {
//     setPaymentCompleted(true);
//     setCurrentStep(2);
//   };

//   const handleAuthComplete = () => {
//     setAuthCompleted(true);
//     setCurrentStep(3);
//   };

//   const handleVideoComplete = () => {
//     setVideoCompleted(true);
//     setCurrentStep(4);
//   };

//   const handleBypassAuth = () => {
//     setAuthCompleted(true);
//     setCurrentStep(3);
//   };

//   const skipToVoting = () => {
//     setCurrentStep(4);
//   };

//   // Progress indicator
//   const StepIndicator = () => (
//     <div className="bg-white shadow-sm py-4 mb-6">
//       <div className="max-w-4xl mx-auto px-4">
//         <div className="flex items-center justify-center gap-4">
//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//               currentStep === 1 ? 'bg-blue-600 text-white' : 
//               paymentCompleted ? 'bg-green-600 text-white' : 'bg-gray-300'
//             }`}>
//               {paymentCompleted ? '✓' : '1'}
//             </div>
//             <span className={currentStep === 1 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Payment</span>
//           </div>

//           <div className="w-16 h-1 bg-gray-200"></div>

//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//               currentStep === 2 ? 'bg-blue-600 text-white' : 
//               authCompleted ? 'bg-green-600 text-white' : 'bg-gray-300'
//             }`}>
//               {authCompleted ? '✓' : '2'}
//             </div>
//             <span className={currentStep === 2 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Authentication</span>
//           </div>

//           <div className="w-16 h-1 bg-gray-200"></div>

//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//               currentStep === 3 ? 'bg-blue-600 text-white' : 
//               videoCompleted ? 'bg-green-600 text-white' : 'bg-gray-300'
//             }`}>
//               {videoCompleted ? '✓' : '3'}
//             </div>
//             <span className={currentStep === 3 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Video</span>
//           </div>

//           <div className="w-16 h-1 bg-gray-200"></div>

//           <div className="flex items-center gap-2">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
//               currentStep === 4 ? 'bg-blue-600 text-white' : 'bg-gray-300'
//             }`}>
//               4
//             </div>
//             <span className={currentStep === 4 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Vote</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   // STEP 1: PAYMENT (Always show)
//   if (currentStep === 1) {
//     if (paymentCompleted) {
//       return (
//         <div className="min-h-screen bg-gray-50">
//           <StepIndicator />
//           <div className="max-w-md mx-auto px-4 py-8">
//             <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-8 text-center">
//               <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4 animate-bounce" />
//               <h3 className="text-2xl font-bold text-green-900 mb-2">✓ Payment Already Completed!</h3>
//               <p className="text-green-700 mb-6">You have already paid for this election.</p>
//               <button
//                 onClick={() => setCurrentStep(2)}
//                 className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold transition"
//               >
//                 Continue to Authentication →
//               </button>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     return (
//       <div className="min-h-screen bg-gray-50">
//         <StepIndicator />
//         <ElectionPaymentPage
//           electionId={electionId}
//           amount={ballotData.participationFee}
//           currency="USD"
//           onPaymentComplete={handlePaymentComplete}
//           electionTitle={ballotData.election?.title}
//         />
//       </div>
//     );
//   }

//   // STEP 2: AUTHENTICATION (Always show - always required)
//   if (currentStep === 2) {
//     const authMethods = ballotData.election?.authentication_methods || ['passkey'];

//     return (
//       <div className="min-h-screen bg-gray-50">
//         <StepIndicator />
//         <div className="max-w-md mx-auto px-4 py-8">
//           {SHOW_BYPASS_BUTTON && (
//             <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6 rounded-r-lg">
//               <div className="flex items-start">
//                 <Bug className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
//                 <div className="ml-3">
//                   <h3 className="text-sm font-bold text-orange-800">Demo Mode</h3>
//                   <p className="text-sm text-orange-700 mt-1">Authentication can be bypassed for demo.</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           <div className="bg-white rounded-2xl shadow-lg p-8">
//             <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
//             <h2 className="text-2xl font-bold text-center mb-2">Authentication Required</h2>
//             <p className="text-gray-600 text-center mb-6">Please authenticate to proceed</p>

//             <AuthenticationSelector 
//               methods={authMethods} 
//               electionId={electionId} 
//               onAuthComplete={handleAuthComplete} 
//             />

//             {SHOW_BYPASS_BUTTON && (
//               <div className="mt-6 pt-6 border-t">
//                 <button
//                   onClick={handleBypassAuth}
//                   className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
//                 >
//                   <Bug size={20} />
//                   Skip Authentication (Demo)
//                   <ArrowRight size={20} />
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // STEP 3: VIDEO (Always show - but different content if completed)
//   if (currentStep === 3) {
//     // ✅ ALWAYS SHOW THIS STEP - but with different content
//     if (videoCompleted) {
//       return (
//         <div className="min-h-screen bg-gray-50">
//           <StepIndicator />
//           <div className="max-w-4xl mx-auto px-4 py-8">
//             {/* Show the "Already Watched" message */}
//             <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-8 text-center mb-6">
//               <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4 animate-bounce" />
//               <h3 className="text-2xl font-bold text-green-900 mb-2">✓ Video Already Watched!</h3>
//               <p className="text-green-700 mb-6">
//                 You have already completed the video requirement for this election.
//               </p>
//               <button
//                 onClick={skipToVoting}
//                 className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold transition"
//               >
//                 Continue to Voting →
//               </button>
//             </div>

//             {/* Optional: Show the video info card */}
//             <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
//               <h4 className="text-blue-900 font-bold mb-2 text-sm">ℹ️ About the Video</h4>
//               <p className="text-blue-800 text-xs">
//                 You watched {ballotData.minimumWatchPercentage}% of the required video on your previous visit. 
//                 You can proceed directly to voting.
//               </p>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     // Show video player if not completed
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <StepIndicator />
//         <div className="max-w-4xl mx-auto px-4 py-8">
//           <VideoWatchProgress
//             electionId={electionId}
//             videoUrl={ballotData.election?.videoUrl || ballotData.election?.topic_video_url}
//             minimumWatchPercentage={ballotData.minimumWatchPercentage}
//             required={true}
//             onComplete={handleVideoComplete}
//           />
//         </div>
//       </div>
//     );
//   }

//   // STEP 4: VOTING
//   if (currentStep === 4) {
//     return <ElectionVotingView />;
//   }

//   return null;
// }
// //last workable fine code
// // // src/components/voting/ElectionAccessGuard.jsx
// // import React, { useState, useEffect } from 'react';
// // import { useParams, useNavigate } from 'react-router-dom';
// // /*eslint-disable*/
// // import { useSelector } from 'react-redux';
// // import { useGetBallotQuery } from '../../redux/api/voting/votingApi';
// // import { useCheckElectionPaymentStatusQuery } from '../../redux/api/walllet/electionPaymentApi';
// // import { Loader, Shield, Video, AlertCircle, Bug, ArrowRight, CheckCircle } from 'lucide-react';

// // import ElectionVotingView from '../../pages/election/ElectionVotingView';
// // import ElectionPaymentPage from '../../pages/voting/payment/ElectionPaymentPage';
// // import AuthenticationSelector from '../Auth/AuthenticationSelector';
// // import VideoWatchProgress from '../Dashboard/Tabs/voting/VideoWatchProgress';

// // const SHOW_BYPASS_BUTTON = true; // Set to false in production

// // export default function ElectionAccessGuard() {
// //   const { electionId } = useParams();
// //   const navigate = useNavigate();
  
// //   const [currentStep, setCurrentStep] = useState(1);
// //   const [paymentCompleted, setPaymentCompleted] = useState(false);
// //   const [authCompleted, setAuthCompleted] = useState(false);
// //   const [videoCompleted, setVideoCompleted] = useState(false);

// //   const { data: ballotData, isLoading: ballotLoading, error: ballotError } = useGetBallotQuery(electionId);
// //   const { data: paymentStatus } = useCheckElectionPaymentStatusQuery(electionId, {
// //     skip: !ballotData?.paymentRequired,
// //   });

// //   // Check completed statuses from database
// //   useEffect(() => {
// //     if (!ballotData) return;

// //     // Check payment
// //     if (ballotData.paymentRequired && paymentStatus?.paid) {
// //       setPaymentCompleted(true);
// //     } else if (!ballotData.paymentRequired) {
// //       setPaymentCompleted(true);
// //     }

// //     // Check video (one-time from database)
// //     if (ballotData.videoProgress?.completed) {
// //       setVideoCompleted(true);
// //       console.log('✅ Video already completed');
// //     }
// //   }, [ballotData, paymentStatus]);

// //   if (ballotLoading) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center bg-gray-50">
// //   <div className="text-center">
// //     <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
// //     <p className="text-gray-600 font-medium">Loading election...</p>
// //   </div>
// // </div>
// //       // <div className="min-h-screen flex items-center justify-center bg-gray-50">
// //       //   <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
// //       //   <p className="text-gray-600 font-medium">Loading election...</p>
// //       // </div>
// //     );
// //   }

// //   if (ballotError || !ballotData) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center bg-gray-50">
// //         <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
// //           <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
// //           <p className="text-red-800 font-bold text-center mb-2">Error Loading Election</p>
// //           <button
// //             onClick={() => navigate('/elections')}
// //             className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
// //           >
// //             Back to Elections
// //           </button>
// //         </div>
// //       </div>
// //     );
// //   }

// //   const handlePaymentComplete = () => {
// //     setPaymentCompleted(true);
// //     setCurrentStep(2);
// //   };

// //   const handleAuthComplete = () => {
// //     setAuthCompleted(true);
// //     setCurrentStep(3);
// //   };

// //   const handleVideoComplete = () => {
// //     setVideoCompleted(true);
// //     setCurrentStep(4);
// //   };

// //   const handleBypassAuth = () => {
// //     setAuthCompleted(true);
// //     setCurrentStep(3);
// //   };

// //   const skipToVoting = () => {
// //     setCurrentStep(4);
// //   };

// //   // Progress indicator
// //   const StepIndicator = () => (
// //     <div className="bg-white shadow-sm py-4 mb-6">
// //       <div className="max-w-4xl mx-auto px-4">
// //         <div className="flex items-center justify-center gap-4">
// //           <div className="flex items-center gap-2">
// //             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
// //               currentStep === 1 ? 'bg-blue-600 text-white' : 
// //               paymentCompleted ? 'bg-green-600 text-white' : 'bg-gray-300'
// //             }`}>
// //               {paymentCompleted ? '✓' : '1'}
// //             </div>
// //             <span className={currentStep === 1 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Payment</span>
// //           </div>

// //           <div className="w-16 h-1 bg-gray-200"></div>

// //           <div className="flex items-center gap-2">
// //             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
// //               currentStep === 2 ? 'bg-blue-600 text-white' : 
// //               authCompleted ? 'bg-green-600 text-white' : 'bg-gray-300'
// //             }`}>
// //               {authCompleted ? '✓' : '2'}
// //             </div>
// //             <span className={currentStep === 2 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Authentication</span>
// //           </div>

// //           <div className="w-16 h-1 bg-gray-200"></div>

// //           <div className="flex items-center gap-2">
// //             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
// //               currentStep === 3 ? 'bg-blue-600 text-white' : 
// //               videoCompleted ? 'bg-green-600 text-white' : 'bg-gray-300'
// //             }`}>
// //               {videoCompleted ? '✓' : '3'}
// //             </div>
// //             <span className={currentStep === 3 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Video</span>
// //           </div>

// //           <div className="w-16 h-1 bg-gray-200"></div>

// //           <div className="flex items-center gap-2">
// //             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
// //               currentStep === 4 ? 'bg-blue-600 text-white' : 'bg-gray-300'
// //             }`}>
// //               4
// //             </div>
// //             <span className={currentStep === 4 ? 'font-semibold text-blue-600' : 'text-gray-600'}>Vote</span>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );

// //   // STEP 1: PAYMENT (Always show)
// //   if (currentStep === 1) {
// //     if (paymentCompleted) {
// //       return (
// //         <div className="min-h-screen bg-gray-50">
// //           <StepIndicator />
// //           <div className="max-w-md mx-auto px-4 py-8">
// //             <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-8 text-center">
// //               <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4 animate-bounce" />
// //               <h3 className="text-2xl font-bold text-green-900 mb-2">✓ Payment Already Completed!</h3>
// //               <p className="text-green-700 mb-6">You have already paid for this election.</p>
// //               <button
// //                 onClick={() => setCurrentStep(2)}
// //                 className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold transition"
// //               >
// //                 Continue to Authentication →
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       );
// //     }

// //     return (
// //       <div className="min-h-screen bg-gray-50">
// //         <StepIndicator />
// //         <ElectionPaymentPage
// //           electionId={electionId}
// //           amount={ballotData.participationFee}
// //           currency="USD"
// //           onPaymentComplete={handlePaymentComplete}
// //           electionTitle={ballotData.election?.title}
// //         />
// //       </div>
// //     );
// //   }

// //   // STEP 2: AUTHENTICATION (Always show - always required)
// //   if (currentStep === 2) {
// //     const authMethods = ballotData.election?.authentication_methods || ['passkey'];

// //     return (
// //       <div className="min-h-screen bg-gray-50">
// //         <StepIndicator />
// //         <div className="max-w-md mx-auto px-4 py-8">
// //           {SHOW_BYPASS_BUTTON && (
// //             <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6 rounded-r-lg">
// //               <div className="flex items-start">
// //                 <Bug className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
// //                 <div className="ml-3">
// //                   <h3 className="text-sm font-bold text-orange-800">Demo Mode</h3>
// //                   <p className="text-sm text-orange-700 mt-1">Authentication can be bypassed for demo.</p>
// //                 </div>
// //               </div>
// //             </div>
// //           )}

// //           <div className="bg-white rounded-2xl shadow-lg p-8">
// //             <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
// //             <h2 className="text-2xl font-bold text-center mb-2">Authentication Required</h2>
// //             <p className="text-gray-600 text-center mb-6">Please authenticate to proceed</p>

// //             <AuthenticationSelector 
// //               methods={authMethods} 
// //               electionId={electionId} 
// //               onAuthComplete={handleAuthComplete} 
// //             />

// //             {SHOW_BYPASS_BUTTON && (
// //               <div className="mt-6 pt-6 border-t">
// //                 <button
// //                   onClick={handleBypassAuth}
// //                   className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
// //                 >
// //                   <Bug size={20} />
// //                   Skip Authentication (Demo)
// //                   <ArrowRight size={20} />
// //                 </button>
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   // STEP 3: VIDEO (Always show - but different content if completed)
// //   if (currentStep === 3) {
// //     // ✅ ALWAYS SHOW THIS STEP - but with different content
// //     if (videoCompleted) {
// //       return (
// //         <div className="min-h-screen bg-gray-50">
// //           <StepIndicator />
// //           <div className="max-w-4xl mx-auto px-4 py-8">
// //             {/* Show the "Already Watched" message */}
// //             <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-8 text-center mb-6">
// //               <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4 animate-bounce" />
// //               <h3 className="text-2xl font-bold text-green-900 mb-2">✓ Video Already Watched!</h3>
// //               <p className="text-green-700 mb-6">
// //                 You have already completed the video requirement for this election.
// //               </p>
// //               <button
// //                 onClick={skipToVoting}
// //                 className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold transition"
// //               >
// //                 Continue to Voting →
// //               </button>
// //             </div>

// //             {/* Optional: Show the video info card */}
// //             <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
// //               <h4 className="text-blue-900 font-bold mb-2 text-sm">ℹ️ About the Video</h4>
// //               <p className="text-blue-800 text-xs">
// //                 You watched {ballotData.minimumWatchPercentage}% of the required video on your previous visit. 
// //                 You can proceed directly to voting.
// //               </p>
// //             </div>
// //           </div>
// //         </div>
// //       );
// //     }

// //     // Show video player if not completed
// //     return (
// //       <div className="min-h-screen bg-gray-50">
// //         <StepIndicator />
// //         <div className="max-w-4xl mx-auto px-4 py-8">
// //           <VideoWatchProgress
// //             electionId={electionId}
// //             videoUrl={ballotData.election?.videoUrl || ballotData.election?.topic_video_url}
// //             minimumWatchPercentage={ballotData.minimumWatchPercentage}
// //             required={true}
// //             onComplete={handleVideoComplete}
// //           />
// //         </div>
// //       </div>
// //     );
// //   }

// //   // STEP 4: VOTING
// //   if (currentStep === 4) {
// //     return <ElectionVotingView />;
// //   }

// //   return null;
// // }