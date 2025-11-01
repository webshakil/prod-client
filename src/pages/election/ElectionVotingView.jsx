import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Loader, Play } from 'lucide-react';
import { getElection } from '../../redux/api/election/electionApi';
import { 
  generateVoteId, 
  generateReceiptId, 
  generateLotteryTicket,
  createVoteHash,
  encryptVoteData 
} from '../../utils/voteEncryption';

// Import components
import ElectionHeader from '../../components/election/VotingView/ElectionHeader';
import VideoModal from '../../components/election/VotingView/VideoModal';
import PricingTab from '../../components/election/VotingView/PricingTab';
import VoteTab from '../../components/election/VotingView/VoteTab';
import PaymentModal from '../../components/election/VotingView/PaymentModal';
import LotteryMachine from '../../components/election/VotingView/LotteryMachine';
import VoteSuccessModal from '../../components/election/VotingView/VoteSuccessModal';

export default function ElectionVotingView() {
  const { electionId } = useParams();
  const navigate = useNavigate();

  // State
  const [currentElection, setCurrentElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [userCountry, setUserCountry] = useState(null);
  const [userRegion, setUserRegion] = useState(null);
  const [applicableFee, setApplicableFee] = useState(null);
  const [processingFeePercent, setProcessingFeePercent] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  /*eslint-disable*/
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [votingInProgress, setVotingInProgress] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  
  // Lottery & Success states
  const [showLotteryAnimation, setShowLotteryAnimation] = useState(false);
  const [lotteryBallNumber, setLotteryBallNumber] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [voteReceiptData, setVoteReceiptData] = useState(null);

  // Get user data
  const getUserData = () => {
    try {
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        return JSON.parse(userDataStr);
      }
    } catch (err) {
      console.error('Error reading user data:', err);
    }
    return null;
  };

  // Get user country and processing fee from localStorage
  useEffect(() => {
    try {
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        console.log('👤 User data:', userData);
        setUserCountry(userData.country || null);
      }

      const persistStr = localStorage.getItem('persist:vottery-root');
      if (persistStr) {
        const persist = JSON.parse(persistStr);
        const subscriptionData = JSON.parse(persist.subscription || '{}');
        
        const processingFee = parseFloat(
          subscriptionData.currentPlan?.processingFeePercentage ||
          subscriptionData.processingFeePercentage ||
          0
        );
        
        console.log('💰 Processing fee:', processingFee + '%');
        setProcessingFeePercent(processingFee);
      }
    } catch (err) {
      console.error('Error reading localStorage:', err);
    }
  }, []);

  // Fetch election data
  // Fetch election data
useEffect(() => {
  let isMounted = true;

  const fetchElectionData = async () => {
    if (!electionId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await getElection(electionId);
      if (!isMounted) return;

      let electionData = response.data?.election || response.election || response.data || response;
      
      if (electionData?.id) {
        console.log('✅ Election loaded:', electionData.title);
        
        // 🔥🔥🔥 FORCE LOTTERY TO ALWAYS BE ENABLED (FOR TESTING)
        const processedElection = {
          ...electionData,
          is_lotterized: true,  // ALWAYS TRUE
          lottery_prize_amount: parseFloat(electionData.lottery_prize_amount) || 5000,
          lottery_winner_count: parseInt(electionData.lottery_winner_count || electionData.lottery_winners) || 36
        };
        
        console.log('🎰 LOTTERY FORCED ON:', {
          is_lotterized: processedElection.is_lotterized,
          lottery_prize_amount: processedElection.lottery_prize_amount,
          lottery_winner_count: processedElection.lottery_winner_count
        });
        
        setCurrentElection(processedElection);
      } else {
        throw new Error('Election data not found');
      }
    } catch (err) {
      if (!isMounted) return;
      console.error('❌ Error:', err);
      setError(err.message || 'Failed to load election');
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  fetchElectionData();
  return () => { isMounted = false; };
}, [electionId]);
  // useEffect(() => {
  //   let isMounted = true;

  //   const fetchElectionData = async () => {
  //     if (!electionId) return;

  //     try {
  //       setLoading(true);
  //       setError(null);

  //       const response = await getElection(electionId);
  //       if (!isMounted) return;

  //       let electionData = response.data?.election || response.election || response.data || response;
        
  //       console.log('🔍 RAW ELECTION DATA:', electionData);
  //       console.log('🔍 is_lotterized (raw):', electionData.is_lotterized);
  //       console.log('🔍 lottery_prize_amount:', electionData.lottery_prize_amount);
  //       console.log('🔍 lottery_winner_count:', electionData.lottery_winner_count);
  //       console.log('🔍 lottery_winners:', electionData.lottery_winners);
  //       console.log('🔍 lottery_prize_description:', electionData.lottery_prize_description);
        
  //       if (electionData?.id) {
  //         console.log('✅ Election loaded:', electionData.title);
          
  //         // 🔥 FORCE LOTTERY IF NOT SET BUT HAS LOTTERY DATA
  //         let lotteryEnabled = Boolean(electionData.is_lotterized);
  //         let prizeAmount = parseFloat(electionData.lottery_prize_amount) || 0;
  //         let winnerCount = parseInt(electionData.lottery_winner_count || electionData.lottery_winners) || 1;
          
  //         // Check if election has lottery indicators but is_lotterized is false/undefined
  //         const hasLotteryIndicators = 
  //           electionData.lottery_prize_description || 
  //           electionData.lottery_winners || 
  //           electionData.lottery_winner_count;
          
  //         if (!lotteryEnabled && hasLotteryIndicators) {
  //           console.warn('⚠️ Found lottery indicators but is_lotterized is false/undefined');
  //           console.warn('🔥 FORCING LOTTERY TO BE ENABLED');
  //           lotteryEnabled = true;
            
  //           // Set default values based on what's available
  //           if (electionData.lottery_prize_description === 'Moscow Tour') {
  //             prizeAmount = prizeAmount || 5000;
  //           }
  //           winnerCount = parseInt(electionData.lottery_winners) || winnerCount || 36;
  //         }
          
  //         // Process election with lottery data
  //         const processedElection = {
  //           ...electionData,
  //           is_lotterized: lotteryEnabled,
  //           lottery_prize_amount: prizeAmount,
  //           lottery_winner_count: winnerCount
  //         };
          
  //         console.log('✅ Processed Election Data:', {
  //           is_lotterized: processedElection.is_lotterized,
  //           lottery_prize_amount: processedElection.lottery_prize_amount,
  //           lottery_winner_count: processedElection.lottery_winner_count,
  //           forced: !electionData.is_lotterized && lotteryEnabled
  //         });
          
  //         setCurrentElection(processedElection);
  //       } else {
  //         throw new Error('Election data not found');
  //       }
  //     } catch (err) {
  //       if (!isMounted) return;
  //       console.error('❌ Error:', err);
  //       setError(err.message || 'Failed to load election');
  //     } finally {
  //       if (isMounted) setLoading(false);
  //     }
  //   };

  //   fetchElectionData();
  //   return () => { isMounted = false; };
  // }, [electionId]);

  // Detect user's region
  useEffect(() => {
    if (!currentElection || !userCountry) return;
    if (currentElection.is_free || currentElection.pricing_type !== 'regional_fee') return;
    if (!currentElection.regional_pricing?.length) return;

    const regionMap = {
      'US': 'region_1_us_canada', 'CA': 'region_1_us_canada',
      'United States': 'region_1_us_canada', 'Canada': 'region_1_us_canada',
      'GB': 'region_2_western_europe', 'DE': 'region_2_western_europe',
      'FR': 'region_2_western_europe', 'IT': 'region_2_western_europe',
      'PL': 'region_3_eastern_europe', 'RO': 'region_3_eastern_europe',
      'NG': 'region_4_africa', 'ZA': 'region_4_africa',
      'BR': 'region_5_latin_america', 'MX': 'region_5_latin_america',
      'BD': 'region_6_middle_east_asia', 'IN': 'region_6_middle_east_asia',
      'Bangladesh': 'region_6_middle_east_asia', 'India': 'region_6_middle_east_asia',
      'AU': 'region_7_australasia', 'NZ': 'region_7_australasia',
    };

    const regionCode = regionMap[userCountry];
    const matched = regionCode 
      ? currentElection.regional_pricing.find(r => r.region_code === regionCode)
      : null;

    console.log('🌍 Region detection:', { userCountry, regionCode, matched: matched?.region_name });
    setUserRegion(matched || currentElection.regional_pricing[0]);
  }, [currentElection, userCountry]);

  // Calculate fee
  useEffect(() => {
    if (!currentElection) return;

    if (currentElection.is_free) {
      setApplicableFee({ 
        participationFee: 0, 
        processingFee: 0, 
        total: 0, 
        frozenAmount: 0,
        currency: 'USD',
        processingPercentage: processingFeePercent
      });
      return;
    }

    if (currentElection.pricing_type === 'general_fee') {
      const baseFee = parseFloat(currentElection.general_participation_fee || 0);
      const processing = baseFee * (processingFeePercent / 100);
      
      setApplicableFee({
        participationFee: baseFee,
        processingFee: processing,
        total: baseFee + processing,
        frozenAmount: baseFee,
        currency: 'USD',
        processingPercentage: processingFeePercent
      });
    } else if (currentElection.pricing_type === 'regional_fee' && userRegion) {
      const baseFee = parseFloat(userRegion.participation_fee || 0);
      const processing = baseFee * (processingFeePercent / 100);
      
      setApplicableFee({
        participationFee: baseFee,
        processingFee: processing,
        total: baseFee + processing,
        frozenAmount: baseFee,
        currency: userRegion.currency || 'USD',
        region: userRegion.region_name,
        processingPercentage: processingFeePercent
      });
    }
  }, [currentElection, userRegion, processingFeePercent]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      });
    } catch { return 'Invalid Date'; }
  };

  const canUserVote = useMemo(() => {
    if (!currentElection) return { can: false, reason: 'Election not found' };

    const now = new Date();
    const startDate = new Date(currentElection.start_date);
    const endDate = new Date(currentElection.end_date);

    if (currentElection.status !== 'published' && currentElection.status !== 'active') {
      return { can: false, reason: `Election is ${currentElection.status}` };
    }

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return { can: false, reason: 'Invalid dates' };
    }

    if (now < startDate) {
      return { can: false, reason: `Starts on ${formatDate(currentElection.start_date)}` };
    }

    if (now > endDate) {
      return { can: false, reason: 'Election has ended' };
    }

    return { can: true, reason: null };
  }, [currentElection]);

  const handleAnswerSelect = (questionId, optionId, questionType, maxSelections) => {
    setSelectedAnswers(prev => {
      const current = prev[questionId] || [];
      
      if (questionType === 'multiple_choice' && maxSelections === 1) {
        return { ...prev, [questionId]: [optionId] };
      } else {
        if (current.includes(optionId)) {
          return { ...prev, [questionId]: current.filter(id => id !== optionId) };
        } else {
          if (maxSelections && current.length >= maxSelections) return prev;
          return { ...prev, [questionId]: [...current, optionId] };
        }
      }
    });
  };

  const validateAnswers = () => {
    if (!currentElection?.questions) return { valid: true, errors: [] };

    const errors = [];
    currentElection.questions.forEach(question => {
      if (question.is_required && !selectedAnswers[question.id]?.length) {
        errors.push(`"${question.question_text}" is required`);
      }
    });

    return { valid: errors.length === 0, errors };
  };

  const handleVoteSubmit = async () => {
    const videoUrl = currentElection.topic_video_url || currentElection.video_url;
    
    if (videoUrl && !videoWatched) {
      alert('You must watch the video before voting');
      setShowVideo(true);
      return;
    }

    const validation = validateAnswers();
    if (!validation.valid) {
      alert(validation.errors.join('\n'));
      return;
    }

    if (!currentElection.is_free && !agreeToTerms) {
      alert('Please agree to the terms');
      return;
    }

    if (!currentElection.is_free) {
      setShowPaymentModal(true);
    } else {
      await submitVote();
    }
  };

  const submitVote = async () => {
    try {
      setVotingInProgress(true);

      const userData = getUserData();
      if (!userData) {
        throw new Error('User not authenticated');
      }

      // Generate secure IDs
      const voteId = generateVoteId();
      const receiptId = generateReceiptId();
      const timestamp = new Date().toISOString();

      // Prepare vote data
      const voteData = {
        voteId,
        receiptId,
        timestamp,
        electionId: currentElection.id,
        userId: userData.userId,
        answers: Object.keys(selectedAnswers).map(qId => ({
          question_id: parseInt(qId),
          option_ids: selectedAnswers[qId]
        })),
        payment: !currentElection.is_free ? {
          total: applicableFee.total,
          participationFee: applicableFee.participationFee,
          processingFee: applicableFee.processingFee,
          currency: applicableFee.currency,
          method: paymentMethod,
          region: userRegion?.region_code
        } : null
      };

      // Create vote hash for integrity
      const voteHash = createVoteHash(voteData);
      voteData.voteHash = voteHash;

      // Encrypt sensitive data
      const encryptedVote = encryptVoteData(voteData);

      console.log('📤 Submitting encrypted vote...');
      console.log('🔒 Vote Hash:', voteHash);

      // TODO: Replace with actual API call
      // const response = await fetch('http://localhost:5006/api/votes/submit', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ encryptedVote })
      // });

      // Simulate API response
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate lottery ticket if election is lotterized
      let lotteryTicketNumber = null;
      if (currentElection.is_lotterized) {
        lotteryTicketNumber = generateLotteryTicket(userData.userId, currentElection.id);
        console.log('🎫 Generated lottery ticket:', lotteryTicketNumber);
        setLotteryBallNumber(lotteryTicketNumber);
        setShowLotteryAnimation(true);

        // Show animation for 3 seconds
        setTimeout(() => {
          setShowLotteryAnimation(false);
        }, 3000);
      }

      // Prepare receipt data
      const receiptData = {
        voteId,
        receiptId,
        timestamp,
        lotteryTicketNumber,
        voteHash,
        electionTitle: currentElection.title,
        electionId: currentElection.id
      };

      setVoteReceiptData(receiptData);

      // Show success modal
      setTimeout(() => {
        setShowSuccessModal(true);
      }, currentElection.is_lotterized ? 3500 : 500);

      console.log('✅ Vote submitted successfully!');

    } catch (error) {
      console.error('❌ Error:', error);
      alert(`Failed to submit vote: ${error.message}`);
    } finally {
      setVotingInProgress(false);
      setShowPaymentModal(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate('/my-votes');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading election...</p>
        </div>
      </div>
    );
  }

  if (error || !currentElection) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
          <p className="text-red-600 font-semibold mb-2">Error Loading Election</p>
          <p className="text-gray-600 mb-4">{error || 'Not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const videoUrl = currentElection.topic_video_url || currentElection.video_url;
  const isLotterized = Boolean(currentElection.is_lotterized);
  const lotteryPrizeAmount = parseFloat(currentElection.lottery_prize_amount) || 0;
  const lotteryWinnerCount = parseInt(currentElection.lottery_winner_count) || 1;

  console.log('🎰 Lottery Display Check:', {
    isLotterized,
    lotteryPrizeAmount,
    lotteryWinnerCount,
    activeTab
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <ElectionHeader
        election={currentElection}
        formatDate={formatDate}
        videoUrl={videoUrl}
        videoWatched={videoWatched}
        onWatchVideo={() => setShowVideo(true)}
      />

      {!canUserVote.can && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6 rounded-r-lg">
          <div className="flex items-start gap-4">
            <AlertCircle className="text-yellow-600" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Cannot Vote</h3>
              <p className="text-yellow-700">{canUserVote.reason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          {!currentElection.is_free && (
            <button
              onClick={() => setActiveTab('pricing')}
              className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'pricing'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pricing
            </button>
          )}
          {isLotterized && (
            <button
              onClick={() => setActiveTab('lottery')}
              className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'lottery'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🎰 Lottery
            </button>
          )}
          {canUserVote.can && currentElection.questions?.length > 0 && (
            <button
              onClick={() => setActiveTab('vote')}
              className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'vote'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Vote Now
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Election Overview</h2>
            <p className="text-gray-700">{currentElection.description || 'No description'}</p>
            
            {currentElection.voting_body_content && (
              <div dangerouslySetInnerHTML={{ __html: currentElection.voting_body_content }} />
            )}

            {videoUrl && (
              <div className="mt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Election Video</h3>
                <button
                  onClick={() => setShowVideo(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Play size={20} />
                  {videoWatched ? 'Watch Again' : 'Watch Video (Required)'}
                </button>
              </div>
            )}

            {currentElection.questions?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Questions ({currentElection.questions.length})
                </h3>
                <p className="text-gray-600">
                  This election has {currentElection.questions.length} question(s).
                  {canUserVote.can ? ' Click "Vote Now" to participate.' : ''}
                </p>
              </div>
            )}

            {/* Show lottery info on overview if enabled */}
            {isLotterized && (
              <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🎰 Lottery Enabled!
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p className="font-semibold">Vote to win amazing prizes!</p>
                  <p>💰 Prize Pool: {applicableFee?.currency || 'USD'} {lotteryPrizeAmount.toFixed(2)}</p>
                  <p>🏆 Winners: {lotteryWinnerCount}</p>
                  <p className="text-sm text-gray-600 mt-4">
                    Each vote automatically enters you into the lottery draw!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pricing' && (
          <PricingTab
            election={currentElection}
            userRegion={userRegion}
            applicableFee={applicableFee}
            processingFeePercent={processingFeePercent}
          />
        )}

        {activeTab === 'lottery' && isLotterized && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🎰 Lottery Information</h2>
            
            <div className="mb-8">
              <LotteryMachine
                isVisible={true}
                isSpinning={canUserVote.can}
                prizeAmount={lotteryPrizeAmount}
                currency={applicableFee?.currency || 'USD'}
                winnerCount={lotteryWinnerCount}
                showVoteBall={false}
                ballNumber={null}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-bold text-lg mb-4 text-blue-900">💰 Prize Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total Prize Pool:</span>
                    <span className="font-bold text-xl text-blue-600">
                      {applicableFee?.currency || 'USD'} {lotteryPrizeAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Number of Winners:</span>
                    <span className="font-bold text-xl text-blue-600">{lotteryWinnerCount}</span>
                  </div>
                  {lotteryWinnerCount > 1 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Prize per Winner:</span>
                      <span className="font-bold text-lg text-blue-600">
                        {applicableFee?.currency || 'USD'} {(lotteryPrizeAmount / lotteryWinnerCount).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-bold text-lg mb-4 text-green-900">✅ How to Participate</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">1.</span>
                    <span>Cast your vote in this election</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">2.</span>
                    <span>Receive automatic lottery entry</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">3.</span>
                    <span>Get unique lottery ticket number</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">4.</span>
                    <span>Winners announced at election end</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-6 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 className="font-bold text-lg mb-4 text-purple-900">🎲 How Winners Are Selected</h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>Fair & Transparent:</strong> Winners are selected using cryptographically secure 
                  random number generation, ensuring complete fairness.
                </p>
                <p>
                  <strong>Automatic Draw:</strong> The lottery draw happens automatically when the election 
                  ends on {formatDate(currentElection.end_date)}.
                </p>
                <p>
                  <strong>Verification:</strong> All lottery draws are recorded on the blockchain for 
                  complete transparency and verification.
                </p>
                <p className="text-sm text-gray-600 mt-4">
                  <strong>Note:</strong> You must vote to be eligible for the lottery. Each voter receives 
                  exactly one lottery ticket, ensuring equal chances for all participants.
                </p>
              </div>
            </div>

            {canUserVote.can && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setActiveTab('vote')}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-bold rounded-lg hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all shadow-lg"
                >
                  🎰 Vote Now & Enter Lottery
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'vote' && canUserVote.can && currentElection.questions?.length > 0 && (
          <VoteTab
            election={currentElection}
            selectedAnswers={selectedAnswers}
            onAnswerSelect={handleAnswerSelect}
            applicableFee={applicableFee}
            agreeToTerms={agreeToTerms}
            setAgreeToTerms={setAgreeToTerms}
            onSubmit={handleVoteSubmit}
            votingInProgress={votingInProgress}
            videoUrl={videoUrl}
            videoWatched={videoWatched}
            onWatchVideo={() => setShowVideo(true)}
          />
        )}
      </div>

      {/* Modals */}
      <VideoModal
        videoUrl={videoUrl}
        isOpen={showVideo}
        onClose={() => setShowVideo(false)}
        videoWatched={videoWatched}
        onVideoEnd={() => setVideoWatched(true)}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        electionId={electionId}
        applicableFee={applicableFee}
        onPaymentSuccess={(paymentId) => {
          console.log('✅ Payment successful:', paymentId);
          submitVote();
        }}
      />

      {/* Lottery Animation Overlay */}
      {showLotteryAnimation && (
        <div className="fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-2xl shadow-2xl">
            <h2 className="text-3xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              🎰 Entering Lottery...
            </h2>
            <p className="text-center text-gray-600 mb-6">Your vote is being added to the lottery machine!</p>
            <LotteryMachine
              isVisible={true}
              isSpinning={true}
              prizeAmount={lotteryPrizeAmount}
              currency={applicableFee?.currency || 'USD'}
              winnerCount={lotteryWinnerCount}
              showVoteBall={true}
              ballNumber={lotteryBallNumber}
            />
            <div className="mt-6 text-center">
              <p className="text-lg font-semibold text-gray-800">
                Your Lottery Ticket: <span className="text-blue-600">#{lotteryBallNumber}</span>
              </p>
              <p className="text-sm text-gray-600 mt-2">Good luck! 🍀</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <VoteSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        voteData={voteReceiptData}
        electionTitle={currentElection.title}
      />
    </div>
  );
}
// import React, { useState, useEffect, useMemo } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { ArrowLeft, AlertCircle, Loader, Play } from 'lucide-react';
// import { getElection } from '../../redux/api/election/electionApi';
// import { 
//   generateVoteId, 
//   generateReceiptId, 
//   generateLotteryTicket,
//   createVoteHash,
//   encryptVoteData 
// } from '../../utils/voteEncryption';

// // Import components
// import ElectionHeader from '../../components/election/VotingView/ElectionHeader';
// import VideoModal from '../../components/election/VotingView/VideoModal';
// import PricingTab from '../../components/election/VotingView/PricingTab';
// import VoteTab from '../../components/election/VotingView/VoteTab';
// import PaymentModal from '../../components/election/VotingView/PaymentModal';
// import LotteryMachine from '../../components/election/VotingView/LotteryMachine';
// import VoteSuccessModal from '../../components/election/VotingView/VoteSuccessModal';

// export default function ElectionVotingView() {
//   const { electionId } = useParams();
//   const navigate = useNavigate();

//   // State
//   const [currentElection, setCurrentElection] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [selectedAnswers, setSelectedAnswers] = useState({});
//   const [userCountry, setUserCountry] = useState(null);
//   const [userRegion, setUserRegion] = useState(null);
//   const [applicableFee, setApplicableFee] = useState(null);
//   const [processingFeePercent, setProcessingFeePercent] = useState(0);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   /*eslint-disable*/
//   const [paymentMethod, setPaymentMethod] = useState('wallet');
//   const [agreeToTerms, setAgreeToTerms] = useState(false);
//   const [votingInProgress, setVotingInProgress] = useState(false);
//   const [videoWatched, setVideoWatched] = useState(false);
//   const [showVideo, setShowVideo] = useState(false);
  
//   // Lottery & Success states
//   const [showLotteryAnimation, setShowLotteryAnimation] = useState(false);
//   const [lotteryBallNumber, setLotteryBallNumber] = useState(null);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);
//   const [voteReceiptData, setVoteReceiptData] = useState(null);

//   // Get user data
//   const getUserData = () => {
//     try {
//       const userDataStr = localStorage.getItem('userData');
//       if (userDataStr) {
//         return JSON.parse(userDataStr);
//       }
//     } catch (err) {
//       console.error('Error reading user data:', err);
//     }
//     return null;
//   };

//   // Get user country and processing fee from localStorage
//   useEffect(() => {
//     try {
//       const userDataStr = localStorage.getItem('userData');
//       if (userDataStr) {
//         const userData = JSON.parse(userDataStr);
//         console.log('👤 User data:', userData);
//         setUserCountry(userData.country || null);
//       }

//       const persistStr = localStorage.getItem('persist:vottery-root');
//       if (persistStr) {
//         const persist = JSON.parse(persistStr);
//         const subscriptionData = JSON.parse(persist.subscription || '{}');
        
//         const processingFee = parseFloat(
//           subscriptionData.currentPlan?.processingFeePercentage ||
//           subscriptionData.processingFeePercentage ||
//           0
//         );
        
//         console.log('💰 Processing fee:', processingFee + '%');
//         setProcessingFeePercent(processingFee);
//       }
//     } catch (err) {
//       console.error('Error reading localStorage:', err);
//     }
//   }, []);

//   // Fetch election data
//   useEffect(() => {
//     let isMounted = true;

//     const fetchElectionData = async () => {
//       if (!electionId) return;

//       try {
//         setLoading(true);
//         setError(null);

//         const response = await getElection(electionId);
//         if (!isMounted) return;

//         let electionData = response.data?.election || response.election || response.data || response;
//         console.log('🔍 RAW ELECTION DATA:', electionData);
//         console.log('🔍 is_lotterized:', electionData.is_lotterized);
//         console.log('🔍 lottery_prize_amount:', electionData.lottery_prize_amount);
//         console.log('🔍 lottery_winner_count:', electionData.lottery_winner_count);
        
//         if (electionData?.id) {
//           console.log('✅ Election loaded:', electionData.title);
//           console.log('🎰 Lottery enabled:', electionData.is_lotterized);
          
//           // Force lottery data to be boolean and ensure numeric values
//           const processedElection = {
//             ...electionData,
//             is_lotterized: Boolean(electionData.is_lotterized),
//             lottery_prize_amount: parseFloat(electionData.lottery_prize_amount) || 0,
//             lottery_winner_count: parseInt(electionData.lottery_winner_count) || 1
//           };
          
//           console.log('✅ Processed Election Data:', {
//             is_lotterized: processedElection.is_lotterized,
//             lottery_prize_amount: processedElection.lottery_prize_amount,
//             lottery_winner_count: processedElection.lottery_winner_count
//           });
          
//           setCurrentElection(processedElection);
//         } else {
//           throw new Error('Election data not found');
//         }
//       } catch (err) {
//         if (!isMounted) return;
//         console.error('❌ Error:', err);
//         setError(err.message || 'Failed to load election');
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     };

//     fetchElectionData();
//     return () => { isMounted = false; };
//   }, [electionId]);

//   // Detect user's region
//   useEffect(() => {
//     if (!currentElection || !userCountry) return;
//     if (currentElection.is_free || currentElection.pricing_type !== 'regional_fee') return;
//     if (!currentElection.regional_pricing?.length) return;

//     const regionMap = {
//       'US': 'region_1_us_canada', 'CA': 'region_1_us_canada',
//       'United States': 'region_1_us_canada', 'Canada': 'region_1_us_canada',
//       'GB': 'region_2_western_europe', 'DE': 'region_2_western_europe',
//       'FR': 'region_2_western_europe', 'IT': 'region_2_western_europe',
//       'PL': 'region_3_eastern_europe', 'RO': 'region_3_eastern_europe',
//       'NG': 'region_4_africa', 'ZA': 'region_4_africa',
//       'BR': 'region_5_latin_america', 'MX': 'region_5_latin_america',
//       'BD': 'region_6_middle_east_asia', 'IN': 'region_6_middle_east_asia',
//       'Bangladesh': 'region_6_middle_east_asia', 'India': 'region_6_middle_east_asia',
//       'AU': 'region_7_australasia', 'NZ': 'region_7_australasia',
//     };

//     const regionCode = regionMap[userCountry];
//     const matched = regionCode 
//       ? currentElection.regional_pricing.find(r => r.region_code === regionCode)
//       : null;

//     console.log('🌍 Region detection:', { userCountry, regionCode, matched: matched?.region_name });
//     setUserRegion(matched || currentElection.regional_pricing[0]);
//   }, [currentElection, userCountry]);

//   // Calculate fee
//   useEffect(() => {
//     if (!currentElection) return;

//     if (currentElection.is_free) {
//       setApplicableFee({ 
//         participationFee: 0, 
//         processingFee: 0, 
//         total: 0, 
//         frozenAmount: 0,
//         currency: 'USD' 
//       });
//       return;
//     }

//     if (currentElection.pricing_type === 'general_fee') {
//       const baseFee = parseFloat(currentElection.general_participation_fee || 0);
//       const processing = baseFee * (processingFeePercent / 100);
      
//       setApplicableFee({
//         participationFee: baseFee,
//         processingFee: processing,
//         total: baseFee + processing,
//         frozenAmount: baseFee,
//         currency: 'USD',
//         processingPercentage: processingFeePercent
//       });
//     } else if (currentElection.pricing_type === 'regional_fee' && userRegion) {
//       const baseFee = parseFloat(userRegion.participation_fee || 0);
//       const processing = baseFee * (processingFeePercent / 100);
      
//       setApplicableFee({
//         participationFee: baseFee,
//         processingFee: processing,
//         total: baseFee + processing,
//         frozenAmount: baseFee,
//         currency: userRegion.currency || 'USD',
//         region: userRegion.region_name,
//         processingPercentage: processingFeePercent
//       });
//     }
//   }, [currentElection, userRegion, processingFeePercent]);

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Not set';
//     try {
//       const date = new Date(dateString);
//       return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US', { 
//         year: 'numeric', month: 'long', day: 'numeric' 
//       });
//     } catch { return 'Invalid Date'; }
//   };

//   const canUserVote = useMemo(() => {
//     if (!currentElection) return { can: false, reason: 'Election not found' };

//     const now = new Date();
//     const startDate = new Date(currentElection.start_date);
//     const endDate = new Date(currentElection.end_date);

//     if (currentElection.status !== 'published' && currentElection.status !== 'active') {
//       return { can: false, reason: `Election is ${currentElection.status}` };
//     }

//     if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
//       return { can: false, reason: 'Invalid dates' };
//     }

//     if (now < startDate) {
//       return { can: false, reason: `Starts on ${formatDate(currentElection.start_date)}` };
//     }

//     if (now > endDate) {
//       return { can: false, reason: 'Election has ended' };
//     }

//     return { can: true, reason: null };
//   }, [currentElection]);

//   const handleAnswerSelect = (questionId, optionId, questionType, maxSelections) => {
//     setSelectedAnswers(prev => {
//       const current = prev[questionId] || [];
      
//       if (questionType === 'multiple_choice' && maxSelections === 1) {
//         return { ...prev, [questionId]: [optionId] };
//       } else {
//         if (current.includes(optionId)) {
//           return { ...prev, [questionId]: current.filter(id => id !== optionId) };
//         } else {
//           if (maxSelections && current.length >= maxSelections) return prev;
//           return { ...prev, [questionId]: [...current, optionId] };
//         }
//       }
//     });
//   };

//   const validateAnswers = () => {
//     if (!currentElection?.questions) return { valid: true, errors: [] };

//     const errors = [];
//     currentElection.questions.forEach(question => {
//       if (question.is_required && !selectedAnswers[question.id]?.length) {
//         errors.push(`"${question.question_text}" is required`);
//       }
//     });

//     return { valid: errors.length === 0, errors };
//   };

//   const handleVoteSubmit = async () => {
//     const videoUrl = currentElection.topic_video_url || currentElection.video_url;
    
//     if (videoUrl && !videoWatched) {
//       alert('You must watch the video before voting');
//       setShowVideo(true);
//       return;
//     }

//     const validation = validateAnswers();
//     if (!validation.valid) {
//       alert(validation.errors.join('\n'));
//       return;
//     }

//     if (!currentElection.is_free && !agreeToTerms) {
//       alert('Please agree to the terms');
//       return;
//     }

//     if (!currentElection.is_free) {
//       setShowPaymentModal(true);
//     } else {
//       await submitVote();
//     }
//   };

//   const submitVote = async () => {
//     try {
//       setVotingInProgress(true);

//       const userData = getUserData();
//       if (!userData) {
//         throw new Error('User not authenticated');
//       }

//       // Generate secure IDs
//       const voteId = generateVoteId();
//       const receiptId = generateReceiptId();
//       const timestamp = new Date().toISOString();

//       // Prepare vote data
//       const voteData = {
//         voteId,
//         receiptId,
//         timestamp,
//         electionId: currentElection.id,
//         userId: userData.userId,
//         answers: Object.keys(selectedAnswers).map(qId => ({
//           question_id: parseInt(qId),
//           option_ids: selectedAnswers[qId]
//         })),
//         payment: !currentElection.is_free ? {
//           total: applicableFee.total,
//           participationFee: applicableFee.participationFee,
//           processingFee: applicableFee.processingFee,
//           currency: applicableFee.currency,
//           method: paymentMethod,
//           region: userRegion?.region_code
//         } : null
//       };

//       // Create vote hash for integrity
//       const voteHash = createVoteHash(voteData);
//       voteData.voteHash = voteHash;

//       // Encrypt sensitive data
//       const encryptedVote = encryptVoteData(voteData);

//       console.log('📤 Submitting encrypted vote...');
//       console.log('🔒 Vote Hash:', voteHash);

//       // TODO: Replace with actual API call
//       // const response = await fetch('http://localhost:5006/api/votes/submit', {
//       //   method: 'POST',
//       //   headers: { 'Content-Type': 'application/json' },
//       //   body: JSON.stringify({ encryptedVote })
//       // });

//       // Simulate API response
//       await new Promise(resolve => setTimeout(resolve, 1500));

//       // Generate lottery ticket if election is lotterized
//       let lotteryTicketNumber = null;
//       if (currentElection.is_lotterized) {
//         lotteryTicketNumber = generateLotteryTicket(userData.userId, currentElection.id);
//         console.log('🎫 Generated lottery ticket:', lotteryTicketNumber);
//         setLotteryBallNumber(lotteryTicketNumber);
//         setShowLotteryAnimation(true);

//         // Show animation for 3 seconds
//         setTimeout(() => {
//           setShowLotteryAnimation(false);
//         }, 3000);
//       }

//       // Prepare receipt data
//       const receiptData = {
//         voteId,
//         receiptId,
//         timestamp,
//         lotteryTicketNumber,
//         voteHash,
//         electionTitle: currentElection.title,
//         electionId: currentElection.id
//       };

//       setVoteReceiptData(receiptData);

//       // Show success modal
//       setTimeout(() => {
//         setShowSuccessModal(true);
//       }, currentElection.is_lotterized ? 3500 : 500);

//       console.log('✅ Vote submitted successfully!');

//     } catch (error) {
//       console.error('❌ Error:', error);
//       alert(`Failed to submit vote: ${error.message}`);
//     } finally {
//       setVotingInProgress(false);
//       setShowPaymentModal(false);
//     }
//   };

//   const handleSuccessModalClose = () => {
//     setShowSuccessModal(false);
//     navigate('/my-votes');
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading election...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !currentElection) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
//           <p className="text-red-600 font-semibold mb-2">Error Loading Election</p>
//           <p className="text-gray-600 mb-4">{error || 'Not found'}</p>
//           <button
//             onClick={() => navigate(-1)}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const videoUrl = currentElection.topic_video_url || currentElection.video_url;
//   const isLotterized = Boolean(currentElection.is_lotterized);
//   const lotteryPrizeAmount = parseFloat(currentElection.lottery_prize_amount) || 0;
//   const lotteryWinnerCount = parseInt(currentElection.lottery_winner_count) || 1;

//   console.log('🎰 Lottery Display Check:', {
//     isLotterized,
//     lotteryPrizeAmount,
//     lotteryWinnerCount,
//     activeTab
//   });

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       <button
//         onClick={() => navigate(-1)}
//         className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700"
//       >
//         <ArrowLeft size={20} />
//         Back
//       </button>

//       <ElectionHeader
//         election={currentElection}
//         formatDate={formatDate}
//         videoUrl={videoUrl}
//         videoWatched={videoWatched}
//         onWatchVideo={() => setShowVideo(true)}
//       />

//       {!canUserVote.can && (
//         <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6 rounded-r-lg">
//           <div className="flex items-start gap-4">
//             <AlertCircle className="text-yellow-600" size={24} />
//             <div>
//               <h3 className="text-lg font-semibold text-yellow-800 mb-2">Cannot Vote</h3>
//               <p className="text-yellow-700">{canUserVote.reason}</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Tabs */}
//       <div className="bg-white rounded-lg shadow mb-6">
//         <div className="flex border-b overflow-x-auto">
//           <button
//             onClick={() => setActiveTab('overview')}
//             className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
//               activeTab === 'overview'
//                 ? 'border-b-2 border-blue-600 text-blue-600'
//                 : 'text-gray-600 hover:text-gray-900'
//             }`}
//           >
//             Overview
//           </button>
//           {!currentElection.is_free && (
//             <button
//               onClick={() => setActiveTab('pricing')}
//               className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
//                 activeTab === 'pricing'
//                   ? 'border-b-2 border-blue-600 text-blue-600'
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               Pricing
//             </button>
//           )}
//           {isLotterized && (
//             <button
//               onClick={() => setActiveTab('lottery')}
//               className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
//                 activeTab === 'lottery'
//                   ? 'border-b-2 border-blue-600 text-blue-600'
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               🎰 Lottery
//             </button>
//           )}
//           {canUserVote.can && currentElection.questions?.length > 0 && (
//             <button
//               onClick={() => setActiveTab('vote')}
//               className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
//                 activeTab === 'vote'
//                   ? 'border-b-2 border-blue-600 text-blue-600'
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               Vote Now
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Tab Content */}
//       <div className="bg-white rounded-lg shadow-lg p-8">
//         {activeTab === 'overview' && (
//           <div className="space-y-6">
//             <h2 className="text-2xl font-bold text-gray-900">Election Overview</h2>
//             <p className="text-gray-700">{currentElection.description || 'No description'}</p>
            
//             {currentElection.voting_body_content && (
//               <div dangerouslySetInnerHTML={{ __html: currentElection.voting_body_content }} />
//             )}

//             {videoUrl && (
//               <div className="mt-6">
//                 <h3 className="text-xl font-bold text-gray-900 mb-4">Election Video</h3>
//                 <button
//                   onClick={() => setShowVideo(true)}
//                   className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
//                 >
//                   <Play size={20} />
//                   {videoWatched ? 'Watch Again' : 'Watch Video (Required)'}
//                 </button>
//               </div>
//             )}

//             {currentElection.questions?.length > 0 && (
//               <div className="mt-6">
//                 <h3 className="text-xl font-bold text-gray-900 mb-4">
//                   Questions ({currentElection.questions.length})
//                 </h3>
//                 <p className="text-gray-600">
//                   This election has {currentElection.questions.length} question(s).
//                   {canUserVote.can ? ' Click "Vote Now" to participate.' : ''}
//                 </p>
//               </div>
//             )}

//             {/* Show lottery info on overview if enabled */}
//             {isLotterized && (
//               <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg">
//                 <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//                   🎰 Lottery Enabled!
//                 </h3>
//                 <div className="space-y-2 text-gray-700">
//                   <p className="font-semibold">Vote to win amazing prizes!</p>
//                   <p>💰 Prize Pool: {applicableFee?.currency || 'USD'} {lotteryPrizeAmount.toFixed(2)}</p>
//                   <p>🏆 Winners: {lotteryWinnerCount}</p>
//                   <p className="text-sm text-gray-600 mt-4">
//                     Each vote automatically enters you into the lottery draw!
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === 'pricing' && (
//           <PricingTab
//             election={currentElection}
//             userRegion={userRegion}
//             applicableFee={applicableFee}
//             processingFeePercent={processingFeePercent}
//           />
//         )}

//         {activeTab === 'lottery' && isLotterized && (
//           <div>
//             <h2 className="text-2xl font-bold text-gray-900 mb-6">🎰 Lottery Information</h2>
            
//             <div className="mb-8">
//               <LotteryMachine
//                 isVisible={true}
//                 isSpinning={canUserVote.can}
//                 prizeAmount={lotteryPrizeAmount}
//                 currency={applicableFee?.currency || 'USD'}
//                 winnerCount={lotteryWinnerCount}
//                 showVoteBall={false}
//                 ballNumber={null}
//               />
//             </div>

//             <div className="grid md:grid-cols-2 gap-6">
//               <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
//                 <h3 className="font-bold text-lg mb-4 text-blue-900">💰 Prize Details</h3>
//                 <div className="space-y-3">
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-700">Total Prize Pool:</span>
//                     <span className="font-bold text-xl text-blue-600">
//                       {applicableFee?.currency || 'USD'} {lotteryPrizeAmount.toFixed(2)}
//                     </span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-700">Number of Winners:</span>
//                     <span className="font-bold text-xl text-blue-600">{lotteryWinnerCount}</span>
//                   </div>
//                   {lotteryWinnerCount > 1 && (
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-700">Prize per Winner:</span>
//                       <span className="font-bold text-lg text-blue-600">
//                         {applicableFee?.currency || 'USD'} {(lotteryPrizeAmount / lotteryWinnerCount).toFixed(2)}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
//                 <h3 className="font-bold text-lg mb-4 text-green-900">✅ How to Participate</h3>
//                 <ul className="space-y-2 text-gray-700">
//                   <li className="flex items-start gap-2">
//                     <span className="text-green-600 font-bold">1.</span>
//                     <span>Cast your vote in this election</span>
//                   </li>
//                   <li className="flex items-start gap-2">
//                     <span className="text-green-600 font-bold">2.</span>
//                     <span>Receive automatic lottery entry</span>
//                   </li>
//                   <li className="flex items-start gap-2">
//                     <span className="text-green-600 font-bold">3.</span>
//                     <span>Get unique lottery ticket number</span>
//                   </li>
//                   <li className="flex items-start gap-2">
//                     <span className="text-green-600 font-bold">4.</span>
//                     <span>Winners announced at election end</span>
//                   </li>
//                 </ul>
//               </div>
//             </div>

//             <div className="mt-6 p-6 bg-purple-50 border border-purple-200 rounded-lg">
//               <h3 className="font-bold text-lg mb-4 text-purple-900">🎲 How Winners Are Selected</h3>
//               <div className="space-y-3 text-gray-700">
//                 <p>
//                   <strong>Fair & Transparent:</strong> Winners are selected using cryptographically secure 
//                   random number generation, ensuring complete fairness.
//                 </p>
//                 <p>
//                   <strong>Automatic Draw:</strong> The lottery draw happens automatically when the election 
//                   ends on {formatDate(currentElection.end_date)}.
//                 </p>
//                 <p>
//                   <strong>Verification:</strong> All lottery draws are recorded on the blockchain for 
//                   complete transparency and verification.
//                 </p>
//                 <p className="text-sm text-gray-600 mt-4">
//                   <strong>Note:</strong> You must vote to be eligible for the lottery. Each voter receives 
//                   exactly one lottery ticket, ensuring equal chances for all participants.
//                 </p>
//               </div>
//             </div>

//             {canUserVote.can && (
//               <div className="mt-6 text-center">
//                 <button
//                   onClick={() => setActiveTab('vote')}
//                   className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-bold rounded-lg hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all shadow-lg"
//                 >
//                   🎰 Vote Now & Enter Lottery
//                 </button>
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === 'vote' && canUserVote.can && currentElection.questions?.length > 0 && (
//           <VoteTab
//             election={currentElection}
//             selectedAnswers={selectedAnswers}
//             onAnswerSelect={handleAnswerSelect}
//             applicableFee={applicableFee}
//             agreeToTerms={agreeToTerms}
//             setAgreeToTerms={setAgreeToTerms}
//             onSubmit={handleVoteSubmit}
//             votingInProgress={votingInProgress}
//             videoUrl={videoUrl}
//             videoWatched={videoWatched}
//             onWatchVideo={() => setShowVideo(true)}
//           />
//         )}
//       </div>

//       {/* Modals */}
//       <VideoModal
//         videoUrl={videoUrl}
//         isOpen={showVideo}
//         onClose={() => setShowVideo(false)}
//         videoWatched={videoWatched}
//         onVideoEnd={() => setVideoWatched(true)}
//       />

//       <PaymentModal
//         isOpen={showPaymentModal}
//         onClose={() => setShowPaymentModal(false)}
//         electionId={electionId}
//         applicableFee={applicableFee}
//         onPaymentSuccess={(paymentId) => {
//           console.log('✅ Payment successful:', paymentId);
//           submitVote();
//         }}
//       />

//       {/* Lottery Animation Overlay */}
//       {showLotteryAnimation && (
//         <div className="fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center z-50 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl p-8 max-w-2xl shadow-2xl">
//             <h2 className="text-3xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
//               🎰 Entering Lottery...
//             </h2>
//             <p className="text-center text-gray-600 mb-6">Your vote is being added to the lottery machine!</p>
//             <LotteryMachine
//               isVisible={true}
//               isSpinning={true}
//               prizeAmount={lotteryPrizeAmount}
//               currency={applicableFee?.currency || 'USD'}
//               winnerCount={lotteryWinnerCount}
//               showVoteBall={true}
//               ballNumber={lotteryBallNumber}
//             />
//             <div className="mt-6 text-center">
//               <p className="text-lg font-semibold text-gray-800">
//                 Your Lottery Ticket: <span className="text-blue-600">#{lotteryBallNumber}</span>
//               </p>
//               <p className="text-sm text-gray-600 mt-2">Good luck! 🍀</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Success Modal */}
//       <VoteSuccessModal
//         isOpen={showSuccessModal}
//         onClose={handleSuccessModalClose}
//         voteData={voteReceiptData}
//         electionTitle={currentElection.title}
//       />
//     </div>
//   );
// }
// import React, { useState, useEffect, useMemo } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { ArrowLeft, AlertCircle, Loader, Play } from 'lucide-react';
// import { getElection } from '../../redux/api/election/electionApi';
// import { 
//   generateVoteId, 
//   generateReceiptId, 
//   generateLotteryTicket,
//   createVoteHash,
//   encryptVoteData 
// } from '../../utils/voteEncryption';

// // Import components
// import ElectionHeader from '../../components/election/VotingView/ElectionHeader';
// import VideoModal from '../../components/election/VotingView/VideoModal';
// import PricingTab from '../../components/election/VotingView/PricingTab';
// import VoteTab from '../../components/election/VotingView/VoteTab';
// import PaymentModal from '../../components/election/VotingView/PaymentModal';
// import LotteryMachine from '../../components/election/VotingView/LotteryMachine';
// import VoteSuccessModal from '../../components/election/VotingView/VoteSuccessModal';

// export default function ElectionVotingView() {
//   const { electionId } = useParams();
//   const navigate = useNavigate();

//   // State
//   const [currentElection, setCurrentElection] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [selectedAnswers, setSelectedAnswers] = useState({});
//   const [userCountry, setUserCountry] = useState(null);
//   const [userRegion, setUserRegion] = useState(null);
//   const [applicableFee, setApplicableFee] = useState(null);
//   const [processingFeePercent, setProcessingFeePercent] = useState(0);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   /*eslint-disable*/
//   const [paymentMethod, setPaymentMethod] = useState('wallet');
//   const [agreeToTerms, setAgreeToTerms] = useState(false);
//   const [votingInProgress, setVotingInProgress] = useState(false);
//   const [videoWatched, setVideoWatched] = useState(false);
//   const [showVideo, setShowVideo] = useState(false);
  
//   // Lottery & Success states
//   const [showLotteryAnimation, setShowLotteryAnimation] = useState(false);
//   const [lotteryBallNumber, setLotteryBallNumber] = useState(null);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);
//   const [voteReceiptData, setVoteReceiptData] = useState(null);

//   // Get user data
//   const getUserData = () => {
//     try {
//       const userDataStr = localStorage.getItem('userData');
//       if (userDataStr) {
//         return JSON.parse(userDataStr);
//       }
//     } catch (err) {
//       console.error('Error reading user data:', err);
//     }
//     return null;
//   };

//   // Get user country and processing fee from localStorage
//   useEffect(() => {
//     try {
//       const userDataStr = localStorage.getItem('userData');
//       if (userDataStr) {
//         const userData = JSON.parse(userDataStr);
//         console.log('👤 User data:', userData);
//         setUserCountry(userData.country || null);
//       }

//       const persistStr = localStorage.getItem('persist:vottery-root');
//       if (persistStr) {
//         const persist = JSON.parse(persistStr);
//         const subscriptionData = JSON.parse(persist.subscription || '{}');
        
//         const processingFee = parseFloat(
//           subscriptionData.currentPlan?.processingFeePercentage ||
//           subscriptionData.processingFeePercentage ||
//           0
//         );
        
//         console.log('💰 Processing fee:', processingFee + '%');
//         setProcessingFeePercent(processingFee);
//       }
//     } catch (err) {
//       console.error('Error reading localStorage:', err);
//     }
//   }, []);

//   // Fetch election data
//   useEffect(() => {
//     let isMounted = true;

//     const fetchElectionData = async () => {
//       if (!electionId) return;

//       try {
//         setLoading(true);
//         setError(null);

//         const response = await getElection(electionId);
//         if (!isMounted) return;

//         let electionData = response.data?.election || response.election || response.data || response;
//         console.log('🔍 RAW ELECTION DATA:', electionData);
// console.log('🔍 is_lotterized:', electionData.is_lotterized);
// console.log('🔍 lottery_prize_amount:', electionData.lottery_prize_amount);
// console.log('🔍 lottery_winner_count:', electionData.lottery_winner_count);
//         if (electionData?.id) {
//           console.log('✅ Election loaded:', electionData.title);
//           console.log('🎰 Lottery enabled:', electionData.is_lotterized);
//           setCurrentElection(electionData);
//         } else {
//           throw new Error('Election data not found');
//         }
//       } catch (err) {
//         if (!isMounted) return;
//         console.error('❌ Error:', err);
//         setError(err.message || 'Failed to load election');
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     };

//     fetchElectionData();
//     return () => { isMounted = false; };
//   }, [electionId]);

//   // Detect user's region
//   useEffect(() => {
//     if (!currentElection || !userCountry) return;
//     if (currentElection.is_free || currentElection.pricing_type !== 'regional_fee') return;
//     if (!currentElection.regional_pricing?.length) return;

//     const regionMap = {
//       'US': 'region_1_us_canada', 'CA': 'region_1_us_canada',
//       'United States': 'region_1_us_canada', 'Canada': 'region_1_us_canada',
//       'GB': 'region_2_western_europe', 'DE': 'region_2_western_europe',
//       'FR': 'region_2_western_europe', 'IT': 'region_2_western_europe',
//       'PL': 'region_3_eastern_europe', 'RO': 'region_3_eastern_europe',
//       'NG': 'region_4_africa', 'ZA': 'region_4_africa',
//       'BR': 'region_5_latin_america', 'MX': 'region_5_latin_america',
//       'BD': 'region_6_middle_east_asia', 'IN': 'region_6_middle_east_asia',
//       'Bangladesh': 'region_6_middle_east_asia', 'India': 'region_6_middle_east_asia',
//       'AU': 'region_7_australasia', 'NZ': 'region_7_australasia',
//     };

//     const regionCode = regionMap[userCountry];
//     const matched = regionCode 
//       ? currentElection.regional_pricing.find(r => r.region_code === regionCode)
//       : null;

//     console.log('🌍 Region detection:', { userCountry, regionCode, matched: matched?.region_name });
//     setUserRegion(matched || currentElection.regional_pricing[0]);
//   }, [currentElection, userCountry]);

//   // Calculate fee
//   useEffect(() => {
//     if (!currentElection) return;

//     if (currentElection.is_free) {
//       setApplicableFee({ 
//         participationFee: 0, 
//         processingFee: 0, 
//         total: 0, 
//         frozenAmount: 0,
//         currency: 'USD' 
//       });
//       return;
//     }

//     if (currentElection.pricing_type === 'general_fee') {
//       const baseFee = parseFloat(currentElection.general_participation_fee || 0);
//       const processing = baseFee * (processingFeePercent / 100);
      
//       setApplicableFee({
//         participationFee: baseFee,
//         processingFee: processing,
//         total: baseFee + processing,
//         frozenAmount: baseFee,
//         currency: 'USD',
//         processingPercentage: processingFeePercent
//       });
//     } else if (currentElection.pricing_type === 'regional_fee' && userRegion) {
//       const baseFee = parseFloat(userRegion.participation_fee || 0);
//       const processing = baseFee * (processingFeePercent / 100);
      
//       setApplicableFee({
//         participationFee: baseFee,
//         processingFee: processing,
//         total: baseFee + processing,
//         frozenAmount: baseFee,
//         currency: userRegion.currency || 'USD',
//         region: userRegion.region_name,
//         processingPercentage: processingFeePercent
//       });
//     }
//   }, [currentElection, userRegion, processingFeePercent]);

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Not set';
//     try {
//       const date = new Date(dateString);
//       return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US', { 
//         year: 'numeric', month: 'long', day: 'numeric' 
//       });
//     } catch { return 'Invalid Date'; }
//   };

//   const canUserVote = useMemo(() => {
//     if (!currentElection) return { can: false, reason: 'Election not found' };

//     const now = new Date();
//     const startDate = new Date(currentElection.start_date);
//     const endDate = new Date(currentElection.end_date);

//     if (currentElection.status !== 'published' && currentElection.status !== 'active') {
//       return { can: false, reason: `Election is ${currentElection.status}` };
//     }

//     if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
//       return { can: false, reason: 'Invalid dates' };
//     }

//     if (now < startDate) {
//       return { can: false, reason: `Starts on ${formatDate(currentElection.start_date)}` };
//     }

//     if (now > endDate) {
//       return { can: false, reason: 'Election has ended' };
//     }

//     return { can: true, reason: null };
//   }, [currentElection]);

//   const handleAnswerSelect = (questionId, optionId, questionType, maxSelections) => {
//     setSelectedAnswers(prev => {
//       const current = prev[questionId] || [];
      
//       if (questionType === 'multiple_choice' && maxSelections === 1) {
//         return { ...prev, [questionId]: [optionId] };
//       } else {
//         if (current.includes(optionId)) {
//           return { ...prev, [questionId]: current.filter(id => id !== optionId) };
//         } else {
//           if (maxSelections && current.length >= maxSelections) return prev;
//           return { ...prev, [questionId]: [...current, optionId] };
//         }
//       }
//     });
//   };

//   const validateAnswers = () => {
//     if (!currentElection?.questions) return { valid: true, errors: [] };

//     const errors = [];
//     currentElection.questions.forEach(question => {
//       if (question.is_required && !selectedAnswers[question.id]?.length) {
//         errors.push(`"${question.question_text}" is required`);
//       }
//     });

//     return { valid: errors.length === 0, errors };
//   };

//   const handleVoteSubmit = async () => {
//     const videoUrl = currentElection.topic_video_url || currentElection.video_url;
    
//     if (videoUrl && !videoWatched) {
//       alert('You must watch the video before voting');
//       setShowVideo(true);
//       return;
//     }

//     const validation = validateAnswers();
//     if (!validation.valid) {
//       alert(validation.errors.join('\n'));
//       return;
//     }

//     if (!currentElection.is_free && !agreeToTerms) {
//       alert('Please agree to the terms');
//       return;
//     }

//     if (!currentElection.is_free) {
//       setShowPaymentModal(true);
//     } else {
//       await submitVote();
//     }
//   };

//   const submitVote = async () => {
//     try {
//       setVotingInProgress(true);

//       const userData = getUserData();
//       if (!userData) {
//         throw new Error('User not authenticated');
//       }

//       // Generate secure IDs
//       const voteId = generateVoteId();
//       const receiptId = generateReceiptId();
//       const timestamp = new Date().toISOString();

//       // Prepare vote data
//       const voteData = {
//         voteId,
//         receiptId,
//         timestamp,
//         electionId: currentElection.id,
//         userId: userData.userId,
//         answers: Object.keys(selectedAnswers).map(qId => ({
//           question_id: parseInt(qId),
//           option_ids: selectedAnswers[qId]
//         })),
//         payment: !currentElection.is_free ? {
//           total: applicableFee.total,
//           participationFee: applicableFee.participationFee,
//           processingFee: applicableFee.processingFee,
//           currency: applicableFee.currency,
//           method: paymentMethod,
//           region: userRegion?.region_code
//         } : null
//       };

//       // Create vote hash for integrity
//       const voteHash = createVoteHash(voteData);
//       voteData.voteHash = voteHash;

//       // Encrypt sensitive data
//       const encryptedVote = encryptVoteData(voteData);

//       console.log('📤 Submitting encrypted vote...');
//       console.log('🔒 Vote Hash:', voteHash);

//       // TODO: Replace with actual API call
//       // const response = await fetch('http://localhost:5006/api/votes/submit', {
//       //   method: 'POST',
//       //   headers: { 'Content-Type': 'application/json' },
//       //   body: JSON.stringify({ encryptedVote })
//       // });

//       // Simulate API response
//       await new Promise(resolve => setTimeout(resolve, 1500));

//       // Generate lottery ticket if election is lotterized
//       let lotteryTicketNumber = null;
//       if (currentElection.is_lotterized) {
//         lotteryTicketNumber = generateLotteryTicket(userData.userId, currentElection.id);
//         setLotteryBallNumber(lotteryTicketNumber);
//         setShowLotteryAnimation(true);

//         // Show animation for 2 seconds
//         setTimeout(() => {
//           setShowLotteryAnimation(false);
//         }, 2000);
//       }

//       // Prepare receipt data
//       const receiptData = {
//         voteId,
//         receiptId,
//         timestamp,
//         lotteryTicketNumber,
//         voteHash,
//         electionTitle: currentElection.title,
//         electionId: currentElection.id
//       };

//       setVoteReceiptData(receiptData);

//       // Show success modal
//       setTimeout(() => {
//         setShowSuccessModal(true);
//       }, currentElection.is_lotterized ? 2500 : 500);

//       console.log('✅ Vote submitted successfully!');

//     } catch (error) {
//       console.error('❌ Error:', error);
//       alert(`Failed to submit vote: ${error.message}`);
//     } finally {
//       setVotingInProgress(false);
//       setShowPaymentModal(false);
//     }
//   };

//   const handleSuccessModalClose = () => {
//     setShowSuccessModal(false);
//     navigate('/my-votes');
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading election...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !currentElection) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
//           <p className="text-red-600 font-semibold mb-2">Error Loading Election</p>
//           <p className="text-gray-600 mb-4">{error || 'Not found'}</p>
//           <button
//             onClick={() => navigate(-1)}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const videoUrl = currentElection.topic_video_url || currentElection.video_url;
//   const isLotterized = currentElection.is_lotterized || false;

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       <button
//         onClick={() => navigate(-1)}
//         className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700"
//       >
//         <ArrowLeft size={20} />
//         Back
//       </button>

//       <ElectionHeader
//         election={currentElection}
//         formatDate={formatDate}
//         videoUrl={videoUrl}
//         videoWatched={videoWatched}
//         onWatchVideo={() => setShowVideo(true)}
//       />

//       {!canUserVote.can && (
//         <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6 rounded-r-lg">
//           <div className="flex items-start gap-4">
//             <AlertCircle className="text-yellow-600" size={24} />
//             <div>
//               <h3 className="text-lg font-semibold text-yellow-800 mb-2">Cannot Vote</h3>
//               <p className="text-yellow-700">{canUserVote.reason}</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Tabs */}
//       <div className="bg-white rounded-lg shadow mb-6">
//         <div className="flex border-b overflow-x-auto">
//           <button
//             onClick={() => setActiveTab('overview')}
//             className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
//               activeTab === 'overview'
//                 ? 'border-b-2 border-blue-600 text-blue-600'
//                 : 'text-gray-600 hover:text-gray-900'
//             }`}
//           >
//             Overview
//           </button>
//           {!currentElection.is_free && (
//             <button
//               onClick={() => setActiveTab('pricing')}
//               className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
//                 activeTab === 'pricing'
//                   ? 'border-b-2 border-blue-600 text-blue-600'
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               Pricing
//             </button>
//           )}
//           {isLotterized && (
//             <button
//               onClick={() => setActiveTab('lottery')}
//               className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
//                 activeTab === 'lottery'
//                   ? 'border-b-2 border-blue-600 text-blue-600'
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               🎰 Lottery
//             </button>
//           )}
//           {canUserVote.can && currentElection.questions?.length > 0 && (
//             <button
//               onClick={() => setActiveTab('vote')}
//               className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
//                 activeTab === 'vote'
//                   ? 'border-b-2 border-blue-600 text-blue-600'
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               Vote Now
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Tab Content */}
//       <div className="bg-white rounded-lg shadow-lg p-8">
//         {activeTab === 'overview' && (
//           <div className="space-y-6">
//             <h2 className="text-2xl font-bold text-gray-900">Election Overview</h2>
//             <p className="text-gray-700">{currentElection.description || 'No description'}</p>
            
//             {currentElection.voting_body_content && (
//               <div dangerouslySetInnerHTML={{ __html: currentElection.voting_body_content }} />
//             )}

//             {videoUrl && (
//               <div className="mt-6">
//                 <h3 className="text-xl font-bold text-gray-900 mb-4">Election Video</h3>
//                 <button
//                   onClick={() => setShowVideo(true)}
//                   className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
//                 >
//                   <Play size={20} />
//                   {videoWatched ? 'Watch Again' : 'Watch Video (Required)'}
//                 </button>
//               </div>
//             )}

//             {currentElection.questions?.length > 0 && (
//               <div className="mt-6">
//                 <h3 className="text-xl font-bold text-gray-900 mb-4">
//                   Questions ({currentElection.questions.length})
//                 </h3>
//                 <p className="text-gray-600">
//                   This election has {currentElection.questions.length} question(s).
//                   {canUserVote.can ? ' Click "Vote Now" to participate.' : ''}
//                 </p>
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === 'pricing' && (
//           <PricingTab
//             election={currentElection}
//             userRegion={userRegion}
//             applicableFee={applicableFee}
//             processingFeePercent={processingFeePercent}
//           />
//         )}

//         {activeTab === 'lottery' && isLotterized && (
//           <div>
//             <h2 className="text-2xl font-bold text-gray-900 mb-6">Lottery Information</h2>
//             <LotteryMachine
//               isVisible={true}
//               isSpinning={canUserVote.can}
//               prizeAmount={currentElection.lottery_prize_amount || 0}
//               currency={applicableFee?.currency || 'USD'}
//               winnerCount={currentElection.lottery_winner_count || 1}
//               showVoteBall={false}
//               ballNumber={null}
//             />
//             <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
//               <h3 className="font-bold text-lg mb-4">How it Works:</h3>
//               <ul className="space-y-2 text-gray-700">
//                 <li>✅ Vote to automatically enter the lottery</li>
//                 <li>🎫 Each vote gets a unique lottery ticket number</li>
//                 <li>🎰 Winners drawn randomly at election end</li>
//                 <li>💰 Prize: {applicableFee?.currency || 'USD'} {currentElection.lottery_prize_amount?.toFixed(2) || '0.00'}</li>
//                 <li>🏆 Winners: {currentElection.lottery_winner_count || 1}</li>
//               </ul>
//             </div>
//           </div>
//         )}

//         {activeTab === 'vote' && canUserVote.can && currentElection.questions?.length > 0 && (
//           <VoteTab
//             election={currentElection}
//             selectedAnswers={selectedAnswers}
//             onAnswerSelect={handleAnswerSelect}
//             applicableFee={applicableFee}
//             agreeToTerms={agreeToTerms}
//             setAgreeToTerms={setAgreeToTerms}
//             onSubmit={handleVoteSubmit}
//             votingInProgress={votingInProgress}
//             videoUrl={videoUrl}
//             videoWatched={videoWatched}
//             onWatchVideo={() => setShowVideo(true)}
//           />
//         )}
//       </div>

//       {/* Modals */}
//       <VideoModal
//         videoUrl={videoUrl}
//         isOpen={showVideo}
//         onClose={() => setShowVideo(false)}
//         videoWatched={videoWatched}
//         onVideoEnd={() => setVideoWatched(true)}
//       />

//       <PaymentModal
//         isOpen={showPaymentModal}
//         onClose={() => setShowPaymentModal(false)}
//         electionId={electionId}
//         applicableFee={applicableFee}
//         onPaymentSuccess={(paymentId) => {
//           console.log('✅ Payment successful:', paymentId);
//           submitVote();
//         }}
//       />

//       {/* Lottery Animation Overlay */}
//       {showLotteryAnimation && (
//         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
//           <div className="bg-white rounded-2xl p-8 max-w-lg">
//             <h2 className="text-2xl font-bold text-center mb-4">🎰 Entering Lottery...</h2>
//             <LotteryMachine
//               isVisible={true}
//               isSpinning={true}
//               prizeAmount={currentElection.lottery_prize_amount || 0}
//               currency={applicableFee?.currency || 'USD'}
//               winnerCount={currentElection.lottery_winner_count || 1}
//               showVoteBall={true}
//               ballNumber={lotteryBallNumber}
//             />
//           </div>
//         </div>
//       )}

//       {/* Success Modal */}
//       <VoteSuccessModal
//         isOpen={showSuccessModal}
//         onClose={handleSuccessModalClose}
//         voteData={voteReceiptData}
//         electionTitle={currentElection.title}
//       />
//     </div>
//   );
// }
// import React, { useState, useEffect, useMemo } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { ArrowLeft, AlertCircle, Loader, Play } from 'lucide-react';
// import { getElection } from '../../redux/api/election/electionApi';

// // ✅ Import sub-components from components folder
// //import ElectionHeader from '../../components/Election/VotingView/ElectionHeader';
// //import VideoModal from '../../components/Election/VotingView/VideoModal';
// //import PricingTab from '../../components/Election/VotingView/PricingTab';
// //import VoteTab from '../../components/Election/VotingView/VoteTab';
// //import PaymentModal from '../../components/Election/VotingView/PaymentModal';
// import ElectionHeader from '../../components/election/VotingView/ElectionHeader';
// import VideoModal from '../../components/election/VotingView/VideoModal';
// import PricingTab from '../../components/election/VotingView/PricingTab';
// import VoteTab from '../../components/election/VotingView/VoteTab';
// import PaymentModal from '../../components/election/VotingView/PaymentModal';

// export default function ElectionVotingView() {
//   const { electionId } = useParams();
//   const navigate = useNavigate();

//   // State
//   const [currentElection, setCurrentElection] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [selectedAnswers, setSelectedAnswers] = useState({});
//   const [userCountry, setUserCountry] = useState(null);
//   const [userRegion, setUserRegion] = useState(null);
//   const [applicableFee, setApplicableFee] = useState(null);
//   const [processingFeePercent, setProcessingFeePercent] = useState(0);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [paymentMethod, setPaymentMethod] = useState('wallet');
//   const [agreeToTerms, setAgreeToTerms] = useState(false);
//   const [votingInProgress, setVotingInProgress] = useState(false);
//   const [videoWatched, setVideoWatched] = useState(false);
//   const [showVideo, setShowVideo] = useState(false);

//   // ✅ Get user country and processing fee from localStorage
//   useEffect(() => {
//     try {
//       const userDataStr = localStorage.getItem('userData');
//       if (userDataStr) {
//         const userData = JSON.parse(userDataStr);
//         console.log('👤 User data:', userData);
//         setUserCountry(userData.country || null);
//       }

//       const persistStr = localStorage.getItem('persist:vottery-root');
//       if (persistStr) {
//         const persist = JSON.parse(persistStr);
//         const subscriptionData = JSON.parse(persist.subscription || '{}');
        
//         const processingFee = parseFloat(
//           subscriptionData.currentPlan?.processingFeePercentage ||
//           subscriptionData.processingFeePercentage ||
//           0
//         );
        
//         console.log('💰 Processing fee:', processingFee + '%');
//         setProcessingFeePercent(processingFee);
//       }
//     } catch (err) {
//       console.error('Error reading localStorage:', err);
//     }
//   }, []);

//   // ✅ Fetch election data
//   useEffect(() => {
//     let isMounted = true;

//     const fetchElectionData = async () => {
//       if (!electionId) return;

//       try {
//         setLoading(true);
//         setError(null);

//         const response = await getElection(electionId);
//         if (!isMounted) return;

//         let electionData = response.data?.election || response.election || response.data || response;
        
//         if (electionData?.id) {
//           console.log('✅ Election loaded:', electionData.title);
//           setCurrentElection(electionData);
//         } else {
//           throw new Error('Election data not found');
//         }
//       } catch (err) {
//         if (!isMounted) return;
//         console.error('❌ Error:', err);
//         setError(err.message || 'Failed to load election');
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     };

//     fetchElectionData();
//     return () => { isMounted = false; };
//   }, [electionId]);

//   // ✅ Detect user's region
//   useEffect(() => {
//     if (!currentElection || !userCountry) return;
//     if (currentElection.is_free || currentElection.pricing_type !== 'regional_fee') return;
//     if (!currentElection.regional_pricing?.length) return;

//     const regionMap = {
//       'US': 'region_1_us_canada', 'CA': 'region_1_us_canada',
//       'United States': 'region_1_us_canada', 'Canada': 'region_1_us_canada',
//       'GB': 'region_2_western_europe', 'DE': 'region_2_western_europe',
//       'FR': 'region_2_western_europe', 'IT': 'region_2_western_europe',
//       'PL': 'region_3_eastern_europe', 'RO': 'region_3_eastern_europe',
//       'NG': 'region_4_africa', 'ZA': 'region_4_africa',
//       'BR': 'region_5_latin_america', 'MX': 'region_5_latin_america',
//       'BD': 'region_6_middle_east_asia', 'IN': 'region_6_middle_east_asia',
//       'Bangladesh': 'region_6_middle_east_asia', 'India': 'region_6_middle_east_asia',
//       'AU': 'region_7_australasia', 'NZ': 'region_7_australasia',
//     };

//     const regionCode = regionMap[userCountry];
//     const matched = regionCode 
//       ? currentElection.regional_pricing.find(r => r.region_code === regionCode)
//       : null;

//     console.log('🌍 Region detection:', { userCountry, regionCode, matched: matched?.region_name });
//     setUserRegion(matched || currentElection.regional_pricing[0]);
//   }, [currentElection, userCountry]);

//   // ✅ Calculate fee
//   useEffect(() => {
//     if (!currentElection) return;

//     if (currentElection.is_free) {
//       setApplicableFee({ 
//         participationFee: 0, 
//         processingFee: 0, 
//         total: 0, 
//         frozenAmount: 0,
//         currency: 'USD' 
//       });
//       return;
//     }

//     if (currentElection.pricing_type === 'general_fee') {
//       const baseFee = parseFloat(currentElection.general_participation_fee || 0);
//       const processing = baseFee * (processingFeePercent / 100);
      
//       console.log('💰 General fee:', { baseFee, processing, total: baseFee + processing });
      
//       setApplicableFee({
//         participationFee: baseFee,
//         processingFee: processing,
//         total: baseFee + processing,
//         frozenAmount: baseFee,
//         currency: 'USD'
//       });
//     } else if (currentElection.pricing_type === 'regional_fee' && userRegion) {
//       const baseFee = parseFloat(userRegion.participation_fee || 0);
//       const processing = baseFee * (processingFeePercent / 100);
      
//       console.log('💰 Regional fee:', { 
//         baseFee, 
//         processing, 
//         total: baseFee + processing,
//         region: userRegion.region_name 
//       });
      
//       setApplicableFee({
//         participationFee: baseFee,
//         processingFee: processing,
//         total: baseFee + processing,
//         frozenAmount: baseFee,
//         currency: userRegion.currency || 'USD',
//         region: userRegion.region_name
//       });
//     }
//   }, [currentElection, userRegion, processingFeePercent]);

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Not set';
//     try {
//       const date = new Date(dateString);
//       return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US', { 
//         year: 'numeric', month: 'long', day: 'numeric' 
//       });
//     } catch { return 'Invalid Date'; }
//   };

//   const canUserVote = useMemo(() => {
//     if (!currentElection) return { can: false, reason: 'Election not found' };

//     const now = new Date();
//     const startDate = new Date(currentElection.start_date);
//     const endDate = new Date(currentElection.end_date);

//     if (currentElection.status !== 'published' && currentElection.status !== 'active') {
//       return { can: false, reason: `Election is ${currentElection.status}` };
//     }

//     if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
//       return { can: false, reason: 'Invalid dates' };
//     }

//     if (now < startDate) {
//       return { can: false, reason: `Starts on ${formatDate(currentElection.start_date)}` };
//     }

//     if (now > endDate) {
//       return { can: false, reason: 'Election has ended' };
//     }

//     return { can: true, reason: null };
//   }, [currentElection]);

//   const handleAnswerSelect = (questionId, optionId, questionType, maxSelections) => {
//     setSelectedAnswers(prev => {
//       const current = prev[questionId] || [];
      
//       if (questionType === 'multiple_choice' && maxSelections === 1) {
//         return { ...prev, [questionId]: [optionId] };
//       } else {
//         if (current.includes(optionId)) {
//           return { ...prev, [questionId]: current.filter(id => id !== optionId) };
//         } else {
//           if (maxSelections && current.length >= maxSelections) return prev;
//           return { ...prev, [questionId]: [...current, optionId] };
//         }
//       }
//     });
//   };

//   const validateAnswers = () => {
//     if (!currentElection?.questions) return { valid: true, errors: [] };

//     const errors = [];
//     currentElection.questions.forEach(question => {
//       if (question.is_required && !selectedAnswers[question.id]?.length) {
//         errors.push(`"${question.question_text}" is required`);
//       }
//     });

//     return { valid: errors.length === 0, errors };
//   };

//   const handleVoteSubmit = async () => {
//     const videoUrl = currentElection.topic_video_url || currentElection.video_url;
    
//     // ✅ Check video requirement
//     if (videoUrl && !videoWatched) {
//       alert('You must watch the video before voting');
//       setShowVideo(true);
//       return;
//     }

//     const validation = validateAnswers();
//     if (!validation.valid) {
//       alert(validation.errors.join('\n'));
//       return;
//     }

//     if (!currentElection.is_free && !agreeToTerms) {
//       alert('Please agree to the terms');
//       return;
//     }

//     if (!currentElection.is_free) {
//       setShowPaymentModal(true);
//     } else {
//       await submitVote();
//     }
//   };

//   const submitVote = async () => {
//     try {
//       setVotingInProgress(true);

//       const voteData = {
//         election_id: currentElection.id,
//         answers: Object.keys(selectedAnswers).map(qId => ({
//           question_id: parseInt(qId),
//           option_ids: selectedAnswers[qId]
//         })),
//         payment: !currentElection.is_free ? {
//           total: applicableFee.total,
//           participationFee: applicableFee.participationFee,
//           processingFee: applicableFee.processingFee,
//           frozenAmount: applicableFee.frozenAmount,
//           currency: applicableFee.currency,
//           method: paymentMethod,
//           region: userRegion?.region_code
//         } : null
//       };

//       console.log('📤 Submitting vote:', voteData);

//       // TODO: Replace with actual API call
//       // await submitVoteAPI(voteData);

//       alert('Vote submitted successfully!');

//       navigate(`/elections/${currentElection.id}/confirmation`, {
//         state: {
//           voteData,
//           paymentData: applicableFee,
//           electionTitle: currentElection.title,
//           receiptId: 'RECEIPT-' + Date.now()
//         }
//       });
//     } catch (error) {
//       console.error('❌ Error:', error);
//       alert('Failed to submit vote');
//     } finally {
//       setVotingInProgress(false);
//       setShowPaymentModal(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading election...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !currentElection) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
//           <p className="text-red-600 font-semibold mb-2">Error Loading Election</p>
//           <p className="text-gray-600 mb-4">{error || 'Not found'}</p>
//           <button
//             onClick={() => navigate(-1)}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const videoUrl = currentElection.topic_video_url || currentElection.video_url;

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       <button
//         onClick={() => navigate(-1)}
//         className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700"
//       >
//         <ArrowLeft size={20} />
//         Back
//       </button>

//       <ElectionHeader
//         election={currentElection}
//         formatDate={formatDate}
//         videoUrl={videoUrl}
//         videoWatched={videoWatched}
//         onWatchVideo={() => setShowVideo(true)}
//       />

//       {!canUserVote.can && (
//         <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6 rounded-r-lg">
//           <div className="flex items-start gap-4">
//             <AlertCircle className="text-yellow-600" size={24} />
//             <div>
//               <h3 className="text-lg font-semibold text-yellow-800 mb-2">Cannot Vote</h3>
//               <p className="text-yellow-700">{canUserVote.reason}</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Tabs */}
//       <div className="bg-white rounded-lg shadow mb-6">
//         <div className="flex border-b">
//           <button
//             onClick={() => setActiveTab('overview')}
//             className={`px-6 py-4 font-medium transition-colors ${
//               activeTab === 'overview'
//                 ? 'border-b-2 border-blue-600 text-blue-600'
//                 : 'text-gray-600 hover:text-gray-900'
//             }`}
//           >
//             Overview
//           </button>
//           {!currentElection.is_free && (
//             <button
//               onClick={() => setActiveTab('pricing')}
//               className={`px-6 py-4 font-medium transition-colors ${
//                 activeTab === 'pricing'
//                   ? 'border-b-2 border-blue-600 text-blue-600'
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               Pricing
//             </button>
//           )}
//           {canUserVote.can && currentElection.questions?.length > 0 && (
//             <button
//               onClick={() => setActiveTab('vote')}
//               className={`px-6 py-4 font-medium transition-colors ${
//                 activeTab === 'vote'
//                   ? 'border-b-2 border-blue-600 text-blue-600'
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               Vote Now
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Tab Content */}
//       <div className="bg-white rounded-lg shadow-lg p-8">
//         {activeTab === 'overview' && (
//           <div className="space-y-6">
//             <h2 className="text-2xl font-bold text-gray-900">Election Overview</h2>
//             <p className="text-gray-700">{currentElection.description || 'No description'}</p>
            
//             {currentElection.voting_body_content && (
//               <div dangerouslySetInnerHTML={{ __html: currentElection.voting_body_content }} />
//             )}

//             {videoUrl && (
//               <div className="mt-6">
//                 <h3 className="text-xl font-bold text-gray-900 mb-4">Election Video</h3>
//                 <button
//                   onClick={() => setShowVideo(true)}
//                   className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
//                 >
//                   <Play size={20} />
//                   {videoWatched ? 'Watch Again' : 'Watch Video (Required)'}
//                 </button>
//               </div>
//             )}

//             {currentElection.questions?.length > 0 && (
//               <div className="mt-6">
//                 <h3 className="text-xl font-bold text-gray-900 mb-4">
//                   Questions ({currentElection.questions.length})
//                 </h3>
//                 <p className="text-gray-600">
//                   This election has {currentElection.questions.length} question(s).
//                   {canUserVote.can ? ' Click "Vote Now" to participate.' : ''}
//                 </p>
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === 'pricing' && (
//           <PricingTab
//             election={currentElection}
//             userRegion={userRegion}
//             applicableFee={applicableFee}
//             processingFeePercent={processingFeePercent}
//           />
//         )}

//         {activeTab === 'vote' && canUserVote.can && currentElection.questions?.length > 0 && (
//           <VoteTab
//             election={currentElection}
//             selectedAnswers={selectedAnswers}
//             onAnswerSelect={handleAnswerSelect}
//             applicableFee={applicableFee}
//             agreeToTerms={agreeToTerms}
//             setAgreeToTerms={setAgreeToTerms}
//             onSubmit={handleVoteSubmit}
//             votingInProgress={votingInProgress}
//             videoUrl={videoUrl}
//             videoWatched={videoWatched}
//             onWatchVideo={() => setShowVideo(true)}
//           />
//         )}
//       </div>

//       {/* Modals */}
//       <VideoModal
//         videoUrl={videoUrl}
//         isOpen={showVideo}
//         onClose={() => setShowVideo(false)}
//         videoWatched={videoWatched}
//         onVideoEnd={() => setVideoWatched(true)}
//       />

//       {/* <PaymentModal
//         isOpen={showPaymentModal}
//         onClose={() => setShowPaymentModal(false)}
//         applicableFee={applicableFee}
//         paymentMethod={paymentMethod}
//         setPaymentMethod={setPaymentMethod}
//         onConfirm={submitVote}
//         votingInProgress={votingInProgress}
//       /> */}
//       <PaymentModal
//   isOpen={showPaymentModal}
//   onClose={() => setShowPaymentModal(false)}
//   electionId={electionId}
//   setPaymentMethod={setPaymentMethod}
//   applicableFee={{
//     ...applicableFee,
//     processingPercentage: processingFeePercent
//   }}
//   onPaymentSuccess={(paymentId) => {
//     console.log('✅ Payment successful:', paymentId);
//     submitVote();
//   }}
// />
//     </div>
//   );
// }
// import React, { useState, useEffect, useMemo } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// //import { useSelector } from 'react-redux';
// import { 
//   Lock, 
//   DollarSign, 
//   CreditCard, 
//   Calendar, 
//   Clock, 
//   Users, 
//   CheckCircle, 
//   AlertCircle,
//   Info,
//   ArrowLeft,
//   ArrowRight,
//   Vote,
//   Wallet,
//   Trophy,
//   Eye,
//   MapPin,
//   Shield,
//   Loader,
//   Play,
//   PlayCircle
// } from 'lucide-react';
// //import { getElection } from '../../../redux/api/election/electionApi';
// import { getElection } from '../../redux/api/election/electionApi';

// export default function ElectionVotingView() {
//   const { electionId } = useParams();
//   const navigate = useNavigate();

//   // Local State
//   const [currentElection, setCurrentElection] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [selectedAnswers, setSelectedAnswers] = useState({});
//   const [userCountry, setUserCountry] = useState(null);
//   const [userRegion, setUserRegion] = useState(null);
//   const [applicableFee, setApplicableFee] = useState(null);
//   const [processingFeePercent, setProcessingFeePercent] = useState(0);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [paymentMethod, setPaymentMethod] = useState('card');
//   const [agreeToTerms, setAgreeToTerms] = useState(false);
//   const [votingInProgress, setVotingInProgress] = useState(false);
//   const [videoWatched, setVideoWatched] = useState(false);
//   const [showVideo, setShowVideo] = useState(false);

//   // ✅ Get user country and processing fee from localStorage
//   useEffect(() => {
//     try {
//       // Get user country
//       const userDataStr = localStorage.getItem('userData');
//       if (userDataStr) {
//         const userData = JSON.parse(userDataStr);
//         console.log('👤 User data:', userData);
//         setUserCountry(userData.country || null);
//       }

//       // Get processing fee from persist storage
//       const persistStr = localStorage.getItem('persist:vottery-root');
//       if (persistStr) {
//         const persist = JSON.parse(persistStr);
//         const subscriptionData = JSON.parse(persist.subscription || '{}');
//         console.log('💳 Subscription data:', subscriptionData);
        
//         const processingFee = parseFloat(
//           subscriptionData.currentPlan?.processingFeePercentage ||
//           subscriptionData.processingFeePercentage ||
//           0
//         );
        
//         console.log('💰 Processing fee from localStorage:', processingFee + '%');
//         setProcessingFeePercent(processingFee);
//       }
//     } catch (err) {
//       console.error('Error reading localStorage:', err);
//     }
//   }, []);

//   // ✅ Fetch election data
//   useEffect(() => {
//     let isMounted = true;

//     const fetchElectionData = async () => {
//       if (!electionId) return;

//       try {
//         setLoading(true);
//         setError(null);

//         console.log('🔍 Fetching election ID:', electionId);
        
//         const response = await getElection(electionId);
        
//         if (!isMounted) return;

//         console.log('📦 Raw API Response:', response);
        
//         let electionData = null;
        
//         if (response.data?.election) {
//           electionData = response.data.election;
//         } else if (response.election) {
//           electionData = response.election;
//         } else if (response.data) {
//           electionData = response.data;
//         } else if (response.id) {
//           electionData = response;
//         }
        
//         if (electionData) {
//           console.log('✅ Election Data:', {
//             id: electionData.id,
//             title: electionData.title,
//             status: electionData.status,
//             video: electionData.topic_video_url || electionData.video_url,
//             questions: electionData.questions?.length || 0,
//             regional_pricing: electionData.regional_pricing?.length || 0
//           });
          
//           setCurrentElection(electionData);
//         } else {
//           throw new Error('Election data not found in response');
//         }

//       } catch (err) {
//         if (!isMounted) return;
        
//         console.error('❌ Error fetching election:', err);
//         setError(err.message || 'Failed to load election');
//       } finally {
//         if (isMounted) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchElectionData();

//     return () => {
//       isMounted = false;
//     };
//   }, [electionId]);

//   // ✅ Detect user's region based on country
//   useEffect(() => {
//     if (!currentElection || !userCountry) return;
//     if (currentElection.is_free || currentElection.pricing_type !== 'regional_fee') return;
//     if (!currentElection.regional_pricing?.length) return;

//     console.log('🌍 Detecting region for country:', userCountry);
    
//     // Region mapping (you can expand this)
//     const regionMap = {
//       // North America
//       'US': 'region_1_us_canada',
//       'CA': 'region_1_us_canada',
//       'United States': 'region_1_us_canada',
//       'Canada': 'region_1_us_canada',
      
//       // Western Europe
//       'GB': 'region_2_western_europe',
//       'DE': 'region_2_western_europe',
//       'FR': 'region_2_western_europe',
//       'IT': 'region_2_western_europe',
//       'ES': 'region_2_western_europe',
//       'NL': 'region_2_western_europe',
      
//       // Eastern Europe
//       'PL': 'region_3_eastern_europe',
//       'RO': 'region_3_eastern_europe',
//       'HU': 'region_3_eastern_europe',
      
//       // Africa
//       'NG': 'region_4_africa',
//       'ZA': 'region_4_africa',
//       'KE': 'region_4_africa',
      
//       // Latin America
//       'BR': 'region_5_latin_america',
//       'MX': 'region_5_latin_america',
//       'AR': 'region_5_latin_america',
      
//       // Middle East & Asia
//       'BD': 'region_6_middle_east_asia',
//       'Bangladesh': 'region_6_middle_east_asia',
//       'IN': 'region_6_middle_east_asia',
//       'PK': 'region_6_middle_east_asia',
//       'SA': 'region_6_middle_east_asia',
//       'AE': 'region_6_middle_east_asia',
      
//       // Australasia
//       'AU': 'region_7_australasia',
//       'NZ': 'region_7_australasia',
//       'Australia': 'region_7_australasia',
//       'New Zealand': 'region_7_australasia',
//     };

//     const regionCode = regionMap[userCountry];
    
//     if (regionCode) {
//       const matchedRegion = currentElection.regional_pricing.find(
//         r => r.region_code === regionCode
//       );
      
//       if (matchedRegion) {
//         console.log('✅ Matched region:', matchedRegion);
//         setUserRegion(matchedRegion);
//         return;
//       }
//     }
    
//     // Fallback to first region
//     console.log('⚠️ No matching region, using default:', currentElection.regional_pricing[0]);
//     setUserRegion(currentElection.regional_pricing[0]);
    
//   }, [currentElection, userCountry]);

//   // ✅ Calculate applicable fee
//   useEffect(() => {
//     if (!currentElection) return;

//     console.log('💰 Calculating fee:', {
//       is_free: currentElection.is_free,
//       pricing_type: currentElection.pricing_type,
//       userRegion: userRegion,
//       processingFeePercent: processingFeePercent
//     });

//     if (currentElection.is_free) {
//       setApplicableFee({ 
//         participationFee: 0, 
//         processingFee: 0, 
//         total: 0, 
//         currency: 'USD' 
//       });
//       return;
//     }

//     if (currentElection.pricing_type === 'general_fee') {
//       const baseFee = parseFloat(currentElection.general_participation_fee || 0);
//       const processing = baseFee * (processingFeePercent / 100);
      
//       setApplicableFee({
//         participationFee: baseFee,
//         processingFee: processing,
//         total: baseFee + processing,
//         frozenAmount: baseFee, // Amount frozen until election ends
//         currency: 'USD'
//       });
//     } else if (currentElection.pricing_type === 'regional_fee' && userRegion) {
//       const baseFee = parseFloat(userRegion.participation_fee || 0);
//       const processing = baseFee * (processingFeePercent / 100);
      
//       console.log('💰 Fee breakdown:', {
//         baseFee,
//         processing,
//         total: baseFee + processing,
//         frozenAmount: baseFee
//       });
      
//       setApplicableFee({
//         participationFee: baseFee,
//         processingFee: processing,
//         total: baseFee + processing,
//         frozenAmount: baseFee, // Amount frozen until election ends
//         currency: userRegion.currency || 'USD',
//         region: userRegion.region_name
//       });
//     }
//   }, [currentElection, userRegion, processingFeePercent]);

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Not set';
//     try {
//       const date = new Date(dateString);
//       if (isNaN(date.getTime())) return 'Invalid Date';
//       return date.toLocaleDateString('en-US', { 
//         year: 'numeric', 
//         month: 'long', 
//         day: 'numeric' 
//       });
//       /*eslint-disable*/
//     } catch (err) {
//       return 'Invalid Date';
//     }
//   };

//   const canUserVote = useMemo(() => {
//     if (!currentElection) return { can: false, reason: 'Election not found' };

//     const now = new Date();
//     const startDate = new Date(currentElection.start_date);
//     const endDate = new Date(currentElection.end_date);

//     if (currentElection.status !== 'published' && currentElection.status !== 'active') {
//       return { can: false, reason: `Election is not active (status: ${currentElection.status})` };
//     }

//     if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
//       return { can: false, reason: 'Invalid election dates' };
//     }

//     if (now < startDate) {
//       return { can: false, reason: `Election starts on ${formatDate(currentElection.start_date)}` };
//     }

//     if (now > endDate) {
//       return { can: false, reason: 'Election has ended' };
//     }

//     return { can: true, reason: null };
//   }, [currentElection]);

//   const handleAnswerSelect = (questionId, optionId, questionType, maxSelections) => {
//     setSelectedAnswers(prev => {
//       const current = prev[questionId] || [];
      
//       if (questionType === 'multiple_choice' && maxSelections === 1) {
//         return { ...prev, [questionId]: [optionId] };
//       } else if (questionType === 'approval' || maxSelections > 1) {
//         if (current.includes(optionId)) {
//           return { ...prev, [questionId]: current.filter(id => id !== optionId) };
//         } else {
//           if (maxSelections && current.length >= maxSelections) {
//             return prev;
//           }
//           return { ...prev, [questionId]: [...current, optionId] };
//         }
//       }
      
//       return prev;
//     });
//   };

//   const validateAnswers = () => {
//     if (!currentElection?.questions) return { valid: true, errors: [] };

//     const errors = [];
    
//     currentElection.questions.forEach(question => {
//       if (question.is_required && !selectedAnswers[question.id]?.length) {
//         errors.push(`Question "${question.question_text}" is required`);
//       }
//     });

//     return { valid: errors.length === 0, errors };
//   };

//   const handleVoteSubmit = async () => {
//     // Check video requirement
//     const videoUrl = currentElection.topic_video_url || currentElection.video_url;
//     if (videoUrl && !videoWatched) {
//       alert('You must watch the election video before voting');
//       setShowVideo(true);
//       return;
//     }

//     const validation = validateAnswers();
//     if (!validation.valid) {
//       alert(validation.errors.join('\n'));
//       return;
//     }

//     if (!currentElection.is_free && !agreeToTerms) {
//       alert('Please agree to the terms and conditions');
//       return;
//     }

//     if (!currentElection.is_free) {
//       setShowPaymentModal(true);
//     } else {
//       await submitVote();
//     }
//   };

//   const submitVote = async () => {
//     try {
//       setVotingInProgress(true);

//       const voteData = {
//         election_id: currentElection.id,
//         answers: Object.keys(selectedAnswers).map(questionId => ({
//           question_id: parseInt(questionId),
//           option_ids: selectedAnswers[questionId]
//         })),
//         payment: !currentElection.is_free ? {
//           total: applicableFee.total,
//           participationFee: applicableFee.participationFee,
//           processingFee: applicableFee.processingFee,
//           frozenAmount: applicableFee.frozenAmount,
//           currency: applicableFee.currency,
//           method: paymentMethod,
//           region: userRegion?.region_code
//         } : null
//       };

//       console.log('📤 Submitting vote:', voteData);

//       // TODO: Replace with actual API call
//       // await submitVoteAPI(voteData);

//       alert('Vote submitted successfully!');
      
//       navigate(`/elections/${currentElection.id}/confirmation`, {
//         state: {
//           voteData,
//           paymentData: applicableFee,
//           electionTitle: currentElection.title,
//           receiptId: 'RECEIPT-' + Date.now()
//         }
//       });

//     } catch (error) {
//       console.error('❌ Error submitting vote:', error);
//       alert('Failed to submit vote. Please try again.');
//     } finally {
//       setVotingInProgress(false);
//       setShowPaymentModal(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading election details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !currentElection) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
//           <p className="text-red-600 font-semibold mb-2">Error Loading Election</p>
//           <p className="text-gray-600 mb-4">{error || 'Election not found'}</p>
//           <button
//             onClick={() => navigate(-1)}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const videoUrl = currentElection.topic_video_url || currentElection.video_url;

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       <button
//         onClick={() => navigate(-1)}
//         className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
//       >
//         <ArrowLeft size={20} />
//         Back
//       </button>

//       {/* Election Header */}
//       <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
//         {currentElection.topic_image_url && (
//           <div className="w-full h-64 md:h-96">
//             <img
//               src={currentElection.topic_image_url}
//               alt={currentElection.title || 'Election'}
//               className="w-full h-full object-cover"
//             />
//           </div>
//         )}

//         <div className="p-6 md:p-8">
//           <div className="flex items-start justify-between mb-4">
//             <div className="flex-1">
//               <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
//                 {currentElection.title || 'Untitled Election'}
//               </h1>
//               {currentElection.description && (
//                 <p className="text-gray-600 text-lg">{currentElection.description}</p>
//               )}
//             </div>
            
//             <div className="flex flex-col gap-2 ml-4">
//               {currentElection.is_free ? (
//                 <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-semibold rounded-full whitespace-nowrap">
//                   🆓 Free
//                 </span>
//               ) : (
//                 <span className="px-4 py-2 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full whitespace-nowrap">
//                   💰 Paid
//                 </span>
//               )}
//             </div>
//           </div>

//           {/* Key Info Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
//             <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
//               <Calendar className="text-blue-600" size={24} />
//               <div>
//                 <p className="text-xs text-gray-500">Start Date</p>
//                 <p className="font-semibold text-gray-900">{formatDate(currentElection.start_date)}</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
//               <Clock className="text-green-600" size={24} />
//               <div>
//                 <p className="text-xs text-gray-500">End Date</p>
//                 <p className="font-semibold text-gray-900">{formatDate(currentElection.end_date)}</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
//               <Users className="text-purple-600" size={24} />
//               <div>
//                 <p className="text-xs text-gray-500">Total Votes</p>
//                 <p className="font-semibold text-gray-900">{currentElection.vote_count || 0}</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
//               <Vote className="text-orange-600" size={24} />
//               <div>
//                 <p className="text-xs text-gray-500">Voting Type</p>
//                 <p className="font-semibold text-gray-900">
//                   {currentElection.voting_type ? 
//                     currentElection.voting_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) 
//                     : 'Not specified'}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Video Notice */}
//           {videoUrl && !videoWatched && (
//             <div className="mt-6 bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
//               <div className="flex items-start gap-4">
//                 <PlayCircle className="text-blue-600 flex-shrink-0 mt-1" size={24} />
//                 <div className="flex-1">
//                   <h3 className="font-semibold text-blue-900 mb-2">Video Required</h3>
//                   <p className="text-blue-800 text-sm mb-3">
//                     You must watch the election video before you can vote.
//                   </p>
//                   <button
//                     onClick={() => setShowVideo(true)}
//                     className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
//                   >
//                     <Play size={16} />
//                     Watch Video Now
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {videoUrl && videoWatched && (
//             <div className="mt-6 bg-green-50 border-2 border-green-300 rounded-lg p-4 flex items-center gap-3">
//               <CheckCircle className="text-green-600" size={24} />
//               <p className="text-green-800 font-medium">✓ Video watched - You can now proceed to vote</p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Cannot Vote Warning */}
//       {!canUserVote.can && (
//         <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6 rounded-r-lg">
//           <div className="flex items-start gap-4">
//             <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
//             <div>
//               <h3 className="text-lg font-semibold text-yellow-800 mb-2">Cannot Vote</h3>
//               <p className="text-yellow-700">{canUserVote.reason}</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Tabs */}
//       <div className="bg-white rounded-lg shadow mb-6">
//         <div className="flex border-b">
//           <button
//             onClick={() => setActiveTab('overview')}
//             className={`px-6 py-4 font-medium transition-colors ${
//               activeTab === 'overview'
//                 ? 'border-b-2 border-blue-600 text-blue-600'
//                 : 'text-gray-600 hover:text-gray-900'
//             }`}
//           >
//             Overview
//           </button>
//           {!currentElection.is_free && (
//             <button
//               onClick={() => setActiveTab('pricing')}
//               className={`px-6 py-4 font-medium transition-colors ${
//                 activeTab === 'pricing'
//                   ? 'border-b-2 border-blue-600 text-blue-600'
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               Pricing
//             </button>
//           )}
//           {canUserVote.can && currentElection.questions?.length > 0 && (
//             <button
//               onClick={() => setActiveTab('vote')}
//               className={`px-6 py-4 font-medium transition-colors ${
//                 activeTab === 'vote'
//                   ? 'border-b-2 border-blue-600 text-blue-600'
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               Vote Now
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Tab Content */}
//       <div className="bg-white rounded-lg shadow-lg p-8">
//         {activeTab === 'overview' && (
//           <div className="space-y-6">
//             <h2 className="text-2xl font-bold text-gray-900">Election Overview</h2>
//             <p className="text-gray-700">
//               {currentElection.description || 'No description available'}
//             </p>
            
//             {currentElection.voting_body_content && (
//               <div dangerouslySetInnerHTML={{ __html: currentElection.voting_body_content }} />
//             )}

//             {videoUrl && (
//               <div className="mt-6">
//                 <h3 className="text-xl font-bold text-gray-900 mb-4">Election Video</h3>
//                 <button
//                   onClick={() => setShowVideo(true)}
//                   className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
//                 >
//                   <Play size={20} />
//                   {videoWatched ? 'Watch Again' : 'Watch Video (Required)'}
//                 </button>
//               </div>
//             )}

//             {currentElection.questions?.length > 0 && (
//               <div className="mt-6">
//                 <h3 className="text-xl font-bold text-gray-900 mb-4">
//                   Questions ({currentElection.questions.length})
//                 </h3>
//                 <p className="text-gray-600">
//                   This election has {currentElection.questions.length} question(s). 
//                   {canUserVote.can ? ' Click the "Vote Now" tab to participate.' : ''}
//                 </p>
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === 'pricing' && !currentElection.is_free && (
//           <div className="space-y-6">
//             <h2 className="text-2xl font-bold text-gray-900 mb-4">
//               <DollarSign className="inline mr-2" size={28} />
//               Pricing
//             </h2>

//             {/* Pricing Type */}
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <p className="text-sm text-gray-600 mb-1">Type</p>
//               <p className="text-lg font-bold text-gray-900">
//                 {currentElection.pricing_type === 'regional_fee' ? 'Regional Fee' : 'General Fee'}
//               </p>
//             </div>

//             {/* Regional Pricing Table */}
//             {currentElection.pricing_type === 'regional_fee' && currentElection.regional_pricing?.length > 0 && (
//               <div className="mt-6">
//                 <h3 className="font-semibold text-gray-900 mb-4">Regional Pricing</h3>
//                 <div className="space-y-3">
//                   {currentElection.regional_pricing.map((region, index) => (
//                     <div 
//                       key={index}
//                       className={`flex justify-between items-center p-4 rounded-lg border-2 ${
//                         userRegion?.region_code === region.region_code
//                           ? 'bg-green-50 border-green-400'
//                           : 'bg-white border-gray-200'
//                       }`}
//                     >
//                       <div className="flex items-center gap-3">
//                         {userRegion?.region_code === region.region_code && (
//                           <MapPin className="text-green-600" size={20} />
//                         )}
//                         <span className="font-medium text-gray-900">{region.region_name}</span>
//                         {userRegion?.region_code === region.region_code && (
//                           <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
//                             Your Region
//                           </span>
//                         )}
//                       </div>
//                       <span className="text-lg font-bold text-green-600">
//                         ${parseFloat(region.participation_fee || 0).toFixed(2)} {region.currency}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Your Fee Breakdown */}
//             {applicableFee && (
//               <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
//                 <h3 className="text-lg font-semibold text-purple-900 mb-4">Your Fee Breakdown</h3>
//                 <div className="space-y-3">
//                   {applicableFee.region && (
//                     <div className="flex items-center gap-2 mb-3">
//                       <MapPin size={16} className="text-purple-700" />
//                       <span className="text-sm text-purple-700">Region: {applicableFee.region}</span>
//                     </div>
//                   )}
                  
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-700">Participation Fee:</span>
//                     <span className="text-xl font-bold text-gray-900">
//                       {applicableFee.currency} {applicableFee.participationFee.toFixed(2)}
//                     </span>
//                   </div>
                  
//                   <div className="flex justify-between items-center">
//                     <div className="flex items-center gap-2">
//                       <span className="text-gray-700">Processing Fee:</span>
//                       <span className="text-xs text-gray-500">({processingFeePercent}%)</span>
//                     </div>
//                     <span className="text-lg font-semibold text-gray-900">
//                       {applicableFee.currency} {applicableFee.processingFee.toFixed(2)}
//                     </span>
//                   </div>
                  
//                   <div className="border-t-2 border-purple-300 pt-3 flex justify-between items-center">
//                     <span className="text-lg font-bold text-purple-900">Total Payment:</span>
//                     <span className="text-2xl font-bold text-purple-900">
//                       {applicableFee.currency} {applicableFee.total.toFixed(2)}
//                     </span>
//                   </div>

//                   {/* Frozen Amount Info */}
//                   <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
//                     <div className="flex items-start gap-3">
//                       <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
//                       <div className="text-sm">
//                         <p className="font-semibold text-blue-900 mb-1">Payment Details:</p>
//                         <ul className="text-blue-800 space-y-1 list-disc list-inside">
//                           <li>Processing fee ({applicableFee.currency} {applicableFee.processingFee.toFixed(2)}) will be deducted immediately</li>
//                           <li>Participation fee ({applicableFee.currency} {applicableFee.frozenAmount.toFixed(2)}) will be frozen in your wallet</li>
//                           <li>Frozen amount will be held until election ends</li>
//                           <li>After election, frozen amount will be used for prize distribution</li>
//                         </ul>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === 'vote' && canUserVote.can && currentElection.questions?.length > 0 && (
//           <div className="space-y-6">
//             <h2 className="text-2xl font-bold text-gray-900 mb-6">Cast Your Vote</h2>
            
//             {/* Video requirement check */}
//             {videoUrl && !videoWatched && (
//               <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-6">
//                 <div className="flex items-start gap-4">
//                   <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
//                   <div className="flex-1">
//                     <h3 className="font-semibold text-yellow-900 mb-2">Video Required</h3>
//                     <p className="text-yellow-800 mb-4">
//                       You must watch the election video before you can submit your vote.
//                     </p>
//                     <button
//                       onClick={() => setShowVideo(true)}
//                       className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
//                     >
//                       <Play size={16} />
//                       Watch Video Now
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
            
//             {/* Questions */}
//             {currentElection.questions.map((question, index) => (
//               <div key={question.id} className="mb-8 last:mb-0 border-b pb-6 last:border-0">
//                 <div className="flex items-start gap-3 mb-4">
//                   <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
//                     <span className="text-white font-bold">{index + 1}</span>
//                   </div>
//                   <div className="flex-1">
//                     <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                       {question.question_text}
//                       {question.is_required && (
//                         <span className="text-red-600 ml-1">*</span>
//                       )}
//                     </h3>
//                   </div>
//                 </div>

//                 <div className="ml-13 space-y-3">
//                   {question.options?.map((option) => {
//                     const isSelected = selectedAnswers[question.id]?.includes(option.id);
                    
//                     return (
//                       <button
//                         key={option.id}
//                         onClick={() => handleAnswerSelect(
//                           question.id, 
//                           option.id, 
//                           question.question_type,
//                           question.max_selections
//                         )}
//                         className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
//                           isSelected
//                             ? 'border-blue-600 bg-blue-50'
//                             : 'border-gray-200 bg-white hover:border-blue-300'
//                         }`}
//                       >
//                         <div className="flex items-center gap-3">
//                           <div className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center ${
//                             isSelected
//                               ? 'border-blue-600 bg-blue-600'
//                               : 'border-gray-300 bg-white'
//                           }`}>
//                             {isSelected && (
//                               <CheckCircle className="text-white" size={16} />
//                             )}
//                           </div>
//                           <span className={`flex-1 font-medium ${
//                             isSelected ? 'text-blue-900' : 'text-gray-900'
//                           }`}>
//                             {option.option_text}
//                           </span>
//                         </div>
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             ))}

//             {/* Payment Summary (if paid) */}
//             {!currentElection.is_free && applicableFee && (
//               <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-6">
//                 <h3 className="text-xl font-bold text-gray-900 mb-4">
//                   <Wallet className="inline mr-2" size={24} />
//                   Payment Summary
//                 </h3>
//                 <div className="space-y-3 mb-4">
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-700">Total Payment:</span>
//                     <span className="text-2xl font-bold text-orange-600">
//                       {applicableFee.currency} {applicableFee.total.toFixed(2)}
//                     </span>
//                   </div>
//                   <div className="text-sm text-gray-600 bg-white p-3 rounded">
//                     <p className="mb-1">• Processing Fee: {applicableFee.currency} {applicableFee.processingFee.toFixed(2)} (deducted immediately)</p>
//                     <p>• Frozen Amount: {applicableFee.currency} {applicableFee.frozenAmount.toFixed(2)} (held until election ends)</p>
//                   </div>
//                 </div>

//                 <label className="flex items-start gap-3 p-4 bg-white rounded-lg cursor-pointer border-2 border-gray-200 hover:border-orange-400">
//                   <input
//                     type="checkbox"
//                     checked={agreeToTerms}
//                     onChange={(e) => setAgreeToTerms(e.target.checked)}
//                     className="mt-1"
//                   />
//                   <span className="text-sm text-gray-700">
//                     I agree that {applicableFee.currency} {applicableFee.processingFee.toFixed(2)} will be deducted as processing fee and {applicableFee.currency} {applicableFee.frozenAmount.toFixed(2)} will be frozen in my wallet until the election ends and is used for prize distribution.
//                   </span>
//                 </label>
//               </div>
//             )}

//             {/* Submit Button */}
//             <button
//               onClick={handleVoteSubmit}
//               disabled={votingInProgress || (videoUrl && !videoWatched)}
//               className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-3 ${
//                 votingInProgress || (videoUrl && !videoWatched)
//                   ? 'bg-gray-400 cursor-not-allowed'
//                   : 'bg-blue-600 hover:bg-blue-700 text-white'
//               }`}
//             >
//               {votingInProgress ? (
//                 <>
//                   <Loader className="animate-spin" size={24} />
//                   Processing...
//                 </>
//               ) : videoUrl && !videoWatched ? (
//                 <>
//                   <Lock size={24} />
//                   Watch Video to Continue
//                 </>
//               ) : (
//                 <>
//                   <Vote size={24} />
//                   {currentElection.is_free ? 'Submit Vote' : 'Pay & Vote Now'}
//                   <ArrowRight size={24} />
//                 </>
//               )}
//             </button>
//           </div>
//         )}

//         {activeTab === 'vote' && (!currentElection.questions || currentElection.questions.length === 0) && (
//           <div className="text-center py-12">
//             <AlertCircle className="mx-auto mb-4 text-gray-400" size={64} />
//             <h3 className="text-xl font-bold text-gray-800 mb-2">No Questions Available</h3>
//             <p className="text-gray-600">This election doesn't have any questions yet.</p>
//           </div>
//         )}
//       </div>

//       {/* Video Modal */}
//       {showVideo && videoUrl && (
//         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg max-w-4xl w-full p-6">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-2xl font-bold text-gray-900">Election Video</h2>
//               <button
//                 onClick={() => setShowVideo(false)}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>
            
//             <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
//               <video
//                 src={videoUrl}
//                 controls
//                 className="w-full h-full"
//                 onEnded={() => {
//                   setVideoWatched(true);
//                   console.log('✅ Video watched completely');
//                 }}
//               >
//                 Your browser does not support the video tag.
//               </video>
//             </div>

//             {!videoWatched && (
//               <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
//                 <p className="text-yellow-800 text-sm">
//                   <Info className="inline mr-2" size={16} />
//                   Please watch the entire video to enable voting.
//                 </p>
//               </div>
//             )}

//             {videoWatched && (
//               <div className="bg-green-50 border border-green-300 rounded-lg p-4 flex items-center gap-3">
//                 <CheckCircle className="text-green-600" size={20} />
//                 <p className="text-green-800 font-medium">Video watched! You can now proceed to vote.</p>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Payment Modal */}
//       {showPaymentModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg max-w-md w-full p-6">
//             <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Payment</h2>
            
//             <div className="mb-6">
//               <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
//               <div className="space-y-2">
//                 <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400">
//                   <input
//                     type="radio"
//                     name="payment"
//                     value="card"
//                     checked={paymentMethod === 'card'}
//                     onChange={(e) => setPaymentMethod(e.target.value)}
//                   />
//                   <CreditCard size={20} />
//                   <span>Credit/Debit Card</span>
//                 </label>
//                 <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400">
//                   <input
//                     type="radio"
//                     name="payment"
//                     value="wallet"
//                     checked={paymentMethod === 'wallet'}
//                     onChange={(e) => setPaymentMethod(e.target.value)}
//                   />
//                   <Wallet size={20} />
//                   <span>Wallet Balance</span>
//                 </label>
//               </div>
//             </div>

//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
//               <div className="space-y-2">
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-700">Total Payment:</span>
//                   <span className="text-xl font-bold text-blue-900">
//                     {applicableFee?.currency} {applicableFee?.total.toFixed(2)}
//                   </span>
//                 </div>
//                 <div className="text-xs text-gray-600 border-t pt-2">
//                   <p>• Processing: {applicableFee?.currency} {applicableFee?.processingFee.toFixed(2)}</p>
//                   <p>• Frozen: {applicableFee?.currency} {applicableFee?.frozenAmount.toFixed(2)}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="flex gap-3">
//               <button
//                 onClick={() => setShowPaymentModal(false)}
//                 className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-semibold"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={submitVote}
//                 disabled={votingInProgress}
//                 className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
//               >
//                 {votingInProgress ? 'Processing...' : 'Confirm & Pay'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// import React, { useState, useEffect, useMemo } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import { 
//   Lock, 
//   DollarSign, 
//   CreditCard, 
//   Calendar, 
//   Clock, 
//   Users, 
//   CheckCircle, 
//   AlertCircle,
//   Info,
//   ArrowLeft,
//   ArrowRight,  // ✅ ADDED
//   Vote,
//   Wallet,
//   Trophy,
//   Eye,
//   MapPin,
//   Shield,
//   Loader
// } from 'lucide-react';
// //import { getElection } from '../../../redux/api/election/electionApi';
// import { getElection } from '../../redux/api/election/electionApi';

// export default function ElectionVotingView() {
//   const { electionId } = useParams();
//   const navigate = useNavigate();

//   const { 
//     processingFee,
//     /*eslint-disable*/
//     userSubscription,
//     currentPlan,
//   } = useSelector((state) => state.subscription);

//   const [currentElection, setCurrentElection] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [selectedAnswers, setSelectedAnswers] = useState({});
//   const [userRegion, setUserRegion] = useState(null);
//   const [applicableFee, setApplicableFee] = useState(null);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [paymentMethod, setPaymentMethod] = useState('card');
//   const [agreeToTerms, setAgreeToTerms] = useState(false);
//   const [votingInProgress, setVotingInProgress] = useState(false);

//   useEffect(() => {
//     let isMounted = true;

//     const fetchElectionData = async () => {
//       if (!electionId) return;

//       try {
//         setLoading(true);
//         setError(null);

//         console.log('🔍 Fetching election ID:', electionId);
        
//         const response = await getElection(electionId);
        
//         if (!isMounted) return;

//         console.log('📦 Raw API Response:', response);
        
//         // Handle different response formats from your backend
//         let electionData = null;
        
//         if (response.data?.election) {
//           electionData = response.data.election;
//           console.log('✅ Found in response.data.election');
//         } else if (response.election) {
//           electionData = response.election;
//           console.log('✅ Found in response.election');
//         } else if (response.data) {
//           electionData = response.data;
//           console.log('✅ Found in response.data');
//         } else if (response.id) {
//           electionData = response;
//           console.log('✅ Response is the election itself');
//         }
        
//         if (electionData) {
//           console.log('✅ Election Data:', {
//             id: electionData.id,
//             title: electionData.title,
//             status: electionData.status,
//             start_date: electionData.start_date,
//             end_date: electionData.end_date,
//             voting_type: electionData.voting_type,
//             is_free: electionData.is_free,
//             questions: electionData.questions?.length || 0,
//             regional_pricing: electionData.regional_pricing?.length || 0
//           });
          
//           setCurrentElection(electionData);
//         } else {
//           console.error('❌ Could not extract election data from response');
//           throw new Error('Election data not found in response');
//         }

//       } catch (err) {
//         if (!isMounted) return;
        
//         console.error('❌ Error fetching election:', err);
//         console.error('Error details:', {
//           message: err.message,
//           response: err.response?.data,
//           status: err.response?.status
//         });
//         setError(err.message || 'Failed to load election');
//       } finally {
//         if (isMounted) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchElectionData();

//     return () => {
//       isMounted = false;
//     };
//   }, [electionId]);

//   useEffect(() => {
//     // ✅ For now, just use the first regional pricing
//     // TODO: Implement proper region detection using your backend
//     if (currentElection && !currentElection.is_free && currentElection.pricing_type === 'regional_fee') {
//       if (currentElection.regional_pricing?.length > 0) {
//         console.log('💰 Regional pricing available:', currentElection.regional_pricing);
//         console.log('💰 Setting default region:', currentElection.regional_pricing[0]);
//         setUserRegion(currentElection.regional_pricing[0]);
//       } else {
//         console.warn('⚠️ No regional pricing found for election');
//       }
//     }
//   }, [currentElection]);

//   useEffect(() => {
//     if (!currentElection) return;

//     console.log('💰 Calculating fee for election:', {
//       is_free: currentElection.is_free,
//       pricing_type: currentElection.pricing_type,
//       general_fee: currentElection.general_participation_fee,
//       regional_pricing: currentElection.regional_pricing,
//       userRegion: userRegion
//     });

//     if (currentElection.is_free) {
//       setApplicableFee({ amount: 0, currency: 'USD', processing: 0, total: 0 });
//     } else if (currentElection.pricing_type === 'general_fee') {
//       const baseAmount = parseFloat(currentElection.general_participation_fee || 0);
//       const processingPercent = parseFloat(currentElection.processing_fee_percentage || 0);
//       const processingAmount = baseAmount * (processingPercent / 100);
      
//       console.log('💰 General fee calculated:', { baseAmount, processingPercent, processingAmount });
      
//       setApplicableFee({
//         amount: baseAmount,
//         currency: 'USD',
//         processing: processingAmount,
//         total: baseAmount + processingAmount
//       });
//     } else if (currentElection.pricing_type === 'regional_fee' && userRegion) {
//       // ✅ FIXED: Use participation_fee (not fee_amount)
//       const baseAmount = parseFloat(
//         userRegion.participation_fee || 
//         userRegion.fee_amount || 
//         userRegion.amount || 
//         0
//       );
//       const processingPercent = parseFloat(
//         currentElection.processing_fee_percentage || 
//         processingFee || 
//         0
//       );
//       const processingAmount = baseAmount * (processingPercent / 100);
      
//       console.log('💰 Regional fee calculated:', { 
//         baseAmount, 
//         processingPercent, 
//         processingAmount,
//         region: userRegion 
//       });
      
//       setApplicableFee({
//         amount: baseAmount,
//         currency: userRegion.currency || 'USD',
//         processing: processingAmount,
//         total: baseAmount + processingAmount,
//         region: userRegion.region_name || userRegion.name
//       });
//     }
//   }, [currentElection, userRegion, processingFee]);

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Not set';
//     try {
//       const date = new Date(dateString);
//       if (isNaN(date.getTime())) return 'Invalid Date';
//       return date.toLocaleDateString('en-US', { 
//         year: 'numeric', 
//         month: 'long', 
//         day: 'numeric' 
//       });
//     } catch (err) {
//       console.error('Date formatting error:', err);
//       return 'Invalid Date';
//     }
//   };

//   const canUserVote = useMemo(() => {
//     if (!currentElection) return { can: false, reason: 'Election not found' };

//     console.log('🗳️ Checking vote eligibility:', {
//       status: currentElection.status,
//       start_date: currentElection.start_date,
//       end_date: currentElection.end_date,
//       now: new Date().toISOString()
//     });

//     const now = new Date();
//     const startDate = new Date(currentElection.start_date);
//     const endDate = new Date(currentElection.end_date);

//     if (currentElection.status !== 'published' && currentElection.status !== 'active') {
//       return { can: false, reason: `Election is not active (status: ${currentElection.status})` };
//     }

//     if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
//       return { can: false, reason: 'Invalid election dates' };
//     }

//     if (now < startDate) {
//       return { can: false, reason: `Election starts on ${formatDate(currentElection.start_date)}` };
//     }

//     if (now > endDate) {
//       return { can: false, reason: 'Election has ended' };
//     }

//     return { can: true, reason: null };
//   }, [currentElection]);

//   const handleAnswerSelect = (questionId, optionId, questionType, maxSelections) => {
//     setSelectedAnswers(prev => {
//       const current = prev[questionId] || [];
      
//       if (questionType === 'multiple_choice' && maxSelections === 1) {
//         return { ...prev, [questionId]: [optionId] };
//       } else if (questionType === 'approval' || maxSelections > 1) {
//         if (current.includes(optionId)) {
//           return { ...prev, [questionId]: current.filter(id => id !== optionId) };
//         } else {
//           if (maxSelections && current.length >= maxSelections) {
//             return prev;
//           }
//           return { ...prev, [questionId]: [...current, optionId] };
//         }
//       }
      
//       return prev;
//     });
//   };

//   const validateAnswers = () => {
//     if (!currentElection?.questions) return { valid: true, errors: [] };

//     const errors = [];
    
//     currentElection.questions.forEach(question => {
//       if (question.is_required && !selectedAnswers[question.id]?.length) {
//         errors.push(`Question "${question.question_text}" is required`);
//       }
//     });

//     return { valid: errors.length === 0, errors };
//   };

//   const handleVoteSubmit = async () => {
//     const validation = validateAnswers();
//     if (!validation.valid) {
//       alert(validation.errors.join('\n'));
//       return;
//     }

//     if (!currentElection.is_free && !agreeToTerms) {
//       alert('Please agree to the terms and conditions');
//       return;
//     }

//     if (!currentElection.is_free) {
//       setShowPaymentModal(true);
//     } else {
//       await submitVote();
//     }
//   };

//   const submitVote = async () => {
//     try {
//       setVotingInProgress(true);

//       const voteData = {
//         election_id: currentElection.id,
//         answers: Object.keys(selectedAnswers).map(questionId => ({
//           question_id: parseInt(questionId),
//           option_ids: selectedAnswers[questionId]
//         })),
//         payment: !currentElection.is_free ? {
//           amount: applicableFee.total,
//           currency: applicableFee.currency,
//           method: paymentMethod,
//           region: userRegion?.region_code
//         } : null
//       };

//       console.log('📤 Submitting vote:', voteData);

//       // TODO: Replace with actual API call
//       // await submitVoteAPI(voteData);

//       alert('Vote submitted successfully!');
      
//       navigate(`/elections/${currentElection.id}/confirmation`, {
//         state: {
//           voteData,
//           paymentData: applicableFee,
//           electionTitle: currentElection.title,
//           receiptId: 'RECEIPT-' + Date.now()
//         }
//       });

//     } catch (error) {
//       console.error('❌ Error submitting vote:', error);
//       alert('Failed to submit vote. Please try again.');
//     } finally {
//       setVotingInProgress(false);
//       setShowPaymentModal(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading election details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !currentElection) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
//           <p className="text-red-600 font-semibold mb-2">Error Loading Election</p>
//           <p className="text-gray-600 mb-4">{error || 'Election not found'}</p>
//           <button
//             onClick={() => navigate(-1)}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Show data structure in console for debugging
//   console.log('🎯 Rendering with election:', {
//     id: currentElection.id,
//     title: currentElection.title,
//     description: currentElection.description,
//     topic_image_url: currentElection.topic_image_url,
//     start_date: currentElection.start_date,
//     end_date: currentElection.end_date,
//     status: currentElection.status,
//     voting_type: currentElection.voting_type,
//     is_free: currentElection.is_free,
//     questions_count: currentElection.questions?.length || 0
//   });

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       <button
//         onClick={() => navigate(-1)}
//         className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
//       >
//         <ArrowLeft size={20} />
//         Back
//       </button>

//       <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
//         {currentElection.topic_image_url && (
//           <div className="w-full h-64 md:h-96">
//             <img
//               src={currentElection.topic_image_url}
//               alt={currentElection.title || 'Election'}
//               className="w-full h-full object-cover"
//               onError={(e) => {
//                 console.error('Image load error:', currentElection.topic_image_url);
//                 e.target.style.display = 'none';
//               }}
//             />
//           </div>
//         )}

//         <div className="p-6 md:p-8">
//           <div className="flex items-start justify-between mb-4">
//             <div className="flex-1">
//               <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
//                 {currentElection.title || 'Untitled Election'}
//               </h1>
//               {currentElection.description && (
//                 <p className="text-gray-600 text-lg">{currentElection.description}</p>
//               )}
//             </div>
            
//             <div className="flex flex-col gap-2 ml-4">
//               {currentElection.is_free ? (
//                 <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-semibold rounded-full whitespace-nowrap">
//                   🆓 Free
//                 </span>
//               ) : (
//                 <span className="px-4 py-2 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full whitespace-nowrap">
//                   💰 Paid
//                 </span>
//               )}
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
//             <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
//               <Calendar className="text-blue-600" size={24} />
//               <div>
//                 <p className="text-xs text-gray-500">Start Date</p>
//                 <p className="font-semibold text-gray-900">{formatDate(currentElection.start_date)}</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
//               <Clock className="text-green-600" size={24} />
//               <div>
//                 <p className="text-xs text-gray-500">End Date</p>
//                 <p className="font-semibold text-gray-900">{formatDate(currentElection.end_date)}</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
//               <Users className="text-purple-600" size={24} />
//               <div>
//                 <p className="text-xs text-gray-500">Total Votes</p>
//                 <p className="font-semibold text-gray-900">{currentElection.vote_count || 0}</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
//               <Vote className="text-orange-600" size={24} />
//               <div>
//                 <p className="text-xs text-gray-500">Voting Type</p>
//                 <p className="font-semibold text-gray-900">
//                   {currentElection.voting_type ? 
//                     currentElection.voting_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) 
//                     : 'Not specified'}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {!canUserVote.can && (
//         <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6 rounded-r-lg">
//           <div className="flex items-start gap-4">
//             <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
//             <div>
//               <h3 className="text-lg font-semibold text-yellow-800 mb-2">Cannot Vote</h3>
//               <p className="text-yellow-700">{canUserVote.reason}</p>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="bg-white rounded-lg shadow mb-6">
//         <div className="flex border-b">
//           <button
//             onClick={() => setActiveTab('overview')}
//             className={`px-6 py-4 font-medium transition-colors ${
//               activeTab === 'overview'
//                 ? 'border-b-2 border-blue-600 text-blue-600'
//                 : 'text-gray-600 hover:text-gray-900'
//             }`}
//           >
//             Overview
//           </button>
//           {!currentElection.is_free && (
//             <button
//               onClick={() => setActiveTab('pricing')}
//               className={`px-6 py-4 font-medium transition-colors ${
//                 activeTab === 'pricing'
//                   ? 'border-b-2 border-blue-600 text-blue-600'
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               Pricing
//             </button>
//           )}
//           {canUserVote.can && currentElection.questions?.length > 0 && (
//             <button
//               onClick={() => setActiveTab('vote')}
//               className={`px-6 py-4 font-medium transition-colors ${
//                 activeTab === 'vote'
//                   ? 'border-b-2 border-blue-600 text-blue-600'
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               Vote Now
//             </button>
//           )}
//         </div>
//       </div>

//       <div className="bg-white rounded-lg shadow-lg p-8">
//         {activeTab === 'overview' && (
//           <div className="space-y-6">
//             <h2 className="text-2xl font-bold text-gray-900">Election Overview</h2>
//             <p className="text-gray-700">
//               {currentElection.description || 'No description available'}
//             </p>
            
//             {currentElection.voting_body_content && (
//               <div dangerouslySetInnerHTML={{ __html: currentElection.voting_body_content }} />
//             )}

//             {currentElection.questions?.length > 0 && (
//               <div className="mt-6">
//                 <h3 className="text-xl font-bold text-gray-900 mb-4">
//                   Questions ({currentElection.questions.length})
//                 </h3>
//                 <p className="text-gray-600">
//                   This election has {currentElection.questions.length} question(s). 
//                   {canUserVote.can ? ' Click the "Vote Now" tab to participate.' : ''}
//                 </p>
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === 'pricing' && !currentElection.is_free && (
//           <div className="space-y-6">
//             <h2 className="text-2xl font-bold text-gray-900">Pricing Information</h2>
            
//             {applicableFee && (
//               <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
//                 <h3 className="text-lg font-semibold text-purple-900 mb-4">Your Fee</h3>
//                 <div className="space-y-3">
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-700">Participation Fee:</span>
//                     <span className="text-xl font-bold text-gray-900">
//                       {applicableFee.currency} {applicableFee.amount.toFixed(2)}
//                     </span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-700">Processing Fee:</span>
//                     <span className="text-lg font-semibold text-gray-900">
//                       {applicableFee.currency} {applicableFee.processing.toFixed(2)}
//                     </span>
//                   </div>
//                   <div className="border-t-2 border-purple-300 pt-3 flex justify-between items-center">
//                     <span className="text-lg font-bold text-purple-900">Total Amount:</span>
//                     <span className="text-2xl font-bold text-purple-900">
//                       {applicableFee.currency} {applicableFee.total.toFixed(2)}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === 'vote' && canUserVote.can && currentElection.questions?.length > 0 && (
//           <div className="space-y-6">
//             <h2 className="text-2xl font-bold text-gray-900 mb-6">Cast Your Vote</h2>
            
//             {currentElection.questions.map((question, index) => (
//               <div key={question.id} className="mb-8 last:mb-0 border-b pb-6 last:border-0">
//                 <div className="flex items-start gap-3 mb-4">
//                   <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
//                     <span className="text-white font-bold">{index + 1}</span>
//                   </div>
//                   <div className="flex-1">
//                     <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                       {question.question_text}
//                       {question.is_required && (
//                         <span className="text-red-600 ml-1">*</span>
//                       )}
//                     </h3>
//                   </div>
//                 </div>

//                 <div className="ml-13 space-y-3">
//                   {question.options?.map((option) => {
//                     const isSelected = selectedAnswers[question.id]?.includes(option.id);
                    
//                     return (
//                       <button
//                         key={option.id}
//                         onClick={() => handleAnswerSelect(
//                           question.id, 
//                           option.id, 
//                           question.question_type,
//                           question.max_selections
//                         )}
//                         className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
//                           isSelected
//                             ? 'border-blue-600 bg-blue-50'
//                             : 'border-gray-200 bg-white hover:border-blue-300'
//                         }`}
//                       >
//                         <div className="flex items-center gap-3">
//                           <div className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center ${
//                             isSelected
//                               ? 'border-blue-600 bg-blue-600'
//                               : 'border-gray-300 bg-white'
//                           }`}>
//                             {isSelected && (
//                               <CheckCircle className="text-white" size={16} />
//                             )}
//                           </div>
//                           <span className={`flex-1 font-medium ${
//                             isSelected ? 'text-blue-900' : 'text-gray-900'
//                           }`}>
//                             {option.option_text}
//                           </span>
//                         </div>
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             ))}

//             {!currentElection.is_free && applicableFee && (
//               <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-6">
//                 <h3 className="text-xl font-bold text-gray-900 mb-4">
//                   <Wallet className="inline mr-2" size={24} />
//                   Payment Summary
//                 </h3>
//                 <div className="space-y-3 mb-4">
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-700">Total:</span>
//                     <span className="text-2xl font-bold text-orange-600">
//                       {applicableFee.currency} {applicableFee.total.toFixed(2)}
//                     </span>
//                   </div>
//                 </div>

//                 <label className="flex items-start gap-3 p-4 bg-white rounded-lg cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={agreeToTerms}
//                     onChange={(e) => setAgreeToTerms(e.target.checked)}
//                     className="mt-1"
//                   />
//                   <span className="text-sm text-gray-700">
//                     I agree that the payment will be frozen in my wallet until the election ends.
//                   </span>
//                 </label>
//               </div>
//             )}

//             <button
//               onClick={handleVoteSubmit}
//               disabled={votingInProgress}
//               className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-3 ${
//                 votingInProgress
//                   ? 'bg-gray-400 cursor-not-allowed'
//                   : 'bg-blue-600 hover:bg-blue-700 text-white'
//               }`}
//             >
//               {votingInProgress ? (
//                 <>
//                   <Loader className="animate-spin" size={24} />
//                   Processing...
//                 </>
//               ) : (
//                 <>
//                   <Vote size={24} />
//                   {currentElection.is_free ? 'Submit Vote' : 'Pay & Vote Now'}
//                   <ArrowRight size={24} />
//                 </>
//               )}
//             </button>
//           </div>
//         )}

//         {activeTab === 'vote' && (!currentElection.questions || currentElection.questions.length === 0) && (
//           <div className="text-center py-12">
//             <AlertCircle className="mx-auto mb-4 text-gray-400" size={64} />
//             <h3 className="text-xl font-bold text-gray-800 mb-2">No Questions Available</h3>
//             <p className="text-gray-600">This election doesn't have any questions yet.</p>
//           </div>
//         )}
//       </div>

//       {showPaymentModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg max-w-md w-full p-6">
//             <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Payment</h2>
            
//             <div className="mb-6">
//               <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
//               <div className="space-y-2">
//                 <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400">
//                   <input
//                     type="radio"
//                     name="payment"
//                     value="card"
//                     checked={paymentMethod === 'card'}
//                     onChange={(e) => setPaymentMethod(e.target.value)}
//                   />
//                   <CreditCard size={20} />
//                   <span>Credit/Debit Card</span>
//                 </label>
//                 <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400">
//                   <input
//                     type="radio"
//                     name="payment"
//                     value="wallet"
//                     checked={paymentMethod === 'wallet'}
//                     onChange={(e) => setPaymentMethod(e.target.value)}
//                   />
//                   <Wallet size={20} />
//                   <span>Wallet Balance</span>
//                 </label>
//               </div>
//             </div>

//             <div className="bg-blue-50 p-4 rounded-lg mb-6">
//               <div className="flex justify-between items-center mb-2">
//                 <span className="text-gray-700">Amount to Pay:</span>
//                 <span className="text-2xl font-bold text-blue-900">
//                   {applicableFee?.currency} {applicableFee?.total.toFixed(2)}
//                 </span>
//               </div>
//               <p className="text-xs text-gray-600">
//                 Funds will be frozen in your wallet until election completion
//               </p>
//             </div>

//             <div className="flex gap-3">
//               <button
//                 onClick={() => setShowPaymentModal(false)}
//                 className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-semibold"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={submitVote}
//                 disabled={votingInProgress}
//                 className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
//               >
//                 {votingInProgress ? 'Processing...' : 'Confirm & Pay'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// import React, { useState, useEffect, useMemo } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import { 
//   Lock, 
//   DollarSign, 
//   CreditCard, 
//   Calendar, 
//   Clock, 
//   Users, 
//   CheckCircle, 
//   AlertCircle,
//   Info,
//   ArrowLeft,
//   ArrowRight,  // ✅ ADDED
//   Vote,
//   Wallet,
//   Trophy,
//   Eye,
//   MapPin,
//   Shield,
//   Loader
// } from 'lucide-react';
// //import { getElection } from '../../../redux/api/election/electionApi';
// import { getElection } from '../../redux/api/election/electionApi';
// export default function ElectionVotingView() {
//   const { electionId } = useParams();
//   const navigate = useNavigate();

//   const { 
//     processingFee,
//     /*eslint-disable*/
//     userSubscription,
//     currentPlan,
//   } = useSelector((state) => state.subscription);

//   const [currentElection, setCurrentElection] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [selectedAnswers, setSelectedAnswers] = useState({});
//   const [userRegion, setUserRegion] = useState(null);
//   const [applicableFee, setApplicableFee] = useState(null);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [paymentMethod, setPaymentMethod] = useState('card');
//   const [agreeToTerms, setAgreeToTerms] = useState(false);
//   const [votingInProgress, setVotingInProgress] = useState(false);

//   useEffect(() => {
//     let isMounted = true;

//     const fetchElectionData = async () => {
//       if (!electionId) return;

//       try {
//         setLoading(true);
//         setError(null);

//         console.log('🔍 Fetching election ID:', electionId);
        
//         const response = await getElection(electionId);
        
//         if (!isMounted) return;

//         console.log('📦 Raw API Response:', response);
        
//         // Handle different response formats from your backend
//         let electionData = null;
        
//         if (response.data?.election) {
//           electionData = response.data.election;
//           console.log('✅ Found in response.data.election');
//         } else if (response.election) {
//           electionData = response.election;
//           console.log('✅ Found in response.election');
//         } else if (response.data) {
//           electionData = response.data;
//           console.log('✅ Found in response.data');
//         } else if (response.id) {
//           electionData = response;
//           console.log('✅ Response is the election itself');
//         }
        
//         if (electionData) {
//           console.log('✅ Election Data:', {
//             id: electionData.id,
//             title: electionData.title,
//             status: electionData.status,
//             start_date: electionData.start_date,
//             end_date: electionData.end_date,
//             voting_type: electionData.voting_type,
//             is_free: electionData.is_free,
//             questions: electionData.questions?.length || 0,
//             regional_pricing: electionData.regional_pricing?.length || 0
//           });
          
//           setCurrentElection(electionData);
//         } else {
//           console.error('❌ Could not extract election data from response');
//           throw new Error('Election data not found in response');
//         }

//       } catch (err) {
//         if (!isMounted) return;
        
//         console.error('❌ Error fetching election:', err);
//         console.error('Error details:', {
//           message: err.message,
//           response: err.response?.data,
//           status: err.response?.status
//         });
//         setError(err.message || 'Failed to load election');
//       } finally {
//         if (isMounted) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchElectionData();

//     return () => {
//       isMounted = false;
//     };
//   }, [electionId]);

//   useEffect(() => {
//     // ✅ For now, just use the first regional pricing
//     // TODO: Implement proper region detection using your backend
//     if (currentElection && !currentElection.is_free && currentElection.pricing_type === 'regional_fee') {
//       if (currentElection.regional_pricing?.length > 0) {
//         console.log('💰 Regional pricing available:', currentElection.regional_pricing);
//         console.log('💰 Setting default region:', currentElection.regional_pricing[0]);
//         setUserRegion(currentElection.regional_pricing[0]);
//       } else {
//         console.warn('⚠️ No regional pricing found for election');
//       }
//     }
//   }, [currentElection]);

//   useEffect(() => {
//     if (!currentElection) return;

//     console.log('💰 Calculating fee for election:', {
//       is_free: currentElection.is_free,
//       pricing_type: currentElection.pricing_type,
//       general_fee: currentElection.general_participation_fee,
//       regional_pricing: currentElection.regional_pricing,
//       userRegion: userRegion
//     });

//     if (currentElection.is_free) {
//       setApplicableFee({ amount: 0, currency: 'USD', processing: 0, total: 0 });
//     } else if (currentElection.pricing_type === 'general_fee') {
//       const baseAmount = parseFloat(currentElection.general_participation_fee || 0);
//       const processingPercent = parseFloat(currentElection.processing_fee_percentage || 0);
//       const processingAmount = baseAmount * (processingPercent / 100);
      
//       console.log('💰 General fee calculated:', { baseAmount, processingPercent, processingAmount });
      
//       setApplicableFee({
//         amount: baseAmount,
//         currency: 'USD',
//         processing: processingAmount,
//         total: baseAmount + processingAmount
//       });
//     } else if (currentElection.pricing_type === 'regional_fee' && userRegion) {
//       const baseAmount = parseFloat(userRegion.fee_amount || userRegion.amount || 0);
//       const processingPercent = parseFloat(
//         currentElection.processing_fee_percentage || 
//         processingFee || 
//         0
//       );
//       const processingAmount = baseAmount * (processingPercent / 100);
      
//       console.log('💰 Regional fee calculated:', { 
//         baseAmount, 
//         processingPercent, 
//         processingAmount,
//         region: userRegion 
//       });
      
//       setApplicableFee({
//         amount: baseAmount,
//         currency: userRegion.currency || 'USD',
//         processing: processingAmount,
//         total: baseAmount + processingAmount,
//         region: userRegion.region_name || userRegion.name
//       });
//     }
//   }, [currentElection, userRegion, processingFee]);

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Not set';
//     try {
//       const date = new Date(dateString);
//       if (isNaN(date.getTime())) return 'Invalid Date';
//       return date.toLocaleDateString('en-US', { 
//         year: 'numeric', 
//         month: 'long', 
//         day: 'numeric' 
//       });
//     } catch (err) {
//       console.error('Date formatting error:', err);
//       return 'Invalid Date';
//     }
//   };

//   const canUserVote = useMemo(() => {
//     if (!currentElection) return { can: false, reason: 'Election not found' };

//     console.log('🗳️ Checking vote eligibility:', {
//       status: currentElection.status,
//       start_date: currentElection.start_date,
//       end_date: currentElection.end_date,
//       now: new Date().toISOString()
//     });

//     const now = new Date();
//     const startDate = new Date(currentElection.start_date);
//     const endDate = new Date(currentElection.end_date);

//     if (currentElection.status !== 'published' && currentElection.status !== 'active') {
//       return { can: false, reason: `Election is not active (status: ${currentElection.status})` };
//     }

//     if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
//       return { can: false, reason: 'Invalid election dates' };
//     }

//     if (now < startDate) {
//       return { can: false, reason: `Election starts on ${formatDate(currentElection.start_date)}` };
//     }

//     if (now > endDate) {
//       return { can: false, reason: 'Election has ended' };
//     }

//     return { can: true, reason: null };
//   }, [currentElection]);

//   const handleAnswerSelect = (questionId, optionId, questionType, maxSelections) => {
//     setSelectedAnswers(prev => {
//       const current = prev[questionId] || [];
      
//       if (questionType === 'multiple_choice' && maxSelections === 1) {
//         return { ...prev, [questionId]: [optionId] };
//       } else if (questionType === 'approval' || maxSelections > 1) {
//         if (current.includes(optionId)) {
//           return { ...prev, [questionId]: current.filter(id => id !== optionId) };
//         } else {
//           if (maxSelections && current.length >= maxSelections) {
//             return prev;
//           }
//           return { ...prev, [questionId]: [...current, optionId] };
//         }
//       }
      
//       return prev;
//     });
//   };

//   const validateAnswers = () => {
//     if (!currentElection?.questions) return { valid: true, errors: [] };

//     const errors = [];
    
//     currentElection.questions.forEach(question => {
//       if (question.is_required && !selectedAnswers[question.id]?.length) {
//         errors.push(`Question "${question.question_text}" is required`);
//       }
//     });

//     return { valid: errors.length === 0, errors };
//   };

//   const handleVoteSubmit = async () => {
//     const validation = validateAnswers();
//     if (!validation.valid) {
//       alert(validation.errors.join('\n'));
//       return;
//     }

//     if (!currentElection.is_free && !agreeToTerms) {
//       alert('Please agree to the terms and conditions');
//       return;
//     }

//     if (!currentElection.is_free) {
//       setShowPaymentModal(true);
//     } else {
//       await submitVote();
//     }
//   };

//   const submitVote = async () => {
//     try {
//       setVotingInProgress(true);

//       const voteData = {
//         election_id: currentElection.id,
//         answers: Object.keys(selectedAnswers).map(questionId => ({
//           question_id: parseInt(questionId),
//           option_ids: selectedAnswers[questionId]
//         })),
//         payment: !currentElection.is_free ? {
//           amount: applicableFee.total,
//           currency: applicableFee.currency,
//           method: paymentMethod,
//           region: userRegion?.region_code
//         } : null
//       };

//       console.log('📤 Submitting vote:', voteData);

//       // TODO: Replace with actual API call
//       // await submitVoteAPI(voteData);

//       alert('Vote submitted successfully!');
      
//       navigate(`/elections/${currentElection.id}/confirmation`, {
//         state: {
//           voteData,
//           paymentData: applicableFee,
//           electionTitle: currentElection.title,
//           receiptId: 'RECEIPT-' + Date.now()
//         }
//       });

//     } catch (error) {
//       console.error('❌ Error submitting vote:', error);
//       alert('Failed to submit vote. Please try again.');
//     } finally {
//       setVotingInProgress(false);
//       setShowPaymentModal(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading election details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !currentElection) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
//           <p className="text-red-600 font-semibold mb-2">Error Loading Election</p>
//           <p className="text-gray-600 mb-4">{error || 'Election not found'}</p>
//           <button
//             onClick={() => navigate(-1)}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Show data structure in console for debugging
//   console.log('🎯 Rendering with election:', {
//     id: currentElection.id,
//     title: currentElection.title,
//     description: currentElection.description,
//     topic_image_url: currentElection.topic_image_url,
//     start_date: currentElection.start_date,
//     end_date: currentElection.end_date,
//     status: currentElection.status,
//     voting_type: currentElection.voting_type,
//     is_free: currentElection.is_free,
//     questions_count: currentElection.questions?.length || 0
//   });

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       <button
//         onClick={() => navigate(-1)}
//         className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
//       >
//         <ArrowLeft size={20} />
//         Back
//       </button>

//       <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
//         {currentElection.topic_image_url && (
//           <div className="w-full h-64 md:h-96">
//             <img
//               src={currentElection.topic_image_url}
//               alt={currentElection.title || 'Election'}
//               className="w-full h-full object-cover"
//               onError={(e) => {
//                 console.error('Image load error:', currentElection.topic_image_url);
//                 e.target.style.display = 'none';
//               }}
//             />
//           </div>
//         )}

//         <div className="p-6 md:p-8">
//           <div className="flex items-start justify-between mb-4">
//             <div className="flex-1">
//               <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
//                 {currentElection.title || 'Untitled Election'}
//               </h1>
//               {currentElection.description && (
//                 <p className="text-gray-600 text-lg">{currentElection.description}</p>
//               )}
//             </div>
            
//             <div className="flex flex-col gap-2 ml-4">
//               {currentElection.is_free ? (
//                 <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-semibold rounded-full whitespace-nowrap">
//                   🆓 Free
//                 </span>
//               ) : (
//                 <span className="px-4 py-2 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full whitespace-nowrap">
//                   💰 Paid
//                 </span>
//               )}
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
//             <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
//               <Calendar className="text-blue-600" size={24} />
//               <div>
//                 <p className="text-xs text-gray-500">Start Date</p>
//                 <p className="font-semibold text-gray-900">{formatDate(currentElection.start_date)}</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
//               <Clock className="text-green-600" size={24} />
//               <div>
//                 <p className="text-xs text-gray-500">End Date</p>
//                 <p className="font-semibold text-gray-900">{formatDate(currentElection.end_date)}</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
//               <Users className="text-purple-600" size={24} />
//               <div>
//                 <p className="text-xs text-gray-500">Total Votes</p>
//                 <p className="font-semibold text-gray-900">{currentElection.vote_count || 0}</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
//               <Vote className="text-orange-600" size={24} />
//               <div>
//                 <p className="text-xs text-gray-500">Voting Type</p>
//                 <p className="font-semibold text-gray-900">
//                   {currentElection.voting_type ? 
//                     currentElection.voting_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) 
//                     : 'Not specified'}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {!canUserVote.can && (
//         <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6 rounded-r-lg">
//           <div className="flex items-start gap-4">
//             <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
//             <div>
//               <h3 className="text-lg font-semibold text-yellow-800 mb-2">Cannot Vote</h3>
//               <p className="text-yellow-700">{canUserVote.reason}</p>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="bg-white rounded-lg shadow mb-6">
//         <div className="flex border-b">
//           <button
//             onClick={() => setActiveTab('overview')}
//             className={`px-6 py-4 font-medium transition-colors ${
//               activeTab === 'overview'
//                 ? 'border-b-2 border-blue-600 text-blue-600'
//                 : 'text-gray-600 hover:text-gray-900'
//             }`}
//           >
//             Overview
//           </button>
//           {!currentElection.is_free && (
//             <button
//               onClick={() => setActiveTab('pricing')}
//               className={`px-6 py-4 font-medium transition-colors ${
//                 activeTab === 'pricing'
//                   ? 'border-b-2 border-blue-600 text-blue-600'
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               Pricing
//             </button>
//           )}
//           {canUserVote.can && currentElection.questions?.length > 0 && (
//             <button
//               onClick={() => setActiveTab('vote')}
//               className={`px-6 py-4 font-medium transition-colors ${
//                 activeTab === 'vote'
//                   ? 'border-b-2 border-blue-600 text-blue-600'
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               Vote Now
//             </button>
//           )}
//         </div>
//       </div>

//       <div className="bg-white rounded-lg shadow-lg p-8">
//         {activeTab === 'overview' && (
//           <div className="space-y-6">
//             <h2 className="text-2xl font-bold text-gray-900">Election Overview</h2>
//             <p className="text-gray-700">
//               {currentElection.description || 'No description available'}
//             </p>
            
//             {currentElection.voting_body_content && (
//               <div dangerouslySetInnerHTML={{ __html: currentElection.voting_body_content }} />
//             )}

//             {currentElection.questions?.length > 0 && (
//               <div className="mt-6">
//                 <h3 className="text-xl font-bold text-gray-900 mb-4">
//                   Questions ({currentElection.questions.length})
//                 </h3>
//                 <p className="text-gray-600">
//                   This election has {currentElection.questions.length} question(s). 
//                   {canUserVote.can ? ' Click the "Vote Now" tab to participate.' : ''}
//                 </p>
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === 'pricing' && !currentElection.is_free && (
//           <div className="space-y-6">
//             <h2 className="text-2xl font-bold text-gray-900">Pricing Information</h2>
            
//             {applicableFee && (
//               <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
//                 <h3 className="text-lg font-semibold text-purple-900 mb-4">Your Fee</h3>
//                 <div className="space-y-3">
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-700">Participation Fee:</span>
//                     <span className="text-xl font-bold text-gray-900">
//                       {applicableFee.currency} {applicableFee.amount.toFixed(2)}
//                     </span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-700">Processing Fee:</span>
//                     <span className="text-lg font-semibold text-gray-900">
//                       {applicableFee.currency} {applicableFee.processing.toFixed(2)}
//                     </span>
//                   </div>
//                   <div className="border-t-2 border-purple-300 pt-3 flex justify-between items-center">
//                     <span className="text-lg font-bold text-purple-900">Total Amount:</span>
//                     <span className="text-2xl font-bold text-purple-900">
//                       {applicableFee.currency} {applicableFee.total.toFixed(2)}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === 'vote' && canUserVote.can && currentElection.questions?.length > 0 && (
//           <div className="space-y-6">
//             <h2 className="text-2xl font-bold text-gray-900 mb-6">Cast Your Vote</h2>
            
//             {currentElection.questions.map((question, index) => (
//               <div key={question.id} className="mb-8 last:mb-0 border-b pb-6 last:border-0">
//                 <div className="flex items-start gap-3 mb-4">
//                   <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
//                     <span className="text-white font-bold">{index + 1}</span>
//                   </div>
//                   <div className="flex-1">
//                     <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                       {question.question_text}
//                       {question.is_required && (
//                         <span className="text-red-600 ml-1">*</span>
//                       )}
//                     </h3>
//                   </div>
//                 </div>

//                 <div className="ml-13 space-y-3">
//                   {question.options?.map((option) => {
//                     const isSelected = selectedAnswers[question.id]?.includes(option.id);
                    
//                     return (
//                       <button
//                         key={option.id}
//                         onClick={() => handleAnswerSelect(
//                           question.id, 
//                           option.id, 
//                           question.question_type,
//                           question.max_selections
//                         )}
//                         className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
//                           isSelected
//                             ? 'border-blue-600 bg-blue-50'
//                             : 'border-gray-200 bg-white hover:border-blue-300'
//                         }`}
//                       >
//                         <div className="flex items-center gap-3">
//                           <div className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center ${
//                             isSelected
//                               ? 'border-blue-600 bg-blue-600'
//                               : 'border-gray-300 bg-white'
//                           }`}>
//                             {isSelected && (
//                               <CheckCircle className="text-white" size={16} />
//                             )}
//                           </div>
//                           <span className={`flex-1 font-medium ${
//                             isSelected ? 'text-blue-900' : 'text-gray-900'
//                           }`}>
//                             {option.option_text}
//                           </span>
//                         </div>
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             ))}

//             {!currentElection.is_free && applicableFee && (
//               <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-6">
//                 <h3 className="text-xl font-bold text-gray-900 mb-4">
//                   <Wallet className="inline mr-2" size={24} />
//                   Payment Summary
//                 </h3>
//                 <div className="space-y-3 mb-4">
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-700">Total:</span>
//                     <span className="text-2xl font-bold text-orange-600">
//                       {applicableFee.currency} {applicableFee.total.toFixed(2)}
//                     </span>
//                   </div>
//                 </div>

//                 <label className="flex items-start gap-3 p-4 bg-white rounded-lg cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={agreeToTerms}
//                     onChange={(e) => setAgreeToTerms(e.target.checked)}
//                     className="mt-1"
//                   />
//                   <span className="text-sm text-gray-700">
//                     I agree that the payment will be frozen in my wallet until the election ends.
//                   </span>
//                 </label>
//               </div>
//             )}

//             <button
//               onClick={handleVoteSubmit}
//               disabled={votingInProgress}
//               className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-3 ${
//                 votingInProgress
//                   ? 'bg-gray-400 cursor-not-allowed'
//                   : 'bg-blue-600 hover:bg-blue-700 text-white'
//               }`}
//             >
//               {votingInProgress ? (
//                 <>
//                   <Loader className="animate-spin" size={24} />
//                   Processing...
//                 </>
//               ) : (
//                 <>
//                   <Vote size={24} />
//                   {currentElection.is_free ? 'Submit Vote' : 'Pay & Vote Now'}
//                   <ArrowRight size={24} />
//                 </>
//               )}
//             </button>
//           </div>
//         )}

//         {activeTab === 'vote' && (!currentElection.questions || currentElection.questions.length === 0) && (
//           <div className="text-center py-12">
//             <AlertCircle className="mx-auto mb-4 text-gray-400" size={64} />
//             <h3 className="text-xl font-bold text-gray-800 mb-2">No Questions Available</h3>
//             <p className="text-gray-600">This election doesn't have any questions yet.</p>
//           </div>
//         )}
//       </div>

//       {showPaymentModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg max-w-md w-full p-6">
//             <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Payment</h2>
            
//             <div className="mb-6">
//               <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
//               <div className="space-y-2">
//                 <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400">
//                   <input
//                     type="radio"
//                     name="payment"
//                     value="card"
//                     checked={paymentMethod === 'card'}
//                     onChange={(e) => setPaymentMethod(e.target.value)}
//                   />
//                   <CreditCard size={20} />
//                   <span>Credit/Debit Card</span>
//                 </label>
//                 <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400">
//                   <input
//                     type="radio"
//                     name="payment"
//                     value="wallet"
//                     checked={paymentMethod === 'wallet'}
//                     onChange={(e) => setPaymentMethod(e.target.value)}
//                   />
//                   <Wallet size={20} />
//                   <span>Wallet Balance</span>
//                 </label>
//               </div>
//             </div>

//             <div className="bg-blue-50 p-4 rounded-lg mb-6">
//               <div className="flex justify-between items-center mb-2">
//                 <span className="text-gray-700">Amount to Pay:</span>
//                 <span className="text-2xl font-bold text-blue-900">
//                   {applicableFee?.currency} {applicableFee?.total.toFixed(2)}
//                 </span>
//               </div>
//               <p className="text-xs text-gray-600">
//                 Funds will be frozen in your wallet until election completion
//               </p>
//             </div>

//             <div className="flex gap-3">
//               <button
//                 onClick={() => setShowPaymentModal(false)}
//                 className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-semibold"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={submitVote}
//                 disabled={votingInProgress}
//                 className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
//               >
//                 {votingInProgress ? 'Processing...' : 'Confirm & Pay'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// import React, { useState, useEffect, useMemo } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import { 
//   Lock, 
//   DollarSign, 
//   CreditCard, 
//   Calendar, 
//   Clock, 
//   Users, 
//   CheckCircle, 
//   AlertCircle,
//   Info,
//   ArrowLeft,
//   Vote,
//   Wallet,
//   Trophy,
//   Eye,
//   MapPin,
//   Shield,
//   Loader
// } from 'lucide-react';
// import { getElection } from '../../redux/api/election/electionApi';
// //import { getElection } from '../../../redux/api/election/electionApi';

// export default function ElectionVotingView() {
//   const { electionId } = useParams();
//   const navigate = useNavigate();

//   const { 
//     processingFee,
//     /*eslint-disable*/
//     userSubscription,
//     currentPlan,
//   } = useSelector((state) => state.subscription);

//   const [currentElection, setCurrentElection] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [selectedAnswers, setSelectedAnswers] = useState({});
//   const [userRegion, setUserRegion] = useState(null);
//   const [applicableFee, setApplicableFee] = useState(null);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [paymentMethod, setPaymentMethod] = useState('card');
//   const [agreeToTerms, setAgreeToTerms] = useState(false);
//   const [votingInProgress, setVotingInProgress] = useState(false);

//   useEffect(() => {
//     let isMounted = true;

//     const fetchElectionData = async () => {
//       if (!electionId) return;

//       try {
//         setLoading(true);
//         setError(null);

//         console.log('🔍 Fetching election ID:', electionId);
        
//         const response = await getElection(electionId);
        
//         if (!isMounted) return;

//         console.log('📦 Raw API Response:', response);
        
//         // Handle different response formats from your backend
//         let electionData = null;
        
//         if (response.data?.election) {
//           electionData = response.data.election;
//           console.log('✅ Found in response.data.election');
//         } else if (response.election) {
//           electionData = response.election;
//           console.log('✅ Found in response.election');
//         } else if (response.data) {
//           electionData = response.data;
//           console.log('✅ Found in response.data');
//         } else if (response.id) {
//           electionData = response;
//           console.log('✅ Response is the election itself');
//         }
        
//         if (electionData) {
//           console.log('✅ Election Data:', {
//             id: electionData.id,
//             title: electionData.title,
//             status: electionData.status,
//             start_date: electionData.start_date,
//             end_date: electionData.end_date,
//             voting_type: electionData.voting_type,
//             is_free: electionData.is_free,
//             questions: electionData.questions?.length || 0,
//             regional_pricing: electionData.regional_pricing?.length || 0
//           });
          
//           setCurrentElection(electionData);
//         } else {
//           console.error('❌ Could not extract election data from response');
//           throw new Error('Election data not found in response');
//         }

//       } catch (err) {
//         if (!isMounted) return;
        
//         console.error('❌ Error fetching election:', err);
//         console.error('Error details:', {
//           message: err.message,
//           response: err.response?.data,
//           status: err.response?.status
//         });
//         setError(err.message || 'Failed to load election');
//       } finally {
//         if (isMounted) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchElectionData();

//     return () => {
//       isMounted = false;
//     };
//   }, [electionId]);

//   useEffect(() => {
//     // ✅ For now, just use the first regional pricing
//     // TODO: Implement proper region detection using your backend
//     if (currentElection && !currentElection.is_free && currentElection.pricing_type === 'regional_fee') {
//       if (currentElection.regional_pricing?.length > 0) {
//         console.log('💰 Setting default region:', currentElection.regional_pricing[0]);
//         setUserRegion(currentElection.regional_pricing[0]);
//       }
//     }
//   }, [currentElection]);

//   useEffect(() => {
//     if (!currentElection) return;

//     console.log('💰 Calculating fee for election:', {
//       is_free: currentElection.is_free,
//       pricing_type: currentElection.pricing_type,
//       general_fee: currentElection.general_participation_fee,
//       regional_pricing: currentElection.regional_pricing?.length
//     });

//     if (currentElection.is_free) {
//       setApplicableFee({ amount: 0, currency: 'USD', processing: 0, total: 0 });
//     } else if (currentElection.pricing_type === 'general_fee') {
//       const baseAmount = parseFloat(currentElection.general_participation_fee || 0);
//       const processingAmount = baseAmount * (parseFloat(currentElection.processing_fee_percentage || 0) / 100);
//       setApplicableFee({
//         amount: baseAmount,
//         currency: 'USD',
//         processing: processingAmount,
//         total: baseAmount + processingAmount
//       });
//     } else if (currentElection.pricing_type === 'regional_fee' && userRegion) {
//       const baseAmount = parseFloat(userRegion.fee_amount || 0);
//       const processingAmount = baseAmount * (parseFloat(currentElection.processing_fee_percentage || processingFee || 0) / 100);
//       setApplicableFee({
//         amount: baseAmount,
//         currency: userRegion.currency || 'USD',
//         processing: processingAmount,
//         total: baseAmount + processingAmount,
//         region: userRegion.region_name
//       });
//     }
//   }, [currentElection, userRegion, processingFee]);

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Not set';
//     try {
//       const date = new Date(dateString);
//       if (isNaN(date.getTime())) return 'Invalid Date';
//       return date.toLocaleDateString('en-US', { 
//         year: 'numeric', 
//         month: 'long', 
//         day: 'numeric' 
//       });
//     } catch (err) {
//       console.error('Date formatting error:', err);
//       return 'Invalid Date';
//     }
//   };

//   const canUserVote = useMemo(() => {
//     if (!currentElection) return { can: false, reason: 'Election not found' };

//     console.log('🗳️ Checking vote eligibility:', {
//       status: currentElection.status,
//       start_date: currentElection.start_date,
//       end_date: currentElection.end_date,
//       now: new Date().toISOString()
//     });

//     const now = new Date();
//     const startDate = new Date(currentElection.start_date);
//     const endDate = new Date(currentElection.end_date);

//     if (currentElection.status !== 'published' && currentElection.status !== 'active') {
//       return { can: false, reason: `Election is not active (status: ${currentElection.status})` };
//     }

//     if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
//       return { can: false, reason: 'Invalid election dates' };
//     }

//     if (now < startDate) {
//       return { can: false, reason: `Election starts on ${formatDate(currentElection.start_date)}` };
//     }

//     if (now > endDate) {
//       return { can: false, reason: 'Election has ended' };
//     }

//     return { can: true, reason: null };
//   }, [currentElection]);

//   const handleAnswerSelect = (questionId, optionId, questionType, maxSelections) => {
//     setSelectedAnswers(prev => {
//       const current = prev[questionId] || [];
      
//       if (questionType === 'multiple_choice' && maxSelections === 1) {
//         return { ...prev, [questionId]: [optionId] };
//       } else if (questionType === 'approval' || maxSelections > 1) {
//         if (current.includes(optionId)) {
//           return { ...prev, [questionId]: current.filter(id => id !== optionId) };
//         } else {
//           if (maxSelections && current.length >= maxSelections) {
//             return prev;
//           }
//           return { ...prev, [questionId]: [...current, optionId] };
//         }
//       }
      
//       return prev;
//     });
//   };

//   const validateAnswers = () => {
//     if (!currentElection?.questions) return { valid: true, errors: [] };

//     const errors = [];
    
//     currentElection.questions.forEach(question => {
//       if (question.is_required && !selectedAnswers[question.id]?.length) {
//         errors.push(`Question "${question.question_text}" is required`);
//       }
//     });

//     return { valid: errors.length === 0, errors };
//   };

//   const handleVoteSubmit = async () => {
//     const validation = validateAnswers();
//     if (!validation.valid) {
//       alert(validation.errors.join('\n'));
//       return;
//     }

//     if (!currentElection.is_free && !agreeToTerms) {
//       alert('Please agree to the terms and conditions');
//       return;
//     }

//     if (!currentElection.is_free) {
//       setShowPaymentModal(true);
//     } else {
//       await submitVote();
//     }
//   };

//   const submitVote = async () => {
//     try {
//       setVotingInProgress(true);

//       const voteData = {
//         election_id: currentElection.id,
//         answers: Object.keys(selectedAnswers).map(questionId => ({
//           question_id: parseInt(questionId),
//           option_ids: selectedAnswers[questionId]
//         })),
//         payment: !currentElection.is_free ? {
//           amount: applicableFee.total,
//           currency: applicableFee.currency,
//           method: paymentMethod,
//           region: userRegion?.region_code
//         } : null
//       };

//       console.log('📤 Submitting vote:', voteData);

//       // TODO: Replace with actual API call
//       // await submitVoteAPI(voteData);

//       alert('Vote submitted successfully!');
      
//       navigate(`/elections/${currentElection.id}/confirmation`, {
//         state: {
//           voteData,
//           paymentData: applicableFee,
//           electionTitle: currentElection.title,
//           receiptId: 'RECEIPT-' + Date.now()
//         }
//       });

//     } catch (error) {
//       console.error('❌ Error submitting vote:', error);
//       alert('Failed to submit vote. Please try again.');
//     } finally {
//       setVotingInProgress(false);
//       setShowPaymentModal(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading election details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !currentElection) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
//           <p className="text-red-600 font-semibold mb-2">Error Loading Election</p>
//           <p className="text-gray-600 mb-4">{error || 'Election not found'}</p>
//           <button
//             onClick={() => navigate(-1)}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Show data structure in console for debugging
//   console.log('🎯 Rendering with election:', {
//     id: currentElection.id,
//     title: currentElection.title,
//     description: currentElection.description,
//     topic_image_url: currentElection.topic_image_url,
//     start_date: currentElection.start_date,
//     end_date: currentElection.end_date,
//     status: currentElection.status,
//     voting_type: currentElection.voting_type,
//     is_free: currentElection.is_free,
//     questions_count: currentElection.questions?.length || 0
//   });

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       <button
//         onClick={() => navigate(-1)}
//         className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
//       >
//         <ArrowLeft size={20} />
//         Back
//       </button>

//       <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
//         {currentElection.topic_image_url && (
//           <div className="w-full h-64 md:h-96">
//             <img
//               src={currentElection.topic_image_url}
//               alt={currentElection.title || 'Election'}
//               className="w-full h-full object-cover"
//               onError={(e) => {
//                 console.error('Image load error:', currentElection.topic_image_url);
//                 e.target.style.display = 'none';
//               }}
//             />
//           </div>
//         )}

//         <div className="p-6 md:p-8">
//           <div className="flex items-start justify-between mb-4">
//             <div className="flex-1">
//               <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
//                 {currentElection.title || 'Untitled Election'}
//               </h1>
//               {currentElection.description && (
//                 <p className="text-gray-600 text-lg">{currentElection.description}</p>
//               )}
//             </div>
            
//             <div className="flex flex-col gap-2 ml-4">
//               {currentElection.is_free ? (
//                 <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-semibold rounded-full whitespace-nowrap">
//                   🆓 Free
//                 </span>
//               ) : (
//                 <span className="px-4 py-2 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full whitespace-nowrap">
//                   💰 Paid
//                 </span>
//               )}
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
//             <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
//               <Calendar className="text-blue-600" size={24} />
//               <div>
//                 <p className="text-xs text-gray-500">Start Date</p>
//                 <p className="font-semibold text-gray-900">{formatDate(currentElection.start_date)}</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
//               <Clock className="text-green-600" size={24} />
//               <div>
//                 <p className="text-xs text-gray-500">End Date</p>
//                 <p className="font-semibold text-gray-900">{formatDate(currentElection.end_date)}</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
//               <Users className="text-purple-600" size={24} />
//               <div>
//                 <p className="text-xs text-gray-500">Total Votes</p>
//                 <p className="font-semibold text-gray-900">{currentElection.vote_count || 0}</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
//               <Vote className="text-orange-600" size={24} />
//               <div>
//                 <p className="text-xs text-gray-500">Voting Type</p>
//                 <p className="font-semibold text-gray-900">
//                   {currentElection.voting_type ? 
//                     currentElection.voting_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) 
//                     : 'Not specified'}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {!canUserVote.can && (
//         <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6 rounded-r-lg">
//           <div className="flex items-start gap-4">
//             <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
//             <div>
//               <h3 className="text-lg font-semibold text-yellow-800 mb-2">Cannot Vote</h3>
//               <p className="text-yellow-700">{canUserVote.reason}</p>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="bg-white rounded-lg shadow mb-6">
//         <div className="flex border-b">
//           <button
//             onClick={() => setActiveTab('overview')}
//             className={`px-6 py-4 font-medium transition-colors ${
//               activeTab === 'overview'
//                 ? 'border-b-2 border-blue-600 text-blue-600'
//                 : 'text-gray-600 hover:text-gray-900'
//             }`}
//           >
//             Overview
//           </button>
//           {!currentElection.is_free && (
//             <button
//               onClick={() => setActiveTab('pricing')}
//               className={`px-6 py-4 font-medium transition-colors ${
//                 activeTab === 'pricing'
//                   ? 'border-b-2 border-blue-600 text-blue-600'
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               Pricing
//             </button>
//           )}
//           {canUserVote.can && currentElection.questions?.length > 0 && (
//             <button
//               onClick={() => setActiveTab('vote')}
//               className={`px-6 py-4 font-medium transition-colors ${
//                 activeTab === 'vote'
//                   ? 'border-b-2 border-blue-600 text-blue-600'
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               Vote Now
//             </button>
//           )}
//         </div>
//       </div>

//       <div className="bg-white rounded-lg shadow-lg p-8">
//         {activeTab === 'overview' && (
//           <div className="space-y-6">
//             <h2 className="text-2xl font-bold text-gray-900">Election Overview</h2>
//             <p className="text-gray-700">
//               {currentElection.description || 'No description available'}
//             </p>
            
//             {currentElection.voting_body_content && (
//               <div dangerouslySetInnerHTML={{ __html: currentElection.voting_body_content }} />
//             )}

//             {currentElection.questions?.length > 0 && (
//               <div className="mt-6">
//                 <h3 className="text-xl font-bold text-gray-900 mb-4">
//                   Questions ({currentElection.questions.length})
//                 </h3>
//                 <p className="text-gray-600">
//                   This election has {currentElection.questions.length} question(s). 
//                   {canUserVote.can ? ' Click the "Vote Now" tab to participate.' : ''}
//                 </p>
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === 'pricing' && !currentElection.is_free && (
//           <div className="space-y-6">
//             <h2 className="text-2xl font-bold text-gray-900">Pricing Information</h2>
            
//             {applicableFee && (
//               <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
//                 <h3 className="text-lg font-semibold text-purple-900 mb-4">Your Fee</h3>
//                 <div className="space-y-3">
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-700">Participation Fee:</span>
//                     <span className="text-xl font-bold text-gray-900">
//                       {applicableFee.currency} {applicableFee.amount.toFixed(2)}
//                     </span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-700">Processing Fee:</span>
//                     <span className="text-lg font-semibold text-gray-900">
//                       {applicableFee.currency} {applicableFee.processing.toFixed(2)}
//                     </span>
//                   </div>
//                   <div className="border-t-2 border-purple-300 pt-3 flex justify-between items-center">
//                     <span className="text-lg font-bold text-purple-900">Total Amount:</span>
//                     <span className="text-2xl font-bold text-purple-900">
//                       {applicableFee.currency} {applicableFee.total.toFixed(2)}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === 'vote' && canUserVote.can && currentElection.questions?.length > 0 && (
//           <div className="space-y-6">
//             <h2 className="text-2xl font-bold text-gray-900 mb-6">Cast Your Vote</h2>
            
//             {currentElection.questions.map((question, index) => (
//               <div key={question.id} className="mb-8 last:mb-0 border-b pb-6 last:border-0">
//                 <div className="flex items-start gap-3 mb-4">
//                   <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
//                     <span className="text-white font-bold">{index + 1}</span>
//                   </div>
//                   <div className="flex-1">
//                     <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                       {question.question_text}
//                       {question.is_required && (
//                         <span className="text-red-600 ml-1">*</span>
//                       )}
//                     </h3>
//                   </div>
//                 </div>

//                 <div className="ml-13 space-y-3">
//                   {question.options?.map((option) => {
//                     const isSelected = selectedAnswers[question.id]?.includes(option.id);
                    
//                     return (
//                       <button
//                         key={option.id}
//                         onClick={() => handleAnswerSelect(
//                           question.id, 
//                           option.id, 
//                           question.question_type,
//                           question.max_selections
//                         )}
//                         className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
//                           isSelected
//                             ? 'border-blue-600 bg-blue-50'
//                             : 'border-gray-200 bg-white hover:border-blue-300'
//                         }`}
//                       >
//                         <div className="flex items-center gap-3">
//                           <div className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center ${
//                             isSelected
//                               ? 'border-blue-600 bg-blue-600'
//                               : 'border-gray-300 bg-white'
//                           }`}>
//                             {isSelected && (
//                               <CheckCircle className="text-white" size={16} />
//                             )}
//                           </div>
//                           <span className={`flex-1 font-medium ${
//                             isSelected ? 'text-blue-900' : 'text-gray-900'
//                           }`}>
//                             {option.option_text}
//                           </span>
//                         </div>
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             ))}

//             {!currentElection.is_free && applicableFee && (
//               <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-6">
//                 <h3 className="text-xl font-bold text-gray-900 mb-4">
//                   <Wallet className="inline mr-2" size={24} />
//                   Payment Summary
//                 </h3>
//                 <div className="space-y-3 mb-4">
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-700">Total:</span>
//                     <span className="text-2xl font-bold text-orange-600">
//                       {applicableFee.currency} {applicableFee.total.toFixed(2)}
//                     </span>
//                   </div>
//                 </div>

//                 <label className="flex items-start gap-3 p-4 bg-white rounded-lg cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={agreeToTerms}
//                     onChange={(e) => setAgreeToTerms(e.target.checked)}
//                     className="mt-1"
//                   />
//                   <span className="text-sm text-gray-700">
//                     I agree that the payment will be frozen in my wallet until the election ends.
//                   </span>
//                 </label>
//               </div>
//             )}

//             <button
//               onClick={handleVoteSubmit}
//               disabled={votingInProgress}
//               className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-3 ${
//                 votingInProgress
//                   ? 'bg-gray-400 cursor-not-allowed'
//                   : 'bg-blue-600 hover:bg-blue-700 text-white'
//               }`}
//             >
//               {votingInProgress ? (
//                 <>
//                   <Loader className="animate-spin" size={24} />
//                   Processing...
//                 </>
//               ) : (
//                 <>
//                   <Vote size={24} />
//                   {currentElection.is_free ? 'Submit Vote' : 'Pay & Vote Now'}
//                   <ArrowRight size={24} />
//                 </>
//               )}
//             </button>
//           </div>
//         )}

//         {activeTab === 'vote' && (!currentElection.questions || currentElection.questions.length === 0) && (
//           <div className="text-center py-12">
//             <AlertCircle className="mx-auto mb-4 text-gray-400" size={64} />
//             <h3 className="text-xl font-bold text-gray-800 mb-2">No Questions Available</h3>
//             <p className="text-gray-600">This election doesn't have any questions yet.</p>
//           </div>
//         )}
//       </div>

//       {showPaymentModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg max-w-md w-full p-6">
//             <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Payment</h2>
            
//             <div className="mb-6">
//               <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
//               <div className="space-y-2">
//                 <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400">
//                   <input
//                     type="radio"
//                     name="payment"
//                     value="card"
//                     checked={paymentMethod === 'card'}
//                     onChange={(e) => setPaymentMethod(e.target.value)}
//                   />
//                   <CreditCard size={20} />
//                   <span>Credit/Debit Card</span>
//                 </label>
//                 <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400">
//                   <input
//                     type="radio"
//                     name="payment"
//                     value="wallet"
//                     checked={paymentMethod === 'wallet'}
//                     onChange={(e) => setPaymentMethod(e.target.value)}
//                   />
//                   <Wallet size={20} />
//                   <span>Wallet Balance</span>
//                 </label>
//               </div>
//             </div>

//             <div className="bg-blue-50 p-4 rounded-lg mb-6">
//               <div className="flex justify-between items-center mb-2">
//                 <span className="text-gray-700">Amount to Pay:</span>
//                 <span className="text-2xl font-bold text-blue-900">
//                   {applicableFee?.currency} {applicableFee?.total.toFixed(2)}
//                 </span>
//               </div>
//               <p className="text-xs text-gray-600">
//                 Funds will be frozen in your wallet until election completion
//               </p>
//             </div>

//             <div className="flex gap-3">
//               <button
//                 onClick={() => setShowPaymentModal(false)}
//                 className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-semibold"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={submitVote}
//                 disabled={votingInProgress}
//                 className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
//               >
//                 {votingInProgress ? 'Processing...' : 'Confirm & Pay'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }