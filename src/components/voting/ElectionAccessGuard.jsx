// src/components/voting/ElectionAccessGuard.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
/*eslint-disable*/
import { useSelector } from 'react-redux';
import { useGetBallotQuery } from '../../redux/api/voting/votingApi';
import { useCheckElectionPaymentStatusQuery } from '../../redux/api/walllet/electionPaymentApi';
import { Loader, Shield, Video, AlertCircle, Gift, CheckCircle, ArrowLeft } from 'lucide-react';

import ElectionVotingView from '../../pages/election/ElectionVotingView';
import ElectionPaymentPage from '../../pages/voting/payment/ElectionPaymentPage';
import AuthenticationSelector from '../Auth/AuthenticationSelector';
import VideoWatchProgress from '../Dashboard/Tabs/voting/VideoWatchProgress';

export default function ElectionAccessGuard() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);

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
    isLoading: ballotLoading,
    error: ballotError,
  });

  if (ballotLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600 font-medium">Loading election...</p>
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

  const isFree = !ballotData.paymentRequired;
  const hasPaid = paymentStatus?.paid;
  const videoCompleted = ballotData.videoProgress?.completed;

  // Progress indicator
  const StepIndicator = () => (
    <div className="bg-white shadow-sm py-4 mb-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-center gap-4">
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
  // STEP 1: PAYMENT - ALWAYS SHOW THIS STEP
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
  // STEP 2: AUTHENTICATION - ALWAYS SHOW THIS STEP
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
  // STEP 3: VIDEO - ALWAYS SHOW THIS STEP
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
  // STEP 4: VOTING
  // ============================================
  if (currentStep === 4) {
    return <ElectionVotingView />;
  }

  return null;
}
