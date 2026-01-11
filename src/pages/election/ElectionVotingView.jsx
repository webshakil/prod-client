// src/pages/voting/ElectionVotingView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useGetBallotQuery, useCastVoteMutation } from '../../redux/api/voting/votingApi';
import { setAllAnswers } from '../../redux/slices/votingNewSlice';
import { setMyTicket } from '../../redux/slices/lotteryySlice';
import { toast } from 'react-toastify';
import BallotRenderer from '../../components/Dashboard/Tabs/voting/BallotRenderer';
import LiveResultsChart from '../../components/Dashboard/Tabs/voting/LiveResultsChart';
import LotterySlotMachine from '../../components/Dashboard/Tabs/lotteryyy/LotterySlotMachine';
import VideoWatchProgress from '../../components/Dashboard/Tabs/voting/VideoWatchProgress';
import { useAuth } from '../../redux/hooks';
import { Loader, CheckCircle, AlertCircle, ArrowLeft, UserX, Shield, Copy, Check, Trophy, Sparkles, X } from 'lucide-react';
import CompactLiveResults from '../../components/Dashboard/Tabs/voting/CompactLiveResults';

export default function ElectionVotingView() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  /*eslint-disable*/
  const auth = useAuth();

  const [videoCompleted, setVideoCompleted] = useState(false);
  const answers = useSelector(state => state.votingNew?.answers || {});

  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [voteToken, setVoteToken] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [showAbstentionModal, setShowAbstentionModal] = useState(false);
  const [showFlyingBallot, setShowFlyingBallot] = useState(false);
  const [flyingBallNumber, setFlyingBallNumber] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ NEW: State to toggle lottery machine visibility (for mobile collapse)
  const [isLotteryExpanded, setIsLotteryExpanded] = useState(true);

  // ✅ FIXED: Skip refetch after vote is submitted to prevent hasVoted check from interfering
  const { data: ballotData, isLoading, error } = useGetBallotQuery(electionId, {
    skip: voteSubmitted, // Don't refetch after voting!
  });
  const [castVote, { isLoading: submitting }] = useCastVoteMutation();

  // ==================== NORMALIZED FLAGS (handles both snake_case and camelCase) ====================
  const votingTypeToUse = ballotData?.votingType || ballotData?.voting_type || 'plurality';
  
  const isAnonymousElection = ballotData?.anonymousVotingEnabled === true || 
                              ballotData?.anonymous_voting_enabled === true ||
                              ballotData?.election?.anonymousVotingEnabled === true ||
                              ballotData?.election?.anonymous_voting_enabled === true;
  
  const isLotteryEnabled = ballotData?.lotteryEnabled === true || 
                           ballotData?.lottery_enabled === true ||
                           ballotData?.gamificationEnabled === true ||
                           ballotData?.gamification_enabled === true ||
                           ballotData?.election?.lotteryEnabled === true ||
                           ballotData?.election?.lottery_enabled === true;
  
  const showLiveResults = ballotData?.liveResults === true || 
                          ballotData?.live_results === true ||
                          ballotData?.show_live_results === true ||
                          ballotData?.showLiveResults === true ||
                          ballotData?.election?.liveResults === true ||
                          ballotData?.election?.live_results === true ||
                          ballotData?.election?.show_live_results === true ||
                          ballotData?.election?.showLiveResults === true;

  // Lottery configuration
  const luckyVotersCount = ballotData?.lotteryConfig?.winner_count ||
                           ballotData?.lotteryConfig?.numberOfWinners ||
                           ballotData?.lottery_winner_count ||
                           ballotData?.numberOfWinners ||
                           1;

  console.log('🔍 Ballot data:', ballotData);
  console.log('🔍 Voting type:', votingTypeToUse);
  console.log('🔐 Is Anonymous Election:', isAnonymousElection);
  console.log('🎰 Is Lottery Enabled:', isLotteryEnabled);
  console.log('📊 Show Live Results:', showLiveResults);
  console.log('🎯 Lucky Voters Count:', luckyVotersCount);
  console.log('📝 Current answers:', answers);
  console.log('✅ Vote Submitted State:', voteSubmitted);

  useEffect(() => {
    if (ballotData?.videoWatchRequired && ballotData?.videoProgress) {
      const isAlreadyCompleted = ballotData.videoProgress.completed || 
                                  parseFloat(ballotData.videoProgress.watch_percentage) >= (ballotData.minimumWatchPercentage || 80);
      if (isAlreadyCompleted) {
        setVideoCompleted(true);
      }
    } else if (!ballotData?.videoWatchRequired) {
      setVideoCompleted(true);
    }
  }, [ballotData]);

  const handleAnswersChange = (newAnswers) => {
    console.log('📝 Answers updated:', newAnswers);
    dispatch(setAllAnswers(newAnswers));
  };

  // Reset Redux state and navigate to dashboard
  const goToDashboard = () => {
    dispatch(setAllAnswers({})); // Clear answers
    navigate('/dashboard');
  };

  const handleAbstention = async () => {
    setIsSubmitting(true);
    try {
      const result = await castVote({
        electionId,
        answers: {},
        isAbstention: true,
      }).unwrap();

      console.log('✅ Abstention recorded:', result);
      toast.success('✅ Blank ballot submitted successfully!', {
        position: 'top-center',
        autoClose: 3000,
      });

      setShowAbstentionModal(false);
      
      // Set vote submitted state to show success screen
      setVoteSubmitted(true);

    } catch (err) {
      console.error('❌ Abstention error:', err);
      toast.error(err.data?.error || 'Failed to submit blank ballot', {
        position: 'top-center',
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitVote = async () => {
    console.log('========== VOTE SUBMISSION DEBUG ==========');
    console.log('🗳️ Answers:', JSON.stringify(answers, null, 2));
    console.log('🗳️ Election ID:', electionId);
    console.log('🔐 Is Anonymous:', isAnonymousElection);
    
    if (!answers || Object.keys(answers).length === 0) {
      toast.error('Please select at least one option before submitting', {
        position: 'top-center',
        autoClose: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Show flying ballot animation if lottery enabled
      if (isLotteryEnabled) {
        const tempBallNumber = Math.floor(100000 + Math.random() * 900000);
        setFlyingBallNumber(tempBallNumber);
        setShowFlyingBallot(true);
        await new Promise(resolve => setTimeout(resolve, 3000));
        setShowFlyingBallot(false);
      }

      const result = await castVote({
        electionId,
        answers,
      }).unwrap();

      console.log('✅ Vote cast result:', result);

      // Update flying ball number with actual ticket number if returned
      if (result.ticket?.ball_number || result.ticket?.ballNumber) {
        setFlyingBallNumber(result.ticket.ball_number || result.ticket.ballNumber);
      }

      if (result.anonymous) {
        setVoteToken(result.voteToken);
        setReceiptData({
          receiptId: result.receiptId,
          voteHash: result.voteHash,
          verificationCode: result.verificationCode,
        });
        toast.success('🔐 Anonymous vote submitted! Save your verification token.', {
          position: 'top-center',
          autoClose: 6000,
        });
      } else {
        setReceiptData({
          receiptId: result.receiptId,
          voteHash: result.voteHash,
          verificationCode: result.verificationCode,
          votingId: result.votingId,
          ballNumber: result.ticket?.ball_number || result.ticket?.ballNumber,
        });
        toast.success(
          isLotteryEnabled 
            ? `🎉 Vote submitted! Your lottery ball number: ${result.ticket?.ball_number || result.ticket?.ballNumber || 'Created!'}` 
            : '✅ Vote submitted successfully!',
          { position: 'top-center', autoClose: 5000 }
        );
      }

      if (result.ticket && isLotteryEnabled) {
        dispatch(setMyTicket(result.ticket));
      }

      // ✅ Set vote submitted IMMEDIATELY to show success screen
      setVoteSubmitted(true);

      if (isLotteryEnabled) {
        setTimeout(() => {
          const targetElement = document.getElementById('lottery-machine-section');
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500);
      }
      
    } catch (err) {
      console.error('❌ Vote submission error:', err);
      if (err.data?.error === 'You have already voted in this election') {
        toast.error('⚠️ You have already voted in this election!', {
          position: 'top-center',
          autoClose: 5000,
        });
      } else {
        toast.error(err.data?.error || 'Failed to submit vote. Please try again.', {
          position: 'top-center',
          autoClose: 5000,
        });
      }
    } finally {
      setIsSubmitting(false);
      setShowFlyingBallot(false);
    }
  };

  const copyTokenToClipboard = () => {
    if (voteToken) {
      navigator.clipboard.writeText(voteToken);
      setTokenCopied(true);
      toast.success('Token copied to clipboard!', { position: 'top-center', autoClose: 2000 });
      setTimeout(() => setTokenCopied(false), 3000);
    }
  };

  const copyReceiptToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!', { position: 'top-center', autoClose: 2000 });
  };

  // ==================== VOTE SUBMITTED STATE (PRIORITY #1 - Show this first!) ====================
  if (voteSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
        <div className="max-w-4xl mx-auto pb-4">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
          >
            <ArrowLeft size={20} />
            Go to Dashboard
          </button>
        </div>

        <div className="max-w-4xl mx-auto space-y-8 py-4">
          {isAnonymousElection ? (
            // Anonymous Vote Confirmation
            <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-purple-500">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Shield className="w-16 h-16 text-purple-600" />
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-center mb-4 text-purple-900">
                🔐 Anonymous Vote Submitted!
              </h2>
              <p className="text-gray-700 text-center mb-6">
                Your vote has been recorded anonymously. Your identity is protected.
              </p>

              {voteToken && (
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-400 rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <UserX className="text-purple-700" size={24} />
                    <h3 className="text-lg font-bold text-purple-900">⚠️ SAVE THIS VERIFICATION TOKEN</h3>
                  </div>
                  <p className="text-purple-800 text-sm mb-4">
                    This is your ONLY way to verify your vote. We cannot recover it if lost!
                  </p>
                  <div className="bg-white rounded-lg p-4 border-2 border-purple-300 mb-3">
                    <p className="text-xs text-gray-600 mb-2">Verification Token:</p>
                    <p className="font-mono text-sm font-bold break-all text-purple-900 mb-3">{voteToken}</p>
                    <button
                      onClick={copyTokenToClipboard}
                      className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2"
                    >
                      {tokenCopied ? <><Check size={20} /> Copied!</> : <><Copy size={20} /> Copy Token</>}
                    </button>
                  </div>
                </div>
              )}

              {receiptData && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-xs text-gray-600 mb-1">Receipt ID:</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm font-bold flex-1 break-all">{receiptData.receiptId}</p>
                    <button onClick={() => copyReceiptToClipboard(receiptData.receiptId)} className="p-2 hover:bg-gray-200 rounded transition">
                      <Copy size={16} />
                    </button>
                  </div>
                  {receiptData.voteHash && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-600 mb-1">Vote Hash:</p>
                      <p className="font-mono text-xs break-all text-gray-700">{receiptData.voteHash}</p>
                    </div>
                  )}
                  {receiptData.verificationCode && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-600 mb-1">Verification Code:</p>
                      <p className="font-mono text-lg font-bold text-gray-900">{receiptData.verificationCode}</p>
                    </div>
                  )}
                </div>
              )}

              {isLotteryEnabled && (
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-lg p-4 mb-6">
                  <p className="text-yellow-800 font-semibold mb-2">🎰 Lottery Entry Confirmed!</p>
                  <p className="text-yellow-700 text-sm">Your lottery ticket has been created! Watch the slot machine below.</p>
                </div>
              )}

              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full bg-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-purple-700 transition shadow-lg"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            // Normal Vote Confirmation
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-center mb-4">Vote Recorded Successfully!</h2>
              <p className="text-gray-600 text-center mb-6">Your vote has been securely recorded and encrypted.</p>
              
              {receiptData && (
                <>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-1">Receipt ID:</p>
                    <p className="font-mono text-sm font-bold break-all">{receiptData.receiptId}</p>
                  </div>
                  {receiptData.voteHash && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-600 mb-1">Vote Hash:</p>
                      <p className="font-mono text-xs break-all">{receiptData.voteHash}</p>
                    </div>
                  )}
                  {receiptData.verificationCode && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-600 mb-1">Verification Code:</p>
                      <p className="font-mono text-lg font-bold">{receiptData.verificationCode}</p>
                    </div>
                  )}
                  {receiptData.votingId && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-blue-600 mb-1">Voting ID:</p>
                      <p className="font-mono text-sm font-bold break-all text-blue-800">{receiptData.votingId}</p>
                    </div>
                  )}
                  {receiptData.ballNumber && (
                    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-4">
                      <p className="text-sm text-yellow-700 mb-1">🎰 Your Lottery Ball Number:</p>
                      <p className="font-mono text-2xl font-bold text-yellow-800">{receiptData.ballNumber}</p>
                    </div>
                  )}
                </>
              )}

              {isLotteryEnabled && (
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-lg p-4 mb-4">
                  <p className="text-purple-800 font-semibold mb-2">🎰 Lottery Entry Confirmed!</p>
                  <p className="text-purple-700 text-sm">Your lottery ticket has been created! Watch the slot machine below.</p>
                </div>
              )}

              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {/* Lottery Machine after successful vote */}
          {isLotteryEnabled && (
            <div id="lottery-machine-section">
              <LotterySlotMachine
                electionId={electionId}
                electionEndDate={ballotData?.election?.endDate || ballotData?.election?.end_date}
                luckyVotersCount={luckyVotersCount}
                isElectionEnded={false}
                winners={[]}
                isActive={true}
              />
            </div>
          )}

          {showLiveResults && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold mb-4">Live Results</h3>
              <LiveResultsChart
                electionId={electionId}
                liveResultsVisible={true}
                votingType={votingTypeToUse}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==================== LOADING STATE ====================
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600 font-medium">Loading ballot...</p>
        </div>
      </div>
    );
  }

  // ==================== ERROR STATE ====================
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 pt-8 pb-4">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>
        <div className="flex items-center justify-center px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-800 font-bold text-center mb-2">Error Loading Ballot</p>
            <p className="text-red-600 text-sm text-center">{error.data?.error || 'Unknown error'}</p>
          </div>
        </div>
      </div>
    );
  }

  // ==================== NO BALLOT DATA ====================
  if (!ballotData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 pt-8 pb-4">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>
        <div className="flex items-center justify-center px-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <p className="text-yellow-800 font-bold text-center mb-2">No Ballot Data</p>
            <p className="text-yellow-600 text-sm text-center">Unable to load ballot information.</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ REMOVED: The hasVoted check - it's now ONLY in ElectionAccessGuard.jsx
  // The user should never reach this component if they've already voted
  // ElectionAccessGuard handles the hasVoted check BEFORE rendering ElectionVotingView

  // ==================== MAIN VOTING VIEW ====================
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      {/* Flying Ballot Animation Overlay */}
      {showFlyingBallot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="text-center">
            <div className="relative">
              <div className="animate-bounce">
                <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl animate-spin" style={{ animationDuration: '3s' }}>
                  <span className="text-2xl font-black text-white font-mono">
                    {String(flyingBallNumber).slice(0, 3)}
                  </span>
                </div>
              </div>
              <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-yellow-300 animate-pulse" />
              <Sparkles className="absolute -bottom-4 -left-4 w-8 h-8 text-yellow-300 animate-pulse" />
            </div>
            <p className="mt-6 text-white text-xl font-bold animate-pulse">
              🎰 Creating your lottery ticket...
            </p>
            <p className="mt-2 text-yellow-300 font-mono text-2xl">
              Ball #{flyingBallNumber}
            </p>
          </div>
        </div>
      )}

      {/* ✅ FIXED CORNER LOTTERY MACHINE - Bottom Right Corner */}
      {isLotteryEnabled && (
        <div 
          className="fixed bottom-4 right-4 z-40 transition-all duration-300 ease-in-out"
          style={{ 
            width: isLotteryExpanded ? 'min(380px, calc(100vw - 32px))' : 'auto',
          }}
        >
          {isLotteryExpanded ? (
            /* Expanded Lottery Machine */
            <div className="relative">
              {/* Collapse Button */}
              <button
                onClick={() => setIsLotteryExpanded(false)}
                className="absolute -top-2 -right-2 z-50 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors"
                title="Minimize lottery machine"
              >
                <X size={16} />
              </button>
              
              {/* The Actual Slot Machine - compact mode for corner display */}
              <LotterySlotMachine
                electionId={electionId}
                electionEndDate={ballotData?.election?.endDate || ballotData?.election?.end_date}
                luckyVotersCount={luckyVotersCount}
                isElectionEnded={false}
                winners={[]}
                isActive={true}
                compact={true}
              />
            </div>
          ) : (
            /* Collapsed - Floating Button to Expand */
            <button
              onClick={() => setIsLotteryExpanded(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full p-4 shadow-2xl transition-all hover:scale-110 animate-pulse"
              title="Show lottery machine"
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                <span className="font-bold text-sm hidden sm:inline">🎰 Lottery</span>
              </div>
            </button>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <div className="max-w-6xl mx-auto mb-6">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Election Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {ballotData?.election?.title}
                </h1>
                {ballotData?.election?.description && (
                  <p className="text-gray-600">{ballotData.election.description}</p>
                )}
              </div>
              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                ✅ Active
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-600 font-semibold mb-1">Start Date</p>
                <p className="text-sm font-bold text-blue-900">
                  {new Date(ballotData?.election?.startDate || ballotData?.election?.start_date).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-purple-600 font-semibold mb-1">End Date</p>
                <p className="text-sm font-bold text-purple-900">
                  {new Date(ballotData?.election?.endDate || ballotData?.election?.end_date).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-green-600 font-semibold mb-1">Voting Type</p>
                <p className="text-sm font-bold text-green-900 capitalize">
                  {votingTypeToUse.replace('_', ' ')}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-xs text-orange-600 font-semibold mb-1">Fee</p>
                <p className="text-sm font-bold text-orange-900">
                  {ballotData?.paymentRequired ? `$${ballotData?.participationFee?.toFixed(2)}` : 'Free'}
                </p>
              </div>
            </div>

            {/* Lottery/Gamification Banner */}
            {isLotteryEnabled && (
              <div className="mt-4 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="font-bold text-purple-900">🎰 Gamification Enabled!</p>
                    <p className="text-sm text-purple-700">Vote to automatically enter the lottery draw ({luckyVotersCount} winner{luckyVotersCount > 1 ? 's' : ''})</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Anonymous Voting Banner */}
          {isAnonymousElection && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded-lg p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <Shield className="w-12 h-12 text-purple-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-purple-900 mb-2">🔐 Anonymous Voting Enabled</h3>
                  <p className="text-purple-800">Your vote choices will NOT be linked to your identity.</p>
                </div>
              </div>
            </div>
          )}

          {/* Video Watch Section */}
          {ballotData?.videoWatchRequired && !videoCompleted && (
            <VideoWatchProgress
              electionId={electionId}
              videoUrl={ballotData.election?.videoUrl || ballotData.election?.video_url}
              minimumWatchPercentage={ballotData.minimumWatchPercentage || 80}
              required={true}
              onComplete={() => setVideoCompleted(true)}
            />
          )}

          {ballotData?.videoWatchRequired && videoCompleted && (
            <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-green-900 mb-1">✓ Video Requirement Completed!</h3>
                  <p className="text-green-700">You can proceed to vote below.</p>
                </div>
              </div>
            </div>
          )}

          {/* ==================== BALLOT WITH LIVE RESULTS SIDE BY SIDE ==================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ballot Section - Takes 2 columns if live results, 3 if not */}
            <div className={showLiveResults ? "lg:col-span-2" : "lg:col-span-3"}>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <BallotRenderer
                  electionId={electionId}
                  ballot={ballotData}
                  votingType={votingTypeToUse}
                  onAnswersChange={handleAnswersChange}
                />
              </div>
            </div>

            {/* Live Results Pie Chart - Takes 1 column, sticky */}
            {showLiveResults && (
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <CompactLiveResults
                    electionId={electionId}
                    questionId={ballotData?.questions?.[0]?.id}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ✅ REMOVED: Lottery Slot Machine from here - NOW IN FIXED CORNER POSITION ABOVE */}

          {/* Submit Buttons */}
          <div className="space-y-3">
            <button
              id="submit-vote-button"
              onClick={handleSubmitVote}
              disabled={isSubmitting || submitting || Object.keys(answers).length === 0 || (ballotData?.videoWatchRequired && !videoCompleted)}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform ${
                isSubmitting || submitting || Object.keys(answers).length === 0 || (ballotData?.videoWatchRequired && !videoCompleted)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-[1.02] hover:shadow-2xl'
              }`}
            >
              {isSubmitting || submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="animate-spin" size={20} />
                  {isLotteryEnabled ? '🎰 Submitting Vote...' : '⏳ Submitting...'}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {ballotData?.videoWatchRequired && !videoCompleted ? (
                    <>📹 Watch Video First</>
                  ) : (
                    <>
                      {isAnonymousElection && '🔐 '}
                      🗳️ Submit Vote 
                      {isLotteryEnabled && ' & Enter Lottery'}
                    </>
                  )}
                </span>
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                {Object.keys(answers).length > 0 ? (
                  <span className="text-green-600 font-semibold">
                    ✓ {Object.keys(answers).length} question{Object.keys(answers).length !== 1 ? 's' : ''} answered
                  </span>
                ) : (
                  <span className="text-orange-600 font-semibold">
                    ⚠ Select your answers above
                  </span>
                )}
              </p>
            </div>

            {/* Abstention Button */}
            <button
              onClick={() => setShowAbstentionModal(true)}
              disabled={isSubmitting || submitting}
              className="w-full py-3 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition shadow-md disabled:opacity-50"
            >
              📝 Submit Blank Ballot (Abstain)
            </button>
          </div>
        </div>
      </div>

      {/* Abstention Modal */}
      {showAbstentionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-12 h-12 text-orange-500" />
              <h3 className="text-xl font-bold text-gray-900">Submit Blank Ballot?</h3>
            </div>
            <p className="text-gray-700 mb-4">
              You are about to submit a blank ballot (abstention). This will count as participation but will not influence the election results.
            </p>
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This action cannot be undone. You will still be eligible for the lottery draw (if enabled).
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAbstentionModal(false)}
                disabled={isSubmitting}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAbstention}
                disabled={isSubmitting}
                className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <><Loader className="animate-spin" size={18} /> Submitting...</> : 'Confirm Abstention'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
//last workable code 
// // src/pages/voting/ElectionVotingView.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { useGetBallotQuery, useCastVoteMutation } from '../../redux/api/voting/votingApi';
// import { setAllAnswers } from '../../redux/slices/votingNewSlice';
// import { setMyTicket } from '../../redux/slices/lotteryySlice';
// import { toast } from 'react-toastify';
// import BallotRenderer from '../../components/Dashboard/Tabs/voting/BallotRenderer';
// import LiveResultsChart from '../../components/Dashboard/Tabs/voting/LiveResultsChart';
// import LotterySlotMachine from '../../components/Dashboard/Tabs/lotteryyy/LotterySlotMachine';
// import VideoWatchProgress from '../../components/Dashboard/Tabs/voting/VideoWatchProgress';
// import { useAuth } from '../../redux/hooks';
// import { Loader, CheckCircle, AlertCircle, ArrowLeft, UserX, Shield, Copy, Check, Trophy, Sparkles, X } from 'lucide-react';
// import CompactLiveResults from '../../components/Dashboard/Tabs/voting/CompactLiveResults';

// export default function ElectionVotingView() {
//   const { electionId } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   /*eslint-disable*/
//   const auth = useAuth();

//   const [videoCompleted, setVideoCompleted] = useState(false);
//   const answers = useSelector(state => state.votingNew?.answers || {});

//   const [voteSubmitted, setVoteSubmitted] = useState(false);
//   const [voteToken, setVoteToken] = useState(null);
//   const [receiptData, setReceiptData] = useState(null);
//   const [tokenCopied, setTokenCopied] = useState(false);
//   const [showAbstentionModal, setShowAbstentionModal] = useState(false);
//   const [showFlyingBallot, setShowFlyingBallot] = useState(false);
//   const [flyingBallNumber, setFlyingBallNumber] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // ✅ NEW: State to toggle lottery machine visibility (for mobile collapse)
//   const [isLotteryExpanded, setIsLotteryExpanded] = useState(true);

//   // ✅ FIXED: Skip refetch after vote is submitted to prevent hasVoted check from interfering
//   const { data: ballotData, isLoading, error } = useGetBallotQuery(electionId, {
//     skip: voteSubmitted, // Don't refetch after voting!
//   });
//   const [castVote, { isLoading: submitting }] = useCastVoteMutation();

//   // ==================== NORMALIZED FLAGS (handles both snake_case and camelCase) ====================
//   const votingTypeToUse = ballotData?.votingType || ballotData?.voting_type || 'plurality';
  
//   const isAnonymousElection = ballotData?.anonymousVotingEnabled === true || 
//                               ballotData?.anonymous_voting_enabled === true ||
//                               ballotData?.election?.anonymousVotingEnabled === true ||
//                               ballotData?.election?.anonymous_voting_enabled === true;
  
//   const isLotteryEnabled = ballotData?.lotteryEnabled === true || 
//                            ballotData?.lottery_enabled === true ||
//                            ballotData?.gamificationEnabled === true ||
//                            ballotData?.gamification_enabled === true ||
//                            ballotData?.election?.lotteryEnabled === true ||
//                            ballotData?.election?.lottery_enabled === true;
  
//   const showLiveResults = ballotData?.liveResults === true || 
//                           ballotData?.live_results === true ||
//                           ballotData?.show_live_results === true ||
//                           ballotData?.showLiveResults === true ||
//                           ballotData?.election?.liveResults === true ||
//                           ballotData?.election?.live_results === true ||
//                           ballotData?.election?.show_live_results === true ||
//                           ballotData?.election?.showLiveResults === true;

//   // Lottery configuration
//   const luckyVotersCount = ballotData?.lotteryConfig?.winner_count ||
//                            ballotData?.lotteryConfig?.numberOfWinners ||
//                            ballotData?.lottery_winner_count ||
//                            ballotData?.numberOfWinners ||
//                            1;

//   console.log('🔍 Ballot data:', ballotData);
//   console.log('🔍 Voting type:', votingTypeToUse);
//   console.log('🔐 Is Anonymous Election:', isAnonymousElection);
//   console.log('🎰 Is Lottery Enabled:', isLotteryEnabled);
//   console.log('📊 Show Live Results:', showLiveResults);
//   console.log('🎯 Lucky Voters Count:', luckyVotersCount);
//   console.log('📝 Current answers:', answers);
//   console.log('✅ Vote Submitted State:', voteSubmitted);

//   useEffect(() => {
//     if (ballotData?.videoWatchRequired && ballotData?.videoProgress) {
//       const isAlreadyCompleted = ballotData.videoProgress.completed || 
//                                   parseFloat(ballotData.videoProgress.watch_percentage) >= (ballotData.minimumWatchPercentage || 80);
//       if (isAlreadyCompleted) {
//         setVideoCompleted(true);
//       }
//     } else if (!ballotData?.videoWatchRequired) {
//       setVideoCompleted(true);
//     }
//   }, [ballotData]);

//   const handleAnswersChange = (newAnswers) => {
//     console.log('📝 Answers updated:', newAnswers);
//     dispatch(setAllAnswers(newAnswers));
//   };

//   // Reset Redux state and navigate to dashboard
//   const goToDashboard = () => {
//     dispatch(setAllAnswers({})); // Clear answers
//     navigate('/dashboard');
//   };

//   const handleAbstention = async () => {
//     setIsSubmitting(true);
//     try {
//       const result = await castVote({
//         electionId,
//         answers: {},
//         isAbstention: true,
//       }).unwrap();

//       console.log('✅ Abstention recorded:', result);
//       toast.success('✅ Blank ballot submitted successfully!', {
//         position: 'top-center',
//         autoClose: 3000,
//       });

//       setShowAbstentionModal(false);
      
//       // Set vote submitted state to show success screen
//       setVoteSubmitted(true);

//     } catch (err) {
//       console.error('❌ Abstention error:', err);
//       toast.error(err.data?.error || 'Failed to submit blank ballot', {
//         position: 'top-center',
//         autoClose: 5000,
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleSubmitVote = async () => {
//     console.log('========== VOTE SUBMISSION DEBUG ==========');
//     console.log('🗳️ Answers:', JSON.stringify(answers, null, 2));
//     console.log('🗳️ Election ID:', electionId);
//     console.log('🔐 Is Anonymous:', isAnonymousElection);
    
//     if (!answers || Object.keys(answers).length === 0) {
//       toast.error('Please select at least one option before submitting', {
//         position: 'top-center',
//         autoClose: 3000,
//       });
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       // Show flying ballot animation if lottery enabled
//       if (isLotteryEnabled) {
//         const tempBallNumber = Math.floor(100000 + Math.random() * 900000);
//         setFlyingBallNumber(tempBallNumber);
//         setShowFlyingBallot(true);
//         await new Promise(resolve => setTimeout(resolve, 3000));
//         setShowFlyingBallot(false);
//       }

//       const result = await castVote({
//         electionId,
//         answers,
//       }).unwrap();

//       console.log('✅ Vote cast result:', result);

//       // Update flying ball number with actual ticket number if returned
//       if (result.ticket?.ball_number || result.ticket?.ballNumber) {
//         setFlyingBallNumber(result.ticket.ball_number || result.ticket.ballNumber);
//       }

//       if (result.anonymous) {
//         setVoteToken(result.voteToken);
//         setReceiptData({
//           receiptId: result.receiptId,
//           voteHash: result.voteHash,
//           verificationCode: result.verificationCode,
//         });
//         toast.success('🔐 Anonymous vote submitted! Save your verification token.', {
//           position: 'top-center',
//           autoClose: 6000,
//         });
//       } else {
//         setReceiptData({
//           receiptId: result.receiptId,
//           voteHash: result.voteHash,
//           verificationCode: result.verificationCode,
//           votingId: result.votingId,
//           ballNumber: result.ticket?.ball_number || result.ticket?.ballNumber,
//         });
//         toast.success(
//           isLotteryEnabled 
//             ? `🎉 Vote submitted! Your lottery ball number: ${result.ticket?.ball_number || result.ticket?.ballNumber || 'Created!'}` 
//             : '✅ Vote submitted successfully!',
//           { position: 'top-center', autoClose: 5000 }
//         );
//       }

//       if (result.ticket && isLotteryEnabled) {
//         dispatch(setMyTicket(result.ticket));
//       }

//       // ✅ Set vote submitted IMMEDIATELY to show success screen
//       setVoteSubmitted(true);

//       if (isLotteryEnabled) {
//         setTimeout(() => {
//           const targetElement = document.getElementById('lottery-machine-section');
//           if (targetElement) {
//             targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
//           }
//         }, 500);
//       }
      
//     } catch (err) {
//       console.error('❌ Vote submission error:', err);
//       if (err.data?.error === 'You have already voted in this election') {
//         toast.error('⚠️ You have already voted in this election!', {
//           position: 'top-center',
//           autoClose: 5000,
//         });
//       } else {
//         toast.error(err.data?.error || 'Failed to submit vote. Please try again.', {
//           position: 'top-center',
//           autoClose: 5000,
//         });
//       }
//     } finally {
//       setIsSubmitting(false);
//       setShowFlyingBallot(false);
//     }
//   };

//   const copyTokenToClipboard = () => {
//     if (voteToken) {
//       navigator.clipboard.writeText(voteToken);
//       setTokenCopied(true);
//       toast.success('Token copied to clipboard!', { position: 'top-center', autoClose: 2000 });
//       setTimeout(() => setTokenCopied(false), 3000);
//     }
//   };

//   const copyReceiptToClipboard = (text) => {
//     navigator.clipboard.writeText(text);
//     toast.success('Copied to clipboard!', { position: 'top-center', autoClose: 2000 });
//   };

//   // ==================== VOTE SUBMITTED STATE (PRIORITY #1 - Show this first!) ====================
//   if (voteSubmitted) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
//         <div className="max-w-4xl mx-auto pb-4">
//           <button
//             onClick={() => window.location.href = '/dashboard'}
//             className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
//           >
//             <ArrowLeft size={20} />
//             Go to Dashboard
//           </button>
//         </div>

//         <div className="max-w-4xl mx-auto space-y-8 py-4">
//           {isAnonymousElection ? (
//             // Anonymous Vote Confirmation
//             <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-purple-500">
//               <div className="flex items-center justify-center gap-3 mb-6">
//                 <Shield className="w-16 h-16 text-purple-600" />
//                 <CheckCircle className="w-16 h-16 text-green-600" />
//               </div>
//               <h2 className="text-3xl font-bold text-center mb-4 text-purple-900">
//                 🔐 Anonymous Vote Submitted!
//               </h2>
//               <p className="text-gray-700 text-center mb-6">
//                 Your vote has been recorded anonymously. Your identity is protected.
//               </p>

//               {voteToken && (
//                 <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-400 rounded-lg p-6 mb-6">
//                   <div className="flex items-center gap-2 mb-3">
//                     <UserX className="text-purple-700" size={24} />
//                     <h3 className="text-lg font-bold text-purple-900">⚠️ SAVE THIS VERIFICATION TOKEN</h3>
//                   </div>
//                   <p className="text-purple-800 text-sm mb-4">
//                     This is your ONLY way to verify your vote. We cannot recover it if lost!
//                   </p>
//                   <div className="bg-white rounded-lg p-4 border-2 border-purple-300 mb-3">
//                     <p className="text-xs text-gray-600 mb-2">Verification Token:</p>
//                     <p className="font-mono text-sm font-bold break-all text-purple-900 mb-3">{voteToken}</p>
//                     <button
//                       onClick={copyTokenToClipboard}
//                       className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2"
//                     >
//                       {tokenCopied ? <><Check size={20} /> Copied!</> : <><Copy size={20} /> Copy Token</>}
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {receiptData && (
//                 <div className="bg-gray-50 rounded-lg p-4 mb-6">
//                   <p className="text-xs text-gray-600 mb-1">Receipt ID:</p>
//                   <div className="flex items-center gap-2">
//                     <p className="font-mono text-sm font-bold flex-1 break-all">{receiptData.receiptId}</p>
//                     <button onClick={() => copyReceiptToClipboard(receiptData.receiptId)} className="p-2 hover:bg-gray-200 rounded transition">
//                       <Copy size={16} />
//                     </button>
//                   </div>
//                   {receiptData.voteHash && (
//                     <div className="mt-3">
//                       <p className="text-xs text-gray-600 mb-1">Vote Hash:</p>
//                       <p className="font-mono text-xs break-all text-gray-700">{receiptData.voteHash}</p>
//                     </div>
//                   )}
//                   {receiptData.verificationCode && (
//                     <div className="mt-3">
//                       <p className="text-xs text-gray-600 mb-1">Verification Code:</p>
//                       <p className="font-mono text-lg font-bold text-gray-900">{receiptData.verificationCode}</p>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {isLotteryEnabled && (
//                 <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-lg p-4 mb-6">
//                   <p className="text-yellow-800 font-semibold mb-2">🎰 Lottery Entry Confirmed!</p>
//                   <p className="text-yellow-700 text-sm">Your lottery ticket has been created! Watch the slot machine below.</p>
//                 </div>
//               )}

//               <button
//                 onClick={() => window.location.href = '/dashboard'}
//                 className="w-full bg-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-purple-700 transition shadow-lg"
//               >
//                 Go to Dashboard
//               </button>
//             </div>
//           ) : (
//             // Normal Vote Confirmation
//             <div className="bg-white rounded-2xl shadow-xl p-8">
//               <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
//               <h2 className="text-2xl font-bold text-center mb-4">Vote Recorded Successfully!</h2>
//               <p className="text-gray-600 text-center mb-6">Your vote has been securely recorded and encrypted.</p>
              
//               {receiptData && (
//                 <>
//                   <div className="bg-gray-50 rounded-lg p-4 mb-4">
//                     <p className="text-sm text-gray-600 mb-1">Receipt ID:</p>
//                     <p className="font-mono text-sm font-bold break-all">{receiptData.receiptId}</p>
//                   </div>
//                   {receiptData.voteHash && (
//                     <div className="bg-gray-50 rounded-lg p-4 mb-4">
//                       <p className="text-sm text-gray-600 mb-1">Vote Hash:</p>
//                       <p className="font-mono text-xs break-all">{receiptData.voteHash}</p>
//                     </div>
//                   )}
//                   {receiptData.verificationCode && (
//                     <div className="bg-gray-50 rounded-lg p-4 mb-4">
//                       <p className="text-sm text-gray-600 mb-1">Verification Code:</p>
//                       <p className="font-mono text-lg font-bold">{receiptData.verificationCode}</p>
//                     </div>
//                   )}
//                   {receiptData.votingId && (
//                     <div className="bg-blue-50 rounded-lg p-4 mb-4">
//                       <p className="text-sm text-blue-600 mb-1">Voting ID:</p>
//                       <p className="font-mono text-sm font-bold break-all text-blue-800">{receiptData.votingId}</p>
//                     </div>
//                   )}
//                   {receiptData.ballNumber && (
//                     <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-4">
//                       <p className="text-sm text-yellow-700 mb-1">🎰 Your Lottery Ball Number:</p>
//                       <p className="font-mono text-2xl font-bold text-yellow-800">{receiptData.ballNumber}</p>
//                     </div>
//                   )}
//                 </>
//               )}

//               {isLotteryEnabled && (
//                 <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-lg p-4 mb-4">
//                   <p className="text-purple-800 font-semibold mb-2">🎰 Lottery Entry Confirmed!</p>
//                   <p className="text-purple-700 text-sm">Your lottery ticket has been created! Watch the slot machine below.</p>
//                 </div>
//               )}

//               <button
//                 onClick={() => window.location.href = '/dashboard'}
//                 className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
//               >
//                 Go to Dashboard
//               </button>
//             </div>
//           )}

//           {/* Lottery Machine after successful vote */}
//           {isLotteryEnabled && (
//             <div id="lottery-machine-section">
//               <LotterySlotMachine
//                 electionId={electionId}
//                 electionEndDate={ballotData?.election?.endDate || ballotData?.election?.end_date}
//                 luckyVotersCount={luckyVotersCount}
//                 isElectionEnded={false}
//                 winners={[]}
//                 isActive={true}
//               />
//             </div>
//           )}

//           {showLiveResults && (
//             <div className="bg-white rounded-2xl shadow-lg p-6">
//               <h3 className="text-2xl font-bold mb-4">Live Results</h3>
//               <LiveResultsChart
//                 electionId={electionId}
//                 liveResultsVisible={true}
//                 votingType={votingTypeToUse}
//               />
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   }

//   // ==================== LOADING STATE ====================
//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
//         <div className="text-center">
//           <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
//           <p className="text-gray-600 font-medium">Loading ballot...</p>
//         </div>
//       </div>
//     );
//   }

//   // ==================== ERROR STATE ====================
//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <div className="max-w-4xl mx-auto px-4 pt-8 pb-4">
//           <button
//             onClick={() => window.location.href = '/dashboard'}
//             className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
//           >
//             <ArrowLeft size={20} />
//             Go Back
//           </button>
//         </div>
//         <div className="flex items-center justify-center px-4">
//           <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
//             <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
//             <p className="text-red-800 font-bold text-center mb-2">Error Loading Ballot</p>
//             <p className="text-red-600 text-sm text-center">{error.data?.error || 'Unknown error'}</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ==================== NO BALLOT DATA ====================
//   if (!ballotData) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <div className="max-w-4xl mx-auto px-4 pt-8 pb-4">
//           <button
//             onClick={() => window.location.href = '/dashboard'}
//             className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
//           >
//             <ArrowLeft size={20} />
//             Go Back
//           </button>
//         </div>
//         <div className="flex items-center justify-center px-4">
//           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
//             <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
//             <p className="text-yellow-800 font-bold text-center mb-2">No Ballot Data</p>
//             <p className="text-yellow-600 text-sm text-center">Unable to load ballot information.</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ✅ REMOVED: The hasVoted check - it's now ONLY in ElectionAccessGuard.jsx
//   // The user should never reach this component if they've already voted
//   // ElectionAccessGuard handles the hasVoted check BEFORE rendering ElectionVotingView

//   // ==================== MAIN VOTING VIEW ====================
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
//       {/* Flying Ballot Animation Overlay */}
//       {showFlyingBallot && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
//           <div className="text-center">
//             <div className="relative">
//               <div className="animate-bounce">
//                 <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl animate-spin" style={{ animationDuration: '3s' }}>
//                   <span className="text-2xl font-black text-white font-mono">
//                     {String(flyingBallNumber).slice(0, 3)}
//                   </span>
//                 </div>
//               </div>
//               <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-yellow-300 animate-pulse" />
//               <Sparkles className="absolute -bottom-4 -left-4 w-8 h-8 text-yellow-300 animate-pulse" />
//             </div>
//             <p className="mt-6 text-white text-xl font-bold animate-pulse">
//               🎰 Creating your lottery ticket...
//             </p>
//             <p className="mt-2 text-yellow-300 font-mono text-2xl">
//               Ball #{flyingBallNumber}
//             </p>
//           </div>
//         </div>
//       )}

//       {/* ✅ FIXED CORNER LOTTERY MACHINE - Bottom Right Corner */}
//       {isLotteryEnabled && (
//         <div 
//           className="fixed bottom-4 right-4 z-40 transition-all duration-300 ease-in-out"
//           style={{ 
//             width: isLotteryExpanded ? 'min(380px, calc(100vw - 32px))' : 'auto',
//             maxHeight: isLotteryExpanded ? 'calc(100vh - 100px)' : 'auto',
//             overflowY: isLotteryExpanded ? 'auto' : 'visible',
//           }}
//         >
//           {isLotteryExpanded ? (
//             /* Expanded Lottery Machine */
//             <div className="relative">
//               {/* Collapse Button */}
//               <button
//                 onClick={() => setIsLotteryExpanded(false)}
//                 className="absolute -top-2 -right-2 z-50 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors"
//                 title="Minimize lottery machine"
//               >
//                 <X size={16} />
//               </button>
              
//               {/* Header Label */}
//               <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-t-xl flex items-center gap-2 shadow-lg">
//                 <Trophy className="w-4 h-4" />
//                 <span className="font-bold text-xs">🎰 Lottery Draw Machine</span>
//               </div>
              
//               {/* The Actual Slot Machine - compact mode for corner display */}
//               <div 
//                 className="shadow-2xl rounded-b-xl overflow-hidden bg-gray-900"
//               >
//                 <LotterySlotMachine
//                   electionId={electionId}
//                   electionEndDate={ballotData?.election?.endDate || ballotData?.election?.end_date}
//                   luckyVotersCount={luckyVotersCount}
//                   isElectionEnded={false}
//                   winners={[]}
//                   isActive={true}
//                   compact={true}
//                 />
//               </div>
//             </div>
//           ) : (
//             /* Collapsed - Floating Button to Expand */
//             <button
//               onClick={() => setIsLotteryExpanded(true)}
//               className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full p-4 shadow-2xl transition-all hover:scale-110 animate-pulse"
//               title="Show lottery machine"
//             >
//               <div className="flex items-center gap-2">
//                 <Trophy className="w-6 h-6" />
//                 <span className="font-bold text-sm hidden sm:inline">🎰 Lottery</span>
//               </div>
//             </button>
//           )}
//         </div>
//       )}

//       <div className="max-w-7xl mx-auto px-4">
//         {/* Back Button */}
//         <div className="max-w-6xl mx-auto mb-6">
//           <button
//             onClick={() => window.location.href = '/dashboard'}
//             className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
//           >
//             <ArrowLeft size={20} />
//             Go Back
//           </button>
//         </div>

//         <div className="max-w-6xl mx-auto space-y-6">
//           {/* Election Header */}
//           <div className="bg-white rounded-2xl shadow-lg p-6">
//             <div className="flex items-start justify-between mb-4">
//               <div className="flex-1">
//                 <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                   {ballotData?.election?.title}
//                 </h1>
//                 {ballotData?.election?.description && (
//                   <p className="text-gray-600">{ballotData.election.description}</p>
//                 )}
//               </div>
//               <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
//                 ✅ Active
//               </span>
//             </div>

//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
//               <div className="bg-blue-50 rounded-lg p-3">
//                 <p className="text-xs text-blue-600 font-semibold mb-1">Start Date</p>
//                 <p className="text-sm font-bold text-blue-900">
//                   {new Date(ballotData?.election?.startDate || ballotData?.election?.start_date).toLocaleDateString()}
//                 </p>
//               </div>
//               <div className="bg-purple-50 rounded-lg p-3">
//                 <p className="text-xs text-purple-600 font-semibold mb-1">End Date</p>
//                 <p className="text-sm font-bold text-purple-900">
//                   {new Date(ballotData?.election?.endDate || ballotData?.election?.end_date).toLocaleDateString()}
//                 </p>
//               </div>
//               <div className="bg-green-50 rounded-lg p-3">
//                 <p className="text-xs text-green-600 font-semibold mb-1">Voting Type</p>
//                 <p className="text-sm font-bold text-green-900 capitalize">
//                   {votingTypeToUse.replace('_', ' ')}
//                 </p>
//               </div>
//               <div className="bg-orange-50 rounded-lg p-3">
//                 <p className="text-xs text-orange-600 font-semibold mb-1">Fee</p>
//                 <p className="text-sm font-bold text-orange-900">
//                   {ballotData?.paymentRequired ? `$${ballotData?.participationFee?.toFixed(2)}` : 'Free'}
//                 </p>
//               </div>
//             </div>

//             {/* Lottery/Gamification Banner */}
//             {isLotteryEnabled && (
//               <div className="mt-4 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-lg p-4">
//                 <div className="flex items-center gap-3">
//                   <Trophy className="w-8 h-8 text-purple-600" />
//                   <div>
//                     <p className="font-bold text-purple-900">🎰 Gamification Enabled!</p>
//                     <p className="text-sm text-purple-700">Vote to automatically enter the lottery draw ({luckyVotersCount} winner{luckyVotersCount > 1 ? 's' : ''})</p>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Anonymous Voting Banner */}
//           {isAnonymousElection && (
//             <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded-lg p-6 shadow-lg">
//               <div className="flex items-start gap-4">
//                 <Shield className="w-12 h-12 text-purple-600 flex-shrink-0" />
//                 <div className="flex-1">
//                   <h3 className="text-xl font-bold text-purple-900 mb-2">🔐 Anonymous Voting Enabled</h3>
//                   <p className="text-purple-800">Your vote choices will NOT be linked to your identity.</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Video Watch Section */}
//           {ballotData?.videoWatchRequired && !videoCompleted && (
//             <VideoWatchProgress
//               electionId={electionId}
//               videoUrl={ballotData.election?.videoUrl || ballotData.election?.video_url}
//               minimumWatchPercentage={ballotData.minimumWatchPercentage || 80}
//               required={true}
//               onComplete={() => setVideoCompleted(true)}
//             />
//           )}

//           {ballotData?.videoWatchRequired && videoCompleted && (
//             <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-6">
//               <div className="flex items-center gap-4">
//                 <CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
//                 <div>
//                   <h3 className="text-xl font-bold text-green-900 mb-1">✓ Video Requirement Completed!</h3>
//                   <p className="text-green-700">You can proceed to vote below.</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* ==================== BALLOT WITH LIVE RESULTS SIDE BY SIDE ==================== */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             {/* Ballot Section - Takes 2 columns if live results, 3 if not */}
//             <div className={showLiveResults ? "lg:col-span-2" : "lg:col-span-3"}>
//               <div className="bg-white rounded-2xl shadow-lg p-6">
//                 <BallotRenderer
//                   electionId={electionId}
//                   ballot={ballotData}
//                   votingType={votingTypeToUse}
//                   onAnswersChange={handleAnswersChange}
//                 />
//               </div>
//             </div>

//             {/* Live Results Pie Chart - Takes 1 column, sticky */}
//             {showLiveResults && (
//               <div className="lg:col-span-1">
//                 <div className="sticky top-24">
//                   <CompactLiveResults
//                     electionId={electionId}
//                     questionId={ballotData?.questions?.[0]?.id}
//                   />
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* ✅ REMOVED: Lottery Slot Machine from here - NOW IN FIXED CORNER POSITION ABOVE */}

//           {/* Submit Buttons */}
//           <div className="space-y-3">
//             <button
//               id="submit-vote-button"
//               onClick={handleSubmitVote}
//               disabled={isSubmitting || submitting || Object.keys(answers).length === 0 || (ballotData?.videoWatchRequired && !videoCompleted)}
//               className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform ${
//                 isSubmitting || submitting || Object.keys(answers).length === 0 || (ballotData?.videoWatchRequired && !videoCompleted)
//                   ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                   : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-[1.02] hover:shadow-2xl'
//               }`}
//             >
//               {isSubmitting || submitting ? (
//                 <span className="flex items-center justify-center gap-2">
//                   <Loader className="animate-spin" size={20} />
//                   {isLotteryEnabled ? '🎰 Submitting Vote...' : '⏳ Submitting...'}
//                 </span>
//               ) : (
//                 <span className="flex items-center justify-center gap-2">
//                   {ballotData?.videoWatchRequired && !videoCompleted ? (
//                     <>📹 Watch Video First</>
//                   ) : (
//                     <>
//                       {isAnonymousElection && '🔐 '}
//                       🗳️ Submit Vote 
//                       {isLotteryEnabled && ' & Enter Lottery'}
//                     </>
//                   )}
//                 </span>
//               )}
//             </button>

//             <div className="text-center">
//               <p className="text-sm text-gray-600">
//                 {Object.keys(answers).length > 0 ? (
//                   <span className="text-green-600 font-semibold">
//                     ✓ {Object.keys(answers).length} question{Object.keys(answers).length !== 1 ? 's' : ''} answered
//                   </span>
//                 ) : (
//                   <span className="text-orange-600 font-semibold">
//                     ⚠ Select your answers above
//                   </span>
//                 )}
//               </p>
//             </div>

//             {/* Abstention Button */}
//             <button
//               onClick={() => setShowAbstentionModal(true)}
//               disabled={isSubmitting || submitting}
//               className="w-full py-3 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition shadow-md disabled:opacity-50"
//             >
//               📝 Submit Blank Ballot (Abstain)
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Abstention Modal */}
//       {showAbstentionModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
//             <div className="flex items-center gap-3 mb-4">
//               <AlertCircle className="w-12 h-12 text-orange-500" />
//               <h3 className="text-xl font-bold text-gray-900">Submit Blank Ballot?</h3>
//             </div>
//             <p className="text-gray-700 mb-4">
//               You are about to submit a blank ballot (abstention). This will count as participation but will not influence the election results.
//             </p>
//             <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-6">
//               <p className="text-sm text-yellow-800">
//                 <strong>Note:</strong> This action cannot be undone. You will still be eligible for the lottery draw (if enabled).
//               </p>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => setShowAbstentionModal(false)}
//                 disabled={isSubmitting}
//                 className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleAbstention}
//                 disabled={isSubmitting}
//                 className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
//               >
//                 {isSubmitting ? <><Loader className="animate-spin" size={18} /> Submitting...</> : 'Confirm Abstention'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
//last workbale code only to add lottery to corner above code
// // src/pages/voting/ElectionVotingView.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { useGetBallotQuery, useCastVoteMutation } from '../../redux/api/voting/votingApi';
// import { setAllAnswers } from '../../redux/slices/votingNewSlice';
// import { setMyTicket } from '../../redux/slices/lotteryySlice';
// import { toast } from 'react-toastify';
// import BallotRenderer from '../../components/Dashboard/Tabs/voting/BallotRenderer';
// import LiveResultsChart from '../../components/Dashboard/Tabs/voting/LiveResultsChart';
// import LotterySlotMachine from '../../components/Dashboard/Tabs/lotteryyy/LotterySlotMachine';
// import VideoWatchProgress from '../../components/Dashboard/Tabs/voting/VideoWatchProgress';
// import { useAuth } from '../../redux/hooks';
// import { Loader, CheckCircle, AlertCircle, ArrowLeft, UserX, Shield, Copy, Check, Trophy, Sparkles } from 'lucide-react';
// import CompactLiveResults from '../../components/Dashboard/Tabs/voting/CompactLiveResults';

// export default function ElectionVotingView() {
//   const { electionId } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   /*eslint-disable*/
//   const auth = useAuth();

//   const [videoCompleted, setVideoCompleted] = useState(false);
//   const answers = useSelector(state => state.votingNew?.answers || {});

//   const [voteSubmitted, setVoteSubmitted] = useState(false);
//   const [voteToken, setVoteToken] = useState(null);
//   const [receiptData, setReceiptData] = useState(null);
//   const [tokenCopied, setTokenCopied] = useState(false);
//   const [showAbstentionModal, setShowAbstentionModal] = useState(false);
//   const [showFlyingBallot, setShowFlyingBallot] = useState(false);
//   const [flyingBallNumber, setFlyingBallNumber] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // ✅ FIXED: Skip refetch after vote is submitted to prevent hasVoted check from interfering
//   const { data: ballotData, isLoading, error } = useGetBallotQuery(electionId, {
//     skip: voteSubmitted, // Don't refetch after voting!
//   });
//   const [castVote, { isLoading: submitting }] = useCastVoteMutation();

//   // ==================== NORMALIZED FLAGS (handles both snake_case and camelCase) ====================
//   const votingTypeToUse = ballotData?.votingType || ballotData?.voting_type || 'plurality';
  
//   const isAnonymousElection = ballotData?.anonymousVotingEnabled === true || 
//                               ballotData?.anonymous_voting_enabled === true ||
//                               ballotData?.election?.anonymousVotingEnabled === true ||
//                               ballotData?.election?.anonymous_voting_enabled === true;
  
//   const isLotteryEnabled = ballotData?.lotteryEnabled === true || 
//                            ballotData?.lottery_enabled === true ||
//                            ballotData?.gamificationEnabled === true ||
//                            ballotData?.gamification_enabled === true ||
//                            ballotData?.election?.lotteryEnabled === true ||
//                            ballotData?.election?.lottery_enabled === true;
  
//   const showLiveResults = ballotData?.liveResults === true || 
//                           ballotData?.live_results === true ||
//                           ballotData?.show_live_results === true ||
//                           ballotData?.showLiveResults === true ||
//                           ballotData?.election?.liveResults === true ||
//                           ballotData?.election?.live_results === true ||
//                           ballotData?.election?.show_live_results === true ||
//                           ballotData?.election?.showLiveResults === true;

//   // Lottery configuration
//   const luckyVotersCount = ballotData?.lotteryConfig?.winner_count ||
//                            ballotData?.lotteryConfig?.numberOfWinners ||
//                            ballotData?.lottery_winner_count ||
//                            ballotData?.numberOfWinners ||
//                            1;

//   console.log('🔍 Ballot data:', ballotData);
//   console.log('🔍 Voting type:', votingTypeToUse);
//   console.log('🔐 Is Anonymous Election:', isAnonymousElection);
//   console.log('🎰 Is Lottery Enabled:', isLotteryEnabled);
//   console.log('📊 Show Live Results:', showLiveResults);
//   console.log('🎯 Lucky Voters Count:', luckyVotersCount);
//   console.log('📝 Current answers:', answers);
//   console.log('✅ Vote Submitted State:', voteSubmitted);

//   useEffect(() => {
//     if (ballotData?.videoWatchRequired && ballotData?.videoProgress) {
//       const isAlreadyCompleted = ballotData.videoProgress.completed || 
//                                   parseFloat(ballotData.videoProgress.watch_percentage) >= (ballotData.minimumWatchPercentage || 80);
//       if (isAlreadyCompleted) {
//         setVideoCompleted(true);
//       }
//     } else if (!ballotData?.videoWatchRequired) {
//       setVideoCompleted(true);
//     }
//   }, [ballotData]);

//   const handleAnswersChange = (newAnswers) => {
//     console.log('📝 Answers updated:', newAnswers);
//     dispatch(setAllAnswers(newAnswers));
//   };

//   // Reset Redux state and navigate to dashboard
//   const goToDashboard = () => {
//     dispatch(setAllAnswers({})); // Clear answers
//     navigate('/dashboard');
//   };

//   const handleAbstention = async () => {
//     setIsSubmitting(true);
//     try {
//       const result = await castVote({
//         electionId,
//         answers: {},
//         isAbstention: true,
//       }).unwrap();

//       console.log('✅ Abstention recorded:', result);
//       toast.success('✅ Blank ballot submitted successfully!', {
//         position: 'top-center',
//         autoClose: 3000,
//       });

//       setShowAbstentionModal(false);
      
//       // Set vote submitted state to show success screen
//       setVoteSubmitted(true);

//     } catch (err) {
//       console.error('❌ Abstention error:', err);
//       toast.error(err.data?.error || 'Failed to submit blank ballot', {
//         position: 'top-center',
//         autoClose: 5000,
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleSubmitVote = async () => {
//     console.log('========== VOTE SUBMISSION DEBUG ==========');
//     console.log('🗳️ Answers:', JSON.stringify(answers, null, 2));
//     console.log('🗳️ Election ID:', electionId);
//     console.log('🔐 Is Anonymous:', isAnonymousElection);
    
//     if (!answers || Object.keys(answers).length === 0) {
//       toast.error('Please select at least one option before submitting', {
//         position: 'top-center',
//         autoClose: 3000,
//       });
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       // Show flying ballot animation if lottery enabled
//       if (isLotteryEnabled) {
//         const tempBallNumber = Math.floor(100000 + Math.random() * 900000);
//         setFlyingBallNumber(tempBallNumber);
//         setShowFlyingBallot(true);
//         await new Promise(resolve => setTimeout(resolve, 3000));
//         setShowFlyingBallot(false);
//       }

//       const result = await castVote({
//         electionId,
//         answers,
//       }).unwrap();

//       console.log('✅ Vote cast result:', result);

//       // Update flying ball number with actual ticket number if returned
//       if (result.ticket?.ball_number || result.ticket?.ballNumber) {
//         setFlyingBallNumber(result.ticket.ball_number || result.ticket.ballNumber);
//       }

//       if (result.anonymous) {
//         setVoteToken(result.voteToken);
//         setReceiptData({
//           receiptId: result.receiptId,
//           voteHash: result.voteHash,
//           verificationCode: result.verificationCode,
//         });
//         toast.success('🔐 Anonymous vote submitted! Save your verification token.', {
//           position: 'top-center',
//           autoClose: 6000,
//         });
//       } else {
//         setReceiptData({
//           receiptId: result.receiptId,
//           voteHash: result.voteHash,
//           verificationCode: result.verificationCode,
//           votingId: result.votingId,
//           ballNumber: result.ticket?.ball_number || result.ticket?.ballNumber,
//         });
//         toast.success(
//           isLotteryEnabled 
//             ? `🎉 Vote submitted! Your lottery ball number: ${result.ticket?.ball_number || result.ticket?.ballNumber || 'Created!'}` 
//             : '✅ Vote submitted successfully!',
//           { position: 'top-center', autoClose: 5000 }
//         );
//       }

//       if (result.ticket && isLotteryEnabled) {
//         dispatch(setMyTicket(result.ticket));
//       }

//       // ✅ Set vote submitted IMMEDIATELY to show success screen
//       setVoteSubmitted(true);

//       if (isLotteryEnabled) {
//         setTimeout(() => {
//           const targetElement = document.getElementById('lottery-machine-section');
//           if (targetElement) {
//             targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
//           }
//         }, 500);
//       }
      
//     } catch (err) {
//       console.error('❌ Vote submission error:', err);
//       if (err.data?.error === 'You have already voted in this election') {
//         toast.error('⚠️ You have already voted in this election!', {
//           position: 'top-center',
//           autoClose: 5000,
//         });
//       } else {
//         toast.error(err.data?.error || 'Failed to submit vote. Please try again.', {
//           position: 'top-center',
//           autoClose: 5000,
//         });
//       }
//     } finally {
//       setIsSubmitting(false);
//       setShowFlyingBallot(false);
//     }
//   };

//   const copyTokenToClipboard = () => {
//     if (voteToken) {
//       navigator.clipboard.writeText(voteToken);
//       setTokenCopied(true);
//       toast.success('Token copied to clipboard!', { position: 'top-center', autoClose: 2000 });
//       setTimeout(() => setTokenCopied(false), 3000);
//     }
//   };

//   const copyReceiptToClipboard = (text) => {
//     navigator.clipboard.writeText(text);
//     toast.success('Copied to clipboard!', { position: 'top-center', autoClose: 2000 });
//   };

//   // ==================== VOTE SUBMITTED STATE (PRIORITY #1 - Show this first!) ====================
//   if (voteSubmitted) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
//         <div className="max-w-4xl mx-auto pb-4">
//           <button
//             onClick={() => window.location.href = '/dashboard'}
//             className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
//           >
//             <ArrowLeft size={20} />
//             Go to Dashboard
//           </button>
//         </div>

//         <div className="max-w-4xl mx-auto space-y-8 py-4">
//           {isAnonymousElection ? (
//             // Anonymous Vote Confirmation
//             <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-purple-500">
//               <div className="flex items-center justify-center gap-3 mb-6">
//                 <Shield className="w-16 h-16 text-purple-600" />
//                 <CheckCircle className="w-16 h-16 text-green-600" />
//               </div>
//               <h2 className="text-3xl font-bold text-center mb-4 text-purple-900">
//                 🔐 Anonymous Vote Submitted!
//               </h2>
//               <p className="text-gray-700 text-center mb-6">
//                 Your vote has been recorded anonymously. Your identity is protected.
//               </p>

//               {voteToken && (
//                 <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-400 rounded-lg p-6 mb-6">
//                   <div className="flex items-center gap-2 mb-3">
//                     <UserX className="text-purple-700" size={24} />
//                     <h3 className="text-lg font-bold text-purple-900">⚠️ SAVE THIS VERIFICATION TOKEN</h3>
//                   </div>
//                   <p className="text-purple-800 text-sm mb-4">
//                     This is your ONLY way to verify your vote. We cannot recover it if lost!
//                   </p>
//                   <div className="bg-white rounded-lg p-4 border-2 border-purple-300 mb-3">
//                     <p className="text-xs text-gray-600 mb-2">Verification Token:</p>
//                     <p className="font-mono text-sm font-bold break-all text-purple-900 mb-3">{voteToken}</p>
//                     <button
//                       onClick={copyTokenToClipboard}
//                       className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2"
//                     >
//                       {tokenCopied ? <><Check size={20} /> Copied!</> : <><Copy size={20} /> Copy Token</>}
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {receiptData && (
//                 <div className="bg-gray-50 rounded-lg p-4 mb-6">
//                   <p className="text-xs text-gray-600 mb-1">Receipt ID:</p>
//                   <div className="flex items-center gap-2">
//                     <p className="font-mono text-sm font-bold flex-1 break-all">{receiptData.receiptId}</p>
//                     <button onClick={() => copyReceiptToClipboard(receiptData.receiptId)} className="p-2 hover:bg-gray-200 rounded transition">
//                       <Copy size={16} />
//                     </button>
//                   </div>
//                   {receiptData.voteHash && (
//                     <div className="mt-3">
//                       <p className="text-xs text-gray-600 mb-1">Vote Hash:</p>
//                       <p className="font-mono text-xs break-all text-gray-700">{receiptData.voteHash}</p>
//                     </div>
//                   )}
//                   {receiptData.verificationCode && (
//                     <div className="mt-3">
//                       <p className="text-xs text-gray-600 mb-1">Verification Code:</p>
//                       <p className="font-mono text-lg font-bold text-gray-900">{receiptData.verificationCode}</p>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {isLotteryEnabled && (
//                 <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-lg p-4 mb-6">
//                   <p className="text-yellow-800 font-semibold mb-2">🎰 Lottery Entry Confirmed!</p>
//                   <p className="text-yellow-700 text-sm">Your lottery ticket has been created! Watch the slot machine below.</p>
//                 </div>
//               )}

//               <button
//                 onClick={() => window.location.href = '/dashboard'}
//                 className="w-full bg-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-purple-700 transition shadow-lg"
//               >
//                 Go to Dashboard
//               </button>
//             </div>
//           ) : (
//             // Normal Vote Confirmation
//             <div className="bg-white rounded-2xl shadow-xl p-8">
//               <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
//               <h2 className="text-2xl font-bold text-center mb-4">Vote Recorded Successfully!</h2>
//               <p className="text-gray-600 text-center mb-6">Your vote has been securely recorded and encrypted.</p>
              
//               {receiptData && (
//                 <>
//                   <div className="bg-gray-50 rounded-lg p-4 mb-4">
//                     <p className="text-sm text-gray-600 mb-1">Receipt ID:</p>
//                     <p className="font-mono text-sm font-bold break-all">{receiptData.receiptId}</p>
//                   </div>
//                   {receiptData.voteHash && (
//                     <div className="bg-gray-50 rounded-lg p-4 mb-4">
//                       <p className="text-sm text-gray-600 mb-1">Vote Hash:</p>
//                       <p className="font-mono text-xs break-all">{receiptData.voteHash}</p>
//                     </div>
//                   )}
//                   {receiptData.verificationCode && (
//                     <div className="bg-gray-50 rounded-lg p-4 mb-4">
//                       <p className="text-sm text-gray-600 mb-1">Verification Code:</p>
//                       <p className="font-mono text-lg font-bold">{receiptData.verificationCode}</p>
//                     </div>
//                   )}
//                   {receiptData.votingId && (
//                     <div className="bg-blue-50 rounded-lg p-4 mb-4">
//                       <p className="text-sm text-blue-600 mb-1">Voting ID:</p>
//                       <p className="font-mono text-sm font-bold break-all text-blue-800">{receiptData.votingId}</p>
//                     </div>
//                   )}
//                   {receiptData.ballNumber && (
//                     <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-4">
//                       <p className="text-sm text-yellow-700 mb-1">🎰 Your Lottery Ball Number:</p>
//                       <p className="font-mono text-2xl font-bold text-yellow-800">{receiptData.ballNumber}</p>
//                     </div>
//                   )}
//                 </>
//               )}

//               {isLotteryEnabled && (
//                 <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-lg p-4 mb-4">
//                   <p className="text-purple-800 font-semibold mb-2">🎰 Lottery Entry Confirmed!</p>
//                   <p className="text-purple-700 text-sm">Your lottery ticket has been created! Watch the slot machine below.</p>
//                 </div>
//               )}

//               <button
//                 onClick={() => window.location.href = '/dashboard'}
//                 className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
//               >
//                 Go to Dashboard
//               </button>
//             </div>
//           )}

//           {/* Lottery Machine after successful vote */}
//           {isLotteryEnabled && (
//             <div id="lottery-machine-section">
//               <LotterySlotMachine
//                 electionId={electionId}
//                 electionEndDate={ballotData?.election?.endDate || ballotData?.election?.end_date}
//                 luckyVotersCount={luckyVotersCount}
//                 isElectionEnded={false}
//                 winners={[]}
//                 isActive={true}
//               />
//             </div>
//           )}

//           {showLiveResults && (
//             <div className="bg-white rounded-2xl shadow-lg p-6">
//               <h3 className="text-2xl font-bold mb-4">Live Results</h3>
//               <LiveResultsChart
//                 electionId={electionId}
//                 liveResultsVisible={true}
//                 votingType={votingTypeToUse}
//               />
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   }

//   // ==================== LOADING STATE ====================
//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
//         <div className="text-center">
//           <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
//           <p className="text-gray-600 font-medium">Loading ballot...</p>
//         </div>
//       </div>
//     );
//   }

//   // ==================== ERROR STATE ====================
//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <div className="max-w-4xl mx-auto px-4 pt-8 pb-4">
//           <button
//             onClick={() => window.location.href = '/dashboard'}
//             className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
//           >
//             <ArrowLeft size={20} />
//             Go Back
//           </button>
//         </div>
//         <div className="flex items-center justify-center px-4">
//           <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
//             <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
//             <p className="text-red-800 font-bold text-center mb-2">Error Loading Ballot</p>
//             <p className="text-red-600 text-sm text-center">{error.data?.error || 'Unknown error'}</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ==================== NO BALLOT DATA ====================
//   if (!ballotData) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <div className="max-w-4xl mx-auto px-4 pt-8 pb-4">
//           <button
//             onClick={() => window.location.href = '/dashboard'}
//             className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
//           >
//             <ArrowLeft size={20} />
//             Go Back
//           </button>
//         </div>
//         <div className="flex items-center justify-center px-4">
//           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
//             <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
//             <p className="text-yellow-800 font-bold text-center mb-2">No Ballot Data</p>
//             <p className="text-yellow-600 text-sm text-center">Unable to load ballot information.</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ✅ REMOVED: The hasVoted check - it's now ONLY in ElectionAccessGuard.jsx
//   // The user should never reach this component if they've already voted
//   // ElectionAccessGuard handles the hasVoted check BEFORE rendering ElectionVotingView

//   // ==================== MAIN VOTING VIEW ====================
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
//       {/* Flying Ballot Animation Overlay */}
//       {showFlyingBallot && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
//           <div className="text-center">
//             <div className="relative">
//               <div className="animate-bounce">
//                 <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl animate-spin" style={{ animationDuration: '3s' }}>
//                   <span className="text-2xl font-black text-white font-mono">
//                     {String(flyingBallNumber).slice(0, 3)}
//                   </span>
//                 </div>
//               </div>
//               <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-yellow-300 animate-pulse" />
//               <Sparkles className="absolute -bottom-4 -left-4 w-8 h-8 text-yellow-300 animate-pulse" />
//             </div>
//             <p className="mt-6 text-white text-xl font-bold animate-pulse">
//               🎰 Creating your lottery ticket...
//             </p>
//             <p className="mt-2 text-yellow-300 font-mono text-2xl">
//               Ball #{flyingBallNumber}
//             </p>
//           </div>
//         </div>
//       )}

//       <div className="max-w-7xl mx-auto px-4">
//         {/* Back Button */}
//         <div className="max-w-6xl mx-auto mb-6">
//           <button
//             onClick={() => window.location.href = '/dashboard'}
//             className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
//           >
//             <ArrowLeft size={20} />
//             Go Back
//           </button>
//         </div>

//         <div className="max-w-6xl mx-auto space-y-6">
//           {/* Election Header */}
//           <div className="bg-white rounded-2xl shadow-lg p-6">
//             <div className="flex items-start justify-between mb-4">
//               <div className="flex-1">
//                 <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                   {ballotData?.election?.title}
//                 </h1>
//                 {ballotData?.election?.description && (
//                   <p className="text-gray-600">{ballotData.election.description}</p>
//                 )}
//               </div>
//               <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
//                 ✅ Active
//               </span>
//             </div>

//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
//               <div className="bg-blue-50 rounded-lg p-3">
//                 <p className="text-xs text-blue-600 font-semibold mb-1">Start Date</p>
//                 <p className="text-sm font-bold text-blue-900">
//                   {new Date(ballotData?.election?.startDate || ballotData?.election?.start_date).toLocaleDateString()}
//                 </p>
//               </div>
//               <div className="bg-purple-50 rounded-lg p-3">
//                 <p className="text-xs text-purple-600 font-semibold mb-1">End Date</p>
//                 <p className="text-sm font-bold text-purple-900">
//                   {new Date(ballotData?.election?.endDate || ballotData?.election?.end_date).toLocaleDateString()}
//                 </p>
//               </div>
//               <div className="bg-green-50 rounded-lg p-3">
//                 <p className="text-xs text-green-600 font-semibold mb-1">Voting Type</p>
//                 <p className="text-sm font-bold text-green-900 capitalize">
//                   {votingTypeToUse.replace('_', ' ')}
//                 </p>
//               </div>
//               <div className="bg-orange-50 rounded-lg p-3">
//                 <p className="text-xs text-orange-600 font-semibold mb-1">Fee</p>
//                 <p className="text-sm font-bold text-orange-900">
//                   {ballotData?.paymentRequired ? `$${ballotData?.participationFee?.toFixed(2)}` : 'Free'}
//                 </p>
//               </div>
//             </div>

//             {/* Lottery/Gamification Banner */}
//             {isLotteryEnabled && (
//               <div className="mt-4 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-lg p-4">
//                 <div className="flex items-center gap-3">
//                   <Trophy className="w-8 h-8 text-purple-600" />
//                   <div>
//                     <p className="font-bold text-purple-900">🎰 Gamification Enabled!</p>
//                     <p className="text-sm text-purple-700">Vote to automatically enter the lottery draw ({luckyVotersCount} winner{luckyVotersCount > 1 ? 's' : ''})</p>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Anonymous Voting Banner */}
//           {isAnonymousElection && (
//             <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded-lg p-6 shadow-lg">
//               <div className="flex items-start gap-4">
//                 <Shield className="w-12 h-12 text-purple-600 flex-shrink-0" />
//                 <div className="flex-1">
//                   <h3 className="text-xl font-bold text-purple-900 mb-2">🔐 Anonymous Voting Enabled</h3>
//                   <p className="text-purple-800">Your vote choices will NOT be linked to your identity.</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Video Watch Section */}
//           {ballotData?.videoWatchRequired && !videoCompleted && (
//             <VideoWatchProgress
//               electionId={electionId}
//               videoUrl={ballotData.election?.videoUrl || ballotData.election?.video_url}
//               minimumWatchPercentage={ballotData.minimumWatchPercentage || 80}
//               required={true}
//               onComplete={() => setVideoCompleted(true)}
//             />
//           )}

//           {ballotData?.videoWatchRequired && videoCompleted && (
//             <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-6">
//               <div className="flex items-center gap-4">
//                 <CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
//                 <div>
//                   <h3 className="text-xl font-bold text-green-900 mb-1">✓ Video Requirement Completed!</h3>
//                   <p className="text-green-700">You can proceed to vote below.</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* ==================== BALLOT WITH LIVE RESULTS SIDE BY SIDE ==================== */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             {/* Ballot Section - Takes 2 columns if live results, 3 if not */}
//             <div className={showLiveResults ? "lg:col-span-2" : "lg:col-span-3"}>
//               <div className="bg-white rounded-2xl shadow-lg p-6">
//                 <BallotRenderer
//                   electionId={electionId}
//                   ballot={ballotData}
//                   votingType={votingTypeToUse}
//                   onAnswersChange={handleAnswersChange}
//                 />
//               </div>
//             </div>

//             {/* Live Results Pie Chart - Takes 1 column, sticky */}
//             {showLiveResults && (
//               <div className="lg:col-span-1">
//                 <div className="sticky top-24">
//                   <CompactLiveResults
//                     electionId={electionId}
//                     questionId={ballotData?.questions?.[0]?.id}
//                   />
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Lottery Slot Machine - BEFORE Submit Buttons */}
//           {isLotteryEnabled && (
//             <div className="bg-white rounded-2xl shadow-lg p-6">
//               <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
//                 <Trophy className="w-6 h-6 text-yellow-500" />
//                 🎰 Lottery Draw Machine
//               </h3>
//               <LotterySlotMachine
//                 electionId={electionId}
//                 electionEndDate={ballotData?.election?.endDate || ballotData?.election?.end_date}
//                 luckyVotersCount={luckyVotersCount}
//                 isElectionEnded={false}
//                 winners={[]}
//                 isActive={true}
//               />
//             </div>
//           )}

//           {/* Submit Buttons */}
//           <div className="space-y-3">
//             <button
//               id="submit-vote-button"
//               onClick={handleSubmitVote}
//               disabled={isSubmitting || submitting || Object.keys(answers).length === 0 || (ballotData?.videoWatchRequired && !videoCompleted)}
//               className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform ${
//                 isSubmitting || submitting || Object.keys(answers).length === 0 || (ballotData?.videoWatchRequired && !videoCompleted)
//                   ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                   : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-[1.02] hover:shadow-2xl'
//               }`}
//             >
//               {isSubmitting || submitting ? (
//                 <span className="flex items-center justify-center gap-2">
//                   <Loader className="animate-spin" size={20} />
//                   {isLotteryEnabled ? '🎰 Submitting Vote...' : '⏳ Submitting...'}
//                 </span>
//               ) : (
//                 <span className="flex items-center justify-center gap-2">
//                   {ballotData?.videoWatchRequired && !videoCompleted ? (
//                     <>📹 Watch Video First</>
//                   ) : (
//                     <>
//                       {isAnonymousElection && '🔐 '}
//                       🗳️ Submit Vote 
//                       {isLotteryEnabled && ' & Enter Lottery'}
//                     </>
//                   )}
//                 </span>
//               )}
//             </button>

//             <div className="text-center">
//               <p className="text-sm text-gray-600">
//                 {Object.keys(answers).length > 0 ? (
//                   <span className="text-green-600 font-semibold">
//                     ✓ {Object.keys(answers).length} question{Object.keys(answers).length !== 1 ? 's' : ''} answered
//                   </span>
//                 ) : (
//                   <span className="text-orange-600 font-semibold">
//                     ⚠ Select your answers above
//                   </span>
//                 )}
//               </p>
//             </div>

//             {/* Abstention Button */}
//             <button
//               onClick={() => setShowAbstentionModal(true)}
//               disabled={isSubmitting || submitting}
//               className="w-full py-3 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition shadow-md disabled:opacity-50"
//             >
//               📝 Submit Blank Ballot (Abstain)
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Abstention Modal */}
//       {showAbstentionModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
//             <div className="flex items-center gap-3 mb-4">
//               <AlertCircle className="w-12 h-12 text-orange-500" />
//               <h3 className="text-xl font-bold text-gray-900">Submit Blank Ballot?</h3>
//             </div>
//             <p className="text-gray-700 mb-4">
//               You are about to submit a blank ballot (abstention). This will count as participation but will not influence the election results.
//             </p>
//             <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-6">
//               <p className="text-sm text-yellow-800">
//                 <strong>Note:</strong> This action cannot be undone. You will still be eligible for the lottery draw (if enabled).
//               </p>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => setShowAbstentionModal(false)}
//                 disabled={isSubmitting}
//                 className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleAbstention}
//                 disabled={isSubmitting}
//                 className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
//               >
//                 {isSubmitting ? <><Loader className="animate-spin" size={18} /> Submitting...</> : 'Confirm Abstention'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }