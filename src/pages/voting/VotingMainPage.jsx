// src/pages/voting/VotingMainPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Loader, CheckCircle, XCircle, Lock, AlertCircle, Video, 
  DollarSign, Share2, ArrowLeft, Clock 
} from 'lucide-react';
import { useSelector } from 'react-redux';

// Election API for fallback fetch
import { getElection } from '../../redux/api/election/electionApi';
//import { useGetMyVoteQuery } from '../../redux/api/voting/votingApi';

// // Voting service APIs
import {
  useGetMyVoteQuery,
  useVerifyPaymentQuery,
  useGetVideoProgressQuery,
  useCreatePaymentIntentMutation,
  useGetLotteryStatsQuery,
  useSubmitVoteMutation,
  useUpdateVideoProgressMutation,
} from '../../redux/api/voting-2/votingApi';

export default function VotingMainPage() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  
  // Get auth from Redux
  const { user } = useSelector((state) => state.auth);
  const isAuthenticated = !!user;
  /*eslint-disable*/
  const userId = user?.userId;

  // Check Redux state for election data
  const reduxElection = useSelector((state) => {
    const myElection = state.election?.myElections?.find(
      e => e.id === parseInt(electionId)
    );
    
    const publicElection = state.election?.publicElections?.find(
      e => e.id === parseInt(electionId)
    );
    
    const currentElection = state.election?.id === parseInt(electionId) 
      ? state.election 
      : null;
    
    return myElection || publicElection || currentElection;
  });

  // Local state
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canVote, setCanVote] = useState(false);
  const [votingBlocked, setVotingBlocked] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showVoteForm, setShowVoteForm] = useState(false);
  const [videoPlayer, setVideoPlayer] = useState(null);

  // Fetch election data - Use Redux first, then API
  useEffect(() => {
    const fetchElectionData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Priority 1: Use Redux state if available
        if (reduxElection) {
          console.log('✅ Using election from Redux state:', reduxElection);
          setElection(reduxElection);
          setLoading(false);
          return;
        }
        
        // Priority 2: Fetch from API
        console.log('🔍 Fetching election from API with ID:', electionId);
        const response = await getElection(electionId);
        
        console.log('✅ API Election Response:', response);
        
        if (response && response.data) {
          const electionData = response.data.election || response.data;
          console.log('📊 API Election Data:', electionData);
          setElection(electionData);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('❌ Election fetch error:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load election';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (electionId) {
      fetchElectionData();
    }
  }, [electionId, reduxElection]);

  // RTK Query hooks
  const { data: voteResponse, refetch: refetchVote } = useGetMyVoteQuery(election?.id, {
    skip: !isAuthenticated || !election?.id,
  });

  const { data: paymentResponse, refetch: refetchPayment } = useVerifyPaymentQuery(election?.id, {
    skip: !isAuthenticated || !election?.id || election?.is_free,
  });

  const { data: videoProgressResponse, refetch: refetchVideoProgress } = useGetVideoProgressQuery(election?.id, {
    skip: !isAuthenticated || !election?.id || !election?.video_required,
  });

  const { data: lotteryStatsResponse } = useGetLotteryStatsQuery(election?.id, {
    skip: !election?.id || !election?.lottery_config?.is_lotterized,
  });

  // Mutations
  const [createPaymentIntent, { isLoading: creatingPayment }] = useCreatePaymentIntentMutation();
  const [submitVote, { isLoading: submittingVote }] = useSubmitVoteMutation();
  const [updateVideoProgress] = useUpdateVideoProgressMutation();

  // Extract data
  const userVote = voteResponse?.data;
  const paymentStatus = paymentResponse?.data;
  const videoProgress = videoProgressResponse?.data;
  const lotteryStats = lotteryStatsResponse?.data;

  // Check voting eligibility
  useEffect(() => {
    if (election && isAuthenticated) {
      checkVotingEligibility();
    }
  }, [election, isAuthenticated, userVote, paymentStatus, videoProgress]);

  // Video progress tracking
  useEffect(() => {
    if (election?.video_required && election?.topic_video_url && isAuthenticated) {
      const interval = setInterval(() => {
        trackVideoProgress();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [election, isAuthenticated, videoPlayer]);

  const trackVideoProgress = async () => {
    if (!videoPlayer) return;

    try {
      const currentTime = videoPlayer.currentTime || 0;
      const duration = videoPlayer.duration || 1;
      const percentage = (currentTime / duration) * 100;

      await updateVideoProgress({
        electionId: election.id,
        watchPercentage: percentage,
        lastPosition: currentTime,
        totalDuration: duration,
      }).unwrap();

      refetchVideoProgress();
    } catch (error) {
      console.error('Video progress error:', error);
    }
  };

  const checkVotingEligibility = () => {
    const blockers = [];

    if (userVote) {
      blockers.push('You have already voted in this election');
    }

    if (!election.is_free && paymentStatus?.status !== 'succeeded') {
      blockers.push('Payment required');
    }

    if (election.video_required && election.topic_video_url) {
      const requiredPercentage = election.minimum_video_watch_percentage || 80;
      const currentPercentage = videoProgress?.watchPercentage || videoProgress?.watch_percentage || 0;
      
      if (currentPercentage < requiredPercentage) {
        blockers.push(`Watch at least ${requiredPercentage}% of the video`);
      }
    }

    setVotingBlocked(blockers);
    setCanVote(blockers.length === 0 && isAuthenticated);
  };

  // Fee calculation with regional pricing support
  const calculateTotalFee = () => {
    if (!election) return null;
    
    console.log('💰 Calculating fees for election:', election.id);

    if (election.is_free === true) {
      return {
        isFree: true,
        baseFee: '0.00',
        processingFee: '0.00',
        totalFee: '0.00'
      };
    }

    let baseFee = 0;
    
    // Handle regional pricing
    if (election.pricing_type === 'regional_fee' && election.regional_pricing && Array.isArray(election.regional_pricing)) {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const userCity = userData.city || 'Dhaka';
      
      // Bangladesh/Dhaka maps to Africa region in your pricing
      let userRegion = 'Africa';
      
      const regionalPrice = election.regional_pricing.find(
        rp => rp.region_name === userRegion || rp.region_code === 'region_4_africa'
      );
      
      if (regionalPrice) {
        // Field is "participation_fee" in API response
        baseFee = parseFloat(regionalPrice.participation_fee || regionalPrice.fee || 0);
        console.log(`✅ Using regional price for ${userRegion}: $${baseFee}`);
      } else {
        // Fallback to first regional price
        const firstRegional = election.regional_pricing[0];
        baseFee = parseFloat(firstRegional.participation_fee || firstRegional.fee || 0);
        console.log(`⚠️ Using first regional price: $${baseFee}`);
      }
    } else {
      baseFee = parseFloat(election.general_participation_fee || 0);
      console.log(`Using general participation fee: $${baseFee}`);
    }

    const processingFeePercent = parseFloat(election.processing_fee_percentage || 0);
    const processingFee = (baseFee * processingFeePercent) / 100;
    
    const result = {
      isFree: false,
      baseFee: baseFee.toFixed(2),
      processingFee: processingFee.toFixed(2),
      totalFee: (baseFee + processingFee).toFixed(2),
    };
    
    console.log('💰 Final calculated fees:', result);
    return result;
  };

  const fees = calculateTotalFee();

  const handlePayment = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to make payment');
      navigate('/auth');
      return;
    }

    try {
      const response = await createPaymentIntent({ 
        electionId: election.id 
      }).unwrap();
      
      const paymentData = response.data;
      const { clientSecret, gateway, transactionId } = paymentData;

      if (gateway === 'stripe') {
        const paymentWindow = window.open(
          `/payment/stripe?clientSecret=${clientSecret}&electionId=${election.id}`, 
          '_blank',
          'width=600,height=700'
        );

        const checkPayment = setInterval(() => {
          if (paymentWindow.closed) {
            clearInterval(checkPayment);
            refetchPayment();
            toast.info('Checking payment status...');
          }
        }, 1000);
      } else {
        window.open(`/payment/paddle?transactionId=${transactionId}`, '_blank');
      }

      toast.info('Complete payment in the new window');
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.data?.message || 'Failed to initiate payment');
    }
  };

  const handleAnswerSelect = (questionId, optionId, allowMultiple) => {
    setSelectedAnswers(prev => {
      const current = prev[questionId] || [];
      
      if (allowMultiple) {
        if (current.includes(optionId)) {
          return {
            ...prev,
            [questionId]: current.filter(id => id !== optionId)
          };
        } else {
          return {
            ...prev,
            [questionId]: [...current, optionId]
          };
        }
      } else {
        return {
          ...prev,
          [questionId]: [optionId]
        };
      }
    });
  };

  const handleVoteSubmit = async () => {
    const unanswered = election.questions?.filter(q => {
      const answers = selectedAnswers[q.id] || [];
      return answers.length === 0;
    });

    if (unanswered && unanswered.length > 0) {
      toast.error('Please answer all questions');
      return;
    }

    try {
      const response = await submitVote({
        electionId: election.id,
        answers: selectedAnswers,
      }).unwrap();

      toast.success('Vote submitted successfully! 🎉');
      refetchVote();
      setShowVoteForm(false);
      
      const voteData = response.data;
      if (voteData?.verificationCode) {
        toast.success(`Receipt Code: ${voteData.verificationCode}`, {
          autoClose: 10000,
        });
      }
    } catch (error) {
      console.error('Vote submission error:', error);
      toast.error(error.data?.message || 'Failed to submit vote');
    }
  };

  const getElectionStatus = () => {
    if (!election) return null;

    const now = new Date();
    const startDate = new Date(election.start_date);
    const endDate = new Date(election.end_date);

    if (election.status === 'draft') {
      return { active: false, message: 'Election is in draft mode' };
    }

    if (now < startDate) {
      return { active: false, message: `Election starts on ${startDate.toLocaleDateString()}` };
    }

    if (now > endDate) {
      return { active: false, message: 'Election has ended' };
    }

    return { active: true, message: 'Election is active' };
  };

  const electionStatus = election ? getElectionStatus() : null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4 mx-auto"></div>
          <p className="text-gray-600"> Loading election...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !election) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <XCircle className="text-red-600 mx-auto mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Election Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'Failed to load election'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Inactive election
  if (!electionStatus?.active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <AlertCircle className="text-yellow-600 mx-auto mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Election Not Active</h2>
          <p className="text-gray-600 mb-6">{electionStatus.message}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-2xl font-bold text-blue-600">Vottery</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const shareUrl = `${window.location.origin}/vote/${election.id}`;
                  navigator.clipboard.writeText(shareUrl);
                  toast.success('Link copied!');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition flex items-center gap-2"
              >
                <Share2 size={18} />
                Share
              </button>
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={() => navigate('/auth')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Login to Vote
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Election Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          {election.topic_image_url && (
            <img
              src={election.topic_image_url}
              alt={election.title}
              className="w-full h-64 object-cover"
            />
          )}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl font-bold text-gray-800">{election.title}</h1>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                ✅ Active
              </span>
              {election.lottery_config?.is_lotterized && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full">
                  🎰 Lottery
                </span>
              )}
              {!election.is_free && fees && !fees.isFree && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                  💰 ${fees.totalFee}
                </span>
              )}
            </div>
            {election.description && (
              <p className="text-gray-600 mb-4">{election.description}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock size={16} />
                {formatDate(election.start_date)} - {formatDate(election.end_date)}
              </span>
              <span>🗳️ Votes: {lotteryStats?.totalTickets || election.vote_count || 0}</span>
            </div>
          </div>
        </div>

        {/* Already Voted */}
        {userVote && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600" size={32} />
              <div>
                <h3 className="text-lg font-bold text-green-800">You've Already Voted!</h3>
                <p className="text-green-600">Thank you for participating in this election.</p>
                {userVote.receiptId && (
                  <p className="text-sm text-green-600 mt-2">
                    Receipt: <code className="bg-green-100 px-2 py-1 rounded">{userVote.receiptId}</code>
                  </p>
                )}
                {election.lottery_config?.is_lotterized && (
                  <p className="text-sm text-purple-600 mt-2">
                    🎰 You've been entered into the lottery!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Payment Requirement */}
            {!election.is_free && fees && !fees.isFree && paymentStatus?.status !== 'succeeded' && !userVote && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Lock className="text-yellow-600 mt-1 flex-shrink-0" size={28} />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-yellow-800 mb-2">🔒 Payment Required</h3>
                    <p className="text-yellow-700 mb-4">
                      This election requires a participation fee.
                    </p>
                    
                    <div className="bg-white rounded-lg p-4 mb-4 border border-yellow-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Base Fee:</span>
                        <span className="font-semibold text-lg">${fees.baseFee}</span>
                      </div>
                      {parseFloat(fees.processingFee) > 0 && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">
                            Processing Fee ({election.processing_fee_percentage}%):
                          </span>
                          <span className="font-semibold text-lg">${fees.processingFee}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-3 border-t-2">
                        <span className="font-bold text-lg">Total:</span>
                        <span className="font-bold text-2xl text-blue-600">${fees.totalFee}</span>
                      </div>
                    </div>

                    <button
                      onClick={handlePayment}
                      disabled={creatingPayment}
                      className="w-full px-6 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {creatingPayment ? (
                        <>
                          <Loader className="animate-spin" size={20} />
                          Processing...
                        </>
                      ) : (
                        <>
                          <DollarSign size={20} />
                          Pay ${fees.totalFee} Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Video Requirement */}
            {election.video_required && election.topic_video_url && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Video className="text-blue-600 mt-1" size={28} />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-blue-800 mb-2">📹 Video Required</h3>
                    <p className="text-blue-700 mb-4">
                      Watch at least <strong>{election.minimum_video_watch_percentage || 80}%</strong>
                    </p>
                    {videoProgress && (
                      <div className="mb-4">
                        <div className="flex justify-between mb-1">
                          <span>Progress:</span>
                          <span className="font-bold">
                            {(videoProgress.watchPercentage || videoProgress.watch_percentage || 0).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-blue-600 h-3 rounded-full transition-all"
                            style={{ width: `${videoProgress.watchPercentage || videoProgress.watch_percentage || 0}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    ref={(el) => setVideoPlayer(el)}
                    src={election.topic_video_url}
                    controls
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}

            {/* Requirements Checklist */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-2">
              <h3 className="text-xl font-bold mb-4">📋 Voting Requirements</h3>
              <div className="space-y-3">
                <div className={`flex items-center gap-3 p-3 rounded-lg ${isAuthenticated ? 'bg-green-50' : 'bg-red-50'}`}>
                  {isAuthenticated ? <CheckCircle className="text-green-600" size={24} /> : <XCircle className="text-red-600" size={24} />}
                  <span className={`font-semibold ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                    {isAuthenticated ? '✓ Logged in' : '✗ Login required'}
                  </span>
                </div>

                {!election.is_free && fees && !fees.isFree && (
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${paymentStatus?.status === 'succeeded' ? 'bg-green-50' : 'bg-red-50'}`}>
                    {paymentStatus?.status === 'succeeded' ? <CheckCircle className="text-green-600" size={24} /> : <XCircle className="text-red-600" size={24} />}
                    <span className={`font-semibold ${paymentStatus?.status === 'succeeded' ? 'text-green-600' : 'text-red-600'}`}>
                      {paymentStatus?.status === 'succeeded' ? '✓ Payment completed' : '✗ Payment required'}
                    </span>
                  </div>
                )}

                {election.video_required && (
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${(videoProgress?.watchPercentage || 0) >= 80 ? 'bg-green-50' : 'bg-red-50'}`}>
                    {(videoProgress?.watchPercentage || 0) >= 80 ? <CheckCircle className="text-green-600" size={24} /> : <XCircle className="text-red-600" size={24} />}
                    <span className={`font-semibold ${(videoProgress?.watchPercentage || 0) >= 80 ? 'text-green-600' : 'text-red-600'}`}>
                      {(videoProgress?.watchPercentage || 0) >= 80 ? '✓ Video completed' : '✗ Video required'}
                    </span>
                  </div>
                )}

                <div className={`flex items-center gap-3 p-3 rounded-lg ${!userVote ? 'bg-green-50' : 'bg-red-50'}`}>
                  {!userVote ? <CheckCircle className="text-green-600" size={24} /> : <XCircle className="text-red-600" size={24} />}
                  <span className={`font-semibold ${!userVote ? 'text-green-600' : 'text-red-600'}`}>
                    {!userVote ? "✓ Haven't voted" : '✗ Already voted'}
                  </span>
                </div>
              </div>

              {canVote && !showVoteForm && (
                <button
                  onClick={() => setShowVoteForm(true)}
                  className="w-full mt-6 px-6 py-4 bg-green-600 text-white text-lg font-bold rounded-lg hover:bg-green-700 shadow-lg"
                >
                  ✅ START VOTING NOW
                </button>
              )}

              {!canVote && !userVote && votingBlocked.length > 0 && (
                <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <p className="font-bold text-red-800 mb-2">⚠️ Cannot vote yet:</p>
                  <ul className="list-disc list-inside text-red-700 space-y-1">
                    {votingBlocked.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Vote Form */}
            {showVoteForm && canVote && !userVote && election.questions && (
              <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-blue-500">
                <h2 className="text-2xl font-bold mb-6">🗳️ Cast Your Vote</h2>

                <div className="space-y-8">
                  {election.questions.map((question, idx) => (
                    <div key={question.id} className="border-b pb-6 last:border-b-0">
                      <h3 className="text-lg font-bold mb-1">
                        {idx + 1}. {question.question_text}
                      </h3>
                      {question.allow_multiple_answers && (
                        <p className="text-sm text-gray-500 mb-3">(Select multiple)</p>
                      )}

                      <div className="space-y-3 mt-4">
                        {question.options?.map((option) => {
                          const isSelected = (selectedAnswers[question.id] || []).includes(option.id);
                          
                          return (
                            <button
                              key={option.id}
                              onClick={() => handleAnswerSelect(question.id, option.id, question.allow_multiple_answers)}
                              className={`w-full text-left p-4 rounded-lg border-2 transition ${
                                isSelected ? 'border-blue-500 bg-blue-50 shadow' : 'border-gray-200 hover:border-blue-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-400'
                                }`}>
                                  {isSelected && <CheckCircle className="text-white" size={16} />}
                                </div>
                                <p className="font-semibold">{option.option_text}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => setShowVoteForm(false)}
                    className="px-6 py-3 border-2 rounded-lg hover:bg-gray-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVoteSubmit}
                    disabled={submittingVote}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submittingVote ? (
                      <>
                        <Loader className="animate-spin" size={20} />
                        Submitting...
                      </>
                    ) : (
                      '✅ Submit Vote'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold mb-4">Election Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-semibold text-green-600">Active</p>
                </div>
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-semibold capitalize">{election.voting_type || 'plurality'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Votes</p>
                  <p className="font-semibold text-xl">{lotteryStats?.totalTickets || election.vote_count || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500">Ends On</p>
                  <p className="font-semibold">{formatDate(election.end_date)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Participation Fee</p>
                  <p className="font-semibold text-green-600 text-xl">
                    {election.is_free || (fees && fees.isFree) ? 'Free' : `$${fees?.totalFee || '0.00'}`}
                  </p>
                  {!election.is_free && fees && !fees.isFree && parseFloat(fees.processingFee) > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Base: ${fees.baseFee} + Processing: ${fees.processingFee}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {election.lottery_config?.is_lotterized && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow p-6 border border-purple-200">
                <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🎰</span>
                  Lottery Draw
                </h3>
                <p className="text-sm text-purple-700 mb-4">
                  Vote to enter the lottery!
                </p>
                <div className="space-y-3">
                  <div className="bg-white rounded p-3">
                    <p className="text-xs text-gray-500">Prize Pool</p>
                    <p className="font-bold text-purple-900 text-lg">
                      {election.lottery_config.prize_description || `$${election.lottery_config.reward_amount || 0}`}
                    </p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs text-gray-500">Winners</p>
                    <p className="font-bold text-purple-900 text-lg">{election.lottery_config.winner_count}</p>
                  </div>
                  {lotteryStats && (
                    <div className="bg-white rounded p-3">
                      <p className="text-xs text-gray-500">Participants</p>
                      <p className="font-bold text-purple-900 text-lg">{lotteryStats.totalTickets}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
// // src/pages/voting/VotingMainPage.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { 
//   Loader, CheckCircle, XCircle, Lock, AlertCircle, Video, 
//   DollarSign, Share2, ArrowLeft, Clock 
// } from 'lucide-react';
// import { useSelector } from 'react-redux';

// // ✅ Use AXIOS like AllElections does
// import { getElection } from '../../redux/api/election/electionApi';
// //import { useGetMyVoteQuery } from '../../redux/api/voting/votingApi';

// // ✅ Use RTK Query ONLY for voting features
// import {
//   useGetMyVoteQuery,
//   useVerifyPaymentQuery,
//   useGetVideoProgressQuery,
//   useCreatePaymentIntentMutation,
//   useGetLotteryStatsQuery,
//   useSubmitVoteMutation,
//   useUpdateVideoProgressMutation,
// } from '../../redux/api/voting/votingApi';

// export default function VotingMainPage() {
//   const { electionId } = useParams();
//   const navigate = useNavigate();
  
//   // Get auth from Redux
//   const { user } = useSelector((state) => state.auth);
//   const isAuthenticated = !!user;
//   /*eslint-disable*/
//   const userId = user?.userId;

//   // ✅ Local state for election (same pattern as AllElections)
//   const [election, setElection] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Local state for voting
//   const [canVote, setCanVote] = useState(false);
//   const [votingBlocked, setVotingBlocked] = useState([]);
//   const [selectedAnswers, setSelectedAnswers] = useState({});
//   const [showVoteForm, setShowVoteForm] = useState(false);
//   const [videoPlayer, setVideoPlayer] = useState(null);

//   // ✅ Fetch election data on mount (same as AllElections pattern)
//   useEffect(() => {
//     const fetchElectionData = async () => {
//       try {
//         setLoading(true);
//         setError(null);
        
//         console.log('🔍 Fetching election with ID:', electionId);
//         const response = await getElection(electionId);
        
//         console.log('✅ Election response:', response);
        
//         // Handle different response formats
//         if (response && response.data) {
//           const electionData = response.data.election || response.data;
//           console.log('📊 Election data:', electionData);
//           setElection(electionData);
//         } else if (response && response.election) {
//           setElection(response.election);
//         } else {
//           throw new Error('Unexpected response format');
//         }
//       } catch (err) {
//         console.error('❌ Election fetch error:', err);
//         const errorMessage = err.response?.data?.message || err.message || 'Failed to load election';
//         setError(errorMessage);
//         toast.error(errorMessage);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (electionId) {
//       fetchElectionData();
//     }
//   }, [electionId]);

//   // ✅ RTK Query hooks (only after election is loaded)
//   const { data: voteResponse, refetch: refetchVote } = useGetMyVoteQuery(election?.id, {
//     skip: !isAuthenticated || !election?.id,
//   });

//   const { data: paymentResponse, refetch: refetchPayment } = useVerifyPaymentQuery(election?.id, {
//     skip: !isAuthenticated || !election?.id || election?.is_free,
//   });

//   const { data: videoProgressResponse, refetch: refetchVideoProgress } = useGetVideoProgressQuery(election?.id, {
//     skip: !isAuthenticated || !election?.id || !election?.video_required,
//   });

//   const { data: lotteryStatsResponse } = useGetLotteryStatsQuery(election?.id, {
//     skip: !election?.id || !election?.lottery_config?.is_lotterized,
//   });

//   // Mutations
//   const [createPaymentIntent, { isLoading: creatingPayment }] = useCreatePaymentIntentMutation();
//   const [submitVote, { isLoading: submittingVote }] = useSubmitVoteMutation();
//   const [updateVideoProgress] = useUpdateVideoProgressMutation();

//   // Extract data from responses
//   const userVote = voteResponse?.data;
//   const paymentStatus = paymentResponse?.data;
//   const videoProgress = videoProgressResponse?.data;
//   const lotteryStats = lotteryStatsResponse?.data;

//   // Check voting eligibility
//   useEffect(() => {
//     if (election && isAuthenticated) {
//       checkVotingEligibility();
//     }
//   }, [election, isAuthenticated, userVote, paymentStatus, videoProgress]);

//   // Video progress tracking
//   useEffect(() => {
//     if (election?.video_required && election?.topic_video_url && isAuthenticated) {
//       const interval = setInterval(() => {
//         trackVideoProgress();
//       }, 5000);

//       return () => clearInterval(interval);
//     }
//   }, [election, isAuthenticated, videoPlayer]);

//   const trackVideoProgress = async () => {
//     if (!videoPlayer) return;

//     try {
//       const currentTime = videoPlayer.currentTime || 0;
//       const duration = videoPlayer.duration || 1;
//       const percentage = (currentTime / duration) * 100;

//       await updateVideoProgress({
//         electionId: election.id,
//         watchPercentage: percentage,
//         lastPosition: currentTime,
//         totalDuration: duration,
//       }).unwrap();

//       refetchVideoProgress();
//     } catch (error) {
//       console.error('Video progress error:', error);
//     }
//   };

//   const checkVotingEligibility = () => {
//     const blockers = [];

//     if (userVote) {
//       blockers.push('You have already voted in this election');
//     }

//     if (!election.is_free && paymentStatus?.status !== 'succeeded') {
//       blockers.push('Payment required');
//     }

//     if (election.video_required && election.topic_video_url) {
//       const requiredPercentage = election.minimum_video_watch_percentage || 80;
//       const currentPercentage = videoProgress?.watchPercentage || videoProgress?.watch_percentage || 0;
      
//       if (currentPercentage < requiredPercentage) {
//         blockers.push(`Watch at least ${requiredPercentage}% of the video`);
//       }
//     }

//     setVotingBlocked(blockers);
//     setCanVote(blockers.length === 0 && isAuthenticated);
//   };

//   const calculateTotalFee = () => {
//     if (!election || election.is_free) return null;

//     const baseFee = parseFloat(election.general_participation_fee || 0);
//     const processingFeePercent = parseFloat(election.processing_fee_percentage || 0);
//     const processingFee = (baseFee * processingFeePercent) / 100;
    
//     return {
//       baseFee: baseFee.toFixed(2),
//       processingFee: processingFee.toFixed(2),
//       totalFee: (baseFee + processingFee).toFixed(2),
//     };
//   };

//   const fees = calculateTotalFee();

//   const handlePayment = async () => {
//     if (!isAuthenticated) {
//       toast.error('Please login to make payment');
//       navigate('/auth');
//       return;
//     }

//     try {
//       const response = await createPaymentIntent({ 
//         electionId: election.id 
//       }).unwrap();
      
//       const paymentData = response.data;
//       const { clientSecret, gateway, transactionId } = paymentData;

//       if (gateway === 'stripe') {
//         const paymentWindow = window.open(
//           `/payment/stripe?clientSecret=${clientSecret}&electionId=${election.id}`, 
//           '_blank',
//           'width=600,height=700'
//         );

//         const checkPayment = setInterval(() => {
//           if (paymentWindow.closed) {
//             clearInterval(checkPayment);
//             refetchPayment();
//             toast.info('Checking payment status...');
//           }
//         }, 1000);
//       } else {
//         window.open(`/payment/paddle?transactionId=${transactionId}`, '_blank');
//       }

//       toast.info('Complete payment in the new window');
//     } catch (error) {
//       console.error('Payment error:', error);
//       toast.error(error.data?.message || 'Failed to initiate payment');
//     }
//   };

//   const handleAnswerSelect = (questionId, optionId, allowMultiple) => {
//     setSelectedAnswers(prev => {
//       const current = prev[questionId] || [];
      
//       if (allowMultiple) {
//         if (current.includes(optionId)) {
//           return {
//             ...prev,
//             [questionId]: current.filter(id => id !== optionId)
//           };
//         } else {
//           return {
//             ...prev,
//             [questionId]: [...current, optionId]
//           };
//         }
//       } else {
//         return {
//           ...prev,
//           [questionId]: [optionId]
//         };
//       }
//     });
//   };

//   const handleVoteSubmit = async () => {
//     const unanswered = election.questions?.filter(q => {
//       const answers = selectedAnswers[q.id] || [];
//       return answers.length === 0;
//     });

//     if (unanswered && unanswered.length > 0) {
//       toast.error('Please answer all questions');
//       return;
//     }

//     try {
//       const response = await submitVote({
//         electionId: election.id,
//         answers: selectedAnswers,
//       }).unwrap();

//       toast.success('Vote submitted successfully! 🎉');
//       refetchVote();
//       setShowVoteForm(false);
      
//       const voteData = response.data;
//       if (voteData?.verificationCode) {
//         toast.success(`Receipt Code: ${voteData.verificationCode}`, {
//           autoClose: 10000,
//         });
//       }
//     } catch (error) {
//       console.error('Vote submission error:', error);
//       toast.error(error.data?.message || 'Failed to submit vote');
//     }
//   };

//   const getElectionStatus = () => {
//     if (!election) return null;

//     const now = new Date();
//     const startDate = new Date(election.start_date);
//     const endDate = new Date(election.end_date);

//     if (election.status === 'draft') {
//       return { active: false, message: 'Election is in draft mode' };
//     }

//     if (now < startDate) {
//       return { active: false, message: `Election starts on ${startDate.toLocaleDateString()}` };
//     }

//     if (now > endDate) {
//       return { active: false, message: 'Election has ended' };
//     }

//     return { active: true, message: 'Election is active' };
//   };

//   const electionStatus = election ? getElectionStatus() : null;

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleDateString('en-US', { 
//       month: 'short', 
//       day: 'numeric', 
//       year: 'numeric' 
//     });
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4 mx-auto"></div>
//           <p className="text-gray-600">Loading election...</p>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (error || !election) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
//         <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
//           <XCircle className="text-red-600 mx-auto mb-4" size={64} />
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Election Not Found</h2>
//           <p className="text-gray-600 mb-6">{error || 'Failed to load election'}</p>
//           <button
//             onClick={() => navigate('/dashboard')}
//             className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//           >
//             Go to Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Inactive election
//   if (!electionStatus?.active) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
//         <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
//           <AlertCircle className="text-yellow-600 mx-auto mb-4" size={64} />
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Election Not Active</h2>
//           <p className="text-gray-600 mb-6">{electionStatus.message}</p>
//           <button
//             onClick={() => navigate('/dashboard')}
//             className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//           >
//             Go to Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white shadow-sm border-b sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <button
//                 onClick={() => navigate(-1)}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition"
//               >
//                 <ArrowLeft size={24} />
//               </button>
//               <h1 className="text-2xl font-bold text-blue-600">Vottery</h1>
//             </div>
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => {
//                   const shareUrl = `${window.location.origin}/vote/${election.id}`;
//                   navigator.clipboard.writeText(shareUrl);
//                   toast.success('Link copied!');
//                 }}
//                 className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition flex items-center gap-2"
//               >
//                 <Share2 size={18} />
//                 Share
//               </button>
//               {isAuthenticated ? (
//                 <button
//                   onClick={() => navigate('/dashboard')}
//                   className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
//                 >
//                   Dashboard
//                 </button>
//               ) : (
//                 <button
//                   onClick={() => navigate('/auth')}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//                 >
//                   Login to Vote
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 py-8">
//         {/* Election Header */}
//         <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
//           {election.topic_image_url && (
//             <img
//               src={election.topic_image_url}
//               alt={election.title}
//               className="w-full h-64 object-cover"
//             />
//           )}
//           <div className="p-6">
//             <div className="flex items-center gap-3 mb-2 flex-wrap">
//               <h1 className="text-3xl font-bold text-gray-800">{election.title}</h1>
//               <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
//                 ✅ Active
//               </span>
//               {election.lottery_config?.is_lotterized && (
//                 <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full">
//                   🎰 Lottery
//                 </span>
//               )}
//               {!election.is_free && (
//                 <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
//                   💰 ${fees?.totalFee || '0.00'}
//                 </span>
//               )}
//             </div>
//             {election.description && (
//               <p className="text-gray-600 mb-4">{election.description}</p>
//             )}
//             <div className="flex flex-wrap gap-4 text-sm text-gray-500">
//               <span className="flex items-center gap-1">
//                 <Clock size={16} />
//                 {formatDate(election.start_date)} - {formatDate(election.end_date)}
//               </span>
//               <span>🗳️ Votes: {lotteryStats?.totalTickets || election.vote_count || 0}</span>
//             </div>
//           </div>
//         </div>

//         {/* Already Voted */}
//         {userVote && (
//           <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-8">
//             <div className="flex items-center gap-3">
//               <CheckCircle className="text-green-600" size={32} />
//               <div>
//                 <h3 className="text-lg font-bold text-green-800">You've Already Voted!</h3>
//                 <p className="text-green-600">Thank you for participating in this election.</p>
//                 {userVote.receiptId && (
//                   <p className="text-sm text-green-600 mt-2">
//                     Receipt: <code className="bg-green-100 px-2 py-1 rounded">{userVote.receiptId}</code>
//                   </p>
//                 )}
//                 {election.lottery_config?.is_lotterized && (
//                   <p className="text-sm text-purple-600 mt-2">
//                     🎰 You've been entered into the lottery!
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Main Content */}
//           <div className="lg:col-span-2 space-y-6">
            
//             {/* Payment Requirement */}
//             {!election.is_free && paymentStatus?.status !== 'succeeded' && !userVote && (
//               <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
//                 <div className="flex items-start gap-4">
//                   <Lock className="text-yellow-600 mt-1 flex-shrink-0" size={28} />
//                   <div className="flex-1">
//                     <h3 className="text-xl font-bold text-yellow-800 mb-2">🔒 Payment Required</h3>
//                     <p className="text-yellow-700 mb-4">
//                       This election requires a participation fee.
//                     </p>
                    
//                     {fees && (
//                       <div className="bg-white rounded-lg p-4 mb-4 border border-yellow-200">
//                         <div className="flex justify-between items-center mb-2">
//                           <span className="text-gray-600">Base Fee:</span>
//                           <span className="font-semibold text-lg">${fees.baseFee}</span>
//                         </div>
//                         {parseFloat(fees.processingFee) > 0 && (
//                           <div className="flex justify-between items-center mb-2">
//                             <span className="text-gray-600">
//                               Processing Fee ({election.processing_fee_percentage}%):
//                             </span>
//                             <span className="font-semibold text-lg">${fees.processingFee}</span>
//                           </div>
//                         )}
//                         <div className="flex justify-between items-center pt-3 border-t-2">
//                           <span className="font-bold text-lg">Total:</span>
//                           <span className="font-bold text-2xl text-blue-600">${fees.totalFee}</span>
//                         </div>
//                       </div>
//                     )}

//                     <button
//                       onClick={handlePayment}
//                       disabled={creatingPayment}
//                       className="w-full px-6 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition font-bold disabled:opacity-50 flex items-center justify-center gap-2"
//                     >
//                       {creatingPayment ? (
//                         <>
//                           <Loader className="animate-spin" size={20} />
//                           Processing...
//                         </>
//                       ) : (
//                         <>
//                           <DollarSign size={20} />
//                           Pay ${fees?.totalFee} Now
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Video Requirement */}
//             {election.video_required && election.topic_video_url && (
//               <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
//                 <div className="flex items-start gap-4 mb-4">
//                   <Video className="text-blue-600 mt-1" size={28} />
//                   <div className="flex-1">
//                     <h3 className="text-xl font-bold text-blue-800 mb-2">📹 Video Required</h3>
//                     <p className="text-blue-700 mb-4">
//                       Watch at least <strong>{election.minimum_video_watch_percentage || 80}%</strong>
//                     </p>
//                     {videoProgress && (
//                       <div className="mb-4">
//                         <div className="flex justify-between mb-1">
//                           <span>Progress:</span>
//                           <span className="font-bold">
//                             {(videoProgress.watchPercentage || videoProgress.watch_percentage || 0).toFixed(1)}%
//                           </span>
//                         </div>
//                         <div className="w-full bg-gray-200 rounded-full h-3">
//                           <div
//                             className="bg-blue-600 h-3 rounded-full transition-all"
//                             style={{ width: `${videoProgress.watchPercentage || videoProgress.watch_percentage || 0}%` }}
//                           />
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="aspect-video bg-black rounded-lg overflow-hidden">
//                   <video
//                     ref={(el) => setVideoPlayer(el)}
//                     src={election.topic_video_url}
//                     controls
//                     className="w-full h-full"
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Requirements Checklist */}
//             <div className="bg-white rounded-lg shadow-lg p-6 border-2">
//               <h3 className="text-xl font-bold mb-4">📋 Voting Requirements</h3>
//               <div className="space-y-3">
//                 <div className={`flex items-center gap-3 p-3 rounded-lg ${isAuthenticated ? 'bg-green-50' : 'bg-red-50'}`}>
//                   {isAuthenticated ? <CheckCircle className="text-green-600" size={24} /> : <XCircle className="text-red-600" size={24} />}
//                   <span className={`font-semibold ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
//                     {isAuthenticated ? '✓ Logged in' : '✗ Login required'}
//                   </span>
//                 </div>

//                 {!election.is_free && (
//                   <div className={`flex items-center gap-3 p-3 rounded-lg ${paymentStatus?.status === 'succeeded' ? 'bg-green-50' : 'bg-red-50'}`}>
//                     {paymentStatus?.status === 'succeeded' ? <CheckCircle className="text-green-600" size={24} /> : <XCircle className="text-red-600" size={24} />}
//                     <span className={`font-semibold ${paymentStatus?.status === 'succeeded' ? 'text-green-600' : 'text-red-600'}`}>
//                       {paymentStatus?.status === 'succeeded' ? '✓ Payment completed' : '✗ Payment required'}
//                     </span>
//                   </div>
//                 )}

//                 {election.video_required && (
//                   <div className={`flex items-center gap-3 p-3 rounded-lg ${(videoProgress?.watchPercentage || 0) >= 80 ? 'bg-green-50' : 'bg-red-50'}`}>
//                     {(videoProgress?.watchPercentage || 0) >= 80 ? <CheckCircle className="text-green-600" size={24} /> : <XCircle className="text-red-600" size={24} />}
//                     <span className={`font-semibold ${(videoProgress?.watchPercentage || 0) >= 80 ? 'text-green-600' : 'text-red-600'}`}>
//                       {(videoProgress?.watchPercentage || 0) >= 80 ? '✓ Video completed' : '✗ Video required'}
//                     </span>
//                   </div>
//                 )}

//                 <div className={`flex items-center gap-3 p-3 rounded-lg ${!userVote ? 'bg-green-50' : 'bg-red-50'}`}>
//                   {!userVote ? <CheckCircle className="text-green-600" size={24} /> : <XCircle className="text-red-600" size={24} />}
//                   <span className={`font-semibold ${!userVote ? 'text-green-600' : 'text-red-600'}`}>
//                     {!userVote ? "✓ Haven't voted" : '✗ Already voted'}
//                   </span>
//                 </div>
//               </div>

//               {canVote && !showVoteForm && (
//                 <button
//                   onClick={() => setShowVoteForm(true)}
//                   className="w-full mt-6 px-6 py-4 bg-green-600 text-white text-lg font-bold rounded-lg hover:bg-green-700 shadow-lg"
//                 >
//                   ✅ START VOTING NOW
//                 </button>
//               )}

//               {!canVote && !userVote && votingBlocked.length > 0 && (
//                 <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
//                   <p className="font-bold text-red-800 mb-2">⚠️ Cannot vote yet:</p>
//                   <ul className="list-disc list-inside text-red-700 space-y-1">
//                     {votingBlocked.map((reason, idx) => (
//                       <li key={idx}>{reason}</li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//             </div>

//             {/* VOTE FORM */}
//             {showVoteForm && canVote && !userVote && election.questions && (
//               <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-blue-500">
//                 <h2 className="text-2xl font-bold mb-6">🗳️ Cast Your Vote</h2>

//                 <div className="space-y-8">
//                   {election.questions.map((question, idx) => (
//                     <div key={question.id} className="border-b pb-6 last:border-b-0">
//                       <h3 className="text-lg font-bold mb-1">
//                         {idx + 1}. {question.question_text}
//                       </h3>
//                       {question.allow_multiple_answers && (
//                         <p className="text-sm text-gray-500 mb-3">(Select multiple)</p>
//                       )}

//                       <div className="space-y-3 mt-4">
//                         {question.options?.map((option) => {
//                           const isSelected = (selectedAnswers[question.id] || []).includes(option.id);
                          
//                           return (
//                             <button
//                               key={option.id}
//                               onClick={() => handleAnswerSelect(question.id, option.id, question.allow_multiple_answers)}
//                               className={`w-full text-left p-4 rounded-lg border-2 transition ${
//                                 isSelected ? 'border-blue-500 bg-blue-50 shadow' : 'border-gray-200 hover:border-blue-300'
//                               }`}
//                             >
//                               <div className="flex items-center gap-3">
//                                 <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
//                                   isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-400'
//                                 }`}>
//                                   {isSelected && <CheckCircle className="text-white" size={16} />}
//                                 </div>
//                                 <p className="font-semibold">{option.option_text}</p>
//                               </div>
//                             </button>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="mt-8 flex gap-4">
//                   <button
//                     onClick={() => setShowVoteForm(false)}
//                     className="px-6 py-3 border-2 rounded-lg hover:bg-gray-100 font-semibold"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={handleVoteSubmit}
//                     disabled={submittingVote}
//                     className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50 flex items-center justify-center gap-2"
//                   >
//                     {submittingVote ? (
//                       <>
//                         <Loader className="animate-spin" size={20} />
//                         Submitting...
//                       </>
//                     ) : (
//                       '✅ Submit Vote'
//                     )}
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             <div className="bg-white rounded-lg shadow p-6">
//               <h3 className="font-bold mb-4">Election Details</h3>
//               <div className="space-y-3 text-sm">
//                 <div>
//                   <p className="text-gray-500">Status</p>
//                   <p className="font-semibold text-green-600">Active</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Type</p>
//                   <p className="font-semibold capitalize">{election.voting_type || 'plurality'}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Total Votes</p>
//                   <p className="font-semibold text-xl">{lotteryStats?.totalTickets || election.vote_count || 0}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Ends On</p>
//                   <p className="font-semibold">{formatDate(election.end_date)}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Fee</p>
//                   <p className="font-semibold text-green-600 text-xl">
//                     {election.is_free ? 'Free' : `$${fees?.totalFee || '0.00'}`}
//                   </p>
//                   {!election.is_free && fees && parseFloat(fees.processingFee) > 0 && (
//                     <p className="text-xs text-gray-500 mt-1">
//                       (Includes ${fees.processingFee} processing fee)
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {election.lottery_config?.is_lotterized && (
//               <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow p-6 border border-purple-200">
//                 <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
//                   <span className="text-2xl">🎰</span>
//                   Lottery Draw
//                 </h3>
//                 <p className="text-sm text-purple-700 mb-4">
//                   Vote to enter the lottery!
//                 </p>
//                 <div className="space-y-3">
//                   <div className="bg-white rounded p-3">
//                     <p className="text-xs text-gray-500">Prize Pool</p>
//                     <p className="font-bold text-purple-900 text-lg">
//                       {election.lottery_config.prize_description || `$${election.lottery_config.reward_amount || 0}`}
//                     </p>
//                   </div>
//                   <div className="bg-white rounded p-3">
//                     <p className="text-xs text-gray-500">Winners</p>
//                     <p className="font-bold text-purple-900 text-lg">{election.lottery_config.winner_count}</p>
//                   </div>
//                   {lotteryStats && (
//                     <div className="bg-white rounded p-3">
//                       <p className="text-xs text-gray-500">Participants</p>
//                       <p className="font-bold text-purple-900 text-lg">{lotteryStats.totalTickets}</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { Loader, CheckCircle, XCircle, Lock, Play, Pause } from 'lucide-react';
// import { useGetElectionBySlugQuery } from '../../redux/api/election/electionApi';
// import {
//   useSubmitVoteMutation,
//   useGetMyVoteQuery,
//   useGetVideoProgressQuery,
//   useUpdateVideoProgressMutation,
//   useCreatePaymentIntentMutation,
//   useGetLotteryStatsQuery,
// } from '../../redux/api/voting/votingApi';
// import { loadStripe } from '@stripe/stripe-js';
// import VideoPlayer from '../../components/voting/VideoPlayer';
// import VoteForm from '../../components/voting/VoteForm';
// import PaymentModal from '../../components/voting/PaymentModal';
// import VoteReceipt from '../../components/voting/VoteReceipt';
// import LotteryDisplay from '../../components/voting/LotteryDisplay';

// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// export default function VotingMainPage() {
//   const { slug } = useParams();
//   const navigate = useNavigate();
  
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [showReceipt, setShowReceipt] = useState(false);
//   const [votingReceipt, setVotingReceipt] = useState(null);
//   const [canVote, setCanVote] = useState(false);
//   const [paymentComplete, setPaymentComplete] = useState(false);
//   const [videoWatchComplete, setVideoWatchComplete] = useState(false);

//   // Get user data
//   const userData = JSON.parse(localStorage.getItem('userData') || '{}');
//   const userId = userData?.user_id;
//   const isAuthenticated = !!userId;

//   // Fetch election data
//   const { data: electionData, isLoading: electionLoading, error: electionError } = useGetElectionBySlugQuery(slug);
//   const election = electionData?.data;

//   // Fetch user's vote (if authenticated)
//   const { data: myVoteData } = useGetMyVoteQuery(election?.id, {
//     skip: !isAuthenticated || !election?.id,
//   });
//   const hasVoted = !!myVoteData?.data;

//   // Fetch video progress (if authenticated and has video)
//   const { data: videoProgressData } = useGetVideoProgressQuery(election?.id, {
//     skip: !isAuthenticated || !election?.id || !election?.topic_video_url,
//   });

//   // Fetch lottery stats (if lotterized)
//   const { data: lotteryData } = useGetLotteryStatsQuery(election?.id, {
//     skip: !election?.lottery_config?.is_lotterized || !election?.id,
//   });

//   // Mutations
//   const [submitVote, { isLoading: submitting }] = useSubmitVoteMutation();
//   const [updateVideoProgress] = useUpdateVideoProgressMutation();
//   const [createPaymentIntent, { isLoading: creatingPayment }] = useCreatePaymentIntentMutation();

//   // Check if user can vote
//   useEffect(() => {
//     if (!election) return;

//     const isPaidElection = !election.is_free;
//     const hasVideo = !!election.topic_video_url;
//     const videoRequired = hasVideo && election.video_watch_required !== false;

//     // Check payment requirement
//     const paymentMet = !isPaidElection || paymentComplete;

//     // Check video requirement
//     const videoMet = !videoRequired || videoWatchComplete || videoProgressData?.data?.completed;

//     setCanVote(paymentMet && videoMet && !hasVoted);
//   }, [election, paymentComplete, videoWatchComplete, videoProgressData, hasVoted]);

//   // Handle video progress
//   const handleVideoProgress = async (progress) => {
//     if (!isAuthenticated || !election?.id) return;

//     try {
//       await updateVideoProgress({
//         electionId: election.id,
//         watchPercentage: progress.watchPercentage,
//         lastPosition: progress.currentTime,
//         totalDuration: progress.duration,
//       }).unwrap();

//       if (progress.watchPercentage >= (election.video_watch_percentage || 80)) {
//         setVideoWatchComplete(true);
//         toast.success('Video watch requirement met!');
//       }
//     } catch (error) {
//       console.error('Failed to update video progress:', error);
//     }
//   };

//   // Handle payment
//   /*eslint-disable*/
//   const handlePayment = async () => {
//     if (!isAuthenticated) {
//       toast.error('Please login to proceed with payment');
//       navigate('/auth');
//       return;
//     }

//     try {
//       const userData = JSON.parse(localStorage.getItem('userData') || '{}');
//       const regionalZone = userData.regional_zone || 'us_canada';

//       const result = await createPaymentIntent({
//         electionId: election.id,
//         regionalZone,
//         paymentMethod: 'stripe',
//       }).unwrap();

//       if (result.success && result.data.clientSecret) {
//         const stripe = await stripePromise;
        
//         const { error } = await stripe.confirmCardPayment(result.data.clientSecret, {
//           payment_method: {
//             card: elements.getElement('card'),
//             billing_details: {
//               email: userData.user_email,
//             },
//           },
//         });

//         if (error) {
//           toast.error(error.message);
//         } else {
//           setPaymentComplete(true);
//           toast.success('Payment successful! You can now vote.');
//           setShowPaymentModal(false);
//         }
//       }
//     } catch (error) {
//       console.error('Payment error:', error);
//       toast.error(error?.data?.message || 'Payment failed');
//     }
//   };

//   // Handle vote submission
//   const handleVoteSubmit = async (answers) => {
//     if (!isAuthenticated) {
//       toast.error('Please login to vote');
//       navigate('/auth');
//       return;
//     }

//     if (!canVote) {
//       toast.error('Please complete all requirements before voting');
//       return;
//     }

//     try {
//       const result = await submitVote({
//         electionId: election.id,
//         answers,
//       }).unwrap();

//       if (result.success) {
//         setVotingReceipt(result.data);
//         setShowReceipt(true);
//         toast.success('Vote submitted successfully!');
//       }
//     } catch (error) {
//       console.error('Vote submission error:', error);
//       toast.error(error?.data?.message || 'Failed to submit vote');
//     }
//   };

//   // Loading state
//   if (electionLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
//           <p className="text-gray-600">Loading election...</p>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (electionError || !election) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
//           <XCircle className="text-red-600 mx-auto mb-4" size={64} />
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Election Not Found</h2>
//           <p className="text-gray-600 mb-6">
//             {electionError?.data?.message || 'The election you are looking for does not exist.'}
//           </p>
//           <button
//             onClick={() => navigate('/')}
//             className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Go to Home
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Check if election is active
//   const now = new Date();
//   const startDate = new Date(election.start_date);
//   const endDate = new Date(election.end_date);
//   const isActive = now >= startDate && now <= endDate;

//   if (!isActive) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
//           <XCircle className="text-yellow-600 mx-auto mb-4" size={64} />
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Election Not Active</h2>
//           <p className="text-gray-600 mb-6">
//             This election is not currently active. It runs from{' '}
//             {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}.
//           </p>
//           <button
//             onClick={() => navigate('/')}
//             className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Go to Home
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white shadow-sm border-b sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <h1 className="text-2xl font-bold text-blue-600">Vottery</h1>
//             {isAuthenticated ? (
//               <button
//                 onClick={() => navigate('/dashboard')}
//                 className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
//               >
//                 Go to Dashboard
//               </button>
//             ) : (
//               <button
//                 onClick={() => navigate('/auth')}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//               >
//                 Login to Vote
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 py-8">
//         {/* Election Header */}
//         <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
//           {election.topic_image_url && (
//             <img
//               src={election.topic_image_url}
//               alt={election.title}
//               className="w-full h-64 object-cover"
//             />
//           )}
//           <div className="p-6">
//             <h1 className="text-3xl font-bold text-gray-800 mb-2">{election.title}</h1>
//             {election.description && (
//               <p className="text-gray-600 mb-4">{election.description}</p>
//             )}
//             <div className="flex flex-wrap gap-4 text-sm text-gray-500">
//               <span>📅 Ends: {new Date(election.end_date).toLocaleDateString()}</span>
//               <span>🗳️ Votes: {election.vote_count || 0}</span>
//               {election.lottery_config?.is_lotterized && (
//                 <span>🎰 Lottery: {election.lottery_config.winner_count} Winners</span>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Already Voted Message */}
//         {hasVoted && (
//           <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
//             <div className="flex items-center gap-3">
//               <CheckCircle className="text-green-600" size={32} />
//               <div>
//                 <h3 className="text-lg font-bold text-green-800">You've Already Voted!</h3>
//                 <p className="text-green-600">
//                   Thank you for participating. {election.vote_editing_allowed && 'You can edit your vote below.'}
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Main Content */}
//           <div className="lg:col-span-2 space-y-8">
//             {/* Payment Requirement */}
//             {!election.is_free && !paymentComplete && !hasVoted && (
//               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
//                 <div className="flex items-start gap-4">
//                   <Lock className="text-yellow-600 mt-1" size={24} />
//                   <div className="flex-1">
//                     <h3 className="text-lg font-bold text-yellow-800 mb-2">Payment Required</h3>
//                     <p className="text-yellow-700 mb-4">
//                       This election requires a participation fee to vote.
//                     </p>
//                     <div className="bg-white rounded p-4 mb-4">
//                       <p className="text-sm text-gray-600 mb-2">Your Fee:</p>
//                       <p className="text-2xl font-bold text-gray-800">
//                         ${election.general_participation_fee || '5.00'}
//                       </p>
//                     </div>
//                     <button
//                       onClick={() => setShowPaymentModal(true)}
//                       disabled={creatingPayment}
//                       className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
//                     >
//                       {creatingPayment ? 'Processing...' : 'Pay Now'}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Video Player */}
//             {election.topic_video_url && (
//               <VideoPlayer
//                 videoUrl={election.topic_video_url}
//                 electionId={election.id}
//                 onProgress={handleVideoProgress}
//                 initialProgress={videoProgressData?.data}
//                 required={election.video_watch_required !== false}
//                 requiredPercentage={election.video_watch_percentage || 80}
//               />
//             )}

//             {/* Vote Form */}
//             {canVote && !showReceipt && (
//               <VoteForm
//                 election={election}
//                 onSubmit={handleVoteSubmit}
//                 isSubmitting={submitting}
//                 existingVote={myVoteData?.data}
//               />
//             )}

//             {/* Vote Receipt */}
//             {showReceipt && votingReceipt && (
//               <VoteReceipt receipt={votingReceipt} election={election} />
//             )}

//             {/* Requirements Checklist */}
//             {!hasVoted && (
//               <div className="bg-white rounded-lg shadow p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4">Voting Requirements</h3>
//                 <div className="space-y-3">
//                   {!election.is_free && (
//                     <div className="flex items-center gap-3">
//                       {paymentComplete ? (
//                         <CheckCircle className="text-green-600" size={20} />
//                       ) : (
//                         <XCircle className="text-red-600" size={20} />
//                       )}
//                       <span className={paymentComplete ? 'text-green-600' : 'text-gray-600'}>
//                         Payment completed
//                       </span>
//                     </div>
//                   )}
//                   {election.topic_video_url && (
//                     <div className="flex items-center gap-3">
//                       {videoWatchComplete || videoProgressData?.data?.completed ? (
//                         <CheckCircle className="text-green-600" size={20} />
//                       ) : (
//                         <XCircle className="text-red-600" size={20} />
//                       )}
//                       <span className={videoWatchComplete ? 'text-green-600' : 'text-gray-600'}>
//                         Watch video ({election.video_watch_percentage || 80}%)
//                       </span>
//                     </div>
//                   )}
//                   {isAuthenticated ? (
//                     <div className="flex items-center gap-3">
//                       <CheckCircle className="text-green-600" size={20} />
//                       <span className="text-green-600">Logged in</span>
//                     </div>
//                   ) : (
//                     <div className="flex items-center gap-3">
//                       <XCircle className="text-red-600" size={20} />
//                       <span className="text-gray-600">Login required</span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             {/* Lottery Display */}
//             {election.lottery_config?.is_lotterized && (
//               <LotteryDisplay
//                 election={election}
//                 lotteryStats={lotteryData?.data}
//                 hasVoted={hasVoted}
//               />
//             )}

//             {/* Election Info */}
//             <div className="bg-white rounded-lg shadow p-6">
//               <h3 className="text-lg font-bold text-gray-800 mb-4">Election Details</h3>
//               <div className="space-y-3 text-sm">
//                 <div>
//                   <p className="text-gray-500">Status</p>
//                   <p className="font-semibold text-green-600">Active</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Type</p>
//                   <p className="font-semibold capitalize">{election.voting_type}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Total Votes</p>
//                   <p className="font-semibold">{election.vote_count || 0}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Ends On</p>
//                   <p className="font-semibold">
//                     {new Date(election.end_date).toLocaleDateString()}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Share */}
//             <div className="bg-white rounded-lg shadow p-6">
//               <h3 className="text-lg font-bold text-gray-800 mb-4">Share</h3>
//               <div className="flex gap-2">
//                 <input
//                   type="text"
//                   value={window.location.href}
//                   readOnly
//                   className="flex-1 px-3 py-2 border rounded text-sm"
//                 />
//                 <button
//                   onClick={() => {
//                     navigator.clipboard.writeText(window.location.href);
//                     toast.success('Link copied!');
//                   }}
//                   className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
//                 >
//                   Copy
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Payment Modal */}
//       {showPaymentModal && (
//         <PaymentModal
//           election={election}
//           onClose={() => setShowPaymentModal(false)}
//           onSuccess={() => {
//             setPaymentComplete(true);
//             setShowPaymentModal(false);
//           }}
//         />
//       )}
//     </div>
//   );
// }